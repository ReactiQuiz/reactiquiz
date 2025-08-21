// api/routes/subjective.js
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { turso } = require('../_utils/tursoClient');
const { verifyToken } = require('../_middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logApi, logError } = require('../_utils/logger');

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gradingModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This is the grading prompt template.
const gradingPrompt = `
# --- ReactiQuiz AI Answer Grading Prompt ---
## AI Persona & Role
You are "Q Grader," a fair, encouraging, and precise teaching assistant. Your task is to evaluate a student's answer against a model answer and provide a score and constructive feedback.
## Input Provided to You
{ "question_text": "...", "expected_answer": "...", "user_answer": "...", "max_marks": 0 }
## AI Task & Requirements (Strict)
1. Analyze and Compare: Carefully compare the user_answer to the expected_answer.
2. Determine Score: Award a fair score (can be a decimal) based on the max_marks.
3. Generate Feedback.
4. Structure Output as JSON: Your entire response MUST be a single, valid JSON object with the following exact structure:
{ "score_awarded": 0.0, "feedback_summary": "", "positive_points": [], "areas_for_improvement": [] }
## Grading Guidelines
- Be Fair: Award full marks for correct concepts, even with different wording.
- Be encouraging: Frame feedback constructively.
- Be Specific: Feedback points must be specific to the user's answer.
- Adhere to the max_marks.
`;

// GET /api/subjective/paper/:topicId - Fetches questions for a subjective paper
router.get('/paper/:topicId', verifyToken, async (req, res) => {
    const { topicId } = req.params;
    const tx = await turso.transaction('read');
    try {
        const [topicRes, questionsRes] = await Promise.all([
            tx.execute({ sql: "SELECT id, name FROM quiz_topics WHERE id = ?", args: [topicId] }),
            tx.execute({ sql: "SELECT id, topic_id, question_text, marks, difficulty FROM subjective_questions WHERE topic_id = ?", args: [topicId] })
        ]);
        await tx.commit();

        if (topicRes.rows.length === 0) {
            return res.status(404).json({ message: "Topic not found." });
        }
        res.json({ topic: topicRes.rows[0], questions: questionsRes.rows });
    } catch (e) {
        if (tx) await tx.rollback();
        res.status(500).json({ message: 'Could not fetch paper.' });
    }
});

// POST /api/subjective/submit - Submits a paper and starts the grading process
router.post('/submit', verifyToken, async (req, res) => {
    const { topicId, answers } = req.body;
    const userId = req.user.id;
    const resultId = uuidv4();

    const tx = await turso.transaction('write');
    try {
        const questionIds = answers.map(a => a.questionId);
        const placeholders = questionIds.map(() => '?').join(',');
        const questionsRes = await tx.execute({
            sql: `SELECT id, marks, expected_answer FROM subjective_questions WHERE id IN (${placeholders})`,
            args: questionIds
        });

        const questionsMap = new Map(questionsRes.rows.map(q => [q.id, { marks: q.marks, expected_answer: q.expected_answer }]));
        const totalMaxMarks = questionsRes.rows.reduce((sum, q) => sum + q.marks, 0);

        const initialResultData = answers.map(ans => ({
            questionId: ans.questionId,
            userAnswer: ans.userAnswer,
            score_awarded: null,
            feedback: null,
        }));

        await tx.execute({
            sql: `INSERT INTO subjective_results (id, user_id, topic_id, questions_and_answers, total_max_marks, grading_status)
                  VALUES (?, ?, ?, ?, ?, 'pending');`,
            args: [resultId, userId, topicId, JSON.stringify(initialResultData), totalMaxMarks]
        });
        await tx.commit();

        // Respond to the user immediately
        res.status(202).json({ resultId });

        // --- Start Asynchronous Grading Process ---
        (async () => {
            let totalMarksAwarded = 0;
            const gradedResults = [];

            for (const ans of answers) {
                const questionDetails = questionsMap.get(ans.questionId);
                if (!questionDetails) continue;

                const promptPayload = {
                    question_text: `Question for topic ${topicId}`, // You can enrich this later
                    expected_answer: questionDetails.expected_answer,
                    user_answer: JSON.stringify(ans.userAnswer), // The rich text JSON
                    max_marks: questionDetails.marks,
                };

                let score = 0;
                let feedback = {};
                try {
                    const fullPrompt = `${gradingPrompt}\n${JSON.stringify(promptPayload)}`;
                    const result = await gradingModel.generateContent(fullPrompt);
                    const responseText = result.response.text().replace(/```json|```/g, '').trim();
                    const aiResponse = JSON.parse(responseText);
                    score = aiResponse.score_awarded;
                    feedback = aiResponse;
                } catch (e) {
                    logError('GEMINI ERROR', `Grading failed for Q:${ans.questionId}`, e.message);
                    feedback = { error: "AI grader failed for this question." };
                }
                
                totalMarksAwarded += score;
                gradedResults.push({ ...ans, score_awarded: score, feedback });
            }

            const finalTx = await turso.transaction('write');
            try {
                await finalTx.execute({
                    sql: `UPDATE subjective_results SET questions_and_answers = ?, total_marks_awarded = ?, grading_status = 'completed' WHERE id = ?;`,
                    args: [JSON.stringify(gradedResults), totalMarksAwarded, resultId]
                });
                await finalTx.commit();
                logApi('INFO', 'Grading completed', `Result ID: ${resultId}`);
            } catch (e) {
                if (finalTx) await finalTx.rollback();
                logError('DB ERROR', 'Failed to save final grades', e.message);
            }
        })();
        // --- End Asynchronous Grading Process ---

    } catch (e) {
        if (tx) await tx.rollback();
        res.status(500).json({ message: 'Failed to submit paper.' });
    }
});

// GET /api/subjective/results/:resultId - Fetches a graded paper
router.get('/results/:resultId', verifyToken, async (req, res) => {
    const { resultId } = req.params;
    const userId = req.user.id;
    const tx = await turso.transaction('read');
    try {
        const resultRes = await tx.execute({
            sql: `SELECT sr.*, qt.name as topicName FROM subjective_results sr
                  JOIN quiz_topics qt ON sr.topic_id = qt.id
                  WHERE sr.id = ? AND sr.user_id = ?`,
            args: [resultId, userId]
        });
        await tx.commit();

        if (resultRes.rows.length === 0) {
            return res.status(404).json({ message: 'Result not found or you do not have permission to view it.' });
        }
        res.json(resultRes.rows[0]);
    } catch (e) {
        if (tx) await tx.rollback();
        res.status(500).json({ message: 'Could not fetch result.' });
    }
});

module.exports = router;