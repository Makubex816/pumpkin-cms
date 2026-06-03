#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outputRel = 'content-review/ice-ppec-visual-brand-repair';
const outputDir = path.join(repoRoot, outputRel);
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const sourceCandidateRel = 'content-review/ice-approved-homepage-ppec-logo-binding/APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_CANDIDATE.json';
const sourcePackageRel = 'content-review/ice-approved-homepage-ppec-logo-binding/APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_PACKAGE.json';
const repairedCandidateRel = `${outputRel}/APPROVED_HOMEPAGE_PPEC_VISUAL_REPAIR_CANDIDATE.json`;
const repairedPackageRel = `${outputRel}/APPROVED_HOMEPAGE_PPEC_VISUAL_REPAIR_PACKAGE.json`;
const rootReportRel = 'PUMPKIN_ICE_PPEC_VISUAL_BRAND_REPAIR_REPORT.md';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const expectedPpecId = 'ice-rink-rentals-ppec-wordmark-card-d28c10b570d1';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const generatedAt = new Date().toISOString();

const state = {
  schemaVersion: 'pumpkin.ice.ppec-visual-brand-repair.v1',
  generatedAt,
  start: {
    gitStatusShort: run('git', ['status', '--short']).stdout.trim(),
    gitLogOneline12: run('git', ['log', '--oneline', '-12']).stdout.trim(),
    api: null,
    preview: null,
  },
  source: {
    candidate: sourceCandidateRel,
    package: sourcePackageRel,
    ppecLogoMediaAssetId: expectedPpecId,
  },
  audit: {},
  repair: {
    rendererVariant: 'ppecPartnerBand',
    rendererFilesChanged: [
      'apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx',
      'apps/ice-rink-web/src/app/globals.css',
      'apps/ice-rink-web/src/data/fallback-theme.ts',
      'tools/import-preflight/import-preflight.mjs',
    ],
    candidateCreated: false,
    packageCreated: false,
    candidateChanges: [],
  },
  validation: {
    results: {},
    blockers: [],
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    validation: 'MISSING',
    loadedFrom: 'none',
    tokenPrinted: false,
    tempFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  import: {
    attempted: false,
    performed: false,
    skippedReason: '',
    httpStatus: null,
  },
  postImport: {
    verification: {},
    untouched: {},
    blockers: [],
  },
  frontend: {
    checked: false,
    previewStatus: null,
    containsPpecClass: false,
    containsPpecLogoUrl: false,
    cmsReadbackContainsPpecLogoUrl: false,
    note: '',
  },
  hygiene: {
    results: {},
    blockers: [],
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });
  try {
    state.start.api = await probe(apiBase);
    state.start.preview = await probe(`${webBase}/__preview/${tenantId}/home`);
    const candidate = repairCandidate();
    state.audit = auditCandidate(candidate);
    runValidations();
    await maybeImport(candidate);
    await checkFrontendPreview();
    runHygieneChecks();
    state.blockers.push(...state.validation.blockers, ...state.postImport.blockers, ...state.hygiene.blockers);
    state.success = state.blockers.length === 0 && state.validation.blockers.length === 0;
    if (state.success && state.import.performed && state.auth.loadedFrom === 'temp' && existsSync(tempJwtPath)) {
      rmSync(tempJwtPath, { force: true });
    }
  } catch (error) {
    state.blockers.push(safePreview(error?.message || error));
  } finally {
    state.auth.tempFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
    writeReports();
    printSummary();
    if (state.blockers.length > 0) process.exitCode = 1;
  }
}

function repairCandidate() {
  const candidate = readJson(path.join(repoRoot, sourceCandidateRel));
  const pkg = readJson(path.join(repoRoot, sourcePackageRel));
  const blocks = candidate.ContentData?.ContentBlocks || [];

  for (const block of blocks) {
    const content = block.content || {};
    if (!isRepairablePpecPartnerSection(block)) continue;
    const partner = content.partner || {};
    partner.logoAssetStatus = 'mediaasset-bound';
    partner.logoRequirementRef = 'ppec-partner-logo';
    if (partner.logoRequirement) {
      partner.logoRequirement.mediaAssetId = expectedPpecId;
      partner.logoRequirement.status = 'mediaasset-bound';
      partner.logoRequirement.blocker = false;
    }
    if (partner.logoMedia) {
      partner.logoMedia.mediaAssetId = expectedPpecId;
      partner.logoMedia.status = 'mediaasset-bound';
      partner.logoMedia.usageType = 'partner-logo';
    }
    content.partner = partner;
    content.visualTreatment = 'ppecPartnerBand';
    content.rendererVariant = 'ppecPartnerBand';
    content.brandPalette = 'party-pros-east-coast-purple';
    content.logoDisplay = 'prominent-logo-card';
    content.headline = 'Planning more than the rink?';
    content.title = 'Planning more than the rink?';
    content.description = 'Party Pros East Coast is the event-rental partner resource for larger celebrations that need supporting equipment, entertainment ideas, and logistics around the portable ice rink experience.';
    content.partnerCtaLabel = 'Explore Party Pros East Coast';
    content.secondaryButtonText = 'Request Ice Rink Rental Info';
    content.secondaryButtonLink = '#quote-form';
    if (partner.url && partner.urlSource) content.buttonLink = partner.url;

    if (block.type === 'PrimaryCTA') {
      content.sectionVariant = 'ppecPartnerBand';
      state.repair.candidateChanges.push('Changed PPEC PrimaryCTA sectionVariant from generic partnerCta to ppecPartnerBand.');
    } else if (block.type === 'TrustBar') {
      content.sectionVariant = 'trustBand';
      state.repair.candidateChanges.push('Kept required trustBand variant but added ppecPartnerBand renderer metadata and PPEC brand treatment.');
    }
  }

  candidate.workflow = candidate.workflow || {};
  candidate.workflow.status = 'draft';
  candidate.workflow.reviewStatus = 'needs_review';
  candidate.workflow.productionApproved = false;
  candidate.workflow.publishApproved = false;
  candidate.workflow.approvedForPublish = false;
  candidate.workflow.approvedForImport = false;
  candidate.productionApproved = false;
  candidate.publishApproved = false;
  candidate.staticPublishing = candidate.staticPublishing || {};
  candidate.staticPublishing.needsRebuild = true;
  candidate.staticPublishing.staticEligible = false;
  candidate.staticPublishing.productionApproved = false;
  candidate.reviewMetadata = candidate.reviewMetadata || {};
  candidate.reviewMetadata.ppecVisualBrandRepair = {
    generatedAt,
    rendererVariant: 'ppecPartnerBand',
    ppecLogoMediaAssetId: expectedPpecId,
    imageGenerationUsed: false,
    imageContentsModified: false,
    cmsWritePerformedByGenerator: false,
  };

  const repairedPackage = {
    ...pkg,
    generatedAt,
    visualBrandRepair: {
      generatedAt,
      status: 'candidate-created',
      rendererVariant: 'ppecPartnerBand',
      candidate: repairedCandidateRel,
      sourceCandidate: sourceCandidateRel,
      ppecLogoMediaAssetId: expectedPpecId,
    },
    convertedHomepageCandidate: candidate,
    validationSummary: {
      status: 'pending',
      generatedAt,
      blockers: [],
      results: {},
    },
  };

  writeJson(path.join(repoRoot, repairedCandidateRel), candidate);
  writeJson(path.join(repoRoot, repairedPackageRel), repairedPackage);
  state.repair.candidateCreated = true;
  state.repair.packageCreated = true;
  return candidate;
}

function auditCandidate(candidate) {
  const text = JSON.stringify(candidate);
  const ppecBlocks = (candidate.ContentData?.ContentBlocks || [])
    .map((block, index) => ({ index, type: block.type, content: block.content || {} }))
    .filter((block) => isRepairablePpecPartnerSection(block))
    .map((block) => ({
      index: block.index,
      type: block.type,
      sectionVariant: block.content.sectionVariant || '',
      rendererVariant: block.content.rendererVariant || '',
      visualTreatment: block.content.visualTreatment || '',
      hasLogoMediaAssetId: JSON.stringify(block.content).includes(expectedPpecId),
      buttonText: block.content.buttonText || block.content.partnerCtaLabel || '',
      buttonLink: block.content.buttonLink || '',
    }));
  return {
    ppecBlockCount: ppecBlocks.length,
    ppecBlocks,
    ppecLogoMediaAssetExistsInCandidate: text.includes(expectedPpecId),
    ppecCopyExists: /Party Pros East Coast/i.test(text),
    visualMismatchRootCause: 'PPEC content was present but rendered through generic TrustBar/PrimaryCTA Ice variants instead of a partner-branded renderer.',
  };
}

function isRepairablePpecPartnerSection(block) {
  const content = block.content || {};
  if (!['TrustBar', 'PrimaryCTA'].includes(block.type)) return false;
  const partner = content.partner || {};
  return /Party Pros East Coast|PPEC|ppec-wordmark-card/i.test(JSON.stringify(partner));
}

function runValidations() {
  const candidatePath = path.join(repoRoot, repairedCandidateRel);
  const packagePath = path.join(repoRoot, repairedPackageRel);
  recordValidation('json-parse-validation-result.json', jsonParseValidation([candidatePath, packagePath]));
  recordValidation('visual-repair-validation-result.json', visualRepairValidation(candidatePath));
  recordValidation('unsafe-scan-result.json', unsafeScan([candidatePath, packagePath]));
  recordValidation('contactus-scan-result.json', stringScan([candidatePath, packagePath], legacyMailbox));
  recordValidation('targeted-secret-scan-result.json', secretScan([candidatePath, packagePath]));
  runImportPreflight();
  runDotNetContract(candidatePath);
  runContractPersistence(candidatePath);
  runSimple('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimple('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimple('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimple('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  runNodeCheck();
  runTypeCheck();

  const required = [
    'json-parse-validation-result.json',
    'visual-repair-validation-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'homepage-import-preflight-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
    'node-check-result.json',
    'ice-rink-web-type-check-result.json',
  ];
  for (const name of required) {
    if (state.validation.results[name]?.ok !== true) state.validation.blockers.push(`${name} failed.`);
  }
  updatePackageValidationSummary();
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

function visualRepairValidation(candidatePath) {
  const candidate = readJson(candidatePath);
  const text = JSON.stringify(candidate);
  const blocks = candidate.ContentData?.ContentBlocks || [];
  const ppecBand = blocks.find((block) => block.content?.sectionVariant === 'ppecPartnerBand');
  const checks = {
    routeHome: candidate.pageSlug === 'home' && candidate.route === '/',
    tenant: candidate.tenantId === tenantId && candidate.siteKey === siteKey,
    draftOnly: candidate.isPublished === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: candidate.workflow?.productionApproved !== true && candidate.workflow?.publishApproved !== true && candidate.workflow?.approvedForPublish !== true,
    needsRebuild: candidate.staticPublishing?.needsRebuild === true,
    ppecBandVariant: Boolean(ppecBand),
    ppecLogoId: text.includes(expectedPpecId),
    ppecLogoVisibleMetadata: text.includes('prominent-logo-card'),
    ppecPurpleTreatment: text.includes('party-pros-east-coast-purple'),
    ppecHeadline: text.includes('Planning more than the rink?'),
    ppecCta: text.includes('Explore Party Pros East Coast'),
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailPolicy: text.includes('form-first-under-review'),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noGenericServingEastCoast: !/Serving the East Coast/i.test(text),
    noBase64: !/data:image\/|base64/i.test(text),
    noRawWordPressRuntime: !/contact-form-7|wpcf7|wp-json|wp-content/i.test(text),
  };
  return {
    ok: Object.values(checks).every(Boolean),
    generatedAt: new Date().toISOString(),
    checks,
  };
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
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push({ path: rel(file), code });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function stringScan(files, needle) {
  const hits = files.filter((file) => readFileSync(file, 'utf8').includes(needle)).map((file) => ({ path: rel(file) }));
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
    '--input', repairedCandidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', '/',
    '--mode', 'preflight-only',
    '--output', rel(output),
  ], 180000);
  const parsed = existsSync(output) ? readJson(output) : {};
  parsed.ok = parsed.classification?.['preflight-valid-for-shape'] === true &&
    parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.command = commandSummary(result);
  recordValidation('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-ppec-visual-contract-${process.pid}-${Date.now()}`);
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
  recordValidation('dotnet-page-contract-result.json', {
    ok: validate.status === 0 && inferOk(parsed, validate),
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
  recordValidation('contract-persistence-validation-result.json', parsed);
}

function runSimple(name, args) {
  const result = run(args[0], args.slice(1), 180000);
  const parsed = parseJson(result.stdout.trim());
  recordValidation(name, {
    ok: inferOk(parsed, result),
    generatedAt: new Date().toISOString(),
    command: commandSummary(result),
    parsed,
  });
}

function runNodeCheck() {
  const files = [
    'content-review/ice-ppec-visual-brand-repair/run-ppec-visual-brand-repair.mjs',
    'tools/import-preflight/import-preflight.mjs',
  ];
  const results = files.map((file) => ({ file, ...commandSummary(run('node', ['--check', file], 60000)) }));
  recordValidation('node-check-result.json', {
    ok: results.every((item) => item.ok),
    generatedAt: new Date().toISOString(),
    results,
  });
}

function runTypeCheck() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run type-check'] : ['run', 'type-check'];
  const result = spawnSync(command, args, {
    cwd: path.join(repoRoot, 'apps', 'ice-rink-web'),
    encoding: 'utf8',
    timeout: 240000,
    windowsHide: true,
  });
  recordValidation('ice-rink-web-type-check-result.json', {
    ok: result.status === 0,
    generatedAt: new Date().toISOString(),
    command: commandSummary({ status: result.status, stdout: result.stdout || '', stderr: result.stderr || '', signal: result.signal || null }),
  });
}

async function maybeImport(candidate) {
  const token = loadToken();
  if (!token) {
    state.import.skippedReason = 'Admin auth MISSING; repaired candidate is ready for import after auth.';
    return;
  }
  const authCheck = await fetchJson('/api/auth/verify', { token });
  state.auth.validation = authCheck.ok ? 'VALID' : 'INVALID';
  if (!authCheck.ok) {
    state.import.skippedReason = 'Admin auth INVALID; stopped before CMS write.';
    return;
  }
  if (state.validation.blockers.length > 0) {
    state.import.skippedReason = 'Validation blockers present; stopped before CMS write.';
    return;
  }

  const headers = { token };
  const beforeHome = await fetchJson(`/api/admin/pages/${tenantId}/home`, headers, true);
  const beforeContact = await fetchJson(`/api/admin/pages/${tenantId}/contact`, headers, true);
  const beforeService = await fetchJson(`/api/admin/pages/${tenantId}/service-areas`, headers, true);
  const beforeTheme = await fetchJson(`/api/admin/themes/${tenantId}`, headers, true);
  const beforeMedia = await fetchJson(`/api/admin/${tenantId}/media-assets`, headers, true);
  const payload = prepareHomepagePayload(candidate, beforeHome.data);
  const query = new URLSearchParams({
    changeSource: 'ppec_visual_brand_repair_homepage_draft',
    changeSummary: 'PPEC visual brand repair homepage-only local draft import; no contact, service-area, theme, media, static, deploy, provider, or email action.',
  });
  state.import.attempted = true;
  const update = await fetchJson(`/api/admin/pages/${tenantId}/home?${query}`, {
    token,
    method: 'PUT',
    body: JSON.stringify(payload),
    contentType: 'application/json',
  });
  state.import.httpStatus = update.status;
  state.import.performed = update.ok;
  if (!update.ok) {
    state.postImport.blockers.push(`Homepage visual repair PUT failed with HTTP ${update.status}.`);
    return;
  }

  const afterHome = await fetchJson(`/api/admin/pages/${tenantId}/home`, headers, true);
  const afterContact = await fetchJson(`/api/admin/pages/${tenantId}/contact`, headers, true);
  const afterService = await fetchJson(`/api/admin/pages/${tenantId}/service-areas`, headers, true);
  const afterTheme = await fetchJson(`/api/admin/themes/${tenantId}`, headers, true);
  const afterMedia = await fetchJson(`/api/admin/${tenantId}/media-assets`, headers, true);
  writeJson(path.join(outputDir, 'homepage-readback-after-ppec-visual-repair.json'), sanitize(afterHome.data || {}));
  state.postImport.verification = verifyReadback(afterHome.data);
  state.postImport.untouched = {
    contact: compareSnapshots(beforeContact, afterContact),
    serviceAreas: beforeService.status === 404 ? afterService.status === 404 : compareSnapshots(beforeService, afterService),
    theme: compareSnapshots(beforeTheme, afterTheme),
    mediaAssets: compareSnapshots(beforeMedia, afterMedia),
  };
  for (const [key, value] of Object.entries(state.postImport.verification)) {
    if (!value) state.postImport.blockers.push(`Post-import verification failed: ${key}.`);
  }
  for (const [key, value] of Object.entries(state.postImport.untouched)) {
    if (!value) state.postImport.blockers.push(`Untouched verification failed: ${key}.`);
  }
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
  state.auth.validation = 'MISSING';
  return '';
}

function prepareHomepagePayload(candidate, existingPage) {
  const page = JSON.parse(JSON.stringify(candidate));
  const id = existingPage?.PageId || existingPage?.pageId || existingPage?.id || page.PageId || page.id || 'ice-rink-rentals-home';
  page.id = id;
  page.PageId = id;
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.pageSlug = 'home';
  page.route = '/';
  page.path = '/';
  page.isPublished = false;
  page.includeInSitemap = false;
  page.workflow.status = 'draft';
  page.workflow.reviewStatus = 'needs_review';
  page.workflow.productionApproved = false;
  page.workflow.publishApproved = false;
  page.workflow.approvedForPublish = false;
  page.workflow.approvedForImport = false;
  page.staticPublishing.needsRebuild = true;
  page.staticPublishing.staticEligible = false;
  page.staticPublishing.productionApproved = false;
  return page;
}

function verifyReadback(page) {
  const text = JSON.stringify(page || {});
  const workflow = page?.workflow || {};
  return {
    draftNeedsReview: page?.isPublished === false && workflow.status === 'draft' && workflow.reviewStatus === 'needs_review',
    approvalsFalse: workflow.productionApproved !== true && workflow.publishApproved !== true && workflow.approvedForPublish !== true,
    ppecSectionPersisted: text.includes('ppecPartnerBand'),
    ppecLogoPersisted: text.includes(expectedPpecId),
    ppecCopyPersisted: text.includes('Planning more than the rink?') && text.includes('Explore Party Pros East Coast'),
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailPolicy: text.includes('form-first-under-review'),
    noLegacyMailbox: !text.includes(legacyMailbox),
  };
}

async function checkFrontendPreview() {
  try {
    const response = await fetch(`${webBase}/__preview/${tenantId}/home`, { cache: 'no-store' });
    const html = await response.text();
  state.frontend = {
      checked: true,
      previewStatus: response.status,
      containsPpecClass: html.includes('ppec-partner-band') || html.includes('ice-section--ppec-partner'),
      containsPpecLogoUrl: html.includes('/media/ice-rink-rentals/2026/06/ppec-wordmark-card-d28c10b570d1.png'),
      cmsReadbackContainsPpecLogoUrl: existsSync(path.join(outputDir, 'homepage-readback-after-ppec-visual-repair.json')) &&
        readFileSync(path.join(outputDir, 'homepage-readback-after-ppec-visual-repair.json'), 'utf8').includes('/media/ice-rink-rentals/2026/06/ppec-wordmark-card-d28c10b570d1.png'),
      note: 'The /__preview route server response is the client preview shell; actual draft content is fetched in-browser with a local admin JWT.',
    };
  } catch (error) {
    state.frontend = {
      checked: true,
      previewStatus: null,
      containsPpecClass: false,
      containsPpecLogoUrl: false,
      cmsReadbackContainsPpecLogoUrl: false,
      note: 'The /__preview route could not be fetched from the local server.',
      error: safePreview(error.message),
    };
  }
}

function runHygieneChecks() {
  recordHygiene('git-diff-check-result.json', { ok: run('git', ['diff', '--check'], 60000).status === 0, generatedAt: new Date().toISOString() });
  recordHygiene('trailing-whitespace-scan-result.json', trailingWhitespaceScan());
  recordHygiene('protected-generated-raw-artifact-check-result.json', artifactPathCheck());
}

function artifactPathCheck() {
  const status = run('git', ['status', '--short', '--untracked-files=all'], 60000);
  const lines = status.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  const staged = run('git', ['diff', '--cached', '--name-only'], 60000).stdout.split(/\r?\n/).filter(Boolean);
  return {
    ok: protectedHits.length === 0 && generatedHits.length === 0 && staged.filter((file) => /\.(zip|png|jpe?g|gif|webp)$/i.test(file) || file.includes('content-review/ice-approved-homepage-conversion-input/extracted/')).length === 0,
    generatedAt: new Date().toISOString(),
    protectedHits,
    generatedHits,
    stagedRawOrExtractedHits: staged.filter((file) => /\.(zip|png|jpe?g|gif|webp)$/i.test(file) || file.includes('content-review/ice-approved-homepage-conversion-input/extracted/')),
    command: commandSummary(status),
  };
}

function trailingWhitespaceScan() {
  const files = run('git', ['diff', '--name-only'], 60000).stdout.split(/\r?\n/).filter(Boolean)
    .concat([
      rootReportRel,
      `${outputRel}/README.md`,
      `${outputRel}/CURRENT_PPEC_RENDER_AUDIT.md`,
      `${outputRel}/PPEC_BRAND_REFERENCE_NOTES.md`,
      `${outputRel}/PPEC_RENDERER_REPAIR.md`,
      `${outputRel}/PPEC_CANDIDATE_REPAIR.md`,
      `${outputRel}/VALIDATION_RESULTS.md`,
      `${outputRel}/IMPORT_RESULT.md`,
      `${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`,
      `${outputRel}/REMAINING_BLOCKERS.md`,
    ]);
  const hits = [];
  for (const relPath of [...new Set(files)]) {
    const file = path.join(repoRoot, relPath);
    if (!existsSync(file) || /\.(json|png|webp|zip)$/i.test(file)) continue;
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push({ path: relPath, line: index + 1 });
    });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function writeReports() {
  writeText(path.join(outputDir, 'README.md'), `# Ice PPEC Visual Brand Repair

Status: ${state.blockers.length ? 'completed with blockers' : 'completed'}.

This folder contains the renderer and candidate repair evidence for the Party Pros East Coast partner section on the Ice homepage.
`);
  writeText(path.join(outputDir, 'CURRENT_PPEC_RENDER_AUDIT.md'), `# Current PPEC Render Audit

- Root cause: ${state.audit.visualMismatchRootCause || 'not audited'}
- PPEC block count: ${state.audit.ppecBlockCount ?? 0}
- PPEC logo MediaAsset ID present: ${yesNo(state.audit.ppecLogoMediaAssetExistsInCandidate)}
- PPEC copy/CTA present: ${yesNo(state.audit.ppecCopyExists)}

The mismatch was visual rendering/candidate styling, not missing content or missing MediaAsset binding.
`);
  writeText(path.join(outputDir, 'PPEC_BRAND_REFERENCE_NOTES.md'), `# PPEC Brand Reference Notes

Applied visual direction from the user-provided reference:

- Deep purple section background.
- Lavender/soft purple contained panel.
- Prominent visible PPEC logo card using the existing MediaAsset.
- Rounded pill CTA treatment.
- Friendly bold typography.
- No generic Ice blue partner band treatment.

No images were generated or modified.
`);
  writeText(path.join(outputDir, 'PPEC_RENDERER_REPAIR.md'), `# PPEC Renderer Repair

- Added PPEC-specific renderer variant: \`ppecPartnerBand\`.
- Added semantic CSS classes: \`ice-section--ppec-partner\`, \`ppec-partner-band\`, \`ppec-partner-card\`, \`ppec-partner-logo\`, \`ppec-partner-copy\`, \`ppec-partner-cta\`, and \`ppec-button\`.
- Renderer uses the existing PPEC logo MediaAsset URL from CMS JSON.
- Primary CTA prefers the approved Party Pros East Coast URL when present with source metadata.
- If no approved URL exists, the renderer shows a disabled approval-needed state rather than a fake link.
`);
  writeText(path.join(outputDir, 'PPEC_CANDIDATE_REPAIR.md'), `# PPEC Candidate Repair

- Candidate: \`${repairedCandidateRel}\`
- Package: \`${repairedPackageRel}\`
- Source candidate: \`${sourceCandidateRel}\`
- PPEC PrimaryCTA sectionVariant changed to \`ppecPartnerBand\`.
- Required \`trustBand\` variant was preserved while adding PPEC renderer metadata.
- Draft-only workflow, selected mailbox, public email display policy, and all MediaAsset IDs were preserved.
`);
  writeText(path.join(outputDir, 'VALIDATION_RESULTS.md'), `# Validation Results

${Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Validation did not run.'}

Validation blockers:

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(path.join(outputDir, 'IMPORT_RESULT.md'), `# Import Result

- CMS draft import attempted: ${yesNo(state.import.attempted)}
- CMS draft import performed: ${yesNo(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Skipped reason: ${state.import.skippedReason || 'not-applicable'}

No \`/contact\`, \`/service-areas\`, Theme, MediaAsset, static, deploy, provider, email, protected config, or Roller write was performed.
`);
  writeText(path.join(outputDir, 'FRONTEND_PREVIEW_CHECKLIST.md'), `# Frontend Preview Checklist

- Preview checked: ${yesNo(state.frontend.checked)}
- Preview HTTP status: ${state.frontend.previewStatus ?? 'not-applicable'}
- Preview contains PPEC class: ${yesNo(state.frontend.containsPpecClass)}
- Preview server HTML contains PPEC logo URL: ${yesNo(state.frontend.containsPpecLogoUrl)}
- CMS readback contains PPEC logo URL: ${yesNo(state.frontend.cmsReadbackContainsPpecLogoUrl)}
- Preview note: ${state.frontend.note || 'not-applicable'}
- URL: \`${webBase}/__preview/${tenantId}/home\`

Manual browser review remains required before static regeneration or production/indexing.
`);
  writeText(path.join(outputDir, 'REMAINING_BLOCKERS.md'), `# Remaining Blockers

Run blockers:

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

Before static regeneration:

- Manual browser preview review is required.
- Static regeneration must be separately authorized.

Before production/indexing:

- Production approval and publish approval remain false.
- Production/indexing must be separately authorized.
`);
  writeJson(path.join(outputDir, 'manifest.json'), state);
  writeText(path.join(repoRoot, rootReportRel), renderRootReport());
}

function renderRootReport() {
  return `# Pumpkin Ice PPEC Visual Brand Repair Report

## Status

${state.blockers.length ? 'Completed with blockers.' : 'Completed successfully.'}

## Start State

Git status at start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12}
\`\`\`

## Root Cause

${state.audit.visualMismatchRootCause || 'PPEC render audit not available.'}

## Renderer/CSS Changes

- Added PPEC-specific renderer variant: \`ppecPartnerBand\`.
- Added PPEC purple/lavender semantic CSS treatment.
- Added prominent logo-card rendering using the existing MediaAsset URL.
- Added pill-style PPEC CTA rendering.
- Added fallback/design metadata for PPEC partner variants.

## Candidate Changes

${state.repair.candidateChanges.map((item) => `- ${item}`).join('\n') || '- None.'}

Candidate: \`${repairedCandidateRel}\`

Package: \`${repairedPackageRel}\`

## PPEC Logo Usage

- MediaAsset ID: \`${expectedPpecId}\`
- Images generated: no
- Image contents modified: no

## Validation Results

${Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Validation did not run.'}

## CMS Draft Import

- Import attempted: ${yesNo(state.import.attempted)}
- Import performed: ${yesNo(state.import.performed)}
- Skipped reason: ${state.import.skippedReason || 'not-applicable'}

## Frontend Preview

- Checked: ${yesNo(state.frontend.checked)}
- HTTP status: ${state.frontend.previewStatus ?? 'not-applicable'}
- Contains PPEC class: ${yesNo(state.frontend.containsPpecClass)}
- Server HTML contains PPEC logo URL: ${yesNo(state.frontend.containsPpecLogoUrl)}
- CMS readback contains PPEC logo URL: ${yesNo(state.frontend.cmsReadbackContainsPpecLogoUrl)}
- Note: ${state.frontend.note || 'not-applicable'}

## Remaining Blockers

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

## Next Recommended Action

${state.import.performed ? 'Open the local draft preview in a browser for visual review. Static regeneration, production approval, deployment, DNS/email/provider work, and Roller remain out of scope.' : 'Provide fresh valid admin auth if you want the repaired candidate imported into the local homepage draft, then rerun this repair/import workflow.'}
`;
}

function updatePackageValidationSummary() {
  const pkg = readJson(path.join(repoRoot, repairedPackageRel));
  pkg.validationSummary = {
    status: state.validation.blockers.length ? 'completed_with_blockers' : 'completed',
    generatedAt: new Date().toISOString(),
    blockers: state.validation.blockers,
    results: state.validation.results,
  };
  writeJson(path.join(repoRoot, repairedPackageRel), pkg);
}

function recordValidation(name, value) {
  writeJson(path.join(outputDir, name), value);
  state.validation.results[name] = { ok: value.ok === true, path: `${outputRel}/${name}` };
}

function recordHygiene(name, value) {
  writeJson(path.join(outputDir, name), value);
  state.hygiene.results[name] = { ok: value.ok === true, path: `${outputRel}/${name}` };
  if (value.ok !== true) state.hygiene.blockers.push(`${name} failed.`);
}

async function probe(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    return { reachable: response.ok, status: response.status };
  } catch (error) {
    return { reachable: false, status: null, error: safePreview(error.message) };
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
  return {
    ok: response.ok || (allowNotFound && response.status === 404),
    status: response.status,
    data: text ? parseJson(text) || { text: safePreview(text) } : null,
  };
}

function compareSnapshots(before, after) {
  return before.ok && after.ok && hashObject(before.data) === hashObject(after.data);
}

function hashObject(value) {
  return createHash('sha256').update(stableStringify(sanitize(value))).digest('hex');
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    output[key] = /secret|token|password|connectionString|apiKey|jwt|privateKey|credential/i.test(key) ? '[redacted]' : sanitize(nested);
  }
  return output;
}

function run(cmd, args, timeout = 30000) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', timeout, windowsHide: true });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '', signal: result.signal || null };
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

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function safePreview(value) {
  return String(value || '')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-jwt]')
    .slice(0, 1200);
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function printSummary() {
  console.log(JSON.stringify({
    success: state.success,
    validationBlockers: state.validation.blockers,
    importPerformed: state.import.performed,
    importSkippedReason: state.import.skippedReason,
    frontend: state.frontend,
    blockers: state.blockers,
    report: rootReportRel,
  }, null, 2));
}
