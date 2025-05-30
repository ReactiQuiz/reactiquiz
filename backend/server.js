// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Ensure this is at the very top
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');
const logDbResults = debug('reactiquiz:db:results');
const logDbQuestions = debug('reactiquiz:db:questions');
const logDbTopics = debug('reactiquiz:db:topics');
const logDbUsers = debug('reactiquiz:db:users');
const logError = debug('reactiquiz:error');

const app = express();
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

// --- DB Paths ---
const DEFAULT_RESULTS_DB_NAME = 'quizResults.db';
const DEFAULT_QUESTIONS_DB_NAME = 'quizData.db';
const DEFAULT_TOPICS_DB_NAME = 'quizTopics.db';
const DEFAULT_USERS_DB_NAME = 'users.db';

const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_RESULTS_DB_NAME);
const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_QUESTIONS_DB_NAME);
const TOPICS_DB_PATH = process.env.TOPICS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH.startsWith('./') ? process.env.TOPICS_DATABASE_FILE_PATH.substring(2) : process.env.TOPICS_DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_TOPICS_DB_NAME);
const USERS_DB_PATH = process.env.USERS_DATABASE_FILE_PATH
  ? path.resolve(projectRoot, process.env.USERS_DATABASE_FILE_PATH.startsWith('./') ? process.env.USERS_DATABASE_FILE_PATH.substring(2) : process.env.USERS_DATABASE_FILE_PATH)
  : path.join(__dirname, DEFAULT_USERS_DB_NAME);

logServer(`[INFO] Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`[INFO] Questions DB Path: ${QUESTIONS_DB_PATH}`);
logServer(`[INFO] Topics DB Path: ${TOPICS_DB_PATH}`);
logServer(`[INFO] Users DB Path: ${USERS_DB_PATH}`);

// --- DB Connections ---
// Helper function to open DB and check table
function initializeDb(dbPath, dbNameLog, createTableSql, tableName, logInstance) {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      logError(`[ERROR] Could not connect to ${dbNameLog} database: %s`, err.message);
      process.exit(1); // Exit if critical DB connection fails
    }
    logInstance(`[INFO] Connected to the SQLite ${dbNameLog} database.`);
    db.run(createTableSql, (tableErr) => {
      if (tableErr) {
        logError(`[ERROR] Error creating/ensuring ${tableName} table in ${dbNameLog}: %s`, tableErr.message);
      } else {
        logInstance(`[INFO] ${dbNameLog}[${tableName}] table ensured.`);
      }
    });
  });
  return db;
}

function initializeReadOnlyDb(dbPath, dbNameLog, tableName, logInstance) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            logError(`[ERROR] Could not connect to ${dbNameLog} database (read-only): %s`, err.message);
            // For read-only, we might not want to exit immediately, depends on criticality
        } else {
            logInstance(`[INFO] Connected to ${dbNameLog} DB (read-only).`);
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (tableErr, row) => {
                if (tableErr) logError(`[ERROR] Error checking ${tableName} table in ${dbNameLog}: %s`, tableErr.message);
                else if (!row) console.warn(`[WARN] '${tableName}' table does not exist in ${dbPath}. Run converter script.`);
                else logInstance(`[INFO] ${dbNameLog}[${tableName}] table found.`);
            });
        }
    });
    return db;
}


const resultsDb = initializeDb(
    RESULTS_DB_PATH, 
    'results',
    `CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL,
        score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL,
        timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER,
        class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT,
        userId INTEGER
    )`,
    'quiz_results',
    logDbResults
);

const questionsDb = initializeReadOnlyDb(QUESTIONS_DB_PATH, 'questions', 'questions', logDbQuestions);
const topicsDb = initializeReadOnlyDb(TOPICS_DB_PATH, 'topics', 'quiz_topics', logDbTopics);

const usersDb = initializeDb(
    USERS_DB_PATH,
    'users',
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT UNIQUE NOT NULL,
        recovery_email TEXT,
        registered_device_id TEXT,
        active_session_token TEXT,
        active_session_token_expires_at TEXT,
        device_change_otp TEXT,
        device_change_otp_expires_at TEXT,
        createdAt TEXT NOT NULL
    )`,
    'users',
    logDbUsers
);


app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => { logApi(`[INFO] Request: ${req.method} ${req.originalUrl}`); next(); });

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; 
const OTP_EXPIRATION_MS = 10 * 60 * 1000;

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' } // Be stricter in production
    });
    logServer('[INFO] Nodemailer transporter configured.');
    transporter.verify((error) => {
       if (error) { logError('[ERROR] Nodemailer transporter verification failed: %s', error); transporter = null; }
       else logServer('[INFO] Nodemailer transporter is ready.');
    });
} else {
    logServer('[WARN] EMAIL_USER or EMAIL_PASS not found in .env. Email sending will be SIMULATED.');
}

const verifySessionToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logApi('[WARN] verifySessionToken - No token provided or invalid format.');
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];
    if (!usersDb || usersDb.open === false) {
        logError('[ERROR] verifySessionToken - Users DB not available.');
        return res.status(503).json({ message: 'Service temporarily unavailable.' });
    }
    usersDb.get("SELECT * FROM users WHERE active_session_token = ?", [token], (err, user) => {
        if (err) {
            logError('[ERROR] verifySessionToken - DB Error: %s', err.message);
            return res.status(500).json({ message: "Server error verifying token." });
        }
        if (!user) {
            logApi('[WARN] verifySessionToken - Invalid session token (user not found for token).');
            return res.status(401).json({ message: "Invalid session token. Please login again." });
        }
        if (new Date() > new Date(user.active_session_token_expires_at)) {
            logApi('[WARN] verifySessionToken - Session token expired for user %s.', user.identifier);
            return res.status(401).json({ message: "Session token expired. Please login again." });
        }
        req.user = { id: user.id, identifier: user.identifier, recoveryEmail: user.recovery_email }; 
        logApi('[INFO] verifySessionToken - Token verified for user ID %s.', user.id);
        next();
    });
};


app.post('/api/users/auth', (req, res) => {
    const { identifier, deviceIdFromClient, recoveryEmail } = req.body;
    logApi('[INFO] POST /api/users/auth - Identifier: %s, DeviceID: %s, RecEmail: %s', identifier, deviceIdFromClient, recoveryEmail || 'N/A');

    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
        return res.status(400).json({ message: 'Identifier is required.', errorCode: 'IDENTIFIER_REQUIRED' });
    }
    if (!deviceIdFromClient) {
        return res.status(400).json({ message: 'Device ID is required.', errorCode: 'DEVICE_ID_REQUIRED' });
    }
    const trimmedIdentifier = identifier.trim();

    if (!usersDb || usersDb.open === false) {
        logError('[ERROR] POST /api/users/auth - Users DB not available.');
        return res.status(503).json({ message: 'Service temporarily unavailable.' });
    }

    usersDb.get("SELECT * FROM users WHERE identifier = ?", [trimmedIdentifier], (err, user) => {
        if (err) {
            logError('[ERROR] /api/users/auth - DB Error looking up user %s: %s', trimmedIdentifier, err.message);
            return res.status(500).json({ message: 'Server error during authentication.' });
        }

        const newSessionToken = generateSecureToken();
        const newSessionTokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();

        if (user) { // User exists
            if (!user.registered_device_id) {
                if (!recoveryEmail && !user.recovery_email) {
                    logApi('[WARN] /api/users/auth - Recovery email required for user %s to link first device.', trimmedIdentifier);
                    return res.status(400).json({ message: 'Recovery email is required to link this first device.', errorCode: 'EMAIL_REQUIRED_FOR_DEVICE_LINK' });
                }
                const finalRecoveryEmail = recoveryEmail || user.recovery_email;
                usersDb.run(
                    "UPDATE users SET registered_device_id = ?, recovery_email = COALESCE(?, recovery_email), active_session_token = ?, active_session_token_expires_at = ? WHERE id = ?",
                    [deviceIdFromClient, finalRecoveryEmail, newSessionToken, newSessionTokenExpiresAt, user.id],
                    function (updateErr) {
                        if (updateErr) {
                            logError('[ERROR] /api/users/auth - DB Error linking device for user %s: %s', trimmedIdentifier, updateErr.message);
                            return res.status(500).json({ message: 'Error linking device.' });
                        }
                        logApi('[SUCCESS] /api/users/auth - Device %s linked for user %s. Logged in.', deviceIdFromClient, trimmedIdentifier);
                        res.status(200).json({ message: 'Login successful, device linked.', user: { id: user.id, name: user.identifier, recoveryEmail: finalRecoveryEmail }, token: newSessionToken });
                    }
                );
            } else if (user.registered_device_id === deviceIdFromClient) {
                usersDb.run(
                    "UPDATE users SET active_session_token = ?, active_session_token_expires_at = ? WHERE id = ?",
                    [newSessionToken, newSessionTokenExpiresAt, user.id],
                    function (updateErr) {
                        if (updateErr) {
                            logError('[ERROR] /api/users/auth - DB Error updating session for user %s: %s', trimmedIdentifier, updateErr.message);
                            return res.status(500).json({ message: 'Error updating session.' });
                        }
                        logApi('[SUCCESS] /api/users/auth - User %s logged in from registered device %s.', trimmedIdentifier, deviceIdFromClient);
                        res.status(200).json({ message: 'Login successful.', user: { id: user.id, name: user.identifier, recoveryEmail: user.recovery_email }, token: newSessionToken });
                    }
                );
            } else {
                logApi('[WARN] /api/users/auth - Device mismatch for user %s. Client: %s, Registered: %s', trimmedIdentifier, deviceIdFromClient, user.registered_device_id);
                res.status(403).json({
                    message: 'This account is linked to a different device. Please request a device change via email using the option below.',
                    errorCode: 'DEVICE_MISMATCH',
                    recoveryEmailMasked: user.recovery_email ? `${user.recovery_email.substring(0, 3)}****@${user.recovery_email.split('@')[1]}` : null
                });
            }
        } else { // New user registration
            if (!recoveryEmail) {
                logApi('[WARN] /api/users/auth - Recovery email required for new registration for identifier %s.', trimmedIdentifier);
                return res.status(400).json({ message: 'Recovery email is required for new registration.', errorCode: 'EMAIL_REQUIRED' });
            }
            const createdAt = new Date().toISOString();
            usersDb.run(
                "INSERT INTO users (identifier, recovery_email, registered_device_id, active_session_token, active_session_token_expires_at, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
                [trimmedIdentifier, recoveryEmail, deviceIdFromClient, newSessionToken, newSessionTokenExpiresAt, createdAt],
                function (insertErr) {
                    if (insertErr) {
                        if (insertErr.code === "SQLITE_CONSTRAINT") {
                            logApi('[WARN] /api/users/auth - Registration failed, identifier %s already taken.', trimmedIdentifier);
                            return res.status(409).json({ message: 'Identifier already taken.' });
                        }
                        logError('[ERROR] /api/users/auth - DB Error registering new user %s: %s', trimmedIdentifier, insertErr.message);
                        return res.status(500).json({ message: 'Error registering user.' });
                    }
                    logApi('[SUCCESS] /api/users/auth - New user %s (ID: %d) registered with device %s.', trimmedIdentifier, this.lastID, deviceIdFromClient);
                    res.status(201).json({ message: 'Registration successful.', user: { id: this.lastID, name: trimmedIdentifier, recoveryEmail: recoveryEmail }, token: newSessionToken });
                }
            );
        }
    });
});


app.post('/api/users/request-device-change', (req, res) => {
    const { identifier } = req.body;
    logApi('[INFO] POST /api/users/request-device-change - User: %s', identifier);

    if (!identifier) return res.status(400).json({ message: "Identifier is required." });
    if (!usersDb || usersDb.open === false) { logError('[ERROR] /api/users/request-device-change - Users DB not available.'); return res.status(503).json({ message: 'Service temporarily unavailable.'});}

    usersDb.get("SELECT id, recovery_email FROM users WHERE identifier = ?", [identifier], (err, user) => {
        if (err) { logError('[ERROR] /api/users/request-device-change - DB Error finding user %s: %s', identifier, err.message); return res.status(500).json({ message: "Server error." }); }
        if (!user) { logApi('[WARN] /api/users/request-device-change - User %s not found.', identifier); return res.status(404).json({ message: "User not found." });}
        if (!user.recovery_email) { logApi('[WARN] /api/users/request-device-change - No recovery email for user %s.', identifier); return res.status(400).json({ message: "No recovery email is set for this account. Cannot proceed." });}

        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();
        
        usersDb.run(
            "UPDATE users SET device_change_otp = ?, device_change_otp_expires_at = ? WHERE id = ?",
            [otp, expiresAt, user.id],
            async (updateErr) => {
                if (updateErr) { logError('[ERROR] /api/users/request-device-change - DB Error updating OTP for user %s: %s', identifier, updateErr.message); return res.status(500).json({ message: "Error preparing device change." });}
                
                if (!transporter) {
                    console.log(`\n--- SIMULATED EMAIL (OTP for Device Change) ---`);
                    console.log(`To: ${user.recovery_email}`);
                    console.log(`Subject: ReactiQuiz - Device Change Verification Code`);
                    console.log(`Body: Hello ${identifier}, Your OTP is: ${otp}. It expires in 10 minutes.`);
                    console.log(`------------------------------------------------\n`);
                    logApi('[SIMULATE] /api/users/request-device-change - OTP %s for user %s (simulated email).', otp, identifier);
                    return res.status(200).json({ message: `SIMULATED: OTP sent to ${user.recovery_email.substring(0,3)}****@${user.recovery_email.split('@')[1]}. Check server console.` });
                }

                const mailOptions = {
                    from: `"ReactiQuiz Support" <${process.env.EMAIL_USER}>`,
                    to: user.recovery_email,
                    subject: 'ReactiQuiz - Device Change Verification Code',
                    text: `Hello ${identifier},\n\nYour One-Time Password (OTP) to authorize a new device for ReactiQuiz is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe ReactiQuiz Team`,
                    html: `<p>Hello ${identifier},</p><p>Your One-Time Password (OTP) to authorize a new device for ReactiQuiz is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br>The ReactiQuiz Team</p>`
                };

                try {
                    await transporter.sendMail(mailOptions);
                    logApi('[SUCCESS] /api/users/request-device-change - Device change OTP sent to %s for user %s.', user.recovery_email, identifier);
                    res.status(200).json({ message: `An OTP has been sent to ${user.recovery_email.substring(0,3)}****@${user.recovery_email.split('@')[1]}. Please check your email.` });
                } catch (emailError) {
                    logError('[ERROR] /api/users/request-device-change - Failed to send email to %s for user %s: %s', user.recovery_email, identifier, emailError.message);
                    console.error("Email sending error details:", emailError);
                    res.status(500).json({ message: "Failed to send OTP email. Please ensure server email configuration is correct or try again later." });
                }
            }
        );
    });
});

app.post('/api/users/confirm-device-change-otp', (req, res) => {
    const { identifier, otp, newDeviceId } = req.body;
    logApi('[INFO] POST /api/users/confirm-device-change-otp - Identifier: %s, OTP: %s, NewDeviceID: %s', identifier, otp, newDeviceId);
    
    if (!identifier || !otp || !newDeviceId) return res.status(400).json({ message: "Identifier, OTP, and new device ID are required." });
    if (!usersDb || usersDb.open === false) { /* ... */ }

    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier], (err, user) => {
        if (err) { logError('[ERROR] /api/users/confirm-device-change-otp - DB Error finding user %s: %s', identifier, err.message); return res.status(500).json({ message: "Server error." });}
        if (!user) { logApi('[WARN] /api/users/confirm-device-change-otp - User %s not found.', identifier); return res.status(404).json({ message: "User not found." });}
        
        if (user.device_change_otp !== otp) {
            logApi('[WARN] /api/users/confirm-device-change-otp - Invalid OTP for user %s.', identifier);
            return res.status(400).json({ message: "Invalid OTP." });
        }
        if (new Date() > new Date(user.device_change_otp_expires_at)) {
            logApi('[WARN] /api/users/confirm-device-change-otp - OTP expired for user %s.', identifier);
            usersDb.run("UPDATE users SET device_change_otp = NULL, device_change_otp_expires_at = NULL WHERE id = ?", [user.id], () => {});
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const newSessionToken = generateSecureToken();
        const newSessionTokenExpiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();

        usersDb.run(
            "UPDATE users SET registered_device_id = ?, active_session_token = ?, active_session_token_expires_at = ?, device_change_otp = NULL, device_change_otp_expires_at = NULL WHERE id = ?",
            [newDeviceId, newSessionToken, newSessionTokenExpiresAt, user.id],
            (updateErr) => {
                if (updateErr) { logError('[ERROR] /api/users/confirm-device-change-otp - DB Error updating device for user %s: %s', identifier, updateErr.message); return res.status(500).json({ message: "Error updating device." });}
                logApi('[SUCCESS] /api/users/confirm-device-change-otp - Device updated for user %s. New session token issued.', user.identifier);
                res.status(200).json({ message: "Device updated successfully. You are now logged in.", user: { id: user.id, name: user.identifier, recoveryEmail: user.recovery_email }, token: newSessionToken });
            }
        );
    });
});


// --- Topics API ---
app.get('/api/topics/:subject', (req, res) => {
    const { subject } = req.params;
    const sql = `SELECT id, name, description, class, genre FROM quiz_topics WHERE subject = ? ORDER BY class, name`;
    if (!topicsDb || !topicsDb.open) return res.status(503).json({ message: 'Topics DB unavailable' });
    topicsDb.all(sql, [subject.toLowerCase()], (err, rows) => {
        if (err) {logError('[ERROR] GET /api/topics/%s - DB Error: %s', subject, err.message); return res.status(500).json({ message: `Failed to fetch topics: ${err.message}` });}
        res.json(rows || []);
    });
});

// --- Questions API ---
app.get('/api/questions/:topicId', (req, res) => {
    const { topicId } = req.params;
    const sql = `SELECT * FROM questions WHERE topicId = ?`;
    if (!questionsDb || !questionsDb.open) return res.status(503).json({ message: 'Questions DB unavailable' });
    questionsDb.all(sql, [topicId], (err, rows) => {
        if (err) {logError('[ERROR] GET /api/questions/%s - DB Error: %s', topicId, err.message); return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });}
        try {
            const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options || '[]') }));
            res.json(questions);
        } catch (parseError) {
            logError('[ERROR] /api/questions/%s - JSON parse error for options: %s', topicId, parseError.message);
            res.status(500).json({message: "Error processing question data."})
        }
    });
});

// --- Results API ---
app.post('/api/results', verifySessionToken, (req, res) => {
  logApi('[INFO] POST /api/results - User ID: %s', req.user.id);
  const { ...newResultData } = req.body;
  const dbUserId = req.user.id;

  const requiredFields = ['subject', 'topicId', 'score', 'totalQuestions', 'percentage', 'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot'];
  const missingFields = requiredFields.filter(field => newResultData[field] == null);
  if (missingFields.length > 0) return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}.` });
  if (!Array.isArray(newResultData.questionsActuallyAttemptedIds)) return res.status(400).json({ message: 'Bad Request: questionsActuallyAttemptedIds not an array.' });
  if (typeof newResultData.userAnswersSnapshot !== 'object' || newResultData.userAnswersSnapshot === null) return res.status(400).json({ message: 'Bad Request: userAnswersSnapshot must be an object.' });

  const { subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class: className, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot } = newResultData;
  const questionsIdsString = JSON.stringify(questionsActuallyAttemptedIds);
  const answersSnapshotString = JSON.stringify(userAnswersSnapshot);

  const insertSql = `INSERT INTO quiz_results (subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const insertParams = [subject, topicId, score, totalQuestions, percentage, timestamp, difficulty || null, numQuestionsConfigured || null, className || null, timeTaken || null, questionsIdsString, answersSnapshotString, dbUserId];
    
  if (!resultsDb || resultsDb.open === false) return res.status(503).json({ message: 'Results DB unavailable' });
  resultsDb.run(insertSql, insertParams, function(err) {
      if (err) {logError('[ERROR] POST /api/results - DB Error inserting for user %s: %s', dbUserId, err.message); return res.status(500).json({ message: `Failed to save result: ${err.message}` });}
      logApi(`[SUCCESS] POST /api/results - Result ID %d saved for user ID %s.`, this.lastID, dbUserId);
      res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
  });
});


app.get('/api/results', verifySessionToken, (req, res) => {
  const dbUserId = req.user.id;
  logApi('[INFO] GET /api/results - Request for user ID %s.', dbUserId);
  
  let sql = "SELECT * FROM quiz_results WHERE userId = ?";
  const params = [dbUserId];
  
  sql += " ORDER BY timestamp DESC";

  if (req.query.limit) {
    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      sql += " LIMIT ?";
      params.push(limit);
    }
  }
  
  if (!resultsDb || !resultsDb.open) return res.status(503).json({ message: 'Results DB unavailable' });
  resultsDb.all(sql, params, (err, rows) => {
    if (err) { logError('[ERROR] GET /api/results - DB Error for user %s: %s', dbUserId, err.message); return res.status(500).json({ message: `Failed to fetch results: ${err.message}` }); }
    try {
        const results = rows.map(row => ({ ...row, questionsActuallyAttemptedIds: JSON.parse(row.questionsActuallyAttemptedIds || '[]'), userAnswersSnapshot: JSON.parse(row.userAnswersSnapshot || '{}') }));
        logApi('[SUCCESS] GET /api/results - Fetched %d results for user ID %s.', results.length, dbUserId);
        res.json(results);
    } catch(parseError) {
        logError('[ERROR] GET /api/results - JSON parse error for user %s: %s', dbUserId, parseError.message);
        res.status(500).json({message: 'Error processing results data.'});
    }
  });
});

app.delete('/api/results/:id', verifySessionToken, (req, res) => {
    const resultIdToDelete = parseInt(req.params.id, 10);
    const dbUserId = req.user.id;
    logApi(`[INFO] DELETE /api/results/%d - Request from user ID %s.`, resultIdToDelete, dbUserId);

    if (isNaN(resultIdToDelete)) return res.status(400).json({ message: 'Invalid result ID.' });
    
    const sql = "DELETE FROM quiz_results WHERE id = ? AND userId = ?";
    
    if (!resultsDb || !resultsDb.open) return res.status(503).json({ message: 'Results DB unavailable' });
    resultsDb.run(sql, [resultIdToDelete, dbUserId], function (err) {
        if (err) { logError('[ERROR] DELETE /api/results - DB Error for user %s, result %d: %s', dbUserId, resultIdToDelete, err.message); return res.status(500).json({ message: `Failed to delete result: ${err.message}` });}
        if (this.changes === 0) { logApi('[WARN] DELETE /api/results - Result %d not found or not owned by user %s.', resultIdToDelete, dbUserId); return res.status(404).json({ message: `Result not found or you do not have permission to delete it.` });}
        logApi('[SUCCESS] DELETE /api/results - Result %d deleted by user %s.', resultIdToDelete, dbUserId);
        res.status(200).json({ message: 'Result deleted successfully.' });
    });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message, recipientEmail } = req.body;
  logApi('[INFO] POST /api/contact - Received contact form submission');

  if (!name || !email || !message || !recipientEmail) {
    logApi('[WARN] POST /api/contact - Missing fields');
    return res.status(400).json({ message: 'All fields are required.' });
  }
  logApi('[SIMULATE] POST /api/contact - Email sending simulated.');
  res.status(200).json({ message: 'Message received (simulated)! Thank you for your feedback.' });
});


// --- Static file serving & Fallback ---
if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
  app.use(express.static(path.join(projectRoot, 'build')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        logServer(`[INFO] Serving index.html for unmatched route: ${req.path}`);
        res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
          if (err) {
            logError('[ERROR] Error sending index.html: %s', err.message);
            res.status(500).send(err.message || 'Error sending index.html');
          }
        });
    } else {
        logApi(`[WARN] Unmatched API route: ${req.method} ${req.originalUrl}`);
        res.status(404).json({message: "API endpoint not found"});
    }
  });
} else {
  logServer('[INFO] Development mode: Static file serving from build directory is NOT enabled.');
}

app.listen(port, () => {
  logServer(`[INFO] Backend API server running on http://localhost:${port}`);
});

process.on('unhandledRejection', (reason, promise) => { logError('[ERROR] Unhandled Rejection:', reason, promise); });
process.on('uncaughtException', (error) => { logError('[ERROR] Uncaught Exception:', error); process.exit(1); });