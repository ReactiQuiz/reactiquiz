/**
 * tests/unit/routes_subjects_topics.test.js
 * 
 * Unit tests for subjects and topics route handlers:
 * - api/_routes/subjects.js
 * - api/_routes/topics.js
 */

const express = require('express');
const http = require('http');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Subjects & Topics');

// Helper to make test HTTP request against an in-memory express server
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

suite.test('GET /api/subjects: successfully returns subjects list with 200 OK', async () => {
  // Mock turso transaction
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      return {
        rows: [
          { id: 'sub_1', name: 'Physics', subjectKey: 'physics', displayOrder: 1 },
          { id: 'sub_2', name: 'Chemistry', subjectKey: 'chemistry', displayOrder: 2 }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const subjectRoutes = require('../../api/_routes/subjects');
  const server = await createTestServer(subjectRoutes, '/api/subjects');

  try {
    const res = await server.request('GET', '/api/subjects');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 2);
    assert.strictEqual(res.data[0].name, 'Physics');
    assert.strictEqual(res.data[1].subjectKey, 'chemistry');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/subjects: handles database failure with 500 Internal Server Error', async () => {
  const originalTx = turso.transaction;
  let rollbackCalled = false;

  turso.transaction = async () => ({
    closed: false,
    async execute() {
      throw new Error('Database connection dropped');
    },
    async commit() {},
    async rollback() {
      rollbackCalled = true;
    }
  });

  const subjectRoutes = require('../../api/_routes/subjects');
  const server = await createTestServer(subjectRoutes, '/api/subjects');

  try {
    const res = await server.request('GET', '/api/subjects');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.data.message, 'Could not fetch subjects.');
    assert.strictEqual(rollbackCalled, true);
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/topics: successfully returns all topics with 200 OK', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      return {
        rows: [
          { id: 'top_1', name: 'Acids and Bases', subject_id: 'sub_2', class: '9th' },
          { id: 'top_2', name: 'Laws of Motion', subject_id: 'sub_1', class: '9th' }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const topicRoutes = require('../../api/_routes/topics');
  const server = await createTestServer(topicRoutes, '/api/topics');

  try {
    const res = await server.request('GET', '/api/topics');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 2);
    assert.strictEqual(res.data[0].id, 'top_1');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/topics/:subjectKey: returns topics filtered by subjectKey', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      if (sql.includes('SELECT id FROM subjects')) {
        return { rows: [{ id: 'sub_physics_id' }] };
      }
      if (sql.includes('quiz_topics') && sql.includes('WHERE')) {
        return {
          rows: [
            { id: 'top_physics_1', name: 'Gravitation', subject_id: 'sub_physics_id' }
          ]
        };
      }
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const topicRoutes = require('../../api/_routes/topics');
  const server = await createTestServer(topicRoutes, '/api/topics');

  try {
    const res = await server.request('GET', '/api/topics/physics');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0].name, 'Gravitation');
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/topics/:subjectKey: returns 404 when subject does not exist', async () => {
  const originalTx = turso.transaction;
  let rollbackCalled = false;

  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      return { rows: [] }; // No subject found
    },
    async commit() {},
    async rollback() {
      rollbackCalled = true;
    }
  });

  const topicRoutes = require('../../api/_routes/topics');
  const server = await createTestServer(topicRoutes, '/api/topics');

  try {
    const res = await server.request('GET', '/api/topics/nonexistent_subject');
    assert.strictEqual(res.status, 404);
    assert.ok(res.data.message.includes('not found'));
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
