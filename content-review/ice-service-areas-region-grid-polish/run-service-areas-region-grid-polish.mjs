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
const outputRel = 'content-review/ice-service-areas-region-grid-polish';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_SERVICE_AREAS_REGION_GRID_POLISH_REPORT.md';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const pageSlug = 'service-areas';
const route = '/service-areas';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const ppecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
const requestedChangeSource = 'service_areas_region_grid_polish';
const apiChangeSource = 'json_import';
const generatedAt = new Date().toISOString();

const sixthCard = {
  title: 'Quote review by request',
  description: 'Submit your event city, state, date, venue type, and goals so the request can be reviewed without assuming local availability before details are confirmed.',
  image: '',
  'image-alt': '',
  media: emptyMedia(),
  icon: '',
  link: '',
  alt: '',
};

const files = {
  readme: `${outputRel}/README.md`,
  regionPolish: `${outputRel}/REGION_GRID_POLISH.md`,
  validationMd: `${outputRel}/PRE_WRITE_VALIDATION.md`,
  updateResultMd: `${outputRel}/SERVICE_AREAS_UPDATE_RESULT.md`,
  readbackMd: `${outputRel}/READBACK_VERIFICATION.md`,
  untouchedMd: `${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`,
  frontendChecklist: `${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`,
  blockersMd: `${outputRel}/REMAINING_BLOCKERS.md`,
  candidate: `${outputRel}/SERVICE_AREAS_REGION_GRID_POLISHED_CANDIDATE.json`,
  afterReadback: `${outputRel}/service-areas-readback-after-region-grid-polish.json`,
  manifest: `${outputRel}/manifest.json`,
  beforeServiceAreas: `${outputRel}/service-areas-before-region-grid-polish.snapshot.json`,
  homepageBefore: `${outputRel}/homepage-before-region-grid-polish.snapshot.json`,
  contactBefore: `${outputRel}/contact-before-region-grid-polish.snapshot.json`,
  themeBefore: `${outputRel}/theme-before-region-grid-polish.snapshot.json`,
  mediaBefore: `${outputRel}/media-assets-before-region-grid-polish.snapshot.json`,
  homepageAfter: `${outputRel}/homepage-after-region-grid-polish.readonly.json`,
  contactAfter: `${outputRel}/contact-after-region-grid-polish.readonly.json`,
  themeAfter: `${outputRel}/theme-after-region-grid-polish.readonly.json`,
  mediaAfter: `${outputRel}/media-assets-after-region-grid-polish.readonly.json`,
  writeResult: `${outputRel}/service-areas-region-grid-polish-write-result.json`,
  readbackVerification: `${outputRel}/readback-verification-result.json`,
  frontendProbe: `${outputRel}/frontend-route-probe-result.json`,
  finalHygiene: `${outputRel}/final-hygiene-result.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  safePreflight: `${outputRel}/safe-import-preflight-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  defaultForm: `${outputRel}/default-form-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  routeCanonical: `${outputRel}/route-canonical-audit-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.service-areas-region-grid-polish.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
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
  regionGrid: {
    blockId: '',
    beforeCount: 0,
    afterCount: 0,
    beforeTitles: [],
    afterTitles: [],
    expectedFiveCardsFound: false,
    sixthCardAdded: false,
    sixthCardNormalized: false,
    unsupportedLocalClaims: false,
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
  update: {
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
    requestedChangeSource,
    apiChangeSource,
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
    deployment: false,
    dnsEmailProviderChange: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
    imageGeneration: false,
    imageModification: false,
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

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();
    const candidate = prepareCandidate(state.baselines.serviceAreas.json);
    writeJson(files.candidate, candidate);

    runValidation(candidate);
    writeReports();
    if (!state.validation.ok) throw new Error(`Pre-write validation failed: ${state.validation.failed.join(', ')}.`);

    await writeServiceAreas(candidate);
    if (!state.update.performed) throw new Error(`Service-areas update failed with HTTP ${state.update.httpStatus}.`);

    await verifyAfterWrite();
    if (!state.readback.ok) throw new Error(`Readback verification failed: ${state.readback.failed.join(', ')}.`);
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
    state.update.performed === true &&
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
  runHygieneChecks();

  console.log(JSON.stringify({
    success: state.success,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    validationOk: state.validation.ok,
    updatePerformed: state.update.performed,
    readbackOk: state.readback.ok,
    regionGrid: state.regionGrid,
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
  writeJson(files.beforeServiceAreas, serviceAreas.json);
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.contactBefore, contact.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);
}

function prepareCandidate(source) {
  const page = clone(source);
  const block = findRegionBlock(page);
  if (!block) throw new Error('Regional planning card grid block was not found.');
  const topics = Array.isArray(block.content?.topics) ? block.content.topics : [];
  state.regionGrid.blockId = block.id || '';
  state.regionGrid.beforeCount = topics.length;
  state.regionGrid.beforeTitles = topics.map((item) => item.title || '');
  state.regionGrid.expectedFiveCardsFound = [
    'Northeast and Mid-Atlantic',
    'Southeast',
    'Midwest',
    'South and central U.S.',
    'Mountain West and West Coast',
  ].every((title) => state.regionGrid.beforeTitles.includes(title));

  const existingIndex = topics.findIndex((item) => item.title === sixthCard.title);
  if (existingIndex >= 0) {
    topics[existingIndex] = { ...topics[existingIndex], ...clone(sixthCard) };
    state.regionGrid.sixthCardNormalized = true;
  } else {
    topics.push(clone(sixthCard));
    state.regionGrid.sixthCardAdded = true;
  }
  block.content.topics = topics;

  page.tenantId = tenantId;
  page.siteKey = page.siteKey || siteKey;
  page.slug = pageSlug;
  page.pageSlug = pageSlug;
  page.PageSlug = page.PageSlug || pageSlug;
  page.route = route;
  page.path = route;
  page.isPublished = source.isPublished === true;
  page.includeInSitemap = source.includeInSitemap === true;
  page.workflow = {
    ...(page.workflow || {}),
    status: source.workflow?.status || 'published',
    reviewStatus: source.workflow?.reviewStatus || 'approved',
    approvedForPublish: source.workflow?.approvedForPublish === true,
    approvedBy: source.workflow?.approvedBy || '',
    approvedAt: source.workflow?.approvedAt || '',
    lastEditedBy: 'codex_service_areas_region_grid_polish',
    lastEditedAt: new Date().toISOString(),
  };
  if (page.productionApproved !== undefined) page.productionApproved = source.productionApproved;
  if (page.publishApproved !== undefined) page.publishApproved = source.publishApproved;
  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'service-areas-region-grid-polish',
    rollbackNotes: page.revision?.rollbackNotes || 'Latest pre-update snapshot is available for rollback.',
    lastChangeSummary: 'service_areas_region_grid_polish: add sixth regional planning card for visual balance; no homepage/contact/theme/media/static/deploy/provider/Roller action.',
    lastChangeSource: requestedChangeSource,
    lastChangeAt: new Date().toISOString(),
  };

  const nextTopics = block.content.topics;
  state.regionGrid.afterCount = nextTopics.length;
  state.regionGrid.afterTitles = nextTopics.map((item) => item.title || '');
  state.regionGrid.unsupportedLocalClaims = hasUnsupportedLocalClaims(page);
  return page;
}

function runValidation(candidate) {
  writeValidation(files.jsonParse, jsonParseValidation([files.candidate]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(candidate));
  writeValidation(files.unsafeScan, unsafeScan([files.candidate]));
  writeValidation(files.contactusScan, stringScan([files.candidate], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.candidate]));
  writeValidation(files.defaultForm, defaultFormValidation(candidate));
  runImportPreflight(files.candidate, files.safePreflight);
  runDotNetContract(files.candidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
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

function productionFieldPersistenceValidation(candidate) {
  const source = state.baselines.serviceAreas.json || {};
  const block = findRegionBlock(candidate);
  const topics = Array.isArray(block?.content?.topics) ? block.content.topics : [];
  const sixth = topics.find((item) => item.title === sixthCard.title);
  const activeText = JSON.stringify(activePageOnly(candidate));
  const sourceText = JSON.stringify(activePageOnly(source));
  const candidateMediaIds = collectValuesByKey(activePageOnly(candidate), 'mediaAssetId').filter(Boolean).sort();
  const sourceMediaIds = collectValuesByKey(activePageOnly(source), 'mediaAssetId').filter(Boolean).sort();
  const checks = {
    routeServiceAreas: candidate.pageSlug === pageSlug && candidate.route === route && candidate.path === route,
    liveStatePreserved: candidate.isPublished === source.isPublished && candidate.includeInSitemap === source.includeInSitemap,
    workflowLivePreserved: candidate.workflow?.status === source.workflow?.status && candidate.workflow?.reviewStatus === source.workflow?.reviewStatus && candidate.workflow?.approvedForPublish === source.workflow?.approvedForPublish,
    productionApprovedPreserved: candidate.productionApproved === source.productionApproved,
    publishApprovedPreserved: candidate.publishApproved === source.publishApproved,
    rollbackMetadataPresent: Boolean(candidate.revision),
    regionBlockFound: Boolean(block),
    sixCardsPresent: topics.length === 6,
    sixthCardTextExact: Boolean(sixth && sixth.description === sixthCard.description),
    expectedPriorCardsPresent: state.regionGrid.expectedFiveCardsFound,
    noUnsupportedLocalClaims: !hasUnsupportedLocalClaims(candidate),
    selectedMailboxPreserved: !sourceText.includes('selectedMailbox') || activeText.includes(selectedMailbox),
    publicEmailDisplayPolicyPreserved: !sourceText.includes('publicEmailDisplayPolicy') || activeText.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !activeText.includes(legacyMailbox),
    ppecLogoPersists: activeText.includes(ppecLogoId),
    mediaIdsUnchanged: stableStringify(candidateMediaIds) === stableStringify(sourceMediaIds),
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(activeText.replaceAll('/state-city', '')),
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
    noHomepageOrContactPayload: candidate.pageSlug !== 'home' && candidate.pageSlug !== 'contact',
  };
  return withFailed(checks);
}

function defaultFormValidation(candidate) {
  const hasFormBlock = blocksOf(candidate).some((block) => block.type === 'formBlock');
  return hasFormBlock
    ? { ok: true, note: 'formBlock present.' }
    : { ok: true, skipped: true, reason: 'No formBlock exists on /service-areas; CTAs route to /contact.' };
}

function runImportPreflight(candidateRel, outputRelPath) {
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
  const dotnetOk = parsed.checks?.some((item) => item.check === 'dotnet-page-contract' && item.status === 'passed');
  parsed.ok = result.status === 0 && shapeOk && dotnetOk;
  parsed.command = commandSummary(result);
  writeValidation(outputRelPath, parsed);
}

function runDotNetContract(candidateRel) {
  const scratch = path.join(os.tmpdir(), `pumpkin-service-areas-region-grid-contract-${process.pid}-${Date.now()}`);
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

async function writeServiceAreas(candidate) {
  state.update.attempted = true;
  const changeSummary = `${requestedChangeSource}: add sixth regional planning card to balance /service-areas grid; keep live/published state; no homepage/contact/theme/media/static/deploy/provider/Roller action.`;
  const query = new URLSearchParams({ changeSource: apiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
  state.update.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${apiChangeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.update.httpStatus = response.status;
  state.update.performed = response.ok;
  if (response.ok) state.safety.serviceAreasWrites += 1;
  writeJson(files.writeResult, { ok: response.ok, status: response.status, endpoint: state.update.endpoint, page: response.json, safeText: response.safeText });
}

async function verifyAfterWrite() {
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
  const block = findRegionBlock(page);
  const topics = Array.isArray(block?.content?.topics) ? block.content.topics : [];
  const sixth = topics.find((item) => item.title === sixthCard.title);
  const source = state.baselines.serviceAreas.json || {};
  const beforeRevision = source.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const checks = {
    httpOk: serviceAreas.ok && serviceAreas.status === 200,
    routeServiceAreas: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    livePublishedState: page.isPublished === true && page.includeInSitemap === true && Boolean(page.publishedAt),
    workflowPublishedApproved: page.workflow?.status === 'published' && page.workflow?.reviewStatus === 'approved' && page.workflow?.approvedForPublish === true,
    productionApprovedPreserved: page.productionApproved === source.productionApproved,
    publishApprovedPreserved: page.publishApproved === source.publishApproved,
    revisionIncrementedOrRollback: Number.isFinite(beforeRevision) && Number.isFinite(afterRevision) ? afterRevision > beforeRevision : Boolean(page.revision),
    rollbackMetadataExists: Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable),
    regionBlockFound: Boolean(block),
    sixRegionCards: topics.length === 6,
    sixthCardTitle: Boolean(sixth),
    sixthCardBody: sixth?.description === sixthCard.description,
    noUnsupportedLocalClaims: !hasUnsupportedLocalClaims(page),
    ppecLogoPersists: activeText.includes(ppecLogoId),
    selectedMailbox: !activeText.includes('selectedMailbox') || activeText.includes(selectedMailbox),
    publicEmailDisplayPolicy: !activeText.includes('publicEmailDisplayPolicy') || activeText.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !activeText.includes(legacyMailbox),
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
  state.hygiene.results.nodeCheckRunner = commandSummary(run('node', ['--check', `${outputRel}/run-service-areas-region-grid-polish.mjs`], 120000));
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
  writeJson(files.finalHygiene, state.hygiene);
}

function writeReports() {
  writeMd(files.readme, `# Ice Service Areas Region Grid Polish

Generated: ${generatedAt}

Scope:

- Updated /service-areas only.
- Added or normalized one sixth regional planning card in the "Portable rink requests by U.S. region" grid.
- Kept the page live/published in CMS/public state.
- No homepage, contact, /state-city, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, image, or Roller action.

Public review URL:

http://localhost:3002/service-areas`);

  writeMd(files.regionPolish, `# Region Grid Polish

Target section: \`Portable rink requests by U.S. region\`

- Block id: \`${state.regionGrid.blockId || 'not found'}\`
- Cards before: ${state.regionGrid.beforeCount}
- Cards after: ${state.regionGrid.afterCount}
- Expected five existing cards found: ${yn(state.regionGrid.expectedFiveCardsFound)}
- Sixth card added: ${yn(state.regionGrid.sixthCardAdded)}
- Sixth card normalized: ${yn(state.regionGrid.sixthCardNormalized)}

Cards after:

${listOrNone(state.regionGrid.afterTitles)}

Approved sixth card:

- Title: Quote review by request
- Body: Submit your event city, state, date, venue type, and goals so the request can be reviewed without assuming local availability before details are confirmed.

No unsupported local availability claim was added.`);

  writeMd(files.validationMd, `# Pre-Write Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['production-field persistence validation', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.safePreflight)],
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

  writeMd(files.updateResultMd, `# Service Areas Update Result

- Route: /service-areas
- CMS write attempted: ${yn(state.update.attempted)}
- CMS write performed: ${yn(state.update.performed)}
- HTTP status: ${state.update.httpStatus ?? 'n/a'}
- Requested changeSource: \`${state.update.requestedChangeSource}\`
- API-supported changeSource used: \`${state.update.apiChangeSource}\`
- Endpoint: \`${state.update.endpoint || 'not attempted'}\`
- Service-area writes by this runner: ${state.safety.serviceAreasWrites}
- Homepage writes: no
- Contact writes: no
- Theme writes: no
- MediaAsset writes: no`);

  writeMd(files.readbackMd, `# Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.ok)}
- Route /service-areas: ${yn(state.readback.checks.routeServiceAreas)}
- Live/published state preserved: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- productionApproved preserved: ${yn(state.readback.checks.productionApprovedPreserved)}
- publishApproved preserved: ${yn(state.readback.checks.publishApprovedPreserved)}
- Revision/rollback metadata: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Region block found: ${yn(state.readback.checks.regionBlockFound)}
- Six region cards: ${yn(state.readback.checks.sixRegionCards)}
- Sixth card title exists: ${yn(state.readback.checks.sixthCardTitle)}
- Sixth card body exact: ${yn(state.readback.checks.sixthCardBody)}
- No unsupported local availability claim: ${yn(state.readback.checks.noUnsupportedLocalClaims)}
- PPEC logo persisted: ${yn(state.readback.checks.ppecLogoPersists)}
- selectedMailbox persisted if present: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy persisted if present: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}
- No /state-city page created: ${yn(state.readback.checks.noStateCityCreated)}

Failed checks:

${listOrNone(state.readback.failed)}`);

  writeMd(files.untouchedMd, `# Untouched Routes Verification

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- /state-city created: no

Snapshots:

- Service areas before: \`${files.beforeServiceAreas}\`
- Service areas after: \`${files.afterReadback}\`
- Homepage before/after: \`${files.homepageBefore}\`, \`${files.homepageAfter}\`
- Contact before/after: \`${files.contactBefore}\`, \`${files.contactAfter}\`
- Theme before/after: \`${files.themeBefore}\`, \`${files.themeAfter}\`
- MediaAssets before/after: \`${files.mediaBefore}\`, \`${files.mediaAfter}\``);

  writeMd(files.frontendChecklist, `# Frontend Preview Checklist

Public review URL:

http://localhost:3002/service-areas

Route probes:

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked', value?.reachable ? 'yes' : 'no']))}

Visual checks:

- The "Portable rink requests by U.S. region" grid has six cards.
- The sixth card title is "Quote review by request".
- The sixth card body uses the approved wording.
- The grid no longer has the awkward five-card imbalance.
- Homepage and /contact still render normally.`);

  writeMd(files.blockersMd, `# Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before static generation:

- Static generation was not authorized in this run.
- Review generated static output separately after explicit authorization.

Before deployment:

- Deployment was not authorized in this run.
- DNS, Cloudflare, Microsoft 365, Bluehost, and email/provider changes were not authorized.

Roller:

- Roller remains paused and untouched.`);

  writeJson(files.manifest, {
    schemaVersion: state.schemaVersion,
    generatedAt,
    site: 'IceSkatingRinkRentals.com',
    tenantId,
    siteKey,
    route,
    branch: state.start.branch,
    outputFolder: outputRel,
    rootReport: rootReportRel,
    candidate: files.candidate,
    readbackAfter: files.afterReadback,
    updatePerformed: state.update.performed,
    validationOk: state.validation.ok,
    readbackOk: state.readback.ok,
    regionGrid: state.regionGrid,
    untouched: state.untouched,
    routes: state.routes,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tokenPrinted: false,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    safety: state.safety,
    blockers: state.blockers,
  });

  writeMd(rootReportRel, `# Pumpkin Ice Service Areas Region Grid Polish Report

Generated: ${generatedAt}

## Start

Branch: \`${state.start.branch}\`

Git status at runner start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Existing prior output from the blocked auth attempt was updated/replaced by this retry. The known raw service-area input package remains untracked under \`content-review/ice-service-areas-input/\`.

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}
- Temp JWT deleted after successful completion: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}

## Region Grid Change

- Target route: \`/service-areas\`
- Target block id: \`${state.regionGrid.blockId || 'not found'}\`
- Cards before: ${state.regionGrid.beforeCount}
- Cards after: ${state.regionGrid.afterCount}
- Sixth card added: ${yn(state.regionGrid.sixthCardAdded)}
- Sixth card normalized: ${yn(state.regionGrid.sixthCardNormalized)}
- Sixth card title: \`Quote review by request\`
- Unsupported local availability claims added: no

## Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], [
    ['JSON parse', resultName(files.jsonParse)],
    ['.NET Page/block contract', resultName(files.dotnet)],
    ['production-field persistence', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.safePreflight)],
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

## CMS Write

- /service-areas write attempted: ${yn(state.update.attempted)}
- /service-areas write performed: ${yn(state.update.performed)}
- HTTP status: ${state.update.httpStatus ?? 'n/a'}
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`
- Homepage write: no
- /contact write: no
- /state-city created: no
- Theme write: no
- MediaAsset write: no

## Readback

- Readback ok: ${yn(state.readback.ok)}
- Route /service-areas: ${yn(state.readback.checks.routeServiceAreas)}
- Live/published state preserved: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- productionApproved preserved: ${yn(state.readback.checks.productionApprovedPreserved)}
- publishApproved preserved: ${yn(state.readback.checks.publishApprovedPreserved)}
- Revision/rollback metadata: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Six region cards: ${yn(state.readback.checks.sixRegionCards)}
- Sixth card body exact: ${yn(state.readback.checks.sixthCardBody)}
- No unsupported local availability claim: ${yn(state.readback.checks.noUnsupportedLocalClaims)}
- PPEC logo persists: ${yn(state.readback.checks.ppecLogoPersists)}
- selectedMailbox remains \`contact@iceskatingrinkrentals.com\` if present: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy remains \`form-first-under-review\` if present: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}

## Public Route Probes

${table(['Route', 'URL', 'Status'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked']))}

## Untouched Results

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}

## Hygiene

- node --check runner: ${state.hygiene.results.nodeCheckRunner ? yn(state.hygiene.results.nodeCheckRunner.ok) : 'not run'}
- git diff --check: ${state.hygiene.results.gitDiffCheck ? yn(state.hygiene.results.gitDiffCheck.ok) : 'not run'}
- trailing whitespace scan: ${state.hygiene.results.trailingWhitespaceScan ? yn(state.hygiene.results.trailingWhitespaceScan.ok) : 'not run'}
- protected/generated/raw artifact path check: ${state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? yn(state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok) : 'not run'}
- targeted secret scan: ${state.hygiene.results.targetedSecretScan ? yn(state.hygiene.results.targetedSecretScan.ok) : 'not run'}
- staged artifact check: ${state.hygiene.results.stagedArtifactCheck ? yn(state.hygiene.results.stagedArtifactCheck.ok) : 'not run'}

## Guardrails

- Static generation: no
- Deployment: no
- DNS/Cloudflare/Microsoft 365/Bluehost/email/provider changes: no
- Email sent: no
- Protected config read: no
- Images generated or modified: no
- Roller touched: no

## Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before static generation or deployment:

- Static generation and deployment were not authorized in this run.
- Any static package, Azure deployment, DNS/provider/email, or Roller work requires a separate task.

## Next Recommended Action

Review public \`http://localhost:3002/service-areas\` locally and confirm the regional planning grid now balances as expected.`);
}

function findRegionBlock(page) {
  return blocksOf(page).find((block) => block.id === 'regional-request-planning' || block.content?.title === 'Portable rink requests by U.S. region');
}

function hasUnsupportedLocalClaims(page) {
  const text = JSON.stringify(activePageOnly(page));
  const stripped = text.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand');
  return /\bEast Coast\b/i.test(stripped) ||
    /\bavailable in every\b/i.test(text) ||
    /\blocal availability\b/i.test(text.replace(/without assuming local availability/gi, '')) ||
    /\bserving all cities\b/i.test(text);
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

function emptyMedia() {
  return {
    mediaAssetId: '',
    assetId: '',
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl: '',
    url: '',
    alt: '',
    title: '',
    caption: '',
    description: '',
    source: '',
    licenseStatus: '',
    usageStatus: '',
    usageType: '',
    status: '',
    tags: [],
    decorative: false,
  };
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
    if (copy.MetaData) delete copy.MetaData.updatedAt;
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
