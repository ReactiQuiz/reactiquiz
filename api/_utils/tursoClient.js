// api/_utils/tursoClient.js
/**
 * Turso Database Client Configuration
 *
 * Creates and exports a Turso database client instance for use in API routes.
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.
 *
 * Env vars may be unavailable during Vercel build/bundling or local dev without
 * a .env file. This module must never throw at import time — every route file
 * requires it, so a throw here fails the entire function's cold start (every
 * endpoint, including /api/health, returns an opaque 500). Instead, when
 * unconfigured, `turso` is a stub whose methods reject with a clear error,
 * caught by each route's own try/catch and turned into a normal 500 response.
 */

const { createClient } = require('@libsql/client');
const hrana = require('@libsql/hrana-client');

const formatTursoUrl = (rawUrl) => {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('libsql://')) {
    return rawUrl.replace('libsql://', 'https://');
  }
  return rawUrl;
};

const tursoConfig = {
  url: formatTursoUrl(process.env.TURSO_DATABASE_URL),
  authToken: process.env.TURSO_AUTH_TOKEN,
};

const isConfigured = Boolean(tursoConfig.url && tursoConfig.authToken);

if (!isConfigured) {
  console.warn('[WARN] Missing Turso environment variables (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN). Server will log errors if accessed without proper config.');
}

const configError = () => Promise.reject(new Error('Turso database is not configured (missing TURSO_DATABASE_URL/TURSO_AUTH_TOKEN).'));

// Use standard client with fallbacks for transaction, execute, batch
const baseClient = isConfigured
  ? createClient({ url: tursoConfig.url, authToken: tursoConfig.authToken })
  : null;

const hranaClient = isConfigured
  ? hrana.openHttp(tursoConfig.url, tursoConfig.authToken)
  : null;

const executeHrana = async (stmt) => {
  if (!hranaClient) return configError();
  const stream = hranaClient.openStream();
  try {
    const sql = typeof stmt === 'string' ? stmt : stmt.sql;
    const args = typeof stmt === 'object' && stmt.args ? stmt.args : [];
    const hranaResult = await stream.query(args && args.length > 0 ? { sql, args } : sql);
    return {
      rows: hranaResult.rows || [],
      columns: hranaResult.cols ? hranaResult.cols.map(c => c.name) : [],
      rowsAffected: hranaResult.affectedRowCount || 0
    };
  } finally {
    stream.closeGracefully();
  }
};

const turso = isConfigured
  ? {
      ...baseClient,
      execute: executeHrana,
      transaction: (mode) => baseClient.transaction(mode)
    }
  : { transaction: configError, execute: configError, batch: configError };

module.exports = { turso };
