// backend/routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { usersDb, resultsDb } = require('../db');
const { verifySessionToken } = require('../middleware/auth');
const { transporter, generateOtp, generateSecureToken, TOKEN_EXPIRATION_MS, OTP_EXPIRATION_MS } = require('../utils/authUtils');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { identifier, password, email, address, class: userClass } = req.body;
    logApi('POST', '/api/users/register', `User: ${identifier}`);
    if (!identifier || !password || !email || !address || !userClass || password.length < 6 || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Valid username, password (min 6 chars), email, address, and class are required.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (identifier, password, email, address, class, createdAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        usersDb.run(sql, [identifier.trim(), hashedPassword, email.trim().toLowerCase(), address.trim(), userClass.trim()], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed: users.identifier")) return res.status(409).json({ message: 'Username already taken.' });
                logError('DB ERROR', 'Failed to register user', err.message);
                return res.status(500).json({ message: 'Error registering user.' });
            }
            res.status(201).json({ message: 'Registration successful! Please log in to continue.' });
        });
    } catch (e) {
        logError('B-HASH', 'Bcrypt hash failed during registration', e.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    logApi('POST', '/api/users/login', `User: ${identifier}`);
    if (!identifier || !password) return res.status(400).json({ message: 'Username and password are required.' });

    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => {
        if (err) { logError('DB ERROR', `Finding user '${identifier}'`, err.message); return res.status(500).json({ message: 'Server error.' }); }
        if (!user) return res.status(401).json({ message: 'Invalid username or password.' });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Invalid username or password.' });

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();
        usersDb.run("UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?", [otp, otpExpiresAt, user.id], async (updateErr) => {
            if (updateErr) { logError('DB ERROR', 'Storing OTP failed', updateErr.message); return res.status(500).json({ message: 'Error preparing login.' }); }
            if (!transporter) { logError('EMAIL FAIL', 'Attempted login but transporter not ready'); return res.status(503).json({ message: 'Email service is not configured.' }); }
            try {
                await transporter.sendMail({
                    from: `"${process.env.EMAIL_SENDER_NAME || 'ReactiQuiz'}" <${process.env.EMAIL_USER}>`, to: user.email, subject: 'ReactiQuiz - Login Verification Code',
                    html: `<p>Hello ${user.identifier},</p><p>Your One-Time Password (OTP) to log in is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
                });
                logApi('INFO', `Login OTP sent to ${user.email}`);
                res.status(200).json({ message: `An OTP has been sent to your registered email.` });
            } catch (emailError) {
                logError('EMAIL FAIL', 'Sending login OTP failed', emailError.message);
                res.status(500).json({ message: 'Failed to send OTP email.' });
            }
        });
    });
});

router.post('/verify-otp', (req, res) => {
    const { identifier, otp, deviceIdFromClient } = req.body;
    logApi('POST', '/api/users/verify-otp', `User: ${identifier}`);
    if (!identifier || !otp || !deviceIdFromClient) return res.status(400).json({ message: 'Identifier, OTP, and device ID are required.' });

    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], (err, user) => {
        if (err) { logError('DB ERROR', `Finding user '${identifier}' for OTP verify`, err.message); return res.status(500).json({ message: "Server error." }); }
        if (!user) return res.status(404).json({ message: "User not found." });
        if (user.login_otp !== otp || new Date() > new Date(user.login_otp_expires_at)) {
            usersDb.run("UPDATE users SET login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [user.id]);
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        const token = generateSecureToken();
        const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();
        const sql = "UPDATE users SET registered_device_id = ?, active_session_token = ?, active_session_token_expires_at = ?, login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?";
        usersDb.run(sql, [deviceIdFromClient, token, expires, user.id], (updateErr) => {
            if (updateErr) { logError('DB ERROR', 'Updating session token failed', updateErr.message); return res.status(500).json({ message: "Error finalizing login." }); }
            res.status(200).json({
                message: "Login successful.", user: { id: user.id, name: user.identifier, email: user.email, address: user.address, class: user.class }, token
            });
        });
    });
});

router.post('/change-password', verifySessionToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    logApi('POST', '/api/users/change-password', `User ID: ${userId}`);
    if (!oldPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Old and new password (min 6 chars) are required.' });

    usersDb.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => {
        if (err || !user) { logError('DB ERROR', `Finding user ${userId} for pwd change`, err ? err.message : 'User not found'); return res.status(500).json({ message: 'Server error or user not found.' }); }
        
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Incorrect old password.' });
        
        try {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            usersDb.run("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId], (updateErr) => {
                if (updateErr) { logError('DB ERROR', 'Updating password failed', updateErr.message); return res.status(500).json({ message: 'Error changing password.' }); }
                res.status(200).json({ message: 'Password changed successfully!' });
            });
        } catch (hashError) {
            logError('B-HASH', 'Bcrypt hash failed during pwd change', hashError.message);
            res.status(500).json({ message: 'Server error during password change.' });
        }
    });
});

router.get('/search', verifySessionToken, (req, res) => {
    const { username } = req.query;
    const currentUserId = req.user.id;
    logApi('GET', '/api/users/search', `User: ${currentUserId}, Term: ${username}`);
    if (!username || username.trim().length < 2) return res.status(400).json({ message: 'Search term must be at least 2 characters.' });
    
    const sql = "SELECT id, identifier FROM users WHERE identifier LIKE ? AND id != ? LIMIT 10";
    usersDb.all(sql, [`%${username.trim()}%`, currentUserId], (err, users) => {
        if (err) { logError('DB ERROR', 'User search failed', err.message); return res.status(500).json({ message: 'Error searching for users.' }); }
        res.json(users || []);
    });
});

router.get('/stats', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/users/stats', `User ID: ${userId}`);
    const statsQuery = `SELECT COUNT(*) as totalQuizzesSolved, AVG(percentage) as overallAveragePercentage FROM quiz_results WHERE userId = ?;`;
    const activityQuery = `SELECT timestamp FROM quiz_results WHERE userId = ? ORDER BY timestamp ASC;`;
    let userStats = { totalQuizzesSolved: 0, overallAveragePercentage: 0, activityData: [] };

    resultsDb.get(statsQuery, [userId], (err, row) => {
        if (err) { logError('DB ERROR', `Fetching main stats for user ${userId}`, err.message); return res.status(500).json({ message: 'Failed to retrieve statistics.' }); }
        if (row) {
            userStats.totalQuizzesSolved = row.totalQuizzesSolved || 0;
            userStats.overallAveragePercentage = row.overallAveragePercentage ? Math.round(row.overallAveragePercentage) : 0;
        }
        resultsDb.all(activityQuery, [userId], (activityErr, activityRows) => {
            if (activityErr) { logError('DB ERROR', `Fetching activity for user ${userId}`, activityErr.message); return res.json(userStats); }
            if (activityRows) {
                const countsByDay = {};
                activityRows.forEach(r => {
                    try { const datePart = r.timestamp.substring(0, 10); countsByDay[datePart] = (countsByDay[datePart] || 0) + 1; } catch (e) {}
                });
                userStats.activityData = Object.entries(countsByDay).map(([date, count]) => ({ date, count }));
            }
            res.json(userStats);
        });
    });
});

router.put('/update-details', verifySessionToken, (req, res) => {
    const { address, class: userClass } = req.body;
    const userId = req.user.id;
    logApi('PUT', '/api/users/update-details', `User ID: ${userId}`);
    if (!address || !userClass) return res.status(400).json({ message: 'Address and Class are required.' });

    const sql = "UPDATE users SET address = ?, class = ? WHERE id = ?";
    usersDb.run(sql, [address.trim(), userClass.trim(), userId], function (err) {
        if (err) { logError('DB ERROR', 'Updating user details failed', err.message); return res.status(500).json({ message: 'Error updating details.' }); }
        if (this.changes === 0) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({
            message: 'Details updated successfully!',
            user: { address: address.trim(), class: userClass.trim() }
        });
    });
});

module.exports = router;