#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outDir = path.join(repoRoot, 'content-review', 'ice-approved-homepage-ppec-logo-binding');
const apiBase = 'http://localhost:5064';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const sourcePath = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion-input', 'extracted', 'phase8k', 'ice-homepage-phase8k-cf7-template-pack', 'assets', 'ppec-wordmark-card.png');
const candidatePath = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion', 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CANDIDATE.json');
const packagePath = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion', 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PACKAGE.json');
const boundCandidatePath = path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_CANDIDATE.json');
const boundPackagePath = path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PPEC_BOUND_PACKAGE.json');
const rootReportPath = path.join(repoRoot, 'PUMPKIN_ICE_APPROVED_HOMEPAGE_PPEC_LOGO_BINDING_REPORT.md');
const legacyEmail = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const generatedAt = new Date().toISOString();

const state = {
  ok: false,
  generatedAt,
  start: {
    gitStatusShort: run('git', ['status', '--short']).stdout.trim(),
    gitLogOneline12: run('git', ['log', '--oneline', '-12']).stdout.trim(),
    apiReachability: await probeApi(),
  },
  auth: {
    envJwt: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempJwtInitialStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    tempJwtLoaded: false,
    validation: 'MISSING',
    tokenPrinted: false,
    tempJwtDeletedAfterSuccess: false,
    tempJwtRetainedOnFailure: false,
    tempJwtFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  sourceLogo: auditSource(sourcePath),
  mediaAsset: {
    listAttempted: false,
    uploadAttempted: false,
    readbackAttempted: false,
    created: false,
    reused: false,
    mediaAssetId: null,
    assetId: null,
    publicUrl: null,
    readbackOk: false,
    usageType: null,
    storageProvider: null,
    blockers: [],
  },
  binding: {
    attempted: false,
    boundCandidateCreated: false,
    boundPackageCreated: false,
    mediaRequirementResolved: false,
    blocker: '',
  },
  validation: {
    run: false,
    results: {},
    blockers: [],
  },
  readiness: {},
  guardrails: guardrails(),
  blockers: [],
};

await main();

async function main() {
  mkdirSync(outDir, { recursive: true });
  try {
    await runFlow();
  } catch (error) {
    state.blockers.push(error.message);
  } finally {
    state.ok = state.blockers.length === 0 && state.validation.blockers.length === 0 && state.binding.mediaRequirementResolved === true;
    state.readiness = readiness(state.ok);
    if (state.ok && existsSync(tempJwtPath)) {
      rmSync(tempJwtPath, { force: true });
      state.auth.tempJwtDeletedAfterSuccess = true;
    } else {
      state.auth.tempJwtRetainedOnFailure = existsSync(tempJwtPath);
    }
    state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
    writeReports();
    console.log(JSON.stringify({
      ok: state.ok,
      blockers: state.blockers,
      validationBlockers: state.validation.blockers,
      auth: {
        envJwt: state.auth.envJwt,
        tempJwtInitialStatus: state.auth.tempJwtInitialStatus,
        validation: state.auth.validation,
        tempJwtDeletedAfterSuccess: state.auth.tempJwtDeletedAfterSuccess,
        tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
      },
      mediaAsset: {
        created: state.mediaAsset.created,
        reused: state.mediaAsset.reused,
        mediaAssetId: state.mediaAsset.mediaAssetId,
        usageType: state.mediaAsset.usageType,
        storageProvider: state.mediaAsset.storageProvider,
      },
      readiness: state.readiness,
      report: rel(rootReportPath),
    }, null, 2));
    if (!state.ok) process.exitCode = 1;
  }
}

async function runFlow() {
  if (!state.start.apiReachability.reachable) {
    throw new Error('API is not reachable at http://localhost:5064.');
  }
  if (!state.sourceLogo.ok) {
    throw new Error('PPEC logo source validation failed.');
  }
  if (!existsSync(candidatePath) || !existsSync(packagePath)) {
    throw new Error('Approved conversion candidate/package is missing.');
  }

  const auth = loadAuthToken();
  state.auth.tempJwtLoaded = auth.source === 'temp';
  if (!auth.token) {
    state.auth.validation = 'MISSING';
    throw new Error('Admin auth is missing.');
  }

  const verify = await fetchJson('/api/auth/verify', { token: auth.token });
  state.auth.validation = verify.ok ? 'VALID' : 'INVALID';
  if (!verify.ok) {
    throw new Error(`Admin auth is invalid (HTTP ${verify.status}).`);
  }

  const mediaAsset = await createOrReuseMediaAsset(auth.token);
  if (!mediaAsset?.id && !mediaAsset?.Id) {
    throw new Error('MediaAsset create/reuse did not produce an id.');
  }
  const readback = await readMediaAsset(auth.token, mediaAsset.id || mediaAsset.Id);
  if (!readback.ok) {
    throw new Error(`MediaAsset readback failed (HTTP ${readback.status}).`);
  }
  const readbackAsset = normalizeAsset(readback.data);
  state.mediaAsset.readbackAttempted = true;
  state.mediaAsset.readbackOk = readbackAsset.id === (mediaAsset.id || mediaAsset.Id);
  state.mediaAsset.mediaAssetId = readbackAsset.id;
  state.mediaAsset.assetId = readbackAsset.assetId;
  state.mediaAsset.publicUrl = readbackAsset.publicUrl;
  state.mediaAsset.usageType = readbackAsset.usageType;
  state.mediaAsset.storageProvider = readbackAsset.storageProvider;
  if (!state.mediaAsset.readbackOk) throw new Error('MediaAsset readback id did not match created/reused asset id.');
  if (readbackAsset.usageType !== 'partner-logo') throw new Error(`MediaAsset usageType was "${readbackAsset.usageType}", expected "partner-logo".`);
  if (readbackAsset.storageProvider !== 'local-dev') throw new Error(`MediaAsset storageProvider was "${readbackAsset.storageProvider}", expected "local-dev".`);

  bindCandidateAndPackage(readbackAsset);
  runValidation();
}

function loadAuthToken() {
  const envToken = process.env.PUMPKIN_ADMIN_JWT?.trim();
  if (envToken) return { token: envToken, source: 'env' };
  if (existsSync(tempJwtPath)) {
    const token = readFileSync(tempJwtPath, 'utf8').trim();
    return { token, source: 'temp' };
  }
  return { token: '', source: 'missing' };
}

async function createOrReuseMediaAsset(token) {
  state.mediaAsset.listAttempted = true;
  const list = await fetchJson(`/api/admin/${tenantId}/media-assets`, { token });
  if (!list.ok) throw new Error(`MediaAsset list failed (HTTP ${list.status}).`);
  const assets = Array.isArray(list.data?.mediaAssets) ? list.data.mediaAssets : [];
  const reusable = assets
    .map(normalizeAsset)
    .find((asset) => {
      const active = !['archived', 'replaced', 'deleted-pending'].includes(asset.status);
      const sameHash = asset.checksum === state.sourceLogo.sha256 || asset.hash === state.sourceLogo.sha256;
      const sameName = [asset.fileName, asset.originalFileName, asset.safeFileName].some((name) => String(name || '').toLowerCase().includes('ppec-wordmark-card'));
      return active && asset.tenantId === tenantId && (!asset.siteKey || asset.siteKey === siteKey) && (sameHash || sameName);
    });

  if (reusable) {
    state.mediaAsset.reused = true;
    return reusable.raw;
  }

  state.mediaAsset.uploadAttempted = true;
  const bytes = readFileSync(sourcePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'image/png' }), 'ppec-wordmark-card.png');
  form.append('siteKey', siteKey);
  form.append('title', 'Party Pros East Coast Logo');
  form.append('altText', 'Party Pros East Coast logo');
  form.append('caption', 'Partner/resource logo for Party Pros East Coast.');
  form.append('description', 'Logo used for the Party Pros East Coast partner/resource callout on the Ice Rink Rentals homepage.');
  form.append('usageType', 'partner-logo');
  form.append('credit', 'Party Pros East Coast');
  form.append('license', 'partner_provided');
  form.append('licenseStatus', 'partner_provided');
  form.append('tags', 'ppec,party-pros-east-coast,partner-logo,event-rentals');

  const response = await fetch(`${apiBase}/api/admin/${tenantId}/media-assets/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok) {
    throw new Error(`MediaAsset upload failed (HTTP ${response.status}): ${safePreview(text)}`);
  }
  state.mediaAsset.created = true;
  return data;
}

async function readMediaAsset(token, id) {
  return fetchJson(`/api/admin/${tenantId}/media-assets/${encodeURIComponent(id)}`, { token });
}

function bindCandidateAndPackage(asset) {
  state.binding.attempted = true;
  const candidate = readJson(candidatePath);
  const pkg = readJson(packagePath);
  const media = {
    mediaAssetId: asset.id,
    assetId: asset.assetId,
    publicUrl: asset.publicUrl,
    url: asset.publicUrl,
    alt: 'Party Pros East Coast logo',
    title: 'Party Pros East Coast Logo',
    caption: 'Partner/resource logo for Party Pros East Coast.',
    description: 'Logo used for the Party Pros East Coast partner/resource callout on the Ice Rink Rentals homepage.',
    source: 'Party Pros East Coast',
    licenseStatus: asset.licenseStatus || 'partner_provided',
    usageStatus: asset.usageStatus || 'needs_review',
    usageType: 'partner-logo',
    status: 'mediaasset-bound',
    tags: ['ppec', 'party-pros-east-coast', 'partner-logo', 'event-rentals'],
    blocker: false,
    width: asset.width,
    height: asset.height,
    focalPointX: null,
    focalPointY: null,
    decorative: false,
  };

  bindObject(candidate, media);
  candidate.media ??= {};
  candidate.media.ppecPartnerLogo = media;
  candidate.reviewMetadata ??= {};
  candidate.reviewMetadata.ppecLogoBinding = {
    generatedAt,
    mediaAssetId: asset.id,
    assetId: asset.assetId,
    publicUrl: asset.publicUrl,
    storageProvider: asset.storageProvider,
    cmsPageWritesPerformed: false,
    themeRecordsChanged: false,
    staticRegenerationPerformed: false,
  };
  candidate.workflow.productionApproved = false;
  candidate.workflow.publishApproved = false;
  candidate.workflow.approvedForPublish = false;
  candidate.workflow.approvedForImport = false;
  candidate.productionApproved = false;
  candidate.publishApproved = false;
  candidate.staticPublishing.needsRebuild = true;
  candidate.staticPublishing.staticEligible = false;
  candidate.importCandidateStatus = 'review-ready-ppec-logo-bound-local-homepage-draft-candidate';
  candidate.normalizerMetadata ??= {};
  candidate.normalizerMetadata.ppecHomepageConversion ??= {};
  candidate.normalizerMetadata.ppecHomepageConversion.ppecLogoMediaAssetStatus = 'mediaasset-bound';
  candidate.normalizerMetadata.ppecHomepageConversion.ppecLogoMediaAssetId = asset.id;
  candidate.pageQuality ??= {};
  candidate.pageQuality.blockingIssues = (candidate.pageQuality.blockingIssues || [])
    .filter((issue) => !/ppec.*logo|logo.*mediaasset/i.test(String(issue)));
  candidate.pageQuality.warnings = (candidate.pageQuality.warnings || [])
    .filter((issue) => !/ppec.*logo.*no approved|source exists/i.test(String(issue)));
  candidate.pageQuality.launchNotes = 'Review-only conversion with PPEC logo MediaAsset bound. Local draft homepage import still requires separate human approval and a separate import run.';

  const unresolved = collectUnresolvedPpecRequirements(candidate);
  if (unresolved.length > 0) {
    throw new Error(`PPEC media requirements still unresolved after binding: ${unresolved.length}.`);
  }

  const boundPackage = {
    ...pkg,
    generatedAt,
    convertedHomepageCandidate: candidate,
    mediaRequirements: candidate.mediaRequirements,
    ppecAssetRequirements: (pkg.ppecAssetRequirements || []).map((item) => bindRequirement(item, media)),
    validationSummary: {
      status: 'pending-after-logo-binding',
      generatedAt,
      results: {},
      blockers: [],
      warnings: [],
    },
    importReadinessClassification: 'pending-validation-after-ppec-logo-binding',
  };

  writeJson(boundCandidatePath, candidate);
  writeJson(boundPackagePath, boundPackage);
  state.binding.boundCandidateCreated = true;
  state.binding.boundPackageCreated = true;
  state.binding.mediaRequirementResolved = true;
}

function bindObject(value, media) {
  if (Array.isArray(value)) {
    value.forEach((item) => bindObject(item, media));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const isPpecRequirement =
    value.requiredMediaSlot === 'ppecPartnerLogo' ||
    value.requiredMediaSlotId === 'ppecPartnerLogo' ||
    value.mediaRequirementRef === 'ppec-partner-logo' ||
    (value.sourceFile === 'ppec-wordmark-card.png' && /Party Pros East Coast/i.test(String(value.title || value.altText || value.alt || '')));
  if (isPpecRequirement) bindRequirement(value, media);
  if (value.logoRequirement && typeof value.logoRequirement === 'object') {
    bindRequirement(value.logoRequirement, media);
    value.logoMedia = media;
  }
  for (const child of Object.values(value)) bindObject(child, media);
}

function bindRequirement(target, media) {
  target.requiredMediaSlot ??= 'ppecPartnerLogo';
  target.requiredMediaSlotId ??= 'ppecPartnerLogo';
  target.mediaRequirementRef ??= 'ppec-partner-logo';
  target.usageType = 'partner-logo';
  target.intendedUsageType = 'partner-logo';
  target.sourceFile ??= 'ppec-wordmark-card.png';
  target.mediaAssetId = media.mediaAssetId;
  target.assetId = media.assetId;
  target.publicUrl = media.publicUrl;
  target.url = media.url;
  target.status = 'mediaasset-bound';
  target.title = 'Party Pros East Coast Logo';
  target.altText = 'Party Pros East Coast logo';
  target.alt = 'Party Pros East Coast logo';
  target.caption = 'Partner/resource logo for Party Pros East Coast.';
  target.description = 'Logo used for the Party Pros East Coast partner/resource callout on the Ice Rink Rentals homepage.';
  target.requiredBeforeCmsImport = true;
  target.requiredBeforeProduction = true;
  target.requiredBeforeProductionLabel = 'yes';
  target.blocker = false;
  return target;
}

function collectUnresolvedPpecRequirements(root) {
  const results = [];
  visit(root, (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const isPpec =
      value.requiredMediaSlot === 'ppecPartnerLogo' ||
      value.requiredMediaSlotId === 'ppecPartnerLogo' ||
      value.mediaRequirementRef === 'ppec-partner-logo';
    if (isPpec && !value.mediaAssetId) results.push(value);
  });
  return results;
}

function runValidation() {
  state.validation.run = true;
  writeValidationResult('json-parse-validation-result.json', runJsonParseValidation());
  runImportPreflight();
  runDotNetContract();
  runContractPersistence();
  runSimpleValidation('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleValidation('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleValidation('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleValidation('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  writeValidationResult('unsafe-scan-result.json', runUnsafeScan());
  writeValidationResult('contactus-scan-result.json', runStringScan(legacyEmail, 'legacy-email'));
  writeValidationResult('targeted-secret-scan-result.json', runSecretScan());
  runGitDiffCheck();
  writeValidationResult('trailing-whitespace-scan-result.json', runTrailingWhitespaceScan());
  writeValidationResult('protected-generated-raw-artifact-check-result.json', runArtifactPathCheck());
  writeValidationResult('staged-raw-artifact-check-result.json', runStagedRawArtifactCheck());
  writeValidationResult('validation-command-results.json', {
    ok: Object.values(state.validation.results).every((item) => item.ok !== false || item.expectedNonBlocking === true),
    generatedAt: new Date().toISOString(),
    results: state.validation.results,
  });

  const requiredOk = [
    'json-parse-validation-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
    'homepage-import-preflight-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'git-diff-check-result.json',
    'trailing-whitespace-scan-result.json',
    'protected-generated-raw-artifact-check-result.json',
    'staged-raw-artifact-check-result.json',
  ];
  for (const name of requiredOk) {
    if (state.validation.results[name]?.ok !== true) {
      state.validation.blockers.push(`${name} failed.`);
    }
  }
  updateBoundPackageValidationSummary();
}

function runJsonParseValidation() {
  const files = [boundCandidatePath, boundPackagePath];
  const parsed = files.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8'));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: error.message };
    }
  });
  return { ok: parsed.every((item) => item.ok), generatedAt: new Date().toISOString(), files: parsed };
}

function runImportPreflight() {
  const output = path.join(outDir, 'homepage-import-preflight-result.json');
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', rel(boundCandidatePath),
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', '/',
    '--mode', 'preflight-only',
    '--output', rel(output),
  ]);
  const parsed = existsSync(output) ? readJson(output) : {};
  parsed.command = commandSummary(result);
  parsed.ok = parsed.classification?.['preflight-valid-for-shape'] === true &&
    parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  writeValidationResult('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract() {
  const scratch = path.join(os.tmpdir(), `pumpkin-ppec-logo-binding-${process.pid}-${Date.now()}`);
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
  ], 180000);
  if (publish.status !== 0) {
    writeValidationResult('dotnet-page-contract-result.json', { ok: false, generatedAt: new Date().toISOString(), command: commandSummary(publish) });
    rmSync(scratch, { recursive: true, force: true });
    return;
  }
  const validate = run('dotnet', [path.join(publishDir, 'Pumpkin.PageContractTool.dll'), 'validate-page', '--path', boundCandidatePath], 180000);
  const parsed = parseJson(validate.stdout) || { Ok: false, stdoutPreview: safePreview(validate.stdout), stderrPreview: safePreview(validate.stderr) };
  parsed.command = commandSummary(validate);
  parsed.ok = parsed.Ok === true;
  writeValidationResult('dotnet-page-contract-result.json', parsed);
  rmSync(scratch, { recursive: true, force: true });
}

function runContractPersistence() {
  const output = path.join(outDir, 'contract-persistence-validation-result.json');
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', rel(boundCandidatePath),
    '--output', rel(output),
  ], 120000);
  const parsed = existsSync(output) ? readJson(output) : {};
  parsed.command = commandSummary(result);
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  writeValidationResult('contract-persistence-validation-result.json', parsed);
}

function runSimpleValidation(name, command) {
  const result = run(command[0], command.slice(1), 180000);
  const parsed = parseJson(result.stdout);
  const payload = parsed && typeof parsed === 'object'
    ? { ...parsed, command: commandSummary(result), ok: inferOk(parsed, result) }
    : { ok: result.status === 0, generatedAt: new Date().toISOString(), command: commandSummary(result), stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  writeValidationResult(name, payload);
}

function runGitDiffCheck() {
  const result = run('git', ['diff', '--check'], 60000);
  writeValidationResult('git-diff-check-result.json', { ok: result.status === 0, generatedAt: new Date().toISOString(), command: commandSummary(result), stdout: result.stdout.trim(), stderr: result.stderr.trim() });
}

function runUnsafeScan() {
  const files = [boundCandidatePath, boundPackagePath];
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

function runStringScan(needle, code) {
  const files = [boundCandidatePath, boundPackagePath, rootReportPath].filter(existsSync);
  const hits = files.filter((file) => readFileSync(file, 'utf8').includes(needle)).map((file) => ({ path: rel(file), code }));
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function runSecretScan() {
  const files = [boundCandidatePath, boundPackagePath, rootReportPath].filter(existsSync);
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

function runTrailingWhitespaceScan() {
  const files = [
    boundCandidatePath,
    boundPackagePath,
    path.join(outDir, 'README.md'),
    path.join(outDir, 'PPEC_LOGO_SOURCE_AUDIT.md'),
    path.join(outDir, 'PPEC_LOGO_MEDIAASSET_RESULT.md'),
    path.join(outDir, 'PPEC_LOGO_BINDING_RESULT.md'),
    path.join(outDir, 'IMPORT_READINESS_AFTER_LOGO_BINDING.md'),
    path.join(outDir, 'manifest.json'),
    rootReportPath,
  ].filter(existsSync);
  const hits = [];
  for (const file of files) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push({ path: rel(file), line: index + 1 });
    });
  }
  return { ok: hits.length === 0, generatedAt: new Date().toISOString(), hits };
}

function runArtifactPathCheck() {
  const status = run('git', ['status', '--short', '--untracked-files=all'], 60000);
  const lines = status.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  return {
    ok: protectedHits.length === 0 && generatedHits.length === 0,
    generatedAt: new Date().toISOString(),
    protectedHits,
    generatedHits,
    expectedUntrackedInputFolder: lines.some((line) => line.includes('content-review/ice-approved-homepage-conversion-input/')),
    command: commandSummary(status),
  };
}

function runStagedRawArtifactCheck() {
  const cached = run('git', ['diff', '--cached', '--name-only'], 60000);
  const staged = cached.stdout.split(/\r?\n/).filter(Boolean);
  const rawHits = staged.filter((file) => /\.(zip|png|jpe?g|gif|webp|mp4|mov|avi|psd|ai)$/i.test(file));
  const extractedHits = staged.filter((file) => file.includes('content-review/ice-approved-homepage-conversion-input/extracted/'));
  return {
    ok: rawHits.length === 0 && extractedHits.length === 0,
    generatedAt: new Date().toISOString(),
    stagedRawMediaOrZipHits: rawHits,
    stagedExtractedInputHits: extractedHits,
    stagedCount: staged.length,
    command: commandSummary(cached),
  };
}

function updateBoundPackageValidationSummary() {
  const pkg = readJson(boundPackagePath);
  pkg.validationSummary = {
    status: state.validation.blockers.length === 0 ? 'completed' : 'completed_with_blockers',
    generatedAt: new Date().toISOString(),
    results: Object.fromEntries(Object.entries(state.validation.results).map(([key, value]) => [key, { ok: value.ok, path: value.path }])),
    blockers: state.validation.blockers,
    warnings: [],
  };
  pkg.importReadinessClassification = state.validation.blockers.length === 0
    ? 'ready-for-human-review-and-local-homepage-draft-import'
    : 'blocked-after-ppec-logo-binding-validation';
  writeJson(boundPackagePath, pkg);
}

function auditSource(filePath) {
  const result = {
    ok: false,
    path: rel(filePath),
    exists: existsSync(filePath),
    localSourceOnly: true,
    pathTraversalSafe: false,
    extension: path.extname(filePath).toLowerCase(),
    extensionValid: false,
    mimeType: null,
    mimeTypeValid: false,
    safeFileName: path.basename(filePath),
    safeFileNameValid: /^[a-z0-9][a-z0-9._-]*$/i.test(path.basename(filePath)) && path.basename(filePath) === 'ppec-wordmark-card.png',
    sizeBytes: null,
    sha256: null,
    width: null,
    height: null,
    errors: [],
  };
  const full = path.resolve(filePath);
  const allowedRoot = path.resolve(repoRoot, 'content-review', 'ice-approved-homepage-conversion-input');
  result.pathTraversalSafe = full.startsWith(allowedRoot + path.sep);
  result.extensionValid = result.extension === '.png';
  if (!result.exists) {
    result.errors.push('Source logo file is missing.');
    return result;
  }
  const bytes = readFileSync(filePath);
  const png = inspectPng(bytes);
  result.sizeBytes = statSync(filePath).size;
  result.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  result.mimeType = png.isPng ? 'image/png' : 'unknown';
  result.mimeTypeValid = png.isPng;
  result.width = png.width;
  result.height = png.height;
  if (!result.pathTraversalSafe) result.errors.push('Source path is outside the approved input folder.');
  if (!result.extensionValid) result.errors.push('Source extension is not .png.');
  if (!result.safeFileNameValid) result.errors.push('Source filename is not the expected safe filename.');
  if (!result.mimeTypeValid) result.errors.push('PNG signature could not be validated.');
  if (!result.width || !result.height) result.errors.push('PNG dimensions could not be read.');
  result.ok = result.errors.length === 0;
  return result;
}

function inspectPng(bytes) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  const isPng = bytes.length >= 24 && sig.every((value, index) => bytes[index] === value);
  if (!isPng) return { isPng: false, width: null, height: null };
  return { isPng: true, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function probeApi() {
  try {
    const response = await fetch(`${apiBase}/`);
    return { reachable: response.ok, statusCode: response.status };
  } catch (error) {
    return { reachable: false, statusCode: null, error: error.message };
  }
}

async function fetchJson(route, { token }) {
  const response = await fetch(`${apiBase}${route}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, data: parseJson(text), text: safePreview(text) };
}

function normalizeAsset(raw) {
  return {
    raw,
    id: raw.id || raw.Id,
    tenantId: raw.tenantId || raw.TenantId,
    siteKey: raw.siteKey || raw.SiteKey,
    assetId: raw.assetId || raw.AssetId,
    status: raw.status || raw.Status,
    publicUrl: raw.publicUrl || raw.PublicUrl || raw.url || raw.Url,
    fileName: raw.fileName || raw.FileName,
    originalFileName: raw.originalFileName || raw.OriginalFileName,
    safeFileName: raw.safeFileName || raw.SafeFileName,
    title: raw.title || raw.Title,
    altText: raw.altText || raw.AltText || raw.alt || raw.Alt,
    caption: raw.caption || raw.Caption,
    checksum: raw.checksum || raw.Checksum,
    hash: raw.hash || raw.Hash,
    usageType: raw.usageType || raw.UsageType,
    usageStatus: raw.usageStatus || raw.UsageStatus,
    licenseStatus: raw.licenseStatus || raw.LicenseStatus,
    storageProvider: raw.storageProvider || raw.StorageProvider,
    width: raw.width ?? raw.Width ?? null,
    height: raw.height ?? raw.Height ?? null,
  };
}

function readiness(success) {
  return {
    readyForHumanReview: success,
    readyForLocalHomepageDraftImport: success,
    readyForContactImport: false,
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
    classification: success
      ? 'ready-for-human-review-and-local-homepage-draft-import'
      : 'blocked-before-local-homepage-draft-import',
  };
}

function writeReports() {
  writeJson(path.join(outDir, 'manifest.json'), state);
  writeText(path.join(outDir, 'README.md'), `# Ice Approved Homepage PPEC Logo Binding

Status: ${state.ok ? 'completed' : 'blocked'}.

MediaAsset ID: ${state.mediaAsset.mediaAssetId || 'not available'}

No CMS Page records, Theme records, static generation, deployment, provider settings, email, protected config, image content modification, or Roller work occurred.
`);
  writeText(path.join(outDir, 'PPEC_LOGO_SOURCE_AUDIT.md'), renderSourceAudit());
  writeText(path.join(outDir, 'PPEC_LOGO_MEDIAASSET_RESULT.md'), renderMediaAssetResult());
  writeText(path.join(outDir, 'PPEC_LOGO_BINDING_RESULT.md'), renderBindingResult());
  writeText(path.join(outDir, 'IMPORT_READINESS_AFTER_LOGO_BINDING.md'), renderReadiness());
  writeText(rootReportPath, renderRootReport());
}

function renderSourceAudit() {
  const a = state.sourceLogo;
  return `# PPEC Logo Source Audit

Source path: \`${a.path}\`

- Exists: ${yn(a.exists)}
- Extension valid: ${yn(a.extensionValid)}
- MIME/type: \`${a.mimeType}\`
- MIME/type valid: ${yn(a.mimeTypeValid)}
- Safe filename: \`${a.safeFileName}\`
- Safe filename valid: ${yn(a.safeFileNameValid)}
- SHA-256: \`${a.sha256 || ''}\`
- Dimensions: ${a.width || 'unknown'} x ${a.height || 'unknown'}
- File size: ${a.sizeBytes ?? 'unknown'} bytes
- Path traversal safe: ${yn(a.pathTraversalSafe)}
- Local source only: ${yn(a.localSourceOnly)}

Errors:

${a.errors.length ? a.errors.map((item) => `- ${item}`).join('\n') : '- None.'}
`;
}

function renderMediaAssetResult() {
  return `# PPEC Logo MediaAsset Result

Status: ${state.mediaAsset.mediaAssetId ? 'completed' : 'blocked'}

- MediaAsset list attempted: ${yn(state.mediaAsset.listAttempted)}
- MediaAsset upload attempted: ${yn(state.mediaAsset.uploadAttempted)}
- MediaAsset created: ${yn(state.mediaAsset.created)}
- MediaAsset reused: ${yn(state.mediaAsset.reused)}
- MediaAsset readback attempted: ${yn(state.mediaAsset.readbackAttempted)}
- MediaAsset readback ok: ${yn(state.mediaAsset.readbackOk)}
- MediaAsset ID: ${state.mediaAsset.mediaAssetId || 'null'}
- Asset ID: ${state.mediaAsset.assetId || 'null'}
- Public URL: ${state.mediaAsset.publicUrl || 'null'}
- Usage type: ${state.mediaAsset.usageType || 'null'}
- Storage provider: ${state.mediaAsset.storageProvider || 'null'}
`;
}

function renderBindingResult() {
  return `# PPEC Logo Binding Result

Status: ${state.binding.mediaRequirementResolved ? 'completed' : 'blocked'}

- Bound candidate created: ${yn(state.binding.boundCandidateCreated)}
- Bound package created: ${yn(state.binding.boundPackageCreated)}
- Media requirement resolved: ${yn(state.binding.mediaRequirementResolved)}
- Bound candidate: \`${rel(boundCandidatePath)}\`
- Bound package: \`${rel(boundPackagePath)}\`

Binding target:

- requiredMediaSlot: \`ppecPartnerLogo\`
- sourceFile: \`ppec-wordmark-card.png\`
- mediaAssetId: \`${state.mediaAsset.mediaAssetId || 'null'}\`
`;
}

function renderReadiness() {
  const r = state.readiness;
  return `# Import Readiness After Logo Binding

- Ready for human review: ${yn(r.readyForHumanReview)}
- Ready for local homepage draft import: ${yn(r.readyForLocalHomepageDraftImport)}
- Ready for /contact import: ${yn(r.readyForContactImport)}
- Ready for static regeneration: ${yn(r.readyForStaticRegeneration)}
- Ready for production/indexing: ${yn(r.readyForProductionIndexing)}

Classification: \`${r.classification}\`
`;
}

function renderRootReport() {
  return `# Pumpkin Ice Approved Homepage PPEC Logo Binding Report

## Status

${state.ok ? 'Completed successfully. A local PPEC logo MediaAsset was created or reused, bound into a new homepage candidate/package, and validated.' : 'Blocked. See blockers below.'}

## Start State

Git status at start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12}
\`\`\`

API reachable at http://localhost:5064: ${yn(state.start.apiReachability.reachable)}${state.start.apiReachability.statusCode ? `, HTTP ${state.start.apiReachability.statusCode}` : ''}

## PPEC Logo Source

- Source path: \`${state.sourceLogo.path}\`
- Source validation ok: ${yn(state.sourceLogo.ok)}
- SHA-256: \`${state.sourceLogo.sha256 || ''}\`
- Dimensions: ${state.sourceLogo.width || 'unknown'} x ${state.sourceLogo.height || 'unknown'}
- Size: ${state.sourceLogo.sizeBytes ?? 'unknown'} bytes
- MIME/type: \`${state.sourceLogo.mimeType}\`

## Admin Auth

- PUMPKIN_ADMIN_JWT: ${state.auth.envJwt}
- Temp JWT initial status: ${state.auth.tempJwtInitialStatus}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after success: ${yn(state.auth.tempJwtDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempJwtRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## MediaAsset Result

- MediaAsset created: ${yn(state.mediaAsset.created)}
- MediaAsset reused: ${yn(state.mediaAsset.reused)}
- MediaAsset ID: ${state.mediaAsset.mediaAssetId || 'null'}
- Asset ID: ${state.mediaAsset.assetId || 'null'}
- Usage type: ${state.mediaAsset.usageType || 'null'}
- Storage provider: ${state.mediaAsset.storageProvider || 'null'}
- Readback ok: ${yn(state.mediaAsset.readbackOk)}

## Binding Result

- Bound candidate created: ${yn(state.binding.boundCandidateCreated)}
- Bound package created: ${yn(state.binding.boundPackageCreated)}
- Media requirement resolved: ${yn(state.binding.mediaRequirementResolved)}
- Bound candidate: \`${rel(boundCandidatePath)}\`
- Bound package: \`${rel(boundPackagePath)}\`

## Validation Results

${Object.entries(state.validation.results).map(([name, result]) => `- ${name}: ok=${result.ok}`).join('\n') || '- Validation not run.'}

Validation blockers:

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

## Import Readiness

- Ready for human review: ${yn(state.readiness.readyForHumanReview)}
- Ready for local homepage draft import: ${yn(state.readiness.readyForLocalHomepageDraftImport)}
- Ready for /contact import: ${yn(state.readiness.readyForContactImport)}
- Ready for static regeneration: ${yn(state.readiness.readyForStaticRegeneration)}
- Ready for production/indexing: ${yn(state.readiness.readyForProductionIndexing)}

Classification: \`${state.readiness.classification}\`

## Checks Run

- git status --short
- git log --oneline -12
- API reachability at http://localhost:5064
- PPEC logo source lookup
- PPEC logo extension/MIME/signature validation
- PPEC logo checksum/hash
- PPEC logo dimensions
- PPEC logo file-size check
- Safe filename/path traversal/local-source check
- Admin auth presence and validation
- Authenticated MediaAsset list/reuse check
- Authenticated local-dev MediaAsset upload if no reusable record exists
- MediaAsset readback verification
- JSON parse validation
- .NET Page/block contract validation
- Production-field persistence validation
- Safe import preflight
- Design-system validation
- Media validation
- Tailwind/navigation validation
- Page intake normalizer validation
- Unsafe HTML/CSS/form/media/email scan
- contactus@ scan
- Targeted secret scan
- git diff --check
- Trailing whitespace scan
- Protected/generated/raw artifact path check
- Staged raw media/ZIP/extracted input check

## Guardrails Honored

${guardrails().map((item) => `- ${item}`).join('\n')}

## Next Recommended Action

${state.ok ? 'Review the bound candidate and, if approved, run a separate local homepage draft import using fresh auth. Do not import /contact with this homepage-only package.' : 'Resolve the blockers above, then rerun the PPEC logo binding.'}
`;
}

function guardrails() {
  return [
    'No CMS Page records changed.',
    'No homepage import.',
    'No /contact update.',
    'No /service-areas update.',
    'No /state-city creation.',
    'No Theme records changed.',
    'No static generation.',
    'No deploy, DNS, email provider, Azure, Cloudflare, or Bluehost action.',
    'No email was sent.',
    'No image-generation tools were used.',
    'No image contents were modified.',
    'No protected config was read or modified.',
    'No secrets, JWTs, tokens, credentials, connection strings, SMTP secrets, storage keys, or provider credentials were printed.',
    'Raw ZIPs, extracted input folders, and raw media were not staged.',
    'Roller remains paused.',
  ];
}

function visit(value, visitor) {
  visitor(value);
  if (Array.isArray(value)) value.forEach((item) => visit(item, visitor));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => visit(item, visitor));
}

function writeValidationResult(name, value) {
  const filePath = path.join(outDir, name);
  writeJson(filePath, value);
  state.validation.results[name] = { ok: value.ok, path: rel(filePath) };
}

function commandSummary(result) {
  return {
    exitCode: result.status,
    ok: result.status === 0,
    stdoutPreview: safePreview(result.stdout),
    stderrPreview: safePreview(result.stderr),
  };
}

function run(cmd, args, timeout = 30000) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', timeout, windowsHide: true });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '', signal: result.signal || null };
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function inferOk(parsed, result) {
  if (typeof parsed.ok === 'boolean') return parsed.ok;
  if (typeof parsed.Ok === 'boolean') return parsed.Ok;
  return result.status === 0;
}

function safePreview(text) {
  return String(text || '')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-jwt]')
    .slice(0, 1000);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function yn(value) {
  return value ? 'yes' : 'no';
}
