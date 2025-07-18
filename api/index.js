// api/index.js (Main Vercel Serverless Entry Point)
import express from 'express';
import cors from 'cors';
import { logApi, logInfo, logError } from './_utils/logger.js';

// Import all your new Supabase-powered route handlers
import userRoutes from './routes/users.js';
import quizRoutes from './routes/quizzes.js';
import subjectRoutes from './routes/subjects.js';
import friendRoutes from './routes/friends.js';
import challengeRoutes from './routes/challenges.js';
import contactRoutes from './routes/contact.js';
import aiRoutes from './routes/ai.js';

const app = express();

// --- Middleware ---
app.use(cors()); // It's still good practice to have this for local dev and as a fallback
app.use(express.json({ limit: '5mb' }));

// A simple request logger for Vercel's logs
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

// --- Root API Endpoint for Health Check ---
app.get('/api', (req, res) => {
    logInfo('INFO', 'Health check successful');
    res.json({ message: 'ReactiQuiz API (Supabase) is alive!' });
});

// --- Unhandled API Route Catcher ---
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled error occurred in the API', err.stack);
    res.status(500).send({ message: 'Something broke!' });
});

// Vercel exports the app. If running locally, we need to listen.
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.SERVER_PORT || 3001;
    app.listen(port, () => {
        logInfo('SUCCESS', 'Backend API running for local dev on', `http://localhost:${port}`);
    });
}

export default app;