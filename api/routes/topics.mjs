import { Router } from 'express';
import { turso } from '../_utils/tursoClient.mjs';
import { logApi, logError } from '../_utils/logger.mjs';

const router = Router();

router.get('/', async (req, res) => {
  logApi('GET', '/api/topics (all)');
  const tx = await turso.transaction('read');
  try {
    const result = await tx.execute('SELECT * FROM quiz_topics');
    await tx.commit();
    res.json(result.rows);
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Fetching all topics failed', e && e.message);
    res.status(500).json({ message: 'Could not fetch topics.' });
  }
});

router.get('/:subjectKey', async (req, res) => {
  const { subjectKey } = req.params;
  logApi('GET', `/api/topics/${subjectKey}`);
  const tx = await turso.transaction('read');
  try {
    const subjectResult = await tx.execute({ sql: 'SELECT id FROM subjects WHERE subjectKey = ?', args: [subjectKey] });
    if (!subjectResult.rows || subjectResult.rows.length === 0) {
      await tx.rollback();
      return res.status(404).json({ message: `Subject '${subjectKey}' not found` });
    }
    const subjectId = subjectResult.rows[0].id;
    const topicsResult = await tx.execute({ sql: 'SELECT * FROM quiz_topics WHERE subject_id = ? ORDER BY name', args: [subjectId] });
    await tx.commit();
    res.json(topicsResult.rows);
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', `Fetching topics for ${subjectKey} failed`, e && e.message);
    res.status(500).json({ message: 'Could not fetch topics.' });
  }
});

export default router;


