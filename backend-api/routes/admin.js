// api/routes/admin.js
/**
 * Admin Routes
 * 
 * Handles admin-only operations including user management, content management,
 * and system statistics. All routes require authentication and admin privileges.
 * Uses Turso database for data operations.
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth');
const { body, validationResult } = require('express-validator');

const router = Router();

/**
 * Verify Admin Middleware
 * 
 * Verifies that the authenticated user has admin privileges by checking
 * against ADMIN_USER_ID environment variable.
 * 
 * @param {Object} req - Express request object (must have req.user from verifyToken)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyAdmin = (req, res, next) => {
    const adminId = process.env.ADMIN_USER_ID;

    if (!adminId) {
        logError('FATAL', 'ADMIN_USER_ID is not configured on the server.');
        res.status(500).json({ message: 'Admin access is not configured.' });
        return;
    }

    if (req.user.id !== adminId) {
        logApi('FORBIDDEN', req.path, `User ${req.user.username} is not admin.`);
        res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
        return;
    }
    
    next();
};

// Apply authentication and admin verification to all routes
router.use(verifyToken, verifyAdmin);

/**
 * Route Handlers
 * 
 * All routes require authentication and admin privileges.
 */

/**
 * GET /api/admin/status
 * 
 * Retrieves system statistics including user count, topic count, and question count.
 * Returns aggregated counts from the database.
 */
router.get('/status', async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        const [usersResult, topicsResult, questionsResult] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
        ]);

        await tx.commit();

        res.json({
            userCount: usersResult.rows[0].total || 0,
            topicCount: topicsResult.rows[0].total || 0,
            questionCount: questionsResult.rows[0].total || 0,
        });

    } catch (e) {
        // --- START OF FIX 1 ---
        // Removed the check for tx.isClosed()
        if (tx) {
            await tx.rollback();
        }
        // --- END OF FIX 1 ---
        logError('DB ERROR', 'Fetching admin status failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
});

/**
 * GET /api/admin/users
 * 
 * Retrieves all users from the database.
 * Returns user list ordered by username alphabetically.
 */
router.get('/users', async (req, res) => {
    logApi('GET', '/api/admin/users', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // --- START OF THE DEFINITIVE FIX ---
        // Removed `created_at` from the SELECT statement and the ORDER BY clause.
        // We will order by username alphabetically instead, which is a sensible default.
        const usersResult = await tx.execute(
            "SELECT id, username, email, phone, address, class FROM users ORDER BY username ASC"
        );
        // --- END OF THE DEFINITIVE FIX ---
        
        await tx.commit();

        res.json(usersResult.rows);

    } catch (e) {
        if (tx) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching all users failed', e.message);
        res.status(500).json({ message: 'Could not fetch user list.' });
    }
});

/**
 * GET /api/admin/overview-stats
 * 
 * Retrieves aggregated statistics for the content overview dashboard.
 * Returns total counts for subjects, topics, and questions, plus breakdown by subject.
 * Includes subject colors and counts for each subject.
 */
router.get('/overview-stats', async (req, res) => {
    logApi('GET', '/api/admin/overview-stats', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const [subjectsResult, topicsBySubjectResult, questionsBySubjectResult] = await Promise.all([
            tx.execute("SELECT id, name, subjectKey, accentColorDark FROM subjects ORDER BY displayOrder"),
            tx.execute(`
                SELECT s.subjectKey, COUNT(t.id) as count
                FROM subjects s
                LEFT JOIN quiz_topics t ON s.id = t.subject_id
                GROUP BY s.subjectKey
            `),
            tx.execute(`
                SELECT s.subjectKey, COUNT(q.id) as count
                FROM subjects s
                LEFT JOIN quiz_topics t ON s.id = t.subject_id
                LEFT JOIN questions q ON t.id = q.topicId
                GROUP BY s.subjectKey
            `)
        ]);

        await tx.commit();

        const topicsMap = new Map(topicsBySubjectResult.rows.map((r) => [r.subjectKey, r.count]));
        const questionsMap = new Map(questionsBySubjectResult.rows.map((r) => [r.subjectKey, r.count]));

        const subjectBreakdown = subjectsResult.rows.map((subject) => ({
            name: subject.name,
            subjectKey: subject.subjectKey,
            color: subject.accentColorDark,
            topicCount: topicsMap.get(subject.subjectKey) || 0,
            questionCount: questionsMap.get(subject.subjectKey) || 0,
        }));

        const totalTopics = Array.from(topicsMap.values()).reduce((sum, count) => sum + count, 0);
        const totalQuestions = Array.from(questionsMap.values()).reduce((sum, count) => sum + count, 0);

        res.json({
            totalSubjects: subjectsResult.rows.length,
            totalTopics,
            totalQuestions,
            subjectBreakdown
        });

    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching admin overview stats failed', e.message);
        res.status(500).json({ message: 'Could not fetch overview stats.' });
    }
});

/**
 * GET /api/admin/subjects
 * 
 * Retrieves all subjects for the admin panel.
 * Returns subjects ordered by displayOrder.
 */
router.get('/subjects', async (req, res) => {
    logApi('GET', '/api/admin/subjects', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const result = await tx.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching subjects for admin failed', e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});

/**
 * POST /api/admin/subjects
 * 
 * Creates a new subject with name, subjectKey, displayOrder, and optional fields.
 * Validates required fields and returns 409 if subject ID or key already exists.
 */
router.post('/subjects', 
    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('subjectKey').notEmpty().withMessage('Subject Key is required.'),
        body('displayOrder').isInt({ min: 1 }).withMessage('Display Order must be a positive number.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }
        
        logApi('POST', '/api/admin/subjects', `Admin: ${req.user.username}`);
        const { name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight } = req.body;
        const tx = await turso.transaction('write');
        try {
            // --- START OF THE DEFINITIVE FIX ---
            // We now explicitly include the `id` column in the INSERT statement
            // and use the `subjectKey` as its value.
            await tx.execute({
                sql: `INSERT INTO subjects (id, name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                args: [subjectKey, name, subjectKey, description || '', displayOrder, iconName || 'DefaultIcon', accentColorDark || '#FFFFFF', accentColorLight || '#000000']
            });
            // --- END OF THE DEFINITIVE FIX ---

            await tx.commit();
            res.status(201).json({ message: 'Subject created successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating subject failed', e.message);
            // Add a more specific error message for UNIQUE constraint violation
            if (e.message.includes('UNIQUE constraint failed: subjects.id') || e.message.includes('UNIQUE constraint failed: subjects.subjectKey')) {
                res.status(409).json({ message: 'A subject with this ID or Subject Key already exists.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create subject.' });
        }
    }
);

/**
 * PUT /api/admin/subjects/:id
 * 
 * Updates an existing subject by ID.
 * Validates required fields and returns 404 if subject not found.
 * 
 * @param {string} id - Subject ID to update
 */
router.put('/subjects/:id',
    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('subjectKey').notEmpty().withMessage('Subject Key is required.'),
        body('displayOrder').isInt({ min: 1 }).withMessage('Display Order must be a positive number.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id } = req.params;
        logApi('PUT', `/api/admin/subjects/${id}`, `Admin: ${req.user.username}`);
        const { name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight } = req.body;
        const tx = await turso.transaction('write');
        try {
            const result = await tx.execute({
                sql: `UPDATE subjects SET name = ?, subjectKey = ?, description = ?, displayOrder = ?, iconName = ?, accentColorDark = ?, accentColorLight = ?
                      WHERE id = ?;`,
                args: [name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight, id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Subject not found.' });
                 return;
            }

            await tx.commit();
            res.status(200).json({ message: 'Subject updated successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating subject ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update subject.' });
        }
    }
);

/**
 * DELETE /api/admin/subjects/:id
 * 
 * Deletes a subject by ID.
 * Returns 404 if subject not found.
 * Note: In production, should check for linked topics before deletion.
 * 
 * @param {string} id - Subject ID to delete
 */
router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/subjects/${id}`, `Admin: ${req.user.username}`);
    const tx = await turso.transaction('write');
    try {
        // TODO: In a real app, you must first check if any topics are linked to this subject.
        // If so, you should either prevent deletion or handle orphaned topics.
        const result = await tx.execute({
            sql: "DELETE FROM subjects WHERE id = ?;",
            args: [id]
        });

        if (result.rowsAffected === 0) {
            await tx.rollback();
            res.status(404).json({ message: 'Subject not found.' });
            return;
        }
        
        await tx.commit();
        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Deleting subject ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to delete subject.' });
    }
});

/**
 * GET /api/admin/topics
 * 
 * Retrieves all topics for the admin panel, joined with subject names.
 * Returns topics ordered by subject name and topic name.
 */
router.get('/topics', async (req, res) => {
    logApi('GET', '/api/admin/topics', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const result = await tx.execute({
            sql: `SELECT t.*, s.name as subjectName FROM quiz_topics t
                  LEFT JOIN subjects s ON t.subject_id = s.id
                  ORDER BY s.name, t.name ASC`,
            args: []
        });
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching topics for admin failed', e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

/**
 * POST /api/admin/topics
 * 
 * Creates a new topic with name, ID (slug), subject_id, class, genre, and optional description.
 * Validates required fields and returns 409 if topic ID already exists.
 */
router.post('/topics', 
    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('id').notEmpty().withMessage('ID (slug) is required.'),
        body('subject_id').notEmpty().withMessage('Subject is required.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array()[0].msg });
            return;
        }
        
        logApi('POST', '/api/admin/topics', `Admin: ${req.user.username}`);
        const { id, name, description, class: topicClass, genre, subject_id } = req.body;
        const tx = await turso.transaction('write');
        try {
            await tx.execute({
                sql: `INSERT INTO quiz_topics (id, name, description, class, genre, subject_id) 
                      VALUES (?, ?, ?, ?, ?, ?);`,
                args: [id, name, description || '', topicClass || '', genre || '', subject_id]
            });
            await tx.commit();
            res.status(201).json({ message: 'Topic created successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating topic failed', e.message);
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ message: 'A topic with this ID already exists.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create topic.' });
        }
    }
);

/**
 * PUT /api/admin/topics/:id
 * 
 * Updates an existing topic by ID.
 * Validates required fields and returns 404 if topic not found.
 * 
 * @param {string} id - Topic ID to update
 */
router.put('/topics/:id',
    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('subject_id').notEmpty().withMessage('Subject is required.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id } = req.params;
        logApi('PUT', `/api/admin/topics/${id}`, `Admin: ${req.user.username}`);
        const { name, description, class: topicClass, genre, subject_id } = req.body;
        const tx = await turso.transaction('write');
        try {
            const result = await tx.execute({
                sql: `UPDATE quiz_topics SET name = ?, description = ?, class = ?, genre = ?, subject_id = ?
                      WHERE id = ?;`,
                args: [name, description, topicClass, genre, subject_id, id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Topic not found.' });
                 return;
            }

            await tx.commit();
            res.status(200).json({ message: 'Topic updated successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating topic ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update topic.' });
        }
    }
);

/**
 * DELETE /api/admin/topics/:id
 * 
 * Deletes a topic by ID.
 * Returns 404 if topic not found.
 * Note: In production, should handle associated questions before deletion.
 * 
 * @param {string} id - Topic ID to delete
 */
router.delete('/topics/:id', async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/topics/${id}`, `Admin: ${req.user.username}`);
    const tx = await turso.transaction('write');
    try {
        // In a real app, you might also want to delete all questions associated with this topic.
        // For now, we will just delete the topic itself.
        const result = await tx.execute({
            sql: "DELETE FROM quiz_topics WHERE id = ?;",
            args: [id]
        });

        if (result.rowsAffected === 0) {
            await tx.rollback();
            res.status(404).json({ message: 'Topic not found.' });
            return;
        }

        await tx.commit();
        res.status(200).json({ message: 'Topic deleted successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Deleting topic ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to delete topic.' });
    }
});

/**
 * GET /api/admin/topics/summary
 * 
 * Retrieves all topics with question counts and difficulty breakdown.
 * Returns topics with total question count and counts by difficulty (easy, medium, hard).
 */
router.get('/topics/summary', async (req, res) => {
    logApi('GET', '/api/admin/topics/summary', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const result = await tx.execute(`
            SELECT 
                t.id, 
                t.name,
                s.name as subjectName,
                t.class,
                t.genre,
                COUNT(q.id) as questionCount,
                SUM(CASE WHEN q.difficulty BETWEEN 10 AND 13 THEN 1 ELSE 0 END) as easyCount,
                SUM(CASE WHEN q.difficulty BETWEEN 14 AND 17 THEN 1 ELSE 0 END) as mediumCount,
                SUM(CASE WHEN q.difficulty >= 18 THEN 1 ELSE 0 END) as hardCount
            FROM quiz_topics t
            LEFT JOIN questions q ON t.id = q.topicId
            LEFT JOIN subjects s ON t.subject_id = s.id
            GROUP BY t.id
            ORDER BY s.name, t.name ASC;
        `);
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching topics summary failed', e.message);
        res.status(500).json({ message: 'Could not fetch topics summary.' });
    }
});

/**
 * GET /api/admin/questions-by-topic
 * 
 * Retrieves a paginated list of questions for a specific topic.
 * Supports pagination with page and limit query parameters.
 * 
 * @query {string} topicId - Topic ID to fetch questions for (required)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of questions per page
 */
router.get('/questions-by-topic', async (req, res) => {
    const { topicId, page = 1, limit = 10 } = req.query;
    if (!topicId) {
        res.status(400).json({ message: 'A topicId is required.' });
        return;
    }

    const tx = await turso.transaction('read');
    try {
        const offset = (page - 1) * limit;
        const [questionsRes, totalRes] = await Promise.all([
            tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ? ORDER BY id ASC LIMIT ? OFFSET ?",
                args: [topicId, limit, offset]
            }),
            tx.execute({
                sql: "SELECT COUNT(*) as total FROM questions WHERE topicId = ?",
                args: [topicId]
            })
        ]);
        await tx.commit();
        res.json({
            questions: questionsRes.rows,
            total: totalRes.rows[0].total
        });
    } catch (e) {
        if (tx) await tx.rollback();
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});

/**
 * POST /api/admin/questions/batch-import
 * 
 * Imports an array of questions from JSON in a single batch operation.
 * Uses database batch operations for efficiency.
 * Validates that request body is a non-empty array.
 */
router.post('/questions/batch-import', async (req, res) => {
    const questions = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ message: 'Request body must be a non-empty array of questions.' });
        return;
    }

    const tx = await turso.transaction('write');
    try {
        const statements = questions.map(q => ({
            sql: 'INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?);',
            args: [q.id, q.topicId, q.text, JSON.stringify(q.options), q.correctOptionId, q.explanation || '', q.difficulty]
        }));

        await tx.batch(statements);
        await tx.commit();
        res.status(201).json({ message: `Successfully imported ${questions.length} questions.` });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Batch import failed', e.message);
        res.status(500).json({ message: `Failed to import questions: ${e.message}` });
    }
});

/**
 * POST /api/admin/questions
 * 
 * Creates a single new question with ID, topicId, text, options, correctOptionId, and difficulty.
 * Validates required fields including options array (must be 4 items) and correctOptionId.
 * Returns 409 if question ID already exists.
 */
router.post('/questions',
    [
        body('id').notEmpty().withMessage('ID is required.'),
        body('topicId').notEmpty().withMessage('Topic ID is required.'),
        body('text').notEmpty().withMessage('Question text is required.'),
        body('options').isArray({ min: 4, max: 4 }).withMessage('Options must be an array of 4 objects.'),
        body('correctOptionId').isIn(['a', 'b', 'c', 'd']).withMessage('Correct Option ID must be a, b, c, or d.'),
        body('difficulty').isInt({ min: 10, max: 20 }).withMessage('Difficulty must be a number between 10 and 20.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }
        
        const { id, topicId, text, options, correctOptionId, explanation, difficulty } = req.body;
        const tx = await turso.transaction('write');
        try {
            await tx.execute({
                sql: `INSERT INTO questions (id, topicId, text, options, correctOptionId, explanation, difficulty) 
                      VALUES (?, ?, ?, ?, ?, ?, ?);`,
                args: [id, topicId, text, JSON.stringify(options), correctOptionId, explanation || '', difficulty]
            });
            await tx.commit();
            res.status(201).json({ message: 'Question created successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating question failed', e.message);
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ message: 'A question with this ID already exists.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create question.' });
        }
    }
);

/**
 * PUT /api/admin/questions/:id
 * 
 * Updates an existing question by ID.
 * Validates required fields and returns 404 if question not found.
 * 
 * @param {string} id - Question ID to update
 */
router.put('/questions/:id',
    [
        body('text').notEmpty().withMessage('Question text is required.'),
        body('options').isArray({ min: 4, max: 4 }).withMessage('Options must be an array of 4 objects.'),
        body('correctOptionId').isIn(['a', 'b', 'c', 'd']).withMessage('Correct Option ID must be a, b, c, or d.'),
        body('difficulty').isInt({ min: 10, max: 20 }).withMessage('Difficulty must be a number between 10 and 20.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id } = req.params;
        const { text, options, correctOptionId, explanation, difficulty } = req.body;
        const tx = await turso.transaction('write');
        try {
            const result = await tx.execute({
                sql: `UPDATE questions SET text = ?, options = ?, correctOptionId = ?, explanation = ?, difficulty = ?
                      WHERE id = ?;`,
                args: [text, JSON.stringify(options), correctOptionId, explanation || '', difficulty, id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Question not found.' });
                 return;
            }

            await tx.commit();
            res.status(200).json({ message: 'Question updated successfully.' });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating question ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update question.' });
        }
    }
);

/**
 * DELETE /api/admin/questions/:id
 * 
 * Deletes a question by ID.
 * Returns 404 if question not found.
 * 
 * @param {string} id - Question ID to delete
 */
router.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const tx = await turso.transaction('write');
    try {
        const result = await tx.execute({
            sql: "DELETE FROM questions WHERE id = ?;",
            args: [id]
        });

        if (result.rowsAffected === 0) {
            await tx.rollback();
            res.status(404).json({ message: 'Question not found.' });
            return;
        }
        
        await tx.commit();
        res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Deleting question ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to delete question.' });
    }
});

module.exports = router;