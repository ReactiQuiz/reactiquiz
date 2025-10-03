import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import type { Express } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Load env vars from .env in development if available (optional)
// Note: Vercel provides env at runtime; local dev may use .env
// We avoid dynamic require to keep ESM compatibility

// Environment variables may be unavailable during Vercel build/bundling. Never exit here.
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
    console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET). Server will log errors if accessed without proper config.');
}

import { logApi, logInfo, logError } from './_utils/logger';

import userRoutes from './routes/users';
import subjectRoutes from './routes/subjects';
import topicRoutes from './routes/topics';
import questionRoutes from './routes/questions';
import resultRoutes from './routes/results';
import friendRoutes from './routes/friends';
import challengeRoutes from './routes/challenges';
import contactRoutes from './routes/contact';
import aiRoutes from './routes/ai';
import homiBhabhaRoutes from './routes/homibhabha';
import quizSessionRoutes from './routes/quizSessions';
import subjectiveRoutes from './routes/subjective';
import adminRoutes from './routes/admin';
// --- END OF DEFINITIVE FIX ---

const app: Express = express();

// This setting tells Express to trust the headers set by Vercel's proxy.
// It's essential for correct IP address identification, which is needed by
// security middleware like rate limiters.
app.set('trust proxy', 1);

// --- Core Middleware ---
if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(',').map((s: string) => s.trim());
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
app.use('/api/quiz-sessions', quizSessionRoutes);
app.use('/api/subjective', subjectiveRoutes);
app.use('/api/admin', adminRoutes);

// --- Health Check Endpoint ---
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

// --- Final 404 Catcher for API routes ---
app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

// A global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logError('FATAL', 'An unhandled server error occurred', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the configured app for Vercel
export default app;
