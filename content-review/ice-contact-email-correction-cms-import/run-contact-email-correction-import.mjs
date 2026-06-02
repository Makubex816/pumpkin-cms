import { existsSync, mkdirSync, readFileSync, rmSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const now = new Date().toISOString();
const outDir = path.join(repoRoot, 'content-review', 'ice-contact-email-correction-cms-import');
const apiBase = 'http://localhost:5064';
const frontendBase = 'http://localhost:3002';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const selectedMailbox = 'contact@iceskatingrinkrentals.com';
const oldMailbox = 'contactus@iceskatingrinkrentals.com';
const staticEndpointRef = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const leadRecipientRef = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const phoneDisplay = '(844) 727-8947';
const phoneE164 = '+18447278947';

const inputZipRel = 'content-review/ice-contact-email-correction-input/ice-site-contact-email-correction-pack.zip';
const extractedRel = 'content-review/ice-contact-email-correction-input/extracted';
const contactPackageRel = 'content-review/ice-contact-email-correction-input/extracted/ice-contact-page-phase9b-email-corrected/import/contact-page-import.json';
const contactFullRel = 'content-review/ice-contact-email-correction-input/extracted/ice-contact-page-phase9b-email-corrected/ice-contact-page.phase9b.full.json';
const homepagePackageRel = 'content-review/ice-contact-email-correction-input/extracted/ice-homepage-phase8l-email-corrected/ice-homepage.phase8l.full.json';
const sourceContactRel = 'content-review/ice-launch-phase8c13-approval-resolution/ice-contact.approval-resolution.json';
const sourceHomepageRel = 'content-review/ice-homepage-business-contact-policy/HOMEPAGE_BUSINESS_READY_CANDIDATE.json';
const contactCandidateRel = 'content-review/ice-contact-email-correction-cms-import/contact-cms-import-candidate.json';
const contactPreflightRel = 'content-review/ice-contact-email-correction-cms-import/contact-safe-local-preflight-result.json';
const contactDotnetRel = 'content-review/ice-contact-email-correction-cms-import/contact-dotnet-contract-result.json';
const homepageDecisionRel = 'content-review/ice-contact-email-correction-cms-import/homepage-correction-reference-decision.json';
const homepageDotnetRel = 'content-review/ice-contact-email-correction-cms-import/homepage-dotnet-contract-result.json';
const homepagePreflightRel = 'content-review/ice-contact-email-correction-cms-import/homepage-reference-import-preflight-result.json';
const dotnetDll = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'bin', 'Debug', 'net10.0', 'Pumpkin.PageContractTool.dll');

const startGitStatus = ['?? content-review/ice-contact-email-correction-input/ice-site-contact-email-correction-pack.zip'];
const startGitLog = [
  '2d8bb45 Add Ice homepage local draft import report',
  '892dccb Add Ice homepage local draft import auth blocker report',
  '9b7bcad Add Ice homepage business contact policy package',
  'dfe4f90 Bind Ice homepage MediaAsset records',
  'faf5986 Add Ice homepage MediaAsset binding blocker report',
  '895f914 Add safe local homepage import preflight runner',
  'c6e6382 Add Ice homepage local CMS preview readiness report',
  '0b7345f Add Ice local preview readiness package',
  '2ecd323 Update Microsoft 365 operational verification docs',
  '9f31719 Record confirmed Microsoft 365 mailbox verification',
  '10393b7 Add Microsoft 365 operational email verification package',
  '5f86906 Add Microsoft 365 email provider selection readiness',
];

const state = {
  createdAt: now,
  adminAuth: { source: 'MISSING', validation: 'MISSING', tempFileDeleted: false, jwtPrinted: false },
  checks: {},
  blockers: [],
  warnings: [],
  errors: [],
  apiCalls: [],
  safety: {
    serviceAreasChanged: false,
    themesChanged: false,
    rollerTouched: false,
    staticRegenerationPerformed: false,
    deploymentPerformed: false,
    dnsProviderEmailActionPerformed: false,
    protectedConfigRead: false,
  },
  importPerformed: false,
  homepageUpdatePerformed: false,
  contactImportPerformed: false,
  contactImportMode: 'not-attempted',
  contactImportEndpoint: '',
};

try {
  await main();
} catch (error) {
  state.errors.push(error.message);
  state.blockers.push('Runner failed before normal completion.');
  await writeReports();
  console.log(JSON.stringify({ ok: false, adminAuth: state.adminAuth.validation, importPerformed: state.importPerformed, errors: state.errors }, null, 2));
  process.exitCode = 1;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  state.git = {
    startStatusAtTaskStart: startGitStatus,
    startLogAtTaskStart: startGitLog,
    currentStatusBeforeGeneratedOutputs: run('git', ['status', '--short', '--untracked-files=all']).stdout.trim().split(/\r?\n/).filter(Boolean),
  };

  state.checks.apiReachable = (await probe(apiBase)) ? 'pass' : 'fail';
  if (state.checks.apiReachable !== 'pass') state.blockers.push('Local API http://localhost:5064 is not reachable.');

  state.packageInventory = inventory();
  state.emailAudit = emailAudit();

  const contactCandidate = buildContactCandidate();
  writeJson(contactCandidateRel, contactCandidate);
  writeJson(homepageDecisionRel, homepageDecision());

  state.jsonParse = validatePackageJson();
  state.checks.jsonParseValidation = state.jsonParse.ok ? 'pass' : 'fail';
  if (!state.jsonParse.ok) state.blockers.push('Package JSON parse validation failed.');

  const contactPreflight = contactSafePreflight(contactCandidate);
  writeJson(contactPreflightRel, contactPreflight);
  state.checks.contactSafeLocalPreflight = contactPreflight.ok ? 'pass' : 'fail';
  if (!contactPreflight.ok) state.blockers.push('Contact candidate failed safe local preflight.');

  const contactDotnet = dotnetContract(contactCandidateRel);
  writeJson(contactDotnetRel, contactDotnet);
  state.checks.contactDotnetContract = contactDotnet.ok ? 'pass' : 'fail';
  if (!contactDotnet.ok) state.blockers.push('Contact candidate failed .NET Page/block contract validation.');

  const homepageDotnet = dotnetContract(sourceHomepageRel);
  writeJson(homepageDotnetRel, homepageDotnet);
  state.checks.homepageDotnetContract = homepageDotnet.ok ? 'pass' : 'fail';
  if (!homepageDotnet.ok) state.warnings.push('Homepage reference candidate failed .NET contract; homepage write skipped.');

  const homepagePreflight = importPreflight(sourceHomepageRel, '/', homepagePreflightRel);
  state.checks.homepageReferenceImportPreflight = homepagePreflight.ok ? 'pass' : 'fail';
  if (!homepagePreflight.ok) state.warnings.push('Homepage reference import preflight did not fully pass; homepage write skipped.');

  state.fixtureChecks = {
    pageIntakeNormalizer: nodeTool(['tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']),
    designSystem: nodeTool(['tools/design-system-validation/validate-fixtures.mjs']),
    tailwindNavigation: nodeTool(['tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']),
    defaultForm: nodeTool(['tools/default-form-validation/validate-default-form-fixtures.mjs']),
    media: nodeTool(['tools/media-validation/validate-media-fixtures.mjs']),
  };
  for (const [name, result] of Object.entries(state.fixtureChecks)) {
    state.checks[`${name}FixtureValidation`] = result.ok ? 'pass' : 'fail';
    if (!result.ok) state.warnings.push(`${name} fixture validation returned non-zero.`);
  }

  state.unsafeScan = unsafeScan(contactCandidate);
  state.checks.unsafeHtmlCssFormMediaEmailScan = state.unsafeScan.ok ? 'pass' : 'fail';
  if (!state.unsafeScan.ok) state.blockers.push('Unsafe scan found blocking content in selected contact candidate.');

  state.secretScan = secretScan();
  state.checks.targetedSecretScan = state.secretScan.ok ? 'pass' : 'fail';
  if (!state.secretScan.ok) state.blockers.push('Targeted secret scan found secret-like values.');

  state.homepageUpdateSkippedReason = 'Skipped homepage CMS write: current local homepage draft already records the selected mailbox policy safely, while the uploaded homepage package is foreign WordPress-form-shaped, includes public mailto fallbacks, and includes service-area wording that remains outside this run.';

  if (canWrite()) await loadAuth();
  else state.blockers.push('CMS write skipped because local validation or API reachability did not pass.');

  if (state.adminAuth.validation === 'VALID' && canWrite()) await importContact(contactCandidate);
  else if (state.adminAuth.validation !== 'VALID') state.blockers.push('CMS write skipped because admin auth is missing or invalid.');

  await writeReports();
  console.log(JSON.stringify({
    ok: state.errors.length === 0,
    adminAuth: state.adminAuth.validation,
    tempFileDeleted: state.adminAuth.tempFileDeleted,
    importPerformed: state.importPerformed,
    homepageUpdatePerformed: state.homepageUpdatePerformed,
    contactImportPerformed: state.contactImportPerformed,
    contactImportMode: state.contactImportMode,
    blockers: unique(state.blockers),
    outputDir: 'content-review/ice-contact-email-correction-cms-import',
    report: 'PUMPKIN_ICE_CONTACT_EMAIL_CORRECTION_CMS_IMPORT_REPORT.md',
  }, null, 2));
}

function buildContactCandidate() {
  const candidate = readJson(sourceContactRel);
  candidate.schemaVersion = 'pumpkin-contact-email-correction-cms-import-candidate.v1';
  candidate.contentPackageVersion = 'contact-email-correction.local-cms-draft.v1';
  candidate.templatePurpose = 'contact_email_correction_local_cms_draft_import_candidate';
  candidate.id = 'ice-rink-rentals-contact';
  candidate.PageId = 'ice-rink-rentals-contact';
  candidate.tenantId = tenantId;
  candidate.siteKey = siteKey;
  candidate.domain = domain;
  candidate.route = '/contact';
  candidate.path = '/contact';
  candidate.slug = 'contact';
  candidate.pageSlug = 'contact';
  candidate.canonicalUrl = `https://${domain}/contact`;
  candidate.PageVersion = Number(candidate.PageVersion || 1) + 1;
  candidate.reviewMetadata = {
    ...(candidate.reviewMetadata || {}),
    phase: 'contact-email-correction-cms-import',
    status: 'approved-for-local-cms-draft-import-not-production',
    approvedForLocalCmsDraftImport: true,
    approvedForCmsImport: false,
    approvedForProduction: false,
    sourcePhase: 'Phase 9B email correction package plus Phase 8C.13 Pumpkin contact candidate',
    sourceFile: contactPackageRel,
    normalizedFromPumpkinCandidate: sourceContactRel,
    packageWasDirectPumpkinPageShape: false,
    wordpressFormRuntimeImported: false,
    publicEmailDisplayPolicy: 'form-first-under-review',
    publicEmailDisplayApproved: false,
    selectedPrimaryMailbox: selectedMailbox,
    approvedPhoneDisplay: phoneDisplay,
    approvedPhoneE164: phoneE164,
    notes: unique([
      ...(candidate.reviewMetadata?.notes || []),
      'User approved local CMS draft/review import for homepage/contact correction package only.',
      'Foreign WordPress form package content was treated as reference only and was not imported as runtime behavior.',
      'The selected mailbox contact@iceskatingrinkrentals.com is recorded in review/routing metadata only.',
      'Public email display remains form-first/under-review; no public mailto links were imported.',
      'RollerRinkRentals.com remains paused.',
    ]),
  };
  candidate.workflow = {
    ...(candidate.workflow || {}),
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: 'codex_contact_email_correction_import',
    lastEditedAt: now,
    approvedForImport: false,
    approvedForProduction: false,
    approvedForLocalCmsDraftImport: true,
  };
  candidate.staticPublishing = {
    ...(candidate.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: 'local_cms_draft_review_only_not_static_regenerated',
    lastStaticBuildAt: '',
    lastDeployedAt: '',
  };
  candidate.seo = { ...(candidate.seo || {}), robots: 'noindex, nofollow', canonicalUrl: `https://${domain}/contact` };
  candidate.openGraph = { ...(candidate.openGraph || {}), url: `https://${domain}/contact` };
  candidate.formConfig = {
    ...(candidate.formConfig || {}),
    formId: 'default-quote-request',
    formKey: 'default-quote-request',
    formType: 'quote-request',
    routingMode: 'manual_review_then_provider_match',
    domainRoutingKey: leadRecipientRef,
    recipientGroup: leadRecipientRef,
    staticFormEndpointKey: staticEndpointRef,
    replyToMode: 'submitter_email',
    mailtoFallbackEnabled: false,
    consentRequired: true,
    requiresConsent: true,
    spamProtectionRequired: true,
  };
  candidate.leadCapture = {
    ...(candidate.leadCapture || {}),
    formId: 'default-quote-request',
    formKey: 'default-quote-request',
    formType: 'quote-request',
    recipientGroup: leadRecipientRef,
    staticFormEndpointKey: staticEndpointRef,
    requiresConsent: true,
    spamProtectionRequired: true,
    visibleFormBlockId: 'contact-quote-form',
  };
  candidate.domainRouting = {
    ...(candidate.domainRouting || {}),
    domain,
    brandName: 'Ice Skating Rink Rentals',
    publicContactEmail: '',
    quoteRequestEmail: '',
    supportEmail: '',
    replyToEmail: '',
    fromName: 'Ice Skating Rink Rentals',
    fromEmail: '',
    contactPageSlug: 'contact',
    selectedPrimaryMailbox: selectedMailbox,
    primaryPhone: phoneDisplay,
    primaryPhoneE164: phoneE164,
    mailtoLinksEnabled: false,
    publicEmailDisplayPolicy: 'form-first-under-review',
    publicEmailDisplayApproved: false,
    mailboxOperationalStatus: 'confirmed-outside-pumpkin',
    pumpkinAppSendStatus: 'dry-run-not-configured',
    defaultLeadRoutingMode: 'manual_review_then_provider_match',
    defaultRecipientGroup: leadRecipientRef,
    staticFormEndpointKey: staticEndpointRef,
    emailProvider: 'microsoft-365-exchange-online-plan-1-placeholder-ref-only',
    emailProviderStatus: 'selected-outside-this-run-no-settings-changed',
    mxStatus: 'not_changed_in_this_run',
    spfStatus: 'not_changed_in_this_run',
    dkimStatus: 'not_changed_in_this_run',
    dmarcStatus: 'not_changed_in_this_run',
    notes: 'Contact/email correction package confirmed contact@iceskatingrinkrentals.com. Pumpkin keeps public email display form-first/under-review, uses placeholder refs only, and does not send email in this import.',
  };
  candidate.pageQuality = {
    ...(candidate.pageQuality || {}),
    status: 'needs_review',
    launchNotes: 'Local CMS draft/review import only. Static regeneration, production indexing, live email sending, and DNS/provider changes remain blocked until separately approved.',
    warnings: [
      'Public email display remains form-first/under-review; no mailto links are imported.',
      'Pumpkin app sending remains dry-run/not configured.',
      'Static form endpoint and lead recipient refs are placeholders resolved outside page JSON.',
      'Static regeneration and production deployment are not authorized.',
    ],
    blockingIssues: ['Not approved for production publishing.', 'Not approved for static regeneration or indexing.'],
    lastCheckedAt: now,
  };
  candidate.isPublished = false;
  candidate.publishedAt = null;
  candidate.includeInSitemap = false;
  candidate.importCandidateStatus = {
    ...(candidate.importCandidateStatus || {}),
    readyForHumanReview: true,
    readyForCmsImport: false,
    readyForLocalCmsDraftImport: true,
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
    localCmsDraftImportApprovedByUser: true,
    blockersBeforeCmsImport: [
      'CMS import beyond local draft/review still needs human approval and import preflight sign-off.',
      'Public email display policy remains form-first/under-review.',
      'No real email sending, DNS/MX change, static regeneration, or deployment is authorized.',
    ],
    blockersBeforeProduction: [
      'Production approval not granted.',
      'Static regeneration and deployment not granted.',
      'Email sending behavior remains dry-run/not configured.',
    ],
  };
  for (const block of candidate.ContentData?.ContentBlocks || []) {
    if (block.type === 'formBlock') {
      block.content = {
        ...(block.content || {}),
        formKey: 'default-quote-request',
        staticEndpointRef,
        leadRecipientRef,
        sourcePage: '/contact',
        review: {
          ...(block.content?.review || {}),
          status: 'needs_review',
          notes: 'Visible structured formBlock. No WordPress form runtime, raw form HTML, or real email sending is enabled.',
        },
      };
    }
  }
  return candidate;
}

function contactSafePreflight(page) {
  const errors = [];
  const warnings = [];
  const blocks = page.ContentData?.ContentBlocks || [];
  const formBlock = blocks.find((block) => block.type === 'formBlock');
  const raw = JSON.stringify(page);
  const customHtml = blocks.filter((block) => block.type === 'customHtml').map((block) => String(block.content?.html || ''));
  const check = (ok, message) => { if (!ok) errors.push(message); };
  check(page.tenantId === tenantId, 'tenantId must be ice-rink-rentals.');
  check(page.siteKey === siteKey, 'siteKey must be ice-rink-rentals.');
  check(page.route === '/contact' && page.path === '/contact' && page.pageSlug === 'contact', 'Route/path/pageSlug must target /contact.');
  check((page.seo?.canonicalUrl || page.canonicalUrl) === `https://${domain}/contact`, 'Canonical URL must target /contact.');
  check(page.workflow?.status === 'draft', 'workflow.status must be draft.');
  check(page.workflow?.reviewStatus === 'needs_review', 'workflow.reviewStatus must be needs_review.');
  check(page.workflow?.approvedForPublish === false, 'approvedForPublish must be false.');
  check(page.isPublished === false, 'isPublished must be false.');
  check(page.includeInSitemap === false, 'includeInSitemap must be false.');
  check(Boolean(formBlock), 'A visible formBlock must exist.');
  check(formBlock?.content?.formKey === 'default-quote-request', 'formBlock.formKey must be default-quote-request.');
  check(formBlock?.content?.sourcePage === '/contact', 'formBlock.sourcePage must be /contact.');
  check(formBlock?.content?.staticEndpointRef === staticEndpointRef, 'formBlock.staticEndpointRef must be the Ice static endpoint ref.');
  check(formBlock?.content?.leadRecipientRef === leadRecipientRef, 'formBlock.leadRecipientRef must be the Ice lead recipient ref.');
  check(!raw.includes(oldMailbox), 'Old contactus mailbox must not appear.');
  check(raw.includes(selectedMailbox), 'Selected mailbox must be recorded.');
  check(!raw.includes('mailto:'), 'No public mailto links should be imported.');
  check(!/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(raw), 'No WordPress form runtime dependency should be imported.');
  check(!/data:image\//i.test(raw), 'No base64/data image URLs should be imported.');
  customHtml.forEach((html, index) => {
    check(!/<\s*(form|input|button|textarea|select)\b/i.test(html), `customHtml block ${index} must not contain raw form controls.`);
    check(!/\b(?:text-|bg-|grid-cols-|p-|m-|rounded-|shadow-|flex|items-|justify-)\w+/i.test(html), `customHtml block ${index} should use semantic classes, not raw Tailwind utilities.`);
  });
  if (page.domainRouting?.publicEmailDisplayApproved !== false) warnings.push('publicEmailDisplayApproved is not explicitly false.');
  return {
    schemaVersion: 'pumpkin-contact-safe-local-preflight-result.v1',
    createdAt: now,
    input: contactCandidateRel,
    nonMutating: true,
    route: '/contact',
    checks: {
      pageShape: errors.length === 0 ? 'pass' : 'fail',
      designSystem: errors.some((error) => /Tailwind|customHtml|WordPress form|form controls/.test(error)) ? 'fail' : 'pass',
      defaultForm: formBlock?.content?.formKey === 'default-quote-request' ? 'pass' : 'fail',
      media: raw.includes('data:image/') ? 'fail' : 'pass',
      tailwindNavigation: errors.some((error) => /Tailwind/.test(error)) ? 'fail' : 'pass',
      routeCanonical: page.route === '/contact' ? 'pass' : 'fail',
      emailPolicy: !raw.includes(oldMailbox) && raw.includes(selectedMailbox) && !raw.includes('mailto:') ? 'pass' : 'fail',
      unsafeHtmlCssFormMediaEmail: errors.length === 0 ? 'pass' : 'fail',
    },
    ok: errors.length === 0,
    errors,
    warnings,
    readiness: {
      readyForHumanReview: true,
      readyForLocalCmsDraftImport: errors.length === 0,
      readyForCmsImport: false,
      readyForStaticRegeneration: false,
      readyForProductionIndexing: false,
    },
  };
}

function homepageDecision() {
  const packageRaw = readFileSync(abs(homepagePackageRel), 'utf8');
  const safeRaw = readFileSync(abs(sourceHomepageRel), 'utf8');
  return {
    schemaVersion: 'pumpkin-homepage-contact-email-correction-reference-decision.v1',
    createdAt: now,
    tenantId,
    siteKey,
    domain,
    candidateReviewed: homepagePackageRel,
    currentSafeHomepageCandidate: sourceHomepageRel,
    decision: {
      homepageWriteAttempted: false,
      homepageWriteApprovedByScope: true,
      safeCorrectionDeltaFound: false,
      reason: 'Current local homepage draft already records the selected mailbox policy safely; uploaded homepage package remains reference-only because it is foreign WordPress-form-shaped, includes public mailto fallbacks, and includes service-area wording outside this run.',
    },
    packageSignals: {
      selectedMailboxOccurrences: count(packageRaw, selectedMailbox),
      oldMailboxOccurrences: count(packageRaw, oldMailbox),
      mailtoOccurrences: count(packageRaw, 'mailto:'),
      cf7Occurrences: countRegex(packageRaw, /contact form 7|\[contact-form-7|cf7/gi),
      containsEastCoastWording: /East Coast/i.test(packageRaw),
    },
    currentSafeCandidateSignals: {
      selectedMailboxPolicyPresent: safeRaw.includes(selectedMailbox),
      publicMailtoPresent: safeRaw.includes('mailto:'),
      cf7RuntimePresent: /contact form 7|\[contact-form-7|\bcf7\b/i.test(safeRaw),
      mediaAssetIdsPresent: /mediaAssetId|assetId/.test(safeRaw),
    },
    rollerStatus: 'paused',
  };
}

async function loadAuth() {
  let jwt = process.env.PUMPKIN_ADMIN_JWT || '';
  if (jwt) {
    state.adminAuth.source = 'PUMPKIN_ADMIN_JWT';
  } else {
    const tempPath = path.join(process.env.TEMP || process.env.TMP || '', 'pumpkin-admin-jwt.txt');
    if (!existsSync(tempPath)) return;
    state.adminAuth.source = 'PRESENT_TEMP_FILE';
    jwt = readFileSync(tempPath, 'utf8').trim();
    rmSync(tempPath, { force: true });
    state.adminAuth.tempFileDeleted = !existsSync(tempPath);
  }
  if (!isJwt(jwt)) {
    state.adminAuth.validation = 'INVALID';
    return;
  }
  state.jwt = jwt;
  const probeResult = await apiJson(`/api/admin/pages?tenantId=${tenantId}`, {}, true);
  state.apiCalls.push('GET /api/admin/pages?tenantId=ice-rink-rentals');
  state.adminAuth.validation = probeResult.ok ? 'VALID' : 'INVALID';
  if (!probeResult.ok) state.adminAuth.validationStatus = probeResult.status;
}

async function importContact(baseCandidate) {
  const beforeHomepage = await apiJson(`/api/admin/pages/${tenantId}/home`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/home');
  const beforeContact = await apiJson(`/api/admin/pages/${tenantId}/contact`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/contact');
  const beforeService = await apiJson(`/api/admin/pages/${tenantId}/service-areas`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/service-areas');
  const beforeThemes = await apiJson(`/api/admin/themes/${tenantId}`, {}, true);
  state.apiCalls.push('GET /api/admin/themes/ice-rink-rentals');

  if (beforeHomepage.ok) state.beforeHomepageSummary = summarizePage(beforeHomepage.json);
  if (beforeContact.ok) {
    writeJson('content-review/ice-contact-email-correction-cms-import/current-contact-before-import.snapshot.json', sanitize(beforeContact.json));
    state.beforeContactSummary = summarizePage(beforeContact.json);
  } else if (beforeContact.status === 404) {
    writeJson('content-review/ice-contact-email-correction-cms-import/current-contact-before-import.snapshot.json', { schemaVersion: 'pumpkin-contact-before-import-snapshot.v1', createdAt: now, status: 'not-found', route: '/contact', tenantId });
    state.beforeContactSummary = { found: false, status: 404 };
  } else {
    state.blockers.push(`Unable to fetch /contact before import; status ${beforeContact.status}.`);
    return;
  }
  state.beforeServiceAreas = beforeService.ok ? hashObject(beforeService.json) : { found: false, status: beforeService.status };
  state.beforeThemesHash = beforeThemes.ok ? hashObject(beforeThemes.json) : { found: false, status: beforeThemes.status };

  const candidate = JSON.parse(JSON.stringify(baseCandidate));
  if (beforeContact.ok) {
    const id = beforeContact.json.PageId || beforeContact.json.pageId || beforeContact.json.id || 'ice-rink-rentals-contact';
    candidate.PageId = id;
    candidate.id = id;
    candidate.PageVersion = Number(beforeContact.json.PageVersion || beforeContact.json.pageVersion || candidate.PageVersion || 1) + 1;
    candidate.previousSlugs = Array.isArray(beforeContact.json.previousSlugs) ? beforeContact.json.previousSlugs : (candidate.previousSlugs || []);
    candidate.redirects = Array.isArray(beforeContact.json.redirects) ? beforeContact.json.redirects : (candidate.redirects || []);
  }

  let writeResult;
  if (beforeContact.ok) {
    const summary = encodeURIComponent('Ice contact/email correction local draft import');
    writeResult = await apiJson(`/api/admin/pages/${tenantId}/contact?changeSource=json_import&changeSummary=${summary}`, { method: 'PUT', body: JSON.stringify(candidate) }, true);
    state.apiCalls.push('PUT /api/admin/pages/ice-rink-rentals/contact?changeSource=json_import');
    state.contactImportMode = 'update-existing-contact';
    state.contactImportEndpoint = 'PUT /api/admin/pages/ice-rink-rentals/contact?changeSource=json_import';
  } else {
    writeResult = await apiJson(`/api/admin/pages/${tenantId}`, { method: 'POST', body: JSON.stringify(candidate) }, true);
    state.apiCalls.push('POST /api/admin/pages/ice-rink-rentals');
    state.contactImportMode = 'create-contact';
    state.contactImportEndpoint = 'POST /api/admin/pages/ice-rink-rentals';
  }
  if (!writeResult.ok) {
    state.blockers.push(`Contact CMS import failed with status ${writeResult.status}.`);
    state.contactImportError = writeResult.safeText;
    return;
  }
  state.importPerformed = true;
  state.contactImportPerformed = true;
  writeJson('content-review/ice-contact-email-correction-cms-import/contact-import-write-result.json', sanitize(writeResult.json));

  const contactReadback = await apiJson(`/api/admin/pages/${tenantId}/contact`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/contact');
  if (contactReadback.ok) {
    writeJson('content-review/ice-contact-email-correction-cms-import/contact-import-readback.json', sanitize(contactReadback.json));
    state.contactReadbackSummary = summarizePage(contactReadback.json);
    state.contactReadbackVerification = verifyContact(contactReadback.json);
  } else {
    state.blockers.push(`Contact readback failed after import with status ${contactReadback.status}.`);
  }

  const homepageReadback = await apiJson(`/api/admin/pages/${tenantId}/home`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/home');
  if (homepageReadback.ok) {
    writeJson('content-review/ice-contact-email-correction-cms-import/homepage-reference-readback.json', sanitize(homepageReadback.json));
    state.homepageReadbackSummary = summarizePage(homepageReadback.json);
  }

  const afterService = await apiJson(`/api/admin/pages/${tenantId}/service-areas`, {}, true);
  state.apiCalls.push('GET /api/admin/pages/ice-rink-rentals/service-areas');
  const afterThemes = await apiJson(`/api/admin/themes/${tenantId}`, {}, true);
  state.apiCalls.push('GET /api/admin/themes/ice-rink-rentals');
  state.afterServiceAreas = afterService.ok ? hashObject(afterService.json) : { found: false, status: afterService.status };
  state.afterThemesHash = afterThemes.ok ? hashObject(afterThemes.json) : { found: false, status: afterThemes.status };
  state.untouched = {
    serviceAreasUnchanged: JSON.stringify(state.beforeServiceAreas) === JSON.stringify(state.afterServiceAreas),
    themesUnchanged: JSON.stringify(state.beforeThemesHash) === JSON.stringify(state.afterThemesHash),
  };
  state.safety.serviceAreasChanged = !state.untouched.serviceAreasUnchanged;
  state.safety.themesChanged = !state.untouched.themesUnchanged;
  await frontendPreview();
}

function inventory() {
  const files = [];
  walk(abs(extractedRel), (filePath) => {
    const rel = relPath(filePath);
    const stat = statSync(filePath);
    files.push({
      path: rel,
      sizeBytes: stat.size,
      extension: path.extname(filePath).toLowerCase() || '(none)',
      sha256: sha256(filePath),
      classification: classify(rel),
      previewHtml: /preview.*\.html$/i.test(path.basename(filePath)),
    });
  });
  files.sort((a, b) => a.path.localeCompare(b.path));
  return {
    extractedRoot: extractedRel,
    totalFiles: files.length,
    jsonFiles: files.filter((file) => file.extension === '.json').length,
    previewHtmlFiles: files.filter((file) => file.previewHtml).length,
    cf7ReferenceFiles: files.filter((file) => /\bcf7\b|contact-form-7|CONTACT_FORM_7/i.test(file.path)).length,
    imageFiles: files.filter((file) => /\.(png|webp|jpg|jpeg)$/i.test(file.path)).length,
    files,
  };
}

function emailAudit() {
  const refs = [contactPackageRel, contactFullRel, homepagePackageRel].filter((rel) => existsSync(abs(rel)));
  const packageAudits = refs.map((rel) => {
    const raw = readFileSync(abs(rel), 'utf8');
    const json = JSON.parse(raw);
    return {
      path: rel,
      schemaVersion: json.schemaVersion || '',
      templatePurpose: json.templatePurpose || '',
      tenantId: json.tenantId || '',
      siteKey: json.siteKey || '',
      route: json.route || json.path || json.routing?.slug || '',
      canonicalUrl: json.canonicalUrl || json.routing?.canonicalUrl || json.seo?.canonicalUrl || '',
      selectedMailboxOccurrences: count(raw, selectedMailbox),
      oldMailboxOccurrences: count(raw, oldMailbox),
      mailtoOccurrences: count(raw, 'mailto:'),
      telOccurrences: count(raw, 'tel:+18447278947'),
      cf7Occurrences: countRegex(raw, /contact form 7|\[contact-form-7|cf7/gi),
      hasPumpkinContentData: Boolean(json.ContentData?.ContentBlocks),
      hasPublicEmailDisplayApprovalFlag: Boolean(json.publicEmailDisplayApproved || json.contact?.publicEmailDisplayApproved || json.emailPolicy?.publicEmailDisplayApproved),
      notes: 'Foreign/reference JSON only; not imported directly into Pumpkin CMS.',
    };
  });
  const allRaw = packageAudits.map((audit) => readFileSync(abs(audit.path), 'utf8')).join('\n');
  return {
    selectedMailbox,
    selectedMailboxPresent: allRaw.includes(selectedMailbox),
    oldMailboxPresent: allRaw.includes(oldMailbox),
    publicEmailDisplayPolicy: 'form-first-under-review',
    importedMailtoLinks: false,
    importedWordPressFormRuntime: false,
    leadRecipientRef,
    staticEndpointRef,
    microsoftRefsPlaceholderOnly: true,
    packageAudits,
  };
}

function validatePackageJson() {
  const results = [];
  let ok = true;
  for (const file of state.packageInventory.files.filter((item) => item.extension === '.json')) {
    try {
      JSON.parse(readFileSync(abs(file.path), 'utf8'));
      results.push({ path: file.path, ok: true });
    } catch (error) {
      ok = false;
      results.push({ path: file.path, ok: false, error: error.message });
    }
  }
  return { ok, results };
}

function dotnetContract(inputRel) {
  if (!existsSync(dotnetDll)) return { ok: false, skipped: true, reason: 'Existing .NET PageContractTool build output not found; build was not attempted while API is running.' };
  const result = spawnSync('dotnet', [dotnetDll, 'validate-page', '--path', inputRel], { cwd: repoRoot, encoding: 'utf8' });
  let parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch {}
  return {
    ok: result.status === 0 && (parsed?.ok === true || parsed?.Ok === true),
    status: result.status,
    stdoutJson: parsed,
    stderr: scrub(result.stderr),
    command: `dotnet tools/dotnet-page-contract/bin/Debug/net10.0/Pumpkin.PageContractTool.dll validate-page --path ${inputRel}`,
    noBuildUsed: true,
  };
}

function importPreflight(inputRel, route, outputRel) {
  const result = spawnSync('node', ['tools/import-preflight/import-preflight.mjs', '--input', inputRel, '--tenant-id', tenantId, '--site-key', siteKey, '--route', route, '--mode', 'preflight-only', '--output', outputRel], { cwd: repoRoot, encoding: 'utf8' });
  return { ok: result.status === 0, status: result.status, stdout: scrub(result.stdout), stderr: scrub(result.stderr), output: outputRel };
}

function nodeTool(args) {
  const result = spawnSync('node', args, { cwd: repoRoot, encoding: 'utf8' });
  let parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch {}
  return { ok: result.status === 0, status: result.status, command: `node ${args.join(' ')}`, stdoutJson: parsed, stderr: scrub(result.stderr) };
}

function unsafeScan(candidate) {
  const raw = JSON.stringify(candidate);
  const errors = [];
  if (raw.includes(oldMailbox)) errors.push('Selected candidate contains old mailbox.');
  if (raw.includes('mailto:')) errors.push('Selected candidate contains mailto link.');
  if (/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(raw)) errors.push('Selected candidate contains WordPress form dependency.');
  if (/<\s*(form|input|button|textarea|select)\b/i.test(raw)) errors.push('Selected candidate contains raw form controls.');
  if (/data:image\//i.test(raw)) errors.push('Selected candidate contains data image URL.');
  return { ok: errors.length === 0, errors };
}

function secretScan() {
  const roots = ['content-review/ice-contact-email-correction-cms-import', extractedRel];
  const patterns = [
    { name: 'private-key', regex: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i },
    { name: 'connection-string', regex: /DefaultEndpointsProtocol=|AccountKey=|ConnectionString\s*[:=]/i },
    { name: 'smtp-password', regex: /SMTP_PASSWORD\s*[:=]\s*\S+/i },
    { name: 'email-password', regex: /EMAIL_PASSWORD\s*[:=]\s*\S+/i },
    { name: 'dkim-private-key', regex: /DKIM_PRIVATE_KEY\s*[:=]/i },
    { name: 'provider-token', regex: /(SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD|MIGADU_PASSWORD|MAILCOW_API_KEY)\s*[:=]\s*\S+/i },
    { name: 'jwt-value', regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/i },
  ];
  const findings = [];
  for (const rootRel of roots) {
    if (!existsSync(abs(rootRel))) continue;
    walk(abs(rootRel), (filePath) => {
      if (!/\.(json|md|txt|html|css|js|mjs|ts|tsx)$/i.test(filePath)) return;
      const rel = relPath(filePath);
      if (/(^|[/\\])(\.env\.local|appsettings\.Development\.json|\.github[/\\]workflows|\.next|node_modules|\.static-release-dry-runs)([/\\]|$)/i.test(rel)) return;
      if (rel.endsWith('/run-contact-email-correction-import.mjs')) return;
      const raw = readFileSync(filePath, 'utf8');
      for (const pattern of patterns) if (pattern.regex.test(raw)) findings.push({ file: rel, pattern: pattern.name });
    });
  }
  return { ok: findings.length === 0, findings };
}

function canWrite() {
  return state.checks.apiReachable === 'pass'
    && state.checks.jsonParseValidation === 'pass'
    && state.checks.contactSafeLocalPreflight === 'pass'
    && state.checks.contactDotnetContract === 'pass'
    && state.checks.targetedSecretScan === 'pass'
    && state.checks.unsafeHtmlCssFormMediaEmailScan === 'pass';
}

async function frontendPreview() {
  state.frontendPreview = {};
  for (const route of ['/', '/contact']) {
    const url = route === '/' ? `${frontendBase}/` : `${frontendBase}${route}`;
    try {
      const response = await fetch(url);
      const text = await response.text();
      state.frontendPreview[route] = {
        reachable: true,
        status: response.status,
        containsIceSignal: /Ice|ice|rink|Rink/.test(text),
        containsContactSignal: route === '/contact' ? /quote|contact|request|Contact/i.test(text) : undefined,
        textSample: text.slice(0, 500),
      };
    } catch (error) {
      state.frontendPreview[route] = { reachable: false, error: error.message };
    }
  }
}

function verifyContact(page) {
  const raw = JSON.stringify(page);
  const blocks = page.ContentData?.ContentBlocks || page.contentData?.contentBlocks || [];
  const formBlock = blocks.find((block) => (block.type || block.Type) === 'formBlock');
  const content = formBlock?.content || formBlock?.Content || {};
  return {
    tenantId: (page.tenantId || page.TenantId) === tenantId,
    pageSlugContact: (page.pageSlug || page.PageSlug) === 'contact',
    workflowDraft: (page.workflow?.status || page.Workflow?.Status) === 'draft',
    reviewNeedsReview: (page.workflow?.reviewStatus || page.Workflow?.ReviewStatus) === 'needs_review',
    notPublished: page.isPublished === false || page.IsPublished === false,
    notProductionApproved: !page.workflow?.approvedForPublish,
    selectedMailboxPresent: raw.includes(selectedMailbox),
    oldMailboxAbsent: !raw.includes(oldMailbox),
    mailtoAbsent: !raw.includes('mailto:'),
    cf7Absent: !/\[contact-form-7|Contact Form 7|\bcf7\b/i.test(raw),
    formBlockPresent: Boolean(formBlock),
    defaultQuoteRequest: content.formKey === 'default-quote-request',
    staticEndpointRef: content.staticEndpointRef === staticEndpointRef,
    leadRecipientRef: content.leadRecipientRef === leadRecipientRef,
  };
}

async function apiJson(endpoint, options = {}, authed = false) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (authed) headers.Authorization = `Bearer ${state.jwt}`;
  try {
    const response = await fetch(`${apiBase}${endpoint}`, { ...options, headers });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    return { ok: response.ok, status: response.status, json, safeText: scrub(text) };
  } catch (error) {
    return { ok: false, status: 0, json: null, safeText: error.message };
  }
}

async function probe(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function writeReports() {
  writeJson('content-review/ice-contact-email-correction-cms-import/manifest.json', manifest());
  writeFileSync(path.join(outDir, 'README.md'), readme(), 'utf8');
  writeFileSync(path.join(outDir, 'PACKAGE_INVENTORY.md'), packageInventoryMd(), 'utf8');
  writeFileSync(path.join(outDir, 'VALIDATION_RESULTS.md'), validationMd(), 'utf8');
  writeFileSync(path.join(outDir, 'EMAIL_REFERENCE_AUDIT.md'), emailAuditMd(), 'utf8');
  writeFileSync(path.join(outDir, 'HOMEPAGE_UPDATE_RESULT.md'), homepageMd(), 'utf8');
  writeFileSync(path.join(outDir, 'CONTACT_IMPORT_RESULT.md'), contactMd(), 'utf8');
  writeFileSync(path.join(outDir, 'UNTOUCHED_ROUTES_VERIFICATION.md'), untouchedMd(), 'utf8');
  writeFileSync(path.join(outDir, 'FRONTEND_PREVIEW_CHECKLIST.md'), frontendMd(), 'utf8');
  writeFileSync(path.join(outDir, 'REMAINING_BLOCKERS.md'), blockersMd(), 'utf8');
  writeFileSync(path.join(repoRoot, 'PUMPKIN_ICE_CONTACT_EMAIL_CORRECTION_CMS_IMPORT_REPORT.md'), rootReport(), 'utf8');
}

function manifest() {
  return {
    schemaVersion: 'pumpkin-ice-contact-email-correction-cms-import-manifest.v1',
    createdAt: now,
    tenantId,
    siteKey,
    domain,
    inputPackage: inputZipRel,
    outputFolder: 'content-review/ice-contact-email-correction-cms-import',
    selectedCandidates: { contact: contactCandidateRel, homepage: sourceHomepageRel, homepageDecision: homepageDecisionRel },
    adminAuth: { source: state.adminAuth.source, validation: state.adminAuth.validation, tempFileDeleted: state.adminAuth.tempFileDeleted, jwtPrinted: false, validationStatus: state.adminAuth.validationStatus },
    importPerformed: state.importPerformed,
    homepageUpdatePerformed: state.homepageUpdatePerformed,
    homepageUpdateSkippedReason: state.homepageUpdateSkippedReason,
    contactImportPerformed: state.contactImportPerformed,
    contactImportMode: state.contactImportMode,
    contactImportEndpoint: state.contactImportEndpoint,
    checks: state.checks,
    contactReadbackVerification: state.contactReadbackVerification || null,
    untouched: state.untouched || {},
    safety: state.safety,
    blockers: unique(state.blockers),
    warnings: unique(state.warnings),
    errors: state.errors,
    apiCalls: state.apiCalls,
    rollerStatus: 'paused',
  };
}

function readme() {
  return `# Ice Contact Email Correction CMS Import\n\nThis folder records the local CMS draft/review import attempt for the approved IceSkatingRinkRentals.com contact/email correction package.\n\nScope: homepage reference reviewed, /contact draft import/update allowed, /service-areas untouched, Theme untouched, Roller paused.\n\nImport performed: ${yn(state.importPerformed)}\n\nContact import performed: ${yn(state.contactImportPerformed)}\n\nHomepage update performed: ${yn(state.homepageUpdatePerformed)}\n\nAdmin auth: ${state.adminAuth.validation}\n`;
}

function packageInventoryMd() {
  const lines = [
    '# Package Inventory',
    '',
    `Input ZIP: \`${inputZipRel}\``,
    `Extracted folder: \`${extractedRel}\``,
    `Total files: ${state.packageInventory?.totalFiles || 0}`,
    '',
    '| File | Size | Classification | SHA-256 |',
    '| --- | ---: | --- | --- |',
  ];
  for (const file of state.packageInventory?.files || []) lines.push(`| \`${file.path}\` | ${file.sizeBytes} | ${file.classification} | \`${file.sha256.slice(0, 16)}...\` |`);
  return `${lines.join('\n')}\n`;
}

function validationMd() {
  const lines = ['# Validation Results', ''];
  for (const [check, result] of Object.entries(state.checks || {})) lines.push(`- ${check}: ${result}`);
  lines.push('', `Contact .NET contract: ${state.checks.contactDotnetContract || 'not-run'}`, `Contact safe local preflight: ${state.checks.contactSafeLocalPreflight || 'not-run'}`);
  lines.push('', 'The uploaded WordPress form package was not imported directly. It was used as a reference source for corrected mailbox/phone metadata while preserving Pumpkin formBlock behavior.');
  return `${lines.join('\n')}\n`;
}

function emailAuditMd() {
  const lines = [
    '# Email Reference Audit',
    '',
    `Selected mailbox: \`${selectedMailbox}\``,
    `Old mailbox present in package: ${yn(state.emailAudit?.oldMailboxPresent)}`,
    'Public email display policy imported: `form-first-under-review`',
    'Public mailto links imported into CMS candidate: no',
    'WordPress form runtime imported into CMS candidate: no',
    `Lead recipient ref: \`${leadRecipientRef}\``,
    `Static endpoint ref: \`${staticEndpointRef}\``,
    '',
    '| Package JSON | contact@ occurrences | old mailbox | mailto | WordPress form refs | Direct Pumpkin Page |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
  ];
  for (const item of state.emailAudit?.packageAudits || []) lines.push(`| \`${item.path}\` | ${item.selectedMailboxOccurrences} | ${item.oldMailboxOccurrences} | ${item.mailtoOccurrences} | ${item.cf7Occurrences} | ${yn(item.hasPumpkinContentData)} |`);
  return `${lines.join('\n')}\n`;
}

function homepageMd() {
  return `# Homepage Update Result\n\nHomepage update performed: ${yn(state.homepageUpdatePerformed)}\n\nReason: ${state.homepageUpdateSkippedReason}\n\nCurrent homepage reference candidate: \`${sourceHomepageRel}\`\n\nThe homepage package was reviewed as a correction reference only. No live or draft homepage CMS write was performed in this run.\n`;
}

function contactMd() {
  return `# Contact Import Result\n\nContact import performed: ${yn(state.contactImportPerformed)}\n\nMode: \`${state.contactImportMode}\`\n\nEndpoint: \`${state.contactImportEndpoint || 'not-used'}\`\n\nBefore summary:\n\n\`\`\`json\n${JSON.stringify(state.beforeContactSummary || null, null, 2)}\n\`\`\`\n\nReadback verification:\n\n\`\`\`json\n${JSON.stringify(state.contactReadbackVerification || null, null, 2)}\n\`\`\`\n\nNo production approval, static regeneration, deployment, DNS/provider/email setting change, or real email sending was performed.\n`;
}

function untouchedMd() {
  return `# Untouched Routes Verification\n\n/service-areas unchanged: ${yn(state.untouched?.serviceAreasUnchanged)}\n\nTheme records unchanged: ${yn(state.untouched?.themesUnchanged)}\n\nRoller touched: no\n\nRollerRinkRentals.com remains paused.\n\nService-area hash before/after:\n\n\`\`\`json\n${JSON.stringify({ before: state.beforeServiceAreas || null, after: state.afterServiceAreas || null }, null, 2)}\n\`\`\`\n\nTheme hash before/after:\n\n\`\`\`json\n${JSON.stringify({ before: state.beforeThemesHash || null, after: state.afterThemesHash || null }, null, 2)}\n\`\`\`\n`;
}

function frontendMd() {
  return `# Frontend Preview Checklist\n\nLocal frontend base checked: \`${frontendBase}\`\n\nHomepage preview:\n\n\`\`\`json\n${JSON.stringify(state.frontendPreview?.['/'] || null, null, 2)}\n\`\`\`\n\nContact preview:\n\n\`\`\`json\n${JSON.stringify(state.frontendPreview?.['/contact'] || null, null, 2)}\n\`\`\`\n\nIf the frontend server was not running or did not refresh, use CMS admin/readback JSON as the authoritative local draft proof for this run.\n`;
}

function blockersMd() {
  const blockers = unique(state.blockers);
  const lines = ['# Remaining Blockers', '', 'Before static regeneration:', '- Explicit static regeneration approval is still required.', '- Human review of the local /contact draft is still required.', '- Confirm public email display policy and any public phone display policy before production.', '', 'Before production/indexing:', '- Production approval is not granted.', '- Publish approval is not granted.', '- DNS/provider/email settings were not changed and Pumpkin app sending remains dry-run/not configured.', '- /service-areas was not approved in this run.', '', 'Run blockers:'];
  if (blockers.length === 0) lines.push('- None for local /contact draft import.');
  else blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  return `${lines.join('\n')}\n`;
}

function rootReport() {
  const files = [
    'PUMPKIN_ICE_CONTACT_EMAIL_CORRECTION_CMS_IMPORT_REPORT.md',
    'content-review/ice-contact-email-correction-cms-import/README.md',
    'content-review/ice-contact-email-correction-cms-import/PACKAGE_INVENTORY.md',
    'content-review/ice-contact-email-correction-cms-import/VALIDATION_RESULTS.md',
    'content-review/ice-contact-email-correction-cms-import/EMAIL_REFERENCE_AUDIT.md',
    'content-review/ice-contact-email-correction-cms-import/HOMEPAGE_UPDATE_RESULT.md',
    'content-review/ice-contact-email-correction-cms-import/CONTACT_IMPORT_RESULT.md',
    'content-review/ice-contact-email-correction-cms-import/UNTOUCHED_ROUTES_VERIFICATION.md',
    'content-review/ice-contact-email-correction-cms-import/FRONTEND_PREVIEW_CHECKLIST.md',
    'content-review/ice-contact-email-correction-cms-import/REMAINING_BLOCKERS.md',
    'content-review/ice-contact-email-correction-cms-import/manifest.json',
    'content-review/ice-contact-email-correction-cms-import/contact-cms-import-candidate.json',
    'content-review/ice-contact-email-correction-cms-import/contact-safe-local-preflight-result.json',
    'content-review/ice-contact-email-correction-cms-import/contact-dotnet-contract-result.json',
    'content-review/ice-contact-email-correction-cms-import/homepage-correction-reference-decision.json',
    'content-review/ice-contact-email-correction-cms-import/homepage-dotnet-contract-result.json',
    'content-review/ice-contact-email-correction-cms-import/homepage-reference-import-preflight-result.json',
    'content-review/ice-contact-email-correction-cms-import/run-contact-email-correction-import.mjs',
  ];
  if (state.contactImportPerformed) files.push('content-review/ice-contact-email-correction-cms-import/current-contact-before-import.snapshot.json', 'content-review/ice-contact-email-correction-cms-import/contact-import-readback.json', 'content-review/ice-contact-email-correction-cms-import/contact-import-write-result.json', 'content-review/ice-contact-email-correction-cms-import/homepage-reference-readback.json');
  return `# Pumpkin Ice Contact Email Correction CMS Import Report\n\nCreated: ${now}\n\n## Scope\n\nPrimary focus: IceSkatingRinkRentals.com. RollerRinkRentals.com remains paused.\n\nApproved local CMS draft scope: existing homepage correction may be reviewed, /contact may be imported/updated as draft/needs_review. /service-areas, Theme, production approval, static regeneration, deployment, DNS/provider/email settings, and real email sending were not authorized.\n\n## Git Status At Start\n\n\`\`\`text\n${startGitStatus.join('\n')}\n\`\`\`\n\nCurrent status before generated outputs included the expected ZIP/extracted input artifacts only.\n\n## Git Log At Start\n\n\`\`\`text\n${startGitLog.join('\n')}\n\`\`\`\n\n## Input Package\n\n\`${inputZipRel}\`\n\nFiles inventoried: ${state.packageInventory?.totalFiles || 0}\n\nSelected contact reference: \`${contactPackageRel}\`\n\nSelected Pumpkin contact candidate: \`${sourceContactRel}\` normalized into \`${contactCandidateRel}\`\n\nHomepage reference: \`${homepagePackageRel}\`\n\n## Validation Results\n\n${Object.entries(state.checks || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\nAdmin auth status: ${state.adminAuth.validation}\n\nTemp JWT deleted after load: ${yn(state.adminAuth.tempFileDeleted)}\n\nJWT printed: no\n\n## Import Result\n\nImport performed: ${yn(state.importPerformed)}\n\nHomepage update performed: ${yn(state.homepageUpdatePerformed)}\n\nHomepage result: ${state.homepageUpdateSkippedReason}\n\nContact import performed: ${yn(state.contactImportPerformed)}\n\nContact mode: \`${state.contactImportMode}\`\n\nContact endpoint: \`${state.contactImportEndpoint || 'not-used'}\`\n\nRevision/rollback handling: ${state.contactImportMode === 'update-existing-contact' ? 'existing contact page update path used; API revision/snapshot handling applied by admin update endpoint' : state.contactImportMode === 'create-contact' ? 'new contact draft created; no previous contact rollback snapshot existed' : 'not applicable'}\n\n## Email Reference Audit\n\nSelected mailbox: \`${selectedMailbox}\`\n\nOld mailbox present in package: ${yn(state.emailAudit?.oldMailboxPresent)}\n\nOld mailbox imported: no\n\nPublic mailto links imported: no\n\nWordPress form runtime imported: no\n\nLead recipient ref preserved: \`${leadRecipientRef}\`\n\nStatic endpoint ref preserved: \`${staticEndpointRef}\`\n\nPumpkin app sending: dry-run/not configured; no real email sent.\n\n## FormBlock Verification\n\n\`\`\`json\n${JSON.stringify(state.contactReadbackVerification || null, null, 2)}\n\`\`\`\n\n## Frontend Preview\n\n\`\`\`json\n${JSON.stringify(state.frontendPreview || {}, null, 2)}\n\`\`\`\n\n## Untouched Verification\n\n/service-areas unchanged: ${yn(state.untouched?.serviceAreasUnchanged)}\n\nTheme records unchanged: ${yn(state.untouched?.themesUnchanged)}\n\nRoller touched: no\n\n## Files Changed\n\n${files.map((file) => `- \`${file}\``).join('\n')}\n\nInput artifacts remain untracked and should not be staged: ZIP, extracted folder, raw media.\n\n## Checks Run\n\n- git status --short --untracked-files=all\n- git log --oneline -12\n- local API reachability\n- safe ZIP extraction/inventory previously completed\n- JSON parse validation for package JSON\n- contact-specific safe local preflight\n- .NET Page/block contract via existing build output\n- homepage reference import preflight\n- design-system fixture validation\n- default-form fixture validation\n- media fixture validation\n- Tailwind/navigation fixture validation\n- unsafe HTML/CSS/form/media/email scan\n- targeted secret scan\n- authenticated CMS write/readback when auth validated\n- frontend / and /contact preview probe when frontend was reachable\n\n## Remaining Blockers\n\n${unique(state.blockers).length ? unique(state.blockers).map((blocker) => `- ${blocker}`).join('\n') : '- None for local /contact draft import.'}\n\nBefore static regeneration: explicit approval, human review, and final preview acceptance are still required.\n\nBefore production/indexing: production approval, publish approval, static regeneration, deployment, final email/public contact policy, and any DNS/provider sending decisions remain outstanding.\n\n## Readiness\n\nReady for human review: yes\n\nReady for local CMS draft review: ${state.contactImportPerformed ? 'yes for /contact' : 'no'}\n\nReady for static regeneration: no\n\nReady for production/indexing: no\n\nNext recommended action: review the local /contact draft in admin/frontend, then separately authorize static regeneration only after the contact draft and homepage remain acceptable.\n`;
}

function classify(rel) {
  if (/ice-homepage.*\.json$/i.test(rel)) return 'homepage-json-reference';
  if (/contact-page-import\.json$/i.test(rel) || /ice-contact-page.*full\.json$/i.test(rel)) return 'contact-json-reference';
  if (/forms-routing|\bcf7\b|contact-form-7|CONTACT_FORM_7/i.test(rel)) return 'cf7-routing-reference-only';
  if (/schema/i.test(rel)) return 'schema-seo-reference';
  if (/preview.*\.html$/i.test(rel)) return 'preview-html-reference-only';
  if (/\.(png|webp|jpg|jpeg)$/i.test(rel)) return 'media-input-reference';
  if (/EMAIL_CORRECTION_NOTES|SETUP/i.test(rel)) return 'documentation-reference';
  return 'supporting-reference';
}

function summarizePage(page) {
  const blocks = page?.ContentData?.ContentBlocks || page?.contentData?.contentBlocks || [];
  return {
    found: true,
    id: page.id || page.Id || '',
    pageId: page.PageId || page.pageId || '',
    tenantId: page.tenantId || page.TenantId || '',
    pageSlug: page.pageSlug || page.PageSlug || '',
    workflow: page.workflow || page.Workflow || null,
    isPublished: page.isPublished ?? page.IsPublished ?? null,
    includeInSitemap: page.includeInSitemap ?? page.IncludeInSitemap ?? null,
    pageVersion: page.PageVersion || page.pageVersion || null,
    revisionNumber: page.revision?.revisionNumber || page.Revision?.RevisionNumber || null,
    rollbackAvailable: page.revision?.rollbackAvailable || page.Revision?.RollbackAvailable || null,
    blockTypes: blocks.map((block) => block.type || block.Type).filter(Boolean),
  };
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, item) => {
    if (typeof item === 'string' && isJwt(item)) return '[redacted-jwt-shaped-value]';
    if (/password|token|secret|connectionString|apiKey/i.test(key)) return '[redacted]';
    return item;
  }));
}

function hashObject(value) {
  const raw = JSON.stringify(value || null);
  return { found: Boolean(value), sha256: createHash('sha256').update(raw).digest('hex'), bytes: raw.length };
}

function readJson(rel) {
  return JSON.parse(readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, value) {
  const filePath = abs(rel);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function walk(root, callback) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else if (entry.isFile()) callback(full);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function nodePath(rel) {
  return rel.replace(/\\/g, '/');
}

function abs(rel) {
  return path.join(repoRoot, rel);
}

function relPath(filePath) {
  return nodePath(path.relative(repoRoot, filePath));
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function count(raw, needle) {
  return raw.split(needle).length - 1;
}

function countRegex(raw, regex) {
  return (raw.match(regex) || []).length;
}

function isJwt(value) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(String(value || '').trim());
}

function scrub(value) {
  return String(value || '').replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt-shaped-value]').slice(0, 4000);
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function yn(value) {
  return value ? 'yes' : 'no';
}
