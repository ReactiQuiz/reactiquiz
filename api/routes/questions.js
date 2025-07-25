// api/routes/questions.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// --- START OF FIX: USE TRANSACTION ---
router.get('/', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId query parameter is required.' });
    logApi('GET', '/api/questions', `Topic: ${topicId}`);
    
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: "SELECT * FROM questions WHERE topicId = ?",
            args: [topicId]
        });
        await tx.commit();
        const parsedRows = result.rows.map(row => ({
            ...row,
            options: JSON.parse(row.options || '[]')
        }));
        res.json(parsedRows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Fetching questions for ${topicId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});
// --- END OF FIX ---

module.exports = router;