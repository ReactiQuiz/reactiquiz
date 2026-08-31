/**
 * tests/unit/routes_friends_challenges.test.js
 * 
 * Unit tests for social routes:
 * - api/_routes/friends.js
 * - api/_routes/challenges.js
 */

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Friends & Challenges');
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

const testToken = jwt.sign({ id: 'usr_alice', username: 'alice' }, process.env.JWT_SECRET);

// 1. Friend Requests
suite.test('POST /api/friends/request: validates receiverUsername required (400)', async () => {
  const friendRoutes = require('../../api/_routes/friends');
  const server = await createTestServer(friendRoutes, '/api/friends');

  try {
    const res = await server.request('POST', '/api/friends/request', {}, testToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('Receiver username is required'));
  } finally {
    server.close();
  }
});

suite.test('POST /api/friends/request: prevents sending friend request to oneself (400)', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      return { rows: [{ id: 'usr_alice' }] }; // Returns same user id
    },
    async commit() {},
    async rollback() {}
  });

  const friendRoutes = require('../../api/_routes/friends');
  const server = await createTestServer(friendRoutes, '/api/friends');

  try {
    const res = await server.request('POST', '/api/friends/request', { receiverUsername: 'alice' }, testToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('cannot send a request to yourself'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/friends/request: successfully creates friendship request (201)', async () => {
  const originalTx = turso.transaction;
  let insertedFriendship = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT id FROM users WHERE username')) {
        return { rows: [{ id: 'usr_bob' }] };
      }
      if (sql.includes('SELECT id FROM friendships')) {
        return { rows: [] }; // No existing friendship
      }
      if (sql.includes('INSERT INTO friendships')) {
        insertedFriendship = stmt.args;
        return { rowsAffected: 1 };
      }
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const friendRoutes = require('../../api/_routes/friends');
  const server = await createTestServer(friendRoutes, '/api/friends');

  try {
    const res = await server.request('POST', '/api/friends/request', { receiverUsername: 'bob' }, testToken);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.message.includes('sent successfully'));
    assert.deepStrictEqual(insertedFriendship, ['usr_alice', 'usr_bob']);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('PUT /api/friends/request/:requestId: accepts or declines request with status update', async () => {
  const originalTx = turso.transaction;
  let updatedStatus = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('UPDATE friendships SET status')) {
        updatedStatus = stmt.args[0];
        return { rowsAffected: 1 };
      }
      return { rowsAffected: 0 };
    },
    async commit() {},
    async rollback() {}
  });

  const friendRoutes = require('../../api/_routes/friends');
  const server = await createTestServer(friendRoutes, '/api/friends');

  try {
    const res = await server.request('PUT', '/api/friends/request/req_123', { action: 'accept' }, testToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(updatedStatus, 'accepted');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

// 2. Challenges
suite.test('POST /api/challenges: creates quiz challenge and returns 201', async () => {
  const originalTx = turso.transaction;
  let challengeArgs = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      challengeArgs = stmt.args;
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const challengeRoutes = require('../../api/_routes/challenges');
  const server = await createTestServer(challengeRoutes, '/api/challenges');

  try {
    const res = await server.request('POST', '/api/challenges', {
      challenged_id: 'usr_bob',
      topic_id: 'top_1',
      topic_name: 'Acids',
      difficulty: 'medium',
      num_questions: 10,
      question_ids_json: ['q1', 'q2']
    }, testToken);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.message, 'Challenge sent!');
    assert.strictEqual(challengeArgs[0], 'usr_alice'); // challenger
    assert.strictEqual(challengeArgs[1], 'usr_bob');   // challenged
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
