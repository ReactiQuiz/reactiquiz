// api/routes/results.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Save a quiz result (Protected Route)
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = req.body;
    logApi('POST', '/api/results', `User: ${userId}`);

    try {
        const result = await turso.execute({
            sql: `INSERT INTO quiz_results (user_id, subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
                userId, subject, topicId, score, totalQuestions, percentage, timeTaken,
                JSON.stringify(questionsActuallyAttemptedIds || []),
                JSON.stringify(userAnswersSnapshot || {})
            ]
        });
        res.status(201).json({ message: 'Result saved successfully!', id: result.lastInsertRowid });
    } catch (e) {
        logError('DB ERROR', 'Saving result failed', e.message);
        res.status(500).json({ message: 'Could not save quiz result.' });
    }
});

// Fetch user's results (Protected Route)
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/results', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: "SELECT * FROM quiz_results WHERE user_id = ? ORDER BY timestamp DESC",
            args: [userId]
        });
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching results failed', e.message);
        res.status(500).json({ message: 'Could not fetch results.' });
    }
});

module.exports = router;