#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const candidateRel = 'content-review/ice-approved-homepage-ppec-logo-binding/APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_CANDIDATE.json';
const packageRel = 'content-review/ice-approved-homepage-ppec-logo-binding/APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_PACKAGE.json';
const outputRel = 'content-review/ice-approved-homepage-local-draft-import';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_APPROVED_HOMEPAGE_LOCAL_DRAFT_IMPORT_REPORT.md';
const rootReportPath = path.join(repoRoot, rootReportRel);
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const changeSource = 'approved_phase8k_to_phase10a_homepage_import';
const expectedPpecMediaAssetId = 'ice-rink-rentals-ppec-wordmark-card-d28c10b570d1';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const generatedAt = new Date().toISOString();

const startGitStatus = run('git', ['status', '--short']).stdout.trim();
const expectedOutputPrefixes = [
  `${outputRel}/`,
  rootReportRel,
].map((item) => item.replace(/\\/g, '/'));

const state = {
  schemaVersion: 'pumpkin.ice.approved-homepage.local-draft-import.v1',
  generatedAt,
  tenantId,
  siteKey,
  selectedCandidatePath: candidateRel,
  selectedPackagePath: packageRel,
  outputFolder: outputRel,
  rootReport: rootReportRel,
  start: {
    gitStatusShort: startGitStatus,
    gitLogOneline12: run('git', ['log', '--oneline', '-12']).stdout.trim(),
    dirtyGate: classifyDirtyGate(startGitStatus),
    api: { reachable: false },
    frontend: { reachable: false, checked: false },
    candidateExists: existsSync(path.join(repoRoot, candidateRel)),
    packageExists: existsSync(path.join(repoRoot, packageRel)),
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    loadedFrom: 'none',
    validation: 'MISSING',
    tokenPrinted: false,
    tempDeletedAfterSuccess: false,
    tempRetainedOnFailure: false,
    tempFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  validation: {
    run: false,
    results: {},
    blockers: [],
  },
  baselines: {
    captured: false,
    homepage: null,
    contact: null,
    serviceAreas: null,
    theme: null,
    mediaAssets: null,
    blockers: [],
  },
  import: {
    performed: false,
    skippedReason: '',
    endpoint: '',
    changeSource,
    httpStatus: null,
    result: null,
  },
  readback: {
    performed: false,
    homepage: null,
    verification: {},
    blockers: [],
  },
  untouched: {
    contact: { verified: false },
    serviceAreas: { verified: false },
    theme: { verified: false },
    mediaAssets: { verified: false },
  },
  frontend: {
    preview: { checked: false },
    publicRoute: { checked: false },
  },
  hygiene: {
    results: {},
    blockers: [],
  },
  guardrails: [
    'Homepage route / only.',
    'Local CMS only.',
    'Draft/needs_review only.',
    'No /contact update.',
    'No /service-areas update.',
    'No /state-city creation.',
    'No Theme record update.',
    'No MediaAsset record update.',
    'No static regeneration.',
    'No deploy, DNS, email provider, Azure, Cloudflare, or Bluehost action.',
    'No email sent.',
    'No protected config read or modified.',
    'No secrets, JWTs, tokens, credentials, connection strings, SMTP secrets, storage keys, or provider credentials printed.',
    'Roller remains paused.',
  ],
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  let token = '';
  try {
    state.start.api = await probe(apiBase);
    state.start.frontend = await probe(`${webBase}/`);

    token = loadToken();
    await validateAuth(token);

    await runPreImportValidation();
    if (token) await captureBaselines(token);

    if (!state.start.dirtyGate.ok) {
      state.import.skippedReason = `Dirty worktree at start: ${state.start.dirtyGate.blockingEntries.join('; ')}`;
      state.blockers.push(state.import.skippedReason);
    }

    if (state.validation.blockers.length > 0) {
      state.import.skippedReason ||= 'Pre-import validation blockers are present.';
      state.blockers.push(...state.validation.blockers);
    }

    if (state.baselines.blockers.length > 0) {
      state.import.skippedReason ||= 'Read-only baseline blockers are present.';
      state.blockers.push(...state.baselines.blockers);
    }

    if (!token || state.auth.validation !== 'VALID') {
      state.import.skippedReason ||= 'Admin auth is not valid.';
      state.blockers.push('Admin auth is not valid.');
    }

    if (state.blockers.length === 0) {
      await importHomepageDraft(token);
      await verifyPostWrite(token);
      await probeFrontend();
    } else {
      state.import.performed = false;
      state.import.endpoint = 'not-used';
      writeJson(path.join(outputDir, 'homepage-readback-after-approved-import.json'), {
        status: 'not-performed',
        reason: state.import.skippedReason || 'Blocked before CMS write.',
        cmsWritePerformed: false,
        route: '/',
        rollerStatus: 'paused',
      });
    }

    runHygieneChecks();
    state.success = state.import.performed === true &&
      state.blockers.length === 0 &&
      state.validation.blockers.length === 0 &&
      state.readback.blockers.length === 0 &&
      state.hygiene.blockers.length === 0;

    if (state.success && state.auth.loadedFrom === 'temp' && existsSync(tempJwtPath)) {
      rmSync(tempJwtPath, { force: true });
      state.auth.tempDeletedAfterSuccess = true;
    }
  } catch (error) {
    state.blockers.push(safePreview(error?.message || error));
  } finally {
    if (!state.success) {
      state.auth.tempRetainedOnFailure = existsSync(tempJwtPath);
    }
    state.auth.tempFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
    writeOutputs();
    printSummary();
    if (!state.success) process.exitCode = 1;
  }
}

function classifyDirtyGate(statusText) {
  const entries = statusText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const blockingEntries = entries.filter((line) => {
    const file = line.replace(/^[ MADRCU?!]{1,2}\s+/, '').replace(/\\/g, '/');
    return !expectedOutputPrefixes.some((prefix) => file === prefix || file.startsWith(prefix));
  });
  return {
    ok: blockingEntries.length === 0,
    entryCount: entries.length,
    blockingEntries,
    allowedOnlyThisRunOutputs: blockingEntries.length === 0,
  };
}

async function validateAuth(token) {
  if (!token) {
    state.auth.validation = 'MISSING';
    return;
  }
  const response = await fetchJson('/api/auth/verify', { token });
  state.auth.validation = response.ok ? 'VALID' : 'INVALID';
  state.auth.validationHttpStatus = response.status;
}

function loadToken() {
  const envToken = process.env.PUMPKIN_ADMIN_JWT?.trim();
  if (envToken) {
    state.auth.loadedFrom = 'env';
    return envToken;
  }
  if (existsSync(tempJwtPath)) {
    state.auth.loadedFrom = 'temp';
    return readFileSync(tempJwtPath, 'utf8').trim();
  }
  state.auth.loadedFrom = 'none';
  return '';
}

async function runPreImportValidation() {
  state.validation.run = true;
  const candidatePath = path.join(repoRoot, candidateRel);
  const packagePath = path.join(repoRoot, packageRel);

  writeValidation('json-parse-validation-result.json', jsonParseValidation([candidatePath, packagePath]));
  writeValidation('route-canonical-audit-result.json', routeCanonicalAudit(candidatePath));
  writeValidation('unsafe-scan-result.json', unsafeScan([candidatePath, packagePath]));
  writeValidation('contactus-scan-result.json', stringScan([candidatePath, packagePath], legacyMailbox));
  writeValidation('targeted-secret-scan-result.json', secretScan([candidatePath, packagePath]));
  runImportPreflight();
  runDotNetContract(candidatePath);
  runContractPersistence(candidatePath);
  runSimpleCommand('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const required = [
    'json-parse-validation-result.json',
    'route-canonical-audit-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'homepage-import-preflight-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
  ];
  for (const name of required) {
    if (state.validation.results[name]?.ok !== true) {
      state.validation.blockers.push(`${name} failed.`);
    }
  }
}

function jsonParseValidation(files) {
  const results = files.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8'));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: safePreview(error.message) };
    }
  });
  return { ok: results.every((item) => item.ok), generatedAt: new Date().toISOString(), results };
}

function routeCanonicalAudit(candidatePath) {
  const candidate = readJson(candidatePath);
  const text = JSON.stringify(candidate);
  const workflow = candidate.workflow || {};
  const staticPublishing = candidate.staticPublishing || {};
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    pageSlug: candidate.pageSlug === 'home',
    route: candidate.route === '/',
    canonical: candidate.canonicalUrl === 'https://iceskatingrinkrentals.com/' || candidate.seo?.canonicalUrl === 'https://iceskatingrinkrentals.com/',
    draft: candidate.isPublished === false && (workflow.status === 'draft' || candidate.workflowStatus === 'draft'),
    needsReview: workflow.reviewStatus === 'needs_review' || text.includes('needs_review'),
    productionApprovedFalse: candidate.productionApproved !== true && workflow.productionApproved !== true && staticPublishing.productionApproved !== true,
    publishApprovedFalse: candidate.publishApproved !== true && workflow.publishApproved !== true && workflow.approvedForPublish !== true,
    staticNeedsRebuild: staticPublishing.needsRebuild === true,
    ppecMediaAssetId: text.includes(expectedPpecMediaAssetId),
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailPolicy: text.includes('form-first-under-review'),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noServingEastCoastClaim: !/Serving the East Coast/i.test(text),
    noFakePhone: !/(?:555[-.\s]?|123[-.\s]?456|000[-.\s]?000)/.test(text),
    noRawWordPressRuntime: !/contact-form-7|wpcf7|wp-json|wp-content/i.test(text),
    noBase64Images: !/data:image\/|base64/i.test(text),
    noRandomExternalImages: !/https:\/\/(?:images\.unsplash\.com|picsum\.photos|placehold\.co|via\.placeholder\.com)/i.test(text),
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
    ['encoded-image-marker', /\bbase64\b/i],
    ['raw-form', /<form\b/i],
    ['raw-input', /<input\b/i],
    ['raw-textarea', /<textarea\b/i],
    ['raw-select', /<select\b/i],
    ['mail-link', /mailto:/i],
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
  const hits = [];
  for (const file of files) {
    if (readFileSync(file, 'utf8').includes(needle)) hits.push({ path: rel(file) });
  }
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
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: rel(file), code });
    }
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function runImportPreflight() {
  const output = path.join(outputDir, 'homepage-import-preflight-result.json');
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', '/',
    '--mode', 'preflight-only',
    '--output', rel(output),
  ], 180000);
  const parsed = existsSync(output) ? readJson(output) : {};
  const ok = parsed.classification?.['preflight-valid-for-shape'] === true &&
    parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.ok = ok;
  parsed.command = commandSummary(result);
  writeValidation('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-approved-home-import-contract-${process.pid}-${Date.now()}`);
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
  ], 240000);
  const dll = path.join(publishDir, 'Pumpkin.PageContractTool.dll');
  const validate = publish.status === 0 && existsSync(dll)
    ? run('dotnet', [dll, 'validate-page', '--path', candidatePath], 180000)
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
  ], 120000);
  const parsed = existsSync(output) ? readJson(output) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  writeValidation('contract-persistence-validation-result.json', parsed);
}

function runSimpleCommand(name, args) {
  const result = run(args[0], args.slice(1), 180000);
  const parsed = parseJson(result.stdout.trim());
  const ok = inferOk(parsed, result);
  writeValidation(name, {
    ok,
    generatedAt: new Date().toISOString(),
    command: commandSummary(result),
    parsed,
  });
}

async function captureBaselines(token) {
  state.baselines.captured = true;
  const homepage = await fetchJson(`/api/admin/pages/${tenantId}/home`, { token }, true);
  const contact = await fetchJson(`/api/admin/pages/${tenantId}/contact`, { token }, true);
  const serviceAreas = await fetchJson(`/api/admin/pages/${tenantId}/service-areas`, { token }, true);
  const theme = await fetchJson(`/api/admin/themes/${tenantId}`, { token }, true);
  const mediaAssets = await fetchJson(`/api/admin/${tenantId}/media-assets`, { token }, true);
  state.baselines.homepage = summarizeSnapshot(homepage);
  state.baselines.contact = summarizeSnapshot(contact);
  state.baselines.serviceAreas = summarizeSnapshot(serviceAreas, true);
  state.baselines.theme = summarizeSnapshot(theme);
  state.baselines.mediaAssets = summarizeSnapshot(mediaAssets);

  if (!homepage.ok) state.baselines.blockers.push('Unable to fetch current homepage baseline.');
  if (!contact.ok) state.baselines.blockers.push('Unable to fetch /contact baseline.');
  if (!(serviceAreas.status === 404 || serviceAreas.ok)) state.baselines.blockers.push('Unable to establish /service-areas baseline.');
  if (!theme.ok) state.baselines.blockers.push('Unable to fetch Theme baseline.');
  if (!mediaAssets.ok) state.baselines.blockers.push('Unable to fetch MediaAssets baseline.');

  writeJson(path.join(outputDir, 'current-homepage-before-approved-import.snapshot.json'), sanitize(homepage.data || {
    status: 'not-captured',
    httpStatus: homepage.status,
  }));
  writeJson(path.join(outputDir, 'contact-before-approved-import.snapshot.json'), sanitize(contact.data || { status: 'not-found', httpStatus: contact.status }));
  writeJson(path.join(outputDir, 'service-areas-before-approved-import.snapshot.json'), sanitize(serviceAreas.data || { status: serviceAreas.status === 404 ? 'expected-not-found' : 'not-captured', httpStatus: serviceAreas.status }));
  writeJson(path.join(outputDir, 'theme-before-approved-import.snapshot.json'), sanitize(theme.data || { status: 'not-captured', httpStatus: theme.status }));
}

async function importHomepageDraft(token) {
  const before = readJson(path.join(outputDir, 'current-homepage-before-approved-import.snapshot.json'));
  const candidate = readJson(path.join(repoRoot, candidateRel));
  const payload = prepareHomepagePayload(candidate, before);
  const query = new URLSearchParams({
    changeSource,
    changeSummary: 'Approved Phase 8K-to-Phase10A PPEC-bound homepage-only local draft import; no publish, static generation, theme, media, contact, service-area, provider, or email action.',
  });
  const response = await fetchJson(`/api/admin/pages/${tenantId}/home?${query}`, {
    token,
    method: 'PUT',
    body: JSON.stringify(payload),
    contentType: 'application/json',
  });
  state.import.performed = response.ok;
  state.import.endpoint = `PUT /api/admin/pages/${tenantId}/home?changeSource=${changeSource}`;
  state.import.httpStatus = response.status;
  state.import.result = summarizePage(response.data);
  if (!response.ok) {
    state.blockers.push(`Homepage PUT failed with HTTP ${response.status}.`);
  }
}

function prepareHomepagePayload(candidate, existingPage) {
  const page = JSON.parse(JSON.stringify(candidate));
  const existingId = existingPage?.pageId || existingPage?.PageId || existingPage?.id || page.pageId || page.PageId || page.id || 'ice-rink-rentals-home';
  page.id = existingId;
  page.PageId = existingId;
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.pageSlug = 'home';
  page.slug = 'home';
  page.route = '/';
  page.path = '/';
  page.isPublished = false;
  page.includeInSitemap = false;
  page.publishedAt = null;
  page.workflow = page.workflow || {};
  page.workflow.status = 'draft';
  page.workflow.reviewStatus = 'needs_review';
  page.workflow.approvedForPublish = false;
  page.workflow.approvedForImport = false;
  page.workflow.productionApproved = false;
  page.workflow.publishApproved = false;
  page.productionApproved = false;
  page.publishApproved = false;
  page.staticPublishing = page.staticPublishing || {};
  page.staticPublishing.needsRebuild = true;
  page.staticPublishing.staticEligible = false;
  page.staticPublishing.productionApproved = false;
  return page;
}

async function verifyPostWrite(token) {
  if (!state.import.performed) return;
  const homepage = await fetchJson(`/api/admin/pages/${tenantId}/home`, { token }, true);
  const contact = await fetchJson(`/api/admin/pages/${tenantId}/contact`, { token }, true);
  const serviceAreas = await fetchJson(`/api/admin/pages/${tenantId}/service-areas`, { token }, true);
  const theme = await fetchJson(`/api/admin/themes/${tenantId}`, { token }, true);
  const mediaAssets = await fetchJson(`/api/admin/${tenantId}/media-assets`, { token }, true);
  state.readback.performed = homepage.ok;
  state.readback.homepage = summarizePage(homepage.data);
  writeJson(path.join(outputDir, 'homepage-readback-after-approved-import.json'), sanitize(homepage.data || { status: 'readback-failed', httpStatus: homepage.status }));

  const beforeHome = readJson(path.join(outputDir, 'current-homepage-before-approved-import.snapshot.json'));
  const text = JSON.stringify(homepage.data || {});
  const mediaIds = collectMediaIds(homepage.data);
  const readbackMediaAssetIds = collectIdsByKey(homepage.data, 'mediaAssetId');
  const knownMediaAssetIds = collectKnownMediaAssetIds(mediaAssets.data);
  const revisionBefore = Number(beforeHome.revision?.revisionNumber || beforeHome.Revision?.RevisionNumber || beforeHome.PageVersion || 0);
  const revisionAfter = Number(homepage.data?.revision?.revisionNumber || homepage.data?.Revision?.RevisionNumber || homepage.data?.PageVersion || 0);
  const page = homepage.data || {};
  const workflow = page.workflow || {};
  const staticPublishing = page.staticPublishing || {};
  state.readback.verification = {
    route: page.route === '/' || page.pageSlug === 'home',
    draftNeedsReview: page.isPublished === false && workflow.status === 'draft' && workflow.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true && workflow.productionApproved !== true && staticPublishing.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true && workflow.publishApproved !== true && workflow.approvedForPublish !== true,
    revisionIncrementedOrRollbackExists: revisionAfter > revisionBefore || Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable),
    approvedPhase8kContentPersisted: /portable ice rink|winter|rink rentals/i.test(text),
    ppecSectionPersisted: /Party Pros East Coast|PPEC/i.test(text),
    ppecLogoPersisted: text.includes(expectedPpecMediaAssetId),
    ppecCopyCtaPersisted: /Party Pros East Coast/i.test(text) && /event|rental|party|pros/i.test(text),
    noGenericServingEastCoastClaim: !/Serving the East Coast/i.test(text),
    mediaAssetIdsOfficial: readbackMediaAssetIds.length > 0 &&
      readbackMediaAssetIds.every((id) => id.startsWith('ice-rink-rentals-') && knownMediaAssetIds.has(id)),
    productionFieldsPersist: staticPublishing.needsRebuild === true,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes('form-first-under-review'),
    noLegacyMailbox: !text.includes(legacyMailbox),
    formBlockPresent: /formBlock/i.test(text),
  };
  for (const [key, ok] of Object.entries(state.readback.verification)) {
    if (!ok) state.readback.blockers.push(`Readback verification failed: ${key}.`);
  }

  state.untouched.contact = compareUnchanged('contact', state.baselines.contact, contact);
  state.untouched.serviceAreas = compareUnchanged('serviceAreas', state.baselines.serviceAreas, serviceAreas, true);
  state.untouched.theme = compareUnchanged('theme', state.baselines.theme, theme);
  state.untouched.mediaAssets = compareUnchanged('mediaAssets', state.baselines.mediaAssets, mediaAssets);
  for (const result of Object.values(state.untouched)) {
    if (result.verified === false) state.readback.blockers.push(result.blocker || 'Untouched verification failed.');
  }
  state.blockers.push(...state.readback.blockers);
}

async function probeFrontend() {
  state.frontend.preview = await probe(`${webBase}/__preview/${tenantId}/home`);
  state.frontend.publicRoute = await probe(`${webBase}/`);
}

function compareUnchanged(label, before, after, allow404 = false) {
  const afterSummary = summarizeSnapshot(after, allow404);
  const before404 = before?.status === 404;
  const verified = before404 && allow404
    ? afterSummary.status === 404
    : before?.ok === true && afterSummary.ok === true && before.hash === afterSummary.hash;
  return {
    label,
    verified,
    before,
    after: afterSummary,
    blocker: verified ? '' : `${label} changed or could not be verified unchanged.`,
  };
}

function summarizeSnapshot(response, allow404 = false) {
  const ok = response.ok || (allow404 && response.status === 404);
  return {
    ok,
    status: response.status,
    state: response.status === 404 && allow404 ? 'expected-not-found' : response.ok ? 'reachable' : 'unexpected-status',
    hash: response.data ? sha256(stableStringify(sanitize(response.data))) : null,
  };
}

function summarizePage(page) {
  if (!page || typeof page !== 'object') return { found: false };
  const workflow = page.workflow || {};
  const staticPublishing = page.staticPublishing || {};
  const revision = page.revision || {};
  return {
    found: true,
    id: page.id || page.PageId || page.pageId || '',
    tenantId: page.tenantId || '',
    siteKey: page.siteKey || '',
    pageSlug: page.pageSlug || '',
    route: page.route || page.path || '',
    isPublished: page.isPublished === true,
    includeInSitemap: page.includeInSitemap === true,
    workflowStatus: workflow.status || '',
    reviewStatus: workflow.reviewStatus || '',
    productionApproved: page.productionApproved === true || workflow.productionApproved === true || staticPublishing.productionApproved === true,
    publishApproved: page.publishApproved === true || workflow.publishApproved === true || workflow.approvedForPublish === true,
    needsRebuild: staticPublishing.needsRebuild === true,
    staticEligible: staticPublishing.staticEligible === true,
    revisionNumber: revision.revisionNumber || null,
    rollbackAvailable: revision.rollbackAvailable === true || Boolean(revision.latestSnapshot),
    lastChangeSource: revision.lastChangeSource || '',
    mediaAssetIds: collectMediaIds(page),
    selectedMailbox: page.domainRouting?.selectedMailbox || '',
    publicEmailDisplayPolicy: page.domainRouting?.publicEmailDisplayPolicy || '',
  };
}

function collectMediaIds(value, ids = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaIds(item, ids));
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if ((key === 'mediaAssetId' || key === 'assetId') && typeof nested === 'string' && nested.trim()) ids.add(nested.trim());
      collectMediaIds(nested, ids);
    }
  }
  return [...ids].sort();
}

function collectIdsByKey(value, keyName, ids = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIdsByKey(item, keyName, ids));
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (key === keyName && typeof nested === 'string' && nested.trim()) ids.add(nested.trim());
      collectIdsByKey(nested, keyName, ids);
    }
  }
  return [...ids].sort();
}

function collectKnownMediaAssetIds(mediaAssetsResponse) {
  const items = Array.isArray(mediaAssetsResponse?.mediaAssets)
    ? mediaAssetsResponse.mediaAssets
    : Array.isArray(mediaAssetsResponse)
      ? mediaAssetsResponse
      : [];
  return new Set(items.map((item) => item?.id || item?.Id).filter(Boolean));
}

function runHygieneChecks() {
  const diffCheck = run('git', ['diff', '--check'], 60000);
  recordHygiene('git-diff-check-result.json', {
    ok: diffCheck.status === 0,
    generatedAt: new Date().toISOString(),
    command: commandSummary(diffCheck),
  });
  recordHygiene('protected-generated-raw-artifact-check-result.json', artifactPathCheck());
  recordHygiene('staged-raw-artifact-check-result.json', stagedRawArtifactCheck());
}

function artifactPathCheck() {
  const status = run('git', ['status', '--short', '--untracked-files=all'], 60000);
  const lines = status.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  return {
    ok: protectedHits.length === 0 && generatedHits.length === 0,
    generatedAt: new Date().toISOString(),
    protectedHits,
    generatedHits,
    rawInputFolderPresent: lines.some((line) => line.includes('content-review/ice-approved-homepage-conversion-input/')),
    command: commandSummary(status),
  };
}

function stagedRawArtifactCheck() {
  const cached = run('git', ['diff', '--cached', '--name-only'], 60000);
  const staged = cached.stdout.split(/\r?\n/).filter(Boolean);
  const rawHits = staged.filter((file) => /\.(zip|png|jpe?g|gif|webp|mp4|mov|avi|psd|ai)$/i.test(file));
  const extractedHits = staged.filter((file) => file.includes('content-review/ice-approved-homepage-conversion-input/extracted/'));
  const staticHits = staged.filter((file) => /(^|[/\\])(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(file));
  return {
    ok: rawHits.length === 0 && extractedHits.length === 0 && staticHits.length === 0,
    generatedAt: new Date().toISOString(),
    stagedRawMediaOrZipHits: rawHits,
    stagedExtractedInputHits: extractedHits,
    stagedStaticArtifactHits: staticHits,
    stagedCount: staged.length,
    command: commandSummary(cached),
  };
}

function writeOutputs() {
  if (!existsSync(path.join(outputDir, 'homepage-readback-after-approved-import.json'))) {
    writeJson(path.join(outputDir, 'homepage-readback-after-approved-import.json'), {
      status: 'not-performed',
      cmsWritePerformed: false,
      route: '/',
      rollerStatus: 'paused',
    });
  }

  writeText(path.join(outputDir, 'README.md'), renderReadme());
  writeText(path.join(outputDir, 'PRE_IMPORT_VALIDATION.md'), renderPreImportValidation());
  writeText(path.join(outputDir, 'BASELINE_SNAPSHOTS.md'), renderBaselineSnapshots());
  writeText(path.join(outputDir, 'HOMEPAGE_IMPORT_RESULT.md'), renderHomepageImportResult());
  writeText(path.join(outputDir, 'HOMEPAGE_READBACK_VERIFICATION.md'), renderHomepageReadbackVerification());
  writeText(path.join(outputDir, 'PPEC_LOGO_PERSISTENCE_VERIFICATION.md'), renderPpecVerification());
  writeText(path.join(outputDir, 'UNTOUCHED_ROUTES_VERIFICATION.md'), renderUntouchedVerification());
  writeText(path.join(outputDir, 'FRONTEND_PREVIEW_CHECKLIST.md'), renderFrontendChecklist());
  writeText(path.join(outputDir, 'AUTH_LIFECYCLE_RESULT.md'), renderAuthLifecycle());
  writeText(path.join(outputDir, 'REMAINING_BLOCKERS.md'), renderRemainingBlockers());

  const trailing = trailingWhitespaceScan([
    path.join(outputDir, 'README.md'),
    path.join(outputDir, 'PRE_IMPORT_VALIDATION.md'),
    path.join(outputDir, 'BASELINE_SNAPSHOTS.md'),
    path.join(outputDir, 'HOMEPAGE_IMPORT_RESULT.md'),
    path.join(outputDir, 'HOMEPAGE_READBACK_VERIFICATION.md'),
    path.join(outputDir, 'PPEC_LOGO_PERSISTENCE_VERIFICATION.md'),
    path.join(outputDir, 'UNTOUCHED_ROUTES_VERIFICATION.md'),
    path.join(outputDir, 'FRONTEND_PREVIEW_CHECKLIST.md'),
    path.join(outputDir, 'AUTH_LIFECYCLE_RESULT.md'),
    path.join(outputDir, 'REMAINING_BLOCKERS.md'),
    rootReportPath,
  ].filter(existsSync));
  recordHygiene('trailing-whitespace-scan-result.json', trailing);

  writeJson(path.join(outputDir, 'manifest.json'), state);
  writeText(rootReportPath, renderRootReport());
}

function renderReadme() {
  return `# Ice Approved Homepage Local Draft Import

Status: ${state.success ? 'completed' : 'blocked before CMS write'}.

- Selected candidate: \`${candidateRel}\`
- Import performed: ${yesNo(state.import.performed)}
- Route: \`/\`
- Change source: \`${changeSource}\`
- Roller: paused

No \`/contact\`, \`/service-areas\`, \`/state-city\`, Theme, MediaAsset, static regeneration, deploy, DNS, provider, email, protected config, or Roller write was performed.
`;
}

function renderPreImportValidation() {
  return `# Pre-Import Validation

${Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Not run.'}

Validation blockers:

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`;
}

function renderBaselineSnapshots() {
  return `# Baseline Snapshots

- Homepage baseline captured: ${yesNo(Boolean(state.baselines.homepage))}
- Contact baseline: ${state.baselines.contact?.state || 'not-captured'}, HTTP ${state.baselines.contact?.status ?? 'n/a'}
- Service areas baseline: ${state.baselines.serviceAreas?.state || 'not-captured'}, HTTP ${state.baselines.serviceAreas?.status ?? 'n/a'}
- Theme baseline: ${state.baselines.theme?.state || 'not-captured'}, HTTP ${state.baselines.theme?.status ?? 'n/a'}
- MediaAssets baseline: ${state.baselines.mediaAssets?.state || 'not-captured'}, HTTP ${state.baselines.mediaAssets?.status ?? 'n/a'}

Snapshot file:

- \`current-homepage-before-approved-import.snapshot.json\`

Baseline blockers:

${state.baselines.blockers.length ? state.baselines.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`;
}

function renderHomepageImportResult() {
  return `# Homepage Import Result

- Import performed: ${yesNo(state.import.performed)}
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- Change source: \`${changeSource}\`
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Skipped reason: ${state.import.skippedReason || 'not-applicable'}

The homepage PUT was skipped unless every pre-write gate passed.
`;
}

function renderHomepageReadbackVerification() {
  return `# Homepage Readback Verification

- Readback performed: ${yesNo(state.readback.performed)}
- Readback file: \`homepage-readback-after-approved-import.json\`

${Object.entries(state.readback.verification).map(([key, value]) => `- ${key}: ${yesNo(value)}`).join('\n') || '- Not performed because the CMS write was skipped.'}

Readback blockers:

${state.readback.blockers.length ? state.readback.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`;
}

function renderPpecVerification() {
  const verification = state.readback.verification;
  if (!state.import.performed) {
    return `# PPEC Logo Persistence Verification

- Expected MediaAsset ID: \`${expectedPpecMediaAssetId}\`
- Homepage write performed: no
- PPEC logo persistence verification: not run because the homepage CMS write was blocked before PUT.
- PPEC copy/CTA persistence verification: not run because the homepage CMS write was blocked before PUT.
- Selected mailbox persistence verification: not run because the homepage CMS write was blocked before PUT.
- Public email display policy persistence verification: not run because the homepage CMS write was blocked before PUT.
`;
  }
  return `# PPEC Logo Persistence Verification

- Expected MediaAsset ID: \`${expectedPpecMediaAssetId}\`
- Homepage write performed: ${yesNo(state.import.performed)}
- PPEC logo persisted on readback: ${yesNo(verification.ppecLogoPersisted)}
- PPEC section/callout persisted on readback: ${yesNo(verification.ppecSectionPersisted)}
- PPEC copy/CTA persisted on readback: ${yesNo(verification.ppecCopyCtaPersisted)}
- Selected mailbox persisted: ${yesNo(verification.selectedMailbox)}
- Public email display policy persisted: ${yesNo(verification.publicEmailDisplayPolicy)}
- Legacy contact mailbox absent: ${yesNo(verification.noLegacyMailbox)}
`;
}

function renderUntouchedVerification() {
  if (!state.import.performed) {
    return `# Untouched Routes Verification

- /contact write performed: no
- /service-areas write performed: no
- Theme write performed: no
- MediaAsset write performed: no
- Post-write unchanged comparison: not run because the homepage CMS write was blocked before PUT.
- /contact baseline: ${state.baselines.contact?.state || 'not-captured'}, HTTP ${state.baselines.contact?.status ?? 'n/a'}
- /service-areas baseline: ${state.baselines.serviceAreas?.state || 'not-captured'}, HTTP ${state.baselines.serviceAreas?.status ?? 'n/a'}
- Theme baseline: ${state.baselines.theme?.state || 'not-captured'}, HTTP ${state.baselines.theme?.status ?? 'n/a'}
- MediaAssets baseline: ${state.baselines.mediaAssets?.state || 'not-captured'}, HTTP ${state.baselines.mediaAssets?.status ?? 'n/a'}
`;
  }
  return `# Untouched Routes Verification

- /contact write performed: no
- /contact unchanged verification: ${yesNo(state.untouched.contact.verified)}
- /service-areas write performed: no
- /service-areas unchanged or still 404 verification: ${yesNo(state.untouched.serviceAreas.verified)}
- Theme write performed: no
- Theme unchanged verification: ${yesNo(state.untouched.theme.verified)}
- MediaAsset write performed: no
- MediaAssets unchanged verification: ${yesNo(state.untouched.mediaAssets.verified)}

When the homepage write is skipped, untouched verification is limited to no write attempted plus captured baseline status.
`;
}

function renderFrontendChecklist() {
  return `# Frontend Preview Checklist

- Frontend root reachable at start: ${yesNo(state.start.frontend.reachable)}
- Draft preview URL: \`${webBase}/__preview/${tenantId}/home\`
- Draft preview probe performed after write: ${yesNo(state.frontend.preview.checked)}
- Public route probe performed after write: ${yesNo(state.frontend.publicRoute.checked)}

Public \`/\` is not treated as the draft preview.
`;
}

function renderAuthLifecycle() {
  return `# Auth Lifecycle Result

- PUMPKIN_ADMIN_JWT: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after success: ${yesNo(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yesNo(state.auth.tempRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempFinalStatus}
`;
}

function renderRemainingBlockers() {
  const runBlockers = unique([...state.blockers, ...state.hygiene.blockers]);
  return `# Remaining Blockers

Run blockers:

${runBlockers.length ? runBlockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Before static regeneration:

- Manual browser preview review is required.
- Static regeneration must be separately authorized.
- \`staticPublishing.staticEligible\` remains false.

Before production/indexing:

- Production approval remains false.
- Publish approval remains false.
- Production/indexing must be separately authorized.
`;
}

function renderRootReport() {
  const runBlockers = unique([...state.blockers, ...state.hygiene.blockers]);
  return `# Pumpkin Ice Approved Homepage Local Draft Import Report

## Status

${state.success ? 'Completed successfully.' : 'Blocked before CMS write.'}

## Start State

Git status at start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12}
\`\`\`

- Dirty gate passed: ${yesNo(state.start.dirtyGate.ok)}
- Dirty gate blockers: ${state.start.dirtyGate.blockingEntries.length ? state.start.dirtyGate.blockingEntries.join('; ') : 'none'}
- API reachable: ${yesNo(state.start.api.reachable)}, HTTP ${state.start.api.status ?? 'n/a'}
- Ice frontend reachable if running: ${yesNo(state.start.frontend.reachable)}, HTTP ${state.start.frontend.status ?? 'n/a'}
- Candidate exists: ${yesNo(state.start.candidateExists)}
- Package exists: ${yesNo(state.start.packageExists)}

## Auth

- PUMPKIN_ADMIN_JWT: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth validation: ${state.auth.validation}
- Temp JWT final status: ${state.auth.tempFinalStatus}
- JWT printed: no

## Selected Candidate

\`${candidateRel}\`

## Validation Results

${Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Not run.'}

## Import Result

- Import performed: ${yesNo(state.import.performed)}
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- Change source: \`${changeSource}\`
- Homepage update result: ${state.import.performed ? 'performed' : 'not performed'}
- Revision/rollback result: ${state.readback.verification.revisionIncrementedOrRollbackExists === true ? 'passed' : 'not verified'}
- Homepage readback result: ${state.readback.performed ? 'performed' : 'not performed'}

## Persistence Verification

- PPEC logo persistence result: ${state.import.performed ? yesNo(state.readback.verification.ppecLogoPersisted) : 'not verified; import not performed'}
- PPEC copy/CTA persistence result: ${state.import.performed ? yesNo(state.readback.verification.ppecCopyCtaPersisted) : 'not verified; import not performed'}
- Production-field persistence result: ${state.import.performed ? yesNo(state.readback.verification.productionFieldsPersist) : 'not verified; import not performed'}
- MediaAsset verification: ${state.import.performed ? yesNo(state.readback.verification.mediaAssetIdsOfficial) : 'not verified; import not performed'}
- Legacy mailbox scan result: ${state.validation.results['contactus-scan-result.json']?.ok === true ? 'passed' : 'failed'}

## Untouched Verification

- /contact untouched result: ${state.import.performed ? yesNo(state.untouched.contact.verified) : 'not compared; no homepage write performed'}
- /service-areas untouched result: ${state.import.performed ? yesNo(state.untouched.serviceAreas.verified) : 'not compared; no homepage write performed'}
- Theme untouched result: ${state.import.performed ? yesNo(state.untouched.theme.verified) : 'not compared; no homepage write performed'}
- MediaAssets unchanged result: ${state.import.performed ? yesNo(state.untouched.mediaAssets.verified) : 'not compared; no homepage write performed'}

## Frontend Preview

- Frontend preview result: ${state.frontend.preview.checked ? JSON.stringify(state.frontend.preview) : 'not probed because import was not performed'}

## Hygiene Checks

${Object.entries(state.hygiene.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Not run.'}

## Guardrails

${state.guardrails.map((item) => `- ${item}`).join('\n')}

## Remaining Blockers

${runBlockers.length ? runBlockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Before static regeneration:

- Manual browser preview review is required.
- Static regeneration must be separately authorized.
- \`staticPublishing.staticEligible\` remains false.

Before production/indexing:

- Production approval remains false.
- Publish approval remains false.
- Production/indexing must be separately authorized.

## Next Recommended Action

${state.success
  ? 'Open the local draft preview for manual browser review. Static regeneration, production approval, deployment, DNS/email/provider changes, and Roller work remain out of scope until separately authorized.'
  : 'Clear or commit any dirty-gate blockers, then rerun the homepage-only local draft import with fresh valid auth.'}
`;
}

function writeValidation(name, value) {
  writeJson(path.join(outputDir, name), value);
  state.validation.results[name] = { ok: value.ok === true, path: `${outputRel}/${name}` };
}

function recordHygiene(name, value) {
  writeJson(path.join(outputDir, name), value);
  state.hygiene.results[name] = { ok: value.ok === true, path: `${outputRel}/${name}` };
  if (value.ok !== true) state.hygiene.blockers.push(`${name} failed.`);
}

function trailingWhitespaceScan(files) {
  const hits = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push({ path: rel(file), line: index + 1 });
    });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

async function probe(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    return { checked: true, reachable: response.ok, status: response.status };
  } catch (error) {
    return { checked: true, reachable: false, status: null, error: safePreview(error.message) };
  }
}

async function fetchJson(route, options = {}, allowNotFound = false) {
  const headers = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.contentType) headers['Content-Type'] = options.contentType;
  const response = await fetch(`${apiBase}${route}`, {
    method: options.method || 'GET',
    headers,
    body: options.body,
    cache: 'no-store',
  });
  const text = await response.text();
  const data = text ? parseJson(text) ?? { text: safePreview(text) } : null;
  return {
    ok: response.ok || (allowNotFound && response.status === 404),
    status: response.status,
    data,
    text: safePreview(text),
  };
}

function run(cmd, args, timeout = 30000) {
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout,
    windowsHide: true,
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    signal: result.signal || null,
  };
}

function commandSummary(result) {
  return {
    exitCode: result.status,
    ok: result.status === 0,
    stdoutPreview: safePreview(result.stdout),
    stderrPreview: safePreview(result.stderr),
  };
}

function inferOk(parsed, result) {
  if (parsed && typeof parsed.ok === 'boolean') return parsed.ok;
  if (parsed && typeof parsed.Ok === 'boolean') return parsed.Ok;
  return result.status === 0;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    output[key] = /secret|token|password|connectionString|apiKey|jwt|privateKey|credential/i.test(key)
      ? '[redacted]'
      : sanitize(nested);
  }
  return output;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safePreview(value) {
  return String(value || '')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-jwt]')
    .slice(0, 1200);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function printSummary() {
  console.log(JSON.stringify({
    success: state.success,
    importPerformed: state.import.performed,
    dirtyGate: state.start.dirtyGate.ok,
    auth: {
      env: state.auth.envStatus,
      tempInitial: state.auth.tempInitialStatus,
      validation: state.auth.validation,
      tempFinal: state.auth.tempFinalStatus,
    },
    blockers: unique([...state.blockers, ...state.hygiene.blockers]),
    report: rootReportRel,
  }, null, 2));
}
