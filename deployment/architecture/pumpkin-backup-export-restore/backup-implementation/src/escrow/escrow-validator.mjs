import fs from 'node:fs/promises';
import path from 'node:path';
import { listFilesRecursive } from '../utils/file-hash.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { bundleRelativePath, resolveTmpBundlePath } from '../utils/safe-paths.mjs';
import { hasSecretLikeValue } from '../validators/backup-validator.mjs';

const requiredFiles = [
  'escrow-manifest.json',
  'encrypted-payload.bin',
  'recipient-metadata.json',
  'escrow-approval-record.json',
  'ESCROW_FAKE_ONLY_NOTICE.md'
];

const generatedReportFiles = new Set(['escrow-validation-result.json', 'ESCROW_VALIDATION_RESULT.md']);

export async function validateEscrowOutput({ escrowPath }) {
  const escrowRoot = resolveTmpBundlePath(escrowPath);
  const failures = [];
  const warnings = [];
  const summary = {
    requiredFilesResult: 'not-run',
    payloadEncryptedResult: 'not-run',
    recipientMetadataResult: 'not-run',
    approvalRecordResult: 'not-run',
    privateKeyResult: 'not-run',
    secretLikeResult: 'not-run'
  };

  await checkRequiredFiles({ escrowRoot, failures, summary });
  const manifest = await readRequiredJson({ escrowRoot, relativePath: 'escrow-manifest.json', code: 'ESCROW_MANIFEST_PARSE_ERROR', failures });
  const recipient = await readRequiredJson({ escrowRoot, relativePath: 'recipient-metadata.json', code: 'ESCROW_RECIPIENT_PARSE_ERROR', failures });
  const approval = await readRequiredJson({ escrowRoot, relativePath: 'escrow-approval-record.json', code: 'ESCROW_APPROVAL_PARSE_ERROR', failures });

  await checkManifest({ manifest, failures });
  await checkRecipient({ recipient, failures, summary });
  await checkApproval({ approval, failures, summary });
  await checkEncryptedPayload({ escrowRoot, manifest, failures, summary });
  await checkNoPrivateKeys({ escrowRoot, failures, summary });
  await checkNoSecretLikeValues({ escrowRoot, failures, summary });

  return {
    schemaVersion: '0.1.0',
    validator: 'pumpkin-backup-center-local-escrow-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    generatedAt: new Date().toISOString(),
    fakeOnly: true,
    summary,
    warnings,
    failures
  };
}

async function checkRequiredFiles({ escrowRoot, failures, summary }) {
  const missing = [];
  for (const relativePath of requiredFiles) {
    try {
      await fs.access(path.join(escrowRoot, relativePath));
    } catch {
      missing.push(relativePath);
      failures.push({ code: 'ESCROW_REQUIRED_FILE_MISSING', path: relativePath, message: 'required fake escrow output file is missing' });
    }
  }
  summary.requiredFilesResult = missing.length === 0 ? 'passed' : 'failed';
}

async function readRequiredJson({ escrowRoot, relativePath, code, failures }) {
  try {
    return await readJson(path.join(escrowRoot, relativePath));
  } catch (error) {
    failures.push({ code, path: relativePath, message: error.message });
    return null;
  }
}

async function checkManifest({ manifest, failures }) {
  if (!manifest) return;
  if (manifest.fakeOnly !== true || manifest.mode !== 'recovery_escrow') {
    failures.push({ code: 'ESCROW_MANIFEST_INVALID', path: 'escrow-manifest.json', message: 'manifest must be fake recovery escrow' });
  }
  if (manifest.boundaries?.realSecretExport !== false || manifest.boundaries?.privateKeyWritten !== false) {
    failures.push({ code: 'ESCROW_BOUNDARY_INVALID', path: 'escrow-manifest.json', message: 'manifest boundaries must reject real secret export and private-key persistence' });
  }
  if (manifest.encryption?.contentEncryption?.algorithm !== 'AES-256-GCM') {
    failures.push({ code: 'ESCROW_ENCRYPTION_INVALID', path: 'escrow-manifest.json', message: 'content encryption algorithm must be AES-256-GCM' });
  }
  if (manifest.encryption?.keyWraps?.[0]?.algorithm !== 'RSA-OAEP-256') {
    failures.push({ code: 'ESCROW_KEY_WRAP_INVALID', path: 'escrow-manifest.json', message: 'key wrap algorithm must be RSA-OAEP-256' });
  }
}

async function checkRecipient({ recipient, failures, summary }) {
  if (!recipient) {
    summary.recipientMetadataResult = 'failed';
    return;
  }
  const ok =
    recipient.fakeOnly === true &&
    recipient.publicKeySource === 'generated-at-runtime' &&
    recipient.privateKeyPersistence === 'not-written' &&
    recipient.publicKeyJwk &&
    !recipient.privateKeyPem;
  if (!ok) {
    failures.push({ code: 'ESCROW_RECIPIENT_INVALID', path: 'recipient-metadata.json', message: 'recipient metadata must contain generated public metadata only' });
  }
  summary.recipientMetadataResult = ok ? 'passed' : 'failed';
}

async function checkApproval({ approval, failures, summary }) {
  if (!approval) {
    summary.approvalRecordResult = 'failed';
    return;
  }
  const ok =
    approval.fakeOnly === true &&
    approval.realSecretsApproved === false &&
    approval.protectedConfigApproved === false &&
    approval.productionEscrowApproved === false &&
    Boolean(approval.approvalId);
  if (!ok) {
    failures.push({ code: 'ESCROW_APPROVAL_INVALID', path: 'escrow-approval-record.json', message: 'fake approval record is invalid' });
  }
  summary.approvalRecordResult = ok ? 'passed' : 'failed';
}

async function checkEncryptedPayload({ escrowRoot, manifest, failures, summary }) {
  const payloadPath = path.join(escrowRoot, 'encrypted-payload.bin');
  let payload;
  try {
    payload = await fs.readFile(payloadPath);
  } catch (error) {
    failures.push({ code: 'ESCROW_PAYLOAD_MISSING', path: 'encrypted-payload.bin', message: error.message });
    summary.payloadEncryptedResult = 'failed';
    return;
  }
  const trimmed = payload.toString('utf8', 0, Math.min(payload.length, 64)).trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    failures.push({ code: 'ESCROW_PAYLOAD_PLAINTEXT', path: 'encrypted-payload.bin', message: 'encrypted payload must not be plaintext JSON' });
  }
  if (payload.length === 0 || manifest?.encryption?.ciphertextBytes !== payload.length) {
    failures.push({ code: 'ESCROW_PAYLOAD_SIZE_INVALID', path: 'encrypted-payload.bin', message: 'encrypted payload size does not match manifest' });
  }
  summary.payloadEncryptedResult = failures.some((failure) => failure.code.startsWith('ESCROW_PAYLOAD_')) ? 'failed' : 'passed';
}

async function checkNoPrivateKeys({ escrowRoot, failures, summary }) {
  const files = await listFilesRecursive(escrowRoot).catch(() => []);
  const privateTextPattern = new RegExp('-----BEGIN .*PRIVATE ' + 'KEY-----');
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(escrowRoot, filePath);
    const lower = relativePath.toLowerCase();
    if (/private[-_]?key|\.pem$|\.pfx$|\.key$/.test(lower)) {
      hits.push(relativePath);
      continue;
    }
    if (relativePath === 'encrypted-payload.bin') continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    if (privateTextPattern.test(text)) {
      hits.push(relativePath);
    }
  }
  for (const hit of hits) {
    failures.push({ code: 'ESCROW_PRIVATE_KEY_PRESENT', path: hit, message: 'private-key material must not be written' });
  }
  summary.privateKeyResult = hits.length === 0 ? 'passed' : 'failed';
}

async function checkNoSecretLikeValues({ escrowRoot, failures, summary }) {
  const files = await listFilesRecursive(escrowRoot).catch(() => []);
  const hits = [];
  for (const filePath of files) {
    const relativePath = bundleRelativePath(escrowRoot, filePath);
    if (relativePath === 'encrypted-payload.bin' || generatedReportFiles.has(relativePath)) continue;
    const text = await fs.readFile(filePath, 'utf8').catch(() => '');
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (hasSecretLikeValue(line)) {
        hits.push({ path: relativePath, line: index + 1 });
      }
    }
  }
  for (const hit of hits) {
    failures.push({ code: 'ESCROW_SECRET_LIKE_VALUE', path: hit.path, message: `secret-like value pattern at line ${hit.line}` });
  }
  summary.secretLikeResult = hits.length === 0 ? 'passed' : 'failed';
}
