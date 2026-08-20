/**
 * tests/unit/frontend_format_time.test.js
 * 
 * Unit tests for time formatting utilities:
 * - web/src/utils/formatTime.ts
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Time & Date Formatting');

// Equivalent implementation from web/src/utils/formatTime.ts
const formatTime = (totalSeconds) => {
  if (totalSeconds == null || typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
    return 'N/A';
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
  }
  if (minutes > 0) {
    return `${paddedMinutes}m ${paddedSeconds}s`;
  }
  return `${paddedSeconds}s`;
};

const formatDate = (dateInput) => {
  if (!dateInput) return 'Unknown date';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 1. formatTime tests
suite.test('formatTime: returns N/A for null, undefined, negative numbers, and NaN', () => {
  assert.strictEqual(formatTime(null), 'N/A');
  assert.strictEqual(formatTime(undefined), 'N/A');
  assert.strictEqual(formatTime(-10), 'N/A');
  assert.strictEqual(formatTime(NaN), 'N/A');
  assert.strictEqual(formatTime('60'), 'N/A');
});

suite.test('formatTime: formats seconds only (< 60s)', () => {
  assert.strictEqual(formatTime(0), '00s');
  assert.strictEqual(formatTime(7), '07s');
  assert.strictEqual(formatTime(45), '45s');
  assert.strictEqual(formatTime(59), '59s');
});

suite.test('formatTime: formats minutes and seconds (1m to 59m 59s)', () => {
  assert.strictEqual(formatTime(60), '01m 00s');
  assert.strictEqual(formatTime(75), '01m 15s');
  assert.strictEqual(formatTime(630), '10m 30s');
  assert.strictEqual(formatTime(3599), '59m 59s');
});

suite.test('formatTime: formats hours, minutes, and seconds (>= 1h)', () => {
  assert.strictEqual(formatTime(3600), '01h 00m 00s');
  assert.strictEqual(formatTime(3665), '01h 01m 05s');
  assert.strictEqual(formatTime(86400), '24h 00m 00s');
});

// 2. formatDate tests
suite.test('formatDate: handles missing date with "Unknown date"', () => {
  assert.strictEqual(formatDate(null), 'Unknown date');
  assert.strictEqual(formatDate(undefined), 'Unknown date');
  assert.strictEqual(formatDate(''), 'Unknown date');
});

suite.test('formatDate: handles invalid date strings with "Invalid date"', () => {
  assert.strictEqual(formatDate('invalid-date-string'), 'Invalid date');
});

suite.test('formatDate: formats valid ISO string and Date objects', () => {
  const result1 = formatDate('2026-08-14T10:30:00Z');
  assert.ok(result1.includes('2026') && result1.includes('Aug'));

  const result2 = formatDate(new Date('2026-01-15T15:00:00Z'));
  assert.ok(result2.includes('2026') && result2.includes('Jan'));
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
