// api/routes/friends.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

// Send a friend request
router.post('/request', verifySupabaseToken, async (req, res) => {
    const requesterId = req.user.id;
    const { receiverUsername } = req.body;
    logApi('POST', '/api/friends/request', `From ${requesterId} to ${receiverUsername}`);

    // 1. Find the receiver's user ID from their username
    const { data: receiver, error: receiverError } = await supabase
        .from('users')
        .select('id')
        .eq('username', receiverUsername)
        .single();

    if (receiverError || !receiver) {
        return res.status(404).json({ message: 'User not found.' });
    }
    const receiverId = receiver.id;
    if (requesterId === receiverId) {
        return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    // 2. Check for existing friendship
    const { data: existing, error: existingError } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
        .single();
    
    if (existing) {
        return res.status(400).json({ message: 'A friendship or pending request already exists with this user.' });
    }

    // 3. Insert the new request
    const { error: insertError } = await supabase
        .from('friendships')
        .insert({ requester_id: requesterId, receiver_id: receiverId, status: 'pending' });

    if (insertError) {
        logError('DB ERROR', 'Inserting friend request failed', insertError.message);
        return res.status(500).json({ message: 'Failed to send friend request.' });
    }

    res.status(201).json({ message: 'Friend request sent successfully.' });
});

// Get pending friend requests for the current user
router.get('/requests/pending', verifySupabaseToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends/requests/pending', `User: ${userId}`);

    // We need to join with the users table to get the requester's username
    const { data, error } = await supabase
        .from('friendships')
        .select(`
            id,
            created_at,
            requester:requester_id ( id, username )
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending');

    if (error) {
        logError('DB ERROR', 'Fetching pending requests failed', error.message);
        return res.status(500).json({ message: 'Could not fetch pending requests.' });
    }
    
    // Format the response to be more client-friendly
    const formattedData = data.map(req => ({
        requestId: req.id,
        username: req.requester.username,
        userId: req.requester.id,
        created_at: req.created_at,
    }));

    res.json(formattedData || []);
});

// Respond to a friend request (accept or decline)
router.put('/request/:requestId', verifySupabaseToken, async (req, res) => {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    logApi('PUT', `/api/friends/request/${requestId}`, `Action: ${action}`);

    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action.' });
    }
    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const { data, error } = await supabase
        .from('friendships')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', userId) // Make sure only the receiver can respond
        .eq('status', 'pending');   // Only act on pending requests

    if (error) {
        logError('DB ERROR', `Updating friend request ${requestId} failed`, error.message);
        return res.status(500).json({ message: 'Error processing request.' });
    }
    
    res.status(200).json({ message: `Friend request ${action}ed.` });
});

// Get the current user's friends list
router.get('/', verifySupabaseToken, async (req, res) => {
    const userId = req.user.id;
    logApi('GET', '/api/friends', `User: ${userId}`);
    
    // This is a complex query that requires a custom RPC function in Supabase
    // for optimal performance. Here's how to create it.
    // In your Supabase SQL Editor, run this ONCE:
    /*
        create or replace function get_friends(user_id uuid)
        returns table (friend_id uuid, friend_username text)
        language sql
        as $$
            select
                case
                    when f.requester_id = user_id then f.receiver_id
                    else f.requester_id
                end as friend_id,
                u.username as friend_username
            from friendships f
            join users u on u.id = (
                case
                    when f.requester_id = user_id then f.receiver_id
                    else f.requester_id
                end
            )
            where (f.requester_id = user_id or f.receiver_id = user_id)
            and f.status = 'accepted';
        $$;
    */

    const { data, error } = await supabase.rpc('get_friends', { user_id: userId });

    if (error) {
        logError('DB ERROR', 'RPC get_friends failed', error.message);
        return res.status(500).json({ message: 'Could not fetch friends list.' });
    }

    res.json(data || []);
});


// Unfriend a user
router.delete('/unfriend/:friendUserId', verifySupabaseToken, async (req, res) => {
    const currentUserId = req.user.id;
    const { friendUserId } = req.params;
    logApi('DELETE', `/api/friends/unfriend/${friendUserId}`);

    const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},receiver_id.eq.${currentUserId})`);

    if (error) {
        logError('DB ERROR', `Unfriending user ${friendUserId} failed`, error.message);
        return res.status(500).json({ message: 'Error unfriending user.' });
    }

    res.status(200).json({ message: 'Successfully unfriended.' });
});

export default router;