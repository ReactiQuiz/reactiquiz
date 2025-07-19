// api/routes/quizzes.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

// Fetch questions for a specific topic
router.get('/questions', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId is required.' });
    logApi('GET', '/api/questions', `Topic: ${topicId}`);
    
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topicId', topicId);
        
    if (error) {
        logError('DB ERROR', `Fetching questions for ${topicId}`, error.message);
        return res.status(500).json({ message: 'Could not fetch questions.' });
    }
    res.json(data);
});

// Save a quiz result
router.post('/results', verifySupabaseToken, async (req, res) => {
    const user = req.user;
    const resultData = req.body;
    logApi('POST', '/api/results', `User: ${user.id}`);
    
    const { data, error } = await supabase
        .from('quiz_results')
        .insert({
            user_id: user.id,
            ...resultData // Assumes frontend sends data with correct column names
        })
        .select()
        .single();
        
    if (error) {
        logError('DB ERROR', 'Saving result failed', error.message);
        return res.status(500).json({ message: 'Could not save quiz result.' });
    }
    res.status(201).json(data);
});

// Fetch user's results
router.get('/results', verifySupabaseToken, async (req, res) => {
    const user = req.user;
    const { limit, excludeChallenges } = req.query;
    logApi('GET', '/api/results', `User: ${user.id}`);

    let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

    if (excludeChallenges === 'true') {
        query = query.is('challenge_id', null);
    }

    if (limit && !isNaN(parseInt(limit))) {
        query = query.limit(parseInt(limit));
    }
    
    const { data, error } = await query;

    if (error) {
        logError('DB ERROR', 'Fetching results failed', error.message);
        return res.status(500).json({ message: 'Could not fetch results.' });
    }
    res.json(data);
});

module.exports = router;