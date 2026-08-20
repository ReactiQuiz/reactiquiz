/**
 * tests/unit/routes_admin.test.js
 * 
 * Unit tests for admin management routes:
 * - api/routes/admin.js
 */

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Admin Panel & CMS');
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

const adminToken = jwt.sign({ id: 'usr_admin', username: 'superadmin', isAdmin: true }, process.env.JWT_SECRET);
const regularToken = jwt.sign({ id: 'usr_regular', username: 'student', isAdmin: false }, process.env.JWT_SECRET);

suite.test('Admin Routes: blocks non-admin requests with 403 Forbidden', async () => {
  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const res = await server.request('GET', '/api/admin/status', null, regularToken);
    assert.strictEqual(res.status, 403);
    assert.ok(res.data.message.includes('Administrator access required'));
  } finally {
    server.close();
  }
});

suite.test('GET /api/admin/status: returns userCount, topicCount, and questionCount (200)', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT count(*) as total FROM users')) return { rows: [{ total: 150 }] };
      if (sql.includes('SELECT count(*) as total FROM quiz_topics')) return { rows: [{ total: 45 }] };
      if (sql.includes('SELECT count(*) as total FROM questions')) return { rows: [{ total: 1200 }] };
      return { rows: [{ total: 0 }] };
    },
    async commit() {},
    async rollback() {}
  });

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const res = await server.request('GET', '/api/admin/status', null, adminToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.userCount, 150);
    assert.strictEqual(res.data.topicCount, 45);
    assert.strictEqual(res.data.questionCount, 1200);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/admin/subjects/batch-import: batch imports multiple subjects', async () => {
  const originalTx = turso.transaction;
  let batchedStatements = null;

  turso.transaction = async () => ({
    closed: false,
    async execute() { return { rows: [] }; },
    async batch(statements) {
      batchedStatements = statements;
      return statements.map(() => ({ rows: [] }));
    },
    async commit() {},
    async rollback() {}
  });

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const subjectsToImport = [
      { name: 'Astronomy', subjectKey: 'astronomy', displayOrder: 6, iconName: 'PublicIcon' },
      { name: 'Geology', subjectKey: 'geology', displayOrder: 7, iconName: 'DefaultIcon' }
    ];

    const res = await server.request('POST', '/api/admin/subjects/batch-import', subjectsToImport, adminToken);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.message.includes('Successfully imported 2 subjects'));
    assert.strictEqual(batchedStatements.length, 2);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/admin/questions: validates required fields and creates single question', async () => {
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

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const questionPayload = {
      id: 'q_new_1',
      topicId: 'motion-9th',
      text: 'What is acceleration?',
      options: [
        { id: 'a', text: 'Rate of change of velocity' },
        { id: 'b', text: 'Speed times time' },
        { id: 'c', text: 'Distance over time' },
        { id: 'd', text: 'Constant speed' }
      ],
      correctOptionId: 'a',
      explanation: 'Acceleration is the rate at which velocity changes with time.'
    };

    const res = await server.request('POST', '/api/admin/questions', questionPayload, adminToken);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.message, 'Question created successfully.');
    assert.strictEqual(res.data.question.id, 'q_new_1');
    assert.strictEqual(insertedArgs[0], 'q_new_1');
    assert.strictEqual(insertedArgs[1], 'motion-9th');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('DELETE /api/admin/subjects/:id: blocks deletion with 400 if child topics exist', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT COUNT(*) as total FROM quiz_topics')) {
        return { rows: [{ total: 5 }] }; // 5 child topics exist
      }
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const res = await server.request('DELETE', '/api/admin/subjects/physics', null, adminToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('5 topic(s) are linked to it'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('DELETE /api/admin/topics/:id: blocks deletion with 400 if child questions exist', async () => {
  const originalTx = turso.transaction;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT COUNT(*) as total FROM questions WHERE topicId')) {
        return { rows: [{ total: 12 }] }; // 12 child questions exist
      }
      return { rowsAffected: 1 };
    },
    async commit() {},
    async rollback() {}
  });

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const res = await server.request('DELETE', '/api/admin/topics/motion-9th', null, adminToken);
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('12 question(s) are linked to it'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/admin/notes: creates a new topic note document', async () => {
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

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const notePayload = {
      topicId: 'motion-9th',
      title: 'Laws of Motion & Velocity',
      content: '# Laws of Motion\n\nNewton\'s 1st Law: Inertia.',
      summary: 'Summary of inertia and momentum.',
      readTimeMinutes: 4
    };

    const res = await server.request('POST', '/api/admin/notes', notePayload, adminToken);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.message, 'Note created successfully.');
    assert.strictEqual(res.data.note.topicId, 'motion-9th');
    assert.strictEqual(insertedArgs[1], 'motion-9th');
    assert.strictEqual(insertedArgs[2], 'Laws of Motion & Velocity');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('POST /api/admin/notes/batch-import: batch imports multiple notes', async () => {
  const originalTx = turso.transaction;
  let batchedStatements = null;

  turso.transaction = async () => ({
    closed: false,
    async execute() { return { rows: [] }; },
    async batch(statements) {
      batchedStatements = statements;
      return statements.map(() => ({ rows: [] }));
    },
    async commit() {},
    async rollback() {}
  });

  const adminRoutes = require('../../api/routes/admin');
  const server = await createTestServer(adminRoutes, '/api/admin');

  try {
    const notesToImport = [
      { topicId: 'gravitation-9th', title: 'Gravitation Notes', content: '# Gravitation' },
      { topicId: 'acids-bases-9th', title: 'Acids & Bases Notes', content: '# Acids and Bases' }
    ];

    const res = await server.request('POST', '/api/admin/notes/batch-import', notesToImport, adminToken);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.message.includes('Successfully imported 2 note(s)'));
    assert.strictEqual(batchedStatements.length, 2);
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
