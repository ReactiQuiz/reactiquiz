// api/routes/subjects.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// --- START OF FIX: USE TRANSACTION ---
router.get('/', async (req, res) => {
    logApi('GET', '/api/subjects');
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching subjects failed', e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});
// --- END OF FIX ---

module.exports = router;