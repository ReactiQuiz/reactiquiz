/**
 * tests/unit/api_utils.test.js
 * 
 * Unit tests for backend utility functions:
 * - api/_utils/arrayUtils.js
 * - api/_utils/asyncHandler.js
 * - api/_utils/logger.js
 */

const { assert, createMockReq, createMockRes, createSuite } = require('../test_helper');
const { shuffleArray } = require('../../api/_utils/arrayUtils');
const { asyncHandler } = require('../../api/_utils/asyncHandler');
const { logInfo, logError, logDb, logApi } = require('../../api/_utils/logger');

const suite = createSuite('API Core Utils (Array, AsyncHandler, Logger)');

// 1. Array Utils: shuffleArray
suite.test('shuffleArray: returns empty array for null, undefined, and non-array types', () => {
  assert.deepStrictEqual(shuffleArray(null), []);
  assert.deepStrictEqual(shuffleArray(undefined), []);
  assert.deepStrictEqual(shuffleArray('string_input'), []);
  assert.deepStrictEqual(shuffleArray(42), []);
  assert.deepStrictEqual(shuffleArray({}), []);
  assert.deepStrictEqual(shuffleArray(true), []);
});

suite.test('shuffleArray: handles empty array and single-item array', () => {
  assert.deepStrictEqual(shuffleArray([]), []);
  assert.deepStrictEqual(shuffleArray(['single']), ['single']);
});

suite.test('shuffleArray: returns new array and does not mutate source array', () => {
  const original = ['A', 'B', 'C', 'D', 'E'];
  const originalCopy = [...original];
  const shuffled = shuffleArray(original);

  assert.notStrictEqual(shuffled, original, 'Must return a different array reference');
  assert.deepStrictEqual(original, originalCopy, 'Original array must remain unchanged');
  assert.strictEqual(shuffled.length, original.length, 'Shuffled array must have identical length');
  assert.deepStrictEqual([...shuffled].sort(), [...original].sort(), 'Must retain all original elements');
});

suite.test('shuffleArray: performs random permutation across multiple trials', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let differentCount = 0;
  const trials = 20;

  for (let i = 0; i < trials; i++) {
    const res = shuffleArray(items);
    if (JSON.stringify(res) !== JSON.stringify(items)) {
      differentCount++;
    }
  }

  assert.ok(differentCount > 0, 'Shuffled array should differ from ordered input in multiple trials');
});

// 2. Async Handler Wrapper
suite.test('asyncHandler: catches thrown sync error and passes to next()', async () => {
  const customError = new Error('Synchronous handler failure');
  const handler = asyncHandler((req, res, next) => {
    throw customError;
  });

  let nextPassedError = null;
  await new Promise((resolve) => {
    handler(createMockReq(), createMockRes(), (err) => {
      nextPassedError = err;
      resolve();
    });
  });

  assert.strictEqual(nextPassedError, customError);
});

suite.test('asyncHandler: catches rejected async promise and passes to next()', async () => {
  const asyncError = new Error('Async promise rejection');
  const handler = asyncHandler(async (req, res, next) => {
    await Promise.resolve();
    throw asyncError;
  });

  let nextPassedError = null;
  await new Promise((resolve) => {
    handler(createMockReq(), createMockRes(), (err) => {
      nextPassedError = err;
      resolve();
    });
  });

  assert.strictEqual(nextPassedError, asyncError);
});

suite.test('asyncHandler: executes successful async handler without calling next(err)', async () => {
  let executed = false;
  let nextCalledWith = 'initial';

  const handler = asyncHandler(async (req, res, next) => {
    executed = true;
    res.status(200).json({ ok: true });
  });

  const res = createMockRes();
  await handler(createMockReq(), res, (err) => {
    nextCalledWith = err;
  });

  assert.strictEqual(executed, true);
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { ok: true });
  assert.strictEqual(nextCalledWith, 'initial');
});

// 3. Logger
suite.test('logger: logInfo, logError, logDb, logApi format messages without throwing', () => {
  // Capture console calls
  const logs = [];
  const origLog = console.log;
  const origErr = console.error;

  console.log = (...args) => logs.push({ type: 'log', text: args.join(' ') });
  console.error = (...args) => logs.push({ type: 'error', text: args.join(' ') });

  try {
    logInfo('STARTUP', 'Server started on port 3000', 'env=test');
    logError('AUTH', 'Invalid token received', 'ip=127.0.0.1');
    logDb('QUERY', 'Executed SELECT * FROM subjects', 'duration=2ms');
    logApi('GET', '/api/health', 'status=200');

    assert.strictEqual(logs.length, 4);
    assert.ok(logs[0].text.includes('reactiquiz:info'));
    assert.ok(logs[0].text.includes('STARTUP: Server started on port 3000 | env=test'));
    assert.ok(logs[1].text.includes('reactiquiz:error'));
    assert.ok(logs[2].text.includes('reactiquiz:db'));
    assert.ok(logs[3].text.includes('reactiquiz:api'));
  } finally {
    console.log = origLog;
    console.error = origErr;
  }
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
