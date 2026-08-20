/**
 * tests/unit/routes_homibhabha_pdf.test.js
 * 
 * Unit tests for Homi Bhabha test route and PDF generation routes:
 * - api/routes/homibhabha.js
 * - api/routes/pdf.js
 */

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { assert, createSuite } = require('../test_helper');
const { turso } = require('../../api/_utils/tursoClient');
const { db } = require('../../api/_utils/supabaseClient');

const suite = createSuite('Routes: Homi Bhabha & PDF Generation');
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

const testUserToken = jwt.sign({ id: 'usr_pdf_user', username: 'student' }, process.env.JWT_SECRET);

// 1. Homi Bhabha Tests
suite.test('GET /api/homibhabha/practice: requires class and difficulty query params (400)', async () => {
  const homiBhabhaRoutes = require('../../api/routes/homibhabha');
  const server = await createTestServer(homiBhabhaRoutes, '/api/homibhabha');

  try {
    const res = await server.request('GET', '/api/homibhabha/practice');
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes('Class and difficulty are required'));
  } finally {
    server.close();
  }
});

suite.test('GET /api/homibhabha/practice: returns 404 when question count < 100', async () => {
  const originalTx = turso.transaction;
  turso.transaction = async () => ({
    closed: false,
    async execute() {
      // Returns 5 questions per subject (20 total, less than required 100)
      return {
        rows: [
          { id: 'q1', topicId: 't1', text: 'Q1', options: '[]', difficulty: 15 },
          { id: 'q2', topicId: 't1', text: 'Q2', options: '[]', difficulty: 15 }
        ]
      };
    },
    async commit() {},
    async rollback() {}
  });

  const homiBhabhaRoutes = require('../../api/routes/homibhabha');
  const server = await createTestServer(homiBhabhaRoutes, '/api/homibhabha');

  try {
    const res = await server.request('GET', '/api/homibhabha/practice?class=9th&difficulty=medium');
    assert.strictEqual(res.status, 404);
    assert.ok(res.data.message.includes('Could not assemble the practice test'));
  } finally {
    server.close();
    turso.transaction = originalTx;
  }
});

// 2. PDF Preparation Routes
suite.test('GET /api/pdf/questions/:topicId: formats topic and questions metadata for PDF generator', async () => {
  const originalDbQuery = db.query;
  db.query = async (table, options) => {
    if (table === 'topics') {
      return [{ id: 'topic_chem_1', name: 'Chemical Reactions', class: '9th' }];
    }
    if (table === 'questions') {
      return [
        {
          id: 'q_chem_101',
          text: 'What is an endothermic reaction?',
          options: [{ id: 'a', text: 'Absorbs heat' }],
          correct_option_id: 'a',
          explanation: 'Endothermic reactions absorb thermal energy.',
          difficulty_level: 12,
          topic_id: 'topic_chem_1'
        }
      ];
    }
    return [];
  };

  const pdfRoutes = require('../../api/routes/pdf');
  const server = await createTestServer(pdfRoutes, '/api/pdf');

  try {
    const res = await server.request('GET', '/api/pdf/questions/topic_chem_1', null, testUserToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.topic.name, 'Chemical Reactions');
    assert.strictEqual(res.data.questions.length, 1);
    assert.strictEqual(res.data.questions[0].id, 'q_chem_101');
    assert.strictEqual(res.data.pdfOptions.title, 'Practice Questions - Chemical Reactions');
  } finally {
    server.close();
    db.query = originalDbQuery;
  }
});

suite.test('POST /api/pdf/generate: prepares PDF payload for custom question IDs list', async () => {
  const originalDbQuery = db.query;
  db.query = async (table, options) => {
    return [
      {
        id: 'custom_q1',
        text: 'Custom question 1',
        options: [{ id: 'a', text: 'Answer' }],
        correct_option_id: 'a',
        explanation: 'Explanation',
        difficulty_level: 15,
        topic_id: 'topic_custom'
      }
    ];
  };

  const pdfRoutes = require('../../api/routes/pdf');
  const server = await createTestServer(pdfRoutes, '/api/pdf');

  try {
    const res = await server.request('POST', '/api/pdf/generate', {
      questionIds: ['custom_q1'],
      options: { title: 'Custom Worksheet' }
    }, testUserToken);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.questions.length, 1);
    assert.strictEqual(res.data.pdfOptions.title, 'Custom Worksheet');
  } finally {
    server.close();
    db.query = originalDbQuery;
  }
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
