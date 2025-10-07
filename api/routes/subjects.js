const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

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

module.exports = router;
