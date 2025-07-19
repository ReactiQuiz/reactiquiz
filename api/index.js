// api/index.js (Minimal Debugging Version)
const express = require('express');
const cors = require('cors');

// Initialize Express App
const app = express();

// --- Core Middleware ---
// Apply CORS to allow requests from any origin (for testing)
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- Health Check Endpoint ---
// This is the ONLY route that will be active.
app.get('/api/health', (req, res) => {
    // Log directly to the console to ensure we see it in Vercel logs
    console.log("HEALTH CHECK: /api/health endpoint was hit successfully.");
    
    // Send a success response
    res.status(200).json({ 
        status: 'ok', 
        message: 'ReactiQuiz API is healthy and running.',
        timestamp: new Date().toISOString()
    });
});

// --- Catch-all for any other API request ---
// This helps confirm that our routing is working.
app.use('/api/*', (req, res) => {
    console.log(`404 - Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `API endpoint not found at ${req.originalUrl}` });
});

// Export the configured app for Vercel
module.exports = app;