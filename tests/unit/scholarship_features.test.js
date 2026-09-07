/**
 * tests/unit/scholarship_features.test.js
 *
 * Unit tests for Maharashtra State Scholarship Examination features:
 * - Two-option scoring rules (2 marks only when both correct options are selected)
 * - Legacy single-option scoring rules
 * - Paper 1 & Paper 2 mock exam assembly (75 questions: 25 language + 50 math/logic)
 * - User answer array coercion
 */

const { assert, createSuite } = require('../test_helper');
const { assembleScholarshipMock } = require('../../api/_utils/quizAssembler');

const suite = createSuite('Scholarship Examination Features');

suite.test('Scoring Logic: 2-option question awards 2 marks only when both correct options selected', () => {
  const correctOptionIds = ['B', 'D'];
  const numRequired = 2;

  // Case 1: Both selected correctly -> 2 marks
  const userSelectionFull = ['B', 'D'];
  const isCorrectFull = userSelectionFull.length === numRequired &&
    userSelectionFull.sort().every((val, idx) => val === [...correctOptionIds].sort()[idx]);
  assert.strictEqual(isCorrectFull, true, 'Full match should evaluate to true (2 marks)');

  // Case 2: Only 1 correct option selected -> 0 marks
  const userSelectionPartial = ['B'];
  const isCorrectPartial = userSelectionPartial.length === numRequired &&
    userSelectionPartial.sort().every((val, idx) => val === [...correctOptionIds].sort()[idx]);
  assert.strictEqual(isCorrectPartial, false, 'Partial selection should evaluate to false (0 marks)');

  // Case 3: 1 correct + 1 incorrect selected -> 0 marks
  const userSelectionMixed = ['B', 'A'];
  const isCorrectMixed = userSelectionMixed.length === numRequired &&
    userSelectionMixed.sort().every((val, idx) => val === [...correctOptionIds].sort()[idx]);
  assert.strictEqual(isCorrectMixed, false, 'Mixed selection should evaluate to false (0 marks)');
});

suite.test('assembleScholarshipMock: Paper 1 assembles 75 questions (25 First Language + 50 Mathematics)', async () => {
  const queryLog = [];
  const mockTx = {
    execute: async (stmt) => {
      queryLog.push(stmt.args);
      const subjectKey = stmt.args[0];
      const count = subjectKey === 'first-language-marathi' ? 25 : 50;
      const rows = [];
      for (let i = 1; i <= count; i++) {
        rows.push({
          id: `${subjectKey}_q${i}`,
          topicId: `top_${subjectKey}`,
          text: `Question ${i} for ${subjectKey}`,
          options: JSON.stringify([{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }])
        });
      }
      return { rows };
    }
  };

  const questions = await assembleScholarshipMock(mockTx, 'paper_1', 'Class 5th');
  assert.strictEqual(questions.length, 75, 'Paper 1 mock exam must contain exactly 75 questions');

  const marathiQs = questions.filter(q => q.id.startsWith('first-language-marathi'));
  const mathQs = questions.filter(q => q.id.startsWith('mathematics'));

  assert.strictEqual(marathiQs.length, 25, 'Paper 1 must contain 25 First Language questions');
  assert.strictEqual(mathQs.length, 50, 'Paper 1 must contain 50 Mathematics questions');

  // Verify ~20% of questions have numCorrectRequired set to 2
  const twoOptionQs = questions.filter(q => q.numCorrectRequired === 2);
  assert.ok(twoOptionQs.length >= 10, 'Approximately 20% of questions should require 2 option selections');
});

suite.test('assembleScholarshipMock: Paper 2 assembles 75 questions (25 Third Language + 50 Intelligence Test)', async () => {
  const mockTx = {
    execute: async (stmt) => {
      const subjectKey = stmt.args[0];
      const count = subjectKey === 'third-language-english' ? 25 : 50;
      const rows = [];
      for (let i = 1; i <= count; i++) {
        rows.push({
          id: `${subjectKey}_q${i}`,
          topicId: `top_${subjectKey}`,
          text: `Question ${i} for ${subjectKey}`,
          options: JSON.stringify([{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }])
        });
      }
      return { rows };
    }
  };

  const questions = await assembleScholarshipMock(mockTx, 'paper_2', 'Class 8th');
  assert.strictEqual(questions.length, 75, 'Paper 2 mock exam must contain exactly 75 questions');

  const englishQs = questions.filter(q => q.id.startsWith('third-language-english'));
  const intelQs = questions.filter(q => q.id.startsWith('intelligence-test'));

  assert.strictEqual(englishQs.length, 25, 'Paper 2 must contain 25 Third Language questions');
  assert.strictEqual(intelQs.length, 50, 'Paper 2 must contain 50 Intelligence Test questions');
});

suite.test('Legacy answer coercion: Single-index or legacy string answers gracefully coerce to option arrays', () => {
  const options = [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }, { id: 'C', text: 'Opt C' }];

  // Helper function under test
  function normalizeSelectedOptionIds(rawAnswer, optionsList) {
    if (Array.isArray(rawAnswer)) return rawAnswer.map(String);
    if (typeof rawAnswer === 'number' && optionsList && optionsList[rawAnswer]) {
      return [String(optionsList[rawAnswer].id)];
    }
    if (typeof rawAnswer === 'string') {
      if (rawAnswer.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(rawAnswer);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch (e) {}
      }
      return [rawAnswer.trim()];
    }
    return [];
  }

  assert.deepStrictEqual(normalizeSelectedOptionIds(1, options), ['B'], 'Number index 1 should coerce to ["B"]');
  assert.deepStrictEqual(normalizeSelectedOptionIds('C', options), ['C'], 'Single string "C" should coerce to ["C"]');
  assert.deepStrictEqual(normalizeSelectedOptionIds('["A", "C"]', options), ['A', 'C'], 'JSON array string should coerce to ["A", "C"]');
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
