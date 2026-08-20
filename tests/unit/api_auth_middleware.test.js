/**
 * tests/unit/api_auth_middleware.test.js
 * 
 * Unit tests for API authentication and authorization middlewares:
 * - api/_middleware/auth.js (verifyToken)
 * - api/_middleware/adminAuth.js (verifyAdmin)
 */

const jwt = require('jsonwebtoken');
const { assert, createMockReq, createMockRes, createSuite } = require('../test_helper');
const { verifyToken } = require('../../api/_middleware/auth');
const { verifyAdmin } = require('../../api/_middleware/adminAuth');

const suite = createSuite('API Auth & Admin Middleware');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

// 1. verifyToken tests
suite.test('verifyToken: rejects request with missing authorization header (401)', () => {
  const req = createMockReq({ headers: {} });
  const res = createMockRes();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, 'Authentication token is required.');
  assert.strictEqual(nextCalled, false);
});

suite.test('verifyToken: rejects request with non-Bearer authorization header (401)', () => {
  const req = createMockReq({ headers: { authorization: 'Basic dXNlcjpwYXNz' } });
  const res = createMockRes();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, 'Authentication token is required.');
  assert.strictEqual(nextCalled, false);
});

suite.test('verifyToken: rejects invalid / forged JWT token (401)', () => {
  const req = createMockReq({ headers: { authorization: 'Bearer invalid.token.payload' } });
  const res = createMockRes();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, 'Invalid or expired token.');
  assert.strictEqual(nextCalled, false);
});

suite.test('verifyToken: rejects expired JWT token (401)', () => {
  const expiredToken = jwt.sign(
    { id: 'usr_expired', username: 'expireduser' },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );

  const req = createMockReq({ headers: { authorization: `Bearer ${expiredToken}` } });
  const res = createMockRes();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.message, 'Invalid or expired token.');
  assert.strictEqual(nextCalled, false);
});

suite.test('verifyToken: accepts valid JWT and attaches decoded user to req.user', () => {
  const payload = { id: 'usr_valid_123', username: 'alice', isAdmin: false };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
  const res = createMockRes();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, 'usr_valid_123');
  assert.strictEqual(req.user.username, 'alice');
  assert.strictEqual(req.user.isAdmin, false);
});

// 2. verifyAdmin tests
suite.test('verifyAdmin: rejects non-admin user with 403 Forbidden', () => {
  const payload = { id: 'usr_regular', username: 'bob', isAdmin: false };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
  const res = createMockRes();
  let nextCalled = false;

  verifyAdmin(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.message, 'Forbidden: Administrator access required.');
  assert.strictEqual(nextCalled, false);
});

suite.test('verifyAdmin: allows user with isAdmin=true in token payload', () => {
  const payload = { id: 'usr_admin_1', username: 'adminuser', isAdmin: true };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
  const res = createMockRes();
  let nextCalled = false;

  verifyAdmin(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, 'usr_admin_1');
  assert.strictEqual(req.user.isAdmin, true);
});

suite.test('verifyAdmin: allows bootstrap admin matching ADMIN_USER_ID fallback', () => {
  process.env.ADMIN_USER_ID = 'bootstrap_super_admin_id';
  const payload = { id: 'bootstrap_super_admin_id', username: 'bootstrap_admin', isAdmin: false };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  const req = createMockReq({ headers: { authorization: `Bearer ${token}` } });
  const res = createMockRes();
  let nextCalled = false;

  verifyAdmin(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
});

suite.test('verifyAdmin: rejects unauthenticated request immediately', () => {
  const req = createMockReq({ headers: {} });
  const res = createMockRes();
  let nextCalled = false;

  verifyAdmin(req, res, () => { nextCalled = true; });

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
