// api/index.js (Vercel Serverless Entry Point)
const path = require('path');
// Correctly resolve .env from the project root for Vercel environment
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

// Import modular routes using relative paths from the /api directory
const userRoutes = require('../backend/routes/userRoutes');
const quizRoutes = require('../backend/routes/quizRoutes');
const subjectRoutes = require('../backend/routes/subjectRoutes');
const friendRoutes = require('../backend/routes/friendRoutes');
const challengeRoutes = require('../backend/routes/challengeRoutes');
const contactRoutes = require('../backend/routes/contactRoutes');
const aiRoutes = require('../backend/routes/aiRoutes');

// Initialize Express App
const app = express();

// --- Middleware ---
// Apply CORS and JSON parser
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- API Routes ---
// Wire up all the modular routers to the Express app
app.use('/api/users', userRoutes);
app.use('/api', quizRoutes); // This will handle /api/results, /api/questions, etc.
app.use('/api/subjects', subjectRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// --- Root API Endpoint for Health Check ---
app.get('/api', (req, res) => {
    res.json({ message: 'ReactiQuiz API is running.' });
});

// --- Export the app for Vercel ---
// Vercel will take this exported app and handle the server logic.
// There is NO app.listen() in this file.
module.exports = app;