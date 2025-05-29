// backend/server.js
// To enable debug logs, set the DEBUG environment variable, e.g.:
// DEBUG=reactiquiz:* npm run server:dev (shows all reactiquiz logs)
// DEBUG=reactiquiz:api npm run server:dev (shows only API logs)
// DEBUG=reactiquiz:db:* npm run server:dev (shows all DB logs)
// DEBUG=reactiquiz:db:results,reactiquiz:db:topics,reactiquiz:db:questions npm run server:dev (shows specific DB logs)

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');
const logDbResults = debug('reactiquiz:db:results');
const logDbQuestions = debug('reactiquiz:db:questions');
const logDbTopics = debug('reactiquiz:db:topics');
const logError = debug('reactiquiz:error');

const app = express();
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

// Default paths if environment variables are not set
const DEFAULT_RESULTS_DB_NAME = 'quizResults.db';
const DEFAULT_QUESTIONS_DB_NAME = 'quizData.db';
const DEFAULT_TOPICS_DB_NAME = 'quizTopics.db';

const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_RESULTS_DB_NAME);

const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_QUESTIONS_DB_NAME);

const TOPICS_DB_PATH = process.env.TOPICS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH.startsWith('./') ? process.env.TOPICS_DATABASE_FILE_PATH.substring(2) : process.env.TOPICS_DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_TOPICS_DB_NAME);

logServer(`[INFO] Backend API server starting on port ${port}`);
logServer(`[INFO] Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`[INFO] Questions DB Path: ${QUESTIONS_DB_PATH}`);
logServer(`[INFO] Topics DB Path: ${TOPICS_DB_PATH}`);

const resultsDb = new sqlite3.Database(RESULTS_DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    logError('[ERROR] Could not connect to results database: %s', err.message);
    process.exit(1);
  } else {
    logDbResults('[INFO] Connected to the SQLite results database.');
    resultsDb.run(`CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL,
      score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL,
      timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER,
      class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT
    )`, (err) => {
      if (err) logError('[ERROR] Error creating quiz_results table: %s', err.message);
      else logDbResults('[INFO] Results[quiz_results] table ensured.');
    });
  }
});

const questionsDb = new sqlite3.Database(QUESTIONS_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    logError('[ERROR] Could not connect to questions database (read-only): %s', err.message);
    // Potentially allow server to run if only questions DB fails, but log an error.
    // Depending on your requirements, you might want to process.exit(1) here too.
  } else {
    logDbQuestions('[INFO] Connected to the SQLite questions database (read-only).');
    questionsDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'", (err, row) => {
      if (err) logError("[ERROR] Error checking questions table: %s", err.message);
      else if (!row) logError.warn("'questions' table does not exist in %s. Run converter script.", QUESTIONS_DB_PATH);
      else logDbQuestions("[INFO] Questions[questions] table found.");
    });
  }
});

const topicsDb = new sqlite3.Database(TOPICS_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    logError('[ERROR] Could not connect to topics database (read-only): %s', err.message);
    // Potentially allow server to run if only topics DB fails.
  } else {
    logDbTopics('[INFO] Connected to the SQLite topics database (read-only).');
    topicsDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='quiz_topics'", (err, row) => {
      if (err) logError("[ERROR] Error checking quiz_topics table: %s", err.message);
      else if (!row) logError.warn("'quiz_topics' table does not exist in %s. Run converter script.", TOPICS_DB_PATH);
      else logDbTopics("[INFO] Topics[quiz_topics] table found.");
    });
  }
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  logApi(`[INFO] Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/topics/:subject', (req, res) => {
  const { subject } = req.params;
  logApi(`[INFO] GET /api/topics/%s - Request for subject: %s`, subject, subject);
  const sql = `SELECT id, name, description, class, genre FROM quiz_topics WHERE subject = ? ORDER BY class, name`;
  
  if (!topicsDb || topicsDb.open === false) { // Check if DB connection failed
    logError('[ERROR] GET /api/topics/%s - Topics DB not available.', subject);
    return res.status(503).json({ message: 'Service temporarily unavailable: Topics database is not connected.' });
  }

  topicsDb.all(sql, [subject.toLowerCase()], (err, rows) => {
    if (err) {
      logError('[ERROR] GET /api/topics/%s - DB Error: %s', subject, err.message);
      return res.status(500).json({ message: `Failed to fetch topics for ${subject}: ${err.message}` });
    }
    if (!rows) {
        logApi(`[WARN] GET /api/topics/%s - No topics found.`, subject);
        return res.json([]);
    }
    logApi(`[SUCCESS] GET /api/topics/%s - Success: Fetched %d topics.`, subject, rows.length);
    res.json(rows);
  });
});

app.get('/api/questions/:topicId', (req, res) => {
  const { topicId } = req.params;
  logApi(`[INFO] GET /api/questions/%s - Request for topicId: %s`, topicId, topicId);
  const sql = `SELECT * FROM questions WHERE topicId = ?`;
  
  if (!questionsDb || questionsDb.open === false) { // Check if DB connection failed
    logError('[ERROR] GET /api/questions/%s - Questions DB not available.', topicId);
    return res.status(503).json({ message: 'Service temporarily unavailable: Questions database is not connected.' });
  }

  questionsDb.all(sql, [topicId], (err, rows) => {
    if (err) {
      logError('[ERROR] GET /api/questions/%s - DB Error: %s', topicId, err.message);
      return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });
    }
    const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options) }));
    logApi(`[SUCCESS] GET /api/questions/%s - Success: Fetched %d questions.`, topicId, questions.length);
    res.json(questions);
  });
});

app.post('/api/results', async (req, res) => {
  logApi('[INFO] POST /api/results - Request received. Body keys: %s', Object.keys(req.body).join(', '));
  const newResultData = req.body;

  const requiredFields = ['subject', 'topicId', 'score', 'totalQuestions', 'percentage', 'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot'];
  const missingFields = requiredFields.filter(field => newResultData[field] == null);
  if (missingFields.length > 0) {
    logApi.warn('[WARN] POST /api/results - Bad Request: Missing required fields: %s', missingFields.join(', '));
    return res.status(400).json({ message: `Bad Request: Missing required fields: ${missingFields.join(', ')}.` });
  }
  if (!Array.isArray(newResultData.questionsActuallyAttemptedIds) || newResultData.questionsActuallyAttemptedIds.length === 0) {
    logApi.warn('[WARN] POST /api/results - Bad Request: questionsActuallyAttemptedIds is empty or not an array.');
    return res.status(400).json({ message: 'Bad Request: questionsActuallyAttemptedIds array cannot be empty or must be an array.' });
  }
  if (typeof newResultData.userAnswersSnapshot !== 'object' || newResultData.userAnswersSnapshot === null) {
    logApi.warn('[WARN] POST /api/results - Bad Request: userAnswersSnapshot is not an object.');
    return res.status(400).json({ message: 'Bad Request: userAnswersSnapshot must be an object.' });
  }

  const difficulty = newResultData.difficulty || null;
  const numQuestionsConfigured = newResultData.numQuestionsConfigured || null;
  const className = newResultData.class || null;
  const timeTaken = newResultData.timeTaken || null;
  const questionsIdsString = JSON.stringify(newResultData.questionsActuallyAttemptedIds);
  const answersSnapshotString = JSON.stringify(newResultData.userAnswersSnapshot);

  const duplicateCheckSql = `
    SELECT id FROM quiz_results 
    WHERE subject = ? AND topicId = ? AND score = ? AND totalQuestions = ? 
    AND percentage = ? AND difficulty ${difficulty === null ? 'IS NULL' : '= ?'}
    AND numQuestionsConfigured ${numQuestionsConfigured === null ? 'IS NULL' : '= ?'}
    AND class ${className === null ? 'IS NULL' : '= ?'}
    AND timeTaken ${timeTaken === null ? 'IS NULL' : '= ?'} 
    AND questionsActuallyAttemptedIds = ? AND userAnswersSnapshot = ?
    AND timestamp >= ? 
  `;
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();

  const duplicateParams = [
    newResultData.subject, newResultData.topicId, newResultData.score, newResultData.totalQuestions,
    newResultData.percentage,
  ];
  if (difficulty !== null) duplicateParams.push(difficulty);
  if (numQuestionsConfigured !== null) duplicateParams.push(numQuestionsConfigured);
  if (className !== null) duplicateParams.push(className);
  if (timeTaken !== null) duplicateParams.push(timeTaken);
  duplicateParams.push(questionsIdsString, answersSnapshotString, tenSecondsAgo);

  if (!resultsDb || resultsDb.open === false) {
    logError('[ERROR] POST /api/results - Results DB not available.');
    return res.status(503).json({ message: 'Service temporarily unavailable: Results database is not connected.' });
  }

  resultsDb.get(duplicateCheckSql, duplicateParams, (err, row) => {
    if (err) {
      logError('[ERROR] POST /api/results - DB Error checking for duplicates: %s', err.message);
      return res.status(500).json({ message: `Failed to save result: ${err.message}` });
    }

    if (row) {
      logApi.warn(`[WARN] POST /api/results - Duplicate result detected (ID: ${row.id}) within the last 10 seconds. Not saving.`);
      return res.status(409).json({ message: 'Duplicate result detected shortly after a previous submission.', existingId: row.id });
    }

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
        logError('[ERROR] POST /api/results - DB Error inserting result: %s', err.message);
        return res.status(500).json({ message: `Failed to save result: ${err.message}` });
      }
      logApi(`[SUCCESS] POST /api/results - Success: Result added with ID %d.`, this.lastID);
      res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
  });
});

app.get('/api/results', (req, res) => {
  logApi('[INFO] GET /api/results - Request received.');
  const sql = "SELECT * FROM quiz_results ORDER BY timestamp DESC";
  
  if (!resultsDb || resultsDb.open === false) {
    logError('[ERROR] GET /api/results - Results DB not available.');
    return res.status(503).json({ message: 'Service temporarily unavailable: Results database is not connected.' });
  }

  resultsDb.all(sql, [], (err, rows) => {
    if (err) {
      logError('[ERROR] GET /api/results - DB Error: %s', err.message);
      return res.status(500).json({ message: `Failed to fetch results: ${err.message}` });
    }
    const results = rows.map(row => ({
      ...row,
      questionsActuallyAttemptedIds: row.questionsActuallyAttemptedIds ? JSON.parse(row.questionsActuallyAttemptedIds) : [],
      userAnswersSnapshot: row.userAnswersSnapshot ? JSON.parse(row.userAnswersSnapshot) : {}
    }));
    logApi(`[SUCCESS] GET /api/results - Success: Fetched %d results.`, results.length);
    res.json(results);
  });
});

app.delete('/api/results/:id', (req, res) => {
  const resultIdToDelete = parseInt(req.params.id, 10);
  logApi(`[INFO] DELETE /api/results/%d - Request received.`, resultIdToDelete);
  if (isNaN(resultIdToDelete)) {
    logApi.warn('[WARN] DELETE /api/results/%s - Bad Request: Invalid result ID format.', req.params.id);
    return res.status(400).json({ message: 'Invalid result ID format.' });
  }
  const sql = "DELETE FROM quiz_results WHERE id = ?";
  
  if (!resultsDb || resultsDb.open === false) {
    logError('[ERROR] DELETE /api/results/%d - Results DB not available.', resultIdToDelete);
    return res.status(503).json({ message: 'Service temporarily unavailable: Results database is not connected.' });
  }

  resultsDb.run(sql, resultIdToDelete, function (err) {
    if (err) {
      logError('[ERROR] DELETE /api/results/%d - DB Error: %s', resultIdToDelete, err.message);
      return res.status(500).json({ message: `Failed to delete result: ${err.message}` });
    }
    if (this.changes === 0) {
      logApi.warn('[WARN] DELETE /api/results/%d - Not Found.', resultIdToDelete);
      return res.status(404).json({ message: `Result with ID ${resultIdToDelete} not found.` });
    }
    logApi(`[SUCCESS] DELETE /api/results/%d - Success: Result deleted.`, resultIdToDelete);
    res.status(200).json({ message: 'Result deleted successfully.' });
  });
});

if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
  logServer('[INFO] Production/Serve_Build mode: Enabling static file serving from build directory.');
  app.use(express.static(path.join(projectRoot, 'build')));
  app.get('*', (req, res) => {
    logServer(`[INFO] Serving index.html for unmatched route: ${req.path}`);
    res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
      if (err) {
        logError('[ERROR] Error sending index.html: %s', err.message);
        res.status(500).send(err.message || 'Error sending index.html');
      }
    });
  });
} else {
  logServer('[INFO] Development mode: Static file serving from build directory is NOT enabled.');
}

app.listen(port, () => {
  logServer(`[INFO] Backend API server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production' && process.env.SERVE_BUILD !== 'true') {
    logServer(`[INFO] Ensure your frontend is running, likely on http://localhost:3000, and uses proxy.`);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logError('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logError('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});