// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizResults.db');

const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizData.db');

console.log(`[INIT] Backend API server starting on port ${port}...`);
console.log(`[INIT] Results DB Path: ${RESULTS_DB_PATH}`);
console.log(`[INIT] Questions DB Path: ${QUESTIONS_DB_PATH}`);

const resultsDb = new sqlite3.Database(RESULTS_DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('[DB_ERROR] Could not connect to results database', err.message);
    process.exit(1);
  } else {
    console.log('[DB_INIT] Connected to the SQLite results database.');
    resultsDb.run(`CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL,
      score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL,
      timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER,
      class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT
    )`, (err) => {
      if (err) console.error('[DB_ERROR] Error creating quiz_results table', err.message);
      else console.log('[DB_INIT] quiz_results table ensured.');
    });
  }
});

const questionsDb = new sqlite3.Database(QUESTIONS_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('[DB_ERROR] Could not connect to questions database (read-only)', err.message);
  } else {
    console.log('[DB_INIT] Connected to the SQLite questions database (read-only).');
    questionsDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'", (err, row) => {
        if (err) console.error("[DB_ERROR] Error checking questions table", err);
        else if (!row) console.warn("[DB_WARN] 'questions' table does not exist in questions_data.db. Run converter script.");
        else console.log("[DB_INIT] 'questions' table found.");
    });
  }
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/questions/:subject/:topicId', (req, res) => {
  const { subject, topicId } = req.params;
  console.log(`[API /api/questions] Request for subject: ${subject}, topicId: ${topicId}`);
  const sql = `SELECT * FROM questions WHERE subject = ? AND topicId = ?`;
  questionsDb.all(sql, [subject.toLowerCase(), topicId], (err, rows) => {
    if (err) {
      console.error('[API /api/questions] DB Error:', err.message);
      return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });
    }
    const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options) }));
    console.log(`[API /api/questions] Success: Fetched ${questions.length} questions for ${subject}/${topicId}.`);
    res.json(questions);
  });
});

app.post('/api/results', async (req, res) => {
  console.log('[API /api/results POST] Request received.');
  const newResultData = req.body;

  const requiredFields = ['subject', 'topicId', 'score', 'totalQuestions', 'percentage', 'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot'];
  const missingFields = requiredFields.filter(field => newResultData[field] == null);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Bad Request: Missing required fields: ${missingFields.join(', ')}.` });
  }
  if (!Array.isArray(newResultData.questionsActuallyAttemptedIds) || newResultData.questionsActuallyAttemptedIds.length === 0) {
    return res.status(400).json({ message: 'Bad Request: questionsActuallyAttemptedIds array cannot be empty or must be an array.' });
  }
  if (typeof newResultData.userAnswersSnapshot !== 'object' || newResultData.userAnswersSnapshot === null) {
    return res.status(400).json({ message: 'Bad Request: userAnswersSnapshot must be an object.' });
  }

  // Convert potentially undefined optional fields to null for consistent DB storage/querying
  const difficulty = newResultData.difficulty || null;
  const numQuestionsConfigured = newResultData.numQuestionsConfigured || null;
  const className = newResultData.class || null; // 'class' is a reserved keyword, using className
  const timeTaken = newResultData.timeTaken || null;
  const questionsIdsString = JSON.stringify(newResultData.questionsActuallyAttemptedIds);
  const answersSnapshotString = JSON.stringify(newResultData.userAnswersSnapshot);

  // Check for very recent duplicates
  const duplicateCheckSql = `
    SELECT id FROM quiz_results 
    WHERE subject = ? AND topicId = ? AND score = ? AND totalQuestions = ? 
    AND percentage = ? AND difficulty = ? AND numQuestionsConfigured = ?
    AND class = ? AND timeTaken = ? 
    AND questionsActuallyAttemptedIds = ? AND userAnswersSnapshot = ?
    AND timestamp >= ? 
  `;
  // Check for duplicates within the last 10 seconds, for example
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString(); 

  const duplicateParams = [
    newResultData.subject, newResultData.topicId, newResultData.score, newResultData.totalQuestions,
    newResultData.percentage, difficulty, numQuestionsConfigured, className, timeTaken,
    questionsIdsString, answersSnapshotString, tenSecondsAgo
  ];

  resultsDb.get(duplicateCheckSql, duplicateParams, (err, row) => {
    if (err) {
      console.error('[API /api/results POST] DB Error checking for duplicates:', err.message);
      return res.status(500).json({ message: `Failed to save result: ${err.message}` });
    }

    if (row) {
      console.warn(`[API /api/results POST] Duplicate result detected (ID: ${row.id}) within the last 10 seconds. Not saving.`);
      return res.status(409).json({ message: 'Duplicate result detected shortly after a previous submission.', existingId: row.id });
    }

    // If no recent duplicate, proceed to insert
    const insertSql = `INSERT INTO quiz_results (
      subject, topicId, score, totalQuestions, percentage, timestamp, 
      difficulty, numQuestionsConfigured, class, timeTaken, 
      questionsActuallyAttemptedIds, userAnswersSnapshot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertParams = [
      newResultData.subject, newResultData.topicId, newResultData.score, newResultData.totalQuestions,
      newResultData.percentage, newResultData.timestamp, difficulty, numQuestionsConfigured,
      className, timeTaken, questionsIdsString, answersSnapshotString
    ];

    resultsDb.run(insertSql, insertParams, function (err) {
      if (err) {
        console.error('[API /api/results POST] DB Error inserting result:', err.message);
        return res.status(500).json({ message: `Failed to save result: ${err.message}` });
      }
      console.log(`[API /api/results POST] Success: Result added with ID ${this.lastID}.`);
      res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
  });
});

app.get('/api/results', (req, res) => { // Removed async as db.all is callback based
  console.log('[API /api/results GET] Request received.');
  const sql = "SELECT * FROM quiz_results ORDER BY timestamp DESC";
  resultsDb.all(sql, [], (err, rows) => {
    if (err) {
      console.error('[API /api/results GET] DB Error:', err.message);
      return res.status(500).json({ message: `Failed to fetch results: ${err.message}` });
    }
    const results = rows.map(row => ({
      ...row,
      questionsActuallyAttemptedIds: row.questionsActuallyAttemptedIds ? JSON.parse(row.questionsActuallyAttemptedIds) : [],
      userAnswersSnapshot: row.userAnswersSnapshot ? JSON.parse(row.userAnswersSnapshot) : {}
    }));
    console.log(`[API /api/results GET] Success: Fetched ${results.length} results.`);
    res.json(results);
  });
});

app.delete('/api/results/:id', (req, res) => { // Removed async
  const resultIdToDelete = parseInt(req.params.id, 10);
  console.log(`[API /api/results DELETE] Request received for ID: ${resultIdToDelete}.`);
  if (isNaN(resultIdToDelete)) {
    return res.status(400).json({ message: 'Invalid result ID format.' });
  }
  const sql = "DELETE FROM quiz_results WHERE id = ?";
  resultsDb.run(sql, resultIdToDelete, function (err) {
    if (err) {
      console.error(`[API /api/results DELETE] DB Error for ID ${resultIdToDelete}:`, err.message);
      return res.status(500).json({ message: `Failed to delete result: ${err.message}` });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: `Result with ID ${resultIdToDelete} not found.` });
    }
    console.log(`[API /api/results DELETE] Success: Result ID ${resultIdToDelete} deleted.`);
    res.status(200).json({ message: 'Result deleted successfully.' });
  });
});

if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
  app.use(express.static(path.join(projectRoot, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send(err.message || 'Error sending index.html');
      }
    });
  });
  console.log('[SERVER] Serving static files from build directory enabled.');
}

app.listen(port, () => {
  console.log(`[SERVER] Backend API server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production' && process.env.SERVE_BUILD !== 'true') {
    console.log(`[SERVER] Ensure your frontend (React Dev Server) is running, likely on http://localhost:3000, and uses proxy.`);
  }
});

process.on('SIGINT', () => {
  console.log('[SIGINT] Closing database connections...');
  resultsDb.close((err) => {
    if (err) console.error('[DB_CLOSE_ERR] Error closing results DB:', err.message);
    else console.log('[DB_CLOSE] Closed the results database connection.');
    
    questionsDb.close((err_q) => {
        if (err_q) console.error('[DB_CLOSE_ERR] Error closing questions DB:', err_q.message);
        else console.log('[DB_CLOSE] Closed the questions database connection.');
        process.exit(0);
    });
  });
});