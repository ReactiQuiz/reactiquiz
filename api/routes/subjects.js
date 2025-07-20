// api/routes/subjects.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.get('/', async (req, res) => {
    logApi('GET', '/api/subjects');
    try {
        const result = await turso.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching subjects failed', e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});

module.exports = router;