/**
 * tests/web_theme.test.js
 * 
 * Frontend theme tokens validation test.
 * Parses and verifies theme tokens from web/src/themeTokens.ts
 * and web/src/adminTheme.ts.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('----------------------------------------------------');
console.log('       RUNNING FRONTEND THEME TOKENS VALIDATION      ');
console.log('----------------------------------------------------');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

const themeTokensPath = path.resolve(__dirname, '../web/src/themeTokens.ts');
const adminThemePath = path.resolve(__dirname, '../web/src/adminTheme.ts');

runTest('web/src/themeTokens.ts exists and contains neutral & primary ramps', () => {
  assert.ok(fs.existsSync(themeTokensPath), 'themeTokens.ts should exist');
  const content = fs.readFileSync(themeTokensPath, 'utf8');
  assert.ok(content.includes('export const neutralRamp'), 'neutralRamp should be exported');
  assert.ok(content.includes('export const primaryAccentRamp'), 'primaryAccentRamp should be exported');
  assert.ok(content.includes('export const secondaryAccentRamp'), 'secondaryAccentRamp should be exported');
  assert.ok(content.includes('#4F46E5'), 'Indigo accent token should be present');
});

runTest('web/src/adminTheme.ts exists and defines adminTheme', () => {
  assert.ok(fs.existsSync(adminThemePath), 'adminTheme.ts should exist');
  const content = fs.readFileSync(adminThemePath, 'utf8');
  assert.ok(content.includes('export const adminTheme = createTheme'), 'adminTheme should be exported');
});

console.log('----------------------------------------------------');
console.log(` SUMMARY: ${passed}/${total} frontend theme tests passed.`);
console.log('----------------------------------------------------\n');

if (passed !== total) {
  process.exit(1);
}
