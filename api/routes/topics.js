// api/routes/topics.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.get('/', async (req, res) => {
    logApi('GET', '/api/topics (all)');
    try {
        const result = await turso.execute("SELECT * FROM quiz_topics");
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching all topics failed', e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

router.get('/:subjectKey', async (req, res) => {
    const { subjectKey } = req.params;
    logApi('GET', `/api/topics/${subjectKey}`);
    try {
        const subjectResult = await turso.execute({
            sql: "SELECT id FROM subjects WHERE subjectKey = ?",
            args: [subjectKey]
        });
        if (subjectResult.rows.length === 0) {
            return res.status(404).json({ message: `Subject '${subjectKey}' not found` });
        }
        const subjectId = subjectResult.rows[0].id;

        const topicsResult = await turso.execute({
            sql: "SELECT * FROM quiz_topics WHERE subject_id = ? ORDER BY name",
            args: [subjectId]
        });
        res.json(topicsResult.rows);
    } catch (e) {
        logError('DB ERROR', `Fetching topics for ${subjectKey} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

module.exports = router;