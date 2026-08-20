/**
 * tests/unit/routes_notes.test.js
 * 
 * Unit tests for notes routes:
 * - api/routes/notes.js
 */

const express = require('express');
const http = require('http');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');

const suite = createSuite('Routes: Topic Notes');

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

suite.test('GET /api/notes/topic/:topicId: returns 200 with joined topic & subject metadata', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute(stmt) {
      assert.strictEqual(stmt.args[0], 'gravitation-9th');
      return {
        rows: [
          {
            id: 'note-gravitation-9th',
            topicId: 'gravitation-9th',
            title: 'Gravitation & Planetary Motion Notes',
            content: '# Gravitation\n\nNewton\'s Universal Law of Gravitation: $$F = G\\frac{m_1 m_2}{r^2}$$',
            summary: 'Comprehensive summary of gravitation, free fall, and orbital velocity.',
            readTimeMinutes: 5,
            topicName: 'Gravitation',
            topicClass: '9th',
            subjectName: 'Physics',
            subjectKey: 'physics',
            accentColorDark: 'rgba(255, 112, 67, 1)',
            accentColorLight: 'rgba(255, 112, 67, 0.15)'
          }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const noteRoutes = require('../../api/routes/notes');
  const server = await createTestServer(noteRoutes, '/api/notes');

  try {
    const res = await server.request('GET', '/api/notes/topic/gravitation-9th');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, 'note-gravitation-9th');
    assert.strictEqual(res.data.topicName, 'Gravitation');
    assert.strictEqual(res.data.subjectKey, 'physics');
    assert.strictEqual(res.data.accentColorDark, 'rgba(255, 112, 67, 1)');
    assert.ok(res.data.content.includes('Newton'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

suite.test('GET /api/notes/topic/:topicId: returns 404 when note is not found', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute() {
      return { rows: [] };
    },
    async commit() {},
    async rollback() {}
  });

  const noteRoutes = require('../../api/routes/notes');
  const server = await createTestServer(noteRoutes, '/api/notes');

  try {
    const res = await server.request('GET', '/api/notes/topic/unknown-topic');
    assert.strictEqual(res.status, 404);
    assert.ok(res.data.message.includes('No notes found for topic'));
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
