// api/_utils/tursoClient.js
/**
 * Turso Database Client Configuration
 * 
 * Creates and exports a Turso database client instance for use in API routes.
 * Turso is used for Homi Bhabha exam questions and practice tests.
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.
 */

const { createClient } = require('@libsql/client');

/**
 * Turso Configuration
 * 
 * Reads Turso database connection settings from environment variables.
 */
const tursoConfig = {
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
};

/**
 * Validate Turso Configuration
 * 
 * Throws an error if required environment variables are missing.
 */
if (!tursoConfig.url || !tursoConfig.authToken) {
  throw new Error('FATAL: Turso database URL or Auth Token is not configured.');
}

/**
 * Turso Client Instance
 * 
 * Creates and exports a Turso database client instance for use in API routes.
 */
const turso = createClient({
  url: tursoConfig.url,
  authToken: tursoConfig.authToken,
});

module.exports = { turso };