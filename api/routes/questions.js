// api/routes/questions.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.get('/', async (req, res) => {
    const { topicId, ids } = req.query; // Now accepts 'ids' as well

    if (!topicId && !ids) {
        return res.status(400).json({ message: 'A topicId or a list of ids is required.' });
    }
    
    const tx = await turso.transaction("read");
    try {
        let result;
        
        // --- START OF THE DEFINITIVE FIX ---
        // Prioritize fetching by specific IDs if they are provided.
        if (ids) {
            const idArray = ids.split(',');
            if (idArray.length === 0) {
                return res.json([]); // Return empty if no IDs are provided
            }
            logApi('GET', '/api/questions', `Fetching ${idArray.length} specific questions`);

            // Create the correct number of placeholders for the SQL query
            const placeholders = idArray.map(() => '?').join(',');
            
            result = await tx.execute({
                sql: `SELECT * FROM questions WHERE id IN (${placeholders})`,
                args: idArray
            });

        } else if (topicId) {
            // Fallback to the original logic if only a topicId is provided
            logApi('GET', '/api/questions', `Topic: ${topicId}`);
            result = await tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ?",
                args: [topicId]
            });
        }
        // --- END OF THE DEFINITIVE FIX ---

        await tx.commit();
        const parsedRows = result.rows.map(row => ({
            ...row,
            options: JSON.parse(row.options || '[]')
        }));
        res.json(parsedRows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Fetching questions failed`, e.message);
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});

module.exports = router;