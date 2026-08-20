/**
 * tests/api_utils.test.js
 * 
 * Unit tests for API utility functions and middleware:
 * - arrayUtils.shuffleArray
 * - verifyToken authentication middleware
 * - asyncHandler wrapper
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const { shuffleArray } = require('../api/_utils/arrayUtils');
const { verifyToken } = require('../api/_middleware/auth');
const { asyncHandler } = require('../api/_utils/asyncHandler');

console.log('----------------------------------------------------');
console.log('       RUNNING API UTILS & AUTH UNIT TESTS          ');
console.log('----------------------------------------------------');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// 1. Array Utils
runTest('shuffleArray handles null/undefined/non-array inputs', () => {
  assert.deepStrictEqual(shuffleArray(null), []);
  assert.deepStrictEqual(shuffleArray(undefined), []);
  assert.deepStrictEqual(shuffleArray('invalid'), []);
  assert.deepStrictEqual(shuffleArray(123), []);
});

runTest('shuffleArray preserves items and returns new copy', () => {
  const input = ['physics', 'chemistry', 'biology', 'maths'];
  const output = shuffleArray(input);
  assert.notStrictEqual(input, output);
  assert.strictEqual(output.length, 4);
  assert.deepStrictEqual([...output].sort(), [...input].sort());
});

// 2. Auth Middleware
runTest('verifyToken rejects missing Authorization header with 401', () => {
  const req = { headers: {} };
  let statusCode = null;
  let jsonBody = null;
  const res = {
    status(code) { statusCode = code; return this; },
    json(body) { jsonBody = body; return this; }
  };
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(statusCode, 401);
  assert.strictEqual(jsonBody.message, 'Authentication token is required.');
  assert.strictEqual(nextCalled, false);
});

runTest('verifyToken rejects non-Bearer header with 401', () => {
  const req = { headers: { authorization: 'Basic 12345' } };
  let statusCode = null;
  const res = {
    status(code) { statusCode = code; return this; },
    json() { return this; }
  };

  verifyToken(req, res, () => {});
  assert.strictEqual(statusCode, 401);
});

runTest('verifyToken accepts valid JWT and populates req.user', () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key';
  const payload = { id: 'usr_test_1', username: 'testuser' };
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { status() { return this; }, json() { return this; } };
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, 'usr_test_1');
  assert.strictEqual(req.user.username, 'testuser');
});

// 3. Async Handler
runTest('asyncHandler catches async errors and forwards to next()', (done) => {
  const error = new Error('Async error test');
  const mockHandler = asyncHandler(async () => {
    throw error;
  });

  mockHandler({}, {}, (err) => {
    assert.strictEqual(err, error);
  });
});

console.log('----------------------------------------------------');
console.log(` SUMMARY: ${passed}/${total} API unit tests passed.`);
console.log('----------------------------------------------------\n');

if (passed !== total) {
  process.exit(1);
}
