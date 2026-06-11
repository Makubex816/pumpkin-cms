import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { findSecretLikeData } from '../src/secret-scan.mjs';
import { packageRoot } from '../src/safe-paths.mjs';
import { readJson } from '../src/json-writer.mjs';
import { runRuntimeQa } from '../src/runtime-qa-runner.mjs';
import { validateRuntimeQaEvidence, validateRuntimeQaRegistry } from '../src/runtime-qa-validator.mjs';

test('V2.6.1 registry fixture validates required platform checks', async () => {
  const registry = await readJson(path.join(packageRoot, 'fixtures/runtime-qa-registry.v2-6-1.fixture.json'));
  const validation = validateRuntimeQaRegistry(registry);
  assert.equal(validation.status, 'passed');
  assert.equal(validation.summary.failureCount, 0);
});

test('runtime QA runner writes valid ignored evidence', async () => {
  const out = '.tmp/test-runtime-qa-evidence';
  const result = await runRuntimeQa({
    registryPath: 'fixtures/runtime-qa-registry.v2-6-1.fixture.json',
    outputPath: out,
    overwrite: true
  });
  assert.equal(result.manifest.status, 'passed');
  assert.equal(result.validation.status, 'passed');

  const manifestPath = path.join(packageRoot, out, 'RUNTIME_QA_EVIDENCE_MANIFEST.json');
  const manifest = await readJson(manifestPath);
  const validation = validateRuntimeQaEvidence(manifest);
  assert.equal(validation.status, 'passed');
  assert.ok(manifest.artifactPaths.every((artifactPath) => artifactPath.includes('.tmp/')));

  await fs.rm(path.join(packageRoot, out), { recursive: true, force: true });
});

test('evidence validator blocks production-runtime activation', async () => {
  const result = await runRuntimeQa({
    registryPath: 'fixtures/runtime-qa-registry.v2-6-1.fixture.json',
    outputPath: '.tmp/test-runtime-qa-production-block',
    overwrite: true
  });
  const manifest = structuredClone(result.manifest);
  manifest.environmentMode = 'production-runtime';
  const validation = validateRuntimeQaEvidence(manifest);
  assert.equal(validation.status, 'failed');
  assert.ok(validation.failures.some((failure) => failure.code === 'PRODUCTION_RUNTIME_ENVIRONMENT_BLOCKED'));
  await fs.rm(path.join(packageRoot, '.tmp/test-runtime-qa-production-block'), { recursive: true, force: true });
});

test('secret-like values are rejected without storing sample credentials', () => {
  const forbiddenKey = `access_${'token'}`;
  const hits = findSecretLikeData({ [forbiddenKey]: 'REDACTED' });
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kind, 'field');
});
