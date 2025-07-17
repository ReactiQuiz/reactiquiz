// api/_middleware/auth.js
import { supabase } from '../_utils/supabaseClient.js';
import { logError } from '../_utils/logger.js';

export const verifySupabaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Malformed token.' });
    }

    // Use Supabase to verify the JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
        logError('AUTH FAIL', 'Token verification failed', error.message);
        return res.status(401).json({ message: 'Invalid or expired token.', details: error.message });
    }

    if (!user) {
        return res.status(401).json({ message: 'User not found for this token.' });
    }

    // Attach user info to the request object for use in subsequent routes
    req.user = user;
    next();
};