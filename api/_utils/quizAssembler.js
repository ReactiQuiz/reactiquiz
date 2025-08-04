// api/_utils/quizAssembler.js
const { shuffleArray } = require('./arrayUtils');

// Helper to get the difficulty score range for SQL queries
const getDifficultyRange = (difficulty) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // 'mixed'
    }
};

/**
 * An efficient function to fetch a specific number of questions for a subject,
 * respecting the 9th -> 8th -> 7th grade priority.
 * @param {object} tx - The active Turso database transaction.
 * @param {string} subjectKey - The key for the subject (e.g., 'physics').
 * @param {number} totalNeeded - The total number of questions to fetch.
 * @param {object} difficultyRange - The min/max difficulty scores.
 * @returns {Promise<Array>} A promise that resolves to an array of question objects.
 */
const fetchQuestionsForSubject = async (tx, subjectKey, totalNeeded, difficultyRange) => {
    let subjectQuestions = [];
    const gatheredQuestionIds = new Set();
    // The grade priority order
    const priorityOrder = ['9th', '8th', '7th'];

    for (const grade of priorityOrder) {
        if (subjectQuestions.length >= totalNeeded) break;

        const needed = totalNeeded - subjectQuestions.length;
        
        // A single, powerful SQL query to get questions for a specific grade and subject
        const { rows } = await tx.execute({
            sql: `
                SELECT q.* FROM questions q
                JOIN quiz_topics t ON q.topicId = t.id
                WHERE t.subject = ? 
                AND t.class = ?
                AND q.difficulty BETWEEN ? AND ?;
            `,
            args: [subjectKey, grade, difficultyRange.min, difficultyRange.max]
        });

        // Add the new questions, ensuring no duplicates are added
        const newQuestions = rows.filter(q => !gatheredQuestionIds.has(q.id));
        const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
        subjectQuestions.push(...questionsToAdd);
        questionsToAdd.forEach(q => gatheredQuestionIds.add(q.id));
    }
    return subjectQuestions;
};

/**
 * The main assembly function for the Homi Bhabha practice test.
 * @param {object} tx - The active Turso database transaction.
 * @param {object} params - The quiz parameters from the session.
 * @returns {Promise<Array>} A promise that resolves to the final 100-question quiz list.
 */
const assembleHomiBhabhaPracticeTest = async (tx, params) => {
    const { difficulty, questionComposition } = params;
    const difficultyRange = getDifficultyRange(difficulty);

    // Fetch questions for all required subjects in parallel for maximum speed
    const [physicsQs, chemistryQs, biologyQs, gkQs] = await Promise.all([
        fetchQuestionsForSubject(tx, 'physics', questionComposition.physics.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'chemistry', questionComposition.chemistry.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'biology', questionComposition.biology.total, difficultyRange),
        fetchQuestionsForSubject(tx, 'gk', questionComposition.gk.total, {min: 0, max: 100}) // GK has no difficulty filter
    ]);
    
    const finalQuestionList = [...physicsQs, ...chemistryQs, ...biologyQs, ...gkQs];
    const totalRequired = Object.values(questionComposition).reduce((acc, rule) => acc + rule.total, 0);

    // If we still couldn't find enough questions, throw an error
    if (finalQuestionList.length < totalRequired) {
        throw new Error(`Could not assemble the practice test. Only found ${finalQuestionList.length} of ${totalRequired} required questions.`);
    }
    
    return shuffleArray(finalQuestionList);
};


module.exports = { assembleHomiBhabhaPracticeTest };