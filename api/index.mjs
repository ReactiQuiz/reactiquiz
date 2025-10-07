import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { logError } from './_utils/logger.mjs';

// Warn if env missing but do not crash at build
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
  console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET).');
}

// Route modules (ESM)
import usersRouter from './routes/users.mjs';
import questionsRouter from './routes/questions.mjs';
import subjectsRouter from './routes/subjects.mjs';
import topicsRouter from './routes/topics.mjs';
import resultsRouter from './routes/results.mjs';

// Optional routes (converted later); guard missing modules
async function tryImport(path) {
  try { return (await import(path)).default; } catch { return null; }
}

const app = express();

app.set('trust proxy', 1);

if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(',').map((s) => s.trim());
  app.use(cors({ origin: origins, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json({ limit: '5mb' }));

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

app.use('/api/users', authLimiter, usersRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/results', resultsRouter);

// Attach optional routers if present (subjects, topics, etc.)
const optionalRouters = [
  // already mounted above
  ['results', './routes/results.mjs'],
  ['friends', './routes/friends.mjs'],
  ['challenges', './routes/challenges.mjs'],
  ['contact', './routes/contact.mjs'],
  ['ai', './routes/ai.mjs'],
  ['homibhabha', './routes/homibhabha.mjs'],
  ['quiz-sessions', './routes/quizSessions.mjs'],
  ['subjective', './routes/subjective.mjs'],
  ['admin', './routes/admin.mjs']
];

for (const [name, path] of optionalRouters) {
  const r = await tryImport(path);
  if (r) app.use(`/api/${name}`, r);
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  try {
    logError('FATAL', 'An unhandled server error occurred', err && err.stack ? err.stack : String(err));
  } catch {}
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});


