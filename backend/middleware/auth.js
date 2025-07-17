// backend/middleware/auth.js
const { usersDb } = require('../db');

const verifySessionToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }
    const token = authHeader.split(' ')[1];

    if (!usersDb || usersDb.open === false) {
        return res.status(503).json({ message: 'Service temporarily unavailable.' });
    }

    usersDb.get("SELECT * FROM users WHERE active_session_token = ?", [token], (err, user) => {
        if (err) {
            console.error("Token verification error:", err);
            return res.status(500).json({ message: "Server error verifying token." });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid session token. Please login again." });
        }
        if (new Date() > new Date(user.active_session_token_expires_at)) {
            return res.status(401).json({ message: "Session token expired. Please login again." });
        }
        
        // Attach user info to the request object
        req.user = { id: user.id, identifier: user.identifier, email: user.email };
        next();
    });
};

module.exports = { verifySessionToken };