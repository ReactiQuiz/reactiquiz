/**
 * tests/unit/routes_quiz_sessions.test.js
 * 
 * Unit tests for quiz session route handlers:
 * - api/_routes/quizSessions.js
 */

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Quiz Sessions');
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

const testUserToken = jwt.sign({ id: 'usr_quiz_session_tester', username: 'tester' }, process.env.JWT_SECRET);

suite.test('POST /api/quizSessions: rejects invalid or missing topicId with 400', async () => {
  const quizSessionRoutes = require('../../api/_routes/quizSessions');
  const server = await createTestServer(quizSessionRoutes, '/api/quizSessions');

  try {
    const res = await server.request('POST', '/api/quizSessions', {}, testUserToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('Invalid quiz parameters'));
  } finally {
    server.close();
  }
});

suite.test('POST /api/quizSessions: creates new session and returns 201 with sessionId', async () => {
  const executedStatements = [];
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      executedStatements.push(stmt);
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const quizSessionRoutes = require('../../api/_routes/quizSessions');
  const server = await createTestServer(quizSessionRoutes, '/api/quizSessions');

  try {
    const res = await server.request('POST', '/api/quizSessions', {
      topicId: 'motion-laws-9th',
      subject: 'physics',
      numQuestions: 10
    }, testUserToken);

    assert.strictEqual(res.status, 201);
    assert.ok(res.data.sessionId);
    assert.strictEqual(typeof res.data.sessionId, 'string');
    assert.strictEqual(executedStatements.length, 2, 'Should execute DELETE old sessions then INSERT new session');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/quizSessions/:sessionId: returns 404 when session does not exist', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return { rows: [] }; // No session found
    },
    async commit() {},
    async rollback() {}
  });

  const quizSessionRoutes = require('../../api/_routes/quizSessions');
  const server = await createTestServer(quizSessionRoutes, '/api/quizSessions');

  try {
    const res = await server.request('GET', '/api/quizSessions/nonexistent_session', null, testUserToken);
    assert.strictEqual(res.status, 404);
    assert.ok(res.data.message.includes('Quiz session not found'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/quizSessions/:sessionId: returns 410 when session has expired (>5 minutes)', async () => {
  const originalTx = turso.transaction;
  const expiredDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT * FROM quiz_sessions')) {
        return {
          rows: [{
            id: 'expired_sess_id',
            user_id: 'usr_quiz_session_tester',
            created_at: expiredDate,
            quiz_params_json: JSON.stringify({ topicId: 'topic_1', numQuestions: 5 })
          }]
        };
      }
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const quizSessionRoutes = require('../../api/_routes/quizSessions');
  const server = await createTestServer(quizSessionRoutes, '/api/quizSessions');

  try {
    const res = await server.request('GET', '/api/quizSessions/expired_sess_id', null, testUserToken);
    assert.strictEqual(res.status, 410);
    assert.ok(res.data.message.includes('expired'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/quizSessions/:sessionId: loads questions and locks selection for refresh-safety', async () => {
  const originalTx = turso.transaction;
  const freshDate = new Date().toISOString();
  let updatedLockedParams = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT * FROM quiz_sessions')) {
        return {
          rows: [{
            id: 'fresh_sess_id',
            user_id: 'usr_quiz_session_tester',
            created_at: freshDate,
            quiz_params_json: JSON.stringify({
              topicId: 'cells-biology-9th',
              subject: 'biology',
              numQuestions: 2
            })
          }]
        };
      }
      if (sql.includes('SELECT id, topicId, text, options FROM questions')) {
        return {
          rows: [
            { id: 'q_bio_1', topicId: 'cells-biology-9th', text: 'Cell Wall Q', options: '[]' },
            { id: 'q_bio_2', topicId: 'cells-biology-9th', text: 'Mitochondria Q', options: '[]' }
          ]
        };
      }
      if (sql.includes('UPDATE quiz_sessions SET quiz_params_json')) {
        updatedLockedParams = JSON.parse(stmt.args[0]);
        return { rowsAffected: 1 };
      }
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const quizSessionRoutes = require('../../api/_routes/quizSessions');
  const server = await createTestServer(quizSessionRoutes, '/api/quizSessions');

  try {
    const res = await server.request('GET', '/api/quizSessions/fresh_sess_id', null, testUserToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.subject, 'biology');
    assert.strictEqual(res.data.questions.length, 2);
    assert.ok(updatedLockedParams);
    assert.deepStrictEqual(updatedLockedParams.selectedQuestionIds.sort(), ['q_bio_1', 'q_bio_2'].sort());
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
