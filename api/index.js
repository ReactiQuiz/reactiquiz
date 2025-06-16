// --- FULL CODE for api/index.js ---

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const debug = require('debug');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');
const logDbResults = debug('reactiquiz:db:results');
const logDbQuestions = debug('reactiquiz:db:questions');
const logDbTopics = debug('reactiquiz:db:topics');
const logDbUsers = debug('reactiquiz:db:users');
const logDbFriends = debug('reactiquiz:db:friends');
const logDbChallenges = debug('reactiquiz:db:challenges');
const logError = debug('reactiquiz:error');

const app = express();

// IMPORTANT: For Vercel, all writable files must be in the /tmp directory.
// This is a temporary solution; a real database is the next step.
const dbPath = (fileName) => path.join('/tmp', fileName);

const RESULTS_DB_PATH = dbPath('quizResults.db');
const QUESTIONS_DB_PATH = dbPath('quizData.db');
const TOPICS_DB_PATH = dbPath('quizTopics.db');
const USERS_DB_PATH = dbPath('users.db');
const FRIENDS_DB_PATH = dbPath('friends.db');
const CHALLENGES_DB_PATH = dbPath('challenges.db');

logServer(`[INFO] DB Paths set for /tmp directory on Vercel.`);

function initializeDb(dbPath, dbNameLog, createTableSqls, tableNamesArray, logInstance) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            logError(`[ERROR] Could not connect to ${dbNameLog} database: %s`, err.message);
        } else {
            logInstance(`[INFO] Connected to the SQLite ${dbNameLog} database: ${dbPath}`);
            db.serialize(() => {
                createTableSqls.forEach((sql, index) => {
                    const tableName = tableNamesArray[index];
                    db.run(sql, (tableErr) => {
                        if (tableErr) {
                            logError(`[ERROR] Error creating table '${tableName}' in ${dbNameLog}: %s`, tableErr.message);
                        } else {
                            logInstance(`[INFO] Table '${tableName}' in ${dbNameLog} ensured.`);
                        }
                    });
                });
            });
        }
    });
    return db;
}

// Database initializations
const resultsDb = initializeDb(RESULTS_DB_PATH, 'results', [`CREATE TABLE IF NOT EXISTS quiz_results (id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL, score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL, timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER, class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT, userId INTEGER, challenge_id INTEGER)`], ['quiz_results'], logDbResults);
const questionsDb = initializeDb(QUESTIONS_DB_PATH, 'questions', [`CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, topicId TEXT NOT NULL, text TEXT NOT NULL, options TEXT NOT NULL, correctOptionId TEXT NOT NULL, explanation TEXT, difficulty INTEGER)`], ['questions'], logDbQuestions);
const topicsDb = initializeDb(TOPICS_DB_PATH, 'topics', [`CREATE TABLE IF NOT EXISTS quiz_topics (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, class TEXT, genre TEXT, subject TEXT NOT NULL)`], ['quiz_topics'], logDbTopics);
const usersDb = initializeDb(USERS_DB_PATH, 'users', [`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, identifier TEXT UNIQUE NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL, registered_device_id TEXT, active_session_token TEXT, active_session_token_expires_at TEXT, login_otp TEXT, login_otp_expires_at TEXT, device_change_otp TEXT, device_change_otp_expires_at TEXT, createdAt TEXT NOT NULL)`], ['users'], logDbUsers);
const friendsDb = initializeDb(FRIENDS_DB_PATH, 'friends', [`CREATE TABLE IF NOT EXISTS friendships (id INTEGER PRIMARY KEY AUTOINCREMENT, requester_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`], ['friendships'], logDbFriends);
const challengesDb = initializeDb(CHALLENGES_DB_PATH, 'challenges', [`CREATE TABLE IF NOT EXISTS challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, challenger_id INTEGER NOT NULL, challenged_id INTEGER NOT NULL, topic_id TEXT NOT NULL, topic_name TEXT, difficulty TEXT NOT NULL, num_questions INTEGER NOT NULL, quiz_class TEXT, question_ids_json TEXT NOT NULL, challenger_score INTEGER, challenger_percentage REAL, challenger_time_taken INTEGER, challenged_score INTEGER, challenged_percentage REAL, challenged_time_taken INTEGER, status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'challenger_completed', 'completed', 'expired')) DEFAULT 'pending', winner_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, expires_at TEXT, subject TEXT)`], ['challenges'], logDbChallenges);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const OTP_EXPIRATION_MS = 10 * 60 * 1000;
const CHALLENGE_EXPIRATION_DAYS = 7;

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }, // Use App Password here
    });
    logServer('[INFO] Nodemailer transporter configured.');
} else {
    logServer('[WARN] EMAIL_USER or EMAIL_PASS not found. Email sending will be disabled.');
}

const verifySessionToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication token is required.' });
    const token = authHeader.split(' ')[1];
    usersDb.get("SELECT * FROM users WHERE active_session_token = ?", [token], (err, user) => {
        if (err) return res.status(500).json({ message: "Server error verifying token." });
        if (!user) return res.status(401).json({ message: "Invalid session token." });
        if (new Date() > new Date(user.active_session_token_expires_at)) return res.status(401).json({ message: "Session token expired." });
        req.user = { id: user.id, identifier: user.identifier, email: user.email };
        next();
    });
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/users/register', async (req, res) => {
    const { identifier, password, email } = req.body;
    if (!identifier || !password || !email || password.length < 6 || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: 'Valid username, password (min 6 chars), and email are required.' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        usersDb.run("INSERT INTO users (identifier, password, email, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", [identifier.trim(), hashedPassword, email.trim().toLowerCase()], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint")) return res.status(409).json({ message: 'Username or email already taken.' });
                return res.status(500).json({ message: 'Error registering user.' });
            }
            res.status(201).json({ message: 'Registration successful. Please login.' });
        });
    } catch (e) { res.status(500).json({ message: 'Server error during registration.' }); }
});

app.post('/api/users/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Username and password are required.' });
    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Server error.' });
        if (!user) return res.status(401).json({ message: 'Invalid username or password.' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Invalid username or password.' });
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();
        usersDb.run("UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?", [otp, otpExpiresAt, user.id], async (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error preparing login.' });
            if (!transporter) return res.status(503).json({ message: 'Email service is not configured.' });
            try {
                await transporter.sendMail({ from: `"${process.env.EMAIL_SENDER_NAME || 'ReactiQuiz'}" <${process.env.EMAIL_USER}>`, to: user.email, subject: 'ReactiQuiz Login Code', text: `Your OTP is: ${otp}` });
                res.status(200).json({ success: true, message: `An OTP has been sent to your email.` });
            } catch (emailError) { res.status(500).json({ message: 'Failed to send OTP email.' }); }
        });
    });
});

app.post('/api/users/verify-otp', (req, res) => {
    const { identifier, otp, deviceIdFromClient } = req.body;
    if (!identifier || !otp || !deviceIdFromClient) return res.status(400).json({ message: 'Identifier, OTP, and device ID are required.' });
    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found." });
        if (user.login_otp !== otp || new Date() > new Date(user.login_otp_expires_at)) return res.status(400).json({ message: "Invalid or expired OTP." });
        const token = generateSecureToken();
        const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();
        usersDb.run("UPDATE users SET registered_device_id = ?, active_session_token = ?, active_session_token_expires_at = ?, login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [deviceIdFromClient, token, expires, user.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: "Error finalizing login." });
            res.status(200).json({ message: "Login successful.", user: { id: user.id, name: user.identifier, email: user.email }, token });
        });
    });
});

app.post('/api/users/change-password', verifySessionToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Invalid input.' });
    usersDb.get("SELECT password FROM users WHERE id = ?", [req.user.id], async (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'User not found.' });
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(401).json({ message: 'Incorrect old password.' });
        const newHashed = await bcrypt.hash(newPassword, 10);
        usersDb.run("UPDATE users SET password = ? WHERE id = ?", [newHashed, req.user.id], (updErr) => {
            if (updErr) return res.status(500).json({ message: 'Error changing password.' });
            res.status(200).json({ message: 'Password changed successfully.' });
        });
    });
});

app.get('/api/users/search', verifySessionToken, (req, res) => {
    const { username } = req.query;
    if (!username || username.trim().length < 2) return res.status(400).json({ message: 'Search term must be at least 2 characters.' });
    usersDb.all("SELECT id, identifier FROM users WHERE identifier LIKE ? AND id != ? LIMIT 10", [`%${username.trim()}%`, req.user.id], (err, users) => {
        if (err) return res.status(500).json({ message: 'Error searching for users.' });
        res.json(users || []);
    });
});

app.post('/api/friends/request', verifySessionToken, (req, res) => {
    const { receiverUsername } = req.body;
    usersDb.get("SELECT id FROM users WHERE identifier = ?", [receiverUsername.trim()], (err, receiver) => {
        if (err || !receiver) return res.status(404).json({ message: 'User not found.' });
        if (req.user.id === receiver.id) return res.status(400).json({ message: "You cannot friend yourself." });
        friendsDb.get("SELECT * FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)", [req.user.id, receiver.id, receiver.id, req.user.id], (err, existing) => {
            if (existing) return res.status(400).json({ message: 'A friend request or friendship already exists.' });
            friendsDb.run("INSERT INTO friendships (requester_id, receiver_id) VALUES (?, ?)", [req.user.id, receiver.id], function(err) {
                if (err) return res.status(500).json({ message: 'Failed to send friend request.' });
                res.status(201).json({ message: 'Friend request sent.' });
            });
        });
    });
});

app.get('/api/friends/requests/pending', verifySessionToken, (req, res) => {
    friendsDb.all("SELECT f.id as requestId, u.identifier as username, f.created_at FROM friendships f JOIN users u ON f.requester_id = u.id WHERE f.receiver_id = ? AND f.status = 'pending'", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Error fetching requests."});
        res.json(rows || []);
    });
});

app.put('/api/friends/request/:requestId', verifySessionToken, (req, res) => {
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    friendsDb.run("UPDATE friendships SET status = ? WHERE id = ? AND receiver_id = ? AND status = 'pending'", [newStatus, req.params.requestId, req.user.id], function(err) {
        if (err || this.changes === 0) return res.status(500).json({ message: `Failed to ${action} request.` });
        res.status(200).json({ message: `Friend request ${newStatus}.` });
    });
});

app.get('/api/friends', verifySessionToken, (req, res) => {
    const sql = `SELECT u.id as friendId, u.identifier as friendUsername FROM users u JOIN friendships f ON (u.id = f.receiver_id AND f.requester_id = ?) OR (u.id = f.requester_id AND f.receiver_id = ?) WHERE f.status = 'accepted'`;
    friendsDb.all(sql, [req.user.id, req.user.id], (err, rows) => {
        if(err) return res.status(500).json({ message: 'Error fetching friends.' });
        res.json(rows || []);
    });
});

app.delete('/api/friends/unfriend/:friendUserId', verifySessionToken, (req, res) => {
    const friendId = parseInt(req.params.friendUserId, 10);
    const sql = "DELETE FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))";
    friendsDb.run(sql, [req.user.id, friendId, friendId, req.user.id], function(err) {
        if (err || this.changes === 0) return res.status(500).json({ message: 'Failed to unfriend or no friendship found.' });
        res.status(200).json({ message: 'Unfriended successfully.' });
    });
});

app.get('/api/topics/:subject', (req, res) => {
    topicsDb.all("SELECT * FROM quiz_topics WHERE subject = ? ORDER BY class, name", [req.params.subject.toLowerCase()], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch topics' });
        res.json(rows || []);
    });
});

app.get('/api/questions', (req, res) => {
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ message: 'A topicId query parameter is required.' });
    questionsDb.all("SELECT * FROM questions WHERE topicId = ?", [topicId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch questions' });
        try {
            res.json(rows.map(r => ({ ...r, options: JSON.parse(r.options || '[]') })));
        } catch (e) { res.status(500).json({ message: 'Error processing question data' }); }
    });
});

app.post('/api/results', verifySessionToken, (req, res) => {
    const { subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class: className, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id } = req.body;
    const qIdsString = JSON.stringify(questionsActuallyAttemptedIds);
    const answersString = JSON.stringify(userAnswersSnapshot);
    const sql = `INSERT INTO quiz_results (userId, subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, class, timeTaken, questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    resultsDb.run(sql, [req.user.id, subject, topicId, score, totalQuestions, percentage, timestamp, difficulty, numQuestionsConfigured, className, timeTaken, qIdsString, answersString, challenge_id], function (err) {
        if (err) return res.status(500).json({ message: 'Failed to save result' });
        res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
});

app.get('/api/results', verifySessionToken, (req, res) => {
    const { excludeChallenges, limit } = req.query;
    let sql = "SELECT * FROM quiz_results WHERE userId = ?";
    const params = [req.user.id];
    if (excludeChallenges === 'true') sql += " AND challenge_id IS NULL";
    sql += " ORDER BY timestamp DESC";
    if (limit && !isNaN(parseInt(limit))) {
        sql += " LIMIT ?";
        params.push(parseInt(limit));
    }
    resultsDb.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch results' });
        try {
            res.json(rows.map(r => ({...r, questionsActuallyAttemptedIds: JSON.parse(r.questionsActuallyAttemptedIds || '[]'), userAnswersSnapshot: JSON.parse(r.userAnswersSnapshot || '{}')})));
        } catch(e) { res.status(500).json({ message: 'Error processing results' }); }
    });
});

app.delete('/api/results/:id', verifySessionToken, (req, res) => {
    resultsDb.run("DELETE FROM quiz_results WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function(err) {
        if (err || this.changes === 0) return res.status(500).json({ message: 'Failed to delete result or not authorized.' });
        res.status(200).json({ message: 'Result deleted.' });
    });
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message, recipientEmail } = req.body;
    if (!name || !email || !message || !recipientEmail) return res.status(400).json({ message: 'All fields are required.' });
    if (!transporter) return res.status(503).json({ message: 'Email service not configured.' });
    try {
        await transporter.sendMail({ from: `"${name}" <${process.env.EMAIL_USER}>`, to: recipientEmail, subject: 'Contact Form', text: `From ${email}: ${message}` });
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) { res.status(500).json({ message: 'Failed to send message.' }); }
});

// --- Final export for Vercel ---
module.exports = app;