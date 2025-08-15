// api/routes/admin.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError, logInfo } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth'); 

const router = Router();

// --- Admin-Only Verification Middleware ---
const verifyAdmin = (req, res, next) => {
    const adminId = process.env.ADMIN_USER_ID;

    if (!adminId) {
        logError('FATAL', 'ADMIN_USER_ID is not configured on the server.');
        return res.status(500).json({ message: 'Admin access is not configured.' });
    }

    if (req.user.id !== adminId) {
        logApi('FORBIDDEN', req.path, `User ${req.user.username} is not admin.`);
        return res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
    }
    
    next();
};

// Apply the middleware stack to all routes in this file.
router.use(verifyToken, verifyAdmin);

// --- API Endpoints ---

/**
 * @route   GET /api/admin/status
 * @desc    Fetches content counts.
 * @access  Private (Admin Only)
 */
router.get('/status', async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // Fetch all database counts concurrently for performance
        const [usersResult, topicsResult, questionsResult] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
        ]);

        await tx.commit();

        res.json({
            userCount: usersResult.rows[0].total || 0,
            topicCount: topicsResult.rows[0].total || 0,
            questionCount: questionsResult.rows[0].total || 0,
        });

    } catch (e) {
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching admin status failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Fetches a list of all registered users.
 * @access  Private (Admin Only)
 */
router.get('/users', async (req, res) => {
    logApi('GET', '/api/admin/users', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // Select all relevant user fields, excluding the password hash for security.
        const usersResult = await tx.execute(
            "SELECT id, username, email, phone, address, class, created_at FROM users ORDER BY created_at DESC"
        );
        
        await tx.commit();

        res.json(usersResult.rows);

    } catch (e) {
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching all users failed', e.message);
        res.status(500).json({ message: 'Could not fetch user list.' });
    }
});

module.exports = router;