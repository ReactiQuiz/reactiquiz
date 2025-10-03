const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

router.get('/', async (req, res) => {
  const { topicId, ids } = req.query;

  if (!topicId && !ids) {
    res.status(400).json({ message: 'A topicId or a list of ids is required.' });
    return;
  }

  const tx = await turso.transaction('read');
  try {
    let result = { rows: [] };
    if (ids) {
      const idArray = String(ids).split(',');
      if (idArray.length === 0) {
        res.json([]);
        return;
      }
      logApi('GET', '/api/questions', `Fetching ${idArray.length} specific questions`);
      const placeholders = idArray.map(() => '?').join(',');
      result = await tx.execute({ sql: `SELECT * FROM questions WHERE id IN (${placeholders})`, args: idArray });
    } else if (topicId) {
      logApi('GET', '/api/questions', `Topic: ${topicId}`);
      result = await tx.execute({ sql: 'SELECT * FROM questions WHERE topicId = ?', args: [topicId] });
    }
    await tx.commit();
    const parsedRows = result.rows.map((row) => ({ ...row, options: JSON.parse(row.options || '[]') }));
    res.json(parsedRows);
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Fetching questions failed', e && e.message);
    res.status(500).json({ message: 'Could not fetch questions.' });
  }
});

module.exports = router;


