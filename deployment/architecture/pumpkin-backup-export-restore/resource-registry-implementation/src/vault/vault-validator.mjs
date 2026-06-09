import fs from 'node:fs/promises';
import path from 'node:path';
import { validateChecksums } from '../handoff/checksum-writer.mjs';
import { listFilesRecursive, sha256Buffer } from '../utils/file-hash.mjs';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { findSecretLikeData, hasSecretLikeText } from '../utils/secret-scan.mjs';
import { outputRelativePath, resolveTmpInputPath } from '../utils/safe-paths.mjs';
import { decryptVaultPayload, vaultAlgorithm } from './vault-envelope-encryptor.mjs';

const requiredFiles = [
  'vault-manifest.json',
  'encrypted-payload.bin',
  'approval-record.json',
  'recipient-metadata.json',
  'CHECKSUMS.sha256'
];
const reportFiles = new Set(['vault-validation-result.json', 'VAULT_VALIDATION_RESULT.md']);

export async function validateVaultOutput({ vaultPath, passphrase = process.env.PUMPKIN_HANDOFF_VAULT_PASSPHRASE, writeReports = true } = {}) {
  const vaultRoot = resolveTmpInputPath(vaultPath);
  const failures = [];
  const summary = {
    requiredFilesResult: 'not-run',
    manifestResult: 'not-run',
    payloadEncryptedResult: 'not-run',
    decryptabilityResult: passphrase ? 'not-run' : 'skipped',
    checksumResult: 'not-run',
    secretLeakScanResult: 'not-run'
  };

  await checkRequiredFiles(vaultRoot, failures, summary);
  const manifest = await readJsonOrFailure(vaultRoot, 'vault-manifest.json', 'VAULT_MANIFEST_PARSE_ERROR', failures);
  const approval = await readJsonOrFailure(vaultRoot, 'approval-record.json', 'VAULT_APPROVAL_PARSE_ERROR', failures);
  const recipient = await readJsonOrFailure(vaultRoot, 'recipient-metadata.json', 'VAULT_RECIPIENT_PARSE_ERROR', failures);
  await checkManifest(manifest, failures, summary);
  await checkPublicJson(approval, 'approval-record.json', failures);
  await checkPublicJson(recipient, 'recipient-metadata.json', failures);
  await checkEncryptedPayload({ vaultRoot, manifest, passphrase, failures, summary });
  const checksumValidation = await validateChecksums({ root: vaultRoot });
  summary.checksumResult = checksumValidation.status;
  failures.push(...checksumValidation.failures);
  await checkNoPublicSecretLikeValues(vaultRoot, failures, summary);

  const validation = {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-resource-registry-vault-validator',
    generatedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'passed' : 'failed',
    summary,
    failures
  };
  if (writeReports) {
    await writeJson(path.join(vaultRoot, 'vault-validation-result.json'), validation);
    await fs.writeFile(path.join(vaultRoot, 'VAULT_VALIDATION_RESULT.md'), renderVaultValidationMarkdown(validation), 'utf8');
  }
  return validation;
}

export function renderVaultValidationMarkdown(validation) {
  const lines = [
    '# Vault Validation Result',
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

async function checkRequiredFiles(vaultRoot, failures, summary) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(vaultRoot, relativePath));
    } catch {
      missing.push(relativePath);
      failures.push({ code: 'VAULT_REQUIRED_FILE_MISSING', path: relativePath, message: 'required vault file is missing' });
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

async function checkManifest(manifest, failures, summary) {
  if (!manifest) {
    summary.manifestResult = 'failed';
    return;
  }
  const ok =
    manifest.manifestType === 'pumpkin-build-handoff-vault' &&
    manifest.valuesIncluded === false &&
    manifest.plaintextCredentialFilesWritten === false &&
    manifest.protectedConfigRead === false &&
    manifest.externalSystemsTouched === false &&
    manifest.sessionJwtDurableEscrow === false &&
    manifest.encryption?.algorithm === vaultAlgorithm &&
    manifest.encryption?.kdf?.algorithm === 'scrypt' &&
    Boolean(manifest.encryption?.authTag) &&
    Boolean(manifest.encryption?.iv) &&
    Boolean(manifest.encryption?.kdf?.salt);
  if (!ok) {
    failures.push({ code: 'VAULT_MANIFEST_INVALID', path: 'vault-manifest.json', message: 'vault manifest metadata is invalid' });
  }
  summary.manifestResult = ok ? 'passed' : 'failed';
}

async function checkPublicJson(value, relativePath, failures) {
  if (!value) return;
  for (const hit of findSecretLikeData(value)) {
    failures.push({ code: hit.kind === 'field' ? 'VAULT_PUBLIC_FORBIDDEN_FIELD' : 'VAULT_PUBLIC_SECRET_LIKE_VALUE', path: `${relativePath}:${hit.path}`, message: 'public vault metadata must not contain secret-like data' });
  }
}

async function checkEncryptedPayload({ vaultRoot, manifest, passphrase, failures, summary }) {
  const payloadPath = path.join(vaultRoot, 'encrypted-payload.bin');
  let ciphertext;
  try {
    ciphertext = await fs.readFile(payloadPath);
  } catch (error) {
    failures.push({ code: 'VAULT_PAYLOAD_MISSING', path: 'encrypted-payload.bin', message: error.message });
    summary.payloadEncryptedResult = 'failed';
    return;
  }
  const start = ciphertext.toString('utf8', 0, Math.min(ciphertext.length, 32)).trimStart();
  if (start.startsWith('{') || start.startsWith('[')) {
    failures.push({ code: 'VAULT_PAYLOAD_PLAINTEXT_JSON', path: 'encrypted-payload.bin', message: 'encrypted payload must not be plaintext JSON' });
  }
  if (manifest?.encryption?.ciphertextBytes !== ciphertext.length) {
    failures.push({ code: 'VAULT_PAYLOAD_SIZE_MISMATCH', path: 'encrypted-payload.bin', message: 'ciphertext byte count does not match manifest' });
  }
  if (manifest?.encryption?.ciphertextSha256 !== sha256Buffer(ciphertext)) {
    failures.push({ code: 'VAULT_PAYLOAD_HASH_MISMATCH', path: 'encrypted-payload.bin', message: 'ciphertext hash does not match manifest' });
  }
  summary.payloadEncryptedResult = failures.some((failure) => failure.code.startsWith('VAULT_PAYLOAD_')) ? 'failed' : 'passed';

  if (!passphrase || !manifest) return;
  try {
    const decrypted = decryptVaultPayload({ ciphertext, manifest, passphrase });
    if (decrypted?.payloadType !== 'pumpkin-build-handoff-vault-payload') {
      failures.push({ code: 'VAULT_DECRYPTED_PAYLOAD_INVALID', path: 'encrypted-payload.bin', message: 'decrypted payload contract is invalid' });
    }
    summary.decryptabilityResult = failures.some((failure) => failure.code.startsWith('VAULT_DECRYPT')) ? 'failed' : 'passed';
  } catch (error) {
    failures.push({ code: 'VAULT_DECRYPT_FAILED', path: 'encrypted-payload.bin', message: error.message });
    summary.decryptabilityResult = 'failed';
  }
}

async function checkNoPublicSecretLikeValues(vaultRoot, failures, summary) {
  const hits = [];
  const files = await listFilesRecursive(vaultRoot).catch(() => []);
  for (const filePath of files) {
    const relativePath = outputRelativePath(vaultRoot, filePath);
    if (relativePath === 'encrypted-payload.bin' || reportFiles.has(relativePath)) continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (hasSecretLikeText(line)) {
        hits.push({ path: relativePath, line: index + 1 });
      }
    }
  }
  for (const hit of hits) {
    failures.push({ code: 'VAULT_PUBLIC_SECRET_LIKE_TEXT', path: hit.path, message: `secret-like text at line ${hit.line}` });
  }
  summary.secretLeakScanResult = hits.length === 0 ? 'passed' : 'failed';
}
