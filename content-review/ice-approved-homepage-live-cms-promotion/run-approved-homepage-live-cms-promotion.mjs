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
const outputRel = 'content-review/ice-approved-homepage-live-cms-promotion';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_APPROVED_HOMEPAGE_LIVE_CMS_PROMOTION_REPORT.md';
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const requestedChangeSource = 'approved_homepage_live_cms_promotion';
const apiChangeSource = 'lifecycle_action';
const expectedPpecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const generatedAt = new Date().toISOString();
const promotionCandidateRel = `${outputRel}/homepage-live-cms-promotion-candidate.json`;
const homepageBeforeRel = `${outputRel}/current-homepage-before-live-cms-promotion.snapshot.json`;
const homepageReadbackRel = `${outputRel}/homepage-readback-after-live-cms-promotion.json`;
const requiredArtifactPaths = [
  'content-review/ice-ppec-first-banner-copy-update/homepage-readback-after-first-ppec-banner-copy-update.json',
  'content-review/ice-ppec-logo-replacement/homepage-readback-after-logo-replacement.json',
  'content-review/ice-ppec-visual-brand-repair/manifest.json',
  'content-review/ice-approved-homepage-local-draft-import/homepage-readback-after-approved-import.json',
];
const exactPpecCopy = {
  eyebrow: 'PARTNER RESOURCE',
  headline: 'Planning more than the rink?',
  body: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs photo booths, concessions, carnival rides, interactive games, arcade games, casino-style games, and more, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
  primaryCtaLabel: 'Explore Party Pros East Coast',
  secondaryCtaLabel: 'Request Ice Rink Rental Info',
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.approved-homepage.live-cms-promotion.v1',
  generatedAt,
  tenantId,
  siteKey,
  outputFolder: outputRel,
  rootReport: rootReportRel,
  selectedHomepageSource: {
    mode: 'current-admin-homepage-readback',
    route: '/',
    expectedPageId: 'ice-rink-rentals-home',
    provenanceArtifacts: requiredArtifactPaths,
  },
  start: {
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    branch: git(['branch', '--show-current']),
    ppecFirstBannerDirtyGate: null,
    api: null,
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    presence: 'MISSING',
    source: 'none',
    validation: 'MISSING',
    validationHttpStatus: null,
    tokenPrinted: false,
    tempDeletedAfterSuccess: false,
    tempRetainedOnFailure: false,
    tempJwtFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  artifactCheck: {
    ok: false,
    artifacts: [],
    failed: [],
  },
  baselines: {
    captured: false,
    homepage: null,
    contact: null,
    serviceAreas: null,
    theme: null,
    mediaAssets: null,
    beforeSummary: null,
  },
  validation: {
    ok: false,
    hardBlockers: [],
    expectedUnresolvedItems: [],
    results: {},
  },
  promotion: {
    candidateCreated: false,
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
    changeSourceRequested: requestedChangeSource,
    changeSourceUsed: apiChangeSource,
    changedFields: [],
    safeText: '',
  },
  readback: {
    performed: false,
    ok: false,
    failed: [],
    checks: {},
    afterSummary: null,
  },
  routes: {
    publicHome: { checked: false },
    draftPreview: { checked: false },
  },
  untouched: {
    contactUnchanged: null,
    serviceAreasUnchangedOr404: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
  },
  hygiene: {
    ok: false,
    results: {},
    failed: [],
  },
  safety: {
    homepageCmsWrite: false,
    contactCmsWrite: false,
    serviceAreasWrite: false,
    stateCityCreated: false,
    themeWrite: false,
    mediaAssetWrite: false,
    staticGeneration: false,
    azureDeploy: false,
    dnsCloudflareMicrosoft365BluehostEmailProviderChange: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
  },
  remainingBlockers: {
    beforeStaticGeneration: [],
    beforeAzureDeployment: [],
    beforeProductionDns: [],
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  try {
    state.start.ppecFirstBannerDirtyGate = ppecFirstBannerDirtyGate(state.start.gitStatusShort);
    if (!state.start.ppecFirstBannerDirtyGate.ok) {
      throw new Error('Uncommitted PPEC first banner copy update files are present; commit the report/package before live CMS promotion.');
    }

    state.start.api = await probe(apiBase);
    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable at http://localhost:5064.');

    state.artifactCheck = verifyRequiredArtifacts();
    if (!state.artifactCheck.ok) throw new Error(`Required approved homepage provenance artifacts are missing or invalid: ${state.artifactCheck.failed.join(', ')}.`);

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();
    const candidate = preparePromotionCandidate(state.baselines.homepage.json);
    writeJson(promotionCandidateRel, candidate);
    state.promotion.candidateCreated = true;
    state.promotion.changedFields = diffLifecycleFields(state.baselines.homepage.json, candidate);

    await runPrePromotionValidation(candidate);
    writeReports();
    if (!state.validation.ok) throw new Error(`Pre-promotion validation failed: ${state.validation.hardBlockers.join('; ')}.`);

    await promoteHomepage(candidate);
    if (!state.promotion.performed) throw new Error(`Homepage promotion failed with HTTP ${state.promotion.httpStatus}.`);

    await verifyAfterPromotion(candidate);
    if (!state.readback.ok) throw new Error(`Homepage readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((value) => value === true)) throw new Error('Untouched route/theme/media verification failed.');

    await probeRoutes();
    if (state.routes.publicHome.status !== 200) throw new Error(`Public homepage probe failed with HTTP ${state.routes.publicHome.status}.`);

    state.remainingBlockers = buildRemainingBlockers();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) state.blockers.push(`Final hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);

  state.success = state.blockers.length === 0 &&
    state.validation.ok === true &&
    state.promotion.performed === true &&
    state.readback.ok === true &&
    state.hygiene.ok === true;

  writeReports();

  if (state.success && existsSync(tempJwtPath)) {
    rmSync(tempJwtPath, { force: true });
    state.auth.tempDeletedAfterSuccess = true;
  }

  if (!state.success) {
    state.auth.tempRetainedOnFailure = existsSync(tempJwtPath);
  }
  state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  writeReports();

  console.log(JSON.stringify({
    success: state.success,
    blockers: state.blockers,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    promotion: {
      attempted: state.promotion.attempted,
      performed: state.promotion.performed,
      httpStatus: state.promotion.httpStatus,
      changeSourceUsed: state.promotion.changeSourceUsed,
    },
    readback: {
      ok: state.readback.ok,
      failed: state.readback.failed,
    },
    untouched: state.untouched,
    publicHome: state.routes.publicHome,
    report: rootReportRel,
  }, null, 2));

  if (!state.success) process.exitCode = 1;
}

function ppecFirstBannerDirtyGate(statusText) {
  const lines = statusText.split(/\r?\n/).filter(Boolean);
  const blocking = lines.filter((line) => {
    const file = line.slice(3).replace(/\\/g, '/');
    return file === 'PUMPKIN_ICE_PPEC_FIRST_BANNER_COPY_UPDATE_REPORT.md' ||
      file.startsWith('content-review/ice-ppec-first-banner-copy-update/');
  });
  return { ok: blocking.length === 0, blocking };
}

function verifyRequiredArtifacts() {
  const artifacts = requiredArtifactPaths.map((item) => {
    const abs = path.join(repoRoot, item);
    const exists = existsSync(abs);
    let parseOk = false;
    if (exists) {
      try {
        JSON.parse(readFileSync(abs, 'utf8').replace(/^\uFEFF/, ''));
        parseOk = true;
      } catch {
        parseOk = false;
      }
    }
    return { path: item, exists, parseOk };
  });
  const failed = artifacts.filter((item) => !item.exists || !item.parseOk).map((item) => item.path);
  return { ok: failed.length === 0, artifacts, failed };
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
  const response = await apiJson(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET', token: jwt });
  state.auth.validationHttpStatus = response.status;
  state.auth.validation = response.ok ? 'VALID' : 'INVALID';
}

async function captureBaselines() {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);

  state.baselines = {
    captured: true,
    homepage,
    contact,
    serviceAreas,
    theme,
    mediaAssets,
    beforeSummary: summarizePage(homepage.json),
  };

  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!contact.ok) throw new Error(`Contact baseline read failed with HTTP ${contact.status}.`);
  if (!(serviceAreas.ok || serviceAreas.status === 404)) throw new Error(`Service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);

  writeJson(homepageBeforeRel, homepage.json);
  writeJson(`${outputRel}/contact-before-live-cms-promotion.snapshot.json`, contact.json || { httpStatus: contact.status });
  writeJson(`${outputRel}/service-areas-before-live-cms-promotion.snapshot.json`, serviceAreas.json || { httpStatus: serviceAreas.status, status: serviceAreas.status === 404 ? 'expected-not-found' : 'not-captured' });
  writeJson(`${outputRel}/theme-before-live-cms-promotion.snapshot.json`, theme.json || { httpStatus: theme.status });
  writeJson(`${outputRel}/media-assets-before-live-cms-promotion.snapshot.json`, mediaAssets.json || { httpStatus: mediaAssets.status });
}

function preparePromotionCandidate(homepage) {
  const page = clone(homepage);
  const now = new Date().toISOString();
  page.tenantId = tenantId;
  page.pageSlug = 'home';
  if (Object.prototype.hasOwnProperty.call(page, 'PageSlug')) delete page.PageSlug;
  if (Object.prototype.hasOwnProperty.call(page, 'siteKey')) page.siteKey = siteKey;
  if (Object.prototype.hasOwnProperty.call(page, 'domain')) page.domain = domain;
  if (Object.prototype.hasOwnProperty.call(page, 'slug')) page.slug = 'home';
  if (Object.prototype.hasOwnProperty.call(page, 'route')) page.route = '/';
  if (Object.prototype.hasOwnProperty.call(page, 'path')) page.path = '/';
  page.isPublished = true;
  page.includeInSitemap = true;
  page.publishedAt = page.publishedAt || now;
  page.workflow = {
    ...(page.workflow || {}),
    status: 'published',
    reviewStatus: 'approved',
    approvedForPublish: true,
    approvedBy: page.workflow?.approvedBy || 'User visual approval',
    approvedAt: page.workflow?.approvedAt || now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: true,
    needsRebuild: true,
    deploymentStatus: 'pending_rebuild',
  };
  return page;
}

function diffLifecycleFields(source, candidate) {
  const fields = [
    'isPublished',
    'includeInSitemap',
    'publishedAt',
    'workflow.status',
    'workflow.reviewStatus',
    'workflow.approvedForPublish',
    'workflow.approvedBy',
    'workflow.approvedAt',
    'staticPublishing.staticEligible',
    'staticPublishing.needsRebuild',
    'staticPublishing.deploymentStatus',
  ];
  return fields.filter((field) => stableStringify(getPath(source, field)) !== stableStringify(getPath(candidate, field)));
}

async function runPrePromotionValidation(candidate) {
  const candidatePath = path.join(repoRoot, promotionCandidateRel);
  const filesForContentScans = [candidatePath, ...requiredArtifactPaths.map((item) => path.join(repoRoot, item))];

  writeValidation('json-parse-validation-result.json', jsonParseValidation([candidatePath, ...requiredArtifactPaths.map((item) => path.join(repoRoot, item))]));
  writeValidation('approved-artifact-presence-result.json', state.artifactCheck);
  writeValidation('homepage-promotion-guardrail-result.json', homepagePromotionGuardrail(state.baselines.homepage.json, candidate));
  writeValidation('production-field-persistence-validation-result.json', productionFieldPersistenceValidation(state.baselines.homepage.json, candidate));
  writeValidation('route-canonical-audit-result.json', routeCanonicalAudit(candidate));
  writeValidation('unsafe-scan-result.json', unsafeScan(filesForContentScans));
  writeValidation('contactus-scan-result.json', stringScan(filesForContentScans, legacyMailbox));
  writeValidation('targeted-secret-scan-result.json', secretScan(filesForContentScans));
  runImportPreflight();
  runDotNetContract(candidatePath);
  runContractPersistence(candidatePath);
  runSimpleCommand('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const hardRequired = [
    'json-parse-validation-result.json',
    'approved-artifact-presence-result.json',
    'homepage-promotion-guardrail-result.json',
    'production-field-persistence-validation-result.json',
    'route-canonical-audit-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'homepage-import-preflight-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
  ];

  state.validation.hardBlockers = hardRequired
    .filter((name) => state.validation.results[name]?.ok !== true)
    .map((name) => `${name} failed`);
  state.validation.expectedUnresolvedItems = expectedPreflightItems(state.validation.results['homepage-import-preflight-result.json']);
  state.validation.ok = state.validation.hardBlockers.length === 0;
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
  return { ok: results.every((item) => item.ok), generatedAt: new Date().toISOString(), results };
}

function homepagePromotionGuardrail(source, candidate) {
  const sourceComparable = normalizeForLifecycleDiff(source);
  const candidateComparable = normalizeForLifecycleDiff(candidate);
  const ppec = findPpecBlocks(candidate)[0];
  const ppecText = JSON.stringify(ppec?.block || {});
  const forbiddenWords = ['tables', 'tents', 'chairs', 'seating', 'staging'];
  const forbiddenHits = forbiddenWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(ppecText));
  const activeSourceMedia = unique(collectValuesByKey(activePageOnly(source), 'mediaAssetId')).sort();
  const activeCandidateMedia = unique(collectValuesByKey(activePageOnly(candidate), 'mediaAssetId')).sort();
  const checks = {
    onlyLifecycleFieldsChanged: hash(stableStringify(sourceComparable)) === hash(stableStringify(candidateComparable)),
    routeHome: candidate.pageSlug === 'home' && (!candidate.route || candidate.route === '/') && (!candidate.path || candidate.path === '/'),
    liveCmsState: candidate.isPublished === true && candidate.includeInSitemap === true && typeof candidate.publishedAt === 'string' && candidate.publishedAt.length > 0,
    workflowPublishedApproved: candidate.workflow?.status === 'published' && candidate.workflow?.reviewStatus === 'approved' && candidate.workflow?.approvedForPublish === true,
    approvalMetadataRecorded: Boolean(candidate.workflow?.approvedBy) && Boolean(candidate.workflow?.approvedAt),
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    ppecLogoIdPersists: JSON.stringify(activePageOnly(candidate)).includes(expectedPpecLogoId),
    exactPpecEyebrow: ppec?.content.eyebrow === exactPpecCopy.eyebrow,
    exactPpecHeadline: ppec?.content.headline === exactPpecCopy.headline || ppec?.content.title === exactPpecCopy.headline,
    exactPpecBody: ppec?.content.description === exactPpecCopy.body || ppec?.content.subtitle === exactPpecCopy.body,
    exactPpecPrimaryCta: ppec?.content.partnerCtaLabel === exactPpecCopy.primaryCtaLabel || ppec?.content.cta?.label === exactPpecCopy.primaryCtaLabel,
    exactPpecSecondaryCta: ppec?.content.secondaryButtonText === exactPpecCopy.secondaryCtaLabel,
    ppecForbiddenTermsAbsent: forbiddenHits.length === 0,
    selectedMailboxPersists: JSON.stringify(activePageOnly(candidate)).includes(selectedMailbox),
    publicEmailPolicyPersists: JSON.stringify(activePageOnly(candidate)).includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !JSON.stringify(activePageOnly(candidate)).includes(legacyMailbox),
    officialHomepageMediaIdsUnchanged: stableStringify(activeSourceMedia) === stableStringify(activeCandidateMedia),
    noContactRouteChangeInPayload: candidate.pageSlug === 'home',
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, generatedAt: new Date().toISOString(), checks, failed, forbiddenHits, activeSourceMedia, activeCandidateMedia };
}

function productionFieldPersistenceValidation(source, candidate) {
  const checks = {
    isPublishedChangedToTrue: source.isPublished !== true && candidate.isPublished === true,
    includeInSitemapChangedToTrue: source.includeInSitemap !== true && candidate.includeInSitemap === true,
    publishedAtCreatedOrPreserved: Boolean(candidate.publishedAt),
    workflowStatusSupported: ['approved', 'published'].includes(candidate.workflow?.status),
    reviewStatusApproved: candidate.workflow?.reviewStatus === 'approved',
    approvedForPublishTrue: candidate.workflow?.approvedForPublish === true,
    approvalMetadataPresent: Boolean(candidate.workflow?.approvedBy) && Boolean(candidate.workflow?.approvedAt),
    staticEligibleTrue: candidate.staticPublishing?.staticEligible === true,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    unsupportedProductionApprovedNotInvented: !Object.prototype.hasOwnProperty.call(candidate, 'productionApproved') && !Object.prototype.hasOwnProperty.call(candidate.workflow || {}, 'productionApproved') && !Object.prototype.hasOwnProperty.call(candidate.staticPublishing || {}, 'productionApproved'),
    unsupportedPublishApprovedNotInvented: !Object.prototype.hasOwnProperty.call(candidate, 'publishApproved') && !Object.prototype.hasOwnProperty.call(candidate.workflow || {}, 'publishApproved'),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, generatedAt: new Date().toISOString(), checks, failed };
}

function routeCanonicalAudit(candidate) {
  const text = JSON.stringify(activePageOnly(candidate));
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKeyPresent: candidate.siteKey === siteKey || !candidate.siteKey,
    pageSlugHome: candidate.pageSlug === 'home',
    routeHome: (!candidate.route || candidate.route === '/') && (!candidate.path || candidate.path === '/'),
    canonical: candidate.canonicalUrl === `https://${domain}/` || candidate.seo?.canonicalUrl === `https://${domain}/`,
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(text),
    noServiceAreasPagePayload: candidate.pageSlug !== 'service-areas',
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, generatedAt: new Date().toISOString(), checks, failed };
}

function unsafeScan(files) {
  const patterns = [
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
  ];
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push({ path: rel(file), code });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function stringScan(files, needle) {
  const hits = [];
  for (const file of files) if (readFileSync(file, 'utf8').includes(needle)) hits.push({ path: rel(file) });
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function secretScan(files) {
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
  ];
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push({ path: rel(file), code });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function runImportPreflight() {
  const output = path.join(outputDir, 'homepage-import-preflight-result.json');
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', promotionCandidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', '/',
    '--mode', 'preflight-only',
    '--output', rel(output),
  ], 240000);
  const parsed = existsSync(output) ? readJson(output) : {};
  const expectedOnly = expectedPreflightItems(parsed);
  const cmsBlockers = parsed?.blockers?.cmsImport || [];
  const unexpectedCmsBlockers = cmsBlockers.filter((item) => !isExpectedPreflightBlocker(item));
  const ok = parsed.classification?.['preflight-valid-for-shape'] === true &&
    unexpectedCmsBlockers.length === 0;
  parsed.ok = ok;
  parsed.acceptedForThisCmsPromotion = ok;
  parsed.expectedUnresolvedItemsForLaterStaticOrProductionWork = expectedOnly;
  parsed.unexpectedCmsPromotionBlockers = unexpectedCmsBlockers;
  parsed.command = commandSummary(result);
  writeValidation('homepage-import-preflight-result.json', parsed);
}

function expectedPreflightItems(parsed) {
  const blockers = [
    ...(parsed?.blockers?.cmsImport || []),
    ...(parsed?.blockers?.staticRegeneration || []),
    ...(parsed?.blockers?.production || []),
  ];
  return blockers
    .filter((item) => isExpectedPreflightBlocker(item))
    .map((item) => ({
      stage: item.stage || 'later-work',
      check: item.check || '',
      field: item.field || '',
      message: item.message || '',
    }));
}

function isExpectedPreflightBlocker(item) {
  return /public email display policy|publicContactEmail|static regeneration|staticPublishing|service-area wording|workflow\.approvedForImport/i.test(`${item.message || ''} ${item.field || ''}`);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-live-cms-promotion-contract-${process.pid}-${Date.now()}`);
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
    ? run('dotnet', [dll, 'validate-page', '--path', candidatePath], 240000)
    : { status: -1, stdout: '', stderr: 'publish failed', signal: null };
  const parsed = parseJson(validate.stdout.trim());
  const ok = validate.status === 0 && inferOk(parsed, validate);
  writeValidation('dotnet-page-contract-result.json', {
    ok,
    generatedAt: new Date().toISOString(),
    publish: commandSummary(publish),
    validate: commandSummary(validate),
    parsed,
  });
}

function runContractPersistence(candidatePath) {
  const output = path.join(outputDir, 'contract-persistence-validation-result.json');
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', rel(candidatePath),
    '--output', rel(output),
  ], 180000);
  const parsed = existsSync(output) ? readJson(output) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  writeValidation('contract-persistence-validation-result.json', parsed);
}

function runSimpleCommand(name, args) {
  const result = run(args[0], args.slice(1), 240000);
  const parsed = parseJson(result.stdout.trim());
  const ok = inferOk(parsed, result);
  writeValidation(name, {
    ok,
    generatedAt: new Date().toISOString(),
    command: commandSummary(result),
    parsed,
  });
}

async function promoteHomepage(candidate) {
  const query = new URLSearchParams({
    changeSource: apiChangeSource,
    changeSummary: `${requestedChangeSource}: user visually approved homepage live CMS promotion; homepage route / only; no contact, service-area, theme, media, static generation, deployment, DNS, email, provider, protected config, or Roller action.`,
  });
  state.promotion.attempted = true;
  state.promotion.endpoint = `PUT /api/admin/pages/${tenantId}/home?changeSource=${apiChangeSource}`;
  const response = await apiJson(`/api/admin/pages/${tenantId}/home?${query}`, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.promotion.httpStatus = response.status;
  state.promotion.performed = response.ok;
  state.promotion.safeText = response.safeText;
  state.safety.homepageCmsWrite = response.ok;
  writeJson(`${outputRel}/homepage-live-cms-promotion-write-result.json`, {
    ok: response.ok,
    status: response.status,
    page: response.json,
    safeText: response.safeText,
  });
}

async function verifyAfterPromotion(candidate) {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);

  state.readback.performed = true;
  state.readback.afterSummary = summarizePage(homepage.json);
  writeJson(homepageReadbackRel, homepage.json || { httpStatus: homepage.status });

  const page = homepage.json || {};
  const before = state.baselines.homepage.json || {};
  const activeText = JSON.stringify(activePageOnly(page));
  const ppec = findPpecBlocks(page)[0];
  const ppecText = JSON.stringify(ppec?.block || {});
  const beforeRevision = before.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const mediaBefore = unique(collectValuesByKey(activePageOnly(before), 'mediaAssetId')).sort();
  const mediaAfter = unique(collectValuesByKey(activePageOnly(page), 'mediaAssetId')).sort();
  const checks = {
    http200: homepage.status === 200,
    routeHome: page.pageSlug === 'home' && (!page.route || page.route === '/') && (!page.path || page.path === '/'),
    livePublishedState: page.isPublished === true && page.includeInSitemap === true && Boolean(page.publishedAt),
    workflowPublishedApproved: page.workflow?.status === 'published' && page.workflow?.reviewStatus === 'approved' && page.workflow?.approvedForPublish === true,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    staticEligibleTrue: page.staticPublishing?.staticEligible === true,
    revisionIncremented: Number.isFinite(beforeRevision) && Number.isFinite(afterRevision) ? afterRevision > beforeRevision : true,
    rollbackMetadataExists: page.revision?.rollbackAvailable === true && Boolean(page.revision?.latestSnapshot),
    changeSourcePersistedAsSupportedLifecycle: page.revision?.lastChangeSource === apiChangeSource,
    changeSummaryContainsRequestedSource: String(page.revision?.lastChangeSummary || '').includes(requestedChangeSource),
    ppecLogoIdPersists: activeText.includes(expectedPpecLogoId),
    exactPpecEyebrow: ppec?.content.eyebrow === exactPpecCopy.eyebrow,
    exactPpecHeadline: ppec?.content.headline === exactPpecCopy.headline || ppec?.content.title === exactPpecCopy.headline,
    exactPpecBody: ppec?.content.description === exactPpecCopy.body || ppec?.content.subtitle === exactPpecCopy.body,
    exactPpecPrimaryCta: ppec?.content.partnerCtaLabel === exactPpecCopy.primaryCtaLabel || ppec?.content.cta?.label === exactPpecCopy.primaryCtaLabel,
    exactPpecSecondaryCta: ppec?.content.secondaryButtonText === exactPpecCopy.secondaryCtaLabel,
    noForbiddenPpecBannerTerms: !/\b(tables|tents|chairs|seating|staging)\b/i.test(ppecText),
    selectedMailbox: activeText.includes(selectedMailbox),
    publicEmailPolicy: activeText.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !activeText.includes(legacyMailbox),
    officialHomepageMediaIdsPersist: stableStringify(mediaBefore) === stableStringify(mediaAfter),
    activeContentExceptLifecyclePreserved: hash(stableStringify(normalizeForPostWriteDiff(before))) === hash(stableStringify(normalizeForPostWriteDiff(page))),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.checks = checks;
  state.readback.failed = failed;
  state.readback.ok = failed.length === 0;

  state.untouched.contactUnchanged = contact.ok && contact.hash === state.baselines.contact.hash;
  state.untouched.serviceAreasUnchangedOr404 = state.baselines.serviceAreas.status === 404
    ? serviceAreas.status === 404
    : serviceAreas.ok && serviceAreas.hash === state.baselines.serviceAreas.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;

  writeJson(`${outputRel}/contact-after-live-cms-promotion.readonly.json`, contact.json || { httpStatus: contact.status });
  writeJson(`${outputRel}/service-areas-after-live-cms-promotion.readonly.json`, serviceAreas.json || { httpStatus: serviceAreas.status, status: serviceAreas.status === 404 ? 'expected-not-found' : 'not-captured' });
  writeJson(`${outputRel}/theme-after-live-cms-promotion.readonly.json`, theme.json || { httpStatus: theme.status });
  writeJson(`${outputRel}/media-assets-after-live-cms-promotion.readonly.json`, mediaAssets.json || { httpStatus: mediaAssets.status });
}

async function probeRoutes() {
  const publicHome = await probe(`${webBase}/`);
  const draftPreview = await probe(`${webBase}/__preview/${tenantId}/home`);
  state.routes.publicHome = {
    checked: true,
    url: `${webBase}/`,
    status: publicHome.status,
    reachable: publicHome.reachable,
    length: publicHome.length,
    approvedCopyVisible: typeof publicHome.text === 'string' && publicHome.text.includes(exactPpecCopy.headline),
  };
  state.routes.draftPreview = {
    checked: true,
    url: `${webBase}/__preview/${tenantId}/home`,
    status: draftPreview.status,
    reachable: draftPreview.reachable,
    length: draftPreview.length,
    approvedCopyVisible: typeof draftPreview.text === 'string' && draftPreview.text.includes(exactPpecCopy.headline),
  };
  writeJson(`${outputRel}/public-route-probe-result.json`, {
    publicHome: state.routes.publicHome,
    draftPreview: state.routes.draftPreview,
  });
}

function buildRemainingBlockers() {
  return {
    beforeStaticGeneration: [
      'Static generation remains separately unauthorized for this run.',
      'Review staticPublishing.needsRebuild after this live CMS promotion.',
      'Public email display policy remains form-first-under-review.',
    ],
    beforeAzureDeployment: [
      'Azure deployment remains separately unauthorized for this run.',
      'Generate and validate static output only after explicit approval.',
      'Do not advance Roller; Roller remains paused.',
    ],
    beforeProductionDns: [
      'DNS, Cloudflare, Microsoft 365, Bluehost, and provider changes remain separately unauthorized.',
      'Email sending/provider configuration remains untouched and under review.',
    ],
  };
}

function runHygieneChecks() {
  const changedOutputFiles = outputFiles();
  const rootReport = path.join(repoRoot, rootReportRel);
  const filesToScan = unique([path.join(outputDir, 'run-approved-homepage-live-cms-promotion.mjs'), rootReport, ...changedOutputFiles])
    .filter((file) => existsSync(file) && !statSync(file).isDirectory());
  const gitDiffCheck = run('git', ['diff', '--check'], 120000);
  const trailingWhitespace = trailingWhitespaceScan(filesToScan);
  const targetedSecret = secretScan(filesToScan);
  const artifactPaths = artifactPathCheck();
  const staged = stagedArtifactCheck();
  state.hygiene.results = {
    gitDiffCheck: commandSummary(gitDiffCheck),
    trailingWhitespaceScan: trailingWhitespace,
    targetedSecretScan: targetedSecret,
    protectedGeneratedRawArtifactPathCheck: artifactPaths,
    stagedArtifactCheck: staged,
  };
  const checks = {
    gitDiffCheck: gitDiffCheck.status === 0,
    trailingWhitespaceScan: trailingWhitespace.ok,
    targetedSecretScan: targetedSecret.ok,
    protectedGeneratedRawArtifactPathCheck: artifactPaths.ok,
    stagedArtifactCheck: staged.ok,
  };
  state.hygiene.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.hygiene.ok = state.hygiene.failed.length === 0;
}

function trailingWhitespaceScan(files) {
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push(`${rel(file)}:${index + 1}`);
    });
  }
  return { ok: hits.length === 0, hits };
}

function artifactPathCheck() {
  const status = git(['status', '--short', '--untracked-files=all']);
  const lines = status.split(/\r?\n/).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|dist|build|out|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  const rawHits = lines.filter((line) => {
    const file = line.slice(3).replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) return false;
    return file !== 'content-review/ice-ppec-logo-replacement-input/PartyProsEastCoastLogo.png';
  });
  return { ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0, protectedHits, generatedHits, rawHits };
}

function stagedArtifactCheck() {
  const staged = git(['diff', '--cached', '--name-only']).split(/\r?\n/).filter(Boolean).map((item) => item.replace(/\\/g, '/'));
  const zipStaged = staged.filter((file) => /\.(zip|7z|tar|gz)$/i.test(file));
  const rawMediaStaged = staged.filter((file) => /\.(png|jpe?g|gif|webp|avif|pdf)$/i.test(file));
  const extractedInputStaged = staged.filter((file) => /(^|\/)(extracted|input)(\/|$)/i.test(file));
  const staticArtifactsStaged = staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file));
  return {
    ok: zipStaged.length === 0 && rawMediaStaged.length === 0 && extractedInputStaged.length === 0 && staticArtifactsStaged.length === 0,
    zipStaged,
    rawMediaStaged,
    extractedInputStaged,
    staticArtifactsStaged,
  };
}

function writeValidation(name, value) {
  const normalized = { generatedAt: new Date().toISOString(), ...value };
  state.validation.results[name] = summarizeValidation(normalized);
  writeJson(`${outputRel}/${name}`, normalized);
}

function summarizeValidation(value) {
  return {
    ok: value.ok === true,
    failed: value.failed || value.hits || value.blockers || [],
    decisions: value.decisions || undefined,
    classification: value.classification || undefined,
  };
}

function writeReports() {
  writeJson(`${outputRel}/manifest.json`, sanitize(state));
  writeText(`${outputRel}/README.md`, `# Ice Approved Homepage Live CMS Promotion

Status: ${state.success ? 'completed' : state.blockers.length ? 'blocked or incomplete' : 'in progress'}.

This folder contains the homepage-only live CMS promotion artifacts for IceSkatingRinkRentals.com.

Scope:
- Homepage route \`/\`: ${yn(state.promotion.performed)}
- \`/contact\`: no write
- \`/service-areas\`: no write
- Theme: no write
- MediaAssets: no write
- Static generation: no
- Azure deployment: no
- DNS/email/provider changes: no
- Roller: paused
`);
  writeText(`${outputRel}/PRE_PROMOTION_VALIDATION.md`, `# Pre-Promotion Validation

- Validation ok: ${yn(state.validation.ok)}
- JSON parse validation: ${yn(state.validation.results['json-parse-validation-result.json']?.ok)}
- .NET Page/block contract validation: ${yn(state.validation.results['dotnet-page-contract-result.json']?.ok)}
- Production-field persistence validation: ${yn(state.validation.results['production-field-persistence-validation-result.json']?.ok)}
- Safe import preflight accepted for this CMS promotion: ${yn(state.validation.results['homepage-import-preflight-result.json']?.ok)}
- Design-system validation command ok: ${yn(state.validation.results['design-system-validation-result.json']?.ok)}
- Media validation command ok: ${yn(state.validation.results['media-validation-result.json']?.ok)}
- Tailwind/navigation validation command ok: ${yn(state.validation.results['tailwind-navigation-validation-result.json']?.ok)}
- Page intake normalizer validation command ok: ${yn(state.validation.results['page-intake-normalizer-validation-result.json']?.ok)}
- Unsafe scan ok: ${yn(state.validation.results['unsafe-scan-result.json']?.ok)}
- \`contactus@\` scan ok: ${yn(state.validation.results['contactus-scan-result.json']?.ok)}
- Route/canonical audit ok: ${yn(state.validation.results['route-canonical-audit-result.json']?.ok)}
- Targeted secret scan ok: ${yn(state.validation.results['targeted-secret-scan-result.json']?.ok)}

Hard blockers:

${state.validation.hardBlockers.length ? state.validation.hardBlockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Expected unresolved items for later static/deploy/DNS work:

${state.validation.expectedUnresolvedItems.length ? state.validation.expectedUnresolvedItems.map((item) => `- ${item.field || item.check}: ${item.message}`).join('\n') : '- None recorded by preflight.'}
`);
  writeText(`${outputRel}/BASELINE_SNAPSHOTS.md`, `# Baseline Snapshots

- Homepage snapshot: \`${homepageBeforeRel}\`
- Contact snapshot: \`${outputRel}/contact-before-live-cms-promotion.snapshot.json\`
- Service areas snapshot: \`${outputRel}/service-areas-before-live-cms-promotion.snapshot.json\`
- Theme snapshot: \`${outputRel}/theme-before-live-cms-promotion.snapshot.json\`
- MediaAssets snapshot: \`${outputRel}/media-assets-before-live-cms-promotion.snapshot.json\`

Homepage before summary:

\`\`\`json
${JSON.stringify(state.baselines.beforeSummary || {}, null, 2)}
\`\`\`
`);
  writeText(`${outputRel}/HOMEPAGE_LIVE_CMS_PROMOTION_RESULT.md`, `# Homepage Live CMS Promotion Result

- Promotion attempted: ${yn(state.promotion.attempted)}
- Promotion performed: ${yn(state.promotion.performed)}
- HTTP status: ${state.promotion.httpStatus ?? 'not-applicable'}
- Route: \`/\`
- API change source used: \`${state.promotion.changeSourceUsed}\`
- Requested source recorded in summary: \`${state.promotion.changeSourceRequested}\`
- Homepage CMS write: ${yn(state.safety.homepageCmsWrite)}

Lifecycle fields changed in candidate:

${state.promotion.changedFields.length ? state.promotion.changedFields.map((item) => `- ${item}`).join('\n') : '- None.'}

No \`/contact\`, \`/service-areas\`, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, email send, or Roller action was performed.
`);
  writeText(`${outputRel}/HOMEPAGE_READBACK_VERIFICATION.md`, `# Homepage Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.ok)}
- Route \`/\`: ${yn(state.readback.checks.routeHome)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- staticPublishing.needsRebuild true: ${yn(state.readback.checks.staticNeedsRebuildTrue)}
- Revision incremented: ${yn(state.readback.checks.revisionIncremented)}
- Rollback metadata exists: ${yn(state.readback.checks.rollbackMetadataExists)}
- PPEC logo ID persisted: ${yn(state.readback.checks.ppecLogoIdPersists)}
- PPEC copy/CTA persisted: ${yn(state.readback.checks.exactPpecEyebrow && state.readback.checks.exactPpecHeadline && state.readback.checks.exactPpecBody && state.readback.checks.exactPpecPrimaryCta && state.readback.checks.exactPpecSecondaryCta)}
- Selected mailbox persisted: ${yn(state.readback.checks.selectedMailbox)}
- Public email display policy persisted: ${yn(state.readback.checks.publicEmailPolicy)}
- No \`contactus@\`: ${yn(state.readback.checks.noLegacyMailbox)}
- Official homepage media IDs persisted: ${yn(state.readback.checks.officialHomepageMediaIdsPersist)}

Failed checks:

${state.readback.failed.length ? state.readback.failed.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(`${outputRel}/PUBLIC_ROUTE_VERIFICATION.md`, `# Public Route Verification

- Public route checked: ${yn(state.routes.publicHome.checked)}
- Public route URL: \`${webBase}/\`
- Public route HTTP status: ${state.routes.publicHome.status ?? 'not-checked'}
- Public route approved copy visible: ${yn(state.routes.publicHome.approvedCopyVisible)}

- Draft preview checked: ${yn(state.routes.draftPreview.checked)}
- Draft preview URL: \`${webBase}/__preview/${tenantId}/home\`
- Draft preview HTTP status: ${state.routes.draftPreview.status ?? 'not-checked'}
- Draft preview approved copy visible: ${yn(state.routes.draftPreview.approvedCopyVisible)}
`);
  writeText(`${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`, `# Untouched Routes Verification

- \`/contact\` unchanged: ${yn(state.untouched.contactUnchanged)}
- \`/service-areas\` unchanged or still 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- \`/state-city\` created: no
`);
  writeText(`${outputRel}/AUTH_LIFECYCLE_RESULT.md`, `# Auth Lifecycle Result

- Env auth status: ${state.auth.envStatus}
- Temp auth initial status: ${state.auth.tempInitialStatus}
- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- Token printed: no
- Temp JWT deleted after successful completion: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}
`);
  writeText(`${outputRel}/REMAINING_BLOCKERS.md`, `# Remaining Blockers

Run blockers:

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Before static generation:

${state.remainingBlockers.beforeStaticGeneration.length ? state.remainingBlockers.beforeStaticGeneration.map((item) => `- ${item}`).join('\n') : '- None recorded.'}

Before Azure deployment:

${state.remainingBlockers.beforeAzureDeployment.length ? state.remainingBlockers.beforeAzureDeployment.map((item) => `- ${item}`).join('\n') : '- None recorded.'}

Before production DNS:

${state.remainingBlockers.beforeProductionDns.length ? state.remainingBlockers.beforeProductionDns.map((item) => `- ${item}`).join('\n') : '- None recorded.'}
`);
  writeText(rootReportRel, `# Pumpkin Ice Approved Homepage Live CMS Promotion Report

Date: ${generatedAt}

## Status

${state.success ? 'Completed successfully.' : 'Blocked or incomplete.'}

## Start

Branch: \`${state.start.branch || 'unknown'}\`

Git status at start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12 || 'not captured'}
\`\`\`

API reachable: ${state.start.api?.reachable ? `yes, HTTP ${state.start.api.status}` : 'no'}

## Selected Homepage Source

- Source mode: current admin homepage readback
- Homepage page id before: \`${state.baselines.beforeSummary?.pageId || 'not captured'}\`
- Provenance artifacts checked: ${yn(state.artifactCheck.ok)}

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- Token/JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## Validation

- Pre-promotion validation ok: ${yn(state.validation.ok)}
- Hard blockers: ${state.validation.hardBlockers.length ? state.validation.hardBlockers.join(', ') : 'none'}
- Expected later-work blockers: ${state.validation.expectedUnresolvedItems.length}

## Promotion

- Promotion performed: ${yn(state.promotion.performed)}
- HTTP status: ${state.promotion.httpStatus ?? 'not-applicable'}
- Route: \`/\`
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`
- CMS live/published fields changed: ${state.promotion.changedFields.length ? state.promotion.changedFields.join(', ') : 'none'}
- Revision/rollback result: revision incremented ${yn(state.readback.checks.revisionIncremented)}, rollback metadata exists ${yn(state.readback.checks.rollbackMetadataExists)}

## Readback

- Homepage readback ok: ${yn(state.readback.ok)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- PPEC logo persistence: ${yn(state.readback.checks.ppecLogoIdPersists)}
- PPEC copy/CTA persistence: ${yn(state.readback.checks.exactPpecEyebrow && state.readback.checks.exactPpecHeadline && state.readback.checks.exactPpecBody && state.readback.checks.exactPpecPrimaryCta && state.readback.checks.exactPpecSecondaryCta)}
- selectedMailbox persistence: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy persistence: ${yn(state.readback.checks.publicEmailPolicy)}
- No \`contactus@\`: ${yn(state.readback.checks.noLegacyMailbox)}

## Route Results

- Public \`/\`: HTTP ${state.routes.publicHome.status ?? 'not-checked'}, approved copy visible ${yn(state.routes.publicHome.approvedCopyVisible)}
- Draft preview: HTTP ${state.routes.draftPreview.status ?? 'not-checked'}, approved copy visible ${yn(state.routes.draftPreview.approvedCopyVisible)}

## Untouched

- \`/contact\` untouched: ${yn(state.untouched.contactUnchanged)}
- \`/service-areas\` untouched/still 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme untouched: ${yn(state.untouched.themeUnchanged)}
- MediaAssets untouched: ${yn(state.untouched.mediaAssetsUnchanged)}

## Guardrails

- Static generation: no
- Azure deployment: no
- DNS/Cloudflare/Microsoft 365/Bluehost/email/provider changes: no
- Email sent: no
- Protected config read: no
- Roller touched: no

## Hygiene

- Final hygiene ok: ${yn(state.hygiene.ok)}
- Failed hygiene checks: ${state.hygiene.failed.length ? state.hygiene.failed.join(', ') : 'none'}

## Remaining Blockers

Before static generation:

${state.remainingBlockers.beforeStaticGeneration.length ? state.remainingBlockers.beforeStaticGeneration.map((item) => `- ${item}`).join('\n') : '- None recorded.'}

Before Azure deployment:

${state.remainingBlockers.beforeAzureDeployment.length ? state.remainingBlockers.beforeAzureDeployment.map((item) => `- ${item}`).join('\n') : '- None recorded.'}

Before production DNS:

${state.remainingBlockers.beforeProductionDns.length ? state.remainingBlockers.beforeProductionDns.map((item) => `- ${item}`).join('\n') : '- None recorded.'}

## Blockers

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

## Next Recommended Action

Commit this live CMS promotion report/output, then request separate authorization before any static generation, Azure deployment, DNS, provider, or Roller work.
`);
}

async function getPage(slug) {
  return apiJson(`/api/admin/pages/${tenantId}/${encodeURIComponent(slug)}`, { method: 'GET', token: jwt });
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
    return { reachable: true, status: response.status, length: text.length, text: text.slice(0, 50000) };
  } catch (error) {
    return { reachable: false, status: 0, length: null, error: safeMessage(error), text: '' };
  }
}

function normalizeForLifecycleDiff(page) {
  const clonePage = activePageOnly(page);
  delete clonePage.isPublished;
  delete clonePage.includeInSitemap;
  delete clonePage.publishedAt;
  delete clonePage.workflow;
  delete clonePage.staticPublishing;
  delete clonePage.revision;
  delete clonePage.PageVersion;
  if (clonePage.MetaData) delete clonePage.MetaData.updatedAt;
  return clonePage;
}

function normalizeForPostWriteDiff(page) {
  const clonePage = normalizeForLifecycleDiff(page);
  delete clonePage.id;
  delete clonePage.PageId;
  return clonePage;
}

function activePageOnly(page) {
  const copy = clone(page || {});
  if (copy.revision) copy.revision.latestSnapshot = null;
  return copy;
}

function findPpecBlocks(page) {
  return blocksOf(page)
    .map((block, index) => ({ index, block, content: block.content || block.Content || {} }))
    .filter(({ content }) => content.sectionVariant === 'ppecPartnerBand' ||
      content.rendererVariant === 'ppecPartnerBand' ||
      content.visualTreatment === 'ppecPartnerBand' ||
      /Party Pros East Coast|PPEC/i.test(JSON.stringify(content.partner || {})));
}

function blocksOf(page) {
  return page?.ContentData?.ContentBlocks || page?.contentData?.contentBlocks || page?.ContentBlocks || [];
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

function summarizePage(page) {
  if (!page) return null;
  return {
    pageId: page.PageId || page.pageId || page.id || '',
    pageSlug: page.pageSlug || page.PageSlug || '',
    pageVersion: page.PageVersion || page.pageVersion || null,
    isPublished: page.isPublished === true,
    includeInSitemap: page.includeInSitemap === true,
    publishedAt: page.publishedAt || null,
    workflowStatus: page.workflow?.status || '',
    reviewStatus: page.workflow?.reviewStatus || '',
    approvedForPublish: page.workflow?.approvedForPublish === true,
    staticEligible: page.staticPublishing?.staticEligible === true,
    needsRebuild: page.staticPublishing?.needsRebuild === true,
    revisionNumber: page.revision?.revisionNumber ?? null,
    lastChangeSource: page.revision?.lastChangeSource || '',
  };
}

function outputFiles() {
  const files = [];
  const walk = (current) => {
    if (!existsSync(current)) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) walk(next);
      else if (/\.(md|json|mjs)$/i.test(entry.name)) files.push(next);
    }
  };
  walk(outputDir);
  return files;
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text.replace(/^\uFEFF/, '')) : null;
  } catch {
    return null;
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(sanitize(value), null, 2)}\n`, 'utf8');
}

function writeText(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${value.trimEnd()}\n`, 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => {
    if (typeof val === 'string' && /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/.test(val)) return '[redacted-jwt]';
    if (/password|secret|connectionString|apiKey|privateKey|authorization/i.test(key)) return '[redacted]';
    if (/token|jwt/i.test(key) && typeof val === 'string' && !/^(PRESENT|MISSING|VALID|INVALID|temp|env|none)$/i.test(val)) return '[redacted]';
    return val;
  }));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function getPath(value, pathValue) {
  return pathValue.split('.').reduce((current, key) => current && typeof current === 'object' ? current[key] : undefined, value);
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function scrub(value) {
  return String(value || '')
    .replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]')
    .slice(0, 3000);
}

function safeMessage(error) {
  return scrub(error?.message || error || '');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return (result.stdout || result.stderr || '').trim();
}

function run(command, args, timeout = 120000) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true, timeout });
  return {
    status: result.status,
    stdout: scrub(result.stdout || ''),
    stderr: scrub(result.stderr || ''),
    signal: result.signal || null,
  };
}

function commandSummary(result) {
  return { ok: result.status === 0, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, signal: result.signal || null };
}

function inferOk(parsed, result) {
  if (result.status !== 0) return false;
  if (parsed === null) return result.status === 0;
  if (typeof parsed.ok === 'boolean') return parsed.ok;
  if (typeof parsed.Ok === 'boolean') return parsed.Ok;
  if (typeof parsed.success === 'boolean') return parsed.success;
  if (typeof parsed.passed === 'boolean') return parsed.passed;
  if (typeof parsed.decision === 'string') return !/fail|block|reject/i.test(parsed.decision);
  return true;
}

function rel(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function unique(values) {
  return Array.from(new Set(values));
}

function yn(value) {
  return value ? 'yes' : 'no';
}
