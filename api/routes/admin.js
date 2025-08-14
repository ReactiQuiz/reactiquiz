// api/routes/admin.js
const { Router } = require('express');
const { kv } = require('@vercel/kv');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyAdmin } = require('../_middleware/adminAuth');

const router = Router();
const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

// Protect all routes in this file with the admin middleware
router.use(verifyAdmin);

// GET /api/admin/dashboard - The single endpoint to power the page
router.get('/dashboard', async (req, res) => {
    logApi('GET', '/api/admin/dashboard');
    const tx = await turso.transaction('read');
    try {
        // Fetch all data in parallel for maximum efficiency
        const [
            usersResult, 
            topicsResult, 
            questionsResult, 
            recentUsersResult,
            recentQuizzesResult,
            maintenanceStatus
        ] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
            tx.execute("SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 5"),
            tx.execute("SELECT topicId, percentage, timestamp FROM quiz_results ORDER BY timestamp DESC LIMIT 5"),
            kv.get(MAINTENANCE_KEY)
        ]);

        await tx.commit();

        res.json({
            isMaintenanceMode: !!maintenanceStatus,
            counts: {
                users: usersResult.rows[0].total,
                topics: topicsResult.rows[0].total,
                questions: questionsResult.rows[0].total,
            },
            recentActivity: {
                users: recentUsersResult.rows,
                quizzes: recentQuizzesResult.rows,
            }
        });

    } catch (e) {
        await tx.rollback();
        logError('DB/KV ERROR', 'Fetching admin dashboard data failed', e.message);
        res.status(500).json({ message: 'Could not fetch dashboard data.' });
    }
});

// POST /api/admin/maintenance - Toggle maintenance mode
router.post('/maintenance', async (req, res) => {
    const { enable } = req.body;
    logApi('POST', '/api/admin/maintenance', `Enable: ${enable}`);
    try {
        await kv.set(MAINTENANCE_KEY, enable);
        res.status(200).json({ 
            message: `Maintenance mode successfully ${enable ? 'enabled' : 'disabled'}.`,
            isMaintenanceMode: enable
        });
    } catch (e) {
        logError('KV ERROR', 'Setting maintenance mode failed', e.message);
        res.status(500).json({ message: 'Could not update maintenance mode.' });
    }
});

module.exports = router;