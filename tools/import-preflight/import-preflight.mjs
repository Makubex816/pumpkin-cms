#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

const supportedBlockTypes = new Set([
  'Hero',
  'TrustBar',
  'CardGrid',
  'HowItWorks',
  'FAQ',
  'PrimaryCTA',
  'SecondaryCTA',
  'Contact',
  'formBlock',
  'Breadcrumbs',
  'ServiceAreaMap',
  'LocalProTips',
  'Gallery',
  'Testimonials',
  'Blog',
  'customHtml',
  'trustedEmbed',
]);

const customHtmlProfiles = new Set(['marketing-basic', 'marketing-rich', 'media-rich', 'table-rich', 'layout-rich']);
const customHtmlContainers = new Set(['standard', 'wide', 'fullBleed', 'none']);
const sectionVariants = new Set([
  'premium-hero',
  'split-feature',
  'trust-band',
  'event-card-grid',
  'service-area-grid',
  'quote-form-panel',
  'contact-card',
  'inline-contact',
  'compact-contact',
  'faq-panel',
  'media-feature',
  'table-comparison',
  'final-cta',
  'heroMedia',
  'trustBand',
  'mediaUseCaseGrid',
  'splitFeature',
  'processSteps',
  'planningTopics',
  'serviceAreaTeaser',
  'faqAccordion',
  'finalCta',
  'partnerCta',
]);
const formBlockVariants = new Set(['quote-form-panel', 'contact-card', 'inline-contact', 'compact-contact']);
const knownDefaultFormKeys = new Set(['default-contact', 'default-quote-request']);
const allowedClassPrefixes = ['cms-', 'section-', 'card-', 'cta-', 'trust-', 'grid-', 'media-', 'rich-', 'ice-'];
const requiredHomeBlocks = ['Hero', 'TrustBar', 'CardGrid', 'HowItWorks', 'FAQ', 'PrimaryCTA'];
const requiredHomeMediaSlots = ['heroImage', 'localImage', 'closingImage'];
const requiredProductionHomeVariants = [
  'heroMedia',
  'trustBand',
  'mediaUseCaseGrid',
  'splitFeature',
  'processSteps',
  'planningTopics',
  'serviceAreaTeaser',
  'faqAccordion',
  'finalCta',
];
const protectedPathPattern = /(^|[/\\])(\.env\.local|appsettings\.Development\.json|\.github[/\\]workflows|\.next|node_modules|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i;
const rawMediaPattern = /\.(zip|png|jpe?g|gif|webp|mp4|mov|avi|psd|ai)$/i;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i,
  /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i,
  /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN|PURELYMAIL_PASSWORD|GOOGLE_APP_PASSWORD|MXROUTE_PASSWORD|MIGADU_PASSWORD|MAILCOW_API_KEY)\b\s*[:=]\s*['"]?[^'"\s<][^'"]{3,}/i,
  /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*['"][^'"]{8,}['"]/i,
];

main();

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const inputPath = requiredArg(args, 'input');
  const tenantId = requiredArg(args, 'tenant-id');
  const siteKey = requiredArg(args, 'site-key');
  const route = requiredArg(args, 'route');
  const mode = requiredArg(args, 'mode');
  const outputPath = args.output || '';

  if (mode !== 'preflight-only') {
    throwCliError(`Unsupported mode "${mode}". Only "preflight-only" is allowed.`);
  }

  const resolvedInput = resolveWithinRepo(inputPath, 'input');
  if (!existsSync(resolvedInput)) {
    throwCliError(`Input file does not exist: ${inputPath}`);
  }

  if (isBlockedPath(resolvedInput) || rawMediaPattern.test(resolvedInput)) {
    throwCliError(`Input path is not allowed for import preflight: ${inputPath}`);
  }

  let resolvedOutput = '';
  if (outputPath) {
    resolvedOutput = resolveWithinRepo(outputPath, 'output');
    if (isBlockedPath(resolvedOutput) || rawMediaPattern.test(resolvedOutput)) {
      throwCliError(`Output path is not allowed for import preflight: ${outputPath}`);
    }
  }

  const generatedAt = new Date().toISOString();
  const rawJson = readFileSync(resolvedInput, 'utf8');
  const report = {
    schemaVersion: 'pumpkin-import-preflight-result.v1',
    generatedAt,
    tool: {
      name: 'pumpkin-import-preflight',
      path: path.relative(repoRoot, fileURLToPath(import.meta.url)).replace(/\\/g, '/'),
      mode,
      nonMutating: true,
      requiresAdminJwt: false,
      readsProtectedConfig: false,
      callsLiveWriteApis: false,
      mutatesCmsData: false,
      sendsEmail: false,
      touchesMediaRecords: false,
    },
    input: {
      path: normalizeRel(resolvedInput),
      tenantId,
      siteKey,
      route,
    },
    checks: [],
    candidate: {},
    issues: [],
    blockers: {
      localDraftImport: [],
      cmsImport: [],
      staticRegeneration: [],
      production: [],
    },
    differencesFromAdminApiPreflight: [
      'Does not fetch current CMS pages, so same-slug update/create collision behavior is not proven.',
      'Does not create server-side revision snapshots or ImportRun history.',
      'Does not call SavePageAsync/UpdatePageAsync and therefore does not prove database persistence.',
      'Mirrors admin/API validation categories locally without requiring admin JWT, tenant API key, or protected config.',
    ],
  };

  let page = null;
  try {
    page = JSON.parse(rawJson);
    pass(report, 'json-parse', 'JSON parse succeeded.');
  } catch (error) {
    fail(report, 'json-parse', `JSON parse failed: ${error.message}`, 'shape', 'payload');
  }

  const secretHits = scanSecrets(rawJson);
  if (secretHits.length > 0) {
    fail(report, 'secret-scan', 'High-confidence secret-looking values were found in candidate JSON.', 'security', 'payload', { hitCount: secretHits.length });
  } else {
    pass(report, 'secret-scan', 'No high-confidence secret-looking values found.');
  }

  if (page && isRecord(page)) {
    report.candidate = summarizeCandidate(page);
    validateBasicImportShape(report, page, tenantId, siteKey, route);
    validateKnownBlocks(report, page);
    validateProductionHomepageSections(report, page, rawJson);
    validateCustomHtmlAndEmbeds(report, page);
    validateFocusedHomeContract(report, page);
    validatePhase8nPersistenceFields(report, page);
    validateUpdatedHomeContactPersistenceFields(report, page, route);
    validateFormReferences(report, page);
    validateMediaRequirements(report, page);
    validateBusinessAndApprovalState(report, page);
    validateUnsafePayload(report, rawJson);
  } else if (page !== null) {
    fail(report, 'page-shape', 'Candidate JSON must be a Page object.', 'shape', 'payload');
  }

  const dotNetResult = runDotNetContract(resolvedInput);
  report.dotNetContract = dotNetResult.summary;
  if (dotNetResult.ok) {
    pass(report, 'dotnet-page-contract', 'The .NET Page/block contract accepted the candidate.', { readinessDecision: dotNetResult.summary.readinessDecision });
    if (dotNetResult.summary.productionFieldPersistenceAvailable === false) {
      warn(report, 'dotnet-page-contract', 'The .NET contract did not report production field persistence; rebuild the contract tool before CMS writes.', 'dotnet', 'productionFieldPersistence');
    }
    if (dotNetResult.summary.updatedHomeContactPersistenceOk === false) {
      fail(report, 'dotnet-page-contract', 'The .NET contract reported updated home/contact persistence loss.', 'dotnet', 'updatedHomeContactPersistence', dotNetResult.summary);
    }
    if (dotNetResult.summary.warningCount > 0) {
      warn(report, 'dotnet-page-contract', `The .NET contract returned ${dotNetResult.summary.warningCount} warning(s).`, 'dotnet', 'candidate', dotNetResult.summary.warningCodes);
    }
  } else {
    fail(report, 'dotnet-page-contract', 'The .NET Page/block contract rejected the candidate or could not run.', 'dotnet', 'candidate', dotNetResult.summary);
  }

  classifyReadiness(report);

  if (resolvedOutput) {
    mkdirSync(path.dirname(resolvedOutput), { recursive: true });
    writeFileSync(resolvedOutput, JSON.stringify(report, null, 2) + '\n', 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));
  if (!report.classification['preflight-valid-for-shape']) {
    process.exitCode = 1;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === '--help' || item === '-h') {
      args.help = true;
      continue;
    }
    if (!item.startsWith('--')) {
      throwCliError(`Unexpected argument: ${item}`);
    }
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throwCliError(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node tools/import-preflight/import-preflight.mjs --input <page.json> --tenant-id <tenant> --site-key <site> --route <route> --mode preflight-only [--output <report.json>]`);
}

function requiredArg(args, key) {
  const value = args[key];
  if (!value) throwCliError(`Missing required --${key}`);
  return value;
}

function throwCliError(message) {
  console.error(`[import-preflight] ${message}`);
  process.exit(2);
}

function resolveWithinRepo(value, label) {
  const resolved = path.resolve(repoRoot, value);
  const rel = path.relative(repoRoot, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throwCliError(`${label} path must stay inside the repo: ${value}`);
  }
  return resolved;
}

function isBlockedPath(value) {
  const rel = normalizeRel(value);
  return protectedPathPattern.test(rel);
}

function normalizeRel(value) {
  return path.relative(repoRoot, value).replace(/\\/g, '/');
}

function pass(report, check, message, details = null) {
  report.checks.push({ check, status: 'passed', message, ...(details ? { details } : {}) });
}

function warn(report, check, message, category = 'general', field = '', details = null) {
  report.checks.push({ check, status: 'warning', message, category, field, ...(details ? { details } : {}) });
  report.issues.push({ severity: 'warning', check, category, field, message, ...(details ? { details } : {}) });
}

function fail(report, check, message, category = 'general', field = '', details = null) {
  report.checks.push({ check, status: 'failed', message, category, field, ...(details ? { details } : {}) });
  report.issues.push({ severity: 'error', check, category, field, message, ...(details ? { details } : {}) });
}

function blocker(report, audience, check, message, category = 'readiness', field = '', details = null) {
  report.blockers[audience].push({ check, category, field, message, ...(details ? { details } : {}) });
}

function summarizeCandidate(page) {
  const blocks = getBlocks(page);
  const mediaRequirements = Array.isArray(page.mediaRequirements) ? page.mediaRequirements : [];
  const formBlocks = blocks.filter((block) => stringValue(block.type) === 'formBlock');
  return {
    tenantId: stringValue(page.tenantId),
    siteKey: stringValue(page.siteKey),
    pageSlug: stringValue(page.pageSlug),
    route: stringValue(page.route || page.path) || routeFromSlug(stringValue(page.pageSlug)),
    canonicalUrl: stringValue(getPath(page, 'seo.canonicalUrl') || page.canonicalUrl),
    isPublished: page.isPublished === true,
    includeInSitemap: page.includeInSitemap === true,
    workflowStatus: stringValue(getPath(page, 'workflow.status')),
    approvedForPublish: getPath(page, 'workflow.approvedForPublish') === true,
    approvedForImport: getPath(page, 'workflow.approvedForImport') === true,
    staticEligible: getPath(page, 'staticPublishing.staticEligible') === true,
    needsRebuild: getPath(page, 'staticPublishing.needsRebuild') === true,
    blockCount: blocks.length,
    blockTypes: blocks.map((block) => stringValue(block.type)),
    formBlockCount: formBlocks.length,
    formKeys: formBlocks.map((block) => stringValue(getPath(block, 'content.formKey')) || stringValue(getPath(block, 'content.formId'))),
    mediaRequirementCount: mediaRequirements.length,
    unresolvedMediaRequirementCount: mediaRequirements.filter((item) => !stringValue(item.mediaAssetId)).length,
  };
}

function validateBasicImportShape(report, page, tenantId, siteKey, route) {
  if (stringValue(page.tenantId) !== tenantId) {
    fail(report, 'tenant', `Candidate tenantId "${stringValue(page.tenantId)}" does not match expected "${tenantId}".`, 'tenant', 'tenantId');
  } else {
    pass(report, 'tenant', `Candidate tenantId matches "${tenantId}".`);
  }

  if (stringValue(page.siteKey) && stringValue(page.siteKey) !== siteKey) {
    fail(report, 'site-key', `Candidate siteKey "${stringValue(page.siteKey)}" does not match expected "${siteKey}".`, 'tenant', 'siteKey');
  } else {
    pass(report, 'site-key', `Candidate siteKey is compatible with "${siteKey}".`);
  }

  const rawSlug = stringValue(page.pageSlug);
  const normalizedSlug = normalizeSlug(rawSlug);
  if (!rawSlug) {
    fail(report, 'slug', 'pageSlug is required.', 'shape', 'pageSlug');
  } else if (!normalizedSlug) {
    fail(report, 'slug', `pageSlug "${rawSlug}" does not contain valid slug characters.`, 'shape', 'pageSlug');
  } else if (rawSlug !== normalizedSlug && rawSlug !== 'home') {
    warn(report, 'slug', `pageSlug will normalize from "${rawSlug}" to "${normalizedSlug}".`, 'shape', 'pageSlug');
  } else {
    pass(report, 'slug', `pageSlug "${rawSlug}" is route-safe.`);
  }

  const expectedSlug = route === '/' ? 'home' : normalizeSlug(route);
  if (normalizedSlug !== expectedSlug) {
    fail(report, 'route', `Route "${route}" expects slug "${expectedSlug}", but candidate slug is "${normalizedSlug}".`, 'route', 'pageSlug');
  } else {
    pass(report, 'route', `Candidate slug matches route "${route}".`);
  }

  if (!isRecord(page.ContentData) || !Array.isArray(page.ContentData.ContentBlocks)) {
    fail(report, 'content-blocks', 'ContentData.ContentBlocks must be an array.', 'blocks', 'ContentData.ContentBlocks');
  } else {
    pass(report, 'content-blocks', `ContentData.ContentBlocks contains ${page.ContentData.ContentBlocks.length} block(s).`);
  }

  if (typeof page.isPublished !== 'boolean') {
    fail(report, 'publishing-state', 'isPublished must be a boolean.', 'publishing', 'isPublished');
  } else {
    pass(report, 'publishing-state', `isPublished is ${page.isPublished}.`);
  }

  if (typeof page.includeInSitemap !== 'boolean') {
    fail(report, 'sitemap-state', 'includeInSitemap must be a boolean.', 'static', 'includeInSitemap');
  } else {
    pass(report, 'sitemap-state', `includeInSitemap is ${page.includeInSitemap}.`);
  }

  const canonicalUrl = stringValue(getPath(page, 'seo.canonicalUrl') || page.canonicalUrl);
  if (!canonicalUrl) {
    fail(report, 'canonical', 'seo.canonicalUrl is required.', 'seo', 'seo.canonicalUrl');
    return;
  }
  try {
    const canonical = new URL(canonicalUrl);
    const canonicalSlug = normalizeSlug(canonical.pathname) || 'home';
    if (canonical.host !== 'iceskatingrinkrentals.com') {
      warn(report, 'canonical', `Canonical host "${canonical.host}" is not iceskatingrinkrentals.com.`, 'seo', 'seo.canonicalUrl');
    }
    if (canonicalSlug !== expectedSlug) {
      fail(report, 'canonical', `Canonical path resolves to "${canonicalSlug}", expected "${expectedSlug}".`, 'seo', 'seo.canonicalUrl');
    } else {
      pass(report, 'canonical', 'Canonical path matches candidate route.');
    }
  } catch {
    fail(report, 'canonical', 'seo.canonicalUrl is not URL-like.', 'seo', 'seo.canonicalUrl');
  }
}

function validateKnownBlocks(report, page) {
  const blocks = getBlocks(page);
  const blockTypes = blocks.map((block) => stringValue(block.type)).filter(Boolean);
  const missingRequired = requiredHomeBlocks.filter((blockType) => !blockTypes.includes(blockType));
  if (missingRequired.length > 0) {
    fail(report, 'required-blocks', `Required homepage blocks are missing: ${missingRequired.join(', ')}.`, 'blocks', 'ContentData.ContentBlocks', missingRequired);
  } else {
    pass(report, 'required-blocks', 'Required homepage block types are present.');
  }

  blocks.forEach((block, index) => {
    const blockType = stringValue(block.type);
    if (!blockType) {
      fail(report, 'known-block-types', `Block ${index} has no type.`, 'blocks', `ContentData.ContentBlocks[${index}].type`);
    } else if (!supportedBlockTypes.has(blockType)) {
      fail(report, 'known-block-types', `Unsupported content block type "${blockType}".`, 'blocks', `ContentData.ContentBlocks[${index}].type`);
    }
  });

  if (!report.issues.some((issue) => issue.check === 'known-block-types' && issue.severity === 'error')) {
    pass(report, 'known-block-types', 'All block types are known to the local import preflight.');
  }
}

function validateProductionHomepageSections(report, page, rawJson) {
  if (normalizeSlug(stringValue(page.pageSlug)) !== 'home') return;
  if (!isProductionRendererCompatibleCandidate(page)) return;

  const blocks = getBlocks(page);
  const variants = blocks.map((block) => stringValue(getPath(block, 'content.sectionVariant') || getPath(block, 'content.variant') || getPath(block, 'content.type'))).filter(Boolean);
  const missing = requiredProductionHomeVariants.filter((variant) => !variants.includes(variant));
  if (missing.length > 0) {
    fail(report, 'production-home-sections', `Production homepage variants are missing: ${missing.join(', ')}.`, 'blocks', 'ContentData.ContentBlocks', missing);
  } else {
    pass(report, 'production-home-sections', 'All production homepage section variants are present.');
  }

  if (blocks.some((block) => stringValue(block.type) === 'customHtml')) {
    fail(report, 'production-home-sections', 'Production-render candidate must not depend on customHtml sections.', 'blocks', 'ContentData.ContentBlocks');
  }

  const hero = blocks.find((block) => stringValue(getPath(block, 'content.sectionVariant')) === 'heroMedia');
  const heroImage = isRecord(getPath(hero, 'content.media')) ? getPath(hero, 'content.media') : {};
  if (!isSafeLocalMediaImage(heroImage)) {
    fail(report, 'production-media-placement', 'heroMedia requires a local /media image with alt text and MediaAsset id.', 'media', 'Hero.content.media');
  }

  const grid = blocks.find((block) => stringValue(getPath(block, 'content.sectionVariant')) === 'mediaUseCaseGrid');
  const cards = Array.isArray(getPath(grid, 'content.cards')) ? getPath(grid, 'content.cards') : [];
  if (cards.length < 3) {
    fail(report, 'production-media-placement', 'mediaUseCaseGrid must contain at least three image cards.', 'media', 'CardGrid.content.cards');
  }
  const badCards = cards.filter((card) => !isSafeLocalMediaImage(isRecord(card) ? card.media || card : null));
  if (badCards.length > 0) {
    fail(report, 'production-media-placement', 'Every mediaUseCaseGrid card must have a local /media image, alt text, and MediaAsset id.', 'media', 'CardGrid.content.cards', { badCardCount: badCards.length });
  }

  const eastCoastUsage = analyzeEastCoastUsage(rawJson);
  if (eastCoastUsage.hasUnapprovedEastCoastWording) {
    fail(report, 'production-service-area-copy', 'Generic East Coast service-area wording requires explicit approval before production import.', 'content', 'payload', eastCoastUsage);
  } else if (eastCoastUsage.hasPartnerBrandName) {
    pass(report, 'production-service-area-copy', 'East Coast wording is limited to the Party Pros East Coast partner brand name.');
  } else {
    pass(report, 'production-service-area-copy', 'Service-area copy contains no East Coast wording.');
  }

  if (!report.issues.some((issue) => ['production-home-sections', 'production-media-placement', 'production-service-area-copy'].includes(issue.check) && issue.severity === 'error')) {
    pass(report, 'production-media-placement', 'Production homepage media placement contract passed.');
  }
}

function analyzeEastCoastUsage(rawJson) {
  const partnerBrandPattern = /\bParty Pros East Coast\b/gi;
  const hasPartnerBrandName = /\bParty Pros East Coast\b/i.test(rawJson);
  const withoutApprovedPartnerBrand = rawJson.replace(partnerBrandPattern, '');
  const remainingEastCoastMatches = withoutApprovedPartnerBrand.match(/\bEast Coast\b/gi) || [];

  return {
    hasPartnerBrandName,
    hasUnapprovedEastCoastWording: remainingEastCoastMatches.length > 0,
    unapprovedEastCoastMatchCount: remainingEastCoastMatches.length,
  };
}

function validateCustomHtmlAndEmbeds(report, page) {
  const blocks = getBlocks(page);
  blocks.forEach((block, index) => {
    const blockType = stringValue(block.type);
    const content = isRecord(block.content) ? block.content : {};
    if (blockType === 'customHtml') {
      const base = `ContentData.ContentBlocks[${index}].content`;
      if (!stringValue(content.id)) fail(report, 'custom-html', 'customHtml sections require a stable id.', 'blocks', `${base}.id`);
      const profile = stringValue(content.allowedProfile || 'marketing-basic');
      const container = stringValue(content.container || 'standard');
      const sectionVariant = stringValue(content.sectionVariant);
      if (!customHtmlProfiles.has(profile)) fail(report, 'custom-html', `Unsupported allowedProfile "${profile}".`, 'blocks', `${base}.allowedProfile`);
      if (!customHtmlContainers.has(container)) fail(report, 'custom-html', `Unsupported container "${container}".`, 'blocks', `${base}.container`);
      if (sectionVariant && !sectionVariants.has(sectionVariant)) fail(report, 'custom-html', `Unsupported sectionVariant "${sectionVariant}".`, 'blocks', `${base}.sectionVariant`);
      validateHtmlSafety(report, stringValue(content.html), `${base}.html`);
      validateCssSafety(report, stringValue(content.css || content.sectionScopedCss), `${base}.css`, stringValue(content.id));
      validateClasses(report, stringValue(content.html), `${base}.html`);
    }

    if (blockType === 'trustedEmbed') {
      const provider = stringValue(content.provider);
      if (!['youtube', 'vimeo', 'googleMaps'].includes(provider)) {
        fail(report, 'trusted-embed', `Unsupported trustedEmbed provider "${provider}".`, 'blocks', `ContentData.ContentBlocks[${index}].content.provider`);
      }
    }

    if (blockType === 'formBlock') {
      const variant = stringValue(content.variant || 'contact-card');
      if (!formBlockVariants.has(variant)) {
        fail(report, 'form-block', `Unsupported formBlock variant "${variant}".`, 'forms', `ContentData.ContentBlocks[${index}].content.variant`);
      }
    }
  });

  const failed = report.issues.some((issue) => ['custom-html', 'trusted-embed', 'form-block', 'html-safety', 'css-safety', 'semantic-classes'].includes(issue.check) && issue.severity === 'error');
  if (!failed) pass(report, 'rich-block-safety', 'customHtml/trustedEmbed/formBlock focused checks passed.');
}

function validateFocusedHomeContract(report, page) {
  const meta = isRecord(page.MetaData) ? page.MetaData : {};
  const seo = isRecord(page.seo) ? page.seo : {};
  const template = isRecord(page.template) ? page.template : {};
  const staticPublishing = isRecord(page.staticPublishing) ? page.staticPublishing : {};
  const requiredFields = [
    ['Layout', page.Layout],
    ['MetaData.title', meta.title],
    ['MetaData.description', meta.description],
    ['MetaData.pageType', meta.pageType],
    ['template.templateKey', template.templateKey],
    ['template.contentModelVersion', template.contentModelVersion],
    ['seo.metaTitle', seo.metaTitle],
    ['seo.metaDescription', seo.metaDescription],
    ['seo.robots', seo.robots],
    ['staticPublishing.deploymentStatus', staticPublishing.deploymentStatus],
  ];
  const missing = requiredFields.filter(([, value]) => !hasValue(value)).map(([field]) => field);
  if (missing.length > 0) {
    fail(report, 'focused-home-contract', `Required homepage import fields are missing: ${missing.join(', ')}.`, 'template', 'candidate', missing);
  } else {
    pass(report, 'focused-home-contract', 'Required homepage import fields are present.');
  }

  const media = isRecord(page.media) ? page.media : {};
  requiredHomeMediaSlots.forEach((slot) => {
    const image = isRecord(media[slot]) ? media[slot] : null;
    if (!image) {
      blocker(report, 'cmsImport', 'focused-home-contract', `Required homepage media slot ${slot} is missing.`, 'media', `media.${slot}`);
      return;
    }
    const url = stringValue(image.publicUrl || image.url || image.src);
    const assetId = stringValue(image.assetId || image.mediaAssetId);
    if (!url) {
      blocker(report, 'cmsImport', 'focused-home-contract', `Required homepage media slot ${slot} has no public URL.`, 'media', `media.${slot}.url`);
    }
    if (!assetId) {
      blocker(report, 'cmsImport', 'focused-home-contract', `Required homepage media slot ${slot} has no MediaAsset id.`, 'media', `media.${slot}.assetId`);
    }
    if (url && !isSafeUrl(url)) {
      fail(report, 'media-url-safety', `Media slot ${slot} uses an unsafe URL.`, 'media', `media.${slot}.url`);
    }
  });
}

function validatePhase8nPersistenceFields(report, page) {
  if (!isProductionRendererCompatibleCandidate(page)) return;

  const requiredFields = [
    ['domainRouting.selectedMailbox', getPath(page, 'domainRouting.selectedMailbox')],
    ['domainRouting.publicEmailDisplayPolicy', getPath(page, 'domainRouting.publicEmailDisplayPolicy')],
    ['media.logo.mediaAssetId', getPath(page, 'media.logo.mediaAssetId')],
    ['media.setupImage.mediaAssetId', getPath(page, 'media.setupImage.mediaAssetId')],
    ['media.openGraphImage.mediaAssetId', getPath(page, 'media.openGraphImage.mediaAssetId')],
  ];

  const requiredMediaSlots = ['featuredImage', 'heroImage', 'localImage', 'closingImage'];
  requiredMediaSlots.forEach((slot) => {
    requiredFields.push([`media.${slot}.mediaAssetId`, getPath(page, `media.${slot}.mediaAssetId`) || getPath(page, `media.${slot}.assetId`)]);
  });

  const blocks = getBlocks(page);
  const expectedVariants = normalizeSlug(stringValue(page.pageSlug)) === 'contact'
    ? ['heroMedia', 'trustBand', 'splitFeature', 'processSteps', 'mediaUseCaseGrid', 'planningTopics', 'faqAccordion', 'finalCta']
    : requiredProductionHomeVariants;
  expectedVariants.forEach((variant) => {
    const block = blocks.find((item) => stringValue(getPath(item, 'content.sectionVariant')) === variant);
    requiredFields.push([`ContentData.ContentBlocks.${variant}.content.sectionVariant`, getPath(block, 'content.sectionVariant')]);
  });

  const missing = requiredFields.filter(([, value]) => !stringValue(value)).map(([field]) => field);
  if (missing.length > 0) {
    fail(report, 'phase8n-contract-persistence', `Phase 8N persistence-sensitive fields are missing: ${missing.join(', ')}.`, 'contract', 'candidate', missing);
    return;
  }

  const mediaIds = findValuesByKey(page, 'mediaAssetId').filter(Boolean);
  const nonTenantMediaIds = mediaIds.filter((value) => !value.startsWith('ice-rink-rentals-'));
  if (nonTenantMediaIds.length > 0) {
    fail(report, 'phase8n-contract-persistence', 'Phase 8N MediaAsset IDs must remain tenant-prefixed.', 'media', 'mediaAssetId', nonTenantMediaIds);
    return;
  }

  pass(report, 'phase8n-contract-persistence', 'Phase 8N production fields are present for .NET/API persistence validation.');
}

function validateUpdatedHomeContactPersistenceFields(report, page, route) {
  if (stringValue(page.tenantId) !== 'ice-rink-rentals') return;
  const normalizedRoute = route === '/' ? '/' : `/${normalizeSlug(route)}`;
  if (normalizedRoute !== '/' && normalizedRoute !== '/contact') return;
  if (!isProductionRendererCompatibleCandidate(page)) return;

  const requiredFields = [
    ['domainRouting.publicEmailDisplayPolicy', getPath(page, 'domainRouting.publicEmailDisplayPolicy')],
    ['domainRouting.selectedMailbox', getPath(page, 'domainRouting.selectedMailbox')],
    ['domainRouting.selectedMailboxMetadata', getPath(page, 'domainRouting.selectedMailboxMetadata')],
    ['domainRouting.leadRecipientRef', getPath(page, 'domainRouting.leadRecipientRef')],
    ['domainRouting.staticEndpointRef', getPath(page, 'domainRouting.staticEndpointRef')],
    ['media.featuredImage.mediaAssetId', getPath(page, 'media.featuredImage.mediaAssetId')],
    ['media.heroImage.mediaAssetId', getPath(page, 'media.heroImage.mediaAssetId')],
    ['media.localImage.mediaAssetId', getPath(page, 'media.localImage.mediaAssetId')],
    ['media.closingImage.mediaAssetId', getPath(page, 'media.closingImage.mediaAssetId')],
    ['media.openGraphImage.mediaAssetId', getPath(page, 'media.openGraphImage.mediaAssetId')],
    ['media.logo.mediaAssetId', getPath(page, 'media.logo.mediaAssetId')],
    ['media.setupImage.mediaAssetId', getPath(page, 'media.setupImage.mediaAssetId')],
  ];

  const blocks = getBlocks(page);
  const variants = blocks.map((block) => stringValue(getPath(block, 'content.sectionVariant'))).filter(Boolean);
  const expectedVariants = normalizedRoute === '/'
    ? requiredProductionHomeVariants
    : ['heroMedia', 'trustBand', 'splitFeature', 'processSteps', 'mediaUseCaseGrid', 'planningTopics', 'faqAccordion', 'finalCta'];
  expectedVariants.forEach((variant) => {
    requiredFields.push([`ContentData.ContentBlocks.${variant}.content.sectionVariant`, variants.includes(variant) ? variant : '']);
  });

  if (normalizedRoute === '/contact') {
    const formBlock = blocks.find((block) => stringValue(block.type) === 'formBlock');
    requiredFields.push(
      ['formBlock.formKey', getPath(formBlock, 'content.formKey')],
      ['formBlock.sourcePage', getPath(formBlock, 'content.sourcePage')],
      ['formBlock.staticEndpointRef', getPath(formBlock, 'content.staticEndpointRef')],
      ['formBlock.leadRecipientRef', getPath(formBlock, 'content.leadRecipientRef')],
    );
  }

  const missing = requiredFields.filter(([, value]) => !stringValue(value)).map(([field]) => field);
  if (missing.length > 0) {
    fail(report, 'updated-home-contact-persistence', `Updated home/contact persistence fields are missing: ${missing.join(', ')}.`, 'contract', 'candidate', missing);
    return;
  }

  const mediaIds = findValuesByKey(page, 'mediaAssetId').filter(Boolean);
  const nonTenantMediaIds = mediaIds.filter((value) => !value.startsWith('ice-rink-rentals-'));
  if (nonTenantMediaIds.length > 0) {
    fail(report, 'updated-home-contact-persistence', 'Updated home/contact MediaAsset IDs must remain tenant-prefixed.', 'media', 'mediaAssetId', nonTenantMediaIds);
    return;
  }

  if (stringValue(getPath(page, 'domainRouting.publicEmailDisplayPolicy')) !== 'form-first-under-review') {
    fail(report, 'updated-home-contact-persistence', 'publicEmailDisplayPolicy must remain form-first-under-review.', 'domainRouting', 'domainRouting.publicEmailDisplayPolicy');
    return;
  }

  if (stringValue(getPath(page, 'domainRouting.selectedMailbox')) !== 'contact@iceskatingrinkrentals.com') {
    fail(report, 'updated-home-contact-persistence', 'selectedMailbox must match the reviewed mailbox metadata.', 'domainRouting', 'domainRouting.selectedMailbox');
    return;
  }

  pass(report, 'updated-home-contact-persistence', 'Updated home/contact persistence-sensitive fields are present before .NET round-trip validation.');
}

function isProductionRendererCompatibleCandidate(page) {
  const templateKey = stringValue(getPath(page, 'template.templateKey'));
  const layoutVariant = stringValue(getPath(page, 'template.layoutVariant'));
  const contentModelVersion = stringValue(getPath(page, 'template.contentModelVersion'));
  const candidateStatus = stringValue(page.importCandidateStatus);
  return templateKey === 'ice-homepage-production-renderer-v1'
    || templateKey.includes('production-renderer-compatible')
    || layoutVariant === 'production-renderer-compatible'
    || contentModelVersion.includes('production-renderer-compatible')
    || candidateStatus === 'production-render-candidate'
    || candidateStatus.includes('phase10a');
}

function findValuesByKey(value, key) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => findValuesByKey(item, key));
  }

  if (!isRecord(value)) return [];

  return Object.entries(value).flatMap(([entryKey, entryValue]) => {
    const nested = findValuesByKey(entryValue, key);
    return entryKey === key && typeof entryValue === 'string' ? [entryValue, ...nested] : nested;
  });
}

function validateFormReferences(report, page) {
  const blocks = getBlocks(page);
  const formBlocks = blocks.filter((block) => stringValue(block.type) === 'formBlock');
  if (formBlocks.length === 0) {
    warn(report, 'default-form', 'Homepage has no formBlock.', 'forms', 'ContentData.ContentBlocks');
    return;
  }

  formBlocks.forEach((block, index) => {
    const content = isRecord(block.content) ? block.content : {};
    const formKey = stringValue(content.formKey || content.formId);
    if (!knownDefaultFormKeys.has(formKey)) {
      fail(report, 'default-form', `formBlock uses unsupported form key "${formKey}".`, 'forms', `formBlock[${index}].formKey`);
    }
  });

  const formConfig = isRecord(page.formConfig) ? page.formConfig : {};
  if (!stringValue(formConfig.staticFormEndpointKey)) {
    warn(report, 'default-form', 'formConfig.staticFormEndpointKey is missing.', 'forms', 'formConfig.staticFormEndpointKey');
  }
  if (!stringValue(formConfig.domainRoutingKey) && !stringValue(formConfig.recipientGroup)) {
    warn(report, 'default-form', 'Lead routing refs are missing.', 'forms', 'formConfig.domainRoutingKey');
  }

  if (!report.issues.some((issue) => issue.check === 'default-form' && issue.severity === 'error')) {
    pass(report, 'default-form', 'Default form references are safe and non-secret.');
  }
}

function validateMediaRequirements(report, page) {
  const requirements = Array.isArray(page.mediaRequirements) ? page.mediaRequirements : [];
  if (requirements.length === 0) {
    warn(report, 'media-requirements', 'No mediaRequirements array found.', 'media', 'mediaRequirements');
    return;
  }

  const unresolvedRequired = requirements.filter((item) => item?.requiredBeforeCmsImport !== false && !stringValue(item?.mediaAssetId));
  if (unresolvedRequired.length > 0) {
    const details = unresolvedRequired.map((item) => ({
      title: stringValue(item.title),
      status: stringValue(item.status),
      usageType: stringValue(item.usageType),
    }));
    blocker(report, 'localDraftImport', 'media-requirements', `${unresolvedRequired.length} required media requirement(s) have no MediaAsset id; local draft import needs explicit unresolved-media approval.`, 'media', 'mediaRequirements', details);
    blocker(report, 'cmsImport', 'media-requirements', `${unresolvedRequired.length} required media requirement(s) have no MediaAsset id.`, 'media', 'mediaRequirements', details);
    blocker(report, 'staticRegeneration', 'media-requirements', 'Static regeneration needs approved MediaAsset-backed media or an explicit placeholder policy.', 'media', 'mediaRequirements', details);
    blocker(report, 'production', 'media-requirements', 'Production requires approved MediaAsset-backed images and public URLs.', 'media', 'mediaRequirements', details);
    warn(report, 'media-requirements', `${unresolvedRequired.length} media requirement(s) remain unresolved.`, 'media', 'mediaRequirements', details);
  } else {
    pass(report, 'media-requirements', 'Required media requirements have MediaAsset ids.');
  }
}

function validateBusinessAndApprovalState(report, page) {
  const workflow = isRecord(page.workflow) ? page.workflow : {};
  const domainRouting = isRecord(page.domainRouting) ? page.domainRouting : {};
  const serviceSchema = isRecord(page.serviceSchema) ? page.serviceSchema : {};
  const pageQuality = isRecord(page.pageQuality) ? page.pageQuality : {};

  if (workflow.approvedForImport !== true) {
    blocker(report, 'cmsImport', 'approval', 'workflow.approvedForImport is not true.', 'workflow', 'workflow.approvedForImport');
  }
  if (workflow.approvedForPublish !== true) {
    blocker(report, 'production', 'approval', 'workflow.approvedForPublish is not true.', 'workflow', 'workflow.approvedForPublish');
  }
  if (stringValue(workflow.reviewStatus) !== 'approved' && !['approved', 'published'].includes(stringValue(workflow.status))) {
    blocker(report, 'cmsImport', 'approval', 'Human approval is not recorded.', 'workflow', 'workflow.reviewStatus');
    blocker(report, 'production', 'approval', 'Human approval is not recorded.', 'workflow', 'workflow.reviewStatus');
  }
  if (!stringValue(domainRouting.publicContactEmail)) {
    blocker(report, 'cmsImport', 'business-values', 'Public email display policy remains unresolved or intentionally hidden.', 'domainRouting', 'domainRouting.publicContactEmail');
    blocker(report, 'production', 'business-values', 'Public email display policy remains unresolved.', 'domainRouting', 'domainRouting.publicContactEmail');
  }
  if (!stringValue(domainRouting.primaryPhone)) {
    blocker(report, 'cmsImport', 'business-values', 'Primary phone/public contact policy remains unresolved or intentionally hidden.', 'domainRouting', 'domainRouting.primaryPhone');
    blocker(report, 'production', 'business-values', 'Primary phone/public contact policy remains unresolved.', 'domainRouting', 'domainRouting.primaryPhone');
  }
  if (!Array.isArray(serviceSchema.areasServed) || serviceSchema.areasServed.length === 0) {
    blocker(report, 'cmsImport', 'business-values', 'Service-area wording is not finalized.', 'serviceSchema', 'serviceSchema.areasServed');
    blocker(report, 'staticRegeneration', 'business-values', 'Service-area wording should be finalized before static generation.', 'serviceSchema', 'serviceSchema.areasServed');
    blocker(report, 'production', 'business-values', 'Service-area wording is not finalized.', 'serviceSchema', 'serviceSchema.areasServed');
  }
  if (Array.isArray(pageQuality.blockingIssues) && pageQuality.blockingIssues.length > 0) {
    blocker(report, 'cmsImport', 'page-quality', 'pageQuality.blockingIssues are present.', 'pageQuality', 'pageQuality.blockingIssues', pageQuality.blockingIssues);
  }
  if (getPath(page, 'staticPublishing.staticEligible') !== true) {
    blocker(report, 'staticRegeneration', 'static-publishing', 'staticPublishing.staticEligible is not true.', 'staticPublishing', 'staticPublishing.staticEligible');
    blocker(report, 'production', 'static-publishing', 'staticPublishing.staticEligible is not true.', 'staticPublishing', 'staticPublishing.staticEligible');
  }

  pass(report, 'business-approval-audit', 'Business value and approval blockers were classified.');
}

function validateUnsafePayload(report, rawJson) {
  const unsafePatterns = [
    [/<script\b/i, 'script tag'],
    [/\son[a-z]+\s*=/i, 'event handler attribute'],
    [/javascript:/i, 'javascript URL'],
    [/data:image\//i, 'data image'],
    [/\bbase64\b/i, 'base64 marker'],
    [/<form\b/i, 'raw form tag'],
    [/<input\b/i, 'raw input tag'],
    [/<textarea\b/i, 'raw textarea tag'],
    [/<select\b/i, 'raw select tag'],
    [/mailto:/i, 'mailto link'],
  ];
  const hits = unsafePatterns.filter(([pattern]) => pattern.test(rawJson)).map(([, label]) => label);
  if (hits.length > 0) {
    fail(report, 'unsafe-payload-scan', `Unsafe payload markers found: ${hits.join(', ')}.`, 'security', 'payload', hits);
  } else {
    pass(report, 'unsafe-payload-scan', 'No unsafe HTML/CSS/form/media/email markers found.');
  }
}

function validateHtmlSafety(report, html, field) {
  if (!html) return;
  const blocked = [
    /<\s*(script|style|iframe|object|embed|svg|canvas|form|input|button|textarea|select|option|link|meta|html|head|body|base|noscript|template)\b/i,
    /\son[a-z]+\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:image\//i,
  ];
  if (blocked.some((pattern) => pattern.test(html))) {
    fail(report, 'html-safety', 'customHtml contains blocked markup or URL patterns.', 'blocks', field);
  }
}

function validateCssSafety(report, css, field, sectionId) {
  if (!css) return;
  const blocked = [/@import/i, /javascript:/i, /data:/i, /expression\s*\(/i, /url\s*\(\s*['"]?\s*(?:file:|javascript:|data:)/i];
  if (blocked.some((pattern) => pattern.test(css))) {
    fail(report, 'css-safety', 'sectionScopedCss contains blocked CSS patterns.', 'blocks', field);
  }
  if (sectionId) {
    const normalized = normalizeSectionId(sectionId);
    const selectorPattern = new RegExp(`\\.${escapeRegExp(normalized)}\\b`);
    if (css.trim() && !selectorPattern.test(css)) {
      warn(report, 'css-safety', `sectionScopedCss does not appear scoped to .${normalized}.`, 'blocks', field);
    }
  }
}

function validateClasses(report, html, field) {
  if (!html) return;
  const classes = [];
  const classRegex = /\bclass\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = classRegex.exec(html))) {
    classes.push(...match[1].split(/\s+/).filter(Boolean));
  }
  const bad = classes.filter((className) => !isApprovedClass(className) || looksLikeTailwind(className));
  if (bad.length > 0) {
    fail(report, 'semantic-classes', `Unapproved or Tailwind-like classes found: ${Array.from(new Set(bad)).join(', ')}.`, 'blocks', field);
  }
}

function isApprovedClass(className) {
  return allowedClassPrefixes.some((prefix) => className.startsWith(prefix));
}

function looksLikeTailwind(className) {
  const value = className.includes(':') ? className.split(':').pop() : className;
  return [
    /^(?:block|inline-block|inline|flex|inline-flex|grid|hidden|relative|absolute|fixed|sticky|container)$/,
    /^-?(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-/,
    /^(?:w|h|min-w|min-h|max-w|max-h)-/,
    /^(?:text|bg|from|via|to|border|rounded|shadow|opacity|z|gap|items|justify|font|leading|tracking|overflow|object|grid-cols|flex|transition|duration|animate|cursor)-/,
    /^\[.+\]$/,
  ].some((pattern) => pattern.test(value));
}

function isSafeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (/^http:\/\/localhost(?::\d+)?\//i.test(trimmed)) return true;
  return false;
}

function isSafeLocalMediaImage(value) {
  if (!isRecord(value)) return false;
  const url = stringValue(value.publicUrl || value.url || value.src || value.image);
  const alt = stringValue(value.alt || value.altText || value['image-alt'] || value.imageAlt);
  const mediaAssetId = stringValue(value.mediaAssetId || value.assetId);
  return url.startsWith('/media/ice-rink-rentals/') && Boolean(alt && mediaAssetId);
}

function runDotNetContract(inputPath) {
  const project = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'Pumpkin.PageContractTool.csproj');
  if (!existsSync(project)) {
    return { ok: false, summary: { available: false, reason: 'Project not found.' } };
  }

  const scratch = path.join(tmpdir(), `pumpkin-import-preflight-page-contract-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const buildRoot = path.join(scratch, 'bin');
  const objRoot = path.join(scratch, 'obj');
  const publishDir = path.join(scratch, 'publish');
  mkdirSync(buildRoot, { recursive: true });
  mkdirSync(objRoot, { recursive: true });
  mkdirSync(publishDir, { recursive: true });

  const buildResult = spawnSync('dotnet', [
    'publish',
    project,
    '-c',
    'Debug',
    '-o',
    publishDir,
    '-p:UseSharedCompilation=false',
    '-p:GenerateAssemblyInfo=false',
    '-p:GenerateTargetFrameworkAttribute=false',
    `-p:BaseOutputPath=${buildRoot}${path.sep}`,
    `-p:BaseIntermediateOutputPath=${objRoot}${path.sep}`,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 120000,
  });

  if (buildResult.status !== 0) {
    return {
      ok: false,
      summary: {
        available: true,
        buildOk: false,
        buildExitCode: buildResult.status,
        stdoutPreview: (buildResult.stdout || '').slice(0, 1000),
        stderrPreview: (buildResult.stderr || '').slice(0, 1000),
      },
    };
  }

  const toolDll = path.join(publishDir, 'Pumpkin.PageContractTool.dll');
  const result = spawnSync('dotnet', [toolDll, 'validate-page', '--path', inputPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 120000,
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  let parsed = null;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return {
      ok: false,
      summary: {
        available: true,
        exitCode: result.status,
        parseOk: false,
        stdoutPreview: stdout.slice(0, 1000),
        stderrPreview: stderr.slice(0, 1000),
      },
    };
  }

  return {
    ok: result.status === 0 && parsed.Ok === true,
    summary: {
      available: true,
      buildOk: true,
      exitCode: result.status,
      ok: parsed.Ok === true,
      readinessDecision: parsed.ReadinessDecision || '',
      errorCount: Array.isArray(parsed.Errors) ? parsed.Errors.length : 0,
      warningCount: Array.isArray(parsed.Warnings) ? parsed.Warnings.length : 0,
      warningCodes: Array.isArray(parsed.Warnings) ? Array.from(new Set(parsed.Warnings.map((item) => item.Code).filter(Boolean))).sort() : [],
      productionFieldPersistenceOk: Array.isArray(parsed.Pages) ? parsed.Pages.every((item) => item.ProductionFieldPersistenceOk !== false) : null,
      productionFieldPersistenceAvailable: Array.isArray(parsed.Pages) ? parsed.Pages.some((item) => Object.prototype.hasOwnProperty.call(item, 'ProductionFieldPersistenceOk')) : false,
      updatedHomeContactPersistenceOk: Array.isArray(parsed.Pages) ? parsed.Pages.every((item) => item.UpdatedHomeContactPersistenceOk !== false) : null,
      mediaRequirements: parsed.MediaRequirements || [],
    },
  };
}

function classifyReadiness(report) {
  const errorCount = report.issues.filter((issue) => issue.severity === 'error').length;
  const dotNetOk = report.dotNetContract?.ok === true;
  const shapeOk = errorCount === 0 && dotNetOk;
  const localDraftBlockers = report.blockers.localDraftImport;
  const cmsBlockers = report.blockers.cmsImport;
  const staticBlockers = report.blockers.staticRegeneration;
  const productionBlockers = report.blockers.production;

  report.classification = {
    'preflight-valid-for-shape': shapeOk,
    'preflight-valid-for-local-draft-import': shapeOk && localDraftBlockers.length === 0
      ? true
      : shapeOk
        ? 'conditional-with-explicit-unresolved-media-and-review-approval'
        : false,
    'preflight-valid-for-CMS-import': shapeOk && cmsBlockers.length === 0,
    'preflight-valid-for-production': shapeOk && cmsBlockers.length === 0 && staticBlockers.length === 0 && productionBlockers.length === 0,
  };

  report.decisions = {
    shape: report.classification['preflight-valid-for-shape'] ? 'valid' : 'blocked',
    localDraftImport: report.classification['preflight-valid-for-local-draft-import'] === true
      ? 'valid'
      : report.classification['preflight-valid-for-local-draft-import'] === false
        ? 'blocked'
        : 'conditional',
    cmsImport: report.classification['preflight-valid-for-CMS-import'] ? 'valid' : 'blocked',
    staticRegeneration: shapeOk && staticBlockers.length === 0 ? 'valid' : 'blocked',
    production: report.classification['preflight-valid-for-production'] ? 'valid' : 'blocked',
  };
}

function scanSecrets(text) {
  return secretPatterns.flatMap((pattern) => {
    const match = text.match(pattern);
    return match ? [match[0].slice(0, 80)] : [];
  });
}

function getBlocks(page) {
  const blocks = getPath(page, 'ContentData.ContentBlocks');
  return Array.isArray(blocks) ? blocks.filter(isRecord) : [];
}

function getPath(value, pathValue) {
  return pathValue.split('.').reduce((current, key) => {
    if (!isRecord(current)) return undefined;
    return current[key];
  }, value);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function normalizeSlug(value) {
  let candidate = stringValue(value).trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    candidate = url.pathname;
  } catch {
    // Plain slug.
  }
  candidate = candidate.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!candidate) return 'home';
  return candidate
    .toLowerCase()
    .replace(/[\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function routeFromSlug(slug) {
  const normalized = normalizeSlug(slug);
  return !normalized || normalized === 'home' ? '/' : `/${normalized}`;
}

function normalizeSectionId(value) {
  return stringValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
