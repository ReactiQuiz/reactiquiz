// backend/server.js

const express = require('express');
const app = express();

// Render provides the port to listen on via the PORT environment variable.
// We fall back to 3001 for local development.
const port = process.env.PORT || 3001;

// A simple root endpoint to confirm the server is running.
app.get('/', (req, res) => {
  // Send a JSON response, which is common for APIs.
  res.status(200).json({
    status: 'success',
    message: 'Render test server is running!',
    port: port
  });
});

// A test endpoint with a parameter to ensure routing works.
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.status(200).json({
    message: `Hello, ${name}! The parameterized route is working.`
  });
});

// Start the server and listen on the correct port.
app.listen(port, () => {
  // This log is CRUCIAL. You will see it in the Render deploy logs if it starts successfully.
  console.log(`[INFO] Minimal server started successfully. Listening on port ${port}`);
});

// Optional: Add error handlers to catch any unexpected issues.
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection:', reason, promise);
});
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});
