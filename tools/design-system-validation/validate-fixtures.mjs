import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const fixturesPath = path.join(scriptDir, 'fixtures', 'rich-section-cases.json');
const {
  buildThemeTokenCssVariables,
  validateCss,
  validateCustomHtmlContent,
  validateThemeDesignSystem,
  validateThemeNavigation,
  validateTrustedEmbedContent,
} = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));

const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8'));
const failures = [];
let passed = 0;

function assertExpectation(name, expect, result) {
  const errorCount = result.errors?.length || 0;
  const warningCount = result.warnings?.length || 0;
  const ok =
    (expect === 'ok' && errorCount === 0 && warningCount === 0) ||
    (expect === 'warning' && errorCount === 0 && warningCount > 0) ||
    (expect === 'error' && errorCount > 0);

  if (ok) {
    passed += 1;
    return;
  }

  failures.push({
    name,
    expect,
    errors: result.errors || [],
    warnings: result.warnings || [],
  });
}

for (const testCase of fixtures.customHtml) {
  assertExpectation(testCase.name, testCase.expect, validateCustomHtmlContent(testCase.content));
}

for (const testCase of fixtures.css) {
  assertExpectation(testCase.name, testCase.expect, validateCss(testCase.css, testCase.options));
}

for (const testCase of fixtures.theme) {
  const result = validateThemeDesignSystem(testCase.designSystem, 'ice-rink-rentals');
  if (testCase.name === 'valid theme token rendering') {
    const cssVariables = buildThemeTokenCssVariables(testCase.designSystem.tokens);
    if (!cssVariables.includes('--cms-colors-primary')) {
      failures.push({ name: testCase.name, expect: 'token css variable output', errors: ['Missing --cms-colors-primary'], warnings: [] });
      continue;
    }
  }
  assertExpectation(testCase.name, testCase.expect, result);
}

for (const testCase of fixtures.trustedEmbed) {
  assertExpectation(testCase.name, testCase.expect, validateTrustedEmbedContent(testCase.content));
}

for (const testCase of fixtures.navigation || []) {
  assertExpectation(testCase.name, testCase.expect, validateThemeNavigation(testCase.menu, testCase.options || {}));
}

const summary = {
  ok: failures.length === 0,
  passed,
  failed: failures.length,
  failures,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
