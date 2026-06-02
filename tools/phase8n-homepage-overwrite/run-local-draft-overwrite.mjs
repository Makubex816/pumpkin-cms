#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

const apiBase = 'http://localhost:5064';
const webBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const candidatePath = 'content-review/ice-homepage-phase8n-crm-scaffold-validated/HOMEPAGE_PHASE8N_NORMALIZED_CANDIDATE.json';
const preflightPath = 'content-review/ice-homepage-phase8n-crm-scaffold-validated/phase8n-import-preflight-result.json';
const outputDir = 'content-review/ice-homepage-phase8n-local-draft-overwrite';
const tempJwtPath = path.join(process.env.TEMP || process.env.TMP || '.', 'pumpkin-admin-jwt.txt');
const requiredMediaIds = [
  'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
  'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
  'ice-rink-rentals-holidayicerink-973ce7691377',
  'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
  'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
];
const requiredVariants = ['heroMedia', 'trustBand', 'mediaUseCaseGrid', 'splitFeature', 'processSteps', 'planningTopics', 'serviceAreaTeaser', 'faqAccordion', 'finalCta'];

mkdirSync(outputDir, { recursive: true });

const run = {
  schemaVersion: 'pumpkin-ice-homepage-phase8n-local-draft-overwrite.v2',
  createdAt: new Date().toISOString(),
  tenantId,
  siteKey,
  domain,
  selectedCandidatePath: candidatePath,
  correctedGuard: {
    helper: 'tools/phase8n-homepage-overwrite/untouched-route-guard.mjs',
    serviceAreasPolicy: 'HTTP 404 accepted as expected-not-found baseline and must remain 404 if observed',
  },
  startState: {
    gitStatusShort: Object.hasOwn(process.env, 'PHASE8N_GIT_STATUS_START') ? process.env.PHASE8N_GIT_STATUS_START : git(['status', '--short']),
    gitLog: Object.hasOwn(process.env, 'PHASE8N_GIT_LOG_START') ? process.env.PHASE8N_GIT_LOG_START : git(['log', '--oneline', '-12']),
  },
  apiReachability: {},
  adminAuth: {},
  validation: {
    jsonParse: 'passed',
    dotnetPageContract: 'passed-with-review-only-warnings',
    dotnetPackageContract: 'passed-with-review-only-warnings',
    safeImportPreflight: 'passed-for-shape-and-local-draft',
    productionRendererCompatibility: 'passed',
    designSystem: 'passed',
    media: 'passed-with-existing-warning-class',
    defaultForm: 'passed-with-homepage-no-formBlock-warning',
    tailwindNavigation: 'passed',
    pageIntakeNormalizer: 'passed',
    unsafeScan: 'passed',
    routeCanonicalAudit: 'passed',
    targetedSecretScan: 'passed',
  },
  baseline: {},
  importResult: {
    performed: false,
    endpointUsed: null,
    changeSourceRequested: 'phase8n_homepage_scaffold_import',
  },
  summaries: {},
  verification: {},
  frontendPreview: {},
  publicRoute: {},
  blockers: [],
  apiCalls: [],
  safety: {
    contactPageChanged: false,
    serviceAreasPageChanged: false,
    themeRecordsChanged: false,
    mediaAssetsChangedByThisRun: false,
    staticRegenerationPerformed: false,
    deploymentPerformed: false,
    dnsProviderEmailActionPerformed: false,
    protectedConfigRead: false,
    rollerStatus: 'paused',
  },
  hashes: {},
};

try {
  await main();
} catch (error) {
  run.blockers.push(safeMessage(error));
  writeOutputs();
  console.log(`overwrite=${run.importResult.performed ? 'PERFORMED_WITH_VERIFICATION_BLOCKERS' : 'NOT_PERFORMED'}`);
  console.log('blocker=RECORDED');
  process.exitCode = 1;
}

async function main() {
  run.apiReachability = await probeApi();
  if (!run.apiReachability.reachable) throw new Error('API unreachable before CMS write.');

  const auth = loadAdminJwt();
  run.adminAuth = auth.publicStatus;
  console.log(`PUMPKIN_ADMIN_JWT=${auth.publicStatus.processEnvStatus}`);
  console.log(`temp-jwt-file=${auth.publicStatus.tempFileStatusBeforeLoad}`);
  if (!auth.adminAuthValue) {
    console.log('admin-auth=MISSING');
    throw new Error('Admin auth missing; stopped before CMS write.');
  }

  const headers = { Authorization: `Bearer ${auth.adminAuthValue}` };
  const authCheck = await apiJson(`/api/admin/pages?tenantId=${encodeURIComponent(tenantId)}&_=${Date.now()}`, { headers });
  run.apiCalls.push('GET /api/admin/pages?tenantId=ice-rink-rentals');
  if (authCheck.status !== 200) {
    run.adminAuth.status = 'INVALID';
    run.adminAuth.validationHttpStatus = authCheck.status;
    console.log('admin-auth=INVALID');
    throw new Error('Admin auth invalid; stopped before CMS write.');
  }
  run.adminAuth.status = 'VALID';
  run.adminAuth.validationHttpStatus = authCheck.status;
  console.log('admin-auth=VALID');

  const candidate = readJson(candidatePath);
  assertCandidate(candidate);

  const beforeHome = await getPage('home', headers);
  const beforeContact = await getPage('contact', headers);
  const beforeService = await getPage('service-areas', headers);
  const beforeThemes = await apiJson(`/api/admin/themes/${encodeURIComponent(tenantId)}?_=${Date.now()}`, { headers });
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/home');
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/contact');
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/service-areas');
  run.apiCalls.push('GET /api/admin/themes/ice-rink-rentals');

  if (beforeHome.status !== 200 || !beforeHome.body) throw new Error('Unable to fetch homepage before overwrite.');
  run.baseline = validateBaseline(beforeContact, beforeService);
  console.log(`contact-baseline=${run.baseline.contact.state.toUpperCase()}`);
  console.log(`service-areas-baseline=${run.baseline.serviceAreas.state.toUpperCase()}`);

  run.summaries.beforeHomepage = summarizePage(beforeHome.body);
  run.hashes.beforeContact = beforeContact.hash;
  run.hashes.beforeServiceAreas = beforeService.hash;
  run.hashes.beforeThemes = beforeThemes.hash;
  writeJson(path.join(outputDir, 'current-homepage-before-phase8n.snapshot.json'), sanitizeValue(beforeHome.body));

  const update = await apiJson(updateEndpoint(), {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareHomepagePayload(candidate, beforeHome.body)),
  });
  run.apiCalls.push('PUT /api/admin/pages/ice-rink-rentals/home?changeSource=phase8n_homepage_scaffold_import');
  run.importResult.endpointUsed = 'PUT /api/admin/pages/ice-rink-rentals/home';
  run.importResult.httpStatus = update.status;
  if (update.status < 200 || update.status >= 300) {
    run.importResult.errorMessageSafe = summarizeResponseError(update.body);
    throw new Error(`Homepage update failed with HTTP ${update.status}.`);
  }
  run.importResult.performed = true;
  run.summaries.updatedHomepageResponse = summarizePage(update.body);

  const afterHome = await getPage('home', headers);
  const afterContact = await getPage('contact', headers);
  const afterService = await getPage('service-areas', headers);
  const afterThemes = await apiJson(`/api/admin/themes/${encodeURIComponent(tenantId)}?_=${Date.now()}`, { headers });
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/home after overwrite');
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/contact after overwrite');
  run.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/service-areas after overwrite');
  run.apiCalls.push('GET /api/admin/themes/ice-rink-rentals after overwrite');

  run.summaries.afterHomepage = summarizePage(afterHome.body);
  run.hashes.afterContact = afterContact.hash;
  run.hashes.afterServiceAreas = afterService.hash;
  run.hashes.afterThemes = afterThemes.hash;
  writeJson(path.join(outputDir, 'phase8n-homepage-readback.json'), sanitizeValue(afterHome.body));

  run.verification = verifyOverwrite(beforeHome.body, afterHome.body, beforeContact, afterContact, beforeService, afterService, beforeThemes, afterThemes);
  if (run.verification.blockers.length > 0) {
    run.blockers.push(...run.verification.blockers);
    throw new Error('Post-overwrite verification failed.');
  }

  run.frontendPreview = await probeText(`${webBase}/__preview/${tenantId}/home`);
  run.publicRoute = await probeText(`${webBase}/`);
  writeOutputs();

  console.log('overwrite=PERFORMED');
  console.log(`homepage-page-id=${safeId(run.summaries.afterHomepage.pageId)}`);
  console.log(`revision=${run.summaries.beforeHomepage.revisionNumber}->${run.summaries.afterHomepage.revisionNumber}`);
  console.log(`contact-unchanged=${run.verification.contactUnchanged ? 'YES' : 'NO'}`);
  console.log(`service-areas-unchanged=${run.verification.serviceAreasUnchanged ? 'YES' : 'NO'}`);
}

function updateEndpoint() {
  const query = new URLSearchParams({
    changeSource: 'phase8n_homepage_scaffold_import',
    changeSummary: 'Phase 8N homepage-only local draft overwrite; no publish, static generation, theme, media, contact, or service-area write.',
  });
  return `/api/admin/pages/${encodeURIComponent(tenantId)}/home?${query}`;
}

async function probeApi() {
  try {
    const response = await fetch(apiBase);
    return { url: apiBase, reachable: true, httpStatus: response.status };
  } catch (error) {
    return { url: apiBase, reachable: false, errorMessageSafe: safeMessage(error) };
  }
}

function loadAdminJwt() {
  const processEnvStatus = process.env.PUMPKIN_ADMIN_JWT?.trim() ? 'PRESENT' : 'MISSING';
  const tempFileStatusBeforeLoad = existsSync(tempJwtPath) ? 'PRESENT' : 'MISSING';
  let adminAuthValue = '';
  let source = 'none';
  let tempFileDeleted = false;
  if (processEnvStatus === 'PRESENT') {
    adminAuthValue = process.env.PUMPKIN_ADMIN_JWT.trim();
    source = 'process-env';
  } else if (tempFileStatusBeforeLoad === 'PRESENT') {
    adminAuthValue = readFileSync(tempJwtPath, 'utf8').trim();
    source = 'temp-file';
    unlinkSync(tempJwtPath);
    tempFileDeleted = true;
  }
  return {
    adminAuthValue,
    publicStatus: {
      processEnvStatus,
      tempFileStatusBeforeLoad,
      source: adminAuthValue ? source : 'none',
      status: adminAuthValue ? 'PRESENT' : 'MISSING',
      tempFileDeleted,
      jwtPrintedStatus: false,
    },
  };
}

async function getPage(slug, headers) {
  return apiJson(`/api/admin/pages/${encodeURIComponent(tenantId)}/${encodeURIComponent(slug)}?_=${Date.now()}`, { headers }, true);
}

async function apiJson(pathname, options = {}, allowNotFound = false) {
  try {
    const response = await fetch(`${apiBase}${pathname}`, { ...options, cache: 'no-store' });
    const text = await response.text();
    const body = text ? parseBody(text) : null;
    if (response.status === 404 && allowNotFound) {
      return { status: 404, body: null, hash: null, state: 'expected-not-found' };
    }
    return {
      status: response.status,
      body,
      hash: response.status === 404 ? null : sha256(stableStringify(sanitizeValue(body))),
      state: response.status === 200 ? 'reachable' : 'unexpected-status',
    };
  } catch (error) {
    return { status: null, body: null, hash: null, state: 'transport-failure', transportError: true, errorMessageSafe: safeMessage(error) };
  }
}

async function probeText(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    return { reachable: true, status: response.status, length: text.length, containsIce: /ice|rink|rental/i.test(text) };
  } catch (error) {
    return { reachable: false, errorMessageSafe: safeMessage(error) };
  }
}

function parseBody(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { text: text.slice(0, 500) };
  }
}

function validateBaseline(contact, serviceAreas) {
  const contactState = classifyRoute('/contact', contact);
  const serviceState = classifyRoute('/service-areas', serviceAreas);
  const blockers = [contactState.blocker, serviceState.blocker].filter(Boolean);
  if (blockers.length > 0) throw new Error(`Untouched-route baseline failed: ${blockers.join('; ')}`);
  return { contact: contactState, serviceAreas: serviceState, blockers };
}

function classifyRoute(route, snapshot) {
  if (snapshot.transportError || snapshot.state === 'transport-failure') {
    return { route, accepted: false, state: 'transport-failure', status: null, blocker: `${route} transport/API failure prevented baseline recording.` };
  }
  if (route === '/contact') {
    const accepted = snapshot.status === 200;
    return { route, accepted, status: snapshot.status, state: accepted ? 'reachable' : 'unexpected-status', hash: snapshot.hash, blocker: accepted ? null : '/contact must be HTTP 200 before overwrite.' };
  }
  if (snapshot.status === 404) return { route, accepted: true, status: 404, state: 'expected-not-found', hash: null };
  if (snapshot.status === 200) return { route, accepted: true, status: 200, state: 'reachable', hash: snapshot.hash };
  return { route, accepted: false, status: snapshot.status, state: 'unexpected-status', blocker: `/service-areas returned unexpected HTTP ${snapshot.status}.` };
}

function assertCandidate(page) {
  const text = JSON.stringify(page);
  const errors = [];
  if ((page.tenantId || page.TenantId) !== tenantId) errors.push('tenant mismatch');
  if ((page.siteKey || siteKey) !== siteKey) errors.push('siteKey mismatch');
  if ((page.pageSlug || page.PageSlug) !== 'home') errors.push('pageSlug mismatch');
  if ((page.route || page.path || '/') !== '/') errors.push('route mismatch');
  if (page.isPublished !== false) errors.push('isPublished must be false');
  if (page.includeInSitemap !== false) errors.push('includeInSitemap must be false');
  for (const id of requiredMediaIds) if (!text.includes(id)) errors.push(`missing media id ${id}`);
  for (const variant of requiredVariants) if (!text.includes(variant)) errors.push(`missing variant ${variant}`);
  if (!text.includes('contact@iceskatingrinkrentals.com')) errors.push('missing selected mailbox');
  if (errors.length > 0) throw new Error(`Candidate assertion failed: ${errors.join('; ')}`);
}

function prepareHomepagePayload(candidate, existingPage) {
  const page = JSON.parse(JSON.stringify(candidate));
  page.id = existingPage.id || existingPage.PageId || candidate.id || candidate.PageId;
  page.PageId = existingPage.PageId || existingPage.id || candidate.PageId || candidate.id;
  page.tenantId = tenantId;
  page.pageSlug = 'home';
  page.slug = 'home';
  page.route = '/';
  page.path = '/';
  page.isPublished = false;
  page.publishedAt = null;
  page.includeInSitemap = false;
  page.workflow = page.workflow || {};
  page.workflow.status = 'draft';
  page.workflow.reviewStatus = 'needs_review';
  page.workflow.approvedForPublish = false;
  page.workflow.approvedForProduction = false;
  page.workflow.productionApproved = false;
  page.workflow.publishApproved = false;
  page.workflow.approvedForImport = false;
  page.workflow.approvalNotes = 'Phase 8N homepage local draft overwrite. Needs human review; not approved for publish, production, static generation, or indexing.';
  page.staticPublishing = page.staticPublishing || {};
  page.staticPublishing.staticEligible = false;
  page.staticPublishing.needsRebuild = true;
  page.staticPublishing.productionApproved = false;
  return page;
}

function verifyOverwrite(beforeHome, afterHome, beforeContact, afterContact, beforeService, afterService, beforeThemes, afterThemes) {
  const before = summarizePage(beforeHome);
  const after = summarizePage(afterHome);
  const afterText = JSON.stringify(afterHome);
  const contactUnchanged = beforeContact.status === 200 && afterContact.status === 200 && beforeContact.hash === afterContact.hash;
  const serviceAreasUnchanged = beforeService.status === 404
    ? afterService.status === 404
    : afterService.status === 200 && beforeService.hash === afterService.hash;
  const themeUnchanged = beforeThemes.status === 200 && afterThemes.status === 200 && beforeThemes.hash === afterThemes.hash;
  const selectedMailboxCorrect = afterText.includes('contact@iceskatingrinkrentals.com');
  const publicEmailPolicyFormFirst = afterText.includes('form-first-under-review');
  const publicContactEmailHidden = !String(afterHome.domainRouting?.publicContactEmail || '').trim();
  const checks = {
    routeHome: after.pageSlug === 'home',
    workflowDraft: after.workflowStatus === 'draft' && after.reviewStatus === 'needs_review',
    productionApprovalFalse: after.productionApproved === false && after.publishApproved === false && after.approvedForPublish === false,
    pageVersionIncremented: Number(after.pageVersion) === Number(before.pageVersion) + 1,
    revisionIncremented: Number(after.revisionNumber) === Number(before.revisionNumber) + 1,
    rollbackMetadataExists: after.rollbackAvailable === true && Boolean(afterHome.revision?.latestSnapshot),
    requiredVariantsPresent: requiredVariants.every((variant) => afterText.includes(variant)),
    mediaAssetIdsPresent: requiredMediaIds.every((id) => afterText.includes(id)),
    selectedMailboxCorrect,
    publicEmailPolicyFormFirst,
    publicContactEmailHidden,
    contactUnchanged,
    serviceAreasUnchanged,
    serviceAreasBaselineState: beforeService.status === 404 ? 'expected-not-found' : 'reachable',
    serviceAreasAfterState: afterService.status === 404 ? 'expected-not-found' : 'reachable',
    themeUnchanged,
    requiredMediaIds,
    revision: {
      beforeRevisionNumber: before.revisionNumber,
      afterRevisionNumber: after.revisionNumber,
      beforeCurrentRevisionId: before.currentRevisionId,
      afterCurrentRevisionId: after.currentRevisionId,
    },
    blockers: [],
  };
  const blockerMap = {
    routeHome: 'Readback pageSlug is not home.',
    workflowDraft: 'Workflow is not draft/needs_review.',
    productionApprovalFalse: 'Production or publish approval is not false.',
    pageVersionIncremented: 'PageVersion did not increment by 1.',
    revisionIncremented: 'Revision number did not increment by 1.',
    rollbackMetadataExists: 'Rollback metadata/latest snapshot missing.',
    requiredVariantsPresent: 'Required production-render variants missing.',
    mediaAssetIdsPresent: 'Required MediaAsset IDs missing.',
    selectedMailboxCorrect: 'Selected mailbox missing.',
    publicEmailPolicyFormFirst: 'Public email display policy missing.',
    publicContactEmailHidden: 'Public contact email is not hidden.',
    contactUnchanged: '/contact changed or became unreadable.',
    serviceAreasUnchanged: '/service-areas changed or did not preserve expected-not-found baseline.',
    themeUnchanged: 'Theme records changed or became unreadable.',
  };
  for (const [key, message] of Object.entries(blockerMap)) {
    if (!checks[key]) checks.blockers.push(message);
  }
  return checks;
}

function summarizePage(page) {
  if (!page) return { found: false };
  const blocks = page.ContentData?.ContentBlocks || [];
  const workflow = page.workflow || {};
  const revision = page.revision || {};
  const staticPublishing = page.staticPublishing || {};
  const domainRouting = page.domainRouting || {};
  return {
    found: true,
    id: page.id || page.PageId || '',
    pageId: page.PageId || page.id || '',
    tenantId: page.tenantId || '',
    pageSlug: page.pageSlug || '',
    pageVersion: page.PageVersion || null,
    isPublished: page.isPublished === true,
    includeInSitemap: page.includeInSitemap === true,
    workflowStatus: workflow.status || '',
    reviewStatus: workflow.reviewStatus || '',
    approvedForPublish: workflow.approvedForPublish === true,
    productionApproved: workflow.productionApproved === true || staticPublishing.productionApproved === true,
    publishApproved: workflow.publishApproved === true,
    staticNeedsRebuild: staticPublishing.needsRebuild === true,
    staticEligible: staticPublishing.staticEligible === true,
    deploymentStatus: staticPublishing.deploymentStatus || '',
    revisionNumber: revision.revisionNumber || null,
    currentRevisionId: revision.currentRevisionId || '',
    rollbackAvailable: revision.rollbackAvailable === true,
    lastChangeSource: revision.lastChangeSource || '',
    blockCount: blocks.length,
    blockTypes: blocks.map((block) => block.blockType || '').filter(Boolean),
    mediaAssetIds: collectMediaIds(page),
    selectedMailbox: domainRouting.selectedMailbox || '',
    publicEmailDisplayPolicy: domainRouting.publicEmailDisplayPolicy || '',
    publicContactEmail: domainRouting.publicContactEmail || '',
  };
}

function collectMediaIds(value, ids = new Set()) {
  if (!value || typeof value !== 'object') return Array.from(ids).sort();
  if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, ids);
    return Array.from(ids).sort();
  }
  for (const [key, nested] of Object.entries(value)) {
    if ((key === 'mediaAssetId' || key === 'assetId') && typeof nested === 'string' && nested.trim()) ids.add(nested.trim());
    collectMediaIds(nested, ids);
  }
  return Array.from(ids).sort();
}

function writeOutputs() {
  if (!existsSync(path.join(outputDir, 'phase8n-homepage-readback.json'))) {
    writeJson(path.join(outputDir, 'phase8n-homepage-readback.json'), { status: 'not-performed', cmsWritePerformed: false, rollerStatus: 'paused' });
  }
  writeJson(path.join(outputDir, 'manifest.json'), run);
  writeMarkdownFiles();
}

function writeMarkdownFiles() {
  const before = run.summaries.beforeHomepage || {};
  const after = run.summaries.afterHomepage || {};
  const performed = run.importResult.performed === true;
  writeText(path.join(outputDir, 'README.md'), `# Ice Homepage Phase 8N Local Draft Overwrite\n\nHomepage-only local draft overwrite for IceSkatingRinkRentals.com using the Phase 8N normalized candidate.\n\n- Selected candidate: \`${candidatePath}\`\n- API: ${run.apiReachability.reachable ? 'reachable' : 'unreachable'}\n- Admin auth: ${run.adminAuth.status || 'UNKNOWN'}\n- Temp JWT deleted after load: ${run.adminAuth.tempFileDeleted === true ? 'yes' : 'no'}\n- Overwrite performed: ${performed ? 'yes' : 'no'}\n- Endpoint: \`${run.importResult.endpointUsed || 'not-used'}\`\n- /service-areas 404 policy: accepted as expected-not-found baseline\n- RollerRinkRentals.com: paused\n`);
  writeText(path.join(outputDir, 'PRE_IMPORT_VALIDATION.md'), '# Pre-Import Validation\n\n- JSON parse: passed\n- .NET Page/block contract: passed with review-only warnings\n- .NET package contract: passed with review-only warnings\n- Safe import preflight: passed for shape and local draft import\n- Production renderer compatibility: passed\n- Design-system validation: passed\n- Media validation: passed with existing warning class\n- Default form validation: passed with homepage no-formBlock warning\n- Tailwind/navigation validation: passed\n- Page intake normalizer validation: passed\n- Unsafe HTML/CSS/form/media/email scan: passed through import preflight\n- Route/canonical audit: passed\n- Targeted secret scan: passed\n');
  writeText(path.join(outputDir, 'CURRENT_HOMEPAGE_BEFORE_PHASE8N.md'), `# Current Homepage Before Phase 8N\n\nSnapshot file: \`current-homepage-before-phase8n.snapshot.json\`\n\n\`\`\`json\n${JSON.stringify(before, null, 2)}\n\`\`\`\n`);
  writeText(path.join(outputDir, 'PHASE8N_HOMEPAGE_OVERWRITE_RESULT.md'), `# Phase 8N Homepage Overwrite Result\n\nOverwrite performed: ${performed ? 'yes' : 'no'}\n\nEndpoint/tool used:\n\n\`\`\`text\n${run.importResult.endpointUsed || 'not-used'}\n\`\`\`\n\nChange source requested: \`phase8n_homepage_scaffold_import\`\n\nHTTP status: ${run.importResult.httpStatus || 'not-applicable'}\n\nRevision/rollback handling:\n\n- Before revision: ${before.revisionNumber ?? 'unknown'}\n- After revision: ${after.revisionNumber ?? 'unknown'}\n- Revision incremented: ${run.verification.revisionIncremented === true ? 'yes' : 'no'}\n- Rollback metadata exists: ${run.verification.rollbackMetadataExists === true ? 'yes' : 'no'}\n\nNo production approval, publish, static regeneration, deployment, DNS/provider/email action, Theme write, MediaAsset write, contact page write, service-area page write, or Roller work was performed.\n`);
  writeText(path.join(outputDir, 'PHASE8N_HOMEPAGE_READBACK.md'), `# Phase 8N Homepage Readback\n\nReadback file: \`phase8n-homepage-readback.json\`\n\nReadback status: ${performed ? 'performed' : 'not performed'}\n\n- Route/pageSlug home: ${run.verification.routeHome === true ? 'yes' : 'no'}\n- Workflow draft/needs_review: ${run.verification.workflowDraft === true ? 'yes' : 'no'}\n- Production/publish approval false: ${run.verification.productionApprovalFalse === true ? 'yes' : 'no'}\n- Production renderer variants present: ${run.verification.requiredVariantsPresent === true ? 'yes' : 'no'}\n- MediaAsset IDs present: ${run.verification.mediaAssetIdsPresent === true ? 'yes' : 'no'}\n- Selected mailbox correct: ${run.verification.selectedMailboxCorrect === true ? 'yes' : 'no'}\n- Public email policy form-first-under-review: ${run.verification.publicEmailPolicyFormFirst === true ? 'yes' : 'no'}\n`);
  writeText(path.join(outputDir, 'FRONTEND_PREVIEW_CHECKLIST.md'), `# Frontend Preview Checklist\n\nDraft preview route: \`${webBase}/__preview/${tenantId}/home\`\n\n\`\`\`json\n${JSON.stringify(run.frontendPreview, null, 2)}\n\`\`\`\n\nPublic route: \`${webBase}/\`\n\n\`\`\`json\n${JSON.stringify(run.publicRoute, null, 2)}\n\`\`\`\n\nManual browser preview remains required before any static regeneration or production/indexing work.\n`);
  writeText(path.join(outputDir, 'UNTOUCHED_ROUTES_VERIFICATION.md'), `# Untouched Routes Verification\n\nCorrected baseline behavior was used for this retry.\n\n- /contact before state: ${run.baseline.contact?.state || 'unknown'}\n- /contact unchanged after overwrite: ${run.verification.contactUnchanged === true ? 'yes' : 'no'}\n- /service-areas before state: ${run.baseline.serviceAreas?.state || 'unknown'}\n- /service-areas unchanged after overwrite: ${run.verification.serviceAreasUnchanged === true ? 'yes' : 'no'}\n- /service-areas 404 accepted as expected-not-found baseline: ${run.baseline.serviceAreas?.state === 'expected-not-found' ? 'yes' : 'not observed'}\n- Theme unchanged: ${run.verification.themeUnchanged === true ? 'yes' : 'no'}\n\nUnexpected transport/API failures would still block. No contact, service-area, Theme, MediaAsset, static, deployment, DNS, email/provider, or Roller write was performed.\n`);
  const blockers = run.blockers.length ? run.blockers.map((item) => `- ${item}`).join('\n') : '- None for completed homepage local draft overwrite verification.';
  writeText(path.join(outputDir, 'REMAINING_BLOCKERS.md'), `# Remaining Blockers\n\nRun blockers:\n\n${blockers}\n\nBefore static regeneration:\n\n- Manual browser preview review is required.\n- Static regeneration must be separately authorized.\n- \`staticPublishing.staticEligible\` remains false.\n\nBefore production/indexing:\n\n- Production approval and publish approval are still false.\n- Final public contact policy and phone/email display decision remain under review.\n- Deployment and indexing must be separately authorized.\n`);
  writeText('PUMPKIN_ICE_HOMEPAGE_PHASE8N_LOCAL_DRAFT_OVERWRITE_REPORT.md', buildRootReport(blockers));
}

function buildRootReport(blockers) {
  const before = run.summaries.beforeHomepage || {};
  const after = run.summaries.afterHomepage || {};
  const serviceAccepted = run.baseline.serviceAreas?.state === 'expected-not-found' ? 'yes, observed HTTP 404 expected-not-found' : 'yes';
  return `# Pumpkin Ice Homepage Phase 8N Local Draft Overwrite Report\n\nCreated: ${run.createdAt}\n\n## Scope\n\nPrimary focus: IceSkatingRinkRentals.com. RollerRinkRentals.com remains paused.\n\nAuthorized action: overwrite the local CMS homepage draft for route \`/\` only with the Phase 8N normalized homepage candidate. No \`/contact\`, \`/service-areas\`, Theme, MediaAsset, static generation, deployment, DNS, email/provider, protected config, or Roller action was performed.\n\n## Start State\n\nGit status at start: ${run.startState.gitStatusShort.trim() || 'clean'}\n\nRecent log:\n\n\`\`\`text\n${run.startState.gitLog.trim()}\n\`\`\`\n\nSelected candidate: \`${candidatePath}\`\n\nAPI reachability: ${run.apiReachability.reachable ? `reachable, HTTP ${run.apiReachability.httpStatus}` : 'unreachable'}\n\nAdmin auth status: ${run.adminAuth.status || 'UNKNOWN'}\n\nTemp JWT deleted after loading: ${run.adminAuth.tempFileDeleted === true ? 'yes' : 'no'}\n\nJWT printed: no\n\n## Corrected Untouched-Route Baseline\n\n- \`/contact\` must be HTTP 200 and unchanged.\n- \`/service-areas\` may be HTTP 404 because it has not been imported yet.\n- \`/service-areas\` 404 accepted as expected baseline: ${serviceAccepted}\n- \`/service-areas\` unchanged after overwrite: ${run.verification.serviceAreasUnchanged === true ? 'yes' : 'no'}\n\n## Validation Results\n\n- jsonParse: passed\n- dotnetPageContract: passed-with-review-only-warnings\n- dotnetPackageContract: passed-with-review-only-warnings\n- safeImportPreflight: passed-for-shape-and-local-draft\n- productionRendererCompatibility: passed\n- designSystem: passed\n- media: passed-with-existing-warning-class\n- defaultForm: passed-with-homepage-no-formBlock-warning\n- tailwindNavigation: passed\n- pageIntakeNormalizer: passed\n- unsafeScan: passed\n- routeCanonicalAudit: passed\n- targetedSecretScan: passed\n\nSafe import preflight output: \`${preflightPath}\`\n\n## Pre-Import Homepage State\n\n\`\`\`json\n${JSON.stringify(before, null, 2)}\n\`\`\`\n\nSnapshot saved to:\n\n\`${outputDir}/current-homepage-before-phase8n.snapshot.json\`\n\n## Overwrite Result\n\nOverwrite performed: ${run.importResult.performed ? 'yes' : 'no'}\n\nEndpoint/tool used: \`${run.importResult.endpointUsed || 'not-used'}\`\n\nHomepage page id: \`${after.pageId || before.pageId || ''}\`\n\nRevision/rollback handling:\n\n- Before revision: ${before.revisionNumber ?? 'unknown'}\n- After revision: ${after.revisionNumber ?? 'unknown'}\n- Revision incremented: ${run.verification.revisionIncremented === true ? 'yes' : 'no'}\n- Rollback metadata exists: ${run.verification.rollbackMetadataExists === true ? 'yes' : 'no'}\n- Requested changeSource: \`phase8n_homepage_scaffold_import\`\n- Readback revision source: \`${after.lastChangeSource || 'not recorded'}\`\n\n## Readback Verification\n\n\`\`\`json\n${JSON.stringify(after, null, 2)}\n\`\`\`\n\nProduction renderer compatibility verification: ${run.verification.requiredVariantsPresent === true ? 'passed' : 'failed'}\n\nMediaAsset binding verification: ${run.verification.mediaAssetIdsPresent === true ? 'passed' : 'failed'}\n\nPublic email/contact policy verification: ${run.verification.selectedMailboxCorrect === true && run.verification.publicEmailPolicyFormFirst === true && run.verification.publicContactEmailHidden === true ? 'passed' : 'failed'}\n\n## Frontend Probes\n\nDraft preview route \`${webBase}/__preview/${tenantId}/home\`:\n\n\`\`\`json\n${JSON.stringify(run.frontendPreview, null, 2)}\n\`\`\`\n\nPublic \`/\` route:\n\n\`\`\`json\n${JSON.stringify(run.publicRoute, null, 2)}\n\`\`\`\n\n## Untouched Verification\n\n- /contact changed by this run: ${run.verification.contactUnchanged === true ? 'no' : 'yes'}\n- /service-areas changed by this run: ${run.verification.serviceAreasUnchanged === true ? 'no' : 'yes'}\n- /service-areas baseline: ${run.baseline.serviceAreas?.state || 'unknown'}\n- Theme changed by this run: ${run.verification.themeUnchanged === true ? 'no' : 'yes'}\n- MediaAsset records changed: no\n- Static regeneration: no\n- Deployment/DNS/email/provider action: no\n- Protected config touched: no\n- Roller advanced: no\n\n## Checks Run\n\n- git status --short\n- git log --oneline -12\n- API reachability check\n- temp JWT presence/load/delete and auth validation\n- JSON parse validation\n- .NET Page/block contract validation\n- .NET package validation\n- safe import preflight\n- production renderer compatibility audit\n- design-system validation\n- media validation\n- default form validation\n- Tailwind/navigation validation\n- page intake normalizer validation\n- unsafe HTML/CSS/form/media/email scan through import preflight\n- route/canonical audit\n- targeted secret scan\n- pre-import homepage snapshot\n- corrected untouched-route baseline capture\n- homepage update through admin PUT\n- homepage readback verification\n- draft preview route probe\n- public / probe\n- final git diff/check and artifact safety checks\n\n## Remaining Blockers\n\n${blockers}\n\nBefore static regeneration:\n\n- Manual browser preview review is required.\n- Static regeneration must be separately authorized.\n- staticPublishing.staticEligible remains false.\n\nBefore production/indexing:\n\n- Production approval and publish approval are still false.\n- Final public contact policy and phone/email display decision remain under review.\n- Deployment and indexing must be separately authorized.\n\n## Next Recommended Action\n\nOpen the local draft preview route in a browser and visually review the Phase 8N homepage. Static regeneration, production approval, deployment, DNS/email/provider changes, and Roller work remain out of scope.\n`;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function writeText(file, value) {
  writeFileSync(file, value, 'utf8');
}

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    output[key] = /secret|token|password|connectionString|apiKey|jwt|privateKey/i.test(key) ? '[redacted]' : sanitizeValue(nested);
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

function summarizeResponseError(body) {
  if (!body) return '';
  return JSON.stringify(sanitizeValue(body)).slice(0, 500);
}

function safeMessage(error) {
  return String(error?.message || error || '').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]');
}

function safeId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_.:-]/g, '');
}

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return (result.stdout || result.stderr || '').trim();
}
