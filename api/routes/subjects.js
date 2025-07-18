// api/routes/subjects.js
import { Router } from 'express';
import { supabase } from '../_utils/supabaseClient.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

// Fetch all subjects, ordered by displayOrder
router.get('/', async (req, res) => {
    logApi('GET', '/api/subjects');

    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('displayOrder', { ascending: true });

    if (error) {
        logError('DB ERROR', 'Fetching subjects failed', error.message);
        return res.status(500).json({ message: 'Could not fetch subjects.' });
    }

    res.json(data || []);
});

module.exports = router;