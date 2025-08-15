// api/routes/admin.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError, logInfo } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth'); 

const router = Router();

// --- Admin-Only Verification Middleware (Unchanged) ---
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

router.use(verifyToken, verifyAdmin);

// --- API Endpoints ---

router.get('/status', async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
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
        // --- START OF FIX 1 ---
        // Removed the check for tx.isClosed()
        if (tx) {
            await tx.rollback();
        }
        // --- END OF FIX 1 ---
        logError('DB ERROR', 'Fetching admin status failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
});

router.get('/users', async (req, res) => {
    logApi('GET', '/api/admin/users', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // --- START OF THE DEFINITIVE FIX ---
        // Removed `created_at` from the SELECT statement and the ORDER BY clause.
        // We will order by username alphabetically instead, which is a sensible default.
        const usersResult = await tx.execute(
            "SELECT id, username, email, phone, address, class FROM users ORDER BY username ASC"
        );
        // --- END OF THE DEFINITIVE FIX ---
        
        await tx.commit();

        res.json(usersResult.rows);

    } catch (e) {
        if (tx) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching all users failed', e.message);
        res.status(500).json({ message: 'Could not fetch user list.' });
    }
});

module.exports = router;