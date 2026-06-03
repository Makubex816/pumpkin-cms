#!/usr/bin/env node
import crypto from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outRel = 'content-review/ice-ppec-first-banner-copy-update';
const sourceRel = 'content-review/ice-ppec-logo-replacement/homepage-readback-after-logo-replacement.json';
const candidateRel = `${outRel}/HOMEPAGE_FIRST_PPEC_BANNER_COPY_UPDATED_CANDIDATE.json`;
const packageRel = `${outRel}/HOMEPAGE_FIRST_PPEC_BANNER_COPY_UPDATED_PACKAGE.json`;
const rootReportRel = 'PUMPKIN_ICE_PPEC_FIRST_BANNER_COPY_UPDATE_REPORT.md';
const tempJwtPath = path.join(os.tmpdir(), 'pumpkin-admin-jwt.txt');
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const publicEmailDisplayPolicy = 'form-first-under-review';
const newPpecLogoId = 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae';
const legacyMailbox = 'contactus@iceskatingrinkrentals.com';
const generatedAt = new Date().toISOString();

const exactCopy = {
  eyebrow: 'PARTNER RESOURCE',
  headline: 'Planning more than the rink?',
  body: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs photo booths, concessions, carnival rides, interactive games, arcade games, casino-style games, and more, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
  primaryCtaLabel: 'Explore Party Pros East Coast',
  secondaryCtaLabel: 'Request Ice Rink Rental Info',
};

const state = {
  schemaVersion: 'pumpkin.ice.ppec-first-banner-copy-update.v1',
  generatedAt,
  tenantId,
  siteKey,
  source: sourceRel,
  start: {
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
  },
  auth: {
    envStatus: process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING',
    tempJwtStatus: existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING',
    validation: 'NOT_ATTEMPTED',
    tokenPrinted: false,
  },
  update: {
    sourceExists: existsSync(path.join(repoRoot, sourceRel)),
    candidateCreated: false,
    packageCreated: false,
    importAttempted: false,
    importPerformed: false,
    importBlockedReason: '',
    firstPpecBlockIndex: null,
    firstPpecBlockType: '',
    secondPpecBlockUnchanged: null,
    mediaAssetIdsUnchanged: null,
    rendererVariantUnchanged: null,
    ppecLogoIdPreserved: null,
    contactUpdated: false,
    serviceAreasUpdated: false,
    themeUpdated: false,
    mediaAssetsUpdated: false,
    staticGeneration: false,
    deployment: false,
    rollerTouched: false,
  },
  validation: {},
  blockers: [],
};

main();

function main() {
  mkdirSync(path.join(repoRoot, outRel), { recursive: true });

  if (!state.update.sourceExists) {
    state.blockers.push('Latest homepage logo-replacement readback artifact is missing.');
    writeReports(null, null);
    process.exitCode = 1;
    return;
  }

  const source = readJson(sourceRel);
  const candidate = clone(source);
  const beforePpecBlocks = findPpecBlocks(source);
  const afterPpecBlocks = findPpecBlocks(candidate);
  if (!afterPpecBlocks.length) {
    state.blockers.push('No PPEC partner banner block found in homepage source.');
    writeReports(source, candidate);
    process.exitCode = 1;
    return;
  }

  const first = afterPpecBlocks[0];
  state.update.firstPpecBlockIndex = first.index;
  state.update.firstPpecBlockType = first.block.type || first.block.Type || '';
  updateFirstPpecBlock(first.content);
  preserveDraftFlags(candidate);

  const beforeSecondHash = beforePpecBlocks[1] ? hash(stableStringify(beforePpecBlocks[1].block)) : '';
  const afterSecondHash = findPpecBlocks(candidate)[1] ? hash(stableStringify(findPpecBlocks(candidate)[1].block)) : '';
  const beforeMediaIds = collectValuesByKey(source, 'mediaAssetId').sort();
  const afterMediaIds = collectValuesByKey(candidate, 'mediaAssetId').sort();
  state.update.secondPpecBlockUnchanged = beforeSecondHash === afterSecondHash;
  state.update.mediaAssetIdsUnchanged = JSON.stringify(beforeMediaIds) === JSON.stringify(afterMediaIds);
  state.update.rendererVariantUnchanged = first.content.rendererVariant === beforePpecBlocks[0].content.rendererVariant
    && first.content.visualTreatment === beforePpecBlocks[0].content.visualTreatment
    && first.content.sectionVariant === beforePpecBlocks[0].content.sectionVariant;
  state.update.ppecLogoIdPreserved = JSON.stringify(first.block).includes(newPpecLogoId);

  writeJson(candidateRel, candidate);
  const pkg = {
    schemaVersion: 'pumpkin.ice.ppec-first-banner-copy-update.package.v1',
    generatedAt,
    source: sourceRel,
    candidate: candidateRel,
    exactCopy,
    changeScope: 'homepage first PPEC partner banner copy only',
    convertedHomepageCandidate: candidate,
    guardrails: {
      cmsWrites: false,
      contactUpdated: false,
      serviceAreasUpdated: false,
      themeUpdated: false,
      mediaAssetsUpdated: false,
      staticGeneration: false,
      deployment: false,
      protectedConfigRead: false,
      rollerTouched: false,
    },
  };
  writeJson(packageRel, pkg);
  state.update.candidateCreated = true;
  state.update.packageCreated = true;

  state.validation = validate(source, candidate);
  if (!state.validation.ok) state.blockers.push(...state.validation.failed);

  if (state.auth.envStatus === 'MISSING' && state.auth.tempJwtStatus === 'MISSING') {
    state.update.importBlockedReason = 'Admin auth missing; stopped before CMS homepage write.';
    state.blockers.push(state.update.importBlockedReason);
  } else {
    state.update.importBlockedReason = 'Import not attempted by this preparatory run; use authenticated homepage-only import flow after review.';
    state.blockers.push(state.update.importBlockedReason);
  }

  writeReports(source, candidate);
  if (state.blockers.length) process.exitCode = 1;
  console.log(JSON.stringify({
    candidate: candidateRel,
    validationOk: state.validation.ok,
    blockers: state.blockers,
    auth: {
      env: state.auth.envStatus,
      temp: state.auth.tempJwtStatus,
    },
    importAttempted: state.update.importAttempted,
    importPerformed: state.update.importPerformed,
  }, null, 2));
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
  page.route = '/';
  page.path = '/';
  page.slug = 'home';
  page.pageSlug = 'home';
  page.PageSlug = 'home';
  page.isPublished = false;
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

function validate(source, candidate) {
  const first = findPpecBlocks(candidate)[0];
  const firstText = JSON.stringify(first?.block || {});
  const sourceFirst = findPpecBlocks(source)[0];
  const exactChecks = {
    eyebrow: first?.content.eyebrow === exactCopy.eyebrow,
    title: first?.content.title === exactCopy.headline,
    headline: first?.content.headline === exactCopy.headline,
    description: first?.content.description === exactCopy.body,
    subtitle: first?.content.subtitle === exactCopy.body,
    primaryCtaLabel: first?.content.partnerCtaLabel === exactCopy.primaryCtaLabel,
    secondaryCtaLabel: first?.content.secondaryButtonText === exactCopy.secondaryCtaLabel,
  };
  const forbiddenWords = ['tables', 'tents', 'chairs', 'seating', 'staging'];
  const forbiddenHits = forbiddenWords.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(firstText));
  const sourceClone = clone(source);
  const candidateClone = clone(candidate);
  const sourceBlocks = findPpecBlocks(sourceClone);
  const candidateBlocks = findPpecBlocks(candidateClone);
  if (sourceBlocks[0]) sourceBlocks[0].block = '[first-ppec-block-redacted-for-expected-copy-change]';
  if (candidateBlocks[0]) candidateBlocks[0].block = '[first-ppec-block-redacted-for-expected-copy-change]';

  const checks = {
    jsonParse: true,
    exactCopy: Object.values(exactChecks).every(Boolean),
    noForbiddenCopy: forbiddenHits.length === 0,
    partyProsAsResource: /Party Pros East Coast may be a helpful partner resource/i.test(firstText),
    iceRinkOnlyRinkConversation: /Ice Rink Rentals can help with the portable rink rental conversation/i.test(firstText),
    noIceProvidesExtrasImplication: !/Ice Rink Rentals (?:provides|offers|supplies|rents).*(photo booths|concessions|carnival rides|interactive games|arcade games|casino-style games)/i.test(firstText),
    secondPpecBlockUnchanged: state.update.secondPpecBlockUnchanged === true,
    mediaAssetIdsUnchanged: state.update.mediaAssetIdsUnchanged === true,
    rendererVariantUnchanged: state.update.rendererVariantUnchanged === true,
    ppecLogoIdPreserved: state.update.ppecLogoIdPreserved === true,
    selectedMailboxPreserved: JSON.stringify(candidate).includes(selectedMailbox),
    publicEmailPolicyPreserved: JSON.stringify(candidate).includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !JSON.stringify(candidate).includes(legacyMailbox),
    onlyExpectedFirstPpecBlockChanged: hash(stableStringify(sourceClone)) === hash(stableStringify(candidateClone)),
    routeHome: candidate.route === '/' && candidate.pageSlug === 'home',
    draftNeedsReview: candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: candidate.productionApproved !== true && candidate.publishApproved !== true,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return {
    ok: failed.length === 0,
    generatedAt,
    exactChecks,
    forbiddenHits,
    checks,
    failed,
  };
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

function writeReports(source, candidate) {
  writeJson(`${outRel}/manifest.json`, state);
  writeText(`${outRel}/README.md`, `# Ice First PPEC Banner Copy Update

Status: ${state.blockers.length ? 'blocked before CMS import' : 'ready'}.

This package updates only the first PPEC partner banner copy in the Ice homepage candidate. No CMS write was performed in this run because admin auth is missing.
`);
  writeText(`${outRel}/COPY_UPDATE_RESULT.md`, `# Copy Update Result

- Source: \`${sourceRel}\`
- Candidate: \`${candidateRel}\`
- First PPEC block index: ${state.update.firstPpecBlockIndex ?? 'not-found'}
- First PPEC block type: \`${state.update.firstPpecBlockType || 'not-found'}\`
- Candidate created: ${yn(state.update.candidateCreated)}
- Package created: ${yn(state.update.packageCreated)}
- Import attempted: ${yn(state.update.importAttempted)}
- Import performed: ${yn(state.update.importPerformed)}
- Import blocker: ${state.update.importBlockedReason || 'none'}

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

- Validation ok: ${yn(state.validation.ok)}
- Exact copy: ${yn(state.validation.checks?.exactCopy)}
- No forbidden words: ${yn(state.validation.checks?.noForbiddenCopy)}
- Party Pros East Coast framed as resource: ${yn(state.validation.checks?.partyProsAsResource)}
- Ice Rink Rentals framed around rink conversation: ${yn(state.validation.checks?.iceRinkOnlyRinkConversation)}
- No implication Ice provides extra party items: ${yn(state.validation.checks?.noIceProvidesExtrasImplication)}
- Second PPEC block unchanged: ${yn(state.validation.checks?.secondPpecBlockUnchanged)}
- MediaAsset IDs unchanged: ${yn(state.validation.checks?.mediaAssetIdsUnchanged)}
- Renderer variant unchanged: ${yn(state.validation.checks?.rendererVariantUnchanged)}
- PPEC logo ID preserved: ${yn(state.validation.checks?.ppecLogoIdPreserved)}
- Selected mailbox preserved: ${yn(state.validation.checks?.selectedMailboxPreserved)}
- Public email policy preserved: ${yn(state.validation.checks?.publicEmailPolicyPreserved)}
- No \`contactus@\`: ${yn(state.validation.checks?.noLegacyMailbox)}

Failed checks:

${state.validation.failed?.length ? state.validation.failed.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(rootReportRel, `# Pumpkin Ice First PPEC Banner Copy Update Report

Date: ${generatedAt}

## Status

${state.blockers.length ? 'Blocked before CMS import.' : 'Ready.'}

## Scope

Updated only the first PPEC partner banner copy in a homepage candidate. No \`/contact\`, \`/service-areas\`, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, or Roller action was performed.

## Auth

- Env JWT: ${state.auth.envStatus}
- Temp JWT: ${state.auth.tempJwtStatus}
- Auth validation: ${state.auth.validation}
- JWT printed: no

## Output

- Candidate: \`${candidateRel}\`
- Package: \`${packageRel}\`
- Folder: \`${outRel}/\`

## Validation

- Validation ok: ${yn(state.validation.ok)}
- Forbidden terms absent from first banner: ${yn(state.validation.checks?.noForbiddenCopy)}
- MediaAsset IDs unchanged: ${yn(state.validation.checks?.mediaAssetIdsUnchanged)}
- Renderer variant unchanged: ${yn(state.validation.checks?.rendererVariantUnchanged)}
- PPEC logo ID preserved: ${yn(state.validation.checks?.ppecLogoIdPreserved)}
- Second PPEC block unchanged: ${yn(state.validation.checks?.secondPpecBlockUnchanged)}

## Import

- Import attempted: no
- Import performed: no
- Blocker: ${state.update.importBlockedReason || 'none'}

## Next Action

Re-add valid admin auth, then import \`${candidateRel}\` to homepage route \`/\` only as draft/needs_review.
`);
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

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return (result.stdout || result.stderr || '').trim();
}

function yn(value) {
  return value ? 'yes' : 'no';
}

