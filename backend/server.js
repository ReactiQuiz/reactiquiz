// --- START OF FILE backend/server.js ---

// backend/server.js
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
const port = process.env.SERVER_PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

// --- DB Paths ---
const DEFAULT_RESULTS_DB_NAME = 'quizResults.db';
const DEFAULT_QUESTIONS_DB_NAME = 'quizData.db';
const DEFAULT_TOPICS_DB_NAME = 'quizTopics.db';
const DEFAULT_USERS_DB_NAME = 'users.db';
const DEFAULT_FRIENDS_DB_NAME = 'friends.db';
const DEFAULT_CHALLENGES_DB_NAME = 'challenges.db';


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
const FRIENDS_DB_PATH = process.env.FRIENDS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.FRIENDS_DATABASE_FILE_PATH.startsWith('./') ? process.env.FRIENDS_DATABASE_FILE_PATH.substring(2) : process.env.FRIENDS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_FRIENDS_DB_NAME);
const CHALLENGES_DB_PATH = process.env.CHALLENGES_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.CHALLENGES_DATABASE_FILE_PATH.startsWith('./') ? process.env.CHALLENGES_DATABASE_FILE_PATH.substring(2) : process.env.CHALLENGES_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_CHALLENGES_DB_NAME);


logServer(`[INFO] Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`[INFO] Questions DB Path: ${QUESTIONS_DB_PATH}`);
logServer(`[INFO] Topics DB Path: ${TOPICS_DB_PATH}`);
logServer(`[INFO] Users DB Path: ${USERS_DB_PATH}`);
logServer(`[INFO] Friends DB Path: ${FRIENDS_DB_PATH}`);
logServer(`[INFO] Challenges DB Path: ${CHALLENGES_DB_PATH}`);



app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => { logApi(`[INFO] Request: ${req.method} ${req.originalUrl}`); next(); });

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const OTP_EXPIRATION_MS = 10 * 60 * 1000;
const CHALLENGE_EXPIRATION_DAYS = 7;

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
    });
    transporter.verify((error) => {
        if (error) { logError('[ERROR] Nodemailer transporter verification failed: %s', error); transporter = null; }
        else logServer('[INFO] Nodemailer transporter is ready.');
    });
} else {
    logServer('[WARN] EMAIL_USER or EMAIL_PASS not found. Email sending will be SIMULATED.');
}


const verifySessionToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];
    if (!usersDb || usersDb.open === false) { 
        return res.status(503).json({ message: 'Service temporarily unavailable.' });
    }
    usersDb.get("SELECT * FROM users WHERE active_session_token = ?", [token], (err, user) => { 
        if (err) return res.status(500).json({ message: "Server error verifying token." });
        if (!user) return res.status(401).json({ message: "Invalid session token. Please login again." });
        if (new Date() > new Date(user.active_session_token_expires_at)) return res.status(401).json({ message: "Session token expired. Please login again." });
        req.user = { id: user.id, identifier: user.identifier, email: user.email };
        next();
    });
};


// --- Static file serving & Fallback ---
if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
    app.use(express.static(path.join(projectRoot, 'build')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
                if (err) res.status(500).send(err.message || 'Error sending index.html');
            });
        } else {
            res.status(404).json({ message: "API endpoint not found" });
        }
    });
}

app.listen(port, () => {
    logServer(`[INFO] Backend API server running on http://localhost:${port}`);
});

process.on('unhandledRejection', (reason, promise) => { logError('[ERROR] Unhandled Rejection:', reason, promise); });
process.on('uncaughtException', (error) => { logError('[ERROR] Uncaught Exception:', error); process.exit(1); })

// --- END OF FILE backend/server.js ---