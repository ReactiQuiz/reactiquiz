// api/routes/challenges.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();
const CHALLENGE_EXPIRATION_DAYS = 7;

router.post('/', verifySupabaseToken, async (req, res) => {
    const challenger_id = req.user.id;
    const { challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject } = req.body;
    logApi('POST', '/api/challenges', `From ${challenger_id} to ${challenged_friend_id}`);
    
    const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('challenges')
        .insert({
            challenger_id,
            challenged_id: challenged_friend_id,
            topic_id,
            topic_name,
            difficulty,
            num_questions,
            quiz_class,
            question_ids_json,
            subject, // Make sure this is in your table schema
            expires_at: expiresAt,
        })
        .select()
        .single();

    if (error) {
        logError('DB ERROR', 'Creating challenge failed', error.message);
        return res.status(500).json({ message: 'Failed to create challenge.' });
    }
    res.status(201).json({ message: `Challenge sent!`, challengeId: data.id });
});

// ... you would continue to build out the other challenge routes (get pending, submit score, etc.)
// following the same pattern of using the supabase client.

export default router;