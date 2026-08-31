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
const { verifyAdmin } = require('../_middleware/adminAuth');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

// Admin check (isAdmin flag, with ADMIN_USER_ID as a bootstrap fallback) is
// centralized in _middleware/adminAuth.js so the API and the frontend's
// AdminRoute.tsx gate can never disagree about who's an admin.
// verifyAdmin verifies the JWT itself, so no separate verifyToken call here.
router.use(verifyAdmin);

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
router.get('/status', asyncHandler(async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        const [usersResult, topicsResult, questionsResult, notesResult] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
            tx.execute("SELECT count(*) as total FROM topic_notes"),
        ]);

        await tx.commit();

        res.json({
            userCount: usersResult.rows[0]?.total || 0,
            topicCount: topicsResult.rows[0]?.total || 0,
            questionCount: questionsResult.rows[0]?.total || 0,
            noteCount: notesResult.rows[0]?.total || 0,
        });

    } catch (e) {
        if (tx && !tx.closed) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching admin status failed', e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
}));

/**
 * GET /api/admin/users
 * 
 * Retrieves all users from the database.
 * Returns user list ordered by username alphabetically.
 */
router.get('/users', asyncHandler(async (req, res) => {
    logApi('GET', '/api/admin/users', `Admin: ${req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        // Retrieve user list ordered alphabetically by username
        const usersResult = await tx.execute(
            "SELECT id, username, email, phone, address, class, isAdmin FROM users ORDER BY username ASC"
        );
        
        await tx.commit();

        res.json(usersResult.rows);

    } catch (e) {
        if (tx) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching all users failed', e.message);
        res.status(500).json({ message: 'Could not fetch user list.' });
    }
}));

/**
 * GET /api/admin/overview-stats
 * 
 * Retrieves aggregated statistics for the content overview dashboard.
 * Returns total counts for subjects, topics, questions, and notes, plus breakdown by subject.
 * Includes subject colors and counts for each subject.
 */
router.get('/overview-stats', asyncHandler(async (req, res) => {
    logApi('GET', '/api/admin/overview-stats', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const [subjectsResult, topicsBySubjectResult, questionsBySubjectResult, notesBySubjectResult] = await Promise.all([
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
            `),
            tx.execute(`
                SELECT s.subjectKey, COUNT(n.id) as count
                FROM subjects s
                LEFT JOIN quiz_topics t ON s.id = t.subject_id
                LEFT JOIN topic_notes n ON t.id = n.topicId
                GROUP BY s.subjectKey
            `)
        ]);

        await tx.commit();

        const topicsMap = new Map(topicsBySubjectResult.rows.map((r) => [r.subjectKey, r.count]));
        const questionsMap = new Map(questionsBySubjectResult.rows.map((r) => [r.subjectKey, r.count]));
        const notesMap = new Map(notesBySubjectResult.rows.map((r) => [r.subjectKey, r.count]));

        const subjectBreakdown = subjectsResult.rows.map((subject) => ({
            name: subject.name,
            subjectKey: subject.subjectKey,
            color: subject.accentColorDark,
            topicCount: topicsMap.get(subject.subjectKey) || 0,
            questionCount: questionsMap.get(subject.subjectKey) || 0,
            noteCount: notesMap.get(subject.subjectKey) || 0,
        }));

        const totalTopics = Array.from(topicsMap.values()).reduce((sum, count) => sum + count, 0);
        const totalQuestions = Array.from(questionsMap.values()).reduce((sum, count) => sum + count, 0);
        const totalNotes = Array.from(notesMap.values()).reduce((sum, count) => sum + count, 0);

        res.json({
            totalSubjects: subjectsResult.rows.length,
            totalTopics,
            totalQuestions,
            totalNotes,
            subjectBreakdown
        });

    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching admin overview stats failed', e.message);
        res.status(500).json({ message: 'Could not fetch overview stats.' });
    }
}));

/**
 * GET /api/admin/subjects
 * 
 * Retrieves all subjects for the admin panel.
 * Returns subjects ordered by displayOrder.
 */
router.get('/subjects', asyncHandler(async (req, res) => {
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
}));

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
    asyncHandler(async (req, res) => {
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
            // Insert new subject using subjectKey as the primary identifier
            await tx.execute({
                sql: `INSERT INTO subjects (id, name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                args: [subjectKey, name, subjectKey, description || '', displayOrder, iconName || 'DefaultIcon', accentColorDark || '#FFFFFF', accentColorLight || '#000000']
            });

            await tx.commit();
            const createdSubject = {
                id: subjectKey,
                name,
                subjectKey,
                description: description || '',
                displayOrder: parseInt(displayOrder, 10),
                iconName: iconName || 'DefaultIcon',
                accentColorDark: accentColorDark || '#FFFFFF',
                accentColorLight: accentColorLight || '#000000'
            };
            res.status(201).json({ message: 'Subject created successfully.', subject: createdSubject });
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
    })
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
    asyncHandler(async (req, res) => {
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
                args: [name, subjectKey, description || '', parseInt(displayOrder, 10), iconName || 'DefaultIcon', accentColorDark || '#FFFFFF', accentColorLight || '#000000', id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Subject not found.' });
                 return;
            }

            await tx.commit();
            const updatedSubject = {
                id,
                name,
                subjectKey,
                description: description || '',
                displayOrder: parseInt(displayOrder, 10),
                iconName: iconName || 'DefaultIcon',
                accentColorDark: accentColorDark || '#FFFFFF',
                accentColorLight: accentColorLight || '#000000'
            };
            res.status(200).json({ message: 'Subject updated successfully.', subject: updatedSubject });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating subject ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update subject.' });
        }
    })
);

/**
 * DELETE /api/admin/subjects/:id
 * 
 * Deletes a subject by ID.
 * Validates that no child topics are linked before deletion to prevent orphaned records.
 * Returns 404 if subject not found, 400 if child topics exist.
 * 
 * @param {string} id - Subject ID to delete
 */
router.delete('/subjects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/subjects/${id}`, `Admin: ${req.user.username}`);
    const tx = await turso.transaction('write');
    try {
        // Prevent orphaned topic records
        const checkTopics = await tx.execute({
            sql: "SELECT COUNT(*) as total FROM quiz_topics WHERE subject_id = ?;",
            args: [id]
        });
        const topicCount = checkTopics.rows[0]?.total || 0;
        if (topicCount > 0) {
            await tx.rollback();
            return res.status(400).json({
                message: `Cannot delete subject '${id}': ${topicCount} topic(s) are linked to it. Please reassign or delete the topics first.`
            });
        }

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
}));

/**
 * POST /api/admin/subjects/batch-import
 * 
 * Imports or updates an array of subjects from JSON in a single batch operation.
 */
router.post('/subjects/batch-import', asyncHandler(async (req, res) => {
    const subjects = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
        res.status(400).json({ message: 'Request body must be a non-empty array of subjects.' });
        return;
    }

    const tx = await turso.transaction('write');
    try {
        const statements = subjects.map((s, idx) => {
            const key = s.subjectKey || s.id || s.name.toLowerCase().replace(/\s+/g, '-');
            return {
                sql: `INSERT INTO subjects (id, name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(id) DO UPDATE SET
                      name=excluded.name, subjectKey=excluded.subjectKey, description=excluded.description, displayOrder=excluded.displayOrder,
                      iconName=excluded.iconName, accentColorDark=excluded.accentColorDark, accentColorLight=excluded.accentColorLight;`,
                args: [
                    key,
                    s.name,
                    key,
                    s.description || '',
                    s.displayOrder || idx + 1,
                    s.iconName || 'DefaultIcon',
                    s.accentColorDark || '#FFFFFF',
                    s.accentColorLight || '#000000'
                ]
            };
        });

        await tx.batch(statements);
        await tx.commit();
        res.status(201).json({ message: `Successfully imported ${subjects.length} subjects.` });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Batch import subjects failed', e.message);
        res.status(500).json({ message: `Failed to import subjects: ${e.message}` });
    }
}));

/**
 * POST /api/admin/topics/batch-import
 * 
 * Imports or updates an array of topics from JSON in a single batch operation.
 */
router.post('/topics/batch-import', asyncHandler(async (req, res) => {
    const topics = req.body;
    if (!Array.isArray(topics) || topics.length === 0) {
        res.status(400).json({ message: 'Request body must be a non-empty array of topics.' });
        return;
    }

    const tx = await turso.transaction('write');
    try {
        const statements = topics.map(t => ({
            sql: `INSERT INTO quiz_topics (id, name, description, class, genre, subject_id)
                  VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                  name=excluded.name, description=excluded.description, class=excluded.class, genre=excluded.genre, subject_id=excluded.subject_id;`,
            args: [t.id, t.name, t.description || '', t.class || '', t.genre || '', t.subject_id]
        }));

        await tx.batch(statements);
        await tx.commit();
        res.status(201).json({ message: `Successfully imported ${topics.length} topics.` });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Batch import topics failed', e.message);
        res.status(500).json({ message: `Failed to import topics: ${e.message}` });
    }
}));

/**
 * GET /api/admin/topics
 * 
 * Retrieves all topics for the admin panel, joined with subject names.
 * Returns topics ordered by subject name and topic name.
 */
router.get('/topics', asyncHandler(async (req, res) => {
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
}));

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
    asyncHandler(async (req, res) => {
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
            const createdTopic = {
                id,
                name,
                description: description || '',
                class: topicClass || '',
                genre: genre || '',
                subject_id
            };
            res.status(201).json({ message: 'Topic created successfully.', topic: createdTopic });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating topic failed', e.message);
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ message: 'A topic with this ID already exists.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create topic.' });
        }
    })
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
    asyncHandler(async (req, res) => {
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
                args: [name, description || '', topicClass || '', genre || '', subject_id, id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Topic not found.' });
                 return;
            }

            await tx.commit();
            const updatedTopic = {
                id,
                name,
                description: description || '',
                class: topicClass || '',
                genre: genre || '',
                subject_id
            };
            res.status(200).json({ message: 'Topic updated successfully.', topic: updatedTopic });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating topic ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update topic.' });
        }
    })
);

/**
 * DELETE /api/admin/topics/:id
 * 
 * Deletes a topic by ID.
 * Validates that no child questions are linked before deletion to prevent orphaned records.
 * Returns 404 if topic not found, 400 if child questions exist.
 * 
 * @param {string} id - Topic ID to delete
 */
router.delete('/topics/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/topics/${id}`, `Admin: ${req.user.username}`);
    const tx = await turso.transaction('write');
    try {
        // Prevent orphaned question records
        const checkQuestions = await tx.execute({
            sql: "SELECT COUNT(*) as total FROM questions WHERE topicId = ?;",
            args: [id]
        });
        const questionCount = checkQuestions.rows[0]?.total || 0;
        if (questionCount > 0) {
            await tx.rollback();
            return res.status(400).json({
                message: `Cannot delete topic '${id}': ${questionCount} question(s) are linked to it. Please reassign or delete the questions first.`
            });
        }

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
}));

/**
 * GET /api/admin/topics/summary
 * 
 * Retrieves all topics with question counts and difficulty breakdown.
 * Returns topics with total question count and counts by difficulty (easy, medium, hard).
 */
router.get('/topics/summary', asyncHandler(async (req, res) => {
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
}));

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
router.get('/questions-by-topic', asyncHandler(async (req, res) => {
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
}));

/**
 * POST /api/admin/questions/batch-import
 * 
 * Imports an array of questions from JSON in a single batch operation.
 */
router.post('/questions/batch-import', asyncHandler(async (req, res) => {
    const questions = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ message: 'Request body must be a non-empty array of questions.' });
        return;
    }

    const tx = await turso.transaction('write');
    try {
        const statements = questions.map(q => ({
            sql: 'INSERT OR REPLACE INTO questions (id, topicId, text, options, correctOptionId, explanation) VALUES (?, ?, ?, ?, ?, ?);',
            args: [q.id, q.topicId, q.text, typeof q.options === 'string' ? q.options : JSON.stringify(q.options), q.correctOptionId, q.explanation || '']
        }));

        const BATCH_CHUNK_SIZE = 250;
        for (let i = 0; i < statements.length; i += BATCH_CHUNK_SIZE) {
            const chunk = statements.slice(i, i + BATCH_CHUNK_SIZE);
            await tx.batch(chunk);
        }

        await tx.commit();
        res.status(201).json({ message: `Successfully imported ${questions.length} questions.` });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Batch import failed', e.message);
        res.status(500).json({ message: `Failed to import questions: ${e.message}` });
    }
}));

/**
 * POST /api/admin/questions
 * 
 * Creates a single new question with ID, topicId, text, options, correctOptionId.
 */
router.post('/questions',
    [
        body('id').notEmpty().withMessage('ID is required.'),
        body('topicId').notEmpty().withMessage('Topic ID is required.'),
        body('text').notEmpty().withMessage('Question text is required.'),
        body('options').isArray({ min: 4, max: 4 }).withMessage('Options must be an array of 4 objects.'),
        body('correctOptionId').isIn(['a', 'b', 'c', 'd']).withMessage('Correct Option ID must be a, b, c, or d.'),
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id, topicId, text, options, correctOptionId, explanation } = req.body;
        const tx = await turso.transaction('write');
        try {
            await tx.execute({
                sql: `INSERT INTO questions (id, topicId, text, options, correctOptionId, explanation) 
                      VALUES (?, ?, ?, ?, ?, ?);`,
                args: [id, topicId, text, JSON.stringify(options), correctOptionId, explanation || '']
            });
            await tx.commit();
            const createdQuestion = {
                id,
                topicId,
                text,
                options,
                correctOptionId,
                explanation: explanation || ''
            };
            res.status(201).json({ message: 'Question created successfully.', question: createdQuestion });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating question failed', e.message);
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ message: 'A question with this ID already exists.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create question.' });
        }
    })
);

/**
 * PUT /api/admin/questions/:id
 * 
 * Updates an existing question by ID.
 */
router.put('/questions/:id',
    [
        body('text').notEmpty().withMessage('Question text is required.'),
        body('options').isArray({ min: 4, max: 4 }).withMessage('Options must be an array of 4 objects.'),
        body('correctOptionId').isIn(['a', 'b', 'c', 'd']).withMessage('Correct Option ID must be a, b, c, or d.'),
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id } = req.params;
        const { text, options, correctOptionId, explanation, topicId } = req.body;
        const tx = await turso.transaction('write');
        try {
            const result = await tx.execute({
                sql: `UPDATE questions SET text = ?, options = ?, correctOptionId = ?, explanation = ?
                      WHERE id = ?;`,
                args: [text, JSON.stringify(options), correctOptionId, explanation || '', id]
            });

            if (result.rowsAffected === 0) {
                 await tx.rollback();
                 res.status(404).json({ message: 'Question not found.' });
                 return;
            }

            await tx.commit();
            const updatedQuestion = {
                id,
                topicId,
                text,
                options,
                correctOptionId,
                explanation: explanation || ''
            };
            res.status(200).json({ message: 'Question updated successfully.', question: updatedQuestion });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating question ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update question.' });
        }
    })
);

/**
 * DELETE /api/admin/questions/:id
 * 
 * Deletes a question by ID.
 * Returns 404 if question not found.
 * 
 * @param {string} id - Question ID to delete
 */
router.delete('/questions/:id', asyncHandler(async (req, res) => {
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
}));

/**
 * ============================================================================
 * NOTES MANAGEMENT ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/notes
 * 
 * Retrieves all topic notes joined with topic and subject metadata.
 * Returns notes list ordered by topic name.
 */
router.get('/notes', asyncHandler(async (req, res) => {
    logApi('GET', '/api/admin/notes', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const result = await tx.execute(`
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
            ORDER BY t.name ASC;
        `);
        await tx.commit();
        res.status(200).json(result.rows);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching admin notes failed', e.message);
        res.status(500).json({ message: 'Failed to fetch notes.' });
    }
}));

/**
 * POST /api/admin/notes
 * 
 * Creates a new note for a topic.
 */
router.post('/notes',
    [
        body('topicId').notEmpty().withMessage('Topic ID is required.'),
        body('title').notEmpty().withMessage('Note Title is required.'),
        body('content').notEmpty().withMessage('Note Content (Markdown) is required.'),
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id, topicId, title, content, summary, readTimeMinutes } = req.body;
        const noteId = id || `note-${topicId}`;
        const readTime = parseInt(readTimeMinutes, 10) || 5;

        logApi('POST', '/api/admin/notes', `Admin: ${req.user.username}`);
        const tx = await turso.transaction('write');
        try {
            await tx.execute({
                sql: `INSERT INTO topic_notes (id, topicId, title, content, summary, readTimeMinutes, updatedAt) 
                      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
                args: [noteId, topicId, title, content, summary || '', readTime]
            });
            await tx.commit();

            const createdNote = {
                id: noteId,
                topicId,
                title,
                content,
                summary: summary || '',
                readTimeMinutes: readTime
            };
            res.status(201).json({ message: 'Note created successfully.', note: createdNote });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', 'Creating note failed', e.message);
            if (e.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ message: 'A note already exists for this topic or with this ID.' });
                return;
            }
            res.status(500).json({ message: 'Failed to create note.' });
        }
    })
);

/**
 * PUT /api/admin/notes/:id
 * 
 * Updates an existing note by ID.
 */
router.put('/notes/:id',
    [
        body('title').notEmpty().withMessage('Note Title is required.'),
        body('content').notEmpty().withMessage('Note Content (Markdown) is required.'),
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.status(400).json({ message: firstError ? firstError.msg : 'Validation error.' });
            return;
        }

        const { id } = req.params;
        const { topicId, title, content, summary, readTimeMinutes } = req.body;
        const readTime = parseInt(readTimeMinutes, 10) || 5;

        logApi('PUT', `/api/admin/notes/${id}`, `Admin: ${req.user.username}`);
        const tx = await turso.transaction('write');
        try {
            const result = await tx.execute({
                sql: `UPDATE topic_notes 
                      SET title = ?, content = ?, summary = ?, readTimeMinutes = ?, updatedAt = CURRENT_TIMESTAMP
                      WHERE id = ?;`,
                args: [title, content, summary || '', readTime, id]
            });

            if (result.rowsAffected === 0) {
                await tx.rollback();
                res.status(404).json({ message: 'Note not found.' });
                return;
            }

            await tx.commit();
            const updatedNote = {
                id,
                topicId,
                title,
                content,
                summary: summary || '',
                readTimeMinutes: readTime
            };
            res.status(200).json({ message: 'Note updated successfully.', note: updatedNote });
        } catch (e) {
            if (tx) await tx.rollback();
            logError('DB ERROR', `Updating note ${id} failed`, e.message);
            res.status(500).json({ message: 'Failed to update note.' });
        }
    })
);

/**
 * DELETE /api/admin/notes/:id
 * 
 * Deletes a note by ID.
 */
router.delete('/notes/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/notes/${id}`, `Admin: ${req.user.username}`);
    const tx = await turso.transaction('write');
    try {
        const result = await tx.execute({
            sql: "DELETE FROM topic_notes WHERE id = ?;",
            args: [id]
        });

        if (result.rowsAffected === 0) {
            await tx.rollback();
            res.status(404).json({ message: 'Note not found.' });
            return;
        }

        await tx.commit();
        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Deleting note ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to delete note.' });
    }
}));

/**
 * POST /api/admin/notes/batch-import
 * 
 * Batch creates or updates multiple notes.
 */
router.post('/notes/batch-import', asyncHandler(async (req, res) => {
    const notes = req.body;
    if (!Array.isArray(notes) || notes.length === 0) {
        res.status(400).json({ message: 'Invalid data format. Expected a non-empty array of notes.' });
        return;
    }

    logApi('POST', '/api/admin/notes/batch-import', `Admin: ${req.user.username}, count: ${notes.length}`);
    const tx = await turso.transaction('write');
    try {
        const statements = notes.map(n => ({
            sql: `INSERT OR REPLACE INTO topic_notes (id, topicId, title, content, summary, readTimeMinutes, updatedAt) 
                  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
            args: [
                n.id || `note-${n.topicId}`,
                n.topicId,
                n.title,
                n.content,
                n.summary || '',
                parseInt(n.readTimeMinutes, 10) || 5
            ]
        }));

        const BATCH_CHUNK_SIZE = 250;
        for (let i = 0; i < statements.length; i += BATCH_CHUNK_SIZE) {
            const chunk = statements.slice(i, i + BATCH_CHUNK_SIZE);
            await tx.batch(chunk);
        }

        await tx.commit();
        res.status(201).json({ message: `Successfully imported ${notes.length} note(s).` });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Batch import notes failed', e.message);
        res.status(500).json({ message: `Failed to import notes: ${e.message}` });
    }
}));

module.exports = router;