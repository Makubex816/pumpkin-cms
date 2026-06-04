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
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outputRel = 'content-review/ice-final-contact-validated';
const outputDir = path.join(repoRoot, outputRel);
const inputRel = 'content-review/ice-final-contact-input';
const extractedRel = `${inputRel}/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite`;
const rootReportRel = 'PUMPKIN_ICE_FINAL_CONTACT_PACKAGE_INTAKE_REPORT.md';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const route = '/contact';
const pageSlug = 'contact';
const canonicalUrl = 'https://iceskatingrinkrentals.com/contact';
const selectedMailbox = ['contact', 'iceskatingrinkrentals.com'].join('@');
const legacyMailbox = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const publicEmailDisplayPolicy = 'form-first-under-review';
const staticEndpointRef = 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT';
const leadRecipientRef = 'ICE_RINK_RENTALS_LEAD_RECIPIENT';
const generatedAt = new Date().toISOString();

const inputFiles = {
  zip: `${inputRel}/ice-contact-page-phase9e-visual-pumpkin-rewrite.zip`,
  full: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.full.json`,
  content: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.content.json`,
  mediaManifest: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.media-manifest.json`,
  formsRouting: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.forms-routing.json`,
  schema: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.schema.json`,
  previewHtml: `${extractedRel}/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.preview.html`,
  sharedForm: `${extractedRel}/shared/ice-rink-rentals.contact-form-block.phase9e.json`,
};

const files = {
  readme: `${outputRel}/README.md`,
  inventory: `${outputRel}/PACKAGE_INVENTORY.md`,
  candidateAudit: `${outputRel}/CONTACT_CANDIDATE_AUDIT.md`,
  formRouting: `${outputRel}/FORM_ROUTING_REVIEW.md`,
  mediaBinding: `${outputRel}/MEDIA_BINDING_REVIEW.md`,
  routeCanonical: `${outputRel}/ROUTE_AND_CANONICAL_REVIEW.md`,
  preflightMd: `${outputRel}/IMPORT_PREFLIGHT_RESULT.md`,
  candidate: `${outputRel}/CONTACT_NORMALIZED_CANDIDATE.json`,
  importPackage: `${outputRel}/CONTACT_IMPORT_PACKAGE.json`,
  manifest: `${outputRel}/manifest.json`,
  jsonParse: `${outputRel}/json-parse-validation-result.json`,
  dotnet: `${outputRel}/dotnet-page-contract-result.json`,
  productionPersistence: `${outputRel}/production-field-persistence-validation-result.json`,
  safePreflight: `${outputRel}/safe-import-preflight-result.json`,
  designSystem: `${outputRel}/design-system-validation-result.json`,
  mediaValidation: `${outputRel}/media-validation-result.json`,
  defaultForm: `${outputRel}/default-form-validation-result.json`,
  tailwind: `${outputRel}/tailwind-navigation-validation-result.json`,
  normalizer: `${outputRel}/page-intake-normalizer-validation-result.json`,
  unsafeScan: `${outputRel}/unsafe-scan-result.json`,
  contactusScan: `${outputRel}/contactus-scan-result.json`,
  routeCanonicalJson: `${outputRel}/route-canonical-validation-result.json`,
  secretScan: `${outputRel}/targeted-secret-scan-result.json`,
  finalHygiene: `${outputRel}/final-hygiene-result.json`,
};

const officialMedia = {
  logo: {
    mediaAssetId: 'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
    assetId: 'iceskatingrinkrentalslogo-0d1f970f0411',
    publicUrl: '/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png',
    alt: 'Ice Rink Rentals logo with ice skate and snowflake graphic',
    title: 'Ice Rink Rentals Logo',
  },
  winter: {
    mediaAssetId: 'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
    assetId: 'winterfesticerinkrentals-324b1b89777d',
    publicUrl: '/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png',
    alt: 'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    title: 'Winter Festival Portable Ice Rink',
  },
  corporate: {
    mediaAssetId: 'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
    assetId: 'corporateicerinkrentalevent-18e985ca59bd',
    publicUrl: '/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png',
    alt: 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    title: 'Corporate Ice Rink Rental Event',
  },
  holiday: {
    mediaAssetId: 'ice-rink-rentals-holidayicerink-973ce7691377',
    assetId: 'holidayicerink-973ce7691377',
    publicUrl: '/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png',
    alt: 'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    title: 'Holiday Portable Ice Rink',
  },
  setup: {
    mediaAssetId: 'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
    assetId: 'icerinkrentalssetup-113d218572e4',
    publicUrl: '/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png',
    alt: 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    title: 'Portable Ice Rink Setup',
  },
  ppec: {
    mediaAssetId: 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
    assetId: 'partyproseastcoastlogo-cfd1fc9f60ae',
    publicUrl: '/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png',
    alt: 'Party Pros East Coast logo',
    title: 'Party Pros East Coast Logo',
  },
};

const state = {
  schemaVersion: 'pumpkin.ice.final-contact-package-intake.v1',
  generatedAt,
  start: {
    branch: git(['branch', '--show-current']).trim(),
    gitStatusShort: git(['status', '--short', '--untracked-files=all']),
    gitLogOneline12: git(['log', '--oneline', '-12']),
    notes: [
      'Manual start check was run before output generation.',
      'The starting worktree was not fully clean because the raw contact ZIP and known service-area raw input package were untracked.',
    ],
  },
  input: {
    folder: inputRel,
    zipExists: existsSync(abs(inputFiles.zip)),
    extractedExists: existsSync(abs(extractedRel)),
    selectedCandidate: inputFiles.full,
    inventory: null,
  },
  selection: {
    selected: inputFiles.full,
    reason: '',
    rejected: [],
  },
  normalization: {
    route,
    pageSlug,
    canonicalUrl,
    blockTypes: [],
    formBlockPresent: false,
    mediaAssetIds: [],
    noContactus: false,
    noFakePhone: false,
    noFakeEmail: false,
    noRawHtmlForm: false,
    noBase64: false,
    noExternalFakeMedia: false,
    ppecLogoBound: false,
  },
  validation: {
    ok: false,
    results: {},
    failed: [],
  },
  readiness: {
    readyForHumanReview: false,
    readyForLocalDraftImport: false,
    readyForCmsLiveApproval: false,
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
    blockers: [],
  },
  safety: {
    cmsWrites: false,
    homepageWrite: false,
    serviceAreasWrite: false,
    contactImport: false,
    stateCityCreated: false,
    themeWrite: false,
    mediaAssetWrite: false,
    staticGeneration: false,
    deployment: false,
    dnsAzureCloudflareMicrosoft365BluehostEmailProviderChange: false,
    emailSent: false,
    protectedConfigRead: false,
    rollerTouched: false,
    imageGeneration: false,
    imageModification: false,
    packageExecuted: false,
  },
};

main();

function main() {
  mkdirSync(outputDir, { recursive: true });
  assertInputs();

  const packageData = readPackage();
  state.input.inventory = inventoryPackage(packageData);
  const candidate = buildCandidate(packageData);
  const importPackage = buildImportPackage(candidate, packageData);
  writeJson(files.candidate, candidate);
  writeJson(files.importPackage, importPackage);

  runValidation(candidate);
  classifyReadiness();
  writeReports(candidate, importPackage);
  runFinalHygiene();
  classifyReadiness();
  writeReports(candidate, importPackage);

  console.log(JSON.stringify({
    success: state.validation.ok && state.readiness.readyForHumanReview && state.readiness.readyForLocalDraftImport,
    selectedCandidate: state.selection.selected,
    normalizedCandidate: files.candidate,
    importPackage: files.importPackage,
    report: rootReportRel,
    validationOk: state.validation.ok,
    readiness: state.readiness,
    cmsWrites: false,
    safety: state.safety,
  }, null, 2));

  if (!state.validation.ok) process.exitCode = 1;
}

function assertInputs() {
  if (!existsSync(abs(inputRel))) throw new Error(`Missing input folder: ${inputRel}`);
  if (!existsSync(abs(inputFiles.zip))) throw new Error(`Missing contact package ZIP: ${inputFiles.zip}`);
  if (!existsSync(abs(extractedRel))) {
    throw new Error(`Missing extracted contact package: ${extractedRel}. Extract the ZIP safely before running this intake.`);
  }
  for (const [label, file] of Object.entries(inputFiles)) {
    if (label === 'zip') continue;
    if (!existsSync(abs(file))) throw new Error(`Missing expected package file: ${file}`);
  }
}

function readPackage() {
  const full = readJson(inputFiles.full);
  const content = readJson(inputFiles.content);
  const mediaManifest = readJson(inputFiles.mediaManifest);
  const formsRouting = readJson(inputFiles.formsRouting);
  const schema = readJson(inputFiles.schema);
  const sharedForm = readJson(inputFiles.sharedForm);
  state.selection.reason = 'The full Phase 9E contact package has the correct tenant/site, /contact route, content blocks, form routing, SEO, media manifest, and draft workflow metadata. Content-only, forms-routing, media-manifest, schema, preview HTML, and assets are supporting/reference files.';
  state.selection.rejected = [
    { path: inputFiles.content, reason: 'Partial content-only file; useful as source content but not a full Page candidate.' },
    { path: inputFiles.formsRouting, reason: 'Form/routing reference only; not a Page candidate.' },
    { path: inputFiles.mediaManifest, reason: 'Media manifest only; not a Page candidate.' },
    { path: inputFiles.schema, reason: 'Schema/SEO reference only; not a Page candidate.' },
    { path: inputFiles.previewHtml, reason: 'Preview HTML is reference only and is not used as runtime CMS content.' },
    { path: inputFiles.sharedForm, reason: 'Shared form reference only; normalized candidate uses Pumpkin formBlock/default-quote-request.' },
  ];
  return { full, content, mediaManifest, formsRouting, schema, sharedForm };
}

function inventoryPackage(packageData) {
  const allFiles = listFiles(abs(inputRel)).map(rel).sort();
  const inventory = {
    allFiles,
    contactJsonFiles: allFiles.filter((file) => file.includes('/contact/') && file.endsWith('.json')),
    packageJsonFiles: allFiles.filter((file) => file.endsWith('.json') && !file.includes('/contact/')),
    mediaReferences: packageData.mediaManifest.mediaAssets || packageData.full.mediaAssets || [],
    formReferences: [inputFiles.formsRouting, inputFiles.sharedForm].filter((file) => existsSync(abs(file))),
    schemaSeoFiles: [inputFiles.schema, inputFiles.full].filter((file) => existsSync(abs(file))),
    styleFiles: allFiles.filter((file) => /\.(css|scss|sass|less)$/i.test(file)),
    previewHtmlFiles: allFiles.filter((file) => /\.html?$/i.test(file)),
    cf7WordPressReferenceFiles: allFiles.filter((file) => /cf7|contact-form-7|wordpress|wp-/i.test(file)),
    readmeInstructionFiles: allFiles.filter((file) => /\.(md|txt)$/i.test(file)),
    rawMediaFiles: allFiles.filter((file) => /\.(png|jpe?g|webp|gif|avif)$/i.test(file)),
    zipFiles: allFiles.filter((file) => /\.(zip|7z|tar|gz)$/i.test(file)),
  };
  return inventory;
}

function buildCandidate({ full, content, formsRouting }) {
  const now = new Date().toISOString();
  const sourceBlocks = Array.isArray(content.blocks) ? content.blocks : full.blocks || [];
  const heroSource = byId(sourceBlocks, 'contact-hero') || {};
  const quoteSource = byId(sourceBlocks, 'quote-form-section') || {};
  const detailSource = byId(sourceBlocks, 'quote-detail-cards') || {};
  const processSource = byId(sourceBlocks, 'what-happens-next') || {};
  const aboutSource = byId(sourceBlocks, 'about-ice-rink-rentals') || {};
  const eventSource = byId(sourceBlocks, 'event-types-supported') || {};
  const ppecSource = byId(sourceBlocks, 'partner-referral-party-pros-east-coast') || {};
  const faqSource = byId(sourceBlocks, 'contact-faq') || {};
  const finalCtaSource = byId(sourceBlocks, 'contact-final-cta') || {};
  const formSource = formsRouting.formBlock || full.formBlock || {};

  const blocks = [
    heroBlock(heroSource),
    trustBarBlock(),
    quoteSplitFeatureBlock(quoteSource),
    formBlock(formSource),
    planningTopicsBlock(detailSource),
    processStepsBlock(processSource),
    aboutSplitFeatureBlock(aboutSource),
    eventGridBlock(eventSource),
    ppecPartnerBlock(ppecSource),
    faqBlock(faqSource),
    finalCtaBlock(finalCtaSource),
  ];

  const page = {
    id: 'ice-rink-rentals-contact',
    PageId: 'ice-rink-rentals-contact',
    tenantId,
    siteKey,
    slug: pageSlug,
    pageSlug,
    PageSlug: pageSlug,
    route,
    path: route,
    canonicalUrl,
    PageVersion: 1,
    Layout: 'default',
    isPublished: false,
    includeInSitemap: false,
    productionApproved: false,
    publishApproved: false,
    publishedAt: null,
    MetaData: {
      category: 'rentals',
      product: 'portable ice rink',
      keyword: full.seo?.focusKeyword || 'ice rink rental quote',
      pageType: 'contact',
      title: full.seo?.title || 'Request an Ice Rink Rental Quote | Ice Rink Rentals',
      description: full.seo?.metaDescription || 'Request a portable ice rink rental quote from Ice Rink Rentals.',
      createdAt: now,
      updatedAt: now,
      author: 'Ice Skating Rink Rentals Team',
      language: 'en-us',
      market: 'us',
    },
    seo: {
      title: full.seo?.title || 'Request an Ice Rink Rental Quote | Ice Rink Rentals',
      metaTitle: full.seo?.title || 'Request an Ice Rink Rental Quote | Ice Rink Rentals',
      description: full.seo?.metaDescription || 'Request a portable ice rink rental quote from Ice Rink Rentals.',
      metaDescription: full.seo?.metaDescription || 'Request a portable ice rink rental quote from Ice Rink Rentals.',
      canonicalUrl,
      robots: 'noindex,nofollow',
      openGraph: {
        title: full.seo?.openGraph?.title || full.seo?.title || 'Request an Ice Rink Rental Quote | Ice Rink Rentals',
        description: full.seo?.openGraph?.description || full.seo?.metaDescription || '',
        image: media('winter', 'open-graph'),
        type: 'website',
        url: canonicalUrl,
      },
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword: full.seo?.focusKeyword || 'ice rink rental quote',
      tags: full.seo?.secondaryKeywords || [],
      contentSummary: full.seo?.metaDescription || '',
      blockTypes: blocks.map((block) => block.type),
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    media: {
      featuredImage: media('winter', 'featured-image'),
      heroImage: media('winter', 'hero'),
      localImage: media('corporate', 'contact-feature'),
      closingImage: media('holiday', 'closing'),
      openGraphImage: media('winter', 'open-graph'),
      logo: media('logo', 'brand-logo'),
      setupImage: media('setup', 'setup'),
      ppecPartnerLogo: media('ppec', 'partner-logo'),
    },
    mediaRequirements: mediaRequirements(),
    formConfig: {
      formId: 'ice-rink-rentals-default-quote-request',
      formType: 'quote_request',
      conversionGoal: 'contact_quote_form_submit',
      routingMode: 'form_block_static_endpoint_metadata',
      domainRoutingKey: leadRecipientRef,
      replyToMode: 'submitter_email',
      emailSubjectTemplate: 'Portable ice rink rental quote request',
      mailtoFallbackEnabled: false,
      thankYouUrl: '/contact',
      thankYouMessage: formSource.successMessage || 'Thank you. Your ice rink rental request has been received for review.',
      recipientGroup: leadRecipientRef,
      staticFormEndpointKey: staticEndpointRef,
      normalizedFieldMap: {
        name: 'fullName',
        email: 'email',
        phone: 'phone',
        eventLocation: 'eventCityState',
        eventDate: 'eventDateOrDateRange',
        message: 'message',
      },
      requiresConsent: true,
      consentRequired: true,
      spamProtectionRequired: true,
      spamProtectionEnabled: true,
      realEmailSendingEnabled: false,
    },
    formDefinitions: [],
    domainRouting: {
      domain: 'iceskatingrinkrentals.com',
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
      primaryPhone: '(844) 727-8947',
      primaryPhoneHref: 'tel:+18447278947',
      primaryPhoneApprovalStatus: 'project-owner-provided-in-contact-package',
      mailtoLinksEnabled: false,
      defaultLeadRoutingMode: 'form_block_static_endpoint_metadata',
      defaultRecipientGroup: leadRecipientRef,
      staticFormEndpointKey: staticEndpointRef,
      leadRecipientRef,
      staticEndpointRef,
      emailProvider: '',
      selectedEmailProvider: 'under-review',
      pumpkinAppSendStatus: 'disabled_review_only',
      emailProviderStatus: 'selected_mailbox_metadata_only',
      realEmailSendingEnabled: false,
      mxStatus: '',
      spfStatus: '',
      dkimStatus: '',
      dmarcStatus: '',
      notes: 'Selected mailbox is metadata only; public email display remains form-first/under-review and no live sending is enabled.',
    },
    workflow: {
      status: 'draft',
      reviewStatus: 'needs_review',
      approvedForImport: false,
      approvedForPublish: false,
      productionApproved: false,
      publishApproved: false,
      approvedBy: '',
      approvedAt: '',
      lastEditedBy: 'codex_final_contact_intake',
      lastEditedAt: now,
    },
    revision: {
      currentRevisionId: 'ice-rink-rentals-contact:phase9e-intake-candidate',
      revisionNumber: 1,
      revisionLabel: 'phase9e-final-contact-intake',
      lastSnapshotAt: '',
      lastRevisionAt: now,
      lastRevisionBy: 'codex_final_contact_intake',
      rollbackAvailable: false,
      rollbackNotes: 'Intake/validation candidate only; no CMS import occurred.',
      lastChangeSummary: 'Normalize final updated /contact package for review and local draft import readiness; no CMS writes.',
      lastChangedBy: 'codex_final_contact_intake',
      lastChangeSource: 'final_contact_package_intake',
      lastChangeAt: now,
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
    },
    template: {
      templateKey: 'ice-contact-phase9e-normalized',
      templateVersion: 'phase9e-normalized-intake.v1',
      layoutVariant: 'production-renderer-compatible',
      contentModelVersion: 'phase9e-contact-normalized.v1',
    },
    linking: {
      hubPage: '/',
      parentPage: '/',
      relatedPages: ['/', '/service-areas'],
      requiredLinks: ['/', '/service-areas'],
      breadcrumbTrail: ['/', '/contact'],
    },
    schemaControls: {
      enableWebPageSchema: true,
      enableBreadcrumbSchema: true,
      enableFAQSchema: true,
      enableServiceSchema: false,
      schemaWarnings: ['Contact page schema remains draft/needs_review until visual approval and CMS import approval.'],
    },
    serviceSchema: {
      serviceName: 'Portable Ice Rink Rental Quote Request',
      serviceType: 'Portable Ice Rink Rentals',
      serviceCategory: 'Event rental planning',
      productsOffered: [{
        name: 'Portable ice skating rink rental planning',
        type: 'Service',
        description: 'Review-only portable ice skating rink rental planning and quote intake.',
        url: canonicalUrl,
        category: 'event rentals',
        isPrimary: true,
        displayOrder: 1,
      }],
      areasServed: [{
        name: 'United States',
        type: 'Country',
        country: 'US',
        url: canonicalUrl,
        serviceAreaType: 'domestic-usa-review-only',
        confidence: 'review',
        isPrimary: true,
      }],
      schemaOutputMode: 'disabled_until_review',
      publicSchemaEnabled: false,
      notes: 'No city, state-city, or local service page was created in this intake.',
    },
    pageQuality: {
      status: 'needs_review',
      warnings: [
        'Human visual approval is required before CMS/live approval.',
        'This run is intake/validation only and did not import /contact.',
        'Static generation and production indexing are not authorized.',
      ],
      blockingIssues: [],
      lastCheckedAt: now,
      uniqueValueReason: 'Final contact package normalized into Pumpkin Page blocks with visible default quote request formBlock.',
      buyerIntent: 'portable ice rink rental quote request',
      landingPageType: 'contact',
      launchNotes: 'Do not import, approve, regenerate static, deploy, or index without explicit authorization.',
    },
    importProvenance: {
      lastImportBatchId: '',
      sourceFile: inputFiles.full,
      sourceRow: '',
      externalId: 'ice-contact-page-phase9e-visual-pumpkin-rewrite',
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

  summarizeNormalization(page);
  return page;
}

function heroBlock(source) {
  const content = source.content || {};
  return {
    type: 'Hero',
    id: 'contact-hero-media',
    name: 'Contact Hero',
    enabled: true,
    content: {
      sectionVariant: 'heroMedia',
      type: 'Main',
      eyebrow: content.eyebrow || 'Quote planning for portable ice rink events',
      headline: content.headline || 'Request an Ice Rink Rental Quote',
      subheadline: content.subheadline || '',
      supportingCopy: content.supportingCopy || '',
      buttonText: 'Start Your Quote Request',
      buttonLink: '#contact',
      secondaryButtonText: 'View Service Areas',
      secondaryButtonLink: '/service-areas',
      media: media('winter', 'hero'),
      primaryCta: { label: 'Start Your Quote Request', text: '', href: '#contact', url: '', target: '' },
      secondaryCta: { label: 'View Service Areas', text: '', href: '/service-areas', url: '', target: '' },
      supportingPoints: content.quickFacts || [],
    },
  };
}

function trustBarBlock() {
  return {
    type: 'TrustBar',
    id: 'contact-request-basics',
    name: 'Contact Request Basics',
    enabled: true,
    content: {
      sectionVariant: 'trustBand',
      eyebrow: 'Before you submit',
      title: 'What helps the quote review',
      subtitle: 'The form-first quote path keeps event details organized before availability or setup direction is represented.',
      items: [
        { icon: 'MapPin', title: 'Location and timing', text: 'Share the event city, state, preferred date, event window, and venue timing details.', alt: '' },
        { icon: 'Ruler', title: 'Surface and access', text: 'Describe the surface, approximate footprint, loading access, indoor or outdoor setting, and power notes.', alt: '' },
        { icon: 'Users', title: 'Guest experience', text: 'Include guest count, event goals, rink role, and support needs such as skates, aids, lighting, or staffing.', alt: '' },
      ],
    },
  };
}

function quoteSplitFeatureBlock(source) {
  const content = source.content || {};
  return {
    type: 'CardGrid',
    id: 'contact-quote-form-intro',
    name: 'Quote Form Intro',
    enabled: true,
    content: {
      sectionVariant: 'splitFeature',
      eyebrow: content.eyebrow || 'Start your request',
      title: content.heading || 'Share the details that shape a better quote',
      subtitle: content.body || '',
      description: content.body || '',
      layout: 'grid',
      media: media('setup', 'contact-form-intro'),
      image: media('setup', 'contact-form-intro'),
      bullets: [
        'Event city, state, date, and venue type',
        'Surface, space, access, and timing notes',
        'Guest count, event goals, and support needs',
        'Form-first routing through Pumpkin CMS metadata',
      ],
      topics: [],
      cards: [],
    },
  };
}

function formBlock(source) {
  return {
    type: 'formBlock',
    id: 'contact-quote-form',
    name: 'Default Quote Request Form',
    enabled: true,
    content: {
      sectionVariant: '',
      id: 'contact-quote-form',
      label: 'Ice quote request form',
      formKey: 'default-quote-request',
      variant: 'quote-form-panel',
      heading: source.title || 'Request an Ice Rink Rental Quote',
      intro: source.description || 'Share the event details you have now. The team can review the request and help outline the next steps for a portable rink setup.',
      submitLabel: source.submitLabel || 'Request My Quote',
      successMessage: source.successMessage || 'Thank you. Your ice rink rental request has been received for review.',
      errorMessage: 'Please review the required fields and try again.',
      staticEndpointRef,
      leadRecipientRef,
      sourcePage: '/contact',
      selectedMailboxMetadata: selectedMailbox,
      emailSendingEnabled: false,
      realEmailSendingEnabled: false,
      review: {
        status: 'needs_review',
        notes: 'Visible structured formBlock; no WordPress form runtime dependency or raw form HTML is stored.',
      },
      validation: {
        expected: 'visible default-quote-request formBlock with non-secret endpoint and lead recipient refs',
      },
    },
  };
}

function planningTopicsBlock(source) {
  const content = source.content || {};
  const topics = (content.cards || []).map((card) => ({
    title: card.title || '',
    description: card.description || '',
    media: emptyMedia(),
    image: '',
    'image-alt': '',
    icon: card.icon || '',
    link: '',
    alt: '',
  }));
  return {
    type: 'CardGrid',
    id: 'contact-quote-detail-topics',
    name: 'Quote Detail Topics',
    enabled: true,
    content: {
      sectionVariant: 'planningTopics',
      eyebrow: content.eyebrow || 'Helpful details',
      title: content.heading || 'What to include in your request',
      subtitle: content.body || '',
      description: '',
      layout: 'grid',
      media: emptyMedia(),
      image: emptyMedia(),
      bullets: [],
      topics,
      cards: [],
    },
  };
}

function processStepsBlock(source) {
  const content = source.content || {};
  return {
    type: 'HowItWorks',
    id: 'contact-review-process',
    name: 'Contact Review Process',
    enabled: true,
    content: {
      sectionVariant: 'processSteps',
      eyebrow: content.eyebrow || 'After you submit',
      title: content.heading || 'A clear review process for your event',
      subtitle: content.body || '',
      steps: (content.steps || []).map((step) => ({
        title: step.title || '',
        text: step.description || step.text || '',
        image: '',
        alt: '',
      })),
    },
  };
}

function aboutSplitFeatureBlock(source) {
  const content = source.content || {};
  return {
    type: 'CardGrid',
    id: 'about-ice-rink-rentals-contact',
    name: 'About Ice Rink Rentals Contact Feature',
    enabled: true,
    content: {
      sectionVariant: 'splitFeature',
      eyebrow: content.eyebrow || 'About Ice Rink Rentals',
      title: content.heading || 'Portable rink planning built around the event',
      subtitle: '',
      description: content.body || '',
      layout: 'grid',
      media: media('corporate', 'contact-about-feature'),
      image: media('corporate', 'contact-about-feature'),
      bullets: content.bullets || [],
      topics: [],
      cards: [],
    },
  };
}

function eventGridBlock(source) {
  const content = source.content || {};
  const cards = (content.cards || []).map((card, index) => ({
    title: card.title || '',
    description: card.description || '',
    media: media(index === 1 ? 'corporate' : index === 2 ? 'holiday' : 'winter', 'contact-event-card'),
    image: '',
    'image-alt': '',
    icon: '',
    link: '',
    alt: '',
    ctaLabel: 'Start Request',
    ctaHref: '#contact',
  }));
  return {
    type: 'CardGrid',
    id: 'contact-event-types-supported',
    name: 'Contact Event Types',
    enabled: true,
    content: {
      sectionVariant: 'mediaUseCaseGrid',
      eyebrow: content.eyebrow || 'Event fit',
      title: content.heading || 'Requests we commonly review',
      subtitle: content.body || '',
      description: '',
      layout: 'grid',
      media: emptyMedia(),
      image: emptyMedia(),
      bullets: [],
      topics: [],
      cards,
    },
  };
}

function ppecPartnerBlock(source) {
  const content = source.content || {};
  const logo = media('ppec', 'partner-logo');
  return {
    type: 'PrimaryCTA',
    id: 'contact-party-pros-east-coast-partner-resource',
    name: 'Party Pros East Coast Partner Resource',
    enabled: true,
    content: {
      sectionVariant: 'partnerResourceCta',
      eyebrow: 'Partner resource',
      title: content.heading || 'Planning event entertainment beyond the rink?',
      headline: content.heading || 'Planning event entertainment beyond the rink?',
      description: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs attractions, concessions, interactive games, arcade games, casino-style games, and related event entertainment, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
      subtitle: 'Ice Rink Rentals can help with the portable rink rental conversation. If your event also needs attractions, concessions, interactive games, arcade games, casino-style games, and related event entertainment, Party Pros East Coast may be a helpful partner resource to review alongside your rink rental plan.',
      visualTreatment: 'partnerResourceCta',
      partnerCtaLabel: 'Explore Party Pros East Coast',
      secondaryButtonText: 'Request Ice Rink Rental Info',
      secondaryButtonLink: '#contact',
      cta: { label: 'Explore Party Pros East Coast', href: 'https://partyproseastcoast.com/' },
      partner: {
        name: 'Party Pros East Coast',
        displayRole: 'Event entertainment partner resource',
        url: 'https://partyproseastcoast.com/',
        urlSource: 'phase9e-contact-intake',
        logoMedia: logo,
      },
      logoMedia: logo,
      partnerLogoMediaAssetId: logo.mediaAssetId,
      rel: 'noopener noreferrer',
      notes: content.serviceScopeNote || 'PPEC wording is partner/resource only and does not replace Ice Rink Rentals service-area scope.',
    },
  };
}

function faqBlock(source) {
  const content = source.content || {};
  return {
    type: 'FAQ',
    id: 'contact-faq',
    name: 'Contact FAQs',
    enabled: true,
    content: {
      sectionVariant: 'faqAccordion',
      title: content.heading || 'Ice rink rental quote FAQs',
      subtitle: 'Questions before you submit',
      layout: 'accordion',
      items: content.items || [],
      eyebrow: content.eyebrow || 'Questions before you submit',
    },
  };
}

function finalCtaBlock(source) {
  const content = source.content || {};
  return {
    type: 'PrimaryCTA',
    id: 'contact-final-cta',
    name: 'Contact Final CTA',
    enabled: true,
    content: {
      sectionVariant: 'finalCta',
      eyebrow: '',
      title: content.heading || 'Ready to bring skating to your event?',
      headline: content.heading || 'Ready to bring skating to your event?',
      description: content.body || '',
      subtitle: content.body || '',
      buttonText: 'Start Your Quote Request',
      buttonLink: '#contact',
      secondaryButtonText: 'View Service Areas',
      secondaryButtonLink: '/service-areas',
      primaryCta: { label: 'Start Your Quote Request', href: '#contact' },
      secondaryCta: { label: 'View Service Areas', href: '/service-areas' },
      backgroundImage: '',
      mainImage: '',
      alt: '',
    },
  };
}

function buildImportPackage(candidate, packageData) {
  return {
    schemaVersion: 'pumpkin.ice.final-contact-import-package.v1',
    generatedAt,
    tenantId,
    siteKey,
    route,
    sourcePackage: inputFiles.zip,
    selectedSourceCandidate: inputFiles.full,
    pages: [candidate],
    contactMetadata: {
      businessDisplayName: 'Ice Rink Rentals',
      selectedMailbox,
      publicEmailDisplayPolicy,
      formKey: 'default-quote-request',
      sourcePage: '/contact',
      staticEndpointRef,
      leadRecipientRef,
      realEmailSendingEnabled: false,
    },
    mediaManifest: {
      source: inputFiles.mediaManifest,
      officialMediaAssetIds: Object.values(officialMedia).map((item) => item.mediaAssetId),
      sourceMediaAssets: packageData.mediaManifest.mediaAssets || [],
      ppecLogoBoundToApprovedMediaAssetId: officialMedia.ppec.mediaAssetId,
    },
    referenceOnly: {
      previewHtml: inputFiles.previewHtml,
      rawAssets: state.input.inventory?.rawMediaFiles || [],
      rawForms: [inputFiles.formsRouting, inputFiles.sharedForm],
      wordpressFormRuntimeBehaviorUsed: false,
    },
    readiness: state.readiness,
    guardrails: state.safety,
  };
}

function runValidation(candidate) {
  writeValidation(files.jsonParse, jsonParseValidation([files.candidate, files.importPackage]));
  writeValidation(files.productionPersistence, productionFieldPersistenceValidation(candidate));
  writeValidation(files.routeCanonicalJson, routeCanonicalValidation(candidate));
  writeValidation(files.unsafeScan, unsafeScan([files.candidate, files.importPackage]));
  writeValidation(files.contactusScan, stringScan([files.candidate, files.importPackage], legacyMailbox));
  writeValidation(files.secretScan, secretScan([files.candidate, files.importPackage]));
  runImportPreflight(files.candidate, files.safePreflight);
  runDotNetContract(files.candidate);
  runSimpleCommand(files.designSystem, ['node', 'tools/design-system-validation/validate-fixtures.mjs']);
  runSimpleCommand(files.mediaValidation, ['node', 'tools/media-validation/validate-media-fixtures.mjs']);
  runDefaultFormValidation(candidate);
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
    files.tailwind,
    files.normalizer,
    files.unsafeScan,
    files.contactusScan,
    files.routeCanonicalJson,
    files.secretScan,
  ];
  state.validation.failed = required
    .filter((file) => state.validation.results[path.basename(file)]?.ok !== true)
    .map((file) => path.basename(file));
  state.validation.ok = state.validation.failed.length === 0;
}

function productionFieldPersistenceValidation(candidate) {
  const text = JSON.stringify(candidate);
  const active = JSON.stringify(activePageOnly(candidate));
  const mediaIds = collectValuesByKey(candidate, 'mediaAssetId').filter(Boolean);
  const blocks = blocksOf(candidate);
  const variants = blocks.map((block) => block.content?.sectionVariant || block.content?.variant || '').filter(Boolean);
  const form = blocks.find((block) => block.type === 'formBlock');
  const fakePhonePattern = /\b(?:555[-.\s]?\d{4}|000[-.\s]?000[-.\s]?0000|123[-.\s]?456[-.\s]?7890)\b/;
  const fakeEmailPattern = /\b(?:hello|info|test|example|fake|noreply)@iceskatingrinkrentals\.com\b|example\.com/i;
  const mediaUrlValues = collectValuesByKey(candidate, 'url')
    .concat(collectValuesByKey(candidate, 'publicUrl'))
    .filter(Boolean);
  const checks = {
    tenant: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    route: candidate.route === route && candidate.path === route && candidate.pageSlug === pageSlug && candidate.slug === pageSlug,
    canonical: candidate.canonicalUrl === canonicalUrl && candidate.seo?.canonicalUrl === canonicalUrl,
    workflowDraftNeedsReview: candidate.workflow?.status === 'draft' && candidate.workflow?.reviewStatus === 'needs_review',
    productionPublishFalse: candidate.productionApproved === false && candidate.publishApproved === false && candidate.workflow?.approvedForPublish === false,
    staticNeedsRebuild: candidate.staticPublishing?.needsRebuild === true,
    staticNotEligible: candidate.staticPublishing?.staticEligible === false,
    businessDisplayName: candidate.domainRouting?.businessDisplayName === 'Ice Rink Rentals',
    selectedMailbox: candidate.domainRouting?.selectedMailbox === selectedMailbox,
    publicEmailDisplayPolicy: candidate.domainRouting?.publicEmailDisplayPolicy === publicEmailDisplayPolicy,
    publicContactEmailHidden: candidate.domainRouting?.publicContactEmail === '' && candidate.domainRouting?.mailtoLinksEnabled === false,
    noContactus: !active.includes(legacyMailbox),
    noFakePhone: !fakePhonePattern.test(text),
    noFakeEmail: !fakeEmailPattern.test(text),
    noRawTailwind: !hasTailwindClassDependency(candidate),
    noRawCf7: !/contact-form-7|\[contact-form-7|wpcf7|cf7/i.test(text),
    noRawFormHtml: !/<\s*(form|input|textarea|select|button)\b/i.test(text),
    noBase64Images: !/data:image\/|base64/i.test(text),
    noExternalFakeMediaUrls: mediaUrlValues.every((value) => value === '' ||
      value.startsWith('/media/ice-rink-rentals/') ||
      value.startsWith('https://iceskatingrinkrentals.com/') ||
      value.startsWith('https://partyproseastcoast.com/')),
    visibleFormBlock: Boolean(form && form.content?.formKey === 'default-quote-request' && form.content?.variant === 'quote-form-panel'),
    formRouting: form?.content?.sourcePage === '/contact' && form?.content?.staticEndpointRef === staticEndpointRef && form?.content?.leadRecipientRef === leadRecipientRef && form?.content?.emailSendingEnabled === false,
    variantsPresent: ['heroMedia', 'trustBand', 'splitFeature', 'processSteps', 'mediaUseCaseGrid', 'planningTopics', 'faqAccordion', 'finalCta'].every((variant) => variants.includes(variant)),
    mediaIdsOfficial: mediaIds.length > 0 && mediaIds.every((id) => Object.values(officialMedia).some((item) => item.mediaAssetId === id)),
    ppecLogoBound: text.includes(officialMedia.ppec.mediaAssetId),
    noHomepageOrServiceAreasPayload: candidate.pageSlug !== 'home' && candidate.pageSlug !== 'service-areas',
    noStateCityCreated: !/\/[a-z]{2}-[a-z0-9-]+/i.test(text.replaceAll('/state-city', '')),
  };
  return withFailed(checks);
}

function routeCanonicalValidation(candidate) {
  return withFailed({
    tenant: candidate.tenantId === tenantId,
    siteKey: candidate.siteKey === siteKey,
    route: candidate.route === route,
    path: candidate.path === route,
    slug: candidate.slug === pageSlug,
    pageSlug: candidate.pageSlug === pageSlug,
    canonical: candidate.canonicalUrl === canonicalUrl && candidate.seo?.canonicalUrl === canonicalUrl,
    notHomepage: candidate.route !== '/',
    notServiceAreas: candidate.route !== '/service-areas',
    noStateCity: candidate.route !== '/state-city',
  });
}

function runImportPreflight(candidateRel, outputRelPath) {
  const result = run('node', [
    'tools/import-preflight/import-preflight.mjs',
    '--input', candidateRel,
    '--tenant-id', tenantId,
    '--site-key', siteKey,
    '--route', route,
    '--mode', 'preflight-only',
    '--output', outputRelPath,
  ], 240000);
  const parsed = existsSync(abs(outputRelPath)) ? readJson(outputRelPath) : {};
  const shapeOk = parsed.classification?.['preflight-valid-for-shape'] === true;
  const localOk = parsed.classification?.['preflight-valid-for-local-draft-import'] === true;
  parsed.ok = result.status === 0 && shapeOk && localOk;
  parsed.command = commandSummary(result);
  writeValidation(outputRelPath, parsed);
}

function runDotNetContract(candidateRel) {
  const scratch = path.join(os.tmpdir(), `pumpkin-final-contact-contract-${process.pid}-${Date.now()}`);
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

function runSimpleCommand(file, args) {
  const result = run(args[0], args.slice(1), 240000);
  const parsed = parseJson(result.stdout.trim());
  writeValidation(file, {
    ok: result.status === 0 && inferOk(parsed, result),
    command: commandSummary(result),
    parsed,
  });
}

function runDefaultFormValidation(candidate) {
  const fixtures = run('node', ['tools/default-form-validation/validate-default-form-fixtures.mjs'], 240000);
  let candidateResult = null;
  try {
    const models = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));
    candidateResult = models.validatePageFormBlocks(candidate, 'final-contact-normalized-candidate');
  } catch (error) {
    candidateResult = { errors: [{ message: safeMessage(error) }], warnings: [] };
  }
  const parsed = parseJson(fixtures.stdout.trim());
  writeValidation(files.defaultForm, {
    ok: fixtures.status === 0 && (candidateResult.errors?.length || 0) === 0,
    fixtures: commandSummary(fixtures),
    parsed,
    candidate: candidateResult,
  });
}

function classifyReadiness() {
  const preflight = state.validation.results[path.basename(files.safePreflight)] || {};
  const shapeOk = state.validation.ok;
  const localDraftOk = preflight.classification?.['preflight-valid-for-local-draft-import'] === true;
  state.readiness.readyForHumanReview = shapeOk;
  state.readiness.readyForLocalDraftImport = shapeOk && localDraftOk;
  state.readiness.readyForCmsLiveApproval = false;
  state.readiness.readyForStaticRegeneration = false;
  state.readiness.readyForProductionIndexing = false;
  state.readiness.blockers = [
    ...(state.validation.failed.length ? [`Validation failed: ${state.validation.failed.join(', ')}`] : []),
    'CMS/live approval requires explicit user visual approval and separate authorization.',
    'Static regeneration was not authorized.',
    'Production/indexing was not authorized.',
  ];
}

function runFinalHygiene() {
  const taskFiles = unique([...listFiles(outputDir).filter(isTextFile), abs(rootReportRel)].filter(existsSync));
  const gitDiff = run('git', ['diff', '--check'], 120000);
  const nodeCheck = run('node', ['--check', `${outputRel}/run-final-contact-intake.mjs`], 120000);
  const protectedCheck = protectedGeneratedRawArtifactPathCheck();
  const stagedCheck = stagedArtifactCheck();
  state.validation.results[path.basename(files.finalHygiene)] = {
    ok: gitDiff.status === 0 && nodeCheck.status === 0 && trailingWhitespaceScan(taskFiles).ok && secretScan(taskFiles.map(rel)).ok && protectedCheck.ok && stagedCheck.ok,
  };
  writeJson(files.finalHygiene, {
    gitDiffCheck: commandSummary(gitDiff),
    nodeCheckRunner: commandSummary(nodeCheck),
    trailingWhitespaceScan: trailingWhitespaceScan(taskFiles),
    targetedSecretScan: secretScan(taskFiles.map(rel)),
    protectedGeneratedRawArtifactPathCheck: protectedCheck,
    stagedArtifactCheck: stagedCheck,
  });
}

function writeReports(candidate, importPackage) {
  const inventory = state.input.inventory || {};
  const preflight = readJsonIfExists(files.safePreflight) || {};
  const validationRows = [
    ['JSON parse validation', resultName(files.jsonParse)],
    ['.NET Page/block contract validation', resultName(files.dotnet)],
    ['production-field persistence validation', resultName(files.productionPersistence)],
    ['safe import preflight', resultName(files.safePreflight)],
    ['design-system validation', resultName(files.designSystem)],
    ['media validation', resultName(files.mediaValidation)],
    ['default form validation', resultName(files.defaultForm)],
    ['Tailwind/navigation validation', resultName(files.tailwind)],
    ['page intake normalizer validation', resultName(files.normalizer)],
    ['unsafe HTML/CSS/form/media/email scan', resultName(files.unsafeScan)],
    ['contactus@ scan', resultName(files.contactusScan)],
    ['targeted secret scan', resultName(files.secretScan)],
    ['git diff/final hygiene checks', hygieneName()],
  ];

  writeMd(files.readme, `# Ice Final Contact Package Intake

Generated: ${generatedAt}

Scope:

- Intake, inventory, validation, normalization, and import-package preparation for /contact only.
- No CMS records were changed.
- No homepage, /service-areas, /state-city, Theme, MediaAsset, static generation, deployment, DNS/email/provider, protected config, image, or Roller action occurred.

Primary output:

- \`${files.candidate}\`
- \`${files.importPackage}\`
- \`${rootReportRel}\``);

  writeMd(files.inventory, `# Package Inventory

Input folder: \`${inputRel}\`

ZIP present: ${yn(state.input.zipExists)}

Extracted folder present: ${yn(state.input.extractedExists)}

Contact JSON files:

${listOrNone(inventory.contactJsonFiles)}

Package/shared JSON files:

${listOrNone(inventory.packageJsonFiles)}

Media references:

${listOrNone((inventory.mediaReferences || []).map((item) => `${item.assetId || item.mediaAssetId || 'unknown'} - ${item.usage || item.title || 'media reference'}`))}

Form references:

${listOrNone(inventory.formReferences)}

Schema/SEO files:

${listOrNone(inventory.schemaSeoFiles)}

Style files:

${listOrNone(inventory.styleFiles)}

Preview HTML files:

${listOrNone(inventory.previewHtmlFiles)}

CF7/WordPress/reference-only files:

${listOrNone(inventory.cf7WordPressReferenceFiles)}

README/instruction files:

${listOrNone(inventory.readmeInstructionFiles)}

Raw media files:

${listOrNone(inventory.rawMediaFiles)}

Preview HTML, WordPress, CF7, screenshots, raw media, and raw forms are reference only.`);

  writeMd(files.candidateAudit, `# Contact Candidate Audit

Selected candidate:

\`${state.selection.selected}\`

Reason:

${state.selection.reason}

Rejected/supporting files:

${listOrNone(state.selection.rejected.map((item) => `${item.path} - ${item.reason}`))}

Normalized candidate:

\`${files.candidate}\`

Normalization summary:

- tenantId/siteKey: \`${tenantId}\`
- route/path: \`${route}\`
- slug/pageSlug: \`${pageSlug}\`
- canonical: \`${canonicalUrl}\`
- workflow: draft / needs_review
- productionApproved: false
- publishApproved: false
- staticPublishing.needsRebuild: true
- visible formBlock: ${yn(state.normalization.formBlockPresent)}
- formKey: \`default-quote-request\`
- sourcePage: \`/contact\`
- no CMS write: yes`);

  writeMd(files.formRouting, `# Form Routing Review

- Visible formBlock present: ${yn(state.normalization.formBlockPresent)}
- formKey: \`default-quote-request\`
- sourcePage: \`/contact\`
- staticEndpointRef: \`${staticEndpointRef}\`
- leadRecipientRef: \`${leadRecipientRef}\`
- selectedMailbox metadata: \`${selectedMailbox}\`
- publicEmailDisplayPolicy: \`${publicEmailDisplayPolicy}\`
- realEmailSendingEnabled: false
- mailto fallback: disabled
- raw CF7 behavior: not used
- raw form HTML: not used

The source package form definition is treated as reference only. The active candidate uses Pumpkin-native formBlock behavior.`);

  writeMd(files.mediaBinding, `# Media Binding Review

Media rules:

- No MediaAsset records were created.
- No image files were modified.
- Existing official MediaAsset IDs were used.
- No external/fake media URLs were introduced.
- No base64 image data was introduced.
- Missing media was not guessed.

Bound official MediaAsset IDs:

${listOrNone(Object.values(officialMedia).map((item) => `${item.mediaAssetId} - ${item.title}`))}

PPEC logo bound to:

\`${officialMedia.ppec.mediaAssetId}\`

Source package raw assets remain reference-only under \`${extractedRel}/assets/\`.`);

  writeMd(files.routeCanonical, `# Route And Canonical Review

- Route: \`${candidate.route}\`
- Path: \`${candidate.path}\`
- Slug: \`${candidate.slug}\`
- pageSlug: \`${candidate.pageSlug}\`
- Canonical: \`${candidate.canonicalUrl}\`
- Homepage payload included: no
- /service-areas payload included: no
- /state-city created: no

Route validation result: ${resultName(files.routeCanonicalJson)}`);

  writeMd(files.preflightMd, `# Import Preflight Result

Safe import preflight file:

\`${files.safePreflight}\`

Classification:

- preflight-valid-for-shape: ${String(preflight.classification?.['preflight-valid-for-shape'] ?? 'not run')}
- preflight-valid-for-local-draft-import: ${String(preflight.classification?.['preflight-valid-for-local-draft-import'] ?? 'not run')}
- preflight-valid-for-CMS-import: ${String(preflight.classification?.['preflight-valid-for-CMS-import'] ?? 'not run')}
- preflight-valid-for-production: ${String(preflight.classification?.['preflight-valid-for-production'] ?? 'not run')}

Validation summary:

${table(['Check', 'Result'], validationRows)}

Readiness decision:

- ready for human review: ${yn(state.readiness.readyForHumanReview)}
- ready for local draft import: ${yn(state.readiness.readyForLocalDraftImport)}
- ready for CMS/live approval: ${yn(state.readiness.readyForCmsLiveApproval)}
- ready for static regeneration: ${yn(state.readiness.readyForStaticRegeneration)}
- ready for production/indexing: ${yn(state.readiness.readyForProductionIndexing)}`);

  writeJson(files.manifest, {
    schemaVersion: state.schemaVersion,
    generatedAt,
    site: 'IceSkatingRinkRentals.com',
    tenantId,
    siteKey,
    route,
    branch: state.start.branch,
    inputFolder: inputRel,
    outputFolder: outputRel,
    rootReport: rootReportRel,
    selectedCandidate: state.selection.selected,
    normalizedCandidate: files.candidate,
    importPackage: files.importPackage,
    inventory,
    normalization: state.normalization,
    validation: state.validation,
    readiness: state.readiness,
    safety: state.safety,
    noCmsWrites: true,
  });

  writeMd(rootReportRel, `# Pumpkin Ice Final Contact Package Intake Report

Generated: ${generatedAt}

## Start

Branch: \`${state.start.branch}\`

Git status at runner start:

\`\`\`text
${state.start.gitStatusShort.trim() || 'clean'}
\`\`\`

Recent log:

\`\`\`text
${state.start.gitLogOneline12.trim()}
\`\`\`

Start-state note:

- Manual git status/log checks were run before extraction/output generation.
- The worktree was not fully clean because the raw contact ZIP and known service-area raw package were untracked.
- No tracked modifications were present at the manual start check.

## Input

Input package path:

\`${inputFiles.zip}\`

Extracted path:

\`${extractedRel}\`

## Inventory Summary

- Contact JSON files: ${(inventory.contactJsonFiles || []).length}
- Package/shared JSON files: ${(inventory.packageJsonFiles || []).length}
- Media references: ${(inventory.mediaReferences || []).length}
- Form references: ${(inventory.formReferences || []).length}
- Schema/SEO files: ${(inventory.schemaSeoFiles || []).length}
- Style files: ${(inventory.styleFiles || []).length}
- Preview HTML files: ${(inventory.previewHtmlFiles || []).length}
- CF7/WordPress/reference-only files: ${(inventory.cf7WordPressReferenceFiles || []).length}
- README/instruction files: ${(inventory.readmeInstructionFiles || []).length}
- Raw media files: ${(inventory.rawMediaFiles || []).length}

## Selected Candidate

\`${state.selection.selected}\`

${state.selection.reason}

## Normalization Summary

- Normalized candidate: \`${files.candidate}\`
- Import package: \`${files.importPackage}\`
- tenantId/siteKey: \`${tenantId}\`
- route/path: \`${route}\`
- slug/pageSlug: \`${pageSlug}\`
- canonical: \`${canonicalUrl}\`
- workflow: draft / needs_review
- productionApproved: false
- publishApproved: false
- staticPublishing.needsRebuild: true
- businessDisplayName: Ice Rink Rentals
- selectedMailbox: \`${selectedMailbox}\`
- publicEmailDisplayPolicy: \`${publicEmailDisplayPolicy}\`
- visible formBlock: ${yn(state.normalization.formBlockPresent)}
- formKey: \`default-quote-request\`
- realEmailSendingEnabled: false

## Route And Canonical Result

${resultName(files.routeCanonicalJson)}

## Form Routing Result

- staticEndpointRef: \`${staticEndpointRef}\`
- leadRecipientRef: \`${leadRecipientRef}\`
- sourcePage: \`/contact\`
- no raw CF7 behavior: ${yn(state.normalization.noRawHtmlForm)}
- no raw form HTML: ${yn(state.normalization.noRawHtmlForm)}

## Media Binding Result

- PPEC logo bound: ${yn(state.normalization.ppecLogoBound)}
- Official MediaAsset IDs only: ${yn(Object.values(readJsonIfExists(files.productionPersistence)?.checks || {}).every(Boolean))}
- MediaAsset records changed: no
- Images generated or modified: no

## Validation Results

Overall validation: ${yn(state.validation.ok)}

${table(['Check', 'Result'], validationRows)}

Failed checks:

${listOrNone(state.validation.failed)}

## Readiness Decision

- ready for human review: ${yn(state.readiness.readyForHumanReview)}
- ready for local draft import: ${yn(state.readiness.readyForLocalDraftImport)}
- ready for CMS/live approval: ${yn(state.readiness.readyForCmsLiveApproval)}
- ready for static regeneration: ${yn(state.readiness.readyForStaticRegeneration)}
- ready for production/indexing: ${yn(state.readiness.readyForProductionIndexing)}

## Exact Blockers

${listOrNone(state.readiness.blockers)}

## Checks Run

- git status --short
- git log --oneline -12
- ZIP path safety and extraction check
- package inventory
- candidate selection audit
- contact normalization
- JSON parse validation
- .NET Page/block contract validation
- production-field persistence validation
- safe import preflight
- design-system validation
- media validation
- default form validation
- Tailwind/navigation validation
- page intake normalizer validation
- unsafe HTML/CSS/form/media/email scan
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
- Homepage / changed: no
- /service-areas changed: no
- /contact imported: no
- /state-city created: no
- Theme records changed: no
- MediaAsset records changed: no
- Static generation: no
- Deployment/DNS/email/provider/Azure/Cloudflare/Microsoft 365/Bluehost changes: no
- Email sent: no
- Protected config read: no
- Image generation or modification: no
- Roller touched: no

## Next Recommended Action

Review \`${files.candidate}\` and the validation docs. If approved, run a separately authorized local draft import for /contact only.`);
}

function summarizeNormalization(page) {
  const text = JSON.stringify(page);
  state.normalization.blockTypes = blocksOf(page).map((block) => block.type);
  state.normalization.formBlockPresent = blocksOf(page).some((block) => block.type === 'formBlock' && block.content?.formKey === 'default-quote-request');
  state.normalization.mediaAssetIds = unique(collectValuesByKey(page, 'mediaAssetId').filter(Boolean));
  state.normalization.noContactus = !text.includes(legacyMailbox);
  state.normalization.noFakePhone = !/\b(?:555[-.\s]?\d{4}|000[-.\s]?000[-.\s]?0000|123[-.\s]?456[-.\s]?7890)\b/.test(text);
  state.normalization.noFakeEmail = !/\b(?:hello|info|test|example|fake|noreply)@iceskatingrinkrentals\.com\b|example\.com/i.test(text);
  state.normalization.noRawHtmlForm = !/<\s*(form|input|textarea|select|button)\b/i.test(text) && !/contact-form-7|\[contact-form-7|wpcf7|cf7/i.test(text);
  state.normalization.noBase64 = !/data:image\/|base64/i.test(text);
  state.normalization.noExternalFakeMedia = collectValuesByKey(page, 'url')
    .concat(collectValuesByKey(page, 'publicUrl'))
    .filter(Boolean)
    .every((value) => value === '' ||
      value.startsWith('/media/ice-rink-rentals/') ||
      value.startsWith('https://iceskatingrinkrentals.com/') ||
      value.startsWith('https://partyproseastcoast.com/'));
  state.normalization.ppecLogoBound = text.includes(officialMedia.ppec.mediaAssetId);
}

function hasTailwindClassDependency(value) {
  const classes = [];
  collectClassLikeValues(value, classes);
  const tailwindPattern = /\b(?:sm:|md:|lg:|xl:|2xl:)?(?:flex|inline-flex|grid|px-\d|py-\d|p-\d|m-\d|text-\w+-\d|bg-\w+-\d|rounded-\w|shadow-\w|items-\w+|justify-\w+|gap-\d+)\b/;
  return classes.some((classValue) => tailwindPattern.test(classValue));
}

function collectClassLikeValues(value, out) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectClassLikeValues(item, out));
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  for (const [key, child] of Object.entries(value)) {
    if (/^(class|className|semanticClass|classes)$/i.test(key) && typeof child === 'string') {
      out.push(child);
    }
    collectClassLikeValues(child, out);
  }
  return out;
}

function media(key, usageType) {
  const source = officialMedia[key];
  return {
    mediaAssetId: source.mediaAssetId,
    assetId: source.assetId,
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl: source.publicUrl,
    url: source.publicUrl,
    alt: source.alt,
    title: source.title,
    caption: '',
    description: '',
    source: key === 'ppec' ? 'Party Pros East Coast' : 'pumpkin_media_library_local_dev',
    licenseStatus: key === 'ppec' ? 'partner_provided' : 'owned',
    usageStatus: 'needs_review',
    usageType,
    status: 'mediaasset-bound',
    tags: key === 'ppec' ? ['ppec', 'party-pros-east-coast', 'partner-logo'] : [],
    decorative: false,
  };
}

function emptyMedia() {
  return {
    mediaAssetId: '',
    assetId: '',
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl: '',
    url: '',
    alt: '',
    title: '',
    caption: '',
    description: '',
    source: '',
    licenseStatus: '',
    usageStatus: '',
    usageType: '',
    status: '',
    tags: [],
    decorative: false,
  };
}

function mediaRequirements() {
  return [
    ['brand-logo', 'logo', 'Brand logo'],
    ['contact-hero', 'winter', 'Contact hero/Open Graph'],
    ['contact-setup-feature', 'setup', 'Quote form setup feature'],
    ['contact-about-feature', 'corporate', 'About feature'],
    ['contact-event-holiday', 'holiday', 'Holiday event card'],
    ['contact-ppec-logo', 'ppec', 'Party Pros East Coast partner logo'],
  ].map(([slot, key, title]) => ({
    requiredMediaSlotId: slot,
    title,
    mediaAssetId: officialMedia[key].mediaAssetId,
    assetId: officialMedia[key].assetId,
    publicUrl: officialMedia[key].publicUrl,
    url: officialMedia[key].publicUrl,
    requiredAltText: officialMedia[key].alt,
    alt: officialMedia[key].alt,
    usageType: slot,
    requiredBeforeCmsImport: true,
    status: 'mediaasset-bound',
    blocker: false,
  }));
}

function byId(blocks, id) {
  return blocks.find((block) => block.id === id) || null;
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
    ['raw-cf7', /contact-form-7|\[contact-form-7|wpcf7|cf7/i],
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
    if (file.startsWith('content-review/ice-final-contact-input/') ||
      file.startsWith('content-review/ice-service-areas-input/')) {
      allowedReferenceRaw.push(file);
    } else {
      rawHits.push(file);
    }
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
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) hits.push(`${rel(file)}:${index + 1}`);
    });
  }
  return { ok: hits.length === 0, hits };
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

function hygieneName() {
  const result = readJsonIfExists(files.finalHygiene);
  if (!result) return 'not run';
  return result.gitDiffCheck?.ok &&
    result.nodeCheckRunner?.ok &&
    result.trailingWhitespaceScan?.ok &&
    result.targetedSecretScan?.ok &&
    result.protectedGeneratedRawArtifactPathCheck?.ok &&
    result.stagedArtifactCheck?.ok
    ? 'pass'
    : 'fail';
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

function activePageOnly(page) {
  const copy = clone(page || {});
  if (copy.revision) delete copy.revision.latestSnapshot;
  return copy;
}

function blocksOf(page) {
  return Array.isArray(page?.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : [];
}

function collectValuesByKey(value, key, out = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectValuesByKey(item, key, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === key && typeof v === 'string') out.push(v);
      collectValuesByKey(v, key, out);
    }
  }
  return out;
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
    if (/^(targetedSecretScan|secretScan)$|secret-scan|targeted-secret-scan/i.test(key) && typeof val !== 'string') return val;
    if (/password|secret|connectionString|apiKey|privateKey|authorization/i.test(key)) return '[redacted]';
    if (/token|jwt/i.test(key) && typeof val === 'string' && !/^(PRESENT|MISSING|VALID|INVALID|temp|env|none)$/i.test(val)) return '[redacted]';
    if (typeof val === 'string') return scrub(val);
    return val;
  }));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sortKeys(v)]));
}

function stableStringify(value) {
  return JSON.stringify(sortKeys(value));
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
