#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outDir = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion');
const inputDir = path.join(repoRoot, 'content-review', 'ice-approved-homepage-conversion-input');
const extractedDir = path.join(inputDir, 'extracted');
const phase8kDir = path.join(extractedDir, 'phase8k', 'ice-homepage-phase8k-cf7-template-pack');
const phase10aDir = path.join(extractedDir, 'phase10a', 'ice-site-phase10a-pumpkin-ppec-rewrite-pack');
const emailCorrectionDir = path.join(extractedDir, 'email-correction');
const phase8nPath = path.join(inputDir, 'ice-homepage.phase8n.crm-scaffold.full.json');
const baseCandidatePath = path.join(repoRoot, 'content-review', 'ice-ppec-home-contact-repair', 'UPDATED_HOMEPAGE_WITH_PPEC_CANDIDATE.json');
const rootReportPath = path.join(repoRoot, 'PUMPKIN_ICE_APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CONVERSION_REPORT.md');
const existingCandidatePath = path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CANDIDATE.json');

const approvedEmail = 'contact@iceskatingrinkrentals.com';
const legacyEmail = ['contactus', 'iceskatingrinkrentals.com'].join('@');
const generatedAt = getStableGeneratedAt();

const outputFiles = {
  inventory: path.join(outDir, 'PACKAGE_INVENTORY.md'),
  phase8kAudit: path.join(outDir, 'PHASE8K_APPROVED_HOMEPAGE_AUDIT.md'),
  ppecAudit: path.join(outDir, 'PPEC_APPROVED_ASSET_STYLE_AUDIT.md'),
  candidate: path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_CANDIDATE.json'),
  package: path.join(outDir, 'APPROVED_HOMEPAGE_PHASE8K_TO_PHASE10A_PACKAGE.json'),
  mapping: path.join(outDir, 'PHASE8K_TO_PHASE10A_MAPPING.md'),
  disconnect: path.join(outDir, 'PPEC_DISCONNECT_DECISION.md'),
  emailAudit: path.join(outDir, 'EMAIL_CORRECTION_AUDIT.md'),
  readiness: path.join(outDir, 'IMPORT_READINESS_DECISION.md'),
  nextPlan: path.join(outDir, 'NEXT_IMPORT_PLAN.md'),
  manifest: path.join(outDir, 'manifest.json'),
  readme: path.join(outDir, 'README.md'),
};

function main() {
  mkdirSync(outDir, { recursive: true });
  assertInputs();

  const phase8kContent = readJson(path.join(phase8kDir, 'ice-homepage.phase8k.content.json'));
  const phase8kDesign = readJson(path.join(phase8kDir, 'ice-homepage.phase8k.design-assets.json'));
  const phase8kMedia = readJson(path.join(phase8kDir, 'ice-homepage.phase8k.media-manifest.json'));
  const phase8kFull = readJson(path.join(phase8kDir, 'ice-homepage.phase8k.full.json'));
  const phase10aHome = readJson(path.join(phase10aDir, 'homepage', 'ice-homepage.phase8o.ppec-crm-scaffold.full.json'));
  const phase10aMedia = readJson(path.join(phase10aDir, 'shared', 'ice-rink-rentals.media-manifest.json'));
  const phase8n = readJson(phase8nPath);
  const baseCandidate = readJson(baseCandidatePath);

  const sourceInventory = buildSourceInventory();
  const ppecFindings = buildPpecFindings(phase8kContent, phase8kDesign, phase8kMedia, phase10aHome, phase10aMedia);
  const candidate = buildCandidate({
    phase8kContent,
    phase8kDesign,
    phase8kFull,
    phase10aHome,
    phase10aMedia,
    phase8n,
    baseCandidate,
    ppecFindings,
  });
  const validationSummary = readValidationSummary();
  const conversionPackage = buildPackage(candidate, ppecFindings, validationSummary);
  const manifest = buildManifest(sourceInventory, candidate, ppecFindings, validationSummary);

  writeJson(outputFiles.candidate, candidate);
  writeJson(outputFiles.package, conversionPackage);
  writeJson(outputFiles.manifest, manifest);
  writeText(outputFiles.inventory, renderInventory(sourceInventory, ppecFindings));
  writeText(outputFiles.phase8kAudit, renderPhase8kAudit(phase8kContent, ppecFindings));
  writeText(outputFiles.ppecAudit, renderPpecAudit(ppecFindings));
  writeText(outputFiles.mapping, renderMapping(ppecFindings));
  writeText(outputFiles.disconnect, renderPpecDisconnect(ppecFindings, validationSummary));
  writeText(outputFiles.emailAudit, renderEmailAudit(sourceInventory));
  writeText(outputFiles.readiness, renderReadiness(validationSummary, ppecFindings));
  writeText(outputFiles.nextPlan, renderNextPlan(validationSummary, ppecFindings));
  writeText(outputFiles.readme, renderReadme(validationSummary));
  writeText(rootReportPath, renderRootReport(sourceInventory, ppecFindings, validationSummary));

  console.log(JSON.stringify({
    ok: true,
    generatedAt,
    outputDir: rel(outDir),
    candidate: rel(outputFiles.candidate),
    package: rel(outputFiles.package),
    rootReport: rel(rootReportPath),
    validationStatus: validationSummary.status,
    importReadiness: classifyReadiness(validationSummary, ppecFindings),
  }, null, 2));
}

function assertInputs() {
  const required = [
    path.join(inputDir, 'ice-homepage-phase8k-cf7-template-pack.zip'),
    path.join(inputDir, 'ice-site-phase10a-pumpkin-ppec-rewrite-pack.zip'),
    path.join(inputDir, 'ice-site-contact-email-correction-pack.zip'),
    phase8nPath,
    path.join(phase8kDir, 'ice-homepage.phase8k.full.json'),
    path.join(phase10aDir, 'homepage', 'ice-homepage.phase8o.ppec-crm-scaffold.full.json'),
  ];
  const missing = required.filter((item) => !existsSync(item));
  if (missing.length > 0) {
    throw new Error(`Missing required input(s): ${missing.map(rel).join(', ')}`);
  }
}

function buildCandidate(context) {
  const {
    phase8kContent,
    phase8kDesign,
    phase8kFull,
    phase10aHome,
    baseCandidate,
    ppecFindings,
  } = context;

  const candidate = clone(baseCandidate);
  candidate.schemaVersion = 'pumpkin-approved-homepage-phase8k-to-phase10a.v1';
  candidate.contentPackageVersion = 'phase8k-approved-homepage-to-phase10a-conversion.v1';
  candidate.templatePurpose = 'review_only_homepage_candidate';
  candidate.id = 'ice-rink-rentals-home';
  candidate.PageId = 'ice-rink-rentals-home';
  candidate.tenantId = 'ice-rink-rentals';
  candidate.siteKey = 'ice-rink-rentals';
  candidate.domain = 'iceskatingrinkrentals.com';
  candidate.businessDisplayName = 'Ice Rink Rentals';
  candidate.primaryServiceScope = 'United States / domestic USA';
  candidate.route = '/';
  candidate.path = '/';
  candidate.slug = 'home';
  candidate.pageSlug = 'home';
  candidate.canonicalUrl = 'https://iceskatingrinkrentals.com/';
  candidate.productionApproved = false;
  candidate.publishApproved = false;
  candidate.isPublished = false;
  candidate.publishedAt = null;
  candidate.includeInSitemap = false;
  candidate.PageVersion = 1;
  candidate.Layout = 'default';

  candidate.reviewMetadata = {
    phase: 'approved-homepage-phase8k-to-phase10a-conversion',
    status: 'review-only-not-imported',
    sourceHierarchy: [
      'Phase 8K homepage package is the approved visual/layout/copy source.',
      'Phase 10A package supplies current Pumpkin/PPEC rewrite requirements.',
      'Phase 8N scaffold supplies current field reference only.',
    ],
    sourcePackagePaths: {
      phase8k: 'content-review/ice-approved-homepage-conversion-input/ice-homepage-phase8k-cf7-template-pack.zip',
      phase10a: 'content-review/ice-approved-homepage-conversion-input/ice-site-phase10a-pumpkin-ppec-rewrite-pack.zip',
      emailCorrection: 'content-review/ice-approved-homepage-conversion-input/ice-site-contact-email-correction-pack.zip',
      phase8n: 'content-review/ice-approved-homepage-conversion-input/ice-homepage.phase8n.crm-scaffold.full.json',
    },
    convertedAt: generatedAt,
    cmsWritesPerformed: false,
    apiWriteCallsPerformed: false,
    jwtUsed: false,
    staticRegenerationPerformed: false,
    deploymentPerformed: false,
    themeRecordsChanged: false,
    mediaAssetRecordsChanged: false,
    protectedConfigRead: false,
    rollerStatus: 'paused',
  };

  candidate.MetaData = {
    ...candidate.MetaData,
    category: 'rentals',
    product: 'portable ice rink',
    keyword: 'portable ice rink rentals',
    pageType: 'homepage',
    title: 'Portable Ice Skating Rink Rentals for Events | Ice Rink Rentals',
    description: 'Plan portable ice skating rink rentals for private events, winter festivals, schools, municipalities, shopping centers, resorts, brand activations, and corporate gatherings across the United States.',
    createdAt: '2026-06-02T00:00:00Z',
    updatedAt: generatedAt,
    author: 'Ice Skating Rink Rentals Team',
    language: 'en-us',
    market: 'us',
  };

  candidate.searchData = {
    ...candidate.searchData,
    state: '',
    city: '',
    metro: '',
    county: '',
    keyword: 'portable ice skating rink rentals',
    tags: [
      'portable ice skating rink rentals',
      'ice rink rentals',
      'temporary ice rink rental',
      'holiday ice rink rental',
      'corporate ice rink rental',
      'event ice rink rental',
    ],
    contentSummary: candidate.MetaData.description,
  };

  candidate.template = {
    templateKey: 'ice-homepage-approved-phase8k-to-phase10a',
    templateVersion: 'phase8k-to-phase10a.v1',
    layoutVariant: 'production-renderer-compatible',
    contentModelVersion: 'phase10a-production-renderer-compatible.v1',
    reviewPackage: 'ice-approved-homepage-conversion',
    rendererContract: 'pumpkin-polished-blocks-v1',
  };

  candidate.workflow = {
    status: 'draft',
    reviewStatus: 'needs_review',
    approvedForPublish: false,
    approvedForImport: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: 'codex_approved_phase8k_homepage_conversion',
    lastEditedAt: generatedAt,
    productionApproved: false,
    publishApproved: false,
  };

  candidate.staticPublishing = {
    staticEligible: false,
    needsRebuild: true,
    lastSnapshotAt: '',
    lastStaticBuildAt: '',
    lastDeployedAt: '',
    contentHash: '',
    lastPublishedContentHash: '',
    deploymentStatus: 'not_generated',
    productionApproved: false,
  };

  candidate.seo = {
    metaTitle: candidate.MetaData.title,
    metaDescription: candidate.MetaData.description,
    keywords: [
      'portable ice skating rink rentals',
      'ice rink rentals',
      'temporary ice rink rental',
      'holiday ice rink rental',
      'corporate ice rink rental',
      'event ice rink rental',
    ],
    focusKeyword: 'portable ice skating rink rentals',
    secondaryKeywords: [
      'ice rink rentals',
      'temporary ice rink rental',
      'holiday ice rink rental',
      'corporate ice rink rental',
      'event ice rink rental',
    ],
    robots: 'noindex,nofollow',
    canonicalUrl: 'https://iceskatingrinkrentals.com/',
    alternateUrls: [],
    structuredData: [],
    openGraph: {
      'og:title': candidate.MetaData.title,
      'og:description': candidate.MetaData.description,
      'og:type': 'website',
      'og:url': 'https://iceskatingrinkrentals.com/',
      'og:image': media.hero.publicUrl,
      'og:image:alt': media.hero.alt,
      'og:site_name': 'Ice Rink Rentals',
      'og:locale': 'en_US',
    },
    twitterCard: {
      'twitter:card': 'summary_large_image',
      'twitter:title': candidate.MetaData.title,
      'twitter:description': candidate.MetaData.description,
      'twitter:image': media.hero.publicUrl,
      'twitter:site': '',
      'twitter:creator': '',
    },
  };

  candidate.media = {
    featuredImage: media.hero,
    heroImage: media.hero,
    localImage: media.corporate,
    closingImage: media.holiday,
    openGraphImage: { ...media.hero, usageType: 'og-image' },
    logo: media.logo,
    setupImage: media.setup,
    hero: media.hero,
    corporate: media.corporate,
    holiday: media.holiday,
    setup: media.setup,
    sourceMediaManifest: 'content-review/ice-approved-homepage-conversion-input/extracted/phase10a/ice-site-phase10a-pumpkin-ppec-rewrite-pack/shared/ice-rink-rentals.media-manifest.json',
  };

  candidate.ContentData = {
    ContentBlocks: buildBlocks(phase8kContent, ppecFindings),
  };
  candidate.searchData.blockTypes = candidate.ContentData.ContentBlocks.map((block) => block.type);

  candidate.formConfig = {
    formId: 'ice-homepage-approved-phase8k-contact-route-cta',
    formType: 'quote_request',
    conversionGoal: 'homepage_quote_form_submit',
    routingMode: 'route_to_contact_page_formblock',
    domainRoutingKey: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    recipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    replyToMode: 'submitter_email',
    emailSubjectTemplate: 'Portable ice rink rental inquiry',
    mailtoFallbackEnabled: false,
    thankYouUrl: '/contact',
    thankYouMessage: 'Thanks. Your ice rink rental request has been received for review.',
    requiresConsent: true,
    consentRequired: true,
    spamProtectionRequired: true,
    spamProtectionEnabled: true,
    normalizedFieldMap: {
      name: 'fullName',
      email: 'email',
      phone: 'phone',
      eventLocation: 'eventCityState',
      eventDate: 'eventDateOrDateRange',
      message: 'message',
    },
    homepageEmbeddedForm: true,
    contactRoute: '/contact',
    contactPageFormBlockRef: 'ice-rink-contact-quote-request',
    realEmailSendingEnabled: false,
  };

  candidate.domainRouting = {
    domain: 'iceskatingrinkrentals.com',
    brandName: 'Ice Rink Rentals',
    businessDisplayName: 'Ice Rink Rentals',
    publicContactEmail: '',
    publicEmailDisplayPolicy: 'form-first-under-review',
    selectedMailbox: approvedEmail,
    selectedMailboxMetadata: approvedEmail,
    quoteRequestEmail: '',
    supportEmail: '',
    replyToEmail: '',
    fromName: 'Ice Rink Rentals',
    fromEmail: '',
    contactPageSlug: 'contact',
    primaryPhone: '(844) 727-8947',
    primaryPhoneHref: 'tel:+18447278947',
    primaryPhoneApprovalStatus: 'present-in-phase8k-and-phase10a-approved-homepage-source',
    mailtoLinksEnabled: false,
    defaultLeadRoutingMode: 'manual_review_then_provider_match',
    defaultRecipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    selectedEmailProvider: 'under-review',
    pumpkinAppSendStatus: 'disabled_review_only',
    emailProviderStatus: 'selected_mailbox_metadata_only',
    notes: 'Selected mailbox is metadata only; public homepage email display is disabled and no live sending is enabled.',
  };

  candidate.serviceSchema = {
    serviceName: 'Portable Ice Skating Rink Rentals',
    serviceType: 'Portable Ice Rink Rentals',
    serviceCategory: 'Event rental planning',
    productsOffered: [
      {
        name: 'Portable ice skating rink rental planning',
        type: 'Service',
        description: 'Review-only portable ice skating rink rental planning and quote intake.',
        url: 'https://iceskatingrinkrentals.com/',
        category: 'event rentals',
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    areasServed: [
      {
        name: 'United States',
        type: 'Country',
        stateCode: '',
        city: '',
        county: '',
        metro: '',
        country: 'US',
        url: 'https://iceskatingrinkrentals.com/',
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
    notes: 'No city, state-city, or service-area page was created in this conversion.',
  };

  candidate.pageQuality = {
    status: 'needs_review',
    score: null,
    uniqueValueReason: 'Approved Phase 8K homepage visual/copy source was converted into repaired Pumpkin blocks while retaining PPEC treatment and current media bindings.',
    buyerIntent: 'portable ice skating rink rental planning and quote request',
    landingPageType: 'homepage',
    launchNotes: 'Review-only conversion. Local draft import remains conditional until PPEC logo MediaAsset binding is approved or explicitly waived.',
    warnings: [
      'Public email display remains form-first under review.',
      'PPEC logo source exists but no approved Pumpkin MediaAsset id exists in the current source manifests.',
      'Human approval is required before production action.',
    ],
    blockingIssues: [
      'PPEC partner logo MediaAsset binding is required or must be explicitly waived before local draft import.',
    ],
    lastCheckedAt: generatedAt,
    productionApproved: false,
    reviewStatus: 'needs_review',
  };

  candidate.mediaRequirements = [
    ...buildExistingMediaRequirements(),
    ppecFindings.mediaRequirement,
  ];

  candidate.importCandidateStatus = 'review-valid-import-conditional-ppec-logo-mediaasset';
  candidate.normalizerMetadata = {
    phase: 'approved-homepage-phase8k-to-phase10a-conversion',
    normalizedAt: generatedAt,
    cmsWritesPerformed: false,
    themeTouched: false,
    mediaAssetRecordsTouched: false,
    serviceAreasTouched: false,
    rollerStatus: 'paused',
    stateCityGenerationPolicy: {
      routePattern: '/state-city',
      createdCityPageInThisPhase: false,
    },
    emailCorrection: {
      selectedMailbox: approvedEmail,
      publicEmailDisplayPolicy: 'form-first-under-review',
      homepagePublicEmailLinkEnabled: false,
      realEmailSendingEnabled: false,
    },
    ppecHomepageConversion: {
      generatedAt,
      phase8kVisualSource: rel(path.join(phase8kDir, 'ice-homepage.phase8k.full.json')),
      phase10aSchemaReference: rel(path.join(phase10aDir, 'homepage', 'ice-homepage.phase8o.ppec-crm-scaffold.full.json')),
      ppecLogoMediaAssetStatus: ppecFindings.mediaRequirement.status,
      ppecUrlSource: ppecFindings.url.source,
      validatorNote: 'The partner brand name is allowed; generic regional service-area scope is not used.',
    },
  };

  return stripLegacyEmail(candidate);
}

function buildBlocks(content, ppecFindings) {
  const rentalBullets = content.rentalOptions.bullets || [];
  return [
    {
      id: 'homepage-hero-media',
      type: 'Hero',
      enabled: true,
      content: {
        sectionVariant: 'heroMedia',
        type: 'Main',
        eyebrow: content.hero.eyebrow,
        headline: content.hero.h1,
        subheadline: content.hero.subheadline,
        media: media.hero,
        primaryCta: { label: content.hero.primaryCta.label, href: '#quote-form' },
        secondaryCta: { label: content.hero.secondaryCta.label, href: '#rental-options' },
        supportingPoints: content.hero.trustBadges.map((item) => `${item.label}: ${item.detail}`),
        approvedSource: 'phase8k.hero',
      },
    },
    {
      id: 'homepage-ppec-partner-strip',
      type: 'TrustBar',
      enabled: true,
      content: {
        sectionVariant: 'trustBand',
        eyebrow: 'Partner resource',
        title: content.partnerStrip.heading,
        subtitle: content.partnerStrip.body,
        items: [
          {
            icon: 'Handshake',
            title: 'Party Pros East Coast',
            text: content.partnerStrip.body,
          },
        ],
        cta: {
          label: content.partnerStrip.cta.label,
          href: '#quote-form',
        },
        partner: ppecBlockMetadata(ppecFindings, 'top-strip'),
        styleTokens: ppecFindings.styleTokens,
        approvedSource: 'phase8k.partnerStrip',
      },
    },
    {
      id: 'homepage-event-fit-cards',
      type: 'CardGrid',
      enabled: true,
      content: {
        sectionVariant: 'mediaUseCaseGrid',
        variant: 'event-card-grid',
        eyebrow: content.eventFits.eyebrow,
        title: content.eventFits.heading,
        subtitle: content.eventFits.body,
        layout: 'grid-3',
        cards: [
          {
            title: content.eventFits.cards[0].title,
            description: content.eventFits.cards[0].body,
            media: { ...media.hero, usageType: 'card', alt: content.eventFits.cards[0].alt },
          },
          {
            title: content.eventFits.cards[1].title,
            description: content.eventFits.cards[1].body,
            media: { ...media.corporate, usageType: 'card', alt: content.eventFits.cards[1].alt },
          },
          {
            title: content.eventFits.cards[2].title,
            description: content.eventFits.cards[2].body,
            media: { ...media.holiday, usageType: 'card', alt: content.eventFits.cards[2].alt },
          },
        ],
        approvedSource: 'phase8k.eventFits',
      },
    },
    {
      id: 'homepage-process-steps',
      type: 'HowItWorks',
      enabled: true,
      content: {
        sectionVariant: 'processSteps',
        eyebrow: 'How it works',
        title: content.process.heading,
        subtitle: 'A practical review process for rink size, access, guest flow, support equipment, and event-day coordination.',
        steps: content.process.steps.map((step) => ({
          title: step.title,
          text: step.body,
          icon: step.icon,
        })),
        approvedSource: 'phase8k.process',
      },
    },
    {
      id: 'homepage-planning-topics',
      type: 'CardGrid',
      enabled: true,
      content: {
        sectionVariant: 'planningTopics',
        eyebrow: 'Rental planning',
        title: 'Rental details reviewed before your event',
        subtitle: content.rentalOptions.body,
        layout: 'grid-2',
        topics: rentalBullets.map((item) => ({ title: item, description: '' })),
        cards: rentalBullets.map((item) => ({ title: item, description: '' })),
        approvedSource: 'phase8k.rentalOptions.bullets',
      },
    },
    {
      id: 'homepage-rental-options-split-feature',
      type: 'CardGrid',
      enabled: true,
      content: {
        sectionVariant: 'splitFeature',
        eyebrow: 'Rental options',
        title: content.rentalOptions.heading,
        subtitle: content.rentalOptions.body,
        description: content.rentalOptions.body,
        media: media.setup,
        image: media.setup,
        bullets: rentalBullets,
        cards: rentalBullets.map((item) => ({ title: item, description: '' })),
        cta: { label: content.rentalOptions.cta.label, href: '#quote-form' },
        approvedSource: 'phase8k.rentalOptions',
      },
    },
    {
      id: 'homepage-corporate-vip-split-feature',
      type: 'CardGrid',
      enabled: true,
      content: {
        sectionVariant: 'splitFeature',
        eyebrow: 'Corporate events',
        title: content.corporate.heading,
        subtitle: content.corporate.body,
        description: content.corporate.body,
        media: media.corporate,
        image: media.corporate,
        bullets: content.corporate.bullets,
        cards: content.corporate.bullets.map((item) => ({ title: item, description: '' })),
        approvedSource: 'phase8k.corporate',
      },
    },
    {
      id: 'homepage-public-holiday-split-feature',
      type: 'CardGrid',
      enabled: true,
      content: {
        sectionVariant: 'splitFeature',
        eyebrow: 'Public spaces',
        title: content.publicSpaces.heading,
        subtitle: content.publicSpaces.body,
        description: content.publicSpaces.body,
        media: media.holiday,
        image: media.holiday,
        bullets: content.publicSpaces.bullets,
        cards: content.publicSpaces.bullets.map((item) => ({ title: item, description: '' })),
        cta: { label: content.publicSpaces.cta.label, href: '#quote-form' },
        approvedSource: 'phase8k.publicSpaces',
      },
    },
    {
      id: 'homepage-service-area-teaser',
      type: 'ServiceAreaMap',
      enabled: true,
      content: {
        sectionVariant: 'serviceAreaTeaser',
        eyebrow: 'Service-area planning',
        title: 'Serving event routes across the United States',
        description: 'Ice Rink Rentals reviews portable rink requests for private, public, and business events across the domestic U.S. Availability is confirmed after reviewing event date, city, venue access, surface, rental window, staffing needs, rink size, and package requirements.',
        features: content.serviceAreas.features.map((item) => ({ title: item.title, text: item.body })),
        buttonText: 'View service area planning',
        buttonLink: '/service-areas',
        serviceScope: 'United States / domestic USA',
        createdPageInThisRun: false,
        approvedSource: 'phase8k.serviceAreas with phase10a domestic service-scope correction',
      },
    },
    {
      id: 'homepage-ppec-partner-cta',
      type: 'PrimaryCTA',
      enabled: true,
      content: {
        sectionVariant: 'partnerCta',
        eyebrow: 'Partner resource',
        title: content.partnerBanner.heading,
        description: content.partnerBanner.body,
        buttonText: content.partnerBanner.cta.label,
        buttonLink: '#quote-form',
        secondaryText: 'Party Pros East Coast partner logo remains a media intake requirement until approved as a Pumpkin MediaAsset.',
        partner: ppecBlockMetadata(ppecFindings, 'deep-banner'),
        styleTokens: ppecFindings.styleTokens,
        approvedSource: 'phase8k.partnerBanner',
      },
    },
    {
      id: 'homepage-faq-accordion',
      type: 'FAQ',
      enabled: true,
      content: {
        sectionVariant: 'faqAccordion',
        eyebrow: 'Questions before you request pricing',
        title: 'Portable ice rink rental FAQs',
        subtitle: 'Common planning questions from the approved homepage source.',
        layout: 'accordion',
        items: content.faq.items.map((item) => ({ question: item.question, answer: item.answer })),
        approvedSource: 'phase8k.faq',
      },
    },
    {
      id: 'homepage-quote-form',
      type: 'formBlock',
      enabled: true,
      content: {
        sectionVariant: 'quote-form-panel',
        id: 'homepage-quote-form',
        label: 'Ice quote request form',
        formKey: 'default-quote-request',
        variant: 'quote-form-panel',
        heading: content.quoteForm.heading,
        intro: content.quoteForm.subheading,
        submitLabel: 'Request a Quote',
        successMessage: 'Thank you. Your ice rink rental request has been received for review.',
        errorMessage: 'Please review the required fields and try again.',
        staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
        leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
        sourcePage: '/contact',
        selectedMailboxMetadata: approvedEmail,
        emailSendingEnabled: false,
        review: {
          status: 'needs_review',
          notes: 'Phase 8K homepage quote area converted to native Pumpkin formBlock routing. Old WordPress runtime was not carried forward.',
        },
        validation: {
          expected: 'visible default-quote-request formBlock with non-secret endpoint and lead recipient refs',
        },
        introBullets: [
          'Recommended rink size and layout guidance',
          'Indoor or outdoor setup and access review',
          'Skates, skating aids, lighting, music, snow effects, and support options when available',
          'Partner-supported event rental conversations through Party Pros East Coast when applicable',
        ],
        approvedSource: 'phase8k.quoteForm converted',
      },
    },
    {
      id: 'homepage-final-cta',
      type: 'PrimaryCTA',
      enabled: true,
      content: {
        sectionVariant: 'finalCta',
        eyebrow: 'Start planning',
        title: content.finalCta.heading,
        description: content.finalCta.body,
        buttonText: content.finalCta.cta.label,
        buttonLink: '#quote-form',
        phoneDisplay: content.finalCta.phoneDisplay,
        phoneHref: content.finalCta.phoneHref,
        publicEmailHidden: true,
        approvedSource: 'phase8k.finalCta with corrected form-first email policy',
      },
    },
  ];
}

function ppecBlockMetadata(ppecFindings, placement) {
  return {
    name: 'Party Pros East Coast',
    displayRole: 'Event rental partner',
    placement,
    url: ppecFindings.url.href,
    urlSource: ppecFindings.url.source,
    logoAssetStatus: 'needs-approved-pumpkin-media-asset',
    logoRequirementRef: 'ppec-partner-logo',
    logoRequirement: {
      requiredMediaSlot: 'ppecPartnerLogo',
      sourceFile: ppecFindings.preferredLogoSourceFile,
      mediaAssetId: null,
      status: 'needs-upload',
      title: 'Party Pros East Coast Logo',
      altText: 'Party Pros East Coast logo',
    },
  };
}

function buildPackage(candidate, ppecFindings, validationSummary) {
  return {
    schemaVersion: 'pumpkin-approved-homepage-conversion-package.v1',
    generatedAt,
    packageName: 'Ice approved Phase 8K homepage to Phase 10A Pumpkin conversion',
    sourceHierarchy: {
      approvedVisualLayoutCopySource: 'Phase 8K homepage package',
      currentSchemaReference: 'Phase 10A Pumpkin/PPEC rewrite package',
      emailCorrectionReference: 'Ice contact email correction package',
      currentFieldReferenceOnly: 'Phase 8N CRM scaffold',
    },
    convertedHomepageCandidate: candidate,
    mediaRequirements: candidate.mediaRequirements,
    ppecAssetRequirements: [ppecFindings.mediaRequirement],
    emailCorrectionSummary: {
      selectedMailbox: approvedEmail,
      publicEmailDisplayPolicy: 'form-first-under-review',
      homepagePublicEmailLinkEnabled: false,
      realEmailSendingEnabled: false,
      legacyMailboxReplaced: true,
    },
    validationSummary,
    importReadinessClassification: classifyReadiness(validationSummary, ppecFindings),
    guardrails: standardGuardrails(),
  };
}

function buildManifest(sourceInventory, candidate, ppecFindings, validationSummary) {
  return {
    schemaVersion: 'pumpkin-approved-homepage-conversion-manifest.v1',
    generatedAt,
    gitStatusAtStart: 'clean except expected user-supplied input artifacts',
    topCommitAtStart: '89ca42e Add Ice approved homepage conversion missing input report',
    sourceFiles: {
      phase8kApproved: rel(path.join(phase8kDir, 'ice-homepage.phase8k.full.json')),
      phase10aReference: rel(path.join(phase10aDir, 'homepage', 'ice-homepage.phase8o.ppec-crm-scaffold.full.json')),
      emailCorrectionReference: rel(emailCorrectionDir),
      phase8nReference: rel(phase8nPath),
    },
    outputFiles: Object.fromEntries(Object.entries(outputFiles).map(([key, value]) => [key, rel(value)])),
    candidateSummary: {
      tenantId: candidate.tenantId,
      siteKey: candidate.siteKey,
      route: candidate.route,
      slug: candidate.pageSlug,
      blockCount: candidate.ContentData.ContentBlocks.length,
      blockTypes: candidate.ContentData.ContentBlocks.map((block) => block.type),
      mediaRequirementCount: candidate.mediaRequirements.length,
      unresolvedMediaRequirementCount: candidate.mediaRequirements.filter((item) => !item.mediaAssetId).length,
      selectedMailbox: candidate.domainRouting.selectedMailbox,
      publicEmailDisplayPolicy: candidate.domainRouting.publicEmailDisplayPolicy,
    },
    sourceInventorySummary: {
      extractedFileCount: sourceInventory.extractedFiles.length,
      phase8kFileCount: sourceInventory.phase8kFiles.length,
      phase10aFileCount: sourceInventory.phase10aFiles.length,
      emailCorrectionFileCount: sourceInventory.emailCorrectionFiles.length,
      phase8nPresent: true,
    },
    ppec: {
      iconExists: ppecFindings.iconExists,
      wordmarkExists: ppecFindings.wordmarkExists,
      mediaAssetIdExists: ppecFindings.mediaAssetIdExists,
      mediaRequirementStatus: ppecFindings.mediaRequirement.status,
      url: ppecFindings.url,
      styleTokens: ppecFindings.styleTokens,
    },
    validationSummary,
    guardrails: standardGuardrails(),
  };
}

function buildSourceInventory() {
  const extractedFiles = listFiles(extractedDir).map(rel).sort();
  const phase8kFiles = extractedFiles.filter((item) => item.includes('/extracted/phase8k/'));
  const phase10aFiles = extractedFiles.filter((item) => item.includes('/extracted/phase10a/'));
  const emailCorrectionFiles = extractedFiles.filter((item) => item.includes('/extracted/email-correction/'));
  const textFiles = extractedFiles.filter(isTextLike);
  const ppecContentFiles = [];
  const ppecColorFiles = [];
  const approvedEmailFiles = [];
  const legacyEmailFiles = [];

  for (const file of textFiles) {
    const abs = path.join(repoRoot, file);
    const text = readFileSync(abs, 'utf8');
    if (/Party Pros East Coast|PPEC|ppec/i.test(text)) ppecContentFiles.push(file);
    if (/#5F438F|#7B5EC2|#39235F|#f5f0ff|rgba\(95,67,143/i.test(text)) ppecColorFiles.push(file);
    if (text.includes(approvedEmail)) approvedEmailFiles.push(file);
    if (text.includes(legacyEmail)) legacyEmailFiles.push(file);
  }

  const ppecAssetFiles = extractedFiles.filter((item) => /ppec-(icon|wordmark-card)\.png$/i.test(item));

  return {
    extractedFiles,
    phase8kFiles,
    phase10aFiles,
    emailCorrectionFiles,
    ppecContentFiles: ppecContentFiles.sort(),
    ppecAssetFiles: ppecAssetFiles.sort(),
    ppecColorFiles: ppecColorFiles.sort(),
    approvedEmailFiles: approvedEmailFiles.sort(),
    legacyEmailFiles: legacyEmailFiles.sort(),
  };
}

function buildPpecFindings(content, design, mediaManifest, phase10aHome, phase10aMedia) {
  const iconPath = path.join(phase8kDir, 'assets', 'ppec-icon.png');
  const wordmarkPath = path.join(phase8kDir, 'assets', 'ppec-wordmark-card.png');
  const ppecPartner = Array.isArray(phase10aHome.partnerships)
    ? phase10aHome.partnerships.find((item) => item.name === 'Party Pros East Coast')
    : null;
  const mediaAssetIdExists = JSON.stringify(phase10aMedia).includes('party-pros') ||
    JSON.stringify(phase10aMedia).includes('ppecPartnerLogo') ||
    (Array.isArray(phase10aMedia.mediaAssets) && phase10aMedia.mediaAssets.some((item) => /ppec|party pros/i.test(JSON.stringify(item))));
  const colors = design.designTokens?.colors || {};
  const styleTokens = {
    ppecPurple: colors.ppecPurple || '#5F438F',
    ppecPurpleLight: colors.ppecPurpleLight || '#7B5EC2',
    ppecHeading: '#39235F',
    ppecBody: '#5E526D',
    ppecSoftBackground: '#F5F0FF',
    ppecBorder: 'rgba(95,67,143,.20)',
  };
  const preferredLogoSourceFile = existsSync(wordmarkPath) ? 'ppec-wordmark-card.png' : 'ppec-icon.png';
  const mediaRequirement = {
    requiredMediaSlot: 'ppecPartnerLogo',
    requiredMediaSlotId: 'ppecPartnerLogo',
    mediaRequirementRef: 'ppec-partner-logo',
    usageType: 'partner-logo',
    intendedUsageType: 'partner-logo',
    page: 'Homepage',
    sectionId: 'homepage-ppec-partner-strip, homepage-ppec-partner-cta',
    sourceFile: preferredLogoSourceFile,
    sourcePath: rel(path.join(phase8kDir, 'assets', preferredLogoSourceFile)),
    alternateSourceFiles: ['ppec-icon.png', 'ppec-wordmark-card.png'].filter((file) => existsSync(path.join(phase8kDir, 'assets', file))),
    mediaAssetId: null,
    assetId: null,
    status: 'needs-upload',
    title: 'Party Pros East Coast Logo',
    altText: 'Party Pros East Coast logo',
    alt: 'Party Pros East Coast logo',
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
    requiredBeforeProductionLabel: 'yes',
    blocker: true,
    notes: 'Source logo file exists, but no approved Pumpkin MediaAsset id is present in the current media manifest.',
  };

  return {
    iconExists: existsSync(iconPath),
    wordmarkExists: existsSync(wordmarkPath),
    iconPath: rel(iconPath),
    wordmarkPath: rel(wordmarkPath),
    preferredLogoSourceFile,
    phase8kMediaManifestLogo: mediaManifest.ppecIcon || null,
    mediaAssetIdExists,
    mediaRequirement,
    url: {
      href: ppecPartner?.externalUrl || null,
      source: ppecPartner?.externalUrl ? 'phase10a.partnerships.externalUrl' : 'missing-approved-url',
      productionReady: Boolean(ppecPartner?.externalUrl),
    },
    ctaCopy: {
      topStrip: content.partnerStrip.cta.label,
      deepBanner: content.partnerBanner.cta.label,
      source: 'phase8k.partnerStrip.cta and phase8k.partnerBanner.cta',
    },
    logoPlacement: {
      topStrip: 'logo icon to the left of partner copy',
      deepBanner: 'logo icon to the left of deep partner banner copy',
      source: 'phase8k preview and content logoAssetId fields',
    },
    styleTokens,
    styleSourceFiles: [
      rel(path.join(phase8kDir, 'ice-homepage.phase8k.design-assets.json')),
      rel(path.join(phase8kDir, 'ice-homepage.phase8k.preview.html')),
    ],
  };
}

function readValidationSummary() {
  const files = {
    jsonParse: 'json-parse-validation-result.json',
    importPreflight: 'homepage-import-preflight-result.json',
    dotnetContract: 'dotnet-page-contract-result.json',
    contractPersistence: 'contract-persistence-validation-result.json',
    designSystem: 'design-system-validation-result.json',
    media: 'media-validation-result.json',
    tailwindNavigation: 'tailwind-navigation-validation-result.json',
    pageIntakeNormalizer: 'page-intake-normalizer-validation-result.json',
    unsafeScan: 'unsafe-scan-result.json',
    contactusScan: 'contactus-scan-result.json',
    secretScan: 'targeted-secret-scan-result.json',
    gitDiffCheck: 'git-diff-check-result.json',
    trailingWhitespace: 'trailing-whitespace-scan-result.json',
    artifactPathCheck: 'protected-generated-raw-artifact-check-result.json',
  };
  const summary = {
    status: 'pending',
    generatedAt,
    results: {},
    blockers: [],
    warnings: [],
  };

  for (const [key, fileName] of Object.entries(files)) {
    const filePath = path.join(outDir, fileName);
    if (!existsSync(filePath)) continue;
    try {
      const result = readJson(filePath);
      summary.results[key] = {
        path: rel(filePath),
        ok: inferOk(result),
        exitCode: result.exitCode ?? result.command?.exitCode ?? null,
        summary: summarizeValidationResult(result),
      };
      collectValidationBlockers(summary, key, result);
    } catch {
      summary.results[key] = { path: rel(filePath), ok: false, summary: 'Unable to parse validation result.' };
      summary.blockers.push(`${key}: validation result could not be parsed`);
    }
  }

  const expectedKeys = Object.keys(files);
  const presentKeys = Object.keys(summary.results);
  if (presentKeys.length === 0) {
    summary.status = 'pending';
    summary.warnings.push('Validation has not been run yet.');
    return summary;
  }

  const missing = expectedKeys.filter((key) => !presentKeys.includes(key));
  if (missing.length > 0) {
    summary.status = 'partial';
    summary.warnings.push(`Validation result files missing: ${missing.join(', ')}`);
  } else {
    summary.status = summary.blockers.length > 0 ? 'completed_with_blockers' : 'completed';
  }

  return summary;
}

function collectValidationBlockers(summary, key, result) {
  if (key === 'importPreflight') {
    const localDraftBlockers = result.blockers?.localDraftImport || [];
    const cmsBlockers = result.blockers?.cmsImport || [];
    if (localDraftBlockers.length > 0) {
      summary.blockers.push(`importPreflight.localDraftImport: ${localDraftBlockers.map((item) => item.message).join(' | ')}`);
    }
    if (cmsBlockers.length > 0) {
      summary.warnings.push(`importPreflight.cmsImport blockers: ${cmsBlockers.map((item) => item.message).join(' | ')}`);
    }
  } else if (inferOk(result) === false) {
    summary.blockers.push(`${key}: ${summarizeValidationResult(result)}`);
  }
}

function summarizeValidationResult(result) {
  if (typeof result.summary === 'string') return result.summary;
  if (typeof result.decision === 'string') return result.decision;
  if (typeof result.readinessDecision === 'string') return result.readinessDecision;
  if (result.classification) return JSON.stringify(result.classification);
  if (Array.isArray(result.failures)) return `${result.failures.length} failure(s)`;
  if (Array.isArray(result.errors)) return `${result.errors.length} error(s)`;
  if (Array.isArray(result.hits)) return `${result.hits.length} hit(s)`;
  if (typeof result.ok === 'boolean') return result.ok ? 'ok' : 'not ok';
  if (typeof result.Ok === 'boolean') return result.Ok ? 'ok' : 'not ok';
  return 'result captured';
}

function inferOk(result) {
  if (typeof result.ok === 'boolean') return result.ok;
  if (typeof result.Ok === 'boolean') return result.Ok;
  if (typeof result.exitCode === 'number') return result.exitCode === 0;
  if (typeof result.command?.exitCode === 'number') return result.command.exitCode === 0;
  if (result.classification?.['preflight-valid-for-shape'] === true) return true;
  return null;
}

function classifyReadiness(validationSummary, ppecFindings) {
  if (!ppecFindings.mediaAssetIdExists) {
    return 'review-valid-local-draft-import-blocked-by-ppec-logo-mediaasset';
  }
  if (validationSummary.status === 'pending' || validationSummary.status === 'partial') {
    return 'validation-pending-not-ready-for-import';
  }
  if (validationSummary.blockers.length > 0) {
    return 'blocked-by-validation-findings';
  }
  return 'ready-for-local-draft-import-after-human-approval';
}

function renderInventory(inventory, ppecFindings) {
  return `# Package Inventory

## Scope

This inventory covers the safely extracted source packages under \`content-review/ice-approved-homepage-conversion-input/extracted/\`.

## Source roles

- Approved visual/layout/copy source: Phase 8K homepage package.
- Current schema/reference source: Phase 10A homepage/contact package and shared media manifest.
- Reference-only current-field source: Phase 8N CRM scaffold.
- Email correction source: contact email correction package.
- Reference-only WordPress/CF7 files: all form templates, setup notes, preview HTML, and CSS from ZIP packages.

## Extracted files

${inventory.extractedFiles.map((file) => `- \`${file}\``).join('\n')}

## Files containing PPEC content

${listOrNone(inventory.ppecContentFiles)}

## Files containing PPEC logo/assets

${listOrNone(inventory.ppecAssetFiles)}

## Files containing PPEC colors/styles

${listOrNone(inventory.ppecColorFiles)}

## Files containing the legacy contact-us mailbox

${listOrNone(inventory.legacyEmailFiles)}

The legacy mailbox literal is intentionally not repeated in generated review outputs.

## Files containing the corrected mailbox

${listOrNone(inventory.approvedEmailFiles)}

## PPEC logo intake result

- ppec-icon.png exists: ${yesNo(ppecFindings.iconExists)}
- ppec-wordmark-card.png exists: ${yesNo(ppecFindings.wordmarkExists)}
- Approved Pumpkin PPEC MediaAsset id found: ${yesNo(ppecFindings.mediaAssetIdExists)}
- Required media slot: \`ppecPartnerLogo\`
- Media intake status: \`${ppecFindings.mediaRequirement.status}\`
`;
}

function renderPhase8kAudit(content, ppecFindings) {
  const sections = [
    'hero',
    'partnerStrip',
    'eventFits',
    'process',
    'rentalOptions',
    'corporate',
    'publicSpaces',
    'serviceAreas',
    'partnerBanner',
    'faq',
    'quoteForm',
    'finalCta',
  ];
  return `# Phase 8K Approved Homepage Audit

## Approved section order

${sections.map((section, index) => `${index + 1}. ${section}`).join('\n')}

## Hero layout

- Eyebrow: ${content.hero.eyebrow}
- H1: ${content.hero.h1}
- Media: \`${content.hero.imageId}\`
- Primary CTA: ${content.hero.primaryCta.label}
- Secondary CTA: ${content.hero.secondaryCta.label}
- Conversion: mapped to \`Hero\` with \`sectionVariant: heroMedia\` and official MediaAsset \`${media.hero.mediaAssetId}\`.

## Image/media placement

- Hero/event card image: \`${content.hero.imageId}\` -> \`${media.hero.mediaAssetId}\`
- Corporate image: \`${content.corporate.imageId}\` -> \`${media.corporate.mediaAssetId}\`
- Setup image: \`${content.rentalOptions.imageId}\` -> \`${media.setup.mediaAssetId}\`
- Holiday/public-space image: \`${content.publicSpaces.imageId}\` -> \`${media.holiday.mediaAssetId}\`

## PPEC partner/callout layout

- Top partner strip is preserved after the hero as a \`TrustBar\` with \`sectionVariant: trustBand\`.
- Deep partner banner is preserved before FAQ as a \`PrimaryCTA\` with \`sectionVariant: partnerCta\`.
- Logo placement remains a partner-logo requirement until a Pumpkin MediaAsset id is uploaded or explicitly waived.

## PPEC CTA text

- Top strip CTA: ${ppecFindings.ctaCopy.topStrip}
- Deep banner CTA: ${ppecFindings.ctaCopy.deepBanner}
- Candidate routes both CTAs to the native homepage quote form block instead of old WordPress runtime behavior.

## PPEC colors/style cues

${Object.entries(ppecFindings.styleTokens).map(([key, value]) => `- ${key}: \`${value}\``).join('\n')}

## Homepage form/CF7 conversion

- Phase 8K quote form area is preserved as a native Pumpkin \`formBlock\`.
- The old shortcode/runtime is not copied into the candidate.
- The block uses \`formKey: default-quote-request\`, \`variant: quote-form-panel\`, \`sourcePage: /contact\`, and non-secret routing refs.

## Copy preservation

The hero, partner strip, event-fit cards, process steps, rental-options bullets, corporate/public-space copy, PPEC banner copy, FAQ items, quote-form intro, and final CTA copy are carried forward from Phase 8K, with Phase 10A corrections for service scope and email policy.
`;
}

function renderPpecAudit(ppecFindings) {
  return `# PPEC Approved Asset and Style Audit

## Asset findings

- \`ppec-icon.png\` exists: ${yesNo(ppecFindings.iconExists)}
- \`ppec-wordmark-card.png\` exists: ${yesNo(ppecFindings.wordmarkExists)}
- Approved Pumpkin PPEC MediaAsset id exists: ${yesNo(ppecFindings.mediaAssetIdExists)}
- Preferred intake source file: \`${ppecFindings.preferredLogoSourceFile}\`

## Media intake requirement

\`\`\`json
${JSON.stringify(ppecFindings.mediaRequirement, null, 2)}
\`\`\`

## PPEC colors/styles

${Object.entries(ppecFindings.styleTokens).map(([key, value]) => `- ${key}: \`${value}\``).join('\n')}

Source files:

${ppecFindings.styleSourceFiles.map((file) => `- \`${file}\``).join('\n')}

## PPEC URL

- URL: ${ppecFindings.url.href || 'needs-approved-url'}
- Source: ${ppecFindings.url.source}
- Production-ready URL: ${yesNo(ppecFindings.url.productionReady)}

## PPEC CTA copy

- Top partner strip: ${ppecFindings.ctaCopy.topStrip}
- Deep partner banner: ${ppecFindings.ctaCopy.deepBanner}

## PPEC logo placement

- Top strip: ${ppecFindings.logoPlacement.topStrip}
- Deep banner: ${ppecFindings.logoPlacement.deepBanner}

## Decision

The PPEC logo source exists, but no approved Pumpkin MediaAsset id exists in the current official media manifest. No MediaAsset record is created in this run. The candidate includes a required media intake object and blocks or conditions local draft import until that logo is uploaded/bound or explicitly waived.
`;
}

function renderMapping() {
  return `# Phase 8K to Phase 10A Mapping

| Phase 8K source | Current Pumpkin section/variant | Notes |
| --- | --- | --- |
| hero | Hero / heroMedia | Copy and hero image preserved with official MediaAsset id. |
| partnerStrip | TrustBar / trustBand | PPEC top strip preserved; logo represented by media requirement. |
| eventFits | CardGrid / mediaUseCaseGrid | Three image cards preserved with official MediaAsset ids. |
| process | HowItWorks / processSteps | Four numberless/icon process steps preserved. |
| rentalOptions bullets | CardGrid / planningTopics | Bullets converted to renderer-compatible planning topics. |
| rentalOptions | CardGrid / splitFeature | Setup/logistics split-feature preserved with setup MediaAsset. |
| corporate | CardGrid / splitFeature | Corporate section preserved with corporate MediaAsset. |
| publicSpaces | CardGrid / splitFeature | Public/holiday section preserved with holiday MediaAsset. |
| serviceAreas | ServiceAreaMap / serviceAreaTeaser | Section order preserved; generic regional scope corrected to domestic USA. |
| partnerBanner | PrimaryCTA / partnerCta | PPEC deep banner preserved; logo represented by media requirement. |
| faq | FAQ / faqAccordion | FAQ items preserved. |
| quoteForm | formBlock / quote-form-panel | Old WordPress runtime removed; native Pumpkin form routing used. |
| finalCta | PrimaryCTA / finalCta | CTA preserved; public email link removed under form-first policy. |

## Media mapping

| Phase 8K media | Current MediaAsset id or requirement |
| --- | --- |
| site logo | ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411 |
| winter-fest-ice-rink-rentals | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d |
| corporate-ice-rink-event | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd |
| holiday-shopping-center-rink | ice-rink-rentals-holidayicerink-973ce7691377 |
| portable-rink-setup | ice-rink-rentals-icerinkrentalssetup-113d218572e4 |
| ppec-wordmark-card.png / ppec-icon.png | media requirement \`ppecPartnerLogo\`, status \`needs-upload\` |

## Email and form mapping

- Legacy public homepage email references were removed from the candidate.
- Correct selected mailbox metadata is \`${approvedEmail}\`.
- Old form runtime references were converted to native Pumpkin \`formBlock\` routing through the contact form workflow.
`;
}

function renderPpecDisconnect(ppecFindings, validationSummary) {
  return `# PPEC Disconnect Decision

## Decision

Local draft import is blocked or conditional until the PPEC logo MediaAsset requirement is resolved or explicitly waived.

## Reason

The Phase 8K approved homepage includes PPEC logo treatment and source image files. The current official media manifest does not provide a Pumpkin MediaAsset id for the PPEC logo, and this run is not allowed to create or update MediaAsset records.

## Requirement

- Required slot: \`ppecPartnerLogo\`
- Source file: \`${ppecFindings.preferredLogoSourceFile}\`
- MediaAsset id: \`null\`
- Status: \`${ppecFindings.mediaRequirement.status}\`
- Required before production: yes

## Validation status

- Validation state: \`${validationSummary.status}\`
- Import readiness: \`${classifyReadiness(validationSummary, ppecFindings)}\`
`;
}

function renderEmailAudit(inventory) {
  return `# Email Correction Audit

## Result

- Selected mailbox: \`${approvedEmail}\`
- Public email display policy: \`form-first-under-review\`
- Public homepage email link: disabled
- Live sending: disabled
- Legacy public homepage mailbox: replaced/removed from generated candidate and package

## Source files with corrected mailbox

${listOrNone(inventory.approvedEmailFiles)}

## Source files with legacy contact-us mailbox

${listOrNone(inventory.legacyEmailFiles)}

The generated candidate and package do not include the legacy mailbox literal or public homepage email links.
`;
}

function renderReadiness(validationSummary, ppecFindings) {
  return `# Import Readiness Decision

## Classification

\`${classifyReadiness(validationSummary, ppecFindings)}\`

## Candidate status

- Valid for review: yes
- Local draft import ready: no, unless the unresolved PPEC logo media requirement is explicitly waived
- Production ready: no
- CMS records changed in this run: no

## Blockers

${validationSummary.blockers.length > 0 ? validationSummary.blockers.map((item) => `- ${item}`).join('\n') : '- PPEC logo MediaAsset id is missing.'}

## Notes

If a PPEC logo MediaAsset id is uploaded and bound, rerun validation before any local draft import. This conversion does not approve publish or production status.
`;
}

function renderNextPlan(validationSummary, ppecFindings) {
  return `# Next Import Plan

## Exact next step

Upload or bind an approved Pumpkin MediaAsset for the PPEC partner logo, then rerun this validation package and only then decide whether to run a local draft homepage import.

## Preconditions before any import

- Resolve \`ppecPartnerLogo\` requirement or record an explicit waiver.
- Confirm the approved PPEC URL and CTA policy remain accepted.
- Confirm public homepage email remains form-first with no public email link.
- Confirm no Theme or MediaAsset records need to be changed by the import itself.
- Obtain a fresh local admin JWT only if an import run is separately approved.

## Guardrails carried forward

${standardGuardrails().map((item) => `- ${item}`).join('\n')}

## Current validation state

- Validation status: \`${validationSummary.status}\`
- Import readiness: \`${classifyReadiness(validationSummary, ppecFindings)}\`
`;
}

function renderReadme(validationSummary) {
  return `# Ice Approved Homepage Conversion

This folder contains the review-only conversion of the approved Phase 8K homepage package into a repaired Pumpkin/Phase 10A-compatible homepage candidate.

No CMS writes, API writes, Theme updates, MediaAsset updates, static generation, deployment, provider changes, email sending, image generation, or Roller work occurred.

Validation status: \`${validationSummary.status}\`
`;
}

function renderRootReport(inventory, ppecFindings, validationSummary) {
  return `# Pumpkin Ice Approved Homepage Phase 8K to Phase 10A Conversion Report

## Status

Conversion completed for review. No CMS/API writes were performed.

## Start checks

- \`git status --short\`: clean except expected user-supplied input artifacts under \`content-review/ice-approved-homepage-conversion-input/\`.
- \`git log --oneline -12\` top commit at start: \`89ca42e Add Ice approved homepage conversion missing input report\`.

## Source package paths

- \`content-review/ice-approved-homepage-conversion-input/ice-homepage-phase8k-cf7-template-pack.zip\`
- \`content-review/ice-approved-homepage-conversion-input/ice-site-phase10a-pumpkin-ppec-rewrite-pack.zip\`
- \`content-review/ice-approved-homepage-conversion-input/ice-site-contact-email-correction-pack.zip\`
- \`content-review/ice-approved-homepage-conversion-input/ice-homepage.phase8n.crm-scaffold.full.json\`

## Phase 8K approved source findings

- Approved source section order was audited and preserved as renderer-compatible blocks.
- Hero, PPEC strip, event cards, process, rental options, corporate/public-space sections, PPEC banner, FAQ, quote form area, and final CTA were mapped into Pumpkin-native blocks.
- Old form runtime behavior was not carried forward.
- Generic regional service-area wording was corrected to domestic USA scope.

## Phase 10A requirements applied

- Tenant/site: \`ice-rink-rentals\`
- Route/path: \`/\`
- Slug: \`home\`
- Canonical: \`https://iceskatingrinkrentals.com/\`
- Workflow: draft / needs_review
- Production approved: false
- Publish approved: false
- Static publishing needs rebuild: true
- Real MediaAsset ids preserved for official Ice media.
- PPEC logo remains a media intake requirement because no approved MediaAsset id exists.

## Email correction result

- Selected mailbox: \`${approvedEmail}\`
- Public email display policy: \`form-first-under-review\`
- Public homepage email link: disabled
- Live email sending: disabled
- Legacy public homepage mailbox: replaced/removed from generated candidate and package

## PPEC logo/color/CTA findings

- ppec-icon.png exists: ${yesNo(ppecFindings.iconExists)}
- ppec-wordmark-card.png exists: ${yesNo(ppecFindings.wordmarkExists)}
- PPEC colors found: ${Object.values(ppecFindings.styleTokens).map((value) => `\`${value}\``).join(', ')}
- PPEC URL source: ${ppecFindings.url.source}
- Top CTA: ${ppecFindings.ctaCopy.topStrip}
- Deep CTA: ${ppecFindings.ctaCopy.deepBanner}

## PPEC MediaAsset requirement result

- Required slot: \`ppecPartnerLogo\`
- Source file: \`${ppecFindings.preferredLogoSourceFile}\`
- MediaAsset id: \`null\`
- Status: \`${ppecFindings.mediaRequirement.status}\`
- Required before production: yes

## Conversion summary

- Candidate: \`${rel(outputFiles.candidate)}\`
- Package: \`${rel(outputFiles.package)}\`
- Output folder: \`content-review/ice-approved-homepage-conversion/\`
- Extracted file count: ${inventory.extractedFiles.length}

## Validation results

- Validation status: \`${validationSummary.status}\`
${Object.entries(validationSummary.results).map(([key, value]) => `- ${key}: ok=${value.ok} (${value.summary})`).join('\n') || '- Validation pending.'}

## Import readiness

- Candidate ready for local draft import: no, unless the PPEC logo MediaAsset requirement is explicitly resolved or waived.
- Blocked by PPEC logo: ${yesNo(!ppecFindings.mediaAssetIdExists)}
- Blocked by PPEC color: no
- Blocked by PPEC URL: ${yesNo(!ppecFindings.url.productionReady)}

## Exact next step

Bind/upload an approved Pumpkin MediaAsset for the PPEC partner logo, then rerun validation and decide whether a separate local draft homepage import is approved.

## Guardrails honored

${standardGuardrails().map((item) => `- ${item}`).join('\n')}
`;
}

function buildExistingMediaRequirements() {
  return [
    requirement('site-logo', 'logo', 'header-footer', media.logo),
    requirement('homepage-hero-image', 'hero', 'homepage-hero-media', media.hero),
    requirement('homepage-corporate-event-image', 'card', 'homepage-event-fit-cards', media.corporate),
    requirement('homepage-holiday-shopping-center-image', 'card', 'homepage-event-fit-cards', media.holiday),
    requirement('homepage-setup-image', 'feature', 'homepage-rental-options-split-feature', media.setup),
    requirement('homepage-open-graph-image', 'og-image', 'seo.openGraph', { ...media.hero, usageType: 'og-image' }),
  ];
}

function requirement(slot, usageType, sectionId, asset) {
  return {
    requiredMediaSlotId: slot,
    mediaRequirementRef: slot,
    intendedUsageType: usageType,
    usageType,
    page: 'Homepage',
    sectionId,
    mediaAssetId: asset.mediaAssetId,
    assetId: asset.assetId,
    publicUrl: asset.publicUrl,
    url: asset.url,
    alt: asset.alt,
    title: asset.title,
    caption: asset.caption,
    source: asset.source,
    licenseStatus: asset.licenseStatus,
    usageStatus: asset.usageStatus,
    status: asset.status,
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
    blocker: false,
  };
}

const media = {
  logo: mediaAsset({
    mediaAssetId: 'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
    assetId: 'iceskatingrinkrentalslogo-0d1f970f0411',
    slug: 'iceskatingrinkrentalslogo-0d1f970f0411',
    alt: 'Ice Rink Rentals logo with ice skate and snowflake graphic',
    title: 'Ice Rink Rentals Logo',
    caption: 'Primary logo for Ice Rink Rentals.',
    usageType: 'logo',
  }),
  hero: mediaAsset({
    mediaAssetId: 'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
    assetId: 'winterfesticerinkrentals-324b1b89777d',
    slug: 'winterfesticerinkrentals-324b1b89777d',
    alt: 'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    title: 'Winter Festival Portable Ice Rink',
    caption: 'Featured hero image for portable ice rink rentals at holiday and winter events.',
    usageType: 'hero',
  }),
  corporate: mediaAsset({
    mediaAssetId: 'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
    assetId: 'corporateicerinkrentalevent-18e985ca59bd',
    slug: 'corporateicerinkrentalevent-18e985ca59bd',
    alt: 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    title: 'Corporate Ice Rink Rental Event',
    caption: 'Portable rink setup for corporate and VIP events.',
    usageType: 'card',
  }),
  holiday: mediaAsset({
    mediaAssetId: 'ice-rink-rentals-holidayicerink-973ce7691377',
    assetId: 'holidayicerink-973ce7691377',
    slug: 'holidayicerink-973ce7691377',
    alt: 'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    title: 'Holiday Shopping Center Ice Rink',
    caption: 'Portable ice rink at a shopping center and public holiday setting.',
    usageType: 'card',
  }),
  setup: mediaAsset({
    mediaAssetId: 'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
    assetId: 'icerinkrentalssetup-113d218572e4',
    slug: 'icerinkrentalssetup-113d218572e4',
    alt: 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    title: 'Portable Ice Rink Setup and Logistics',
    caption: 'Setup image showing rink barriers, surface planning, and skating aids.',
    usageType: 'feature',
  }),
};

function mediaAsset({ mediaAssetId, assetId, slug, alt, title, caption, usageType }) {
  return {
    mediaAssetId,
    assetId,
    publicUrl: `/media/ice-rink-rentals/2026/06/${slug}.png`,
    url: `/media/ice-rink-rentals/2026/06/${slug}.png`,
    alt,
    title,
    caption,
    description: '',
    source: 'pumpkin_media_library_local_dev',
    licenseStatus: 'owned',
    usageStatus: 'needs_review',
    usageType,
    status: 'mediaasset-bound',
    tags: [],
    blocker: false,
    width: null,
    height: null,
    focalPointX: null,
    focalPointY: null,
    decorative: false,
  };
}

function standardGuardrails() {
  return [
    'No CMS records changed.',
    'No API writes.',
    'No homepage import.',
    'No contact import.',
    'No /service-areas update.',
    'No /state-city creation.',
    'No Theme records changed.',
    'No MediaAsset records changed.',
    'No static generation.',
    'No deploy, DNS, email provider, Azure, Cloudflare, or Bluehost action.',
    'No email was sent.',
    'No image generation or image tools were used.',
    'No protected config was read or modified.',
    'No secrets, JWTs, tokens, credentials, connection strings, SMTP secrets, storage keys, or provider credentials were printed.',
    'Roller remains paused.',
  ];
}

function stripLegacyEmail(value) {
  const text = JSON.stringify(value);
  if (!text.includes(legacyEmail)) return value;
  return JSON.parse(text.split(legacyEmail).join(approvedEmail));
}

function listFiles(root) {
  if (!existsSync(root)) return [];
  const results = [];
  for (const item of readdirSync(root)) {
    const full = path.join(root, item);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      results.push(...listFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function isTextLike(file) {
  return /\.(json|md|txt|html|css)$/i.test(file);
}

function listOrNone(items) {
  return items.length > 0 ? items.map((item) => `- \`${item}\``).join('\n') : '- None found.';
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rel(value) {
  return path.relative(repoRoot, value).replace(/\\/g, '/');
}

function getStableGeneratedAt() {
  if (!existsSync(existingCandidatePath)) return new Date().toISOString();
  try {
    const existing = JSON.parse(readFileSync(existingCandidatePath, 'utf8'));
    return existing.reviewMetadata?.convertedAt ||
      existing.normalizerMetadata?.ppecHomepageConversion?.generatedAt ||
      new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

main();
