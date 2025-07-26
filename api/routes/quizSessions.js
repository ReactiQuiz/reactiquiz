// api/routes/quizSessions.js
const { Router } = require('express');
const crypto = require('crypto');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');
const { assembleHomiBhabhaPracticeTest } = require('../_utils/quizAssembler'); // We will create this

const router = Router();
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

// POST /api/quiz-sessions
// Creates a new, secure quiz session and returns its ID.
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { quizParams } = req.body; // e.g., { topicId, difficulty, numQuestions, quizType, ... }
    logApi('POST', '/api/quiz-sessions', `User: ${userId}`);

    if (!quizParams || !quizParams.topicId) {
        return res.status(400).json({ message: 'Invalid quiz parameters provided.' });
    }

    const sessionId = crypto.randomBytes(8).toString('hex'); // Generate a random 16-char ID
    const tx = await turso.transaction("write");
    try {
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

// GET /api/quiz-sessions/:sessionId
// Fetches the questions for a specific session, if valid.
router.get('/:sessionId', verifyToken, async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    logApi('GET', `/api/quiz-sessions/${sessionId}`, `User: ${userId}`);

    const tx = await turso.transaction("write"); // "write" because we will delete the session
    try {
        const sessionResult = await tx.execute({
            sql: "SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ?;",
            args: [sessionId, userId]
        });

        if (sessionResult.rows.length === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'Quiz session not found or you do not have permission to access it.' });
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

        // --- Question Assembly Logic ---
        if (quizParams.quizType === 'homibhabha-practice') {
            questions = await assembleHomiBhabhaPracticeTest(tx, quizParams);
        } else {
            // Standard topic quiz logic
            const { rows } = await tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ?;",
                args: [quizParams.topicId]
            });
            questions = rows; // Filtering and shuffling will be done on the client for simplicity here
        }

        // Clean up the used session
        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
        await tx.commit();
        
        // Return both the questions and the original parameters (context)
        res.json({ questions, context: quizParams });

    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Failed to fetch quiz for session ${sessionId}`, e.message);
        res.status(500).json({ message: 'Could not retrieve quiz data.' });
    }
});


module.exports = router;