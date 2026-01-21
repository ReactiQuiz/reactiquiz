// api/routes/ai.js
/**
 * AI Chat Routes
 * 
 * Handles AI chat functionality using Google Gemini API.
 * Provides chat endpoint with user quiz performance context.
 * All routes require authentication via verifyToken middleware.
 */

const { Router } = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../_middleware/auth');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');

const router = Router();

/**
 * Model Resolution Helpers
 * 
 * Functions to initialize and resolve Google Gemini AI models.
 */

/**
 * Get GenAI Instance
 * 
 * Creates and returns a GoogleGenerativeAI instance if API key is configured.
 * 
 * @returns {GoogleGenerativeAI|null} GenAI instance or null if not configured
 */
const getGenAI = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    try { return new GoogleGenerativeAI(process.env.GEMINI_API_KEY); } catch { return null; }
};

/**
 * Build Model
 * 
 * Builds a GenerativeModel instance for the specified model name.
 * 
 * @param {string} modelName - Name of the Gemini model to use
 * @returns {GenerativeModel|null} Model instance or null if build fails
 */
const buildModel = (modelName) => {
    const genAI = getGenAI();
    if (!genAI) return null;
    try { return genAI.getGenerativeModel({ model: modelName }); } catch { return null; }
};

/**
 * Preferred Models List
 * 
 * Ordered list of preferred Gemini models to try.
 * Falls back to next model if current one fails to initialize.
 */
const PREFERRED_MODELS = [
    process.env.GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-latest',
].filter(Boolean);

/**
 * Resolve Model
 * 
 * Attempts to initialize a model from the preferred models list.
 * Sets the global model variable on successful initialization.
 * 
 * @returns {string|null} Name of the successfully initialized model or null
 */
let model = null;
const resolveModel = () => {
    for (const name of PREFERRED_MODELS) {
        const candidate = buildModel(name);
        if (candidate) {
            model = candidate;
            return name;
        }
    }
    model = null;
    return null;
};

// Initialize model once at cold start
resolveModel();

/**
 * Summarize Results
 * 
 * Creates a text summary of user quiz results for AI context.
 * 
 * @param {Array} results - Array of quiz result objects
 * @returns {string} Summary text of quiz performance
 */
const summarizeResults = (results) => {
    if (!results || results.length === 0) return "The user has not taken any quizzes yet.";
    let summary = "Here is a summary of the user's performance:\n";
    for (const r of results) {
        summary += `- Topic: ${r.topicId}, Score: ${r.percentage}%\n`;
    }
    return summary;
};

/**
 * POST /api/ai/chat
 * 
 * Handles AI chat messages with user quiz performance context.
 * Fetches recent quiz results and includes them in the AI prompt.
 * Returns AI-generated response based on message history and user context.
 * Requires authentication via verifyToken middleware.
 */
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

        // Try sending once; if the model is invalid/unavailable, resolve and retry with a fallback.
        try {
            const result = await chat.sendMessage(message);
            const response = await result.response;
            res.json({ response: response.text() });
        } catch (primaryError) {
            const msg = (primaryError && primaryError.message) || '';
            const shouldRetry = msg.includes('404') || /not found|unavailable/i.test(msg);
            if (shouldRetry) {
                resolveModel();
                if (!model) throw primaryError;
                const retryChat = model.startChat({ history: [
                    { role: "user", parts: [{ text: systemInstruction }] },
                    { role: "model", parts: [{ text: `Hello ${user.username}! I'm Q. How can I help you today?` }] },
                    ...history
                ]});
                const retryResult = await retryChat.sendMessage(message);
                const retryResponse = await retryResult.response;
                res.json({ response: retryResponse.text(), fallbackUsed: true });
                return;
            }
            throw primaryError;
        }

    } catch (error) {
        logError('GEMINI ERROR', 'Gemini API call failed', error.message);

        // --- START OF FIX: Specific Error Handling ---
        // Check if the error message from the Google API indicates an overload.
        const msg = error.message || '';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
            res.status(503).json({ error: 'The configured Gemini model is unavailable. Please try again shortly.' });
            return;
        }
        if (msg.includes('503') || msg.toLowerCase().includes('overloaded')) {
            // Send a specific status and error message to the frontend.
            res.status(503).json({ error: 'The AI model is currently overloaded.' });
            return;
        }
        // --- END OF FIX ---

        // For all other types of errors, send a generic message.
        res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
});

// GET /api/ai/models - list available Gemini models from public endpoint
router.get('/models', async (_req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            res.json({ models: [], error: 'No API key configured' });
            return;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            res.status(resp.status).json({ models: [], error: `Upstream error ${resp.status}` });
            return;
        }
        const data = await resp.json();
        const models = (data.models || []).map(m => ({ name: m.name, displayName: m.displayName, description: m.description }));
        res.json({ models });
    } catch (e) {
        res.status(500).json({ models: [], error: e.message || 'Failed to list models' });
    }
});

module.exports = router;