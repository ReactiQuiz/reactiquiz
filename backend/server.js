// --- STEP 1: The Base server.js ---
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const debug = require('debug');

const logServer = debug('reactiquiz:server');
const logApi = debug('reactiquiz:api');

const app = express();
const port = process.env.PORT || 3001;
const projectRoot = path.resolve(__dirname, '../');

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
    logApi('[INFO] Health check successful');
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// --- Static file serving & Fallback ---
if (process.env.NODE_ENV === 'production' || process.env.SERVE_BUILD === 'true') {
    app.use(express.static(path.join(projectRoot, 'build')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(projectRoot, 'build', 'index.html'), (err) => {
                if (err) res.status(500).send(err.message || 'Error sending index.html');
            });
        } else {
            res.status(404).json({ message: "API endpoint not found" });
        }
    });
}

app.listen(port, () => {
    logServer(`[INFO] BASE SERVER STARTED on port: ${port}`);
});