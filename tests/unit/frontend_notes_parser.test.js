/**
 * tests/unit/frontend_notes_parser.test.js
 * 
 * Unit tests for Markdown headings extraction and Table of Contents logic.
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Notes Parser & TOC');

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_`[\]]/g, '').trim();
      const id = slugifyHeading(cleanText);
      headings.push({ id, text: cleanText, level });
    }
  }

  return headings;
}

suite.test('slugifyHeading: generates valid URL anchors', () => {
  assert.strictEqual(slugifyHeading('Universal Law of Gravitation'), 'universal-law-of-gravitation');
  assert.strictEqual(slugifyHeading('Newton\'s 2nd Law ($F = ma$)'), 'newtons-2nd-law-f-ma');
  assert.strictEqual(slugifyHeading('   Extra   Spaces  '), 'extra-spaces');
});

suite.test('extractHeadings: extracts H1, H2, and H3 with clean text and levels', () => {
  const markdown = `
# Laws of Motion & Kinematics

Introduction text here.

## Distance vs Displacement

Explanation.

### Vector Properties

Details.

## The Three Equations

Formulas.
  `;

  const headings = extractHeadings(markdown);
  assert.strictEqual(headings.length, 4);
  assert.strictEqual(headings[0].text, 'Laws of Motion & Kinematics');
  assert.strictEqual(headings[0].level, 1);
  assert.strictEqual(headings[0].id, 'laws-of-motion-kinematics');

  assert.strictEqual(headings[1].text, 'Distance vs Displacement');
  assert.strictEqual(headings[1].level, 2);

  assert.strictEqual(headings[2].text, 'Vector Properties');
  assert.strictEqual(headings[2].level, 3);

  assert.strictEqual(headings[3].text, 'The Three Equations');
  assert.strictEqual(headings[3].level, 2);
});

suite.test('extractHeadings: ignores non-heading markdown and empty inputs', () => {
  assert.deepStrictEqual(extractHeadings(''), []);
  assert.deepStrictEqual(extractHeadings('Just regular text\nNo headers here'), []);
});

suite.test('alertCallouts: identifies GitHub alert tags correctly', () => {
  const detectAlert = (text) => {
    const match = text.trim().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
    return match ? match[1].toUpperCase() : null;
  };

  assert.strictEqual(detectAlert('[!NOTE]\nThis is a note'), 'NOTE');
  assert.strictEqual(detectAlert('[!TIP] Helpful tip'), 'TIP');
  assert.strictEqual(detectAlert('[!IMPORTANT]\nCrucial concept'), 'IMPORTANT');
  assert.strictEqual(detectAlert('[!WARNING] Watch out'), 'WARNING');
  assert.strictEqual(detectAlert('[!CAUTION] Danger'), 'CAUTION');
  assert.strictEqual(detectAlert('Regular quote without alert'), null);
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
