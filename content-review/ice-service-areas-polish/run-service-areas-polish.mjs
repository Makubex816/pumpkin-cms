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
const outputRel = 'content-review/ice-service-areas-polish';
const outputDir = path.join(repoRoot, outputRel);
const rootReportRel = 'PUMPKIN_ICE_SERVICE_AREAS_POLISH_REPORT.md';
const sourceCandidateRel = 'content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json';
const sourceReadbackRel = 'content-review/ice-service-areas-local-draft-import/service-areas-readback-after-import.json';
const mediaSnapshotRel = 'content-review/ice-service-areas-local-draft-import/media-assets-before-service-areas-import.snapshot.json';
const polishedCandidateRel = `${outputRel}/SERVICE_AREAS_POLISHED_CANDIDATE.json`;
const polishedPackageRel = `${outputRel}/SERVICE_AREAS_POLISHED_PACKAGE.json`;
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
const changeSource = 'service_areas_polish_import';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const generatedAt = new Date().toISOString();

const ppecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
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
  audit: `${outputRel}/SERVICE_AREAS_POLISH_AUDIT.md`,
  ppecLogo: `${outputRel}/PPEC_LOGO_BINDING_RESULT.md`,
  removedFuture: `${outputRel}/REMOVED_FUTURE_LOCAL_PAGES_SECTION.md`,
  placeholder: `${outputRel}/EMPTY_PLACEHOLDER_REVIEW.md`,
  cta: `${outputRel}/CTA_WORDING_UPDATE.md`,
  wording: `${outputRel}/SERVICE_AREAS_WORDING_REVIEW.md`,
  validationMd: `${outputRel}/VALIDATION_RESULTS.md`,
  importMd: `${outputRel}/IMPORT_RESULT.md`,
  frontend: `${outputRel}/FRONTEND_PREVIEW_CHECKLIST.md`,
  blockers: `${outputRel}/REMAINING_BLOCKERS.md`,
  candidate: polishedCandidateRel,
  package: polishedPackageRel,
  manifest: `${outputRel}/manifest.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  contractPersistence: `${outputRel}/contract-persistence-validation-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  preflight: `${outputRel}/safe-import-preflight-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
  homepageBefore: `${outputRel}/homepage-before-polish-import.snapshot.json`,
  contactBefore: `${outputRel}/contact-before-polish-import.snapshot.json`,
  serviceAreasBefore: `${outputRel}/service-areas-before-polish-import.snapshot.json`,
  themeBefore: `${outputRel}/theme-before-polish-import.snapshot.json`,
  mediaBefore: `${outputRel}/media-assets-before-polish-import.snapshot.json`,
  writeResult: `${outputRel}/service-areas-polish-write-result.json`,
  serviceAreasReadback: `${outputRel}/service-areas-readback-after-polish-import.json`,
  homepageAfter: `${outputRel}/homepage-after-polish-import.readonly.json`,
  contactAfter: `${outputRel}/contact-after-polish-import.readonly.json`,
  themeAfter: `${outputRel}/theme-after-polish-import.readonly.json`,
  mediaAfter: `${outputRel}/media-assets-after-polish-import.readonly.json`,
  readbackVerification: `${outputRel}/readback-verification-result.json`,
  frontendProbe: `${outputRel}/frontend-preview-probe-result.json`,
  hygiene: `${outputRel}/final-hygiene-result.json`,
};

let jwt = '';
const state = {
  schemaVersion: 'pumpkin.ice.service-areas-polish.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
    candidateFile: { path: sourceCandidateRel, exists: existsSync(abs(sourceCandidateRel)) },
    readbackFile: { path: sourceReadbackRel, exists: existsSync(abs(sourceReadbackRel)) },
    ppecLogoEvidence: [],
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
    findings: {},
    sourceBlockCount: 0,
    polishedBlockCount: 0,
  },
  validation: {
    ok: false,
    results: {},
    failed: [],
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
    httpStatus: null,
    endpoint: '',
    method: 'PUT',
    safeText: '',
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
    homepageWrite: false,
    contactWrite: false,
    serviceAreasWrite: false,
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
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(outputDir, { recursive: true });

  try {
    state.start.api = await probe(apiBase);
    state.start.ppecLogoEvidence = findPpecLogoEvidence();
    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable at http://localhost:5064.');
    if (!state.start.candidateFile.exists) throw new Error(`Missing source candidate: ${sourceCandidateRel}.`);
    if (!state.start.readbackFile.exists) throw new Error(`Missing source readback: ${sourceReadbackRel}.`);
    if (!state.start.ppecLogoEvidence.length) throw new Error('PPEC logo MediaAsset ID was not found in known local records/reports.');

    const { candidate, pkg, audit } = buildPolishedArtifacts();
    state.audit = audit;
    writeJson(files.candidate, candidate);
    writeJson(files.package, pkg);

    runValidation();
    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence === 'PRESENT') {
      await validateJwt();
    }
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);

    if (!state.validation.ok) throw new Error(`Validation failed: ${state.validation.failed.join(', ')}.`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaselines();
    await writeServiceAreas(candidate);
    if (!state.import.performed) throw new Error(`Service-areas polish import failed with HTTP ${state.import.httpStatus}.`);

    await verifyAfterWrite(candidate);
    if (!state.readback.ok) throw new Error(`Readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((item) => item === true)) throw new Error('Untouched homepage/contact/theme/media verification failed.');

    await probeFrontend();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  runHygieneChecks();
  if (!state.hygiene.ok) {
    state.blockers.push(`Final hygiene failed: ${state.hygiene.failed.join(', ')}.`);
  }

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
    validationOk: state.validation.ok,
    importPerformed: state.import.performed,
    importStatus: state.import.httpStatus,
    readbackOk: state.readback.ok,
    untouched: state.untouched,
    frontend: state.frontend.results,
    hygieneOk: state.hygiene.ok,
    blockers: state.blockers,
    report: rootReportRel,
    outputFolder: outputRel,
  }, null, 2));

  if (!state.success) process.exitCode = 1;
}

function buildPolishedArtifacts() {
  const source = readJson(sourceCandidateRel);
  const sourceBlocks = blocksOf(source);
  const ppecAsset = getPpecLogoAsset();
  const now = new Date().toISOString();
  const page = clone(source);

  page.schemaVersion = page.schemaVersion || 'pumpkin-page-v1';
  page.candidateVersion = 'phase11c-service-areas-polished-draft';
  page.id = 'ice-rink-rentals-service-areas';
  page.PageId = 'ice-rink-rentals-service-areas';
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.domain = 'iceskatingrinkrentals.com';
  page.route = route;
  page.path = route;
  page.slug = pageSlug;
  page.pageSlug = pageSlug;
  page.PageSlug = pageSlug;
  page.canonicalUrl = canonicalUrl;
  page.isPublished = false;
  page.includeInSitemap = false;
  page.publishedAt = null;
  page.productionApproved = false;
  page.publishApproved = false;

  page.reviewMetadata = {
    ...(page.reviewMetadata || {}),
    polishedAt: now,
    scope: 'service-areas-polish-draft-only',
    cmsImportApproved: true,
    visualApprovalRequired: true,
    cityPagesCreated: false,
    futureLocalPagesSectionRemoved: true,
    ppecLogoMediaAssetId: ppecLogoId,
    rollerPaused: true,
  };

  page.MetaData = {
    ...(page.MetaData || {}),
    description: 'Review portable ice rink rental service areas across the United States and request availability review for your event city, date, venue, and support needs.',
    updatedAt: now,
  };
  page.searchData = {
    ...(page.searchData || {}),
    contentSummary: 'Service areas page candidate explaining United States request review, route feasibility, and the quote path without unsupported local claims or future city-page explanation.',
    blockTypes: sourceBlocks.filter((block) => block.id !== 'future-city-pages').map((block) => block.type),
  };

  page.ContentData = {
    ...(page.ContentData || {}),
    ContentBlocks: sourceBlocks
      .filter((block) => block.id !== 'future-city-pages')
      .map((block) => polishBlock(block, ppecAsset)),
  };

  page.media = {
    ...(page.media || {}),
    ppecPartnerLogo: mediaFieldFromAsset(ppecAsset),
  };
  for (const key of ['hero', 'corporate', 'holiday', 'setup', 'sourceMediaManifest']) {
    if (page.media && isEmptyMediaSlot(page.media[key])) delete page.media[key];
  }

  page.fulfillment = {
    ...(page.fulfillment || {}),
    fulfillmentStatus: 'service-areas-polish-review',
    manualReviewRequired: true,
    primaryPartnerAvailable: false,
  };
  page.pageQuality = {
    ...(page.pageQuality || {}),
    status: 'needs_review',
    warnings: [
      'Human visual approval is required before CMS/live approval.',
      'Static generation is not authorized in this polish run.',
      'Public service areas page remains draft/needs_review until separate live approval.',
    ],
    blockingIssues: [],
    lastCheckedAt: now,
    uniqueValueReason: 'Polished service areas draft with real PPEC logo binding, no future local pages card, and quote-first copy.',
    buyerIntent: 'portable ice rink rental service areas and route feasibility review',
    launchNotes: 'Polish draft only. Do not publish, regenerate static, deploy, or index without separate approval.',
  };
  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedForImport: false,
    productionApproved: false,
    publishApproved: false,
    lastEditedBy: 'codex_service_areas_polish',
    lastEditedAt: now,
  };
  page.revision = {
    ...(page.revision || {}),
    revisionLabel: 'phase11c-service-areas-polish',
    rollbackNotes: page.revision?.rollbackNotes || 'Polished local draft update prepared; CMS update path should create rollback snapshot.',
    lastChangeSummary: 'Polish /service-areas draft: bind PPEC logo, remove future local pages card, clarify CTA/wording, no live/static/provider action.',
    lastChangeSource: changeSource,
    lastChangeAt: now,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: 'not_generated',
    productionApproved: false,
  };
  page.template = {
    ...(page.template || {}),
    templateKey: 'ice-service-areas-phase11c-polished',
    templateVersion: 'phase11c-polished-draft.v1',
    layoutVariant: 'service-areas-polish-draft',
    contentModelVersion: 'phase11c-service-areas-polish.v1',
  };
  page.linking = {
    ...(page.linking || {}),
    hubPage: '/',
    parentPage: '/',
    relatedPages: ['/', '/contact'],
    requiredLinks: ['/', '/contact'],
    breadcrumbTrail: ['/', '/service-areas'],
    cityPagesCreated: false,
  };
  delete page.linking.futureCityPagePattern;
  if (page.serviceSchema) {
    page.serviceSchema = {
      ...page.serviceSchema,
      serviceName: 'Portable Ice Rink Rental Service Areas Review',
      notes: 'No city, state-city, or local service page was created in this polish run.',
    };
  }
  page.formConfig = {
    ...(page.formConfig || {}),
    emailSubjectTemplate: 'Portable ice rink service areas inquiry',
    thankYouUrl: '/contact',
  };
  page.domainRouting = {
    ...(page.domainRouting || {}),
    publicContactEmail: '',
    publicEmailDisplayPolicy,
    selectedMailbox,
    selectedMailboxMetadata: selectedMailbox,
    contactPageSlug: 'contact',
    mailtoLinksEnabled: false,
  };

  removeFutureCityMetadata(page);
  polishServiceAreasWording(page);

  const pkg = {
    schemaVersion: 'pumpkin.ice.service-areas-polished-package.v1',
    generatedAt: now,
    tenantId,
    siteKey,
    route,
    canonicalUrl,
    sourceCandidate: sourceCandidateRel,
    sourceReadback: sourceReadbackRel,
    candidatePath: polishedCandidateRel,
    pages: [page],
    safety: {
      draftOnly: true,
      productionApproved: false,
      publishApproved: false,
      staticPublishingNeedsRebuild: true,
      cmsWritesRequireValidAdminJwt: true,
      noImageGeneration: true,
      noMediaAssetWrites: true,
      noStaticGeneration: true,
      noDeployment: true,
      rollerPaused: true,
    },
  };

  const audit = auditCandidate(source, page);
  return { candidate: page, pkg, audit };
}

function polishBlock(block, ppecAsset) {
  const next = clone(block);
  const content = next.content || {};

  if (next.id === 'service-areas-hero') {
    content.headline = 'Portable ice rink rental service areas across the United States';
    content.secondaryCta = { ...(content.secondaryCta || {}), label: 'Request a Quote', href: '/contact' };
    content.secondaryButtonText = 'Request a Quote';
    content.secondaryButtonLink = '/contact';
    content.supportingPoints = [
      'United States request review',
      'Quote-first availability confirmation',
      'Route feasibility reviewed before confirmation',
    ];
  }

  if (next.id === 'coverage-summary-band' && Array.isArray(content.items)) {
    content.items = content.items
      .filter((item) => item.title !== 'Approved market rollout')
      .map((item) => polishTextObject(item));
  }

  if (next.id === 'regional-request-planning' && Array.isArray(content.topics)) {
    content.topics = content.topics
      .filter((item) => item.title !== 'Approved city pages')
      .map((item) => polishTextObject(item));
  }

  if (next.id === 'coverage-review') {
    content.subtitle = 'A strong service areas request includes enough details to understand the venue, timing, route, surface, and guest-support needs.';
  }

  if (next.id === 'partner-party-pros-east-coast-service-areas') {
    content.partner = {
      ...(content.partner || {}),
      name: 'Party Pros East Coast',
      displayRole: 'Event entertainment partner resource',
      url: 'https://partyproseastcoast.com/',
      urlSource: 'phase11c-service-areas-polish',
      logoMedia: mediaFieldFromAsset(ppecAsset),
    };
    content.logoMedia = mediaFieldFromAsset(ppecAsset);
    content.partnerLogoMediaAssetId = ppecLogoId;
  }

  if (next.id === 'service-area-use-cases') {
    next.id = 'service-areas-use-cases';
    next.name = 'Service Areas Use Cases';
    content.subtitle = 'The strongest service areas requests have a defined venue, clear event timing, a realistic setup area, and enough attendance detail to match the rink plan to the guest experience.';
  }

  if (next.id === 'service-areas-faq' && Array.isArray(content.items)) {
    content.eyebrow = 'Service areas questions';
    content.items = content.items
      .filter((item) => item.question !== 'Will future city pages use /state-city?')
      .map((item) => {
        const polished = polishTextObject(item);
        if (polished.question === 'Why are city pages not listed yet?') {
          polished.answer = 'City and regional pages are not listed while local market language remains under review. Use the quote form to share a specific city, state, date, and venue so the request can be reviewed.';
        }
        return polished;
      });
  }

  if (next.id === 'service-areas-final-cta') {
    content.buttonText = 'Request a Quote';
  }

  next.content = polishTextObject(content);
  return next;
}

function polishTextObject(value) {
  if (Array.isArray(value)) return value.map(polishTextObject);
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? polishVisibleText(value) : value;
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, polishTextObject(child)]));
}

function polishVisibleText(text) {
  return text
    .replace(/service-area request/g, 'service areas request')
    .replace(/service-area requests/g, 'service areas requests')
    .replace(/service-area page/g, 'service areas page')
    .replace(/service-area pages/g, 'service areas pages')
    .replace(/service-area planning/g, 'service areas planning')
    .replace(/service-area copy/g, 'service areas copy')
    .replace(/service-area wording/g, 'service areas wording')
    .replace(/Service-area questions/g, 'Service areas questions')
    .replace(/Service-Area Review/g, 'Service Areas Review')
    .replace(/service-area review/g, 'service areas review')
    .replace(/Service-Area/g, 'Service Areas');
}

function removeFutureCityMetadata(page) {
  const textKeys = ['pageQuality', 'serviceSchema', 'importProvenance', 'reviewMetadata'];
  for (const key of textKeys) {
    if (!page[key]) continue;
    deepDeleteKeys(page[key], ['futureCityPagePattern']);
  }
  page.pageQuality.warnings = (page.pageQuality.warnings || []).filter((item) => !/city|state-city/i.test(item));
  page.searchData.tags = (page.searchData.tags || []).filter((item) => !/city|state-city/i.test(item));
  page.searchData.secondaryKeywords = (page.searchData.secondaryKeywords || []).filter((item) => !/near me/i.test(item));
}

function polishServiceAreasWording(page) {
  const paths = [
    ['MetaData', 'description'],
    ['seo', 'metaDescription'],
    ['seo', 'openGraph', 'og:description'],
    ['seo', 'twitter', 'twitter:description'],
  ];
  for (const pathParts of paths) {
    const value = getPathParts(page, pathParts);
    if (typeof value === 'string') setPathParts(page, pathParts, polishVisibleText(value));
  }
}

function auditCandidate(source, polished) {
  const sourceBlocks = blocksOf(source);
  const polishedBlocks = blocksOf(polished);
  const sourceText = JSON.stringify(source);
  const polishedText = JSON.stringify(polished);
  const ppecSource = sourceBlocks.find((block) => block.id === 'partner-party-pros-east-coast-service-areas');
  const ppecPolished = polishedBlocks.find((block) => block.id === 'partner-party-pros-east-coast-service-areas');
  const renderedEmptySource = findRenderedEmptyMedia(source);
  const renderedEmptyPolished = findRenderedEmptyMedia(polished);

  return {
    sourceBlockCount: sourceBlocks.length,
    polishedBlockCount: polishedBlocks.length,
    findings: {
      ppecSectionFound: Boolean(ppecSource),
      ppecSourceHadLogoMedia: JSON.stringify(ppecSource || {}).includes(ppecLogoId),
      ppecPolishedLogoMediaAssetId: ppecPolished?.content?.partner?.logoMedia?.mediaAssetId || '',
      futureLocalPagesBlockFound: sourceBlocks.some((block) => block.id === 'future-city-pages'),
      futureLocalPagesBlockRemoved: !polishedBlocks.some((block) => block.id === 'future-city-pages'),
      renderedEmptyMediaBefore: renderedEmptySource,
      renderedEmptyMediaAfter: renderedEmptyPolished,
      ctaBefore: sourceText.includes('How Coverage Is Reviewed') ? 'How Coverage Is Reviewed' : '',
      ctaAfter: polishedText.includes('How Coverage Is Reviewed') ? 'still-present' : 'Request a Quote',
      stateCityBefore: sourceText.includes('/state-city'),
      stateCityAfter: polishedText.includes('/state-city'),
      visibleServiceAreaHyphenCountBefore: countMatches(sourceText, /service-area/gi),
      visibleServiceAreaHyphenCountAfter: countMatches(polishedText, /service-area/gi),
      noContactusAfter: !polishedText.includes(legacyMailbox),
    },
  };
}

function runValidation() {
  const candidate = readJson(files.candidate);
  const packageJson = readJson(files.package);
  writeValidation(files.jsonParse, jsonParseValidation([files.candidate, files.package]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate, packageJson));
  runImportPreflight();
  runDotNetContract(files.candidate);
  runContractPersistence();
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runSimpleCommand(files.tailwind, ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand(files.normalizer, ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);
  writeValidation(files.unsafeScan, unsafeScan([files.candidate, files.package]));
  writeValidation(files.contactusScan, stringScan([files.candidate, files.package], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.candidate, files.package]));

  const required = [
    files.jsonParse,
    files.productionPersistence,
    files.preflight,
    files.dotnet,
    files.contractPersistence,
    files.designSystem,
    files.mediaValidation,
    files.tailwind,
    files.normalizer,
    files.unsafeScan,
    files.contactusScan,
    files.secretScan,
  ];
  state.validation.failed = required
    .filter((file) => state.validation.results[path.basename(file)]?.ok !== true)
    .map((file) => path.basename(file));
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(candidate, pkg) {
  const text = JSON.stringify(activePageOnly(candidate));
  const blocks = blocksOf(candidate);
  const mediaIds = collectValuesByKey(activePageOnly(candidate), 'mediaAssetId').filter(Boolean);
  const ppecBlock = blocks.find((block) => block.id === 'partner-party-pros-east-coast-service-areas');
  const futureHits = [
    text.includes('Future local pages'),
    text.includes('City pages will be added after market approval'),
    text.includes('/state-city'),
    blocks.some((block) => block.id === 'future-city-pages'),
  ];
  const checks = {
    route: candidate.route === route,
    path: candidate.path === route,
    slug: candidate.slug === pageSlug && candidate.pageSlug === pageSlug,
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    draftNeedsReview: candidate.isPublished === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: candidate.productionApproved === false && candidate.workflow?.productionApproved === false,
    publishApprovedFalse: candidate.publishApproved === false && candidate.workflow?.publishApproved === false && candidate.workflow?.approvedForPublish === false,
    staticNeedsRebuildTrue: candidate.staticPublishing?.needsRebuild === true,
    staticEligibleFalse: candidate.staticPublishing?.staticEligible === false,
    ppecLogoBound: ppecBlock?.content?.partner?.logoMedia?.mediaAssetId === ppecLogoId && candidate.media?.ppecPartnerLogo?.mediaAssetId === ppecLogoId,
    futureLocalPagesRemoved: futureHits.every((hit) => hit === false),
    noRenderedEmptyMedia: findRenderedEmptyMedia(candidate).length === 0,
    ctaWordingUpdated: !text.includes('How Coverage Is Reviewed') && text.includes('Request a Quote'),
    noLegacyMailbox: !text.includes(legacyMailbox),
    selectedMailbox: !text.includes('selectedMailbox') || text.includes(selectedMailbox),
    publicEmailDisplayPolicy: !text.includes('publicEmailDisplayPolicy') || text.includes(publicEmailDisplayPolicy),
    noFakeMediaIds: mediaIds.length > 0 && mediaIds.every((id) => officialMediaIds.has(id)),
    noFakeUrls: !/https?:\/\/(example\.com|localhost|127\.0\.0\.1)/i.test(text) && !/fake|placeholder/i.test(text),
    noBase64: !/base64|data:image\//i.test(text),
    noRawFormHtml: !/<form\b|<input\b|<textarea\b|<select\b/i.test(text),
    noUnsupportedEastCoastClaim: !/\bEast Coast\b/i.test(text.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand')),
    packageIncludesCandidate: Array.isArray(pkg.pages) && pkg.pages.length === 1 && pkg.pages[0].pageSlug === pageSlug,
    revisionMetadataPresent: Boolean(candidate.revision?.rollbackNotes && candidate.revision?.lastChangeSource === changeSource),
  };
  return withFailed(checks);
}

function runImportPreflight() {
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', files.candidate,
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

function runDotNetContract(candidateRel) {
  const scratch = path.join(os.tmpdir(), `pumpkin-service-areas-polish-contract-${process.pid}-${Date.now()}`);
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

function runContractPersistence() {
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', files.candidate,
    '--output', files.contractPersistence,
  ], 120000);
  const parsed = existsSync(abs(files.contractPersistence)) ? readJson(files.contractPersistence) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  writeValidation(files.contractPersistence, parsed);
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
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage(pageSlug),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  if (!contact.ok) throw new Error(`Contact baseline read failed with HTTP ${contact.status}.`);
  if (!serviceAreas.ok) throw new Error(`Service-areas baseline read failed with HTTP ${serviceAreas.status}.`);
  if (!theme.ok) throw new Error(`Theme baseline read failed with HTTP ${theme.status}.`);
  if (!mediaAssets.ok) throw new Error(`MediaAsset baseline read failed with HTTP ${mediaAssets.status}.`);
  state.baselines = { captured: true, homepage, contact, serviceAreas, theme, mediaAssets };
  writeJson(files.homepageBefore, homepage.json);
  writeJson(files.contactBefore, contact.json);
  writeJson(files.serviceAreasBefore, serviceAreas.json);
  writeJson(files.themeBefore, theme.json);
  writeJson(files.mediaBefore, mediaAssets.json);
}

async function writeServiceAreas(candidate) {
  state.import.attempted = true;
  const changeSummary = 'Polish /service-areas draft: bind PPEC logo, remove future local pages card, clarify CTA and service areas wording; no live/static/provider action.';
  const query = new URLSearchParams({ changeSource, changeSummary });
  const endpoint = `/api/admin/pages/${tenantId}/${encodeURIComponent(pageSlug)}?${query}`;
  state.import.endpoint = `PUT /api/admin/pages/${tenantId}/${pageSlug}?changeSource=${changeSource}`;
  const response = await apiJson(endpoint, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.import.httpStatus = response.status;
  state.import.safeText = response.safeText;
  state.import.performed = response.ok;
  state.safety.serviceAreasWrite = response.ok;
  writeJson(files.writeResult, {
    ok: response.ok,
    status: response.status,
    method: 'PUT',
    endpoint: state.import.endpoint,
    safeText: response.safeText,
    page: response.json,
  });
}

async function verifyAfterWrite(candidate) {
  const [serviceAreas, homepage, contact, theme, mediaAssets] = await Promise.all([
    getPage(pageSlug),
    getPage('home'),
    getPage('contact'),
    apiJson(`/api/admin/themes/${tenantId}`, { token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { token: jwt }),
  ]);
  writeJson(files.serviceAreasReadback, serviceAreas.json || { httpStatus: serviceAreas.status });
  writeJson(files.homepageAfter, homepage.json || { httpStatus: homepage.status });
  writeJson(files.contactAfter, contact.json || { httpStatus: contact.status });
  writeJson(files.themeAfter, theme.json || { httpStatus: theme.status });
  writeJson(files.mediaAfter, mediaAssets.json || { httpStatus: mediaAssets.status });

  const page = serviceAreas.json || {};
  const text = JSON.stringify(activePageOnly(page));
  const blocks = blocksOf(page);
  const candidateText = JSON.stringify(candidate);
  const checks = {
    httpOk: serviceAreas.ok && serviceAreas.status === 200,
    route: page.pageSlug === pageSlug && (!page.route || page.route === route) && (!page.path || page.path === route),
    draftNeedsReview: page.isPublished === false && page.workflow?.status === 'draft' && page.workflow?.reviewStatus === 'needs_review',
    productionApprovedFalse: page.productionApproved !== true && page.workflow?.productionApproved !== true,
    publishApprovedFalse: page.publishApproved !== true && page.workflow?.publishApproved !== true && page.workflow?.approvedForPublish === false,
    staticNeedsRebuildTrue: page.staticPublishing?.needsRebuild === true,
    ppecLogoPersists: text.includes(ppecLogoId),
    futureLocalPagesRemoved: !text.includes('Future local pages') && !text.includes('City pages will be added after market approval') && !blocks.some((block) => block.id === 'future-city-pages'),
    stateCityRemovedFromActiveDraft: !text.includes('/state-city'),
    noRenderedEmptyMedia: findRenderedEmptyMedia(page).length === 0,
    ctaWordingUpdated: !text.includes('How Coverage Is Reviewed') && text.includes('Request a Quote'),
    serviceAreasWordingPolished: !text.includes('service-area page') && !text.includes('Service-area questions'),
    noLegacyMailbox: !text.includes(legacyMailbox),
    selectedMailbox: !text.includes('selectedMailbox') || text.includes(selectedMailbox),
    publicEmailDisplayPolicy: !text.includes('publicEmailDisplayPolicy') || text.includes(publicEmailDisplayPolicy),
    noCandidateDriftForCoreFixes: candidateText.includes(ppecLogoId) && !candidateText.includes('Future local pages') && !candidateText.includes('How Coverage Is Reviewed'),
  };
  state.readback.performed = true;
  state.readback.checks = checks;
  state.readback.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback.ok = state.readback.failed.length === 0;
  state.untouched.homepageUnchanged = homepage.ok && homepage.hash === state.baselines.homepage.hash;
  state.untouched.contactUnchanged = contact.ok && contact.hash === state.baselines.contact.hash;
  state.untouched.themeUnchanged = theme.ok && theme.hash === state.baselines.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.ok && mediaAssets.hash === state.baselines.mediaAssets.hash;
  writeJson(files.readbackVerification, {
    ok: state.readback.ok,
    checks,
    failed: state.readback.failed,
    untouched: state.untouched,
  });
}

async function probeFrontend() {
  const urls = {
    preview: `${webBase}/__preview/ice-rink-rentals/service-areas`,
    publicServiceAreas: `${webBase}/service-areas`,
  };
  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => [key, await probe(url)]));
  state.frontend.checked = true;
  state.frontend.results = Object.fromEntries(entries.map(([key, value]) => [key, {
    url: urls[key],
    reachable: value.reachable,
    status: value.status,
    length: value.length,
  }]));
  writeJson(files.frontendProbe, state.frontend);
}

function runHygieneChecks() {
  const taskFiles = [
    ...listFiles(outputDir).filter(isTextFile),
    abs(rootReportRel),
  ].filter(existsSync);
  const gitDiff = run('git', ['diff', '--check'], 120000);
  state.hygiene.results.gitDiffCheck = commandSummary(gitDiff);
  state.hygiene.results.trailingWhitespaceScan = trailingWhitespaceScan(taskFiles);
  state.hygiene.results.protectedGeneratedRawArtifactPathCheck = protectedGeneratedRawArtifactPathCheck();
  state.hygiene.results.targetedSecretScan = secretScan(taskFiles);
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
  writeMd(files.readme, renderReadme());
  writeMd(files.audit, renderAudit());
  writeMd(files.ppecLogo, renderPpecLogo());
  writeMd(files.removedFuture, renderRemovedFuture());
  writeMd(files.placeholder, renderPlaceholder());
  writeMd(files.cta, renderCta());
  writeMd(files.wording, renderWording());
  writeMd(files.validationMd, renderValidation());
  writeMd(files.importMd, renderImport());
  writeMd(files.frontend, renderFrontend());
  writeMd(files.blockers, renderBlockers());
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
    candidate: polishedCandidateRel,
    package: polishedPackageRel,
    importPerformed: state.import.performed,
    readbackOk: state.readback.ok,
    validationOk: state.validation.ok,
    safety: state.safety,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tokenPrinted: false,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
  });
  writeMd(rootReportRel, renderRootReport());
}

function renderReadme() {
  return `# Ice Service Areas Polish

Created: ${generatedAt}

This package contains the polished local draft candidate for IceSkatingRinkRentals.com \`/service-areas\`.

## Scope

- Route: \`/service-areas\`
- Status: draft/needs_review only
- CMS write: ${yn(state.import.performed)}
- Static generation: no
- Deployment: no
- Image generation or image editing: no
- MediaAsset record updates: no
- Roller touched: no

## Required Review URL

http://localhost:3002/__preview/ice-rink-rentals/service-areas`;
}

function renderAudit() {
  const f = state.audit.findings || {};
  return `# Service Areas Polish Audit

## Current Findings

- PPEC section/card found: ${yn(f.ppecSectionFound)}
- PPEC source had logo MediaAsset: ${yn(f.ppecSourceHadLogoMedia)}
- Future local pages block found before polish: ${yn(f.futureLocalPagesBlockFound)}
- Rendered empty media findings before polish: ${listInline(f.renderedEmptyMediaBefore)}
- \`How Coverage Is Reviewed\` found before polish: ${yn(f.ctaBefore === 'How Coverage Is Reviewed')}
- \`/state-city\` references before polish: ${yn(f.stateCityBefore)}
- Source block count: ${state.audit.sourceBlockCount ?? 'n/a'}

## Polished Findings

- PPEC polished logo MediaAsset ID: \`${f.ppecPolishedLogoMediaAssetId || 'not-bound'}\`
- Future local pages block removed: ${yn(f.futureLocalPagesBlockRemoved)}
- Rendered empty media findings after polish: ${listInline(f.renderedEmptyMediaAfter)}
- CTA after polish: ${f.ctaAfter || 'n/a'}
- \`/state-city\` references after polish: ${yn(f.stateCityAfter)}
- Polished block count: ${state.audit.polishedBlockCount ?? 'n/a'}`;
}

function renderPpecLogo() {
  const f = state.audit.findings || {};
  return `# PPEC Logo Binding Result

- Requested MediaAsset ID: \`${ppecLogoId}\`
- Evidence found in known records/reports: ${yn(state.start.ppecLogoEvidence.length > 0)}
- Bound in polished PPEC partner block: ${yn(f.ppecPolishedLogoMediaAssetId === ppecLogoId)}
- New MediaAsset created: no
- Image generated or edited: no

The polished candidate binds the logo through \`content.partner.logoMedia\` and \`media.ppecPartnerLogo\`, matching the existing renderer expectation.`;
}

function renderRemovedFuture() {
  const f = state.audit.findings || {};
  return `# Removed Future Local Pages Section

- Source block ID removed: \`future-city-pages\`
- Source copy removed: \`Future local pages\`
- Source \`/state-city\` explanation removed from visible page copy: ${yn(!f.stateCityAfter)}
- City/state pages created: no

The page now relies on quote/contact flow for specific location interest instead of explaining future local city pages.`;
}

function renderPlaceholder() {
  const f = state.audit.findings || {};
  return `# Empty Placeholder Review

## Before

Rendered empty media candidates:

${listOrNone(f.renderedEmptyMediaBefore)}

## After

Rendered empty media candidates:

${listOrNone(f.renderedEmptyMediaAfter)}

The normalized polished candidate avoids model-injected empty media defaults and keeps only meaningful rendered media slots. The PPEC card now has a real logo asset, the hero/split/media cards retain approved existing MediaAssets, and the future local pages card was removed.`;
}

function renderCta() {
  return `# CTA Wording Update

- Original wording: \`How Coverage Is Reviewed\`
- Updated label: \`Request a Quote\`
- Updated href: \`/contact\`
- Reason: the preferred quote CTA is clearer and aligns the service areas page with form-first lead handling.`;
}

function renderWording() {
  return `# Service Areas Wording Review

- Route remains: \`/service-areas\`
- Visible noun phrase preference applied: \`service areas\`
- Awkward \`service-area page\` / \`Service-area questions\` phrasing removed.
- Remaining hyphenated uses are limited to technical or adjective-like metadata where not user-facing, or to existing identifiers/routes.
- Unsupported local/city availability claims were not added.`;
}

function renderValidation() {
  return `# Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Check', 'Result'], [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['production-field persistence validation', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.preflight)],
    ['design-system validation', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['Tailwind/navigation validation', resultName(files.tailwind)],
    ['page intake normalizer validation', resultName(files.normalizer)],
    ['unsafe HTML/CSS/form/media/email scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['targeted secret scan', resultName(files.secretScan)],
    ['git diff --check', state.hygiene.results.gitDiffCheck ? (state.hygiene.results.gitDiffCheck.status === 0 ? 'pass' : 'fail') : 'pending'],
    ['trailing whitespace scan', state.hygiene.results.trailingWhitespaceScan ? (state.hygiene.results.trailingWhitespaceScan.ok ? 'pass' : 'fail') : 'pending'],
    ['protected/generated/raw artifact path check', state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? (state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok ? 'pass' : 'fail') : 'pending'],
  ])}`;
}

function renderImport() {
  return `# Import Result

- Auth presence: ${state.auth.presence}
- Auth validation: ${state.auth.validation}
- JWT printed: no
- Import attempted: ${yn(state.import.attempted)}
- Import performed: ${yn(state.import.performed)}
- Method: ${state.import.method}
- Endpoint: \`${state.import.endpoint || 'not attempted'}\`
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Readback verification ok: ${yn(state.readback.ok)}
- Homepage unchanged: ${yn(state.untouched.homepageUnchanged)}
- Contact unchanged: ${yn(state.untouched.contactUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}`;
}

function renderFrontend() {
  const rows = Object.entries(state.frontend.results || {}).map(([key, value]) => [
    key,
    value.url,
    value.reachable ? 'yes' : 'no',
    value.status ?? 'n/a',
  ]);
  return `# Frontend Preview Checklist

${table(['Probe', 'URL', 'Reachable', 'Status'], rows.length ? rows : [['pending', 'n/a', 'n/a', 'n/a']])}

Manual visual review target:

http://localhost:3002/__preview/ice-rink-rentals/service-areas`;
}

function renderBlockers() {
  const blockers = state.blockers.length ? state.blockers : ['None.'];
  return `# Remaining Blockers

${listOrNone(blockers)}

## Next Recommended Action

${state.success ? 'Review the local draft preview visually, then request separate approval for any live/published promotion.' : 'Resolve the blocker above, retain or re-add admin auth if needed, and rerun the polish import.'}`;
}

function renderRootReport() {
  const f = state.audit.findings || {};
  return `# Pumpkin Ice Service Areas Polish Report

Generated: ${generatedAt}

## Start

Branch: \`${state.start.branch}\`

Git status at start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent commits:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

API reachable at \`http://localhost:5064\`: ${yn(state.start.api?.reachable && state.start.api?.status === 200)}

Source candidate present: ${yn(state.start.candidateFile.exists)}
Source readback present: ${yn(state.start.readbackFile.exists)}
PPEC logo ID evidence found: ${yn(state.start.ppecLogoEvidence.length > 0)}

## Requested Fixes

- Bind real PPEC logo MediaAsset: \`${ppecLogoId}\`
- Remove Future local pages section/card
- Resolve empty/blank rendered image placeholder area
- Replace \`How Coverage Is Reviewed\` with \`Request a Quote\` linked to \`/contact\`
- Polish visible \`service areas\` wording while keeping route \`/service-areas\`

## Candidate Changes

- Polished candidate: \`${polishedCandidateRel}\`
- Polished package: \`${polishedPackageRel}\`
- Source blocks: ${state.audit.sourceBlockCount ?? 'n/a'}
- Polished blocks: ${state.audit.polishedBlockCount ?? 'n/a'}
- Future local pages block removed: ${yn(f.futureLocalPagesBlockRemoved)}
- PPEC logo bound: ${yn(f.ppecPolishedLogoMediaAssetId === ppecLogoId)}
- Rendered empty media after polish: ${listInline(f.renderedEmptyMediaAfter)}
- CTA wording result: ${f.ctaAfter || 'n/a'}
- \`/state-city\` explanation remains: ${yn(f.stateCityAfter)}

## Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Validation', 'Result'], [
    ['JSON parse', resultName(files.jsonParse)],
    ['.NET Page/block contract', resultName(files.dotnet)],
    ['production-field persistence', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.preflight)],
    ['design-system', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['Tailwind/navigation', resultName(files.tailwind)],
    ['page intake normalizer', resultName(files.normalizer)],
    ['unsafe scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['targeted secret scan', resultName(files.secretScan)],
  ])}

## Import And Readback

- Import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'n/a'}
- Readback result: ${yn(state.readback.ok)}
- PPEC logo persisted: ${yn(state.readback.checks.ppecLogoPersists)}
- Future local pages removed in readback: ${yn(state.readback.checks.futureLocalPagesRemoved)}
- Blank/placeholder rendered media resolved: ${yn(state.readback.checks.noRenderedEmptyMedia)}
- CTA wording updated: ${yn(state.readback.checks.ctaWordingUpdated)}
- Service areas wording polished: ${yn(state.readback.checks.serviceAreasWordingPolished)}

## Untouched Verification

- Homepage / unchanged: ${yn(state.untouched.homepageUnchanged)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}

## Preview Result

${table(['Probe', 'URL', 'Status'], Object.entries(state.frontend.results || {}).map(([key, value]) => [key, value.url, value.status ?? 'n/a']))}

## Hygiene

${table(['Check', 'Result'], [
    ['git diff --check', state.hygiene.results.gitDiffCheck ? (state.hygiene.results.gitDiffCheck.status === 0 ? 'pass' : 'fail') : 'pending'],
    ['trailing whitespace scan', state.hygiene.results.trailingWhitespaceScan ? (state.hygiene.results.trailingWhitespaceScan.ok ? 'pass' : 'fail') : 'pending'],
    ['protected/generated/raw artifact path check', state.hygiene.results.protectedGeneratedRawArtifactPathCheck ? (state.hygiene.results.protectedGeneratedRawArtifactPathCheck.ok ? 'pass' : 'fail') : 'pending'],
    ['targeted secret scan', state.hygiene.results.targetedSecretScan ? (state.hygiene.results.targetedSecretScan.ok ? 'pass' : 'fail') : 'pending'],
  ])}

## Safety

- CMS writes limited to /service-areas: ${yn(state.import.performed && !state.safety.homepageWrite && !state.safety.contactWrite)}
- Homepage update: no
- Contact update: no
- Theme update: no
- MediaAsset update: no
- Static generation: no
- Deployment/DNS/email/provider action: no
- Protected config touched: no
- Image generation/editing: no
- Roller touched: no
- JWT printed: no
- Temp JWT final status: ${state.auth.tempJwtFinalStatus}

## Remaining Blockers

${listOrNone(state.blockers)}

## Next Recommended Action

${state.success ? 'Review the local draft preview, then request separate approval for CMS/live promotion if the page is visually approved.' : 'Resolve the documented blocker and rerun without deleting the retained temp JWT.'}`;
}

function findPpecLogoEvidence() {
  const evidence = [];
  const searchFiles = [
    mediaSnapshotRel,
    'content-review/ice-cross-page-media-slot-plan/CANONICAL_MEDIA_SLOT_MAP.md',
    'content-review/ice-ppec-logo-replacement/HOMEPAGE_LOGO_BINDING_RESULT.md',
    'content-review/ice-service-areas-local-draft-import/manifest.json',
  ];
  for (const file of searchFiles) {
    if (existsSync(abs(file)) && readFileSync(abs(file), 'utf8').includes(ppecLogoId)) {
      evidence.push(file);
    }
  }
  return evidence;
}

function getPpecLogoAsset() {
  const data = readJson(mediaSnapshotRel);
  const assets = Array.isArray(data) ? data : data.mediaAssets || data.items || data.assets || [];
  const asset = assets.find((item) => item.id === ppecLogoId);
  if (!asset) throw new Error('PPEC logo MediaAsset was not found in local media snapshot.');
  return asset;
}

function mediaFieldFromAsset(asset) {
  return {
    mediaAssetId: asset.id,
    assetId: asset.assetId || 'partyproseastcoastlogo-cfd1fc9f60ae',
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl: asset.publicUrl || asset.url,
    url: asset.url || asset.publicUrl,
    alt: asset.alt || asset.altText || 'Party Pros East Coast logo',
    title: asset.title || 'Party Pros East Coast Logo',
    caption: asset.caption || '',
    description: asset.description || '',
    source: asset.source || 'Party Pros East Coast',
    licenseStatus: asset.licenseStatus || 'partner_provided',
    usageStatus: asset.usageStatus || 'needs_review',
    usageType: asset.usageType || 'partner-logo',
    status: 'mediaasset-bound',
    tags: asset.tags || ['ppec', 'party-pros-east-coast', 'partner-logo'],
    decorative: false,
    width: asset.width,
    height: asset.height,
  };
}

function findRenderedEmptyMedia(page) {
  const hits = [];
  for (const block of blocksOf(page)) {
    const content = block.content || {};
    const variant = content.sectionVariant || content.variant || '';
    const id = block.id || block.name || block.type;
    if (variant === 'heroMedia' && isEmptyMediaSlot(content.media)) hits.push(`${id}.content.media`);
    if (variant === 'splitFeature' && isEmptyMediaSlot(content.media) && isEmptyMediaSlot(content.image)) hits.push(`${id}.content.media`);
    if (variant === 'mediaUseCaseGrid' && Array.isArray(content.cards)) {
      content.cards.forEach((card, index) => {
        if (isEmptyMediaSlot(card.media) && isEmptyMediaSlot(card.image)) hits.push(`${id}.cards[${index}].media`);
      });
    }
    if (variant === 'partnerResourceCta') {
      const logo = content.partner?.logoMedia || content.logoMedia;
      if (isEmptyMediaSlot(logo)) hits.push(`${id}.partner.logoMedia`);
    }
  }
  return hits;
}

function isEmptyMediaSlot(value) {
  if (!value || typeof value !== 'object') return true;
  const media = value;
  return !media.mediaAssetId && !media.publicUrl && !media.url && !media.src;
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
  return {
    ok: staged.filter((file) => /\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)).length === 0 &&
      staged.filter((file) => file.startsWith('content-review/ice-service-areas-input/extracted/')).length === 0 &&
      staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file)).length === 0,
    stagedCount: staged.length,
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
  if (copy.revision) delete copy.revision.latestSnapshot;
  return copy;
}

function deepDeleteKeys(value, keys) {
  if (Array.isArray(value)) {
    value.forEach((item) => deepDeleteKeys(item, keys));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const key of keys) delete value[key];
  Object.values(value).forEach((child) => deepDeleteKeys(child, keys));
}

function getPathParts(value, parts) {
  return parts.reduce((current, part) => current?.[part], value);
}

function setPathParts(value, parts, nextValue) {
  let current = value;
  for (const part of parts.slice(0, -1)) {
    if (!current[part] || typeof current[part] !== 'object') current[part] = {};
    current = current[part];
  }
  current[parts.at(-1)] = nextValue;
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
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
  writeFileSync(full, `${String(value).trim()}\n`, 'utf8');
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

function listInline(items) {
  return items?.length ? items.join(', ') : 'none';
}

function table(headers, rows) {
  const escapeCell = (value) => String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
  return [
    `| ${headers.map(escapeCell).join(' |')} |`,
    `| ${headers.map(() => '---').join(' |')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' |')} |`),
  ].join('\n');
}
