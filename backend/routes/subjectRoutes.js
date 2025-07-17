// backend/routes/subjectRoutes.js
const express = require('express');
const { subjectsDb } = require('../db');
const { logApi, logError } = require('../utils/logger');

const router = express.Router();

router.get('/', (req, res) => {
    logApi('GET', '/api/subjects');
    const sql = `SELECT id, name, description, accentColor, iconName, displayOrder, subjectKey FROM subjects ORDER BY displayOrder ASC`;
    subjectsDb.all(sql, [], (err, rows) => {
        if (err) {
            logError('DB ERROR', 'Fetching subjects', err.message);
            return res.status(500).json({ message: `Failed to fetch subjects.` });
        }
        res.json(rows || []);
    });
});

module.exports = router;