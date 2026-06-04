#!/usr/bin/env node
import crypto from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outRel = 'content-review/ice-contact-media-binding';
const outDir = path.join(repoRoot, outRel);
const rootReportRel = 'PUMPKIN_ICE_CONTACT_MEDIA_BINDING_REPORT.md';
const inputRootRel = 'content-review/ice-final-contact-input';
const contactImagesRel = `${inputRootRel}/contactimages`;
const candidateRel = 'content-review/ice-final-contact-validated/CONTACT_NORMALIZED_CANDIDATE.json';
const contactReadbackRel = 'content-review/ice-final-contact-local-draft-import/contact-readback-after-final-import.json';
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const pageSlug = 'contact';
const route = '/contact';
const canonicalUrl = 'https://iceskatingrinkrentals.com/contact';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const staticEndpointRef = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const leadRecipientRef = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const requestedChangeSource = 'contact_media_binding_import';
const apiChangeSource = 'json_import';
const generatedAt = new Date().toISOString();

const allowedImageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const officialMediaIds = [
  'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
  'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
  'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
  'ice-rink-rentals-holidayicerink-973ce7691377',
  'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
  'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
];
const approvedContactImageMap = [
  {
    match: '12_37_40',
    slot: 'contactHeroImage',
    usageType: 'hero',
    title: 'Contact Quote Planning Hero',
    alt: 'Portable ice rink rental planning image for quote requests',
    caption: 'Portable ice rink quote planning for a temporary skating event.',
    visualDescription: 'Planner reviewing rink drawings and an ice rink image at a desk.',
    targetBlockId: 'contact-hero-media',
  },
  {
    match: '01_25_32',
    slot: 'contactQuotePlanningImage',
    usageType: 'card',
    title: 'Contact Quote Planning Review',
    alt: 'Portable ice rink setup details used to prepare an ice rink rental quote',
    caption: 'Event stakeholders reviewing rink layout details for a quote request.',
    visualDescription: 'Group reviewing a rink layout plan and event images around a table.',
    targetBlockId: 'contact-quote-form-intro',
  },
  {
    match: '01_26_01',
    slot: 'contactSetupLogisticsImage',
    usageType: 'card',
    title: 'Contact Setup Logistics Review',
    alt: 'Portable ice rink setup with event site review for rental planning',
    caption: 'Outdoor site review for temporary rink setup and event logistics.',
    visualDescription: 'Two event planners walking through an outdoor rink site with tablets.',
    targetBlockId: 'about-ice-rink-rentals-contact',
  },
];

const files = {
  readme: `${outRel}/README.md`,
  audit: `${outRel}/CONTACT_IMAGE_INPUT_AUDIT.md`,
  slotPlan: `${outRel}/CONTACT_MEDIA_SLOT_PLAN.md`,
  mediaAssetResult: `${outRel}/CONTACT_MEDIAASSET_RESULT.md`,
  bindingResult: `${outRel}/CONTACT_BINDING_RESULT.md`,
  validationResults: `${outRel}/VALIDATION_RESULTS.md`,
  importResult: `${outRel}/IMPORT_RESULT.md`,
  readbackVerification: `${outRel}/READBACK_VERIFICATION.md`,
  frontendChecklist: `${outRel}/FRONTEND_PREVIEW_CHECKLIST.md`,
  blockers: `${outRel}/REMAINING_BLOCKERS.md`,
  candidate: `${outRel}/CONTACT_MEDIA_BOUND_CANDIDATE.json`,
  pkg: `${outRel}/CONTACT_MEDIA_BOUND_PACKAGE.json`,
  manifest: `${outRel}/manifest.json`,
  imageAuditJson: `${outRel}/contact-image-input-audit.json`,
  mediaBefore: `${outRel}/media-assets-before-contact-media-binding.snapshot.json`,
  mediaAfter: `${outRel}/media-assets-after-contact-media-binding.readonly.json`,
  homepageBefore: `${outRel}/homepage-before-contact-media-binding.snapshot.json`,
  homepageAfter: `${outRel}/homepage-after-contact-media-binding.readonly.json`,
  serviceAreasBefore: `${outRel}/service-areas-before-contact-media-binding.snapshot.json`,
  serviceAreasAfter: `${outRel}/service-areas-after-contact-media-binding.readonly.json`,
  contactBefore: `${outRel}/contact-before-contact-media-binding.snapshot.json`,
  contactAfter: `${outRel}/contact-readback-after-contact-media-binding.json`,
  themeBefore: `${outRel}/theme-before-contact-media-binding.snapshot.json`,
  themeAfter: `${outRel}/theme-after-contact-media-binding.readonly.json`,
  mediaAssetApiResult: `${outRel}/mediaasset-create-reuse-result.json`,
  frontendProbe: `${outRel}/frontend-preview-probe-result.json`,
  hygiene: `${outRel}/final-hygiene-result.json`,
  jsonParse: `${outRel}/json-parse-validation-result.json`,
  dotnet: `${outRel}/dotnet-page-contract-result.json`,
  productionPersistence: `${outRel}/production-field-persistence-validation-result.json`,
  safePreflight: `${outRel}/safe-import-preflight-result.json`,
  designSystem: `${outRel}/design-system-validation-result.json`,
  mediaValidation: `${outRel}/media-validation-result.json`,
  defaultForm: `${outRel}/default-form-validation-result.json`,
  defaultFormFixtures: `${outRel}/default-form-fixtures-validation-result.json`,
  tailwind: `${outRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outRel}/unsafe-scan-result.json`,
  contactusScan: `${outRel}/contactus-scan-result.json`,
  routeCanonical: `${outRel}/route-canonical-audit-result.json`,
  secretScan: `${outRel}/targeted-secret-scan-result.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.contact-media-binding.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
    preview: null,
    cleanExceptRawInputs: false,
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    presence: 'MISSING',
    validation: 'MISSING',
    source: 'none',
    tokenPrinted: false,
    tempDeletedAfterSuccess: false,
    tempRetainedOnFailure: false,
    tempFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  inputs: {
    candidateExists: existsSync(abs(candidateRel)),
    contactReadbackExists: existsSync(abs(contactReadbackRel)),
    audits: [],
    approved: [],
    referenceOnly: [],
    rejected: [],
  },
  baseline: {},
  mediaAssets: {
    beforeCount: 0,
    afterCount: 0,
    created: [],
    reused: [],
    readbacks: [],
    allowedChangedIds: [],
    result: 'not-run',
  },
  binding: {
    ok: false,
    slots: [],
    newOrReusedIds: [],
    ppecLogoPreserved: false,
    formPreserved: false,
  },
  validation: {
    ok: false,
    results: {},
    failed: [],
  },
  import: {
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
  },
  readback: {
    ok: false,
    checks: {},
    failed: [],
  },
  untouched: {
    homepageUnchanged: null,
    serviceAreasUnchanged: null,
    themeUnchanged: null,
    mediaAssetsAllowedChangesOnly: null,
  },
  frontend: {
    checked: false,
    routes: {},
  },
  hygiene: {
    ok: false,
    results: {},
    failed: [],
  },
  safety: {
    contactWrites: 0,
    mediaAssetWrites: 0,
    homepageWrite: false,
    serviceAreasWrite: false,
    stateCityCreated: false,
    themeWrite: false,
    staticGeneration: false,
    deployment: false,
    dnsEmailProviderChange: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
    imageGeneration: false,
    imageModification: false,
    azureUpload: false,
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outDir, { recursive: true });
  try {
    state.start.cleanExceptRawInputs = cleanExceptRawInputs();
    state.start.api = await probe(apiBase);
    state.start.preview = await probe(`${webBase}/__preview/${tenantId}/contact`);
    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable at http://localhost:5064.');
    if (!state.start.preview.reachable || state.start.preview.status !== 200) throw new Error('Contact draft preview route is not reachable.');
    if (!state.inputs.candidateExists || !state.inputs.contactReadbackExists) throw new Error('Required contact candidate/readback files are missing.');

    auditImageInputs();
    writeReports();
    const approvedErrors = state.inputs.approved.flatMap((item) => item.blockers || []);
    if (state.inputs.approved.length !== 3 || approvedErrors.length) {
      throw new Error('Contact image input audit did not find three valid approved contact PNG inputs.');
    }

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before MediaAsset/CMS writes.');
    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before MediaAsset/CMS writes.');

    await captureBaselines();
    await createOrReuseContactMediaAssets();
    const candidate = buildMediaBoundCandidate();
    const pkg = buildPackage(candidate);
    writeJson(files.candidate, candidate);
    writeJson(files.pkg, pkg);

    runValidation(candidate);
    writeReports();
    if (!state.validation.ok) throw new Error(`Validation failed: ${state.validation.failed.join(', ')}.`);

    await importContact(candidate);
    if (!state.import.performed) throw new Error(`Contact import failed with HTTP ${state.import.httpStatus}.`);

    await verifyAfterWrite();
    if (!state.readback.ok) throw new Error(`Readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((item) => item === true)) throw new Error('Untouched route/theme/media verification failed.');

    await probeFrontendRoutes();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) state.blockers.push(`Final hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);

  state.success = state.blockers.length === 0 &&
    state.validation.ok &&
    state.import.performed &&
    state.readback.ok &&
    Object.values(state.untouched).every((item) => item === true) &&
    state.hygiene.ok;

  if (state.success && existsSync(tempJwtPath)) {
    rmSync(tempJwtPath, { force: true });
    state.auth.tempDeletedAfterSuccess = !existsSync(tempJwtPath);
  }
  if (!state.success) state.auth.tempRetainedOnFailure = existsSync(tempJwtPath);
  state.auth.tempFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  writeReports();

  console.log(JSON.stringify({
    success: state.success,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempFinalStatus: state.auth.tempFinalStatus,
      tokenPrinted: false,
    },
    approvedImages: state.inputs.approved.length,
    mediaAssets: {
      created: state.mediaAssets.created.map((item) => item.id),
      reused: state.mediaAssets.reused.map((item) => item.id),
      allowedChangedIds: state.mediaAssets.allowedChangedIds,
    },
    importPerformed: state.import.performed,
    readbackOk: state.readback.ok,
    untouched: state.untouched,
    frontend: state.frontend.routes,
    hygieneOk: state.hygiene.ok,
    blockers: state.blockers,
    report: rootReportRel,
    outputFolder: outRel,
  }, null, 2));

  if (!state.success) process.exitCode = 1;
}

function auditImageInputs() {
  const filesOnDisk = listFiles(abs(inputRootRel))
    .filter((file) => /\.(png|jpe?g|webp|svg)$/i.test(file))
    .sort((a, b) => rel(a).localeCompare(rel(b)));
  const audits = filesOnDisk.map(auditImageFile);
  state.inputs.audits = audits;
  state.inputs.approved = audits.filter((item) => item.approvedForContactPage);
  state.inputs.referenceOnly = audits.filter((item) => item.referenceOnly);
  state.inputs.rejected = audits.filter((item) => !item.approvedForContactPage && !item.referenceOnly);
  writeJson(files.imageAuditJson, {
    generatedAt,
    imageCount: audits.length,
    approvedCount: state.inputs.approved.length,
    referenceOnlyCount: state.inputs.referenceOnly.length,
    rejectedCount: state.inputs.rejected.length,
    audits,
  });
}

function auditImageFile(file) {
  const relativePath = rel(file);
  const name = path.basename(file);
  const extension = path.extname(file).toLowerCase();
  const bytes = readFileSync(file);
  const stat = statSync(file);
  const image = inspectImage(bytes, extension);
  const slotDefinition = approvedContactImageMap.find((item) => name.includes(item.match));
  const inContactImages = relativePath.startsWith(`${contactImagesRel}/`);
  const approvedForContactPage = Boolean(inContactImages && slotDefinition && allowedImageExtensions.has(extension) && image.ok);
  const referenceOnly = relativePath.includes('/extracted/') || relativePath.includes('\\extracted\\');
  const blockers = [];
  if (extension === '.svg') blockers.push('svg-upload-blocked-by-current-media-policy');
  if (!allowedImageExtensions.has(extension)) blockers.push('unsupported-extension-for-upload');
  if (!image.ok) blockers.push(image.error || 'invalid-image');
  return {
    filePath: relativePath,
    filename: name,
    extension,
    sizeBytes: stat.size,
    width: image.width,
    height: image.height,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    mimeType: image.mimeType,
    filenameSuggestsUsage: slotDefinition?.slot || inferUsageFromFilename(name),
    visualDescription: slotDefinition?.visualDescription || '',
    approvedForContactPage,
    referenceOnly,
    approvalReason: approvedForContactPage
      ? 'Approved contact page input: file is under contactimages and matches a planned contact slot.'
      : referenceOnly
        ? 'Reference-only extracted package asset; existing official MediaAssets should be reused instead of uploading a duplicate.'
        : 'Not approved for contact MediaAsset upload in this run.',
    matchedSlot: slotDefinition?.slot || '',
    blockers,
    existingMediaAssetMatch: null,
  };
}

function inspectImage(bytes, extension) {
  if (extension === '.png') {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    const ok = bytes.length >= 24 && signature.every((byte, index) => bytes[index] === byte);
    return ok
      ? { ok: true, mimeType: 'image/png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
      : { ok: false, mimeType: 'application/octet-stream', width: null, height: null, error: 'invalid-png-signature' };
  }
  if (extension === '.jpg' || extension === '.jpeg') {
    return inspectJpeg(bytes);
  }
  if (extension === '.webp') {
    const ok = bytes.length > 16 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    return { ok, mimeType: ok ? 'image/webp' : 'application/octet-stream', width: null, height: null, error: ok ? '' : 'invalid-webp-signature' };
  }
  if (extension === '.svg') {
    return { ok: false, mimeType: 'image/svg+xml', width: null, height: null, error: 'svg-upload-blocked' };
  }
  return { ok: false, mimeType: 'application/octet-stream', width: null, height: null, error: 'unsupported-extension' };
}

function inspectJpeg(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return { ok: false, mimeType: 'application/octet-stream', width: null, height: null, error: 'invalid-jpeg-signature' };
  }
  let index = 2;
  while (index + 9 < bytes.length) {
    if (bytes[index] !== 0xff) {
      index += 1;
      continue;
    }
    while (index < bytes.length && bytes[index] === 0xff) index += 1;
    const marker = bytes[index++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = bytes.readUInt16BE(index);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { ok: true, mimeType: 'image/jpeg', width: bytes.readUInt16BE(index + 5), height: bytes.readUInt16BE(index + 3) };
    }
    index += length;
  }
  return { ok: true, mimeType: 'image/jpeg', width: null, height: null };
}

function inferUsageFromFilename(name) {
  const lower = name.toLowerCase();
  if (lower.includes('logo')) return 'logo/reference';
  if (lower.includes('setup')) return 'setup/logistics';
  if (lower.includes('corporate')) return 'corporate event';
  if (lower.includes('holiday') || lower.includes('winter')) return 'winter event';
  if (lower.includes('chatgpt')) return 'contact image input';
  return 'unspecified image input';
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
  }
}

async function validateJwt() {
  const response = await apiJson(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}`, { token: jwt });
  state.auth.validation = response.ok ? 'VALID' : 'INVALID';
}

async function captureBaselines() {
  const [homepage, serviceAreas, contact, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('service-areas'),
    getPage(pageSlug),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!serviceAreas.ok) throw new Error(`/service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!contact.ok) throw new Error(`/contact baseline read failed with HTTP ${contact.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAssets baseline read failed with HTTP ${mediaAssets.status}.`);
  state.baseline = { homepage, serviceAreas, contact, theme, mediaAssets };
  state.mediaAssets.beforeCount = mediaAssetsFrom(mediaAssets.json).length;
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.serviceAreasBefore, serviceAreas.json);
  writeJson(files.contactBefore, contact.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);

  const assets = mediaAssetsFrom(mediaAssets.json);
  state.inputs.audits = state.inputs.audits.map((audit) => ({
    ...audit,
    existingMediaAssetMatch: findReusableAsset(assets, audit)?.id || null,
  }));
  state.inputs.approved = state.inputs.audits.filter((item) => item.approvedForContactPage);
  writeJson(files.imageAuditJson, {
    generatedAt,
    imageCount: state.inputs.audits.length,
    approvedCount: state.inputs.approved.length,
    referenceOnlyCount: state.inputs.referenceOnly.length,
    rejectedCount: state.inputs.rejected.length,
    audits: state.inputs.audits,
  });
}

async function createOrReuseContactMediaAssets() {
  const existingAssets = mediaAssetsFrom(state.baseline.mediaAssets.json);
  const results = [];
  for (const audit of state.inputs.approved) {
    const slot = approvedContactImageMap.find((item) => item.slot === audit.matchedSlot);
    let asset = findReusableAsset(existingAssets, audit);
    let reused = Boolean(asset);
    let created = false;
    if (!asset) {
      const uploaded = await uploadContactImage(audit, slot);
      if (!uploaded.ok) throw new Error(`MediaAsset upload failed for ${audit.filename} with HTTP ${uploaded.status}.`);
      asset = uploaded.json;
      created = true;
      state.safety.mediaAssetWrites += 1;
      existingAssets.push(asset);
    }
    const readback = await apiJson(`/api/admin/${tenantId}/media-assets/${encodeURIComponent(assetIdForRead(asset))}`, { token: jwt });
    if (!readback.ok) throw new Error(`MediaAsset readback failed for ${audit.filename} with HTTP ${readback.status}.`);
    const normalized = summarizeAsset(readback.json);
    if (normalized.checksum !== audit.sha256) throw new Error(`MediaAsset checksum mismatch for ${audit.filename}.`);
    const result = {
      slot: audit.matchedSlot,
      sourceFile: audit.filePath,
      created,
      reused,
      ...normalized,
    };
    results.push(result);
    if (created) state.mediaAssets.created.push(result);
    if (reused) state.mediaAssets.reused.push(result);
    state.mediaAssets.readbacks.push(result);
  }
  state.mediaAssets.allowedChangedIds = state.mediaAssets.created.map((item) => item.id);
  state.mediaAssets.result = 'completed';
  writeJson(files.mediaAssetApiResult, { generatedAt, results });
}

function findReusableAsset(assets, audit) {
  return assets.find((asset) => {
    const summary = summarizeAsset(asset);
    if (summary.tenantId !== tenantId || summary.siteKey !== siteKey) return false;
    if (['archived', 'replaced', 'deleted-pending'].includes(summary.status)) return false;
    const sameHash = summary.checksum === audit.sha256 || summary.hash === audit.sha256;
    const sameName = [summary.fileName, summary.originalFileName, summary.safeFileName]
      .filter(Boolean)
      .some((name) => name.toLowerCase() === audit.filename.toLowerCase());
    const sameSize = Number(summary.sizeBytes || 0) === Number(audit.sizeBytes || 0);
    return sameHash || (sameName && sameSize);
  }) || null;
}

async function uploadContactImage(audit, slot) {
  const bytes = readFileSync(abs(audit.filePath));
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: audit.mimeType }), audit.filename);
  form.append('siteKey', siteKey);
  form.append('title', slot.title);
  form.append('altText', slot.alt);
  form.append('caption', slot.caption);
  form.append('description', `${slot.visualDescription} Contact-page media slot ${slot.slot}.`);
  form.append('usageType', slot.usageType);
  form.append('credit', 'User-provided contact image input');
  form.append('license', audit.filename.toLowerCase().includes('chatgpt') ? 'ai_generated' : 'needs_review');
  form.append('licenseStatus', audit.filename.toLowerCase().includes('chatgpt') ? 'ai_generated' : 'needs_review');
  form.append('tags', ['contact', 'quote-request', 'ice-rink-rentals', 'portable-ice-rink', slot.slot].join(', '));
  const response = await fetch(`${apiBase}/api/admin/${tenantId}/media-assets/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, json: parseJson(text), safeText: scrub(text) };
}

function buildMediaBoundCandidate() {
  const page = clone(readJson(candidateRel));
  const existing = state.baseline.contact.json;
  page.id = existing?.id || existing?.PageId || page.id || 'ice-rink-rentals-contact';
  page.PageId = existing?.PageId || existing?.id || page.PageId || 'ice-rink-rentals-contact';
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.slug = pageSlug;
  page.pageSlug = pageSlug;
  page.PageSlug = pageSlug;
  page.route = route;
  page.path = route;
  page.canonicalUrl = canonicalUrl;
  page.isPublished = false;
  page.includeInSitemap = false;
  page.publishedAt = null;
  page.productionApproved = false;
  page.publishApproved = false;
  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    productionApproved: false,
    publishApproved: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: 'codex_contact_media_binding_import',
    lastEditedAt: new Date().toISOString(),
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: page.staticPublishing?.deploymentStatus || 'local_cms_draft_review_only_not_static_regenerated',
  };
  page.seo = {
    ...(page.seo || {}),
    canonicalUrl,
    robots: 'noindex,nofollow',
  };
  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'contact-media-binding-import',
    rollbackNotes: page.revision?.rollbackNotes || 'Latest pre-update snapshot is available for rollback.',
    lastChangeSource: requestedChangeSource,
    lastChangeSummary: `${requestedChangeSource}: bind approved contact image MediaAssets into /contact draft only; no homepage/service-areas/theme/static/deploy/provider/Roller action.`,
    lastChangeAt: new Date().toISOString(),
  };
  page.previousSlugs = Array.isArray(existing?.previousSlugs) ? existing.previousSlugs : (page.previousSlugs || []);
  page.redirects = Array.isArray(existing?.redirects) ? existing.redirects : (page.redirects || []);

  const slotAssets = Object.fromEntries(state.mediaAssets.readbacks.map((item) => [item.slot, item]));
  const hero = mediaRef(slotAssets.contactHeroImage, 'contactHeroImage');
  const quote = mediaRef(slotAssets.contactQuotePlanningImage, 'contactQuotePlanningImage');
  const setup = mediaRef(slotAssets.contactSetupLogisticsImage, 'contactSetupLogisticsImage');
  bindBlockMedia(page, 'contact-hero-media', hero, 'mainImage');
  bindBlockMedia(page, 'contact-quote-form-intro', quote, 'image');
  bindBlockMedia(page, 'about-ice-rink-rentals-contact', setup, 'image');
  bindOpenGraph(page, hero);
  ensureFormRouting(page);
  const ppecLogo = preservePpecLogo(page);

  page.media = {
    ...(page.media || {}),
    featuredImage: clone(hero),
    heroImage: clone(hero),
    openGraphImage: clone(hero),
    setupImage: clone(setup),
    contactHeroImage: hero,
    contactQuotePlanningImage: quote,
    contactSetupLogisticsImage: setup,
    contactOpenGraphImage: hero,
    contactPpecPartnerLogo: ppecLogo,
  };
  page.mediaRequirements = [
    ...(Array.isArray(page.mediaRequirements) ? page.mediaRequirements : []),
    ...[hero, quote, setup].map((ref) => ({
      requiredMediaSlotId: ref.requiredMediaSlotId,
      title: ref.title,
      mediaAssetId: ref.mediaAssetId,
      assetId: ref.assetId,
      publicUrl: ref.publicUrl,
      url: ref.url,
      alt: ref.alt,
      requiredBeforeCmsImport: true,
      status: 'mediaasset-bound',
    })),
  ];

  const text = JSON.stringify(page);
  state.binding.slots = [
    { slot: 'contactHeroImage', mediaAssetId: hero.mediaAssetId, targetBlockId: 'contact-hero-media' },
    { slot: 'contactQuotePlanningImage', mediaAssetId: quote.mediaAssetId, targetBlockId: 'contact-quote-form-intro' },
    { slot: 'contactSetupLogisticsImage', mediaAssetId: setup.mediaAssetId, targetBlockId: 'about-ice-rink-rentals-contact' },
    { slot: 'contactOpenGraphImage', mediaAssetId: hero.mediaAssetId, targetBlockId: 'seo.openGraph.image' },
  ];
  state.binding.newOrReusedIds = [...new Set([hero.mediaAssetId, quote.mediaAssetId, setup.mediaAssetId])];
  state.binding.ppecLogoPreserved = text.includes('ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae');
  state.binding.formPreserved = Boolean(findFormBlock(page));
  state.binding.ok = state.binding.newOrReusedIds.length === 3 && state.binding.ppecLogoPreserved && state.binding.formPreserved;
  return page;
}

function mediaRef(asset, slot) {
  return {
    mediaAssetId: asset.id,
    assetId: asset.assetId,
    requiredMediaSlotId: slot,
    mediaRequirementRef: slot,
    publicUrl: asset.publicUrl,
    url: asset.publicUrl,
    alt: asset.altText || asset.alt,
    altText: asset.altText || asset.alt,
    title: asset.title,
    caption: asset.caption,
    description: asset.notes || '',
    source: asset.source || 'User-provided contact image input',
    licenseStatus: asset.licenseStatus || 'needs_review',
    usageStatus: asset.usageStatus || 'needs_review',
    usageType: 'contact-page',
    status: 'mediaasset-bound',
    tags: ['contact', 'quote-request', 'ice-rink-rentals', 'portable-ice-rink', slot],
    decorative: false,
  };
}

function bindBlockMedia(page, blockId, media, urlKey) {
  const block = blocksOf(page).find((item) => item.id === blockId);
  if (!block) throw new Error(`Target contact block not found: ${blockId}.`);
  block.content = { ...(block.content || {}) };
  block.content.media = clone(media);
  block.content[`${urlKey}MediaAssetId`] = media.mediaAssetId;
  block.content[`${urlKey}AltText`] = media.alt;
  if (urlKey === 'image') {
    block.content.image = clone(media);
    block.content.imageUrl = media.publicUrl;
    block.content.imageAlt = media.alt;
  } else {
    block.content.image = media.publicUrl;
    block.content.imageAlt = media.alt;
    block.content[urlKey] = media.publicUrl;
  }
}

function bindOpenGraph(page, media) {
  page.seo ??= {};
  page.seo.openGraph = { ...(page.seo.openGraph || {}), image: clone(media), url: canonicalUrl };
  page.openGraph = { ...(page.openGraph || {}), image: clone(media), url: canonicalUrl };
}

function ensureFormRouting(page) {
  const formBlock = findFormBlock(page);
  if (!formBlock) throw new Error('Contact formBlock missing.');
  formBlock.content = {
    ...(formBlock.content || {}),
    formKey: 'default-quote-request',
    sourcePage: route,
    staticEndpointRef,
    leadRecipientRef,
    selectedMailboxMetadata: selectedMailbox,
    publicEmailDisplayPolicy,
    realEmailSendingEnabled: false,
    mailtoFallbackEnabled: false,
  };
}

function preservePpecLogo(page) {
  const text = JSON.stringify(page);
  if (!text.includes('ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae')) {
    throw new Error('Existing PPEC logo MediaAsset ID is not present in the contact candidate.');
  }
  const media = page.media || {};
  return clone(media.ppecPartnerLogo || media.logo || {
    mediaAssetId: 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
    assetId: 'partyproseastcoastlogo-cfd1fc9f60ae',
    requiredMediaSlotId: 'contactPpecPartnerLogo',
    mediaRequirementRef: 'contactPpecPartnerLogo',
    publicUrl: '',
    url: '',
    alt: 'Party Pros East Coast logo',
    title: 'Party Pros East Coast Logo',
    caption: '',
    description: '',
    source: 'existing-contact-ppec-partner-logo',
    licenseStatus: 'needs_review',
    usageStatus: 'needs_review',
    usageType: 'partner-logo',
    status: 'mediaasset-bound',
    tags: ['contact', 'ppec', 'partner-logo'],
    decorative: false,
  });
}

function buildPackage(candidate) {
  return {
    schemaVersion: 'pumpkin.ice.contact-media-bound-package.v1',
    generatedAt,
    tenantId,
    siteKey,
    route,
    sourceCandidate: candidateRel,
    sourceContactReadback: contactReadbackRel,
    imageAudit: files.imageAuditJson,
    mediaAssets: state.mediaAssets.readbacks,
    binding: state.binding,
    pages: [candidate],
    safety: state.safety,
  };
}

function runValidation(candidate) {
  writeValidation(files.jsonParse, jsonParseValidation([files.candidate, files.pkg]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(candidate));
  writeValidation(files.unsafeScan, unsafeScan([files.candidate]));
  writeValidation(files.contactusScan, stringScan([files.candidate], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.candidate, files.pkg]));
  writeValidation(files.defaultForm, defaultFormValidation(candidate));
  runImportPreflight(files.candidate, files.safePreflight);
  runDotNetContract(files.candidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand(files.defaultFormFixtures, ['node', 'tools/default-form-validation/validate-default-form-fixtures.mjs']);
  runSimpleCommand(files.tailwind, ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand(files.normalizer, ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  const required = [
    files.jsonParse,
    files.dotnet,
    files.productionPersistence,
    files.safePreflight,
    files.designSystem,
    files.mediaValidation,
    files.defaultForm,
    files.defaultFormFixtures,
    files.tailwind,
    files.normalizer,
    files.unsafeScan,
    files.contactusScan,
    files.routeCanonical,
    files.secretScan,
  ];
  state.validation.failed = required.filter((file) => state.validation.results[path.basename(file)]?.ok !== true).map((file) => path.basename(file));
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(candidate) {
  const text = JSON.stringify(activePageOnly(candidate));
  const formBlock = findFormBlock(candidate);
  const mediaIds = collectValuesByKey(activePageOnly(candidate), 'mediaAssetId').filter(Boolean);
  const checks = {
    routeContact: candidate.pageSlug === pageSlug && candidate.route === route && candidate.path === route,
    draftNeedsReview: candidate.isPublished === false && candidate.includeInSitemap === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: candidate.productionApproved !== true && candidate.workflow?.productionApproved !== true && candidate.staticPublishing?.productionApproved !== true,
    publishApprovedFalse: candidate.publishApproved !== true && candidate.workflow?.publishApproved !== true && candidate.workflow?.approvedForPublish !== true,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(text),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(text) && !/"mailtoFallbackEnabled"\s*:\s*true/i.test(text) && !/"mailtoLinksEnabled"\s*:\s*true/i.test(text),
    contactMediaIdsPersist: state.binding.newOrReusedIds.every((id) => mediaIds.includes(id)),
    ppecLogoPersists: text.includes('ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae'),
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replaceAll('/service-areas', '').replaceAll('/contact', '')),
  };
  return withFailed(checks);
}

function routeCanonicalAudit(candidate) {
  return withFailed({
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    route: candidate.route === route,
    path: candidate.path === route,
    canonicalUrl: candidate.canonicalUrl === canonicalUrl,
    seoCanonicalUrl: candidate.seo?.canonicalUrl === canonicalUrl,
  });
}

function defaultFormValidation(candidate) {
  const formBlock = findFormBlock(candidate);
  return withFailed({
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    noRawFormHtml: !/<\s*(form|input|textarea|select|button)\b/i.test(JSON.stringify(formBlock || {})),
    noRealEmailSending: formBlock?.content?.realEmailSendingEnabled !== true,
  });
}

function runImportPreflight(candidatePath, outputPath) {
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidatePath,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', route,
    '--mode', 'preflight-only',
    '--output', outputPath,
  ], 240000);
  const parsed = existsSync(abs(outputPath)) ? readJson(outputPath) : {};
  const shapeOk = parsed.classification?.['preflight-valid-for-shape'] === true;
  const dotnetOk = parsed.checks?.some((item) => item.check === 'dotnet-page-contract' && item.status === 'passed');
  parsed.ok = result.status === 0 && shapeOk && dotnetOk;
  parsed.command = commandSummary(result);
  writeValidation(outputPath, parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-contact-media-contract-${process.pid}-${Date.now()}`);
  const publishDir = path.join(scratch, 'publish');
  const buildRoot = path.join(scratch, 'bin');
  const objRoot = path.join(scratch, 'obj');
  mkdirSync(publishDir, { recursive: true });
  const project = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'Pumpkin.PageContractTool.csproj');
  const publish = run('dotnet', [
    'publish', project, '-c', 'Debug', '-o', publishDir,
    '-p:UseSharedCompilation=false',
    '-p:GenerateAssemblyInfo=false',
    '-p:GenerateTargetFrameworkAttribute=false',
    `-p:BaseOutputPath=${buildRoot}${path.sep}`,
    `-p:BaseIntermediateOutputPath=${objRoot}${path.sep}`,
  ], 300000);
  const dll = path.join(publishDir, 'Pumpkin.PageContractTool.dll');
  const validate = publish.status === 0 && existsSync(dll)
    ? run('dotnet', [dll, 'validate-page', '--path', abs(candidatePath)], 240000)
    : { status: -1, stdout: '', stderr: 'publish failed', signal: null };
  const parsed = parseJson(validate.stdout.trim());
  writeValidation(files.dotnet, {
    ok: validate.status === 0 && inferOk(parsed, validate),
    publish: commandSummary(publish),
    validate: commandSummary(validate),
    parsed,
  });
}

function runSimpleCommand(file, args) {
  const result = run(args[0], args.slice(1), 240000);
  const parsed = parseJson(result.stdout.trim());
  writeValidation(file, {
    ok: result.status === 0 && inferOk(parsed, result),
    command: commandSummary(result),
    parsed,
  });
}

async function importContact(candidate) {
  state.import.attempted = true;
  const changeSummary = `${requestedChangeSource}: bind approved contact image MediaAssets into /contact draft only; keep draft/needs_review and no homepage/service-areas/theme/static/deploy/provider/Roller action.`;
  const query = new URLSearchParams({ changeSource: apiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${pageSlug}?${query}`;
  state.import.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${apiChangeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.import.httpStatus = response.status;
  state.import.performed = response.ok;
  if (response.ok) state.safety.contactWrites += 1;
}

async function verifyAfterWrite() {
  const [contact, homepage, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  writeJson(files.contactAfter, contact.json || { status: contact.status });
  writeJson(files.homepageAfter, homepage.json || { status: homepage.status });
  writeJson(files.serviceAreasAfter, serviceAreas.json || { status: serviceAreas.status });
  writeJson(files.themeAfter, theme.json || { status: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { status: mediaAssets.status });
  const page = contact.json || {};
  const text = JSON.stringify(activePageOnly(page));
  const formBlock = findFormBlock(page);
  const mediaIds = collectValuesByKey(activePageOnly(page), 'mediaAssetId').filter(Boolean);
  state.readback.checks = {
    httpOk: contact.ok && contact.status === 200,
    routeContact: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    draftNeedsReview: page.isPublished === false && page.includeInSitemap === false && page.workflow?.status === 'draft' && page.workflow?.reviewStatus === 'needs_review',
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes(publicEmailDisplayPolicy),
    mediaAssetIdsPersist: state.binding.newOrReusedIds.every((id) => mediaIds.includes(id)),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(text),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(text) && !/"mailtoFallbackEnabled"\s*:\s*true/i.test(text) && !/"mailtoLinksEnabled"\s*:\s*true/i.test(text),
  };
  state.readback.failed = Object.entries(state.readback.checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.ok = state.readback.failed.length === 0;
  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baseline.homepage.hash;
  state.untouched.serviceAreasUnchanged = serviceAreas.ok && serviceAreas.hash === state.baseline.serviceAreas.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baseline.theme.hash;
  state.untouched.mediaAssetsAllowedChangesOnly = mediaAssetChangesAllowed(mediaAssets.json);
  state.mediaAssets.afterCount = mediaAssetsFrom(mediaAssets.json).length;
}

function mediaAssetChangesAllowed(afterJson) {
  const before = mediaAssetsFrom(state.baseline.mediaAssets.json).map(summarizeAsset);
  const after = mediaAssetsFrom(afterJson).map(summarizeAsset);
  const beforeIds = new Set(before.map((item) => item.id));
  const added = after.filter((item) => !beforeIds.has(item.id)).map((item) => item.id).sort();
  const allowed = state.mediaAssets.allowedChangedIds.slice().sort();
  if (JSON.stringify(added) !== JSON.stringify(allowed)) return false;
  const beforeById = new Map(before.map((item) => [item.id, item]));
  return after.every((item) => {
    if (allowed.includes(item.id)) return true;
    const prior = beforeById.get(item.id);
    return prior ? stableStringify(prior) === stableStringify(item) : false;
  });
}

async function probeFrontendRoutes() {
  const urls = {
    contactPreview: `${webBase}/__preview/${tenantId}/contact`,
    homepage: `${webBase}/`,
    serviceAreas: `${webBase}/service-areas`,
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => [key, await probe(url)]));
  for (const [key, value] of entries) {
    state.frontend.routes[key] = { url: urls[key], reachable: value.reachable, status: value.status, length: value.length };
  }
  state.frontend.checked = true;
  writeJson(files.frontendProbe, state.frontend.routes);
}

function runHygieneChecks() {
  const taskFiles = unique([...listFiles(outDir).filter(isTextFile), abs(rootReportRel)].filter(existsSync));
  const gitDiff = run('git', ['diff', '--check'], 120000);
  state.hygiene.results.gitDiffCheck = commandSummary(gitDiff);
  state.hygiene.results.nodeCheckRunner = commandSummary(run('node', ['--check', `${outRel}/run-contact-media-binding.mjs`], 120000));
  state.hygiene.results.trailingWhitespaceScan = trailingWhitespaceScan(taskFiles);
  state.hygiene.results.protectedGeneratedRawArtifactPathCheck = protectedGeneratedRawArtifactPathCheck();
  state.hygiene.results.targetedSecretScan = secretScan(taskFiles.map(rel));
  state.hygiene.results.stagedArtifactCheck = stagedArtifactCheck();
  state.hygiene.failed = Object.entries({
    gitDiffCheck: gitDiff.status === 0,
    nodeCheckRunner: state.hygiene.results.nodeCheckRunner.ok,
    trailingWhitespaceScan: state.hygiene.results.trailingWhitespaceScan.ok,
    protectedGeneratedRawArtifactPathCheck: state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok,
    targetedSecretScan: state.hygiene.results.targetedSecretScan.ok,
    stagedArtifactCheck: state.hygiene.results.stagedArtifactCheck.ok,
  }).filter(([, ok]) => !ok).map(([key]) => key);
  state.hygiene.ok = state.hygiene.failed.length === 0;
  writeJson(files.hygiene, state.hygiene);
}

function writeReports() {
  writeMd(files.readme, `# Ice Contact Media Binding

Generated: ${generatedAt}

Scope: audit contact image inputs, create or reuse local MediaAsset records for approved contact images, bind them into the local CMS /contact draft, and verify preview readiness.

No static generation, deployment, DNS/email/provider, protected config, or Roller work is included.`);

  writeMd(files.audit, `# Contact Image Input Audit

Image inputs found under \`${inputRootRel}\`: ${state.inputs.audits.length}

Approved contact images: ${state.inputs.approved.length}

Reference-only extracted assets: ${state.inputs.referenceOnly.length}

${table(['File', 'Ext', 'Size', 'Dimensions', 'SHA-256', 'Usage', 'Approved', 'Existing MediaAsset'], state.inputs.audits.map((item) => [
    item.filePath,
    item.extension,
    item.sizeBytes,
    item.width && item.height ? `${item.width}x${item.height}` : 'unknown',
    item.sha256,
    item.filenameSuggestsUsage,
    yn(item.approvedForContactPage),
    item.existingMediaAssetMatch || 'none',
  ]))}

The three files under \`${contactImagesRel}\` are treated as approved contact page inputs. Extracted package assets are reference-only because equivalent official MediaAssets already exist or should be reused.`);

  writeMd(files.slotPlan, `# Contact Media Slot Plan

${table(['Slot', 'Source', 'Target', 'Usage'], approvedContactImageMap.map((slot) => {
    const audit = state.inputs.approved.find((item) => item.matchedSlot === slot.slot);
    return [slot.slot, audit?.filePath || 'not found', slot.targetBlockId, slot.visualDescription];
  }))}

Additional slots:

- \`contactOpenGraphImage\`: reuses \`contactHeroImage\`.
- \`contactPpecPartnerLogo\`: reuses existing \`ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae\`.

The API allows persisted \`usageType\` values such as \`hero\`, \`card\`, and \`og-image\`; contact-page intent is recorded through slot IDs, tags, captions, notes, and page bindings.`);

  writeMd(files.mediaAssetResult, `# Contact MediaAsset Result

MediaAsset lifecycle result: ${state.mediaAssets.result}

Created:

${listOrNone(state.mediaAssets.created.map((item) => `${item.id} (${item.slot}) - ${item.publicUrl}`))}

Reused:

${listOrNone(state.mediaAssets.reused.map((item) => `${item.id} (${item.slot}) - ${item.publicUrl}`))}

Readbacks:

${table(['Slot', 'MediaAsset ID', 'Asset ID', 'Status', 'Usage Type', 'Checksum'], state.mediaAssets.readbacks.map((item) => [item.slot, item.id, item.assetId, item.status, item.usageType, item.checksum]))}

No Azure upload was performed. Local uploads used the authenticated local-dev MediaAsset endpoint.`);

  writeMd(files.bindingResult, `# Contact Binding Result

Binding ok: ${yn(state.binding.ok)}

${table(['Slot', 'MediaAsset ID', 'Target Block'], state.binding.slots.map((item) => [item.slot, item.mediaAssetId, item.targetBlockId]))}

- PPEC logo preserved: ${yn(state.binding.ppecLogoPreserved)}
- formBlock preserved: ${yn(state.binding.formPreserved)}
- Candidate: \`${files.candidate}\`
- Package: \`${files.pkg}\``);

  const validationRows = [
    ['JSON parse', resultName(files.jsonParse)],
    ['.NET Page/block contract', resultName(files.dotnet)],
    ['production-field persistence', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.safePreflight)],
    ['design-system', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['default form', resultName(files.defaultForm)],
    ['default form fixtures', resultName(files.defaultFormFixtures)],
    ['Tailwind/navigation', resultName(files.tailwind)],
    ['page intake normalizer', resultName(files.normalizer)],
    ['unsafe scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['route/canonical audit', resultName(files.routeCanonical)],
    ['targeted secret scan', resultName(files.secretScan)],
  ];

  writeMd(files.validationResults, `# Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Check', 'Result'], validationRows)}

Failed checks:

${listOrNone(state.validation.failed)}

Hygiene:

${table(['Check', 'Result'], Object.entries(state.hygiene.results || {}).map(([key, value]) => [key, value?.ok === true ? 'pass' : value ? 'fail' : 'not run']))}`);

  writeMd(files.importResult, `# Import Result

- Import attempted: ${yn(state.import.attempted)}
- Import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- Requested changeSource: \`${requestedChangeSource}\`
- API changeSource used: \`${apiChangeSource}\`
- /contact writes: ${state.safety.contactWrites}
- Homepage write: no
- /service-areas write: no
- Theme write: no
- Static generation: no
- Deployment/provider/email/DNS action: no`);

  writeMd(files.readbackVerification, `# Readback Verification

Readback ok: ${yn(state.readback.ok)}

${table(['Check', 'Result'], Object.entries(state.readback.checks || {}).map(([key, value]) => [key, yn(value)]))}

Failed checks:

${listOrNone(state.readback.failed)}

Untouched:

${table(['Record', 'Result'], [
    ['Homepage / unchanged', yn(state.untouched.homepageUnchanged)],
    ['/service-areas unchanged', yn(state.untouched.serviceAreasUnchanged)],
    ['Theme unchanged', yn(state.untouched.themeUnchanged)],
    ['MediaAssets allowed changes only', yn(state.untouched.mediaAssetsAllowedChangesOnly)],
  ])}`);

  writeMd(files.frontendChecklist, `# Frontend Preview Checklist

Frontend probes:

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.frontend.routes || {}).map(([key, value]) => [key, value.url, value.status, value.reachable ? 'yes' : 'no']))}

Review:

- Open \`http://localhost:3002/__preview/ice-rink-rentals/contact\`.
- Paste a local admin JWT in the preview form.
- Confirm hero, quote planning, setup/logistics media, PPEC partner block, and formBlock render.
- Public homepage and /service-areas should still render normally.`);

  writeMd(files.blockers, `# Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before live approval:

- Manual browser review of the contact draft preview is still required.
- productionApproved and publishApproved remain false.

Before static generation/deployment:

- Static generation and deployment were not authorized.
- DNS/email/provider changes remain out of scope.

Roller remains paused.`);

  writeJson(files.manifest, {
    schemaVersion: state.schemaVersion,
    generatedAt,
    site: 'IceSkatingRinkRentals.com',
    tenantId,
    siteKey,
    route,
    branch: state.start.branch,
    outputFolder: outRel,
    rootReport: rootReportRel,
    files,
    images: state.inputs,
    mediaAssets: state.mediaAssets,
    binding: state.binding,
    validation: state.validation,
    import: state.import,
    readback: state.readback,
    untouched: state.untouched,
    frontend: state.frontend,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempInitialStatus: state.auth.tempInitialStatus,
      tempFinalStatus: state.auth.tempFinalStatus,
      tokenPrinted: false,
    },
    safety: state.safety,
    blockers: state.blockers,
  });

  writeMd(rootReportRel, `# Pumpkin Ice Contact Media Binding Report

Generated: ${generatedAt}

## Scope

Primary site: IceSkatingRinkRentals.com.

Updated local CMS \`/contact\` draft only when validation passed. Homepage \`/\`, \`/service-areas\`, Theme, static generation, deployment, DNS/email/provider, protected config, email sending, and Roller were not touched.

## Start

Branch: \`${state.start.branch}\`

Git status at start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

Clean except raw contact/service-area input artifacts: ${yn(state.start.cleanExceptRawInputs)}

API reachable: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Contact draft preview route reachable: ${yn(state.start.preview?.reachable && state.start.preview?.status === 200)}

## Image Inputs

Images found: ${state.inputs.audits.length}

Approved contact image inputs: ${state.inputs.approved.length}

${table(['File', 'Approved', 'Slot', 'Dimensions'], state.inputs.audits.map((item) => [
    item.filePath,
    yn(item.approvedForContactPage),
    item.matchedSlot || 'reference-only',
    item.width && item.height ? `${item.width}x${item.height}` : 'unknown',
  ]))}

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Temp JWT final status: ${state.auth.tempFinalStatus}

## MediaAssets

- Created: ${state.mediaAssets.created.length}
- Reused: ${state.mediaAssets.reused.length}
- MediaAsset IDs: ${state.binding.newOrReusedIds.map((id) => `\`${id}\``).join(', ') || 'none'}
- New raw input images staged: no
- Image generation/editing: no

## Binding

Contact media binding ok: ${yn(state.binding.ok)}

${table(['Slot', 'MediaAsset ID', 'Target'], state.binding.slots.map((item) => [item.slot, item.mediaAssetId, item.targetBlockId]))}

PPEC logo preserved: ${yn(state.binding.ppecLogoPreserved)}

## Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Check', 'Result'], validationRows)}

## Import

- Import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`

## Readback

Readback ok: ${yn(state.readback.ok)}

${table(['Check', 'Result'], Object.entries(state.readback.checks || {}).map(([key, value]) => [key, yn(value)]))}

## Untouched

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /service-areas unchanged: ${yn(state.untouched.serviceAreasUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged except newly created contact image records: ${yn(state.untouched.mediaAssetsAllowedChangesOnly)}

## Frontend Preview

${table(['Route', 'URL', 'Status'], Object.entries(state.frontend.routes || {}).map(([key, value]) => [key, value.url, value.status]))}

## Hygiene

- git diff --check: ${state.hygiene.results.gitDiffCheck ? yn(state.hygiene.results.gitDiffCheck.ok) : 'not run'}
- node --check runner: ${state.hygiene.results.nodeCheckRunner ? yn(state.hygiene.results.nodeCheckRunner.ok) : 'not run'}
- trailing whitespace scan: ${state.hygiene.results.trailingWhitespaceScan ? yn(state.hygiene.results.trailingWhitespaceScan.ok) : 'not run'}
- protected/generated/raw artifact path check: ${state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? yn(state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok) : 'not run'}
- targeted secret scan: ${state.hygiene.results.targetedSecretScan ? yn(state.hygiene.results.targetedSecretScan.ok) : 'not run'}
- no ZIP/raw media/extracted/static artifacts staged: ${state.hygiene.results.stagedArtifactCheck ? yn(state.hygiene.results.stagedArtifactCheck.ok) : 'not run'}

## Remaining Blockers

${listOrNone(state.blockers)}

## Next Recommended Action

Open \`http://localhost:3002/__preview/ice-rink-rentals/contact\`, paste a local admin JWT, and visually review the media-bound contact draft. Live promotion and static generation remain separate approvals.`);
}

function jsonParseValidation(paths) {
  const results = paths.map((file) => {
    try {
      JSON.parse(readFileSync(abs(file), 'utf8').replace(/^\uFEFF/, ''));
      return { path: file, ok: true };
    } catch (error) {
      return { path: file, ok: false, error: safeMessage(error) };
    }
  });
  return { ok: results.every((item) => item.ok), results };
}

function unsafeScan(paths) {
  return scanPatterns(paths, [
    ['script-tag', /<script\b/i],
    ['event-handler', /\son[a-z]+\s*=/i],
    ['javascript-url', /javascript:/i],
    ['data-image', /data:image\//i],
    ['base64-marker', /\bbase64\b/i],
    ['raw-form', /<form\b/i],
    ['raw-input', /<input\b/i],
    ['raw-textarea', /<textarea\b/i],
    ['raw-select', /<select\b/i],
    ['mailto-link', /mailto:/i],
    ['raw-cf7', /contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i],
  ]);
}

function stringScan(paths, needle) {
  const hits = paths.filter((file) => readFileSync(abs(file), 'utf8').includes(needle)).map((file) => ({ path: file }));
  return { ok: hits.length === 0, hits };
}

function secretScan(paths) {
  return scanPatterns(paths.filter((file) => existsSync(abs(file)) && isTextFile(abs(file))), [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt-value', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['smtp-secret', /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD)\b\s*[:=]/i],
  ]);
}

function scanPatterns(paths, patterns) {
  const hits = [];
  for (const file of paths) {
    const text = readFileSync(abs(file), 'utf8');
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push({ path: file, code });
  }
  return { ok: hits.length === 0, hits };
}

function protectedGeneratedRawArtifactPathCheck() {
  const lines = git(['status', '--short', '--untracked-files=all']).split(/\r?\n/).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  const rawHits = [];
  const allowedReferenceRaw = [];
  for (const line of lines) {
    const file = line.slice(3).replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) continue;
    if (file.startsWith('content-review/ice-final-contact-input/') || file.startsWith('content-review/ice-service-areas-input/')) allowedReferenceRaw.push(file);
    else rawHits.push(file);
  }
  return { ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0, protectedHits, generatedHits, rawHits, allowedReferenceRaw };
}

function stagedArtifactCheck() {
  const staged = git(['diff', '--cached', '--name-only']).split(/\r?\n/).filter(Boolean).map((item) => item.replace(/\\/g, '/'));
  const raw = staged.filter((file) => /\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file));
  const extracted = staged.filter((file) => file.startsWith('content-review/ice-final-contact-input/extracted/') || file.startsWith('content-review/ice-service-areas-input/extracted/'));
  const statics = staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file));
  return { ok: raw.length === 0 && extracted.length === 0 && statics.length === 0, stagedCount: staged.length, raw, extracted, statics };
}

function trailingWhitespaceScan(paths) {
  const hits = [];
  for (const file of paths.filter(isTextFile)) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push(`${rel(file)}:${index + 1}`);
    });
  }
  return { ok: hits.length === 0, hits };
}

async function getPage(slug) {
  return apiJson(`/api/admin/pages/${tenantId}/${encodeURIComponent(slug)}`, { token: jwt });
}

async function apiJson(endpoint, options = {}) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
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
      hash: response.status === 404 ? null : hash(stableStringify(sanitizeForHash(json))),
    };
  } catch (error) {
    return { ok: false, status: 0, json: null, safeText: safeMessage(error), hash: null };
  }
}

async function probe(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    return { reachable: true, status: response.status, length: text.length };
  } catch (error) {
    return { reachable: false, status: 0, length: null, error: safeMessage(error) };
  }
}

function mediaAssetsFrom(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.mediaAssets)) return value.mediaAssets;
  return [];
}

function summarizeAsset(asset) {
  return {
    id: asset?.id || '',
    tenantId: asset?.tenantId || '',
    siteKey: asset?.siteKey || '',
    assetId: asset?.assetId || '',
    status: asset?.status || '',
    publicUrl: asset?.publicUrl || asset?.url || '',
    fileName: asset?.fileName || '',
    originalFileName: asset?.originalFileName || '',
    safeFileName: asset?.safeFileName || '',
    title: asset?.title || '',
    alt: asset?.alt || '',
    altText: asset?.altText || asset?.alt || '',
    caption: asset?.caption || '',
    source: asset?.source || asset?.credit || '',
    licenseStatus: asset?.licenseStatus || '',
    usageStatus: asset?.usageStatus || '',
    usageType: asset?.usageType || '',
    checksum: asset?.checksum || asset?.hash || '',
    hash: asset?.hash || asset?.checksum || '',
    storageProvider: asset?.storageProvider || '',
    sizeBytes: asset?.sizeBytes || asset?.fileSize || 0,
    width: asset?.width || null,
    height: asset?.height || null,
    mimeType: asset?.mimeType || '',
  };
}

function assetIdForRead(asset) {
  return asset?.id || asset?.assetId || '';
}

function blocksOf(page) {
  return Array.isArray(page?.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
}

function findFormBlock(page) {
  return blocksOf(page).find((block) => block.type === 'formBlock' || block.id === 'contact-quote-form') || null;
}

function collectValuesByKey(value, key, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectValuesByKey(item, key, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === key && typeof v === 'string' && v) out.push(v);
      collectValuesByKey(v, key, out);
    }
  }
  return out;
}

function activePageOnly(page) {
  const copy = clone(page || {});
  if (copy.revision) delete copy.revision.latestSnapshot;
  return copy;
}

function writeValidation(file, value) {
  const withTime = { generatedAt: new Date().toISOString(), ...sanitize(value) };
  state.validation.results[path.basename(file)] = withTime;
  writeJson(file, withTime);
}

function resultName(file) {
  const result = state.validation.results[path.basename(file)] || readJsonIfExists(file);
  if (!result) return 'not run';
  if (result.skipped && result.ok) return 'pass (skipped)';
  return result.ok ? 'pass' : 'fail';
}

function withFailed(checks) {
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, checks, failed };
}

function inferOk(parsed, result) {
  if (result.status !== 0) return false;
  if (parsed && typeof parsed === 'object' && typeof parsed.ok === 'boolean') return parsed.ok === true;
  if (parsed && typeof parsed === 'object' && typeof parsed.Ok === 'boolean') return parsed.Ok === true;
  return true;
}

function cleanExceptRawInputs() {
  const lines = state.start.gitStatusShort.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return true;
  return lines.every((line) => {
    if (!line.startsWith('?? ')) return false;
    const file = line.slice(3).replace(/^"|"$/g, '').replace(/\\/g, '/');
    return file.startsWith('content-review/ice-final-contact-input/') || file.startsWith('content-review/ice-service-areas-input/');
  });
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

function isTextFile(file) {
  return /\.(md|json|mjs|js|ts|tsx|cs|txt|html|css)$/i.test(file) && existsSync(file) && !statSync(file).isDirectory();
}

function run(command, args, timeout = 120000) {
  return spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', timeout, shell: false, windowsHide: true });
}

function commandSummary(result) {
  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal || null,
    stdout: scrub((result.stdout || '').slice(0, 20000)),
    stderr: scrub((result.stderr || '').slice(0, 20000)),
  };
}

function scrub(value) {
  return String(value || '')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[JWT_REDACTED]')
    .replace(/AccountKey=[A-Za-z0-9+/=]+/g, 'AccountKey=[REDACTED]');
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => {
    if (/^(targetedSecretScan|secretScan)$|secret-scan|targeted-secret-scan/i.test(key) && typeof val !== 'string') return val;
    if (/password|secret|connectionString|apiKey|privateKey|authorization/i.test(key)) return '[redacted]';
    if (/token|jwt/i.test(key) && typeof val === 'string' && !/^(PRESENT|MISSING|VALID|INVALID|temp|env|none)$/i.test(val)) return '[redacted]';
    if (typeof val === 'string') return scrub(val);
    return val;
  }));
}

function sanitizeForHash(value) {
  const copy = clone(value);
  if (copy && typeof copy === 'object') {
    delete copy.updatedAt;
    delete copy.UpdatedAt;
    if (copy.MetaData) delete copy.MetaData.updatedAt;
    if (copy.revision) {
      delete copy.revision.lastChangeAt;
      delete copy.revision.lastRevisionAt;
      delete copy.revision.lastSnapshotAt;
      if (copy.revision.latestSnapshot) delete copy.revision.latestSnapshot;
    }
    if (copy.workflow) delete copy.workflow.lastEditedAt;
  }
  return copy;
}

function stableStringify(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sortKeys(v)]));
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function unique(values) {
  return Array.from(new Set(values));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text.replace(/^\uFEFF/, '')) : null;
  } catch {
    return null;
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(abs(file), 'utf8').replace(/^\uFEFF/, ''));
}

function readJsonIfExists(file) {
  return existsSync(abs(file)) ? readJson(file) : null;
}

function writeJson(file, value) {
  const full = abs(file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, `${JSON.stringify(sanitize(value), null, 2)}\n`, 'utf8');
}

function writeMd(file, value) {
  const full = abs(file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, `${String(value).trim()}\n`, 'utf8');
}

function abs(file) {
  return path.isAbsolute(file) ? file : path.join(repoRoot, file);
}

function rel(file) {
  return path.relative(repoRoot, path.resolve(file)).replace(/\\/g, '/');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return result.stdout || '';
}

function safeMessage(error) {
  return scrub(error?.message || String(error));
}

function yn(value) {
  return value === true ? 'yes' : value === false ? 'no' : 'n/a';
}

function listOrNone(items) {
  return items?.length ? items.map((item) => `- ${item}`).join('\n') : '- None.';
}

function table(headers, rows) {
  const escapeCell = (value) => String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n');
}
