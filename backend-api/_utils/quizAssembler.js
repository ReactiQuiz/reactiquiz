// api/_utils/quizAssembler.js
/**
 * Quiz Assembly Utility
 * 
 * Provides functions for assembling quiz questions for Homi Bhabha practice tests.
 * Handles question fetching from Turso database, difficulty filtering, and
 * subject-based question composition.
 */

const { shuffleArray } = require('./arrayUtils');

/**
 * Get Difficulty Range
 * 
 * Maps difficulty string ('easy', 'medium', 'hard') to numeric range
 * for filtering questions by difficulty level.
 * 
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns {Object} Object with min and max difficulty values
 */
const getDifficultyRange = (difficulty) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 };
    }
};

/**
 * Fetch Questions For Subject
 * 
 * Fetches questions for a specific subject from the Turso database.
 * Prioritizes questions from higher grades (9th, 8th, 7th) and filters
 * by difficulty range. Returns shuffled questions up to the total needed.
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
        
        const { rows } = await tx.execute({
            sql: `
                SELECT q.* FROM questions q
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
 * Assemble Homi Bhabha Practice Test
 * 
 * Assembles a complete practice test for Homi Bhabha exam by fetching
 * questions from multiple subjects (Physics, Chemistry, Biology, GK)
 * based on the specified question composition and difficulty level.
 * Returns a shuffled array of all questions.
 * 
 * @param {Object} tx - Turso database transaction object
 * @param {Object} params - Parameters object containing:
 *   - {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 *   - {Object} questionComposition - Object with subject question counts
 * @returns {Promise<Array>} Shuffled array of all assembled questions
 * @throws {Error} If no questions are found for any subject
 */
const assembleHomiBhabhaPracticeTest = async (tx, params) => {
    const { difficulty, questionComposition } = params;
    const difficultyRange = getDifficultyRange(difficulty);

    const [physicsQs, chemistryQs, biologyQs, gkQs] = await Promise.all([
        fetchQuestionsForSubject(tx, 'physics', questionComposition.physics.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'chemistry', questionComposition.chemistry.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'biology', questionComposition.biology.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'gk', questionComposition.gk.total, {min: 0, max: 100})
    ]);
    
    // Combine all questions from different subjects
    const finalQuestionList = [...physicsQs, ...chemistryQs, ...biologyQs, ...gkQs];
    
    // Validate question count - warn if fewer questions found than required
    const totalRequired = Object.values(questionComposition).reduce((acc, rule) => acc + rule.total, 0);
    if (finalQuestionList.length < totalRequired) {
        console.warn(`[Quiz Assembly Warning]: Could only find ${finalQuestionList.length} of ${totalRequired} required questions for Homi Bhabha test. Proceeding with the available questions.`);
    }
    
    // Fail if no questions found at all
    if (finalQuestionList.length === 0) {
        throw new Error(`Could not assemble the practice test. No questions were found for any of the required subjects.`);
    }
    
    // Return shuffled questions
    return shuffleArray(finalQuestionList);
};

module.exports = { assembleHomiBhabhaPracticeTest };