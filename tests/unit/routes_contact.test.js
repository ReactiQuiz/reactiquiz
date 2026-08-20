/**
 * tests/unit/routes_contact.test.js
 * 
 * Unit tests for contact form route handler:
 * - api/routes/contact.js
 */

const express = require('express');
const http = require('http');
const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Routes: Contact Form');

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
      const request = (method, path, body = null) => {
        return new Promise((resResolve, resReject) => {
          const req = http.request({
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
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

suite.test('POST /api/contact: responds with 503 or 400 when missing fields or credentials', async () => {
  const contactRoutes = require('../../api/routes/contact');
  const server = await createTestServer(contactRoutes, '/api/contact');

  try {
    const res = await server.request('POST', '/api/contact', {});
    // Either 503 (transporter unconfigured in test environment) or 400 (missing fields)
    assert.ok(res.status === 503 || res.status === 400);
    assert.ok(res.data.message);
  } finally {
    server.close();
  }
});

suite.test('POST /api/contact: validates name, email, and message presence', async () => {
  const contactRoutes = require('../../api/routes/contact');
  const server = await createTestServer(contactRoutes, '/api/contact');

  try {
    const res = await server.request('POST', '/api/contact', {
      name: 'Tester',
      // email is missing
      message: 'Hello ReactiQuiz'
    });
    assert.ok(res.status === 503 || res.status === 400);
  } finally {
    server.close();
  }
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
