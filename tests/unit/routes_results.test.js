/**
 * tests/unit/routes_results.test.js
 * 
 * Unit tests for results route handlers:
 * - api/routes/results.js
 */

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Quiz Results & Scoring');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_12345';

function createTestServer(router, mountPath = '/') {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  });

  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const request = (method, path, body = null, token = null) => {
        return new Promise((resResolve, resReject) => {
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers
          }, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
              try {
                resResolve({ status: res.statusCode, data: JSON.parse(resData) });
              } catch (e) {
                resResolve({ status: res.statusCode, raw: resData });
              }
            });
          });
          req.on('error', resReject);
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      };

      resolve({ server, request, close: () => server.close() });
    });
  });
}

const testUserToken = jwt.sign({ id: 'usr_result_scorer', username: 'scorer' }, process.env.JWT_SECRET);

suite.test('POST /api/results: rejects invalid payload missing topicId or attempted questions (400)', async () => {
  const resultRoutes = require('../../api/routes/results');
  const server = await createTestServer(resultRoutes, '/api/results');

  try {
    const res = await server.request('POST', '/api/results', {
      quizContext: {},
      questionsActuallyAttemptedIds: []
    }, testUserToken);

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('Invalid quiz data'));
  } finally {
    server.close();
  }
});

suite.test('POST /api/results: calculates score accurately from options and snapshot index, returns 201', async () => {
  let savedArgs = null;
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT id, correctOptionId, options FROM questions')) {
        return {
          rows: [
            {
              id: 'q1',
              correctOptionId: 'opt_b',
              options: JSON.stringify([
                { id: 'opt_a', text: 'Option A' },
                { id: 'opt_b', text: 'Option B' },
                { id: 'opt_c', text: 'Option C' }
              ])
            },
            {
              id: 'q2',
              correctOptionId: 'opt_a',
              options: JSON.stringify([
                { id: 'opt_a', text: 'Option A' },
                { id: 'opt_b', text: 'Option B' }
              ])
            },
            {
              id: 'q3',
              correctOptionId: 'opt_d',
              options: JSON.stringify([
                { id: 'opt_a', text: 'A' },
                { id: 'opt_b', text: 'B' },
                { id: 'opt_c', text: 'C' },
                { id: 'opt_d', text: 'D' }
              ])
            }
          ]
        };
      }
      if (sql.includes('INSERT INTO quiz_results')) {
        savedArgs = stmt.args;
        return { lastInsertRowid: '42', rowsAffected: 1 };
      }
      if (sql.includes('SELECT * FROM quiz_results WHERE id =')) {
        return {
          rows: [{
            id: '42',
            user_id: 'usr_result_scorer',
            score: 2,
            totalQuestions: 3,
            percentage: 67
          }]
        };
      }
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const resultRoutes = require('../../api/routes/results');
  const server = await createTestServer(resultRoutes, '/api/results');

  try {
    const res = await server.request('POST', '/api/results', {
      quizContext: {
        topicId: 'motion-9th',
        subject: 'physics',
        quizClass: '9th'
      },
      timeTaken: 85,
      questionsActuallyAttemptedIds: ['q1', 'q2', 'q3'],
      userAnswersSnapshot: {
        q1: 1, // index 1 -> opt_b (CORRECT)
        q2: 0, // index 0 -> opt_a (CORRECT)
        q3: 1  // index 1 -> opt_b (INCORRECT, correct is opt_d)
      }
    }, testUserToken);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.resultId, '42');
    assert.strictEqual(res.data.savedResult.score, 2);
    assert.strictEqual(res.data.savedResult.totalQuestions, 3);
    assert.strictEqual(res.data.savedResult.percentage, 67);

    // Verify stored arguments
    assert.ok(savedArgs);
    assert.strictEqual(savedArgs[0], 'usr_result_scorer'); // user_id
    assert.strictEqual(savedArgs[1], 'physics'); // subject
    assert.strictEqual(savedArgs[2], 'motion-9th'); // topicId
    assert.strictEqual(savedArgs[3], 2); // calculated score
    assert.strictEqual(savedArgs[4], 3); // totalQuestions
    assert.strictEqual(savedArgs[5], 67); // percentage
    assert.strictEqual(savedArgs[6], 85); // timeTaken
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/results: retrieves list of historical results for authenticated user', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      assert.strictEqual(stmt.args[0], 'usr_result_scorer');
      return {
        rows: [
          { id: 'res_1', score: 10, totalQuestions: 10, percentage: 100, timestamp: '2026-08-12 10:00:00' },
          { id: 'res_2', score: 8, totalQuestions: 10, percentage: 80, timestamp: '2026-08-11 15:30:00' }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const resultRoutes = require('../../api/routes/results');
  const server = await createTestServer(resultRoutes, '/api/results');

  try {
    const res = await server.request('GET', '/api/results', null, testUserToken);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 2);
    assert.strictEqual(res.data[0].id, 'res_1');
    assert.strictEqual(res.data[0].percentage, 100);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/results/:resultId: returns 404 when result is missing or belongs to another user', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return { rows: [] }; // No matching result for user
    },
    async commit() {},
    async rollback() {}
  });

  const resultRoutes = require('../../api/routes/results');
  const server = await createTestServer(resultRoutes, '/api/results');

  try {
    const res = await server.request('GET', '/api/results/res_other_user', null, testUserToken);
    assert.strictEqual(res.status, 404);
    assert.ok(res.data.message.includes('Result not found'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
