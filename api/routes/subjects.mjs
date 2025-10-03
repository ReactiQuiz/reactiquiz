import { Router } from 'express';
import { turso } from '../_utils/tursoClient.mjs';
import { logApi, logError } from '../_utils/logger.mjs';

const router = Router();

router.get('/', async (req, res) => {
  logApi('GET', '/api/subjects');
  const tx = await turso.transaction('read');
  try {
    const result = await tx.execute('SELECT * FROM subjects ORDER BY displayOrder ASC');
    await tx.commit();
    res.json(result.rows);
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Fetching subjects failed', e && e.message);
    res.status(500).json({ message: 'Could not fetch subjects.' });
  }
});

export default router;


