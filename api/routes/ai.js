// api/routes/ai.js
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifySupabaseToken } from '../_middleware/auth.js';
import { supabase } from '../_utils/supabaseClient.js';
import { logApi, logError } from '../_utils/logger.js';

const router = Router();

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

router.post('/chat', verifySupabaseToken, async (req, res) => {
    const user = req.user;
    const { history, message } = req.body;
    logApi('POST', '/api/ai/chat', `User: ${user.id}`);

    // Fetch user's results from Supabase
    const { data: userResults, error: resultsError } = await supabase
        .from('quiz_results')
        .select('subject, percentage')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(20);

    if (resultsError) {
        logError('DB ERROR', 'Fetching results for AI context failed', resultsError.message);
        // Continue without results context
    }

    const { data: profile } = await supabase.from('users').select('username').eq('id', user.id).single();
    const userName = profile?.username || 'user';
    const resultsSummary = summarizeResults(userResults || []);

    const systemInstruction = `You are ReactiQuiz AI... The user's name is ${userName}. ${resultsSummary} ...`;

    try {
        const chat = model.startChat({
            history: [{ role: "user", parts: [{ text: systemInstruction }] }, { role: "model", parts: [{ text: `Hello ${userName}! I'm Q, your personal study assistant for ReactiQuiz. How can I help you?` }] }, ...history],
        });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ response: response.text() });
    } catch (error) {
        logError('GEMINI ERROR', 'Gemini API call failed', error.message);
        res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
});

export default router;