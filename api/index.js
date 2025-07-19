// api/index.js
// This line is for local development only, to load environment variables
if (process.env.NODE_ENV !== 'production') {
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const express = require('express');
const cors = require('cors');

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

const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- API Route Registration ---
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

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