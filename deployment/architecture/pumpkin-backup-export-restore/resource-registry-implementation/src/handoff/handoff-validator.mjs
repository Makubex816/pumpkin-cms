import fs from 'node:fs/promises';
import path from 'node:path';
import { validateCredentialReferenceDocument } from '../credentials/credential-reference-writer.mjs';
import { validateChecksums } from './checksum-writer.mjs';
import { listFilesRecursive } from '../utils/file-hash.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { hasSecretLikeText } from '../utils/secret-scan.mjs';
import { outputRelativePath, resolveTmpInputPath } from '../utils/safe-paths.mjs';
import { validateRedactedRegistry } from '../registry/resource-entry-normalizer.mjs';
import { validateVaultOutput } from '../vault/vault-validator.mjs';

const requiredFiles = [
  'manifest.json',
  'REDACTED_RESOURCE_REGISTRY.json',
  'RESOURCE_REGISTRY_SUMMARY.md',
  'RESOURCE_TO_TENANT_MAP.md',
  'RUNTIME_PROFILE_MAP.md',
  'REQUIRED_SECRET_REFERENCES.json',
  'ROTATION_AND_CLEANUP.md',
  'CHECKSUMS.sha256'
];
const generatedReports = new Set(['validation-result.json', 'VALIDATION_RESULT.md']);

export async function validateHandoffPackage({ handoffPath, passphrase = process.env.PUMPKIN_HANDOFF_VAULT_PASSPHRASE, writeReports = true } = {}) {
  const handoffRoot = resolveTmpInputPath(handoffPath);
  const failures = [];
  const summary = {
    requiredFilesResult: 'not-run',
    registryResult: 'not-run',
    credentialReferenceResult: 'not-run',
    vaultResult: 'not-run',
    checksumResult: 'not-run',
    secretLeakScanResult: 'not-run'
  };
  await checkRequiredFiles(handoffRoot, failures, summary);
  const registry = await readJsonOrFailure(handoffRoot, 'REDACTED_RESOURCE_REGISTRY.json', 'HANDOFF_REGISTRY_PARSE_ERROR', failures);
  const credentialRefs = await readJsonOrFailure(handoffRoot, 'REQUIRED_SECRET_REFERENCES.json', 'HANDOFF_CREDENTIAL_REFERENCES_PARSE_ERROR', failures);
  if (registry) {
    const validation = validateRedactedRegistry(registry);
    summary.registryResult = validation.status;
    failures.push(...validation.failures.map((failure) => ({ ...failure, code: `REGISTRY_${failure.code}` })));
  } else {
    summary.registryResult = 'failed';
  }
  if (credentialRefs) {
    const validation = validateCredentialReferenceDocument(credentialRefs);
    summary.credentialReferenceResult = validation.status;
    failures.push(...validation.failures.map((failure) => ({ ...failure, code: `CREDENTIAL_${failure.code}` })));
  } else {
    summary.credentialReferenceResult = 'failed';
  }
  const vaultExists = await exists(path.join(handoffRoot, 'encrypted-vault'));
  if (vaultExists) {
    const vaultValidation = await validateVaultOutput({
      vaultPath: `${handoffPath.replace(/[\\/]$/, '')}/encrypted-vault`,
      passphrase,
      writeReports: false
    });
    summary.vaultResult = vaultValidation.status;
    failures.push(...vaultValidation.failures.map((failure) => ({ ...failure, code: `VAULT_${failure.code}` })));
  } else {
    const markerExists = await exists(path.join(handoffRoot, 'VAULT_NOT_INCLUDED.md'));
    summary.vaultResult = markerExists ? 'not-included' : 'failed';
    if (!markerExists) {
      failures.push({ code: 'VAULT_MARKER_MISSING', path: 'VAULT_NOT_INCLUDED.md', message: 'vault absent marker is required when encrypted vault is not included' });
    }
  }
  const checksumValidation = await validateChecksums({ root: handoffRoot });
  summary.checksumResult = checksumValidation.status;
  failures.push(...checksumValidation.failures);
  await checkNoPublicSecretLikeValues(handoffRoot, failures, summary);

  const validation = {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-resource-registry-handoff-validator',
    generatedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'passed' : 'failed',
    summary,
    failures
  };
  if (writeReports) {
    await writeJson(path.join(handoffRoot, 'validation-result.json'), validation);
    await fs.writeFile(path.join(handoffRoot, 'VALIDATION_RESULT.md'), renderHandoffValidationMarkdown(validation), 'utf8');
  }
  return validation;
}

export function renderHandoffValidationMarkdown(validation) {
  const lines = [
    '# Handoff Validation Result',
    '',
    `Status: ${validation.status}`,
    '',
    '| Check | Result |',
    '| --- | --- |'
  ];
  for (const [key, value] of Object.entries(validation.summary)) {
    lines.push(`| ${key} | ${value} |`);
  }
  lines.push('', '| Code | Path | Message |', '| --- | --- | --- |');
  if (validation.failures.length === 0) {
    lines.push('| none | none | No failures. |');
  } else {
    for (const failure of validation.failures) {
      lines.push(`| ${failure.code} | ${failure.path} | ${failure.message} |`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}`;
}

async function checkRequiredFiles(handoffRoot, failures, summary) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(handoffRoot, relativePath));
    } catch {
      missing.push(relativePath);
      failures.push({ code: 'HANDOFF_REQUIRED_FILE_MISSING', path: relativePath, message: 'required handoff file is missing' });
    }
  }
  summary.requiredFilesResult = missing.length === 0 ? 'passed' : 'failed';
}

async function readJsonOrFailure(root, relativePath, code, failures) {
  try {
    return await readJson(path.join(root, relativePath));
  } catch (error) {
    failures.push({ code, path: relativePath, message: error.message });
    return null;
  }
}

async function checkNoPublicSecretLikeValues(handoffRoot, failures, summary) {
  const files = await listFilesRecursive(handoffRoot).catch(() => []);
  const hits = [];
  for (const filePath of files) {
    const relativePath = outputRelativePath(handoffRoot, filePath);
    if (
      relativePath === 'encrypted-vault/encrypted-payload.bin' ||
      relativePath.startsWith('encrypted-vault/') ||
      generatedReports.has(relativePath)
    ) {
      continue;
    }
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (hasSecretLikeText(line)) {
        hits.push({ path: relativePath, line: index + 1 });
      }
    }
  }
  for (const hit of hits) {
    failures.push({ code: 'HANDOFF_SECRET_LIKE_TEXT', path: hit.path, message: `secret-like text at line ${hit.line}` });
  }
  summary.secretLeakScanResult = hits.length === 0 ? 'passed' : 'failed';
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
