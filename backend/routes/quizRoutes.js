// backend/routes/quizRoutes.js
const express = require('express');
const { topicsDb, questionsDb, resultsDb } = require('../db');
const { verifySessionToken } = require('../middleware/auth');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.get('/topics', (req, res) => {
    logApi('GET', '/api/topics (all)');
    const sql = `SELECT id, name, description, class, genre, subject FROM quiz_topics ORDER BY subject, name`;
    topicsDb.all(sql, [], (err, rows) => {
        if (err) { logError('DB ERROR', 'Fetching all topics', err.message); return res.status(500).json({ message: `Failed to fetch topics.` }); }
        res.json(rows || []);
    });
});

router.get('/topics/:subject', (req, res) => {
    const { subject } = req.params;
    logApi('GET', `/api/topics/${subject}`);
    const sql = `SELECT id, name, description, class, genre, subject FROM quiz_topics WHERE subject = ? ORDER BY class, name`;
    topicsDb.all(sql, [subject.toLowerCase()], (err, rows) => {
        if (err) { logError('DB ERROR', `Fetching topics for ${subject}`, err.message); return res.status(500).json({ message: `Failed to fetch topics.` }); }
        res.json(rows || []);
    });
});

router.get('/questions', (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId query parameter is required.' });
    logApi('GET', '/api/questions', `Topic: ${topicId}`);
    const sql = `SELECT q.*, qt.subject, qt.class FROM questions q LEFT JOIN topics_db.quiz_topics qt ON q.topicId = qt.id WHERE q.topicId = ?`;
    questionsDb.all(sql, [topicId], (err, rows) => {
        if (err) { logError('DB ERROR', `Fetching questions for ${topicId}`, err.message); return res.status(500).json({ message: `Failed to fetch questions.` }); }
        res.json(rows || []);
    });
});

router.post('/results', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    const { subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class: className, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id } = req.body;
    logApi('POST', '/api/results', `User: ${userId}, Topic: ${topicId}`);
    if (!subject || !topicId || score == null || totalQuestions == null || percentage == null || !timestamp) {
        return res.status(400).json({ message: 'Missing required result fields.' });
    }
    const sql = `INSERT INTO quiz_results (userId, subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [userId, subject, topicId, score, totalQuestions, percentage, timestamp, difficulty || null, numQuestionsConfigured || null, className || null, timeTaken || null, JSON.stringify(questionsActuallyAttemptedIds || []), JSON.stringify(userAnswersSnapshot || {}), challenge_id || null];
    resultsDb.run(sql, params, function (err) {
        if (err) { logError('DB ERROR', `Saving result for user ${userId}`, err.message); return res.status(500).json({ message: `Failed to save result.` }); }
        res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
});

router.get('/results', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    const { limit, excludeChallenges } = req.query;
    logApi('GET', '/api/results', `User: ${userId}, Limit: ${limit}, ExcludeChallenges: ${excludeChallenges}`);
    let sql = "SELECT * FROM quiz_results WHERE userId = ?";
    const params = [userId];
    if (excludeChallenges === 'true') sql += " AND challenge_id IS NULL";
    sql += " ORDER BY timestamp DESC";
    if (limit && !isNaN(parseInt(limit))) { sql += " LIMIT ?"; params.push(parseInt(limit)); }

    resultsDb.all(sql, params, (err, rows) => {
        if (err) { logError('DB ERROR', `Fetching results for user ${userId}`, err.message); return res.status(500).json({ message: `Failed to fetch results.` }); }
        try {
            const parsedRows = (rows || []).map(row => ({ ...row, questionsActuallyAttemptedIds: JSON.parse(row.questionsActuallyAttemptedIds || '[]'), userAnswersSnapshot: JSON.parse(row.userAnswersSnapshot || '{}') }));
            res.json(parsedRows);
        } catch (parseError) {
            logError('PARSE ERROR', `Parsing results for user ${userId}`, parseError.message);
            res.status(500).json({ message: 'Error processing results data.' });
        }
    });
});

router.delete('/results/:id', verifySessionToken, (req, res) => {
    const resultId = req.params.id;
    const userId = req.user.id;
    logApi('DELETE', `/api/results/${resultId}`, `User: ${userId}`);

    const sql = "DELETE FROM quiz_results WHERE id = ? AND userId = ?";
    resultsDb.run(sql, [resultId, userId], function (err) {
        if (err) { logError('DB ERROR', `Deleting result ${resultId}`, err.message); return res.status(500).json({ message: `Failed to delete result.` }); }
        if (this.changes === 0) return res.status(404).json({ message: 'Result not found or you do not have permission.' });
        res.status(200).json({ message: 'Result deleted successfully.' });
    });
});

module.exports = router;