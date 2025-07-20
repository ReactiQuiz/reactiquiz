// api/_utils/tursoClient.js
const { createClient } = require('@libsql/client');

const tursoConfig = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

if (!tursoConfig.url || !tursoConfig.authToken) {
  console.error("FATAL: Turso database URL or Auth Token is not configured. Check environment variables.");
}

const turso = createClient(tursoConfig);

module.exports = { turso };