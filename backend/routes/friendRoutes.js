// backend/routes/friendRoutes.js
const express = require('express');
const { friendsDb, usersDb } = require('../db');
const { verifySessionToken } = require('../middleware/auth');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.post('/request', verifySessionToken, (req, res) => {
    const requesterId = req.user.id;
    const { receiverUsername } = req.body;
    logApi('POST', '/api/friends/request', `From user ${requesterId} to ${receiverUsername}`);
    
    if (!receiverUsername) return res.status(400).json({ message: 'Receiver username is required.' });

    usersDb.get("SELECT id FROM users WHERE identifier = ?", [receiverUsername.trim()], (err, receiver) => {
        if (err) { logError('DB ERROR', 'Finding receiver in usersDb', err.message); return res.status(500).json({ message: 'Error finding user.' }); }
        if (!receiver) { logApi('NOT FOUND', `User '${receiverUsername}' not found.`); return res.status(404).json({ message: 'User not found.' }); }
        if (requesterId === receiver.id) return res.status(400).json({ message: "You cannot send a request to yourself." });

        friendsDb.get("SELECT * FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)", [requesterId, receiver.id, receiver.id, requesterId], (err, existing) => {
            if (err) { logError('DB ERROR', 'Checking existing friendship', err.message); return res.status(500).json({ message: 'Server error.' }); }
            if (existing) return res.status(400).json({ message: 'A friend request or friendship already exists with this user.' });

            friendsDb.run("INSERT INTO friendships (requester_id, receiver_id) VALUES (?, ?)", [requesterId, receiver.id], function (insertErr) {
                if (insertErr) { logError('DB ERROR', 'Inserting friend request', insertErr.message); return res.status(500).json({ message: 'Failed to send friend request.' }); }
                res.status(201).json({ message: 'Friend request sent successfully.' });
            });
        });
    });
});

router.get('/requests/pending', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends/requests/pending', `User: ${userId}`);
    const sql = `SELECT fr.id as requestId, u.identifier as username, fr.created_at FROM friendships fr JOIN users_db.users u ON fr.requester_id = u.id WHERE fr.receiver_id = ? AND fr.status = 'pending' ORDER BY fr.created_at DESC`;
    friendsDb.all(sql, [userId], (err, requests) => {
        if (err) { logError('DB ERROR', 'Fetching pending requests', err.message); return res.status(500).json({ message: 'Error fetching pending requests.' }); }
        res.json(requests || []);
    });
});

router.put('/request/:requestId', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body;
    logApi('PUT', `/api/friends/request/${requestId}`, `Action: ${action}, User: ${userId}`);
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const sql = "UPDATE friendships SET status = ? WHERE id = ? AND receiver_id = ? AND status = 'pending'";
    friendsDb.run(sql, [newStatus, requestId, userId], function (err) {
        if (err) { logError('DB ERROR', `Responding to request ${requestId}`, err.message); return res.status(500).json({ message: 'Error processing request.' }); }
        if (this.changes === 0) return res.status(404).json({ message: 'Pending request not found or you are not the receiver.' });
        res.status(200).json({ message: `Friend request ${newStatus}.` });
    });
});

router.get('/', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends', `User: ${userId}`);
    const sql = `SELECT u.id as friendId, u.identifier as friendUsername FROM friendships fr JOIN users_db.users u ON u.id = CASE WHEN fr.requester_id = ? THEN fr.receiver_id ELSE fr.requester_id END WHERE (fr.requester_id = ? OR fr.receiver_id = ?) AND fr.status = 'accepted' ORDER BY u.identifier COLLATE NOCASE ASC`;
    friendsDb.all(sql, [userId, userId, userId], (err, friends) => {
        if (err) { logError('DB ERROR', 'Fetching friends list', err.message); return res.status(500).json({ message: 'Error fetching friends list.' }); }
        res.json(friends || []);
    });
});

router.delete('/unfriend/:friendUserId', verifySessionToken, (req, res) => {
    const userId = req.user.id;
    const { friendUserId } = req.params;
    logApi('DELETE', `/api/friends/unfriend/${friendUserId}`, `From User: ${userId}`);
    const sql = `DELETE FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))`;
    friendsDb.run(sql, [userId, friendUserId, friendUserId, userId], function (err) {
        if (err) { logError('DB ERROR', `Unfriending user ${friendUserId}`, err.message); return res.status(500).json({ message: 'Error unfriending user.' }); }
        if (this.changes === 0) return res.status(404).json({ message: 'Friendship not found.' });
        res.status(200).json({ message: 'Successfully unfriended.' });
    });
});

module.exports = router;