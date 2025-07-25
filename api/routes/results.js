// api/routes/results.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// --- START OF FIX: ALL DB CALLS NOW USE TRANSACTIONS ---

router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = req.body;
    logApi('POST', '/api/results', `User: ${userId}`);

    const tx = await turso.transaction("write");
    try {
        const result = await tx.execute({
            sql: `INSERT INTO quiz_results (user_id, subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
                userId, subject, topicId, score, totalQuestions, percentage, timeTaken,
                JSON.stringify(questionsActuallyAttemptedIds || []),
                JSON.stringify(userAnswersSnapshot || {})
            ]
        });
        await tx.commit();

        const resultId = result.lastInsertRowid ? result.lastInsertRowid.toString() : null;
        if (!resultId) throw new Error("Insert operation did not return a valid row ID.");
        
        res.status(201).json({ message: 'Result saved successfully!', id: resultId });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Saving result failed', e.message);
        res.status(500).json({ message: 'Could not save quiz result.' });
    }
});

router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/results', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: "SELECT * FROM quiz_results WHERE user_id = ? ORDER BY timestamp DESC",
            args: [userId]
        });
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching results failed', e.message);
        res.status(500).json({ message: 'Could not fetch results.' });
    }
});

// --- END OF FIX ---

module.exports = router;