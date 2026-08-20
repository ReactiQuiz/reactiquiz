// api/routes/quizSessions.js
/**
 * Quiz Session Routes
 * 
 * Handles quiz session creation and question assembly from Turso database.
 * Supports regular topic-based quizzes and Homi Bhabha practice tests.
 * Sessions expire after 5 minutes and are automatically cleaned up.
 * All routes require authentication via verifyToken middleware.
 */

const { Router } = require('express');
const crypto = require('crypto');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');
const { assembleHomiBhabhaPracticeTest } = require('../_utils/quizAssembler');
const { shuffleArray } = require('../_utils/arrayUtils');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000; // Session expiration time (5 minutes)



/**
 * POST /api/quizSessions
 * 
 * Creates a new quiz session with the provided quiz parameters.
 * Clears any existing sessions for the user before creating a new one.
 * Returns the session ID for use in fetching questions.
 * Requires authentication via verifyToken middleware.
 */
router.post('/', verifyToken, asyncHandler(async (req, res) => {
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
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', 'Failed to create quiz session', e.message);
        res.status(500).json({ message: 'Could not create quiz session.' });
    }
}));

/**
 * GET /api/quizSessions/:sessionId
 * 
 * Fetches and assembles quiz questions for a session.
 * Supports regular topic-based quizzes and Homi Bhabha practice tests.
 * Returns 410 if session has expired (older than 5 minutes).
 * Returns 404 if session not found.
 * Requires authentication via verifyToken middleware.
 * 
 * @param {string} sessionId - Session ID to fetch questions for
 */
router.get('/:sessionId', verifyToken, asyncHandler(async (req, res) => {
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
        // SQLite datetime('now') returns UTC string format 'YYYY-MM-DD HH:MM:SS'.
        // Ensure parsing as UTC to avoid local timezone offset miscalculation.
        const createdAtUtc = session.created_at ? (session.created_at.includes('Z') || session.created_at.includes('T') ? session.created_at : session.created_at.replace(' ', 'T') + 'Z') : null;
        const sessionAge = createdAtUtc ? (Date.now() - new Date(createdAtUtc).getTime()) : 0;

        if (sessionAge > FIVE_MINUTES_IN_MS) {
            await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
            await tx.commit();
            return res.status(410).json({ message: 'This quiz session has expired. Please start a new quiz.' });
        }

        const quizParams = JSON.parse(session.quiz_params_json);
        let questions = [];

        // Refresh-safe path: a prior fetch already locked in the exact
        // question set (see below). Re-fetch those same rows by ID instead
        // of re-rolling a new random subset, so a page refresh mid-quiz
        // resumes the same quiz instead of getting a different one.
        if (Array.isArray(quizParams.selectedQuestionIds) && quizParams.selectedQuestionIds.length > 0) {
            const placeholders = quizParams.selectedQuestionIds.map(() => '?').join(',');
            const { rows } = await tx.execute({
                sql: `SELECT id, topicId, text, options FROM questions WHERE id IN (${placeholders})`,
                args: quizParams.selectedQuestionIds
            });
            const byId = new Map(rows.map((r) => [r.id, r]));
            questions = quizParams.selectedQuestionIds.map((id) => byId.get(id)).filter(Boolean);
        } else if (quizParams.quizType === 'homibhabha-practice') {
            questions = await assembleHomiBhabhaPracticeTest(tx, quizParams);
        } else {
            const { rows } = await tx.execute({
                sql: `SELECT id, topicId, text, options FROM questions WHERE topicId = ?;`,
                args: [quizParams.topicId]
            });

            if (rows.length < (quizParams.numQuestions || 10)) {
                await tx.rollback();
                return res.status(404).json({ message: `Could not find enough questions for this topic. Found ${rows.length}.` });
            }
            questions = shuffleArray(rows).slice(0, quizParams.numQuestions || 10);
        }

        if (questions.length === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'Could not find any questions for this quiz.' });
        }

        // First fetch: lock in this exact selection so a later refresh
        // resumes the same quiz instead of re-rolling a different random
        // subset. Sessions are intentionally NOT deleted here (they were
        // previously single-use-by-delete, which meant a page refresh mid-quiz
        // permanently lost the attempt) — they're scoped to the owning user
        // (WHERE user_id = ? above) and bounded by the 5-minute expiry check
        // above, and the payload never includes answers, so a repeat fetch
        // exposes nothing a first fetch didn't. Sessions are still cleared
        // eagerly the next time this user starts a new quiz (see POST above)
        // and lazily via the expiry check on any later fetch.
        if (!Array.isArray(quizParams.selectedQuestionIds)) {
            const lockedParams = { ...quizParams, selectedQuestionIds: questions.map((q) => q.id) };
            await tx.execute({
                sql: "UPDATE quiz_sessions SET quiz_params_json = ? WHERE id = ?",
                args: [JSON.stringify(lockedParams), sessionId]
            });
        }

        await tx.commit();

        // The API returns a flat object, spreading the quiz parameters
        // alongside the questions array, matching the frontend's expected type.
        // selectedQuestionIds is internal bookkeeping, not part of that contract.
        const { selectedQuestionIds, ...publicQuizParams } = quizParams;
        res.json({
            questions,
            ...publicQuizParams
        });

    } catch (e) {
        // Ensure rollback on any error
        if (tx && !tx.closed) {
            await tx.rollback();
        }
        logError('DB ERROR', `Failed to fetch quiz for session ${sessionId}`, e.message);
        res.status(500).json({ message: e.message || 'Could not retrieve quiz data.' });
    }
}));

module.exports = router;