const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Environment variables may be unavailable during Vercel build/bundling. Never exit here.
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
    console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET). Server will log errors if accessed without proper config.');
}

const { logApi, logInfo, logError } = require('./api/_utils/logger');

const userRoutes = require('./api/routes/users');
const subjectRoutes = require('./api/routes/subjects');
const topicRoutes = require('./api/routes/topics');
const questionRoutes = require('./api/routes/questions');
const resultRoutes = require('./api/routes/results');
const friendRoutes = require('./api/routes/friends');
const challengeRoutes = require('./api/routes/challenges');
const contactRoutes = require('./api/routes/contact');
const aiRoutes = require('./api/routes/ai');
const homiBhabhaRoutes = require('./api/routes/homibhabha');
const quizSessionRoutes = require('./api/routes/quizSessions');
const subjectiveRoutes = require('./api/routes/subjective');
const adminRoutes = require('./api/routes/admin');

const app = express();

// This setting tells Express to trust the headers set by Vercel's proxy.
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3001',
        'https://reactiquiz.web.app',
        'https://reactiquiz.vercel.app'
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/users', userRoutes);
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
