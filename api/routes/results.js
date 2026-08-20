// api/routes/results.js
/**
 * Quiz Results Routes
 *
 * Handles quiz result submission and retrieval from Turso database.
 * Calculates scores based on correct answers and saves results with user answers snapshot.
 * All routes require authentication via verifyToken middleware.
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

/**
 * POST /api/results
 *
 * Saves a new quiz result after calculating the score based on correct answers.
 * Requires quiz context, time taken, attempted question IDs, and user answers snapshot.
 * Returns the saved result with result ID.
 * Requires authentication via verifyToken middleware.
 */
router.post('/', verifyToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { quizContext, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = req.body;
    const { topicId, subject, quizClass } = quizContext || {};
    logApi('POST', '/api/results', `User: ${userId}, Topic: ${topicId}`);

    if (!topicId || !Array.isArray(questionsActuallyAttemptedIds) || questionsActuallyAttemptedIds.length === 0) {
        return res.status(400).json({ message: 'Invalid quiz data provided for saving result.' });
    }

    const tx = await turso.transaction("write");
    try {
        const placeholders = questionsActuallyAttemptedIds.map(() => '?').join(',');
        const questionsResult = await tx.execute({
            sql: `SELECT id, correctOptionId, options FROM questions WHERE id IN (${placeholders})`,
            args: questionsActuallyAttemptedIds
        });

        let score = 0;
        for (const question of questionsResult.rows) {
            const questionId = question.id;
            const userAnswerIndex = userAnswersSnapshot[questionId];

            if (userAnswerIndex !== undefined && userAnswerIndex !== null) {
                const options = JSON.parse(question.options);
                if (options && options[userAnswerIndex]) {
                    const selectedOptionId = options[userAnswerIndex].id;
                    if (selectedOptionId === question.correctOptionId) {
                        score++;
                    }
                }
            }
        }

        const totalQuestions = questionsActuallyAttemptedIds.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const safeSubject = subject || null;
        const safeTopicId = topicId || null;
        const safeScore = typeof score === 'number' ? score : 0;
        const safeTotalQs = typeof totalQuestions === 'number' ? totalQuestions : 0;
        const safePercentage = typeof percentage === 'number' ? percentage : 0;
        const safeTimeTaken = typeof timeTaken === 'number' ? timeTaken : 0;
        const safeClass = quizClass || null;

        const insertResult = await tx.execute({
            sql: `INSERT INTO quiz_results (user_id, subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, class)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
                userId, safeSubject, safeTopicId, safeScore, safeTotalQs, safePercentage, safeTimeTaken,
                JSON.stringify(questionsActuallyAttemptedIds || []),
                JSON.stringify(userAnswersSnapshot || {}),
                safeClass
            ]
        });

        const rawRowId = insertResult.lastInsertRowid != null ? String(insertResult.lastInsertRowid) : null;
        if (!rawRowId || rawRowId === '0') {
            await tx.rollback();
            throw new Error("Insert operation did not return a valid row ID.");
        }

        const { rows } = await tx.execute({ sql: "SELECT * FROM quiz_results WHERE id = ?", args: [rawRowId] });
        await tx.commit();

        res.status(201).json({
            message: 'Result saved successfully!',
            resultId: rawRowId,
            savedResult: rows.length > 0 ? rows[0] : { id: rawRowId }
        });
    } catch (e) {
        if (tx && !tx.closed) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Saving result failed', e.message);
        res.status(500).json({ message: 'Could not save quiz result.' });
    }
}));

/**
 * GET /api/results
 *
 * Retrieves all quiz results for the authenticated user.
 * Returns results ordered by timestamp (newest first).
 * Requires authentication via verifyToken middleware.
 */
router.get('/', verifyToken, asyncHandler(async (req, res) => {
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
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', 'Fetching results failed', e.message);
        res.status(500).json({ message: 'Could not fetch results.' });
    }
}));

// GET a specific result by its ID
router.get('/:resultId', verifyToken, asyncHandler(async (req, res) => {
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
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', `Fetching result ${resultId} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch result details.' });
    }
}));

module.exports = router;
