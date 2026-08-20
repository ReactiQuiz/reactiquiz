/**
 * tests/unit/supabase_turso_clients.test.js
 * 
 * Unit tests for database clients and fallback behavior:
 * - api/_utils/tursoClient.js
 * - api/_utils/supabaseClient.js
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Database Clients Configuration & Fallbacks');

suite.test('tursoClient: unconfigured client returns rejecting stub methods instead of throwing on import', async () => {
  const { turso } = require('../../api/_utils/tursoClient');

  assert.ok(turso, 'turso export should exist');
  assert.strictEqual(typeof turso.execute, 'function');
  assert.strictEqual(typeof turso.transaction, 'function');

  // If env is unconfigured in test environment, execute should reject with informative error
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    let errorCaught = null;
    try {
      await turso.execute('SELECT 1');
    } catch (err) {
      errorCaught = err;
    }
    assert.ok(errorCaught);
    assert.ok(errorCaught.message.includes('Turso database is not configured') || errorCaught.message.includes('URL'));
  }
});

suite.test('supabaseClient: db helper provides CRUD functions and handles configuration errors gracefully', async () => {
  const { db } = require('../../api/_utils/supabaseClient');

  assert.ok(db, 'db export should exist');
  assert.strictEqual(typeof db.getClient, 'function');
  assert.strictEqual(typeof db.query, 'function');
  assert.strictEqual(typeof db.insert, 'function');
  assert.strictEqual(typeof db.update, 'function');
  assert.strictEqual(typeof db.delete, 'function');
  assert.strictEqual(typeof db.upsert, 'function');
  assert.strictEqual(typeof db.rpc, 'function');

  // When supabase env vars are missing, getClient should throw clear error
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    assert.throws(() => {
      db.getClient(false);
    }, /Supabase is not configured/);
  }
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
