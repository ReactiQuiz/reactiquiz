// api/routes/quizzes.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

// Fetch all topics or topics for a specific subject
router.get('/topics/:subject?', async (req, res) => {
    const { subject } = req.params;
    logApi('GET', subject ? `/api/topics/${subject}` : '/api/topics');
    
    let query = supabase.from('quiz_topics').select('*');
    if (subject) {
        // Find the subject's ID first from the subjects table
        const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id')
            .eq('subjectKey', subject)
            .single();
        
        if (subjectError || !subjectData) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        query = query.eq('subject_id', subjectData.id);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
        logError('DB ERROR', 'Fetching topics failed', error.message);
        return res.status(500).json({ message: 'Could not fetch topics.' });
    }
    res.json(data);
});

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