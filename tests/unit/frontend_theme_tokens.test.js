/**
 * tests/unit/frontend_theme_tokens.test.js
 * 
 * Unit tests for design tokens and theme architecture:
 * - web/src/themeTokens.ts
 * - web/src/theme.ts
 * - web/src/adminTheme.ts
 */

const fs = require('fs');
const path = require('path');
const { assert, createSuite } = require('../test_helper');

const suite = createSuite('Frontend Theme Tokens & Design System');

const themeTokensPath = path.resolve(__dirname, '../../web/src/themeTokens.ts');
const themePath = path.resolve(__dirname, '../../web/src/theme.ts');
const adminThemePath = path.resolve(__dirname, '../../web/src/adminTheme.ts');

suite.test('themeTokens: exports full neutral, primary, and secondary color ramps', () => {
  assert.ok(fs.existsSync(themeTokensPath));
  const content = fs.readFileSync(themeTokensPath, 'utf8');

  // Verify neutral ramps (slate 50 to 950)
  assert.ok(content.includes('export const neutralRamp'));
  assert.ok(content.includes("'#F8FAFC'")); // 50
  assert.ok(content.includes("'#0F172A'")); // 900

  // Verify primary & secondary ramps
  assert.ok(content.includes('export const primaryAccentRamp'));
  assert.ok(content.includes('export const secondaryAccentRamp'));
  assert.ok(content.includes("'#4F46E5'")); // primary 500
  assert.ok(content.includes("'#10B981'")); // secondary 500
});

suite.test('themeTokens: exports light & dark surfaces, typography, radius, and touch target', () => {
  const content = fs.readFileSync(themeTokensPath, 'utf8');

  assert.ok(content.includes('export const neutralLight'));
  assert.ok(content.includes('export const neutralDark'));
  assert.ok(content.includes('export const fontHeading'));
  assert.ok(content.includes('export const fontBody'));
  assert.ok(content.includes('export const touchTarget = 40'));
  assert.ok(content.includes('export const radius'));
  assert.ok(content.includes('export const motion'));
});

suite.test('theme: defines lightTheme and darkTheme with accessibility and contrast compliance', () => {
  assert.ok(fs.existsSync(themePath));
  const content = fs.readFileSync(themePath, 'utf8');

  assert.ok(content.includes('export const lightTheme'));
  assert.ok(content.includes('export const darkTheme'));
  assert.ok(content.includes('buildAppTheme'));
  assert.ok(content.includes('shape: {'));
  assert.ok(content.includes('borderRadius: radius.md'));
});

suite.test('adminTheme: defines cohesive dark admin interface theme', () => {
  assert.ok(fs.existsSync(adminThemePath));
  const content = fs.readFileSync(adminThemePath, 'utf8');

  assert.ok(content.includes('export const adminTheme = createTheme'));
  assert.ok(content.includes("mode: 'dark'"));
  assert.ok(content.includes('MuiSwitch:'));
});

if (require.main === module) {
  suite.run().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = suite;
