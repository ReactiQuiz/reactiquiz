// api/routes/ai.js
const { Router } = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../_middleware/auth');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const summarizeResults = (results) => {
    if (!results || results.length === 0) return "The user has not taken any quizzes yet.";
    let summary = "Here is a summary of the user's performance:\n";
    results.forEach(r => {
        summary += `- Topic: ${r.topicId}, Score: ${r.percentage}%\n`;
    });
    return summary;
};

router.post('/chat', verifyToken, async (req, res) => {
    const user = req.user;
    const { history, message } = req.body;
    logApi('POST', '/api/ai/chat', `User: ${user.username}`);

    let tx;
    try {
        let userResults;
        tx = await turso.transaction("read");
        try {
            const result = await tx.execute({
                sql: "SELECT topicId, percentage FROM quiz_results WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10",
                args: [user.id]
            });
            userResults = result.rows;
            await tx.commit();
        } catch (dbError) {
            await tx.rollback();
            throw dbError;
        }

        const resultsSummary = summarizeResults(userResults);
        const systemInstruction = `You are ReactiQuiz AI, a helpful study assistant created by Sanskar Sontakke. Your name is Q. Your purpose is to help students with academic subjects. You must ONLY answer questions related to studying, science, time management, or analyzing the user's quiz results. If asked about anything else, politely decline. The user's name is ${user.username}. ${resultsSummary}`;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemInstruction }] },
                { role: "model", parts: [{ text: `Hello ${user.username}! I'm Q. How can I help you today?` }] },
                ...history
            ]
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ response: response.text() });

    } catch (error) {
        logError('GEMINI ERROR', 'Gemini API call failed', error.message);
        
        // --- START OF FIX: Specific Error Handling ---
        // Check if the error message from the Google API indicates an overload.
        if (error.message && (error.message.includes('503') || error.message.toLowerCase().includes('overloaded'))) {
            // Send a specific status and error message to the frontend.
            return res.status(503).json({ error: 'The AI model is currently overloaded.' });
        }
        // --- END OF FIX ---

        // For all other types of errors, send a generic message.
        res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
});

module.exports = router;