// api/routes/users.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth');
const { body, validationResult } = require('express-validator');

const router = Router();

// --- Reusable Validation Chains ---
const registerValidation = [
    body('username', 'Username must be at least 3 characters long').isLength({ min: 3 }).trim().escape(),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
    body('address', 'Address is required').notEmpty().trim().escape(),
    body('class', 'Class must be a valid number').isNumeric(),
];

const loginValidation = [
    body('username', 'Username is required').notEmpty().trim(),
    body('password', 'Password is required').notEmpty(),
];

const changePasswordValidation = [
    body('oldPassword', 'Old password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
];

const updateDetailsValidation = [
    body('address', 'Address is required').notEmpty().trim().escape(),
    body('class', 'Class must be a valid number').isNumeric(),
];

// A helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }
    next();
};


// --- Apply Validation to Routes ---

router.put('/update-details', verifyToken, updateDetailsValidation, handleValidationErrors, async (req, res) => {
    const userId = req.user.id;
    const { address, class: userClass } = req.body;
    logApi('PUT', '/api/users/update-details', `User: ${userId}`);

    const tx = await turso.transaction("write");
    try {
        await tx.execute({
            sql: "UPDATE users SET address = ?, class = ? WHERE id = ?;",
            args: [address, userClass, userId]
        });
        await tx.commit();
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Updating details for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not update profile.' });
    }
});

router.post('/change-password', verifyToken, changePasswordValidation, handleValidationErrors, async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    logApi('POST', '/api/users/change-password', `User: ${userId}`);
    
    const tx = await turso.transaction("write");
    try {
        const result = await tx.execute({
            sql: "SELECT password FROM users WHERE id = ?",
            args: [userId]
        });
        if (result.rows.length === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            await tx.rollback();
            return res.status(401).json({ message: 'Incorrect old password.' });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await tx.execute({
            sql: "UPDATE users SET password = ? WHERE id = ?",
            args: [hashedNewPassword, userId]
        });
        await tx.commit();
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Changing password for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not change password.' });
    }
});

router.get('/stats', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/stats', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const statsResult = await tx.execute({
            sql: `SELECT COUNT(*) as totalQuizzesSolved, AVG(percentage) as overallAveragePercentage FROM quiz_results WHERE user_id = ?;`,
            args: [userId]
        });
        const activityResult = await tx.execute({
            sql: "SELECT timestamp FROM quiz_results WHERE user_id = ? ORDER BY timestamp ASC;",
            args: [userId]
        });
        await tx.commit();

        const stats = statsResult.rows[0];
        const activity = activityResult.rows;
        const countsByDay = {};
        if (activity) {
            activity.forEach(r => {
                try {
                    const datePart = r.timestamp.substring(0, 10);
                    countsByDay[datePart] = (countsByDay[datePart] || 0) + 1;
                } catch (e) { }
            });
        }
        const activityData = Object.entries(countsByDay).map(([date, count]) => ({ date, count }));

        res.json({
            totalQuizzesSolved: stats.totalQuizzesSolved || 0,
            overallAveragePercentage: stats.overallAveragePercentage ? Math.round(stats.overallAveragePercentage) : 0,
            activityData: activityData
        });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Fetching stats for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch user stats.' });
    }
});

router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
    const { username, email, password, address, class: userClass } = req.body;
    logApi('POST', '/api/users/register', `User: ${username}`);
    
    const tx = await turso.transaction("write");
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        await tx.execute({
            sql: 'INSERT INTO users (id, username, email, password, address, class) VALUES (?, ?, ?, ?, ?, ?);',
            args: [userId, username, email, hashedPassword, address, userClass]
        });
        await tx.commit();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (e) {
        await tx.rollback();
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        logError('DB ERROR', 'User registration failed', e.message);
        res.status(500).json({ message: 'Could not register user.' });
    }
});

router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
    const { username, password } = req.body;
    logApi('POST', '/api/users/login', `User: ${username}`);
    
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: 'SELECT id, username, email, address, class, password FROM users WHERE username = ?;',
            args: [username]
        });
        await tx.commit();
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, name: user.username, email: user.email, address: user.address, class: user.class }
        });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'User login failed', e.message);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/me', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: 'SELECT id, username, email, address, class FROM users WHERE id = ?;',
            args: [userId]
        });
        await tx.commit();
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        const userProfile = { ...result.rows[0], name: result.rows[0].username };
        res.json(userProfile);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching profile for /me failed', e.message);
        res.status(500).json({ message: 'Could not fetch user profile.' });
    }
});

module.exports = router;