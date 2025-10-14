// api/routes/quizSessions.js
const { Router } = require('express');
const crypto = require('crypto');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');
const { assembleHomiBhabhaPracticeTest } = require('../_utils/quizAssembler');
const { shuffleArray } = require('../_utils/arrayUtils');

const router = Router();
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

// Helper function to get the difficulty score range
const getDifficultyRange = (difficulty) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // For 'mixed' or undefined
    }
};

// POST /api/quizSessions - Create a new quiz session
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const quizParams = req.body.quizParams || req.body;
    logApi('POST', '/api/quiz-sessions', `User: ${userId}`);

    if (!quizParams || !quizParams.topicId) {
        return res.status(400).json({ message: 'Invalid quiz parameters provided.' });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const tx = await turso.transaction("write");
    try {
        // Clear any old sessions for the user to prevent stale data
        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE user_id = ?;", args: [userId] });
        
        // Insert the new session with its parameters
        await tx.execute({
            sql: "INSERT INTO quiz_sessions (id, user_id, quiz_params_json) VALUES (?, ?, ?);",
            args: [sessionId, userId, JSON.stringify(quizParams)]
        });
        
        await tx.commit();
        res.status(201).json({ sessionId });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Failed to create quiz session', e.message);
        res.status(500).json({ message: 'Could not create quiz session.' });
    }
});

// GET /api/quizSessions/:sessionId - Fetch and assemble the quiz data
router.get('/:sessionId', verifyToken, async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    logApi('GET', `/api/quiz-sessions/${sessionId}`, `User: ${userId}`);

    const tx = await turso.transaction("write"); // Use 'write' to allow deletion
    try {
        const sessionResult = await tx.execute({
            sql: "SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ?;",
            args: [sessionId, userId]
        });

        if (sessionResult.rows.length === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'Quiz session not found. It may have expired or already been used.' });
        }

        const session = sessionResult.rows[0];
        const sessionAge = new Date().getTime() - new Date(session.created_at).getTime();

        if (sessionAge > FIVE_MINUTES_IN_MS) {
            await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
            await tx.commit();
            return res.status(410).json({ message: 'This quiz session has expired. Please start a new quiz.' });
        }

        const quizParams = JSON.parse(session.quiz_params_json);
        let questions = [];

        if (quizParams.quizType === 'homibhabha-practice') {
            questions = await assembleHomiBhabhaPracticeTest(tx, quizParams);
        } else {
            const difficultyRange = getDifficultyRange(quizParams.difficulty);
            const { rows } = await tx.execute({
                sql: `SELECT * FROM questions WHERE topicId = ? AND difficulty BETWEEN ? AND ?;`,
                args: [quizParams.topicId, difficultyRange.min, difficultyRange.max]
            });
            
            if (rows.length < quizParams.numQuestions) {
                // If not enough questions at specific difficulty, try fetching from all difficulties for that topic
                const fallbackResult = await tx.execute({
                    sql: `SELECT * FROM questions WHERE topicId = ?;`,
                    args: [quizParams.topicId]
                });
                if (fallbackResult.rows.length < quizParams.numQuestions) {
                    await tx.rollback();
                    return res.status(404).json({ message: `Could not find enough questions for this topic. Only found ${fallbackResult.rows.length}.` });
                }
                questions = shuffleArray(fallbackResult.rows).slice(0, quizParams.numQuestions);
            } else {
                questions = shuffleArray(rows).slice(0, quizParams.numQuestions);
            }
        }

        // Session is single-use; delete it after assembling the quiz.
        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
        await tx.commit();

        // --- THIS IS THE FIX ---
        // The API now returns a flat object, spreading the quiz parameters
        // alongside the questions array, matching the frontend's expected type.
        res.json({
            questions,
            ...quizParams
        });
        // --- END OF FIX ---

    } catch (e) {
        // Ensure rollback on any error
        if (tx && !tx.isClosed()) {
            await tx.rollback();
        }
        logError('DB ERROR', `Failed to fetch quiz for session ${sessionId}`, e.message);
        res.status(500).json({ message: e.message || 'Could not retrieve quiz data.' });
    }
});

module.exports = router;