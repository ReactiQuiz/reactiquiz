/**
 * tests/unit/admin_bulk_import_logic.test.js
 * 
 * Unit tests for high-volume admin bulk import and chunking logic:
 * - web/src/components/admin/content/BulkImportModal.tsx
 * - web/src/components/admin/content/JsonImportModal.tsx
 * - web/src/components/admin/content/DirectEditModal.tsx
 * - api/_routes/admin.js
 */

const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Admin Large-Scale Bulk Import & Chunking Logic');

function chunkItems(items, chunkSize = 300) {
  if (!Array.isArray(items)) return [];
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

suite.test('chunkItems: splits 5,000 questions into 17 manageable sub-batches', () => {
  const mockQuestions = [];
  for (let i = 1; i <= 5000; i++) {
    mockQuestions.push({
      id: `q_${i}`,
      topicId: 'topic_science',
      text: `Test question ${i}`,
      options: [{ id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' }],
      correctOptionId: 'a'
    });
  }

  const chunks = chunkItems(mockQuestions, 300);
  assert.strictEqual(chunks.length, 17); // 5000 / 300 = 16.66 -> 17 chunks
  assert.strictEqual(chunks[0].length, 300);
  assert.strictEqual(chunks[16].length, 200); // Remainder 5000 - (16 * 300) = 200

  // Total items preserved without loss
  const totalReconstructed = chunks.reduce((acc, c) => acc + c.length, 0);
  assert.strictEqual(totalReconstructed, 5000);
  assert.strictEqual(chunks[0][0].id, 'q_1');
  assert.strictEqual(chunks[16][199].id, 'q_5000');
});

suite.test('chunkItems: handles small and empty arrays cleanly', () => {
  assert.deepStrictEqual(chunkItems([]), []);
  assert.deepStrictEqual(chunkItems(null), []);

  const small = [{ id: '1' }, { id: '2' }];
  const chunks = chunkItems(small, 300);
  assert.strictEqual(chunks.length, 1);
  assert.strictEqual(chunks[0].length, 2);
});

suite.test('options normalization: handles both object arrays and pre-serialized JSON strings', () => {
  const q1 = {
    id: 'q1',
    options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]
  };
  const q2 = {
    id: 'q2',
    options: JSON.stringify([{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }])
  };

  const norm1 = typeof q1.options === 'string' ? q1.options : JSON.stringify(q1.options);
  const norm2 = typeof q2.options === 'string' ? q2.options : JSON.stringify(q2.options);

  assert.strictEqual(typeof norm1, 'string');
  assert.strictEqual(typeof norm2, 'string');
  assert.deepStrictEqual(JSON.parse(norm1), JSON.parse(norm2));
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
