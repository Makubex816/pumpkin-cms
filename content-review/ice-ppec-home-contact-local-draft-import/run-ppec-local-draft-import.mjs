import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const outRel = 'content-review/ice-ppec-home-contact-local-draft-import';
const outDir = path.join(repo, outRel);
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const publicEmailDisplayPolicy = 'form-first-under-review';
const staticEndpointRef = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const leadRecipientRef = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const changeSource = 'ppec_home_contact_repair_import';
const now = new Date().toISOString();
const tempJwtPath = path.join(process.env.TEMP || process.env.TMP || '.', 'pumpkin-admin-jwt.txt');

const files = {
  homeCandidate: 'content-review/ice-ppec-home-contact-repair/UPDATED_HOMEPAGE_WITH_PPEC_CANDIDATE.json',
  contactCandidate: 'content-review/ice-ppec-home-contact-repair/UPDATED_CONTACT_WITH_PPEC_CANDIDATE.json',
  importPackage: 'content-review/ice-ppec-home-contact-repair/UPDATED_HOME_CONTACT_WITH_PPEC_PACKAGE.json',
  homePreflight: `${outRel}/homepage-ppec-import-preflight-result.json`,
  contactPreflight: `${outRel}/contact-ppec-import-preflight-result.json`,
  dotnetPreImport: `${outRel}/dotnet-updated-home-contact-ppec-pre-import-result.json`,
  validationSummary: `${outRel}/validation-command-results.json`,
  homeSnapshot: `${outRel}/current-homepage-before-ppec-import.snapshot.json`,
  contactSnapshot: `${outRel}/current-contact-before-ppec-import.snapshot.json`,
  serviceAreasSnapshot: `${outRel}/service-areas-before-ppec-import.snapshot.json`,
  themeSnapshot: `${outRel}/theme-before-ppec-import.snapshot.json`,
  mediaAssetsSnapshot: `${outRel}/media-assets-before-ppec-import.snapshot.json`,
  homeReadback: `${outRel}/homepage-readback-after-ppec-import.json`,
  contactReadback: `${outRel}/contact-readback-after-ppec-import.json`,
  homeWriteResult: `${outRel}/homepage-ppec-write-result.json`,
  contactWriteResult: `${outRel}/contact-ppec-write-result.json`,
  readbackDotnet: `${outRel}/dotnet-updated-home-contact-ppec-readback-result.json`,
  manifest: `${outRel}/manifest.json`,
  rootReport: 'PUMPKIN_ICE_PPEC_HOME_CONTACT_LOCAL_DRAFT_IMPORT_REPORT.md',
};

const state = {
  schemaVersion: 'pumpkin-ice-ppec-home-contact-local-draft-import.v1',
  createdAt: now,
  tenantId,
  siteKey,
  domain,
  branch: git(['branch', '--show-current']),
  head: git(['rev-parse', '--short', 'HEAD']),
  startState: {
    gitStatusAtStart: lines(git(['status', '--short', '--untracked-files=all'])),
    gitLogAtStart: lines(git(['log', '--oneline', '-12'])),
  },
  serviceReachability: {},
  adminAuth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempFileStatus: 'MISSING',
    tempJwtInitialStatus: 'MISSING',
    tempJwtLoaded: false,
    tempJwtDeletedAfterSuccess: false,
    tempJwtRetainedOnFailure: false,
    tempJwtFinalStatus: 'MISSING',
    tempJwtCleanupReason: '',
    presence: 'MISSING',
    validation: 'MISSING',
    jwtPrinted: false,
  },
  validation: {},
  baseline: {},
  importPerformed: false,
  homepage: { updatePerformed: false },
  contact: { updatePerformed: false },
  after: {},
  readback: {},
  untouched: {},
  frontend: {},
  safety: {
    serviceAreasUpdated: false,
    stateCityCreated: false,
    themeRecordsUpdated: false,
    mediaAssetRecordsUpdated: false,
    staticRegenerationPerformed: false,
    deploymentPerformed: false,
    dnsEmailProviderAction: false,
    emailSent: false,
    rollerTouched: false,
    protectedConfigRead: false,
    jwtPrinted: false,
  },
  apiCalls: [],
  blockers: [],
  warnings: [],
};

let jwt = '';

try {
  fs.mkdirSync(outDir, { recursive: true });
  collectPreImportValidation();
  await collectReachability();
  if (!state.serviceReachability.api.reachable) state.blockers.push('Local API http://localhost:5064 is not reachable.');
  if (!preImportValidationOk()) state.blockers.push('Pre-import validation failed; stopped before CMS writes.');

  loadJwt();
  console.log(`AUTH_PRESENT=${state.adminAuth.presence}`);
  if (state.adminAuth.presence === 'PRESENT') {
    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.adminAuth.validation}`);
  }
  if (state.adminAuth.presence !== 'PRESENT' || state.adminAuth.validation !== 'VALID') {
    state.blockers.push('Admin auth missing or invalid; stopped before CMS writes.');
    finishFailure();
    writeReports();
    console.log(JSON.stringify(runSummary(), null, 2));
    process.exitCode = 1;
  } else {
    await captureBaseline();
    if (state.blockers.length === 0) await writeDrafts();
    if (state.blockers.length === 0) {
      await captureAfterWrite();
      verifyReadbacks();
      runReadbackDotnet();
      await probeFrontends();
    }
    if (state.blockers.length === 0) {
      writeReports();
      state.validation.finalHygiene = runFinalHygieneChecks();
      if (!state.validation.finalHygiene.ok) {
        state.blockers.push('Final hygiene checks failed; temp JWT retained.');
      }
    }
    if (state.blockers.length === 0) {
      writeReports();
      cleanupTempJwtAfterSuccess();
    } else {
      finishFailure();
    }
    writeReports();
    console.log(JSON.stringify(runSummary(), null, 2));
    if (state.blockers.length > 0) process.exitCode = 1;
  }
} catch (error) {
  state.blockers.push(safeMessage(error));
  finishFailure();
  writeReports();
  console.log(JSON.stringify(runSummary(), null, 2));
  process.exitCode = 1;
}

function collectPreImportValidation() {
  const jsonFiles = [files.homeCandidate, files.contactCandidate, files.importPackage, files.homePreflight, files.contactPreflight, files.dotnetPreImport];
  state.validation.jsonParse = jsonFiles.map(parseJsonFile);
  const homePreflight = readJson(files.homePreflight);
  const contactPreflight = readJson(files.contactPreflight);
  const dotnet = readJson(files.dotnetPreImport);
  const design = readJson(`${outRel}/design-system-validation-result.json`);
  const media = readJson(`${outRel}/media-validation-result.json`);
  const form = readJson(`${outRel}/default-form-validation-result.json`);
  const tailwind = readJson(`${outRel}/tailwind-navigation-validation-result.json`);
  const normalizer = readJson(`${outRel}/page-intake-normalizer-validation-result.json`);
  state.validation.preflight = {
    homepage: summarizePreflight(homePreflight),
    contact: summarizePreflight(contactPreflight),
  };
  state.validation.dotnetPreImport = {
    ok: dotnet.Ok === true,
    readinessDecision: dotnet.ReadinessDecision || '',
    pages: (dotnet.Pages || []).map((page) => ({
      pageSlug: page.PageSlug,
      roundTripOk: page.RoundTripOk,
      productionFieldPersistenceOk: page.ProductionFieldPersistenceOk,
      updatedHomeContactPersistenceOk: page.UpdatedHomeContactPersistenceOk,
      errorCount: page.ErrorCount,
      warningCount: page.WarningCount,
    })),
  };
  state.validation.fixtures = {
    designSystem: { ok: design.ok === true, passed: design.passed, failed: design.failed },
    media: { ok: media.ok === true, assetCount: media.assetCount, referenceCount: media.referenceCount, warningCount: media.warningCount },
    defaultForm: { ok: form.ok === true, passed: form.passed, failed: form.failed },
    tailwindNavigation: { ok: tailwind.ok === true, checkedNavigationRoutes: tailwind.checkedNavigationRoutes, failures: tailwind.failures || [] },
    pageIntakeNormalizer: { ok: normalizer.ok === true, passed: normalizer.passed, failed: normalizer.failed },
  };
  state.validation.unsafeRouteSecretScan = unsafeRouteSecretScan();
  state.validation.ppecCandidatesDifferFromPriorReadback = candidatesDifferFromPriorReadback();
  writeJson(files.validationSummary, state.validation);
}

function preImportValidationOk() {
  return state.validation.jsonParse.every((item) => item.ok)
    && state.validation.preflight.homepage.localDraftImport
    && state.validation.preflight.contact.localDraftImport
    && state.validation.dotnetPreImport.ok
    && Object.values(state.validation.fixtures).every((item) => item.ok)
    && state.validation.unsafeRouteSecretScan.ok;
}

async function collectReachability() {
  state.serviceReachability.api = await probe(`${apiBase}/`);
  state.serviceReachability.homePreview = await probe(`${webBase}/__preview/ice-rink-rentals/home`);
  state.serviceReachability.contact = await probe(`${webBase}/contact`);
}

function loadJwt() {
  const envToken = (process.env.PUMPKIN_ADMIN_JWT || '').trim();
  state.adminAuth.tempFileStatus = fs.existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  state.adminAuth.tempJwtInitialStatus = state.adminAuth.tempFileStatus;
  if (envToken) {
    jwt = envToken;
    state.adminAuth.presence = 'PRESENT';
    state.adminAuth.tempJwtLoaded = false;
    return;
  }
  if (fs.existsSync(tempJwtPath)) {
    jwt = fs.readFileSync(tempJwtPath, 'utf8').trim();
    state.adminAuth.presence = jwt ? 'PRESENT' : 'MISSING';
    state.adminAuth.tempJwtLoaded = Boolean(jwt);
  }
}

async function validateJwt() {
  const result = await apiJson('/api/admin/pages?tenantId=ice-rink-rentals', { method: 'GET' }, true);
  state.apiCalls.push('GET /api/admin/pages?tenantId=ice-rink-rentals auth-validation');
  state.adminAuth.validationHttpStatus = result.status;
  state.adminAuth.validation = result.status === 200 ? 'VALID' : 'INVALID';
}

function finishFailure() {
  state.adminAuth.tempJwtFinalStatus = fs.existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  state.adminAuth.tempJwtRetainedOnFailure = state.adminAuth.tempJwtFinalStatus === 'PRESENT';
  if (state.adminAuth.tempJwtRetainedOnFailure) {
    state.adminAuth.tempJwtCleanupReason = 'retained because the run did not complete every write, verification, report, and hygiene check successfully';
  } else if (state.adminAuth.tempJwtInitialStatus === 'PRESENT' && !state.adminAuth.tempJwtDeletedAfterSuccess) {
    state.adminAuth.tempJwtCleanupReason = 'not retained because the temp file was missing before failure handling';
  }
}

function cleanupTempJwtAfterSuccess() {
  if (state.adminAuth.tempJwtInitialStatus === 'PRESENT' && fs.existsSync(tempJwtPath)) {
    fs.rmSync(tempJwtPath, { force: true });
    state.adminAuth.tempJwtDeletedAfterSuccess = true;
    state.adminAuth.tempJwtCleanupReason = 'deleted after successful writes, readback verification, reports, and final hygiene checks';
  } else {
    state.adminAuth.tempJwtCleanupReason = 'no temp JWT cleanup needed because auth came from env or the temp file was already absent';
  }
  state.adminAuth.tempJwtFinalStatus = fs.existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  state.adminAuth.tempJwtRetainedOnFailure = false;
}

async function captureBaseline() {
  const [home, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson('/api/admin/themes/ice-rink-rentals', { method: 'GET' }, true),
    apiJson('/api/admin/ice-rink-rentals/media-assets', { method: 'GET' }, true),
  ]);
  state.apiCalls.push(
    'GET /api/admin/pages/ice-rink-rentals/home baseline',
    'GET /api/admin/pages/ice-rink-rentals/contact baseline',
    'GET /api/admin/pages/ice-rink-rentals/service-areas baseline',
    'GET /api/admin/themes/ice-rink-rentals baseline',
    'GET /api/admin/ice-rink-rentals/media-assets baseline',
  );
  state.baseline.homepage = summarizeResponse(home);
  state.baseline.contact = summarizeResponse(contact);
  state.baseline.serviceAreas = summarizeResponse(serviceAreas, true);
  state.baseline.theme = summarizeResponse(theme, true);
  state.baseline.mediaAssets = summarizeResponse(mediaAssets, true);
  state.baseline.hashes = { serviceAreas: serviceAreas.hash, theme: theme.hash, mediaAssets: mediaAssets.hash };
  state.baseline.mediaAssetIds = collectOfficialMediaIds(mediaAssets.json);
  if (home.status !== 200 || !home.json) state.blockers.push(`Homepage baseline failed with HTTP ${home.status}.`);
  if (contact.status !== 200 || !contact.json) state.blockers.push(`Contact baseline failed with HTTP ${contact.status}.`);
  if (!(serviceAreas.status === 200 || serviceAreas.status === 404)) state.blockers.push(`/service-areas baseline returned HTTP ${serviceAreas.status}.`);
  if (home.json) writeJson(files.homeSnapshot, sanitize(home.json));
  if (contact.json) writeJson(files.contactSnapshot, sanitize(contact.json));
  writeJson(files.serviceAreasSnapshot, serviceAreas.status === 404 ? { status: 404, expectedNotFound: true } : sanitize(serviceAreas.json));
  writeJson(files.themeSnapshot, theme.status === 404 ? { status: 404, expectedNotFound: true } : sanitize(theme.json));
  writeJson(files.mediaAssetsSnapshot, mediaAssets.status === 404 ? { status: 404, expectedNotFound: true } : sanitize(mediaAssets.json));
}

async function writeDrafts() {
  const homePayload = preparePayload(readJson(files.homeCandidate), readJson(files.homeSnapshot), '/', 'home');
  const contactPayload = preparePayload(readJson(files.contactCandidate), readJson(files.contactSnapshot), '/contact', 'contact');
  const changeSummary = encodeURIComponent('PPEC home/contact repair local draft import. Draft needs_review only; no publish/static/media/theme/provider changes.');
  const homeResult = await apiJson(`/api/admin/pages/${tenantId}/home?changeSource=${changeSource}&changeSummary=${changeSummary}`, { method: 'PUT', body: JSON.stringify(homePayload) }, true);
  state.apiCalls.push(`PUT /api/admin/pages/${tenantId}/home?changeSource=${changeSource}`);
  state.homepage = { updatePerformed: homeResult.ok, httpStatus: homeResult.status, endpoint: `PUT /api/admin/pages/${tenantId}/home`, safeError: homeResult.ok ? '' : homeResult.safeText };
  writeJson(files.homeWriteResult, sanitize({ status: homeResult.status, ok: homeResult.ok, page: homeResult.json, safeText: homeResult.safeText }));
  if (!homeResult.ok) {
    state.blockers.push(`Homepage update failed with HTTP ${homeResult.status}.`);
    return;
  }
  const contactResult = await apiJson(`/api/admin/pages/${tenantId}/contact?changeSource=${changeSource}&changeSummary=${changeSummary}`, { method: 'PUT', body: JSON.stringify(contactPayload) }, true);
  state.apiCalls.push(`PUT /api/admin/pages/${tenantId}/contact?changeSource=${changeSource}`);
  state.contact = { updatePerformed: contactResult.ok, httpStatus: contactResult.status, endpoint: `PUT /api/admin/pages/${tenantId}/contact`, safeError: contactResult.ok ? '' : contactResult.safeText };
  writeJson(files.contactWriteResult, sanitize({ status: contactResult.status, ok: contactResult.ok, page: contactResult.json, safeText: contactResult.safeText }));
  if (!contactResult.ok) {
    state.blockers.push(`Contact update failed with HTTP ${contactResult.status}.`);
    return;
  }
  state.importPerformed = true;
}

async function captureAfterWrite() {
  const [home, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson('/api/admin/themes/ice-rink-rentals', { method: 'GET' }, true),
    apiJson('/api/admin/ice-rink-rentals/media-assets', { method: 'GET' }, true),
  ]);
  state.apiCalls.push(
    'GET /api/admin/pages/ice-rink-rentals/home readback',
    'GET /api/admin/pages/ice-rink-rentals/contact readback',
    'GET /api/admin/pages/ice-rink-rentals/service-areas after',
    'GET /api/admin/themes/ice-rink-rentals after',
    'GET /api/admin/ice-rink-rentals/media-assets after',
  );
  state.after.homepage = summarizeResponse(home);
  state.after.contact = summarizeResponse(contact);
  state.after.serviceAreas = summarizeResponse(serviceAreas, true);
  state.after.theme = summarizeResponse(theme, true);
  state.after.mediaAssets = summarizeResponse(mediaAssets, true);
  state.after.hashes = { serviceAreas: serviceAreas.hash, theme: theme.hash, mediaAssets: mediaAssets.hash };
  state.after.mediaAssetIds = collectOfficialMediaIds(mediaAssets.json);
  if (home.json) writeJson(files.homeReadback, sanitize(home.json));
  if (contact.json) writeJson(files.contactReadback, sanitize(contact.json));
  state.untouched = {
    serviceAreasUnchanged: state.baseline.serviceAreas.expectedNotFound ? serviceAreas.status === 404 : serviceAreas.status === 200 && serviceAreas.hash === state.baseline.hashes.serviceAreas,
    serviceAreasBaseline: state.baseline.serviceAreas.expectedNotFound ? 'HTTP 404 expected-not-found' : `HTTP ${state.baseline.serviceAreas.status}`,
    serviceAreasAfter: serviceAreas.status === 404 ? 'HTTP 404 expected-not-found' : `HTTP ${serviceAreas.status}`,
    themeUnchanged: compareOptionalHash(state.baseline.theme, theme, state.baseline.hashes.theme),
    mediaAssetsUnchanged: compareOptionalHash(state.baseline.mediaAssets, mediaAssets, state.baseline.hashes.mediaAssets),
    rollerTouched: false,
  };
  state.untouched.ok = state.untouched.serviceAreasUnchanged && state.untouched.themeUnchanged && state.untouched.mediaAssetsUnchanged;
  if (!state.untouched.serviceAreasUnchanged) state.blockers.push('/service-areas changed or did not preserve baseline.');
  if (!state.untouched.themeUnchanged) state.blockers.push('Theme changed or could not be verified unchanged.');
  if (!state.untouched.mediaAssetsUnchanged) state.blockers.push('MediaAssets changed or could not be verified unchanged.');
}

function verifyReadbacks() {
  const homeCandidate = readJson(files.homeCandidate);
  const contactCandidate = readJson(files.contactCandidate);
  const home = readJson(files.homeReadback);
  const contact = readJson(files.contactReadback);
  state.readback.homepage = verifyPage(homeCandidate, home, '/', 'home');
  state.readback.contact = verifyPage(contactCandidate, contact, '/contact', 'contact');
  state.readback.ppecPersistence = verifyPpecPersistence(home, contact);
  state.readback.productionFieldPersistence = {
    homepage: productionPersistenceCompare(homeCandidate, home),
    contact: productionPersistenceCompare(contactCandidate, contact),
  };
  state.readback.mediaAssetPersistence = {
    homepage: mediaPersistenceCompare(homeCandidate, home, state.after.mediaAssetIds || []),
    contact: mediaPersistenceCompare(contactCandidate, contact, state.after.mediaAssetIds || []),
  };
  state.readback.formBlock = verifyContactForm(contact);
  if (!state.readback.homepage.ok) state.blockers.push(`Homepage readback failed: ${state.readback.homepage.failedChecks.join(', ')}`);
  if (!state.readback.contact.ok) state.blockers.push(`Contact readback failed: ${state.readback.contact.failedChecks.join(', ')}`);
  if (!state.readback.ppecPersistence.ok) state.blockers.push(`PPEC persistence failed: ${state.readback.ppecPersistence.failedChecks.join(', ')}`);
  if (!state.readback.productionFieldPersistence.homepage.ok) state.blockers.push('Homepage production field persistence compare failed.');
  if (!state.readback.productionFieldPersistence.contact.ok) state.blockers.push('Contact production field persistence compare failed.');
  if (!state.readback.mediaAssetPersistence.homepage.ok) state.blockers.push('Homepage MediaAsset persistence failed.');
  if (!state.readback.mediaAssetPersistence.contact.ok) state.blockers.push('Contact MediaAsset persistence failed.');
  if (!state.readback.formBlock.ok) state.blockers.push(`Contact formBlock verification failed: ${state.readback.formBlock.failedChecks.join(', ')}`);
}

function verifyPage(candidate, page, route, slug) {
  const workflow = page.workflow || {};
  const staticPublishing = page.staticPublishing || {};
  const routing = page.domainRouting || {};
  const revision = page.revision || {};
  const text = JSON.stringify(page);
  const candidateVariants = collectVariants(candidate);
  const readbackVariants = collectVariants(page);
  const candidateMediaIds = [...new Set(collectValuesByKey(candidate, 'mediaAssetId'))].sort();
  const readbackMediaIds = [...new Set(collectValuesByKey(page, 'mediaAssetId'))].sort();
  const checks = {
    route: (page.route || page.path || (page.pageSlug === 'home' ? '/' : `/${page.pageSlug}`)) === route,
    slug: (page.pageSlug || page.slug) === slug,
    draftNeedsReview: workflow.status === 'draft' && workflow.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true && workflow.productionApproved !== true && staticPublishing.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true && workflow.approvedForPublish !== true && workflow.publishApproved !== true,
    staticNeedsRebuild: staticPublishing.needsRebuild === true,
    revisionOrRollback: Number(revision.revisionNumber || 0) > 0 || revision.rollbackAvailable === true || Boolean(revision.latestSnapshot),
    lastChangeSource: revision.lastChangeSource === changeSource || revision.latestSnapshot?.changeSource === changeSource,
    selectedMailbox: routing.selectedMailbox === selectedMailbox,
    publicEmailDisplayPolicy: routing.publicEmailDisplayPolicy === publicEmailDisplayPolicy,
    selectedMailboxMetadata: routing.selectedMailboxMetadata === selectedMailbox,
    leadRecipientRef: routing.leadRecipientRef === leadRecipientRef,
    staticEndpointRef: routing.staticEndpointRef === staticEndpointRef,
    noGenericEastCoast: !hasGenericEastCoast(text),
    sectionVariantsPersist: candidateVariants.every((value) => readbackVariants.includes(value)),
    mediaAssetIdsPersist: candidateMediaIds.every((value) => readbackMediaIds.includes(value)),
  };
  const failedChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return {
    ok: failedChecks.length === 0,
    failedChecks,
    checks,
    summary: {
      pageId: page.PageId || page.id || '',
      pageSlug: page.pageSlug || page.slug || '',
      route: page.route || page.path || '',
      pageVersion: page.PageVersion || page.pageVersion || null,
      workflowStatus: workflow.status || '',
      reviewStatus: workflow.reviewStatus || '',
      staticNeedsRebuild: staticPublishing.needsRebuild === true,
      revisionNumber: revision.revisionNumber || null,
      rollbackAvailable: revision.rollbackAvailable === true || Boolean(revision.latestSnapshot),
      lastChangeSource: revision.lastChangeSource || '',
    },
    candidateMediaAssetIdCount: candidateMediaIds.length,
    readbackMediaAssetIdCount: readbackMediaIds.length,
  };
}

function verifyPpecPersistence(home, contact) {
  const homeText = JSON.stringify(home);
  const contactText = JSON.stringify(contact);
  const checks = {
    homepagePartnerBrand: /Party Pros East Coast/.test(homeText),
    homepagePartnerTitle: /Planning more than the rink\?/.test(homeText),
    homepagePartnerCta: /Explore Party Pros East Coast/.test(homeText),
    homepagePartnerUrl: /https:\/\/partyproseastcoast\.com\//.test(homeText),
    contactPartnerBrand: /Party Pros East Coast/.test(contactText),
    contactPartnerTitle: /Need more than an ice rink\?/.test(contactText),
    contactPartnerCta: /Explore Party Pros East Coast/.test(contactText),
    contactPartnerUrl: /https:\/\/partyproseastcoast\.com\//.test(contactText),
    contactFaq: /Can Party Pros East Coast help with other rentals\?/.test(contactText),
    noGenericEastCoastHome: !hasGenericEastCoast(homeText),
    noGenericEastCoastContact: !hasGenericEastCoast(contactText),
  };
  const failedChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failedChecks.length === 0, failedChecks, checks };
}

function productionPersistenceCompare(candidate, readback) {
  const paths = collectPersistencePaths(candidate).filter((item) => !item.path.startsWith('$.mediaRequirements'));
  const readbackPaths = collectPersistencePaths(readback);
  const missing = paths.filter((item) => !readbackPaths.some((other) => other.path === item.path && JSON.stringify(other.value) === JSON.stringify(item.value)));
  return { ok: missing.length === 0, checkedCount: paths.length, missingCount: missing.length, missing: missing.slice(0, 30) };
}

function mediaPersistenceCompare(candidate, readback, officialIds) {
  const candidateIds = [...new Set(collectValuesByKey(candidate, 'mediaAssetId'))].sort();
  const readbackIds = [...new Set(collectValuesByKey(readback, 'mediaAssetId'))].sort();
  const missing = candidateIds.filter((id) => !readbackIds.includes(id));
  const tenantPrefixed = readbackIds.every((id) => id.startsWith('ice-rink-rentals-'));
  const officialSet = new Set(officialIds || []);
  const officialMissing = officialSet.size ? readbackIds.filter((id) => !officialSet.has(id)) : [];
  return { ok: missing.length === 0 && tenantPrefixed && officialMissing.length === 0, candidateIds, readbackIds, missing, tenantPrefixed, officialRecordCheckAvailable: officialSet.size > 0, officialMissing };
}

function verifyContactForm(contact) {
  const formBlock = blocksOf(contact).find((block) => blockType(block) === 'formBlock');
  const content = contentOf(formBlock || {});
  const checks = {
    formBlockExists: Boolean(formBlock),
    formKey: content.formKey === 'default-quote-request',
    sourcePage: content.sourcePage === '/contact',
    staticEndpointRef: content.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: content.leadRecipientRef === leadRecipientRef,
    selectedMailboxMetadata: content.selectedMailboxMetadata === selectedMailbox,
    emailSendingDisabled: content.emailSendingEnabled === false || content.emailSendingEnabled === undefined,
    noCf7Runtime: !/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(JSON.stringify(stripReviewOnly(contact))),
  };
  const failedChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failedChecks.length === 0, checks, failedChecks };
}

function runFinalHygieneChecks() {
  const results = [];
  const scriptPath = `${outRel}/run-ppec-local-draft-import.mjs`;
  results.push(runCommandCheck('node syntax check for import runner', 'node', ['--check', scriptPath]));
  results.push(runCommandCheck('git diff --check', 'git', ['diff', '--check']));

  const status = git(['status', '--short', '--untracked-files=all']);
  const protectedPattern = /\.env\.local|appsettings\.Development\.json|\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs/i;
  const rawArtifactPattern = /\.zip|\.png|\.jpe?g|\.gif|\.webp|\.mp4|\.mov|\.avi|\.psd|\.ai|ice-updated-home-contact-input|extracted/i;
  results.push({
    name: 'protected/generated artifact status check',
    ok: !protectedPattern.test(status),
    details: protectedPattern.test(status) ? 'protected/generated path found in git status' : 'passed',
  });
  results.push({
    name: 'no ZIP/raw media/extracted input staged or present in status',
    ok: !rawArtifactPattern.test(status),
    details: rawArtifactPattern.test(status) ? 'raw artifact path found in git status' : 'passed',
  });

  const textFiles = listOutputFiles().filter((file) => /\.(md|json|txt|mjs)$/i.test(file));
  const secretScanFiles = textFiles.filter((file) => !/run-ppec-local-draft-import\.mjs$/i.test(file));
  const trailingWhitespaceHits = [];
  const secretHits = [];
  const jwtPattern = /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/;
  const secretPattern = /(?:authorization\s*[:=]\s*bearer|api[_-]?key\s*[:=]|token\s*[:=]|secret\s*[:=]|password\s*[:=]|connectionstring\s*[:=])/i;
  const jsonParseFailures = [];
  for (const file of textFiles) {
    const rel = path.relative(repo, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]$/.test(line)) trailingWhitespaceHits.push(`${rel}:${index + 1}`);
    });
    if (/\.json$/i.test(file)) {
      try {
        JSON.parse(text.replace(/^\uFEFF/, ''));
      } catch (error) {
        jsonParseFailures.push(`${rel}: ${safeMessage(error)}`);
      }
    }
  }
  for (const file of secretScanFiles) {
    const rel = path.relative(repo, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');
    if (jwtPattern.test(text) || secretPattern.test(text)) secretHits.push(rel);
  }
  results.push({ name: 'trailing whitespace scan', ok: trailingWhitespaceHits.length === 0, details: trailingWhitespaceHits });
  results.push({ name: 'targeted secret scan', ok: secretHits.length === 0, details: secretHits });
  results.push({ name: 'output JSON parse validation', ok: jsonParseFailures.length === 0, details: jsonParseFailures });

  return {
    ok: results.every((item) => item.ok),
    results,
  };
}

function runCommandCheck(name, command, args) {
  const result = spawnSync(command, args, { cwd: repo, encoding: 'utf8', timeout: 120000 });
  return {
    name,
    ok: result.status === 0,
    exitCode: result.status,
    stderr: scrub(result.stderr || '').slice(0, 1200),
    stdout: scrub(result.stdout || '').slice(0, 1200),
  };
}

function listOutputFiles() {
  const filesOut = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(next);
      else filesOut.push(next);
    }
  };
  walk(outDir);
  filesOut.push(path.join(repo, files.rootReport));
  return filesOut.filter((file) => fs.existsSync(file));
}

function runReadbackDotnet() {
  const result = spawnSync('dotnet', [
    'run',
    '--project',
    'tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj',
    '--',
    'validate-updated-home-contact',
    '--home-path',
    files.homeReadback,
    '--contact-path',
    files.contactReadback,
  ], { cwd: repo, encoding: 'utf8', timeout: 120000 });
  fs.writeFileSync(abs(files.readbackDotnet), result.stdout || '{}', 'utf8');
  let parsed = null;
  try { parsed = JSON.parse((result.stdout || '{}').replace(/^\uFEFF/, '')); } catch {}
  state.validation.readbackDotnet = {
    exitCode: result.status,
    ok: parsed?.Ok === true,
    readinessDecision: parsed?.ReadinessDecision || '',
    errorCount: parsed?.Errors?.length || 0,
    warningCount: parsed?.Warnings?.length || 0,
  };
  if (result.status !== 0 || parsed?.Ok !== true) state.blockers.push('Readback .NET home/contact contract failed.');
}

async function probeFrontends() {
  state.frontend.homePreview = await probe(`${webBase}/__preview/ice-rink-rentals/home`);
  state.frontend.contact = await probe(`${webBase}/contact`);
}

function preparePayload(candidate, existing, route, slug) {
  const page = clone(candidate);
  page.id = existing?.id || existing?.PageId || page.id || page.PageId;
  page.PageId = existing?.PageId || existing?.id || page.PageId || page.id;
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.domain = domain;
  page.route = route;
  page.path = route;
  page.slug = slug;
  page.pageSlug = slug;
  page.PageSlug = slug;
  page.canonicalUrl = route === '/' ? `https://${domain}/` : `https://${domain}${route}`;
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
    lastEditedBy: 'codex_ppec_home_contact_import',
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
    leadRecipientRef,
    staticEndpointRef,
    mailtoLinksEnabled: false,
    publicContactEmail: '',
    selectedEmailProvider: page.domainRouting?.selectedEmailProvider || 'under-review',
    pumpkinAppSendStatus: page.domainRouting?.pumpkinAppSendStatus || 'disabled_review_only',
  };
  page.reviewMetadata = {
    ...(page.reviewMetadata || {}),
    ppecLocalDraftImport: {
      status: 'local-draft-import-requested',
      importedAt: now,
      changeSource,
      cmsWritesPerformed: true,
      staticRegenerationPerformed: false,
      deploymentPerformed: false,
      themeRecordsChanged: false,
      mediaAssetRecordsChanged: false,
    },
  };
  if (page.seo) page.seo = { ...page.seo, canonicalUrl: page.canonicalUrl, robots: 'noindex, nofollow' };
  if (slug === 'contact') {
    const formBlock = blocksOf(page).find((block) => blockType(block) === 'formBlock');
    if (formBlock) {
      formBlock.content = {
        ...(formBlock.content || {}),
        formKey: 'default-quote-request',
        sourcePage: '/contact',
        staticEndpointRef,
        leadRecipientRef,
        selectedMailboxMetadata: selectedMailbox,
        emailSendingEnabled: false,
      };
    }
  }
  return page;
}

function unsafeRouteSecretScan() {
  const pages = [readJson(files.homeCandidate), readJson(files.contactCandidate)];
  const raw = pages.map((page) => JSON.stringify(projectScanSurface(page))).join('\n');
  const unsafeIssues = [];
  if (/\bstate-city\b|\/state-city/i.test(raw)) unsafeIssues.push('state-city reference');
  if (/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(raw)) unsafeIssues.push('CF7 runtime marker');
  if (/<\s*(script|iframe|form|input|textarea|select)\b/i.test(raw)) unsafeIssues.push('unsafe runtime HTML marker');
  if (/data:image\//i.test(raw)) unsafeIssues.push('base64 media marker');
  if (/mailto:/i.test(raw)) unsafeIssues.push('mailto marker');
  const routeIssues = [];
  for (const page of pages) {
    const slug = page.pageSlug;
    const route = page.route || page.path;
    const canonical = page.canonicalUrl || page.seo?.canonicalUrl || '';
    if (slug === 'home' && route !== '/') routeIssues.push('homepage route mismatch');
    if (slug === 'contact' && route !== '/contact') routeIssues.push('contact route mismatch');
    if (slug === 'home' && !/^https:\/\/iceskatingrinkrentals\.com\/?$/.test(canonical)) routeIssues.push('homepage canonical mismatch');
    if (slug === 'contact' && canonical !== 'https://iceskatingrinkrentals.com/contact') routeIssues.push('contact canonical mismatch');
  }
  const secretPatterns = [
    /authorization:\s*bearer\s+[a-z0-9._-]{20,}/i,
    /jwt\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /api[_-]?key\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /secret\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /password\s*[:=]\s*[^\s`"']{8,}/i,
  ];
  const secretIssues = secretPatterns.filter((pattern) => pattern.test(raw)).length;
  return { ok: unsafeIssues.length === 0 && routeIssues.length === 0 && secretIssues === 0, unsafeIssues, routeIssues, secretIssues };
}

function projectScanSurface(page) {
  return stripReviewOnly({
    tenantId: page.tenantId,
    siteKey: page.siteKey,
    route: page.route,
    path: page.path,
    pageSlug: page.pageSlug,
    canonicalUrl: page.canonicalUrl,
    domainRouting: page.domainRouting,
    seo: page.seo,
    formConfig: page.formConfig,
    media: page.media,
    ContentData: { ContentBlocks: blocksOf(page).map((block) => ({ type: blockType(block), content: contentOf(block) })) },
  });
}

function stripReviewOnly(value) {
  if (Array.isArray(value)) return value.map(stripReviewOnly);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    if (/^(review|notes?|reviewMetadata)$/i.test(key)) continue;
    output[key] = stripReviewOnly(nested);
  }
  return output;
}

function candidatesDifferFromPriorReadback() {
  const priorHome = 'content-review/ice-updated-home-contact-post-repair-reimport/homepage-readback-after-post-repair-import.json';
  const priorContact = 'content-review/ice-updated-home-contact-post-repair-reimport/contact-readback-after-post-repair-import.json';
  if (!fs.existsSync(abs(priorHome)) || !fs.existsSync(abs(priorContact))) return { checked: false, differs: true };
  const candidateHomePpec = JSON.stringify(blocksOf(readJson(files.homeCandidate)).filter((block) => JSON.stringify(block).includes('Party Pros')));
  const priorHomePpec = JSON.stringify(blocksOf(readJson(priorHome)).filter((block) => JSON.stringify(block).includes('Party Pros')));
  const candidateContactPpec = JSON.stringify(blocksOf(readJson(files.contactCandidate)).filter((block) => JSON.stringify(block).includes('Party Pros')));
  const priorContactPpec = JSON.stringify(blocksOf(readJson(priorContact)).filter((block) => JSON.stringify(block).includes('Party Pros')));
  return { checked: true, differs: candidateHomePpec !== priorHomePpec || candidateContactPpec !== priorContactPpec };
}

async function getPage(slug) {
  return apiJson(`/api/admin/pages/${tenantId}/${encodeURIComponent(slug)}`, { method: 'GET' }, true);
}

async function apiJson(endpoint, options = {}, authed = false) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (authed) headers.Authorization = `Bearer ${jwt}`;
  try {
    const response = await fetch(`${apiBase}${endpoint}`, { ...options, headers, cache: 'no-store' });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    return { ok: response.ok, status: response.status, json, safeText: scrub(text), hash: response.status === 404 ? null : hash(stableStringify(sanitize(json))) };
  } catch (error) {
    return { ok: false, status: 0, json: null, safeText: safeMessage(error), hash: null };
  }
}

async function probe(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    return { reachable: true, status: response.status, length: text.length, containsPartyProsEastCoast: /Party Pros East Coast/.test(text), containsPpec: /\bPPEC\b/.test(text) };
  } catch (error) {
    return { reachable: false, status: 0, safeError: safeMessage(error) };
  }
}

function collectPersistencePaths(value) {
  const interesting = new Set(['sectionVariant', 'variant', 'mediaAssetId', 'assetId', 'publicEmailDisplayPolicy', 'selectedMailbox', 'selectedMailboxMetadata', 'selectedEmailProvider', 'pumpkinAppSendStatus', 'leadRecipientRef', 'staticEndpointRef', 'formKey', 'sourcePage', 'emailSendingEnabled', 'buttonText', 'buttonLink', 'external', 'rel']);
  const output = [];
  const walk = (node, trail) => {
    if (Array.isArray(node)) return node.forEach((item, index) => walk(item, `${trail}[${index}]`));
    if (!node || typeof node !== 'object') return;
    for (const [key, nested] of Object.entries(node)) {
      const p = trail ? `${trail}.${key}` : key;
      if (interesting.has(key) && nested !== undefined && nested !== null && nested !== '') output.push({ path: p.replace(/\[\d+\]/g, '[]'), value: nested });
      walk(nested, p);
    }
  };
  walk(value, '$');
  return output;
}

function collectOfficialMediaIds(mediaResponse) {
  const assets = mediaResponse?.mediaAssets || mediaResponse?.MediaAssets || [];
  const ids = new Set();
  for (const asset of assets) {
    for (const key of ['id', 'Id', 'assetId', 'AssetId', 'mediaAssetId', 'MediaAssetId']) {
      if (typeof asset?.[key] === 'string' && asset[key]) ids.add(asset[key]);
    }
  }
  return [...ids].sort();
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

function collectVariants(page) {
  return [...new Set(blocksOf(page).flatMap((block) => [contentOf(block).sectionVariant, contentOf(block).variant]).filter(Boolean))];
}

function blocksOf(page) {
  return page?.ContentData?.ContentBlocks || page?.contentData?.contentBlocks || page?.ContentBlocks || [];
}

function blockType(block) {
  return block?.type || block?.Type || block?.blockType || '';
}

function contentOf(block) {
  return block?.content || block?.Content || {};
}

function summarizeResponse(response, allowNotFound = false) {
  return { status: response.status, ok: response.ok || (allowNotFound && response.status === 404), found: response.status === 200, expectedNotFound: response.status === 404, hash: response.hash };
}

function summarizePreflight(report) {
  return {
    shape: report.classification?.['preflight-valid-for-shape'] === true,
    localDraftImport: report.classification?.['preflight-valid-for-local-draft-import'] === true,
    cmsImport: report.classification?.['preflight-valid-for-CMS-import'] === true,
    production: report.classification?.['preflight-valid-for-production'] === true,
    warningCount: (report.issues || []).filter((issue) => issue.severity === 'warning').length,
    errors: (report.issues || []).filter((issue) => issue.severity === 'error').map((issue) => `${issue.check}: ${issue.message}`),
  };
}

function compareOptionalHash(baselineSummary, afterResponse, baselineHash) {
  if (baselineSummary.status === 404) return afterResponse.status === 404;
  if (baselineSummary.status === 200) return afterResponse.status === 200 && afterResponse.hash === baselineHash;
  return afterResponse.status === baselineSummary.status;
}

function hasGenericEastCoast(raw) {
  return /\bEast Coast\b/i.test(String(raw).replace(/\bParty Pros East Coast\b/gi, ''));
}

function parseJsonFile(file) {
  try {
    JSON.parse(readText(file).replace(/^\uFEFF/, ''));
    return { file, ok: true };
  } catch (error) {
    return { file, ok: false, error: safeMessage(error) };
  }
}

function readJson(file) {
  return JSON.parse(readText(file).replace(/^\uFEFF/, ''));
}

function readText(file) {
  const buffer = fs.readFileSync(abs(file));
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) return buffer.toString('utf16le');
  const sample = buffer.subarray(0, Math.min(buffer.length, 100));
  const nullCount = [...sample].filter((byte) => byte === 0).length;
  return nullCount > sample.length / 4 ? buffer.toString('utf16le') : buffer.toString('utf8');
}

function writeJson(file, value) {
  const target = abs(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(file, value) {
  const target = abs(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${value.trimEnd()}\n`, 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => /token|jwt|password|secret|connectionString|apiKey|privateKey|authorization/i.test(key) ? '[redacted]' : val));
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
  return String(value || '').replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]').slice(0, 3000);
}

function safeMessage(error) {
  return String(error?.message || error || '').replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
  return (result.stdout || result.stderr || '').trim();
}

function lines(value) {
  return String(value || '').split(/\r?\n/).filter(Boolean);
}

function abs(file) {
  return path.join(repo, file);
}

function yn(value) {
  return value ? 'yes' : 'no';
}

function validationLines() {
  return [
    `- API reachable: ${yn(state.serviceReachability.api?.reachable)} HTTP ${state.serviceReachability.api?.status ?? 'n/a'}`,
    `- Auth status: ${state.adminAuth.validation}`,
    `- Temp JWT loaded from temp file: ${yn(state.adminAuth.tempJwtLoaded)}`,
    `- Temp JWT deleted after success: ${yn(state.adminAuth.tempJwtDeletedAfterSuccess)}`,
    `- Temp JWT retained on failure: ${yn(state.adminAuth.tempJwtRetainedOnFailure)}`,
    `- Temp JWT final status: ${state.adminAuth.tempJwtFinalStatus}`,
    `- JSON parse: ${state.validation.jsonParse?.every((item) => item.ok) ? 'passed' : 'failed'}`,
    `- Homepage preflight local draft: ${yn(state.validation.preflight?.homepage?.localDraftImport)}`,
    `- Contact preflight local draft: ${yn(state.validation.preflight?.contact?.localDraftImport)}`,
    `- .NET home/contact pre-import: ${yn(state.validation.dotnetPreImport?.ok)}`,
    ...Object.entries(state.validation.fixtures || {}).map(([name, result]) => `- ${name}: ${yn(result.ok)}`),
    `- Unsafe/route/secret scan: ${yn(state.validation.unsafeRouteSecretScan?.ok)}`,
    `- Candidate differs from previous PPEC readback: ${yn(state.validation.ppecCandidatesDifferFromPriorReadback?.differs)}`,
    `- Final hygiene checks: ${state.validation.finalHygiene ? yn(state.validation.finalHygiene.ok) : 'not-run'}`,
  ];
}

function writeReports() {
  state.safety.serviceAreasUpdated = state.untouched.serviceAreasUnchanged === false;
  state.safety.themeRecordsUpdated = state.untouched.themeUnchanged === false;
  state.safety.mediaAssetRecordsUpdated = state.untouched.mediaAssetsUnchanged === false;
  ensureRequiredArtifacts();
  writeJson(files.manifest, state);
  writeText(`${outRel}/README.md`, `# Ice PPEC Home/Contact Local Draft Import

- Import performed: ${yn(state.importPerformed)}
- Homepage updated: ${yn(state.homepage.updatePerformed)}
- Contact updated: ${yn(state.contact.updatePerformed)}
- Auth: ${state.adminAuth.validation}
- Temp JWT loaded: ${yn(state.adminAuth.tempJwtLoaded)}
- Temp JWT deleted after success: ${yn(state.adminAuth.tempJwtDeletedAfterSuccess)}
- Temp JWT final status: ${state.adminAuth.tempJwtFinalStatus}
- Scope: local CMS drafts only
- Static regeneration: no
- Deployment: no
- Roller: paused/untouched
`);
  writeText(`${outRel}/PRE_IMPORT_VALIDATION.md`, `# Pre-Import Validation

${validationLines().join('\n')}

Artifacts:

- homepage-ppec-import-preflight-result.json
- contact-ppec-import-preflight-result.json
- dotnet-updated-home-contact-ppec-pre-import-result.json
- validation-command-results.json
`);
  writeText(`${outRel}/AUTH_LIFECYCLE_RESULT.md`, `# Auth Lifecycle Result

- Env JWT initial status: ${state.adminAuth.envStatus}
- Temp JWT initial status: ${state.adminAuth.tempJwtInitialStatus}
- Auth presence: ${state.adminAuth.presence}
- Auth validation: ${state.adminAuth.validation}
- Temp JWT loaded from file: ${yn(state.adminAuth.tempJwtLoaded)}
- Temp JWT deleted immediately after load: no
- Temp JWT deleted after success: ${yn(state.adminAuth.tempJwtDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.adminAuth.tempJwtRetainedOnFailure)}
- Temp JWT final status: ${state.adminAuth.tempJwtFinalStatus}
- Cleanup reason: ${state.adminAuth.tempJwtCleanupReason || 'not applicable yet'}
- JWT printed: no

Policy:

- Invalid auth retains the temp JWT.
- Pre-write validation failure retains the temp JWT.
- CMS write failure retains the temp JWT.
- Post-write verification failure retains the temp JWT.
- Successful write, verification, report, and final hygiene checks delete the temp JWT at the end.
`);
  writeText(`${outRel}/BASELINE_SNAPSHOTS.md`, `# Baseline Snapshots

- Homepage snapshot: current-homepage-before-ppec-import.snapshot.json
- Contact snapshot: current-contact-before-ppec-import.snapshot.json
- /service-areas baseline: ${state.baseline.serviceAreas?.expectedNotFound ? 'HTTP 404 expected-not-found' : `HTTP ${state.baseline.serviceAreas?.status ?? 'not-captured'}`}
- Theme baseline: HTTP ${state.baseline.theme?.status ?? 'not-captured'}
- MediaAssets baseline: HTTP ${state.baseline.mediaAssets?.status ?? 'not-captured'}
`);
  writeText(`${outRel}/HOMEPAGE_IMPORT_RESULT.md`, `# Homepage Import Result

- Performed: ${yn(state.homepage.updatePerformed)}
- Endpoint: ${state.homepage.endpoint || 'not-used'}
- HTTP status: ${state.homepage.httpStatus ?? 'not-run'}
- Change source: ${changeSource}
- Draft/needs_review readback: ${yn(state.readback.homepage?.checks?.draftNeedsReview)}
- Revision/rollback result: ${yn(state.readback.homepage?.checks?.revisionOrRollback)}
- Last change source persisted: ${yn(state.readback.homepage?.checks?.lastChangeSource)}
`);
  writeText(`${outRel}/CONTACT_IMPORT_RESULT.md`, `# Contact Import Result

- Performed: ${yn(state.contact.updatePerformed)}
- Endpoint: ${state.contact.endpoint || 'not-used'}
- HTTP status: ${state.contact.httpStatus ?? 'not-run'}
- Change source: ${changeSource}
- Draft/needs_review readback: ${yn(state.readback.contact?.checks?.draftNeedsReview)}
- Revision/rollback result: ${yn(state.readback.contact?.checks?.revisionOrRollback)}
- Last change source persisted: ${yn(state.readback.contact?.checks?.lastChangeSource)}
`);
  writeText(`${outRel}/READBACK_VERIFICATION.md`, `# Readback Verification

## Homepage

\`\`\`json
${JSON.stringify(state.readback.homepage || null, null, 2)}
\`\`\`

## Contact

\`\`\`json
${JSON.stringify(state.readback.contact || null, null, 2)}
\`\`\`

## Readback .NET

\`\`\`json
${JSON.stringify(state.validation.readbackDotnet || null, null, 2)}
\`\`\`
`);
  writeText(`${outRel}/PPEC_PERSISTENCE_VERIFICATION.md`, `# PPEC Persistence Verification

\`\`\`json
${JSON.stringify(state.readback.ppecPersistence || null, null, 2)}
\`\`\`

Production-field persistence:

\`\`\`json
${JSON.stringify(state.readback.productionFieldPersistence || null, null, 2)}
\`\`\`

MediaAsset persistence:

\`\`\`json
${JSON.stringify(state.readback.mediaAssetPersistence || null, null, 2)}
\`\`\`

Contact formBlock:

\`\`\`json
${JSON.stringify(state.readback.formBlock || null, null, 2)}
\`\`\`
`);
  writeText(`${outRel}/UNTOUCHED_ROUTES_VERIFICATION.md`, `# Untouched Routes Verification

- /service-areas unchanged or still 404: ${yn(state.untouched.serviceAreasUnchanged)}
- /service-areas baseline: ${state.untouched.serviceAreasBaseline || 'not-captured'}
- /service-areas after: ${state.untouched.serviceAreasAfter || 'not-captured'}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- Roller untouched: yes
`);
  writeText(`${outRel}/FRONTEND_PREVIEW_CHECKLIST.md`, `# Frontend Preview Checklist

- Homepage draft preview ${webBase}/__preview/ice-rink-rentals/home: HTTP ${state.frontend.homePreview?.status ?? 'not-run'}, reachable ${yn(state.frontend.homePreview?.reachable)}, raw HTML contains PPEC ${yn(state.frontend.homePreview?.containsPartyProsEastCoast || state.frontend.homePreview?.containsPpec)}
- Contact ${webBase}/contact: HTTP ${state.frontend.contact?.status ?? 'not-run'}, reachable ${yn(state.frontend.contact?.reachable)}, raw HTML contains PPEC ${yn(state.frontend.contact?.containsPartyProsEastCoast || state.frontend.contact?.containsPpec)}

Note: raw homepage preview HTML is a client-side JWT-gated shell; authenticated browser preview is still the visual check.
`);
  writeText(`${outRel}/REMAINING_BLOCKERS.md`, `# Remaining Blockers

Run blockers:

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None for local draft persistence verification.'}

Before static regeneration:

- Manual preview/review is still required.
- Static regeneration remains unauthorized.
- Publish/production approval remains false.

Before production/indexing:

- Production approval is not granted.
- Deployment, DNS, provider/email settings, and public indexing remain out of scope.
`);
  writeText(files.rootReport, rootReport());
}

function ensureRequiredArtifacts() {
  for (const file of [files.homeSnapshot, files.contactSnapshot, files.homeReadback, files.contactReadback]) {
    if (!fs.existsSync(abs(file))) writeJson(file, { status: 'not-captured', reason: state.blockers, createdAt: now });
  }
}

function rootReport() {
  return `# Pumpkin Ice PPEC Home/Contact Local Draft Import Report

Created: ${state.createdAt}

## Start State

Git status at start:

\`\`\`text
${state.startState.gitStatusAtStart.join('\n') || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.startState.gitLogAtStart.join('\n')}
\`\`\`

## Validation Results

${validationLines().join('\n')}

## Auth Status

- Env JWT: ${state.adminAuth.envStatus}
- Temp JWT initial status: ${state.adminAuth.tempJwtInitialStatus}
- Auth presence: ${state.adminAuth.presence}
- Auth validation: ${state.adminAuth.validation}
- Temp JWT loaded from file: ${yn(state.adminAuth.tempJwtLoaded)}
- Temp JWT deleted immediately after load: no
- Temp JWT deleted only after success: ${yn(state.adminAuth.tempJwtDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.adminAuth.tempJwtRetainedOnFailure)}
- Temp JWT final status: ${state.adminAuth.tempJwtFinalStatus}
- Auth cleanup reason: ${state.adminAuth.tempJwtCleanupReason || 'not applicable yet'}
- JWT printed: no

## Import Performed

- Import performed: ${yn(state.importPerformed)}
- Homepage update result: ${yn(state.homepage.updatePerformed)} HTTP ${state.homepage.httpStatus ?? 'not-run'}
- Contact update result: ${yn(state.contact.updatePerformed)} HTTP ${state.contact.httpStatus ?? 'not-run'}
- Change source: ${changeSource}

## Revision/Rollback Result

- Homepage revision/rollback exists: ${yn(state.readback.homepage?.checks?.revisionOrRollback)}
- Homepage change source persisted: ${yn(state.readback.homepage?.checks?.lastChangeSource)}
- Contact revision/rollback exists: ${yn(state.readback.contact?.checks?.revisionOrRollback)}
- Contact change source persisted: ${yn(state.readback.contact?.checks?.lastChangeSource)}

## Readback Results

- Homepage readback: ${yn(state.readback.homepage?.ok)}
- Contact readback: ${yn(state.readback.contact?.ok)}
- PPEC persistence: ${yn(state.readback.ppecPersistence?.ok)}
- Production-field persistence: homepage ${yn(state.readback.productionFieldPersistence?.homepage?.ok)}, contact ${yn(state.readback.productionFieldPersistence?.contact?.ok)}
- MediaAsset verification: homepage ${yn(state.readback.mediaAssetPersistence?.homepage?.ok)}, contact ${yn(state.readback.mediaAssetPersistence?.contact?.ok)}
- Contact formBlock verification: ${yn(state.readback.formBlock?.ok)}

## Untouched Results

- /service-areas unchanged or still 404: ${yn(state.untouched.serviceAreasUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- Static regeneration: no
- Deployment/DNS/email/provider action: no
- Protected config touched: no
- Roller remains paused: yes

## Frontend Preview Result

- Homepage preview: HTTP ${state.frontend.homePreview?.status ?? 'not-run'}, reachable ${yn(state.frontend.homePreview?.reachable)}
- Contact: HTTP ${state.frontend.contact?.status ?? 'not-run'}, reachable ${yn(state.frontend.contact?.reachable)}

## Remaining Blockers Before Static Regeneration

- Manual authenticated preview review is still required.
- Static regeneration is not authorized.
- publishApproved and productionApproved remain false.

## Remaining Blockers Before Production/Indexing

- Production approval is not granted.
- Deployment, DNS, provider/email settings, and public indexing remain out of scope.

## Run Blockers

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

## Next Recommended Action

Open the authenticated local draft preview and visually confirm the PPEC partner CTA placement. Static regeneration and production/indexing remain separate approval gates.
`;
}

function runSummary() {
  return {
    ok: state.blockers.length === 0,
    auth: state.adminAuth.validation,
    tempJwtInitialStatus: state.adminAuth.tempJwtInitialStatus,
    tempJwtLoaded: state.adminAuth.tempJwtLoaded,
    tempJwtDeletedAfterSuccess: state.adminAuth.tempJwtDeletedAfterSuccess,
    tempJwtRetainedOnFailure: state.adminAuth.tempJwtRetainedOnFailure,
    tempJwtFinalStatus: state.adminAuth.tempJwtFinalStatus,
    importPerformed: state.importPerformed,
    homepageUpdated: state.homepage.updatePerformed,
    contactUpdated: state.contact.updatePerformed,
    ppecPersistenceOk: state.readback.ppecPersistence?.ok === true,
    serviceAreasUntouched: state.untouched.serviceAreasUnchanged === true,
    themeUntouched: state.untouched.themeUnchanged === true,
    mediaAssetsUntouched: state.untouched.mediaAssetsUnchanged === true,
    blockers: state.blockers,
    outputFolder: outRel,
    rootReport: files.rootReport,
  };
}
