// api/index.js (Works for both Vercel and Local Dev)
const path = require('path');
// This line allows you to use your local .env file during development
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { logApi, logInfo, logError } = require('./_utils/logger');

// Import all route handlers (using require for CommonJS consistency)
const userRoutes = require('./routes/users.js');
const quizRoutes = require('./routes/quizzes.js');
const subjectRoutes = require('./routes/subjects.js');
const friendRoutes = require('./routes/friends.js');
const challengeRoutes = require('./routes/challenges.js');
const contactRoutes = require('./routes/contact.js');
const aiRoutes = require('./routes/ai.js');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logApi(req.method, `${res.statusCode} ${req.originalUrl}`, `(${duration}ms)`);
    });
    next();
});

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api', (req, res) => {
    logInfo('INFO', 'Health check successful');
    res.json({ message: 'ReactiQuiz API is alive!' });
});

// --- Final Error Handlers ---
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled error occurred in the API', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// This block will only run when you execute `node api/index.js` locally.
// Vercel ignores this and just exports the 'app' object.
if (require.main === module) {
    app.listen(PORT, () => {
        logInfo('SUCCESS', 'Backend API running for local dev on', `http://localhost:${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;