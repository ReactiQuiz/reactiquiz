// api/index.js
// This line is for local development only, to load environment variables
if (process.env.NODE_ENV !== 'production') {
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // <-- Import the package

// Use a try-catch block for robustness during the Vercel build
let logApi, logInfo, logError;
try {
    const logger = require('./_utils/logger');
    logApi = logger.logApi;
    logInfo = logger.logInfo;
    logError = logger.logError;
} catch (e) {
    // Fallback to console.log if logger fails
    console.log("Logger failed to initialize, falling back to console.log");
    logApi = (...args) => console.log('[API]', ...args);
    logInfo = (...args) => console.log('[INFO]', ...args);
    logError = (...args) => console.error('[ERROR]', ...args);
}

// Import all individual route handlers
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const friendRoutes = require('./routes/friends');
const challengeRoutes = require('./routes/challenges');
const contactRoutes = require('./routes/contact');
const aiRoutes = require('./routes/ai');
const homiBhabhaRoutes = require('./routes/homibhabha');
const quizSessionRoutes = require('./routes/quizSessions');

const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' }));


// --- START: RATE LIMITING SETUP ---

// General limiter for most API requests
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per window
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	max: 10, // Limit each IP to 10 authentication attempts per window
	standardHeaders: true,
	legacyHeaders: false,
    message: { message: 'Too many authentication attempts from this IP, please try again after 30 minutes' },
});

// Apply the general limiter to all routes starting with /api
app.use('/api', apiLimiter);

// --- END: RATE LIMITING SETUP ---


// --- API Route Registration ---
// Apply the stricter limiter only to the sensitive user routes
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

// --- Health Check Endpoint (exempt from general limiter if placed before it, but fine here) ---
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