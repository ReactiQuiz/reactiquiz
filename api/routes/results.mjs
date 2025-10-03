import { Router } from 'express';
import { turso } from '../_utils/tursoClient.mjs';
import { verifyToken } from '../_middleware/auth.mjs';
import { logApi, logError } from '../_utils/logger.mjs';

const router = Router();

router.post('/', verifyToken, async (req, res) => {
  const userId = req.user && req.user.id;
  const { quizContext, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = req.body || {};
  const { topicId, subject, difficulty, quizClass } = quizContext || {};
  logApi('POST', '/api/results', `User: ${userId}, Topic: ${topicId}`);

  if (!userId || !topicId || !Array.isArray(questionsActuallyAttemptedIds) || questionsActuallyAttemptedIds.length === 0) {
    res.status(400).json({ message: 'Invalid quiz data provided for saving result.' });
    return;
  }

  const tx = await turso.transaction('write');
  try {
    const placeholders = questionsActuallyAttemptedIds.map(() => '?').join(',');
    const questionsResult = await tx.execute({
      sql: `SELECT id, correctOptionId FROM questions WHERE id IN (${placeholders})`,
      args: questionsActuallyAttemptedIds,
    });

    const correctAnswersMap = new Map(questionsResult.rows.map((q) => [q.id, q.correctOptionId]));
    let score = 0;
    for (const qId of questionsActuallyAttemptedIds) {
      if (userAnswersSnapshot && userAnswersSnapshot[qId] === correctAnswersMap.get(qId)) score++;
    }

    const totalQuestions = questionsActuallyAttemptedIds.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const insertResult = await tx.execute({
      sql: `INSERT INTO quiz_results (user_id, subject, topicId, score, totalQuestions, percentage, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, difficulty, class)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        userId,
        subject,
        topicId,
        score,
        totalQuestions,
        percentage,
        timeTaken,
        JSON.stringify(questionsActuallyAttemptedIds || []),
        JSON.stringify(userAnswersSnapshot || {}),
        difficulty,
        quizClass,
      ],
    });

    const resultId = insertResult.lastInsertRowid ? insertResult.lastInsertRowid.toString() : null;
    if (!resultId) throw new Error('Insert operation did not return a valid row ID.');

    const { rows } = await tx.execute({ sql: 'SELECT * FROM quiz_results WHERE id = ?', args: [resultId] });
    await tx.commit();

    res.status(201).json({ message: 'Result saved successfully!', resultId, savedResult: rows[0] });
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Saving result failed', e && e.message);
    res.status(500).json({ message: 'Could not save quiz result.' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user && req.user.id;
  logApi('GET', '/api/results', `User: ${userId}`);
  const tx = await turso.transaction('read');
  try {
    const result = await tx.execute({
      sql: 'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY timestamp DESC',
      args: [userId],
    });
    await tx.commit();
    const mapped = (result.rows || []).map((r) => {
      const totalQuestions = Number(r.totalQuestions) || 0;
      const percentage = Number(r.percentage) || 0;
      const correctFromPct = Math.round((percentage / 100) * totalQuestions);
      return {
        ...r,
        createdAt: r.timestamp || r.createdAt || null,
        correctAnswers: r.correctAnswers != null ? Number(r.correctAnswers) : correctFromPct,
        score: r.score != null ? Number(r.score) : correctFromPct,
        totalQuestions,
        percentage,
      };
    });
    res.json(mapped);
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Fetching results failed', e && e.message);
    res.status(500).json({ message: 'Could not fetch results.' });
  }
});

export default router;


