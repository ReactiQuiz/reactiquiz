// api/routes/challenges.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// --- START OF FIX: ALL DB CALLS NOW USE TRANSACTIONS ---

router.post('/', verifyToken, async (req, res) => {
    const challenger_id = req.user.id;
    const { challenged_id, topic_id, topic_name, difficulty, num_questions, question_ids_json } = req.body;
    logApi('POST', '/api/challenges', `From ${challenger_id} to ${challenged_id}`);

    const tx = await turso.transaction("write");
    try {
        await tx.execute({
            sql: `INSERT INTO challenges (challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, question_ids_json)
                  VALUES (?, ?, ?, ?, ?, ?, ?);`,
            args: [challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, JSON.stringify(question_ids_json)]
        });
        await tx.commit();
        res.status(201).json({ message: 'Challenge sent!' });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Creating challenge failed', e.message);
        res.status(500).json({ message: 'Failed to create challenge.' });
    }
});

router.get('/pending', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/challenges/pending', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: `SELECT c.*, u.username as challengerUsername FROM challenges c
                  JOIN users u ON c.challenger_id = u.id
                  WHERE c.challenged_id = ? AND c.status = 'pending'`,
            args: [userId]
        });
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching pending challenges failed', e.message);
        res.status(500).json({ message: 'Could not fetch challenges.' });
    }
});

// --- END OF FIX ---

module.exports = router;