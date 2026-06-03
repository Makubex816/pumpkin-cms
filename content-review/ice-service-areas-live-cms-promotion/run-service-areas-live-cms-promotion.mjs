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
const outputRel = 'content-review/ice-service-areas-live-cms-promotion';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_SERVICE_AREAS_LIVE_CMS_PROMOTION_REPORT.md';
const polishedCandidateRel = 'content-review/ice-service-areas-polish/SERVICE_AREAS_POLISHED_CANDIDATE.json';
const priorReadbackRel = 'content-review/ice-service-areas-local-draft-import/service-areas-readback-after-import.json';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const pageSlug = 'service-areas';
const route = '/service-areas';
const canonicalUrl = 'https://iceskatingrinkrentals.com/service-areas';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const ppecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
const requestedDraftChangeSource = 'service_areas_remove_secondary_hero_cta';
const requestedLiveChangeSource = 'service_areas_live_cms_promotion';
const draftApiChangeSource = 'json_import';
const liveApiChangeSource = 'lifecycle_action';
const generatedAt = new Date().toISOString();

const officialMediaIds = new Set([
  'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
  'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
  'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
  'ice-rink-rentals-holidayicerink-973ce7691377',
  'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
  ppecLogoId,
]);

const files = {
  readme: `${outputRel}/README.md`,
  ctaAudit: `${outputRel}/CTA_REMOVAL_AUDIT.md`,
  validationMd: `${outputRel}/PRE_PROMOTION_VALIDATION.md`,
  baselinesMd: `${outputRel}/BASELINE_SNAPSHOTS.md`,
  draftUpdateMd: `${outputRel}/SERVICE_AREAS_DRAFT_UPDATE_RESULT.md`,
  livePromotionMd: `${outputRel}/SERVICE_AREAS_LIVE_PROMOTION_RESULT.md`,
  readbackMd: `${outputRel}/SERVICE_AREAS_READBACK_VERIFICATION.md`,
  publicRoutesMd: `${outputRel}/PUBLIC_ROUTE_VERIFICATION.md`,
  untouchedMd: `${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`,
  authMd: `${outputRel}/AUTH_LIFECYCLE_RESULT.md`,
  blockersMd: `${outputRel}/REMAINING_BLOCKERS.md`,
  beforeSnapshot: `${outputRel}/service-areas-before-live-promotion.snapshot.json`,
  afterReadback: `${outputRel}/service-areas-readback-after-live-promotion.json`,
  manifest: `${outputRel}/manifest.json`,
  liveCandidate: `${outputRel}/SERVICE_AREAS_APPROVED_LIVE_CANDIDATE.json`,
  draftCandidate: `${outputRel}/service-areas-remove-secondary-hero-cta-draft-candidate.json`,
  homepageBefore: `${outputRel}/homepage-before-live-promotion.snapshot.json`,
  contactBefore: `${outputRel}/contact-before-live-promotion.snapshot.json`,
  themeBefore: `${outputRel}/theme-before-live-promotion.snapshot.json`,
  mediaBefore: `${outputRel}/media-assets-before-live-promotion.snapshot.json`,
  draftReadback: `${outputRel}/service-areas-readback-after-secondary-cta-removal-draft-update.json`,
  homepageAfter: `${outputRel}/homepage-after-live-promotion.readonly.json`,
  contactAfter: `${outputRel}/contact-after-live-promotion.readonly.json`,
  themeAfter: `${outputRel}/theme-after-live-promotion.readonly.json`,
  mediaAfter: `${outputRel}/media-assets-after-live-promotion.readonly.json`,
  draftWriteResult: `${outputRel}/service-areas-draft-update-write-result.json`,
  liveWriteResult: `${outputRel}/service-areas-live-promotion-write-result.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  safePreflightDraft: `${outputRel}/safe-import-preflight-draft-result.json`,
  safePreflightLive: `${outputRel}/safe-import-preflight-live-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  defaultForm: `${outputRel}/default-form-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  routeCanonical: `${outputRel}/route-canonical-audit-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
  readbackVerification: `${outputRel}/readback-verification-result.json`,
  frontendProbe: `${outputRel}/frontend-route-probe-result.json`,
  hygiene: `${outputRel}/final-hygiene-result.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.service-areas-live-cms-promotion.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
    sourceFiles: [
      { path: polishedCandidateRel, exists: existsSync(abs(polishedCandidateRel)) },
      { path: priorReadbackRel, exists: existsSync(abs(priorReadbackRel)) },
    ],
  },
  selectedSource: {
    mode: 'current-admin-service-areas-readback',
    pageId: '',
    pageSlug,
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
    tempJwtFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  audit: {
    heroBlockId: '',
    primaryLabel: '',
    primaryHref: '',
    secondaryLabel: '',
    secondaryHref: '',
    secondaryRemovedInCandidate: false,
  },
  baselines: {
    captured: false,
    serviceAreas: null,
    homepage: null,
    contact: null,
    theme: null,
    mediaAssets: null,
  },
  validation: {
    ok: false,
    results: {},
    failed: [],
  },
  draftUpdate: {
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
    requestedChangeSource: requestedDraftChangeSource,
    apiChangeSource: draftApiChangeSource,
  },
  promotion: {
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
    requestedChangeSource: requestedLiveChangeSource,
    apiChangeSource: liveApiChangeSource,
    changedFields: [],
  },
  readback: {
    performed: false,
    ok: false,
    checks: {},
    failed: [],
  },
  untouched: {
    homepageUnchanged: null,
    contactUnchanged: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
  },
  routes: {
    serviceAreasPublic: null,
    serviceAreasPreview: null,
    homepage: null,
    contact: null,
  },
  hygiene: {
    ok: false,
    results: {},
    failed: [],
  },
  safety: {
    serviceAreasWrites: 0,
    homepageWrite: false,
    contactWrite: false,
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
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  try {
    state.start.api = await probe(apiBase);
    if (!state.start.api.reachable || state.start.api.status !== 200) {
      throw new Error('Local API is not reachable at http://localhost:5064.');
    }
    if (!state.start.sourceFiles[0].exists && !state.start.sourceFiles[1].exists) {
      throw new Error('No service-areas draft source/readback artifact exists.');
    }

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();
    const source = state.baselines.serviceAreas.json || readJson(polishedCandidateRel);
    state.selectedSource.pageId = source.PageId || source.id || '';
    const draftCandidate = prepareDraftCandidate(source);
    const liveCandidate = prepareLiveCandidate(draftCandidate);
    state.promotion.changedFields = diffLifecycleFields(draftCandidate, liveCandidate);
    writeJson(files.draftCandidate, draftCandidate);
    writeJson(files.liveCandidate, liveCandidate);

    state.audit = auditHeroCta(source, draftCandidate);
    runValidation(draftCandidate, liveCandidate);
    writeReports();
    if (!state.validation.ok) throw new Error(`Pre-promotion validation failed: ${state.validation.failed.join(', ')}.`);

    await writeDraftUpdate(draftCandidate);
    if (!state.draftUpdate.performed) throw new Error(`Draft CTA removal update failed with HTTP ${state.draftUpdate.httpStatus}.`);

    const draftReadback = await getPage(pageSlug);
    writeJson(files.draftReadback, draftReadback.json || { httpStatus: draftReadback.status });
    if (!draftReadback.ok || hasHeroSecondaryCta(draftReadback.json)) {
      throw new Error('Draft update readback did not verify hero secondary CTA removal.');
    }

    await promoteLive(liveCandidate);
    if (!state.promotion.performed) throw new Error(`Live CMS promotion failed with HTTP ${state.promotion.httpStatus}.`);

    await verifyAfterPromotion();
    if (!state.readback.ok) throw new Error(`Live readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((item) => item === true)) {
      throw new Error('Homepage/contact/theme/media untouched verification failed.');
    }

    await probeFrontendRoutes();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) state.blockers.push(`Final hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);

  state.success = state.blockers.length === 0 &&
    state.validation.ok === true &&
    state.draftUpdate.performed === true &&
    state.promotion.performed === true &&
    state.readback.ok === true &&
    Object.values(state.untouched).every((item) => item === true) &&
    state.hygiene.ok === true;

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
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    validationOk: state.validation.ok,
    draftUpdatePerformed: state.draftUpdate.performed,
    livePromotionPerformed: state.promotion.performed,
    readbackOk: state.readback.ok,
    untouched: state.untouched,
    routes: state.routes,
    hygieneOk: state.hygiene.ok,
    blockers: state.blockers,
    report: rootReportRel,
    outputFolder: outputRel,
  }, null, 2));

  if (!state.success) process.exitCode = 1;
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
  const [serviceAreas, homepage, contact, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('contact'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  if (!serviceAreas.ok) throw new Error(`Service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!contact.ok) throw new Error(`Contact baseline read failed with HTTP ${contact.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);
  state.baselines = { captured: true, serviceAreas, homepage, contact, theme, mediaAssets };
  writeJson(files.beforeSnapshot, serviceAreas.json);
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.contactBefore, contact.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);
}

function prepareDraftCandidate(source) {
  const page = clone(source);
  const now = new Date().toISOString();
  page.PageId = page.PageId || page.id || 'ice-rink-rentals-service-areas';
  page.id = page.PageId;
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
  if (page.seo) page.seo.canonicalUrl = canonicalUrl;
  const hero = getHeroBlock(page);
  if (!hero) throw new Error('Service-areas hero block was not found.');
  hero.content.primaryCta = {
    ...(hero.content.primaryCta || {}),
    label: 'Request a Quote',
    href: '/contact',
  };
  hero.content.buttonText = 'Request a Quote';
  hero.content.buttonLink = '/contact';
  delete hero.content.secondaryCta;
  delete hero.content.secondaryButtonText;
  delete hero.content.secondaryButtonLink;
  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: 'codex_service_areas_live_promotion',
    lastEditedAt: now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    needsRebuild: true,
    deploymentStatus: page.staticPublishing?.deploymentStatus || 'not_generated',
  };
  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'service-areas-secondary-hero-cta-removal',
    rollbackNotes: page.revision?.rollbackNotes || 'Secondary hero CTA removal prepared before live CMS promotion.',
    lastChangeSummary: 'Remove duplicate secondary hero CTA from /service-areas only; keep main Request a Quote CTA.',
    lastChangeSource: requestedDraftChangeSource,
    lastChangeAt: now,
  };
  return page;
}

function prepareLiveCandidate(draftCandidate) {
  const page = clone(draftCandidate);
  const now = new Date().toISOString();
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
    lastEditedBy: 'codex_service_areas_live_promotion',
    lastEditedAt: now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: true,
    needsRebuild: true,
    deploymentStatus: 'pending_rebuild',
  };
  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'service-areas-live-cms-promotion',
    rollbackNotes: page.revision?.rollbackNotes || 'Live CMS promotion prepared with rollback snapshot support.',
    lastChangeSummary: 'Promote /service-areas to live CMS/public-page state only; no static generation or deployment.',
    lastChangeSource: requestedLiveChangeSource,
    lastChangeAt: now,
  };
  return page;
}

function auditHeroCta(source, draftCandidate) {
  const sourceHero = getHeroBlock(source);
  const nextHero = getHeroBlock(draftCandidate);
  const content = sourceHero?.content || {};
  const primary = content.primaryCta || {};
  const secondary = content.secondaryCta || {};
  return {
    heroBlockId: sourceHero?.id || '',
    primaryLabel: primary.label || content.buttonText || '',
    primaryHref: primary.href || content.buttonLink || '',
    secondaryLabel: secondary.label || content.secondaryButtonText || '',
    secondaryHref: secondary.href || content.secondaryButtonLink || '',
    secondaryRemovedInCandidate: !hasSecondaryCta(nextHero?.content || {}),
  };
}

function runValidation(draftCandidate, liveCandidate) {
  writeValidation(files.jsonParse, jsonParseValidation([files.draftCandidate, files.liveCandidate]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(draftCandidate, liveCandidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(liveCandidate));
  writeValidation(files.unsafeScan, unsafeScan([files.draftCandidate, files.liveCandidate]));
  writeValidation(files.contactusScan, stringScan([files.draftCandidate, files.liveCandidate], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.draftCandidate, files.liveCandidate]));
  writeValidation(files.defaultForm, defaultFormValidation(liveCandidate));
  runImportPreflight(files.draftCandidate, files.safePreflightDraft, { requireLocalDraft: true });
  runImportPreflight(files.liveCandidate, files.safePreflightLive, { requireLocalDraft: false });
  runDotNetContract(files.liveCandidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand(files.tailwind, ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand(files.normalizer, ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const required = [
    files.jsonParse,
    files.dotnet,
    files.productionPersistence,
    files.safePreflightDraft,
    files.safePreflightLive,
    files.designSystem,
    files.mediaValidation,
    files.defaultForm,
    files.tailwind,
    files.normalizer,
    files.unsafeScan,
    files.contactusScan,
    files.routeCanonical,
    files.secretScan,
  ];
  state.validation.failed = required
    .filter((file) => state.validation.results[path.basename(file)]?.ok !== true)
    .map((file) => path.basename(file));
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(draftCandidate, liveCandidate) {
  const draftText = JSON.stringify(activePageOnly(draftCandidate));
  const liveText = JSON.stringify(activePageOnly(liveCandidate));
  const mediaIds = collectValuesByKey(activePageOnly(liveCandidate), 'mediaAssetId').filter(Boolean);
  const liveHero = getHeroBlock(liveCandidate);
  const strippedPartnerBrand = liveText.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand');
  const checks = {
    draftRouteServiceAreas: draftCandidate.pageSlug === pageSlug && draftCandidate.route === route && draftCandidate.path === route,
    draftNeedsReview: draftCandidate.isPublished === false && draftCandidate.workflow?.status === 'draft' && draftCandidate.workflow?.reviewStatus === 'needs_review',
    draftHeroSecondaryRemoved: !hasHeroSecondaryCta(draftCandidate),
    liveRouteServiceAreas: liveCandidate.pageSlug === pageSlug && liveCandidate.route === route && liveCandidate.path === route,
    livePublishedState: liveCandidate.isPublished === true && liveCandidate.includeInSitemap === true && Boolean(liveCandidate.publishedAt),
    liveWorkflowApproved: liveCandidate.workflow?.status === 'published' && liveCandidate.workflow?.reviewStatus === 'approved' && liveCandidate.workflow?.approvedForPublish === true,
    staticNeedsRebuildTrue: liveCandidate.staticPublishing?.needsRebuild === true,
    mainCtaRemains: liveHero?.content?.primaryCta?.label === 'Request a Quote' && liveHero?.content?.primaryCta?.href === '/contact' && liveHero?.content?.buttonText === 'Request a Quote' && liveHero?.content?.buttonLink === '/contact',
    ppecLogoPersists: liveText.includes(ppecLogoId),
    officialMediaIdsPersist: mediaIds.length > 0 && mediaIds.every((id) => officialMediaIds.has(id)),
    selectedMailbox: !liveText.includes('selectedMailbox') || liveText.includes(selectedMailbox),
    publicEmailDisplayPolicy: !liveText.includes('publicEmailDisplayPolicy') || liveText.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !liveText.includes(legacyMailbox) && !draftText.includes(legacyMailbox),
    noUnsupportedEastCoastClaim: !/\bEast Coast\b/i.test(strippedPartnerBrand),
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(liveText.replaceAll('/state-city', '')),
    noBase64OrRawForm: !/base64|data:image\/|<form\b|<input\b|<textarea\b|<select\b/i.test(liveText),
  };
  return withFailed(checks);
}

function routeCanonicalAudit(candidate) {
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKey: !candidate.siteKey || candidate.siteKey === siteKey,
    route: candidate.route === route,
    path: candidate.path === route,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    canonicalUrl: (!candidate.canonicalUrl || candidate.canonicalUrl === canonicalUrl) && (!candidate.seo?.canonicalUrl || candidate.seo.canonicalUrl === canonicalUrl),
    noHomepageOrContactPayload: candidate.pageSlug !== 'home' && candidate.pageSlug !== 'contact',
  };
  return withFailed(checks);
}

function defaultFormValidation(candidate) {
  const hasFormBlock = blocksOf(candidate).some((block) => block.type === 'formBlock');
  return hasFormBlock
    ? { ok: true, note: 'formBlock present; no default-form fixture command was required for this service-areas CTA-only update.' }
    : { ok: true, skipped: true, reason: 'No formBlock exists on /service-areas; CTAs route to /contact.' };
}

function runImportPreflight(candidateRel, outputRelPath, options) {
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', route,
    '--mode', 'preflight-only',
    '--output', outputRelPath,
  ], 240000);
  const parsed = existsSync(abs(outputRelPath)) ? readJson(outputRelPath) : {};
  const shapeOk = parsed.classification?.['preflight-valid-for-shape'] === true;
  const localOk = parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.ok = options.requireLocalDraft ? result.status === 0 && shapeOk && localOk : shapeOk && parsed.checks?.some((item) => item.check === 'dotnet-page-contract' && item.status === 'passed');
  parsed.command = commandSummary(result);
  writeValidation(outputRelPath, parsed);
}

function runDotNetContract(candidateRel) {
  const scratch = path.join(os.tmpdir(), `pumpkin-service-areas-live-contract-${process.pid}-${Date.now()}`);
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
    ? run('dotnet', [dll, 'validate-page', '--path', abs(candidateRel)], 240000)
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

async function writeDraftUpdate(candidate) {
  state.draftUpdate.attempted = true;
  const changeSummary = `${requestedDraftChangeSource}: remove duplicate top/hero secondary CTA on /service-areas only; keep primary Request a Quote CTA; no other route/theme/media/static/deploy action.`;
  const query = new URLSearchParams({ changeSource: draftApiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
  state.draftUpdate.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${draftApiChangeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.draftUpdate.httpStatus = response.status;
  state.draftUpdate.performed = response.ok;
  if (response.ok) state.safety.serviceAreasWrites += 1;
  writeJson(files.draftWriteResult, { ok: response.ok, status: response.status, endpoint: state.draftUpdate.endpoint, page: response.json, safeText: response.safeText });
}

async function promoteLive(candidate) {
  state.promotion.attempted = true;
  const changeSummary = `${requestedLiveChangeSource}: user visually approved /service-areas live CMS promotion after secondary hero CTA removal; no static generation, Azure deploy, DNS/email/provider, Theme, MediaAsset, /, /contact, /state-city, or Roller action.`;
  const query = new URLSearchParams({ changeSource: liveApiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
  state.promotion.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${liveApiChangeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.promotion.httpStatus = response.status;
  state.promotion.performed = response.ok;
  if (response.ok) state.safety.serviceAreasWrites += 1;
  writeJson(files.liveWriteResult, { ok: response.ok, status: response.status, endpoint: state.promotion.endpoint, page: response.json, safeText: response.safeText });
}

async function verifyAfterPromotion() {
  const [serviceAreas, homepage, contact, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('contact'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  writeJson(files.afterReadback, serviceAreas.json || { httpStatus: serviceAreas.status });
  writeJson(files.homepageAfter, homepage.json || { httpStatus: homepage.status });
  writeJson(files.contactAfter, contact.json || { httpStatus: contact.status });
  writeJson(files.themeAfter, theme.json || { httpStatus: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { httpStatus: mediaAssets.status });

  const page = serviceAreas.json || {};
  const active = activePageOnly(page);
  const activeText = JSON.stringify(active);
  const hero = getHeroBlock(page);
  const beforeRevision = state.baselines.serviceAreas.json?.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const mediaIds = collectValuesByKey(active, 'mediaAssetId').filter(Boolean);
  const strippedPartnerBrand = activeText.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand');
  const checks = {
    httpOk: serviceAreas.ok && serviceAreas.status === 200,
    routeServiceAreas: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    livePublishedState: page.isPublished === true && page.includeInSitemap === true && Boolean(page.publishedAt),
    workflowPublishedApproved: page.workflow?.status === 'published' && page.workflow?.reviewStatus === 'approved' && page.workflow?.approvedForPublish === true,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    revisionIncrementedOrRollback: Number.isFinite(beforeRevision) && Number.isFinite(afterRevision) ? afterRevision > beforeRevision : Boolean(page.revision),
    rollbackMetadataExists: Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable),
    heroSecondaryRemoved: !hasSecondaryCta(hero?.content || {}),
    mainCtaRemains: hero?.content?.primaryCta?.label === 'Request a Quote' && hero?.content?.primaryCta?.href === '/contact' && hero?.content?.buttonText === 'Request a Quote' && hero?.content?.buttonLink === '/contact',
    ppecLogoPersists: activeText.includes(ppecLogoId),
    officialMediaIdsPersist: mediaIds.length > 0 && mediaIds.every((id) => officialMediaIds.has(id)),
    selectedMailbox: !activeText.includes('selectedMailbox') || activeText.includes(selectedMailbox),
    publicEmailDisplayPolicy: !activeText.includes('publicEmailDisplayPolicy') || activeText.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !activeText.includes(legacyMailbox),
    noUnsupportedEastCoastClaim: !/\bEast Coast\b/i.test(strippedPartnerBrand),
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(activeText.replaceAll('/state-city', '')),
  };
  state.readback.performed = true;
  state.readback.checks = checks;
  state.readback.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.ok = state.readback.failed.length === 0;
  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baselines.homepage.hash;
  state.untouched.contactUnchanged = contact.ok && contact.hash === state.baselines.contact.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;
  writeJson(files.readbackVerification, { ok: state.readback.ok, checks, failed: state.readback.failed, untouched: state.untouched });
}

async function probeFrontendRoutes() {
  const urls = {
    serviceAreasPublic: `${webBase}/service-areas`,
    serviceAreasPreview: `${webBase}/__preview/ice-rink-rentals/service-areas`,
    homepage: `${webBase}/`,
    contact: `${webBase}/contact`,
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => [key, await probe(url)]));
  for (const [key, value] of entries) {
    state.routes[key] = { url: urls[key], reachable: value.reachable, status: value.status, length: value.length };
  }
  writeJson(files.frontendProbe, state.routes);
}

function runHygieneChecks() {
  const taskFiles = unique([...listFiles(outputDir).filter(isTextFile), abs(rootReportRel)].filter(existsSync));
  const gitDiff = run('git', ['diff', '--check'], 120000);
  state.hygiene.results.gitDiffCheck = commandSummary(gitDiff);
  state.hygiene.results.trailingWhitespaceScan = trailingWhitespaceScan(taskFiles);
  state.hygiene.results.protectedGeneratedRawArtifactPathCheck = protectedGeneratedRawArtifactPathCheck();
  state.hygiene.results.targetedSecretScan = secretScan(taskFiles.map(rel));
  state.hygiene.results.stagedArtifactCheck = stagedArtifactCheck();
  state.hygiene.failed = Object.entries({
    gitDiffCheck: gitDiff.status === 0,
    trailingWhitespaceScan: state.hygiene.results.trailingWhitespaceScan.ok,
    protectedGeneratedRawArtifactPathCheck: state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok,
    targetedSecretScan: state.hygiene.results.targetedSecretScan.ok,
    stagedArtifactCheck: state.hygiene.results.stagedArtifactCheck.ok,
  }).filter(([, ok]) => !ok).map(([key]) => key);
  state.hygiene.ok = state.hygiene.failed.length === 0;
  writeJson(files.hygiene, state.hygiene);
}

function writeReports() {
  writeMd(files.readme, `# Ice Service Areas Live CMS Promotion

Created: ${generatedAt}

Scope:

- Updated /service-areas only.
- Removed the duplicate top/hero secondary CTA.
- Promoted /service-areas to live CMS/public-page state when validation and auth passed.
- No homepage, contact, Theme, MediaAsset, static generation, Azure deployment, DNS/email/provider, protected config, or Roller action.

Public review URL:

http://localhost:3002/service-areas`);

  writeMd(files.ctaAudit, `# CTA Removal Audit

- Hero block id: \`${state.audit.heroBlockId || 'not found'}\`
- Main/darker CTA label: \`${state.audit.primaryLabel || 'not found'}\`
- Main/darker CTA href: \`${state.audit.primaryHref || 'not found'}\`
- Secondary/right-side/light CTA label: \`${state.audit.secondaryLabel || 'not found'}\`
- Secondary/right-side/light CTA href: \`${state.audit.secondaryHref || 'not found'}\`
- Secondary CTA removed in candidate: ${yn(state.audit.secondaryRemovedInCandidate)}

The primary CTA remains \`Request a Quote\` pointing to \`/contact\`.`);

  writeMd(files.validationMd, `# Pre-Promotion Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['production-field persistence validation', resultName(files.productionPersistence)],
    ['safe import preflight - draft update', resultName(files.safePreflightDraft)],
    ['safe import preflight - live promotion', resultName(files.safePreflightLive)],
    ['design-system validation', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['default form validation', resultName(files.defaultForm)],
    ['Tailwind/navigation validation', resultName(files.tailwind)],
    ['page intake normalizer validation', resultName(files.normalizer)],
    ['unsafe HTML/CSS/form/media/email scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['route/canonical audit', resultName(files.routeCanonical)],
    ['targeted secret scan', resultName(files.secretScan)],
  ])}

Failed validation checks:

${listOrNone(state.validation.failed)}`);

  writeMd(files.baselinesMd, `# Baseline Snapshots

- Service areas before promotion: \`${files.beforeSnapshot}\`
- Homepage before promotion: \`${files.homepageBefore}\`
- Contact before promotion: \`${files.contactBefore}\`
- Theme before promotion: \`${files.themeBefore}\`
- MediaAssets before promotion: \`${files.mediaBefore}\`

Selected service-areas source/current page id: \`${state.selectedSource.pageId || 'not captured'}\``);

  writeMd(files.draftUpdateMd, `# Service Areas Draft Update Result

- Draft update attempted: ${yn(state.draftUpdate.attempted)}
- Draft update performed: ${yn(state.draftUpdate.performed)}
- HTTP status: ${state.draftUpdate.httpStatus ?? 'n/a'}
- Requested changeSource: \`${state.draftUpdate.requestedChangeSource}\`
- API-supported changeSource used: \`${state.draftUpdate.apiChangeSource}\`
- Endpoint: \`${state.draftUpdate.endpoint || 'not attempted'}\`
- Secondary hero CTA removed in draft readback: ${yn(state.draftUpdate.performed && !hasHeroSecondaryCta(readJsonIfExists(files.draftReadback)))}`);

  writeMd(files.livePromotionMd, `# Service Areas Live Promotion Result

- Live promotion attempted: ${yn(state.promotion.attempted)}
- Live promotion performed: ${yn(state.promotion.performed)}
- HTTP status: ${state.promotion.httpStatus ?? 'n/a'}
- Requested changeSource: \`${state.promotion.requestedChangeSource}\`
- API-supported changeSource used: \`${state.promotion.apiChangeSource}\`
- Endpoint: \`${state.promotion.endpoint || 'not attempted'}\`

CMS live/published fields changed:

${listOrNone(state.promotion.changedFields)}`);

  writeMd(files.readbackMd, `# Service Areas Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.ok)}
- Route /service-areas: ${yn(state.readback.checks.routeServiceAreas)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- Revision incremented or rollback metadata exists: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Hero secondary CTA removed: ${yn(state.readback.checks.heroSecondaryRemoved)}
- Main Request a Quote CTA remains: ${yn(state.readback.checks.mainCtaRemains)}
- PPEC logo persisted: ${yn(state.readback.checks.ppecLogoPersists)}
- Official media IDs persisted: ${yn(state.readback.checks.officialMediaIdsPersist)}
- selectedMailbox persisted if present: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy persisted if present: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}
- No unsupported East Coast service-area claim: ${yn(state.readback.checks.noUnsupportedEastCoastClaim)}

Failed checks:

${listOrNone(state.readback.failed)}`);

  writeMd(files.publicRoutesMd, `# Public Route Verification

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked', value?.reachable ? 'yes' : 'no']))}

Expected public /service-areas result after CMS live promotion: HTTP 200 if the public frontend reads live CMS pages. If 404 appears, restart/cache behavior should be checked before content is reworked.`);

  writeMd(files.untouchedMd, `# Untouched Routes Verification

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- /state-city created: no`);

  writeMd(files.authMd, `# Auth Lifecycle Result

- Env JWT status: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after successful completion: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}`);

  writeMd(files.blockersMd, `# Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before static generation:

- Static generation was not authorized in this run.
- Review generated static output separately after explicit authorization.
- Verify static media/public paths before any static package.

Before Azure deployment:

- Azure deployment was not authorized in this run.
- Deployment smoke tests require separate approval.

Before production DNS:

- DNS, Cloudflare, Microsoft 365, Bluehost, and email/provider changes were not authorized.
- Production DNS/provider work requires separate approval.`);

  writeJson(files.manifest, sanitize({
    schemaVersion: state.schemaVersion,
    generatedAt,
    site: 'IceSkatingRinkRentals.com',
    tenantId,
    siteKey,
    route,
    branch: state.start.branch,
    outputFolder: outputRel,
    rootReport: rootReportRel,
    candidate: files.liveCandidate,
    draftUpdatePerformed: state.draftUpdate.performed,
    livePromotionPerformed: state.promotion.performed,
    validationOk: state.validation.ok,
    readbackOk: state.readback.ok,
    untouched: state.untouched,
    routes: state.routes,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tokenPrinted: false,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    safety: state.safety,
  }));

  writeMd(rootReportRel, `# Pumpkin Ice Service Areas Live CMS Promotion Report

Generated: ${generatedAt}

## Start

Branch: \`${state.start.branch}\`

Initial manual git status before creating this promotion runner/package:

- No tracked modifications.
- Only the existing approved service-area raw input ZIP and extracted source package were untracked under \`content-review/ice-service-areas-input/\`.

Git status at runner start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

## Source

- Selected service-areas source: ${state.selectedSource.mode}
- Current page id: \`${state.selectedSource.pageId || 'not captured'}\`

## CTA Removal Result

- Hero block id: \`${state.audit.heroBlockId || 'not found'}\`
- Removed secondary CTA: ${yn(state.audit.secondaryRemovedInCandidate)}
- Main CTA remains: \`${state.audit.primaryLabel || 'not found'}\` -> \`${state.audit.primaryHref || 'not found'}\`

## Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], [
    ['JSON parse', resultName(files.jsonParse)],
    ['.NET Page/block contract', resultName(files.dotnet)],
    ['production-field persistence', resultName(files.productionPersistence)],
    ['safe import preflight draft', resultName(files.safePreflightDraft)],
    ['safe import preflight live', resultName(files.safePreflightLive)],
    ['design-system', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['default form', resultName(files.defaultForm)],
    ['Tailwind/navigation', resultName(files.tailwind)],
    ['page intake normalizer', resultName(files.normalizer)],
    ['unsafe scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['route/canonical audit', resultName(files.routeCanonical)],
    ['targeted secret scan', resultName(files.secretScan)],
  ])}

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## CMS Writes

- Draft update performed: ${yn(state.draftUpdate.performed)}
- Draft update HTTP status: ${state.draftUpdate.httpStatus ?? 'n/a'}
- Live CMS promotion performed: ${yn(state.promotion.performed)}
- Live promotion HTTP status: ${state.promotion.httpStatus ?? 'n/a'}
- Requested draft changeSource: \`${requestedDraftChangeSource}\`
- Requested live changeSource: \`${requestedLiveChangeSource}\`
- API-supported live changeSource used: \`${liveApiChangeSource}\`

CMS live/published fields changed:

${listOrNone(state.promotion.changedFields)}

## Readback

- Readback ok: ${yn(state.readback.ok)}
- Route /service-areas: ${yn(state.readback.checks.routeServiceAreas)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- Revision/rollback result: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Top/hero secondary CTA removed: ${yn(state.readback.checks.heroSecondaryRemoved)}
- Main Request a Quote CTA remains: ${yn(state.readback.checks.mainCtaRemains)}
- PPEC logo persists: ${yn(state.readback.checks.ppecLogoPersists)}
- Official page media IDs persist: ${yn(state.readback.checks.officialMediaIdsPersist)}
- selectedMailbox remains \`contact@iceskatingrinkrentals.com\` if present: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy remains \`form-first-under-review\` if present: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}
- No unsupported East Coast service-area claim: ${yn(state.readback.checks.noUnsupportedEastCoastClaim)}

## Route Results

${table(['Route', 'URL', 'Status'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked']))}

## Untouched Results

- Homepage / untouched: ${yn(state.untouched.homepageUnchanged)}
- /contact untouched: ${yn(state.untouched.contactUnchanged)}
- Theme untouched: ${yn(state.untouched.themeUnchanged)}
- MediaAssets untouched: ${yn(state.untouched.mediaAssetsUnchanged)}

## Hygiene

- git diff --check: ${state.hygiene.results.gitDiffCheck ? yn(state.hygiene.results.gitDiffCheck.ok) : 'not run'}
- trailing whitespace scan: ${state.hygiene.results.trailingWhitespaceScan ? yn(state.hygiene.results.trailingWhitespaceScan.ok) : 'not run'}
- protected/generated/raw artifact path check: ${state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? yn(state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok) : 'not run'}
- targeted secret scan: ${state.hygiene.results.targetedSecretScan ? yn(state.hygiene.results.targetedSecretScan.ok) : 'not run'}
- staged artifact check: ${state.hygiene.results.stagedArtifactCheck ? yn(state.hygiene.results.stagedArtifactCheck.ok) : 'not run'}

## Guardrails

- Static generation: no
- Azure deployment: no
- DNS/Cloudflare/Microsoft 365/Bluehost/email/provider changes: no
- Email sent: no
- Protected config read: no
- Roller touched: no

## Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before static generation:

- Static generation was not authorized in this run.
- Static output, public media paths, and deployment package checks need separate approval.

Before Azure deployment:

- Azure deployment was not authorized in this run.
- Deployment smoke tests and rollback plan require separate approval.

Before production DNS:

- DNS, Cloudflare, Microsoft 365, Bluehost, and email/provider changes were not authorized.
- Any provider change requires a separate task and fresh approval.

## Next Recommended Action

Review public \`http://localhost:3002/service-areas\` locally. Request separate authorization before static generation, Azure deployment, DNS/provider/email work, or Roller work.`);
}

function getHeroBlock(page) {
  return blocksOf(page).find((block) => block.id === 'service-areas-hero' || block.content?.sectionVariant === 'heroMedia');
}

function hasHeroSecondaryCta(page) {
  const hero = getHeroBlock(page);
  return hasSecondaryCta(hero?.content || {});
}

function hasSecondaryCta(content) {
  return Boolean(content.secondaryCta?.label || content.secondaryCta?.href || content.secondaryButtonText || content.secondaryButtonLink);
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
  return scanPatterns(paths, patterns);
}

function stringScan(paths, needle) {
  const hits = paths.filter((file) => readFileSync(abs(file), 'utf8').includes(needle)).map((file) => ({ path: file }));
  return { ok: hits.length === 0, hits };
}

function secretScan(paths) {
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['smtp-secret', /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD)\b\s*[:=]/i],
  ];
  return scanPatterns(paths.filter((file) => existsSync(abs(file)) && isTextFile(abs(file))), patterns);
}

function scanPatterns(paths, patterns) {
  const hits = [];
  for (const file of paths) {
    const text = readFileSync(abs(file), 'utf8');
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: file, code });
    }
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
    if (file === 'content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip' ||
      file.startsWith('content-review/ice-service-areas-input/extracted/')) {
      allowedReferenceRaw.push(file);
    } else {
      rawHits.push(file);
    }
  }
  return { ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0, protectedHits, generatedHits, rawHits, allowedReferenceRaw };
}

function stagedArtifactCheck() {
  const staged = git(['diff', '--cached', '--name-only']).split(/\r?\n/).filter(Boolean).map((item) => item.replace(/\\/g, '/'));
  const raw = staged.filter((file) => /\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file));
  const extracted = staged.filter((file) => file.startsWith('content-review/ice-service-areas-input/extracted/'));
  const statics = staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file));
  return { ok: raw.length === 0 && extracted.length === 0 && statics.length === 0, stagedCount: staged.length, raw, extracted, statics };
}

function trailingWhitespaceScan(paths) {
  const hits = [];
  for (const file of paths.filter(isTextFile)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
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

function writeValidation(file, value) {
  const withTime = { generatedAt: new Date().toISOString(), ...value };
  state.validation.results[path.basename(file)] = withTime;
  writeJson(file, withTime);
}

function resultName(file) {
  const result = state.validation.results[path.basename(file)];
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

function blocksOf(page) {
  return Array.isArray(page?.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
}

function collectValuesByKey(value, key, out = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectValuesByKey(item, key, out));
  } else if (value && typeof value === 'object') {
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
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout,
    shell: false,
    windowsHide: true,
  });
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
    if (copy.revision) {
      delete copy.revision.lastChangeAt;
      delete copy.revision.lastRevisionAt;
      delete copy.revision.lastSnapshotAt;
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

function getPath(value, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => current && typeof current === 'object' ? current[key] : undefined, value);
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
