import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(scriptDir, 'fixtures', 'media-asset-cases.json');
const fixtures = JSON.parse(readFileSync(fixturePath, 'utf8'));

const allowedMimeExtensions = new Map([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
]);

const terminalStatuses = new Set(['archived', 'replaced', 'deleted-pending']);

const issues = [];

for (const asset of fixtures.assets) {
  validateAsset(asset);
}

for (const reference of fixtures.pageReferences) {
  validateReference(reference, fixtures.assets);
}

for (const upload of fixtures.invalidUploadSamples) {
  const rejected = validateUploadPolicy(upload).some((issue) => issue.severity === 'error');
  if (upload.expected === 'reject' && !rejected) {
    issues.push(error(`invalidUploadSamples.${upload.fileName}`, 'Invalid upload sample was not rejected.'));
  }
}

const errors = issues.filter((issue) => issue.severity === 'error');
const warnings = issues.filter((issue) => issue.severity === 'warning');

if (errors.length > 0) {
  console.error(JSON.stringify({ ok: false, errors, warnings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    ok: true,
    assetCount: fixtures.assets.length,
    referenceCount: fixtures.pageReferences.length,
    warningCount: warnings.length,
    warningCodes: Array.from(new Set(warnings.map((issue) => issue.code))).sort(),
  }, null, 2));
}

function validateAsset(asset) {
  const basePath = `assets.${asset.id || 'unknown'}`;
  const url = stringValue(asset.publicUrl) || stringValue(asset.url);
  if (!asset.id) issues.push(error(`${basePath}.id`, 'MediaAsset id is required.'));
  if (!asset.tenantId) issues.push(error(`${basePath}.tenantId`, 'MediaAsset tenantId is required.'));
  if (!asset.assetId) issues.push(error(`${basePath}.assetId`, 'MediaAsset assetId is required.'));
  if (!url) issues.push(error(`${basePath}.publicUrl`, 'MediaAsset publicUrl/url is required.'));
  if (url && !isSafeUrl(url)) issues.push(error(`${basePath}.publicUrl`, 'MediaAsset publicUrl/url is unsafe.'));
  if (url && /^data:/i.test(url)) issues.push(error(`${basePath}.publicUrl`, 'MediaAsset cannot embed base64 image data.'));
  if (!asset.decorative && !stringValue(asset.altText || asset.alt)) issues.push(warning(`${basePath}.altText`, 'MediaAsset should include alt text unless decorative.'));
  if (!allowedMimeExtensions.has(stringValue(asset.mimeType))) issues.push(error(`${basePath}.mimeType`, 'MediaAsset MIME type is not allowed.'));
  const expectedExtensions = allowedMimeExtensions.get(stringValue(asset.mimeType));
  if (expectedExtensions && !expectedExtensions.has(stringValue(asset.extension).toLowerCase())) {
    issues.push(error(`${basePath}.extension`, 'MediaAsset extension does not match MIME type.'));
  }
  if (!Number.isFinite(asset.width) || !Number.isFinite(asset.height)) issues.push(warning(`${basePath}.dimensions`, 'MediaAsset dimensions should be recorded.'));
  if (!asset.storageProvider) issues.push(error(`${basePath}.storageProvider`, 'MediaAsset storageProvider is required.'));
}

function validateReference(reference, assets) {
  const basePath = `pageReferences.${reference.label}`;
  const url = stringValue(reference.publicUrl) || stringValue(reference.url);
  const asset = assets.find((item) => item.assetId === reference.assetId || item.id === reference.assetId);
  const localIssues = [];

  if (!url) {
    issues.push(warning(`${basePath}.url`, 'Empty media fields were detected.'));
    return;
  }

  if (!isSafeUrl(url)) localIssues.push(error(`${basePath}.url`, 'Referenced media URL is unsafe.'));
  if (!reference.alt && reference.decorative !== true) localIssues.push(warning(`${basePath}.alt`, 'Referenced image is missing alt text.'));

  if (reference.assetId && !asset) {
    localIssues.push(error(`${basePath}.assetId`, 'Referenced MediaAsset does not exist.'));
    flushReferenceIssues(reference, localIssues, basePath);
    return;
  }

  if (asset && asset.tenantId !== reference.tenantId) {
    localIssues.push(error(`${basePath}.tenantId`, 'Cross-tenant MediaAsset reference is blocked.'));
  }
  if (asset && terminalStatuses.has(asset.status)) {
    localIssues.push(warning(`${basePath}.status`, `Referenced MediaAsset is ${asset.status}.`));
  }

  flushReferenceIssues(reference, localIssues, basePath);
}

function flushReferenceIssues(reference, localIssues, basePath) {
  const localErrors = localIssues.filter((issue) => issue.severity === 'error');
  if (reference.expectError) {
    if (localErrors.length === 0) {
      issues.push(error(basePath, 'Expected validation error was not produced.'));
    }
    localIssues
      .filter((issue) => issue.severity !== 'error')
      .forEach((issue) => issues.push(issue));
    return;
  }

  localIssues.forEach((issue) => issues.push(issue));
}

function validateUploadPolicy(upload) {
  const uploadIssues = [];
  const extension = path.extname(upload.fileName).toLowerCase();
  const allowedExtensions = allowedMimeExtensions.get(stringValue(upload.mimeType));
  if (extension === '.svg') uploadIssues.push(error(upload.fileName, 'SVG uploads are blocked.'));
  if (!allowedExtensions) uploadIssues.push(error(upload.fileName, 'MIME type is not allowed.'));
  if (allowedExtensions && !allowedExtensions.has(extension)) uploadIssues.push(error(upload.fileName, 'Extension does not match MIME type.'));
  return uploadIssues;
}

function isSafeUrl(value) {
  const trimmed = stringValue(value).trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (/^http:\/\/localhost(?::\d+)?\//i.test(trimmed)) return true;
  return false;
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function error(pathName, message) {
  return { severity: 'error', code: 'media-validation', path: pathName, message };
}

function warning(pathName, message) {
  return { severity: 'warning', code: 'media-validation-warning', path: pathName, message };
}
