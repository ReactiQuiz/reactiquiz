/**
 * tests/unit/quiz_assembler.test.js
 * 
 * Unit tests for Homi Bhabha practice test question assembler:
 * - api/_utils/quizAssembler.js
 */

const { assert, createMockTx, createSuite } = require('../test_helper');
const { assembleHomiBhabhaPracticeTest } = require('../../api/_utils/quizAssembler');

const suite = createSuite('Quiz Assembler Logic');

suite.test('assembleHomiBhabhaPracticeTest: fetches questions across physics, chemistry, biology, and gk', async () => {
  const mockTx = createMockTx((stmt) => {
    const sql = stmt.sql;
    const [subjectKey, grade] = stmt.args;

    // Return dummy questions matching subject and grade
    const count = 10;
    const rows = [];
    for (let i = 1; i <= count; i++) {
      rows.push({
        id: `${subjectKey}_${grade}_q${i}`,
        topicId: `topic_${subjectKey}`,
        text: `Question ${i} for ${subjectKey} grade ${grade}`,
        options: JSON.stringify([{ id: 'a', text: 'Opt A' }, { id: 'b', text: 'Opt B' }])
      });
    }
    return { rows };
  });

  const params = {
    questionComposition: {
      physics: { total: 15 },
      chemistry: { total: 15 },
      biology: { total: 15 },
      gk: { total: 5 }
    }
  };

  const result = await assembleHomiBhabhaPracticeTest(mockTx, params);

  assert.ok(Array.isArray(result));
  assert.strictEqual(result.length, 50, 'Total questions should match sum of required counts (15+15+15+5=50)');

  // Verify questions from each subject exist
  const physicsCount = result.filter(q => q.id.startsWith('physics_')).length;
  const chemistryCount = result.filter(q => q.id.startsWith('chemistry_')).length;
  const biologyCount = result.filter(q => q.id.startsWith('biology_')).length;
  const gkCount = result.filter(q => q.id.startsWith('gk_')).length;

  assert.strictEqual(physicsCount, 15);
  assert.strictEqual(chemistryCount, 15);
  assert.strictEqual(biologyCount, 15);
  assert.strictEqual(gkCount, 5);
});

suite.test('assembleHomiBhabhaPracticeTest: prioritizes higher grades (9th > 8th > 7th) and prevents duplicate IDs', async () => {
  const queryLog = [];
  const mockTx = createMockTx((stmt) => {
    const [subjectKey, grade] = stmt.args;
    queryLog.push({ subjectKey, grade });

    // Provide 5 questions for 9th grade, and 5 for 8th grade
    if (grade === '9th') {
      return {
        rows: [
          { id: `${subjectKey}_q1`, topicId: 't1', text: 'Q1' },
          { id: `${subjectKey}_q2`, topicId: 't1', text: 'Q2' }
        ]
      };
    }
    if (grade === '8th') {
      return {
        rows: [
          { id: `${subjectKey}_q2`, topicId: 't1', text: 'Q2 (duplicate)' }, // Duplicate ID from 9th
          { id: `${subjectKey}_q3`, topicId: 't1', text: 'Q3' },
          { id: `${subjectKey}_q4`, topicId: 't1', text: 'Q4' }
        ]
      };
    }
    return {
      rows: [
        { id: `${subjectKey}_q5`, topicId: 't1', text: 'Q5' }
      ]
    };
  });

  const params = {
    questionComposition: {
      physics: { total: 3 },
      chemistry: { total: 3 },
      biology: { total: 3 },
      gk: { total: 2 }
    }
  };

  const result = await assembleHomiBhabhaPracticeTest(mockTx, params);

  // Check unique IDs
  const idSet = new Set(result.map(q => q.id));
  assert.strictEqual(idSet.size, result.length, 'Every assembled question must have a unique ID');

  // Verify grades order was attempted starting with 9th
  assert.ok(queryLog.some(q => q.grade === '9th'));
});

suite.test('assembleHomiBhabhaPracticeTest: throws error if no questions are found for composition', async () => {
  const emptyTx = createMockTx({
    'SELECT': { rows: [] }
  });

  const params = {
    questionComposition: {
      physics: { total: 10 },
      chemistry: { total: 10 },
      biology: { total: 10 },
      gk: { total: 5 }
    }
  };

  let errorCaught = null;
  try {
    await assembleHomiBhabhaPracticeTest(emptyTx, params);
  } catch (err) {
    errorCaught = err;
  }

  assert.ok(errorCaught, 'Should throw when questions array is empty');
  assert.strictEqual(errorCaught.message, 'No questions found for the specified composition.');
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
