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
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * Environment Variable Validation
 *
 * Environment variables may be unavailable during Vercel build/bundling.
 * Never exit here - server will log errors if accessed without proper config.
 *
 * TURSO_* and JWT_SECRET are required by nearly every route (users, subjects,
 * topics, questions, results, quizSessions, admin, ai, friends, challenges,
 * homibhabha). SUPABASE_* backs only api/routes/pdf.js. GEMINI_API_KEY backs
 * only api/routes/ai.js. ADMIN_USER_ID is required by api/routes/admin.js.
 */
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
    console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET). Server will log errors if accessed without proper config.');
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('[WARN] Missing Supabase env vars — only api/routes/pdf.js is affected.');
}
if (!process.env.GEMINI_API_KEY) {
    console.warn('[WARN] Missing GEMINI_API_KEY — only api/routes/ai.js is affected.');
}
if (!process.env.ADMIN_USER_ID) {
    console.warn('[WARN] Missing ADMIN_USER_ID — /api/admin/* routes will return 500 until configured.');
}

const { logApi, logInfo, logError } = require('./_utils/logger');

const userRoutes = require('./_routes/users');
const subjectRoutes = require('./_routes/subjects');
const topicRoutes = require('./_routes/topics');
const questionRoutes = require('./_routes/questions');
const resultRoutes = require('./_routes/results');
const friendRoutes = require('./_routes/friends');
const challengeRoutes = require('./_routes/challenges');
const contactRoutes = require('./_routes/contact');
const homiBhabhaRoutes = require('./_routes/homibhabha');
const quizSessionRoutes = require('./_routes/quizSessions');
const adminRoutes = require('./_routes/admin');
const pdfRoutes = require('./_routes/pdf');
const noteRoutes = require('./_routes/notes');

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Rate Limiting Configuration
 *
 * API Limiter: General rate limit for all API endpoints.
 * Auth Limiter: Stricter, IP-keyed rate limit for authentication endpoints.
 *
 * The API limiter keys on the request's bearer token (not IP) when present,
 * so a classroom or household sharing one IP each get their own budget
 * instead of splitting a single 100-request pool between everyone behind
 * that NAT. This runs before verifyToken (which lives inside each route
 * file), so the token isn't verified here — it doesn't need to be: at worst
 * a forged token just buys the sender their own fresh bucket, which is a
 * reasonable outcome for a rate limiter. Anonymous requests still fall back
 * to IP-based limiting.
 */
const rateLimitKey = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7, 47); // token prefix as the bucket key
    }
    // ipKeyGenerator normalizes IPv6 addresses to a /64 subnet so a single
    // client can't cycle through addresses in its own block to bypass limits.
    return ipKeyGenerator(req.ip);
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Per user (or per IP for anonymous requests)
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimitKey,
    message: { message: 'Too many requests, please try again after 15 minutes' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 50 : 1000, // Generous limit for normal usage and testing
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' || req.ip === '127.0.0.1' || req.ip === '::1',
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
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
app.use('/api/homibhabha', homiBhabhaRoutes);
app.use('/api/quizSessions', quizSessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/notes', noteRoutes);

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