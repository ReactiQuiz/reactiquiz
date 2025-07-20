// api/_utils/tursoClient.js
const { createClient } = require('@libsql/client');

// Vercel automatically provides these environment variables after integration.
// For local development, you'll need to get these from your Turso dashboard
// and add them to your .env file.
const tursoConfig = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

if (!tursoConfig.url || !tursoConfig.authToken) {
  console.error("FATAL: Turso database URL or Auth Token is not configured. Check Vercel environment variables and your local .env file.");
}

const turso = createClient(tursoConfig);

module.exports = { turso };