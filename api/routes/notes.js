// api/routes/notes.js
/**
 * Notes Routes
 * 
 * Handles public retrieval of study notes by topic ID.
 * Returns the note content in Markdown format along with topic and subject metadata
 * (including subject accent colors for dynamic frontend styling).
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

/**
 * GET /api/notes/topic/:topicId
 * 
 * Retrieves the comprehensive note document for a specific topic ID.
 * Joins topic and subject metadata for dynamic color inheritance and breadcrumb info.
 * 
 * @param {string} topicId - The ID of the topic (e.g. 'motion-9th')
 * @returns {Object} 200 - The note object with topic & subject metadata
 * @returns {Object} 404 - If no note is found for the topic
 */
router.get('/topic/:topicId', asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    logApi('GET', `/api/notes/topic/${topicId}`);

    const tx = await turso.transaction('read');
    try {
        const query = `
            SELECT 
                n.id,
                n.topicId,
                n.title,
                n.content,
                n.summary,
                n.readTimeMinutes,
                n.createdAt,
                n.updatedAt,
                t.name AS topicName,
                t.description AS topicDescription,
                t.class AS topicClass,
                t.genre AS topicGenre,
                t.subject_id,
                s.name AS subjectName,
                s.subjectKey,
                s.accentColorDark,
                s.accentColorLight
            FROM topic_notes n
            JOIN quiz_topics t ON n.topicId = t.id
            LEFT JOIN subjects s ON t.subject_id = s.id
            WHERE n.topicId = ?
            LIMIT 1;
        `;

        const result = await tx.execute({
            sql: query,
            args: [topicId]
        });

        await tx.commit();

        if (result.rows.length === 0) {
            res.status(404).json({ message: `No notes found for topic '${topicId}'.` });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Fetching note for topic ${topicId} failed`, e.message);
        res.status(500).json({ message: 'Failed to fetch topic note.' });
    }
}));

/**
 * GET /api/notes/:id
 * 
 * Retrieves a single note document by note ID.
 * 
 * @param {string} id - The ID of the note
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    logApi('GET', `/api/notes/${id}`);

    const tx = await turso.transaction('read');
    try {
        const query = `
            SELECT 
                n.id,
                n.topicId,
                n.title,
                n.content,
                n.summary,
                n.readTimeMinutes,
                n.createdAt,
                n.updatedAt,
                t.name AS topicName,
                t.subject_id,
                s.name AS subjectName,
                s.subjectKey,
                s.accentColorDark,
                s.accentColorLight
            FROM topic_notes n
            JOIN quiz_topics t ON n.topicId = t.id
            LEFT JOIN subjects s ON t.subject_id = s.id
            WHERE n.id = ?
            LIMIT 1;
        `;

        const result = await tx.execute({
            sql: query,
            args: [id]
        });

        await tx.commit();

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Note not found.' });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Fetching note ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to fetch note.' });
    }
}));

module.exports = router;
