#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const modelExports = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));

const {
  validateCustomHtmlContent,
  validateTrustedEmbedContent,
  validateCss,
  validatePageFormBlocks,
  validateThemeNavigation,
  isTailwindUtilityLikeClass,
} = modelExports;

const DOTNET_TOOL_PROJECT = path.join(repoRoot, 'tools', 'dotnet-page-contract', 'Pumpkin.PageContractTool.csproj');
const ICE_TENANT_ID = 'ice-rink-rentals';
const ICE_SITE_KEY = 'ice-rink-rentals';
const ICE_DOMAIN = 'iceskatingrinkrentals.com';
const ICE_STATIC_ENDPOINT_REF = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const ICE_LEAD_RECIPIENT_REF = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const NOW = '2026-05-27T00:00:00Z';

const SUPPORTED_BLOCK_TYPES = new Set([
  'Hero',
  'PrimaryCTA',
  'SecondaryCTA',
  'CardGrid',
  'FAQ',
  'Breadcrumbs',
  'TrustBar',
  'HowItWorks',
  'ServiceAreaMap',
  'LocalProTips',
  'Gallery',
  'Testimonials',
  'Contact',
  'formBlock',
  'Blog',
  'customHtml',
  'trustedEmbed',
]);

const SECRET_VALUE_PATTERN = new RegExp([
  'A' + 'KIA[0-9A-Z]{16}',
  'AI' + 'za[0-9A-Za-z_-]{20,}',
  'ey' + 'J[a-zA-Z0-9_-]{20,}\\.[a-zA-Z0-9_-]{20,}',
  '-----BEGIN [A-Z ]*PRIVATE ' + 'KEY-----',
  'DefaultEndpoints' + 'Protocol=',
  'Account' + 'Key=',
  'password\\s*[:=]\\s*["\\\']?[^"\\\'\\s]+',
].join('|'), 'i');

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (command === 'validate-fixtures') {
    const summary = validateFixtures();
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.ok ? 0 : 1);
  }

  if (command === 'normalize') {
    const options = parseFlags(args);
    if (!options.input || !options.outputDir) {
      console.error('normalize requires --input and --output-dir.');
      process.exit(2);
    }
    const summary = normalizeToOutputFolder(options);
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.ok ? 0 : 1);
  }

  console.error(`Unsupported command "${command}".`);
  printHelp();
  process.exit(2);
}

function printHelp() {
  console.log(`Pumpkin page intake normalizer

Commands:
  validate-fixtures
  normalize --input <file> --output-dir <folder> [--label <name>] [--secondary-input <file>]
`);
}

function parseFlags(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = 'true';
    if (index + 1 < args.length && !args[index + 1].startsWith('--')) {
      value = args[index + 1];
      index += 1;
    }
    result[key] = value;
  }
  return result;
}

function validateFixtures() {
  const casesPath = path.join(scriptDir, 'fixtures', 'fixture-cases.json');
  const cases = readJson(casesPath).cases;
  const results = [];
  let passed = 0;

  for (const testCase of cases) {
    const inputPath = path.join(scriptDir, 'fixtures', testCase.file);
    const tempDir = path.join(os.tmpdir(), `pumpkin-page-intake-${process.pid}-${slugify(testCase.name)}`);
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    let normalization;
    try {
      normalization = normalizeInput(inputPath, {
        label: testCase.name,
        writeDotNetCandidate: true,
        outputDir: tempDir,
      });
    } catch (error) {
      normalization = {
        ok: false,
        inputType: 'unknown',
        errors: [issue('error', 'normalizer.exception', error.message, inputPath)],
        warnings: [],
        blockers: [error.message],
      };
    }

    const errorCount = normalization.errors?.length || 0;
    const warningCount = normalization.warnings?.length || 0;
    const expect = testCase.expect || 'ok';
    const ok =
      (expect === 'ok' && errorCount === 0) ||
      (expect === 'warning' && errorCount === 0 && warningCount > 0) ||
      (expect === 'error' && errorCount > 0);

    if (ok) passed += 1;
    results.push({
      name: testCase.name,
      inputType: normalization.inputType,
      expected: expect,
      ok,
      errorCount,
      warningCount,
      dotNetOk: normalization.dotNetValidation?.ok ?? null,
      errors: ok ? undefined : normalization.errors,
      warnings: ok ? undefined : normalization.warnings,
    });

    rmSync(tempDir, { recursive: true, force: true });
  }

  return {
    ok: results.every((result) => result.ok),
    passed,
    failed: results.filter((result) => !result.ok).length,
    results,
  };
}

function normalizeToOutputFolder(options) {
  const inputPath = path.resolve(repoRoot, options.input);
  const outputDir = path.resolve(repoRoot, options.outputDir);
  const label = options.label || 'page';
  mkdirSync(outputDir, { recursive: true });

  const normalization = normalizeInput(inputPath, {
    label,
    outputDir,
    writeDotNetCandidate: true,
    outputCandidateName: 'proposed-homepage.normalizer-verified.json',
    outputPackageName: 'homepage-normalizer-verified-package.json',
  });

  let secondary = null;
  if (options.secondaryInput) {
    const secondaryPath = path.resolve(repoRoot, options.secondaryInput);
    secondary = normalizeInput(secondaryPath, {
      label: `${label}-secondary`,
      outputDir,
      writeDotNetCandidate: false,
    });
  }

  const packagePath = path.join(outputDir, 'homepage-normalizer-verified-package.json');
  const candidatePath = path.join(outputDir, 'proposed-homepage.normalizer-verified.json');
  const manifestPath = path.join(outputDir, 'manifest.json');

  const manifest = {
    schemaVersion: 'pumpkin-page-intake-normalizer-manifest.v1',
    phase: '8C.14B',
    createdAt: NOW,
    tenantId: ICE_TENANT_ID,
    siteKey: ICE_SITE_KEY,
    domain: ICE_DOMAIN,
    input: displayPath(inputPath),
    secondaryInput: options.secondaryInput ? displayPath(path.resolve(repoRoot, options.secondaryInput)) : null,
    outputs: [
      'README.md',
      'NORMALIZER_RUN_REPORT.md',
      'HOMEPAGE_NORMALIZATION_RESULT.md',
      'proposed-homepage.normalizer-verified.json',
      'homepage-normalizer-verified-package.json',
      'manifest.json',
    ],
    readiness: normalization.readiness,
    dotNetValidation: normalization.dotNetValidation,
    secondaryDotNetValidation: secondary?.dotNetValidation || null,
    blockers: normalization.blockers,
  };
  writeJson(manifestPath, manifest);

  writeFileSync(path.join(outputDir, 'README.md'), buildOutputReadme(normalization, secondary), 'utf8');
  writeFileSync(path.join(outputDir, 'NORMALIZER_RUN_REPORT.md'), buildRunReport(normalization, secondary), 'utf8');
  writeFileSync(path.join(outputDir, 'HOMEPAGE_NORMALIZATION_RESULT.md'), buildHomepageResult(normalization, secondary), 'utf8');

  return {
    ok: normalization.ok && normalization.dotNetValidation?.ok === true,
    input: displayPath(inputPath),
    outputDir: displayPath(outputDir),
    candidate: displayPath(candidatePath),
    package: displayPath(packagePath),
    inputType: normalization.inputType,
    warningCount: normalization.warnings.length,
    errorCount: normalization.errors.length,
    dotNetOk: normalization.dotNetValidation?.ok ?? false,
    readiness: normalization.readiness,
    secondaryInputType: secondary?.inputType || null,
    secondaryDotNetOk: secondary?.dotNetValidation?.ok ?? null,
  };
}

function normalizeInput(inputPath, options = {}) {
  const label = options.label || path.basename(inputPath);
  const raw = readFileSync(inputPath, 'utf8');
  const parse = parseInput(raw, inputPath);
  const errors = [...parse.errors];
  const warnings = [];
  const blockers = [];

  if (!parse.ok && parse.inputType === 'unknown-json') {
    blockers.push('Input could not be parsed into JSON, HTML, or markdown sections.');
    return finishNormalization({
      inputPath,
      label,
      inputType: parse.inputType,
      candidate: null,
      mediaRequirements: [],
      formMappings: [],
      errors,
      warnings,
      blockers,
      options,
    });
  }

  const normalized = buildCandidateFromParsed(parse, { inputPath, label, errors, warnings, blockers });
  const validation = validateCandidate(normalized.candidate, {
    inputPath,
    inputType: parse.inputType,
    errors,
    warnings,
    blockers,
  });

  return finishNormalization({
    inputPath,
    label,
    inputType: parse.inputType,
    candidate: validation.candidate,
    mediaRequirements: normalized.mediaRequirements,
    formMappings: normalized.formMappings,
    errors,
    warnings,
    blockers,
    options,
  });
}

function finishNormalization(context) {
  const { inputPath, label, inputType, candidate, mediaRequirements, formMappings, errors, warnings, blockers, options } = context;
  let outputCandidatePath = null;
  let outputPackagePath = null;
  let dotNetValidation = null;

  if (candidate && options.writeDotNetCandidate && options.outputDir) {
    outputCandidatePath = path.join(options.outputDir, options.outputCandidateName || `${slugify(label)}.normalizer-candidate.json`);
    const outputPackageName = options.outputPackageName || `${slugify(label)}.normalizer-package.json`;
    outputPackagePath = path.join(options.outputDir, outputPackageName);
    writeJson(outputCandidatePath, candidate);
    writeJson(outputPackagePath, buildPackage(candidate, outputCandidatePath, mediaRequirements, formMappings, inputPath));
    dotNetValidation = runDotNetValidation('validate-page', outputCandidatePath);
    if (!dotNetValidation.ok) {
      for (const item of dotNetValidation.errors || []) {
        errors.push(issue('error', `dotnet.${item.code || 'contract'}`, item.message || 'Dotnet validation error.', outputCandidatePath, item.path));
      }
      blockers.push('Candidate failed .NET Page/block contract validation.');
    }
    const packageValidation = runDotNetValidation('validate-package', options.outputDir);
    dotNetValidation = {
      ...dotNetValidation,
      packageOk: packageValidation.ok,
      packageReadinessDecision: packageValidation.readinessDecision,
      packageErrors: packageValidation.errors || [],
      packageWarnings: packageValidation.warnings || [],
    };
    if (!packageValidation.ok) {
      for (const item of packageValidation.errors || []) {
        errors.push(issue('error', `dotnet.package.${item.code || 'contract'}`, item.message || 'Dotnet package validation error.', outputPackagePath, item.path));
      }
      blockers.push('Candidate package failed .NET Page/block contract validation.');
    }
  } else if (candidate) {
    const tempDir = path.join(os.tmpdir(), `pumpkin-page-intake-oneoff-${process.pid}-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const tempCandidate = path.join(tempDir, 'candidate.json');
    writeJson(tempCandidate, candidate);
    dotNetValidation = runDotNetValidation('validate-page', tempCandidate);
    rmSync(tempDir, { recursive: true, force: true });
    if (!dotNetValidation.ok) {
      for (const item of dotNetValidation.errors || []) {
        errors.push(issue('error', `dotnet.${item.code || 'contract'}`, item.message || 'Dotnet validation error.', inputPath, item.path));
      }
      blockers.push('Candidate failed .NET Page/block contract validation.');
    }
  }

  const readiness = classifyReadiness({ candidate, errors, warnings, blockers });

  return {
    ok: errors.length === 0,
    label,
    inputPath: displayPath(inputPath),
    inputType,
    candidate,
    mediaRequirements,
    formMappings,
    errors,
    warnings,
    blockers: Array.from(new Set(blockers)),
    readiness,
    outputCandidatePath: outputCandidatePath ? displayPath(outputCandidatePath) : null,
    outputPackagePath: outputPackagePath ? displayPath(outputPackagePath) : null,
    dotNetValidation,
  };
}

function parseInput(raw, inputPath) {
  const trimmed = raw.trim();
  const errors = [];

  if (!trimmed) {
    errors.push(issue('error', 'input.empty', 'Input file is empty.', inputPath));
    return { ok: false, inputType: 'unknown-json', raw, value: null, errors };
  }

  try {
    const value = JSON.parse(raw);
    return { ok: true, inputType: detectJsonInputType(value), raw, value, errors };
  } catch (error) {
    if (looksLikeHtml(trimmed)) {
      return { ok: true, inputType: 'html-fragment', raw, value: trimmed, errors };
    }

    if (looksLikeMarkdown(trimmed)) {
      return { ok: true, inputType: 'markdown-sections', raw, value: trimmed, errors };
    }

    errors.push(issue('error', 'json.parse', `JSON parse failed: ${error.message}`, inputPath));
    return { ok: false, inputType: 'unknown-json', raw, value: null, errors };
  }
}

function detectJsonInputType(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'unknown-json';
  if (Array.isArray(value.pageFiles) || value.packageName || value.pages) return 'pumpkin-page-package-json';
  if (isPumpkinPage(value)) return 'pumpkin-page-json';
  if (value.contactForm7 || value.cf7 || value.cf7Setup || value.formShortcode || value.forms?.contactForm7) return 'cf7-package-reference';
  if (Array.isArray(value.mediaRequirements) || Array.isArray(value.media) || Array.isArray(value.assets) || Array.isArray(value.mediaManifest)) return 'media-manifest';
  if (Array.isArray(value.sections) || value.hero || value.seo || value.metaTitle || value.title) {
    return value.builder || value.builderName || value.blocks ? 'foreign-builder-json' : 'partial-page-json';
  }
  return 'unknown-json';
}

function isPumpkinPage(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    (value.PageId || value.id) &&
    value.tenantId &&
    value.pageSlug &&
    value.ContentData?.ContentBlocks,
  );
}

function buildCandidateFromParsed(parse, context) {
  const { inputType, value } = parse;
  if (inputType === 'pumpkin-page-json') {
    const candidate = normalizePumpkinPage(value, context);
    return {
      candidate,
      mediaRequirements: normalizeMediaRequirements(value.mediaRequirements || extractMediaRequirementsFromPage(value), context),
      formMappings: extractFormMappings(candidate),
    };
  }

  if (inputType === 'pumpkin-page-package-json') {
    const page = findPageInPackage(value);
    if (!page) {
      context.errors.push(issue('error', 'package.page.missing', 'Package JSON did not include an inline page candidate.', context.inputPath));
      context.blockers.push('Package requires page files or inline page data before it can be normalized.');
      return { candidate: null, mediaRequirements: [], formMappings: [] };
    }
    const candidate = normalizePumpkinPage(page, context);
    return {
      candidate,
      mediaRequirements: normalizeMediaRequirements(value.mediaRequirements || page.mediaRequirements || [], context),
      formMappings: extractFormMappings(candidate),
    };
  }

  if (inputType === 'html-fragment') {
    const candidate = scaffoldPage({
      route: '/',
      title: 'Review-only imported HTML fragment',
      description: 'Review-only scaffold generated from a safe HTML fragment.',
      blocks: [customHtmlBlock('imported-html-fragment', 'Imported HTML Fragment', value, 'marketing-rich')],
      sourceType: inputType,
      context,
    });
    return { candidate, mediaRequirements: [], formMappings: [] };
  }

  if (inputType === 'markdown-sections') {
    const html = markdownToHtml(value);
    const candidate = scaffoldPage({
      route: '/',
      title: 'Review-only imported markdown sections',
      description: 'Review-only scaffold generated from markdown sections.',
      blocks: [customHtmlBlock('imported-markdown-sections', 'Imported Markdown Sections', html, 'marketing-rich')],
      sourceType: inputType,
      context,
    });
    return { candidate, mediaRequirements: [], formMappings: [] };
  }

  if (inputType === 'cf7-package-reference') {
    const formMapping = mapCf7Intent(value, context);
    const candidate = scaffoldPage({
      route: value.route || value.path || '/',
      title: value.title || value.pageTitle || 'Review-only CF7 form intent mapping',
      description: value.description || value.metaDescription || 'CF7-style form intent mapped to Pumpkin default quote request formBlock.',
      blocks: [
        customHtmlBlock('cf7-reference-intro', 'CF7 Reference Intro', '<section class="cms-copy"><h2>Quote request form mapping</h2><p>This page uses Pumpkin default formBlock behavior instead of WordPress Contact Form 7 runtime behavior.</p></section>', 'marketing-rich'),
        formBlock(value.route || value.path || '/', 'default-quote-request'),
      ],
      sourceType: inputType,
      context,
    });
    return { candidate, mediaRequirements: [], formMappings: [formMapping] };
  }

  if (inputType === 'media-manifest') {
    const mediaRequirements = normalizeMediaRequirements(value.mediaRequirements || value.media || value.assets || value.mediaManifest || [], context);
    const candidate = scaffoldPage({
      route: value.route || value.path || '/',
      title: value.title || 'Review-only media manifest scaffold',
      description: value.description || 'Media manifest normalized into MediaAsset requirement objects.',
      blocks: [
        heroBlock('Media manifest scaffold', 'Media entries were normalized into upload or selection requirements without inventing public URLs.'),
      ],
      mediaRequirements,
      sourceType: inputType,
      context,
    });
    candidate.mediaRequirements = mediaRequirements;
    return { candidate, mediaRequirements, formMappings: [] };
  }

  if (inputType === 'partial-page-json' || inputType === 'foreign-builder-json' || inputType === 'unknown-json') {
    const candidate = scaffoldFromLooseJson(value, inputType, context);
    return {
      candidate,
      mediaRequirements: candidate.mediaRequirements || [],
      formMappings: extractFormMappings(candidate),
    };
  }

  context.errors.push(issue('error', 'input.type.unsupported', `Unsupported input type ${inputType}.`, context.inputPath));
  context.blockers.push(`Unsupported input type ${inputType}.`);
  return { candidate: null, mediaRequirements: [], formMappings: [] };
}

function normalizePumpkinPage(source, context) {
  const candidate = deepClone(source);
  candidate.schemaVersion = 'pumpkin-page-intake-normalizer-verified.v1';
  candidate.contentPackageVersion = 'phase8c14b.normalizer-verified.v1';
  candidate.templatePurpose = 'page_intake_normalizer_verified_before_cms_import';
  candidate.tenantId = candidate.tenantId || ICE_TENANT_ID;
  candidate.siteKey = candidate.siteKey || ICE_SITE_KEY;
  candidate.domain = candidate.domain || ICE_DOMAIN;
  candidate.route = normalizeRoute(candidate.route || candidate.path || slugToRoute(candidate.pageSlug || candidate.slug));
  candidate.path = candidate.route;
  candidate.slug = candidate.slug || routeToSlug(candidate.route);
  candidate.pageSlug = candidate.pageSlug || routeToSlug(candidate.route);
  candidate.PageId = candidate.PageId || candidate.id || `${ICE_TENANT_ID}-${candidate.pageSlug || 'page'}-normalizer-verified`;
  candidate.id = candidate.id || candidate.PageId;
  candidate.canonicalUrl = canonicalForRoute(candidate.route);
  candidate.Layout = candidate.Layout || 'default';
  candidate.PageVersion = Number.isFinite(candidate.PageVersion) ? candidate.PageVersion : 1;
  candidate.MetaData = normalizeMetaData(candidate, context);
  candidate.seo = normalizeSeo(candidate, context);
  candidate.workflow = {
    ...(candidate.workflow || {}),
    status: 'normalizer_verified_review_only',
    reviewStatus: 'needs_human_review',
    approvedForPublish: false,
    approvedForImport: false,
    approvedForProduction: false,
    lastEditedBy: 'codex_phase8c14b_page_intake_normalizer',
    lastEditedAt: NOW,
  };
  candidate.staticPublishing = {
    ...(candidate.staticPublishing || {}),
    staticEligible: false,
    needsRebuild: true,
    deploymentStatus: 'review_only_not_imported_not_deployed',
  };
  candidate.reviewMetadata = {
    ...(candidate.reviewMetadata || {}),
    phase: '8C.14B',
    status: 'normalizer_verified_not_cms_import_ready',
    approvedForCmsImport: false,
    approvedForProduction: false,
    sourceInputType: 'pumpkin-page-json',
    notes: [
      'Verified by the reusable page intake normalizer.',
      'Output is validated through the .NET Page/block contract before CMS import can be considered.',
      'RollerRinkRentals.com remains paused.',
    ],
  };
  candidate.ContentData = normalizeContentData(candidate.ContentData, context);
  candidate.searchData = normalizeSearchData(candidate);
  candidate.linking = normalizeLinking(candidate);
  candidate.domainRouting = normalizeDomainRouting(candidate);
  candidate.formConfig = normalizeFormConfig(candidate);
  candidate.mediaRequirements = normalizeMediaRequirements(candidate.mediaRequirements || extractMediaRequirementsFromPage(candidate), context);
  candidate.normalizerMetadata = buildNormalizerMetadata(context.inputPath, context.blockers);
  return candidate;
}

function scaffoldFromLooseJson(value, inputType, context) {
  const route = normalizeRoute(value.route || value.path || value.urlPath || value.slug || '/');
  const title = value.metaTitle || value.seoTitle || value.title || value.pageTitle || 'Review-only page scaffold';
  const description = value.metaDescription || value.description || value.summary || 'Review-only scaffold generated by the Pumpkin page intake normalizer.';
  const blocks = [];

  if (value.hero?.headline || value.headline) {
    blocks.push(heroBlock(value.hero?.headline || value.headline, value.hero?.subheadline || value.subheadline || description));
  }

  if (Array.isArray(value.sections)) {
    value.sections.forEach((section, index) => {
      blocks.push(looseSectionToBlock(section, index, context));
    });
  }

  if (typeof value.html === 'string') {
    blocks.push(customHtmlBlock('loose-json-html', 'Loose JSON HTML', value.html, 'marketing-rich'));
  }

  const hasFormIntent = Boolean(value.cf7 || value.contactForm7 || value.form || value.formShortcode || value.contactForm);
  if (hasFormIntent) {
    blocks.push(formBlock(route, value.formKey || 'default-quote-request'));
  }

  if (blocks.length === 0) {
    blocks.push(customHtmlBlock('scaffold-placeholder', 'Scaffold Placeholder', '<section class="cms-copy"><h2>Review-only scaffold</h2><p>This page needs human content before CMS import.</p></section>', 'marketing-rich'));
    context.warnings.push(issue('warning', 'scaffold.content.placeholder', 'Input did not include usable sections; a review-only placeholder section was added.', context.inputPath));
    context.blockers.push('Human-authored customer-facing content is required before CMS import.');
  }

  const mediaRequirements = normalizeMediaRequirements(value.mediaRequirements || value.media || value.assets || [], context);
  return scaffoldPage({
    route,
    title,
    description,
    blocks,
    mediaRequirements,
    sourceType: inputType,
    context,
  });
}

function scaffoldPage({ route, title, description, blocks, mediaRequirements = [], sourceType, context }) {
  const normalizedRoute = normalizeRoute(route);
  const pageSlug = routeToSlug(normalizedRoute);
  const pageId = `${ICE_TENANT_ID}-${pageSlug}-intake-scaffold`;
  return {
    schemaVersion: 'pumpkin-page-intake-scaffold.v1',
    contentPackageVersion: 'phase8c14b.intake-scaffold.v1',
    templatePurpose: 'page_intake_scaffold_review_only_before_cms_import',
    id: pageId,
    PageId: pageId,
    tenantId: ICE_TENANT_ID,
    siteKey: ICE_SITE_KEY,
    domain: ICE_DOMAIN,
    route: normalizedRoute,
    path: normalizedRoute,
    slug: pageSlug,
    pageSlug,
    canonicalUrl: canonicalForRoute(normalizedRoute),
    PageVersion: 1,
    Layout: 'default',
    reviewMetadata: {
      phase: '8C.14B',
      status: 'scaffolded_not_cms_import_ready',
      sourceInputType: sourceType,
      approvedForCmsImport: false,
      approvedForProduction: false,
      notes: [
        'Generated by the page intake normalizer scaffold fallback.',
        'Unknown business values are blockers, not fake customer-facing content.',
        'RollerRinkRentals.com remains paused.',
      ],
    },
    MetaData: {
      category: 'rentals',
      product: 'portable ice rink',
      keyword: 'portable ice skating rink rentals',
      pageType: normalizedRoute === '/' ? 'home' : 'standard',
      title,
      description,
      createdAt: NOW,
      updatedAt: NOW,
      author: 'codex_phase8c14b_page_intake_normalizer',
      language: 'en-us',
      market: 'us',
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword: 'portable ice skating rink rentals',
      tags: ['page-intake-normalizer', 'review-only'],
      contentSummary: description,
      blockTypes: blocks.map((block) => block.type),
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: {
      isHub: normalizedRoute === '/',
      hubPageSlug: '',
      topicCluster: 'portable-ice-skating-rink-rentals',
      relatedHubs: [],
      spokePriority: 0,
    },
    seo: {
      metaTitle: title,
      metaDescription: description,
      keywords: ['portable ice skating rink rentals'],
      robots: 'noindex, nofollow',
      canonicalUrl: canonicalForRoute(normalizedRoute),
      alternateUrls: [],
      structuredData: [],
      openGraph: {
        'og:title': title,
        'og:description': description,
        'og:type': 'website',
        'og:url': canonicalForRoute(normalizedRoute),
        'og:image': '',
        'og:image:alt': '',
        'og:site_name': 'IceSkatingRinkRentals.com',
        'og:locale': 'en_US',
      },
      twitterCard: {
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': '',
        'twitter:site': '',
        'twitter:creator': '',
      },
    },
    workflow: {
      status: 'needs_human_review',
      reviewStatus: 'needs_human_review',
      approvedForPublish: false,
      approvedBy: '',
      approvedAt: '',
      lastEditedBy: 'codex_phase8c14b_page_intake_normalizer',
      lastEditedAt: NOW,
      approvedForImport: false,
      approvedForProduction: false,
    },
    staticPublishing: {
      staticEligible: false,
      needsRebuild: true,
      lastSnapshotAt: '',
      lastStaticBuildAt: '',
      lastDeployedAt: '',
      contentHash: '',
      lastPublishedContentHash: '',
      deploymentStatus: 'review_only_not_imported_not_deployed',
    },
    template: {
      templateKey: normalizedRoute === '/' ? 'home' : pageSlug,
      templateVersion: '8C.14B-intake-scaffold',
      layoutVariant: 'normalizer-scaffold',
      contentModelVersion: '2026-05',
    },
    linking: normalizeLinking({ route: normalizedRoute, linking: {} }),
    schemaControls: {
      enableWebPageSchema: true,
      enableBreadcrumbSchema: normalizedRoute !== '/',
      enableFAQSchema: true,
      enableServiceSchema: false,
      schemaWarnings: ['Service schema should remain disabled until business identity and service-area wording are approved.'],
    },
    serviceSchema: {
      serviceName: 'Portable Ice Rink Rentals',
      serviceType: 'Event Rental Service',
      serviceCategory: 'Portable rink rental',
      productsOffered: [],
      areasServed: [],
      audience: [],
      eventTypes: [],
      schemaOutputMode: 'disabled_until_review',
      publicSchemaEnabled: false,
      notes: 'Review-only scaffold; final schema requires business-value approval.',
    },
    formConfig: normalizeFormConfig({}),
    domainRouting: normalizeDomainRouting({}),
    pageQuality: {
      status: 'needs_human_review',
      score: null,
      warnings: ['Generated by intake normalizer scaffold fallback.'],
      blockingIssues: ['Human approval, final media, business values, and import preflight are required before CMS import.'],
      lastCheckedAt: NOW,
      uniqueValueReason: '',
      buyerIntent: 'portable ice rink rental planning',
      landingPageType: normalizedRoute === '/' ? 'home' : 'standard',
      launchNotes: 'Review-only normalizer output.',
    },
    isPublished: false,
    publishedAt: null,
    includeInSitemap: false,
    previousSlugs: [],
    redirects: [],
    sitemapPriority: normalizedRoute === '/' ? 1 : 0.7,
    sitemapChangeFrequency: 'weekly',
    mediaRequirements,
    importCandidateStatus: {
      readyForHumanReview: true,
      readyForCmsImport: false,
      readyForProductionIndexing: false,
      blockersBeforeCmsImport: [
        'Final media, business values, human approval, and admin import/export preflight are required.',
      ],
      blockersBeforeProduction: [
        'CMS import, static regeneration, staging validation, and production cutover preparation are not complete.',
      ],
    },
    normalizerMetadata: buildNormalizerMetadata(context.inputPath, context.blockers),
  };
}

function validateCandidate(candidate, context) {
  if (!candidate) return { candidate };
  const blocks = candidate.ContentData?.ContentBlocks || [];

  if (!candidate.tenantId || candidate.tenantId !== ICE_TENANT_ID) {
    context.errors.push(issue('error', 'page.tenantId', 'Normalized Ice page candidates must use tenantId ice-rink-rentals.', context.inputPath));
  }
  if (!candidate.pageSlug) context.errors.push(issue('error', 'page.pageSlug', 'Normalized page candidate requires pageSlug.', context.inputPath));
  if (!candidate.PageId && !candidate.id) context.errors.push(issue('error', 'page.id', 'Normalized page candidate requires PageId/id.', context.inputPath));
  if (!candidate.seo?.canonicalUrl?.startsWith(`https://${ICE_DOMAIN}`)) {
    context.errors.push(issue('error', 'seo.canonicalUrl', `Canonical URL must use https://${ICE_DOMAIN}.`, context.inputPath));
  }

  validateRoutePolicy(candidate, context);
  validateSecretLikeValues(candidate, context);
  validateMediaFields(candidate, context);
  validateNavigation(candidate, context);

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const blockPath = `ContentData.ContentBlocks[${index}]`;
    if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
      context.errors.push(issue('error', 'block.type.unsupported', `Unsupported block type "${block.type}".`, context.inputPath, `${blockPath}.type`));
      continue;
    }

    if (block.type === 'customHtml') {
      const result = validateCustomHtmlContent(block.content || {}, { path: blockPath });
      pushValidationIssues(result, context, context.inputPath);
      if (typeof block.content?.css === 'string' && block.content.css.trim()) {
        pushValidationIssues(validateCss(block.content.css, { path: `${blockPath}.content.css`, sectionId: block.content.id, sectionVariant: block.content.sectionVariant }), context, context.inputPath);
      }
    }

    if (block.type === 'trustedEmbed') {
      pushValidationIssues(validateTrustedEmbedContent(block.content || {}, blockPath), context, context.inputPath);
    }
  }

  const formResult = validatePageFormBlocks(candidate, { path: 'page', isContactPage: candidate.route === '/contact' });
  pushValidationIssues(formResult, context, context.inputPath);

  return { candidate };
}

function validateRoutePolicy(candidate, context) {
  const route = normalizeRoute(candidate.route || candidate.path || slugToRoute(candidate.pageSlug));
  candidate.route = route;
  candidate.path = route;
  candidate.pageSlug = candidate.pageSlug || routeToSlug(route);
  candidate.seo = candidate.seo || {};
  candidate.seo.canonicalUrl = candidate.seo.canonicalUrl || canonicalForRoute(route);

  const approved = new Set(['/', '/contact', '/service-areas']);
  if (route === '/areas-served') {
    context.errors.push(issue('error', 'route.areasServed', '/areas-served is an alias candidate only; use /service-areas as canonical.', context.inputPath));
  }

  const stateCity = /^\/[a-z]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!approved.has(route) && !stateCity.test(route)) {
    context.warnings.push(issue('warning', 'route.unapproved', `Route "${route}" is not in the current Ice launch route list or future /state-city pattern.`, context.inputPath));
  }

  if (candidate.searchData?.state && candidate.searchData?.city && !stateCity.test(route)) {
    context.errors.push(issue('error', 'stateCity.route', 'Future city pages must use /state-city route shape.', context.inputPath));
  }

  if (stateCity.test(route)) {
    const slug = route.slice(1);
    if (candidate.pageSlug !== slug) {
      context.errors.push(issue('error', 'stateCity.pageSlug', `Future city pageSlug must match route slug "${slug}".`, context.inputPath));
    }
  }
}

function validateNavigation(candidate, context) {
  const menu = candidate.navigation?.primary || candidate.menu || null;
  if (!menu) return;
  const result = validateThemeNavigation(menu, {
    path: 'navigation.primary',
    approvedRoutes: ['/', '/service-areas', '/contact'],
    expectedRoutes: ['/', '/service-areas', '/contact'],
  });
  pushValidationIssues(result, context, context.inputPath);
}

function validateSecretLikeValues(candidate, context) {
  const values = collectStringValues(candidate);
  for (const { value, path: valuePath } of values) {
    if (value === ICE_STATIC_ENDPOINT_REF || value === ICE_LEAD_RECIPIENT_REF) continue;
    if (SECRET_VALUE_PATTERN.test(value)) {
      context.errors.push(issue('error', 'secret.likeValue', 'Secret-like value detected in page intake data.', context.inputPath, valuePath));
    }
  }
}

function validateMediaFields(candidate, context) {
  const values = collectStringValues(candidate);
  for (const { value, path: valuePath } of values) {
    if (/^data:image\//i.test(value)) {
      context.errors.push(issue('error', 'media.base64', 'Base64 image data is not allowed in page JSON.', context.inputPath, valuePath));
    }
    if (/^javascript:/i.test(value) || /^file:/i.test(value) || /^blob:/i.test(value)) {
      context.errors.push(issue('error', 'url.unsafe', 'Unsafe URL scheme detected.', context.inputPath, valuePath));
    }
  }

  for (const requirement of candidate.mediaRequirements || []) {
    if (requirement.mediaAssetId && /^https?:\/\//i.test(String(requirement.mediaAssetId))) {
      context.errors.push(issue('error', 'media.mediaAssetId.url', 'mediaAssetId must be an id/reference, not a URL.', context.inputPath));
    }
    if (requirement.publicUrl && !isApprovedMediaUrl(requirement.publicUrl)) {
      context.errors.push(issue('error', 'media.publicUrl.unapproved', 'External media publicUrl is not approved for normalized intake candidates.', context.inputPath));
    }
  }
}

function pushValidationIssues(result, context, file) {
  for (const item of result.errors || []) {
    context.errors.push(issue('error', item.code || 'validation.error', item.message || 'Validation error.', file, item.path));
  }
  for (const item of result.warnings || []) {
    context.warnings.push(issue('warning', item.code || 'validation.warning', item.message || 'Validation warning.', file, item.path));
  }
}

function buildPackage(candidate, candidatePath, mediaRequirements, formMappings, inputPath) {
  return {
    schemaVersion: 'pumpkin-page-intake-normalizer-package.v1',
    phase: '8C.14B',
    packageName: 'Ice Homepage Normalizer Verified Package',
    tenantId: ICE_TENANT_ID,
    siteKey: ICE_SITE_KEY,
    domain: ICE_DOMAIN,
    createdAt: NOW,
    sourceInput: displayPath(inputPath),
    pageFiles: [
      {
        route: candidate.route || '/',
        slug: candidate.pageSlug || 'home',
        file: path.basename(candidatePath),
        readiness: 'normalizer-verified-not-cms-import-ready',
      },
    ],
    pages: [
      {
        route: candidate.route || '/',
        pageSlug: candidate.pageSlug || 'home',
        pageId: candidate.PageId || candidate.id,
        status: 'normalizer-verified-not-cms-import-ready',
      },
    ],
    mediaRequirements: mediaRequirements.length > 0 ? mediaRequirements : candidate.mediaRequirements || [],
    formMappings,
    reviewOnlyVsCmsReady: {
      reviewOnlyJsonCanBeHumanEdited: true,
      importCandidateMustPassDotNetContract: true,
      cmsReadyRequiresAdminImportExportPreflight: true,
      productionBoundRequiresStaticAndStagingValidation: true,
    },
    stateCityGenerationPolicy: stateCityGenerationPolicy(),
    readiness: classifyReadiness({ candidate, errors: [], warnings: [], blockers: candidate.importCandidateStatus?.blockersBeforeCmsImport || [] }),
  };
}

function runDotNetValidation(command, targetPath) {
  const args = ['run', '--project', DOTNET_TOOL_PROJECT, '--', command, '--path', targetPath];
  const result = spawnSync('dotnet', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    windowsHide: true,
  });
  const stdout = (result.stdout || '').trim();
  let parsed = null;
  try {
    parsed = stdout ? JSON.parse(stdout) : null;
  } catch {
    parsed = null;
  }

  return {
    ok: result.status === 0 && parsed?.Ok !== false && parsed?.ok !== false,
    exitCode: result.status,
    command,
    targetPath: displayPath(targetPath),
    readinessDecision: parsed?.ReadinessDecision || parsed?.readinessDecision || '',
    errors: parsed?.Errors || parsed?.errors || [],
    warnings: parsed?.Warnings || parsed?.warnings || [],
    pages: parsed?.Pages || parsed?.pages || [],
    rawError: parsed ? undefined : (result.stderr || stdout).trim(),
  };
}

function normalizeContentData(contentData, context) {
  const blocks = Array.isArray(contentData?.ContentBlocks) ? contentData.ContentBlocks : [];
  if (blocks.length === 0) {
    context.warnings.push(issue('warning', 'content.blocks.empty', 'Page had no content blocks; a scaffold placeholder was inserted.', context.inputPath));
    context.blockers.push('Human content is required before CMS import.');
    return {
      ContentBlocks: [
        customHtmlBlock('empty-content-scaffold', 'Empty Content Scaffold', '<section class="cms-copy"><h2>Review-only scaffold</h2><p>This page needs approved content before CMS import.</p></section>', 'marketing-rich'),
      ],
    };
  }
  return { ContentBlocks: blocks.map((block, index) => normalizeBlock(block, index, context)) };
}

function normalizeBlock(block, index, context) {
  if (!block || typeof block !== 'object') {
    context.errors.push(issue('error', 'block.shape', `Block at index ${index} is not an object.`, context.inputPath));
    return customHtmlBlock(`invalid-block-${index}`, 'Invalid Block Placeholder', '<section class="cms-copy"><h2>Invalid block</h2><p>This block could not be normalized.</p></section>', 'marketing-rich');
  }
  const normalized = deepClone(block);
  if (normalized.type === 'html' || normalized.type === 'richText') {
    return customHtmlBlock(normalized.id || `html-block-${index}`, normalized.label || normalized.title || 'Imported HTML', normalized.html || normalized.content?.html || '', 'marketing-rich');
  }
  if (normalized.type === 'form' || normalized.type === 'contactForm') {
    return formBlock('/', normalized.formKey || 'default-quote-request');
  }
  if (normalized.type === 'customHtml') {
    normalized.content = {
      id: normalized.content?.id || normalized.id || `custom-html-${index}`,
      label: normalized.content?.label || normalized.label || 'Custom HTML',
      html: normalized.content?.html || '',
      container: normalized.content?.container || 'standard',
      allowedProfile: normalized.content?.allowedProfile || 'marketing-rich',
      sectionVariant: normalized.content?.sectionVariant || 'split-feature',
      css: normalized.content?.css || '',
      sanitize: normalized.content?.sanitize !== false,
      review: normalized.content?.review || { status: 'needs_human_review' },
      validation: normalized.content?.validation || { expected: 'normalizer validated' },
    };
  }
  if (normalized.type === 'formBlock') {
    normalized.content = {
      id: normalized.content?.id || normalized.id || 'quote-form',
      label: normalized.content?.label || normalized.label || 'Quote Request Form',
      formKey: normalized.content?.formKey || 'default-quote-request',
      variant: normalized.content?.variant || 'quote-form-panel',
      heading: normalized.content?.heading || 'Request an ice rink rental quote',
      intro: normalized.content?.intro || 'Share a few event details and the team will review your request.',
      submitLabel: normalized.content?.submitLabel || 'Submit Quote Request',
      successMessage: normalized.content?.successMessage || 'Thanks. Your request has been received for review.',
      errorMessage: normalized.content?.errorMessage || 'We could not submit your request right now. Please try again.',
      staticEndpointRef: normalized.content?.staticEndpointRef || ICE_STATIC_ENDPOINT_REF,
      leadRecipientRef: normalized.content?.leadRecipientRef || ICE_LEAD_RECIPIENT_REF,
      sourcePage: normalized.content?.sourcePage || '/',
      review: normalized.content?.review || { status: 'needs_human_review' },
      validation: normalized.content?.validation || { expected: 'visible structured formBlock' },
    };
  }
  return normalized;
}

function looseSectionToBlock(section, index, context) {
  if (!section || typeof section !== 'object') {
    return customHtmlBlock(`loose-section-${index}`, `Loose Section ${index + 1}`, '<section class="cms-copy"><h2>Review-only section</h2><p>This section needs human review.</p></section>', 'marketing-rich');
  }
  if (section.type === 'form' || section.form || section.cf7) {
    return formBlock(section.sourcePage || '/', section.formKey || 'default-quote-request');
  }
  if (section.type === 'trustedEmbed') {
    return { type: 'trustedEmbed', content: section.content || section };
  }
  const title = section.title || section.heading || section.label || `Imported section ${index + 1}`;
  const body = section.html || section.body || section.copy || section.text || '';
  const html = body.includes('<')
    ? body
    : `<section class="cms-copy"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(String(body || 'This section needs human copy review.'))}</p></section>`;
  return customHtmlBlock(section.id || `loose-section-${index + 1}`, title, html, section.allowedProfile || 'marketing-rich');
}

function normalizeMetaData(candidate) {
  const title = candidate.MetaData?.title || candidate.title || candidate.seo?.metaTitle || candidate.metaTitle || 'Review-only page candidate';
  const description = candidate.MetaData?.description || candidate.description || candidate.seo?.metaDescription || candidate.metaDescription || 'Review-only page candidate generated by the Pumpkin page intake normalizer.';
  return {
    ...(candidate.MetaData || {}),
    category: candidate.MetaData?.category || 'rentals',
    product: candidate.MetaData?.product || 'portable ice rink',
    keyword: candidate.MetaData?.keyword || candidate.searchData?.keyword || 'portable ice skating rink rentals',
    pageType: candidate.MetaData?.pageType || (candidate.route === '/' ? 'home' : 'standard'),
    title,
    description,
    createdAt: candidate.MetaData?.createdAt || NOW,
    updatedAt: candidate.MetaData?.updatedAt || NOW,
    author: candidate.MetaData?.author || 'codex_phase8c14b_page_intake_normalizer',
    language: candidate.MetaData?.language || 'en-us',
    market: candidate.MetaData?.market || 'us',
  };
}

function normalizeSeo(candidate) {
  const metaTitle = candidate.seo?.metaTitle || candidate.MetaData?.title || candidate.title || 'Review-only page candidate';
  const metaDescription = candidate.seo?.metaDescription || candidate.MetaData?.description || candidate.description || 'Review-only page candidate generated by the Pumpkin page intake normalizer.';
  const route = normalizeRoute(candidate.route || candidate.path || slugToRoute(candidate.pageSlug || candidate.slug));
  return {
    ...(candidate.seo || {}),
    metaTitle,
    metaDescription,
    keywords: candidate.seo?.keywords || candidate.searchData?.secondaryKeywords || ['portable ice skating rink rentals'],
    robots: candidate.seo?.robots || 'noindex, nofollow',
    canonicalUrl: canonicalForRoute(route),
    alternateUrls: candidate.seo?.alternateUrls || [],
    structuredData: candidate.seo?.structuredData || [],
    openGraph: {
      ...(candidate.seo?.openGraph || {}),
      'og:title': candidate.seo?.openGraph?.['og:title'] || metaTitle,
      'og:description': candidate.seo?.openGraph?.['og:description'] || metaDescription,
      'og:type': candidate.seo?.openGraph?.['og:type'] || 'website',
      'og:url': canonicalForRoute(route),
      'og:image': candidate.seo?.openGraph?.['og:image'] || '',
      'og:image:alt': candidate.seo?.openGraph?.['og:image:alt'] || '',
      'og:site_name': candidate.seo?.openGraph?.['og:site_name'] || 'IceSkatingRinkRentals.com',
      'og:locale': candidate.seo?.openGraph?.['og:locale'] || 'en_US',
    },
    twitterCard: {
      ...(candidate.seo?.twitterCard || {}),
      'twitter:card': candidate.seo?.twitterCard?.['twitter:card'] || 'summary_large_image',
      'twitter:title': candidate.seo?.twitterCard?.['twitter:title'] || metaTitle,
      'twitter:description': candidate.seo?.twitterCard?.['twitter:description'] || metaDescription,
      'twitter:image': candidate.seo?.twitterCard?.['twitter:image'] || '',
      'twitter:site': candidate.seo?.twitterCard?.['twitter:site'] || '',
      'twitter:creator': candidate.seo?.twitterCard?.['twitter:creator'] || '',
    },
  };
}

function normalizeSearchData(candidate) {
  const blocks = candidate.ContentData?.ContentBlocks || [];
  return {
    ...(candidate.searchData || {}),
    state: candidate.searchData?.state || '',
    city: candidate.searchData?.city || '',
    metro: candidate.searchData?.metro || '',
    county: candidate.searchData?.county || '',
    keyword: candidate.searchData?.keyword || candidate.MetaData?.keyword || 'portable ice skating rink rentals',
    tags: candidate.searchData?.tags || ['page-intake-normalizer'],
    contentSummary: candidate.searchData?.contentSummary || candidate.seo?.metaDescription || '',
    blockTypes: blocks.map((block) => block.type),
  };
}

function normalizeLinking(candidate) {
  const route = normalizeRoute(candidate.route || candidate.path || '/');
  const requiredLinks = new Set(candidate.linking?.requiredLinks || []);
  if (route === '/') {
    requiredLinks.add('/contact');
    requiredLinks.add('/service-areas');
  }
  return {
    ...(candidate.linking || {}),
    hubPage: candidate.linking?.hubPage || '',
    parentPage: candidate.linking?.parentPage || '',
    relatedPages: candidate.linking?.relatedPages || Array.from(requiredLinks),
    requiredLinks: Array.from(requiredLinks),
    breadcrumbTrail: candidate.linking?.breadcrumbTrail || [route],
  };
}

function normalizeDomainRouting(candidate) {
  return {
    ...(candidate.domainRouting || {}),
    domain: ICE_DOMAIN,
    brandName: candidate.domainRouting?.brandName || 'IceSkatingRinkRentals.com',
    publicContactEmail: candidate.domainRouting?.publicContactEmail || '',
    quoteRequestEmail: candidate.domainRouting?.quoteRequestEmail || '',
    supportEmail: candidate.domainRouting?.supportEmail || '',
    replyToEmail: candidate.domainRouting?.replyToEmail || '',
    fromName: candidate.domainRouting?.fromName || 'IceSkatingRinkRentals.com',
    fromEmail: candidate.domainRouting?.fromEmail || '',
    contactPageSlug: candidate.domainRouting?.contactPageSlug || 'contact',
    primaryPhone: candidate.domainRouting?.primaryPhone || '',
    mailtoLinksEnabled: Boolean(candidate.domainRouting?.mailtoLinksEnabled),
    defaultLeadRoutingMode: candidate.domainRouting?.defaultLeadRoutingMode || 'manual_review_then_provider_match',
    defaultRecipientGroup: candidate.domainRouting?.defaultRecipientGroup || ICE_LEAD_RECIPIENT_REF,
    staticFormEndpointKey: candidate.domainRouting?.staticFormEndpointKey || ICE_STATIC_ENDPOINT_REF,
    emailProvider: candidate.domainRouting?.emailProvider || 'not_configured_in_template',
    emailProviderStatus: candidate.domainRouting?.emailProviderStatus || 'requires_review',
    notes: candidate.domainRouting?.notes || 'Real recipient/email routing is configured outside page JSON.',
  };
}

function normalizeFormConfig(candidate) {
  return {
    ...(candidate.formConfig || {}),
    formId: candidate.formConfig?.formId || 'ice-default-quote-routing',
    formType: candidate.formConfig?.formType || 'quote_request',
    conversionGoal: candidate.formConfig?.conversionGoal || 'quote_form_submit',
    routingMode: candidate.formConfig?.routingMode || 'manual_review_then_provider_match',
    domainRoutingKey: candidate.formConfig?.domainRoutingKey || ICE_LEAD_RECIPIENT_REF,
    recipientGroup: candidate.formConfig?.recipientGroup || ICE_LEAD_RECIPIENT_REF,
    staticFormEndpointKey: candidate.formConfig?.staticFormEndpointKey || ICE_STATIC_ENDPOINT_REF,
    replyToMode: candidate.formConfig?.replyToMode || 'submitter_email',
    thankYouUrl: candidate.formConfig?.thankYouUrl || '/',
    thankYouMessage: candidate.formConfig?.thankYouMessage || 'Thanks. Your request has been received for review.',
    requiresConsent: candidate.formConfig?.requiresConsent !== false,
    consentRequired: candidate.formConfig?.consentRequired !== false,
    spamProtectionRequired: candidate.formConfig?.spamProtectionRequired !== false,
    spamProtectionEnabled: candidate.formConfig?.spamProtectionEnabled !== false,
    mailtoFallbackEnabled: false,
    normalizedFieldMap: candidate.formConfig?.normalizedFieldMap || {},
  };
}

function normalizeMediaRequirements(entries, context) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry, index) => {
    const source = typeof entry === 'string' ? { sourceFile: entry } : (entry || {});
    const slotId = source.requiredMediaSlotId || source.slotId || source.mediaSlotId || source.id || `media-slot-${index + 1}`;
    const mediaAssetId = source.mediaAssetId || null;
    const publicUrl = source.publicUrl || source.url || null;
    if (publicUrl && !isApprovedMediaUrl(publicUrl)) {
      context.errors.push(issue('error', 'media.publicUrl.unapproved', `Media URL for ${slotId} is not approved.`, context.inputPath));
    }
    if (typeof publicUrl === 'string' && /^data:image\//i.test(publicUrl)) {
      context.errors.push(issue('error', 'media.base64', `Base64 image data for ${slotId} is blocked.`, context.inputPath));
    }
    if (mediaAssetId && /^https?:\/\//i.test(String(mediaAssetId))) {
      context.errors.push(issue('error', 'media.mediaAssetId.url', `mediaAssetId for ${slotId} must not be a URL.`, context.inputPath));
    }
    return {
      tenantId: source.tenantId || ICE_TENANT_ID,
      siteKey: source.siteKey || ICE_SITE_KEY,
      domain: source.domain || ICE_DOMAIN,
      requiredMediaSlotId: slotId,
      intendedUsageType: source.intendedUsageType || source.usageType || 'inline',
      page: source.page || '/',
      sectionId: source.sectionId || slotId,
      sourceFile: source.sourceFile || source.fileName || source.originalFile || '',
      optimizedSourceFile: source.optimizedSourceFile || '',
      recommendedAspectRatio: source.recommendedAspectRatio || '',
      recommendedDimensions: source.recommendedDimensions || '',
      requiredAltText: source.requiredAltText || source.altText || source.alt || '',
      suggestedFilename: source.suggestedFilename || safeFileName(source.sourceFile || source.fileName || slotId),
      requiredBeforeCmsImport: Boolean(source.requiredBeforeCmsImport),
      requiredBeforeStaging: source.requiredBeforeStaging !== false,
      requiredBeforeProduction: source.requiredBeforeProduction !== false,
      notes: source.notes || 'Normalize/upload through the MediaAsset pipeline before CMS-ready status.',
      mediaAssetId,
      publicUrl: publicUrl && isApprovedMediaUrl(publicUrl) ? publicUrl : null,
      status: mediaAssetId ? 'needs-selection-verification' : (source.status || 'needs-upload'),
      uploadStatus: source.uploadStatus || 'not_uploaded_to_cms',
      blocker: Boolean(source.blocker || source.requiredBeforeCmsImport || !mediaAssetId),
      sourcePolicy: source.sourcePolicy || 'review source only; not a public URL and not a committed MediaAsset',
      sourceMetadata: source.sourceMetadata || null,
      optimizedMetadata: source.optimizedMetadata || null,
    };
  });
}

function extractMediaRequirementsFromPage(page) {
  const requirements = [];
  const media = page.media || {};
  for (const [key, value] of Object.entries(media)) {
    if (!value || typeof value !== 'object') continue;
    const slotId = value.requiredMediaSlotId || value.mediaRequirementRef || `${key}-media`;
    requirements.push({
      ...value,
      requiredMediaSlotId: slotId,
      intendedUsageType: value.usageType || key,
      page: page.route || '/',
      sectionId: slotId,
      requiredAltText: value.alt || value.title || '',
    });
  }
  return requirements;
}

function mapCf7Intent(source) {
  const rawFields = source.fields || source.cf7?.fields || source.contactForm7?.fields || [];
  const mappedFields = Array.isArray(rawFields)
    ? rawFields.map((field) => ({
        sourceField: typeof field === 'string' ? field : field.name || field.label || 'unknown',
        pumpkinField: mapFormFieldName(typeof field === 'string' ? field : field.name || field.label || ''),
      }))
    : [];
  return {
    source: 'cf7-reference',
    runtimeDependencyPreserved: false,
    pumpkinFormKey: 'default-quote-request',
    formBlock: {
      formKey: 'default-quote-request',
      variant: 'quote-form-panel',
      staticEndpointRef: ICE_STATIC_ENDPOINT_REF,
      leadRecipientRef: ICE_LEAD_RECIPIENT_REF,
    },
    mappedFields,
    discardedWordPressOnlyFields: ['shortcode', 'mailTemplate', 'autoresponderRuntime', 'wordpressHooks'],
  };
}

function extractFormMappings(candidate) {
  const blocks = candidate?.ContentData?.ContentBlocks || [];
  return blocks
    .filter((block) => block.type === 'formBlock')
    .map((block) => ({
      source: 'pumpkin-formBlock',
      pumpkinFormKey: block.content?.formKey || '',
      variant: block.content?.variant || '',
      staticEndpointRef: block.content?.staticEndpointRef || '',
      leadRecipientRef: block.content?.leadRecipientRef || '',
      sourcePage: block.content?.sourcePage || candidate.route || '/',
    }));
}

function formBlock(sourcePage, formKey) {
  return {
    type: 'formBlock',
    content: {
      id: sourcePage === '/' ? 'homepage-quote-form' : 'contact-quote-form',
      label: 'Quote request form',
      formKey,
      variant: 'quote-form-panel',
      heading: 'Request an ice rink rental quote',
      intro: 'Share your event location, timing, audience, and setup goals so the request can be reviewed.',
      submitLabel: 'Submit Quote Request',
      successMessage: 'Thanks. Your ice rink rental request has been received for review.',
      errorMessage: 'We could not submit your request right now. Please try again.',
      staticEndpointRef: ICE_STATIC_ENDPOINT_REF,
      leadRecipientRef: ICE_LEAD_RECIPIENT_REF,
      sourcePage,
      review: { status: 'needs_human_review' },
      validation: { expected: 'visible structured formBlock' },
    },
  };
}

function customHtmlBlock(id, label, html, profile) {
  return {
    type: 'customHtml',
    content: {
      id,
      label,
      html,
      container: 'standard',
      allowedProfile: profile,
      sectionVariant: 'split-feature',
      css: '',
      sanitize: true,
      review: { status: 'needs_human_review' },
      validation: { expected: 'normalizer validated customHtml' },
    },
  };
}

function heroBlock(headline, subheadline) {
  return {
    type: 'Hero',
    content: {
      type: 'Main',
      headline,
      subheadline,
      backgroundImage: '',
      backgroundImageAltText: '',
      mainImage: '',
      mainImageAltText: '',
      buttonText: 'Request a Quote',
      buttonLink: '/contact',
      secondaryButtonText: 'View Service Areas',
      secondaryButtonLink: '/service-areas',
    },
  };
}

function findPageInPackage(value) {
  if (Array.isArray(value.pages)) {
    const inline = value.pages.find((page) => isPumpkinPage(page) || page?.ContentData?.ContentBlocks);
    if (inline) return inline;
  }
  if (value.page && typeof value.page === 'object') return value.page;
  return null;
}

function buildNormalizerMetadata(inputPath, blockers) {
  return {
    phase: '8C.14B',
    tool: 'tools/page-intake-normalizer/normalize-page-intake.mjs',
    input: displayPath(inputPath),
    outputPolicy: 'Generated or validated through .NET Page/block classes before CMS import consideration.',
    rollerStatus: 'paused',
    stateCityGenerationPolicy: stateCityGenerationPolicy(),
    blockers: Array.from(new Set(blockers)),
  };
}

function stateCityGenerationPolicy() {
  return {
    routePattern: '/state-city',
    examples: ['/fl-orlando', '/ny-new-york', '/pa-philadelphia'],
    lowercase: true,
    hyphenSeparated: true,
    stateFirstCitySecond: true,
    requiresDotNetPageClasses: true,
    requiresNormalizer: true,
    requiresDesignMediaFormTailwindNavigationStaticValidation: true,
    createdCityPageInThisPhase: false,
    notes: 'Future city/location pages must not be generated from loose JSON or TypeScript-only objects.',
  };
}

function classifyReadiness({ candidate, errors, blockers }) {
  const blocking = Array.from(new Set([
    ...(blockers || []),
    ...(candidate?.importCandidateStatus?.blockersBeforeCmsImport || []),
  ]));
  const shapeOk = errors.length === 0;
  return {
    readyForHumanReview: shapeOk,
    readyForCmsImport: false,
    readyForLocalCmsDraftImport: shapeOk && blocking.length === 0 ? 'possible_with_user_authorization' : false,
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
    cmsImportReason: shapeOk
      ? 'Still requires media/business values, human approval, and admin import/export preflight before CMS import.'
      : 'Shape or safety blockers remain.',
    blockersBeforeCmsImport: blocking.length > 0 ? blocking : [
      'Final media, business values, human approval, and admin import/export preflight are required.',
    ],
  };
}

function buildOutputReadme(normalization, secondary) {
  return `# Ice Homepage Page Intake Normalizer Output

This folder contains the Phase 8C.14B normalizer verification output for IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused.

## Inputs

- Primary: ${normalization.inputPath}
- Secondary: ${secondary?.inputPath || 'not provided'}

## Outputs

- proposed-homepage.normalizer-verified.json
- homepage-normalizer-verified-package.json
- NORMALIZER_RUN_REPORT.md
- HOMEPAGE_NORMALIZATION_RESULT.md
- manifest.json

## Decision

- Ready for human review: ${normalization.readiness.readyForHumanReview ? 'yes' : 'no'}
- Ready for CMS import: no
- Ready for local CMS draft import: ${normalization.readiness.readyForLocalCmsDraftImport}
- Ready for static regeneration: no
- Ready for production/indexing: no

The homepage remains blocked from CMS import until MediaAsset IDs, business values, human approval, and admin import/export preflight are resolved.
`;
}

function buildRunReport(normalization, secondary) {
  return `# Normalizer Run Report

## Summary

- Phase: 8C.14B
- Primary input type: ${normalization.inputType}
- Primary .NET contract valid: ${normalization.dotNetValidation?.ok ? 'yes' : 'no'}
- Primary .NET package valid: ${normalization.dotNetValidation?.packageOk ? 'yes' : 'no'}
- Secondary input type: ${secondary?.inputType || 'not provided'}
- Secondary .NET contract valid: ${secondary ? (secondary.dotNetValidation?.ok ? 'yes' : 'no') : 'not run'}

## Errors

${formatIssueList(normalization.errors)}

## Warnings

${formatIssueList(normalization.warnings)}

## Blockers

${formatStringList(normalization.blockers)}

## Rule

All import-candidate or production-bound page JSON must be generated from or validated through the .NET Page/block classes before CMS import consideration.
`;
}

function buildHomepageResult(normalization, secondary) {
  return `# Homepage Normalization Result

## Result

- Candidate file: ${normalization.outputCandidatePath}
- Package file: ${normalization.outputPackagePath}
- Input type: ${normalization.inputType}
- .NET deserialization/round-trip gate: ${normalization.dotNetValidation?.ok ? 'passed' : 'blocked'}
- .NET package gate: ${normalization.dotNetValidation?.packageOk ? 'passed' : 'blocked'}

## Readiness

- Ready for human review: ${normalization.readiness.readyForHumanReview ? 'yes' : 'no'}
- Ready for CMS import: no
- Ready for local CMS draft import: ${normalization.readiness.readyForLocalCmsDraftImport}
- Ready for static regeneration: no
- Ready for production/indexing: no

## Secondary Candidate Check

${secondary ? `The Phase 8C.15 media-bound candidate was also normalized/validated as ${secondary.inputType}. .NET valid: ${secondary.dotNetValidation?.ok ? 'yes' : 'no'}.` : 'No secondary candidate was provided.'}

## Remaining CMS Import Blockers

${formatStringList(normalization.readiness.blockersBeforeCmsImport)}
`;
}

function formatIssueList(items) {
  if (!items || items.length === 0) return '- none';
  return items.map((item) => `- ${item.code}: ${item.message}${item.path ? ` (${item.path})` : ''}`).join('\n');
}

function formatStringList(items) {
  if (!items || items.length === 0) return '- none';
  return items.map((item) => `- ${item}`).join('\n');
}

function looksLikeHtml(value) {
  return /^<[^>]+>/.test(value) || /<\s*(section|div|article|h2|p|ul|ol|form|script)\b/i.test(value);
}

function looksLikeMarkdown(value) {
  return /^#{1,4}\s+/m.test(value) || /^-\s+/m.test(value);
}

function markdownToHtml(value) {
  const lines = value.split(/\r?\n/);
  const html = [];
  let inList = false;
  for (const line of lines) {
    if (/^#{1,4}\s+/.test(line)) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      const level = Math.min(4, line.match(/^#+/)[0].length);
      html.push(`<h${level}>${escapeHtml(line.replace(/^#{1,4}\s+/, '').trim())}</h${level}>`);
    } else if (/^-\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.replace(/^-\s+/, '').trim())}</li>`);
    } else if (line.trim()) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<p>${escapeHtml(line.trim())}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return `<section class="cms-copy">${html.join('')}</section>`;
}

function normalizeRoute(route) {
  let value = String(route || '/').trim();
  if (!value) value = '/';
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/+/g, '/');
  if (value.length > 1) value = value.replace(/\/$/, '');
  return value.toLowerCase();
}

function routeToSlug(route) {
  const normalized = normalizeRoute(route);
  return normalized === '/' ? 'home' : normalized.slice(1).replaceAll('/', '-');
}

function slugToRoute(slug) {
  const value = String(slug || '').trim();
  if (!value || value === 'home') return '/';
  return `/${value.replace(/^\/+/, '')}`;
}

function canonicalForRoute(route) {
  const normalized = normalizeRoute(route);
  return normalized === '/' ? `https://${ICE_DOMAIN}/` : `https://${ICE_DOMAIN}${normalized}`;
}

function safeFileName(value) {
  const base = path.basename(String(value || 'media-asset')).replace(/\.[^.]+$/, '');
  const slug = slugify(base);
  return `${slug || 'media-asset'}`;
}

function mapFormFieldName(value) {
  const normalized = String(value).toLowerCase();
  if (normalized.includes('email')) return 'email';
  if (normalized.includes('phone') || normalized.includes('tel')) return 'phone';
  if (normalized.includes('name')) return 'fullName';
  if (normalized.includes('city')) return 'eventCity';
  if (normalized.includes('state')) return 'eventState';
  if (normalized.includes('date')) return 'eventDateOrDateRange';
  if (normalized.includes('message')) return 'message';
  return slugify(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function isApprovedMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (/^https:\/\/iceskatingrinkrentals\.com\//i.test(url)) return true;
  return false;
}

function collectStringValues(value, prefix = '$', output = []) {
  if (typeof value === 'string') {
    output.push({ value, path: prefix });
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStringValues(item, `${prefix}[${index}]`, output));
    return output;
  }
  for (const [key, item] of Object.entries(value)) {
    collectStringValues(item, `${prefix}.${key}`, output);
  }
  return output;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function displayPath(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

function issue(severity, code, message, file, issuePath = null) {
  return {
    severity,
    code,
    message,
    file: file ? displayPath(path.resolve(file)) : undefined,
    path: issuePath || undefined,
  };
}

main();
