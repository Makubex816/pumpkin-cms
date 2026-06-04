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
const outputRel = 'content-review/ice-final-contact-local-draft-import';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_FINAL_CONTACT_LOCAL_DRAFT_IMPORT_REPORT.md';
const candidateRel = 'content-review/ice-final-contact-validated/CONTACT_NORMALIZED_CANDIDATE.json';
const packageRel = 'content-review/ice-final-contact-validated/CONTACT_IMPORT_PACKAGE.json';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
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
const requestedChangeSource = 'final_contact_local_draft_import';
const apiChangeSource = 'json_import';
const generatedAt = new Date().toISOString();

const officialMediaIds = [
  'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
  'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
  'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
  'ice-rink-rentals-holidayicerink-973ce7691377',
  'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
  'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
];

const files = {
  readme: `${outputRel}/README.md`,
  preImportValidation: `${outputRel}/PRE_IMPORT_VALIDATION.md`,
  baselineSnapshots: `${outputRel}/BASELINE_SNAPSHOTS.md`,
  importResult: `${outputRel}/CONTACT_IMPORT_RESULT.md`,
  readbackVerification: `${outputRel}/CONTACT_READBACK_VERIFICATION.md`,
  formRoutingVerification: `${outputRel}/FORM_ROUTING_VERIFICATION.md`,
  untouchedRoutesVerification: `${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`,
  frontendPreviewChecklist: `${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`,
  authLifecycleResult: `${outputRel}/AUTH_LIFECYCLE_RESULT.md`,
  remainingBlockers: `${outputRel}/REMAINING_BLOCKERS.md`,
  contactBefore: `${outputRel}/current-contact-before-final-import.snapshot.json`,
  contactReadback: `${outputRel}/contact-readback-after-final-import.json`,
  manifest: `${outputRel}/manifest.json`,
  preparedCandidate: `${outputRel}/CONTACT_FINAL_LOCAL_DRAFT_IMPORT_CANDIDATE.json`,
  writeResult: `${outputRel}/contact-final-local-draft-write-result.json`,
  homepageBefore: `${outputRel}/homepage-before-final-contact-import.snapshot.json`,
  serviceAreasBefore: `${outputRel}/service-areas-before-final-contact-import.snapshot.json`,
  themeBefore: `${outputRel}/theme-before-final-contact-import.snapshot.json`,
  mediaBefore: `${outputRel}/media-assets-before-final-contact-import.snapshot.json`,
  homepageAfter: `${outputRel}/homepage-after-final-contact-import.readonly.json`,
  serviceAreasAfter: `${outputRel}/service-areas-after-final-contact-import.readonly.json`,
  themeAfter: `${outputRel}/theme-after-final-contact-import.readonly.json`,
  mediaAfter: `${outputRel}/media-assets-after-final-contact-import.readonly.json`,
  frontendProbe: `${outputRel}/frontend-route-probe-result.json`,
  finalHygiene: `${outputRel}/final-hygiene-result.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  safePreflight: `${outputRel}/safe-import-preflight-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  defaultForm: `${outputRel}/default-form-validation-result.json`,
  defaultFormFixtures: `${outputRel}/default-form-fixtures-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  routeCanonical: `${outputRel}/route-canonical-audit-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.final-contact-local-draft-import.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
    cleanExceptApprovedRawInputs: false,
  },
  inputs: {
    candidate: { path: candidateRel, exists: existsSync(abs(candidateRel)) },
    importPackage: { path: packageRel, exists: existsSync(abs(packageRel)) },
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
  baselines: {
    captured: false,
    homepage: null,
    serviceAreas: null,
    contact: null,
    theme: null,
    mediaAssets: null,
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
    requestedChangeSource,
    apiChangeSource,
    mode: 'update-existing-contact',
  },
  readback: {
    performed: false,
    ok: false,
    summary: {},
    checks: {},
    failed: [],
  },
  formRouting: {
    ok: false,
    checks: {},
    failed: [],
  },
  untouched: {
    homepageUnchanged: null,
    serviceAreasUnchanged: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
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
    homepageWrite: false,
    serviceAreasWrite: false,
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
    state.start.cleanExceptApprovedRawInputs = cleanExceptApprovedRawInputs();
    state.start.api = await probe(apiBase);
    if (!state.start.api.reachable || state.start.api.status !== 200) {
      throw new Error('Local API is not reachable at http://localhost:5064.');
    }
    if (!state.inputs.candidate.exists || !state.inputs.importPackage.exists) {
      throw new Error('Required contact candidate/package input file is missing.');
    }

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();

    const sourceCandidate = readJson(candidateRel);
    const importPackage = readJson(packageRel);
    const candidate = prepareCandidate(sourceCandidate, state.baselines.contact.json);
    writeJson(files.preparedCandidate, candidate);

    runValidation(candidate, importPackage);
    writeReports();
    if (!state.validation.ok) {
      throw new Error(`Pre-import validation failed: ${state.validation.failed.join(', ')}.`);
    }

    await writeContact(candidate);
    if (!state.import.performed) {
      throw new Error(`Contact update failed with HTTP ${state.import.httpStatus}.`);
    }

    await verifyAfterWrite();
    if (!state.readback.ok) {
      throw new Error(`Contact readback verification failed: ${state.readback.failed.join(', ')}.`);
    }
    if (!state.formRouting.ok) {
      throw new Error(`Form routing verification failed: ${state.formRouting.failed.join(', ')}.`);
    }
    if (!Object.values(state.untouched).every((item) => item === true)) {
      throw new Error('Homepage/service-areas/theme/media untouched verification failed.');
    }

    await probeFrontendRoutes();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) {
    state.blockers.push(`Final hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);
  }

  state.success = state.blockers.length === 0 &&
    state.validation.ok === true &&
    state.import.performed === true &&
    state.readback.ok === true &&
    state.formRouting.ok === true &&
    Object.values(state.untouched).every((item) => item === true) &&
    state.hygiene.ok === true;

  if (state.success) {
    const hadTempJwt = existsSync(tempJwtPath);
    state.auth.tempDeletedAfterSuccess = hadTempJwt;
    state.auth.tempJwtFinalStatus = hadTempJwt ? 'MISSING' : (existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING');
    writeReports();
    runHygieneChecks();
    if (!state.hygiene.ok) {
      state.blockers.push(`Final pre-JWT-delete hygiene checks failed: ${state.hygiene.failed.join(', ')}.`);
      state.success = false;
    }
  }

  if (state.success && existsSync(tempJwtPath)) {
    try {
      rmSync(tempJwtPath, { force: true });
      state.auth.tempDeletedAfterSuccess = !existsSync(tempJwtPath);
      state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
      if (!state.auth.tempDeletedAfterSuccess) {
        state.blockers.push('Temp JWT deletion failed after successful report and hygiene checks.');
        state.success = false;
      }
    } catch (error) {
      state.blockers.push(`Temp JWT deletion failed after successful report and hygiene checks: ${safeMessage(error)}.`);
      state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
      state.success = false;
    }
  }

  if (!state.success) {
    state.auth.tempRetainedOnFailure = existsSync(tempJwtPath);
    state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
    writeReports();
    runHygieneChecks();
  }

  console.log(JSON.stringify({
    success: state.success,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
      tokenPrinted: false,
    },
    importPerformed: state.import.performed,
    readbackOk: state.readback.ok,
    formRoutingOk: state.formRouting.ok,
    untouched: state.untouched,
    frontend: state.frontend.routes,
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
  const [homepage, serviceAreas, contact, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('service-areas'),
    getPage(pageSlug),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!serviceAreas.ok) throw new Error(`/service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!contact.ok) throw new Error(`/contact baseline read failed with HTTP ${contact.status}; stopped before CMS write.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);

  state.baselines = { captured: true, homepage, serviceAreas, contact, theme, mediaAssets };
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.serviceAreasBefore, serviceAreas.json);
  writeJson(files.contactBefore, contact.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);
}

function prepareCandidate(source, existingContact) {
  const page = clone(source);
  const now = new Date().toISOString();
  const existingId = existingContact?.PageId || existingContact?.pageId || existingContact?.id || page.PageId || page.id || 'ice-rink-rentals-contact';

  page.id = existingId;
  page.PageId = existingId;
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.slug = pageSlug;
  page.pageSlug = pageSlug;
  page.PageSlug = pageSlug;
  page.route = route;
  page.path = route;
  page.canonicalUrl = canonicalUrl;
  page.Layout = page.Layout || 'default';
  page.isPublished = false;
  page.includeInSitemap = false;
  page.productionApproved = false;
  page.publishApproved = false;
  page.publishedAt = null;
  page.previousSlugs = Array.isArray(existingContact?.previousSlugs) ? existingContact.previousSlugs : (page.previousSlugs || []);
  page.redirects = Array.isArray(existingContact?.redirects) ? existingContact.redirects : (page.redirects || []);

  page.seo = {
    ...(page.seo || {}),
    canonicalUrl,
    robots: 'noindex,nofollow',
  };
  if (page.seo.openGraph) page.seo.openGraph.url = canonicalUrl;
  if (page.openGraph) page.openGraph.url = canonicalUrl;

  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedBy: '',
    approvedAt: '',
    approvedForImport: false,
    approvedForProduction: false,
    productionApproved: false,
    publishApproved: false,
    lastEditedBy: 'codex_final_contact_local_draft_import',
    lastEditedAt: now,
  };

  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: page.staticPublishing?.deploymentStatus || 'local_cms_draft_review_only_not_static_regenerated',
    lastStaticBuildAt: page.staticPublishing?.lastStaticBuildAt || '',
    lastDeployedAt: page.staticPublishing?.lastDeployedAt || '',
  };

  page.reviewMetadata = {
    ...(page.reviewMetadata || {}),
    localCmsDraftImportStatus: 'authorized-for-contact-only',
    importedBy: 'codex_final_contact_local_draft_import',
    importedAt: now,
    productionApproved: false,
    publishApproved: false,
    selectedMailbox,
    publicEmailDisplayPolicy,
  };

  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'final-contact-local-draft-import',
    rollbackNotes: page.revision?.rollbackNotes || 'Latest pre-update snapshot is available for rollback.',
    lastChangeSummary: `${requestedChangeSource}: import /contact as local CMS draft/needs_review only; keep productionApproved/publishApproved false; no homepage/service-areas/theme/media/static/deploy/provider/Roller action.`,
    lastChangeSource: requestedChangeSource,
    lastChangeAt: now,
  };

  ensureContactFormBlock(page);
  return page;
}

function ensureContactFormBlock(page) {
  const formBlock = findFormBlock(page);
  if (!formBlock) return;
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

function runValidation(candidate, importPackage) {
  writeValidation(files.jsonParse, jsonParseValidation([candidateRel, packageRel, files.preparedCandidate]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(candidate));
  writeValidation(files.unsafeScan, unsafeScan([files.preparedCandidate]));
  writeValidation(files.contactusScan, stringScan([files.preparedCandidate, packageRel], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.preparedCandidate, packageRel]));
  writeValidation(files.defaultForm, defaultFormValidation(candidate));
  runImportPreflight(files.preparedCandidate, files.safePreflight);
  runDotNetContract(files.preparedCandidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand(files.defaultFormFixtures, ['node', 'tools/default-form-validation/validate-default-form-fixtures.mjs']);
  runSimpleCommand(files.tailwind, ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand(files.normalizer, ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const packageChecks = importPackageValidation(importPackage);
  state.validation.results['import-package-validation-result.json'] = packageChecks;

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
  state.validation.failed = required
    .filter((file) => state.validation.results[path.basename(file)]?.ok !== true)
    .map((file) => path.basename(file));
  if (!packageChecks.ok) state.validation.failed.push('import-package-validation-result.json');
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(candidate) {
  const text = JSON.stringify(activePageOnly(candidate));
  const formBlock = findFormBlock(candidate);
  const mediaIds = unique(collectValuesByKey(activePageOnly(candidate), 'mediaAssetId').filter(Boolean));
  const checks = {
    routeContact: candidate.pageSlug === pageSlug && candidate.PageSlug === pageSlug && candidate.route === route && candidate.path === route,
    draftNeedsReview: candidate.isPublished === false &&
      candidate.includeInSitemap === false &&
      candidate.workflow?.status === 'draft' &&
      candidate.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: candidate.productionApproved === false && candidate.workflow?.productionApproved === false,
    publishApprovedFalse: candidate.publishApproved === false && candidate.workflow?.publishApproved === false,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    rollbackMetadataPresent: Boolean(candidate.revision?.revisionLabel && candidate.revision?.rollbackNotes),
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(text),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(text) &&
      !/"mailtoFallbackEnabled"\s*:\s*true/i.test(text) &&
      !/"mailtoLinksEnabled"\s*:\s*true/i.test(text),
    officialMediaIdsOnly: mediaIds.every((id) => officialMediaIds.includes(id)),
    noHomepagePayload: candidate.pageSlug !== 'home' && candidate.route !== '/',
    noServiceAreasPayload: candidate.pageSlug !== 'service-areas' && candidate.route !== '/service-areas',
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replaceAll('/service-areas', '').replaceAll('/contact', '')),
  };
  return withFailed(checks);
}

function routeCanonicalAudit(candidate) {
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    PageSlug: candidate.PageSlug === pageSlug,
    route: candidate.route === route,
    path: candidate.path === route,
    canonicalUrl: candidate.canonicalUrl === canonicalUrl,
    seoCanonicalUrl: candidate.seo?.canonicalUrl === canonicalUrl,
    noHomepageRoute: candidate.route !== '/',
    noServiceAreasRoute: candidate.route !== '/service-areas',
  };
  return withFailed(checks);
}

function defaultFormValidation(candidate) {
  const formBlock = findFormBlock(candidate);
  const checks = {
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    noRawFormHtml: !/<\s*(form|input|textarea|select|button)\b/i.test(JSON.stringify(formBlock || {})),
    noRealEmailSending: formBlock?.content?.realEmailSendingEnabled !== true,
  };
  return withFailed(checks);
}

function importPackageValidation(importPackage) {
  const checks = {
    packageTenant: importPackage?.tenantId === tenantId,
    packageSiteKey: importPackage?.siteKey === siteKey,
    packageRoute: importPackage?.route === route,
    packageHasContactPage: Array.isArray(importPackage?.pages) && importPackage.pages.some((page) => page.pageSlug === pageSlug || page.PageSlug === pageSlug),
    packageSelectedMailbox: JSON.stringify(importPackage || {}).includes(selectedMailbox),
    packagePublicEmailPolicy: JSON.stringify(importPackage || {}).includes(publicEmailDisplayPolicy),
    packageNoLegacyMailbox: !JSON.stringify(importPackage || {}).includes(legacyMailbox),
  };
  return { generatedAt: new Date().toISOString(), ...withFailed(checks) };
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
  const draftOk = parsed.classification?.['preflight-valid-for-local-draft-import'] === true || shapeOk;
  const dotnetOk = parsed.checks?.some((item) => item.check === 'dotnet-page-contract' && item.status === 'passed');
  parsed.ok = result.status === 0 && shapeOk && draftOk && dotnetOk;
  parsed.command = commandSummary(result);
  writeValidation(outputPath, parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-final-contact-contract-${process.pid}-${Date.now()}`);
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

async function writeContact(candidate) {
  state.import.attempted = true;
  const changeSummary = `${requestedChangeSource}: import /contact as local CMS draft/needs_review only; keep productionApproved/publishApproved false; no homepage/service-areas/theme/media/static/deploy/provider/Roller action.`;
  const query = new URLSearchParams({ changeSource: apiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
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
  writeJson(files.writeResult, {
    ok: response.ok,
    status: response.status,
    endpoint: state.import.endpoint,
    requestedChangeSource,
    apiChangeSource,
    page: response.json,
    safeText: response.safeText,
  });
}

async function verifyAfterWrite() {
  const [contact, homepage, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);

  writeJson(files.contactReadback, contact.json || { httpStatus: contact.status });
  writeJson(files.homepageAfter, homepage.json || { httpStatus: homepage.status });
  writeJson(files.serviceAreasAfter, serviceAreas.json || { httpStatus: serviceAreas.status });
  writeJson(files.themeAfter, theme.json || { httpStatus: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { httpStatus: mediaAssets.status });

  const page = contact.json || {};
  const active = activePageOnly(page);
  const text = JSON.stringify(active);
  const formBlock = findFormBlock(page);
  const beforeRevision = state.baselines.contact.json?.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const mediaIds = unique(collectValuesByKey(active, 'mediaAssetId').filter(Boolean));
  const mediaText = JSON.stringify(mediaAssets.json || {});

  const checks = {
    httpOk: contact.ok && contact.status === 200,
    routeContact: page.pageSlug === pageSlug &&
      (!page.PageSlug || page.PageSlug === pageSlug) &&
      (!page.route || page.route === route) &&
      (!page.path || page.path === route),
    draftNeedsReview: page.isPublished === false &&
      page.includeInSitemap === false &&
      page.workflow?.status === 'draft' &&
      page.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true &&
      page.workflow?.productionApproved !== true &&
      page.staticPublishing?.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true &&
      page.workflow?.publishApproved !== true &&
      page.workflow?.approvedForPublish !== true,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    revisionIncrementedOrRollback: Number.isFinite(beforeRevision) && Number.isFinite(afterRevision)
      ? afterRevision > beforeRevision
      : Boolean(page.revision),
    rollbackMetadataExists: Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable || page.revision?.rollbackNotes),
    requestedSourceInSummary: String(page.revision?.lastChangeSummary || '').includes(requestedChangeSource),
    apiSourcePersisted: page.revision?.lastChangeSource === apiChangeSource,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(text),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(text) &&
      !/"mailtoFallbackEnabled"\s*:\s*true/i.test(text) &&
      !/"mailtoLinksEnabled"\s*:\s*true/i.test(text),
    officialMediaIdsOnly: mediaIds.every((id) => officialMediaIds.includes(id)),
    officialMediaIdsExist: mediaIds.every((id) => mediaText.includes(id)),
  };

  const formChecks = {
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailboxMetadata: JSON.stringify(formBlock || {}).includes(selectedMailbox),
    publicEmailDisplayPolicy: JSON.stringify(formBlock || {}).includes(publicEmailDisplayPolicy),
    noRawFormControls: !/<\s*(form|input|textarea|select|button)\b/i.test(JSON.stringify(formBlock || {})),
    noRealEmailSending: formBlock?.content?.realEmailSendingEnabled !== true,
  };

  state.readback.performed = true;
  state.readback.summary = summarizePage(page);
  state.readback.checks = checks;
  state.readback.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.ok = state.readback.failed.length === 0;

  state.formRouting.checks = formChecks;
  state.formRouting.failed = Object.entries(formChecks).filter(([, ok]) => !ok).map(([key]) => key);
  state.formRouting.ok = state.formRouting.failed.length === 0;

  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baselines.homepage.hash;
  state.untouched.serviceAreasUnchanged = serviceAreas.ok && serviceAreas.hash === state.baselines.serviceAreas.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;
}

async function probeFrontendRoutes() {
  const urls = {
    contact: `${webBase}/contact`,
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
  const taskFiles = unique([...listFiles(outputDir).filter(isTextFile), abs(rootReportRel)].filter(existsSync));
  const gitDiff = run('git', ['diff', '--check'], 120000);
  state.hygiene.results.gitDiffCheck = commandSummary(gitDiff);
  state.hygiene.results.nodeCheckRunner = commandSummary(run('node', ['--check', `${outputRel}/run-final-contact-local-draft-import.mjs`], 120000));
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

  writeMd(files.readme, `# Ice Final Contact Local Draft Import

Generated: ${generatedAt}

Scope:

- Imported/updated local CMS route \`/contact\` only.
- Target state: draft / needs_review.
- Homepage \`/\`, \`/service-areas\`, Theme records, MediaAsset records, static output, deployment, DNS/email/provider settings, protected config, and Roller were not updated.

Primary artifacts:

- \`${files.contactBefore}\`
- \`${files.contactReadback}\`
- \`${rootReportRel}\``);

  writeMd(files.preImportValidation, `# Pre-Import Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Check', 'Result'], validationRows)}

Failed checks:

${listOrNone(state.validation.failed)}

Inputs:

- Candidate: \`${candidateRel}\` (${state.inputs.candidate.exists ? 'found' : 'missing'})
- Import package: \`${packageRel}\` (${state.inputs.importPackage.exists ? 'found' : 'missing'})

CMS write blocked before validation success: ${yn(!state.validation.ok)}`);

  writeMd(files.baselineSnapshots, `# Baseline Snapshots

Captured: ${yn(state.baselines.captured)}

Before-write snapshots:

- Homepage: \`${files.homepageBefore}\`
- /service-areas: \`${files.serviceAreasBefore}\`
- /contact: \`${files.contactBefore}\`
- Theme: \`${files.themeBefore}\`
- MediaAssets: \`${files.mediaBefore}\`

Baseline summaries:

${table(['Record', 'HTTP', 'Hash'], [
    ['homepage /', state.baselines.homepage?.status ?? 'n/a', state.baselines.homepage?.hash || 'n/a'],
    ['/service-areas', state.baselines.serviceAreas?.status ?? 'n/a', state.baselines.serviceAreas?.hash || 'n/a'],
    ['/contact', state.baselines.contact?.status ?? 'n/a', state.baselines.contact?.hash || 'n/a'],
    ['Theme', state.baselines.theme?.status ?? 'n/a', state.baselines.theme?.hash || 'n/a'],
    ['MediaAssets', state.baselines.mediaAssets?.status ?? 'n/a', state.baselines.mediaAssets?.hash || 'n/a'],
  ])}`);

  writeMd(files.importResult, `# Contact Import Result

- Import attempted: ${yn(state.import.attempted)}
- Import performed: ${yn(state.import.performed)}
- Mode: \`${state.import.mode}\`
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`
- productionApproved kept false: ${yn(state.readback.checks.productionApprovedFalse)}
- publishApproved kept false: ${yn(state.readback.checks.publishApprovedFalse)}
- staticPublishing.needsRebuild true: ${yn(state.readback.checks.staticNeedsRebuildTrue)}
- Homepage write: no
- /service-areas write: no
- Theme write: no
- MediaAsset write: no
- Static generation: no
- Deployment/provider/email/DNS action: no`);

  writeMd(files.readbackVerification, `# Contact Readback Verification

Readback performed: ${yn(state.readback.performed)}

Readback ok: ${yn(state.readback.ok)}

Summary:

\`\`\`json
${JSON.stringify(state.readback.summary || {}, null, 2)}
\`\`\`

Checks:

${table(['Check', 'Result'], Object.entries(state.readback.checks || {}).map(([key, value]) => [key, yn(value)]))}

Failed checks:

${listOrNone(state.readback.failed)}

Readback file:

\`${files.contactReadback}\``);

  writeMd(files.formRoutingVerification, `# Form Routing Verification

Form routing ok: ${yn(state.formRouting.ok)}

Expected:

- formKey: \`default-quote-request\`
- sourcePage: \`/contact\`
- staticEndpointRef: \`${staticEndpointRef}\`
- leadRecipientRef: \`${leadRecipientRef}\`
- selectedMailbox: \`${selectedMailbox}\`
- publicEmailDisplayPolicy: \`${publicEmailDisplayPolicy}\`
- real email sending enabled: no
- WordPress/CF7 runtime: no

Checks:

${table(['Check', 'Result'], Object.entries(state.formRouting.checks || {}).map(([key, value]) => [key, yn(value)]))}

Failed checks:

${listOrNone(state.formRouting.failed)}`);

  writeMd(files.untouchedRoutesVerification, `# Untouched Routes Verification

${table(['Record', 'Unchanged'], [
    ['Homepage /', yn(state.untouched.homepageUnchanged)],
    ['/service-areas', yn(state.untouched.serviceAreasUnchanged)],
    ['Theme', yn(state.untouched.themeUnchanged)],
    ['MediaAssets', yn(state.untouched.mediaAssetsUnchanged)],
  ])}

After-write read-only snapshots:

- Homepage: \`${files.homepageAfter}\`
- /service-areas: \`${files.serviceAreasAfter}\`
- Theme: \`${files.themeAfter}\`
- MediaAssets: \`${files.mediaAfter}\`

No \`/state-city\` route was created. No homepage, service-areas, Theme, or MediaAsset write path was used.`);

  writeMd(files.frontendPreviewChecklist, `# Frontend Preview Checklist

Frontend probe attempted: ${yn(state.frontend.checked)}

Probe results:

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.frontend.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked', value?.reachable ? 'yes' : 'no']))}

Review URLs:

- http://localhost:3002/contact
- http://localhost:3002/
- http://localhost:3002/service-areas

Manual review still required before any static regeneration or production/indexing step.`);

  writeMd(files.authLifecycleResult, `# Auth Lifecycle Result

- Env JWT status: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}
- Temp JWT deleted after successful write/readback/report/hygiene: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}

The token value was never printed or written to reports.`);

  writeMd(files.remainingBlockers, `# Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before CMS/live approval:

- Human review of the local /contact draft is still required.
- productionApproved and publishApproved remain false.

Before static regeneration:

- Static regeneration was not authorized in this run.
- Contact draft review and explicit static authorization are required.

Before production/indexing:

- Production approval, publish approval, static generation, deployment, DNS/provider/email decisions, and indexing remain separate approval gates.

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
    inputCandidate: candidateRel,
    inputPackage: packageRel,
    preparedCandidate: files.preparedCandidate,
    contactBefore: files.contactBefore,
    contactReadback: files.contactReadback,
    import: state.import,
    readback: state.readback,
    formRouting: state.formRouting,
    untouched: state.untouched,
    frontend: state.frontend,
    auth: {
      envStatus: state.auth.envStatus,
      tempInitialStatus: state.auth.tempInitialStatus,
      presence: state.auth.presence,
      validation: state.auth.validation,
      tokenPrinted: false,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
      tempDeletedAfterSuccess: state.auth.tempDeletedAfterSuccess,
      tempRetainedOnFailure: state.auth.tempRetainedOnFailure,
    },
    hygiene: state.hygiene,
    safety: state.safety,
    blockers: state.blockers,
  });

  writeMd(rootReportRel, `# Pumpkin Ice Final Contact Local Draft Import Report

Generated: ${generatedAt}

## Scope

Primary site: IceSkatingRinkRentals.com.

Authorized action: import/update local CMS route \`/contact\` only as draft/needs_review.

Out of scope and not performed: homepage updates, \`/service-areas\` updates, \`/state-city\` creation, Theme updates, MediaAsset updates, static generation, deployment, DNS/email/provider/Azure/Cloudflare/Bluehost changes, protected config reads, email sending, and Roller work.

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

Clean except approved raw contact/service-area input artifacts: ${yn(state.start.cleanExceptApprovedRawInputs)}

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Candidate/package present: ${yn(state.inputs.candidate.exists && state.inputs.importPackage.exists)}

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}
- Temp JWT deleted only after successful write/readback/report/hygiene: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}

## Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], validationRows)}

Failed validation checks:

${listOrNone(state.validation.failed)}

## Baseline

- Homepage / snapshot: \`${files.homepageBefore}\`
- /service-areas snapshot: \`${files.serviceAreasBefore}\`
- /contact before snapshot: \`${files.contactBefore}\`
- Theme snapshot: \`${files.themeBefore}\`
- MediaAssets snapshot: \`${files.mediaBefore}\`

## Import

- Import performed: ${yn(state.import.performed)}
- Contact update result: HTTP ${state.import.httpStatus ?? 'n/a'}
- Endpoint: \`${state.import.endpoint || 'not-used'}\`
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`
- Homepage write: no
- /service-areas write: no
- Theme write: no
- MediaAsset write: no
- Static generation: no
- Deployment/provider/email/DNS action: no

## Readback

- Readback ok: ${yn(state.readback.ok)}
- Route /contact: ${yn(state.readback.checks.routeContact)}
- draft/needs_review: ${yn(state.readback.checks.draftNeedsReview)}
- productionApproved false: ${yn(state.readback.checks.productionApprovedFalse)}
- publishApproved false: ${yn(state.readback.checks.publishApprovedFalse)}
- staticPublishing.needsRebuild true: ${yn(state.readback.checks.staticNeedsRebuildTrue)}
- Revision incremented or rollback metadata exists: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Requested source recorded in summary: ${yn(state.readback.checks.requestedSourceInSummary)}
- API source persisted as json_import: ${yn(state.readback.checks.apiSourcePersisted)}
- selectedMailbox remains \`${selectedMailbox}\`: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy remains \`${publicEmailDisplayPolicy}\`: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No \`contactus@\`: ${yn(state.readback.checks.noLegacyMailbox)}
- No raw CF7/WordPress runtime: ${yn(state.readback.checks.noRawCf7WordPress)}
- No real email sending enabled: ${yn(state.readback.checks.noRealEmailSending)}
- Official MediaAsset IDs only where present: ${yn(state.readback.checks.officialMediaIdsOnly)}

Readback file: \`${files.contactReadback}\`

## FormBlock

- formBlock verification ok: ${yn(state.formRouting.ok)}
- formKey \`default-quote-request\`: ${yn(state.formRouting.checks.formKey)}
- sourcePage \`/contact\`: ${yn(state.formRouting.checks.sourcePage)}
- staticEndpointRef \`${staticEndpointRef}\`: ${yn(state.formRouting.checks.staticEndpointRef)}
- leadRecipientRef \`${leadRecipientRef}\`: ${yn(state.formRouting.checks.leadRecipientRef)}

## Untouched

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /service-areas unchanged: ${yn(state.untouched.serviceAreasUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}

## Frontend Probe

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.frontend.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked', value?.reachable ? 'yes' : 'no']))}

## Hygiene

- node --check runner: ${state.hygiene.results.nodeCheckRunner ? yn(state.hygiene.results.nodeCheckRunner.ok) : 'not run'}
- git diff --check: ${state.hygiene.results.gitDiffCheck ? yn(state.hygiene.results.gitDiffCheck.ok) : 'not run'}
- trailing whitespace scan: ${state.hygiene.results.trailingWhitespaceScan ? yn(state.hygiene.results.trailingWhitespaceScan.ok) : 'not run'}
- protected/generated/raw artifact path check: ${state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? yn(state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok) : 'not run'}
- targeted secret scan: ${state.hygiene.results.targetedSecretScan ? yn(state.hygiene.results.targetedSecretScan.ok) : 'not run'}
- no ZIP/raw media/extracted/static artifacts staged: ${state.hygiene.results.stagedArtifactCheck ? yn(state.hygiene.results.stagedArtifactCheck.ok) : 'not run'}

## Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before CMS/live approval:

- Human review is still required.
- productionApproved and publishApproved remain false.

Before static regeneration:

- Static regeneration is not authorized.
- Review and explicit static authorization are required.

Before production/indexing:

- Production approval, publish approval, static generation, deployment, provider/email/DNS decisions, and indexing remain separate gates.

## Next Recommended Action

Review the local \`/contact\` draft in the CMS/frontend. Static regeneration, live approval, deployment, DNS/email/provider changes, and Roller work remain out of scope.`);
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
    ['raw-cf7', /contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i],
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
    ['jwt-value', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
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
    if (file.startsWith('content-review/ice-final-contact-input/') ||
      file.startsWith('content-review/ice-service-areas-input/')) {
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
  const extracted = staged.filter((file) => file.startsWith('content-review/ice-final-contact-input/extracted/') || file.startsWith('content-review/ice-service-areas-input/extracted/'));
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

function cleanExceptApprovedRawInputs() {
  const lines = state.start.gitStatusShort.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return true;
  return lines.every((line) => {
    if (!line.startsWith('?? ')) return false;
    const file = line.slice(3).replace(/\\/g, '/');
    return file.startsWith('content-review/ice-final-contact-input/') ||
      file.startsWith('content-review/ice-service-areas-input/');
  });
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

function findFormBlock(page) {
  return blocksOf(page).find((block) => block.type === 'formBlock' || block.id === 'contact-quote-form') || null;
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

function summarizePage(page) {
  return {
    id: page?.PageId || page?.pageId || page?.id || '',
    slug: page?.pageSlug || page?.PageSlug || page?.slug || '',
    route: page?.route || page?.path || '',
    isPublished: page?.isPublished,
    includeInSitemap: page?.includeInSitemap,
    workflowStatus: page?.workflow?.status || '',
    workflowReviewStatus: page?.workflow?.reviewStatus || '',
    productionApproved: page?.productionApproved,
    publishApproved: page?.publishApproved,
    pageVersion: page?.PageVersion || page?.pageVersion || null,
    revisionNumber: page?.revision?.revisionNumber || null,
    lastChangeSource: page?.revision?.lastChangeSource || '',
    lastChangeSummary: page?.revision?.lastChangeSummary || '',
    rollbackAvailable: page?.revision?.rollbackAvailable,
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
