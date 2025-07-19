// api/index.js
const path = require('path');
// Ensure local .env variables are loaded for development
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 

const express = require('express');
const cors = require('cors');
const { logApi, logInfo, logError } = require('./_utils/logger');

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
const PORT = process.env.PORT || 3001;

// --- Core Middleware ---
app.use(cors()); // Handles Cross-Origin Resource Sharing
app.use(express.json({ limit: '5mb' })); // Parses incoming JSON requests

// --- Custom Request Logger Middleware ---
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logApi(req.method, `${res.statusCode} ${req.originalUrl}`, `(${duration}ms)`);
    });
    next();
});

// --- API Route Registration ---
// Each resource gets its own clear, top-level endpoint.
// app.use('/api/users', userRoutes);
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/topics', topicRoutes);
// app.use('/api/questions', questionRoutes);
// app.use('/api/results', resultRoutes);
// app.use('/api/friends', friendRoutes);
// app.use('/api/challenges', challengeRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/ai', aiRoutes);

// --- Health Check Endpoint ---
// A simple route to confirm the API is running.
app.get('/api/health', (req, res) => {
    logInfo('INFO', 'Health check successful');
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

// --- Final Error Handling Middlewares ---
// Catch any requests to /api/* that haven't been matched by a route
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// A global error handler to catch any unhandled errors from routes
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled error occurred in the API', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// This block only runs for local development (`npm run backend:dev`)
// Vercel ignores this and exports the 'app' object directly.
if (require.main === module) {
    app.listen(PORT, () => {
        logInfo('SUCCESS', 'Backend API running for local dev on', `http://localhost:${PORT}`);
    });
}

// Export the configured app for Vercel
module.exports = app;