import { Router, Response } from 'express';
import * as crypto from 'crypto';
import { turso } from '../_utils/tursoClient';
import { verifyToken, AuthenticatedRequest } from '../_middleware/auth';
import { logApi, logError } from '../_utils/logger';
import { assembleHomiBhabhaPracticeTest } from '../_utils/quizAssembler';
import { shuffleArray } from '../_utils/arrayUtils';

const router: Router = Router();
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

const getDifficultyRange = (difficulty: string) => {
    switch (difficulty) {
        case 'easy': return { min: 10, max: 13 };
        case 'medium': return { min: 14, max: 17 };
        case 'hard': return { min: 18, max: 20 };
        default: return { min: 0, max: 100 };
    }
};

router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    // Accept either wrapped in quizParams or direct body
    const quizParams = req.body.quizParams || req.body;
    logApi('POST', '/api/quiz-sessions', `User: ${userId}`);

    if (!quizParams || !quizParams.topicId) {
        res.status(400).json({ message: 'Invalid quiz parameters provided.' });
        return;
    }

    const sessionId = crypto.randomBytes(8).toString('hex');
    const tx = await turso.transaction("write");
    try {
        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE user_id = ?;", args: [userId] });
        await tx.execute({ sql: "INSERT INTO quiz_sessions (id, user_id, quiz_params_json) VALUES (?, ?, ?);", args: [sessionId, userId, JSON.stringify(quizParams)] });
        await tx.commit();
        res.status(201).json({ sessionId });
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', 'Failed to create quiz session', (e as Error).message);
        res.status(500).json({ message: 'Could not create quiz session.' });
    }
});

router.get('/:sessionId', verifyToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    logApi('GET', `/api/quiz-sessions/${sessionId}`, `User: ${userId}`);

    const tx = await turso.transaction("write");
    try {
        const sessionResult = await tx.execute({ sql: "SELECT * FROM quiz_sessions WHERE id = ? AND user_id = ?;", args: [sessionId, userId] });

        if (sessionResult.rows.length === 0) {
            await tx.rollback();
            res.status(404).json({ message: 'Quiz session not found. It may have expired or already been used.' });
            return;
        }

        const session = sessionResult.rows[0] as any;
        const sessionAge = new Date().getTime() - new Date(session.created_at).getTime();

        if (sessionAge > FIVE_MINUTES_IN_MS) {
            await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
            await tx.commit();
            res.status(410).json({ message: 'This quiz session has expired. Please start a new quiz.' });
            return;
        }

        const quizParams = JSON.parse(session.quiz_params_json);
        let questions: any[] = [];

        // --- START OF FIX: Use the new, efficient backend assembler ---
        if (quizParams.quizType === 'homibhabha-practice') {
            questions = await assembleHomiBhabhaPracticeTest(tx, quizParams);
        } else {
            // Standard topic quiz logic is now also handled robustly on the backend
            const difficultyRange = getDifficultyRange(quizParams.difficulty);
            const { rows } = await tx.execute({
                sql: `SELECT * FROM questions WHERE topicId = ? AND difficulty BETWEEN ? AND ?;`,
                args: [quizParams.topicId, difficultyRange.min, difficultyRange.max]
            });

            if (rows.length < quizParams.numQuestions) {
                await tx.rollback();
                res.status(404).json({ message: `Could not find ${quizParams.numQuestions} questions for the selected difficulty. Found only ${rows.length}. Try 'Mixed' difficulty.` });
                return;
            }
            questions = shuffleArray(rows).slice(0, quizParams.numQuestions);
        }
        // --- END OF FIX ---

        await tx.execute({ sql: "DELETE FROM quiz_sessions WHERE id = ?", args: [sessionId] });
        await tx.commit();

        res.json({ questions, context: quizParams });

    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Failed to fetch quiz for session ${sessionId}`, (e as Error).message);
        // Forward the specific error message from the assembler
        res.status(500).json({ message: (e as Error).message || 'Could not retrieve quiz data.' });
    }
});

export default router;
