const jwt = require('jsonwebtoken');
const { logError } = require('../_utils/logger');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authentication token is required.' });
        return;
    }
    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
        logError('FATAL', 'JWT_SECRET is not defined in environment variables.');
        res.status(500).json({ message: 'Server configuration error.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds { id, username } to the request object
        next();
    } catch (error) {
        logError('AUTH FAIL', 'Token verification failed', error.message);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken };