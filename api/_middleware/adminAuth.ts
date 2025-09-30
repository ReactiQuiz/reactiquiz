import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthenticatedRequest } from './auth';

const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // First, verify the token is valid
    verifyToken(req, res, () => {
        // Then, check if the isAdmin flag is true in the token's payload
        if (req.user && req.user.isAdmin) {
            next(); // User is an admin, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: Administrator access required.' });
        }
    });
};

export { verifyAdmin };
