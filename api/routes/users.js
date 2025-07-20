// api/routes/users.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs for users
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth');

const router = Router();

// This new route provides statistics for the logged-in user's account page.
router.get('/stats', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/stats', `User: ${userId}`);

    try {
        const statsResult = await turso.execute({
            sql: `SELECT COUNT(*) as totalQuizzesSolved, AVG(percentage) as overallAveragePercentage FROM quiz_results WHERE user_id = ?;`,
            args: [userId]
        });

        const activityResult = await turso.execute({
            sql: "SELECT timestamp FROM quiz_results WHERE user_id = ? ORDER BY timestamp ASC;",
            args: [userId]
        });

        const stats = statsResult.rows[0];
        const activity = activityResult.rows;

        const countsByDay = {};
        if (activity) {
            activity.forEach(r => {
                try {
                    const datePart = r.timestamp.substring(0, 10);
                    countsByDay[datePart] = (countsByDay[datePart] || 0) + 1;
                } catch (e) {}
            });
        }
        const activityData = Object.entries(countsByDay).map(([date, count]) => ({ date, count }));

        res.json({
            totalQuizzesSolved: stats.totalQuizzesSolved || 0,
            overallAveragePercentage: stats.overallAveragePercentage ? Math.round(stats.overallAveragePercentage) : 0,
            activityData: activityData
        });

    } catch (e) {
        logError('DB ERROR', `Fetching stats for user ${userId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch user stats.' });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password, address, class: userClass } = req.body;
    logApi('POST', '/api/users/register', `User: ${username}`);

    if (!username || !email || !password || password.length < 6) {
        return res.status(400).json({ message: 'Username, email, and a password of at least 6 characters are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await turso.execute({
            sql: 'INSERT INTO users (id, username, email, password, address, class) VALUES (?, ?, ?, ?, ?, ?);',
            args: [userId, username, email, hashedPassword, address || '', userClass || '']
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (e) {
        if (e.message && e.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        logError('DB ERROR', 'User registration failed', e.message);
        res.status(500).json({ message: 'Could not register user.' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    logApi('POST', '/api/users/login', `User: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const result = await turso.execute({
            sql: 'SELECT id, username, email, address, class, password FROM users WHERE username = ?;',
            args: [username]
        });

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send back user data (without the password) and the token
        res.json({
            token,
            user: {
                id: user.id,
                name: user.username, // 'name' is used in frontend, so we map username to it
                email: user.email,
                address: user.address,
                class: user.class,
            }
        });
    } catch (e) {
        logError('DB ERROR', 'User login failed', e.message);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

// Get current user's profile data based on their token
router.get('/me', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/me', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: 'SELECT id, username, email, address, class FROM users WHERE id = ?;',
            args: [userId]
        });
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        // Map username to 'name' to match frontend expectations
        const userProfile = { ...result.rows[0], name: result.rows[0].username };
        res.json(userProfile);
    } catch(e) {
        logError('DB ERROR', 'Fetching profile for /me failed', e.message);
        res.status(500).json({ message: 'Could not fetch user profile.' });
    }
});

module.exports = router;