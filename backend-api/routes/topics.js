// api/routes/topics.js
/**
 * Topic Routes
 * 
 * Handles topic data retrieval from Turso database.
 * Supports fetching all topics or topics filtered by subject.
 * All routes use database transactions for data consistency.
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

/**
 * GET /api/topics
 * 
 * Retrieves all topics from the database.
 * Returns array of all topic objects.
 */
router.get('/', async (req, res) => {
    logApi('GET', '/api/topics (all)');
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute("SELECT * FROM quiz_topics");
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching all topics failed', e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

/**
 * GET /api/topics/:subjectKey
 * 
 * Retrieves all topics for a specific subject by subject key.
 * Returns 404 if subject is not found.
 * 
 * @param {string} subjectKey - Subject key identifier (e.g., 'physics', 'chemistry')
 */
router.get('/:subjectKey', async (req, res) => {
    const { subjectKey } = req.params;
    logApi('GET', `/api/topics/${subjectKey}`);
    const tx = await turso.transaction("read");
    try {
        const subjectResult = await tx.execute({
            sql: "SELECT id FROM subjects WHERE subjectKey = ?",
            args: [subjectKey]
        });

        if (subjectResult.rows.length === 0) {
            await tx.rollback(); // Must close the transaction before exiting
            return res.status(404).json({ message: `Subject '${subjectKey}' not found` });
        }
        const subjectId = subjectResult.rows[0].id;

        const topicsResult = await tx.execute({
            sql: "SELECT * FROM quiz_topics WHERE subject_id = ? ORDER BY name",
            args: [subjectId]
        });
        
        await tx.commit();
        res.json(topicsResult.rows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Fetching topics for ${subjectKey} failed`, e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

// --- END OF FIX ---

module.exports = router;