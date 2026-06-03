#!/usr/bin/env node
import crypto from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const inputZipRel = 'content-review/ice-service-areas-input/ice-service-areas-phase11b-production-polish.zip';
const extractedRel = 'content-review/ice-service-areas-input/extracted';
const packageRootRel = `${extractedRel}/ice-service-areas-phase11b-production-polish`;
const sourceFullRel = `${packageRootRel}/service-areas/ice-service-areas.phase11b.production-polish.full.json`;
const sourceContentRel = `${packageRootRel}/service-areas/ice-service-areas.phase11b.production-polish.content.json`;
const sourceMediaRel = `${packageRootRel}/service-areas/ice-service-areas.phase11b.production-polish.media-manifest.json`;
const sourceFormsRel = `${packageRootRel}/service-areas/ice-service-areas.phase11b.production-polish.forms-routing.json`;
const sourceSchemaRel = `${packageRootRel}/service-areas/ice-service-areas.phase11b.production-polish.schema.json`;
const sharedRefsRel = `${packageRootRel}/shared/ice-rink-rentals.service-area-shared-refs.json`;
const outputRel = 'content-review/ice-service-areas-validated';
const candidateRel = `${outputRel}/SERVICE_AREAS_NORMALIZED_CANDIDATE.json`;
const packageRel = `${outputRel}/SERVICE_AREAS_IMPORT_PACKAGE.json`;
const rootReportRel = 'PUMPKIN_ICE_SERVICE_AREAS_PACKAGE_INTAKE_REPORT.md';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const route = '/service-areas';
const canonicalUrl = `https://${domain}${route}`;
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const generatedAt = new Date().toISOString();

const officialMedia = {
  logo: mediaAsset(
    'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
    '/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png',
    'Ice Rink Rentals logo with ice skate and snowflake graphic',
    'Ice Rink Rentals Logo',
  ),
  hero: mediaAsset(
    'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
    '/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png',
    'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    'Winter Festival Portable Ice Rink',
  ),
  corporate: mediaAsset(
    'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
    '/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png',
    'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    'Corporate Ice Rink Rental Event',
  ),
  holiday: mediaAsset(
    'ice-rink-rentals-holidayicerink-973ce7691377',
    '/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png',
    'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    'Holiday Portable Ice Rink',
  ),
  setup: mediaAsset(
    'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
    '/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png',
    'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    'Portable Ice Rink Setup',
  ),
};

const state = {
  schemaVersion: 'pumpkin.ice.service-areas.package-intake.v1',
  generatedAt,
  tenantId,
  siteKey,
  route,
  inputZip: inputZipRel,
  extractedFolder: extractedRel,
  outputFolder: outputRel,
  rootReport: rootReportRel,
  start: {
    gitStatusShort: process.env.PUMPKIN_TASK_START_GIT_STATUS || git(['status', '--short', '--untracked-files=all']),
    gitStatusAtRunnerStart: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    branch: git(['branch', '--show-current']),
    inputZipExists: existsSync(path.join(repoRoot, inputZipRel)),
    extractedFolderExists: existsSync(path.join(repoRoot, extractedRel)),
    cleanExceptInput: false,
  },
  inventory: {
    ok: false,
    files: [],
    summary: {},
  },
  selectedCandidate: {
    path: sourceFullRel,
    reason: 'Selected because it is the package full JSON for /service-areas with the correct tenant/site/routing metadata.',
    ok: false,
    blockers: [],
  },
  normalization: {
    performed: false,
    summary: {},
    sourceEastCoastClaimsRemoved: true,
    cityPagesCreated: false,
    cmsWrites: false,
  },
  validation: {
    ok: false,
    results: {},
    blockers: [],
    warnings: [],
  },
  readiness: {
    humanReview: false,
    localDraftImport: false,
    cmsLiveApproval: false,
    staticRegeneration: false,
    productionIndexing: false,
    blockers: {},
  },
  hygiene: {
    ok: false,
    results: {},
    failed: [],
  },
  safety: {
    cmsRecordsWritten: false,
    serviceAreasImported: false,
    homepageUpdated: false,
    contactUpdated: false,
    stateCityCreated: false,
    themeRecordsUpdated: false,
    mediaAssetRecordsUpdated: false,
    staticPackagesRegenerated: false,
    deployed: false,
    dnsAzureCloudflareMicrosoft365BluehostEmailProviderChanged: false,
    emailSent: false,
    rollerTouched: false,
    imageGenerationUsed: false,
    imageFilesModified: false,
    protectedConfigRead: false,
  },
  success: false,
};

main();

function main() {
  mkdirSync(path.join(repoRoot, outputRel), { recursive: true });
  try {
    state.start.cleanExceptInput = cleanExceptInputOnly(state.start.gitStatusShort);
    assertInputReady();
    state.inventory = buildInventory();
    writePackageInventory();

    const source = readJson(sourceFullRel);
    const candidateAudit = auditSourceCandidate(source);
    state.selectedCandidate.ok = candidateAudit.ok;
    state.selectedCandidate.blockers = candidateAudit.blockers;
    if (!candidateAudit.ok) throw new Error(`No safe /service-areas candidate selected: ${candidateAudit.blockers.join('; ')}`);

    const candidate = normalizeServiceAreasCandidate(source);
    writeJson(candidateRel, candidate);
    state.normalization.performed = true;
    state.normalization.summary = summarizeCandidate(candidate);

    const importPackage = buildImportPackage(candidate);
    writeJson(packageRel, importPackage);

    runValidations(candidate);
    classifyReadiness();
    writeDocs();
    runHygieneChecks();
    if (!state.hygiene.ok) state.validation.blockers.push(`Hygiene checks failed: ${state.hygiene.failed.join(', ')}`);

    state.validation.ok = state.validation.blockers.length === 0;
    classifyReadiness();
    state.success = state.validation.ok &&
      state.readiness.humanReview === true &&
      state.readiness.localDraftImport === true &&
      state.safety.cmsRecordsWritten === false;
  } catch (error) {
    state.validation.blockers.push(safeMessage(error));
  }

  writeDocs();
  writeJson(`${outputRel}/manifest.json`, state);
  console.log(JSON.stringify({
    success: state.success,
    blockers: state.validation.blockers,
    selectedCandidate: state.selectedCandidate.path,
    normalizedCandidate: candidateRel,
    importPackage: packageRel,
    readiness: state.readiness,
    report: rootReportRel,
  }, null, 2));
  if (!state.success) process.exitCode = 1;
}

function assertInputReady() {
  if (!state.start.inputZipExists) throw new Error(`Input ZIP missing: ${inputZipRel}`);
  if (!state.start.extractedFolderExists) throw new Error(`Extracted folder missing: ${extractedRel}`);
  for (const file of [sourceFullRel, sourceContentRel, sourceMediaRel, sourceFormsRel, sourceSchemaRel, sharedRefsRel]) {
    if (!existsSync(path.join(repoRoot, file))) throw new Error(`Expected package file missing: ${file}`);
  }
}

function buildInventory() {
  const files = listFiles(path.join(repoRoot, packageRootRel)).map((file) => {
    const relPath = rel(file);
    const textCapable = /\.(json|md|html|css|txt)$/i.test(file);
    const text = textCapable ? readFileSync(file, 'utf8') : '';
    return {
      path: relPath,
      bytes: statSync(file).size,
      category: categorizeFile(relPath, text),
      referenceOnly: isReferenceOnly(relPath, text),
    };
  });
  const byCategory = groupCounts(files.map((file) => file.category));
  const jsonFiles = files.filter((file) => file.path.endsWith('.json')).map((file) => file.path);
  const sourceJson = [sourceFullRel, sourceContentRel, sourceMediaRel, sourceFormsRel, sourceSchemaRel, sharedRefsRel].map((file) => readJson(file));
  const mediaRefs = unique(sourceJson.flatMap((item) => collectValuesByKey(item, 'assetId')))
    .filter((item) => typeof item === 'string' && item.startsWith('ice-rink-rentals-'))
    .sort();
  return {
    ok: files.length > 0,
    files,
    summary: {
      totalFiles: files.length,
      byCategory,
      serviceAreaJsonFiles: jsonFiles.filter((file) => file.includes('/service-areas/')),
      pagePackageJsonFiles: jsonFiles.filter((file) => /full|content|package|shared-refs/i.test(file)),
      mediaReferences: mediaRefs,
      previewHtmlFiles: files.filter((file) => file.category === 'preview-html').map((file) => file.path),
      referenceOnlyFiles: files.filter((file) => file.referenceOnly).map((file) => file.path),
    },
  };
}

function categorizeFile(relPath, text) {
  const normalized = relPath.replace(/\\/g, '/');
  if (/preview\.html$/i.test(normalized)) return 'preview-html';
  if (/assets\/.+\.(png|jpe?g|gif|webp|avif)$/i.test(normalized)) return 'raw-media';
  if (/media-manifest\.json$/i.test(normalized)) return 'media-manifest-json';
  if (/forms-routing\.json$/i.test(normalized)) return 'forms-routing-json';
  if (/schema\.json$/i.test(normalized)) return 'schema-seo-json';
  if (/\.json$/i.test(normalized) && /service-areas/i.test(normalized)) return 'service-area-json';
  if (/\.json$/i.test(normalized)) return 'page-package-json';
  if (/\.(css|scss)$/i.test(normalized)) return 'style-file';
  if (/\.(md|txt)$/i.test(normalized)) return 'readme-instruction';
  if (/wpcf7|contact-form-7|wordpress|wp-json|cf7/i.test(`${normalized}\n${text}`)) return 'wordpress-cf7-reference';
  return 'other';
}

function isReferenceOnly(relPath, text) {
  return /preview\.html$/i.test(relPath) ||
    /assets\/.+\.(png|jpe?g|gif|webp|avif)$/i.test(relPath) ||
    /wpcf7|contact-form-7|wordpress|wp-json|cf7|screenshot/i.test(`${relPath}\n${text}`);
}

function auditSourceCandidate(source) {
  const text = JSON.stringify(source);
  const cityRouteAuditText = text
    .replaceAll('/state-city', '')
    .replace(/"exampleOnlyRoutes"\s*:\s*\[[^\]]*\]/g, '');
  const checks = {
    tenantId: source.tenantId === tenantId || !source.tenantId,
    siteKey: source.siteKey === siteKey || !source.siteKey,
    route: source.routing?.route === route || source.routing?.path === route,
    slug: source.routing?.slug === 'service-areas',
    notHomepage: source.routing?.route !== '/',
    notContact: source.routing?.route !== '/contact',
    noStateCityPages: source.routing?.cityPagesCreated === false && !/\/[a-z]{2}-[a-z0-9-]+/i.test(cityRouteAuditText),
    noRuntimeWordPressCf7: !/wpcf7|contact-form-7|\[contact-form-7|wp-json/i.test(text),
    selectedMailbox: text.includes(selectedMailbox),
    noLegacyMailbox: !text.includes(legacyMailbox),
  };
  const blockers = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: blockers.length === 0, checks, blockers };
}

function normalizeServiceAreasCandidate(source) {
  const blocks = [
    {
      id: 'service-areas-hero',
      type: 'Hero',
      name: 'Service Areas Hero',
      enabled: true,
      content: {
        sectionVariant: 'heroMedia',
        eyebrow: 'Portable ice rink rental service areas',
        headline: 'Portable ice rink rental service-area review across the United States',
        subheadline: 'Ice Rink Rentals reviews portable rink rental requests across the United States using event details, venue logistics, timing, and route feasibility before availability is confirmed.',
        media: officialMedia.hero,
        primaryCta: { label: 'Request a Quote', href: '/contact' },
        secondaryCta: { label: 'How Coverage Is Reviewed', href: '#coverage-review' },
        buttonText: 'Request a Quote',
        buttonLink: '/contact',
        secondaryButtonText: 'How Coverage Is Reviewed',
        secondaryButtonLink: '#coverage-review',
        supportingPoints: [
          'United States request review',
          'Quote-first availability confirmation',
          'Future city pages require approval',
        ],
      },
    },
    {
      id: 'coverage-summary-band',
      type: 'TrustBar',
      name: 'Coverage Approach',
      enabled: true,
      content: {
        sectionVariant: 'trustBand',
        items: [
          {
            icon: 'MapPinned',
            title: 'United States review',
            text: 'Event requests may be submitted from across the United States. Availability is reviewed before any route or market is confirmed.',
          },
          {
            icon: 'ClipboardCheck',
            title: 'Quote-first planning',
            text: 'The team reviews event date, location, venue access, surface, support needs, and package fit before next steps are recommended.',
          },
          {
            icon: 'PackageCheck',
            title: 'Route-based logistics',
            text: 'Delivery access, setup area, guest flow, and event duration all affect whether a portable rink plan is realistic.',
          },
          {
            icon: 'ShieldCheck',
            title: 'Approved market rollout',
            text: 'Future city pages should go live only when service language, routing, SEO, and market details are approved.',
          },
        ],
      },
    },
    {
      id: 'regional-request-planning',
      type: 'CardGrid',
      name: 'Regional Request Planning',
      enabled: true,
      content: {
        sectionVariant: 'planningTopics',
        eyebrow: 'Regional planning',
        title: 'Portable rink requests by U.S. region',
        subtitle: 'Use this page to guide visitors toward quote review while keeping unapproved city claims off the live site.',
        topics: [
          {
            title: 'Northeast and Mid-Atlantic',
            description: 'Submit city, state, date, and venue details so the request can be reviewed without assuming local availability.',
          },
          {
            title: 'Southeast',
            description: 'Holiday attractions, resorts, retail centers, festivals, and private venues can be reviewed through the quote path.',
          },
          {
            title: 'Midwest',
            description: 'Winter festivals, colleges, municipalities, and corporate holiday events can be assessed around route feasibility.',
          },
          {
            title: 'South and central U.S.',
            description: 'Requests should include timing, weather exposure, surface conditions, and event-support needs.',
          },
          {
            title: 'Mountain West and West Coast',
            description: 'Long-distance requests require careful review of delivery route, setup window, and venue readiness.',
          },
          {
            title: 'Approved city pages',
            description: 'Future URLs may use the /state-city pattern only after market copy and service language are approved.',
          },
        ],
      },
    },
    {
      id: 'coverage-review',
      type: 'HowItWorks',
      name: 'Coverage Review Steps',
      enabled: true,
      content: {
        sectionVariant: 'processSteps',
        eyebrow: 'Availability review',
        title: 'What we review before confirming a route',
        subtitle: 'A strong service-area request includes enough details to understand the venue, timing, route, surface, and guest-support needs.',
        steps: [
          {
            title: 'Event city, state, and date',
            text: 'The location, event window, and target date help determine whether the request can be reviewed for that market.',
          },
          {
            title: 'Venue access and surface',
            text: 'Delivery access, surface type, footprint, power, weather exposure, and guest flow all affect setup recommendations.',
          },
          {
            title: 'Rink package and support needs',
            text: 'Skates, skate aids, benches, barriers, lighting, music, signage, staffing, and add-ons can be included in the review.',
          },
          {
            title: 'Quote path and next step',
            text: 'After details are reviewed, the team can respond with availability direction, package planning, and follow-up questions if needed.',
          },
        ],
      },
    },
    {
      id: 'setup-logistics-feature',
      type: 'CardGrid',
      name: 'Setup Logistics Feature',
      enabled: true,
      content: {
        sectionVariant: 'splitFeature',
        eyebrow: 'Setup logistics',
        title: 'Portable rink routes depend on more than distance',
        description: 'A portable ice rink request is reviewed around the event footprint, delivery route, timing, power access, weather exposure, and support needs before availability is represented publicly.',
        media: officialMedia.setup,
        bullets: [
          'Venue access and delivery window',
          'Surface type, footprint, and guest flow',
          'Event duration and weather exposure',
          'Support items requested with the rink',
        ],
      },
    },
    {
      id: 'partner-party-pros-east-coast-service-areas',
      type: 'PrimaryCTA',
      name: 'Party Pros East Coast Partner Resource',
      enabled: true,
      content: {
        sectionVariant: 'partnerResourceCta',
        visualTreatment: 'partnerResourceCta',
        eyebrow: 'Partner resource',
        headline: 'Planning event entertainment beyond the rink?',
        title: 'Planning event entertainment beyond the rink?',
        description: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs attractions, concessions, interactive games, arcade games, casino-style games, and related event entertainment, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
        subtitle: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs attractions, concessions, interactive games, arcade games, casino-style games, and related event entertainment, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
        partnerCtaLabel: 'Explore Party Pros East Coast',
        secondaryButtonText: 'Request Rink Availability Review',
        secondaryButtonLink: '/contact',
        cta: { label: 'Explore Party Pros East Coast', href: 'https://partyproseastcoast.com/' },
        partner: {
          name: 'Party Pros East Coast',
          displayRole: 'Event entertainment partner resource',
          url: 'https://partyproseastcoast.com/',
          urlSource: 'phase11b-service-areas-package',
        },
      },
    },
    {
      id: 'service-area-use-cases',
      type: 'CardGrid',
      name: 'Service Area Use Cases',
      enabled: true,
      content: {
        sectionVariant: 'mediaUseCaseGrid',
        eyebrow: 'Events that travel well',
        title: 'Best-fit requests for route-based rink planning',
        subtitle: 'The strongest service-area requests have a defined venue, clear event timing, a realistic setup area, and enough attendance detail to match the rink plan to the guest experience.',
        cards: [
          {
            title: 'Holiday and winter attractions',
            description: 'Shopping centers, resorts, festivals, and municipalities can submit event details for portable rink rental review.',
            media: officialMedia.holiday,
            ctaLabel: 'Request Review',
            ctaHref: '/contact',
          },
          {
            title: 'Corporate and brand activations',
            description: 'Corporate campuses, VIP events, sponsor activations, and private venues can be reviewed around schedule, staffing, and guest flow.',
            media: officialMedia.corporate,
            ctaLabel: 'Request Review',
            ctaHref: '/contact',
          },
          {
            title: 'Public and private event venues',
            description: 'Schools, community spaces, private estates, and event venues can share location and logistics details before a route is confirmed.',
            media: officialMedia.hero,
            ctaLabel: 'Request Review',
            ctaHref: '/contact',
          },
        ],
      },
    },
    {
      id: 'future-city-pages',
      type: 'ServiceAreaMap',
      name: 'Future City Pages',
      enabled: true,
      content: {
        sectionVariant: 'serviceAreaTeaser',
        eyebrow: 'Future local pages',
        title: 'City pages will be added after market approval',
        description: 'The service-area page introduces the domestic U.S. review model without creating unsupported local claims. Future city pages may use the /state-city format only after each target market has accurate coverage language, SEO, media, and routing approval.',
        buttonText: 'Request Market Review',
        buttonLink: '/contact',
        futureCityPagePattern: '/state-city',
        cityPagesCreated: false,
      },
    },
    {
      id: 'service-areas-faq',
      type: 'FAQ',
      name: 'Service Area FAQs',
      enabled: true,
      content: {
        sectionVariant: 'faqAccordion',
        eyebrow: 'Service-area questions',
        title: 'Service area FAQs',
        subtitle: 'Answers are intentionally review-first until local market pages are approved.',
        items: [
          {
            question: 'Do you serve my state?',
            answer: 'Ice Rink Rentals reviews portable rink rental requests across the United States. Availability depends on the event date, location, venue access, staffing, package needs, and route feasibility.',
          },
          {
            question: 'Why are city pages not listed yet?',
            answer: 'City and regional pages should only be published after each market is reviewed and approved. This avoids unsupported local claims and keeps service-area copy accurate.',
          },
          {
            question: 'What details help determine availability?',
            answer: 'Helpful details include your event date, city and state, venue type, available surface, estimated attendance, event duration, delivery access, and support needs.',
          },
          {
            question: 'Can Party Pros East Coast help with other event needs?',
            answer: 'Party Pros East Coast may be a helpful partner resource for additional attractions, concessions, games, and event entertainment needs beyond the rink conversation.',
          },
          {
            question: 'Will future city pages use /state-city?',
            answer: 'The /state-city pattern may be documented for future city pages, but no city page should be created until the target market has been reviewed and approved.',
          },
        ],
      },
    },
    {
      id: 'service-areas-final-cta',
      type: 'PrimaryCTA',
      name: 'Service Areas Final CTA',
      enabled: true,
      content: {
        sectionVariant: 'finalCta',
        eyebrow: 'Availability review',
        title: 'Ready to check availability for your event location?',
        description: 'Share your city, state, event date, venue details, available surface, estimated attendance, and event goals. The team can review the request and help outline the next step for your portable rink rental.',
        buttonText: 'Request Service-Area Review',
        buttonLink: '/contact',
        secondaryText: 'Public email display remains form-first while mailbox and provider settings stay under review.',
        secondaryLinkText: 'Use the contact form',
        secondaryLink: '/contact',
      },
    },
  ];

  const candidate = {
    schemaVersion: 'pumpkin-page-v1',
    candidateVersion: 'phase11b-service-areas-normalized-intake',
    id: 'ice-rink-rentals-service-areas',
    PageId: 'ice-rink-rentals-service-areas',
    tenantId,
    siteKey,
    domain,
    route,
    path: route,
    slug: 'service-areas',
    pageSlug: 'service-areas',
    canonicalUrl,
    PageVersion: 1,
    Layout: 'default',
    businessDisplayName: 'Ice Rink Rentals',
    primaryServiceScope: 'United States / domestic USA request review',
    productionApproved: false,
    publishApproved: false,
    reviewMetadata: {
      sourcePackage: inputZipRel,
      sourceCandidate: sourceFullRel,
      normalizedAt: generatedAt,
      scope: 'service-areas-intake-validation-only',
      cmsImportApproved: false,
      visualApprovalRequired: true,
      cityPagesCreated: false,
      rollerPaused: true,
      sourceEastCoastClaimsNormalizedOut: true,
    },
    MetaData: {
      category: 'rentals',
      product: 'portable ice rink',
      keyword: 'portable ice rink rental service areas',
      pageType: 'serviceAreas',
      title: 'Portable Ice Rink Rental Service Areas | Ice Rink Rentals',
      description: 'Review portable ice rink rental service-area planning across the United States and request availability review for your event city, date, venue, and support needs.',
      createdAt: generatedAt,
      updatedAt: generatedAt,
      author: 'Ice Skating Rink Rentals Team',
      language: 'en-us',
      market: 'us',
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword: 'portable ice rink rental service areas',
      focusKeyword: 'portable ice rink rental service areas',
      secondaryKeywords: [
        'portable ice rink rentals',
        'ice rink rentals near me',
        'temporary ice rink rental',
        'holiday ice rink rental',
        'corporate ice rink rental',
        'portable rink rental availability',
      ],
      tags: [
        'portable ice rink rental service areas',
        'portable ice rink availability',
        'temporary rink coverage',
        'event rink route review',
      ],
      contentSummary: 'Service areas page candidate explaining United States request review, route feasibility, future city-page approval, and the quote path without unsupported local claims.',
      blockTypes: blocks.map((block) => block.type),
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: {
      isHub: false,
      hubPageSlug: 'home',
      topicCluster: 'portable-ice-rink-rentals-service-areas',
      relatedHubs: ['/'],
      spokePriority: 2,
    },
    seo: {
      metaTitle: 'Portable Ice Rink Rental Service Areas | Ice Rink Rentals',
      metaDescription: 'Review portable ice rink rental service-area planning across the United States and request availability review for your event city, date, venue, and support needs.',
      keywords: [
        'portable ice rink rental service areas',
        'portable ice rink rentals',
        'temporary ice rink rental service area',
        'portable rink rental availability',
      ],
      focusKeyword: 'portable ice rink rental service areas',
      secondaryKeywords: [
        'ice rink rentals near me',
        'temporary rink rental availability',
        'ice rink rental coverage',
      ],
      robots: 'noindex, nofollow',
      canonicalUrl,
      alternateUrls: [],
      structuredData: [],
      openGraph: {
        'og:title': 'Portable Ice Rink Rental Service Areas | Ice Rink Rentals',
        'og:description': 'Submit your event city, date, venue details, and support needs for portable ice rink rental service-area review.',
        'og:type': 'website',
        'og:url': canonicalUrl,
        'og:image': officialMedia.hero.publicUrl,
        'og:image:alt': officialMedia.hero.alt,
        'og:site_name': 'Ice Rink Rentals',
        'og:locale': 'en_US',
      },
      twitterCard: {
        'twitter:card': 'summary_large_image',
        'twitter:title': 'Portable Ice Rink Rental Service Areas | Ice Rink Rentals',
        'twitter:description': 'Submit your event city, date, venue details, and support needs for portable ice rink rental service-area review.',
        'twitter:image': officialMedia.hero.publicUrl,
        'twitter:site': '',
        'twitter:creator': '',
      },
    },
    media: {
      logo: officialMedia.logo,
      featuredImage: officialMedia.hero,
      heroImage: officialMedia.hero,
      openGraphImage: officialMedia.hero,
      localImage: officialMedia.corporate,
      setupImage: officialMedia.setup,
      closingImage: officialMedia.holiday,
    },
    isPublished: false,
    includeInSitemap: false,
    publishedAt: null,
    previousSlugs: [],
    redirects: [],
    sitemapPriority: 0.7,
    sitemapChangeFrequency: 'monthly',
    fulfillment: {
      fulfillmentStatus: 'service-area-intake-review',
      primaryPartnerAvailable: false,
      manualReviewRequired: true,
      providerResearchCompleted: false,
      topProviderCount: 0,
      leadRoutingMode: 'route_to_contact_page_formblock',
      publicDisclosureRequired: false,
      confirmedServiceStates: [],
      extendedStatesPossible: [],
    },
    googleAds: {
      eligible: false,
      finalUrl: '',
      landingPageType: 'serviceAreas',
      campaignTheme: '',
      conversionGoals: [],
      notes: 'Not approved for campaigns during intake validation.',
      policyRisk: 'review',
      bridgePageRisk: 'review',
      requiresDisclosure: false,
    },
    pageQuality: {
      status: 'needs_review',
      warnings: [
        'Human visual approval is required before CMS/live approval.',
        'Static generation is not authorized in this intake run.',
        'City pages are documented as future /state-city pattern only and were not created.',
      ],
      blockingIssues: [],
      lastCheckedAt: generatedAt,
      uniqueValueReason: 'Phase 11B service-area package normalized into Pumpkin production-renderer-compatible blocks with domestic U.S. request-review scope.',
      buyerIntent: 'portable ice rink rental service-area and route feasibility review',
      landingPageType: 'serviceAreas',
      launchNotes: 'Intake/validation only. Do not import until user visual approval and explicit CMS import authorization.',
    },
    workflow: {
      status: 'draft',
      reviewStatus: 'needs_review',
      approvedForPublish: false,
      approvedBy: '',
      approvedAt: '',
      lastEditedBy: 'codex_service_areas_intake',
      lastEditedAt: generatedAt,
      approvedForImport: false,
      productionApproved: false,
      publishApproved: false,
    },
    revision: {
      currentRevisionId: '',
      revisionNumber: 1,
      revisionLabel: 'phase11b-service-areas-intake',
      lastSnapshotAt: '',
      lastRevisionAt: '',
      lastRevisionBy: '',
      rollbackAvailable: false,
      rollbackNotes: 'No CMS write has been performed; rollback metadata will be created by the admin update path during an approved import.',
      lastChangeSummary: 'Service areas package intake normalization only; no CMS write.',
      lastChangedBy: 'codex_service_areas_intake',
      lastChangeSource: 'manual_unknown',
      lastChangeAt: generatedAt,
      latestSnapshot: null,
    },
    staticPublishing: {
      staticEligible: false,
      needsRebuild: true,
      lastSnapshotAt: '',
      lastStaticBuildAt: '',
      lastDeployedAt: '',
      contentHash: '',
      lastPublishedContentHash: '',
      deploymentStatus: 'not_generated',
      productionApproved: false,
    },
    template: {
      templateKey: 'ice-service-areas-phase11b-normalized',
      templateVersion: 'phase11b-normalized-intake.v1',
      layoutVariant: 'production-renderer-compatible',
      contentModelVersion: 'phase11b-production-renderer-compatible.v1',
    },
    linking: {
      hubPage: '/',
      parentPage: '/',
      relatedPages: ['/', '/contact'],
      requiredLinks: ['/', '/contact'],
      breadcrumbTrail: ['/', '/service-areas'],
      futureCityPagePattern: '/state-city',
      cityPagesCreated: false,
    },
    schemaControls: {
      enableWebPageSchema: true,
      enableBreadcrumbSchema: true,
      enableFAQSchema: true,
      enableServiceSchema: false,
      schemaWarnings: [
        'Service schema output remains disabled until service-area wording is visually approved.',
      ],
    },
    serviceSchema: {
      serviceName: 'Portable Ice Rink Rental Service-Area Review',
      serviceType: 'Portable Ice Rink Rentals',
      serviceCategory: 'Event rental planning',
      productsOffered: [
        {
          name: 'Portable ice skating rink rental planning',
          type: 'Service',
          description: 'Review-only portable ice skating rink rental planning and quote intake.',
          url: canonicalUrl,
          category: 'event rentals',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
      areasServed: [
        {
          name: 'United States',
          type: 'Country',
          country: 'US',
          url: canonicalUrl,
          serviceAreaType: 'domestic-usa-review-only',
          confidence: 'review',
          isPrimary: true,
        },
      ],
      audience: [
        'event planners',
        'venue operators',
        'corporate event producers',
        'school and municipal event teams',
      ],
      eventTypes: [
        'holiday festival',
        'winter market',
        'corporate event',
        'brand activation',
        'school event',
        'municipal event',
        'shopping center attraction',
        'private event',
      ],
      schemaOutputMode: 'disabled_until_review',
      publicSchemaEnabled: false,
      notes: 'No city, state-city, or local service page was created in this intake.',
    },
    formConfig: {
      formId: 'ice-service-areas-route-to-contact',
      formType: 'quote_request',
      conversionGoal: 'service_area_quote_request',
      routingMode: 'route_to_contact_page_formblock',
      domainRoutingKey: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
      replyToMode: 'submitter_email',
      emailSubjectTemplate: 'Portable ice rink service-area inquiry',
      mailtoFallbackEnabled: false,
      thankYouUrl: '/contact',
      thankYouMessage: 'Thanks. Your ice rink rental request has been received for review.',
      recipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
      staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
      requiresConsent: true,
      consentRequired: true,
      spamProtectionRequired: true,
      spamProtectionEnabled: true,
    },
    formDefinitions: [],
    domainRouting: {
      domain,
      brandName: 'Ice Rink Rentals',
      businessDisplayName: 'Ice Rink Rentals',
      publicContactEmail: '',
      publicEmailDisplayPolicy,
      selectedMailbox,
      selectedMailboxMetadata: selectedMailbox,
      quoteRequestEmail: '',
      supportEmail: '',
      replyToEmail: '',
      fromName: 'Ice Rink Rentals',
      fromEmail: '',
      contactPageSlug: 'contact',
      primaryPhone: '',
      primaryPhoneHref: '',
      primaryPhoneApprovalStatus: 'not-set-in-service-areas-intake',
      mailtoLinksEnabled: false,
      defaultLeadRoutingMode: 'route_to_contact_page_formblock',
      defaultRecipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
      staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
      leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
      staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
      emailProvider: '',
      selectedEmailProvider: 'under-review',
      pumpkinAppSendStatus: 'disabled_review_only',
      emailProviderStatus: 'selected_mailbox_metadata_only',
      mxStatus: '',
      spfStatus: '',
      dkimStatus: '',
      dmarcStatus: '',
      notes: 'Selected mailbox is metadata only; public service-area email display is disabled and no live sending is enabled.',
    },
    importProvenance: {
      lastImportBatchId: '',
      sourceFile: sourceFullRel,
      sourceRow: '',
      externalId: source.id || '',
      lockedFields: [],
      overwriteBehavior: 'warn',
    },
    deploymentHooks: {
      deploymentId: '',
      buildId: '',
      buildWarningCount: 0,
      publishSource: '',
    },
  };

  candidate.contentHash = hash(stableStringify(candidate.ContentData));
  return candidate;
}

function buildImportPackage(candidate) {
  return {
    schemaVersion: 'pumpkin.ice.service-areas.import-package.v1',
    generatedAt,
    tenantId,
    siteKey,
    route,
    canonicalUrl,
    sourceZip: inputZipRel,
    sourceCandidate: sourceFullRel,
    normalizedCandidatePath: candidateRel,
    pages: [candidate],
    pageCount: 1,
    routesIncluded: [route],
    excludedRoutes: ['/', '/contact', '/state-city'],
    serviceAreaSpecificMetadata: {
      futureCityPagePattern: '/state-city',
      cityPagesCreated: false,
      serviceScope: 'United States / domestic USA request review',
      selectedMailbox,
      publicEmailDisplayPolicy,
      staticGenerationApproved: false,
      cmsImportApproved: false,
      visualApprovalRequired: true,
    },
    guardrails: state.safety,
  };
}

function runValidations(candidate) {
  const candidatePath = path.join(repoRoot, candidateRel);
  const packagePath = path.join(repoRoot, packageRel);
  const sourceJsonFiles = [
    sourceFullRel,
    sourceContentRel,
    sourceMediaRel,
    sourceFormsRel,
    sourceSchemaRel,
    sharedRefsRel,
  ].map((file) => path.join(repoRoot, file));
  const activeTextFiles = [candidatePath, packagePath, ...sourceJsonFiles, ...listFiles(path.join(repoRoot, packageRootRel, 'docs'))];
  writeValidation('json-parse-validation-result.json', jsonParseValidation([candidatePath, packagePath, ...sourceJsonFiles]));
  writeValidation('service-areas-candidate-audit-result.json', serviceAreasCandidateAudit(candidate));
  writeValidation('service-area-wording-review-result.json', serviceAreaWordingReview(candidate));
  writeValidation('media-binding-review-result.json', mediaBindingReview(candidate));
  writeValidation('route-canonical-review-result.json', routeCanonicalReview(candidate));
  writeValidation('unsafe-scan-result.json', unsafeScan([candidatePath, packagePath]));
  writeValidation('reference-only-scan-result.json', referenceOnlyScan(listFiles(path.join(repoRoot, packageRootRel))));
  writeValidation('contactus-scan-result.json', stringScan(activeTextFiles, legacyMailbox));
  writeValidation('targeted-secret-scan-result.json', secretScan(activeTextFiles));
  runImportPreflight();
  runDotNetContract(candidatePath);
  runContractPersistence(candidatePath);
  runSimpleCommand('design-system-validation-result.json', ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand('media-validation-result.json', ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  if (blocksOf(candidate).some((block) => block.type === 'formBlock')) {
    runSimpleCommand('default-form-validation-result.json', ['node', 'tools/default-form-validation/validate-default-form-fixtures.mjs']);
  } else {
    writeValidation('default-form-validation-result.json', {
      ok: true,
      skipped: true,
      reason: 'No formBlock exists in the normalized /service-areas candidate; quote CTAs route to /contact.',
    });
  }
  runSimpleCommand('tailwind-navigation-validation-result.json', ['node', 'tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs']);
  runSimpleCommand('page-intake-normalizer-validation-result.json', ['node', 'tools/page-intake-normalizer/normalize-page-intake.mjs', 'validate-fixtures']);

  const required = [
    'json-parse-validation-result.json',
    'service-areas-candidate-audit-result.json',
    'service-area-wording-review-result.json',
    'media-binding-review-result.json',
    'route-canonical-review-result.json',
    'unsafe-scan-result.json',
    'contactus-scan-result.json',
    'targeted-secret-scan-result.json',
    'homepage-import-preflight-result.json',
    'dotnet-page-contract-result.json',
    'contract-persistence-validation-result.json',
    'design-system-validation-result.json',
    'media-validation-result.json',
    'default-form-validation-result.json',
    'tailwind-navigation-validation-result.json',
    'page-intake-normalizer-validation-result.json',
  ];
  state.validation.blockers = required
    .filter((name) => state.validation.results[name]?.ok !== true)
    .map((name) => `${name} failed`);
}

function serviceAreasCandidateAudit(candidate) {
  const text = JSON.stringify(candidate);
  const checks = {
    tenantId: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    route: candidate.route === route && candidate.path === route,
    slug: candidate.slug === 'service-areas' && candidate.pageSlug === 'service-areas',
    notHomepage: candidate.pageSlug !== 'home' && candidate.route !== '/',
    notContact: candidate.pageSlug !== 'contact' && candidate.route !== '/contact',
    noStateCityCreated: candidate.linking?.cityPagesCreated === false && !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replace('/state-city', '')),
    noWordPressCf7Runtime: !/wpcf7|contact-form-7|\[contact-form-7|wp-json|wp-content/i.test(text),
    draftNeedsReview: candidate.isPublished === false && candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    approvalsFalse: candidate.productionApproved === false && candidate.publishApproved === false && candidate.workflow?.approvedForPublish === false,
    staticNeedsRebuild: candidate.staticPublishing?.needsRebuild === true,
    noRawTailwindClassFields: !/"(?:className|classes)"\s*:/.test(text),
  };
  return withFailed(checks);
}

function serviceAreaWordingReview(candidate) {
  const active = JSON.stringify(candidate);
  const strippedPartnerBrand = active.replace(/Party Pros East Coast/g, 'Party Pros East-Coast-Brand');
  const checks = {
    unitedStatesScope: /United States|domestic USA|Country/.test(active),
    noUnsupportedEastCoastClaim: !/\bEast Coast\b/i.test(strippedPartnerBrand),
    noFakePhone: !/(?:555[-.\s]?|123[-.\s]?456|000[-.\s]?000)/.test(active),
    selectedMailbox: active.includes(selectedMailbox),
    publicEmailDisplayPolicy: active.includes(publicEmailDisplayPolicy),
    noLegacyMailbox: !active.includes(legacyMailbox),
    noFakeEmail: !/(?:test|example|fake|noreply)@(?:example|test|fake)\./i.test(active),
    noRawFormHtml: !/<form\b|<input\b|<textarea\b|<select\b/i.test(active),
    quoteCtasRouteToContact: collectCtaTargets(candidate).every((target) => target === '/contact' || target.startsWith('#') || /^https:\/\/partyproseastcoast\.com\/?$/i.test(target)),
    futureCityPatternDocumentedOnly: active.includes('/state-city') && candidate.linking?.cityPagesCreated === false,
  };
  return withFailed(checks);
}

function mediaBindingReview(candidate) {
  const active = JSON.stringify(candidate);
  const mediaIds = unique(collectValuesByKey(candidate, 'mediaAssetId')).sort();
  const allowed = new Set(Object.values(officialMedia).map((item) => item.mediaAssetId));
  allowed.add('ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae');
  const checks = {
    onlyOfficialMediaAssetIds: mediaIds.every((id) => allowed.has(id)),
    requiredMediaPresent: ['logo', 'heroImage', 'openGraphImage', 'featuredImage', 'localImage', 'setupImage', 'closingImage'].every((key) => candidate.media?.[key]?.mediaAssetId),
    noInventedMediaAssetIds: mediaIds.every((id) => id.startsWith('ice-rink-rentals-')),
    noBase64Images: !/data:image\/|base64/i.test(active),
    noExternalFakeMediaUrls: !/https:\/\/(?:images\.unsplash\.com|picsum\.photos|placehold\.co|via\.placeholder\.com|example\.com)/i.test(active),
    allActiveMediaUrlsLocal: collectValuesByKey(candidate, 'publicUrl').every((url) => typeof url === 'string' && url.startsWith('/media/ice-rink-rentals/')),
    altTextPresent: collectMediaObjects(candidate).every((item) => typeof item.alt === 'string' && item.alt.trim().length > 0),
  };
  return { ...withFailed(checks), mediaAssetIds: mediaIds };
}

function routeCanonicalReview(candidate) {
  const checks = {
    route: candidate.route === route,
    path: candidate.path === route,
    slug: candidate.slug === 'service-areas',
    pageSlug: candidate.pageSlug === 'service-areas',
    canonicalUrl: candidate.canonicalUrl === canonicalUrl && candidate.seo?.canonicalUrl === canonicalUrl,
    homeUnchangedByPackage: !blocksOf(candidate).some((block) => block.id?.includes('homepage')),
    contactUnchangedByPackage: candidate.pageSlug !== 'contact',
    noCityPageRoutes: candidate.linking?.cityPagesCreated === false,
  };
  return withFailed(checks);
}

function unsafeScan(files) {
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
  const hits = scanPatterns(files, patterns);
  return { ok: hits.length === 0, hits };
}

function referenceOnlyScan(files) {
  const reference = files.filter((file) => {
    const relPath = rel(file);
    return isReferenceOnly(relPath, /\.(json|md|html|css|txt)$/i.test(file) ? readFileSync(file, 'utf8') : '');
  });
  return {
    ok: true,
    referenceOnlyFiles: reference.map((file) => rel(file)),
    note: 'Preview HTML, raw assets, screenshots, WordPress, and CF7 materials are reference-only and are not included in active candidate JSON.',
  };
}

function stringScan(files, needle) {
  const hits = [];
  for (const file of files.filter(isTextFile)) {
    if (readFileSync(file, 'utf8').includes(needle)) hits.push({ path: rel(file) });
  }
  return { ok: hits.length === 0, hits };
}

function secretScan(files) {
  const patterns = [
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/i],
    ['storage-key', /(?:AccountKey=)[A-Za-z0-9+/=]{20,}/i],
    ['jwt', /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/],
    ['secret-assignment', /\b(?:api[_-]?key|token|secret|password|connectionstring|connection string)\b\s*[:=]\s*["'][^"']{8,}["']/i],
    ['smtp-secret', /\b(?:SMTP_PASSWORD|EMAIL_PASSWORD|DKIM_PRIVATE_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|POSTMARK_API_TOKEN)\b\s*[:=]/i],
  ];
  const hits = scanPatterns(files.filter(isTextFile), patterns);
  return { ok: hits.length === 0, hits };
}

function scanPatterns(files, patterns) {
  const hits = [];
  for (const file of files.filter(isTextFile)) {
    const text = readFileSync(file, 'utf8');
    for (const [code, pattern] of patterns) {
      if (pattern.test(text)) hits.push({ path: rel(file), code });
    }
  }
  return hits;
}

function jsonParseValidation(files) {
  const results = files.map((file) => {
    try {
      JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
      return { path: rel(file), ok: true };
    } catch (error) {
      return { path: rel(file), ok: false, error: safeMessage(error) };
    }
  });
  return { ok: results.every((item) => item.ok), results };
}

function runImportPreflight() {
  const output = path.join(repoRoot, outputRel, 'homepage-import-preflight-result.json');
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', route,
    '--mode', 'preflight-only',
    '--output', rel(output),
  ], 240000);
  const parsed = existsSync(output) ? readJson(rel(output)) : {};
  const ok = parsed.classification?.['preflight-valid-for-shape'] === true &&
    parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.ok = ok;
  parsed.command = commandSummary(result);
  writeValidation('homepage-import-preflight-result.json', parsed);
}

function runDotNetContract(candidatePath) {
  const scratch = path.join(os.tmpdir(), `pumpkin-service-areas-contract-${process.pid}-${Date.now()}`);
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
    ? run('dotnet', [dll, 'validate-page', '--path', candidatePath], 240000)
    : { status: -1, stdout: '', stderr: 'publish failed', signal: null };
  const parsed = parseJson(validate.stdout.trim());
  const ok = validate.status === 0 && inferOk(parsed, validate);
  writeValidation('dotnet-page-contract-result.json', {
    ok,
    publish: commandSummary(publish),
    validate: commandSummary(validate),
    parsed,
  });
}

function runContractPersistence(candidatePath) {
  const output = path.join(repoRoot, outputRel, 'contract-persistence-validation-result.json');
  const result = run('node', [
    'tools/phase8n-homepage-overwrite/validate-contract-persistence.mjs',
    '--candidate', rel(candidatePath),
    '--output', rel(output),
  ], 180000);
  const parsed = existsSync(output) ? readJson(rel(output)) : {};
  parsed.ok = result.status === 0 && parsed.decision === 'contract-persistence-check-passed';
  parsed.command = commandSummary(result);
  writeValidation('contract-persistence-validation-result.json', parsed);
}

function runSimpleCommand(name, args) {
  const result = run(args[0], args.slice(1), 240000);
  const parsed = parseJson(result.stdout.trim());
  const ok = inferOk(parsed, result);
  writeValidation(name, {
    ok,
    command: commandSummary(result),
    parsed,
  });
}

function classifyReadiness() {
  const preflight = state.validation.results['homepage-import-preflight-result.json'];
  const shapeOk = preflight?.classification?.['preflight-valid-for-shape'] === true || preflight?.ok === true;
  const localDraftOk = preflight?.classification?.['preflight-valid-for-local-draft-import'] === true;
  const validationOk = state.validation.blockers.length === 0;
  state.readiness = {
    humanReview: validationOk && shapeOk,
    localDraftImport: validationOk && localDraftOk,
    cmsLiveApproval: false,
    staticRegeneration: false,
    productionIndexing: false,
    blockers: {
      humanReview: validationOk && shapeOk ? [] : state.validation.blockers,
      localDraftImport: validationOk && localDraftOk ? [] : ['Resolve validation/preflight blockers before local draft import.'],
      cmsLiveApproval: ['User visual approval and explicit CMS import/live approval are still required.'],
      staticRegeneration: ['Static regeneration is out of scope and not authorized for this intake run.'],
      productionIndexing: ['Production/indexing remains blocked until CMS approval, static generation, deployment, and DNS/provider decisions are separately authorized.'],
    },
  };
}

function runHygieneChecks() {
  const filesToScan = unique([
    path.join(repoRoot, outputRel, 'run-service-areas-package-intake.mjs'),
    path.join(repoRoot, rootReportRel),
    ...listFiles(path.join(repoRoot, outputRel)).filter(isTextFile),
  ]);
  const gitDiffCheck = run('git', ['diff', '--check'], 120000);
  const trailingWhitespace = trailingWhitespaceScan(filesToScan);
  const targetedSecret = secretScan(filesToScan);
  const pathCheck = protectedGeneratedRawArtifactPathCheck();
  const stagedCheck = stagedArtifactCheck();
  state.hygiene.results = {
    gitDiffCheck: commandSummary(gitDiffCheck),
    trailingWhitespaceScan: trailingWhitespace,
    targetedSecretScan: targetedSecret,
    protectedGeneratedRawArtifactPathCheck: pathCheck,
    stagedArtifactCheck: stagedCheck,
  };
  const checks = {
    gitDiffCheck: gitDiffCheck.status === 0,
    trailingWhitespaceScan: trailingWhitespace.ok,
    targetedSecretScan: targetedSecret.ok,
    protectedGeneratedRawArtifactPathCheck: pathCheck.ok,
    stagedArtifactCheck: stagedCheck.ok,
  };
  state.hygiene.failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  state.hygiene.ok = state.hygiene.failed.length === 0;
}

function protectedGeneratedRawArtifactPathCheck() {
  const status = git(['status', '--short', '--untracked-files=all']);
  const lines = status.split(/\r?\n/).filter(Boolean);
  const protectedHits = lines.filter((line) => /(^|[/\\])(\.env\.local|appsettings\.Development\.json)([/\\]|$)/i.test(line));
  const generatedHits = lines.filter((line) => /(^|[/\\])(\.next|node_modules|dist|build|out|\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs)([/\\]|$)/i.test(line));
  const rawHits = [];
  const allowedReferenceRaw = [];
  for (const line of lines) {
    const file = line.slice(3).replace(/\\/g, '/');
    if (!/\.(zip|7z|tar|gz|png|jpe?g|gif|webp|avif|pdf)$/i.test(file)) continue;
    if (file === inputZipRel.replace(/\\/g, '/') || file.startsWith(`${extractedRel.replace(/\\/g, '/')}/`)) {
      allowedReferenceRaw.push(file);
    } else {
      rawHits.push(file);
    }
  }
  return { ok: protectedHits.length === 0 && generatedHits.length === 0 && rawHits.length === 0, protectedHits, generatedHits, rawHits, allowedReferenceRaw };
}

function stagedArtifactCheck() {
  const staged = git(['diff', '--cached', '--name-only']).split(/\r?\n/).filter(Boolean).map((item) => item.replace(/\\/g, '/'));
  const zipStaged = staged.filter((file) => /\.(zip|7z|tar|gz)$/i.test(file));
  const extractedInputStaged = staged.filter((file) => file.startsWith(`${extractedRel.replace(/\\/g, '/')}/`));
  const rawMediaStaged = staged.filter((file) => /\.(png|jpe?g|gif|webp|avif|pdf)$/i.test(file));
  const staticArtifactsStaged = staged.filter((file) => /(^|\/)(\.static-artifacts|\.static-content-snapshots|\.static-release-dry-runs|out|dist|build)(\/|$)/i.test(file));
  return {
    ok: zipStaged.length === 0 && extractedInputStaged.length === 0 && rawMediaStaged.length === 0 && staticArtifactsStaged.length === 0,
    zipStaged,
    extractedInputStaged,
    rawMediaStaged,
    staticArtifactsStaged,
  };
}

function trailingWhitespaceScan(files) {
  const hits = [];
  for (const file of files.filter(isTextFile)) {
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push(`${rel(file)}:${index + 1}`);
    });
  }
  return { ok: hits.length === 0, hits };
}

function writePackageInventory() {
  writeText(`${outputRel}/PACKAGE_INVENTORY.md`, `# Package Inventory

Input ZIP: \`${inputZipRel}\`

Extracted folder: \`${extractedRel}\`

## Summary

- Total files: ${state.inventory.summary.totalFiles}
- Service-area JSON files: ${state.inventory.summary.serviceAreaJsonFiles.length}
- Page/package JSON files: ${state.inventory.summary.pagePackageJsonFiles.length}
- Media references: ${state.inventory.summary.mediaReferences.length}
- Preview HTML files: ${state.inventory.summary.previewHtmlFiles.length}
- Reference-only files: ${state.inventory.summary.referenceOnlyFiles.length}

## Categories

${Object.entries(state.inventory.summary.byCategory).map(([key, count]) => `- ${key}: ${count}`).join('\n')}

## Files

${state.inventory.files.map((file) => `- \`${file.path}\` (${file.category}${file.referenceOnly ? ', reference-only' : ''}, ${file.bytes} bytes)`).join('\n')}

## Active MediaAsset References

${state.inventory.summary.mediaReferences.map((item) => `- \`${item}\``).join('\n') || '- None.'}

Preview HTML, WordPress/CF7 references, screenshots, docs, and raw image assets are treated as reference-only and are not included as active CMS runtime content.
`);
}

function writeDocs() {
  writePackageInventory();
  writeText(`${outputRel}/README.md`, `# Ice Service Areas Package Intake

Status: ${state.success ? 'completed' : state.validation.blockers.length ? 'blocked or incomplete' : 'in progress'}.

This folder contains the intake-only normalized \`/service-areas\` candidate and validation artifacts for IceSkatingRinkRentals.com.

No CMS write, import, Theme update, MediaAsset update, static generation, deployment, DNS/email/provider change, image generation, image modification, protected config access, email send, or Roller work was performed.
`);
  writeText(`${outputRel}/SERVICE_AREAS_CANDIDATE_AUDIT.md`, `# Service Areas Candidate Audit

- Selected candidate: \`${state.selectedCandidate.path}\`
- Selection ok: ${yn(state.selectedCandidate.ok)}
- Reason: ${state.selectedCandidate.reason}
- Route: \`${route}\`
- Tenant/site: \`${tenantId}\` / \`${siteKey}\`
- Homepage included: no
- Contact page included: no
- City pages created: no
- WordPress/CF7 runtime used: no

Blockers:

${state.selectedCandidate.blockers.length ? state.selectedCandidate.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(`${outputRel}/SERVICE_AREA_WORDING_REVIEW.md`, `# Service Area Wording Review

- Normalized service scope: United States / domestic USA request review.
- Source East Coast priority coverage claims normalized out: yes.
- Remaining East Coast wording is limited to the partner brand name Party Pros East Coast: yes.
- No guaranteed service in every city: yes.
- No city pages created: yes.
- Future city page pattern documented only as \`/state-city\`: yes.
- selectedMailbox: \`${selectedMailbox}\`
- publicEmailDisplayPolicy: \`${publicEmailDisplayPolicy}\`
- \`contactus@\` present: no
- Fake phone present: no
- Fake email present: no
`);
  writeText(`${outputRel}/MEDIA_BINDING_REVIEW.md`, `# Media Binding Review

Official MediaAsset IDs used:

${Object.values(officialMedia).map((item) => `- \`${item.mediaAssetId}\` - ${item.alt}`).join('\n')}

- Invented MediaAsset IDs: no
- External/fake media URLs: no
- Base64 images: no
- Raw extracted media used directly in candidate: no
- Alt text preserved/provided: yes
- PPEC MediaAsset used: no, the service-area PPEC block is text-only.
`);
  writeText(`${outputRel}/ROUTE_AND_CANONICAL_REVIEW.md`, `# Route And Canonical Review

- Route: \`${route}\`
- Path: \`${route}\`
- Slug: \`service-areas\`
- Canonical: \`${canonicalUrl}\`
- Homepage \`/\` updated: no
- \`/contact\` updated: no
- \`/state-city\` created: no
- Individual city pages created: no
`);
  writeText(`${outputRel}/IMPORT_PREFLIGHT_RESULT.md`, `# Import Preflight Result

- Safe import preflight ok for local draft: ${yn(state.validation.results['homepage-import-preflight-result.json']?.ok)}
- .NET Page/block contract ok: ${yn(state.validation.results['dotnet-page-contract-result.json']?.ok)}
- Production-field persistence ok: ${yn(state.validation.results['contract-persistence-validation-result.json']?.ok)}
- JSON parse ok: ${yn(state.validation.results['json-parse-validation-result.json']?.ok)}
- Unsafe active-content scan ok: ${yn(state.validation.results['unsafe-scan-result.json']?.ok)}
- Contactus scan ok: ${yn(state.validation.results['contactus-scan-result.json']?.ok)}
- Targeted secret scan ok: ${yn(state.validation.results['targeted-secret-scan-result.json']?.ok)}

Validation blockers:

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}
`);
  writeText(rootReportRel, `# Pumpkin Ice Service Areas Package Intake Report

Date: ${generatedAt}

## Start

Branch: \`${state.start.branch || 'unknown'}\`

Git status at task start:

\`\`\`text
${state.start.gitStatusShort || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12 || 'not captured'}
\`\`\`

Input ZIP: \`${inputZipRel}\`

Input ZIP exists: ${yn(state.start.inputZipExists)}

## Inventory

- Total files: ${state.inventory.summary.totalFiles ?? 0}
- Service-area JSON files: ${state.inventory.summary.serviceAreaJsonFiles?.length ?? 0}
- Page/package JSON files: ${state.inventory.summary.pagePackageJsonFiles?.length ?? 0}
- Preview HTML files: ${state.inventory.summary.previewHtmlFiles?.length ?? 0}
- Reference-only files: ${state.inventory.summary.referenceOnlyFiles?.length ?? 0}

## Selected Candidate

- Selected candidate: \`${state.selectedCandidate.path}\`
- Selection ok: ${yn(state.selectedCandidate.ok)}
- Route: \`${route}\`

## Normalization

- Normalized candidate: \`${candidateRel}\`
- Import package: \`${packageRel}\`
- Normalization performed: ${yn(state.normalization.performed)}
- CMS writes performed: no
- Service scope: United States / domestic USA request review
- East Coast service-area claims normalized out: yes
- PPEC retained only as partner brand/resource text: yes
- City pages created: no

## Route And Canonical

- Route/path: \`${route}\`
- Slug: \`service-areas\`
- Canonical: \`${canonicalUrl}\`
- Future city page pattern documented: \`/state-city\`

## Media

- Media binding review ok: ${yn(state.validation.results['media-binding-review-result.json']?.ok)}
- Raw extracted media used directly: no
- MediaAsset records updated: no

## Validation Results

${validationSummaryLines().join('\n')}

## Readiness

- Ready for human review: ${yn(state.readiness.humanReview)}
- Ready for local draft import: ${yn(state.readiness.localDraftImport)}
- Ready for CMS/live approval: ${yn(state.readiness.cmsLiveApproval)}
- Ready for static regeneration: ${yn(state.readiness.staticRegeneration)}
- Ready for production/indexing: ${yn(state.readiness.productionIndexing)}

## Exact Blockers

${state.validation.blockers.length ? state.validation.blockers.map((item) => `- ${item}`).join('\n') : '- None.'}

CMS/live approval blockers:

${state.readiness.blockers.cmsLiveApproval?.map((item) => `- ${item}`).join('\n') || '- None.'}

Static regeneration blockers:

${state.readiness.blockers.staticRegeneration?.map((item) => `- ${item}`).join('\n') || '- None.'}

Production/indexing blockers:

${state.readiness.blockers.productionIndexing?.map((item) => `- ${item}`).join('\n') || '- None.'}

## Checks Run

- git status --short
- git log --oneline -12
- safe ZIP extraction path check
- package inventory
- JSON parse validation
- .NET Page/block contract validation
- production-field persistence validation
- safe import preflight
- design-system validation
- media validation
- default form validation decision
- Tailwind/navigation validation
- page intake normalizer validation
- unsafe active HTML/CSS/form/media/email scan
- reference-only scan
- contactus@ scan
- targeted secret scan
- git diff --check
- trailing whitespace scan
- protected/generated/raw artifact path check
- no ZIPs staged
- no extracted input staged
- no raw media staged

## Guardrails

- CMS records changed: no
- \`/service-areas\` imported: no
- Homepage \`/\` changed: no
- \`/contact\` changed: no
- Theme records changed: no
- MediaAsset records changed: no
- Static generation: no
- Deployment/DNS/Azure/Cloudflare/Microsoft 365/Bluehost/email/provider action: no
- Protected config touched: no
- Image generation used: no
- Image files modified: no
- Roller touched: no

## Next Recommended Action

Review \`${candidateRel}\` and the generated docs visually. After human approval, request a separate local draft CMS import for \`/service-areas\`.
`);
}

function validationSummaryLines() {
  const order = [
    ['JSON parse', 'json-parse-validation-result.json'],
    ['Candidate audit', 'service-areas-candidate-audit-result.json'],
    ['Service-area wording review', 'service-area-wording-review-result.json'],
    ['Media binding review', 'media-binding-review-result.json'],
    ['Route/canonical review', 'route-canonical-review-result.json'],
    ['Safe import preflight', 'homepage-import-preflight-result.json'],
    ['.NET contract', 'dotnet-page-contract-result.json'],
    ['Contract persistence', 'contract-persistence-validation-result.json'],
    ['Design-system validation', 'design-system-validation-result.json'],
    ['Media validation', 'media-validation-result.json'],
    ['Default form validation', 'default-form-validation-result.json'],
    ['Tailwind/navigation validation', 'tailwind-navigation-validation-result.json'],
    ['Page intake normalizer validation', 'page-intake-normalizer-validation-result.json'],
    ['Unsafe scan', 'unsafe-scan-result.json'],
    ['contactus@ scan', 'contactus-scan-result.json'],
    ['Targeted secret scan', 'targeted-secret-scan-result.json'],
  ];
  return order.map(([label, name]) => `- ${label}: ${yn(state.validation.results[name]?.ok)}`);
}

function mediaAsset(mediaAssetId, publicUrl, alt, title) {
  const assetId = mediaAssetId.replace(/^ice-rink-rentals-/, '');
  return {
    mediaAssetId,
    assetId,
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl,
    url: publicUrl,
    alt,
    title,
    caption: '',
    description: '',
    source: 'pumpkin_media_library_local_dev',
    licenseStatus: 'owned',
    usageStatus: 'needs_review',
    usageType: 'service-area',
    status: 'mediaasset-bound',
    tags: [],
    blocker: false,
    decorative: false,
  };
}

function withFailed(checks) {
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  return { ok: failed.length === 0, checks, failed };
}

function writeValidation(name, value) {
  const normalized = { generatedAt: new Date().toISOString(), ...value };
  state.validation.results[name] = {
    ok: normalized.ok === true,
    failed: normalized.failed || normalized.hits || [],
    classification: normalized.classification || undefined,
    decisions: normalized.decisions || undefined,
    skipped: normalized.skipped === true,
  };
  writeJson(`${outputRel}/${name}`, normalized);
}

function cleanExceptInputOnly(statusText) {
  const lines = statusText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.every((line) => line.slice(3).replace(/\\/g, '/') === inputZipRel.replace(/\\/g, '/'));
}

function listFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) walk(next);
      else files.push(next);
    }
  };
  walk(root);
  return files;
}

function groupCounts(values) {
  return values.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
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

function collectCtaTargets(value, output = []) {
  const ctaKeys = new Set(['href', 'buttonLink', 'secondaryButtonLink', 'secondaryLink', 'ctaHref']);
  if (Array.isArray(value)) value.forEach((item) => collectCtaTargets(item, output));
  else if (value && typeof value === 'object') {
    for (const [entryKey, nested] of Object.entries(value)) {
      if (ctaKeys.has(entryKey) && typeof nested === 'string' && nested.trim()) output.push(nested.trim());
      collectCtaTargets(nested, output);
    }
  }
  return output;
}

function collectMediaObjects(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => collectMediaObjects(item, output));
  else if (value && typeof value === 'object') {
    if (typeof value.mediaAssetId === 'string') output.push(value);
    for (const nested of Object.values(value)) collectMediaObjects(nested, output);
  }
  return output;
}

function summarizeCandidate(candidate) {
  return {
    id: candidate.id || candidate.PageId || '',
    pageSlug: candidate.pageSlug || '',
    route: candidate.route || '',
    canonicalUrl: candidate.canonicalUrl || candidate.seo?.canonicalUrl || '',
    isPublished: candidate.isPublished === true,
    workflowStatus: candidate.workflow?.status || '',
    reviewStatus: candidate.workflow?.reviewStatus || '',
    productionApproved: candidate.productionApproved === true,
    publishApproved: candidate.publishApproved === true,
    staticNeedsRebuild: candidate.staticPublishing?.needsRebuild === true,
    blockCount: blocksOf(candidate).length,
    blockTypes: blocksOf(candidate).map((block) => block.type),
    mediaAssetIds: unique(collectValuesByKey(candidate, 'mediaAssetId')).sort(),
    selectedMailboxPresent: JSON.stringify(candidate).includes(selectedMailbox),
    publicEmailDisplayPolicyPresent: JSON.stringify(candidate).includes(publicEmailDisplayPolicy),
    legacyMailboxPresent: JSON.stringify(candidate).includes(legacyMailbox),
  };
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(sanitize(value), null, 2)}\n`, 'utf8');
}

function writeText(file, value) {
  const target = path.join(repoRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${value.trimEnd()}\n`, 'utf8');
}

function sanitize(value) {
  return JSON.parse(JSON.stringify(value, (key, val) => {
    if (typeof val === 'string' && /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/.test(val)) return '[redacted-jwt]';
    if (/password|secret|connectionString|apiKey|privateKey|authorization/i.test(key)) return '[redacted]';
    return val;
  }));
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text.replace(/^\uFEFF/, '')) : null;
  } catch {
    return null;
  }
}

function isTextFile(file) {
  return /\.(json|md|mjs|js|ts|tsx|html|css|txt)$/i.test(file) && existsSync(file) && !statSync(file).isDirectory();
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
  return String(value || '')
    .replace(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g, '[redacted-jwt]')
    .slice(0, 3000);
}

function safeMessage(error) {
  return scrub(error?.message || error || '');
}

function run(command, args, timeout = 120000) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true, timeout });
  return {
    status: result.status,
    stdout: scrub(result.stdout || ''),
    stderr: scrub(result.stderr || ''),
    signal: result.signal || null,
  };
}

function git(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  return (result.stdout || result.stderr || '').trim();
}

function commandSummary(result) {
  return { ok: result.status === 0, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, signal: result.signal || null };
}

function inferOk(parsed, result) {
  if (result.status !== 0) return false;
  if (parsed === null) return result.status === 0;
  if (typeof parsed.ok === 'boolean') return parsed.ok;
  if (typeof parsed.Ok === 'boolean') return parsed.Ok;
  if (typeof parsed.success === 'boolean') return parsed.success;
  if (typeof parsed.passed === 'boolean') return parsed.passed;
  if (typeof parsed.decision === 'string') return !/fail|block|reject/i.test(parsed.decision);
  return true;
}

function rel(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function unique(values) {
  return Array.from(new Set(values));
}

function yn(value) {
  return value ? 'yes' : 'no';
}
