/**
 * tests/unit/routes_users_auth.test.js
 * 
 * Unit tests for users and authentication route handlers:
 * - api/_routes/users.js
 */

const express = require('express');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Users & Authentication');
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

// 1. Registration tests
suite.test('POST /api/users/register: fails validation when required fields are invalid or missing', async () => {
  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    // Missing email and short password
    const res = await server.request('POST', '/api/users/register', {
      username: 'ab', // Too short (min 3)
      email: 'not-an-email',
      password: '123' // Too short (min 6)
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message);
  } finally {
    server.close();
  }
});

suite.test('POST /api/users/register: successfully creates user with bcrypt hash', async () => {
  const originalTx = turso.transaction;
  let insertedArgs = null;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      insertedArgs = stmt.args;
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('POST', '/api/users/register', {
      username: 'teststudent',
      email: 'student@example.com',
      password: 'StrongPassword123',
      address: '42 Science Way',
      class: '9th',
      phone: '1234567890'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.message, 'User registered successfully!');
    assert.ok(insertedArgs);
    assert.strictEqual(insertedArgs[1], 'teststudent');
    assert.strictEqual(insertedArgs[2], 'student@example.com');
    // Verify password was hashed and is not plain text
    assert.notStrictEqual(insertedArgs[3], 'StrongPassword123');
    assert.ok(await bcrypt.compare('StrongPassword123', insertedArgs[3]));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/users/register: returns 409 Conflict when username or email is duplicated', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      throw new Error('UNIQUE constraint failed: users.email');
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('POST', '/api/users/register', {
      username: 'duplicateuser',
      email: 'existing@example.com',
      password: 'StrongPassword123',
      address: '42 Science Way',
      class: '9th'
    });

    assert.strictEqual(res.status, 409);
    assert.ok(res.data.message.includes('already exists'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

// 2. Login tests
suite.test('POST /api/users/login: returns 401 when user not found or password incorrect', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return { rows: [] }; // User not found
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('POST', '/api/users/login', {
      username: 'nonexistent',
      password: 'SomePassword'
    });

    assert.strictEqual(res.status, 401);
    assert.ok(res.data.message.includes('incorrect'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/users/login: returns JWT token and user info on valid credentials', async () => {
  const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return {
        rows: [
          {
            id: 'usr_login_success',
            username: 'john_doe',
            email: 'john@example.com',
            password: hashedPassword,
            address: '100 Main St',
            class: '10th',
            phone: '555-1234',
            isAdmin: 0
          }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('POST', '/api/users/login', {
      username: 'john_doe',
      password: 'CorrectPassword123'
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.id, 'usr_login_success');
    assert.strictEqual(res.data.user.name, 'john_doe');
    assert.strictEqual(res.data.user.email, 'john@example.com');
    assert.strictEqual(res.data.user.isAdmin, false);

    // Verify token validity
    const decoded = jwt.verify(res.data.token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, 'usr_login_success');
    assert.strictEqual(decoded.username, 'john_doe');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

// 3. User profile and stats
suite.test('GET /api/users/me: returns authenticated user profile', async () => {
  const testToken = jwt.sign({ id: 'usr_me_1', username: 'alice' }, process.env.JWT_SECRET);
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return {
        rows: [
          {
            id: 'usr_me_1',
            username: 'alice',
            email: 'alice@example.com',
            address: 'Wonderland',
            class: '9th',
            phone: null,
            isAdmin: 0
          }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('GET', '/api/users/me', null, testToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, 'usr_me_1');
    assert.strictEqual(res.data.name, 'alice');
    assert.strictEqual(res.data.address, 'Wonderland');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/users/stats: calculates aggregated quizzes and daily activity breakdown', async () => {
  const testToken = jwt.sign({ id: 'usr_stats_1', username: 'student' }, process.env.JWT_SECRET);
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('COUNT(*) as totalQuizzesSolved')) {
        return { rows: [{ totalQuizzesSolved: 5, overallAveragePercentage: 84.6 }] };
      }
      if (sql.includes('SELECT timestamp FROM quiz_results')) {
        return {
          rows: [
            { timestamp: '2026-08-10 14:00:00' },
            { timestamp: '2026-08-10 16:30:00' },
            { timestamp: '2026-08-11 09:15:00' }
          ]
        };
      }
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const userRoutes = require('../../api/_routes/users');
  const server = await createTestServer(userRoutes, '/api/users');

  try {
    const res = await server.request('GET', '/api/users/stats', null, testToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.totalQuizzesSolved, 5);
    assert.strictEqual(res.data.overallAveragePercentage, 85);
    assert.strictEqual(res.data.activityData.length, 2);
    assert.deepStrictEqual(res.data.activityData[0], { date: '2026-08-10', count: 2 });
    assert.deepStrictEqual(res.data.activityData[1], { date: '2026-08-11', count: 1 });
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
