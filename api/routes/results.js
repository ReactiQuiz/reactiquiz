// api/routes/results.js
const { Router } = require('express');
const { supabase } = require('../_utils/supabaseClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

// Route to fetch questions for a specific topicId
router.get('/', async (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz results API is healthy.' });
});

module.exports = router;