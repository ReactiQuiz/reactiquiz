// api/routes/questions.js
const { Router } = require('express');
const { supabase } = require('../_utils/supabaseClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Route to fetch questions for a specific topicId
router.get('/', async (req, res) => {
    const { topicId } = req.query;
    if (!topicId) {
        return res.status(400).json({ message: 'A topicId query parameter is required.' });
    }
    logApi('GET', '/api/questions', `Topic: ${topicId}`);
    
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topicId', topicId);
        
    if (error) {
        logError('DB ERROR', `Fetching questions for ${topicId}`, error.message);
        return res.status(500).json({ message: 'Could not fetch questions.' });
    }
    res.json(data || []);
});

module.exports = router;