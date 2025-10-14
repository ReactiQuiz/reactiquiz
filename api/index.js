const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Environment variables may be unavailable during Vercel build/bundling. Never exit here.
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
    console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET). Server will log errors if accessed without proper config.');
}

const { logApi, logInfo, logError } = require('./_utils/logger');

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
const subjectiveRoutes = require('./routes/subjective');
const adminRoutes = require('./routes/admin');

const app = express();

// This setting tells Express to trust the headers set by Vercel's proxy.
// It's essential for correct IP address identification, which is needed by
// security middleware like rate limiters.
app.set('trust proxy', 1);

// --- Core Middleware ---
if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(',').map(s => s.trim());
    app.use(cors({ origin: origins, credentials: true }));
} else {
    app.use(cors());
}
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
app.use('/api/quizSessions', quizSessionRoutes);
app.use('/api/subjective', subjectiveRoutes);
app.use('/api/admin', adminRoutes);

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

// --- Handle non-API routes ---
app.get('/', (req, res) => {
    res.json({ 
        message: 'ReactiQuiz API Server', 
        status: 'running',
        endpoints: '/api/*',
        note: 'Frontend hosted separately'
    });
});

// --- Final 404 Catcher for API routes ---
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

// --- Catch-all for non-API routes ---
app.get('*', (req, res) => {
    res.json({ 
        message: 'ReactiQuiz API Server', 
        status: 'running',
        api_endpoints: '/api/*',
        note: 'Frontend hosted separately'
    });
});

// A global error handler
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled server error occurred', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the configured app for Vercel
module.exports = app;