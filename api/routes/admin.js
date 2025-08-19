// api/routes/admin.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError, logInfo } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth'); 
const { body, validationResult } = require('express-validator');

const router = Router();

// --- Admin-Only Verification Middleware (Unchanged) ---
const verifyAdmin = (req, res, next) => {
    const adminId = process.env.ADMIN_USER_ID;

    if (!adminId) {
        logError('FATAL', 'ADMIN_USER_ID is not configured on the server.');
        return res.status(500).json({ message: 'Admin access is not configured.' });
    }

    if (req.user.id !== adminId) {
        logApi('FORBIDDEN', req.path, `User ${req.user.username} is not admin.`);
        return res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
    }
    
    next();
};

router.use(verifyToken, verifyAdmin);

// --- API Endpoints ---

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

// --- START OF NEW ENDPOINT ---
/**
 * @route   GET /api/admin/overview-stats
 * @desc    Fetches aggregated stats for the content overview dashboard.
 * @access  Private (Admin Only)
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

        const topicsMap = new Map(topicsBySubjectResult.rows.map(r => [r.subjectKey, r.count]));
        const questionsMap = new Map(questionsBySubjectResult.rows.map(r => [r.subjectKey, r.count]));

        const subjectBreakdown = subjectsResult.rows.map(subject => ({
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
 * @route   GET /api/admin/subjects
 * @desc    Fetches all subjects for the admin panel.
 * @access  Private (Admin Only)
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
 * @route   POST /api/admin/subjects
 * @desc    Creates a new subject.
 * @access  Private (Admin Only)
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
            return res.status(400).json({ message: errors.array()[0].msg });
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
                return res.status(409).json({ message: 'A subject with this ID or Subject Key already exists.' });
            }
            res.status(500).json({ message: 'Failed to create subject.' });
        }
    }
);

/**
 * @route   PUT /api/admin/subjects/:id
 * @desc    Updates an existing subject.
 * @access  Private (Admin Only)
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
            return res.status(400).json({ message: errors.array()[0].msg });
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
                 return res.status(404).json({ message: 'Subject not found.' });
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
 * @route   DELETE /api/admin/subjects/:id
 * @desc    Deletes a subject.
 * @access  Private (Admin Only)
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
            return res.status(404).json({ message: 'Subject not found.' });
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
 * @route   GET /api/admin/topics
 * @desc    Fetches all topics for the admin panel, joined with subject names.
 * @access  Private (Admin Only)
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
 * @route   POST /api/admin/topics
 * @desc    Creates a new topic.
 * @access  Private (Admin Only)
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
            return res.status(400).json({ message: errors.array()[0].msg });
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
                return res.status(409).json({ message: 'A topic with this ID already exists.' });
            }
            res.status(500).json({ message: 'Failed to create topic.' });
        }
    }
);

/**
 * @route   PUT /api/admin/topics/:id
 * @desc    Updates an existing topic.
 * @access  Private (Admin Only)
 */
router.put('/topics/:id',
    [
        body('name').notEmpty().withMessage('Name is required.'),
        body('subject_id').notEmpty().withMessage('Subject is required.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
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
                 return res.status(404).json({ message: 'Topic not found.' });
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
 * @route   DELETE /api/admin/topics/:id
 * @desc    Deletes a topic.
 * @access  Private (Admin Only)
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
            return res.status(404).json({ message: 'Topic not found.' });
        }
        
        await tx.commit();
        res.status(200).json({ message: 'Topic deleted successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', `Deleting topic ${id} failed`, e.message);
        res.status(500).json({ message: 'Failed to delete topic.' });
    }
});

module.exports = router;