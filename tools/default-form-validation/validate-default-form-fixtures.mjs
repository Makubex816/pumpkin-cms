import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const fixturePath = path.join(scriptDir, 'fixtures', 'default-form-cases.json');
const {
  DEFAULT_CONTACT_FORM_DEFINITION,
  ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION,
  validateFormDefinition,
  validateFormSubmissionPayload,
  validatePageFormBlocks,
} = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));

const fixtures = JSON.parse(readFileSync(fixturePath, 'utf8'));
const failures = [];
let passed = 0;

for (const testCase of fixtures.definitionCases) {
  const definition = buildDefinitionCase(testCase);
  assertExpectation(testCase.name, testCase.expect, validateFormDefinition(definition, testCase.name));
}

for (const testCase of fixtures.pageCases) {
  assertExpectation(testCase.name, testCase.expect, validatePageFormBlocks(testCase.page, testCase.name));
}

for (const testCase of fixtures.submissionCases) {
  const definition = testCase.formKey === 'default-quote-request'
    ? ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION
    : DEFAULT_CONTACT_FORM_DEFINITION;
  assertExpectation(
    testCase.name,
    testCase.expect,
    validateFormSubmissionPayload({ formKey: testCase.formKey, formData: testCase.formData }, definition),
  );
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

function buildDefinitionCase(testCase) {
  const source = testCase.kind === 'ice-default-quote-request'
    ? ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION
    : DEFAULT_CONTACT_FORM_DEFINITION;
  const definition = JSON.parse(JSON.stringify(source));

  if (testCase.removeField) {
    definition.fields = definition.fields.filter((field) => field.name !== testCase.removeField);
    definition.hiddenFields = definition.hiddenFields.filter((field) => field.name !== testCase.removeField);
  }

  if (testCase.patch) {
    Object.assign(definition, testCase.patch);
  }

  if (testCase.patchField) {
    const fieldPatch = testCase.patchField.value || Object.fromEntries(
      Object.entries(testCase.patchField).filter(([key]) => key !== 'name'),
    );
    const targetField = [...definition.fields, ...definition.hiddenFields].find((field) => field.name === testCase.patchField.name);
    if (targetField) {
      Object.assign(targetField, fieldPatch);
    }
  }

  return definition;
}

function assertExpectation(name, expect, result) {
  const errorCount = result.errors?.length || 0;
  const warningCount = result.warnings?.length || 0;
  const ok =
    (expect === 'ok' && errorCount === 0) ||
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
