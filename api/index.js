// api/index.js (Main Vercel Serverless Entry Point)
import express from 'express';
import cors from 'cors';
import { logApi, logInfo, logError } from './_utils/logger.js';

// Import all the new Supabase-powered route handlers
import userRoutes from './routes/users.js';
import quizRoutes from './routes/quizzes.js';
import subjectRoutes from './routes/subjects.js';
import friendRoutes from './routes/friends.js';
import challengeRoutes from './routes/challenges.js';
import contactRoutes from './routes/contact.js';
import aiRoutes from './routes/ai.js';

// Initialize Express App
const app = express();

// --- Middleware ---
// Apply CORS and JSON parser
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// A simple request logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logApi(
            req.method, 
            `${res.statusCode} ${req.originalUrl}`,
            `(${duration}ms)`
        );
    });
    next();
});

// --- API Routes ---
// Wire up all the modular routers to the Express app.
// Note: All routes defined in these files will be prefixed with the path here.
// For example, a '/' route in users.js will become '/api/users'.
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes); // Using a more specific prefix
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

// --- Unhandled Route Catcher ---
// This is a good practice to catch any requests to /api/... that don't match a route
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// --- Error Handling Middleware ---
// This should be the last 'use' middleware
app.use((err, req, res, next) => {
    logError('FATAL', 'An unhandled error occurred in the API', err.stack);
    res.status(500).send('Something broke!');
});

// --- Export the app for Vercel ---
// Vercel will take this exported app and handle the server logic.
// There is NO app.listen() in this file.
export default app;