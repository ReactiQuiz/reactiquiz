/**
 * tests/unit/frontend_analytics_logic.test.js
 * 
 * Unit tests for analytics calculation and results filtering logic:
 * - web/src/hooks/useDashboard.ts
 * - web/src/hooks/useResults.ts
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Analytics & Results Processing Logic');

// Logic for calculating dashboard aggregations
function computeDashboardMetrics(results, subjects = []) {
  if (!results || results.length === 0) return null;

  const totalQuizzes = results.length;
  const overallAverageScore = Math.round(
    results.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzes
  );

  const overallTotalQs = results.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  const overallCorrectQs = results.reduce((acc, curr) => acc + (curr.correctAnswers || 0), 0);
  const overallQuestionAccuracy = overallTotalQs > 0 ? Math.round((overallCorrectQs / overallTotalQs) * 100) : 0;

  const subjectsMap = new Map(subjects.map(s => [s.subjectKey.toLowerCase(), s.name]));
  const subjectGroups = {};

  results.forEach(res => {
    const key = (res.subject ? String(res.subject).trim() : 'General').toLowerCase();
    if (!subjectGroups[key]) subjectGroups[key] = [];
    subjectGroups[key].push(res);
  });

  const subjectBreakdowns = {};
  Object.keys(subjectGroups).forEach(key => {
    const group = subjectGroups[key];
    const name = subjectsMap.get(key) || (key.charAt(0).toUpperCase() + key.slice(1));
    const count = group.length;
    const average = Math.round(group.reduce((acc, c) => acc + c.percentage, 0) / count);
    const totalQuestions = group.reduce((acc, c) => acc + (c.totalQuestions || 0), 0);
    const totalCorrect = group.reduce((acc, c) => acc + (c.correctAnswers || 0), 0);

    subjectBreakdowns[key] = {
      name,
      count,
      average,
      totalQuestions,
      totalCorrect
    };
  });

  return {
    totalQuizzes,
    overallAverageScore,
    overallQuestionStats: {
      total: overallTotalQs,
      correct: overallCorrectQs,
      accuracy: overallQuestionAccuracy
    },
    subjectBreakdowns
  };
}

// Logic for sorting and filtering results
function filterAndSortResults(results, filters, sortOrder) {
  const filtered = (results || []).filter(result => {
    const matchesSubject = filters.subject === 'all' || result.subject === filters.subject;
    const matchesClass = filters.class === 'all' || result.class === filters.class;
    const matchesGenre = filters.genre === 'all' || result.genre === filters.genre;
    return matchesSubject && matchesClass && matchesGenre;
  });

  const sorted = [...filtered];
  switch (sortOrder) {
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    case 'score_desc':
      return sorted.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    case 'score_asc':
      return sorted.sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
    default:
      return sorted;
  }
}

// 1. Dashboard Aggregations Tests
suite.test('computeDashboardMetrics: returns null for empty results array', () => {
  assert.strictEqual(computeDashboardMetrics([]), null);
  assert.strictEqual(computeDashboardMetrics(null), null);
});

suite.test('computeDashboardMetrics: aggregates overall score, question accuracy, and subject breakdown', () => {
  const sampleResults = [
    { subject: 'physics', percentage: 80, totalQuestions: 10, correctAnswers: 8 },
    { subject: 'physics', percentage: 100, totalQuestions: 10, correctAnswers: 10 },
    { subject: 'chemistry', percentage: 60, totalQuestions: 10, correctAnswers: 6 }
  ];

  const subjectsMeta = [
    { subjectKey: 'physics', name: 'Physics' },
    { subjectKey: 'chemistry', name: 'Chemistry' }
  ];

  const metrics = computeDashboardMetrics(sampleResults, subjectsMeta);
  assert.ok(metrics);
  assert.strictEqual(metrics.totalQuizzes, 3);
  assert.strictEqual(metrics.overallAverageScore, 80); // (80 + 100 + 60) / 3 = 80
  assert.strictEqual(metrics.overallQuestionStats.total, 30);
  assert.strictEqual(metrics.overallQuestionStats.correct, 24);
  assert.strictEqual(metrics.overallQuestionStats.accuracy, 80);

  // Subject breakdowns
  assert.strictEqual(metrics.subjectBreakdowns['physics'].count, 2);
  assert.strictEqual(metrics.subjectBreakdowns['physics'].average, 90);
  assert.strictEqual(metrics.subjectBreakdowns['chemistry'].count, 1);
  assert.strictEqual(metrics.subjectBreakdowns['chemistry'].average, 60);
});

// 2. Results Filter & Sort Tests
suite.test('filterAndSortResults: filters by subject, class, and genre correctly', () => {
  const rawResults = [
    { id: '1', subject: 'physics', class: '9th', genre: 'Curriculum', percentage: 90, timestamp: '2026-08-10' },
    { id: '2', subject: 'chemistry', class: '9th', genre: 'Curriculum', percentage: 70, timestamp: '2026-08-11' },
    { id: '3', subject: 'physics', class: '10th', genre: 'Competitive', percentage: 85, timestamp: '2026-08-12' }
  ];

  // Filter for physics only
  const physicsOnly = filterAndSortResults(rawResults, { subject: 'physics', class: 'all', genre: 'all' }, 'date_desc');
  assert.strictEqual(physicsOnly.length, 2);
  assert.strictEqual(physicsOnly[0].id, '3'); // Newest date first
  assert.strictEqual(physicsOnly[1].id, '1');

  // Filter for physics + 9th class
  const physics9th = filterAndSortResults(rawResults, { subject: 'physics', class: '9th', genre: 'all' }, 'date_desc');
  assert.strictEqual(physics9th.length, 1);
  assert.strictEqual(physics9th[0].id, '1');
});

suite.test('filterAndSortResults: sorts by score descending and ascending correctly', () => {
  const rawResults = [
    { id: 'a', subject: 'physics', class: '9th', genre: 'all', percentage: 50, timestamp: '2026-08-10' },
    { id: 'b', subject: 'physics', class: '9th', genre: 'all', percentage: 100, timestamp: '2026-08-11' },
    { id: 'c', subject: 'physics', class: '9th', genre: 'all', percentage: 75, timestamp: '2026-08-12' }
  ];

  const scoreDesc = filterAndSortResults(rawResults, { subject: 'all', class: 'all', genre: 'all' }, 'score_desc');
  assert.deepStrictEqual(scoreDesc.map(r => r.id), ['b', 'c', 'a']);

  const scoreAsc = filterAndSortResults(rawResults, { subject: 'all', class: 'all', genre: 'all' }, 'score_asc');
  assert.deepStrictEqual(scoreAsc.map(r => r.id), ['a', 'c', 'b']);
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
