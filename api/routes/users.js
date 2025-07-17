// api/routes/users.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

// Supabase handles sign-up directly from the frontend client.
// This route is for creating the corresponding profile in our public.users table.
// NOTE: This should ideally be a Supabase Edge Function triggered on new user creation.
// For simplicity in Express, we'll make it an authenticated endpoint.
router.post('/create-profile', verifySupabaseToken, async (req, res) => {
    const user = req.user;
    const { username, address, class: userClass } = req.body;
    logApi('POST', '/api/users/create-profile', `For user: ${user.id}`);

    if (!username || !address || !userClass) {
        return res.status(400).json({ message: 'Username, address, and class are required.' });
    }
    
    const { data, error } = await supabase
        .from('users')
        .insert({
            id: user.id,
            email: user.email,
            username: username,
            address: address,
            class: userClass,
        })
        .select()
        .single();
    
    if (error) {
        logError('DB ERROR', 'Creating user profile failed', error.message);
        // Handle unique constraint violation for username
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Username is already taken.' });
        }
        return res.status(500).json({ message: 'Could not create user profile.' });
    }
    
    res.status(201).json(data);
});

// Search for users to add as friends
router.get('/search', verifySupabaseToken, async (req, res) => {
    const { username } = req.query;
    const currentUserId = req.user.id;
    logApi('GET', '/api/users/search', `Term: ${username}`);
    
    if (!username || username.trim().length < 2) {
        return res.status(400).json({ message: 'Search term must be at least 2 characters.' });
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .ilike('username', `%${username}%`)
        .neq('id', currentUserId) // Don't include the current user in search results
        .limit(10);
        
    if (error) {
        logError('DB ERROR', 'User search failed', error.message);
        return res.status(500).json({ message: 'Error searching for users.' });
    }
    
    res.json(data || []);
});


// Add other user routes (like update profile) here...

export default router;