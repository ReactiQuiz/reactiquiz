import { Router, Request, Response } from 'express';
import { turso } from '../_utils/tursoClient';
import { logApi, logError } from '../_utils/logger';

const router: Router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    const { topicId, ids } = req.query as { topicId?: string; ids?: string };

    if (!topicId && !ids) {
        res.status(400).json({ message: 'A topicId or a list of ids is required.' });
        return;
    }

    const tx = await turso.transaction("read");
    try {
        let result: any = { rows: [] };

        // --- START OF THE DEFINITIVE FIX ---
        // Prioritize fetching by specific IDs if they are provided.
        if (ids) {
            const idArray = ids.split(',');
            if (idArray.length === 0) {
                res.json([]);
                return;
            }
            logApi('GET', '/api/questions', `Fetching ${idArray.length} specific questions`);

            // Create the correct number of placeholders for the SQL query
            const placeholders = idArray.map(() => '?').join(',');

            result = await tx.execute({
                sql: `SELECT * FROM questions WHERE id IN (${placeholders})`,
                args: idArray
            });

        } else if (topicId) {
            // Fallback to the original logic if only a topicId is provided
            logApi('GET', '/api/questions', `Topic: ${topicId}`);
            result = await tx.execute({
                sql: "SELECT * FROM questions WHERE topicId = ?",
                args: [topicId]
            });
        }
        // --- END OF THE DEFINITIVE FIX ---

        await tx.commit();
        const parsedRows = result.rows.map((row: any) => ({
            ...row,
            options: JSON.parse(row.options || '[]')
        }));
        res.json(parsedRows);
    } catch (e) {
        await tx.rollback();
        logError('DB ERROR', `Fetching questions failed`, (e as Error).message);
        res.status(500).json({ message: 'Could not fetch questions.' });
    }
});

export default router;
