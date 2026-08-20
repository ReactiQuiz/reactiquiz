/**
 * tests/unit/routes_questions.test.js
 * 
 * Unit tests for questions route handler:
 * - api/routes/questions.js
 */

const express = require('express');
const http = require('http');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Questions');

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
      const request = (method, path) => {
        return new Promise((resResolve, resReject) => {
          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
          }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
              try {
                resResolve({ status: res.statusCode, data: JSON.parse(body) });
              } catch (e) {
                resResolve({ status: res.statusCode, raw: body });
              }
            });
          });
          req.on('error', resReject);
          req.end();
        });
      };

      resolve({ server, request, close: () => server.close() });
    });
  });
}

suite.test('GET /api/questions: returns 400 when neither topicId nor ids are provided', async () => {
  const questionRoutes = require('../../api/routes/questions');
  const server = await createTestServer(questionRoutes, '/api/questions');

  try {
    const res = await server.request('GET', '/api/questions');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'A topicId or a list of ids is required.');
  } finally {
    server.close();
  }
});

suite.test('GET /api/questions?topicId=...: returns parsed questions for topic', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      assert.strictEqual(stmt.args[0], 'acids-bases-9th');
      return {
        rows: [
          {
            id: 'q_chem_1',
            topicId: 'acids-bases-9th',
            text: 'What is the pH of pure water?',
            options: JSON.stringify([
              { id: 'a', text: '7' },
              { id: 'b', text: '0' },
              { id: 'c', text: '14' },
              { id: 'd', text: '1' }
            ]),
            correctOptionId: 'a',
            explanation: 'Pure water is neutral with a pH of 7 at 25°C.'
          }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const questionRoutes = require('../../api/routes/questions');
  const server = await createTestServer(questionRoutes, '/api/questions');

  try {
    const res = await server.request('GET', '/api/questions?topicId=acids-bases-9th');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].id, 'q_chem_1');
    assert.ok(Array.isArray(res.data[0].options), 'Options should be parsed into an array');
    assert.strictEqual(res.data[0].options.length, 4);
    assert.strictEqual(res.data[0].options[0].text, '7');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/questions?ids=...: fetches specific question IDs with SQL placeholders', async () => {
  const originalTx = turso.transaction;
  let executedSql = null;
  let executedArgs = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      executedSql = stmt.sql;
      executedArgs = stmt.args;
      return {
        rows: [
          {
            id: 'q_101',
            topicId: 'topic_1',
            text: 'Test Q1',
            options: JSON.stringify([{ id: 'a', text: 'Option A' }])
          },
          {
            id: 'q_102',
            topicId: 'topic_1',
            text: 'Test Q2',
            options: JSON.stringify([{ id: 'b', text: 'Option B' }])
          }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const questionRoutes = require('../../api/routes/questions');
  const server = await createTestServer(questionRoutes, '/api/questions');

  try {
    const res = await server.request('GET', '/api/questions?ids=q_101,q_102');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.length, 2);
    assert.ok(executedSql.includes('IN (?,?)'));
    assert.deepStrictEqual(executedArgs, ['q_101', 'q_102']);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/questions: handles database errors and returns 500', async () => {
  const originalTx = turso.transaction;
  let rollbackCalled = false;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      throw new Error('Database read failure');
    },
    async commit() {},
    async rollback() {
      rollbackCalled = true;
    }
  });

  const questionRoutes = require('../../api/routes/questions');
  const server = await createTestServer(questionRoutes, '/api/questions');

  try {
    const res = await server.request('GET', '/api/questions?topicId=some_topic');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.data.message, 'Could not fetch questions.');
    assert.strictEqual(rollbackCalled, true);
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
