// api/routes/friends.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// --- START OF FIX: ALL DB CALLS NOW USE TRANSACTIONS ---

router.post('/request', verifyToken, async (req, res) => {
    const requesterId = req.user.id;
    const { receiverUsername } = req.body;
    logApi('POST', '/api/friends/request', `From ${requesterId} to ${receiverUsername}`);

    const tx = await turso.transaction("write");
    try {
        const receiverResult = await tx.execute({
            sql: "SELECT id FROM users WHERE username = ?", args: [receiverUsername]
        });
        if (receiverResult.rows.length === 0) {
            await tx.rollback(); return res.status(404).json({ message: 'User not found.' });
        }
        const receiverId = receiverResult.rows[0].id;
        if (requesterId === receiverId) {
            await tx.rollback(); return res.status(400).json({ message: "You cannot send a request to yourself." });
        }
        const existingResult = await tx.execute({
            sql: "SELECT id FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)",
            args: [requesterId, receiverId, receiverId, requesterId]
        });
        if (existingResult.rows.length > 0) {
            await tx.rollback(); return res.status(400).json({ message: 'A friendship or pending request already exists.' });
        }
        await tx.execute({
            sql: "INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, 'pending')",
            args: [requesterId, receiverId]
        });
        await tx.commit();
        res.status(201).json({ message: 'Friend request sent successfully.' });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Sending friend request failed', e.message);
        res.status(500).json({ message: 'Server error processing request.' });
    }
});

router.get('/requests/pending', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends/requests/pending', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: `SELECT f.id as requestId, u.username FROM friendships f
                  JOIN users u ON f.requester_id = u.id
                  WHERE f.receiver_id = ? AND f.status = 'pending'`,
            args: [userId]
        });
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching pending requests failed', e.message);
        res.status(500).json({ message: 'Could not fetch pending requests.' });
    }
});

router.put('/request/:requestId', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body;
    logApi('PUT', `/api/friends/request/${requestId}`, `Action: ${action}`);

    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    
    const tx = await turso.transaction("write");
    try {
        const result = await tx.execute({
            sql: "UPDATE friendships SET status = ? WHERE id = ? AND receiver_id = ? AND status = 'pending'",
            args: [newStatus, requestId, userId]
        });
        await tx.commit();

        if (result.rowsAffected === 0) return res.status(404).json({ message: 'Pending request not found or you are not the receiver.' });
        res.status(200).json({ message: `Friend request ${action}ed.` });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Updating friend request ${requestId} failed`, e.message);
        res.status(500).json({ message: 'Error processing request.' });
    }
});

router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends', `User: ${userId}`);
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute({
            sql: `SELECT u.id as friendId, u.username as friendUsername FROM friendships f
                  JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.receiver_id ELSE f.requester_id END
                  WHERE (f.requester_id = ? OR f.receiver_id = ?) AND f.status = 'accepted'
                  ORDER BY u.username COLLATE NOCASE ASC`,
            args: [userId, userId, userId]
        });
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching friends list failed', e.message);
        res.status(500).json({ message: 'Could not fetch friends list.' });
    }
});

router.delete('/unfriend/:friendUserId', verifyToken, async (req, res) => {
    const currentUserId = req.user.id;
    const { friendUserId } = req.params;
    logApi('DELETE', `/api/friends/unfriend/${friendUserId}`);
    const tx = await turso.transaction("write");
    try {
        await tx.execute({
            sql: `DELETE FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)`,
            args: [currentUserId, friendUserId, friendUserId, currentUserId]
        });
        await tx.commit();
        res.status(200).json({ message: 'Successfully unfriended.' });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Unfriending failed`, e.message);
        res.status(500).json({ message: 'Error unfriending user.' });
    }
});

// --- END OF FIX ---

module.exports = router;