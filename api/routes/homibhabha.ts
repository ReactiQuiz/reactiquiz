import { Router, Request, Response } from 'express';
import { turso } from '../_utils/tursoClient';
import { logApi, logError } from '../_utils/logger';
import { shuffleArray } from '../_utils/arrayUtils';

const router: Router = Router();

interface DifficultyRange {
    min: number;
    max: number;
}

interface Composition {
    physics: { total: number };
    chemistry: { total: number };
    biology: { total: number };
    gk: { total: number };
}

interface Question {
    id: string;
    topicId: string;
    text: string;
    options: any;
    correctOptionId: string;
    explanation: string;
    difficulty: number;
}

// A helper to get the difficulty score range
const getDifficultyRange = (difficulty: string): DifficultyRange => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 }; // 'mixed'
    }
};

// This powerful helper fetches questions for a single subject based on the 9th -> 8th -> 7th priority
const fetchQuestionsForSubject = async (tx: any, subjectKey: string, totalNeeded: number, difficultyRange: DifficultyRange): Promise<Question[]> => {
    let subjectQuestions: Question[] = [];
    const gatheredQuestionIds = new Set<string>();
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

        const newQuestions = (rows as Question[]).filter((q: Question) => !gatheredQuestionIds.has(q.id));
        const questionsToAdd = shuffleArray(newQuestions).slice(0, needed);
        subjectQuestions.push(...questionsToAdd);
        questionsToAdd.forEach((q: Question) => gatheredQuestionIds.add(q.id));
    }
    return subjectQuestions;
};

router.get('/practice', async (req: Request, res: Response): Promise<void> => {
    const { class: mainClass, difficulty } = req.query as { class?: string; difficulty?: string };
    logApi('GET', '/api/homibhabha/practice', `Class: ${mainClass}, Difficulty: ${difficulty}`);

    if (!mainClass || !difficulty) {
        res.status(400).json({ message: 'Class and difficulty are required.' });
        return;
    }

    const composition: Composition = {
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
        await tx.rollback();
        logError('DB ERROR', 'Failed to assemble Homi Bhabha test', (e as Error).message);
        res.status(500).json({ message: 'A server error occurred while assembling the quiz.' });
    }
});

export default router;
