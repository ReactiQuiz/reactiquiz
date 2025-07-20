// api/_middleware/auth.js
const jwt = require('jsonwebtoken');
const { logError } = require('../_utils/logger');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds { id, username } to the request object
        next();
    } catch (error) {
        logError('AUTH FAIL', 'Token verification failed', error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken };
