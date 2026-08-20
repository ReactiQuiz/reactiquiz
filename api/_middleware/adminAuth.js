// api/_middleware/adminAuth.js
/**
 * Admin Authentication Middleware
 *
 * Provides middleware for protecting admin-only API routes.
 * First verifies the JWT token, then checks admin privileges. This is the
 * single source of truth for "is this user an admin" — it must match
 * src/components/core/AdminRoute.tsx's frontend gate exactly, or a user can
 * pass one check and fail the other.
 *
 * Admin check, in order:
 * 1. The `isAdmin` flag on the user record (set via the DB / admin tooling).
 * 2. A fallback match against ADMIN_USER_ID, for bootstrapping the very
 *    first admin before any user has isAdmin set.
 */

const { verifyToken } = require('./auth');

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        const adminUserId = process.env.ADMIN_USER_ID ? process.env.ADMIN_USER_ID.trim() : '';
        const isFallbackAdmin = Boolean(adminUserId && adminUserId.length > 5 && req.user?.id === adminUserId);
        const isAdmin = Boolean(req.user && req.user.isAdmin) || isFallbackAdmin;
        if (isAdmin) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Administrator access required.' });
        }
    });
};

module.exports = { verifyAdmin };
