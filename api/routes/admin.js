// api/routes/admin.js
const { Router } = require('express');
const { Redis } = require('@upstash/redis');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyAdmin } = require('../_middleware/adminAuth'); // Use our new admin middleware

const router = Router();

const redis = Redis.fromEnv();
const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

// All routes in this file are now protected by the verifyAdmin middleware
router.use(verifyAdmin);

router.get('/stats', async (req, res) => {
    logApi('GET', '/api/admin/stats');
    const tx = await turso.transaction('read');
    try {
        const [usersResult, topicsResult, questionsResult, maintenanceStatus] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
            redis.get(MAINTENANCE_KEY)
        ]);
        await tx.commit();
        res.json({
            isMaintenanceMode: maintenanceStatus === 'true',
            userCount: usersResult.rows[0].total,
            topicCount: topicsResult.rows[0].total,
            questionCount: questionsResult.rows[0].total,
        });
    } catch (e) {
        await tx.rollback();
        logError('DB/REDIS ERROR', 'Fetching admin stats failed', e.message);
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
        await redis.set(MAINTENANCE_KEY, enable.toString());
        res.status(200).json({ 
            message: `Maintenance mode successfully ${enable ? 'enabled' : 'disabled'}.`,
            isMaintenanceMode: enable
        });
    } catch (e) {
        logError('REDIS ERROR', 'Setting maintenance mode failed', e.message);
        res.status(500).json({ message: 'Could not update maintenance mode.' });
    }
});

module.exports = router;