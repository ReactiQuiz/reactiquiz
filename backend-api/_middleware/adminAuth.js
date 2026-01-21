// api/_middleware/adminAuth.js
/**
 * Admin Authentication Middleware
 * 
 * Provides middleware for protecting admin-only API routes.
 * First verifies the JWT token, then checks if the user has admin privileges.
 * Returns 403 if the user is not an admin.
 */

const { verifyToken } = require('./auth');

/**
 * Verify Admin Middleware
 * 
 * Verifies that the user is authenticated and has admin privileges.
 * First calls verifyToken to validate the JWT, then checks the isAdmin
 * flag in the token payload.
 * 
 * @param {Object} req - Express request object (must have req.user from verifyToken)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyAdmin = (req, res, next) => {
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

module.exports = { verifyAdmin };