// api/routes/pdf.js
/**
 * PDF Generation Routes
 * 
 * Handles PDF generation for quiz questions and topics.
 * Fetches questions from Supabase and prepares data for client-side PDF generation.
 * All routes require authentication via verifyToken middleware.
 */

const { Router } = require('express');
const { verifyToken } = require('../_middleware/auth');
const { db } = require('../_utils/supabaseClient');
const { logApi, logError } = require('../_utils/logger');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

/**
 * GET /api/pdf/questions/:topicId
 * 
 * Fetches questions for a topic and prepares data for PDF generation.
 * Supports various PDF options including answers, explanations, and answer keys.
 * Returns questions data for client-side PDF generation.
 * 
 * @param {string} topicId - Topic ID to fetch questions for
 * @query {string} [includeAnswers='false'] - Whether to include answers in PDF
 * @query {string} [includeExplanations='true'] - Whether to include explanations
 * @query {string} [includeAnswerKey='true'] - Whether to include answer key
 * @query {string} [pageSize='a4'] - PDF page size
 * @query {string} [orientation='portrait'] - PDF orientation
 */
router.get('/questions/:topicId', verifyToken, asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const { 
        includeAnswers = 'false', 
        includeExplanations = 'true', 
        includeAnswerKey = 'true',
        pageSize = 'a4',
        orientation = 'portrait'
    } = req.query;

    logApi('GET', `/api/pdf/questions/${topicId}`, `User: ${req.user.username}`);

    try {
        // Fetch topic information
        const topicResult = await db.query('topics', {
            filters: { id: topicId },
            isAdmin: false
        });

        if (topicResult.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const topic = topicResult[0];

        // Fetch questions for the topic
        const questionsResult = await db.query('questions', {
            filters: { topic_id: topicId, is_active: true },
            isAdmin: false,
            orderBy: { column: 'difficulty_level', ascending: true }
        });

        if (questionsResult.length === 0) {
            return res.status(404).json({ message: 'No questions found for this topic' });
        }

        // Prepare questions data
        const questions = questionsResult.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options || [],
            correctOptionId: q.correct_option_id,
            explanation: q.explanation,
            difficulty: q.difficulty_level,
            topicId: q.topic_id
        }));

        // Prepare PDF options
        const pdfOptions = {
            title: `Practice Questions - ${topic.name}`,
            subtitle: `Class: ${topic.class || 'N/A'}`,
            includeAnswers: includeAnswers === 'true',
            includeExplanations: includeExplanations === 'true',
            includeAnswerKey: includeAnswerKey === 'true',
            pageSize: pageSize,
            orientation: orientation,
            topicName: topic.name,
            className: topic.class
        };

        // Return questions data for client-side PDF generation
        res.json({
            success: true,
            questions,
            topic,
            pdfOptions,
            message: 'Questions data prepared for PDF generation'
        });

    } catch (error) {
        logError('PDF ERROR', `Failed to prepare questions for PDF generation`, error.message);
        res.status(500).json({ message: 'Failed to prepare questions for PDF generation' });
    }
}));

// GET /api/pdf/subjective/:topicId - Generate PDF for subjective questions
router.get('/subjective/:topicId', verifyToken, asyncHandler(async (req, res) => {
    const { topicId } = req.params;
    const { 
        includeAnswers = 'false',
        pageSize = 'a4',
        orientation = 'portrait'
    } = req.query;

    logApi('GET', `/api/pdf/subjective/${topicId}`, `User: ${req.user.username}`);

    try {
        // Fetch topic information
        const topicResult = await db.query('topics', {
            filters: { id: topicId },
            isAdmin: false
        });

        if (topicResult.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const topic = topicResult[0];

        // Fetch subjective questions
        const questionsResult = await db.query('subjective_questions', {
            filters: { topic_id: topicId, is_active: true },
            isAdmin: false,
            orderBy: { column: 'difficulty', ascending: true }
        });

        if (questionsResult.length === 0) {
            return res.status(404).json({ message: 'No subjective questions found for this topic' });
        }

        // Prepare questions data
        const questions = questionsResult.map(q => ({
            id: q.id,
            text: q.text,
            expectedAnswer: q.expected_answer,
            maxPoints: q.max_points,
            difficulty: q.difficulty,
            questionType: q.question_type,
            keywords: q.keywords,
            topicId: q.topic_id
        }));

        // Prepare PDF options
        const pdfOptions = {
            title: `Subjective Questions - ${topic.name}`,
            subtitle: `Class: ${topic.class || 'N/A'}`,
            includeAnswers: includeAnswers === 'true',
            pageSize: pageSize,
            orientation: orientation,
            topicName: topic.name,
            className: topic.class
        };

        res.json({
            success: true,
            questions,
            topic,
            pdfOptions,
            message: 'Subjective questions data prepared for PDF generation'
        });

    } catch (error) {
        logError('PDF ERROR', `Failed to prepare subjective questions for PDF generation`, error.message);
        res.status(500).json({ message: 'Failed to prepare subjective questions for PDF generation' });
    }
}));

/**
 * GET /api/pdf/quiz-session/:sessionId
 * 
 * Fetches quiz session and results data for PDF generation.
 * Includes questions, user answers, correct answers, and explanations.
 * Returns data for client-side PDF generation of completed quiz.
 * 
 * @param {string} sessionId - Quiz session ID to fetch data for
 * @query {string} [includeAnswers='true'] - Whether to include answers in PDF
 * @query {string} [includeExplanations='true'] - Whether to include explanations
 * @query {string} [pageSize='a4'] - PDF page size
 * @query {string} [orientation='portrait'] - PDF orientation
 */
router.get('/quiz-session/:sessionId', verifyToken, asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { 
        includeAnswers = 'true',
        includeExplanations = 'true',
        pageSize = 'a4',
        orientation = 'portrait'
    } = req.query;

    logApi('GET', `/api/pdf/quiz-session/${sessionId}`, `User: ${req.user.username}`);

    try {
        // Fetch quiz session
        const sessionResult = await db.query('quiz_sessions', {
            filters: { id: sessionId, user_id: req.user.id },
            isAdmin: false
        });

        if (sessionResult.length === 0) {
            return res.status(404).json({ message: 'Quiz session not found' });
        }

        const session = sessionResult[0];

        // Fetch quiz results
        const resultsResult = await db.query('quiz_results', {
            filters: { session_id: sessionId },
            isAdmin: false,
            orderBy: { column: 'answered_at', ascending: true }
        });

        if (resultsResult.length === 0) {
            return res.status(404).json({ message: 'No quiz results found for this session' });
        }

        // Fetch questions for the results
        const questionIds = resultsResult.map(r => r.question_id);
        const questionsResult = await db.query('questions', {
            filters: { id: questionIds },
            isAdmin: false
        });

        // Combine results with questions
        const questionsWithResults = resultsResult.map(result => {
            const question = questionsResult.find(q => q.id === result.question_id);
            return {
                id: question.id,
                text: question.text,
                options: question.options || [],
                correctOptionId: question.correct_option_id,
                explanation: question.explanation,
                difficulty: question.difficulty_level,
                userAnswer: result.user_answer,
                isCorrect: result.is_correct,
                pointsEarned: result.points_earned,
                timeSpent: result.time_spent
            };
        });

        // Fetch topic information
        const topicResult = await db.query('topics', {
            filters: { id: session.topic_id },
            isAdmin: false
        });

        const topic = topicResult[0] || { name: 'Unknown Topic', class: 'N/A' };

        // Prepare PDF options
        const pdfOptions = {
            title: `Quiz Results - ${topic.name}`,
            subtitle: `Score: ${session.correct_answers}/${session.total_questions} (${Math.round((session.correct_answers / session.total_questions) * 100)}%)`,
            includeAnswers: includeAnswers === 'true',
            includeExplanations: includeExplanations === 'true',
            includeAnswerKey: false,
            pageSize: pageSize,
            orientation: orientation,
            topicName: topic.name,
            className: topic.class,
            sessionInfo: {
                totalQuestions: session.total_questions,
                correctAnswers: session.correct_answers,
                totalScore: session.total_score,
                maxPossibleScore: session.max_possible_score,
                timeSpent: session.time_spent,
                completedAt: session.completed_at
            }
        };

        res.json({
            success: true,
            questions: questionsWithResults,
            topic,
            session,
            pdfOptions,
            message: 'Quiz session data prepared for PDF generation'
        });

    } catch (error) {
        logError('PDF ERROR', `Failed to prepare quiz session for PDF generation`, error.message);
        res.status(500).json({ message: 'Failed to prepare quiz session for PDF generation' });
    }
}));

/**
 * GET /api/pdf/homi-bhabha/:class/:difficulty
 * 
 * Fetches Homi Bhabha practice test questions for PDF generation.
 * Returns placeholder response (not yet fully implemented).
 * 
 * @param {string} class - Class identifier (e.g., '9th', '8th', '7th')
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'mixed')
 * @query {string} [includeAnswers='false'] - Whether to include answers in PDF
 * @query {string} [includeExplanations='true'] - Whether to include explanations
 * @query {string} [includeAnswerKey='true'] - Whether to include answer key
 * @query {string} [pageSize='a4'] - PDF page size
 * @query {string} [orientation='portrait'] - PDF orientation
 */
router.get('/homi-bhabha/:class/:difficulty', verifyToken, asyncHandler(async (req, res) => {
    const { class: mainClass, difficulty } = req.params;
    const { 
        includeAnswers = 'false',
        includeExplanations = 'true',
        includeAnswerKey = 'true',
        pageSize = 'a4',
        orientation = 'portrait'
    } = req.query;

    logApi('GET', `/api/pdf/homi-bhabha/${mainClass}/${difficulty}`, `User: ${req.user.username}`);

    try {
        // This would integrate with the existing Homi Bhabha logic
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Homi Bhabha PDF generation not yet implemented',
            questions: [],
            pdfOptions: {
                title: `Homi Bhabha Practice Test - Class ${mainClass}`,
                subtitle: `Difficulty: ${difficulty}`,
                includeAnswers: includeAnswers === 'true',
                includeExplanations: includeExplanations === 'true',
                includeAnswerKey: includeAnswerKey === 'true',
                pageSize: pageSize,
                orientation: orientation,
                className: mainClass
            }
        });

    } catch (error) {
        logError('PDF ERROR', `Failed to prepare Homi Bhabha test for PDF generation`, error.message);
        res.status(500).json({ message: 'Failed to prepare Homi Bhabha test for PDF generation' });
    }
}));

/**
 * POST /api/pdf/generate
 * 
 * Generates PDF data for custom question sets.
 * Supports fetching questions by specific IDs or by topic ID.
 * Returns formatted questions data for client-side PDF generation.
 * Requires authentication via verifyToken middleware.
 * 
 * @body {Array} [questionIds] - Array of specific question IDs to fetch
 * @body {string} [topicId] - Topic ID to fetch all questions from
 * @body {Object} [options] - PDF generation options (title, subtitle, includeAnswers, etc.)
 */
router.post('/generate', verifyToken, asyncHandler(async (req, res) => {
    const { 
        questionIds, 
        topicId, 
        options = {} 
    } = req.body;

    logApi('POST', '/api/pdf/generate', `User: ${req.user.username}`);

    try {
        let questions = [];

        if (questionIds && questionIds.length > 0) {
            // Fetch specific questions by IDs
            const questionsResult = await db.query('questions', {
                filters: { id: questionIds },
                isAdmin: false
            });
            questions = questionsResult;
        } else if (topicId) {
            // Fetch all questions from topic
            const questionsResult = await db.query('questions', {
                filters: { topic_id: topicId, is_active: true },
                isAdmin: false,
                orderBy: { column: 'difficulty_level', ascending: true }
            });
            questions = questionsResult;
        } else {
            return res.status(400).json({ message: 'Either questionIds or topicId must be provided' });
        }

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found' });
        }

        // Prepare questions data
        const formattedQuestions = questions.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options || [],
            correctOptionId: q.correct_option_id,
            explanation: q.explanation,
            difficulty: q.difficulty_level,
            topicId: q.topic_id
        }));

        res.json({
            success: true,
            questions: formattedQuestions,
            pdfOptions: {
                title: options.title || 'Custom Questions PDF',
                subtitle: options.subtitle || '',
                includeAnswers: options.includeAnswers || false,
                includeExplanations: options.includeExplanations || true,
                includeAnswerKey: options.includeAnswerKey || true,
                pageSize: options.pageSize || 'a4',
                orientation: options.orientation || 'portrait',
                ...options
            },
            message: 'Questions data prepared for PDF generation'
        });

    } catch (error) {
        logError('PDF ERROR', `Failed to prepare custom questions for PDF generation`, error.message);
        res.status(500).json({ message: 'Failed to prepare questions for PDF generation' });
    }
}));

module.exports = router;
