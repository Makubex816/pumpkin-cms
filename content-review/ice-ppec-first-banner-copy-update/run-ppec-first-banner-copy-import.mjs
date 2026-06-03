#!/usr/bin/env node
import crypto from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outRel = 'content-review/ice-ppec-first-banner-copy-update';
const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const candidateRel = `${outRel}/HOMEPAGE_FIRST_PPEC_BANNER_COPY_UPDATED_CANDIDATE.json`;
const packageRel = `${outRel}/HOMEPAGE_FIRST_PPEC_BANNER_COPY_UPDATED_PACKAGE.json`;
const readbackRel = `${outRel}/homepage-readback-after-first-ppec-banner-copy-update.json`;
const rootReportRel = 'PUMPKIN_ICE_PPEC_FIRST_BANNER_COPY_UPDATE_REPORT.md';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const publicEmailDisplayPolicy = 'form-first-under-review';
const ppecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
const legacyMailbox = 'contactus@iceskatingrinkrentals.com';
const changeSource = 'ppec_first_banner_copy_update_homepage_import';
const generatedAt = new Date().toISOString();

const exactCopy = {
  eyebrow: 'PARTNER RESOURCE',
  headline: 'Planning more than the rink?',
  body: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs photo booths, concessions, carnival rides, interactive games, arcade games, casino-style games, and more, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
  primaryCtaLabel: 'Explore Party Pros East Coast',
  secondaryCtaLabel: 'Request Ice Rink Rental Info',
};

let jwt = '';

const state = {
  schemaVersion: 'pumpkin.ice.ppec-first-banner-copy-import.v1',
  generatedAt,
  tenantId,
  siteKey,
  start: {
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    api: null,
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempJwtStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    presence: 'MISSING',
    source: 'none',
    validation: 'MISSING',
    validationHttpStatus: null,
    tokenPrinted: false,
    tempJwtFinalStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
  },
  baseline: {},
  update: {
    candidateCreated: false,
    packageCreated: false,
    firstPpecBlockIndex: null,
    firstPpecBlockType: '',
    secondPpecBlockUnchanged: null,
    mediaAssetIdsUnchanged: null,
    rendererVariantUnchanged: null,
    ppecLogoIdPreserved: null,
  },
  validation: {
    ok: false,
    failed: [],
    checks: {},
  },
  import: {
    attempted: false,
    performed: false,
    httpStatus: null,
    safeText: '',
  },
  readback: {
    performed: false,
    ok: false,
    failed: [],
    checks: {},
  },
  untouched: {
    contactUnchanged: null,
    serviceAreasUnchangedOr404: null,
    themeUnchanged: null,
    mediaAssetsUnchanged: null,
  },
  frontend: {
    previewUrl: `${webBase}/__preview/${tenantId}/home`,
    checked: false,
    status: null,
    length: null,
  },
  hygiene: {},
  safety: {
    homepageCmsWrite: false,
    contactCmsWrite: false,
    serviceAreasWrite: false,
    themeWrite: false,
    mediaAssetWrite: false,
    staticGeneration: false,
    deployment: false,
    dnsEmailProviderAction: false,
    protectedConfigRead: false,
    rollerTouched: false,
  },
  blockers: [],
  success: false,
};

await main();

async function main() {
  mkdirSync(path.join(repoRoot, outRel), { recursive: true });
  try {
    state.start.api = await probe(`${apiBase}/`);
    if (!state.start.api.reachable || state.start.api.status !== 200) throw new Error('Local API is not reachable.');
    loadJwt();
    console.log(`AUTH_PRESENT=${state.auth.presence}`);
    if (state.auth.presence !== 'PRESENT') throw new Error('Admin auth missing; stopped before CMS writes.');
    await validateJwt();
    console.log(`AUTH_VALIDATION=${state.auth.validation}`);
    if (state.auth.validation !== 'VALID') throw new Error('Admin auth invalid; stopped before CMS writes.');

    await captureBaseline();
    const candidate = prepareCandidate(state.baseline.homepage.json);
    writeJson(candidateRel, candidate);
    writeJson(packageRel, {
      schemaVersion: 'pumpkin.ice.ppec-first-banner-copy-update.package.v1',
      generatedAt,
      candidate: candidateRel,
      exactCopy,
      convertedHomepageCandidate: candidate,
      guardrails: state.safety,
    });
    state.update.candidateCreated = true;
    state.update.packageCreated = true;
    state.validation = validateCandidate(state.baseline.homepage.json, candidate);
    writeJson(`${outRel}/validation-result.json`, state.validation);
    if (!state.validation.ok) throw new Error(`Candidate validation failed: ${state.validation.failed.join(', ')}.`);

    await importHomepage(candidate);
    if (!state.import.performed) throw new Error(`Homepage update failed with HTTP ${state.import.httpStatus}.`);
    await verifyAfterImport(candidate);
    if (!state.readback.ok) throw new Error(`Readback verification failed: ${state.readback.failed.join(', ')}.`);
    if (!Object.values(state.untouched).every((value) => value === true)) throw new Error('Untouched verification failed.');
    await probePreview();
  } catch (error) {
    state.blockers.push(safeMessage(error));
  }

  writeReports();
  state.hygiene = runHygieneChecks();
  if (!state.hygiene.ok) state.blockers.push('Final hygiene checks failed.');
  state.success = state.blockers.length === 0 && state.import.performed && state.readback.ok;
  state.auth.tempJwtFinalStatus = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  writeReports();

  console.log(JSON.stringify({
    success: state.success,
    blockers: state.blockers,
    auth: {
      presence: state.auth.presence,
      validation: state.auth.validation,
      tempJwtFinalStatus: state.auth.tempJwtFinalStatus,
    },
    import: state.import,
    readback: {
      ok: state.readback.ok,
      failed: state.readback.failed,
    },
    untouched: state.untouched,
    report: rootReportRel,
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
  const response = await apiJson(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}`, { method: 'GET', token: jwt });
  state.auth.validationHttpStatus = response.status;
  state.auth.validation = response.ok ? 'VALID' : 'INVALID';
}

async function captureBaseline() {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);
  if (!homepage.ok) throw new Error(`Homepage baseline read failed with HTTP ${homepage.status}.`);
  state.baseline = {
    homepage,
    contact,
    serviceAreas,
    theme,
    mediaAssets,
  };
  writeJson(`${outRel}/current-homepage-before-first-ppec-banner-copy-update.snapshot.json`, sanitize(homepage.json || {}));
  writeJson(`${outRel}/contact-before-first-ppec-banner-copy-update.snapshot.json`, sanitize(contact.json || {}));
  writeJson(`${outRel}/service-areas-before-first-ppec-banner-copy-update.snapshot.json`, sanitize(serviceAreas.json || { status: serviceAreas.status }));
  writeJson(`${outRel}/theme-before-first-ppec-banner-copy-update.snapshot.json`, sanitize(theme.json || { status: theme.status }));
  writeJson(`${outRel}/media-assets-before-first-ppec-banner-copy-update.snapshot.json`, sanitize(mediaAssets.json || { status: mediaAssets.status }));
}

function prepareCandidate(homepage) {
  const candidate = clone(homepage);
  const ppecBlocks = findPpecBlocks(candidate);
  if (!ppecBlocks.length) throw new Error('No PPEC partner banner found in current homepage.');
  const first = ppecBlocks[0];
  state.update.firstPpecBlockIndex = first.index;
  state.update.firstPpecBlockType = first.block.type || first.block.Type || '';
  updateFirstPpecBlock(first.content);
  preserveDraftFlags(candidate);

  const beforePpecBlocks = findPpecBlocks(homepage);
  const afterPpecBlocks = findPpecBlocks(candidate);
  state.update.secondPpecBlockUnchanged = beforePpecBlocks[1] && afterPpecBlocks[1]
    ? hash(stableStringify(beforePpecBlocks[1].block)) === hash(stableStringify(afterPpecBlocks[1].block))
    : true;
  state.update.mediaAssetIdsUnchanged = JSON.stringify(collectValuesByKey(homepage, 'mediaAssetId').sort()) === JSON.stringify(collectValuesByKey(candidate, 'mediaAssetId').sort());
  state.update.rendererVariantUnchanged = beforePpecBlocks[0]?.content.rendererVariant === first.content.rendererVariant
    && beforePpecBlocks[0]?.content.visualTreatment === first.content.visualTreatment
    && beforePpecBlocks[0]?.content.sectionVariant === first.content.sectionVariant;
  state.update.ppecLogoIdPreserved = JSON.stringify(first.block).includes(ppecLogoId);
  return candidate;
}

function updateFirstPpecBlock(content) {
  content.eyebrow = exactCopy.eyebrow;
  content.title = exactCopy.headline;
  content.headline = exactCopy.headline;
  content.subtitle = exactCopy.body;
  content.description = exactCopy.body;
  content.partnerCtaLabel = exactCopy.primaryCtaLabel;
  content.secondaryButtonText = exactCopy.secondaryCtaLabel;
  if (content.cta && typeof content.cta === 'object') content.cta.label = exactCopy.primaryCtaLabel;
  if (Array.isArray(content.items) && content.items[0] && typeof content.items[0] === 'object') {
    content.items[0].text = exactCopy.body;
  }
}

function preserveDraftFlags(page) {
  page.tenantId = tenantId;
  page.siteKey = siteKey;
  page.domain = domain;
  page.route = '/';
  page.path = '/';
  page.slug = 'home';
  page.pageSlug = 'home';
  page.PageSlug = 'home';
  page.isPublished = false;
  page.publishedAt = null;
  page.includeInSitemap = false;
  page.productionApproved = false;
  page.publishApproved = false;
  page.workflow = {
    ...(page.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    productionApproved: false,
    publishApproved: false,
    approvedForPublish: false,
    approvedForImport: false,
  };
  page.staticPublishing = {
    ...(page.staticPublishing || {}),
    needsRebuild: true,
    staticEligible: false,
    productionApproved: false,
  };
}

function validateCandidate(source, candidate) {
  const first = findPpecBlocks(candidate)[0];
  const firstText = JSON.stringify(first?.block || {});
  const forbiddenWords = ['tables', 'tents', 'chairs', 'seating', 'staging'];
  const forbiddenHits = forbiddenWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(firstText));
  const checks = {
    exactEyebrow: first?.content.eyebrow === exactCopy.eyebrow,
    exactTitle: first?.content.title === exactCopy.headline,
    exactHeadline: first?.content.headline === exactCopy.headline,
    exactDescription: first?.content.description === exactCopy.body,
    exactSubtitle: first?.content.subtitle === exactCopy.body,
    exactPrimaryCta: first?.content.partnerCtaLabel === exactCopy.primaryCtaLabel,
    exactSecondaryCta: first?.content.secondaryButtonText === exactCopy.secondaryCtaLabel,
    noForbiddenCopy: forbiddenHits.length === 0,
    partyProsResourceFraming: /Party Pros East Coast may be a helpful partner resource/i.test(firstText),
    rinkConversationFraming: /Ice Rink Rentals can help with the portable rink rental conversation/i.test(firstText),
    noIceProvidesExtrasImplication: !/Ice Rink Rentals (?:provides|offers|supplies|rents).*(photo booths|concessions|carnival rides|interactive games|arcade games|casino-style games)/i.test(firstText),
    secondPpecBlockUnchanged: state.update.secondPpecBlockUnchanged === true,
    mediaAssetIdsUnchanged: state.update.mediaAssetIdsUnchanged === true,
    rendererVariantUnchanged: state.update.rendererVariantUnchanged === true,
    ppecLogoIdPreserved: state.update.ppecLogoIdPreserved === true,
    onlyExpectedFirstBlockChanged: onlyExpectedFirstBlockAndDraftFieldsChanged(source, candidate),
    selectedMailbox: JSON.stringify(candidate).includes(selectedMailbox),
    publicEmailPolicy: JSON.stringify(candidate).includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !JSON.stringify(candidate).includes(legacyMailbox),
    draftNeedsReview: candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: candidate.productionApproved !== true && candidate.publishApproved !== true && candidate.workflow?.productionApproved !== true && candidate.workflow?.publishApproved !== true,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, generatedAt, checks, forbiddenHits, failed };
}

function onlyExpectedFirstBlockAndDraftFieldsChanged(source, candidate) {
  const sourceClone = clone(source);
  const candidateClone = clone(candidate);
  const sourceBlocks = blocksOf(sourceClone);
  const candidateBlocks = blocksOf(candidateClone);
  const firstIndex = state.update.firstPpecBlockIndex;
  if (!Number.isInteger(firstIndex) || !sourceBlocks[firstIndex] || !candidateBlocks[firstIndex]) return false;

  const sentinel = { expectedChange: 'first-ppec-partner-banner-copy' };
  sourceBlocks[firstIndex] = sentinel;
  candidateBlocks[firstIndex] = sentinel;

  const allowedRootFields = [
    'tenantId',
    'siteKey',
    'domain',
    'route',
    'path',
    'slug',
    'pageSlug',
    'PageSlug',
    'isPublished',
    'publishedAt',
    'includeInSitemap',
    'productionApproved',
    'publishApproved',
    'workflow',
    'staticPublishing',
  ];
  for (const field of allowedRootFields) copyField(sourceClone, candidateClone, field);

  return hash(stableStringify(sourceClone)) === hash(stableStringify(candidateClone));
}

async function importHomepage(candidate) {
  const query = new URLSearchParams({
    changeSource,
    changeSummary: 'First PPEC partner banner copy update only; homepage local draft route /; no contact, service-area, theme, media, static, deploy, provider, or email action.',
  });
  state.import.attempted = true;
  const response = await apiJson(`/api/admin/pages/${tenantId}/home?${query}`, {
    method: 'PUT',
    token: jwt,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  state.import.httpStatus = response.status;
  state.import.performed = response.ok;
  state.import.safeText = response.safeText;
  state.safety.homepageCmsWrite = response.ok;
  writeJson(`${outRel}/homepage-first-ppec-banner-copy-write-result.json`, sanitize({
    ok: response.ok,
    status: response.status,
    page: response.json,
    safeText: response.safeText,
  }));
}

async function verifyAfterImport(candidate) {
  const [homepage, contact, serviceAreas, theme, mediaAssets] = await Promise.all([
    getPage('home'),
    getPage('contact'),
    getPage('service-areas'),
    apiJson(`/api/admin/themes/${tenantId}`, { method: 'GET', token: jwt }),
    apiJson(`/api/admin/${tenantId}/media-assets`, { method: 'GET', token: jwt }),
  ]);
  writeJson(readbackRel, sanitize(homepage.json || {}));
  const page = homepage.json || {};
  const first = findPpecBlocks(page)[0];
  const firstText = JSON.stringify(first?.block || {});
  const checks = {
    http200: homepage.ok,
    routeHome: page.route === '/' || page.path === '/' || page.pageSlug === 'home',
    draftNeedsReview: page.isPublished === false && page.workflow?.status === 'draft' && page.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: page.productionApproved !== true && page.publishApproved !== true && page.workflow?.productionApproved !== true && page.workflow?.publishApproved !== true,
    exactEyebrow: first?.content.eyebrow === exactCopy.eyebrow,
    exactHeadline: first?.content.headline === exactCopy.headline,
    exactDescription: first?.content.description === exactCopy.body,
    exactPrimaryCta: first?.content.partnerCtaLabel === exactCopy.primaryCtaLabel,
    exactSecondaryCta: first?.content.secondaryButtonText === exactCopy.secondaryCtaLabel,
    noForbiddenCopy: !/\b(?:tables|tents|chairs|seating|staging)\b/i.test(firstText),
    ppecLogoIdPreserved: firstText.includes(ppecLogoId),
    rendererVariantPreserved: first?.content.rendererVariant === 'ppecPartnerBand' && first?.content.visualTreatment === 'ppecPartnerBand',
    selectedMailbox: JSON.stringify(page).includes(selectedMailbox),
    publicEmailPolicy: JSON.stringify(page).includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !JSON.stringify(page).includes(legacyMailbox),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.readback = { performed: true, ok: failed.length === 0, checks, failed };
  state.untouched.contactUnchanged = contact.status === state.baseline.contact.status && contact.hash === state.baseline.contact.hash;
  state.untouched.serviceAreasUnchangedOr404 = state.baseline.serviceAreas.status === 404
    ? serviceAreas.status === 404
    : serviceAreas.status === state.baseline.serviceAreas.status && serviceAreas.hash === state.baseline.serviceAreas.hash;
  state.untouched.themeUnchanged = theme.status === state.baseline.theme.status && theme.hash === state.baseline.theme.hash;
  state.untouched.mediaAssetsUnchanged = mediaAssets.status === state.baseline.mediaAssets.status && mediaAssets.hash === state.baseline.mediaAssets.hash;
}

async function probePreview() {
  const result = await probe(`${webBase}/__preview/${tenantId}/home`);
  state.frontend.checked = true;
  state.frontend.status = result.status;
  state.frontend.length = result.length;
}

function runHygieneChecks() {
  const scriptCheck = run('node', ['--check', `${outRel}/run-ppec-first-banner-copy-import.mjs`]);
  const diffCheck = run('git', ['diff', '--check']);
  const files = outputFiles().concat([
    path.join(repoRoot, 'content-review/ice-ppec-first-banner-copy-update/run-ppec-first-banner-copy-import.mjs'),
    path.join(repoRoot, 'content-review/ice-ppec-first-banner-copy-update/run-ppec-first-banner-copy-update.mjs'),
    path.join(repoRoot, rootReportRel),
  ]);
  const trailing = trailingWhitespaceScan(files);
  const secrets = secretScan(files);
  const paths = artifactPathCheck();
  return {
    ok: scriptCheck.status === 0 && diffCheck.status === 0 && trailing.ok && secrets.ok && paths.ok,
    scriptCheck: commandSummary(scriptCheck),
    gitDiffCheck: commandSummary(diffCheck),
    trailingWhitespaceScan: trailing,
    targetedSecretScan: secrets,
    protectedGeneratedRawArtifactPathCheck: paths,
  };
}

function writeReports() {
  writeJson(`${outRel}/manifest.json`, sanitize(state));
  writeText(`${outRel}/README.md`, `# Ice First PPEC Banner Copy Update

Status: ${state.success ? 'completed' : state.blockers.length ? 'blocked' : 'in progress'}.

This folder contains the homepage-only first PPEC partner banner copy update artifacts.

CMS writes:
- Homepage route \`/\`: ${yn(state.import.performed)}
- \`/contact\`: no
- \`/service-areas\`: no
- Theme: no
- MediaAssets: no

Preview URL: \`${webBase}/__preview/${tenantId}/home\`
`);
  writeText(`${outRel}/COPY_UPDATE_RESULT.md`, `# Copy Update Result

- First PPEC block index: ${state.update.firstPpecBlockIndex ?? 'not-found'}
- First PPEC block type: \`${state.update.firstPpecBlockType || 'not-found'}\`
- Candidate created: ${yn(state.update.candidateCreated)}
- Homepage import performed: ${yn(state.import.performed)}
- Readback ok: ${yn(state.readback.ok)}

Exact copy applied:

Eyebrow:
\`${exactCopy.eyebrow}\`

Headline:
\`${exactCopy.headline}\`

Body:
${exactCopy.body}

Primary CTA label:
\`${exactCopy.primaryCtaLabel}\`

Secondary CTA label:
\`${exactCopy.secondaryCtaLabel}\`
`);
  writeText(`${outRel}/VALIDATION_RESULTS.md`, `# Validation Results

- Candidate validation ok: ${yn(state.validation.ok)}
- Readback validation ok: ${yn(state.readback.ok)}
- No forbidden copy terms: ${yn(state.validation.checks?.noForbiddenCopy && state.readback.checks?.noForbiddenCopy)}
- MediaAsset IDs unchanged: ${yn(state.validation.checks?.mediaAssetIdsUnchanged)}
- Renderer variant unchanged: ${yn(state.validation.checks?.rendererVariantUnchanged)}
- PPEC logo ID preserved: ${yn(state.validation.checks?.ppecLogoIdPreserved && state.readback.checks?.ppecLogoIdPreserved)}
- Second PPEC block unchanged before import: ${yn(state.validation.checks?.secondPpecBlockUnchanged)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- /service-areas unchanged or 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- Final hygiene ok: ${yn(state.hygiene.ok)}

Failed candidate checks:

${state.validation.failed?.length ? state.validation.failed.map((item) => `- ${item}`).join('\n') : '- None.'}

Failed readback checks:

${state.readback.failed?.length ? state.readback.failed.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(`${outRel}/IMPORT_RESULT.md`, `# Import Result

- Import attempted: ${yn(state.import.attempted)}
- Import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Change source: \`${changeSource}\`
- Route: \`/\`
- Draft/needs_review retained: ${yn(state.readback.checks?.draftNeedsReview)}
- Production/publish approvals false: ${yn(state.readback.checks?.approvalsFalse)}

No \`/contact\`, \`/service-areas\`, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, or Roller action was performed.
`);
  writeText(`${outRel}/READBACK_VERIFICATION.md`, `# Readback Verification

- Readback performed: ${yn(state.readback.performed)}
- Readback ok: ${yn(state.readback.ok)}
- Exact eyebrow persisted: ${yn(state.readback.checks?.exactEyebrow)}
- Exact headline persisted: ${yn(state.readback.checks?.exactHeadline)}
- Exact body persisted: ${yn(state.readback.checks?.exactDescription)}
- Primary CTA label persisted: ${yn(state.readback.checks?.exactPrimaryCta)}
- Secondary CTA label persisted: ${yn(state.readback.checks?.exactSecondaryCta)}
- Forbidden copy terms absent: ${yn(state.readback.checks?.noForbiddenCopy)}
- PPEC logo ID preserved: ${yn(state.readback.checks?.ppecLogoIdPreserved)}
- Renderer variant preserved: ${yn(state.readback.checks?.rendererVariantPreserved)}
- Selected mailbox preserved: ${yn(state.readback.checks?.selectedMailbox)}
- Public email policy preserved: ${yn(state.readback.checks?.publicEmailPolicy)}
- No \`contactus@\`: ${yn(state.readback.checks?.noLegacyMailbox)}
`);
  writeText(rootReportRel, `# Pumpkin Ice First PPEC Banner Copy Update Report

Date: ${generatedAt}

## Status

${state.success ? 'Completed successfully.' : 'Blocked or incomplete.'}

## Summary

Updated only the first PPEC partner banner copy on homepage route \`/\` and imported it as local draft/needs_review.

## Copy

Eyebrow: \`${exactCopy.eyebrow}\`

Headline: \`${exactCopy.headline}\`

Body: ${exactCopy.body}

Primary CTA label: \`${exactCopy.primaryCtaLabel}\`

Secondary CTA label: \`${exactCopy.secondaryCtaLabel}\`

## Guardrails

- /contact updated: no
- /service-areas updated: no
- Theme updated: no
- MediaAssets updated: no
- Static generation: no
- Deployment: no
- DNS/email/provider/protected config: no
- Roller touched: no

## Verification

- Homepage import performed: ${yn(state.import.performed)}
- HTTP status: ${state.import.httpStatus ?? 'not-applicable'}
- Readback ok: ${yn(state.readback.ok)}
- /contact unchanged: ${yn(state.untouched.contactUnchanged)}
- /service-areas unchanged or 404: ${yn(state.untouched.serviceAreasUnchangedOr404)}
- Theme unchanged: ${yn(state.untouched.themeUnchanged)}
- MediaAssets unchanged: ${yn(state.untouched.mediaAssetsUnchanged)}
- Final hygiene ok: ${yn(state.hygiene.ok)}

Preview URL:
\`${webBase}/__preview/${tenantId}/home\`

## Blockers

${state.blockers.length ? state.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
}

async function getPage(slug) {
  return apiJson(`/api/admin/pages/${tenantId}/${encodeURIComponent(slug)}`, { method: 'GET', token: jwt });
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

function findPpecBlocks(page) {
  return blocksOf(page)
    .map((block, index) => ({ index, block, content: block.content || block.Content || {} }))
    .filter(({ content }) => content.sectionVariant === 'ppecPartnerBand'
      || content.rendererVariant === 'ppecPartnerBand'
      || content.visualTreatment === 'ppecPartnerBand'
      || /Party Pros East Coast|PPEC/i.test(JSON.stringify(content.partner || {})));
}

function blocksOf(page) {
  return page?.ContentData?.ContentBlocks || page?.contentData?.contentBlocks || page?.ContentBlocks || [];
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

function outputFiles() {
  const dir = path.join(repoRoot, outRel);
  const files = [];
  const walk = (current) => {
    if (!existsSync(current)) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) walk(next);
      else if (/\.(md|json|mjs)$/i.test(entry.name)) files.push(next);
    }
  };
  walk(dir);
  return files;
}

function trailingWhitespaceScan(files) {
  const hits = [];
  for (const file of [...new Set(files)]) {
    if (!existsSync(file) || statSync(file).isDirectory()) continue;
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push(`${rel(file)}:${index + 1}`);
    });
  }
  return { ok: hits.length === 0, hits };
}

function secretScan(files) {
  const patterns = [
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
  ];
  const hits = [];
  for (const file of [...new Set(files)]) {
    if (!existsSync(file) || statSync(file).isDirectory()) continue;
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) if (pattern.test(text)) hits.push(`${rel(file)}:${code}`);
  }
  return { ok: hits.length === 0, hits };
}

function artifactPathCheck() {
  const status = git(['status', '--short', '--untracked-files=all']);
  const lines = status.split(/\r?\n/).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|dist|build|out|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  const rawHits = lines.filter((line) => {
    const file = line.slice(3).replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) return false;
    return file !== 'content-review/ice-ppec-logo-replacement-input/PartyProsEastCoastLogo.png';
  });
  return { ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0, protectedHits, generatedHits, rawHits };
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text.replace(/^\uFEFF/, '')) : null;
  } catch {
    return null;
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${value.trimEnd()}\n`, 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function copyField(target, source, key) {
  if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = clone(source[key]);
  else delete target[key];
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
  return scrub(error?.message || error || '');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return (result.stdout || result.stderr || '').trim();
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true, timeout: 120000 });
  return { status: result.status, stdout: scrub(result.stdout || ''), stderr: scrub(result.stderr || ''), signal: result.signal || null };
}

function commandSummary(result) {
  return { ok: result.status === 0, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, signal: result.signal || null };
}

function rel(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function yn(value) {
  return value ? 'yes' : 'no';
}
