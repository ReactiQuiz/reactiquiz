
// api/routes/users.js
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth');

const router = Router();

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
            args: [userId, username, email, hashedPassword, address, userClass]
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
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
            sql: 'SELECT id, username, password FROM users WHERE username = ?;',
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

        // Don't send the password back to the client
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
            }
        });
    } catch (e) {
        logError('DB ERROR', 'User login failed', e.message);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
});

// Example of a protected route to get user profile
router.get('/profile', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/profile', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: 'SELECT id, username, email, address, class FROM users WHERE id = ?;',
            args: [userId]
        });
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        res.json(result.rows[0]);
    } catch(e) {
        logError('DB ERROR', 'Fetching profile failed', e.message);
        res.status(500).json({ message: 'Could not fetch user profile.' });
    }
});

module.exports = router;