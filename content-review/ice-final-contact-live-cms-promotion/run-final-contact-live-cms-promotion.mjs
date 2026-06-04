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
const outputRel = 'content-review/ice-final-contact-live-cms-promotion';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_FINAL_CONTACT_LIVE_CMS_PROMOTION_REPORT.md';
const mediaBindingRel = 'content-review/ice-contact-media-binding';
const finalContactDraftRel = 'content-review/ice-final-contact-local-draft-import';
const mediaBoundReadbackRel = `${mediaBindingRel}/contact-readback-after-contact-media-binding.json`;
const finalDraftReadbackRel = `${finalContactDraftRel}/contact-readback-after-final-import.json`;
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
const requestedChangeSource = 'final_contact_live_cms_promotion';
const apiChangeSource = 'lifecycle_action';
const generatedAt = new Date().toISOString();

const contactMediaAssetIds = [
  'ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd',
  'ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7',
  'ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d',
];

const files = {
  readme: `${outputRel}/README.md`,
  preValidation: `${outputRel}/PRE_PROMOTION_VALIDATION.md`,
  baselines: `${outputRel}/BASELINE_SNAPSHOTS.md`,
  promotionResult: `${outputRel}/CONTACT_LIVE_CMS_PROMOTION_RESULT.md`,
  readbackVerification: `${outputRel}/CONTACT_READBACK_VERIFICATION.md`,
  formRoutingVerification: `${outputRel}/FORM_ROUTING_VERIFICATION.md`,
  publicRouteVerification: `${outputRel}/PUBLIC_ROUTE_VERIFICATION.md`,
  untouchedVerification: `${outputRel}/UNTOUCHED_ROUTES_VERIFICATION.md`,
  authLifecycle: `${outputRel}/AUTH_LIFECYCLE_RESULT.md`,
  blockers: `${outputRel}/REMAINING_BLOCKERS.md`,
  beforeContact: `${outputRel}/current-contact-before-live-promotion.snapshot.json`,
  afterContact: `${outputRel}/contact-readback-after-live-promotion.json`,
  manifest: `${outputRel}/manifest.json`,
  liveCandidate: `${outputRel}/CONTACT_LIVE_CMS_PROMOTION_CANDIDATE.json`,
  writeResult: `${outputRel}/contact-live-cms-promotion-write-result.json`,
  homepageBefore: `${outputRel}/homepage-before-contact-live-promotion.snapshot.json`,
  homepageAfter: `${outputRel}/homepage-after-contact-live-promotion.readonly.json`,
  serviceAreasBefore: `${outputRel}/service-areas-before-contact-live-promotion.snapshot.json`,
  serviceAreasAfter: `${outputRel}/service-areas-after-contact-live-promotion.readonly.json`,
  themeBefore: `${outputRel}/theme-before-contact-live-promotion.snapshot.json`,
  themeAfter: `${outputRel}/theme-after-contact-live-promotion.readonly.json`,
  mediaBefore: `${outputRel}/media-assets-before-contact-live-promotion.snapshot.json`,
  mediaAfter: `${outputRel}/media-assets-after-contact-live-promotion.readonly.json`,
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
  readbackJson: `${outputRel}/contact-readback-verification-result.json`,
  formRoutingJson: `${outputRel}/form-routing-verification-result.json`,
  publicProbe: `${outputRel}/public-route-probe-result.json`,
  hygiene: `${outputRel}/final-hygiene-result.json`,
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.final-contact-live-cms-promotion.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    cleanExceptRawInputs: false,
    api: null,
    sourceFolders: [
      { path: mediaBindingRel, exists: existsSync(abs(mediaBindingRel)) },
      { path: finalContactDraftRel, exists: existsSync(abs(finalContactDraftRel)) },
    ],
    sourceReadbacks: [
      { path: mediaBoundReadbackRel, exists: existsSync(abs(mediaBoundReadbackRel)) },
      { path: finalDraftReadbackRel, exists: existsSync(abs(finalDraftReadbackRel)) },
    ],
  },
  selectedSource: {
    mode: 'current-admin-contact-readback',
    pageId: '',
    pageSlug,
    sourceArtifact: mediaBoundReadbackRel,
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
    contact: null,
    homepage: null,
    serviceAreas: null,
    theme: null,
    mediaAssets: null,
  },
  validation: {
    ok: false,
    results: {},
    failed: [],
  },
  promotion: {
    candidateCreated: false,
    attempted: false,
    performed: false,
    httpStatus: null,
    endpoint: '',
    requestedChangeSource,
    apiChangeSource,
    changedFields: [],
    liveFields: {},
  },
  readback: {
    performed: false,
    ok: false,
    checks: {},
    failed: [],
    revision: {},
  },
  formRouting: {
    ok: false,
    checks: {},
    failed: [],
  },
  routes: {
    contactPublic: null,
    homepage: null,
    serviceAreas: null,
  },
  untouched: {
    homepageUnchanged: null,
    serviceAreasUnchanged: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
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
    azureDeploy: false,
    dnsCloudflareMicrosoft365BluehostEmailProviderChange: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
  },
  remainingBlockers: {
    beforeStaticGeneration: [
      'Static generation was not authorized in this CMS-only promotion run.',
      'Static output and media path checks require a separate approval.',
    ],
    beforeAzureDeployment: [
      'Azure deployment was not authorized in this run.',
      'Deployment smoke tests and rollback checks require a separate approval.',
    ],
    beforeProductionDns: [
      'DNS, Cloudflare, Microsoft 365, Bluehost, and email/provider changes were not authorized.',
      'Production provider work requires separate approval and fresh validation.',
    ],
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  try {
    state.start.cleanExceptRawInputs = cleanExceptRawInputs();
    state.start.api = await probe(apiBase);
    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable at http://localhost:5064.');
    if (!state.start.sourceFolders.every((item) => item.exists)) throw new Error('Required contact media-binding/final-draft output folders are missing.');
    if (!state.start.sourceReadbacks.every((item) => item.exists)) throw new Error('Required contact media-bound/final-draft readback artifacts are missing.');

    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');

    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();
    const candidate = prepareLiveCandidate(state.baselines.contact.json);
    state.promotion.changedFields = diffLifecycleFields(state.baselines.contact.json, candidate);
    state.promotion.liveFields = summarizeLiveFields(candidate);
    writeJson(files.liveCandidate, candidate);
    state.promotion.candidateCreated = true;

    runValidation(candidate);
    writeReports();
    if (!state.validation.ok) throw new Error(`Pre-promotion validation failed: ${state.validation.failed.join(', ')}.`);

    await promoteContact(candidate);
    if (!state.promotion.performed) throw new Error(`Contact live CMS promotion failed with HTTP ${state.promotion.httpStatus}.`);

    await verifyAfterPromotion();
    if (!state.readback.ok) throw new Error(`Contact readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!state.formRouting.ok) throw new Error(`Contact form routing verification failed: ${state.formRouting.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((item) => item === true)) throw new Error('Homepage/service-areas/theme/media untouched verification failed.');

    await probePublicRoutes();
    if (state.routes.contactPublic?.status !== 200) throw new Error(`Public /contact probe failed with HTTP ${state.routes.contactPublic?.status ?? 'not checked'}.`);
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
    state.formRouting.ok === true &&
    Object.values(state.untouched).every((item) => item === true) &&
    state.routes.contactPublic?.status === 200 &&
    state.hygiene.ok === true;

  if (state.success && existsSync(tempJwtPath)) {
    rmSync(tempJwtPath, { force: true });
    state.auth.tempDeletedAfterSuccess = true;
  }
  if (!state.success) state.auth.tempRetainedOnFailure = existsSync(tempJwtPath);
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
    promotionPerformed: state.promotion.performed,
    readbackOk: state.readback.ok,
    formRoutingOk: state.formRouting.ok,
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
  const [contact, homepage, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  if (!contact.ok) throw new Error(`Contact baseline read failed with HTTP ${contact.status}.`);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!serviceAreas.ok) throw new Error(`/service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAssets baseline read failed with HTTP ${mediaAssets.status}.`);
  state.baselines = { captured: true, contact, homepage, serviceAreas, theme, mediaAssets };
  state.selectedSource.pageId = contact.json?.PageId || contact.json?.id || '';
  writeJson(files.beforeContact, contact.json);
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.serviceAreasBefore, serviceAreas.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);
}

function prepareLiveCandidate(source) {
  const page = clone(source);
  const now = new Date().toISOString();
  page.PageId = page.PageId || page.id || 'ice-rink-rentals-contact';
  page.id = page.PageId;
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.slug = pageSlug;
  page.pageSlug = pageSlug;
  page.PageSlug = pageSlug;
  page.route = route;
  page.path = route;
  page.canonicalUrl = canonicalUrl;
  page.isPublished = true;
  page.includeInSitemap = true;
  page.publishedAt = page.publishedAt || now;
  page.sitemapChangeFrequency = page.sitemapChangeFrequency || 'monthly';
  page.seo = {
    ...(page.seo || {}),
    canonicalUrl,
    robots: 'index,follow',
  };
  page.workflow = {
    ...(page.workflow || {}),
    status: 'published',
    reviewStatus: 'approved',
    approvedForPublish: true,
    approvedBy: page.workflow?.approvedBy || 'User visual approval',
    approvedAt: page.workflow?.approvedAt || now,
    lastEditedBy: 'codex_final_contact_live_cms_promotion',
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
    revisionLabel: 'final-contact-live-cms-promotion',
    rollbackNotes: page.revision?.rollbackNotes || 'Live CMS promotion prepared with rollback snapshot support.',
    lastChangeSource: requestedChangeSource,
    lastChangeSummary: 'Promote /contact to live CMS/public-page state only; no static generation, Azure deployment, DNS/email/provider, Theme, MediaAsset, homepage, service-areas, or Roller action.',
    lastChangeAt: now,
  };
  ensureFormRouting(page);
  return page;
}

function ensureFormRouting(page) {
  const formBlock = findFormBlock(page);
  if (!formBlock) throw new Error('Contact formBlock missing.');
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

function runValidation(candidate) {
  writeValidation(files.jsonParse, jsonParseValidation([files.liveCandidate, mediaBoundReadbackRel, finalDraftReadbackRel]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonical, routeCanonicalAudit(candidate));
  writeValidation(files.unsafeScan, unsafeScan([files.liveCandidate]));
  writeValidation(files.contactusScan, stringScan([files.liveCandidate], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.liveCandidate]));
  writeValidation(files.defaultForm, defaultFormValidation(candidate));
  runImportPreflight(files.liveCandidate, files.safePreflight);
  runDotNetContract(files.liveCandidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand(files.defaultFormFixtures, ['node', 'tools/default-form-validation/validate-default-form-fixtures.mjs']);
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
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(candidate) {
  const active = activePageOnly(candidate);
  const text = JSON.stringify(active);
  const formBlock = findFormBlock(candidate);
  const mediaIds = collectValuesByKey(active, 'mediaAssetId').filter(Boolean);
  const checks = {
    routeContact: candidate.pageSlug === pageSlug && candidate.route === route && candidate.path === route,
    livePublishedState: candidate.isPublished === true && candidate.includeInSitemap === true && Boolean(candidate.publishedAt),
    workflowPublishedApproved: candidate.workflow?.status === 'published' && candidate.workflow?.reviewStatus === 'approved' && candidate.workflow?.approvedForPublish === true,
    approvalMetadataPresent: Boolean(candidate.workflow?.approvedBy) && Boolean(candidate.workflow?.approvedAt),
    staticEligibleTrue: candidate.staticPublishing?.staticEligible === true,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailbox: text.includes(selectedMailbox),
    publicEmailDisplayPolicy: text.includes(publicEmailDisplayPolicy),
    contactMediaIdsPersist: contactMediaAssetIds.every((id) => mediaIds.includes(id)),
    noLegacyMailbox: !text.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(text),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(text) && !/"mailtoFallbackEnabled"\s*:\s*true/i.test(text) && !/"mailtoLinksEnabled"\s*:\s*true/i.test(text) && !/"emailSendingEnabled"\s*:\s*true/i.test(text),
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replaceAll('/service-areas', '').replaceAll('/contact', '')),
  };
  return withFailed(checks);
}

function routeCanonicalAudit(candidate) {
  return withFailed({
    tenantId: candidate.tenantId === tenantId,
    siteKey: !candidate.siteKey || candidate.siteKey === siteKey,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    route: candidate.route === route,
    path: candidate.path === route,
    canonicalUrl: candidate.canonicalUrl === canonicalUrl || candidate.seo?.canonicalUrl === canonicalUrl,
    noHomepageOrServiceAreasPayload: candidate.pageSlug !== 'home' && candidate.pageSlug !== 'service-areas',
  });
}

function defaultFormValidation(candidate) {
  const formBlock = findFormBlock(candidate);
  return withFailed({
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    noRawFormHtml: !/<\s*(form|input|textarea|select|button)\b/i.test(JSON.stringify(formBlock || {})),
    noRealEmailSending: formBlock?.content?.realEmailSendingEnabled !== true && formBlock?.content?.emailSendingEnabled !== true,
  });
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
  const dotnetOk = parsed.checks?.some((item) => item.check === 'dotnet-page-contract' && item.status === 'passed');
  const unexpectedCmsBlockers = (parsed.blockers?.cmsImport || []).filter((item) => !isExpectedPreflightBlocker(item));
  parsed.ok = shapeOk && dotnetOk && unexpectedCmsBlockers.length === 0;
  parsed.acceptedForContactCmsPromotion = parsed.ok;
  parsed.unexpectedCmsPromotionBlockers = unexpectedCmsBlockers;
  parsed.command = commandSummary(result);
  writeValidation(outputPath, parsed);
}

function isExpectedPreflightBlocker(item) {
  return /workflow\.approvedForImport|publicContactEmail|public email display policy|staticPublishing|static regeneration/i.test(`${item.field || ''} ${item.message || ''}`);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-contact-live-contract-${process.pid}-${Date.now()}`);
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

async function promoteContact(candidate) {
  state.promotion.attempted = true;
  const changeSummary = `${requestedChangeSource}: user visually approved final media-bound /contact page for live CMS/public-page state; no static generation, Azure deploy, DNS/email/provider, Theme, MediaAsset, homepage, service-areas, state-city, or Roller action.`;
  const query = new URLSearchParams({ changeSource: apiChangeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
  state.promotion.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${apiChangeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.promotion.httpStatus = response.status;
  state.promotion.performed = response.ok;
  if (response.ok) state.safety.contactWrites += 1;
  writeJson(files.writeResult, { ok: response.ok, status: response.status, endpoint: state.promotion.endpoint, page: response.json, safeText: response.safeText });
}

async function verifyAfterPromotion() {
  const [contact, homepage, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  writeJson(files.afterContact, contact.json || { httpStatus: contact.status });
  writeJson(files.homepageAfter, homepage.json || { httpStatus: homepage.status });
  writeJson(files.serviceAreasAfter, serviceAreas.json || { httpStatus: serviceAreas.status });
  writeJson(files.themeAfter, theme.json || { httpStatus: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { httpStatus: mediaAssets.status });

  const page = contact.json || {};
  const active = activePageOnly(page);
  const activeText = JSON.stringify(active);
  const formBlock = findFormBlock(page);
  const beforeRevision = state.baselines.contact.json?.revision?.revisionNumber ?? null;
  const afterRevision = page.revision?.revisionNumber ?? null;
  const mediaIds = collectValuesByKey(active, 'mediaAssetId').filter(Boolean);
  state.readback.revision = { beforeRevision, afterRevision, hasRevision: Boolean(page.revision), hasRollback: Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable) };
  state.readback.checks = {
    httpOk: contact.ok && contact.status === 200,
    routeContact: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    livePublishedState: page.isPublished === true && page.includeInSitemap === true && Boolean(page.publishedAt),
    workflowPublishedApproved: page.workflow?.status === 'published' && page.workflow?.reviewStatus === 'approved' && page.workflow?.approvedForPublish === true,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    revisionIncrementedOrRollback: Number.isFinite(beforeRevision) && Number.isFinite(afterRevision) ? afterRevision > beforeRevision : Boolean(page.revision),
    rollbackMetadataExists: Boolean(page.revision?.latestSnapshot || page.revision?.rollbackAvailable || page.revision?.rollbackNotes),
    formBlockPresent: Boolean(formBlock),
    formKey: formBlock?.content?.formKey === 'default-quote-request',
    sourcePage: formBlock?.content?.sourcePage === route,
    staticEndpointRef: formBlock?.content?.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: formBlock?.content?.leadRecipientRef === leadRecipientRef,
    selectedMailbox: activeText.includes(selectedMailbox),
    publicEmailDisplayPolicy: activeText.includes(publicEmailDisplayPolicy),
    mediaAssetIdsPersist: contactMediaAssetIds.every((id) => mediaIds.includes(id)),
    noLegacyMailbox: !activeText.includes(legacyMailbox),
    noRawCf7WordPress: !/contact-form-7|\[contact-form-7|wpcf7|\bcf7\b/i.test(activeText),
    noRealEmailSending: !/"realEmailSendingEnabled"\s*:\s*true/i.test(activeText) && !/"mailtoFallbackEnabled"\s*:\s*true/i.test(activeText) && !/"mailtoLinksEnabled"\s*:\s*true/i.test(activeText) && !/"emailSendingEnabled"\s*:\s*true/i.test(activeText),
  };
  state.readback.performed = true;
  state.readback.failed = Object.entries(state.readback.checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.ok = state.readback.failed.length === 0;

  state.formRouting.checks = {
    formBlockPresent: state.readback.checks.formBlockPresent,
    formKey: state.readback.checks.formKey,
    sourcePage: state.readback.checks.sourcePage,
    staticEndpointRef: state.readback.checks.staticEndpointRef,
    leadRecipientRef: state.readback.checks.leadRecipientRef,
    selectedMailbox: state.readback.checks.selectedMailbox,
    publicEmailDisplayPolicy: state.readback.checks.publicEmailDisplayPolicy,
    noRealEmailSending: state.readback.checks.noRealEmailSending,
    noLegacyMailbox: state.readback.checks.noLegacyMailbox,
  };
  state.formRouting.failed = Object.entries(state.formRouting.checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.formRouting.ok = state.formRouting.failed.length === 0;
  writeJson(files.readbackJson, { ok: state.readback.ok, checks: state.readback.checks, failed: state.readback.failed, revision: state.readback.revision });
  writeJson(files.formRoutingJson, { ok: state.formRouting.ok, checks: state.formRouting.checks, failed: state.formRouting.failed });

  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baselines.homepage.hash;
  state.untouched.serviceAreasUnchanged = serviceAreas.ok && serviceAreas.hash === state.baselines.serviceAreas.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;
}

async function probePublicRoutes() {
  const urls = {
    contactPublic: `${webBase}/contact`,
    homepage: `${webBase}/`,
    serviceAreas: `${webBase}/service-areas`,
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => [key, await probe(url)]));
  for (const [key, value] of entries) {
    state.routes[key] = { url: urls[key], reachable: value.reachable, status: value.status, length: value.length };
  }
  writeJson(files.publicProbe, state.routes);
}

function runHygieneChecks() {
  const taskFiles = unique([...listFiles(outputDir).filter(isTextFile), abs(rootReportRel)].filter(existsSync));
  const gitDiff = run('git', ['diff', '--check'], 120000);
  state.hygiene.results.gitDiffCheck = commandSummary(gitDiff);
  state.hygiene.results.nodeCheckRunner = commandSummary(run('node', ['--check', `${outputRel}/run-final-contact-live-cms-promotion.mjs`], 120000));
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
  writeJson(files.hygiene, state.hygiene);
}

function writeReports() {
  const validationRows = [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['production-field persistence validation', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.safePreflight)],
    ['design-system validation', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['default form validation', resultName(files.defaultForm)],
    ['default form fixtures validation', resultName(files.defaultFormFixtures)],
    ['Tailwind/navigation validation', resultName(files.tailwind)],
    ['page intake normalizer validation', resultName(files.normalizer)],
    ['unsafe HTML/CSS/form/media/email scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['route/canonical audit', resultName(files.routeCanonical)],
    ['targeted secret scan', resultName(files.secretScan)],
  ];

  writeMd(files.readme, `# Ice Final Contact Live CMS Promotion

Created: ${generatedAt}

Scope: promote \`/contact\` to live CMS/public-page state only after user visual approval of the final media-bound contact draft.

No homepage, service-areas, Theme, MediaAsset, static generation, Azure deployment, DNS/email/provider, protected config, email sending, or Roller work was included.

Public review URL:

http://localhost:3002/contact`);

  writeMd(files.preValidation, `# Pre-Promotion Validation

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], validationRows)}

Failed validation checks:

${listOrNone(state.validation.failed)}`);

  writeMd(files.baselines, `# Baseline Snapshots

- Contact before promotion: \`${files.beforeContact}\`
- Homepage before promotion: \`${files.homepageBefore}\`
- Service areas before promotion: \`${files.serviceAreasBefore}\`
- Theme before promotion: \`${files.themeBefore}\`
- MediaAssets before promotion: \`${files.mediaBefore}\`

Selected contact source/current page id: \`${state.selectedSource.pageId || 'not captured'}\`

Source mode: ${state.selectedSource.mode}`);

  writeMd(files.promotionResult, `# Contact Live CMS Promotion Result

- Promotion attempted: ${yn(state.promotion.attempted)}
- Promotion performed: ${yn(state.promotion.performed)}
- HTTP status: ${state.promotion.httpStatus ?? 'n/a'}
- Requested changeSource: \`${state.promotion.requestedChangeSource}\`
- API-supported changeSource used: \`${state.promotion.apiChangeSource}\`
- Endpoint: \`${state.promotion.endpoint || 'not attempted'}\`

CMS live/published fields changed:

${listOrNone(state.promotion.changedFields)}

Live field summary:

${table(['Field', 'Value'], Object.entries(state.promotion.liveFields).map(([key, value]) => [key, value]))}`);

  writeMd(files.readbackVerification, `# Contact Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.ok)}
- Route /contact: ${yn(state.readback.checks.routeContact)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- Revision incremented or rollback metadata exists: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- formBlock exists: ${yn(state.readback.checks.formBlockPresent)}
- Contact media IDs persist: ${yn(state.readback.checks.mediaAssetIdsPersist)}
- selectedMailbox remains contact@iceskatingrinkrentals.com: ${yn(state.readback.checks.selectedMailbox)}
- publicEmailDisplayPolicy remains form-first-under-review: ${yn(state.readback.checks.publicEmailDisplayPolicy)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}
- No raw CF7/WordPress runtime behavior: ${yn(state.readback.checks.noRawCf7WordPress)}
- No real email sending enabled: ${yn(state.readback.checks.noRealEmailSending)}

Failed checks:

${listOrNone(state.readback.failed)}`);

  writeMd(files.formRoutingVerification, `# Form Routing Verification

Form routing ok: ${yn(state.formRouting.ok)}

${table(['Check', 'Result'], Object.entries(state.formRouting.checks || {}).map(([key, value]) => [key, yn(value)]))}

Failed checks:

${listOrNone(state.formRouting.failed)}`);

  writeMd(files.publicRouteVerification, `# Public Route Verification

${table(['Route', 'URL', 'Status', 'Reachable'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked', value?.reachable ? 'yes' : 'no']))}

Expected result: public \`/contact\` returns HTTP 200 after CMS live promotion.`);

  writeMd(files.untouchedVerification, `# Untouched Routes Verification

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /service-areas unchanged: ${yn(state.untouched.serviceAreasUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- /state-city created: no`);

  writeMd(files.authLifecycle, `# Auth Lifecycle Result

- Env JWT status: ${state.auth.envStatus}
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT deleted after successful completion: ${yn(state.auth.tempDeletedAfterSuccess)}
- Temp JWT retained on failure: ${yn(state.auth.tempRetainedOnFailure)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}`);

  writeMd(files.blockers, `# Remaining Blockers

Run blockers:

${listOrNone(state.blockers)}

Before static generation:

${listOrNone(state.remainingBlockers.beforeStaticGeneration)}

Before Azure deployment:

${listOrNone(state.remainingBlockers.beforeAzureDeployment)}

Before production DNS:

${listOrNone(state.remainingBlockers.beforeProductionDns)}`);

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
    selectedSource: state.selectedSource,
    files,
    validation: state.validation,
    promotion: state.promotion,
    readback: state.readback,
    formRouting: state.formRouting,
    untouched: state.untouched,
    routes: state.routes,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempInitialStatus: state.auth.tempInitialStatus,
      tempFinalStatus: state.auth.tempJwtFinalStatus,
      tokenPrinted: false,
    },
    safety: state.safety,
    remainingBlockers: state.remainingBlockers,
    blockers: state.blockers,
  });

  writeMd(rootReportRel, `# Pumpkin Ice Final Contact Live CMS Promotion Report

Generated: ${generatedAt}

## Start

Branch: \`${state.start.branch}\`

Git status at start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Clean except existing raw contact/service-area input artifacts: ${yn(state.start.cleanExceptRawInputs)}

Recent log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Required contact output folders exist: ${yn(state.start.sourceFolders.every((item) => item.exists))}

Required contact readback artifacts exist: ${yn(state.start.sourceReadbacks.every((item) => item.exists))}

## Source

- Selected contact source/current page id: \`${state.selectedSource.pageId || 'not captured'}\`
- Source mode: ${state.selectedSource.mode}
- Source artifact reference: \`${state.selectedSource.sourceArtifact}\`

## Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], validationRows)}

## Auth

- Presence: ${state.auth.presence}
- Validation: ${state.auth.validation}
- JWT printed: no
- Temp JWT initial status: ${state.auth.tempInitialStatus}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## CMS Promotion

- Promotion performed: ${yn(state.promotion.performed)}
- HTTP status: ${state.promotion.httpStatus ?? 'n/a'}
- Requested changeSource: \`${requestedChangeSource}\`
- API-supported changeSource used: \`${apiChangeSource}\`
- Endpoint: \`${state.promotion.endpoint || 'not attempted'}\`

CMS live/published fields changed:

${listOrNone(state.promotion.changedFields)}

Live field summary:

${table(['Field', 'Value'], Object.entries(state.promotion.liveFields).map(([key, value]) => [key, value]))}

## Readback

- Readback ok: ${yn(state.readback.ok)}
- Route /contact: ${yn(state.readback.checks.routeContact)}
- Live/published state: ${yn(state.readback.checks.livePublishedState)}
- Workflow published/approved: ${yn(state.readback.checks.workflowPublishedApproved)}
- Revision/rollback result: ${yn(state.readback.checks.revisionIncrementedOrRollback && state.readback.checks.rollbackMetadataExists)}
- Contact media IDs persist: ${yn(state.readback.checks.mediaAssetIdsPersist)}
- No contactus@: ${yn(state.readback.checks.noLegacyMailbox)}
- No raw CF7/WordPress runtime behavior: ${yn(state.readback.checks.noRawCf7WordPress)}
- No real email sending enabled: ${yn(state.readback.checks.noRealEmailSending)}

## Form Block

- formBlock exists: ${yn(state.formRouting.checks.formBlockPresent)}
- formKey \`default-quote-request\`: ${yn(state.formRouting.checks.formKey)}
- sourcePage \`/contact\`: ${yn(state.formRouting.checks.sourcePage)}
- staticEndpointRef \`${staticEndpointRef}\`: ${yn(state.formRouting.checks.staticEndpointRef)}
- leadRecipientRef \`${leadRecipientRef}\`: ${yn(state.formRouting.checks.leadRecipientRef)}
- selectedMailbox \`contact@iceskatingrinkrentals.com\`: ${yn(state.formRouting.checks.selectedMailbox)}
- publicEmailDisplayPolicy \`form-first-under-review\`: ${yn(state.formRouting.checks.publicEmailDisplayPolicy)}

## Public Routes

${table(['Route', 'URL', 'Status'], Object.entries(state.routes).map(([key, value]) => [key, value?.url || 'n/a', value?.status ?? 'not checked']))}

## Untouched Results

- Homepage / untouched: ${yn(state.untouched.homepageUnchanged)}
- /service-areas untouched: ${yn(state.untouched.serviceAreasUnchanged)}
- Theme untouched: ${yn(state.untouched.themeUnchanged)}
- MediaAssets untouched: ${yn(state.untouched.mediaAssetsUnchanged)}

## Hygiene

- git diff --check: ${state.hygiene.results.gitDiffCheck ? yn(state.hygiene.results.gitDiffCheck.ok) : 'not run'}
- node --check runner: ${state.hygiene.results.nodeCheckRunner ? yn(state.hygiene.results.nodeCheckRunner.ok) : 'not run'}
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

${listOrNone(state.remainingBlockers.beforeStaticGeneration)}

Before Azure deployment:

${listOrNone(state.remainingBlockers.beforeAzureDeployment)}

Before production DNS:

${listOrNone(state.remainingBlockers.beforeProductionDns)}

## Next Recommended Action

Review public \`http://localhost:3002/contact\` locally. Request separate authorization before static generation, Azure deployment, DNS/provider/email work, or Roller work.`);
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
  return scanPatterns(paths, [
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
  ]);
}

function stringScan(paths, needle) {
  const hits = paths.filter((file) => readFileSync(abs(file), 'utf8').includes(needle)).map((file) => ({ path: file }));
  return { ok: hits.length === 0, hits };
}

function secretScan(paths) {
  return scanPatterns(paths.filter((file) => existsSync(abs(file)) && isTextFile(abs(file))), [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt-value', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['smtp-secret', /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD)\b\s*[:=]/i],
  ]);
}

function scanPatterns(paths, patterns) {
  const hits = [];
  for (const file of paths) {
    const text = readFileSync(abs(file), 'utf8');
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push({ path: file, code });
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
    const file = line.slice(3).replace(/^"|"$/g, '').replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) continue;
    if (file.startsWith('content-review/ice-final-contact-input/') || file.startsWith('content-review/ice-service-areas-input/')) allowedReferenceRaw.push(file);
    else rawHits.push(file);
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
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, index) => {
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

function blocksOf(page) {
  return Array.isArray(page?.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
}

function findFormBlock(page) {
  return blocksOf(page).find((block) => block.type === 'formBlock' || block.id === 'contact-quote-form') || null;
}

function collectValuesByKey(value, key, out = []) {
  if (Array.isArray(value)) value.forEach((item) => collectValuesByKey(item, key, out));
  else if (value && typeof value === 'object') {
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

function diffLifecycleFields(source, candidate) {
  const fields = [
    'route',
    'path',
    'canonicalUrl',
    'seo.robots',
    'isPublished',
    'includeInSitemap',
    'publishedAt',
    'workflow.status',
    'workflow.reviewStatus',
    'workflow.approvedForPublish',
    'workflow.approvedBy',
    'workflow.approvedAt',
    'workflow.lastEditedBy',
    'workflow.lastEditedAt',
    'staticPublishing.staticEligible',
    'staticPublishing.needsRebuild',
    'staticPublishing.deploymentStatus',
    'revision.revisionLabel',
    'revision.lastChangeSource',
    'revision.lastChangeSummary',
  ];
  return fields.filter((field) => stableStringify(getPath(source, field)) !== stableStringify(getPath(candidate, field)));
}

function summarizeLiveFields(page) {
  return {
    pageSlug: page.pageSlug,
    route: page.route,
    path: page.path,
    isPublished: page.isPublished,
    includeInSitemap: page.includeInSitemap,
    workflowStatus: page.workflow?.status,
    workflowReviewStatus: page.workflow?.reviewStatus,
    approvedForPublish: page.workflow?.approvedForPublish,
    staticEligible: page.staticPublishing?.staticEligible,
    needsRebuild: page.staticPublishing?.needsRebuild,
    deploymentStatus: page.staticPublishing?.deploymentStatus,
  };
}

function mediaAssetsFrom(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.mediaAssets)) return value.mediaAssets;
  return [];
}

function cleanExceptRawInputs() {
  const lines = state.start.gitStatusShort.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return true;
  return lines.every((line) => {
    if (!line.startsWith('?? ')) return false;
    const file = line.slice(3).replace(/^"|"$/g, '').replace(/\\/g, '/');
    return file.startsWith('content-review/ice-final-contact-input/') || file.startsWith('content-review/ice-service-areas-input/');
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
  return spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', timeout, shell: false, windowsHide: true });
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
