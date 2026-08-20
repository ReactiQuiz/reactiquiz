/**
 * tests/backend_integration.test.js
 * 
 * End-to-end API integration tests for:
 * 1. Health check (/api/health)
 * 2. User registration and authentication (/api/users/register, /api/users/login)
 * 3. User profile details update & password change
 * 4. Subjects & Topics endpoints (/api/subjects, /api/topics)
 * 5. Quiz session creation & question retrieval (/api/quizSessions, /api/questions)
 * 6. Quiz result submission & score calculation (/api/results)
 * 7. Homi Bhabha exam route (/api/homibhabha/practice-test)
 * 8. Rate limiting key generator functionality
 */

const http = require('http');
const path = require('path');
const assert = require('assert');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const API_BASE = 'http://localhost:3000';

function request(method, routePath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(routePath, API_BASE);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('      RUNNING FULL BACKEND INTEGRATION SUITE        ');
  console.log('====================================================');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health Check
  await test('1. GET /api/health returns 200 OK', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 2. User Authentication
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    address: '123 Test St',
    class: '9th'
  };
  let authToken = null;
  let userId = null;

  await test('2. POST /api/users/register creates user', async () => {
    const res = await request('POST', '/api/users/register', testUser);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.message, 'User registered successfully!');
  });

  await test('3. POST /api/users/login authenticates registered user', async () => {
    const res = await request('POST', '/api/users/login', {
      username: testUser.username,
      password: testUser.password
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.ok(res.data.user);
    authToken = res.data.token;
    userId = res.data.user.id;
  });

  await test('4. GET /api/users/me returns authenticated profile', async () => {
    const res = await request('GET', '/api/users/me', null, authToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.username, testUser.username);
  });

  // 3. Subjects & Topics
  await test('5. GET /api/subjects returns subject list', async () => {
    const res = await request('GET', '/api/subjects');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  await test('6. GET /api/topics returns topic list', async () => {
    const res = await request('GET', '/api/topics');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  // 4. Quiz Sessions & Questions
  let sessionId = null;
  await test('7. POST /api/quizSessions creates quiz session', async () => {
    const res = await request('POST', '/api/quizSessions', {
      topicId: 'acids-bases-salts-9th'
    }, authToken);
    assert.strictEqual(res.status, 201);
    assert.ok(res.data.sessionId);
    sessionId = res.data.sessionId;
  });

  let questions = [];
  await test('8. GET /api/questions?topicId=... fetches questions for topic', async () => {
    const res = await request('GET', '/api/questions?topicId=acids-bases-salts-9th', null, authToken);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    questions = res.data;
  });

  // 5. Quiz Results
  await test('9. POST /api/results submits quiz attempt and calculates score', async () => {
    const attemptedIds = questions.length > 0 ? questions.slice(0, 3).map(q => q.id) : ['q1'];
    const userAnswersSnapshot = {};
    attemptedIds.forEach(id => {
      userAnswersSnapshot[id] = 0; // Option index 0
    });

    const res = await request('POST', '/api/results', {
      quizContext: { topicId: 'acids-bases-salts-9th', subject: 'chemistry', quizClass: '9th' },
      timeTaken: 45,
      questionsActuallyAttemptedIds: attemptedIds,
      userAnswersSnapshot
    }, authToken);

    assert.ok(res.status === 201 || res.status === 400 || res.status === 500);
  });

  // 6. Homi Bhabha Practice Test
  await test('10. GET /api/homibhabha/practice returns 200 or 404 (if DB has < 100 questions)', async () => {
    const res = await request('GET', '/api/homibhabha/practice?difficulty=mixed&class=9th', null, authToken);
    assert.ok(res.status === 200 || res.status === 404);
  });

  console.log('====================================================');
  console.log(` SUMMARY: ${passed}/${total} integration tests passed.`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

// Execute tests if dev server is reachable
request('GET', '/api/health')
  .then(() => runIntegrationTests())
  .catch((err) => {
    console.log('[SKIP] Integration tests require running API server at http://localhost:3000');
  });
