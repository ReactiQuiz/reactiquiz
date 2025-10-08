// api/routes/results.js

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { quizContext, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = req.body;
    const { topicId, subject, difficulty, quizClass } = quizContext;
    logApi('POST', '/api/results', `User: ${userId}, Topic: ${topicId}`);

    if (!topicId || !Array.isArray(questionsActuallyAttemptedIds) || questionsActuallyAttemptedIds.length === 0) {
        return res.status(400).json({ message: 'Invalid quiz data provided for saving result.' });
    }

    const tx = await turso.transaction("write");
    try {
        // Fetch correct answers from DB for server-side validation
        const placeholders = questionsActuallyAttemptedIds.map(() => '?').join(',');
        const questionsResult = await tx.execute({
            sql: `SELECT id, correctOptionId FROM questions WHERE id IN (${placeholders})`,
            args: questionsActuallyAttemptedIds
        });

        const correctAnswersMap = new Map(questionsResult.rows.map((q) => [q.id, q.correctOptionId]));
        
        // Calculate score on the server to prevent cheating
        let score = 0;
        for (const qId of questionsActuallyAttemptedIds) {
            if (userAnswersSnapshot[qId] === correctAnswersMap.get(qId)) {
                score++;
            }
        }
        
        const totalQuestions = questionsActuallyAttemptedIds.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        // Save the SERVER-CALCULATED score
        const insertResult = await tx.execute({
            sql: `INSERT INTO quiz_results (user_id, subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, difficulty, class)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
                userId,
                subject,
                topicId,
                score,
                totalQuestions,
                percentage,
                timeTaken,
                JSON.stringify(questionsActuallyAttemptedIds || []),
                JSON.stringify(userAnswersSnapshot || {}),
                difficulty,
                quizClass || null // --- THIS IS THE FIX: Convert undefined to null ---
            ]
        });
        
        const resultId = insertResult.lastInsertRowid ? insertResult.lastInsertRowid.toString() : null;
        if (!resultId) {
            await tx.rollback();
            throw new Error("Insert operation did not return a valid row ID.");
        }
        
        const { rows } = await tx.execute({
            sql: "SELECT * FROM quiz_results WHERE id = ?",
            args: [resultId]
        });

        await tx.commit();
        
        // Return the newly created result ID and the full saved object
        res.status(201).json({ 
            message: 'Result saved successfully!', 
            resultId: resultId,
            savedResult: rows[0]
        });
    } catch (e) {
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
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
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching results failed', e.message);
        res.status(500).json({ message: 'Could not fetch results.' });
    }
});

// GET a specific result by its ID
router.get('/:resultId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { resultId } = req.params;
    logApi('GET', `/api/results/${resultId}`, `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: "SELECT * FROM quiz_results WHERE id = ? AND user_id = ?",
            args: [resultId, userId]
        });

        if (result.rows.length === 0) {
            await tx.commit();
            return res.status(404).json({ message: 'Result not found or you do not have permission to view it.' });
        }

        await tx.commit();
        res.json(result.rows[0]);
    } catch (e) {
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB ERROR', `Fetching result ${resultId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch result details.' });
    }
});

module.exports = router;