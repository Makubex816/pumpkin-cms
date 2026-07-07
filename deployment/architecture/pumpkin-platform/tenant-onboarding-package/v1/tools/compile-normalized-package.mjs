#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

const MODULES = [
  'tenant',
  'users',
  'pages',
  'media',
  'theme',
  'forms',
  'contact',
  'importExport',
  'publish',
  'monitoring',
  'validation',
  'responsive',
];

const RESPONSIVE_VIEWPORTS = [
  { label: 'small-mobile', width: 360, height: 800 },
  { label: 'iphone-standard', width: 375, height: 812 },
  { label: 'modern-mobile', width: 390, height: 844 },
  { label: 'large-mobile', width: 414, height: 896 },
  { label: 'large-modern-mobile', width: 430, height: 932 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 1200 },
];

const REQUIRED_BASELINE_ROUTES = ['/', '/contact', '/service-areas'];
const REQUIRED_AIRSTRIP_RESPONSIVE_ROUTES = [
  '/',
  '/contact',
  '/service-areas',
  '/request-booking',
  '/packages',
  '/airstrip-the-club',
  '/reserve',
];
const COMPILED_AIRSTRIP_ROUTES = new Set(['/', '/request-booking', '/packages', '/airstrip-the-club']);
const LEGAL_ROUTE_HINTS = new Set(['/privacy-policy', '/sms-terms-conditions']);

function parseArgs(argv) {
  const args = {
    analysis: '',
    out: '',
    tenantId: '',
    tenantName: '',
    domain: '',
    wwwDomain: '',
    sourceZip: '',
    acceptedPackage: '',
    mediaPublicBase: '',
    mediaContainer: '',
    productionDefaultHost: '',
    renderingMode: '',
    expectedFormType: '',
    overlays: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    const value = argv[index + 1];
    if (name === '--analysis') {
      args.analysis = value || '';
      index += 1;
    } else if (name === '--out') {
      args.out = value || '';
      index += 1;
    } else if (name === '--tenant-id') {
      args.tenantId = value || '';
      index += 1;
    } else if (name === '--tenant-name') {
      args.tenantName = value || '';
      index += 1;
    } else if (name === '--domain') {
      args.domain = value || '';
      index += 1;
    } else if (name === '--www-domain') {
      args.wwwDomain = value || '';
      index += 1;
    } else if (name === '--source-zip') {
      args.sourceZip = value || '';
      index += 1;
    } else if (name === '--accepted-package') {
      args.acceptedPackage = value || '';
      index += 1;
    } else if (name === '--media-public-base') {
      args.mediaPublicBase = value || '';
      index += 1;
    } else if (name === '--media-container') {
      args.mediaContainer = value || '';
      index += 1;
    } else if (name === '--production-default-host') {
      args.productionDefaultHost = value || '';
      index += 1;
    } else if (name === '--rendering-mode') {
      args.renderingMode = value || '';
      index += 1;
    } else if (name === '--expected-form-type') {
      args.expectedFormType = value || '';
      index += 1;
    } else if (name === '--overlay') {
      args.overlays.push(value || '');
      index += 1;
    } else if (name === '--help') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${name}`);
    }
  }

  for (const required of ['analysis', 'out', 'tenantId', 'tenantName', 'domain', 'wwwDomain']) {
    if (!args[required]) {
      throw new Error(`Missing --${toKebab(required)} option.`);
    }
  }
  return args;
}

function printUsage() {
  console.log('Usage: node compile-normalized-package.mjs --analysis <analysisDir> --out <outputDir> --tenant-id <tenantId> --tenant-name <tenantName> --domain <domain> --www-domain <wwwDomain> [--source-zip <zip>] [--accepted-package <dir>] [--media-public-base <url>] [--overlay <dir>] [--rendering-mode <mode>]');
}

function toKebab(value) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function hostUrl(host) {
  if (!host) return '';
  return /^https?:\/\//i.test(host) ? host : `https://${host}`;
}

function sanitizeId(value) {
  return String(value || 'item')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function routeToPageSlug(route) {
  if (route === '/') return 'home';
  return sanitizeId(route.replace(/^\//, '').replace(/\//g, '-'));
}

function routeToFileName(route) {
  return `${routeToPageSlug(route)}.json`;
}

function titleFromSlug(slug) {
  if (slug === 'home') return 'Home';
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function readJson(filePath) {
  return JSON.parse((await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, ''));
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  return readJson(filePath);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

async function loadAnalysis(analysisDir) {
  const required = [
    'intake-analysis.json',
    'source-map.json',
    'framework-detection.json',
    'route-candidates.json',
    'media-candidates.json',
    'form-candidates.json',
    'theme-brand-candidates.json',
    'protected-config-findings.json',
    'rendering-mode-classification.json',
  ];

  if (!existsSync(analysisDir)) {
    throw new Error(`Analysis directory does not exist: ${analysisDir}`);
  }

  const analysis = {};
  for (const file of required) {
    const filePath = path.join(analysisDir, file);
    if (!existsSync(filePath)) {
      throw new Error(`Analysis file missing: ${file}`);
    }
    analysis[file.replace(/\.json$/, '')] = await readJson(filePath);
  }
  return analysis;
}

function getRouteCandidates(analysis) {
  const routes = analysis['route-candidates']?.candidates || [];
  return routes.map((route) => ({
    route: route.route,
    sourcePath: route.sourcePath,
    sourceType: route.sourceType,
    dynamic: route.dynamic === true,
    priority: route.priority || 'secondary',
  }));
}

function buildRouteClassification(routeCandidates) {
  const discovered = routeCandidates.map((route) => {
    let classification = 'runtime_route';
    let reason = 'Preserved as a hybrid Next.js runtime route until a later compiler can safely lower it into CMS page content.';
    let pageOutput = '';

    if (route.dynamic) {
      classification = 'dynamic_route';
      reason = 'Dynamic or catch-all route must remain runtime-handled or receive explicit owner mapping.';
    } else if (LEGAL_ROUTE_HINTS.has(route.route) || route.priority === 'legal') {
      classification = 'legal_static_route';
      reason = 'Legal/static route can be represented as a static page candidate, with owner review before launch.';
      pageOutput = `pages/${routeToFileName(route.route)}`;
    } else if (COMPILED_AIRSTRIP_ROUTES.has(route.route)) {
      classification = 'compiled_page';
      reason = 'Critical Airstrip route selected for normalized page candidate generation.';
      pageOutput = `pages/${routeToFileName(route.route)}`;
    }

    return {
      path: route.route,
      sourcePath: route.sourcePath,
      sourceType: route.sourceType,
      dynamic: route.dynamic,
      priority: route.priority,
      classification,
      pageOutput,
      reason,
    };
  });

  const discoveredPaths = new Set(discovered.map((route) => route.path));
  const synthesized = REQUIRED_BASELINE_ROUTES
    .filter((route) => !discoveredPaths.has(route))
    .map((route) => ({
      path: route,
      sourcePath: 'compiler-required-baseline',
      sourceType: 'normalized_package_baseline',
      dynamic: false,
      priority: route === '/' ? 'critical_home' : 'baseline',
      classification: route === '/' ? 'compiled_page' : 'owner_review_required',
      pageOutput: `pages/${routeToFileName(route)}`,
      reason: 'Required by the V1 full-template validator; source package did not expose this exact route in analyzer output.',
      synthesized: true,
    }));

  return [...discovered, ...synthesized].sort((a, b) => a.path.localeCompare(b.path));
}

function getExpectedRoutes(routeClassifications, domain) {
  return routeClassifications
    .filter((route) => route.classification !== 'dynamic_route')
    .map((route) => ({
      path: route.path,
      method: 'GET',
      expectedStatus: 200,
      source: route.synthesized ? 'compiler-required-baseline' : 'v2-8-61c-intake-analysis',
      classification: route.classification,
      targetDomain: domain,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function getResponsiveRoutes(routeClassifications, expectedRoutes) {
  const expectedSet = new Set(expectedRoutes.map((route) => route.path));
  const required = new Set(REQUIRED_AIRSTRIP_RESPONSIVE_ROUTES.filter((route) => expectedSet.has(route)));
  for (const route of routeClassifications) {
    if (route.priority?.startsWith('critical') && expectedSet.has(route.path)) required.add(route.path);
    if (route.classification === 'legal_static_route' && expectedSet.has(route.path)) required.add(route.path);
  }
  return [...required].sort((a, b) => a.localeCompare(b)).map((route) => ({
    path: route,
    purpose: route === '/'
      ? 'homepage and brand proof'
      : 'mobile responsive proof before preview, deploy, domain cutover, or POST proof',
    critical: REQUIRED_AIRSTRIP_RESPONSIVE_ROUTES.includes(route) || route === '/',
    source: 'validation/expected-routes.json',
    rawZipMobileRisk: true,
    requiredOverlays: [
      'deployment/airstrip/patches/v2-8-60r-mobile-responsive/',
      'deployment/airstrip/patches/v2-8-60x-club-info-responsive/',
    ],
  }));
}

function buildMediaManifest(analysis, args) {
  const candidates = analysis['media-candidates']?.candidates || analysis['source-map']?.mediaManifestCandidates || [];
  const assets = candidates.map((candidate) => {
    const fileName = path.posix.basename(candidate.path);
    const id = sanitizeId(fileName);
    const kind = candidate.likelyLogo || /logo/i.test(fileName) ? 'logo' : 'image';
    const asset = {
      id,
      kind,
      title: titleFromSlug(id),
      fileRef: fileName,
      sourceRef: candidate.path,
      originalFileName: fileName,
      extension: candidate.extension || path.posix.extname(fileName).replace(/^\./, ''),
      bytes: candidate.bytes || 0,
      proposedTargetPath: `media/${args.tenantId}/${fileName}`,
      uploadApproved: false,
      binaryCopied: false,
    };
    if (args.mediaPublicBase) {
      asset.publicUrlCandidate = `${args.mediaPublicBase.replace(/\/+$/, '')}/${fileName}`;
    }
    return asset;
  });

  return {
    tenantId: args.tenantId,
    generatedBy: 'V2.8.61D package compiler',
    source: 'v2-8-61c-intake-analysis',
    mediaContainer: args.mediaContainer || `${args.tenantId}-media`,
    mediaPublicBase: args.mediaPublicBase || '',
    expectedMediaCount: assets.length,
    binaryMediaCopied: false,
    uploadApproved: false,
    assets,
    notes: [
      'Public source references only; no media upload occurred.',
      'Future media upload and binding require a separate approval.',
    ],
  };
}

function buildBrand(analysis, args, mediaManifest) {
  const theme = analysis['theme-brand-candidates'];
  const logoCandidates = mediaManifest.assets
    .filter((asset) => asset.kind === 'logo')
    .map((asset) => ({
      id: asset.id,
      sourceRef: asset.sourceRef,
      role: asset.id.includes('wordmark') ? 'wordmark' : 'primary',
    }));

  return {
    tenantId: args.tenantId,
    brandName: args.tenantName,
    tagline: 'Premium VIP Experience',
    sourceBrandHints: theme?.candidates?.brandStrings || [],
    targetBrandReviewRequired: true,
    logoAssets: logoCandidates,
    colors: {
      background: '#050505',
      surface: '#111111',
      text: '#ffffff',
      accent: '#ff2a7f',
      accentAlt: '#d4af37',
    },
    notes: [
      'Dark and pink Airstrip direction preserved from analyzer theme hints.',
      'Final brand copy and logo usage require owner review.',
    ],
  };
}

function buildTheme(analysis, args) {
  const theme = analysis['theme-brand-candidates'];
  return {
    tenantId: args.tenantId,
    themeId: 'airstrip-dark-pink-v1',
    themeName: 'Airstrip Dark Pink VIP',
    sourceThemeFiles: theme?.candidates?.configFiles || [],
    renderingDecision: args.renderingMode || 'hybrid_next_server_required',
    palette: {
      base: '#050505',
      panel: '#111111',
      ink: '#ffffff',
      muted: '#a1a1a1',
      pink: '#ff2a7f',
      softPink: '#ef5392',
      gold: '#d4af37',
    },
    typography: {
      heading: 'display stack owner-review candidate',
      body: 'sans-serif stack owner-review candidate',
    },
    ownerReviewRequired: true,
  };
}

function buildPage(route, args) {
  const pageSlug = routeToPageSlug(route.path);
  return {
    tenantId: args.tenantId,
    pageSlug,
    path: route.path,
    title: pageSlug === 'home' ? args.tenantName : titleFromSlug(pageSlug),
    status: 'draft-compiled-candidate',
    sourceRoute: route.sourcePath,
    pageType: route.classification,
    routeClassification: route.classification,
    contentBlocks: [
      {
        type: pageSlug === 'home' ? 'hero' : 'source-route-placeholder',
        source: route.synthesized ? 'compiler-required-baseline' : 'v2-8-61c-intake-analysis',
        reviewRequired: true,
      },
      {
        type: 'body',
        source: route.synthesized ? 'compiler-required-baseline' : 'v2-8-61c-intake-analysis',
        reviewRequired: true,
      },
    ],
    notes: [
      'Generated as a candidate from source-map analysis without executing source package code.',
      'Owner content review is required before import or publication.',
    ],
  };
}

function pageRoutes(routeClassifications) {
  return routeClassifications.filter((route) => (
    route.pageOutput
    && ['compiled_page', 'legal_static_route', 'owner_review_required'].includes(route.classification)
  ));
}

function buildFormDefinition(analysis, args) {
  const primary = analysis['form-candidates']?.primaryCandidates?.[0]
    || analysis['source-map']?.formDefinitionCandidates?.[0]
    || {};
  const formId = args.expectedFormType || primary.candidateFormDefinitionId || 'default-quote-request';

  return {
    tenantId: args.tenantId,
    formId,
    formSlug: formId,
    formKey: formId,
    displayName: 'Airstrip Reservation Request',
    sourceRoute: primary.path || primary.sourcePath || 'apps/airstrip-frontend/src/app/request-booking/page.tsx',
    sourceSignals: primary.signals || [],
    targetSubmitPathProposed: `/api/forms/${args.tenantId}/submit/${formId}`,
    status: 'draft-compiled-candidate',
    formType: 'reservation-request',
    fields: [
      { id: 'package', name: 'package', label: 'Package', type: 'select', required: true, options: [
        'Oneway Runway',
        'Couples Duo',
        'One Hour Departure',
        'Champagne Takeoff',
        'Preflight Bottle',
        'Full Throttle Service',
        'Skyline Booth and Bottle Service',
        'Couples First Class Cabin',
      ] },
      { id: 'date', name: 'date', label: 'Preferred Date', type: 'date', required: true },
      { id: 'time', name: 'time', label: 'Preferred Time', type: 'text', required: true },
      { id: 'guests', name: 'guests', label: 'Guests', type: 'number', required: true, min: 1 },
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true },
      { id: 'phone', name: 'phone', label: 'Phone', type: 'tel', required: true },
      { id: 'email', name: 'email', label: 'Email', type: 'email', required: false },
      { id: 'pickup', name: 'pickup', label: 'Pickup Location', type: 'text', required: false },
      { id: 'requests', name: 'requests', label: 'Special Requests', type: 'textarea', required: false },
    ],
    workflow: {
      paymentTakenOnline: false,
      ownerReviewRequired: true,
      submissionTestingApproved: false,
    },
    notes: [
      'Generated from analyzer form signals; no form was submitted.',
      'Owner must review routing and final field wording before live use.',
    ],
  };
}

function buildTenantPackage(args, pageFiles) {
  return {
    schemaVersion: '1.0.0',
    packageMode: 'full-template',
    tenantId: args.tenantId,
    displayName: args.tenantName,
    generatedBy: 'V2.8.61D package compiler',
    modules: MODULES,
    files: {
      tenantProfile: 'tenant-profile.json',
      domains: 'domains.json',
      brand: 'brand.json',
      theme: 'theme.json',
      users: 'users/admin-users.json',
      mediaManifest: 'media/manifest.json',
      mediaManifestV2: 'media/media-manifest.json',
      publish: 'publish/static-site.json',
      contact: 'contact/static-contact.json',
      monitoring: 'monitoring/no-live-mutation.json',
      importExport: 'import-export/source-package-map.json',
      validation: 'validation/expected-routes.json',
      routes: 'validation/routes.json',
      responsive: 'validation/responsive-routes.json',
      conversion: {
        sourceMap: 'conversion/source-map.json',
        frameworkDetection: 'conversion/framework-detection.json',
        renderingMode: 'conversion/rendering-mode.json',
        routeClassification: 'conversion/route-classification.json',
        gapReport: 'conversion/gap-report.json',
      },
      pages: pageFiles,
      forms: [
        'forms/default-quote-request.json',
        'form-definitions/airstrip-reservation.json',
      ],
    },
    sourcePackage: {
      originalArchiveName: args.sourceZip ? path.basename(args.sourceZip) : '',
      originalPackagePreserved: true,
      packageCodeExecuted: false,
    },
    target: {
      primaryDomain: args.domain,
      wwwDomain: args.wwwDomain,
      proposedTenantId: args.tenantId,
      productionDefaultHost: args.productionDefaultHost || '',
      liveMutationApproved: false,
    },
    secureHandoffRequired: true,
    responsiveReadinessRequired: true,
    readiness: {
      normalizedPackageGenerated: true,
      validatorExpected: 'pass_after_generation',
      creationApproved: false,
      deployApproved: false,
      dnsApproved: false,
      indexingApproved: false,
      mediaUploadApproved: false,
      responsiveProofRequiredBeforeCutover: true,
    },
    knownGaps: [
      'Hybrid Next.js runtime proof remains required before isolated preview or production deployment.',
      'Owner must provide secure admin credential handoff in a separate approved channel.',
      'Owner must review protected configuration filenames; contents were not read.',
      'Media upload and binding require a later approved phase.',
    ],
  };
}

function buildTenantProfile(args) {
  return {
    tenantId: args.tenantId,
    displayName: args.tenantName,
    status: 'draft-compiled-package-only',
    proposedTenantSlug: args.tenantId,
    targetDomain: args.domain,
    industry: 'nightlife',
    locale: 'en-US',
    timezone: 'America/Los_Angeles',
    ageRestricted: true,
    ownerApprovalRequired: true,
    notes: [
      'Compiled from analyzer source-map output without executing uploaded package code.',
      'No live tenant creation, deploy, DNS, indexing, form submission, contact POST, or media upload occurred.',
    ],
  };
}

function buildDomains(args) {
  return {
    tenantId: args.tenantId,
    primaryHost: hostUrl(args.domain),
    canonicalHost: hostUrl(args.domain),
    productionDefaultHost: args.productionDefaultHost || '',
    hosts: [
      { host: args.domain, role: 'primary', dnsApproved: false, indexingApproved: false },
      { host: args.wwwDomain, role: 'www-alias', dnsApproved: false, indexingApproved: false },
    ],
    domainHardLock: args.domain,
    mutationStatus: 'not-approved',
  };
}

function buildUsers(args) {
  return {
    tenantId: args.tenantId,
    users: [
      {
        email: `owner-provided-admin@${args.domain}`,
        role: 'TenantAdmin',
        passwordSource: 'secure-handoff',
        notes: 'Credential value is not included in this public package.',
      },
    ],
  };
}

function buildContact(args, form) {
  return {
    tenantId: args.tenantId,
    status: 'draft-handoff-required',
    forms: [
      {
        formId: form.formId,
        formSlug: form.formSlug,
        route: '/request-booking',
        testingApproved: false,
      },
    ],
    secureHandoffRequired: true,
    liveSubmissionApproved: false,
    notes: [
      'No contact POST or form submission occurred.',
      'Provider/static contact settings require a later secure handoff if this tenant is activated.',
    ],
  };
}

function buildPublish(args) {
  return {
    tenantId: args.tenantId,
    targetDomain: args.domain,
    renderingMode: args.renderingMode || 'hybrid_next_server_required',
    staticExportFeasibleAsIs: false,
    hybridRuntimeRequired: true,
    requiredOverlays: args.overlays,
    deployApproved: false,
    dnsApproved: false,
    indexingApproved: false,
    reason: 'Analyzer detected Next.js App Router source with a dynamic/catch-all route candidate.',
  };
}

function buildMonitoring(args) {
  return {
    tenantId: args.tenantId,
    noLiveMutation: true,
    noDeploy: true,
    noContactPost: true,
    noFormSubmission: true,
    noMediaUpload: true,
    runtimeProofRequiredBeforeLaunch: true,
  };
}

function buildSourcePackageMap(args, analysis, routeClassifications, mediaManifest, form) {
  return {
    tenantId: args.tenantId,
    sourceZip: args.sourceZip || '',
    intakeAnalysisDir: args.analysis,
    sourceZipName: analysis['intake-analysis']?.source?.zipName || analysis['source-map']?.sourceZipName || '',
    sourceZipSha256: analysis['intake-analysis']?.source?.zipSha256 || analysis['file-inventory']?.zipSha256 || '',
    packageCodeExecuted: false,
    protectedConfigContentsRead: false,
    routeClassificationCount: routeClassifications.length,
    mediaCandidateCount: mediaManifest.assets.length,
    formDefinitionCandidate: form.formId,
    overlaysRequired: args.overlays,
  };
}

function buildRenderingMode(args, analysis) {
  const rendering = analysis['rendering-mode-classification'];
  return {
    tenantId: args.tenantId,
    renderingModeCandidate: args.renderingMode || rendering.renderingModeCandidate || 'hybrid_next_server_required',
    primaryFramework: rendering.primaryFramework || 'nextjs',
    confidence: rendering.confidence || 'high',
    liveDeploymentReady: false,
    requiredGates: rendering.requiredGates || [
      'mobile_responsive_qa_required',
      'protected_config_owner_review_required',
      'form_mapping_review_required',
      'build_or_runtime_proof_required',
    ],
    reasons: rendering.reasons || [
      'Next.js App Router detected with dynamic/catch-all route candidates.',
    ],
  };
}

function buildGapReport(args, analysis, routeClassifications, comparison) {
  const protectedCount = analysis['protected-config-findings']?.count || analysis['protected-config-findings']?.findings?.length || 0;
  const dynamicRoutes = routeClassifications.filter((route) => route.classification === 'dynamic_route');
  const ownerRoutes = routeClassifications.filter((route) => route.classification === 'owner_review_required');
  return {
    tenantId: args.tenantId,
    status: 'owner_action_required_before_live_import',
    gaps: [
      {
        id: 'hybrid-runtime-proof',
        severity: 'required',
        summary: 'Hybrid Next.js runtime proof is required before isolated preview or production deployment.',
      },
      {
        id: 'responsive-proof',
        severity: 'required',
        summary: 'Mobile responsive proof must pass with V2.8.60R and V2.8.60X overlays before any cutover or POST proof.',
      },
      {
        id: 'secure-admin-handoff',
        severity: 'required',
        summary: 'Tenant admin credential handoff is required separately and is not included in this package.',
      },
      {
        id: 'protected-config-owner-review',
        severity: protectedCount > 0 ? 'required' : 'none',
        summary: `${protectedCount} protected config filename finding(s) require owner review; contents were not read.`,
      },
      {
        id: 'media-upload-binding',
        severity: 'later-phase',
        summary: 'Media manifest is ready, but media upload and public binding require a later approval.',
      },
    ],
    routeGaps: {
      dynamicRoutes: dynamicRoutes.map((route) => route.path),
      ownerReviewRoutes: ownerRoutes.map((route) => route.path),
    },
    acceptedPackageComparison: comparison.summary,
    noLiveMutation: true,
  };
}

async function compareAcceptedPackage(args, compiled) {
  const empty = {
    exists: false,
    summary: {
      status: 'accepted_package_not_provided',
    },
    details: {},
  };
  if (!args.acceptedPackage || !existsSync(args.acceptedPackage)) return empty;

  const acceptedPackage = await readJsonIfExists(path.join(args.acceptedPackage, 'tenant-package.json'));
  const acceptedDomains = await readJsonIfExists(path.join(args.acceptedPackage, 'domains.json'));
  const acceptedMedia = await readJsonIfExists(path.join(args.acceptedPackage, 'media', 'manifest.json'));
  const acceptedRoutes = await readJsonIfExists(path.join(args.acceptedPackage, 'validation', 'expected-routes.json'));
  const acceptedResponsive = await readJsonIfExists(path.join(args.acceptedPackage, 'validation', 'responsive-routes.json'));
  const acceptedForm = await readJsonIfExists(path.join(args.acceptedPackage, 'forms', 'default-quote-request.json'));
  const acceptedPublish = await readJsonIfExists(path.join(args.acceptedPackage, 'publish', 'static-site.json'));

  const compiledRoutes = compiled.expectedRoutes.expectedRoutes || [];
  const acceptedRouteList = acceptedRoutes?.expectedRoutes || [];
  const compiledResponsiveRoutes = compiled.responsiveRoutes.routes || [];
  const acceptedResponsiveRoutes = acceptedResponsive?.routes || [];

  return {
    exists: true,
    acceptedPackagePath: args.acceptedPackage,
    summary: {
      status: 'compared',
      tenantIdMatch: acceptedPackage?.tenantId === args.tenantId,
      domainMatch: acceptedDomains?.domainHardLock === args.domain || acceptedDomains?.hosts?.some((host) => host.host === args.domain) === true,
      renderingModeCompatible: Boolean(acceptedPublish?.renderingMode || args.renderingMode),
      mediaCountAccepted: acceptedMedia?.assets?.length || 0,
      mediaCountCompiled: compiled.mediaManifest.assets.length,
      routeCountAccepted: acceptedRouteList.length,
      routeCountCompiled: compiledRoutes.length,
      formTypeAccepted: acceptedForm?.formId || acceptedForm?.formSlug || '',
      formTypeCompiled: compiled.form.formId,
      responsiveRoutesAccepted: acceptedResponsiveRoutes.length,
      responsiveRoutesCompiled: compiledResponsiveRoutes.length,
    },
    differences: [
      ...(acceptedResponsive ? [] : ['Accepted package predates validation/responsive-routes.json; compiler generated responsive routes.']),
      ...(acceptedRouteList.length !== compiledRoutes.length
        ? [`Route count differs: accepted=${acceptedRouteList.length}, compiled=${compiledRoutes.length}.`]
        : []),
      ...((acceptedMedia?.assets?.length || 0) !== compiled.mediaManifest.assets.length
        ? [`Media count differs: accepted=${acceptedMedia?.assets?.length || 0}, compiled=${compiled.mediaManifest.assets.length}.`]
        : []),
    ],
  };
}

async function writePackage(args, analysis) {
  const outRoot = path.resolve(args.out);
  const packageRoot = path.join(outRoot, 'compiled-package');
  await fs.rm(packageRoot, { recursive: true, force: true });
  await fs.mkdir(packageRoot, { recursive: true });

  const routeClassifications = buildRouteClassification(getRouteCandidates(analysis));
  const expectedRoutes = {
    tenantId: args.tenantId,
    targetDomain: args.domain,
    expectedRoutes: getExpectedRoutes(routeClassifications, args.domain),
  };
  const responsiveRoutes = {
    tenantId: args.tenantId,
    standard: 'v2.8.60v-mobile-responsive',
    viewports: RESPONSIVE_VIEWPORTS,
    routes: getResponsiveRoutes(routeClassifications, expectedRoutes.expectedRoutes),
    checks: {
      horizontalOverflow: true,
      consoleErrors: 'documented',
      failedRequests: 'documented',
      missingImages: 'zero',
      formsNoSubmit: true,
    },
    notes: [
      'Raw Airstrip ZIP remains a mobile-risk benchmark.',
      'V2.8.60R and V2.8.60X overlays are required before isolated preview or production cutover.',
      'This file declares required proof routes; it does not claim browser proof passed.',
    ],
  };
  const mediaManifest = buildMediaManifest(analysis, args);
  const brand = buildBrand(analysis, args, mediaManifest);
  const theme = buildTheme(analysis, args);
  const form = buildFormDefinition(analysis, args);
  const pages = pageRoutes(routeClassifications).map((route) => buildPage(route, args));
  const pageFiles = pages.map((page) => `pages/${routeToFileName(page.path)}`).sort();
  const tenantPackage = buildTenantPackage(args, pageFiles);
  const frameworkDetection = {
    tenantId: args.tenantId,
    ...analysis['framework-detection'],
    packageCodeExecuted: false,
  };
  const renderingMode = buildRenderingMode(args, analysis);
  const routeClassification = {
    tenantId: args.tenantId,
    sourceRouteCount: getRouteCandidates(analysis).length,
    preservedRouteCount: routeClassifications.length,
    dynamicRouteCount: routeClassifications.filter((route) => route.classification === 'dynamic_route').length,
    classifications: routeClassifications,
    notes: [
      'All discovered analyzer routes are preserved here.',
      'Dynamic and runtime routes are not silently converted into CMS pages.',
    ],
  };
  const routesFile = {
    tenantId: args.tenantId,
    routes: routeClassifications.map((route) => ({
      path: route.path,
      classification: route.classification,
      sourcePath: route.sourcePath,
      pageOutput: route.pageOutput,
      reason: route.reason,
    })),
  };
  const sourcePackageMap = buildSourcePackageMap(args, analysis, routeClassifications, mediaManifest, form);
  const comparison = await compareAcceptedPackage(args, {
    expectedRoutes,
    responsiveRoutes,
    mediaManifest,
    form,
  });
  const gapReport = buildGapReport(args, analysis, routeClassifications, comparison);

  const files = new Map([
    ['tenant-package.json', tenantPackage],
    ['tenant-profile.json', buildTenantProfile(args)],
    ['domains.json', buildDomains(args)],
    ['brand.json', brand],
    ['theme.json', theme],
    ['media/manifest.json', mediaManifest],
    ['media/media-manifest.json', mediaManifest],
    ['forms/default-quote-request.json', form],
    ['form-definitions/airstrip-reservation.json', form],
    ['users/admin-users.json', buildUsers(args)],
    ['contact/static-contact.json', buildContact(args, form)],
    ['publish/static-site.json', buildPublish(args)],
    ['monitoring/no-live-mutation.json', buildMonitoring(args)],
    ['import-export/source-package-map.json', sourcePackageMap],
    ['import-export/readiness.json', {
      tenantId: args.tenantId,
      packageMode: 'full-template',
      readyForDryRunValidation: true,
      liveImportApproved: false,
      notes: 'Generated by V2.8.61D package compiler without live mutation.',
    }],
    ['validation/expected-routes.json', expectedRoutes],
    ['validation/routes.json', routesFile],
    ['validation/responsive-routes.json', responsiveRoutes],
    ['conversion/source-map.json', {
      ...analysis['source-map'],
      compiler: {
        schemaVersion: 'v2-8-61d',
        tenantId: args.tenantId,
        packageRoot: packageRoot,
        outputRoot: outRoot,
      },
    }],
    ['conversion/framework-detection.json', frameworkDetection],
    ['conversion/rendering-mode.json', renderingMode],
    ['conversion/route-classification.json', routeClassification],
    ['conversion/gap-report.json', gapReport],
    ['conversion/accepted-package-comparison.json', comparison],
  ]);

  for (const page of pages) {
    files.set(`pages/${routeToFileName(page.path)}`, page);
  }

  for (const [rel, value] of files.entries()) {
    await writeJson(path.join(packageRoot, rel), value);
  }

  const ownerPacket = buildOwnerPacket(args, analysis, routeClassifications, mediaManifest, form, comparison);
  const technicalReport = buildTechnicalReport(args, analysis, routeClassifications, mediaManifest, form, comparison, gapReport);
  await writeText(path.join(packageRoot, 'OWNER_ACTION_PACKET.md'), ownerPacket);
  await writeText(path.join(packageRoot, 'TECHNICAL_COMPILER_REPORT.md'), technicalReport);

  const summary = {
    status: 'compiled',
    tenantId: args.tenantId,
    outputRoot: outRoot,
    packageRoot,
    routeClassifications: routeClassifications.length,
    expectedRoutes: expectedRoutes.expectedRoutes.length,
    responsiveRoutes: responsiveRoutes.routes.length,
    pages: pages.length,
    mediaAssets: mediaManifest.assets.length,
    formDefinition: form.formId,
    acceptedPackageComparison: comparison.summary,
    noLiveMutation: true,
  };
  await writeJson(path.join(outRoot, 'compiler-run-summary.json'), summary);
  return summary;
}

function buildOwnerPacket(args, analysis, routeClassifications, mediaManifest, form, comparison) {
  const dynamicCount = routeClassifications.filter((route) => route.classification === 'dynamic_route').length;
  const protectedCount = analysis['protected-config-findings']?.count || analysis['protected-config-findings']?.findings?.length || 0;
  return `# Owner Action Packet

Status: package candidate generated.

What Pumpkin detected:

- Tenant: ${args.tenantName}.
- Target domain: ${args.domain}.
- Website type: Next.js App Router.
- Rendering need: hybrid server runtime is required before this can be launched.
- Routes preserved for review: ${routeClassifications.length}.
- Dynamic routes needing special handling: ${dynamicCount}.
- Media items mapped for future upload: ${mediaManifest.assets.length}.
- Reservation form candidate: ${form.formId}.

What is ready:

- A normalized V1 package candidate was generated.
- The package can be checked by the local V1 validator.
- Media is mapped by reference only; no media was uploaded.
- The reservation/request-booking flow is represented as a FormDefinition candidate.

What still needs owner input:

- Confirm final page copy and legal pages before import.
- Confirm the reservation form fields and routing.
- Provide tenant admin credential handoff through a secure channel. It is not included here.
- Review ${protectedCount} protected configuration filename finding(s). Contents were not read.
- Approve a later runtime/build proof for the hybrid Next.js site.
- Approve mobile responsive proof before isolated preview, production deploy, custom-domain cutover, contact POST, or customer-facing POST proof.

Airstrip-specific note:

- The raw Airstrip ZIP is treated as a source fixture, not production-ready output.
- V2.8.60R and V2.8.60X overlays remain required conversion assets for passing responsive output.

Accepted package comparison:

- Comparison status: ${comparison.summary.status}.
- Compiled route count: ${comparison.summary.routeCountCompiled ?? 'n/a'}.
- Compiled media count: ${comparison.summary.mediaCountCompiled ?? 'n/a'}.

No live tenant, DNS, media, deploy, contact, or form action was performed.
`;
}

function buildTechnicalReport(args, analysis, routeClassifications, mediaManifest, form, comparison, gapReport) {
  const framework = analysis['framework-detection']?.frameworkCandidates?.[0] || {};
  return `# Technical Compiler Report

Status: compiled.

Inputs:

- Analysis directory: ${args.analysis}
- Source ZIP path: ${args.sourceZip || 'not provided'}
- Accepted package path: ${args.acceptedPackage || 'not provided'}
- Rendering mode: ${args.renderingMode || 'hybrid_next_server_required'}

Framework:

- Framework: ${framework.framework || 'unknown'}
- Router: ${framework.router || 'unknown'}
- Confidence: ${framework.confidence || 'unknown'}
- Package code executed: false

Output:

- Package root: ${path.join(path.resolve(args.out), 'compiled-package')}
- Route classifications: ${routeClassifications.length}
- Media assets: ${mediaManifest.assets.length}
- FormDefinition candidate: ${form.formId}
- Gap count: ${gapReport.gaps.length}

Accepted package comparison:

\`\`\`json
${JSON.stringify(comparison.summary, null, 2)}
\`\`\`

Security boundary:

- No package install.
- No package build.
- No uploaded script execution.
- No live mutation.
- No deploy.
- No contact POST.
- No form submission.
- No media upload.
- No protected config contents read.
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  args.analysis = path.resolve(args.analysis);
  args.out = path.resolve(args.out);
  args.sourceZip = args.sourceZip ? path.resolve(args.sourceZip) : '';
  args.acceptedPackage = args.acceptedPackage ? path.resolve(args.acceptedPackage) : '';

  const analysis = await loadAnalysis(args.analysis);
  const summary = await writePackage(args, analysis);
  console.log(JSON.stringify({
    status: summary.status,
    tenantId: summary.tenantId,
    packageRoot: summary.packageRoot,
    expectedRoutes: summary.expectedRoutes,
    responsiveRoutes: summary.responsiveRoutes,
    mediaAssets: summary.mediaAssets,
    formDefinition: summary.formDefinition,
    noLiveMutation: summary.noLiveMutation,
  }));
}

await main().catch((error) => {
  console.error(JSON.stringify({ status: 'failed', error: error.message }));
  process.exitCode = 1;
});
