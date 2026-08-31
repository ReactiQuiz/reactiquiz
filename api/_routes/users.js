// api/routes/users.js
/**
 * User Routes
 * 
 * Handles user authentication, registration, profile management, and password changes.
 * Uses Turso database for user data storage and JWT for authentication.
 * All routes use validation middleware for input sanitization and verification.
 */

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

// Standard input validation is defined directly on individual route handlers below using express-validator.

/**
 * Handle Validation Errors
 * 
 * Middleware to process validation results and return errors if validation fails.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation Error', errors: errors.array() });
    }
    next();
};

/**
 * Route Handlers
 * 
 * All routes use Turso database transactions for data consistency.
 */

/**
 * PUT /api/users/update-details
 * 
 * Updates user profile details (address, class, phone).
 * Requires authentication via verifyToken middleware.
 */
router.put('/update-details',
    verifyToken,
    // Add validation rules here as well
    body('address', 'Address is required').notEmpty().trim().escape(),
    body('class', 'Class is required').notEmpty(),
    body('phone', 'Phone number is optional').optional({ checkFalsy: true }).trim().escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const userId = req.user.id;
        const { address, class: userClass, phone } = req.body;
        logApi('PUT', '/api/users/update-details', `User: ${userId}`);

        const tx = await turso.transaction("write");
        try {
            await tx.execute({
                sql: "UPDATE users SET address = ?, class = ?, phone = ? WHERE id = ?;",
                args: [address, userClass, phone || null, userId]
            });
            await tx.commit();
            res.status(200).json({ message: 'Profile updated successfully!' });
        } catch (e) {
            if (tx && !tx.closed) { await tx.rollback(); }
            logError('DB ERROR', `Updating details for user ${userId} failed`, e.message);
            res.status(500).json({ message: 'Could not update profile.' });
        }
    })
);

/**
 * POST /api/users/change-password
 * 
 * Changes user password after verifying the old password.
 * Requires authentication via verifyToken middleware.
 */
router.post('/change-password',
    verifyToken,
    body('oldPassword', 'Old password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
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
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', `Changing password for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not change password.' });
    }
}));

/**
 * GET /api/users/stats
 * 
 * Retrieves user statistics including total quizzes solved,
 * overall average percentage, and activity data by day.
 * Requires authentication via verifyToken middleware.
 */
router.get('/stats', verifyToken, asyncHandler(async (req, res) => {
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
            activity.forEach((r) => {
                try {
                    const datePart = r.timestamp.substring(0, 10);
                    countsByDay[datePart] = (countsByDay[datePart] || 0) + 1;
                } catch (e) { }
            });
        }
        const activityData = Object.entries(countsByDay).map(([date, count]) => ({ date, count }));

        res.json({
            totalQuizzesSolved: stats.totalQuizzesSolved || 0,
            overallAveragePercentage: stats.overallAveragePercentage ? Math.round(Number(stats.overallAveragePercentage)) : 0,
            activityData: activityData
        });
    } catch (e) {
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', `Fetching stats for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch user stats.' });
    }
}));

/**
 * POST /api/users/register
 * 
 * Registers a new user with username, email, password, address, class, and optional phone.
 * Hashes password before storing in database. Returns 409 if username/email already exists.
 */
router.post('/register',
    // 1. Define validation rules for each field.
    body('username', 'Username must be at least 3 characters long').isLength({ min: 3 }).trim().escape(),
    body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('address', 'Address is required').notEmpty().trim().escape(),
    body('phone', 'Phone number is optional').optional({ checkFalsy: true }).trim().escape(),
    body('class', 'Class selection is required').notEmpty(),

    // 2. The main route handler now runs *after* the validation.
    asyncHandler(async (req, res) => {
        // 3. Check for validation errors.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are errors, return a 400 Bad Request with the first error message.
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { username, email, password, address, phone, class: userClass } = req.body;
        logApi('POST', '/api/users/register', `User: ${username}`);

        const tx = await turso.transaction("write");
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            await tx.execute({
                sql: 'INSERT INTO users (id, username, email, password, address, class, phone) VALUES (?, ?, ?, ?, ?, ?, ?);',
                args: [userId, username, email, hashedPassword, address, userClass, phone || null]
            });
            await tx.commit();
            res.status(201).json({ message: 'User registered successfully!' });
        } catch (e) {
            if (tx && !tx.closed) { await tx.rollback(); }
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                if (e.message.includes('users.email')) {
                    return res.status(409).json({ message: 'An account with this email address already exists. Please sign in instead.' });
                }
                if (e.message.includes('users.username')) {
                    return res.status(409).json({ message: 'This username is already taken. Please choose a different username.' });
                }
                return res.status(409).json({ message: 'An account with this username or email already exists. Please sign in instead.' });
            }
            logError('DB ERROR', 'User registration failed', e.message);
            res.status(500).json({ message: 'Could not complete registration due to a server error. Please try again in a moment.' });
        }
    })
);

/**
 * POST /api/users/login
 * 
 * Authenticates a user with username and password.
 * Returns JWT token and user data on successful authentication.
 * Token expires in 1 day and includes user ID, username, and admin status.
 */
router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    logApi('POST', '/api/users/login', `User: ${username}`);
    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter both your username/email and password.' });
    }

    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: 'SELECT id, username, email, address, class, password, phone, isAdmin FROM users WHERE username = ? OR email = ?;',
            args: [username, username]
        });
        await tx.commit();
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'The username or password you entered is incorrect. Please check and try again.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'The username or password you entered is incorrect. Please check and try again.' });
        }

        const tokenPayload = { 
            id: user.id, 
            username: user.username, 
            isAdmin: !!user.isAdmin 
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { 
                id: user.id, 
                name: user.username, 
                email: user.email, 
                address: user.address, 
                class: user.class, 
                phone: user.phone, 
                isAdmin: !!user.isAdmin 
            }
        });
    } catch (e) {
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', 'User login failed', e.message);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
}));

router.get('/me', verifyToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/me', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: 'SELECT id, username, email, address, class, phone, isAdmin FROM users WHERE id = ?;',
            args: [userId]
        });
        await tx.commit();
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        const userProfile = { ...result.rows[0], name: result.rows[0].username };
        res.json(userProfile);
    } catch (e) {
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', 'Fetching profile for /me failed', e.message);
        res.status(500).json({ message: 'Could not fetch user profile.' });
    }
}));

module.exports = router;