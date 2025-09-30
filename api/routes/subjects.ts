// api/routes/subjects.ts
import { Router, Request, Response } from 'express';
import { turso } from '../_utils/tursoClient';
import { logApi, logError } from '../_utils/logger';

const router = Router();

// --- START OF FIX: USE TRANSACTION ---
router.get('/', async (req: Request, res: Response) => {
    logApi('GET', '/api/subjects');
    const tx = await turso.transaction("read");
    try {
        const result = await tx.execute("SELECT * FROM subjects ORDER BY displayOrder ASC");
        await tx.commit();
        res.json(result.rows);
    } catch (e: any) {
        await tx.rollback();
        logError('DB ERROR', 'Fetching subjects failed', e.message);
        res.status(500).json({ message: 'Could not fetch subjects.' });
    }
});
// --- END OF FIX ---

export default router;
