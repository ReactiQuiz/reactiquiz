// api/routes/questions.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.get('/', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) {
        return res.status(400).json({ message: 'A topicId query parameter is required.' });
    }
    logApi('GET', '/api/questions', `Topic: ${topicId}`);
    try {
        const result = await turso.execute({
            sql: "SELECT * FROM questions WHERE topicId = ?",
            args: [topicId]
        });
        // Options are stored as a JSON string, so we need to parse them
        const parsedRows = result.rows.map(row => ({
            ...row,
            options: JSON.parse(row.options || '[]')
        }));
        res.json(parsedRows);
    } catch (e) {
        logError('DB ERROR', `Fetching questions for ${topicId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});

module.exports = router;