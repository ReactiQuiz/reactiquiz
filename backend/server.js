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
const DEFAULT_USERS_DB_NAME = 'users.db'; // Consolidated DB for users, friends, challenges

const RESULTS_DB_PATH = process.env.DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.DATABASE_FILE_PATH.startsWith('./') ? process.env.DATABASE_FILE_PATH.substring(2) : process.env.DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_RESULTS_DB_NAME);
const QUESTIONS_DB_PATH = process.env.QUESTIONS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.QUESTIONS_DATABASE_FILE_PATH.startsWith('./') ? process.env.QUESTIONS_DATABASE_FILE_PATH.substring(2) : process.env.QUESTIONS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_QUESTIONS_DB_NAME);
const TOPICS_DB_PATH = process.env.TOPICS_DATABASE_FILE_PATH
    ? path.resolve(projectRoot, process.env.TOPICS_DATABASE_FILE_PATH.startsWith('./') ? process.env.TOPICS_DATABASE_FILE_PATH.substring(2) : process.env.TOPICS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_TOPICS_DB_NAME);
const MAIN_DB_PATH = process.env.USERS_DATABASE_FILE_PATH // Using USERS_DATABASE_FILE_PATH for main DB
    ? path.resolve(projectRoot, process.env.USERS_DATABASE_FILE_PATH.startsWith('./') ? process.env.USERS_DATABASE_FILE_PATH.substring(2) : process.env.USERS_DATABASE_FILE_PATH)
    : path.join(__dirname, DEFAULT_USERS_DB_NAME);


logServer(`[INFO] Results DB Path: ${RESULTS_DB_PATH}`);
logServer(`[INFO] Questions DB Path: ${QUESTIONS_DB_PATH}`);
logServer(`[INFO] Topics DB Path: ${TOPICS_DB_PATH}`);
logServer(`[INFO] Main App (Users, Friends, Challenges) DB Path: ${MAIN_DB_PATH}`);

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

function initializeReadOnlyDb(dbPath, dbNameLog, tableName, logInstance) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) { logError(`[ERROR] Could not connect to ${dbNameLog} database (read-only): %s`, err.message); }
        else {
            logInstance(`[INFO] Connected to ${dbNameLog} DB (read-only): ${dbPath}`);
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
    challenge_id INTEGER, 
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL 
)`], ['quiz_results'], logDbResults);

const questionsDb = initializeReadOnlyDb(QUESTIONS_DB_PATH, 'questions', 'questions', logDbQuestions);
const topicsDb = initializeReadOnlyDb(TOPICS_DB_PATH, 'topics', 'quiz_topics', logDbTopics);

const mainDb = initializeDb(
    MAIN_DB_PATH,
    'main_app_db',
    [
        `CREATE TABLE IF NOT EXISTS users (
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
      )`,
        `CREATE TABLE IF NOT EXISTS friendships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requester_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE (requester_id, receiver_id) 
      )`,
        `CREATE TABLE IF NOT EXISTS challenges (
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
          expires_at TEXT,                         
          FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (challenged_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
      )`
    ],
    ['users', 'friendships', 'challenges'],
    logDbUsers
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
    if (!mainDb || mainDb.open === false) {
        return res.status(503).json({ message: 'Service temporarily unavailable.' });
    }
    mainDb.get("SELECT * FROM users WHERE active_session_token = ?", [token], (err, user) => {
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
        mainDb.run("INSERT INTO users (identifier, password, email, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
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

    mainDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => {
        if (err) {
            logError('[ERROR] /api/users/login - DB Error finding user: %s', err.message);
            return res.status(500).json({ message: 'Server error during login.' });
        }
        if (!user) {
            logApi('[WARN] /api/users/login - User %s not found.', identifier);
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Compare provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            logApi('[WARN] /api/users/login - Password mismatch for user %s.', identifier);
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Credentials are valid, now generate and send OTP
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();

        mainDb.run(
            "UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?",
            [otp, otpExpiresAt, user.id],
            async (updateErr) => {
                if (updateErr) {
                    logError('[ERROR] /api/users/login - DB Error storing OTP for %s: %s', identifier, updateErr.message);
                    return res.status(500).json({ message: 'Error preparing login. Please try again.' });
                }

                // Send OTP via email
                if (!transporter) {
                    console.log(`\n--- SIMULATED EMAIL (Login OTP) ---`);
                    console.log(`To: ${user.email}`);
                    console.log(`For User: ${identifier}`);
                    console.log(`Subject: ReactiQuiz - Login Verification Code`);
                    console.log(`Body: Your OTP for ReactiQuiz is: ${otp}. It expires in 10 minutes.`);
                    console.log(`-----------------------------------\n`);
                    logApi('[SIMULATE] /api/users/login - OTP %s sent to %s for user %s (simulated).', otp, user.email, identifier);
                    return res.status(200).json({ success: true, message: `SIMULATED: OTP sent to ${user.email.substring(0, 3)}****@${user.email.split('@')[1]}. Check server console.` });
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
    mainDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], (err, user) => {
        if (err) { logError('[ERROR] /verify-otp DB: %s', err.message); return res.status(500).json({ message: "Server error." }); }
        if (!user) { logApi('[WARN] /verify-otp User not found: %s', identifier); return res.status(404).json({ message: "User not found." }); }
        if (user.login_otp !== otp) { logApi('[WARN] /verify-otp Invalid OTP for: %s', identifier); return res.status(400).json({ message: "Invalid OTP." }); }
        if (new Date() > new Date(user.login_otp_expires_at)) {
            logApi('[WARN] /verify-otp OTP expired for: %s', identifier);
            mainDb.run("UPDATE users SET login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [user.id]);
            return res.status(400).json({ message: "OTP has expired." });
        }
        const token = generateSecureToken();
        const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString();
        mainDb.run("UPDATE users SET registered_device_id = ?, active_session_token = ?, active_session_token_expires_at = ?, login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?",
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
    mainDb.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => {
        if (err || !user) return res.status(500).json({ message: 'Server error or user not found.' });
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) return res.status(401).json({ message: 'Incorrect old password.' });
        try {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            mainDb.run("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId], (updateErr) => {
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
    mainDb.get("SELECT * FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => {
        if (err || !user) return res.status(404).json({ message: "User not found or OTP is invalid/expired." });
        if (user.login_otp !== otp || new Date() > new Date(user.login_otp_expires_at)) {
            mainDb.run("UPDATE users SET login_otp = NULL, login_otp_expires_at = NULL WHERE id = ?", [user.id]);
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        try {
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            mainDb.run("UPDATE users SET password = ?, login_otp = NULL, login_otp_expires_at = NULL, active_session_token = NULL, active_session_token_expires_at = NULL WHERE id = ?", [hashedNewPassword, user.id], (updateErr) => {
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

    mainDb.all(
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

    mainDb.get("SELECT id FROM users WHERE identifier = ?", [receiverUsername.trim()], (err, receiver) => {
        if (err) { logError('[ERROR] /api/friends/request - DB error finding receiver: %s', err.message); return res.status(500).json({ message: 'Error processing request (finding receiver).' }); }
        if (!receiver) { logApi('[WARN] /api/friends/request - Receiver username "%s" not found.', receiverUsername); return res.status(404).json({ message: 'User to send request to not found.' }); }
        const receiverId = receiver.id;

        if (requesterId === receiverId) { logApi('[WARN] /api/friends/request - User %s tried to friend themselves.', requesterId); return res.status(400).json({ message: "You cannot send a friend request to yourself." }); }

        const checkExistingSql = `SELECT * FROM friendships WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)`;
        mainDb.get(checkExistingSql, [requesterId, receiverId, receiverId, requesterId], (err, existingFriendship) => {
            if (err) { logError('[ERROR] /api/friends/request - DB error checking existing friendship: %s', err.message); return res.status(500).json({ message: 'Error processing request (checking existing).' }); }
            if (existingFriendship) {
                if (existingFriendship.status === 'accepted') { return res.status(400).json({ message: 'You are already friends with this user.' }); }
                if (existingFriendship.status === 'pending') {
                    if (existingFriendship.requester_id === requesterId) return res.status(400).json({ message: 'Friend request already sent.' });
                    else return res.status(400).json({ message: `This user has already sent you a friend request. Please respond to it.` });
                }
            }
            const insertSql = "INSERT INTO friendships (requester_id, receiver_id, status, created_at, updated_at) VALUES (?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
            mainDb.run(insertSql, [requesterId, receiverId], function (insertErr) {
                if (insertErr) {
                    if (insertErr.message.includes("UNIQUE constraint failed")) return res.status(409).json({ message: 'An interaction with this user already exists or is pending.' });
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
    const sql = `SELECT f.id as requestId, u.id as userId, u.identifier as username, f.created_at FROM friendships f JOIN users u ON f.requester_id = u.id WHERE f.receiver_id = ? AND f.status = 'pending' ORDER BY f.created_at DESC`;
    mainDb.all(sql, [currentUserId], (err, rows) => {
        if (err) { logError('[ERROR] /api/friends/requests/pending - DB error: %s', err.message); return res.status(500).json({ message: 'Error fetching pending requests.' }); }
        logApi('[SUCCESS] /api/friends/requests/pending - Found %d pending requests for user %s', (rows || []).length, currentUserId);
        res.json(rows || []);
    });
});

app.put('/api/friends/request/:requestId', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    const requestId = parseInt(req.params.requestId, 10);
    const { action } = req.body;
    logApi('[INFO] PUT /api/friends/request/%s - User ID: %s, Action: %s', requestId, currentUserId, action);
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action.' });
    if (isNaN(requestId)) return res.status(400).json({ message: 'Invalid request ID.' });
    mainDb.get("SELECT * FROM friendships WHERE id = ? AND receiver_id = ? AND status = 'pending'", [requestId, currentUserId], (err, request) => {
        if (err) { logError('[ERROR] /api/friends/request/:requestId - DB error finding request: %s', err.message); return res.status(500).json({ message: 'Error processing request.' }); }
        if (!request) { logApi('[WARN] /api/friends/request/:requestId - Request %s not found or not pending for user %s.', requestId, currentUserId); return res.status(404).json({ message: 'Pending friend request not found or you are not the receiver.' }); }
        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        mainDb.run("UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [newStatus, requestId], function (updateErr) {
            if (updateErr) { logError('[ERROR] /api/friends/request/:requestId - DB error updating status: %s', updateErr.message); return res.status(500).json({ message: `Failed to ${action} friend request.` }); }
            logDbFriends('[SUCCESS] Friend request ID %s %s by user %s', requestId, newStatus, currentUserId);
            res.status(200).json({ message: `Friend request ${newStatus}.` });
        });
    });
});

app.get('/api/friends', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[INFO] GET /api/friends - User ID: %s', currentUserId);
    const sql = `SELECT u.id as friendId, u.identifier as friendUsername, f.id as friendshipId FROM friendships f JOIN users u ON (f.requester_id = u.id AND f.receiver_id = ?) OR (f.receiver_id = u.id AND f.requester_id = ?) WHERE f.status = 'accepted' AND u.id != ? ORDER BY u.identifier COLLATE NOCASE ASC`;
    mainDb.all(sql, [currentUserId, currentUserId, currentUserId], (err, rows) => {
        if (err) { logError('[ERROR] /api/friends - DB error: %s', err.message); return res.status(500).json({ message: 'Error fetching friends list.' }); }
        logApi('[SUCCESS] /api/friends - Found %d friends for user %s', (rows || []).length, currentUserId);
        res.json(rows || []);
    });
});

app.delete('/api/friends/unfriend/:friendUserId', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    const friendUserIdToRemove = parseInt(req.params.friendUserId, 10);
    logApi('[INFO] DELETE /api/friends/unfriend/%s - Current User ID: %s', friendUserIdToRemove, currentUserId);
    if (isNaN(friendUserIdToRemove)) return res.status(400).json({ message: 'Invalid friend user ID.' });
    if (currentUserId === friendUserIdToRemove) { logApi('[WARN] /api/friends/unfriend - User %s tried to unfriend themselves.', currentUserId); return res.status(400).json({ message: 'Cannot unfriend yourself.' }); }
    const sql = `DELETE FROM friendships WHERE status = 'accepted' AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))`;
    mainDb.run(sql, [currentUserId, friendUserIdToRemove, friendUserIdToRemove, currentUserId], function (err) {
        if (err) { logError('[ERROR] /api/friends/unfriend - DB error: %s', err.message); return res.status(500).json({ message: 'Error unfriending user.' }); }
        if (this.changes === 0) { logApi('[WARN] /api/friends/unfriend - No friendship found for %s and %s.', currentUserId, friendUserIdToRemove); return res.status(404).json({ message: 'Friendship not found or already removed.' }); }
        logDbFriends('[SUCCESS] User %s unfriended user %s. Rows affected: %d', currentUserId, friendUserIdToRemove, this.changes);
        res.status(200).json({ message: 'Successfully unfriended.' });
    });
});


// --- CHALLENGE API ENDPOINTS ---
app.post('/api/challenges', verifySessionToken, async (req, res) => {
    const challengerId = req.user.id;
    const { challenged_friend_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json } = req.body;
    logApi('[CHALLENGE] Create - Challenger: %s, Challenged ID: %s, Topic: %s', challengerId, challenged_friend_id, topic_id);
    if (!challenged_friend_id || !topic_id || !difficulty || !num_questions || !question_ids_json) {
        return res.status(400).json({ message: 'Missing required challenge parameters.' });
    }
    let parsedQuestionIds;
    try {
        parsedQuestionIds = JSON.parse(question_ids_json);
        if (!Array.isArray(parsedQuestionIds) || parsedQuestionIds.length !== num_questions) {
            return res.status(400).json({ message: 'Invalid question set for the challenge.' });
        }
    } catch (e) {
        return res.status(400).json({ message: 'Invalid question_ids_json format.' });
    }
    if (challengerId === parseInt(challenged_friend_id, 10)) { return res.status(400).json({ message: "You cannot challenge yourself." }); }

    mainDb.get("SELECT id FROM users WHERE id = ?", [challenged_friend_id], (err, challengedUser) => {
        if (err || !challengedUser) { return res.status(err ? 500 : 404).json({ message: err ? 'Server error.' : `Challenged user not found.` }); }
        const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        const insertSql = `INSERT INTO challenges (challenger_id, challenged_id, topic_id, topic_name, difficulty, num_questions, quiz_class, question_ids_json, expires_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        mainDb.run(insertSql, [challengerId, challenged_friend_id, topic_id, topic_name || null, difficulty, num_questions, quiz_class || null, question_ids_json, expiresAt], function (insertErr) {
            if (insertErr) { logError('[ERROR] /api/challenges - DB create error: %s', insertErr.message); return res.status(500).json({ message: 'Failed to create challenge.' }); }
            logDbChallenges('[SUCCESS] Challenge ID %s created by %s for %s', this.lastID, challengerId, challenged_friend_id);
            res.status(201).json({ message: `Challenge sent!`, challengeId: this.lastID });
        });
    });
});

app.get('/api/challenges/pending', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[CHALLENGE] GET Pending for User ID: %s', currentUserId);
    const sql = `SELECT c.*, u.identifier as challengerUsername, u_challenged.identifier as challengedUsername FROM challenges c JOIN users u ON c.challenger_id = u.id JOIN users u_challenged ON c.challenged_id = u_challenged.id WHERE c.challenged_id = ? AND (c.status = 'pending' OR (c.status = 'challenger_completed' AND c.challenged_id = ?)) AND (c.expires_at IS NULL OR c.expires_at > CURRENT_TIMESTAMP) ORDER BY c.created_at DESC`;
    mainDb.all(sql, [currentUserId, currentUserId], (err, rows) => {
        if (err) { logError('[ERROR] /api/challenges/pending: %s', err.message); return res.status(500).json({ message: 'Error fetching pending challenges.' }); }
        res.json(rows || []);
    });
});

app.get('/api/challenges/:challengeId', verifySessionToken, (req, res) => {
    const challengeId = parseInt(req.params.challengeId, 10);
    const userId = req.user.id;
    if (isNaN(challengeId)) return res.status(400).json({ message: 'Invalid challenge ID.' });
    mainDb.get("SELECT c.*, u1.identifier as challengerUsername, u2.identifier as challengedUsername FROM challenges c JOIN users u1 ON c.challenger_id = u1.id JOIN users u2 ON c.challenged_id = u2.id WHERE c.id = ?", [challengeId], (err, challenge) => {
        if (err || !challenge) return res.status(err ? 500 : 404).json({ message: err ? 'Error fetching.' : 'Challenge not found.' });
        if (challenge.challenger_id !== userId && challenge.challenged_id !== userId) return res.status(403).json({ message: 'Not part of this challenge.' });
        if (challenge.status === 'completed' || (challenge.expires_at && new Date() > new Date(challenge.expires_at))) return res.status(400).json({ message: 'Challenge completed or expired.' });
        res.json({ ...challenge, question_ids: JSON.parse(challenge.question_ids_json || '[]') });
    });
});

app.put('/api/challenges/:challengeId/submit', verifySessionToken, (req, res) => {
    const challengeId = parseInt(req.params.challengeId, 10);
    const userId = req.user.id;
    const { score, percentage, timeTaken, resultId } = req.body;
    if (isNaN(challengeId) || score === undefined || percentage === undefined || timeTaken === undefined || resultId === undefined) {
        return res.status(400).json({ message: 'Missing parameters.' });
    }
    mainDb.get("SELECT * FROM challenges WHERE id = ?", [challengeId], (err, challenge) => {
        if (err || !challenge) return res.status(err ? 500 : 404).json({ message: err ? 'Error.' : 'Challenge not found.' });
        let updateFields = [], params = [], newStatus = challenge.status;
        if (challenge.challenger_id === userId) {
            if (challenge.status !== 'pending' && challenge.status !== 'accepted') return res.status(400).json({ message: 'Cannot submit at this stage.' });
            updateFields = ['challenger_score = ?', 'challenger_percentage = ?', 'challenger_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = challenge.challenged_score !== null ? 'completed' : 'challenger_completed';
        } else if (challenge.challenged_id === userId) {
            if (challenge.status !== 'pending' && challenge.status !== 'accepted' && challenge.status !== 'challenger_completed') return res.status(400).json({ message: 'Cannot submit at this stage.' });
            updateFields = ['challenged_score = ?', 'challenged_percentage = ?', 'challenged_time_taken = ?'];
            params = [score, percentage, timeTaken];
            newStatus = (challenge.challenger_score !== null || challenge.status === 'challenger_completed') ? 'completed' : 'pending';
        } else { return res.status(403).json({ message: 'Not part of this challenge.' }); }

        updateFields.push('status = ?'); params.push(newStatus);
        if (newStatus === 'completed') {
            const cScore = (challenge.challenger_id === userId) ? score : challenge.challenger_score;
            const dScore = (challenge.challenged_id === userId) ? score : challenge.challenged_score;
            if (cScore > dScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenger_id); }
            else if (dScore > cScore) { updateFields.push('winner_id = ?'); params.push(challenge.challenged_id); }
            // else tie, winner_id remains null
        }
        params.push(challengeId);
        const updateSql = `UPDATE challenges SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        mainDb.run(updateSql, params, function (updateErr) {
            if (updateErr) { logError('[ERROR] Challenge submit update: %s', updateErr.message); return res.status(500).json({ message: 'Failed to submit score.' }); }
            resultsDb.run("UPDATE quiz_results SET challenge_id = ? WHERE id = ?", [challengeId, resultId], (linkErr) => {
                if (linkErr) logError('[ERROR] Link result %s to challenge %s: %s', resultId, challengeId, linkErr.message);
            });
            logDbChallenges('[SUCCESS] Score for challenge %s by user %s. Status: %s', challengeId, userId, newStatus);
            res.status(200).json({ message: 'Challenge score submitted.', status: newStatus });
        });
    });
});

app.get('/api/challenges/history', verifySessionToken, (req, res) => {
    const currentUserId = req.user.id;
    logApi('[CHALLENGE] GET History for User ID: %s', currentUserId);
    const sql = `SELECT c.*, u1.identifier as challengerUsername, u2.identifier as challengedUsername, w.identifier as winnerUsername FROM challenges c JOIN users u1 ON c.challenger_id = u1.id JOIN users u2 ON c.challenged_id = u2.id LEFT JOIN users w ON c.winner_id = w.id WHERE (c.challenger_id = ? OR c.challenged_id = ?) AND c.status IN ('completed', 'declined', 'expired') ORDER BY c.updated_at DESC`;
    mainDb.all(sql, [currentUserId, currentUserId], (err, rows) => {
        if (err) { logError('[ERROR] /api/challenges/history: %s', err.message); return res.status(500).json({ message: 'Error fetching challenge history.' }); }
        res.json(rows || []);
    });
});


app.get('/api/topics/:subject', (req, res) => {
    const { subject } = req.params;
    logApi('[INFO] GET /api/topics/%s', subject);
    const sql = `SELECT id, name, description, class, genre FROM quiz_topics WHERE subject = ? ORDER BY class, name`;

    if (!topicsDb || topicsDb.open === false) { // Check if topicsDb is initialized and open
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
app.get('/api/questions/:topicId', (req, res) => {
    const { topicId } = req.params;
    logApi('[INFO] GET /api/questions/%s', topicId);
    const sql = `SELECT * FROM questions WHERE topicId = ?`;

    if (!questionsDb || questionsDb.open === false) { // Check if questionsDb is initialized and open
        logError('[ERROR] /api/questions - Questions DB unavailable');
        return res.status(503).json({ message: 'Service temporarily unavailable. Questions data cannot be fetched.' });
    }

    questionsDb.all(sql, [topicId], (err, rows) => {
        if (err) {
            logError('[ERROR] GET /api/questions/%s - DB Error: %s', topicId, err.message);
            return res.status(500).json({ message: `Failed to fetch questions: ${err.message}` });
        }
        try {
            const questions = rows.map(row => ({ ...row, options: JSON.parse(row.options || '[]') }));
            logApi('[SUCCESS] GET /api/questions/%s - Found %d questions', topicId, questions.length);
            res.json(questions);
        } catch (parseError) {
            logError('[ERROR] /api/questions/%s - JSON parse error for options: %s', topicId, parseError.message);
            res.status(500).json({ message: "Error processing question data." })
        }
    });
});

// --- Results API ---
// POST a new quiz result
app.post('/api/results', verifySessionToken, (req, res) => {
    const dbUserId = req.user.id; // From verifySessionToken
    logApi('[INFO] POST /api/results - User ID: %s', dbUserId);
    const {
        subject, topicId, score, totalQuestions, percentage, timestamp,
        difficulty, numQuestionsConfigured, class: className, timeTaken,
        questionsActuallyAttemptedIds, userAnswersSnapshot, challenge_id // Include challenge_id
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
        questionsIdsString, answersSnapshotString, challenge_id || null // Add challenge_id here
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

// GET all results for the logged-in user
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
        logApi('[SIMULATE] POST /api/contact - Email sending simulated.');
        console.log(`--- SIMULATED CONTACT EMAIL ---
To: ${recipientEmail}
From: ${name} <${email}>
Subject: Contact Form Submission from ${name} via ReactiQuiz
Message: ${message}
-----------------------------`);
        return res.status(200).json({ message: 'Message received (simulated)! Thank you for your feedback.' });
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


// --- PASSWORD RESET REQUEST (Using mainDb) ---
app.post('/api/users/request-password-reset', async (req, res) => {
    const { identifier } = req.body; // Identifier is the username
    logApi('[INFO] POST /api/users/request-password-reset - Identifier: %s', identifier);

    if (!identifier) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    mainDb.get("SELECT id, email FROM users WHERE identifier = ?", [identifier.trim()], async (err, user) => {
        if (err) {
            logError('[ERROR] /request-password-reset - DB Error finding user: %s', err.message);
            return res.status(500).json({ message: 'Server error while finding user.' });
        }
        // For security, always return a generic message whether user/email exists or not
        if (!user || !user.email) {
            logApi('[INFO] /request-password-reset - User %s not found or no email associated. Sending generic response.', identifier);
            return res.status(200).json({ message: 'If an account with that username exists and has an email address, a password reset OTP has been sent.' });
        }

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION_MS).toISOString();

        // Using login_otp fields for reset OTP. Consider dedicated fields for more robustness.
        mainDb.run(
            "UPDATE users SET login_otp = ?, login_otp_expires_at = ? WHERE id = ?",
            [otp, otpExpiresAt, user.id],
            async (updateErr) => {
                if (updateErr) {
                    logError('[ERROR] /request-password-reset - DB Error storing OTP for %s: %s', identifier, updateErr.message);
                    return res.status(500).json({ message: 'Error initiating password reset. Please try again.' });
                }

                if (!transporter) {
                    console.log(`\n--- SIMULATED EMAIL (Password Reset OTP) ---`);
                    console.log(`To: ${user.email}`);
                    console.log(`For User: ${identifier}`);
                    console.log(`Subject: ReactiQuiz - Password Reset Code`);
                    console.log(`Body: Your OTP to reset your password is: ${otp}. It expires in 10 minutes.`);
                    console.log(`--------------------------------------------\n`);
                    logApi('[SIMULATE] /request-password-reset - OTP %s sent to %s for %s (simulated).', otp, user.email, identifier);
                    return res.status(200).json({ message: `SIMULATED: If an account exists and has an email, an OTP has been sent to ${user.email.substring(0, 3)}****. Check server console.` });
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
process.on('uncaughtException', (error) => { logError('[ERROR] Uncaught Exception:', error); process.exit(1); });