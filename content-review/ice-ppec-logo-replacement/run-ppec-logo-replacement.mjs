#!/usr/bin/env node
import crypto from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outputRel = 'content-review/ice-ppec-logo-replacement';
const outputDir = path.join(repoRoot, outputRel);
const inputRel = 'content-review/ice-ppec-logo-replacement-input';
const inputDir = path.join(repoRoot, inputRel);
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const publicEmailDisplayPolicy = 'form-first-under-review';
const oldPpecLogoId = 'ice-rink-rentals-ppec-wordmark-card-d28c10b570d1';
const oldPpecAssetId = 'ppec-wordmark-card-d28c10b570d1';
const oldPpecPublicUrl = '/media/ice-rink-rentals/2026/06/ppec-wordmark-card-d28c10b570d1.png';
const legacyMailbox = 'contactus@iceskatingrinkrentals.com';
const changeSource = 'ppec_logo_replacement_homepage_import';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const sourceCandidateRel = 'content-review/ice-ppec-visual-brand-repair/APPROVED_HOMEPAGE_PPEC_VISUAL_REPAIR_CANDIDATE.json';
const sourcePackageRel = 'content-review/ice-ppec-visual-brand-repair/APPROVED_HOMEPAGE_PPEC_VISUAL_REPAIR_PACKAGE.json';
const replacedCandidateRel = `${outputRel}/APPROVED_HOMEPAGE_PPEC_LOGO_REPLACED_CANDIDATE.json`;
const replacedPackageRel = `${outputRel}/APPROVED_HOMEPAGE_PPEC_LOGO_REPLACED_PACKAGE.json`;
const rootReportRel = 'PUMPKIN_ICE_PPEC_LOGO_REPLACEMENT_REPORT.md';
const now = new Date().toISOString();

const metadata = {
  title: 'Party Pros East Coast Logo',
  altText: 'Party Pros East Coast logo',
  caption: 'Official Party Pros East Coast logo for partner/resource callout.',
  description: 'Logo used for the Party Pros East Coast partner/resource section on the Ice Rink Rentals homepage.',
  usageType: 'partner-logo',
  mediaSlot: 'ppecPartnerLogo',
  tags: ['ppec', 'party-pros-east-coast', 'partner-logo', 'event-rentals'],
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.ppec-logo-replacement.v1',
  generatedAt: now,
  tenantId,
  siteKey,
  domain,
  branch: git(['branch', '--show-current']),
  head: git(['rev-parse', '--short', 'HEAD']),
  start: {
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempJwtInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    presence: 'MISSING',
    validation: 'MISSING',
    source: 'none',
    tokenPrinted: false,
    tempJwtDeletedAfterSuccess: false,
    tempJwtRetainedOnFailure: false,
    tempJwtFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  logoInput: {
    folder: inputRel,
    selectedFile: '',
    audit: null,
  },
  currentBinding: {
    expectedOldMediaAssetId: oldPpecLogoId,
    sourceCandidateContainsOldId: false,
    currentHomepageContainsOldIdBeforeImport: false,
  },
  baseline: {},
  mediaAsset: {
    listAttempted: false,
    uploadAttempted: false,
    patchAttempted: false,
    readbackAttempted: false,
    created: false,
    reused: false,
    id: '',
    assetId: '',
    publicUrl: '',
    status: '',
    usageType: '',
    usageStatus: '',
    licenseStatus: '',
    storageProvider: '',
    checksum: '',
    sourceFile: '',
    result: 'not-run',
    blockers: [],
  },
  binding: {
    attempted: false,
    oldMediaAssetId: oldPpecLogoId,
    newMediaAssetId: '',
    candidateCreated: false,
    packageCreated: false,
    ppecReferenceReplacements: 0,
    oldIdStillPresent: false,
    oldIdPresentInActivePpecSection: false,
    otherHomepageMediaIdsPreserved: false,
    ppecCopyCtaPreserved: false,
    selectedMailboxPreserved: false,
    publicEmailPolicyPreserved: false,
  },
  validation: {
    results: {},
    blockers: [],
  },
  import: {
    attempted: false,
    performed: false,
    httpStatus: null,
    skippedReason: '',
  },
  readback: {
    performed: false,
    verification: {},
    blockers: [],
  },
  untouched: {
    contactUnchanged: null,
    serviceAreasUnchangedOr404: null,
    themeUnchanged: null,
    mediaAssetsUnchangedExceptPpecLogo: null,
  },
  frontend: {
    checked: false,
    previewUrl: `${webBase}/__preview/${tenantId}/home`,
    status: null,
    length: null,
    clientShell: null,
    containsNewMediaAssetId: false,
    note: '',
  },
  hygiene: {
    results: {},
    blockers: [],
  },
  safety: {
    cmsHomepageWrite: false,
    cmsContactWrite: false,
    serviceAreasWrite: false,
    stateCityCreated: false,
    themeWrite: false,
    mediaAssetWrites: 'new-or-reused-ppec-logo-record-only',
    staticGeneration: false,
    deployment: false,
    dnsEmailProviderAction: false,
    emailSent: false,
    rollerTouched: false,
    protectedConfigRead: false,
    imageGenerationUsed: false,
    imageContentsModified: false,
    screenshotOrImageRenderingUsed: false,
    azureUpload: false,
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });
  try {
    state.start.api = await probe(`${apiBase}/`);
    state.logoInput.audit = validateLogoInput();
    if (!state.start.api.reachable) state.blockers.push('Local API is not reachable at http://localhost:5064.');
    if (!state.logoInput.audit.ok) state.blockers.push('Logo input validation failed.');
    if (!existsSync(path.join(repoRoot, sourceCandidateRel))) state.blockers.push('Source PPEC visual repair candidate is missing.');
    if (!existsSync(path.join(repoRoot, sourcePackageRel))) state.blockers.push('Source PPEC visual repair package is missing.');

    if (!state.blockers.length) {
      const sourceCandidate = readJson(sourceCandidateRel);
      state.currentBinding.sourceCandidateContainsOldId = JSON.stringify(sourceCandidate).includes(oldPpecLogoId);
      if (!state.currentBinding.sourceCandidateContainsOldId) {
        state.blockers.push(`Source candidate does not contain expected old PPEC logo MediaAsset ID ${oldPpecLogoId}.`);
      }
    }

    if (!state.blockers.length) {
      loadJwt();
      console.log(`AUTH_PRESENT=${state.auth.presence}`);
      if (state.auth.presence === 'PRESENT') {
        await validateJwt();
        console.log(`AUTH_VALIDATION=${state.auth.validation}`);
      }
      if (state.auth.presence !== 'PRESENT' || state.auth.validation !== 'VALID') {
        state.blockers.push('Admin auth missing or invalid; stopped before CMS writes.');
      }
    }

    if (!state.blockers.length) {
      await captureBaseline();
      state.currentBinding.currentHomepageContainsOldIdBeforeImport = JSON.stringify(state.baseline.homepage?.json || {}).includes(oldPpecLogoId);
      await createOrReusePpecLogoMediaAsset();
      buildReplacedHomepageCandidate();
      runPreImportValidation();
      if (state.validation.blockers.length) {
        state.import.skippedReason = 'Validation blockers present; stopped before homepage CMS write.';
      } else {
        await importHomepageOnly();
        if (state.import.performed) {
          await postWriteVerification();
          await probeFrontendPreview();
        }
      }
    }
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  state.blockers.push(...state.validation.blockers, ...state.readback.blockers, ...state.hygiene.blockers);
  writeReports();
  state.hygiene.results.final = runFinalHygieneChecks();
  if (!state.hygiene.results.final.ok) {
    state.hygiene.blockers.push('Final hygiene checks failed.');
    state.blockers.push('Final hygiene checks failed.');
  }

  state.success = state.blockers.length === 0
    && state.import.performed === true
    && state.readback.verification.ok === true
    && state.hygiene.results.final?.ok === true;

  if (state.success && existsSync(tempJwtPath)) {
    rmSync(tempJwtPath, { force: true });
    state.auth.tempJwtDeletedAfterSuccess = true;
  } else {
    state.auth.tempJwtRetainedOnFailure = existsSync(tempJwtPath) && !state.success;
  }
  state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  writeReports();

  console.log(JSON.stringify({
    success: state.success,
    blockers: [...new Set(state.blockers)],
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    logo: {
      file: state.logoInput.audit?.relativePath || '',
      ok: state.logoInput.audit?.ok === true,
      sizeBytes: state.logoInput.audit?.sizeBytes,
      width: state.logoInput.audit?.width,
      height: state.logoInput.audit?.height,
    },
    mediaAsset: {
      created: state.mediaAsset.created,
      reused: state.mediaAsset.reused,
      id: state.mediaAsset.id,
      assetId: state.mediaAsset.assetId,
      publicUrl: state.mediaAsset.publicUrl,
    },
    homepageImport: {
      attempted: state.import.attempted,
      performed: state.import.performed,
      httpStatus: state.import.httpStatus,
    },
    preview: {
      url: state.frontend.previewUrl,
      status: state.frontend.status,
      clientShell: state.frontend.clientShell,
    },
    report: rootReportRel,
  }, null, 2));

  if (!state.success) process.exitCode = 1;
}

function validateLogoInput() {
  const audit = {
    ok: false,
    folderExists: existsSync(inputDir),
    selectedFile: '',
    relativePath: '',
    extension: '',
    mimeType: '',
    safeFileName: false,
    pathTraversalSafe: false,
    localSourceOnly: false,
    sizeBytes: 0,
    sha256: '',
    width: null,
    height: null,
    blockers: [],
  };
  if (!audit.folderExists) {
    audit.blockers.push('input-folder-missing');
    return audit;
  }

  const candidates = readdirSafe(inputDir)
    .filter((file) => ['.png', '.svg', '.webp'].includes(path.extname(file).toLowerCase()))
    .sort((a, b) => scoreLogoName(b) - scoreLogoName(a) || a.localeCompare(b));
  if (!candidates.length) {
    audit.blockers.push('no-logo-file-present');
    return audit;
  }

  const fileName = candidates[0];
  state.logoInput.selectedFile = fileName;
  audit.selectedFile = fileName;
  audit.relativePath = `${inputRel}/${fileName}`;
  audit.extension = path.extname(fileName).toLowerCase();
  audit.safeFileName = /^[A-Za-z0-9._-]+$/.test(fileName) && !fileName.includes('..');
  const absolutePath = path.resolve(inputDir, fileName);
  audit.pathTraversalSafe = absolutePath.startsWith(path.resolve(inputDir) + path.sep);
  audit.localSourceOnly = absolutePath.startsWith(repoRoot);

  if (!audit.safeFileName) audit.blockers.push('unsafe-filename');
  if (!audit.pathTraversalSafe) audit.blockers.push('path-traversal');
  if (!audit.localSourceOnly) audit.blockers.push('not-local-repo-source');

  const stat = existsSync(absolutePath) ? statSync(absolutePath) : null;
  if (!stat || !stat.isFile()) {
    audit.blockers.push('selected-logo-not-a-file');
  } else {
    audit.sizeBytes = stat.size;
    if (stat.size <= 0) audit.blockers.push('empty-file');
    const bytes = readFileSync(absolutePath);
    audit.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const inspected = inspectImage(bytes, audit.extension);
    audit.mimeType = inspected.mimeType;
    audit.width = inspected.width;
    audit.height = inspected.height;
    if (!inspected.ok) audit.blockers.push(inspected.error || 'invalid-image-signature');
  }

  audit.ok = audit.blockers.length === 0;
  return audit;
}

function inspectImage(bytes, extension) {
  if (extension === '.png') {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    const ok = bytes.length >= 24 && signature.every((byte, index) => bytes[index] === byte);
    return ok
      ? { ok: true, mimeType: 'image/png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
      : { ok: false, mimeType: 'application/octet-stream', width: null, height: null, error: 'invalid-png-signature' };
  }
  if (extension === '.webp') {
    const ok = bytes.length > 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    return { ok, mimeType: ok ? 'image/webp' : 'application/octet-stream', width: null, height: null, error: ok ? '' : 'invalid-webp-signature' };
  }
  if (extension === '.svg') {
    const text = bytes.toString('utf8', 0, Math.min(bytes.length, 4096));
    const ok = /<svg[\s>]/i.test(text) && !/<script\b/i.test(text);
    const viewBox = text.match(/\bviewBox=["']\s*[-.\d]+\s+[-.\d]+\s+([.\d]+)\s+([.\d]+)\s*["']/i);
    return {
      ok,
      mimeType: ok ? 'image/svg+xml' : 'application/octet-stream',
      width: viewBox ? Number(viewBox[1]) : null,
      height: viewBox ? Number(viewBox[2]) : null,
      error: ok ? '' : 'invalid-or-unsafe-svg',
    };
  }
  return { ok: false, mimeType: 'application/octet-stream', width: null, height: null, error: 'unsupported-extension' };
}

function loadJwt() {
  const envToken = process.env.PUMPKIN_ADMIN_JWT?.trim();
  if (envToken) {
    jwt = envToken;
    state.auth.presence = 'PRESENT';
    state.auth.source = 'env';
    return;
  }
  if (existsSync(tempJwtPath)) {
    jwt = readFileSync(tempJwtPath, 'utf8').trim();
    state.auth.presence = jwt ? 'PRESENT' : 'MISSING';
    state.auth.source = jwt ? 'temp' : 'none';
    return;
  }
  state.auth.presence = 'MISSING';
}

async function validateJwt() {
  const result = await apiJson(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET', token: jwt });
  state.auth.validation = result.ok ? 'VALID' : 'INVALID';
  state.auth.validationHttpStatus = result.status;
}

async function captureBaseline() {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);
  state.baseline = {
    homepage: summarizeResponse(homepage),
    contact: summarizeResponse(contact, true),
    serviceAreas: summarizeResponse(serviceAreas, true),
    theme: summarizeResponse(theme, true),
    mediaAssets: summarizeResponse(mediaAssets, true),
    hashes: {
      contact: contact.hash,
      serviceAreas: serviceAreas.hash,
      theme: theme.hash,
      mediaAssets: mediaAssets.hash,
    },
  };
  state.baseline.homepage.json = homepage.json;
  state.baseline.contact.json = contact.json;
  state.baseline.serviceAreas.json = serviceAreas.json;
  state.baseline.theme.json = theme.json;
  state.baseline.mediaAssets.json = mediaAssets.json;
  writeJson(`${outputRel}/current-homepage-before-logo-replacement.snapshot.json`, sanitize(homepage.json || {}));
  writeJson(`${outputRel}/contact-before-logo-replacement.snapshot.json`, sanitize(contact.json || {}));
  writeJson(`${outputRel}/service-areas-before-logo-replacement.snapshot.json`, sanitize(serviceAreas.json || { status: serviceAreas.status }));
  writeJson(`${outputRel}/theme-before-logo-replacement.snapshot.json`, sanitize(theme.json || { status: theme.status }));
  writeJson(`${outputRel}/media-assets-before-logo-replacement.snapshot.json`, sanitize(mediaAssets.json || { status: mediaAssets.status }));
  if (!homepage.ok) state.blockers.push(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!mediaAssets.ok) state.blockers.push(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);
}

async function createOrReusePpecLogoMediaAsset() {
  state.mediaAsset.listAttempted = true;
  const existingAssets = mediaAssetsFrom(state.baseline.mediaAssets?.json);
  const logoAudit = state.logoInput.audit;
  const reusable = findReusableAsset(existingAssets, logoAudit);
  let asset = reusable;
  if (asset) {
    state.mediaAsset.reused = true;
  } else {
    state.mediaAsset.uploadAttempted = true;
    const uploaded = await uploadLogo(logoAudit);
    if (!uploaded.ok) {
      state.mediaAsset.result = 'blocked';
      throw new Error(`PPEC logo MediaAsset upload failed with HTTP ${uploaded.status}.`);
    }
    state.mediaAsset.created = true;
    asset = uploaded.json;
  }

  const patched = await patchMediaAssetMetadata(asset);
  if (!patched.ok) {
    state.mediaAsset.result = 'blocked';
    throw new Error(`PPEC logo MediaAsset metadata patch failed with HTTP ${patched.status}.`);
  }
  const patchedAsset = patched.json;
  const id = mediaId(patchedAsset);
  state.mediaAsset.readbackAttempted = true;
  const readback = await apiJson(`/api/admin/${tenantId}/media-assets/${encodeURIComponent(id)}`, { method: 'GET', token: jwt });
  if (!readback.ok) {
    state.mediaAsset.result = 'blocked';
    throw new Error(`PPEC logo MediaAsset readback failed with HTTP ${readback.status}.`);
  }
  const normalized = safeAssetSummary(readback.json);
  state.mediaAsset.id = normalized.id;
  state.mediaAsset.assetId = normalized.assetId;
  state.mediaAsset.publicUrl = normalized.publicUrl;
  state.mediaAsset.status = normalized.status;
  state.mediaAsset.usageType = normalized.usageType;
  state.mediaAsset.usageStatus = normalized.usageStatus;
  state.mediaAsset.licenseStatus = normalized.licenseStatus;
  state.mediaAsset.storageProvider = normalized.storageProvider;
  state.mediaAsset.checksum = normalized.checksum;
  state.mediaAsset.sourceFile = logoAudit.relativePath;
  state.mediaAsset.result = 'completed';

  const checks = {
    idPresent: Boolean(normalized.id),
    notOldIncorrectId: normalized.id !== oldPpecLogoId,
    tenantSite: normalized.tenantId === tenantId && normalized.siteKey === siteKey,
    checksum: normalized.checksum === logoAudit.sha256,
    storageProvider: normalized.storageProvider === 'local-dev',
    usageType: normalized.usageType === metadata.usageType,
    statusAllowed: ['draft', 'active'].includes(normalized.status),
    publicUrlLocal: normalized.publicUrl.startsWith('/media/'),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  if (failed.length) {
    state.mediaAsset.blockers.push(...failed);
    throw new Error(`PPEC logo MediaAsset verification failed: ${failed.join(', ')}.`);
  }
}

function findReusableAsset(assets, logoAudit) {
  const candidates = assets.filter((asset) => {
    const normalized = safeAssetSummary(asset);
    if (normalized.id === oldPpecLogoId) return false;
    if (normalized.tenantId !== tenantId || normalized.siteKey !== siteKey) return false;
    if (normalized.storageProvider !== 'local-dev') return false;
    if (['archived', 'replaced', 'deleted-pending'].includes(normalized.status)) return false;
    const sameChecksum = normalized.checksum && normalized.checksum === logoAudit.sha256;
    const sameName = [normalized.originalFileName, normalized.fileName, normalized.safeFileName]
      .filter(Boolean)
      .some((name) => name.toLowerCase() === logoAudit.selectedFile.toLowerCase());
    const sameShape = Number(normalized.sizeBytes || 0) === logoAudit.sizeBytes
      && (!logoAudit.width || Number(normalized.width || 0) === Number(logoAudit.width))
      && (!logoAudit.height || Number(normalized.height || 0) === Number(logoAudit.height));
    return sameChecksum || (sameName && sameShape);
  });
  return candidates[0] || null;
}

async function uploadLogo(logoAudit) {
  const bytes = readFileSync(path.join(repoRoot, logoAudit.relativePath));
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: logoAudit.mimeType }), logoAudit.selectedFile);
  form.append('siteKey', siteKey);
  form.append('title', metadata.title);
  form.append('altText', metadata.altText);
  form.append('caption', metadata.caption);
  form.append('description', metadata.description);
  form.append('usageType', metadata.usageType);
  form.append('credit', 'Party Pros East Coast');
  form.append('license', 'partner_provided');
  form.append('licenseStatus', 'partner_provided');
  form.append('tags', metadata.tags.join(', '));
  const response = await fetch(`${apiBase}/api/admin/${tenantId}/media-assets/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    json: parseJson(text),
    safeText: scrub(text),
  };
}

async function patchMediaAssetMetadata(asset) {
  state.mediaAsset.patchAttempted = true;
  const normalized = safeAssetSummary(asset);
  const status = ['draft', 'active'].includes(normalized.status) ? normalized.status : 'draft';
  const updated = {
    ...asset,
    id: normalized.id,
    tenantId,
    siteKey,
    status,
    title: metadata.title,
    alt: metadata.altText,
    altText: metadata.altText,
    caption: metadata.caption,
    source: 'Party Pros East Coast',
    credit: 'Party Pros East Coast',
    license: 'partner_provided',
    licenseStatus: 'partner_provided',
    usageType: metadata.usageType,
    usageStatus: 'needs_review',
    notes: `${metadata.description} Media slot: ${metadata.mediaSlot}. Storage provider: local-dev.`,
    tags: metadata.tags,
    usageReferences: ppecUsageReferences(),
    usedByPages: ppecUsageReferences(),
  };
  return apiJson(`/api/admin/${tenantId}/media-assets/${encodeURIComponent(normalized.id)}`, {
    method: 'PATCH',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });
}

function buildReplacedHomepageCandidate() {
  state.binding.attempted = true;
  const candidate = readJson(sourceCandidateRel);
  const pkg = readJson(sourcePackageRel);
  const sourceMediaIds = collectValuesByKey(candidate, 'mediaAssetId');
  const media = mediaBindingObject();
  let replacements = 0;

  visit(candidate, (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (isPpecMediaObject(value)) {
      bindMediaFields(value, media);
      replacements += 1;
    }
    if (value.logoRequirement && typeof value.logoRequirement === 'object' && isPpecContext(value)) {
      bindMediaFields(value.logoRequirement, media);
      value.logoMedia = clone(media);
      replacements += 1;
    }
    if (value.logoMedia && typeof value.logoMedia === 'object' && isPpecMediaObject(value.logoMedia)) {
      value.logoMedia = clone(media);
      replacements += 1;
    }
  });

  candidate.media ??= {};
  candidate.media.ppecPartnerLogo = clone(media);
  updateKnownPpecMetadata(candidate, media);
  replaceStringValues(candidate, oldPpecLogoId, media.mediaAssetId);
  replaceStringValues(candidate, oldPpecAssetId, media.assetId);
  replaceStringValues(candidate, oldPpecPublicUrl, media.publicUrl);
  replacePpecSourceFile(candidate, state.logoInput.audit.selectedFile);
  forceHomepageDraftFlags(candidate);

  const candidateText = JSON.stringify(candidate);
  const activePpecSections = activePpecBlocks(candidate).map((block) => JSON.stringify(block)).join('\n');
  const afterMediaIds = collectValuesByKey(candidate, 'mediaAssetId');
  const otherSourceIds = [...new Set(sourceMediaIds.filter((id) => id !== oldPpecLogoId))].sort();
  const otherAfterIds = [...new Set(afterMediaIds.filter((id) => id !== media.mediaAssetId))].sort();

  state.binding.newMediaAssetId = media.mediaAssetId;
  state.binding.ppecReferenceReplacements = replacements;
  state.binding.oldIdStillPresent = candidateText.includes(oldPpecLogoId);
  state.binding.oldIdPresentInActivePpecSection = activePpecSections.includes(oldPpecLogoId);
  state.binding.otherHomepageMediaIdsPreserved = JSON.stringify(otherSourceIds) === JSON.stringify(otherAfterIds);
  state.binding.ppecCopyCtaPreserved = candidateText.includes('Party Pros East Coast') && candidateText.includes('Explore Party Pros East Coast');
  state.binding.selectedMailboxPreserved = candidateText.includes(selectedMailbox);
  state.binding.publicEmailPolicyPreserved = candidateText.includes(publicEmailDisplayPolicy);

  const replacedPackage = {
    ...pkg,
    generatedAt: now,
    logoReplacement: {
      generatedAt: now,
      sourceCandidate: sourceCandidateRel,
      oldPpecLogoMediaAssetId: oldPpecLogoId,
      newPpecLogoMediaAssetId: media.mediaAssetId,
      newPpecLogoAssetId: media.assetId,
      newPpecLogoPublicUrl: media.publicUrl,
      logoSourceFile: state.logoInput.audit.relativePath,
      imageGenerationUsed: false,
      imageContentsModified: false,
      contactUpdated: false,
      serviceAreasUpdated: false,
      themeUpdated: false,
      staticRegenerationPerformed: false,
      deploymentPerformed: false,
    },
    convertedHomepageCandidate: candidate,
    validationSummary: {
      status: 'pending',
      generatedAt: now,
      blockers: [],
      results: {},
    },
  };

  writeJson(replacedCandidateRel, candidate);
  writeJson(replacedPackageRel, replacedPackage);
  state.binding.candidateCreated = true;
  state.binding.packageCreated = true;
}

function mediaBindingObject() {
  return {
    mediaAssetId: state.mediaAsset.id,
    assetId: state.mediaAsset.assetId,
    publicUrl: state.mediaAsset.publicUrl,
    url: state.mediaAsset.publicUrl,
    title: metadata.title,
    alt: metadata.altText,
    altText: metadata.altText,
    caption: metadata.caption,
    description: metadata.description,
    source: 'Party Pros East Coast',
    credit: 'Party Pros East Coast',
    usageType: metadata.usageType,
    mediaSlot: metadata.mediaSlot,
    status: 'mediaasset-bound',
    storageProvider: state.mediaAsset.storageProvider,
    licenseStatus: state.mediaAsset.licenseStatus || 'partner_provided',
    usageStatus: state.mediaAsset.usageStatus || 'needs_review',
    tags: metadata.tags,
    width: state.logoInput.audit.width,
    height: state.logoInput.audit.height,
    decorative: false,
    blocker: false,
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
    requiredMediaSlot: metadata.mediaSlot,
    requiredMediaSlotId: metadata.mediaSlot,
    mediaRequirementRef: 'ppec-partner-logo',
    sourceFile: state.logoInput.audit.selectedFile,
  };
}

function bindMediaFields(target, media) {
  target.requiredMediaSlot ??= metadata.mediaSlot;
  target.requiredMediaSlotId ??= metadata.mediaSlot;
  target.mediaRequirementRef ??= 'ppec-partner-logo';
  target.sourceFile = state.logoInput.audit.selectedFile;
  target.mediaAssetId = media.mediaAssetId;
  target.assetId = media.assetId;
  target.publicUrl = media.publicUrl;
  target.url = media.publicUrl;
  target.title = metadata.title;
  target.alt = metadata.altText;
  target.altText = metadata.altText;
  target.caption = metadata.caption;
  target.description = metadata.description;
  target.usageType = metadata.usageType;
  target.intendedUsageType = metadata.usageType;
  target.status = 'mediaasset-bound';
  target.blocker = false;
  target.width = media.width;
  target.height = media.height;
}

function isPpecMediaObject(value) {
  const raw = JSON.stringify(value);
  return value.mediaAssetId === oldPpecLogoId
    || value.requiredMediaSlot === metadata.mediaSlot
    || value.requiredMediaSlotId === metadata.mediaSlot
    || value.mediaRequirementRef === 'ppec-partner-logo'
    || (String(value.sourceFile || '').toLowerCase().includes('ppec') && /Party Pros East Coast/i.test(raw));
}

function isPpecContext(value) {
  return /Party Pros East Coast|PPEC|ppec/i.test(JSON.stringify(value));
}

function updateKnownPpecMetadata(candidate, media) {
  candidate.reviewMetadata ??= {};
  candidate.reviewMetadata.ppecLogoReplacement = {
    generatedAt: now,
    oldMediaAssetId: oldPpecLogoId,
    newMediaAssetId: media.mediaAssetId,
    sourceFile: state.logoInput.audit.relativePath,
    imageGenerationUsed: false,
    imageContentsModified: false,
  };
  if (candidate.reviewMetadata.ppecLogoBinding) {
    candidate.reviewMetadata.ppecLogoBinding.mediaAssetId = media.mediaAssetId;
    candidate.reviewMetadata.ppecLogoBinding.assetId = media.assetId;
    candidate.reviewMetadata.ppecLogoBinding.publicUrl = media.publicUrl;
  }
  if (candidate.reviewMetadata.ppecVisualBrandRepair) {
    candidate.reviewMetadata.ppecVisualBrandRepair.ppecLogoMediaAssetId = media.mediaAssetId;
    candidate.reviewMetadata.ppecVisualBrandRepair.ppecLogoPublicUrl = media.publicUrl;
  }
  if (candidate.normalizerMetadata?.ppecHomepageConversion) {
    candidate.normalizerMetadata.ppecHomepageConversion.ppecLogoMediaAssetId = media.mediaAssetId;
  }
}

function replacePpecSourceFile(value, fileName) {
  visit(value, (node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    if (node.sourceFile === 'ppec-wordmark-card.png' || node.sourceFile === 'ppec-wordmark-card') node.sourceFile = fileName;
  });
}

function forceHomepageDraftFlags(page) {
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.domain = domain;
  page.route = '/';
  page.path = '/';
  page.slug = 'home';
  page.pageSlug = 'home';
  page.PageSlug = 'home';
  page.canonicalUrl = `https://${domain}/`;
  page.productionApproved = false;
  page.publishApproved = false;
  page.isPublished = false;
  page.publishedAt = null;
  page.includeInSitemap = false;
  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedForImport: false,
    approvedForProduction: false,
    productionApproved: false,
    publishApproved: false,
    lastEditedBy: 'codex_ppec_logo_replacement',
    lastEditedAt: now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    needsRebuild: true,
    staticEligible: false,
    productionApproved: false,
    deploymentStatus: 'not_generated',
  };
  page.domainRouting = {
    ...(page.domainRouting || {}),
    domain,
    publicEmailDisplayPolicy,
    selectedMailbox,
    selectedMailboxMetadata: selectedMailbox,
    mailtoLinksEnabled: false,
    publicContactEmail: '',
  };
  if (page.seo) page.seo = { ...page.seo, canonicalUrl: page.canonicalUrl, robots: 'noindex, nofollow' };
}

function runPreImportValidation() {
  const candidatePath = path.join(repoRoot, replacedCandidateRel);
  const packagePath = path.join(repoRoot, replacedPackageRel);
  recordValidation('json-parse-validation-result.json', jsonParseValidation([candidatePath, packagePath]));
  recordValidation('homepage-logo-replacement-validation-result.json', logoReplacementValidation(readJson(replacedCandidateRel)));
  runImportPreflight();
  runDotNetContract(candidatePath);
  runContractPersistence(candidatePath);
  runSimpleValidation('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleValidation('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleValidation('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleValidation('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  recordValidation('unsafe-scan-result.json', unsafeScan([candidatePath, packagePath]));
  recordValidation('contactus-scan-result.json', stringScan([candidatePath, packagePath], legacyMailbox));
  recordValidation('targeted-secret-scan-result.json', secretScan([candidatePath, packagePath]));
  recordValidation('git-diff-check-result.json', gitDiffCheck());
  recordValidation('trailing-whitespace-scan-result.json', trailingWhitespaceScan(outputTextFiles()));
  recordValidation('protected-generated-raw-artifact-check-result.json', artifactPathCheck());
  recordValidation('validation-command-results.json', {
    ok: true,
    generatedAt: new Date().toISOString(),
    results: validationResultSummary(),
  });

  const required = [
    'json-parse-validation-result.json',
    'homepage-logo-replacement-validation-result.json',
    'homepage-import-preflight-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
    'design-system-validation-result.json',
    'media-validation-result.json',
    'tailwind-navigation-validation-result.json',
    'page-intake-normalizer-validation-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'git-diff-check-result.json',
    'trailing-whitespace-scan-result.json',
    'protected-generated-raw-artifact-check-result.json',
  ];
  for (const name of required) {
    if (state.validation.results[name]?.ok !== true) state.validation.blockers.push(`${name} failed.`);
  }
  const pkg = readJson(replacedPackageRel);
  pkg.validationSummary = {
    status: state.validation.blockers.length ? 'blocked' : 'passed',
    generatedAt: new Date().toISOString(),
    blockers: state.validation.blockers,
    results: state.validation.results,
  };
  writeJson(replacedPackageRel, pkg);
}

function validationResultSummary() {
  return Object.fromEntries(Object.entries(state.validation.results).map(([name, result]) => [
    name,
    {
      ok: result?.ok === true,
      generatedAt: result?.generatedAt || '',
      exitCode: result?.command?.exitCode ?? result?.validate?.exitCode ?? null,
      issueCount: Array.isArray(result?.issues) ? result.issues.length : null,
      hitCount: Array.isArray(result?.hits) ? result.hits.length : null,
    },
  ]));
}

function logoReplacementValidation(candidate) {
  const text = JSON.stringify(candidate);
  const activePpecText = activePpecBlocks(candidate).map((block) => JSON.stringify(block)).join('\n');
  const checks = {
    routeHome: candidate.route === '/' && candidate.pageSlug === 'home',
    draftNeedsReview: candidate.isPublished === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: candidate.productionApproved !== true && candidate.publishApproved !== true && candidate.workflow?.productionApproved !== true && candidate.workflow?.publishApproved !== true,
    staticNeedsRebuild: candidate.staticPublishing?.needsRebuild === true,
    ppecPartnerBand: text.includes('ppecPartnerBand'),
    ppecCopyCta: text.includes('Party Pros East Coast') && text.includes('Explore Party Pros East Coast'),
    newLogoPersists: text.includes(state.mediaAsset.id),
    activePpecSectionUsesNewLogo: activePpecText.includes(state.mediaAsset.id),
    oldLogoAbsentFromActivePpecSection: !activePpecText.includes(oldPpecLogoId),
    oldLogoAbsentEverywhere: !text.includes(oldPpecLogoId),
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailPolicy: text.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noBase64: !/data:image\/|base64/i.test(text),
    noRawFormOrRuntime: !/<form\b|<script\b|javascript:|\[contact-form-7|wpcf7/i.test(text),
    otherHomepageMediaIdsPreserved: state.binding.otherHomepageMediaIdsPreserved,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, generatedAt: new Date().toISOString(), checks, failed };
}

function runImportPreflight() {
  const output = path.join(outputDir, 'homepage-import-preflight-result.json');
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', replacedCandidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', '/',
    '--mode', 'preflight-only',
    '--output', rel(output),
  ], 180000);
  const parsed = existsSync(output) ? readJson(rel(output)) : {};
  parsed.ok = result.status === 0
    && parsed.classification?.['preflight-valid-for-shape'] === true
    && parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.command = commandSummary(result);
  recordValidation('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-ppec-logo-replacement-contract-${process.pid}-${Date.now()}`);
  const publishDir = path.join(scratch, 'publish');
  const buildRoot = path.join(scratch, 'bin');
  const objRoot = path.join(scratch, 'obj');
  mkdirSync(publishDir, { recursive: true });
  mkdirSync(buildRoot, { recursive: true });
  mkdirSync(objRoot, { recursive: true });
  const project = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'Pumpkin.PageContractTool.csproj');
  const publish = run('dotnet', [
    'publish', project, '-c', 'Debug', '-o', publishDir,
    '-p:UseSharedCompilation=false',
    '-p:GenerateAssemblyInfo=false',
    '-p:GenerateTargetFrameworkAttribute=false',
    `-p:BaseOutputPath=${buildRoot}${path.sep}`,
    `-p:BaseIntermediateOutputPath=${objRoot}${path.sep}`,
  ], 240000);
  const dll = path.join(publishDir, 'Pumpkin.PageContractTool.dll');
  const validate = publish.status === 0 && existsSync(dll)
    ? run('dotnet', [dll, 'validate-page', '--path', candidatePath], 180000)
    : { status: -1, stdout: '', stderr: 'publish failed', signal: null };
  const parsed = parseJson(validate.stdout.trim());
  recordValidation('dotnet-page-contract-result.json', {
    ok: validate.status === 0 && inferOk(parsed, validate),
    generatedAt: new Date().toISOString(),
    publish: commandSummary(publish),
    validate: commandSummary(validate),
    parsed,
  });
  rmSync(scratch, { recursive: true, force: true });
}

function runContractPersistence(candidatePath) {
  const output = path.join(outputDir, 'contract-persistence-validation-result.json');
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', rel(candidatePath),
    '--output', rel(output),
  ], 120000);
  const parsed = existsSync(output) ? readJson(rel(output)) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  recordValidation('contract-persistence-validation-result.json', parsed);
}

function runSimpleValidation(name, args) {
  const result = run(args[0], args.slice(1), 180000);
  const parsed = parseJson(result.stdout.trim());
  recordValidation(name, {
    ok: inferOk(parsed, result),
    generatedAt: new Date().toISOString(),
    command: commandSummary(result),
    parsed,
  });
}

async function importHomepageOnly() {
  const candidate = readJson(replacedCandidateRel);
  const payload = prepareHomepagePayload(candidate, state.baseline.homepage?.json);
  const query = new URLSearchParams({
    changeSource,
    changeSummary: 'PPEC legitimate logo replacement homepage-only local draft import; no contact, service-area, theme, static, deploy, provider, or email action.',
  });
  state.import.attempted = true;
  const result = await apiJson(`/api/admin/pages/${tenantId}/home?${query}`, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  state.import.httpStatus = result.status;
  state.import.performed = result.ok;
  state.safety.cmsHomepageWrite = result.ok;
  writeJson(`${outputRel}/homepage-logo-replacement-write-result.json`, sanitize({
    ok: result.ok,
    status: result.status,
    page: result.json,
    safeText: result.safeText,
  }));
  if (!result.ok) state.blockers.push(`Homepage update failed with HTTP ${result.status}.`);
}

function prepareHomepagePayload(candidate, existingPage) {
  const page = clone(candidate);
  const id = existingPage?.PageId || existingPage?.pageId || existingPage?.id || page.PageId || page.id || 'ice-rink-rentals-home';
  page.id = id;
  page.PageId = id;
  page.revision = existingPage?.revision ? { ...existingPage.revision, ...(page.revision || {}) } : page.revision;
  forceHomepageDraftFlags(page);
  page.reviewMetadata = {
    ...(page.reviewMetadata || {}),
    ppecLogoReplacementHomepageImport: {
      status: 'local-draft-import-requested',
      importedAt: now,
      changeSource,
      oldPpecLogoMediaAssetId: oldPpecLogoId,
      newPpecLogoMediaAssetId: state.mediaAsset.id,
      cmsHomepageWrite: true,
      contactUpdated: false,
      serviceAreasUpdated: false,
      themeUpdated: false,
      staticRegenerationPerformed: false,
      deploymentPerformed: false,
    },
  };
  return page;
}

async function postWriteVerification() {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);
  writeJson(`${outputRel}/homepage-readback-after-logo-replacement.json`, sanitize(homepage.json || {}));
  writeJson(`${outputRel}/media-assets-after-logo-replacement.snapshot.json`, sanitize(mediaAssets.json || { status: mediaAssets.status }));

  const page = homepage.json || {};
  const text = JSON.stringify(page);
  const workflow = page.workflow || {};
  const staticPublishing = page.staticPublishing || {};
  const routing = page.domainRouting || {};
  const activePpecText = activePpecBlocks(page).map((block) => JSON.stringify(block)).join('\n');

  const verification = {
    routeHome: (page.route || page.path || '/') === '/' && (page.pageSlug || page.slug) === 'home',
    draftNeedsReview: page.isPublished === false && workflow.status === 'draft' && workflow.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true && workflow.productionApproved !== true && staticPublishing.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true && workflow.publishApproved !== true && workflow.approvedForPublish !== true,
    staticNeedsRebuild: staticPublishing.needsRebuild === true,
    ppecPartnerBand: text.includes('ppecPartnerBand'),
    ppecCopyCta: text.includes('Party Pros East Coast') && text.includes('Explore Party Pros East Coast'),
    newLogoPersists: text.includes(state.mediaAsset.id),
    activePpecSectionUsesNewLogo: activePpecText.includes(state.mediaAsset.id),
    oldLogoAbsentFromActivePpecSection: !activePpecText.includes(oldPpecLogoId),
    selectedMailbox: routing.selectedMailbox === selectedMailbox || text.includes(selectedMailbox),
    publicEmailDisplayPolicy: routing.publicEmailDisplayPolicy === publicEmailDisplayPolicy || text.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !text.includes(legacyMailbox),
    revisionOrRollbackMetadata: Boolean(page.revision?.revisionNumber || page.revision?.rollbackAvailable || page.revision?.latestSnapshot),
  };
  const failed = Object.entries(verification).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.performed = true;
  state.readback.verification = {
    ok: homepage.ok && failed.length === 0,
    httpStatus: homepage.status,
    checks: verification,
    diagnostics: {
      oldLogoPresentOnlyInRollbackHistory: text.includes(oldPpecLogoId) && !activePpecText.includes(oldPpecLogoId),
      revisionLastChangeSource: page.revision?.lastChangeSource || '',
      revisionLatestSnapshotChangeSource: page.revision?.latestSnapshot?.changeSource || '',
      revisionLastChangeSummary: page.revision?.lastChangeSummary || '',
    },
    failed,
  };
  if (!state.readback.verification.ok) state.readback.blockers.push(`Homepage readback verification failed: ${failed.join(', ') || `HTTP ${homepage.status}`}.`);

  state.untouched.contactUnchanged = contact.status === state.baseline.contact.status && contact.hash === state.baseline.hashes.contact;
  state.untouched.serviceAreasUnchangedOr404 = state.baseline.serviceAreas.status === 404 ? serviceAreas.status === 404 : serviceAreas.status === state.baseline.serviceAreas.status && serviceAreas.hash === state.baseline.hashes.serviceAreas;
  state.untouched.themeUnchanged = theme.status === state.baseline.theme.status && theme.hash === state.baseline.hashes.theme;
  state.untouched.mediaAssetsUnchangedExceptPpecLogo = compareMediaAssetsAllowed(state.baseline.mediaAssets.json, mediaAssets.json, state.mediaAsset.id);

  if (!state.untouched.contactUnchanged) state.readback.blockers.push('/contact changed unexpectedly.');
  if (!state.untouched.serviceAreasUnchangedOr404) state.readback.blockers.push('/service-areas changed unexpectedly.');
  if (!state.untouched.themeUnchanged) state.readback.blockers.push('Theme changed unexpectedly.');
  if (!state.untouched.mediaAssetsUnchangedExceptPpecLogo) state.readback.blockers.push('MediaAssets changed beyond the new/reused PPEC logo record.');
}

async function probeFrontendPreview() {
  const result = await probe(`${webBase}/__preview/${tenantId}/home`);
  state.frontend.checked = true;
  state.frontend.status = result.status;
  state.frontend.length = result.length;
  state.frontend.clientShell = result.text ? /Local draft preview|__preview|admin JWT|pumpkin/i.test(result.text) : null;
  state.frontend.containsNewMediaAssetId = result.text ? result.text.includes(state.mediaAsset.id) : false;
  state.frontend.note = state.frontend.clientShell
    ? 'Preview route returned the client draft shell; manual browser JWT loading is required for visual review.'
    : 'Preview route probe completed.';
}

function compareMediaAssetsAllowed(beforeJson, afterJson, allowedId) {
  const before = new Map(mediaAssetsFrom(beforeJson).map((asset) => [mediaId(asset), stableStringify(sanitize(asset))]));
  const after = new Map(mediaAssetsFrom(afterJson).map((asset) => [mediaId(asset), stableStringify(sanitize(asset))]));
  for (const [id, beforeHash] of before.entries()) {
    if (!after.has(id)) return false;
    if (id !== allowedId && after.get(id) !== beforeHash) return false;
  }
  for (const id of after.keys()) {
    if (!before.has(id) && id !== allowedId) return false;
  }
  return true;
}

function runFinalHygieneChecks() {
  const files = outputTextFiles();
  const checks = {
    manifestJsonParse: jsonParseValidation([path.join(outputDir, 'manifest.json')]),
    gitDiffCheck: gitDiffCheck(),
    trailingWhitespaceScan: trailingWhitespaceScan(files),
    protectedGeneratedRawArtifactPathCheck: artifactPathCheck(),
    targetedSecretScan: secretScan(files.filter((file) => !file.endsWith('run-ppec-logo-replacement.mjs'))),
    noCmsContactWrite: { ok: state.safety.cmsContactWrite === false },
    noServiceAreasWrite: { ok: state.safety.serviceAreasWrite === false },
    noThemeWrite: { ok: state.safety.themeWrite === false },
    noStaticGeneration: { ok: state.safety.staticGeneration === false },
    noDeployment: { ok: state.safety.deployment === false },
  };
  return {
    ok: Object.values(checks).every((check) => check.ok === true),
    generatedAt: new Date().toISOString(),
    checks,
  };
}

function writeReports() {
  writeJson(`${outputRel}/manifest.json`, sanitize(state));
  writeText(`${outputRel}/README.md`, `# Ice PPEC Logo Replacement

Status: ${state.success ? 'completed' : state.blockers.length ? 'blocked or incomplete' : 'in progress'}.

Scope:
- Replace the incorrect PPEC logo MediaAsset reference on the Ice homepage draft.
- Create or reuse one legitimate Party Pros East Coast logo MediaAsset from local input.
- Import homepage \`/\` only as local draft/needs_review after validation.

Out of scope:
- No image generation or image content modification.
- No \`/contact\`, \`/service-areas\`, Theme, static, deployment, provider, DNS, email, Azure, Cloudflare, Bluehost, or Roller action.
`);

  const audit = state.logoInput.audit || {};
  writeText(`${outputRel}/PPEC_LOGO_REPLACEMENT_AUDIT.md`, `# PPEC Logo Replacement Audit

Input folder: \`${inputRel}/\`

Selected file: \`${audit.relativePath || 'not-selected'}\`

- Folder exists: ${yn(audit.folderExists)}
- Extension: \`${audit.extension || 'unknown'}\`
- MIME/type: \`${audit.mimeType || 'unknown'}\`
- Safe filename: ${yn(audit.safeFileName)}
- Path traversal safe: ${yn(audit.pathTraversalSafe)}
- Local source only: ${yn(audit.localSourceOnly)}
- File size: ${audit.sizeBytes ?? 0} bytes
- Dimensions: ${audit.width || 'unknown'} x ${audit.height || 'unknown'}
- SHA-256: \`${audit.sha256 || ''}\`
- Valid: ${yn(audit.ok)}

Current homepage PPEC logo MediaAsset ID confirmed: \`${oldPpecLogoId}\`

Blockers:

${audit.blockers?.length ? audit.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);

  writeText(`${outputRel}/PPEC_LOGO_MEDIAASSET_RESULT.md`, `# PPEC Logo MediaAsset Result

- MediaAsset result: ${state.mediaAsset.result}
- List attempted: ${yn(state.mediaAsset.listAttempted)}
- Upload attempted: ${yn(state.mediaAsset.uploadAttempted)}
- Patch attempted: ${yn(state.mediaAsset.patchAttempted)}
- Readback attempted: ${yn(state.mediaAsset.readbackAttempted)}
- Created: ${yn(state.mediaAsset.created)}
- Reused: ${yn(state.mediaAsset.reused)}
- MediaAsset ID: \`${state.mediaAsset.id || 'not-available'}\`
- Asset ID: \`${state.mediaAsset.assetId || 'not-available'}\`
- Public URL: \`${state.mediaAsset.publicUrl || 'not-available'}\`
- Status: \`${state.mediaAsset.status || 'not-available'}\`
- Usage type: \`${state.mediaAsset.usageType || 'not-available'}\`
- Usage status: \`${state.mediaAsset.usageStatus || 'not-available'}\`
- License status: \`${state.mediaAsset.licenseStatus || 'not-available'}\`
- Storage provider: \`${state.mediaAsset.storageProvider || 'not-available'}\`
- Source file: \`${state.mediaAsset.sourceFile || 'not-available'}\`

MediaAsset blockers:

${state.mediaAsset.blockers.length ? state.mediaAsset.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);

  writeText(`${outputRel}/HOMEPAGE_LOGO_BINDING_RESULT.md`, `# Homepage Logo Binding Result

- Source candidate: \`${sourceCandidateRel}\`
- Repaired candidate: \`${replacedCandidateRel}\`
- Repaired package: \`${replacedPackageRel}\`
- Old PPEC logo MediaAsset ID: \`${oldPpecLogoId}\`
- New PPEC logo MediaAsset ID: \`${state.binding.newMediaAssetId || 'not-available'}\`
- Candidate created: ${yn(state.binding.candidateCreated)}
- Package created: ${yn(state.binding.packageCreated)}
- PPEC reference replacements: ${state.binding.ppecReferenceReplacements}
- Old ID still present anywhere in candidate: ${yn(state.binding.oldIdStillPresent)}
- Old ID present in active PPEC section: ${yn(state.binding.oldIdPresentInActivePpecSection)}
- Other homepage MediaAsset IDs preserved: ${yn(state.binding.otherHomepageMediaIdsPreserved)}
- PPEC copy/CTA preserved: ${yn(state.binding.ppecCopyCtaPreserved)}
- Selected mailbox preserved: ${yn(state.binding.selectedMailboxPreserved)}
- Public email policy preserved: ${yn(state.binding.publicEmailPolicyPreserved)}
`);

  writeText(`${outputRel}/IMPORT_RESULT.md`, `# Import Result

- Homepage import attempted: ${yn(state.import.attempted)}
- Homepage import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Change source: \`${changeSource}\`
- Skipped reason: ${state.import.skippedReason || 'not-applicable'}

No \`/contact\`, \`/service-areas\`, Theme, static generation, deployment, provider, DNS, email, Azure, Cloudflare, Bluehost, or Roller action was performed.
`);

  writeText(`${outputRel}/READBACK_VERIFICATION.md`, `# Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.verification.ok)}
- Homepage route/draft/approval checks: ${state.readback.verification.failed?.length ? 'failed' : state.readback.performed ? 'passed' : 'not-run'}
- New PPEC logo ID persists: ${yn(state.readback.verification.checks?.newLogoPersists)}
- Active PPEC section uses new logo: ${yn(state.readback.verification.checks?.activePpecSectionUsesNewLogo)}
- Old PPEC logo absent from active PPEC section: ${yn(state.readback.verification.checks?.oldLogoAbsentFromActivePpecSection)}
- PPEC copy/CTA persists: ${yn(state.readback.verification.checks?.ppecCopyCta)}
- Selected mailbox persists: ${yn(state.readback.verification.checks?.selectedMailbox)}
- Public email policy persists: ${yn(state.readback.verification.checks?.publicEmailDisplayPolicy)}
- No \`contactus@\`: ${yn(state.readback.verification.checks?.noLegacyMailbox)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- /service-areas unchanged or 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged except new/reused PPEC logo record: ${yn(state.untouched.mediaAssetsUnchangedExceptPpecLogo)}

Readback blockers:

${state.readback.blockers.length ? state.readback.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);

  writeText(`${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`, `# Frontend Preview Checklist

Preview URL: \`${state.frontend.previewUrl}\`

- Probe checked: ${yn(state.frontend.checked)}
- HTTP status: ${state.frontend.status ?? 'not-applicable'}
- Response length: ${state.frontend.length ?? 'not-applicable'}
- Client preview shell: ${state.frontend.clientShell === null ? 'not-applicable' : yn(state.frontend.clientShell)}
- Raw shell contains new MediaAsset ID: ${yn(state.frontend.containsNewMediaAssetId)}
- Note: ${state.frontend.note || 'not-run'}

Manual browser review:
- Load the local admin JWT in the browser session if the route shows the client preview shell.
- Verify the PPEC section displays the legitimate Party Pros East Coast logo.
- Verify logo sizing, contrast, CTA wording, mobile layout, footer/nav, and email visibility.
- Do not use public \`/\` to judge the draft homepage.
`);

  writeText(`${outputRel}/REMAINING_BLOCKERS.md`, `# Remaining Blockers

Run blockers:

${[...new Set(state.blockers)].length ? [...new Set(state.blockers)].map((item) => `- ${item}`).join('\n') : '- None.'}

Validation blockers:

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Next recommended action:

${state.success ? '- Open the local draft preview URL and visually approve the legitimate PPEC logo rendering.' : '- Resolve the blocker above, retain/re-add auth if needed, then rerun the logo replacement task.'}
`);

  writeText(rootReportRel, renderRootReport());
}

function renderRootReport() {
  return `# Pumpkin Ice PPEC Logo Replacement Report

Date: ${now}

Site: IceSkatingRinkRentals.com

Branch: \`${state.branch}\`

## Status

${state.success ? 'Completed successfully.' : state.blockers.length ? 'Blocked or incomplete. See blockers below.' : 'In progress.'}

## Start State

Git status at start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent commits:

\`\`\`text
${state.start.gitLogOneline12}
\`\`\`

API status: ${state.start.api?.reachable ? `reachable, HTTP ${state.start.api.status}` : 'not reachable'}

## Logo Input

- Source file: \`${state.logoInput.audit?.relativePath || 'not-selected'}\`
- Validation result: ${state.logoInput.audit?.ok ? 'pass' : 'fail'}
- MIME/type: \`${state.logoInput.audit?.mimeType || 'unknown'}\`
- Dimensions: ${state.logoInput.audit?.width || 'unknown'} x ${state.logoInput.audit?.height || 'unknown'}
- Size: ${state.logoInput.audit?.sizeBytes || 0} bytes
- SHA-256: \`${state.logoInput.audit?.sha256 || ''}\`

## Auth Lifecycle

- Env auth status: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempJwtInitialStatus}
- Admin auth presence: ${state.auth.presence}
- Admin auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after success: ${yn(state.auth.tempJwtDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempJwtRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## MediaAsset Result

- MediaAsset created: ${yn(state.mediaAsset.created)}
- MediaAsset reused: ${yn(state.mediaAsset.reused)}
- Old PPEC logo ID: \`${oldPpecLogoId}\`
- New PPEC logo ID: \`${state.mediaAsset.id || 'not-available'}\`
- Asset ID: \`${state.mediaAsset.assetId || 'not-available'}\`
- Public URL: \`${state.mediaAsset.publicUrl || 'not-available'}\`
- Status: \`${state.mediaAsset.status || 'not-available'}\`
- Usage type: \`${state.mediaAsset.usageType || 'not-available'}\`
- Storage provider: \`${state.mediaAsset.storageProvider || 'not-available'}\`

## Candidate Binding

- Candidate created: ${yn(state.binding.candidateCreated)}
- Package created: ${yn(state.binding.packageCreated)}
- PPEC section new logo binding: ${yn(state.binding.newMediaAssetId && !state.binding.oldIdPresentInActivePpecSection)}
- Other homepage media preserved: ${yn(state.binding.otherHomepageMediaIdsPreserved)}
- PPEC copy/CTA preserved: ${yn(state.binding.ppecCopyCtaPreserved)}
- Mailbox/policy preserved: ${yn(state.binding.selectedMailboxPreserved && state.binding.publicEmailPolicyPreserved)}

## Validation

${Object.entries(state.validation.results).length ? Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ${result.ok === true ? 'pass' : 'fail'}`).join('\n') : '- Not run.'}

## Import

- Import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Change source: \`${changeSource}\`

## Readback

- Readback ok: ${yn(state.readback.verification.ok)}
- New logo persists: ${yn(state.readback.verification.checks?.newLogoPersists)}
- Old logo absent from active PPEC section: ${yn(state.readback.verification.checks?.oldLogoAbsentFromActivePpecSection)}
- PPEC copy/CTA persists: ${yn(state.readback.verification.checks?.ppecCopyCta)}
- Draft/needs_review: ${yn(state.readback.verification.checks?.draftNeedsReview)}
- Production/publish approvals false: ${yn(state.readback.verification.checks?.productionApprovedFalse && state.readback.verification.checks?.publishApprovedFalse)}
- Selected mailbox and public email policy persist: ${yn(state.readback.verification.checks?.selectedMailbox && state.readback.verification.checks?.publicEmailDisplayPolicy)}
- No \`contactus@\`: ${yn(state.readback.verification.checks?.noLegacyMailbox)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- /service-areas unchanged or 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged except PPEC logo record: ${yn(state.untouched.mediaAssetsUnchangedExceptPpecLogo)}

## Frontend Preview

- URL: \`${state.frontend.previewUrl}\`
- Probe status: ${state.frontend.status ?? 'not-applicable'}
- Client shell: ${state.frontend.clientShell === null ? 'not-applicable' : yn(state.frontend.clientShell)}
- Note: ${state.frontend.note || 'not-run'}

## Guardrails

- /contact updated: no
- /service-areas updated: no
- Theme updated: no
- Static generated: no
- Deployed: no
- DNS/email/provider/Azure/Cloudflare/Bluehost changed: no
- Email sent: no
- Protected config read: no
- Image generation used: no
- Image contents modified: no
- Roller touched: no

## Blockers

${[...new Set(state.blockers)].length ? [...new Set(state.blockers)].map((item) => `- ${item}`).join('\n') : '- None.'}

## Next Action

${state.success ? 'Open the local draft preview route in a browser with the local admin JWT session and visually approve the legitimate PPEC logo rendering.' : 'Resolve the blocker, keep the temp JWT if present, and rerun before any further CMS write.'}
`;
}

function jsonParseValidation(files) {
  const results = files.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: safeMessage(error) };
    }
  });
  return { ok: results.every((item) => item.ok), generatedAt: new Date().toISOString(), files: results };
}

function unsafeScan(files) {
  const patterns = [
    ['script-tag', /<script\b/i],
    ['event-handler', /\son[a-z]+\s*=/i],
    ['javascript-url', /javascript:/i],
    ['data-image', /data:image\//i],
    ['encoded-image-marker', /\bbase64\b/i],
    ['raw-form', /<form\b/i],
    ['raw-input', /<input\b/i],
    ['raw-textarea', /<textarea\b/i],
    ['raw-select', /<select\b/i],
    ['mailto-link', /mailto:/i],
    ['cf7-runtime', /\[contact-form-7|wpcf7/i],
  ];
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: rel(file), code });
    }
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function stringScan(files, needle) {
  const hits = files.filter((file) => readFileSync(file, 'utf8').includes(needle)).map((file) => ({ path: rel(file) }));
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), needle, hits };
}

function secretScan(files) {
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['bearer-token', /authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]+/i],
  ];
  const hits = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: rel(file), code });
    }
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function gitDiffCheck() {
  const result = run('git', ['diff', '--check'], 60000);
  return { ok: result.status === 0, generatedAt: new Date().toISOString(), command: commandSummary(result) };
}

function trailingWhitespaceScan(files) {
  const hits = [];
  for (const file of files) {
    if (!existsSync(file) || /\.(png|jpe?g|gif|webp|zip|dll|exe)$/i.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push({ path: rel(file), line: index + 1 });
    });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function artifactPathCheck() {
  const status = git(['status', '--short', '--untracked-files=all']);
  const lines = status.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|dist|build|out)([/\\]|$)/i.test(line));
  const rawHits = lines.filter((line) => {
    const file = line.slice(3).replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) return false;
    return !file.startsWith(`${inputRel}/`);
  });
  return {
    ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0,
    generatedAt: new Date().toISOString(),
    protectedHits,
    generatedHits,
    rawHits,
    approvedRawInputFolder: inputRel,
  };
}

function outputTextFiles() {
  const files = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSafe(dir)) {
      const full = path.join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(md|json|mjs|txt)$/i.test(name)) files.push(full);
    }
  };
  walk(outputDir);
  files.push(path.join(repoRoot, rootReportRel));
  return [...new Set(files)];
}

function recordValidation(name, result) {
  state.validation.results[name] = result;
  writeJson(`${outputRel}/${name}`, result);
}

async function getPage(slug) {
  return apiJson(`/api/admin/pages/${tenantId}/${encodeURIComponent(slug)}`, { method: 'GET', token: jwt });
}

async function apiJson(endpoint, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  try {
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      cache: 'no-store',
    });
    const text = await response.text();
    const json = parseJson(text);
    return {
      ok: response.ok,
      status: response.status,
      json,
      safeText: scrub(text),
      hash: response.status === 404 ? null : hash(stableStringify(sanitize(json))),
    };
  } catch (error) {
    return { ok: false, status: 0, json: null, safeText: safeMessage(error), hash: null };
  }
}

async function probe(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    return { reachable: true, status: response.status, length: text.length, text: scrub(text) };
  } catch (error) {
    return { reachable: false, status: 0, length: null, text: '', error: safeMessage(error) };
  }
}

function mediaAssetsFrom(json) {
  return Array.isArray(json?.mediaAssets) ? json.mediaAssets
    : Array.isArray(json?.MediaAssets) ? json.MediaAssets
      : Array.isArray(json) ? json
        : [];
}

function safeAssetSummary(asset) {
  return {
    id: asset?.id || asset?.Id || '',
    tenantId: asset?.tenantId || asset?.TenantId || '',
    siteKey: asset?.siteKey || asset?.SiteKey || '',
    assetId: asset?.assetId || asset?.AssetId || '',
    status: asset?.status || asset?.Status || '',
    publicUrl: asset?.publicUrl || asset?.PublicUrl || asset?.url || asset?.Url || '',
    thumbnailUrl: asset?.thumbnailUrl || asset?.ThumbnailUrl || '',
    originalFileName: asset?.originalFileName || asset?.OriginalFileName || asset?.fileName || asset?.FileName || '',
    fileName: asset?.fileName || asset?.FileName || '',
    safeFileName: asset?.safeFileName || asset?.SafeFileName || '',
    title: asset?.title || asset?.Title || '',
    altText: asset?.altText || asset?.AltText || asset?.alt || asset?.Alt || '',
    caption: asset?.caption || asset?.Caption || '',
    usageType: asset?.usageType || asset?.UsageType || '',
    usageStatus: asset?.usageStatus || asset?.UsageStatus || '',
    licenseStatus: asset?.licenseStatus || asset?.LicenseStatus || '',
    width: asset?.width ?? asset?.Width ?? null,
    height: asset?.height ?? asset?.Height ?? null,
    mimeType: asset?.mimeType || asset?.MimeType || '',
    sizeBytes: asset?.sizeBytes || asset?.SizeBytes || asset?.fileSize || asset?.FileSize || null,
    checksum: asset?.checksum || asset?.Checksum || asset?.hash || asset?.Hash || '',
    storageProvider: asset?.storageProvider || asset?.StorageProvider || '',
  };
}

function mediaId(asset) {
  return asset?.id || asset?.Id || '';
}

function ppecUsageReferences() {
  return [
    {
      pageId: 'ice-rink-rentals-home',
      pageSlug: 'home',
      fieldPath: 'ContentData.ContentBlocks[].content.partner.logoMedia',
      blockType: 'PrimaryCTA',
      imageRole: metadata.mediaSlot,
    },
    {
      pageId: 'ice-rink-rentals-home',
      pageSlug: 'home',
      fieldPath: 'media.ppecPartnerLogo',
      blockType: 'Page.media',
      imageRole: metadata.mediaSlot,
    },
  ];
}

function activePpecBlocks(page) {
  return blocksOf(page).filter((block) => {
    const content = contentOf(block);
    return content.sectionVariant === 'ppecPartnerBand'
      || content.rendererVariant === 'ppecPartnerBand'
      || content.visualTreatment === 'ppecPartnerBand'
      || /Party Pros East Coast|PPEC/i.test(JSON.stringify(content.partner || {}));
  });
}

function blocksOf(page) {
  return page?.ContentData?.ContentBlocks || page?.contentData?.contentBlocks || page?.ContentBlocks || [];
}

function contentOf(block) {
  return block?.content || block?.Content || {};
}

function collectValuesByKey(value, key, output = []) {
  if (Array.isArray(value)) value.forEach((item) => collectValuesByKey(item, key, output));
  else if (value && typeof value === 'object') {
    for (const [entryKey, nested] of Object.entries(value)) {
      if (entryKey === key && typeof nested === 'string' && nested.trim()) output.push(nested.trim());
      collectValuesByKey(nested, key, output);
    }
  }
  return output;
}

function visit(value, fn) {
  fn(value);
  if (Array.isArray(value)) value.forEach((item) => visit(item, fn));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => visit(item, fn));
}

function replaceStringValues(value, needle, replacement) {
  if (!needle || !replacement) return;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (typeof value[index] === 'string') value[index] = value[index].split(needle).join(replacement);
      else replaceStringValues(value[index], needle, replacement);
    }
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === 'string') value[key] = nested.split(needle).join(replacement);
      else replaceStringValues(nested, needle, replacement);
    }
  }
}

function summarizeResponse(response, allowNotFound = false) {
  return {
    status: response.status,
    ok: response.ok || (allowNotFound && response.status === 404),
    found: response.status === 200,
    expectedNotFound: response.status === 404,
    hash: response.hash,
  };
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text.replace(/^\uFEFF/, '')) : null;
  } catch {
    return null;
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${value.trimEnd()}\n`, 'utf8');
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function scoreLogoName(fileName) {
  const lower = fileName.toLowerCase();
  let score = 0;
  if (lower === 'partyproseastcoastlogo.png') score += 100;
  if (lower === 'partyproseastcoastlogo.svg') score += 95;
  if (lower === 'partyproseastcoastlogo.webp') score += 90;
  if (lower.includes('party')) score += 20;
  if (lower.includes('pros')) score += 20;
  if (lower.includes('east')) score += 10;
  if (lower.includes('coast')) score += 10;
  if (lower.includes('logo')) score += 10;
  return score;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => {
    if (/token|jwt|password|secret|connectionString|apiKey|privateKey|authorization/i.test(key)) return '[redacted]';
    return val;
  }));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function scrub(value) {
  return String(value || '')
    .replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .slice(0, 3000);
}

function safeMessage(error) {
  return scrub(error?.message || error || '');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return (result.stdout || result.stderr || '').trim();
}

function run(command, args, timeout = 60000) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  });
  return {
    status: result.status,
    stdout: scrub(result.stdout || ''),
    stderr: scrub(result.stderr || ''),
    signal: result.signal || null,
  };
}

function commandSummary(result) {
  return {
    ok: result.status === 0,
    exitCode: result.status,
    signal: result.signal || null,
    stdout: scrub(result.stdout || '').slice(0, 1200),
    stderr: scrub(result.stderr || '').slice(0, 1200),
  };
}

function inferOk(parsed, result) {
  if (parsed && typeof parsed === 'object') {
    if (parsed.ok === true || parsed.Ok === true) return true;
    if (parsed.failed === 0 && parsed.failedCount === 0) return true;
    if (parsed.ReadinessDecision && /valid|pass|ready/i.test(parsed.ReadinessDecision) && !/blocked|fail/i.test(parsed.ReadinessDecision)) return true;
  }
  return result.status === 0;
}

function rel(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function yn(value) {
  return value ? 'yes' : 'no';
}
