// api/index.js
/**
 * Express API Server
 * 
 * Main Express application setup and configuration for the ReactiQuiz API server.
 * Handles middleware setup, route registration, rate limiting, error handling,
 * and health check endpoints. Configured for deployment on Vercel.
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * Environment Variable Validation
 * 
 * Environment variables may be unavailable during Vercel build/bundling.
 * Never exit here - server will log errors if accessed without proper config.
 */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.JWT_SECRET) {
    console.warn('[WARN] Missing env vars (SUPABASE_URL/SUPABASE_ANON_KEY/JWT_SECRET). Server will log errors if accessed without proper config.');
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
const adminRoutes = require('./routes/admin');
const pdfRoutes = require('./routes/pdf');

const app = express();

/**
 * Trust Proxy Setting
 * 
 * This setting tells Express to trust the headers set by Vercel's proxy.
 * It's essential for correct IP address identification, which is needed by
 * security middleware like rate limiters.
 */
app.set('trust proxy', 1);

/**
 * Core Middleware Configuration
 * 
 * CORS: Configured to allow requests from specified origins or all origins.
 * JSON Body Parser: Set to accept JSON payloads up to 5MB.
 */
if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(',').map(s => s.trim());
    app.use(cors({ origin: origins, credentials: true }));
} else {
    app.use(cors());
}
app.use(express.json({ limit: '5mb' }));

/**
 * Rate Limiting Configuration
 * 
 * API Limiter: General rate limit for all API endpoints (100 requests per 15 minutes).
 * Auth Limiter: Stricter rate limit for authentication endpoints (10 requests per 30 minutes).
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again after 15 minutes' },
});

const authLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // Maximum 10 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again after 30 minutes' },
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

/**
 * API Route Registration
 * 
 * All API routes are registered here with their respective middleware.
 * Authentication routes use the stricter authLimiter for security.
 */
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
app.use('/api/admin', adminRoutes);
app.use('/api/pdf', pdfRoutes);

/**
 * Health Check Endpoint
 * 
 * Returns API health status for monitoring and deployment checks.
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

/**
 * Root Endpoint
 * 
 * Returns API server information for non-API routes.
 */
app.get('/', (req, res) => {
    res.json({ 
        message: 'ReactiQuiz API Server', 
        status: 'running',
        endpoints: '/api/*',
        note: 'Frontend hosted separately'
    });
});

/**
 * 404 Handler for API Routes
 * 
 * Catches all unmatched API routes and returns a 404 error.
 */
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

/**
 * Catch-All Handler for Non-API Routes
 * 
 * Returns API server information for any unmatched non-API routes.
 */
app.get('*', (req, res) => {
    res.json({ 
        message: 'ReactiQuiz API Server', 
        status: 'running',
        api_endpoints: '/api/*',
        note: 'Frontend hosted separately'
    });
});

/**
 * Global Error Handler
 * 
 * Catches any unhandled errors and returns a 500 error response.
 * Logs the error for debugging purposes.
 */
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled server error occurred', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the configured app for Vercel
module.exports = app;