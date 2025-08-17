// api/routes/admin.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError, logInfo } = require('../_utils/logger');
const { verifyToken } = require('../_middleware/auth'); 

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

/**
 * @route   GET /api/admin/topics
 * @desc    Fetches all topics with detailed question counts by difficulty.
 * @access  Private (Admin Only)
 */
router.get('/topics', async (req, res) => {
    logApi('GET', '/api/admin/topics', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const topicsResult = await tx.execute(`
            SELECT 
                t.id, 
                t.name, 
                t.class, 
                t.genre, 
                s.name as subjectName,
                COUNT(q.id) as totalQuestions,
                SUM(CASE WHEN q.difficulty BETWEEN 10 AND 13 THEN 1 ELSE 0 END) as easyCount,
                SUM(CASE WHEN q.difficulty BETWEEN 14 AND 17 THEN 1 ELSE 0 END) as mediumCount,
                SUM(CASE WHEN q.difficulty >= 18 THEN 1 ELSE 0 END) as hardCount
            FROM quiz_topics t
            LEFT JOIN questions q ON t.id = q.topicId
            LEFT JOIN subjects s ON t.subject_id = s.id
            GROUP BY t.id
            ORDER BY s.name, t.name;
        `);
        
        await tx.commit();
        res.json(topicsResult.rows);

    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching all admin topics failed', e.message);
        res.status(500).json({ message: 'Could not fetch topic list.' });
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
 * @route   POST /api/admin/subjects
 * @desc    Creates a new subject.
 * @access  Private (Admin Only)
 */
router.post('/subjects', async (req, res) => {
    const { name, description, iconName, displayOrder, subjectKey, accentColorDark, accentColorLight } = req.body;
    logApi('POST', '/api/admin/subjects', `Creating: ${name}`);

    // Basic validation
    if (!name || !displayOrder || !subjectKey) {
        return res.status(400).json({ message: 'Name, Display Order, and Subject Key are required.' });
    }

    const tx = await turso.transaction('write');
    try {
        const result = await tx.execute({
            sql: `INSERT INTO subjects (name, description, iconName, displayOrder, subjectKey, accentColorDark, accentColorLight)
                  VALUES (?, ?, ?, ?, ?, ?, ?);`,
            args: [name, description || '', iconName || 'DefaultIcon', displayOrder, subjectKey, accentColorDark || '#FFFFFF', accentColorLight || '#000000']
        });

        const newSubjectId = result.lastInsertRowid;
        const { rows } = await tx.execute({
            sql: `SELECT * FROM subjects WHERE id = ?;`,
            args: [newSubjectId]
        });

        await tx.commit();
        res.status(201).json(rows[0]);

    } catch (e) {
        await tx.rollback();
        if (e.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'A subject with that Display Order or Subject Key already exists.' });
        }
        logError('DB ERROR', `Creating subject failed`, e.message);
        res.status(500).json({ message: 'Could not create subject.' });
    }
});

/**
 * @route   PUT /api/admin/subjects/:id
 * @desc    Updates an existing subject.
 * @access  Private (Admin Only)
 */
router.put('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, iconName, displayOrder, subjectKey, accentColorDark, accentColorLight } = req.body;
    logApi('PUT', `/api/admin/subjects/${id}`, `Updating: ${name}`);

    if (!name || !displayOrder || !subjectKey) {
        return res.status(400).json({ message: 'Name, Display Order, and Subject Key are required.' });
    }
    
    const tx = await turso.transaction('write');
    try {
        const result = await tx.execute({
            sql: `UPDATE subjects SET name = ?, description = ?, iconName = ?, displayOrder = ?, subjectKey = ?, accentColorDark = ?, accentColorLight = ?
                  WHERE id = ?;`,
            args: [name, description || '', iconName || 'DefaultIcon', displayOrder, subjectKey, accentColorDark || '#FFFFFF', accentColorLight || '#000000', id]
        });
        
        if (result.rowsAffected === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'Subject not found.' });
        }

        const { rows } = await tx.execute({
            sql: `SELECT * FROM subjects WHERE id = ?;`,
            args: [id]
        });

        await tx.commit();
        res.status(200).json(rows[0]);

    } catch (e) {
        await tx.rollback();
        if (e.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'A subject with that Display Order or Subject Key already exists.' });
        }
        logError('DB ERROR', `Updating subject ${id} failed`, e.message);
        res.status(500).json({ message: 'Could not update subject.' });
    }
});

/**
 * @route   DELETE /api/admin/subjects/:id
 * @desc    Deletes a subject.
 * @access  Private (Admin Only)
 */
router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/subjects/${id}`);

    // !! DANGER ZONE: Check for linked topics before deleting !!
    const tx = await turso.transaction('write');
    try {
        const topicsResult = await tx.execute({
            sql: `SELECT COUNT(*) as count FROM quiz_topics WHERE subject_id = ?;`,
            args: [id]
        });

        if (topicsResult.rows[0].count > 0) {
            await tx.rollback();
            return res.status(409).json({ message: `Cannot delete subject. It is linked to ${topicsResult.rows[0].count} topic(s).` });
        }

        const result = await tx.execute({
            sql: `DELETE FROM subjects WHERE id = ?;`,
            args: [id]
        });

        if (result.rowsAffected === 0) {
            await tx.rollback();
            return res.status(404).json({ message: 'Subject not found.' });
        }
        
        await tx.commit();
        res.status(200).json({ message: 'Subject deleted successfully.' });

    } catch(e) {
        await tx.rollback();
        logError('DB ERROR', `Deleting subject ${id} failed`, e.message);
        res.status(500).json({ message: 'Could not delete subject.' });
    }
});

module.exports = router;