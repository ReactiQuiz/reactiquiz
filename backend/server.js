// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { logInfo, logApi, logError } = require('./utils/logger');
const { DB_PATHS } = require('./db');

// Import modular routes
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const friendRoutes = require('./routes/friendRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const port = process.env.SERVER_PORT || 3001;

logInfo('INFO', '--- Database Paths ---');
Object.entries(DB_PATHS).forEach(([key, value]) => {
    const dbName = key.charAt(0).toUpperCase() + key.slice(1);
    logInfo('DB PATH', `${dbName.padEnd(10)}: ${value}`);
});
logInfo('INFO', '----------------------');

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Custom request logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        
        // Determine status string based on HTTP status code
        let statusString = 'INFO';
        if (status >= 500) statusString = 'ERROR';
        else if (status >= 400) statusString = 'FAIL';
        else if (status >= 300) statusString = 'REDIRECT';
        else if (status >= 200) statusString = 'SUCCESS';

        logApi(
            req.method, 
            `${status} ${req.originalUrl}`,
            `(${duration}ms)`
        );
    });
    next();
});

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api', quizRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// --- Root Endpoint for Health Check ---
app.get('/api', (req, res) => {
    res.json({ message: 'ReactiQuiz API is running for local development.' });
});

app.listen(port, () => {
    logInfo('SUCCESS', 'Backend API server running on', `http://localhost:${port}`);
});

process.on('unhandledRejection', (reason) => { logError('FATAL', 'Unhandled Rejection at:', reason); });
process.on('uncaughtException', (error) => { logError('FATAL', 'Uncaught Exception:', error); process.exit(1); });