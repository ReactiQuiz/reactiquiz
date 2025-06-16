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


// --- DB Connections ---
function initializeDb(dbPath, dbNameLog, createTableSqls, tableNamesArray, logInstance) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            logError(`[ERROR] Could not connect to ${dbNameLog} database: %s`, err.message);
            process.exit(1);
        }
        logInstance(`[INFO] Connected to the SQLite ${dbNameLog} database: ${dbPath}`);
        db.serialize(() => {
            createTableSqls.forEach((sql, index) => {
                const tableName = tableNamesArray[index];
                db.run(sql, (tableErr) => {
                    if (tableErr) {
                        logError(`[ERROR] Error creating/ensuring table '${tableName}' in ${dbNameLog}: %s`, tableErr.message);
                    } else {
                        logInstance(`[INFO] Table '${tableName}' in ${dbNameLog} ensured.`);
                    }
                });
            });
        });
    });
    return db;
}

function initializeReadOnlyDb(dbPath, dbNameLog, tableName, logInstance, attachDbs = []) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) { 
            logError(`[ERROR] Could not connect to ${dbNameLog} database (read-only): %s`, err.message); 
            process.exit(1); 
        }
        else {
            logInstance(`[INFO] Connected to ${dbNameLog} DB (read-only): ${dbPath}`);
            
            attachDbs.forEach(attachInfo => {
                const attachPath = attachInfo.path.replace(/\\/g, '/'); 
                db.run(`ATTACH DATABASE '${attachPath}' AS ${attachInfo.alias};`, (attachErr) => {
                    if (attachErr) {
                        logError(`[ERROR] Failed to attach ${attachInfo.alias} (${attachPath}) to ${dbNameLog}Db: %s`, attachErr.message);
                    } else {
                        logInstance(`[INFO] Attached ${attachInfo.alias} (${attachPath}) to ${dbNameLog}Db successfully.`);
                    }
                });
            });

            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (tableErr, row) => {
                if (tableErr) logError(`[ERROR] Error checking ${tableName} table in ${dbNameLog}: %s`, tableErr.message);
                else if (!row) console.warn(`[WARN] '${tableName}' table does not exist in ${dbPath}. Run converter script if needed.`);
                else logInstance(`[INFO] Table '${tableName}' in ${dbNameLog} found.`);
            });
        }
    });
    return db;
}


const resultsDb = initializeDb(RESULTS_DB_PATH, 'results', [`CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT, subject TEXT NOT NULL, topicId TEXT NOT NULL,
    score INTEGER NOT NULL, totalQuestions INTEGER NOT NULL, percentage REAL NOT NULL,
    timestamp TEXT NOT NULL, difficulty TEXT, numQuestionsConfigured INTEGER,
    class TEXT, timeTaken INTEGER, questionsActuallyAttemptedIds TEXT, userAnswersSnapshot TEXT,
    userId INTEGER,
    challenge_id INTEGER
)`], ['quiz_results'], logDbResults);

const questionsDb = initializeReadOnlyDb(
    QUESTIONS_DB_PATH, 
    'questions', 
    'questions', 
    logDbQuestions,
    [{ path: TOPICS_DB_PATH, alias: 'topics_db' }] 
);

const topicsDb = initializeReadOnlyDb(TOPICS_DB_PATH, 'topics', 'quiz_topics', logDbTopics);

const usersDb = initializeDb(
    USERS_DB_PATH,
    'users_db',
    [`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          identifier TEXT UNIQUE NOT NULL,      
          password TEXT NOT NULL,              
          email TEXT NOT NULL,                 
          registered_device_id TEXT,
          active_session_token TEXT,
          active_session_token_expires_at TEXT,
          login_otp TEXT,                      
          login_otp_expires_at TEXT,           
          device_change_otp TEXT,              
          device_change_otp_expires_at TEXT,   
          createdAt TEXT NOT NULL
      )`],
    ['users'],
    logDbUsers
);

const friendsDb = initializeDb(
    FRIENDS_DB_PATH,
    'friends_db',
    [`CREATE TABLE IF NOT EXISTS friendships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requester_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`],
    ['friendships'],
    logDbFriends
);

const challengesDb = initializeDb(
    CHALLENGES_DB_PATH,
    'challenges_db',
    [`CREATE TABLE IF NOT EXISTS challenges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          challenger_id INTEGER NOT NULL,          
          challenged_id INTEGER NOT NULL,          
          topic_id TEXT NOT NULL,
          topic_name TEXT,                         
          difficulty TEXT NOT NULL,
          num_questions INTEGER NOT NULL,
          quiz_class TEXT,                         
          question_ids_json TEXT NOT NULL,         
          challenger_score INTEGER,
          challenger_percentage REAL,
          challenger_time_taken INTEGER,
          challenged_score INTEGER,
          challenged_percentage REAL,
          challenged_time_taken INTEGER,
          status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'challenger_completed', 'completed', 'expired')) DEFAULT 'pending',
          winner_id INTEGER,                       
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP, 
          expires_at TEXT,
          subject TEXT
      )`],
    ['challenges'],
    logDbChallenges
);


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

// --- USER REGISTRATION, LOGIN, PASSWORD MANAGEMENT ---
app.post('/api/users/register', async (req, res) => {
    const { identifier, password, email } = req.body;
    logApi('[REG] Identifier: %s, Email: %s', identifier, email);
    if (!identifier || !password || !email || password.length < 6 || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Valid username, password (min 6 chars), and email are required.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        usersDb.run("INSERT INTO users (identifier, password, email, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", 
            [identifier.trim(), hashedPassword, email.trim().toLowerCase()],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed: users.identifier")) return res.status(409).json({ message: 'Username already taken.' });
                    logError('[ERROR] /reg: %s', err.message); return res.status(500).json({ message: 'Error registering user.' });
                }
                res.status(201).json({ message: 'Registration successful. Please login.' });
            }
        );
    } catch (e) { logError('[ERROR] /reg hash: %s', e.message); res.status(500).json({ message: 'Server error during registration.' }); }
});

app.post('/api/users/login', async (req, res) => {
    const { identifier, password } = req.body;
    logApi('[INFO] POST /api/users/login (OTP Request) - Identifier: %s', identifier);

    if (!identifier || !password) {
        logApi('[WARN] /api/users/login - Missing identifier or password.');
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => { 
        if (err) {
            logError('[ERROR] /api/users/login - DB Error finding user: %s', err.message);
            return res.status(500).json({ message: 'Server error during login.' });
        }
        if (!user) {
            logApi('[WARN] /api/users/login - User %s not found.', identifier);
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            logApi('[WARN] /api/users/login - Password mismatch for user %s.', identifier);
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();
        usersDb.run( 
            "UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?",
            [otp, otpExpiresAt, user.id],
            async (updateErr) => {
                if (updateErr) {
                    logError('[ERROR] /api/users/login - DB Error storing OTP for %s: %s', identifier, updateErr.message);
                    return res.status(500).json({ message: 'Error preparing login. Please try again.' });
                }
                if (!transporter) {
                    logError('[ERROR] /api/users/login - Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env file.');
                    return res.status(503).json({ message: 'The email service is not configured on the server. Cannot send OTP.' });
                }
                const mailOptions = {
                    from: `"${process.env.EMAIL_SENDER_NAME || 'ReactiQuiz Support'}" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'ReactiQuiz - Login Verification Code',
                    text: `Hello ${user.identifier},\n\nYour One-Time Password (OTP) to log in to ReactiQuiz is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email or secure your account.\n\nThanks,\nThe ReactiQuiz Team`,
                    html: `<p>Hello ${user.identifier},</p><p>Your One-Time Password (OTP) to log in to ReactiQuiz is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email or secure your account.</p><p>Thanks,<br>The ReactiQuiz Team</p>`
                };
                try {
                    await transporter.sendMail(mailOptions);
                    logApi('[SUCCESS] /api/users/login - Login OTP sent to %s for user %s.', user.email, identifier);
                    res.status(200).json({ success: true, message: `An OTP has been sent to ${user.email.substring(0, 3)}****@${user.email.split('@')[1]}. Please check your email.` });
                } catch (emailError) {
                    logError('[ERROR] /api/users/login - Failed to send OTP email to %s: %s', user.email, emailError.message);
                    res.status(500).json({ message: 'Failed to send OTP email. Please try again or contact support.' });
                }
            }
        );
    });
});

app.post('/api/users/verify-otp', (req, res) => {
    const { identifier, otp, deviceIdFromClient } = req.body;
    logApi('[VERIFY_OTP] Identifier: %s, DeviceID: %s', identifier, deviceIdFromClient);
    if (!identifier || !otp || !deviceIdFromClient) return res.status(400).json({ message: 'Identifier, OTP, and device ID are required.' });
    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], (err, user) => { 
        if (err) { logError('[ERROR] /verify-otp DB: %s', err.message); return res.status(500).json({ message: "Server error." }); }
        if (!user) { logApi('[WARN] /verify-otp User not found: %s', identifier); return res.status(404).json({ message: "User not found." }); }
        if (user.login_otp !== otp) { logApi('[WARN] /verify-otp Invalid OTP for: %s', identifier); return res.status(400).json({ message: "Invalid OTP." }); }
        if (new Date() > new Date(user.login_otp_expires_at)) {
            logApi('[WARN] /verify-otp OTP expired for: %s', identifier);
            usersDb.run("UPDATE users SET login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [user.id]); 
            return res.status(400).json({ message: "OTP has expired." });
        }
        const token = generateSecureToken();
        const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();
        usersDb.run("UPDATE users SET registered_device_id = ?, active_session_token = ?, active_session_token_expires_at = ?, login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", 
            [deviceIdFromClient, token, expires, user.id], (updateErr) => {
                if (updateErr) { logError('[ERROR] /verify-otp Session update: %s', updateErr.message); return res.status(500).json({ message: "Error finalizing login." }); }
                logApi('[SUCCESS] /verify-otp Login successful for: %s', identifier);
                res.status(200).json({ message: "Login successful.", user: { id: user.id, name: user.identifier, email: user.email }, token });
            });
    });
});

app.post('/api/users/change-password', verifySessionToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!oldPassword || !newPassword || newPassword.length < 6 || oldPassword === newPassword) {
        return res.status(400).json({ message: 'Invalid input for password change.' });
    }
    usersDb.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => { 
        if (err || !user) return res.status(500).json({ message: 'Server error or user not found.' });
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Incorrect old password.' });
        try {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            usersDb.run("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId], (updateErr) => { 
                if (updateErr) return res.status(500).json({ message: 'Error changing password.' });
                res.status(200).json({ message: 'Password changed successfully.' });
            });
        } catch (hashError) { logError('[ERROR] Pwd hash change: %s', hashError.message); res.status(500).json({ message: 'Server error during password change.' }); }
    });
});

app.post('/api/users/reset-password-with-otp', async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Username, OTP, and valid new password are required.' });
    }
    usersDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => { 
        if (err || !user) return res.status(404).json({ message: "User not found or OTP is invalid/expired." });
        if (user.login_otp !== otp || new Date() > new Date(user.login_otp_expires_at)) {
            usersDb.run("UPDATE users SET login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [user.id]); 
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        try {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            usersDb.run("UPDATE users SET password = ?, login_otp = NULL, login_otp_expires_at = NULL, active_session_token = NULL, active_session_token_expires_at = NULL WHERE id = ?", [hashedNewPassword, user.id], (updateErr) => { 
                if (updateErr) return res.status(500).json({ message: "Error resetting password." });
                res.status(200).json({ message: "Password reset successfully." });
            });
        } catch (hashError) { logError('[ERROR] Pwd hash reset: %s', hashError.message); res.status(500).json({ message: 'Server error during password reset.' }); }
    });
});


// --- FRIENDS API ENDPOINTS ---
app.get('/api/users/search', verifySessionToken, (req, res) => {
    const { username } = req.query;
    const currentUserId = req.user.id;
    logApi('[INFO] GET /api/users/search - User ID: %s, Search Term: %s', currentUserId, username);

    if (!username || username.trim().length < 2) {
        return res.status(400).json({ message: 'Username search term must be at least 2 characters.' });
    }
    const searchTerm = `%${username.trim()}%`;

    usersDb.all( 
        "SELECT id, identifier FROM users WHERE identifier LIKE ? AND id != ? LIMIT 10",
        [searchTerm, currentUserId],
        (err, users) => {
            if (err) { logError('[ERROR] /api/users/search - DB error: %s', err.message); return res.status(500).json({ message: 'Error searching for users.' }); }
            logApi('[SUCCESS] /api/users/search - Found %d users for term "%s"', (users || []).length, username);
            res.json(users || []);
        }
    );
});

app.post('/api/friends/request', verifySessionToken, (req, res) => {
    const requesterId = req.user.id;
    const { receiverUsername } = req.body;
    logApi('[INFO] POST /api/friends/request - Requester ID: %s to Username: %s', requesterId, receiverUsername);

    if (!receiverUsername) return res.status(400).json({ message: 'Receiver username is required.' });

    usersDb.get("SELECT id FROM users WHERE identifier = ?", [receiverUsername.trim()], (err, receiver) => { 
        if (err) { logError('[ERROR] /api/friends/request - DB error finding receiver: %s', err.message); return res.status(500).json({ message: 'Error processing request (finding receiver).' }); }
        if (!receiver) { logApi('[WARN] /api/friends/request - Receiver username "%s" not found.', receiverUsername); return res.status(404).json({ message: 'User to send request to not found.' }); }
        const receiverId = receiver.id;

        if (requesterId === receiverId) { logApi('[WARN] /api/friends/request - User %s tried to friend themselves.', requesterId); return res.status(400).json({ message: "You cannot send a friend request to yourself." }); }

        const checkExistingSql = `SELECT * FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)`;
        friendsDb.get(checkExistingSql, [requesterId, receiverId, receiverId, requesterId], (err, existingFriendship) => { 
            if (err) { logError('[ERROR] /api/friends/request - DB error checking existing friendship: %s', err.message); return res.status(500).json({ message: 'Error processing request (checking existing).' }); }
            if (existingFriendship) {
                if (existingFriendship.status === 'accepted') { return res.status(400).json({ message: 'You are already friends with this user.' }); }
                if (existingFriendship.status === 'pending') {
                    if (existingFriendship.requester_id === requesterId) return res.status(400).json({ message: 'Friend request already sent.' });
                    else return res.status(400).json({ message: `This user has already sent you a friend request. Please respond to it.` });
                }
            }
            const insertSql = "INSERT INTO friendships (requester_id, receiver_id, status, created_at, updated_at) VALUES (?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
            friendsDb.run(insertSql, [requesterId, receiverId], function (insertErr) { 
                if (insertErr) {
                    logError('[ERROR] /api/friends/request - DB error inserting request: %s', insertErr.message);
                    return res.status(500).json({ message: 'Failed to send friend request.' });
                }
                logDbFriends('[SUCCESS] Friend request ID %s sent from %s to %s', this.lastID, requesterId, receiverId);
                res.status(201).json({ message: 'Friend request sent successfully.' });
            });
        });
    });
});

app.get('/api/friends/requests/pending', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[INFO] GET /api/friends/requests/pending - User ID: %s', currentUserId);
    
    const sql = `SELECT id as requestId, requester_id as userId, created_at FROM friendships WHERE receiver_id = ? AND status = 'pending' ORDER BY created_at DESC`;
    friendsDb.all(sql, [currentUserId], (err, requests) => { 
        if (err) { logError('[ERROR] /api/friends/requests/pending - DB error: %s', err.message); return res.status(500).json({ message: 'Error fetching pending requests.' }); }
        if (!requests || requests.length === 0) {
            return res.json([]);
        }
        const promises = requests.map(req => {
            return new Promise((resolve, reject) => {
                usersDb.get("SELECT identifier as username FROM users WHERE id = ?", [req.userId], (userErr, userRow) => {
                    if (userErr) return reject(userErr);
                    resolve({ ...req, username: userRow ? userRow.username : 'Unknown User' });
                });
            });
        });
        Promise.all(promises)
            .then(results => {
                logApi('[SUCCESS] /api/friends/requests/pending - Found %d pending requests for user %s', results.length, currentUserId);
                res.json(results);
            })
            .catch(promiseErr => {
                logError('[ERROR] /api/friends/requests/pending - DB error fetching usernames: %s', promiseErr.message);
                res.status(500).json({ message: 'Error resolving user details for requests.' });
            });
    });
});

app.put('/api/friends/request/:requestId', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    const requestId = parseInt(req.params.requestId, 10);
    const { action } = req.body;
    logApi('[INFO] PUT /api/friends/request/%s - User ID: %s, Action: %s', requestId, currentUserId, action);
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });
    if (isNaN(requestId)) return res.status(400).json({ message: 'Invalid request ID.' });
    friendsDb.get("SELECT * FROM friendships WHERE id = ? AND receiver_id = ? AND status = 'pending'", [requestId, currentUserId], (err, request) => { 
        if (err) { logError('[ERROR] /api/friends/request/:requestId - DB error finding request: %s', err.message); return res.status(500).json({ message: 'Error processing request.' }); }
        if (!request) { logApi('[WARN] /api/friends/request/:requestId - Request %s not found or not pending for user %s.', requestId, currentUserId); return res.status(404).json({ message: 'Pending friend request not found or you are not the receiver.' }); }
        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        friendsDb.run("UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [newStatus, requestId], function (updateErr) { 
            if (updateErr) { logError('[ERROR] /api/friends/request/:requestId - DB error updating status: %s', updateErr.message); return res.status(500).json({ message: `Failed to ${action} friend request.` }); }
            logDbFriends('[SUCCESS] Friend request ID %s %s by user %s', requestId, newStatus, currentUserId);
            res.status(200).json({ message: `Friend request ${newStatus}.` });
        });
    });
});

app.get('/api/friends', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[INFO] GET /api/friends - User ID: %s', currentUserId);
    const sql = `SELECT CASE WHEN requester_id = ? THEN receiver_id ELSE requester_id END as friendId, id as friendshipId FROM friendships WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'`;
    friendsDb.all(sql, [currentUserId, currentUserId, currentUserId], (err, friendRelations) => { 
        if (err) { logError('[ERROR] /api/friends - DB error fetching relations: %s', err.message); return res.status(500).json({ message: 'Error fetching friends list (relations).' }); }
        if (!friendRelations || friendRelations.length === 0) {
            return res.json([]);
        }
        const friendIds = friendRelations.map(fr => fr.friendId);
        if (friendIds.length === 0) return res.json([]); 
        const placeholders = friendIds.map(() => '?').join(',');
        const userSql = `SELECT id as friendId, identifier as friendUsername FROM users WHERE id IN (${placeholders}) ORDER BY identifier COLLATE NOCASE ASC`;
        usersDb.all(userSql, friendIds, (userErr, userRows) => { 
            if (userErr) { logError('[ERROR] /api/friends - DB error fetching usernames: %s', userErr.message); return res.status(500).json({ message: 'Error fetching friends list (usernames).' }); }
            const friendsWithUsernames = userRows.map(u => {
                const relation = friendRelations.find(fr => fr.friendId === u.friendId);
                return { ...u, friendshipId: relation ? relation.friendshipId : null };
            });
            logApi('[SUCCESS] /api/friends - Found %d friends for user %s', friendsWithUsernames.length, currentUserId);
            res.json(friendsWithUsernames);
        });
    });
});

app.delete('/api/friends/unfriend/:friendUserId', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    const friendUserIdToRemove = parseInt(req.params.friendUserId, 10);
    logApi('[INFO] DELETE /api/friends/unfriend/%s - Current User ID: %s', friendUserIdToRemove, currentUserId);
    if (isNaN(friendUserIdToRemove)) return res.status(400).json({ message: 'Invalid friend user ID.' });
    if (currentUserId === friendUserIdToRemove) { logApi('[WARN] /api/friends/unfriend - User %s tried to unfriend themselves.', currentUserId); return res.status(400).json({ message: 'Cannot unfriend yourself.' }); }
    const sql = `DELETE FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))`;
    friendsDb.run(sql, [currentUserId, friendUserIdToRemove, friendUserIdToRemove, currentUserId], function (err) { 
        if (err) { logError('[ERROR] /api/friends/unfriend - DB error: %s', err.message); return res.status(500).json({ message: 'Error unfriending user.' }); }
        if (this.changes === 0) { logApi('[WARN] /api/friends/unfriend - No friendship found for %s and %s.', currentUserId, friendUserIdToRemove); return res.status(404).json({ message: 'Friendship not found or already removed.' }); }
        logDbFriends('[SUCCESS] User %s unfriended user %s. Rows affected: %d', currentUserId, friendUserIdToRemove, this.changes);
        res.status(200).json({ message: 'Successfully unfriended.' });
    });
});


// --- CHALLENGE API ENDPOINTS ---
app.post('/api/challenges', verifySessionToken, async (req, res) => {
    const challengerId = req.user.id;
    const { challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject } = req.body;
    logApi('[CHALLENGE] Create - Challenger: %s, Challenged ID: %s, Topic: %s, Subject: %s', challengerId, challenged_friend_id, topic_id, subject);

    if (!challenged_friend_id || !topic_id || !difficulty || !num_questions || !question_ids_json || !subject) {
        return res.status(400).json({ message: 'Missing required challenge parameters (including subject).' });
    }
    let parsedQuestionIds;
    try {
        parsedQuestionIds = JSON.parse(question_ids_json);
        if (!Array.isArray(parsedQuestionIds) || parsedQuestionIds.length !== Number(num_questions)) {
            return res.status(400).json({ message: 'Invalid question set for the challenge (count mismatch).' });
        }
    } catch (e) {
        return res.status(400).json({ message: 'Invalid question_ids_json format.' });
    }
    const challengedIdNum = parseInt(challenged_friend_id, 10);
    if (isNaN(challengedIdNum)) { return res.status(400).json({ message: 'Invalid challenged friend ID format.' }); }
    if (challengerId === challengedIdNum) { return res.status(400).json({ message: "You cannot challenge yourself." }); }

    usersDb.get("SELECT id FROM users WHERE id = ?", [challengedIdNum], (userErr, challengedUser) => { 
        if (userErr || !challengedUser) { return res.status(userErr ? 500 : 404).json({ message: userErr ? 'Server error.' : `Challenged user not found.` }); }
        
        friendsDb.get( 
            "SELECT * FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))",
            [challengerId, challengedIdNum, challengedIdNum, challengerId],
            (friendErr, friendship) => {
                if (friendErr) { logError('[ERROR] /api/challenges - DB error checking friendship: %s', friendErr.message); return res.status(500).json({ message: 'Server error verifying friendship.' }); }
                if (!friendship) { return res.status(403).json({ message: 'You can only challenge users who are your friends.' }); }

                const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
                const insertSql = `INSERT INTO challenges (challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, subject, expires_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
                
                challengesDb.run(insertSql, [challengerId, challengedIdNum, topic_id, topic_name || null, difficulty, num_questions, quiz_class || null, question_ids_json, subject, expiresAt], function (insertErr) { 
                    if (insertErr) { 
                        logError('[ERROR] /api/challenges - DB create error: %s', insertErr.message); 
                        return res.status(500).json({ message: 'Failed to create challenge.' }); 
                    }
                    logDbChallenges('[SUCCESS] Challenge ID %s created by %s for %s', this.lastID, challengerId, challengedIdNum);
                    res.status(201).json({ message: `Challenge sent!`, challengeId: this.lastID });
                });
            }
        );
    });
});


app.get('/api/challenges/pending', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[CHALLENGE] GET Pending for User ID: %s', currentUserId);
    const sql = `SELECT * FROM challenges WHERE challenged_id = ? AND (status = 'pending' OR (status = 'challenger_completed' AND challenged_id = ?)) AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) ORDER BY created_at DESC`;
    challengesDb.all(sql, [currentUserId, currentUserId], async (err, challenges) => { 
        if (err) { logError('[ERROR] /api/challenges/pending: %s', err.message); return res.status(500).json({ message: 'Error fetching pending challenges.' }); }
        if (!challenges || challenges.length === 0) return res.json([]);

        const enrichedChallenges = await Promise.all(challenges.map(async (c) => {
            const [challengerUser, challengedUser] = await Promise.all([
                new Promise((resolve) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [c.challenger_id], (_, row) => resolve(row))),
                new Promise((resolve) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [c.challenged_id], (_, row) => resolve(row)))
            ]);
            return {
                ...c,
                challengerUsername: challengerUser ? challengerUser.identifier : 'Unknown',
                challengedUsername: challengedUser ? challengedUser.identifier : 'Unknown'
            };
        }));
        res.json(enrichedChallenges);
    });
});

app.get('/api/challenges/:challengeId', verifySessionToken, (req, res) => {
    const challengeId = parseInt(req.params.challengeId, 10);
    const userId = req.user.id;
    if (isNaN(challengeId)) return res.status(400).json({ message: 'Invalid challenge ID.' });
    challengesDb.get("SELECT * FROM challenges WHERE id = ?", [challengeId], async (err, challenge) => { 
        if (err || !challenge) return res.status(err ? 500 : 404).json({ message: err ? 'Error fetching.' : 'Challenge not found.' });
        if (challenge.challenger_id !== userId && challenge.challenged_id !== userId) return res.status(403).json({ message: 'Not part of this challenge.' });

        const [challengerUser, challengedUser] = await Promise.all([
            new Promise((resolve) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [challenge.challenger_id], (_, row) => resolve(row))),
            new Promise((resolve) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [challenge.challenged_id], (_, row) => resolve(row)))
        ]);
        
        res.json({ 
            ...challenge, 
            question_ids: JSON.parse(challenge.question_ids_json || '[]'),
            challengerUsername: challengerUser ? challengerUser.identifier : 'Unknown',
            challengedUsername: challengedUser ? challengedUser.identifier : 'Unknown'
        });
    });
});

app.put('/api/challenges/:challengeId/submit', verifySessionToken, (req, res) => {
    const challengeId = parseInt(req.params.challengeId, 10);
    const userId = req.user.id;
    const { score, percentage, timeTaken, resultId } = req.body; 
    logApi('[CHALLENGE] Submit Score - ChallengeID: %s, UserID: %s, Score: %s, ResultID: %s', challengeId, userId, score, resultId);

    if (isNaN(challengeId) || score === undefined || percentage === undefined || timeTaken === undefined || resultId === undefined) {
        return res.status(400).json({ message: 'Missing parameters for challenge submission.' });
    }
    challengesDb.get("SELECT * FROM challenges WHERE id = ?", [challengeId], (err, challenge) => { 
        if (err || !challenge) return res.status(err ? 500 : 404).json({ message: err ? 'Error.' : 'Challenge not found.' });
        let updateFields = [], params = [], newStatus = challenge.status;
        
        if (challenge.challenger_id === userId) {
            if (challenge.status !== 'pending' && challenge.status !== 'accepted') return res.status(400).json({ message: 'Challenger cannot submit score at this stage.' });
            updateFields = ['challenger_score = ?', 'challenger_percentage = ?', 'challenger_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = challenge.challenged_score !== null ? 'completed' : 'challenger_completed';
        } else if (challenge.challenged_id === userId) {
            if (challenge.status !== 'pending' && challenge.status !== 'accepted' && challenge.status !== 'challenger_completed') {
                return res.status(400).json({ message: 'Challenged user cannot submit score at this stage.' });
            }
            updateFields = ['challenged_score = ?', 'challenged_percentage = ?', 'challenged_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = (challenge.challenger_score !== null || challenge.status === 'challenger_completed') ? 'completed' : 'pending'; 
            if(challenge.status === 'pending' && challenge.challenger_score === null){ 
                 if (challenge.challenger_score === null) {
                    newStatus = 'completed'; 
                 } else {
                    newStatus = 'completed';
                 }
            } else {
                newStatus = 'completed';
            }

        } else { return res.status(403).json({ message: 'Not part of this challenge.' }); }

        updateFields.push('status = ?'); params.push(newStatus);
        if (newStatus === 'completed') {
            const cScore = (challenge.challenger_id === userId) ? score : challenge.challenger_score;
            const dScore = (challenge.challenged_id === userId) ? score : challenge.challenged_score;
            if (cScore > dScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenger_id); }
            else if (dScore > cScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenged_id); }
        }
        params.push(challengeId);
        const updateSql = `UPDATE challenges SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        challengesDb.run(updateSql, params, function (updateErr) {
            if (updateErr) { logError('[ERROR] Challenge submit update: %s', updateErr.message); return res.status(500).json({ message: 'Failed to submit score.' }); }
            
            resultsDb.run("UPDATE quiz_results SET challenge_id = ? WHERE id = ? AND userId = ?", [challengeId, resultId, userId], (linkErr) => {
                if (linkErr) logError('[ERROR] Link result %s to challenge %s for user %s: %s', resultId, challengeId, userId, linkErr.message);
            });
            
            logDbChallenges('[SUCCESS] Score for challenge %s by user %s. Status: %s', challengeId, userId, newStatus);
            res.status(200).json({ message: 'Challenge score submitted.', status: newStatus });
        });
    });
});

app.get('/api/challenges/history', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[CHALLENGE] GET History for User ID: %s', currentUserId);
    const sql = `SELECT * FROM challenges WHERE (challenger_id = ? OR challenged_id = ?) AND status IN ('completed', 'declined', 'expired') ORDER BY updated_at DESC`;
    challengesDb.all(sql, [currentUserId, currentUserId], async (err, challenges) => { 
        if (err) { 
            logError('[ERROR] /api/challenges/history - DB error fetching challenges: %s', err.message); 
            return res.status(500).json({ message: 'Error fetching challenge history.' }); 
        }
        if (!challenges || challenges.length === 0) return res.json([]);
        
        try {
            const enrichedChallenges = await Promise.all(challenges.map(async (c) => {
                const [challengerUser, challengedUser, winnerUser] = await Promise.all([
                    new Promise((resolve, reject) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [c.challenger_id], (e, row) => e ? reject(e) : resolve(row))),
                    new Promise((resolve, reject) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [c.challenged_id], (e, row) => e ? reject(e) : resolve(row))),
                    c.winner_id ? new Promise((resolve, reject) => usersDb.get("SELECT identifier FROM users WHERE id = ?", [c.winner_id], (e, row) => e ? reject(e) : resolve(row))) : Promise.resolve(null)
                ]);
                return {
                    ...c,
                    challengerUsername: challengerUser ? challengerUser.identifier : 'Unknown',
                    challengedUsername: challengedUser ? challengedUser.identifier : 'Unknown',
                    winnerUsername: winnerUser ? winnerUser.identifier : null
                };
            }));
            res.json(enrichedChallenges);
        } catch (enrichErr) {
            logError('[ERROR] /api/challenges/history - DB error enriching challenges: %s', enrichErr.message);
            res.status(500).json({ message: 'Error processing challenge history details.' });
        }
    });
});


app.get('/api/topics/:subject', (req, res) => {
    const { subject } = req.params;
    logApi('[INFO] GET /api/topics/%s', subject);
    const sql = `SELECT id, name, description, class, genre, subject FROM quiz_topics WHERE subject = ? ORDER BY class, name`; 

    if (!topicsDb || topicsDb.open === false) { 
        logError('[ERROR] /api/topics - Topics DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Topics data cannot be fetched.' });
    }

    topicsDb.all(sql, [subject.toLowerCase()], (err, rows) => {
        if (err) {
            logError('[ERROR] GET /api/topics/%s - DB Error: %s', subject, err.message);
            return res.status(500).json({ message: `Failed to fetch topics: ${err.message}` });
        }
        logApi('[SUCCESS] GET /api/topics/%s - Found %d topics', subject, (rows || []).length);
        res.json(rows || []);
    });
});

// --- Questions API ---
// <<< THIS IS THE CORRECTED ROUTE >>>
app.get('/api/questions', (req, res) => {
    // We get the topicId from the query string, e.g., /api/questions?topicId=some-id
    const { topicId } = req.query; 
    
    logApi('[INFO] GET /api/questions for topicId: %s', topicId);

    // Handle case where no topicId is provided
    if (!topicId) {
        return res.status(400).json({ message: 'A topicId query parameter is required.' });
    }

    const sql = `
        SELECT 
            q.*, 
            qt.subject, 
            qt.class as class
        FROM questions q
        LEFT JOIN topics_db.quiz_topics qt ON q.topicId = qt.id 
        WHERE q.topicId = ?
    `;

    if (!questionsDb || questionsDb.open === false) { 
        logError('[ERROR] /api/questions - Questions DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Questions data cannot be fetched.' });
    }

    questionsDb.all(sql, [topicId], (err, rows) => {
        if (err) {
            logError('[ERROR] GET /api/questions?topicId=%s - DB Error: %s', topicId, err.message);
            return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });
        }
        try {
            const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options || '[]') }));
            logApi('[SUCCESS] GET /api/questions?topicId=%s - Found %d questions', topicId, questions.length);
            res.json(questions);
        } catch (parseError) {
            logError('[ERROR] /api/questions?topicId=%s - JSON parse error for options: %s', topicId, parseError.message);
            res.status(500).json({ message: "Error processing question data." })
        }
    });
});


// --- Results API ---
app.post('/api/results', verifySessionToken, (req, res) => {
    const dbUserId = req.user.id; 
    logApi('[INFO] POST /api/results - User ID: %s', dbUserId);
    const {
        subject, topicId, score, totalQuestions, percentage, timestamp,
        difficulty, numQuestionsConfigured, class: className, timeTaken,
        questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id 
    } = req.body;

    const requiredFields = ['subject', 'topicId', 'score', 'totalQuestions', 'percentage', 'timestamp', 'questionsActuallyAttemptedIds', 'userAnswersSnapshot'];
    const missingFields = requiredFields.filter(field => req.body[field] == null);
    if (missingFields.length > 0) {
        logApi('[WARN] POST /api/results - Missing fields: %s', missingFields.join(', '));
        return res.status(400).json({ message: `Missing fields: ${missingFields.join(', ')}.` });
    }
    if (!Array.isArray(questionsActuallyAttemptedIds)) {
        logApi('[WARN] POST /api/results - questionsActuallyAttemptedIds not an array');
        return res.status(400).json({ message: 'Bad Request: questionsActuallyAttemptedIds must be an array.' });
    }
    if (typeof userAnswersSnapshot !== 'object' || userAnswersSnapshot === null) {
        logApi('[WARN] POST /api/results - userAnswersSnapshot not an object');
        return res.status(400).json({ message: 'Bad Request: userAnswersSnapshot must be an object.' });
    }

    const questionsIdsString = JSON.stringify(questionsActuallyAttemptedIds);
    const answersSnapshotString = JSON.stringify(userAnswersSnapshot);

    const insertSql = `INSERT INTO quiz_results (
        userId, subject, topicId, score, totalQuestions, percentage, timestamp, 
        difficulty, numQuestionsConfigured, class, timeTaken, 
        questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertParams = [
        dbUserId, subject, topicId, score, totalQuestions, percentage, timestamp,
        difficulty || null, numQuestionsConfigured || null, className || null, timeTaken || null,
        questionsIdsString, answersSnapshotString, challenge_id || null 
    ];

    if (!resultsDb || resultsDb.open === false) {
        logError('[ERROR] POST /api/results - Results DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Cannot save result.' });
    }
    resultsDb.run(insertSql, insertParams, function (err) {
        if (err) {
            logError('[ERROR] POST /api/results - DB Error inserting for user %s: %s', dbUserId, err.message);
            return res.status(500).json({ message: `Failed to save result: ${err.message}` });
        }
        logDbResults('[SUCCESS] POST /api/results - Result ID %d saved for user ID %s. Challenge ID: %s', this.lastID, dbUserId, challenge_id || 'N/A');
        res.status(201).json({ message: 'Result saved successfully!', id: this.lastID });
    });
});

// GET all results for the logged-in user OR recent results excluding challenges
app.get('/api/results', verifySessionToken, (req, res) => {
    const dbUserId = req.user.id;
    const excludeChallenges = req.query.excludeChallenges === 'true';
    logApi('[INFO] GET /api/results - User ID: %s. Exclude Challenges: %s', dbUserId, excludeChallenges);

    let sql = "SELECT * FROM quiz_results WHERE userId = ?";
    const params = [dbUserId];

    if (excludeChallenges) {
        sql += " AND challenge_id IS NULL";
    }

    sql += " ORDER BY timestamp DESC";

    if (req.query.limit) {
        const limit = parseInt(req.query.limit, 10);
        if (!isNaN(limit) && limit > 0) {
            sql += " LIMIT ?";
            params.push(limit);
        }
    }

    if (!resultsDb || resultsDb.open === false) {
        logError('[ERROR] GET /api/results - Results DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Cannot fetch results.' });
    }
    resultsDb.all(sql, params, (err, rows) => {
        if (err) {
            logError('[ERROR] GET /api/results - DB Error for user %s: %s', dbUserId, err.message);
            return res.status(500).json({ message: `Failed to fetch results: ${err.message}` });
        }
        try {
            const results = rows.map(row => ({
                ...row,
                questionsActuallyAttemptedIds: JSON.parse(row.questionsActuallyAttemptedIds || '[]'),
                userAnswersSnapshot: JSON.parse(row.userAnswersSnapshot || '{}')
            }));
            logDbResults('[SUCCESS] GET /api/results - Fetched %d results for user ID %s.', results.length, dbUserId);
            res.json(results);
        } catch (parseError) {
            logError('[ERROR] GET /api/results - JSON parse error for user %s: %s', dbUserId, parseError.message);
            res.status(500).json({ message: 'Error processing results data.' });
        }
    });
});

// DELETE a specific result for the logged-in user
app.delete('/api/results/:id', verifySessionToken, (req, res) => {
    const resultIdToDelete = parseInt(req.params.id, 10);
    const dbUserId = req.user.id;
    logApi(`[INFO] DELETE /api/results/%d - Request from user ID %s.`, resultIdToDelete, dbUserId);

    if (isNaN(resultIdToDelete)) {
        logApi('[WARN] DELETE /api/results - Invalid result ID: %s', req.params.id);
        return res.status(400).json({ message: 'Invalid result ID.' });
    }

    const sql = "DELETE FROM quiz_results WHERE id = ? AND userId = ?";

    if (!resultsDb || resultsDb.open === false) {
        logError('[ERROR] DELETE /api/results - Results DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Cannot delete result.' });
    }
    resultsDb.run(sql, [resultIdToDelete, dbUserId], function (err) {
        if (err) {
            logError('[ERROR] DELETE /api/results - DB Error for user %s, result %d: %s', dbUserId, resultIdToDelete, err.message);
            return res.status(500).json({ message: `Failed to delete result: ${err.message}` });
        }
        if (this.changes === 0) {
            logApi('[WARN] DELETE /api/results - Result %d not found or not owned by user %s.', resultIdToDelete, dbUserId);
            return res.status(404).json({ message: `Result not found or you do not have permission to delete it.` });
        }
        logDbResults('[SUCCESS] DELETE /api/results - Result %d deleted by user %s.', resultIdToDelete, dbUserId);
        res.status(200).json({ message: 'Result deleted successfully.' });
    });
});

// --- Contact API ---
app.post('/api/contact', async (req, res) => {
    const { name, email, message, recipientEmail } = req.body;
    logApi('[INFO] POST /api/contact - From: %s <%s> To: %s', name, email, recipientEmail);

    if (!name || !email || !message || !recipientEmail) {
        logApi('[WARN] POST /api/contact - Missing fields');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!transporter) {
        logError('[ERROR] POST /api/contact - Email service not configured.');
        return res.status(503).json({ message: 'The email service is not configured on the server. Message cannot be sent.' });
    }

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: recipientEmail,
        subject: `Contact Form Submission from ${name} via ReactiQuiz`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        logApi('[SUCCESS] POST /api/contact - Contact email sent successfully.');
        res.status(200).json({ message: 'Message sent successfully! Thank you for your feedback.' });
    } catch (error) {
        logError('[ERROR] POST /api/contact - Failed to send contact email: %s', error.message);
        console.error("Full contact email error:", error);
        res.status(500).json({ message: 'Failed to send message. Please try again later or use the direct email link.' });
    }
});


// --- PASSWORD RESET REQUEST ---
app.post('/api/users/request-password-reset', async (req, res) => {
    const { identifier } = req.body; 
    logApi('[INFO] POST /api/users/request-password-reset - Identifier: %s', identifier);

    if (!identifier) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    usersDb.get("SELECT id, email FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => { 
        if (err) {
            logError('[ERROR] /request-password-reset - DB Error finding user: %s', err.message);
            return res.status(500).json({ message: 'Server error while finding user.' });
        }
        if (!user || !user.email) {
            logApi('[INFO] /request-password-reset - User %s not found or no email associated. Sending generic response.', identifier);
            return res.status(200).json({ message: 'If an account with that username exists and has an email address, a password reset OTP has been sent.' });
        }

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();

        usersDb.run( 
            "UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?",
            [otp, otpExpiresAt, user.id],
            async (updateErr) => {
                if (updateErr) {
                    logError('[ERROR] /request-password-reset - DB Error storing OTP for %s: %s', identifier, updateErr.message);
                    return res.status(500).json({ message: 'Error initiating password reset. Please try again.' });
                }

                if (!transporter) {
                    logError('[ERROR] /request-password-reset - Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env file.');
                    return res.status(503).json({ message: 'The email service is not configured on the server. Cannot send OTP.' });
                }

                const mailOptions = {
                    from: `"${process.env.EMAIL_SENDER_NAME || 'ReactiQuiz Support'}" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'ReactiQuiz - Password Reset Code',
                    text: `Hello ${identifier},\n\nYour One-Time Password (OTP) to reset your ReactiQuiz password is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe ReactiQuiz Team`,
                    html: `<p>Hello ${identifier},</p><p>Your One-Time Password (OTP) to reset your ReactiQuiz password is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br>The ReactiQuiz Team</p>`
                };
                try {
                    await transporter.sendMail(mailOptions);
                    logApi('[SUCCESS] /request-password-reset - Password reset OTP sent to %s for user %s.', user.email, identifier);
                    res.status(200).json({ message: `If an account with that username exists and has an email address, a password reset OTP has been sent to ${user.email.substring(0, 3)}****. Please check your email.` });
                } catch (emailError) {
                    logError('[ERROR] /request-password-reset - Failed to send OTP email to %s: %s', user.email, emailError.message);
                    res.status(500).json({ message: 'Failed to send OTP email. Please try again or contact support if the issue persists.' });
                }
            }
        );
    });
});

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