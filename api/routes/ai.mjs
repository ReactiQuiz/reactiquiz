import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from '../_middleware/auth.mjs';
import { turso } from '../_utils/tursoClient.mjs';
import { logApi, logError } from '../_utils/logger.mjs';

const router = Router();

let model = null;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    } catch (e) {
        try {
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (e2) {
            try {
                model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            } catch (e3) {
                model = null;
            }
        }
    }
}

const summarizeResults = (results) => {
    if (!results || results.length === 0) return "The user has not taken any quizzes yet.";
    let summary = "Here is a summary of the user's performance:\n";
    for (const r of results) {
        summary += `- Topic: ${r.topicId}, Score: ${r.percentage}%\n`;
    }
    return summary;
};

router.post('/chat', verifyToken, async (req, res) => {
    const user = req.user;
    const { history = [], message } = req.body;
    logApi('POST', '/api/ai/chat', `User: ${user.username}`);

    if (!model) {
        res.status(503).json({ error: 'AI service is not configured.' });
        return;
    }

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
        logError('GEMINI ERROR', 'Gemini API call failed', error && error.message);

        const msg = (error && error.message) || '';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
            res.status(503).json({ error: 'The configured Gemini model is unavailable. Please try again shortly.' });
            return;
        }
        if (msg.includes('503') || msg.toLowerCase().includes('overloaded')) {
            res.status(503).json({ error: 'The AI model is currently overloaded.' });
            return;
        }

        res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
});

export default router;
