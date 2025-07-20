// api/routes/friends.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Send a friend request
router.post('/request', verifyToken, async (req, res) => {
    const requesterId = req.user.id;
    const { receiverUsername } = req.body;
    logApi('POST', '/api/friends/request', `From ${requesterId} to ${receiverUsername}`);

    try {
        const receiverResult = await turso.execute({
            sql: "SELECT id FROM users WHERE username = ?",
            args: [receiverUsername]
        });
        if (receiverResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const receiverId = receiverResult.rows[0].id;

        if (requesterId === receiverId) {
            return res.status(400).json({ message: "You cannot send a request to yourself." });
        }

        const existingResult = await turso.execute({
            sql: "SELECT id FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)",
            args: [requesterId, receiverId, receiverId, requesterId]
        });

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ message: 'A friendship or pending request already exists.' });
        }

        await turso.execute({
            sql: "INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, 'pending')",
            args: [requesterId, receiverId]
        });

        res.status(201).json({ message: 'Friend request sent successfully.' });
    } catch (e) {
        logError('DB ERROR', 'Sending friend request failed', e.message);
        res.status(500).json({ message: 'Server error processing request.' });
    }
});

// Get pending friend requests
router.get('/requests/pending', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends/requests/pending', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: `SELECT f.id as requestId, u.username FROM friendships f
                  JOIN users u ON f.requester_id = u.id
                  WHERE f.receiver_id = ? AND f.status = 'pending'`,
            args: [userId]
        });
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching pending requests failed', e.message);
        res.status(500).json({ message: 'Could not fetch pending requests.' });
    }
});

// Respond to a friend request
router.put('/request/:requestId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    logApi('PUT', `/api/friends/request/${requestId}`, `Action: ${action}`);

    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action.' });
    }
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    
    try {
        const result = await turso.execute({
            sql: "UPDATE friendships SET status = ? WHERE id = ? AND receiver_id = ? AND status = 'pending'",
            args: [newStatus, requestId, userId]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Pending request not found or you are not the receiver.' });
        }
        res.status(200).json({ message: `Friend request ${action}ed.` });
    } catch (e) {
        logError('DB ERROR', `Updating friend request ${requestId} failed`, e.message);
        res.status(500).json({ message: 'Error processing request.' });
    }
});

// Get friends list
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends', `User: ${userId}`);
    try {
        const result = await turso.execute({
            sql: `SELECT u.id as friendId, u.username as friendUsername FROM friendships f
                  JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.receiver_id ELSE f.requester_id END
                  WHERE (f.requester_id = ? OR f.receiver_id = ?) AND f.status = 'accepted'
                  ORDER BY u.username COLLATE NOCASE ASC`,
            args: [userId, userId, userId]
        });
        res.json(result.rows);
    } catch (e) {
        logError('DB ERROR', 'Fetching friends list failed', e.message);
        res.status(500).json({ message: 'Could not fetch friends list.' });
    }
});

// Unfriend a user
router.delete('/unfriend/:friendUserId', verifyToken, async (req, res) => {
    const currentUserId = req.user.id;
    const { friendUserId } = req.params;
    logApi('DELETE', `/api/friends/unfriend/${friendUserId}`);
    try {
        await turso.execute({
            sql: `DELETE FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)`,
            args: [currentUserId, friendUserId, friendUserId, currentUserId]
        });
        res.status(200).json({ message: 'Successfully unfriended.' });
    } catch (e) {
        logError('DB ERROR', `Unfriending failed`, e.message);
        res.status(500).json({ message: 'Error unfriending user.' });
    }
});

module.exports = router;