import { Router } from 'express';
import { turso } from '../_utils/tursoClient.mjs';
import { logApi, logError } from '../_utils/logger.mjs';
import { verifyToken } from '../_middleware/auth.mjs';

const router = Router();

const verifyAdmin = (req, res, next) => {
    const adminId = process.env.ADMIN_USER_ID;

    if (!adminId) {
        logError('FATAL', 'ADMIN_USER_ID is not configured on the server.');
        res.status(500).json({ message: 'Admin access is not configured.' });
        return;
    }

    if (req.user && req.user.id !== adminId) {
        logApi('FORBIDDEN', req.path, `User ${req.user.username} is not admin.`);
        res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
        return;
    }
    
    next();
};

router.use(verifyToken, verifyAdmin);

router.get('/status', async (req, res) => {
    logApi('GET', '/api/admin/status', `Admin: ${req.user && req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        const [usersResult, topicsResult, questionsResult] = await Promise.all([
            tx.execute("SELECT count(*) as total FROM users"),
            tx.execute("SELECT count(*) as total FROM quiz_topics"),
            tx.execute("SELECT count(*) as total FROM questions"),
        ]);

        await tx.commit();

        res.json({
            userCount: (usersResult.rows[0] && usersResult.rows[0].total) || 0,
            topicCount: (topicsResult.rows[0] && topicsResult.rows[0].total) || 0,
            questionCount: (questionsResult.rows[0] && questionsResult.rows[0].total) || 0,
        });

    } catch (e) {
        if (tx) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching admin status failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch admin status.' });
    }
});

router.get('/users', async (req, res) => {
    logApi('GET', '/api/admin/users', `Admin: ${req.user && req.user.username}`);
    
    const tx = await turso.transaction('read');
    try {
        const usersResult = await tx.execute(
            "SELECT id, username, email, phone, address, class FROM users ORDER BY username ASC"
        );
        
        await tx.commit();

        res.json(usersResult.rows);

    } catch (e) {
        if (tx) {
            await tx.rollback();
        }
        logError('DB ERROR', 'Fetching all users failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch user list.' });
    }
});

router.get('/overview-stats', async (req, res) => {
    logApi('GET', '/api/admin/overview-stats', `Admin: ${req.user && req.user.username}`);
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
        logError('DB ERROR', 'Fetching admin overview stats failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch overview stats.' });
    }
});

router.get('/subjects', async (req, res) => {
    logApi('GET', '/api/admin/subjects', `Admin: ${req.user && req.user.username}`);
    const tx = await turso.transaction('read');
    try {
        const result = await tx.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        await tx.commit();
        res.json(result.rows);
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Fetching subjects for admin failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});

router.post('/subjects', async (req, res) => {
    logApi('POST', '/api/admin/subjects', `Admin: ${req.user && req.user.username}`);
    const { name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight } = req.body;
    
    if (!name || !subjectKey || !displayOrder) {
        res.status(400).json({ message: 'Name, Subject Key, and Display Order are required.' });
        return;
    }
    
    const tx = await turso.transaction('write');
    try {
        await tx.execute({
            sql: `INSERT INTO subjects (id, name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [subjectKey, name, subjectKey, description || '', displayOrder, iconName || 'DefaultIcon', accentColorDark || '#FFFFFF', accentColorLight || '#000000']
        });

        await tx.commit();
        res.status(201).json({ message: 'Subject created successfully.' });
    } catch (e) {
        if (tx) await tx.rollback();
        logError('DB ERROR', 'Creating subject failed', e && e.message);
        if (e && e.message && (e.message.includes('UNIQUE constraint failed: subjects.id') || e.message.includes('UNIQUE constraint failed: subjects.subjectKey'))) {
            res.status(409).json({ message: 'A subject with this ID or Subject Key already exists.' });
            return;
        }
        res.status(500).json({ message: 'Failed to create subject.' });
    }
});

router.put('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    logApi('PUT', `/api/admin/subjects/${id}`, `Admin: ${req.user && req.user.username}`);
    const { name, subjectKey, description, displayOrder, iconName, accentColorDark, accentColorLight } = req.body;
    
    if (!name || !subjectKey || !displayOrder) {
        res.status(400).json({ message: 'Name, Subject Key, and Display Order are required.' });
        return;
    }
    
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
        logError('DB ERROR', `Updating subject ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to update subject.' });
    }
});

router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/subjects/${id}`, `Admin: ${req.user && req.user.username}`);
    const tx = await turso.transaction('write');
    try {
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
        logError('DB ERROR', `Deleting subject ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to delete subject.' });
    }
});

router.get('/topics', async (req, res) => {
    logApi('GET', '/api/admin/topics', `Admin: ${req.user && req.user.username}`);
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
        logError('DB ERROR', 'Fetching topics for admin failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch topics.' });
    }
});

router.post('/topics', async (req, res) => {
    logApi('POST', '/api/admin/topics', `Admin: ${req.user && req.user.username}`);
    const { id, name, description, class: topicClass, genre, subject_id } = req.body;
    
    if (!id || !name || !subject_id) {
        res.status(400).json({ message: 'ID, Name, and Subject are required.' });
        return;
    }
    
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
        logError('DB ERROR', 'Creating topic failed', e && e.message);
        if (e && e.message && e.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ message: 'A topic with this ID already exists.' });
            return;
        }
        res.status(500).json({ message: 'Failed to create topic.' });
    }
});

router.put('/topics/:id', async (req, res) => {
    const { id } = req.params;
    logApi('PUT', `/api/admin/topics/${id}`, `Admin: ${req.user && req.user.username}`);
    const { name, description, class: topicClass, genre, subject_id } = req.body;
    
    if (!name || !subject_id) {
        res.status(400).json({ message: 'Name and Subject are required.' });
        return;
    }
    
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
        logError('DB ERROR', `Updating topic ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to update topic.' });
    }
});

router.delete('/topics/:id', async (req, res) => {
    const { id } = req.params;
    logApi('DELETE', `/api/admin/topics/${id}`, `Admin: ${req.user && req.user.username}`);
    const tx = await turso.transaction('write');
    try {
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
        logError('DB ERROR', `Deleting topic ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to delete topic.' });
    }
});

router.get('/topics/summary', async (req, res) => {
    logApi('GET', '/api/admin/topics/summary', `Admin: ${req.user && req.user.username}`);
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
        logError('DB ERROR', 'Fetching topics summary failed', e && e.message);
        res.status(500).json({ message: 'Could not fetch topics summary.' });
    }
});

router.get('/questions-by-topic', async (req, res) => {
    const { topicId, page = 1, limit = 10 } = req.query;
    if (!topicId) {
        res.status(400).json({ message: 'A topicId is required.' });
        return;
    }

    const tx = await turso.transaction('read');
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const [questionsRes, totalRes] = await Promise.all([
            tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ? ORDER BY id ASC LIMIT ? OFFSET ?",
                args: [topicId, Number(limit), offset]
            }),
            tx.execute({
                sql: "SELECT COUNT(*) as total FROM questions WHERE topicId = ?",
                args: [topicId]
            })
        ]);
        await tx.commit();
        res.json({
            questions: questionsRes.rows,
            total: (totalRes.rows[0] && totalRes.rows[0].total) || 0
        });
    } catch (e) {
        if (tx) await tx.rollback();
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});

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
        logError('DB ERROR', 'Batch import failed', e && e.message);
        res.status(500).json({ message: `Failed to import questions: ${e && e.message}` });
    }
});

router.post('/questions', async (req, res) => {
    const { id, topicId, text, options, correctOptionId, explanation, difficulty } = req.body;
    
    if (!id || !topicId || !text || !options || !correctOptionId || !difficulty) {
        res.status(400).json({ message: 'ID, Topic ID, Text, Options, Correct Option ID, and Difficulty are required.' });
        return;
    }
    
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
        logError('DB ERROR', 'Creating question failed', e && e.message);
        if (e && e.message && e.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ message: 'A question with this ID already exists.' });
            return;
        }
        res.status(500).json({ message: 'Failed to create question.' });
    }
});

router.put('/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { text, options, correctOptionId, explanation, difficulty } = req.body;
    
    if (!text || !options || !correctOptionId || !difficulty) {
        res.status(400).json({ message: 'Text, Options, Correct Option ID, and Difficulty are required.' });
        return;
    }
    
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
        logError('DB ERROR', `Updating question ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to update question.' });
    }
});

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
        logError('DB ERROR', `Deleting question ${id} failed`, e && e.message);
        res.status(500).json({ message: 'Failed to delete question.' });
    }
});

export default router;
