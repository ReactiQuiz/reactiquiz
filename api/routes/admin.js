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

/**
 * @route   GET /api/admin/subjects
 * @desc    Fetches all subjects with aggregated topic counts by class and genre.
 * @access  Private (Admin Only)
 */
router.get('/subjects', async (req, res) => {
    logApi('GET', '/api/admin/subjects', `Admin: ${req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const subjectsResult = await tx.execute(`
            SELECT 
                s.id,
                s.name,
                s.subjectKey,
                t.class,
                t.genre,
                COUNT(t.id) as topicCount
            FROM subjects s
            LEFT JOIN quiz_topics t ON s.id = t.subject_id
            GROUP BY s.id, s.name, s.subjectKey, t.class, t.genre
            ORDER BY s.displayOrder, s.name;
        `);
        
        await tx.commit();
        
        // Process the flat data into a structured object
        const subjectMap = {};
        subjectsResult.rows.forEach(row => {
            if (!subjectMap[row.id]) {
                subjectMap[row.id] = {
                    id: row.id,
                    name: row.name,
                    subjectKey: row.subjectKey,
                    totalTopics: 0,
                    classCounts: {},
                    genreCounts: {}
                };
            }
            if (row.topicCount > 0) {
                subjectMap[row.id].totalTopics += row.topicCount;
                if (row.class) {
                    subjectMap[row.id].classCounts[row.class] = (subjectMap[row.id].classCounts[row.class] || 0) + row.topicCount;
                }
                if (row.genre) {
                    subjectMap[row.id].genreCounts[row.genre] = (subjectMap[row.id].genreCounts[row.genre] || 0) + row.topicCount;
                }
            }
        });

        res.json(Object.values(subjectMap));

    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching all admin subjects failed', e.message);
        res.status(500).json({ message: 'Could not fetch subject list.' });
    }
});

module.exports = router;