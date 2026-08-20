// api/_utils/quizAssembler.js
/**
 * Quiz Assembly Utility
 * 
 * Provides functions for assembling quiz questions for Homi Bhabha practice tests.
 */

const { shuffleArray } = require('./arrayUtils');

/**
 * Fetch Questions For Subject
 * 
 * Fetches questions for a specific subject from the Turso database.
 * Prioritizes questions from higher grades (9th, 8th, 7th).
 */
const fetchQuestionsForSubject = async (tx, subjectKey, totalNeeded) => {
    let subjectQuestions = [];
    const gatheredQuestionIds = new Set();
    const priorityOrder = ['9th', '8th', '7th'];

    for (const grade of priorityOrder) {
        if (subjectQuestions.length >= totalNeeded) break;
        const needed = totalNeeded - subjectQuestions.length;

        const { rows } = await tx.execute({
            sql: `
                SELECT q.id, q.topicId, q.text, q.options FROM questions q
                JOIN quiz_topics t ON q.topicId = t.id
                JOIN subjects s ON t.subject_id = s.id
                WHERE s.subjectKey = ?
                AND t.class = ?;
            `,
            args: [subjectKey, grade]
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
 * questions from multiple subjects (Physics, Chemistry, Biology, GK).
 */
const assembleHomiBhabhaPracticeTest = async (tx, params) => {
    const { questionComposition } = params;

    const [physicsQs, chemistryQs, biologyQs, gkQs] = await Promise.all([
        fetchQuestionsForSubject(tx, 'physics', questionComposition.physics.total),
        fetchQuestionsForSubject(tx, 'chemistry', questionComposition.chemistry.total),
        fetchQuestionsForSubject(tx, 'biology', questionComposition.biology.total),
        fetchQuestionsForSubject(tx, 'gk', questionComposition.gk.total)
    ]);

    const allQuestions = [...physicsQs, ...chemistryQs, ...biologyQs, ...gkQs];
    if (allQuestions.length === 0) {
        throw new Error('No questions found for the specified composition.');
    }

    return shuffleArray(allQuestions);
};

module.exports = {
    assembleHomiBhabhaPracticeTest,
};