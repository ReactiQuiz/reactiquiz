// backend/server.js
// To enable debug logs, set the DEBUG environment variable, e.g.:
// DEBUG=reactiquiz:* npm run server:dev (shows all reactiquiz logs)
// DEBUG=reactiquiz:api npm run server:dev (shows only API logs)
// DEBUG=reactiquiz:db:* npm run server:dev (shows all DB logs)
// DEBUG=reactiquiz:db:results npm run server:dev (shows only results DB logs)

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Ensure .env is loaded
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');
const logDbResults = debug('reactiquiz:db:results');
const logDbQuestions = debug('reactiquiz:db:questions');
const logError = debug('reactiquiz:error');

const app = express();
const port = process.env.SERVER_PORT || 3001;
const host = process.env.SERVER_HOST || '0.0.0.0';
const projectRoot = path.resolve(__dirname, '../');

const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizResults.db');

const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
  : path.join(__dirname, 'quizData.db');

logServer(`Backend API server starting on port ${port} and host ${host}`);
logServer(`Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`Questions DB Path: ${QUESTIONS_DB_PATH}`);

const resultsDb = new sqlite3.Database(RESULTS_DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    logError('Could not connect to results database: %s', err.message);
    process.exit(1);
  } else {
    logDbResults('Connected to the Results SQLite database[quiz_results.db]');
    resultsDb.run(`CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL,
      score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL,
      timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER,
      class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT
    )`, (err) => {
      if (err) logError('Error creating quiz_results table: %s', err.message);
      else logDbResults('Results[quiz_results] table ensured.');
    });
  }
});

const questionsDb = new sqlite3.Database(QUESTIONS_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    logError('Could not connect to questions database (read-only): %s', err.message);
  } else {
    logDbQuestions('Connected to the Questions SQLite database[quiz_data.db] (read-only).');
    questionsDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'", (err, row) => {
        if (err) logError("Error checking questions table: %s", err.message);
        else if (!row) logServer.warn("Questions[questions] table does not exist in Questions File[questions_data.db]. Run converter script[jsonToDBConverter.js]");
        else logDbQuestions("Questions[questions] table ensured.");
    });
  }
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Middleware to log all requests
app.use((req, res, next) => {
  logApi(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/questions/:topicId', (req, res) => {
  const { topicId } = req.params;
  logApi(`GET /api/questions/%s - Request for topicId: %s`, topicId, topicId);
  const sql = `SELECT * FROM questions WHERE topicId = ?`;
  questionsDb.all(sql, [topicId], (err, rows) => {
    if (err) {
      logError('GET /api/questions/%s - DB Error: %s', topicId, err.message);
      return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });
    }
    const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options) }));
    logApi(`GET /api/questions/%s - Success: Fetched %d questions.`, topicId, questions.length);
    res.json(questions);
  });
});

app.post('/api/results', async (req, res) => {
  logApi('POST /api/results - Request received. Body keys: %s', Object.keys(req.body).join(', '));
  const newResultData = req.body;

  const requiredFields = ['subject', 'topicId', 'score', 'totalQuestions', 'percentage', 'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot'];
  const missingFields = requiredFields.filter(field => newResultData[field] == null);
  if (missingFields.length > 0) {
    logApi.warn('POST /api/results - Bad Request: Missing required fields: %s', missingFields.join(', '));
    return res.status(400).json({ message: `Bad Request: Missing required fields: ${missingFields.join(', ')}.` });
  }
  if (!Array.isArray(newResultData.questionsActuallyAttemptedIds) || newResultData.questionsActuallyAttemptedIds.length === 0) {
    logApi.warn('POST /api/results - Bad Request: questionsActuallyAttemptedIds is empty or not an array.');
    return res.status(400).json({ message: 'Bad Request: questionsActuallyAttemptedIds array cannot be empty or must be an array.' });
  }
  if (typeof newResultData.userAnswersSnapshot !== 'object' || newResultData.userAnswersSnapshot === null) {
    logApi.warn('POST /api/results - Bad Request: userAnswersSnapshot is not an object.');
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

  resultsDb.get(duplicateCheckSql, duplicateParams, (err, row) => {
    if (err) {
      logError('POST /api/results - DB Error checking for duplicates: %s', err.message);
      return res.status(500).json({ message: `Failed to save result: ${err.message}` });
    }

    if (row) {
      logApi.warn(`POST /api/results - Duplicate result detected (ID: ${row.id}) within the last 10 seconds. Not saving.`);
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
        logError('POST /api/results - DB Error inserting result: %s', err.message);
        return res.status(500).json({ message: `Failed to save result: ${err.message}` });
      }
      logApi(`POST /api/results - Success: Result added with ID %d.`, this.lastID);
      res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
  });
});

app.get('/api/results', (req, res) => {
  logApi('GET /api/results - Request received.');
  const sql = "SELECT * FROM quiz_results ORDER BY timestamp DESC";
  resultsDb.all(sql, [], (err, rows) => {
    if (err) {
      logError('GET /api/results - DB Error: %s', err.message);
      return res.status(500).json({ message: `Failed to fetch results: ${err.message}` });
    }
    const results = rows.map(row => ({
      ...row,
      questionsActuallyAttemptedIds: row.questionsActuallyAttemptedIds ? JSON.parse(row.questionsActuallyAttemptedIds) : [],
      userAnswersSnapshot: row.userAnswersSnapshot ? JSON.parse(row.userAnswersSnapshot) : {}
    }));
    logApi(`GET /api/results - Success: Fetched %d results.`, results.length);
    res.json(results);
  });
});

app.delete('/api/results/:id', (req, res) => {
  const resultIdToDelete = parseInt(req.params.id, 10);
  logApi(`DELETE /api/results/%d - Request received.`, resultIdToDelete);
  if (isNaN(resultIdToDelete)) {
    logApi.warn('DELETE /api/results/%s - Bad Request: Invalid result ID format.', req.params.id);
    return res.status(400).json({ message: 'Invalid result ID format.' });
  }
  const sql = "DELETE FROM quiz_results WHERE id = ?";
  resultsDb.run(sql, resultIdToDelete, function (err) {
    if (err) {
      logError('DELETE /api/results/%d - DB Error: %s', resultIdToDelete, err.message);
      return res.status(500).json({ message: `Failed to delete result: ${err.message}` });
    }
    if (this.changes === 0) {
      logApi.warn('DELETE /api/results/%d - Not Found.', resultIdToDelete);
      return res.status(404).json({ message: `Result with ID ${resultIdToDelete} not found.` });
    }
    logApi(`DELETE /api/results/%d - Success: Result deleted.`, resultIdToDelete);
    res.status(200).json({ message: 'Result deleted successfully.' });
  });
});


if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
  logServer('Production/Serve_Build mode: Enabling static file serving from build directory.');
  app.use(express.static(path.join(projectRoot, 'build')));
  app.get('*', (req, res) => {
    logServer(`Serving index.html for unmatched route: ${req.path}`);
    res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
      if (err) {
        logError('Error sending index.html: %s', err.message);
        res.status(500).send(err.message || 'Error sending index.html');
      }
    });
  });
} else {
  logServer('Development mode: Static file serving from build directory is NOT enabled.');
}

app.listen(port, host, () => {
  logServer(`Backend API server running on http://${host}:${port}`);
  if (process.env.NODE_ENV !== 'production' && process.env.SERVE_BUILD !== 'true') {
    logServer(`Ensure your frontend (React Dev Server) is running, likely on http://localhost:3000`);
    logServer("Use proxy to http://${host}:${port} for frontend server.");
  }
});

process.on('SIGINT', () => {
  logServer('SIGINT received. Closing database connections...');
  resultsDb.close((err) => {
    if (err) logError('Error closing results DB: %s', err.message);
    else logDbResults('Closed the results database connection.');
    
    questionsDb.close((err_q) => {
        if (err_q) logError('Error closing questions DB: %s', err_q.message);
        else logDbQuestions('Closed the questions database connection.');
        logServer('Exiting process.');
        process.exit(0);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:', error);
  process.exit(1);
});