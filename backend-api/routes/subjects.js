// api/routes/subjects.js
/**
 * Subject Routes
 * 
 * Handles subject/category data retrieval from Turso database.
 * All routes use database transactions for data consistency.
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

/**
 * GET /api/subjects
 * 
 * Retrieves all subjects ordered by displayOrder.
 * Returns array of subject objects.
 */
router.get('/', async (req, res) => {
    logApi('GET', '/api/subjects');
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching subjects failed', e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});
// --- END OF FIX ---

module.exports = router;