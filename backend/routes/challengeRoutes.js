// backend/routes/challengeRoutes.js
const express = require('express');
const { challengesDb, resultsDb } = require('../db');
const { verifySessionToken } = require('../middleware/auth');
const { CHALLENGE_EXPIRATION_DAYS } = require('../utils/authUtils');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.post('/', verifySessionToken, (req, res) => {
    const challengerId = req.user.id;
    const { challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject } = req.body;
    logApi('POST', '/api/challenges', `From ${challengerId} to ${challenged_friend_id}`);

    if (!challenged_friend_id || !topic_id || !difficulty || !num_questions || !question_ids_json || !subject) {
        return res.status(400).json({ message: 'Missing required challenge parameters.' });
    }
    
    const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const sql = `INSERT INTO challenges (challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [challengerId, challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject, expiresAt];

    challengesDb.run(sql, params, function (err) {
        if (err) { logError('DB ERROR', 'Creating challenge failed', err.message); return res.status(500).json({ message: 'Failed to create challenge.' }); }
        res.status(201).json({ message: `Challenge sent!`, challengeId: this.lastID });
    });
});

router.get('/pending', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/challenges/pending', `User: ${userId}`);
    const sql = `SELECT c.*, u.identifier as challengerUsername FROM challenges c JOIN users u ON c.challenger_id = u.id WHERE c.challenged_id = ? AND (c.status = 'pending' OR c.status = 'challenger_completed') AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP) ORDER BY c.created_at DESC`;
    challengesDb.all(sql, [userId], (err, challenges) => {
        if (err) { logError('DB ERROR', 'Fetching pending challenges', err.message); return res.status(500).json({ message: 'Error fetching pending challenges.' }); }
        res.json(challenges || []);
    });
});

router.get('/:challengeId', verifySessionToken, (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user.id;
    logApi('GET', `/api/challenges/${challengeId}`, `User: ${userId}`);
    const sql = `SELECT c.*, u_challenger.identifier as challengerUsername, u_challenged.identifier as challengedUsername FROM challenges c JOIN users u_challenger ON c.challenger_id = u_challenger.id JOIN users u_challenged ON c.challenged_id = u_challenged.id WHERE c.id = ?`;
    challengesDb.get(sql, [challengeId], (err, challenge) => {
        if (err) { logError('DB ERROR', `Fetching challenge ${challengeId}`, err.message); return res.status(500).json({ message: 'Error fetching challenge.' }); }
        if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });
        if (challenge.challenger_id !== userId && challenge.challenged_id !== userId) return res.status(403).json({ message: 'You are not part of this challenge.' });
        res.json(challenge);
    });
});

router.put('/:challengeId/submit', verifySessionToken, (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user.id;
    const { score, percentage, timeTaken, resultId } = req.body;
    logApi('PUT', `/api/challenges/${challengeId}/submit`, `User: ${userId}, Score: ${score}`);

    challengesDb.get("SELECT * FROM challenges WHERE id = ?", [challengeId], (err, challenge) => {
        if (err || !challenge) { logError('DB ERROR', `Finding challenge ${challengeId}`, err ? err.message : 'Not Found'); return res.status(err ? 500 : 404).json({ message: err ? 'Server error.' : 'Challenge not found.' }); }
        
        let updateFields, params, newStatus = challenge.status;
        if (challenge.challenger_id === userId) {
            updateFields = ['challenger_score = ?', 'challenger_percentage = ?', 'challenger_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = challenge.challenged_score != null ? 'completed' : 'challenger_completed';
        } else if (challenge.challenged_id === userId) {
            updateFields = ['challenged_score = ?', 'challenged_percentage = ?', 'challenged_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = 'completed';
        } else {
            return res.status(403).json({ message: 'You are not part of this challenge.' });
        }
        
        updateFields.push('status = ?');
        params.push(newStatus);
        
        if (newStatus === 'completed') {
            const cScore = (challenge.challenger_id === userId) ? score : challenge.challenger_score;
            const dScore = (challenge.challenged_id === userId) ? score : challenge.challenged_score;
            if (cScore > dScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenger_id); }
            else if (dScore > cScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenged_id); }
        }
        
        params.push(challengeId);
        const sql = `UPDATE challenges SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        challengesDb.run(sql, params, function(updateErr) {
            if (updateErr) { logError('DB ERROR', `Updating challenge ${challengeId} score`, updateErr.message); return res.status(500).json({ message: 'Failed to submit score.' }); }
            
            resultsDb.run("UPDATE quiz_results SET challenge_id = ? WHERE id = ? AND userId = ?", [challengeId, resultId, userId]);
            res.status(200).json({ message: 'Challenge score submitted.', status: newStatus });
        });
    });
});

module.exports = router;