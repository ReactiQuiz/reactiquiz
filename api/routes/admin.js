// api/routes/admin.js
const { Router } = require('express');
const { Redis } = require('@upstash/redis');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError, logInfo } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth'); 

const router = Router();

let redis;
// Initialize Redis client only if the URL is provided
if (process.env.REDIS_URL) {
    redis = Redis.fromEnv();
    logInfo('INFO', 'Redis client initialized for admin routes.');
} else {
    logInfo('WARN', 'REDIS_URL not found. Maintenance mode feature will be disabled.');
}

const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

// --- Admin-Only Verification Middleware ---
const verifyAdmin = (req, res, next) => {
    // This middleware runs *after* verifyToken, so req.user is available.
    const adminId = process.env.ADMIN_USER_ID;

    if (!adminId) {
        logError('FATAL', 'ADMIN_USER_ID is not configured on the server.');
        return res.status(500).json({ message: 'Admin access is not configured.' });
    }

    if (req.user.id !== adminId) {
        logApi('FORBIDDEN', req.path, `User ${req.user.username} is not admin.`);
        return res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
    }

    // If the check passes, continue to the next middleware or route handler.
    next();
};

// Apply the middleware stack to all routes in this file.
// Any request to /api/admin/* will first require a valid token, then require admin privileges.
router.use(verifyToken, verifyAdmin);


// --- API Endpoints ---

/**
 * @route   GET /api/admin/status
 * @desc    Fetches current site status including maintenance mode and content counts.
 * @access  Private (Admin Only)
 */
router.get('/status', async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // Fetch database counts and Redis status concurrently for performance
        const [usersResult, topicsResult, questionsResult, maintenanceStatus] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
            redis ? redis.get(MAINTENANCE_KEY) : Promise.resolve(null) // Safely handle missing Redis
        ]);

        await tx.commit();

        res.json({
            isMaintenanceMode: maintenanceStatus === 'true',
            userCount: usersResult.rows[0].total || 0,
            topicCount: topicsResult.rows[0].total || 0,
            questionCount: questionsResult.rows[0].total || 0,
        });

    } catch (e) {
        if (!tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB/REDIS ERROR', 'Fetching admin status failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
});

/**
 * @route   POST /api/admin/maintenance
 * @desc    Enables or disables site-wide maintenance mode.
 * @access  Private (Admin Only)
 */
router.post('/maintenance', async (req, res) => {
    const { enable } = req.body;
    logApi('POST', '/api/admin/maintenance', `Admin: ${req.user.username}, Enable: ${enable}`);

    if (typeof enable !== 'boolean') {
        return res.status(400).json({ message: 'A boolean "enable" field is required.' });
    }
    
    // If Redis isn't configured, we can't change the maintenance state.
    if (!redis) {
        return res.status(503).json({ message: 'Maintenance mode service is not available.' });
    }

    try {
        await redis.set(MAINTENANCE_KEY, enable.toString());
        res.status(200).json({ 
            message: `Maintenance mode successfully ${enable ? 'enabled' : 'disabled'}.`,
            isMaintenanceMode: enable
        });
    } catch (e) {
        logError('REDIS ERROR', 'Setting maintenance mode failed', e.message);
        res.status(500).json({ message: 'Could not update maintenance mode status.' });
    }
});

module.exports = router;