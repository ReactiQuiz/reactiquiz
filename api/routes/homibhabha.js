// api/routes/homibhabha.js
const { Router } = require('express');
const { turso } = require('../_utils/tursoClient');
const { logApi, logError } = require('../_utils/logger');
const { shuffleArray } = require('../_utils/arrayUtils'); // We'll create this utility

const router = Router();

// A helper to get the difficulty score range
const getDifficultyRange = (difficulty) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // 'mixed'
    }
};

// This powerful helper fetches questions for a single subject based on the 9th -> 8th -> 7th priority
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
                WHERE t.subject = ? 
                AND t.class = ?
                AND q.difficulty BETWEEN ? AND ?;
            `,
            args: [subjectKey, grade, difficultyRange.min, difficultyRange.max]
        });

        const newQuestions = rows.filter(q => !gatheredQuestionIds.has(q.id));
        const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
        subjectQuestions.push(...questionsToAdd);
        questionsToAdd.forEach(q => gatheredQuestionIds.add(q.id));
    }
    return subjectQuestions;
};

router.get('/practice', async (req, res) => {
    const { class: mainClass, difficulty } = req.query;
    logApi('GET', '/api/homibhabha/practice', `Class: ${mainClass}, Difficulty: ${difficulty}`);

    if (!mainClass || !difficulty) {
        return res.status(400).json({ message: 'Class and difficulty are required.' });
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
            return res.status(404).json({ message });
        }
        
        res.json(shuffleArray(finalQuestionList));

    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Failed to assemble Homi Bhabha test', e.message);
        res.status(500).json({ message: 'A server error occurred while assembling the quiz.' });
    }
});

module.exports = router;