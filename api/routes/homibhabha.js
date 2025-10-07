const { Router } = require('express');
const { logApi } = require('../_utils/logger');

const router = Router();

// Placeholder route - implement Homi Bhabha specific functionality as needed
router.get('/info', async (req, res) => {
    logApi('GET', '/api/homibhabha/info');
    res.json({ message: 'Homi Bhabha exam information endpoint.' });
});

module.exports = router;
