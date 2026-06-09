import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createFakeEscrow } from '../src/escrow/escrow-create-runner.mjs';
import { validateEscrowPolicyInputs } from '../src/escrow/escrow-policy-validator.mjs';
import { validateEscrowOutput } from '../src/escrow/escrow-validator.mjs';
import { selectFakeCatalogItems } from '../src/escrow/fake-secret-catalog.mjs';
import { createStandardBackup } from '../src/standard-backup-runner.mjs';
import { validateBackupBundle } from '../src/validators/backup-validator.mjs';
import { listFilesRecursive } from '../src/utils/file-hash.mjs';
import { readJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-01-01T00:00:00.000Z');
const testOutputNames = [
  'test-fake-escrow',
  'test-fake-escrow-cli',
  'test-standard-backup-escrow-boundary'
];

after(async () => {
  await Promise.all(testOutputNames.map((name) => clean(name)));
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
}

async function loadEscrowFixtures() {
  const request = await readJson(path.join(packageRoot, 'fixtures', 'fake-escrow-request.json'));
  const policy = await readJson(path.join(packageRoot, 'fixtures', 'fake-escrow-policy.json'));
  const catalog = await readJson(path.join(packageRoot, 'fixtures', 'fake-secret-catalog.json'));
  const recipient = await readJson(path.join(packageRoot, 'fixtures', 'fake-escrow-recipient.json'));
  const selectedItems = selectFakeCatalogItems({ request, catalog });
  return { request, policy, catalog, recipient, selectedItems };
}

test('fake escrow create succeeds and validates encrypted output', async () => {
  await clean('test-fake-escrow');
  const result = await createFakeEscrow({
    requestPath: 'fixtures/fake-escrow-request.json',
    outputPath: '.tmp/test-fake-escrow',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.fakeOnly, true);
  assert.equal(result.manifest.itemCount, 3);
  assert.equal(result.manifest.roundTripVerified, true);
  assert.equal(result.manifest.boundaries.privateKeyWritten, false);
  assert.equal(result.recipientMetadata.privateKeyPersistence, 'not-written');
  await assertEscrowOutputFiles(result.outputRoot);
});

test('fake escrow payload is not plaintext JSON', async () => {
  await clean('test-fake-escrow');
  const result = await createFakeEscrow({
    requestPath: 'fixtures/fake-escrow-request.json',
    outputPath: '.tmp/test-fake-escrow',
    overwrite: true,
    now: fixedDate
  });
  const payload = await fs.readFile(path.join(result.outputRoot, 'encrypted-payload.bin'));
  const prefix = payload.toString('utf8', 0, Math.min(payload.length, 32)).trimStart();
  assert.equal(prefix.startsWith('{'), false);
  assert.equal(prefix.startsWith('['), false);
});

test('fake escrow validator succeeds on generated output', async () => {
  await clean('test-fake-escrow');
  const result = await createFakeEscrow({
    requestPath: 'fixtures/fake-escrow-request.json',
    outputPath: '.tmp/test-fake-escrow',
    overwrite: true,
    now: fixedDate
  });
  const validation = await validateEscrowOutput({ escrowPath: result.outputRoot });
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.payloadEncryptedResult, 'passed');
  assert.equal(validation.summary.privateKeyResult, 'passed');
});

test('fake approval record is required', async () => {
  const fixtures = await loadEscrowFixtures();
  delete fixtures.request.approval;
  const validation = validateEscrowPolicyInputs(fixtures);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_APPROVAL_REQUIRED'));
});

test('recipient metadata is required and must not persist private-key material', async () => {
  const fixtures = await loadEscrowFixtures();
  fixtures.recipient = { fakeOnly: true };
  const validation = validateEscrowPolicyInputs(fixtures);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_RECIPIENT_INVALID'));
});

test('disallowed fake catalog category fails policy validation', async () => {
  const fixtures = await loadEscrowFixtures();
  fixtures.selectedItems[0].category = 'not_allowlisted_category';
  const validation = validateEscrowPolicyInputs(fixtures);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_CATEGORY_NOT_ALLOWED'));
});

test('short-lived token and session-cookie categories fail policy validation', async () => {
  const fixtures = await loadEscrowFixtures();
  fixtures.selectedItems[0].category = 'short_lived_' + 'token';
  fixtures.selectedItems[1].category = 'session_' + 'cookie';
  const validation = validateEscrowPolicyInputs(fixtures);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_CATEGORY_BLOCKED'));
});

test('fake value matching high-risk scanner fails policy validation', async () => {
  const fixtures = await loadEscrowFixtures();
  fixtures.selectedItems[0].fakeValue = 'bear' + 'er fake-high-risk-looking-value';
  const validation = validateEscrowPolicyInputs(fixtures);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_VALUE_LOOKS_REAL'));
});

test('private-key material is not written to fixture or generated escrow output paths', async () => {
  await clean('test-fake-escrow');
  const result = await createFakeEscrow({
    requestPath: 'fixtures/fake-escrow-request.json',
    outputPath: '.tmp/test-fake-escrow',
    overwrite: true,
    now: fixedDate
  });
  const privateMaterialPattern = new RegExp('PRIVATE ' + 'KEY');
  const fixtureFiles = await listFilesRecursive(path.join(packageRoot, 'fixtures'));
  const outputFiles = await listFilesRecursive(result.outputRoot);
  for (const filePath of [...fixtureFiles, ...outputFiles]) {
    assert.equal(/\.pem$|\.pfx$|\.key$/i.test(filePath), false);
    if (path.basename(filePath) === 'encrypted-payload.bin') continue;
    const text = await fs.readFile(filePath, 'utf8');
    assert.equal(privateMaterialPattern.test(text), false);
  }
});

test('standard backup still writes escrow-not-included marker and rejects escrow payloads', async () => {
  await clean('test-standard-backup-escrow-boundary');
  const result = await createStandardBackup({
    answersPath: 'fixtures/tenant-standard-backup.answers.json',
    outputPath: '.tmp/test-standard-backup-escrow-boundary',
    overwrite: true,
    now: fixedDate
  });
  await fs.access(path.join(result.bundleRoot, 'escrow', 'ESCROW_NOT_INCLUDED.md'));
  await fs.writeFile(path.join(result.bundleRoot, 'escrow', 'escrow-' + 'payload.fake'), 'fake payload marker\n', 'utf8');
  const validation = await validateBackupBundle({ bundlePath: result.bundleRoot });
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'ESCROW_PAYLOAD_PRESENT'));
});

test('CLI fake escrow create, validate, and inspect work without printing payload values', async () => {
  await clean('test-fake-escrow-cli');
  const create = await runCli([
    'src/backup-cli.mjs',
    'escrow-create-fake',
    '--request',
    'fixtures/fake-escrow-request.json',
    '--out',
    '.tmp/test-fake-escrow-cli',
    '--overwrite'
  ]);
  assert.equal(create.code, 0);
  assert.match(create.stdout, /escrow-create-fake: passed/);
  assert.equal(create.stdout.includes('fake-placeholder-value'), false);

  const validate = await runCli(['src/backup-cli.mjs', 'escrow-validate', '--escrow', '.tmp/test-fake-escrow-cli']);
  assert.equal(validate.code, 0);
  assert.match(validate.stdout, /escrow-validation: passed/);

  const inspect = await runCli(['src/backup-cli.mjs', 'escrow-inspect', '--escrow', '.tmp/test-fake-escrow-cli']);
  assert.equal(inspect.code, 0);
  assert.match(inspect.stdout, /fakeOnly: true/);
  assert.equal(inspect.stdout.includes('fake-placeholder-value'), false);
});

test('escrow source does not include external call patterns or protected config reads', async () => {
  const blockedSourcePattern = new RegExp(
    [
      'fe' + 'tch\\s*\\(',
      'http' + '\\.request',
      'https' + '\\.request',
      'Invoke-' + 'WebRequest',
      'appsettings' + '\\.Development',
      'local' + '\\.settings',
      '\\.env' + '\\.local'
    ].join('|'),
    'i'
  );
  const sourceFiles = await listFilesRecursive(path.join(packageRoot, 'src', 'escrow'));
  for (const filePath of sourceFiles) {
    const text = await fs.readFile(filePath, 'utf8');
    assert.equal(blockedSourcePattern.test(text), false);
  }
});

async function assertEscrowOutputFiles(outputRoot) {
  await fs.access(path.join(outputRoot, 'escrow-manifest.json'));
  await fs.access(path.join(outputRoot, 'encrypted-payload.bin'));
  await fs.access(path.join(outputRoot, 'recipient-metadata.json'));
  await fs.access(path.join(outputRoot, 'escrow-approval-record.json'));
  await fs.access(path.join(outputRoot, 'escrow-validation-result.json'));
  await fs.access(path.join(outputRoot, 'ESCROW_VALIDATION_RESULT.md'));
  await fs.access(path.join(outputRoot, 'ESCROW_FAKE_ONLY_NOTICE.md'));
}

async function runCli(args) {
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd: packageRoot }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout,
        stderr
      });
    });
  });
}
