import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCredentialReferenceDocument, validateCredentialReferenceDocument } from '../src/credentials/credential-reference-writer.mjs';
import { createHandoffPackage } from '../src/handoff/handoff-package-writer.mjs';
import { validateHandoffPackage } from '../src/handoff/handoff-validator.mjs';
import { writeRedactedRegistry, validateRegistryOutput } from '../src/registry/redacted-registry-writer.mjs';
import { validateRedactedRegistry } from '../src/registry/resource-entry-normalizer.mjs';
import { createFakeVault, createSessionVault } from '../src/vault/vault-create-runner.mjs';
import { validateVaultOutput } from '../src/vault/vault-validator.mjs';
import { listFilesRecursive } from '../src/utils/file-hash.mjs';
import { readJson, writeJson } from '../src/utils/json-writer.mjs';
import { packageRoot } from '../src/utils/safe-paths.mjs';

const fixedDate = new Date('2026-06-09T12:00:00.000Z');
const registryFixture = 'fixtures/resource-registry.fixture.json';
const credentialFixture = 'fixtures/credential-references.fixture.json';
const fakeVaultRequest = 'fixtures/fake-vault-request.fixture.json';
const cleanNames = [
  'test-redacted-registry',
  'test-fake-vault',
  'test-session-vault-missing-passphrase',
  'test-session-vault-present',
  'test-handoff',
  'test-handoff-with-vault',
  'test-cli-handoff'
];

const envWithVault = {
  PUMPKIN_API_URL: 'https://pumpkin-api.local.test',
  PUMPKIN_ADMIN_JWT: 'FAKE_SESSION_JWT_PRESENT_BUT_EXCLUDED',
  ROLLER_RINK_RENTALS_API_KEY: 'FAKE_ROLLER_RINK_RENTALS_SESSION_BOOTSTRAP_MATERIAL',
  ROLLER_RINK_RENTALS_TENANT_ID: 'tenant-ice-rink-rentals',
  PUMPKIN_HANDOFF_VAULT_PASSPHRASE: 'FAKE_LOCAL_TEST_HANDOFF_VAULT_PASSPHRASE'
};

after(async () => {
  await Promise.all(cleanNames.map(clean));
});

test('redacted registry generation writes registry, maps, summary, and passes validator', async () => {
  const result = await writeRedactedRegistry({
    fixturesPath: registryFixture,
    outputPath: '.tmp/test-redacted-registry',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  await fs.access(path.join(result.outputRoot, 'REDACTED_RESOURCE_REGISTRY.json'));
  await fs.access(path.join(result.outputRoot, 'RESOURCE_REGISTRY_SUMMARY.md'));
  await fs.access(path.join(result.outputRoot, 'RESOURCE_TO_TENANT_MAP.md'));
  await fs.access(path.join(result.outputRoot, 'RUNTIME_PROFILE_MAP.md'));
  const registry = await readJson(path.join(result.outputRoot, 'REDACTED_RESOURCE_REGISTRY.json'));
  assert.equal(registry.valuesIncluded, false);
  assert.equal(registry.sessionMetadata.adminJwtPresence, 'PRESENT');
  assert.equal(registry.credentialReferences.find((item) => item.credentialRefId === 'credential-pumpkin-admin-jwt-session').escrowStatus, 'excluded-session-token');
  const validation = await validateRegistryOutput({ registryPath: '.tmp/test-redacted-registry' });
  assert.equal(validation.status, 'passed');
});

test('credential reference document records env presence without values', () => {
  const document = buildCredentialReferenceDocument({ env: envWithVault, now: fixedDate });
  assert.equal(document.valuesIncluded, false);
  assert.equal(document.envPresence.variables.find((item) => item.name === 'PUMPKIN_ADMIN_JWT').presence, 'PRESENT');
  assert.equal(document.credentialReferences.find((item) => item.envName === 'PUMPKIN_ADMIN_JWT').escrowStatus, 'excluded-session-token');
  assert.equal(document.credentialReferences.some((item) => Object.hasOwn(item, 'value')), false);
  assert.equal(validateCredentialReferenceDocument(document).status, 'passed');
});

test('fake vault creation writes encrypted payload and passes decryptability validation', async () => {
  const result = await createFakeVault({
    requestPath: fakeVaultRequest,
    outputPath: '.tmp/test-fake-vault',
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  const payload = await fs.readFile(path.join(result.outputRoot, 'encrypted-payload.bin'));
  assert.equal(payload.toString('utf8', 0, 1) === '{', false);
  const request = await readJson(path.join(packageRoot, fakeVaultRequest));
  const validation = await validateVaultOutput({
    vaultPath: '.tmp/test-fake-vault',
    passphrase: request.fakePassphraseMaterial
  });
  assert.equal(validation.status, 'passed');
});

test('session vault creation is blocked if passphrase is missing', async () => {
  const result = await createSessionVault({
    outputPath: '.tmp/test-session-vault-missing-passphrase',
    env: {
      ...envWithVault,
      PUMPKIN_HANDOFF_VAULT_PASSPHRASE: ''
    },
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.status, 'blocked');
  await fs.access(path.join(result.outputRoot, 'SESSION_VAULT_BLOCKED.md'));
  await assert.rejects(() => fs.access(path.join(result.outputRoot, 'encrypted-payload.bin')));
});

test('session vault creation encrypts durable API key and excludes admin JWT', async () => {
  const result = await createSessionVault({
    outputPath: '.tmp/test-session-vault-present',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.itemCount, 1);
  assert.equal(result.manifest.excludedItemCount, 1);
  assert.equal(result.manifest.sessionJwtDurableEscrow, false);
  const manifest = await readJson(path.join(result.outputRoot, 'vault-manifest.json'));
  assert.equal(manifest.encryption.algorithm, 'AES-256-GCM');
});

test('handoff package generation passes without vault and validates checksums', async () => {
  const result = await createHandoffPackage({
    registryPath: registryFixture,
    credentialReferencesPath: credentialFixture,
    outputPath: '.tmp/test-handoff',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.includesVault, false);
  await fs.access(path.join(result.outputRoot, 'VAULT_NOT_INCLUDED.md'));
  const validation = await validateHandoffPackage({ handoffPath: '.tmp/test-handoff' });
  assert.equal(validation.status, 'passed');
});

test('handoff package can include encrypted vault under .tmp', async () => {
  await createSessionVault({
    outputPath: '.tmp/test-session-vault-present',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  const result = await createHandoffPackage({
    registryPath: registryFixture,
    credentialReferencesPath: credentialFixture,
    outputPath: '.tmp/test-handoff-with-vault',
    vaultPath: '.tmp/test-session-vault-present',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  assert.equal(result.validation.status, 'passed');
  assert.equal(result.manifest.includesVault, true);
  await fs.access(path.join(result.outputRoot, 'encrypted-vault', 'encrypted-payload.bin'));
});

test('validator rejects registry with plaintext secret-like field', async () => {
  const result = await writeRedactedRegistry({
    fixturesPath: registryFixture,
    outputPath: '.tmp/test-redacted-registry',
    env: envWithVault,
    overwrite: true,
    now: fixedDate
  });
  const registry = await readJson(path.join(result.outputRoot, 'REDACTED_RESOURCE_REGISTRY.json'));
  registry.resources[0].apiKey = 'SHOULD_NOT_BE_HERE';
  const validation = validateRedactedRegistry(registry);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'FORBIDDEN_FIELD'));
});

test('validator rejects credential reference with plaintext value field', () => {
  const document = buildCredentialReferenceDocument({ env: envWithVault, now: fixedDate });
  document.credentialReferences[0].value = 'SHOULD_NOT_BE_HERE';
  const validation = validateCredentialReferenceDocument(document);
  assert.equal(validation.status, 'failed');
  assert(validation.failures.some((failure) => failure.code === 'CREDENTIAL_VALUE_FIELD_PRESENT'));
});

test('output path guard rejects writes outside .tmp', async () => {
  await assert.rejects(
    () =>
      writeRedactedRegistry({
        fixturesPath: registryFixture,
        outputPath: '../unsafe-registry',
        env: envWithVault,
        overwrite: true,
        now: fixedDate
      }),
    /output path must stay inside/
  );
});

test('source avoids external calls and protected config reads', async () => {
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
  const files = await listFilesRecursive(path.join(packageRoot, 'src'));
  for (const filePath of files) {
    const text = await fs.readFile(filePath, 'utf8');
    assert.equal(blockedSourcePattern.test(text), false, filePath);
  }
});

test('CLI creates and inspects a handoff package without printing secrets', async () => {
  await clean('test-cli-handoff');
  const result = await runCli([
    'src/resource-registry-cli.mjs',
    'create-handoff',
    '--registry',
    registryFixture,
    '--credential-references',
    credentialFixture,
    '--out',
    '.tmp/test-cli-handoff',
    '--overwrite'
  ]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /handoff: passed/);
  assert.doesNotMatch(result.stdout, /FAKE_ROLLER/);
  const inspect = await runCli([
    'src/resource-registry-cli.mjs',
    'inspect-handoff',
    '--handoff',
    '.tmp/test-cli-handoff'
  ]);
  assert.equal(inspect.code, 0);
  assert.match(inspect.stdout, /manifestType: pumpkin-resource-handoff-package/);
});

test('.tmp, vault, and handoff artifacts are ignored by package gitignore', async () => {
  const gitignore = await fs.readFile(path.join(packageRoot, '.gitignore'), 'utf8');
  assert.match(gitignore, /^\.tmp\/$/m);
  assert.match(gitignore, /^\*\.zip$/m);
  assert.match(gitignore, /^\*\.vault$/m);
  assert.match(gitignore, /^credential-values\*$/m);
});

async function clean(name) {
  await fs.rm(path.join(packageRoot, '.tmp', name), { recursive: true, force: true });
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
