/**
 * tests/unit/frontend_icon_component.test.js
 * 
 * Unit tests for icon component resolver utility:
 * - web/src/utils/getIconComponent.ts
 */

const fs = require('fs');
const path = require('path');
const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Icon Component Resolver');

suite.test('getIconComponent: web/src/utils/getIconComponent.ts maps standard MUI icons and has fallback', () => {
  const filePath = path.resolve(__dirname, '../../web/src/utils/getIconComponent.ts');
  assert.ok(fs.existsSync(filePath), 'getIconComponent.ts should exist');

  const content = fs.readFileSync(filePath, 'utf8');

  // Verify exported function
  assert.ok(content.includes('export function getIconComponent'), 'getIconComponent function should be exported');

  // Verify icon mappings
  assert.ok(content.includes('ScienceIcon: ScienceIcon'), 'ScienceIcon should be in icon map');
  assert.ok(content.includes('CalculateIcon: CalculateIcon'), 'CalculateIcon should be in icon map');
  assert.ok(content.includes('BoltIcon: BoltIcon'), 'BoltIcon should be in icon map');
  assert.ok(content.includes('BiotechIcon: BiotechIcon'), 'BiotechIcon should be in icon map');
  assert.ok(content.includes('SchoolIcon: SchoolIcon'), 'SchoolIcon should be in icon map');
  assert.ok(content.includes('PublicIcon: PublicIcon'), 'PublicIcon should be in icon map');

  // Verify fallback
  assert.ok(content.includes('return IconComponent || DefaultIcon'), 'Should return DefaultIcon fallback for unknown icon names');
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
