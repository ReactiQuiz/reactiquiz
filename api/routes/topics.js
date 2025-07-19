// api/routes/topics.js
const { Router } = require('express');
const { supabase } = require('../_utils/supabaseClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Route to fetch ALL topics
router.get('/', async (req, res) => {
    logApi('GET', '/api/topics (all)');
    
    const { data, error } = await supabase
        .from('quiz_topics')
        .select(`
            *,
            subject:subjects ( name, subjectKey )
        `)
        .order('name');
    
    if (error) {
        logError('DB ERROR', 'Fetching all topics failed', error.message);
        return res.status(500).json({ message: 'Could not fetch topics.' });
    }
    res.json(data);
});

// Route to fetch topics for a SPECIFIC subject
router.get('/:subjectKey', async (req, res) => {
    const { subjectKey } = req.params;
    logApi('GET', `/api/topics/${subjectKey}`);
    
    // Find the subject's ID first
    const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('subjectKey', subjectKey)
        .single();
    
    if (subjectError || !subjectData) {
        return res.status(404).json({ message: `Subject with key '${subjectKey}' not found` });
    }
    
    const { data, error } = await supabase
        .from('quiz_topics')
        .select('*')
        .eq('subject_id', subjectData.id)
        .order('name');
    
    if (error) {
        logError('DB ERROR', `Fetching topics for ${subjectKey} failed`, error.message);
        return res.status(500).json({ message: 'Could not fetch topics for this subject.' });
    }
    res.json(data);
});

module.exports = router;