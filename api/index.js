// api/index.js
const path = require('path'); // <-- Import the 'path' module

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
    console.error("\n\n\x1b[31m%s\x1b[0m", "==================== FATAL ERROR ====================");
    console.error("\x1b[33m%s\x1b[0m", "Missing essential environment variables (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET).");
    console.error("\x1b[33m%s\x1b[0m", "The backend server cannot start without these credentials.");
    console.error("\x1b[36m%s\x1b[0m", "This project requires official access. Please refer to the documentation or contact the owner.");
    console.error("\x1b[31m%s\x1b[0m", "=====================================================\n\n");
    // Prevent the server from starting if critical variables are missing
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
}

// This line is for local development only, to load environment variables
if (process.env.NODE_ENV !== 'production') {
    // Use path.resolve to ensure the .env file is found correctly from the project root
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Use a try-catch block for robustness during the Vercel build
let logApi, logInfo, logError;
try {
    // --- START OF DEFINITIVE FIX: Use absolute paths for requires ---
    const logger = require(path.resolve(__dirname, './_utils/logger.js'));
    logApi = logger.logApi;
    logInfo = logger.logInfo;
    logError = logger.logError;
} catch (e) {
    console.log("Logger failed to initialize, falling back to console.log");
    logApi = (...args) => console.log('[API]', ...args);
    logInfo = (...args) => console.log('[INFO]', ...args);
    logError = (...args) => console.error('[ERROR]', ...args);
}

// Import all individual route handlers using absolute paths
const userRoutes = require(path.resolve(__dirname, './routes/users.js'));
const subjectRoutes = require(path.resolve(__dirname, './routes/subjects.js'));
const topicRoutes = require(path.resolve(__dirname, './routes/topics.js'));
const questionRoutes = require(path.resolve(__dirname, './routes/questions.js'));
const resultRoutes = require(path.resolve(__dirname, './routes/results.js'));
const friendRoutes = require(path.resolve(__dirname, './routes/friends.js'));
const challengeRoutes = require(path.resolve(__dirname, './routes/challenges.js'));
const contactRoutes = require(path.resolve(__dirname, './routes/contact.js'));
const aiRoutes = require(path.resolve(__dirname, './routes/ai.js'));
const homiBhabhaRoutes = require(path.resolve(__dirname, './routes/homibhabha.js'));
const quizSessionRoutes = require(path.resolve(__dirname, './routes/quizSessions.js'));
const subjectiveRoutes = require('./routes/subjective');
const adminRoutes = require('./routes/admin');
// --- END OF DEFINITIVE FIX ---

const app = express();

// This setting tells Express to trust the headers set by Vercel's proxy.
// It's essential for correct IP address identification, which is needed by
// security middleware like rate limiters.
app.set('trust proxy', 1);

// --- Core Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- RATE LIMITING SETUP ---
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: 'Too many requests, please try again after 15 minutes' },
});

const authLimiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again after 30 minutes' },
});

app.use('/api', apiLimiter);

// --- API Route Registration ---
app.use('/api/users', authLimiter, userRoutes); 
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/homibhabha', homiBhabhaRoutes); 
app.use('/api/quiz-sessions', quizSessionRoutes);
app.use('/api/subjective', subjectiveRoutes); 
app.use('/api/admin', adminRoutes);

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

// --- Final 404 Catcher for API routes ---
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

// A global error handler
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled server error occurred', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the configured app for Vercel
module.exports = app;