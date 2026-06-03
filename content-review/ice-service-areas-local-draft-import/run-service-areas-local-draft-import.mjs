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
const outputRel = 'content-review/ice-service-areas-local-draft-import';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_SERVICE_AREAS_LOCAL_DRAFT_IMPORT_REPORT.md';
const candidateRel = 'content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json';
const packageRel = 'content-review/ice-service-areas-validated/SERVICE_AREAS_IMPORT_PACKAGE.json';
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const route = '/service-areas';
const pageSlug = 'service-areas';
const canonicalUrl = 'https://iceskatingrinkrentals.com/service-areas';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const changeSource = 'service_areas_phase11b_local_draft_import';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const generatedAt = new Date().toISOString();

const officialMediaIds = new Set([
  'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
  'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
  'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
  'ice-rink-rentals-holidayicerink-973ce7691377',
  'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
  'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
]);

const files = {
  homepageSnapshot: `${outputRel}/current-homepage-before-service-areas-import.snapshot.json`,
  contactSnapshot: `${outputRel}/current-contact-before-service-areas-import.snapshot.json`,
  serviceAreasBaseline: `${outputRel}/current-service-areas-before-import.snapshot.json`,
  themeBaseline: `${outputRel}/theme-before-service-areas-import.snapshot.json`,
  mediaBaseline: `${outputRel}/media-assets-before-service-areas-import.snapshot.json`,
  serviceAreasReadback: `${outputRel}/service-areas-readback-after-import.json`,
  homepageAfter: `${outputRel}/homepage-after-service-areas-import.readonly.json`,
  contactAfter: `${outputRel}/contact-after-service-areas-import.readonly.json`,
  themeAfter: `${outputRel}/theme-after-service-areas-import.readonly.json`,
  mediaAfter: `${outputRel}/media-assets-after-service-areas-import.readonly.json`,
  writeResult: `${outputRel}/service-areas-write-result.json`,
  preflight: `${outputRel}/service-areas-import-preflight-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  contractPersistence: `${outputRel}/contract-persistence-validation-result.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  defaultForm: `${outputRel}/default-form-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  routeCanonical: `${outputRel}/route-canonical-audit-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
  frontendProbe: `${outputRel}/frontend-probe-result.json`,
  manifest: `${outputRel}/manifest.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.service-areas.local-draft-import.v1',
  generatedAt,
  tenantId,
  siteKey,
  route,
  pageSlug,
  outputFolder: outputRel,
  rootReport: rootReportRel,
  start: {
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    branch: git(['branch', '--show-current']),
    api: null,
    inputFiles: [],
    cleanExceptRawServiceAreaInput: false,
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
  validation: {
    ok: false,
    results: {},
    hardBlockers: [],
    expectedWarnings: [],
  },
  baselines: {
    captured: false,
    homepage: null,
    contact: null,
    serviceAreas: null,
    theme: null,
    mediaAssets: null,
  },
  import: {
    attempted: false,
    performed: false,
    method: '',
    endpoint: '',
    httpStatus: null,
    safeText: '',
    created: false,
    updated: false,
    baselineWas404: false,
  },
  readback: {
    performed: false,
    ok: false,
    failed: [],
    checks: {},
    summary: null,
  },
  untouched: {
    homepageUnchanged: null,
    contactUnchanged: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
  },
  frontend: {
    checked: false,
    results: {},
  },
  hygiene: {
    ok: false,
    results: {},
    failed: [],
  },
  safety: {
    serviceAreasWrite: false,
    homepageWrite: false,
    contactWrite: false,
    stateCityCreated: false,
    themeWrite: false,
    mediaAssetWrite: false,
    staticGeneration: false,
    deployment: false,
    dnsEmailProviderAzureCloudflareBluehostChanged: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
    imageGenerationUsed: false,
    imageFilesModified: false,
    jwtPrinted: false,
  },
  remainingBlockers: {
    beforeCmsLiveApproval: [],
    beforeStaticRegeneration: [],
    beforeProductionIndexing: [],
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  try {
    state.start.cleanExceptRawServiceAreaInput = cleanExceptExpectedRawInput(state.start.gitStatusShort);
    state.start.api = await probe(apiBase);
    state.start.inputFiles = [candidateRel, packageRel].map((file) => ({ file, exists: existsSync(abs(file)) }));

    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable at http://localhost:5064.');
    if (state.start.inputFiles.some((item) => !item.exists)) throw new Error('Required service-areas candidate/package file is missing.');

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    runPreImportValidation();
    if (!state.validation.ok) throw new Error(`Pre-import validation failed: ${state.validation.hardBlockers.join('; ')}.`);

    await captureBaselines();
    await writeServiceAreas();
    if (!state.import.performed) throw new Error(`Service-areas import failed with HTTP ${state.import.httpStatus}.`);

    await verifyAfterWrite();
    if (!state.readback.ok) throw new Error(`Service-areas readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((item) => item === true)) throw new Error('Untouched route/theme/media verification failed.');

    await probeFrontendRoutes();
    state.remainingBlockers = buildRemainingBlockers();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) state.blockers.push(`Final hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);

  state.success = state.blockers.length === 0 &&
    state.validation.ok === true &&
    state.import.performed === true &&
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
    import: {
      attempted: state.import.attempted,
      performed: state.import.performed,
      method: state.import.method,
      httpStatus: state.import.httpStatus,
      created: state.import.created,
      updated: state.import.updated,
    },
    readback: {
      ok: state.readback.ok,
      failed: state.readback.failed,
    },
    untouched: state.untouched,
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

function runPreImportValidation() {
  const candidate = readJson(candidateRel);
  const inputFiles = [abs(candidateRel), abs(packageRel)];
  writeValidation(files.jsonParse, jsonParseValidation(inputFiles));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(candidate));
  writeValidation(files.unsafeScan, unsafeScan(inputFiles));
  writeValidation(files.contactusScan, stringScan(inputFiles, legacyMailbox));
  writeValidation(files.secretScan, secretScan(inputFiles));
  runImportPreflight();
  runDotNetContract(abs(candidateRel));
  runContractPersistence(abs(candidateRel));
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  if (blocksOf(candidate).some((block) => block.type === 'formBlock')) {
    runSimpleCommand(files.defaultForm, ['node', 'tools/default-form-validation/validate-default-form-fixtures.mjs']);
  } else {
    writeValidation(files.defaultForm, {
      ok: true,
      skipped: true,
      reason: 'No formBlock exists in the normalized /service-areas candidate; CTAs route to /contact.',
    });
  }
  runSimpleCommand(files.tailwind, ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand(files.normalizer, ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const required = [
    files.jsonParse,
    files.productionPersistence,
    files.routeCanonical,
    files.unsafeScan,
    files.contactusScan,
    files.secretScan,
    files.preflight,
    files.dotnet,
    files.contractPersistence,
    files.designSystem,
    files.mediaValidation,
    files.defaultForm,
    files.tailwind,
    files.normalizer,
  ];
  state.validation.hardBlockers = required
    .filter((file) => state.validation.results[path.basename(file)]?.ok !== true)
    .map((file) => `${path.basename(file)} failed`);
  state.validation.ok = state.validation.hardBlockers.length === 0;
}

async function captureBaselines() {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage(pageSlug),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);

  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!contact.ok) throw new Error(`Contact baseline read failed with HTTP ${contact.status}.`);
  if (!(serviceAreas.ok || serviceAreas.status === 404)) throw new Error(`Service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);

  state.baselines = {
    captured: true,
    homepage,
    contact,
    serviceAreas,
    theme,
    mediaAssets,
  };

  writeJson(files.homepageSnapshot, homepage.json);
  writeJson(files.contactSnapshot, contact.json);
  writeJson(files.serviceAreasBaseline, serviceAreas.json || { httpStatus: serviceAreas.status, status: serviceAreas.status === 404 ? 'expected-not-found' : 'not-captured' });
  writeJson(files.themeBaseline, theme.json);
  writeJson(files.mediaBaseline, mediaAssets.json);
}

async function writeServiceAreas() {
  const candidate = prepareCandidateForDraftImport(readJson(candidateRel));
  state.import.baselineWas404 = state.baselines.serviceAreas?.status === 404;
  state.import.attempted = true;

  const changeSummary = 'Import /service-areas as local CMS draft/needs_review only; no homepage/contact/theme/media/static/deploy/DNS/email/provider/Roller changes.';

  const endpoint = state.import.baselineWas404
    ? `/api/admin/pages/${tenantId}`
    : `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${new URLSearchParams({ changeSource, changeSummary })}`;
  const method = state.import.baselineWas404 ? 'POST' : 'PUT';

  state.import.method = method;
  state.import.endpoint = `${method} ${endpoint.replace(/\?.+$/, '?changeSource=service_areas_phase11b_local_draft_import')}`;

  const response = await apiJson(endpoint, {
    method,
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });

  state.import.httpStatus = response.status;
  state.import.safeText = response.safeText;
  state.import.performed = response.ok;
  state.import.created = method === 'POST' && response.ok;
  state.import.updated = method === 'PUT' && response.ok;
  state.safety.serviceAreasWrite = response.ok;

  writeJson(files.writeResult, {
    ok: response.ok,
    status: response.status,
    method,
    endpoint: state.import.endpoint,
    created: state.import.created,
    updated: state.import.updated,
    safeText: response.safeText,
    page: response.json,
  });
}

async function verifyAfterWrite() {
  const [serviceAreas, homepage, contact, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('contact'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);

  state.readback.performed = true;
  writeJson(files.serviceAreasReadback, serviceAreas.json || { httpStatus: serviceAreas.status });
  writeJson(files.homepageAfter, homepage.json || { httpStatus: homepage.status });
  writeJson(files.contactAfter, contact.json || { httpStatus: contact.status });
  writeJson(files.themeAfter, theme.json || { httpStatus: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { httpStatus: mediaAssets.status });

  const page = serviceAreas.json || {};
  const beforeRevision = state.baselines.serviceAreas?.json?.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const activeText = JSON.stringify(activePageOnly(page));
  const strippedPartnerBrand = activeText.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand');
  const mediaIds = unique(collectValuesByKey(activePageOnly(page), 'mediaAssetId')).sort();
  const selectedMailboxOk = !activeText.includes('selectedMailbox') || activeText.includes(selectedMailbox);
  const policyOk = !activeText.includes('publicEmailDisplayPolicy') || activeText.includes(publicEmailDisplayPolicy);

  const checks = {
    httpOk: serviceAreas.ok && serviceAreas.status === 200,
    routeServiceAreas: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    draftNeedsReview: page.isPublished === false && page.workflow?.status === 'draft' && page.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true && page.workflow?.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true && page.workflow?.publishApproved !== true && page.workflow?.approvedForPublish === false,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    revisionIncrementedOrRollbackMetadata: state.import.created
      ? Boolean(page.revision)
      : (Number.isFinite(beforeRevision) && Number.isFinite(afterRevision) ? afterRevision > beforeRevision : Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable)),
    rollbackMetadataExists: Boolean(page.revision) && (state.import.created || page.revision?.rollbackAvailable === true || page.revision?.latestSnapshot),
    canonicalCorrect: (!page.canonicalUrl || page.canonicalUrl === canonicalUrl) && page.seo?.canonicalUrl === canonicalUrl,
    selectedMailbox: selectedMailboxOk,
    publicEmailDisplayPolicy: policyOk,
    noLegacyMailbox: !activeText.includes(legacyMailbox),
    officialMediaIds: mediaIds.length > 0 && mediaIds.every((id) => officialMediaIds.has(id)),
    noUnsupportedEastCoastClaim: !/\bEast Coast\b/i.test(strippedPartnerBrand),
    noStateCityCreated: page.linking?.cityPagesCreated !== true && !/\/[a-z]{2}-[a-z0-9-]+/i.test(activeText.replaceAll('/state-city', '')),
    noHomepagePayload: page.pageSlug !== 'home' && page.route !== '/',
    noContactPayload: page.pageSlug !== 'contact' && page.route !== '/contact',
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.checks = checks;
  state.readback.failed = failed;
  state.readback.ok = failed.length === 0;
  state.readback.summary = summarizePage(page);

  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baselines.homepage.hash;
  state.untouched.contactUnchanged = contact.ok && contact.hash === state.baselines.contact.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;
}

async function probeFrontendRoutes() {
  const urls = {
    serviceAreas: `${webBase}/service-areas`,
    homepagePreview: `${webBase}/__preview/${tenantId}/home`,
    contact: `${webBase}/contact`,
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => [key, { url, ...(await probe(url)) }]));
  state.frontend.checked = true;
  state.frontend.results = Object.fromEntries(entries.map(([key, value]) => [
    key,
    {
      url: value.url,
      reachable: value.reachable,
      status: value.status,
      length: value.length,
      marker: key === 'serviceAreas' ? value.text?.includes('Portable ice rink rental service-area review') : undefined,
    },
  ]));
  writeJson(files.frontendProbe, state.frontend);
}

function prepareCandidateForDraftImport(source) {
  const page = clone(source);
  page.PageId = page.PageId || 'ice-rink-rentals-service-areas';
  page.id = page.id || page.PageId;
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
    approvedForImport: false,
    productionApproved: false,
    publishApproved: false,
    lastEditedAt: new Date().toISOString(),
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: page.staticPublishing?.deploymentStatus || 'not_generated',
    productionApproved: false,
  };
  page.revision = {
    ...(page.revision || {}),
    revisionNumber: page.revision?.revisionNumber || 1,
    rollbackNotes: page.revision?.rollbackNotes || 'Local draft import prepared with rollback metadata.',
    lastChangeSummary: 'Service areas local draft import prepared; no live/published/static/deploy action.',
    lastChangeSource: changeSource,
    lastChangeAt: new Date().toISOString(),
  };
  if (page.seo) page.seo.canonicalUrl = canonicalUrl;
  return page;
}

function productionFieldPersistenceValidation(candidate) {
  const checks = {
    draftState: candidate.isPublished === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: candidate.productionApproved === false && candidate.workflow?.productionApproved === false,
    publishApprovedFalse: candidate.publishApproved === false && candidate.workflow?.publishApproved === false && candidate.workflow?.approvedForPublish === false,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    staticEligibleFalse: candidate.staticPublishing?.staticEligible === false,
    revisionMetadataPresent: Boolean(candidate.revision),
    rollbackMetadataPresent: Boolean(candidate.revision?.rollbackNotes),
  };
  return withFailed(checks);
}

function routeCanonicalAudit(candidate) {
  const text = JSON.stringify(activePageOnly(candidate));
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    route: candidate.route === route,
    path: candidate.path === route,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    canonicalUrl: candidate.canonicalUrl === canonicalUrl && candidate.seo?.canonicalUrl === canonicalUrl,
    noStateCityCreated: candidate.linking?.cityPagesCreated === false && !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replace('/state-city', '')),
    noHomepageOrContactPayload: candidate.pageSlug !== 'home' && candidate.pageSlug !== 'contact',
  };
  return withFailed(checks);
}

function runImportPreflight() {
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', route,
    '--mode', 'preflight-only',
    '--output', files.preflight,
  ], 240000);
  const parsed = existsSync(abs(files.preflight)) ? readJson(files.preflight) : {};
  parsed.ok = result.status === 0 &&
    parsed.classification?.['preflight-valid-for-shape'] === true &&
    parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.command = commandSummary(result);
  writeValidation(files.preflight, parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-service-areas-import-contract-${process.pid}-${Date.now()}`);
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
  writeValidation(files.dotnet, {
    ok: validate.status === 0 && inferOk(parsed, validate),
    publish: commandSummary(publish),
    validate: commandSummary(validate),
    parsed,
  });
}

function runContractPersistence(candidatePath) {
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', rel(candidatePath),
    '--output', files.contractPersistence,
  ], 180000);
  const parsed = existsSync(abs(files.contractPersistence)) ? readJson(files.contractPersistence) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  writeValidation(files.contractPersistence, parsed);
}

function runSimpleCommand(file, args) {
  const result = run(args[0], args.slice(1), 240000);
  const parsed = parseJson(result.stdout.trim());
  writeValidation(file, {
    ok: inferOk(parsed, result),
    command: commandSummary(result),
    parsed,
  });
}

function runHygieneChecks() {
  const outputFiles = listFiles(outputDir).filter(isTextFile);
  const filesToScan = unique([path.join(repoRoot, rootReportRel), ...outputFiles].filter(existsSync));
  const gitDiffCheck = run('git', ['diff', '--check'], 120000);
  const trailingWhitespace = trailingWhitespaceScan(filesToScan);
  const targetedSecret = secretScan(filesToScan);
  const pathCheck = protectedGeneratedRawArtifactPathCheck();
  const staged = stagedArtifactCheck();
  state.hygiene.results = {
    gitDiffCheck: commandSummary(gitDiffCheck),
    trailingWhitespaceScan: trailingWhitespace,
    targetedSecretScan: targetedSecret,
    protectedGeneratedRawArtifactPathCheck: pathCheck,
    stagedArtifactCheck: staged,
  };
  const checks = {
    gitDiffCheck: gitDiffCheck.status === 0,
    trailingWhitespaceScan: trailingWhitespace.ok,
    targetedSecretScan: targetedSecret.ok,
    protectedGeneratedRawArtifactPathCheck: pathCheck.ok,
    stagedArtifactCheck: staged.ok,
  };
  state.hygiene.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.hygiene.ok = state.hygiene.failed.length === 0;
}

function writeReports() {
  writeJson(files.manifest, state);
  writeMd(`${outputRel}/README.md`, renderReadme());
  writeMd(`${outputRel}/PRE_IMPORT_VALIDATION.md`, renderPreImportValidation());
  writeMd(`${outputRel}/BASELINE_SNAPSHOTS.md`, renderBaselineSnapshots());
  writeMd(`${outputRel}/SERVICE_AREAS_IMPORT_RESULT.md`, renderImportResult());
  writeMd(`${outputRel}/SERVICE_AREAS_READBACK_VERIFICATION.md`, renderReadbackVerification());
  writeMd(`${outputRel}/ROUTE_CANONICAL_VERIFICATION.md`, renderRouteCanonicalVerification());
  writeMd(`${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`, renderUntouchedVerification());
  writeMd(`${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`, renderFrontendPreviewChecklist());
  writeMd(`${outputRel}/AUTH_LIFECYCLE_RESULT.md`, renderAuthLifecycle());
  writeMd(`${outputRel}/REMAINING_BLOCKERS.md`, renderRemainingBlockers());
  writeMd(rootReportRel, renderRootReport());
}

function renderReadme() {
  return md(`# Ice Service Areas Local Draft Import

Generated: ${generatedAt}

This package imports or updates IceSkatingRinkRentals.com \`/service-areas\` in the local CMS only as draft/needs_review. It does not update the homepage, contact page, Theme records, MediaAsset records, static output, deployments, DNS/email/provider systems, protected config, image files, or Roller.

Input candidate: \`${candidateRel}\`

Input package: \`${packageRel}\`

Root report: \`${rootReportRel}\``);
}

function renderPreImportValidation() {
  const rows = [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['Production-field persistence validation', resultName(files.productionPersistence)],
    ['Safe import preflight', resultName(files.preflight)],
    ['Design-system validation', resultName(files.designSystem)],
    ['Media validation', resultName(files.mediaValidation)],
    ['Default form validation', resultName(files.defaultForm)],
    ['Tailwind/navigation validation', resultName(files.tailwind)],
    ['Page intake normalizer validation', resultName(files.normalizer)],
    ['Unsafe HTML/CSS/form/media/email scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['Route/canonical audit', resultName(files.routeCanonical)],
    ['Targeted secret scan', resultName(files.secretScan)],
  ];
  return md(`# Pre-Import Validation

${table(['Check', 'Result'], rows)}

Validation overall: ${yn(state.validation.ok)}

Hard blockers:

${listOrNone(state.validation.hardBlockers)}`);
}

function renderBaselineSnapshots() {
  return md(`# Baseline Snapshots

- Homepage snapshot: \`${files.homepageSnapshot}\`
- Contact snapshot: \`${files.contactSnapshot}\`
- Service-areas baseline: \`${files.serviceAreasBaseline}\`
- Theme baseline: \`${files.themeBaseline}\`
- MediaAsset baseline: \`${files.mediaBaseline}\`

Baseline captured: ${yn(state.baselines.captured)}

Service-areas baseline status: ${state.baselines.serviceAreas?.status ?? 'not captured'}${state.baselines.serviceAreas?.status === 404 ? ' (expected not found)' : ''}`);
}

function renderImportResult() {
  return md(`# Service Areas Import Result

- Import attempted: ${yn(state.import.attempted)}
- Import performed: ${yn(state.import.performed)}
- Method: ${state.import.method || 'not used'}
- Endpoint: \`${state.import.endpoint || 'not used'}\`
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Created: ${yn(state.import.created)}
- Updated: ${yn(state.import.updated)}
- Baseline was 404: ${yn(state.import.baselineWas404)}
- changeSource requested for update path: \`${changeSource}\`
- CMS writes outside \`/service-areas\`: no
- Static generation/deployment/email/provider/Roller action: no`);
}

function renderReadbackVerification() {
  return md(`# Service Areas Readback Verification

Readback performed: ${yn(state.readback.performed)}

Readback ok: ${yn(state.readback.ok)}

${table(['Check', 'Result'], Object.entries(state.readback.checks).map(([key, value]) => [key, yn(value)]))}

Failed checks:

${listOrNone(state.readback.failed)}

Readback artifact: \`${files.serviceAreasReadback}\``);
}

function renderRouteCanonicalVerification() {
  const routeResult = state.validation.results[path.basename(files.routeCanonical)];
  return md(`# Route And Canonical Verification

- Candidate route/canonical audit ok: ${yn(routeResult?.ok)}
- Readback route/canonical ok: ${yn(state.readback.checks.routeServiceAreas && state.readback.checks.canonicalCorrect)}
- Expected route: \`${route}\`
- Expected slug/pageSlug: \`${pageSlug}\`
- Expected canonical URL: \`${canonicalUrl}\`
- State/city pages created: no`);
}

function renderUntouchedVerification() {
  return md(`# Untouched Routes Verification

${table(['Area', 'Unchanged'], [
    ['Homepage /', yn(state.untouched.homepageUnchanged)],
    ['/contact', yn(state.untouched.contactUnchanged)],
    ['Theme records', yn(state.untouched.themeUnchanged)],
    ['MediaAsset records', yn(state.untouched.mediaAssetsUnchanged)],
  ])}

No homepage, contact, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, image, or Roller write was performed.`);
}

function renderFrontendPreviewChecklist() {
  const rows = Object.entries(state.frontend.results || {}).map(([key, value]) => [
    key,
    value.url,
    value.reachable ? 'yes' : 'no',
    value.status ?? 'n/a',
    value.length ?? 'n/a',
  ]);
  return md(`# Frontend Preview Checklist

Frontend probes are opportunistic local checks only; browser visual approval is still required before static or production work.

${table(['Route', 'URL', 'Reachable', 'HTTP status', 'Response length'], rows)}

Manual review targets:

- \`http://localhost:3002/service-areas\`
- \`http://localhost:3002/__preview/ice-rink-rentals/home\`
- \`http://localhost:3002/contact\``);
}

function renderAuthLifecycle() {
  return md(`# Auth Lifecycle Result

- Env JWT status: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after successful completion: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}`);
}

function renderRemainingBlockers() {
  const blockers = state.remainingBlockers.beforeCmsLiveApproval.length
    ? state.remainingBlockers
    : buildRemainingBlockers();
  return md(`# Remaining Blockers

## Before CMS/Live Approval

${listOrNone(blockers.beforeCmsLiveApproval)}

## Before Static Regeneration

${listOrNone(blockers.beforeStaticRegeneration)}

## Before Production/Indexing

${listOrNone(blockers.beforeProductionIndexing)}`);
}

function renderRootReport() {
  const frontend = state.frontend.results || {};
  return md(`# Pumpkin Ice Service Areas Local Draft Import Report

Generated: ${generatedAt}

## Scope

- Primary site: IceSkatingRinkRentals.com
- Route imported/updated: \`/service-areas\`
- Local CMS only: yes
- Draft/needs_review only: yes
- Roller remains paused: yes

## Start State

Git status at start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent git log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Candidate/package present: ${yn(state.start.inputFiles.every((item) => item.exists))}

## Auth

- Auth status: ${state.auth.validation}
- Presence: ${state.auth.presence}
- JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## Validation Results

${table(['Validation', 'Result'], [
    ['JSON parse', resultName(files.jsonParse)],
    ['.NET Page/block contract', resultName(files.dotnet)],
    ['Production-field persistence', resultName(files.productionPersistence)],
    ['Safe import preflight', resultName(files.preflight)],
    ['Design-system', resultName(files.designSystem)],
    ['Media validation', resultName(files.mediaValidation)],
    ['Default form', resultName(files.defaultForm)],
    ['Tailwind/navigation', resultName(files.tailwind)],
    ['Page intake normalizer', resultName(files.normalizer)],
    ['Unsafe scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['Route/canonical audit', resultName(files.routeCanonical)],
    ['Targeted secret scan', resultName(files.secretScan)],
  ])}

## Import Result

- Import performed: ${yn(state.import.performed)}
- Service-areas update result: ${state.import.created ? 'created' : state.import.updated ? 'updated' : 'not performed'}
- Method/HTTP status: ${state.import.method || 'n/a'} ${state.import.httpStatus ?? ''}
- Revision/rollback result: ${yn(state.readback.checks.revisionIncrementedOrRollbackMetadata && state.readback.checks.rollbackMetadataExists)}
- Readback result: ${yn(state.readback.ok)}
- Route/canonical result: ${yn(state.readback.checks.routeServiceAreas && state.readback.checks.canonicalCorrect)}
- Media verification result: ${yn(state.readback.checks.officialMediaIds)}

## Untouched Results

- Homepage untouched: ${yn(state.untouched.homepageUnchanged)}
- Contact untouched: ${yn(state.untouched.contactUnchanged)}
- Theme untouched: ${yn(state.untouched.themeUnchanged)}
- MediaAssets untouched: ${yn(state.untouched.mediaAssetsUnchanged)}

## Frontend Preview Result

${table(['URL', 'Status', 'Reachable'], Object.values(frontend).map((item) => [item.url, item.status ?? 'n/a', item.reachable ? 'yes' : 'no']))}

## Final Hygiene

${table(['Check', 'Result'], [
    ['git diff --check', state.hygiene.results.gitDiffCheck?.status === 0 ? 'pass' : 'fail'],
    ['trailing whitespace scan', state.hygiene.results.trailingWhitespaceScan?.ok ? 'pass' : 'fail'],
    ['protected/generated/raw artifact path check', state.hygiene.results.protectedGeneratedRawArtifactPathCheck?.ok ? 'pass' : 'fail'],
    ['targeted secret scan', state.hygiene.results.targetedSecretScan?.ok ? 'pass' : 'fail'],
    ['no ZIP/raw/extracted/static artifacts staged', state.hygiene.results.stagedArtifactCheck?.ok ? 'pass' : 'fail'],
  ])}

## Safety Confirmation

- No homepage update: ${yn(!state.safety.homepageWrite)}
- No contact update: ${yn(!state.safety.contactWrite)}
- No state-city pages created: ${yn(!state.safety.stateCityCreated)}
- No Theme records updated: ${yn(!state.safety.themeWrite)}
- No MediaAsset records updated: ${yn(!state.safety.mediaAssetWrite)}
- No static generation: ${yn(!state.safety.staticGeneration)}
- No deployment/DNS/email/provider action: ${yn(!state.safety.deployment && !state.safety.dnsEmailProviderAzureCloudflareBluehostChanged && !state.safety.emailSent)}
- No protected config touched: ${yn(!state.safety.protectedConfigRead)}
- Roller remains paused: ${yn(!state.safety.rollerTouched)}

## Remaining Blockers

Before CMS/live approval:

${listOrNone((state.remainingBlockers.beforeCmsLiveApproval.length ? state.remainingBlockers : buildRemainingBlockers()).beforeCmsLiveApproval)}

Before static regeneration:

${listOrNone((state.remainingBlockers.beforeStaticRegeneration.length ? state.remainingBlockers : buildRemainingBlockers()).beforeStaticRegeneration)}

Before production/indexing:

${listOrNone((state.remainingBlockers.beforeProductionIndexing.length ? state.remainingBlockers : buildRemainingBlockers()).beforeProductionIndexing)}

## Next Recommended Action

Review \`http://localhost:3002/service-areas\` locally, then request separate approval for any CMS/live approval, static regeneration, production deployment, DNS/email/provider, or Roller work.`);
}

function buildRemainingBlockers() {
  return {
    beforeCmsLiveApproval: [
      'Manual browser review of /service-areas is required.',
      'Human approval must be recorded before any live/published state change.',
      'productionApproved and publishApproved remain false.',
    ],
    beforeStaticRegeneration: [
      'Static generation is not authorized in this run.',
      'Azure Blob/Cloudflare media path is not verified for production/static media.',
      'staticPublishing.staticEligible remains false.',
    ],
    beforeProductionIndexing: [
      'Deployment, DNS, provider, and email changes are not authorized.',
      'Public contact/phone/email display policy remains under review.',
      'Production/indexing requires separate explicit approval after static output and deployment checks.',
    ],
  };
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

function jsonParseValidation(paths) {
  const results = paths.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: safeMessage(error) };
    }
  });
  return { ok: results.every((item) => item.ok), generatedAt: new Date().toISOString(), results };
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
  const hits = paths.filter((file) => readFileSync(file, 'utf8').includes(needle)).map((file) => ({ path: rel(file) }));
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function secretScan(paths) {
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['smtp-secret', /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD)\b\s*[:=]/i],
  ];
  return scanPatterns(paths.filter(isTextFile), patterns);
}

function scanPatterns(paths, patterns) {
  const hits = [];
  for (const file of paths.filter(isTextFile)) {
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: rel(file), code });
    }
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
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
  return {
    ok: staged.filter((file) => /\.(zip|7z|tar|gz)$/i.test(file)).length === 0 &&
      staged.filter((file) => /\.(png|jpe?g|gif|webp|avif|pdf)$/i.test(file)).length === 0 &&
      staged.filter((file) => file.startsWith('content-review/ice-service-areas-input/extracted/')).length === 0 &&
      staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file)).length === 0,
    stagedCount: staged.length,
    zipStaged: staged.filter((file) => /\.(zip|7z|tar|gz)$/i.test(file)),
    rawMediaStaged: staged.filter((file) => /\.(png|jpe?g|gif|webp|avif|pdf)$/i.test(file)),
    extractedInputStaged: staged.filter((file) => file.startsWith('content-review/ice-service-areas-input/extracted/')),
    staticArtifactsStaged: staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file)),
  };
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
  return { ok: failed.length === 0, generatedAt: new Date().toISOString(), checks, failed };
}

function inferOk(parsed, result) {
  if (parsed && typeof parsed === 'object' && typeof parsed.ok === 'boolean') return result.status === 0 && parsed.ok === true;
  if (parsed && typeof parsed === 'object' && typeof parsed.Ok === 'boolean') return result.status === 0 && parsed.Ok === true;
  return result.status === 0;
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
  delete copy.revision?.latestSnapshot;
  return copy;
}

function summarizePage(page) {
  return {
    pageId: page?.PageId || page?.id || '',
    pageSlug: page?.pageSlug || page?.PageSlug || '',
    route: page?.route || '',
    path: page?.path || '',
    isPublished: page?.isPublished,
    workflowStatus: page?.workflow?.status || '',
    reviewStatus: page?.workflow?.reviewStatus || '',
    revisionNumber: page?.revision?.revisionNumber ?? null,
    rollbackAvailable: page?.revision?.rollbackAvailable ?? null,
    lastChangeSource: page?.revision?.lastChangeSource || '',
  };
}

function cleanExceptExpectedRawInput(status) {
  const lines = status.split(/\r?\n/).filter(Boolean);
  return lines.every((line) => {
    const file = line.slice(3).replace(/\\/g, '/');
    return line.startsWith('?? ') &&
      (file === 'content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip' ||
        file.startsWith('content-review/ice-service-areas-input/extracted/'));
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
  const copy = clone(value);
  if (copy && typeof copy === 'object') {
    delete copy.updatedAt;
    delete copy.UpdatedAt;
    delete copy.revision?.lastChangeAt;
    delete copy.revision?.lastRevisionAt;
    delete copy.workflow?.lastEditedAt;
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
  return [...new Set(values)];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseJson(text) {
  try {
    return JSON.parse(text);
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
  writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMd(file, value) {
  const full = abs(file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, md(value), 'utf8');
}

function md(value) {
  return `${String(value).trim()}\n`;
}

function abs(file) {
  return path.isAbsolute(file) ? file : path.join(repoRoot, file);
}

function rel(file) {
  return path.relative(repoRoot, path.resolve(file)).replace(/\\/g, '/');
}

function git(args) {
  const result = run('git', args, 120000);
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
