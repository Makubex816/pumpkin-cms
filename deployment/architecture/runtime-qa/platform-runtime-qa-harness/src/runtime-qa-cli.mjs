#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from './json-writer.mjs';
import { packageRelative, resolveTmpInputPath, resolveTmpOutputPath } from './safe-paths.mjs';
import { inspectRuntimeQaEvidence, runRuntimeQa } from './runtime-qa-runner.mjs';
import { validateRuntimeQaEvidence } from './runtime-qa-validator.mjs';

const safeUploadFiles = [
  'RUNTIME_QA_EVIDENCE_MANIFEST.json',
  'RUNTIME_QA_EVIDENCE_SUMMARY.md',
  'RUNTIME_QA_VALIDATION_RESULT.json',
  'RUNTIME_QA_VALIDATION_RESULT.md'
];

async function main() {
  const [command, ...args] = process.argv.slice(2);
  try {
    if (!command || command === 'help') {
      printHelp();
      return;
    }
    if (command === 'run') {
      await runCommand(args);
      return;
    }
    if (command === 'validate-evidence') {
      await validateEvidenceCommand(args);
      return;
    }
    if (command === 'inspect-evidence') {
      await inspectEvidenceCommand(args);
      return;
    }
    if (command === 'upload-evidence') {
      await uploadEvidenceCommand(args);
      return;
    }
    throw new Error(`unknown command: ${command}`);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  }
}

async function runCommand(args) {
  const options = parseArgs(args);
  const result = await runRuntimeQa({
    registryPath: required(options.registry, '--registry is required'),
    outputPath: required(options.out, '--out is required'),
    overwrite: options.overwrite === true
  });
  console.log(`runtimeQa: ${result.manifest.status}`);
  console.log(`runId: ${result.manifest.runId}`);
  console.log(`output: ${packageRelative(result.outputRoot)}`);
  console.log(`validation: ${result.validation.status}`);
  if (result.manifest.status !== 'passed' || result.validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function validateEvidenceCommand(args) {
  const options = parseArgs(args);
  const evidenceRoot = resolveTmpInputPath(required(options.evidence, '--evidence is required'));
  const manifest = await readJson(path.join(evidenceRoot, 'RUNTIME_QA_EVIDENCE_MANIFEST.json'));
  const validation = validateRuntimeQaEvidence(manifest);
  await writeJson(path.join(evidenceRoot, 'RUNTIME_QA_VALIDATION_RESULT.json'), validation);
  console.log(`validation: ${validation.status}`);
  console.log(`failures: ${validation.summary.failureCount}`);
  console.log(`warnings: ${validation.summary.warningCount}`);
  if (validation.status !== 'passed') {
    process.exitCode = 1;
  }
}

async function inspectEvidenceCommand(args) {
  const options = parseArgs(args);
  const summary = await inspectRuntimeQaEvidence({ evidencePath: required(options.evidence, '--evidence is required') });
  console.log(`runtimeQaEvidence: ${summary.runId}`);
  console.log(`status: ${summary.status}`);
  console.log(`phase: ${summary.phase}`);
  console.log(`environmentMode: ${summary.environmentMode}`);
  console.log(`providerProfileId: ${summary.providerProfileId ?? 'none'}`);
  console.log(`checks: ${summary.checkCount}`);
  console.log(`blocked: ${summary.blockedCount}`);
  console.log(`validation: ${summary.validationStatus}`);
}

async function uploadEvidenceCommand(args) {
  const options = parseArgs(args);
  const evidenceRoot = resolveTmpInputPath(required(options.evidence, '--evidence is required'));
  const account = required(options.account, '--account is required');
  const container = required(options.container, '--container is required');
  const prefix = normalizePrefix(required(options.prefix, '--prefix is required'));
  const manifest = await readJson(path.join(evidenceRoot, 'RUNTIME_QA_EVIDENCE_MANIFEST.json'));
  const validation = validateRuntimeQaEvidence(manifest);

  if (validation.status !== 'passed') {
    throw new Error(`evidence validation failed; upload blocked: ${validation.failures.map((item) => item.code).join(', ')}`);
  }

  if (options['block-reason']) {
    const blocked = {
      status: 'blocked',
      reason: options['block-reason'],
      account,
      container,
      prefix,
      uploadedFiles: [],
      safety: uploadSafetySummary()
    };
    await writeJson(path.join(evidenceRoot, 'RUNTIME_QA_UPLOAD_RESULT.json'), blocked);
    console.log('upload: blocked');
    console.log(`reason: ${options['block-reason']}`);
    return;
  }

  if (options['execute-upload'] !== true) {
    const blocked = {
      status: 'blocked',
      reason: 'explicit --execute-upload flag was not provided',
      account,
      container,
      prefix,
      uploadedFiles: [],
      safety: uploadSafetySummary()
    };
    await writeJson(path.join(evidenceRoot, 'RUNTIME_QA_UPLOAD_RESULT.json'), blocked);
    console.log('upload: blocked');
    console.log('reason: explicit --execute-upload flag was not provided');
    return;
  }

  const containerCheck = runAz([
    'storage',
    'container',
    'show',
    '--account-name',
    account,
    '--name',
    container,
    '--auth-mode',
    'login',
    '--only-show-errors',
    '--output',
    'none'
  ]);

  if (containerCheck.status !== 0) {
    const blocked = {
      status: 'blocked',
      reason: 'Azure Identity/RBAC container show failed; upload not attempted',
      account,
      container,
      prefix,
      uploadedFiles: [],
      safety: uploadSafetySummary()
    };
    await writeJson(path.join(evidenceRoot, 'RUNTIME_QA_UPLOAD_RESULT.json'), blocked);
    console.log('upload: blocked');
    console.log('reason: Azure Identity/RBAC container show failed; upload not attempted');
    process.exitCode = 1;
    return;
  }

  const uploadedFiles = [];
  for (const fileName of safeUploadFiles) {
    const filePath = path.join(evidenceRoot, fileName);
    await fs.access(filePath);
    const blobName = `${prefix}/${fileName}`;
    const upload = runAz([
      'storage',
      'blob',
      'upload',
      '--account-name',
      account,
      '--container-name',
      container,
      '--name',
      blobName,
      '--file',
      filePath,
      '--auth-mode',
      'login',
      '--overwrite',
      'true',
      '--only-show-errors',
      '--output',
      'none'
    ]);
    if (upload.status !== 0) {
      throw new Error(`Azure Identity/RBAC upload failed for ${fileName}`);
    }
    uploadedFiles.push({ file: packageRelative(filePath), blob: blobName });
  }

  const result = {
    status: 'passed',
    account,
    container,
    prefix,
    uploadedFiles,
    safety: uploadSafetySummary()
  };
  await writeJson(path.join(evidenceRoot, 'RUNTIME_QA_UPLOAD_RESULT.json'), result);
  console.log('upload: passed');
  console.log(`uploadedFiles: ${uploadedFiles.length}`);
}

function runAz(args) {
  return spawnSync('az', args, {
    encoding: 'utf8',
    windowsHide: true
  });
}

function uploadSafetySummary() {
  return {
    authMode: 'Azure Identity/RBAC through az --auth-mode login',
    keysListKeys: false,
    connectionStrings: false,
    sasGeneration: false,
    protectedConfigReads: false,
    uploadedFilesAreRedactedEvidenceOnly: true
  };
}

function normalizePrefix(value) {
  const normalized = value.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('--prefix must be a non-empty relative blob prefix without parent segments');
  }
  return normalized;
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === 'overwrite' || key === 'execute-upload') {
      parsed[key] = true;
      continue;
    }
    parsed[key] = args[index + 1];
    index += 1;
  }
  return parsed;
}

function required(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function printHelp() {
  console.log(`Pumpkin Platform Runtime QA Harness

Commands:
  run --registry fixtures/runtime-qa-registry.v2-6-1.fixture.json --out .tmp/v2-6-1-runtime-qa-evidence [--overwrite]
  validate-evidence --evidence .tmp/v2-6-1-runtime-qa-evidence
  inspect-evidence --evidence .tmp/v2-6-1-runtime-qa-evidence
  upload-evidence --evidence .tmp/v2-6-1-runtime-qa-evidence --account pumpkincmsstgolm01 --container runtime-qa-staging --prefix v2-6-1/runtime-qa-evidence-binding [--execute-upload]
  upload-evidence --evidence .tmp/v2-6-1-runtime-qa-evidence --account pumpkincmsstgolm01 --container runtime-qa-staging --prefix v2-6-1/runtime-qa-evidence-binding --block-reason "Azure Identity/RBAC blob list denied"
`);
}

await main();
