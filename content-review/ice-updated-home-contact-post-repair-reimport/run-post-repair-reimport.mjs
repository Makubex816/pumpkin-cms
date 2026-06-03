import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repo = process.cwd();
const outRel = 'content-review/ice-updated-home-contact-post-repair-reimport';
const outDir = path.join(repo, outRel);
const apiBase = 'http://localhost:5064';
const adminBase = 'http://localhost:3000';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const publicEmailDisplayPolicy = 'form-first-under-review';
const staticEndpointRef = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const leadRecipientRef = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const changeSource = 'post_repair_updated_home_contact_import';
const now = new Date().toISOString();

const files = {
  homeCandidate: 'content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json',
  contactCandidate: 'content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json',
  importPackage: 'content-review/ice-updated-home-contact-validated/UPDATED_HOME_CONTACT_IMPORT_PACKAGE.json',
  homePreflight: `${outRel}/homepage-import-preflight-post-repair.json`,
  contactPreflight: `${outRel}/contact-import-preflight-post-repair.json`,
  candidateDotnet: `${outRel}/dotnet-updated-home-contact-contract-result.json`,
  homeSnapshot: `${outRel}/current-homepage-before-post-repair-import.snapshot.json`,
  contactSnapshot: `${outRel}/current-contact-before-post-repair-import.snapshot.json`,
  homeReadback: `${outRel}/homepage-readback-after-post-repair-import.json`,
  contactReadback: `${outRel}/contact-readback-after-post-repair-import.json`,
  homeWriteResult: `${outRel}/homepage-write-result.json`,
  contactWriteResult: `${outRel}/contact-write-result.json`,
  readbackDotnet: `${outRel}/dotnet-readback-updated-home-contact-contract-result.json`,
  manifest: `${outRel}/manifest.json`,
  rootReport: 'PUMPKIN_ICE_UPDATED_HOME_CONTACT_POST_REPAIR_REIMPORT_REPORT.md',
};

const run = {
  schemaVersion: 'pumpkin-ice-updated-home-contact-post-repair-reimport.v1',
  createdAt: now,
  tenantId,
  siteKey,
  domain,
  branch: git(['branch', '--show-current']),
  head: git(['rev-parse', '--short', 'HEAD']),
  startState: {
    gitStatusAtRequestStart: [' M packages/pumpkin-ts-models/src/models/Page.ts'],
    gitLogAtRequestStart: [
      '4dc63e7 Repair updated Ice home contact contract persistence',
      '2c0b20c Add Ice updated home contact local draft import report',
      '7206de9 Add admin auth diagnostic tooling',
      '6eae0c9 Add Ice updated home contact draft import auth blocker report',
      '2f4bb29 Add Ice updated home contact package intake',
      '02fd805 Repair Pumpkin page contract persistence models',
      '01a37ef Repair Phase 8N homepage contract persistence',
      '97ddf11 Add Phase 8N homepage local draft overwrite report',
      '34eef51 Fix Phase 8N homepage overwrite route guard',
      'e2d150b Add Ice homepage Phase 8N scaffold validation package',
      'e465511 Add Ice homepage draft preview and production rendering support',
      '631c899 Add Ice homepage render diagnostic report',
    ],
    currentGitStatusBeforeWrites: git(['status', '--short', '--untracked-files=all']).split(/\r?\n/).filter(Boolean),
  },
  inputCandidates: files,
  serviceReachability: {},
  adminAuth: { presence: 'MISSING', validation: 'MISSING', tempFileDeleted: false, jwtPrinted: false },
  validation: {},
  baseline: {},
  after: {},
  importPerformed: false,
  homepage: { updatePerformed: false },
  contact: { updatePerformed: false },
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
    dnsAzureCloudflareMicrosoft365BluehostEmailChanged: false,
    emailSent: false,
    rollerTouched: false,
    protectedConfigRead: false,
    jwtPrinted: false,
  },
  blockers: [],
  warnings: [],
  apiCalls: [],
};

let jwt = '';

try {
  await main();
} catch (error) {
  run.blockers.push(safeMessage(error));
  writeAllReports();
  console.log(JSON.stringify({
    ok: false,
    auth: run.adminAuth.validation,
    importPerformed: run.importPerformed,
    blockers: run.blockers,
  }, null, 2));
  process.exitCode = 1;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  await collectReachability();
  validateLocalInputsAndReports();
  run.validation.unsafeRouteSecretScan = unsafeRouteSecretScan();
  if (!run.validation.unsafeRouteSecretScan.ok) {
    run.blockers.push('Unsafe HTML/CSS/form/media/email, route, or targeted secret scan failed before import.');
  }

  loadAdminJwt();
  console.log(`admin-auth-presence=${run.adminAuth.presence}`);
  if (run.adminAuth.presence !== 'PRESENT') {
    run.blockers.push('Admin auth missing; stopped before CMS writes.');
    writeAllReports();
    return;
  }

  await validateAuth();
  console.log(`admin-auth-validation=${run.adminAuth.validation}`);
  if (run.adminAuth.validation !== 'VALID') {
    run.blockers.push('Admin auth invalid; stopped before CMS writes.');
    writeAllReports();
    return;
  }

  await captureBaseline();
  if (!canWrite()) {
    run.blockers.push('Pre-import validation or baseline failed; stopped before CMS writes.');
    writeAllReports();
    return;
  }

  await writeCandidates();
  await captureAfterWrite();
  verifyReadbacks();
  runReadbackDotnetContract();
  await probeFrontends();
  writeAllReports();

  console.log(JSON.stringify({
    ok: run.blockers.length === 0,
    auth: run.adminAuth.validation,
    importPerformed: run.importPerformed,
    homepageUpdated: run.homepage.updatePerformed,
    contactUpdated: run.contact.updatePerformed,
    homepagePersistenceOk: run.readback.homepage?.ok === true,
    contactPersistenceOk: run.readback.contact?.ok === true,
    untouchedOk: run.untouched.ok === true,
    blockers: run.blockers,
    outputFolder: outRel,
    rootReport: files.rootReport,
  }, null, 2));
}

async function collectReachability() {
  run.serviceReachability.api = await probe(`${apiBase}/`);
  run.serviceReachability.admin3000 = await probe(`${adminBase}/`);
  run.serviceReachability.frontend3002 = await probe(`${webBase}/`);
  if (!run.serviceReachability.api.reachable) {
    run.blockers.push('Local API http://localhost:5064 is not reachable.');
  }
}

function validateLocalInputsAndReports() {
  const requiredInputs = [files.homeCandidate, files.contactCandidate, files.importPackage];
  run.validation.inputFiles = requiredInputs.map((file) => ({ file, exists: fs.existsSync(abs(file)) }));
  if (run.validation.inputFiles.some((item) => !item.exists)) {
    run.blockers.push('One or more input candidate/package files are missing.');
  }

  const jsonFiles = [
    files.homeCandidate,
    files.contactCandidate,
    files.importPackage,
    files.homePreflight,
    files.contactPreflight,
    files.candidateDotnet,
    `${outRel}/design-system-validation-result.json`,
    `${outRel}/media-validation-result.json`,
    `${outRel}/default-form-validation-result.json`,
    `${outRel}/tailwind-navigation-validation-result.json`,
    `${outRel}/page-intake-normalizer-validation-result.json`,
  ];
  run.validation.jsonParse = jsonFiles.map(parseJsonFile);
  if (run.validation.jsonParse.some((item) => !item.ok)) {
    run.blockers.push('JSON parse validation failed.');
  }

  const homePreflight = readJson(files.homePreflight);
  const contactPreflight = readJson(files.contactPreflight);
  const dotnet = readJson(files.candidateDotnet);
  const design = readJson(`${outRel}/design-system-validation-result.json`);
  const media = readJson(`${outRel}/media-validation-result.json`);
  const form = readJson(`${outRel}/default-form-validation-result.json`);
  const tailwind = readJson(`${outRel}/tailwind-navigation-validation-result.json`);
  const normalizer = readJson(`${outRel}/page-intake-normalizer-validation-result.json`);

  run.validation.preflight = {
    homepage: summarizePreflight(homePreflight),
    contact: summarizePreflight(contactPreflight),
  };
  run.validation.dotnetContract = {
    ok: dotnet.Ok === true,
    readinessDecision: dotnet.ReadinessDecision,
    pages: (dotnet.Pages || []).map((page) => ({
      pageSlug: page.PageSlug,
      roundTripOk: page.RoundTripOk,
      productionFieldPersistenceOk: page.ProductionFieldPersistenceOk,
      updatedHomeContactPersistenceOk: page.UpdatedHomeContactPersistenceOk,
      errorCount: page.ErrorCount,
      warningCount: page.WarningCount,
    })),
  };
  run.validation.fixtures = {
    designSystem: { ok: design.ok === true, passed: design.passed, failed: design.failed },
    media: { ok: media.ok === true, assetCount: media.assetCount, referenceCount: media.referenceCount, warningCount: media.warningCount },
    defaultForm: { ok: form.ok === true, passed: form.passed, failed: form.failed },
    tailwindNavigation: { ok: tailwind.ok === true, checkedNavigationRoutes: tailwind.checkedNavigationRoutes, failures: tailwind.failures || [] },
    pageIntakeNormalizer: { ok: normalizer.ok === true, passed: normalizer.passed, failed: normalizer.failed },
  };

  if (!run.validation.preflight.homepage.localDraftImport || !run.validation.preflight.contact.localDraftImport) {
    run.blockers.push('Safe import preflight did not pass for local draft import.');
  }
  if (!run.validation.dotnetContract.ok) {
    run.blockers.push('.NET updated home/contact contract failed.');
  }
  for (const [name, result] of Object.entries(run.validation.fixtures)) {
    if (!result.ok) run.blockers.push(`${name} validation failed.`);
  }
}

function unsafeRouteSecretScan() {
  const candidates = [readJson(files.homeCandidate), readJson(files.contactCandidate)];
  const raw = candidates.map((item) => JSON.stringify(projectUnsafeScanSurface(item))).join('\n');
  const unsafeIssues = [];
  const routeIssues = [];
  const secretPatterns = [
    /authorization:\s*bearer\s+[a-z0-9._-]{20,}/i,
    /jwt\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /api[_-]?key\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /secret\s*[:=]\s*[a-z0-9._-]{20,}/i,
    /password\s*[:=]\s*[^\s`"']{8,}/i,
  ];
  if (/\bstate-city\b|\/state-city/i.test(raw)) unsafeIssues.push('state-city reference found.');
  if (/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(raw)) unsafeIssues.push('WordPress/CF7 runtime marker found.');
  if (/<\s*(script|iframe)\b/i.test(raw)) unsafeIssues.push('unsafe script/iframe marker found.');
  if (/data:image\//i.test(raw)) unsafeIssues.push('base64 media marker found.');
  if (/mailto:/i.test(raw)) unsafeIssues.push('mailto marker found.');

  candidates.forEach((page) => {
    const slug = page.pageSlug || page.PageSlug;
    const route = page.route || page.path || (slug === 'home' ? '/' : `/${slug}`);
    const canonical = page.canonicalUrl || page.seo?.canonicalUrl || page.Seo?.CanonicalUrl || '';
    if (slug === 'home' && route !== '/') routeIssues.push('homepage route is not /.');
    if (slug === 'contact' && route !== '/contact') routeIssues.push('contact route is not /contact.');
    if (slug === 'home' && !/^https:\/\/iceskatingrinkrentals\.com\/?$/.test(canonical)) routeIssues.push('homepage canonical mismatch.');
    if (slug === 'contact' && canonical !== 'https://iceskatingrinkrentals.com/contact') routeIssues.push('contact canonical mismatch.');
  });

  const secretIssues = secretPatterns.filter((pattern) => pattern.test(raw)).length;
  return {
    ok: unsafeIssues.length === 0 && routeIssues.length === 0 && secretIssues === 0,
    unsafeIssues,
    routeIssues,
    secretIssues,
  };
}

function projectUnsafeScanSurface(page) {
  return stripReviewOnlyFields({
    tenantId: page.tenantId,
    siteKey: page.siteKey,
    route: page.route,
    path: page.path,
    pageSlug: page.pageSlug,
    canonicalUrl: page.canonicalUrl,
    domainRouting: page.domainRouting,
    seo: page.seo,
    openGraph: page.openGraph,
    formConfig: page.formConfig,
    leadCapture: page.leadCapture,
    media: page.media,
    ContentData: {
      ContentBlocks: blocksOf(page).map((block) => ({
        type: blockType(block),
        content: contentOf(block),
      })),
    },
  });
}

function stripReviewOnlyFields(value) {
  if (Array.isArray(value)) return value.map(stripReviewOnlyFields);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    if (/^(review|notes|reviewMetadata|sourceCandidate|sourcePackage)$/i.test(key)) continue;
    output[key] = stripReviewOnlyFields(nested);
  }
  return output;
}

function loadAdminJwt() {
  const envToken = (process.env.PUMPKIN_ADMIN_JWT || '').trim();
  const tempPath = path.join(process.env.TEMP || process.env.TMP || '.', 'pumpkin-admin-jwt.txt');
  if (envToken) {
    jwt = envToken;
    run.adminAuth.presence = 'PRESENT';
    run.adminAuth.validation = 'PRESENT';
    run.adminAuth.sourceStatus = 'PRESENT';
    return;
  }
  if (fs.existsSync(tempPath)) {
    jwt = fs.readFileSync(tempPath, 'utf8').trim();
    run.adminAuth.presence = jwt ? 'PRESENT' : 'MISSING';
    run.adminAuth.validation = jwt ? 'PRESENT' : 'MISSING';
    fs.rmSync(tempPath, { force: true });
    run.adminAuth.tempFileDeleted = true;
    run.adminAuth.sourceStatus = jwt ? 'PRESENT' : 'MISSING';
    return;
  }
  run.adminAuth.presence = 'MISSING';
  run.adminAuth.validation = 'MISSING';
  run.adminAuth.sourceStatus = 'MISSING';
}

async function validateAuth() {
  const response = await apiJson('/api/admin/pages?tenantId=ice-rink-rentals', { method: 'GET' }, true);
  run.apiCalls.push('GET /api/admin/pages?tenantId=ice-rink-rentals');
  run.adminAuth.validation = response.status === 200 ? 'VALID' : 'INVALID';
  run.adminAuth.validationHttpStatus = response.status;
}

async function captureBaseline() {
  const [home, contact, serviceAreas, themes, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson('/api/admin/themes/ice-rink-rentals', { method: 'GET' }, true),
    apiJson('/api/admin/ice-rink-rentals/media-assets', { method: 'GET' }, true),
  ]);
  run.apiCalls.push(
    'GET /api/admin/pages/ice-rink-rentals/home baseline',
    'GET /api/admin/pages/ice-rink-rentals/contact baseline',
    'GET /api/admin/pages/ice-rink-rentals/service-areas baseline',
    'GET /api/admin/themes/ice-rink-rentals baseline',
    'GET /api/admin/ice-rink-rentals/media-assets baseline',
  );

  run.baseline.homepage = summarizeResponse(home);
  run.baseline.contact = summarizeResponse(contact);
  run.baseline.serviceAreas = summarizeResponse(serviceAreas, true);
  run.baseline.theme = summarizeResponse(themes, true);
  run.baseline.mediaAssets = summarizeResponse(mediaAssets, true);
  run.baseline.hashes = { serviceAreas: serviceAreas.hash, theme: themes.hash, mediaAssets: mediaAssets.hash };
  run.baseline.mediaAssetIds = collectOfficialMediaIds(mediaAssets.json);

  if (home.status !== 200 || !home.json) run.blockers.push('Could not fetch current homepage baseline.');
  if (contact.status !== 200 || !contact.json) run.blockers.push('Could not fetch current contact baseline.');
  if (!(serviceAreas.status === 200 || serviceAreas.status === 404)) run.blockers.push(`/service-areas baseline returned unexpected HTTP ${serviceAreas.status}.`);
  if (!(themes.status === 200 || themes.status === 404)) run.warnings.push(`Theme baseline returned HTTP ${themes.status}; unchanged check may be limited.`);
  if (!(mediaAssets.status === 200 || mediaAssets.status === 404)) run.warnings.push(`MediaAssets baseline returned HTTP ${mediaAssets.status}; unchanged check may be limited.`);

  if (home.json) writeJson(files.homeSnapshot, sanitize(home.json));
  if (contact.json) writeJson(files.contactSnapshot, sanitize(contact.json));
}

function canWrite() {
  return run.blockers.length === 0 && run.serviceReachability.api.reachable && run.adminAuth.validation === 'VALID';
}

async function writeCandidates() {
  const beforeHome = readJson(files.homeSnapshot);
  const beforeContact = readJson(files.contactSnapshot);
  const homePayload = preparePagePayload(readJson(files.homeCandidate), beforeHome, '/', 'home');
  const contactPayload = preparePagePayload(readJson(files.contactCandidate), beforeContact, '/contact', 'contact');
  const summary = encodeURIComponent('Post-repair updated home/contact local draft reimport; verify persistence after contract repair. No publish/static/media/theme/provider changes.');

  const homeResult = await apiJson(`/api/admin/pages/${tenantId}/home?changeSource=${changeSource}&changeSummary=${summary}`, { method: 'PUT', body: JSON.stringify(homePayload) }, true);
  run.apiCalls.push(`PUT /api/admin/pages/${tenantId}/home?changeSource=${changeSource}`);
  run.homepage = { updatePerformed: homeResult.status >= 200 && homeResult.status < 300, httpStatus: homeResult.status, endpoint: `PUT /api/admin/pages/${tenantId}/home`, safeError: homeResult.ok ? '' : homeResult.safeText };
  writeJson(files.homeWriteResult, sanitize({ status: homeResult.status, ok: homeResult.ok, page: homeResult.json }));
  if (!run.homepage.updatePerformed) {
    run.blockers.push(`Homepage update failed with HTTP ${homeResult.status}.`);
    return;
  }

  const contactResult = await apiJson(`/api/admin/pages/${tenantId}/contact?changeSource=${changeSource}&changeSummary=${summary}`, { method: 'PUT', body: JSON.stringify(contactPayload) }, true);
  run.apiCalls.push(`PUT /api/admin/pages/${tenantId}/contact?changeSource=${changeSource}`);
  run.contact = { updatePerformed: contactResult.status >= 200 && contactResult.status < 300, httpStatus: contactResult.status, endpoint: `PUT /api/admin/pages/${tenantId}/contact`, safeError: contactResult.ok ? '' : contactResult.safeText };
  writeJson(files.contactWriteResult, sanitize({ status: contactResult.status, ok: contactResult.ok, page: contactResult.json }));
  if (!run.contact.updatePerformed) {
    run.blockers.push(`Contact update failed with HTTP ${contactResult.status}.`);
    return;
  }

  run.importPerformed = true;
}

async function captureAfterWrite() {
  const [home, contact, serviceAreas, themes, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson('/api/admin/themes/ice-rink-rentals', { method: 'GET' }, true),
    apiJson('/api/admin/ice-rink-rentals/media-assets', { method: 'GET' }, true),
  ]);
  run.apiCalls.push(
    'GET /api/admin/pages/ice-rink-rentals/home readback',
    'GET /api/admin/pages/ice-rink-rentals/contact readback',
    'GET /api/admin/pages/ice-rink-rentals/service-areas after',
    'GET /api/admin/themes/ice-rink-rentals after',
    'GET /api/admin/ice-rink-rentals/media-assets after',
  );

  run.after = {
    homepage: summarizeResponse(home),
    contact: summarizeResponse(contact),
    serviceAreas: summarizeResponse(serviceAreas, true),
    theme: summarizeResponse(themes, true),
    mediaAssets: summarizeResponse(mediaAssets, true),
    hashes: { serviceAreas: serviceAreas.hash, theme: themes.hash, mediaAssets: mediaAssets.hash },
    mediaAssetIds: collectOfficialMediaIds(mediaAssets.json),
  };
  if (home.json) writeJson(files.homeReadback, sanitize(home.json));
  if (contact.json) writeJson(files.contactReadback, sanitize(contact.json));

  run.untouched = {
    serviceAreasUnchanged: run.baseline.serviceAreas.status === 404 ? serviceAreas.status === 404 : serviceAreas.status === 200 && serviceAreas.hash === run.baseline.hashes.serviceAreas,
    serviceAreasBaseline: run.baseline.serviceAreas.status === 404 ? 'expected-404' : `HTTP-${run.baseline.serviceAreas.status}`,
    serviceAreasAfter: serviceAreas.status === 404 ? 'expected-404' : `HTTP-${serviceAreas.status}`,
    themeUnchanged: themes.status === 200 && run.baseline.theme.status === 200 ? themes.hash === run.baseline.hashes.theme : themes.status === run.baseline.theme.status,
    mediaAssetsUnchanged: mediaAssets.status === 200 && run.baseline.mediaAssets.status === 200 ? mediaAssets.hash === run.baseline.hashes.mediaAssets : mediaAssets.status === run.baseline.mediaAssets.status,
    rollerTouched: false,
  };
  run.untouched.ok = run.untouched.serviceAreasUnchanged && run.untouched.themeUnchanged && run.untouched.mediaAssetsUnchanged;
  if (!run.untouched.serviceAreasUnchanged) run.blockers.push('/service-areas changed or did not preserve baseline.');
  if (!run.untouched.themeUnchanged) run.blockers.push('Theme records changed or could not be verified unchanged.');
  if (!run.untouched.mediaAssetsUnchanged) run.blockers.push('MediaAsset records changed or could not be verified unchanged.');
}

function verifyReadbacks() {
  if (!fs.existsSync(abs(files.homeReadback)) || !fs.existsSync(abs(files.contactReadback))) {
    run.blockers.push('Readback files missing; persistence verification could not complete.');
    return;
  }
  const homeCandidate = readJson(files.homeCandidate);
  const contactCandidate = readJson(files.contactCandidate);
  const home = readJson(files.homeReadback);
  const contact = readJson(files.contactReadback);
  run.readback.homepage = verifyPage(homeCandidate, home, '/', 'home');
  run.readback.contact = verifyPage(contactCandidate, contact, '/contact', 'contact');
  run.readback.productionFieldPersistence = {
    homepage: productionPersistenceCompare(homeCandidate, home),
    contact: productionPersistenceCompare(contactCandidate, contact),
  };
  run.readback.mediaAssetPersistence = {
    homepage: mediaPersistenceCompare(homeCandidate, home, run.after.mediaAssetIds || run.baseline.mediaAssetIds || []),
    contact: mediaPersistenceCompare(contactCandidate, contact, run.after.mediaAssetIds || run.baseline.mediaAssetIds || []),
  };
  run.readback.formBlock = verifyContactForm(contact);

  if (!run.readback.homepage.ok) run.blockers.push(`Homepage readback persistence failed: ${run.readback.homepage.failedChecks.join(', ')}`);
  if (!run.readback.contact.ok) run.blockers.push(`Contact readback persistence failed: ${run.readback.contact.failedChecks.join(', ')}`);
  if (!run.readback.productionFieldPersistence.homepage.ok) run.blockers.push('Homepage production field persistence compare failed.');
  if (!run.readback.productionFieldPersistence.contact.ok) run.blockers.push('Contact production field persistence compare failed.');
  if (!run.readback.mediaAssetPersistence.homepage.ok) run.blockers.push('Homepage MediaAsset ID persistence/official-record verification failed.');
  if (!run.readback.mediaAssetPersistence.contact.ok) run.blockers.push('Contact MediaAsset ID persistence/official-record verification failed.');
  if (!run.readback.formBlock.ok) run.blockers.push(`Contact formBlock verification failed: ${run.readback.formBlock.failedChecks.join(', ')}`);
}

function runReadbackDotnetContract() {
  if (!fs.existsSync(abs(files.homeReadback)) || !fs.existsSync(abs(files.contactReadback))) return;
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
  run.validation.readbackDotnetContract = {
    exitCode: result.status,
    ok: parsed?.Ok === true,
    readinessDecision: parsed?.ReadinessDecision || '',
    errorCount: parsed?.Errors?.length || 0,
    warningCount: parsed?.Warnings?.length || 0,
  };
  if (result.status !== 0 || parsed?.Ok !== true) {
    run.blockers.push('Readback .NET updated home/contact contract validation failed.');
  }
}

async function probeFrontends() {
  run.frontend.homePreview = await probe(`${webBase}/__preview/ice-rink-rentals/home`);
  run.frontend.contact = await probe(`${webBase}/contact`);
}

function preparePagePayload(candidate, existing, route, slug) {
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
    lastEditedAt: now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    needsRebuild: true,
    staticEligible: false,
    productionApproved: false,
    deploymentStatus: 'pending_rebuild',
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
    status: 'post-repair-local-draft-reimport',
    postRepairReimportAt: now,
    cmsWritesPerformed: true,
    staticRegenerationPerformed: false,
    deploymentPerformed: false,
    changeSource,
  };
  page.pageQuality = { ...(page.pageQuality || {}), status: 'needs_review' };
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

function verifyPage(candidate, readback, route, slug) {
  const failedChecks = [];
  const summary = summarizePage(readback);
  const text = JSON.stringify(readback);
  const routing = readback.domainRouting || readback.DomainRouting || {};
  const candidateVariants = collectVariants(candidate);
  const readbackVariants = collectVariants(readback);
  const candidateMediaIds = collectValuesByKey(candidate, 'mediaAssetId');
  const readbackMediaIds = collectValuesByKey(readback, 'mediaAssetId');
  const checks = {
    route: (readback.route || readback.path || (summary.pageSlug === 'home' ? '/' : `/${summary.pageSlug}`)) === route,
    slug: summary.pageSlug === slug,
    draftNeedsReview: summary.workflowStatus === 'draft' && summary.reviewStatus === 'needs_review',
    productionApprovedFalse: summary.productionApproved === false,
    publishApprovedFalse: summary.publishApproved === false && summary.approvedForPublish === false,
    revisionOrRollback: Number(summary.revisionNumber || 0) > 0 || summary.rollbackAvailable === true,
    selectedMailbox: routing.selectedMailbox === selectedMailbox,
    publicEmailDisplayPolicy: routing.publicEmailDisplayPolicy === publicEmailDisplayPolicy,
    selectedMailboxMetadata: routing.selectedMailboxMetadata === selectedMailbox,
    leadRecipientRef: routing.leadRecipientRef === leadRecipientRef,
    staticEndpointRef: routing.staticEndpointRef === staticEndpointRef,
    mailtoDisabled: routing.mailtoLinksEnabled === false,
    publicContactEmailHidden: !String(routing.publicContactEmail || '').trim(),
    sectionVariantsPersist: candidateVariants.every((value) => readbackVariants.includes(value)),
    mediaAssetIdsPersist: candidateMediaIds.every((value) => readbackMediaIds.includes(value)),
    noFakePhone: !/(\(555\)|\b555[-.\s]?\d{3}|123[-.\s]?456)/i.test(text),
    noMailto: !/mailto:/i.test(text),
  };
  for (const [key, ok] of Object.entries(checks)) if (!ok) failedChecks.push(key);
  return {
    ok: failedChecks.length === 0,
    failedChecks,
    summary,
    checks,
    candidateVariantCount: candidateVariants.length,
    readbackVariantCount: readbackVariants.length,
    candidateMediaAssetIdCount: candidateMediaIds.length,
    readbackMediaAssetIdCount: readbackMediaIds.length,
  };
}

function productionPersistenceCompare(candidate, readback) {
  const candidatePaths = collectPersistencePaths(candidate)
    .filter((item) => !item.path.startsWith('$.mediaRequirements'));
  const readbackPaths = collectPersistencePaths(readback);
  const missing = candidatePaths.filter((item) => !readbackPaths.some((r) => r.path === item.path && JSON.stringify(r.value) === JSON.stringify(item.value)));
  return { ok: missing.length === 0, checkedCount: candidatePaths.length, missingCount: missing.length, missing: missing.slice(0, 50) };
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
    formBlockExists: !!formBlock,
    formKey: content.formKey === 'default-quote-request',
    sourcePage: content.sourcePage === '/contact',
    staticEndpointRef: content.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: content.leadRecipientRef === leadRecipientRef,
    selectedMailboxMetadata: content.selectedMailboxMetadata === selectedMailbox,
    emailSendingDisabled: content.emailSendingEnabled === false || content.emailSendingEnabled === null || content.emailSendingEnabled === undefined,
    noCf7: !/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(JSON.stringify(projectUnsafeScanSurface(contact))),
  };
  const failedChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failedChecks.length === 0, checks, failedChecks };
}

function collectPersistencePaths(value) {
  const interesting = new Set(['sectionVariant', 'variant', 'mediaAssetId', 'assetId', 'publicEmailDisplayPolicy', 'selectedMailbox', 'selectedMailboxMetadata', 'selectedEmailProvider', 'pumpkinAppSendStatus', 'leadRecipientRef', 'staticEndpointRef', 'formKey', 'sourcePage', 'emailSendingEnabled', 'serviceScope', 'buttonText', 'buttonLink']);
  const results = [];
  const walk = (node, trail) => {
    if (Array.isArray(node)) return node.forEach((item, index) => walk(item, `${trail}[${index}]`));
    if (!node || typeof node !== 'object') return;
    for (const [key, nested] of Object.entries(node)) {
      const p = trail ? `${trail}.${key}` : key;
      if (interesting.has(key) && nested !== undefined && nested !== null && nested !== '') {
        results.push({ path: p.replace(/\[\d+\]/g, '[]'), value: nested });
      }
      walk(nested, p);
    }
  };
  walk(value, '$');
  return results;
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

function summarizePage(page) {
  const workflow = page.workflow || page.Workflow || {};
  const staticPublishing = page.staticPublishing || page.StaticPublishing || {};
  const revision = page.revision || page.Revision || {};
  return {
    pageId: page.PageId || page.pageId || page.id || '',
    pageSlug: page.pageSlug || page.PageSlug || page.slug || '',
    route: page.route || page.path || '',
    pageVersion: page.PageVersion || page.pageVersion || null,
    workflowStatus: workflow.status || workflow.Status || '',
    reviewStatus: workflow.reviewStatus || workflow.ReviewStatus || '',
    approvedForPublish: workflow.approvedForPublish === true || workflow.ApprovedForPublish === true,
    productionApproved: page.productionApproved === true || workflow.productionApproved === true || staticPublishing.productionApproved === true,
    publishApproved: page.publishApproved === true || workflow.publishApproved === true,
    staticNeedsRebuild: staticPublishing.needsRebuild === true || staticPublishing.NeedsRebuild === true,
    isPublished: page.isPublished === true || page.IsPublished === true,
    includeInSitemap: page.includeInSitemap === true || page.IncludeInSitemap === true,
    revisionNumber: revision.revisionNumber || revision.RevisionNumber || null,
    rollbackAvailable: revision.rollbackAvailable === true || revision.RollbackAvailable === true,
    lastChangeSource: revision.lastChangeSource || revision.LastChangeSource || '',
    blockTypes: blocksOf(page).map(blockType),
  };
}

function collectVariants(page) {
  return [...new Set(blocksOf(page).flatMap((block) => [contentOf(block).sectionVariant, contentOf(block).variant]).filter(Boolean))];
}

function blocksOf(page) {
  return page?.ContentData?.ContentBlocks || page?.content?.blocks || page?.ContentBlocks || [];
}

function blockType(block) {
  return block?.type || block?.Type || block?.blockType || '';
}

function contentOf(block) {
  return block?.content || block?.Content || {};
}

function collectValuesByKey(value, key, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectValuesByKey(item, key, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === key && typeof v === 'string' && v.trim()) out.push(v.trim());
      collectValuesByKey(v, key, out);
    }
  }
  return out;
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
    return { reachable: true, status: response.status, length: text.length, containsIce: /ice|rink|rental/i.test(text) };
  } catch (error) {
    return { reachable: false, status: 0, safeError: safeMessage(error) };
  }
}

function summarizeResponse(response, allowNotFound = false) {
  return {
    status: response.status,
    ok: response.ok || (allowNotFound && response.status === 404),
    found: response.status === 200,
    hash: response.hash,
    expectedNotFound: response.status === 404,
  };
}

function summarizePreflight(report) {
  return {
    shape: report.classification?.['preflight-valid-for-shape'] === true,
    localDraftImport: report.classification?.['preflight-valid-for-local-draft-import'] === true,
    cmsImport: report.classification?.['preflight-valid-for-CMS-import'] === true,
    production: report.classification?.['preflight-valid-for-production'] === true,
    updatedHomeContactPersistenceOk: report.dotNetContract?.updatedHomeContactPersistenceOk === true,
    warningCount: (report.issues || []).filter((issue) => issue.severity === 'warning').length,
    localDraftBlockers: report.blockers?.localDraftImport || [],
  };
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
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le');
  }
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
  fs.writeFileSync(target, value.replace(/\n/g, '\r\n'), 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => /token|jwt|password|secret|connectionString|apiKey|privateKey/i.test(key) ? '[redacted]' : val));
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

function yn(value) {
  return value ? 'yes' : 'no';
}

function abs(file) {
  return path.join(repo, file);
}

function validationLines() {
  const lines = [];
  lines.push(`- API reachable: ${yn(run.serviceReachability.api?.reachable)} HTTP ${run.serviceReachability.api?.status ?? 'n/a'}`);
  lines.push(`- Admin frontend reachable: ${yn(run.serviceReachability.admin3000?.reachable)} HTTP ${run.serviceReachability.admin3000?.status ?? 'n/a'}`);
  lines.push(`- Admin auth: ${run.adminAuth.validation}`);
  lines.push(`- Input JSON parse: ${run.validation.jsonParse?.every((item) => item.ok) ? 'passed' : 'failed'}`);
  lines.push(`- Homepage preflight local draft: ${yn(run.validation.preflight?.homepage?.localDraftImport)}`);
  lines.push(`- Contact preflight local draft: ${yn(run.validation.preflight?.contact?.localDraftImport)}`);
  lines.push(`- .NET updated home/contact contract: ${yn(run.validation.dotnetContract?.ok)}`);
  for (const [name, result] of Object.entries(run.validation.fixtures || {})) {
    lines.push(`- ${name}: ${yn(result.ok)}`);
  }
  lines.push(`- Unsafe HTML/CSS/form/media/email scan: ${yn(run.validation.unsafeRouteSecretScan?.ok)}`);
  return lines;
}

function writeAllReports() {
  run.safety.serviceAreasUpdated = run.untouched.serviceAreasUnchanged === false;
  run.safety.themeRecordsUpdated = run.untouched.themeUnchanged === false;
  run.safety.mediaAssetRecordsUpdated = run.untouched.mediaAssetsUnchanged === false;
  ensureRequiredJsonArtifacts();
  writeJson(files.manifest, run);

  const homeRead = run.readback.homepage || {};
  const contactRead = run.readback.contact || {};

  writeText(`${outRel}/README.md`, `# Ice Updated Home/Contact Post-Repair Reimport\n\nLocal draft-only reimport attempt after the contract persistence repair.\n\n- Import performed: ${yn(run.importPerformed)}\n- Homepage updated: ${yn(run.homepage.updatePerformed)}\n- Contact updated: ${yn(run.contact.updatePerformed)}\n- Admin auth: ${run.adminAuth.validation}\n- Roller: paused/untouched\n`);
  writeText(`${outRel}/PRE_IMPORT_VALIDATION.md`, `# Pre-Import Validation\n\n${validationLines().join('\n')}\n\nPreflight artifacts:\n\n- \`homepage-import-preflight-post-repair.json\`\n- \`contact-import-preflight-post-repair.json\`\n- \`dotnet-updated-home-contact-contract-result.json\`\n`);
  writeText(`${outRel}/BASELINE_SNAPSHOTS.md`, `# Baseline Snapshots\n\n- Homepage snapshot: \`current-homepage-before-post-repair-import.snapshot.json\`\n- Contact snapshot: \`current-contact-before-post-repair-import.snapshot.json\`\n- /service-areas baseline: ${run.baseline.serviceAreas?.expectedNotFound ? 'HTTP 404 expected-not-found' : `HTTP ${run.baseline.serviceAreas?.status ?? 'not-captured'}`}\n- Theme baseline: HTTP ${run.baseline.theme?.status ?? 'not-captured'}\n- MediaAssets baseline: HTTP ${run.baseline.mediaAssets?.status ?? 'not-captured'}\n`);
  writeText(`${outRel}/HOMEPAGE_REIMPORT_RESULT.md`, `# Homepage Reimport Result\n\n- Performed: ${yn(run.homepage.updatePerformed)}\n- Endpoint: \`${run.homepage.endpoint || 'not-used'}\`\n- HTTP status: ${run.homepage.httpStatus ?? 'not-run'}\n- Change source: \`${changeSource}\`\n- Draft/needs_review readback: ${yn(homeRead.checks?.draftNeedsReview)}\n- Revision/rollback result: ${yn(homeRead.checks?.revisionOrRollback)}\n`);
  writeText(`${outRel}/CONTACT_REIMPORT_RESULT.md`, `# Contact Reimport Result\n\n- Performed: ${yn(run.contact.updatePerformed)}\n- Endpoint: \`${run.contact.endpoint || 'not-used'}\`\n- HTTP status: ${run.contact.httpStatus ?? 'not-run'}\n- Change source: \`${changeSource}\`\n- Draft/needs_review readback: ${yn(contactRead.checks?.draftNeedsReview)}\n- Revision/rollback result: ${yn(contactRead.checks?.revisionOrRollback)}\n`);
  writeText(`${outRel}/READBACK_PERSISTENCE_VERIFICATION.md`, `# Readback Persistence Verification\n\n## Homepage\n\n\`\`\`json\n${JSON.stringify(run.readback.homepage || null, null, 2)}\n\`\`\`\n\n## Contact\n\n\`\`\`json\n${JSON.stringify(run.readback.contact || null, null, 2)}\n\`\`\`\n\n## Contact FormBlock\n\n\`\`\`json\n${JSON.stringify(run.readback.formBlock || null, null, 2)}\n\`\`\`\n`);
  writeText(`${outRel}/PRODUCTION_FIELD_PERSISTENCE_RESULT.md`, `# Production Field Persistence Result\n\n## Candidate vs Readback\n\n\`\`\`json\n${JSON.stringify(run.readback.productionFieldPersistence || null, null, 2)}\n\`\`\`\n\n## MediaAsset Persistence\n\n\`\`\`json\n${JSON.stringify(run.readback.mediaAssetPersistence || null, null, 2)}\n\`\`\`\n\n## Readback .NET Contract\n\n\`\`\`json\n${JSON.stringify(run.validation.readbackDotnetContract || null, null, 2)}\n\`\`\`\n`);
  writeText(`${outRel}/UNTOUCHED_ROUTES_VERIFICATION.md`, `# Untouched Routes Verification\n\n- /service-areas unchanged or still 404: ${yn(run.untouched.serviceAreasUnchanged)}\n- /service-areas baseline: ${run.untouched.serviceAreasBaseline || 'not-captured'}\n- /service-areas after: ${run.untouched.serviceAreasAfter || 'not-captured'}\n- Theme unchanged: ${yn(run.untouched.themeUnchanged)}\n- MediaAssets unchanged: ${yn(run.untouched.mediaAssetsUnchanged)}\n- Roller untouched: yes\n`);
  writeText(`${outRel}/FRONTEND_PREVIEW_CHECKLIST.md`, `# Frontend Preview Checklist\n\nFrontend probes are secondary to CMS readback persistence for this run.\n\n- Homepage preview \`${webBase}/__preview/ice-rink-rentals/home\`: HTTP ${run.frontend.homePreview?.status ?? 'not-run'}, reachable ${yn(run.frontend.homePreview?.reachable)}\n- Contact \`${webBase}/contact\`: HTTP ${run.frontend.contact?.status ?? 'not-run'}, reachable ${yn(run.frontend.contact?.reachable)}\n\nDo not use visual approval as a substitute for field persistence.\n`);
  writeText(`${outRel}/REMAINING_BLOCKERS.md`, `# Remaining Blockers\n\n## Run Blockers\n\n${run.blockers.length ? run.blockers.map((blocker) => `- ${blocker}`).join('\n') : '- None for local draft persistence verification.'}\n\n## Before Visual Approval\n\n- Human preview/review still required.\n\n## Before Static Regeneration\n\n- Static regeneration is not authorized.\n- Publish/production approval remains false.\n\n## Before Production/Indexing\n\n- Production approval is not granted.\n- Deployment, DNS, provider/email settings, and public indexing remain out of scope.\n`);
  writeText(files.rootReport, rootReport());
}

function ensureRequiredJsonArtifacts() {
  const placeholders = [
    files.homeSnapshot,
    files.contactSnapshot,
    files.homeReadback,
    files.contactReadback,
  ];
  for (const file of placeholders) {
    if (!fs.existsSync(abs(file))) {
      writeJson(file, {
        status: 'not-captured',
        reason: run.adminAuth.validation === 'MISSING'
          ? 'admin-auth-missing-stopped-before-read-or-write'
          : 'blocked-before-capture',
        cmsWritePerformed: false,
        createdAt: now,
      });
    }
  }
  for (const file of [files.homeWriteResult, files.contactWriteResult]) {
    if (!fs.existsSync(abs(file))) {
      writeJson(file, {
        status: 'not-run',
        cmsWritePerformed: false,
        reason: run.blockers,
        createdAt: now,
      });
    }
  }
}

function rootReport() {
  return `# Pumpkin Ice Updated Home/Contact Post-Repair Reimport Report\n\nCreated: ${run.createdAt}\n\n## Start State\n\nGit status at start:\n\n\`\`\`text\n${run.startState.gitStatusAtRequestStart.join('\n') || 'clean'}\n\`\`\`\n\nRecent log at start:\n\n\`\`\`text\n${run.startState.gitLogAtRequestStart.join('\n')}\n\`\`\`\n\n## Reachability And Auth\n\n- API http://localhost:5064: ${yn(run.serviceReachability.api?.reachable)} HTTP ${run.serviceReachability.api?.status ?? 'n/a'}\n- Admin http://localhost:3000: ${yn(run.serviceReachability.admin3000?.reachable)} HTTP ${run.serviceReachability.admin3000?.status ?? 'n/a'}\n- Frontend http://localhost:3002: ${yn(run.serviceReachability.frontend3002?.reachable)} HTTP ${run.serviceReachability.frontend3002?.status ?? 'n/a'}\n- Auth status: ${run.adminAuth.validation}\n- Temp JWT deleted after load: ${yn(run.adminAuth.tempFileDeleted)}\n- JWT printed: no\n\n## Validation Results\n\n${validationLines().join('\n')}\n\n## Import Performed\n\n- Import performed: ${yn(run.importPerformed)}\n- Homepage update: ${yn(run.homepage.updatePerformed)} HTTP ${run.homepage.httpStatus ?? 'not-run'}\n- Contact update: ${yn(run.contact.updatePerformed)} HTTP ${run.contact.httpStatus ?? 'not-run'}\n- Change source: \`${changeSource}\`\n\n## Revision And Rollback\n\n- Homepage revision/rollback present: ${yn(run.readback.homepage?.checks?.revisionOrRollback)}\n- Contact revision/rollback present: ${yn(run.readback.contact?.checks?.revisionOrRollback)}\n- Homepage last change source: \`${run.readback.homepage?.summary?.lastChangeSource || 'not-recorded'}\`\n- Contact last change source: \`${run.readback.contact?.summary?.lastChangeSource || 'not-recorded'}\`\n\n## Readback Results\n\n- Homepage readback persistence: ${yn(run.readback.homepage?.ok)}\n- Contact readback persistence: ${yn(run.readback.contact?.ok)}\n- Production-field persistence: homepage ${yn(run.readback.productionFieldPersistence?.homepage?.ok)}, contact ${yn(run.readback.productionFieldPersistence?.contact?.ok)}\n- MediaAsset persistence: homepage ${yn(run.readback.mediaAssetPersistence?.homepage?.ok)}, contact ${yn(run.readback.mediaAssetPersistence?.contact?.ok)}\n- selectedMailbox/publicEmailDisplayPolicy persistence: homepage ${yn(run.readback.homepage?.checks?.selectedMailbox && run.readback.homepage?.checks?.publicEmailDisplayPolicy)}, contact ${yn(run.readback.contact?.checks?.selectedMailbox && run.readback.contact?.checks?.publicEmailDisplayPolicy)}\n- Contact formBlock verification: ${yn(run.readback.formBlock?.ok)}\n\n## Untouched Results\n\n- /service-areas unchanged or still 404: ${yn(run.untouched.serviceAreasUnchanged)}\n- Theme unchanged: ${yn(run.untouched.themeUnchanged)}\n- MediaAssets unchanged: ${yn(run.untouched.mediaAssetsUnchanged)}\n- Roller untouched: yes\n- Static regeneration: no\n- Deployment/DNS/email/provider action: no\n- Protected config touched: no\n\n## Frontend Preview\n\n- Homepage preview: HTTP ${run.frontend.homePreview?.status ?? 'not-run'}, reachable ${yn(run.frontend.homePreview?.reachable)}\n- Contact: HTTP ${run.frontend.contact?.status ?? 'not-run'}, reachable ${yn(run.frontend.contact?.reachable)}\n\n## Remaining Blockers Before Visual Approval\n\n- Human visual review still required.\n\n## Remaining Blockers Before Static Regeneration\n\n- Static regeneration is not authorized.\n- Publish/production approval remains false.\n\n## Remaining Blockers Before Production/Indexing\n\n- Production approval is not granted.\n- Deployment, DNS, provider/email settings, and public indexing remain out of scope.\n\n## Run Blockers\n\n${run.blockers.length ? run.blockers.map((blocker) => `- ${blocker}`).join('\n') : '- None.'}\n\n## Next Recommended Action\n\nReview the local draft readback and frontend previews. Static regeneration and production/indexing remain separate approval gates.\n`;
}
