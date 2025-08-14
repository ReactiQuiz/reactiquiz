// api/routes/admin.js
const { Router } = require('express');
// --- START OF CHANGE: Import from @vercel/kv ---
const { kv } = require('@vercel/kv');
// --- END OF CHANGE ---
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyAdmin } = require('../_middleware/adminAuth');

const router = Router();

// The kv object is automatically configured from Vercel's environment variables.
// No manual initialization is needed.

const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

router.use(verifyAdmin);

router.get('/stats', async (req, res) => {
    logApi('GET', '/api/admin/stats');
    const tx = await turso.transaction('read');
    try {
        const [usersResult, topicsResult, questionsResult, maintenanceStatus] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
            // --- START OF CHANGE: Use kv.get ---
            kv.get(MAINTENANCE_KEY)
            // --- END OF CHANGE ---
        ]);
        await tx.commit();
        res.json({
            // --- START OF CHANGE: kv.get returns a boolean directly or null ---
            isMaintenanceMode: !!maintenanceStatus, // Convert null/false to false, true to true
            // --- END OF CHANGE ---
            userCount: usersResult.rows[0].total,
            topicCount: topicsResult.rows[0].total,
            questionCount: questionsResult.rows[0].total,
        });
    } catch (e) {
        await tx.rollback();
        logError('DB/KV ERROR', 'Fetching admin stats failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin stats.' });
    }
});

router.post('/maintenance', async (req, res) => {
    const { enable } = req.body;
    logApi('POST', '/api/admin/maintenance', `Enable: ${enable}`);
    if (typeof enable !== 'boolean') {
        return res.status(400).json({ message: 'A boolean "enable" field is required.' });
    }
    try {
        // --- START OF CHANGE: Use kv.set ---
        await kv.set(MAINTENANCE_KEY, enable);
        // --- END OF CHANGE ---
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