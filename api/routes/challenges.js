// api/routes/challenges.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Create a new challenge
router.post('/', verifyToken, async (req, res) => {
    const challenger_id = req.user.id;
    const { challenged_id, topic_id, topic_name, difficulty, num_questions, question_ids_json } = req.body;
    logApi('POST', '/api/challenges', `From ${challenger_id} to ${challenged_id}`);

    try {
        await turso.execute({
            sql: `INSERT INTO challenges (challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, question_ids_json)
                  VALUES (?, ?, ?, ?, ?, ?, ?);`,
            args: [challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, JSON.stringify(question_ids_json)]
        });
        res.status(201).json({ message: 'Challenge sent!' });
    } catch (e) {
        logError('DB ERROR', 'Creating challenge failed', e.message);
        res.status(500).json({ message: 'Failed to create challenge.' });
    }
});

// Get pending challenges
router.get('/pending', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/challenges/pending', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: `SELECT c.*, u.username as challengerUsername FROM challenges c
                  JOIN users u ON c.challenger_id = u.id
                  WHERE c.challenged_id = ? AND c.status = 'pending'`,
            args: [userId]
        });
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching pending challenges failed', e.message);
        res.status(500).json({ message: 'Could not fetch challenges.' });
    }
});

module.exports = router;