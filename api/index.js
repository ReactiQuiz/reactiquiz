// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// The ONLY route for this test
app.get('/api/health', (req, res) => {
    console.log("HEALTH CHECK SUCCESSFUL: The minimal API is running!");
    res.status(200).json({ status: 'ok' });
});

// A catch-all for any other API request
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

module.exports = app;