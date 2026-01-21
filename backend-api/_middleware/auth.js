// api/_middleware/auth.js
/**
 * Authentication Middleware
 * 
 * Provides JWT token verification middleware for protecting API routes.
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded user information to the request object.
 */

const jwt = require('jsonwebtoken');
const { logError } = require('../_utils/logger');

/**
 * Verify Token Middleware
 * 
 * Verifies JWT tokens from the Authorization header and attaches user
 * information to the request object. Returns 401 if token is invalid
 * or missing.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authentication token is required.' });
        return;
    }
    const token = authHeader.split(' ')[1];

    // Validate JWT_SECRET environment variable
    if (!process.env.JWT_SECRET) {
        logError('FATAL', 'JWT_SECRET is not defined in environment variables.');
        res.status(500).json({ message: 'Server configuration error.' });
        return;
    }

    // Verify and decode the JWT token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach decoded user information to request object (contains { id, username })
        req.user = decoded;
        next();
    } catch (error) {
        logError('AUTH FAIL', 'Token verification failed', error.message);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken };