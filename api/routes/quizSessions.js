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

// Helper to get the difficulty score range (remains the same)
const getDifficultyRange = (difficulty) => {
    // ... (no changes here)
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // 'mixed'
    }
};

// --- START OF FIX: This route now cleans up old sessions ---
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { quizParams } = req.body;
    logApi('POST', '/api/quiz-sessions', `User: ${userId}`);

    if (!quizParams || !quizParams.topicId) {
        return res.status(400).json({ message: 'Invalid quiz parameters provided.' });
    }

    const sessionId = crypto.randomBytes(8).toString('hex');
    const tx = await turso.transaction("write");
    try {
        // Enforce one session per user: delete any existing session for this user first.
        await tx.execute({
            sql: "DELETE FROM quiz_sessions WHERE user_id = ?;",
            args: [userId]
        });

        // Insert the new session.
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
// --- END OF FIX ---

// GET /api/quiz-sessions/:sessionId (This route is updated with a better error message)
router.get('/:sessionId', verifyToken, async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    logApi('GET', `/api/quiz-sessions/${sessionId}`, `User: ${userId}`);

    const tx = await turso.transaction("write");
    try {
        const sessionResult = await tx.execute({
            sql: "SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ?;",
            args: [sessionId, userId]
        });

        if (sessionResult.rows.length === 0) {
            await tx.rollback();
            // --- START OF FIX: Improved error message ---
            return res.status(404).json({ message: 'Quiz session not found. It may have expired or already been used.' });
            // --- END OF FIX ---
        }

        const session = sessionResult.rows[0];
        const sessionAge = new Date() - new Date(session.created_at);

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
                await tx.rollback();
                return res.status(404).json({ message: `Could not find ${quizParams.numQuestions} questions for the selected difficulty. Found only ${rows.length}. Try 'Mixed' difficulty.` });
            }
            questions = shuffleArray(rows).slice(0, quizParams.numQuestions);
        }

        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
        await tx.commit();
        
        res.json({ questions, context: quizParams });

    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Failed to fetch quiz for session ${sessionId}`, e.message);
        res.status(500).json({ message: 'Could not retrieve quiz data.' });
    }
});


module.exports = router;