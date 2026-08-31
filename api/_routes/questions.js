// api/routes/questions.js
/**
 * Question Routes
 *
 * Handles question data retrieval from Turso database.
 * Supports fetching questions by topic ID or by specific question IDs.
 * All routes use database transactions for data consistency.
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

/**
 * GET /api/questions
 *
 * Retrieves questions by topic ID or by specific question IDs.
 * Requires either 'topicId' or 'ids' query parameter.
 * Returns array of question objects with parsed options.
 *
 * @query {string} [topicId] - Topic ID to fetch questions for
 * @query {string} [ids] - Comma-separated list of question IDs to fetch
 */
router.get('/', asyncHandler(async (req, res) => {
    const { topicId, ids } = req.query;

    if (!topicId && !ids) {
        res.status(400).json({ message: 'A topicId or a list of ids is required.' });
        return;
    }

    const tx = await turso.transaction("read");
    try {
        let result = { rows: [] };

        // Fetch questions by specific IDs if provided, otherwise fetch by topicId
        if (ids) {
            const idArray = ids.split(',').map(s => s.trim()).filter(Boolean);
            if (idArray.length === 0) {
                await tx.commit();
                return res.json([]);
            }
            logApi('GET', '/api/questions', `Fetching ${idArray.length} specific questions`);

            const placeholders = idArray.map(() => '?').join(',');
            result = await tx.execute({
                sql: `SELECT * FROM questions WHERE id IN (${placeholders})`,
                args: idArray
            });
        } else if (topicId) {
            logApi('GET', '/api/questions', `Topic: ${topicId}`);
            result = await tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ?",
                args: [topicId]
            });
        }

        await tx.commit();
        const parsedRows = result.rows.map((row) => ({
            ...row,
            options: JSON.parse(row.options || '[]')
        }));
        res.json(parsedRows);
    } catch (e) {
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', `Fetching questions failed`, e.message);
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
}));

module.exports = router;
