/**
 * tests/test_helper.js
 * 
 * Shared Test Harness and Utilities for Unit & Integration Testing
 * Provides mock objects for Express request/response, database transactions,
 * assertion helpers, and a lightweight test runner with timing.
 */

const assert = require('assert');

/**
 * Creates a mock Express request object
 * @param {Object} options - Request options
 * @returns {Object} Mock request
 */
function createMockReq(options = {}) {
  return {
    headers: options.headers || {},
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
    user: options.user || null,
    ip: options.ip || '127.0.0.1',
    originalUrl: options.originalUrl || '/',
    path: options.path || '/',
    method: options.method || 'GET',
    ...options
  };
}

/**
 * Creates a mock Express response object
 * @returns {Object} Mock response with chainable methods and inspection properties
 */
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    send(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    }
  };
  return res;
}

/**
 * Creates a mock database transaction
 * @param {Function|Array|Object} handlerOrFixtures - Function or map of SQL -> results
 * @returns {Object} Mock transaction
 */
function createMockTx(handlerOrFixtures = {}) {
  const executedStatements = [];
  const tx = {
    closed: false,
    executedStatements,
    async execute(stmt) {
      if (tx.closed) {
        throw new Error('Cannot execute query on closed transaction');
      }
      executedStatements.push(stmt);
      if (typeof handlerOrFixtures === 'function') {
        return handlerOrFixtures(stmt);
      }
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      for (const [key, value] of Object.entries(handlerOrFixtures)) {
        if (sql.includes(key)) {
          if (typeof value === 'function') return value(stmt);
          return value;
        }
      }
      return { rows: [], rowsAffected: 1, lastInsertRowid: 1 };
    },
    async commit() {
      tx.closed = true;
    },
    async rollback() {
      tx.closed = true;
    },
    async batch(statements) {
      if (tx.closed) throw new Error('Cannot batch on closed transaction');
      executedStatements.push(...statements);
      return statements.map(() => ({ rows: [], rowsAffected: 1 }));
    }
  };
  return tx;
}

/**
 * Creates a test runner suite
 * @param {string} suiteName - Name of the test suite
 * @returns {Object} Suite runner instance
 */
function createSuite(suiteName) {
  let passed = 0;
  let failed = 0;
  const tests = [];

  return {
    suiteName,
    test(name, fn) {
      tests.push({ name, fn });
    },
    async run() {
      console.log('----------------------------------------------------');
      console.log(` SUITE: ${suiteName}`);
      console.log('----------------------------------------------------');

      const startTime = Date.now();

      for (const { name, fn } of tests) {
        try {
          await fn();
          console.log(`  [PASS] ${name}`);
          passed++;
        } catch (err) {
          console.error(`  [FAIL] ${name}`);
          console.error(`         ${err.stack || err.message}`);
          failed++;
        }
      }

      const elapsed = Date.now() - startTime;
      console.log('----------------------------------------------------');
      console.log(` RESULT: ${passed} passed, ${failed} failed (${elapsed}ms)`);
      console.log('----------------------------------------------------\n');

      return { passed, failed, total: tests.length, elapsed };
    }
  };
}

module.exports = {
  assert,
  createMockReq,
  createMockRes,
  createMockTx,
  createSuite
};
