const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Env warnings only (do not crash in build)
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN || !process.env.JWT_SECRET) {
  console.warn('[WARN] Missing env vars (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN/JWT_SECRET).');
}

const { logError } = require('./_utils/logger');

function safeRequire(p) {
  try {
    return require(p);
  } catch (e) {
    console.warn(`[WARN] Optional module not found: ${p}`);
    return null;
  }
}

// Routes (CommonJS)
const userRoutes = safeRequire('./routes/users');
const subjectRoutes = safeRequire('./routes/subjects');
const topicRoutes = safeRequire('./routes/topics');
const questionRoutes = safeRequire('./routes/questions');
const resultRoutes = safeRequire('./routes/results');
const friendRoutes = safeRequire('./routes/friends');
const challengeRoutes = safeRequire('./routes/challenges');
const contactRoutes = safeRequire('./routes/contact');
const aiRoutes = safeRequire('./routes/ai');
const homiBhabhaRoutes = safeRequire('./routes/homibhabha');
const quizSessionRoutes = safeRequire('./routes/quizSessions');
const subjectiveRoutes = safeRequire('./routes/subjective');
const adminRoutes = safeRequire('./routes/admin');

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

if (userRoutes) app.use('/api/users', authLimiter, userRoutes);
if (subjectRoutes) app.use('/api/subjects', subjectRoutes);
if (topicRoutes) app.use('/api/topics', topicRoutes);
if (questionRoutes) app.use('/api/questions', questionRoutes);
if (resultRoutes) app.use('/api/results', resultRoutes);
if (friendRoutes) app.use('/api/friends', friendRoutes);
if (challengeRoutes) app.use('/api/challenges', challengeRoutes);
if (contactRoutes) app.use('/api/contact', contactRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);
if (homiBhabhaRoutes) app.use('/api/homibhabha', homiBhabhaRoutes);
if (quizSessionRoutes) app.use('/api/quiz-sessions', quizSessionRoutes);
if (subjectiveRoutes) app.use('/api/subjective', subjectiveRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ReactiQuiz API is healthy.' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  try {
    logError('FATAL', 'An unhandled server error occurred', err && err.stack ? err.stack : String(err));
  } catch (_) {}
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;


