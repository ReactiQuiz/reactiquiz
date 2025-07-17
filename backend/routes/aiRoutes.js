// backend/routes/aiRoutes.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifySessionToken } = require('../middleware/auth');
const { resultsDb } = require('../db');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

if (!process.env.GEMINI_API_KEY) {
    logError('GEMINI', 'API key not found in .env file', 'AI routes will fail.');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const summarizeResults = (results) => {
    if (!results || results.length === 0) return "The user has not taken any quizzes yet.";
    const subjectStats = {};
    results.forEach(r => {
        const subject = r.subject || 'general';
        if (!subjectStats[subject]) { subjectStats[subject] = { scores: [], count: 0 }; }
        subjectStats[subject].scores.push(r.percentage);
        subjectStats[subject].count++;
    });
    let summary = "Here is a summary of the user's performance:\n";
    for (const [subject, stats] of Object.entries(subjectStats)) {
        const avgScore = Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.count);
        summary += `- Subject: ${subject}, Quizzes Taken: ${stats.count}, Average Score: ${avgScore}%\n`;
    }
    return summary;
};

router.post('/chat', verifySessionToken, async (req, res) => {
    const userId = req.user.id;
    const userName = req.user.identifier;
    const { history, message } = req.body;

    logApi('POST', '/api/ai/chat', `User: ${userName}`);

    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI service is not configured.' });
    if (!message) return res.status(400).json({ error: 'Message content is required.' });

    try {
        const userResults = await new Promise((resolve, reject) => {
            resultsDb.all("SELECT subject, percentage FROM quiz_results WHERE userId = ? ORDER BY timestamp DESC LIMIT 20", [userId], (err, rows) => {
                if (err) reject(err); else resolve(rows || []);
            });
        });

        const resultsSummary = summarizeResults(userResults);
        const systemInstruction = `You are ReactiQuiz AI, a helpful study assistant created by Sanskar Sontakke for the ReactiQuiz application. Your name is Q. Your purpose is to help students with subjects like physics, chemistry, biology, math, and general knowledge. You must ONLY answer questions related to academic subjects, science projects, exam preparation, study techniques, time management, and analyzing the user's quiz results. If the user asks about anything else (like personal opinions, non-academic topics, inappropriate content), you must politely decline and steer the conversation back to studying. The user's name is ${userName}. ${resultsSummary} Keep your answers helpful, encouraging, and concise.`;

        const chat = model.startChat({
            history: [ { role: "user", parts: [{ text: systemInstruction }] }, { role: "model", parts: [{ text: `Hello ${userName}! I'm Q, your personal study assistant for ReactiQuiz. How can I help you?` }] }, ...history ],
            generationConfig: { maxOutputTokens: 1000 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        logError('GEMINI ERROR', 'Error communicating with Gemini API', error.message);
        res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
});

module.exports = router;