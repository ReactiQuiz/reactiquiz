// api/routes/homibhabha.js
/**
 * Homi Bhabha Exam Routes
 * 
 * Handles Homi Bhabha exam practice test question assembly from Turso database.
 * Fetches questions from Physics, Chemistry, Biology, and GK subjects based on
 * difficulty level and class. Prioritizes questions from higher grades (9th, 8th, 7th).
 */

const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { shuffleArray } = require('../_utils/arrayUtils');
const { asyncHandler } = require('../_utils/asyncHandler');

const router = Router();

/**
 * Get Difficulty Range
 * 
 * Maps difficulty string to numeric range for filtering questions.
 * 
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'mixed')
 * @returns {Object} Object with min and max difficulty values
 */
const getDifficultyRange = (difficulty) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // 'mixed'
    }
};

/**
 * Fetch Questions For Subject
 * 
 * Fetches questions for a specific subject with priority order (9th, 8th, 7th).
 * Filters by difficulty range and returns shuffled questions up to the total needed.
 * 
 * @param {Object} tx - Turso database transaction object
 * @param {string} subjectKey - Subject key identifier (e.g., 'physics', 'chemistry')
 * @param {number} totalNeeded - Total number of questions needed
 * @param {Object} difficultyRange - Object with min and max difficulty values
 * @returns {Promise<Array>} Array of question objects
 */
const fetchQuestionsForSubject = async (tx, subjectKey, totalNeeded, difficultyRange) => {
    let subjectQuestions = [];
    const gatheredQuestionIds = new Set();
    const priorityOrder = ['9th', '8th', '7th'];

    for (const grade of priorityOrder) {
        if (subjectQuestions.length >= totalNeeded) break;

        const needed = totalNeeded - subjectQuestions.length;

        // Deliberately omits q.correctOptionId and q.explanation — see the
        // matching comment in api/routes/quizSessions.js.
        const { rows } = await tx.execute({
            sql: `
                SELECT q.id, q.topicId, q.text, q.options, q.difficulty FROM questions q
                JOIN quiz_topics t ON q.topicId = t.id
                JOIN subjects s ON t.subject_id = s.id
                WHERE s.subjectKey = ?
                AND t.class = ?
                AND q.difficulty BETWEEN ? AND ?;
            `,
            args: [subjectKey, grade, difficultyRange.min, difficultyRange.max]
        });

        const newQuestions = rows.filter((q) => !gatheredQuestionIds.has(q.id));
        const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
        subjectQuestions.push(...questionsToAdd);
        questionsToAdd.forEach((q) => gatheredQuestionIds.add(q.id));
    }
    return subjectQuestions;
};

/**
 * GET /api/homibhabha/practice
 * 
 * Assembles a Homi Bhabha practice test with questions from Physics, Chemistry,
 * Biology, and GK subjects. Question composition: 30 Physics, 30 Chemistry,
 * 30 Biology, 10 GK (total 100 questions).
 * 
 * @query {string} class - Class identifier (e.g., '9th', '8th', '7th')
 * @query {string} difficulty - Difficulty level ('easy', 'medium', 'hard', 'mixed')
 * @returns {Array} Shuffled array of 100 question objects
 */
router.get('/practice', asyncHandler(async (req, res) => {
    const { class: mainClass, difficulty } = req.query;
    logApi('GET', '/api/homibhabha/practice', `Class: ${mainClass}, Difficulty: ${difficulty}`);

    if (!mainClass || !difficulty) {
        res.status(400).json({ message: 'Class and difficulty are required.' });
        return;
    }

    const composition = {
        physics: { total: 30 },
        chemistry: { total: 30 },
        biology: { total: 30 },
        gk: { total: 10 }
    };

    const tx = await turso.transaction("read");
    try {
        const difficultyRange = getDifficultyRange(difficulty);

        const [physicsQs, chemistryQs, biologyQs, gkQs] = await Promise.all([
            fetchQuestionsForSubject(tx, 'physics', composition.physics.total, difficultyRange),
            fetchQuestionsForSubject(tx, 'chemistry', composition.chemistry.total, difficultyRange),
            fetchQuestionsForSubject(tx, 'biology', composition.biology.total, difficultyRange),
            fetchQuestionsForSubject(tx, 'gk', composition.gk.total, difficultyRange)
        ]);

        await tx.commit();

        const finalQuestionList = [...physicsQs, ...chemistryQs, ...biologyQs, ...gkQs];
        const totalRequired = Object.values(composition).reduce((acc, rule) => acc + rule.total, 0);

        if (finalQuestionList.length < totalRequired) {
            const message = `Could not assemble the practice test. Only found ${finalQuestionList.length} of ${totalRequired} required questions.`;
            logError('QUIZ ASSEMBLY', message);
            res.status(404).json({ message });
            return;
        }

        res.json(shuffleArray(finalQuestionList));

    } catch (e) {
        if (tx && !tx.closed) { await tx.rollback(); }
        logError('DB ERROR', 'Failed to assemble Homi Bhabha test', e.message);
        res.status(500).json({ message: 'A server error occurred while assembling the quiz.' });
    }
}));

module.exports = router;