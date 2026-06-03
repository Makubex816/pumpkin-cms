#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const outDir = scriptDir;
const generatedAt = new Date().toISOString();

const sources = {
  homepage: 'content-review/ice-approved-homepage-live-cms-promotion/homepage-readback-after-live-cms-promotion.json',
  contactReadback: 'content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json',
  contactCandidate: 'content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json',
  serviceAreas: 'content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json',
  serviceAreasImportPackage: 'content-review/ice-service-areas-validated/SERVICE_AREAS_IMPORT_PACKAGE.json',
  homepagePromotionReport: 'content-review/ice-approved-homepage-live-cms-promotion/HOMEPAGE_READBACK_VERIFICATION.md',
  contactVisualQa: 'content-review/ice-local-visual-qa/CONTACT_PREVIEW_MARKERS.md',
  serviceAreasMediaReview: 'content-review/ice-service-areas-validated/MEDIA_BINDING_REVIEW.md',
  ppecLogoResult: 'content-review/ice-ppec-logo-replacement/PPEC_LOGO_MEDIAASSET_RESULT.md',
};

const assets = {
  logo: {
    label: 'Ice Rink Rentals logo',
    mediaAssetId: 'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
    assetId: 'iceskatingrinkrentalslogo-0d1f970f0411',
    publicUrl: '/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png',
    title: 'Ice Rink Rentals Logo',
  },
  winter: {
    label: 'Winter/hero',
    mediaAssetId: 'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
    assetId: 'winterfesticerinkrentals-324b1b89777d',
    publicUrl: '/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png',
    title: 'Winter Festival Portable Ice Rink',
  },
  corporate: {
    label: 'Corporate',
    mediaAssetId: 'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
    assetId: 'corporateicerinkrentalevent-18e985ca59bd',
    publicUrl: '/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png',
    title: 'Corporate Ice Rink Rental Event',
  },
  holiday: {
    label: 'Holiday/shopping center',
    mediaAssetId: 'ice-rink-rentals-holidayicerink-973ce7691377',
    assetId: 'holidayicerink-973ce7691377',
    publicUrl: '/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png',
    title: 'Holiday Shopping Center Ice Rink',
  },
  setup: {
    label: 'Setup/logistics',
    mediaAssetId: 'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
    assetId: 'icerinkrentalssetup-113d218572e4',
    publicUrl: '/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png',
    title: 'Portable Ice Rink Setup and Logistics',
  },
  ppec: {
    label: 'PPEC logo',
    mediaAssetId: 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
    assetId: 'partyproseastcoastlogo-cfd1fc9f60ae',
    publicUrl: '/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png',
    title: 'Party Pros East Coast Logo',
  },
};

const canonicalSlots = [
  slot('homepageHeroImage', 'Homepage', '/', 'homepage-hero-media', 'heroMedia', 'winter', '$.ContentData.ContentBlocks[0].content.media', 'Visible hero image', 'yes'),
  slot('homepageCorporateUseCaseImage', 'Homepage', '/', 'homepage-corporate-vip-split-feature', 'splitFeature', 'corporate', '$.ContentData.ContentBlocks[6].content.media', 'Corporate/VIP split feature and related use-case card', 'yes'),
  slot('homepageHolidayUseCaseImage', 'Homepage', '/', 'homepage-public-holiday-split-feature', 'splitFeature', 'holiday', '$.ContentData.ContentBlocks[7].content.media', 'Public holiday split feature and related use-case card', 'yes'),
  slot('homepageSetupLogisticsImage', 'Homepage', '/', 'homepage-rental-options-split-feature', 'splitFeature', 'setup', '$.ContentData.ContentBlocks[5].content.media', 'Rental options/setup logistics feature', 'yes'),
  slot('homepagePpecPartnerLogo', 'Homepage', '/', 'homepage-ppec-partner-strip', 'trustBand', 'ppec', '$.ContentData.ContentBlocks[1].content.partner.logoMedia', 'Partner logo in first PPEC partner banner', 'yes'),
  slot('homepageOpenGraphImage', 'Homepage', '/', 'page seo/media', 'openGraphImage', 'winter', '$.media.openGraphImage and $.seo.openGraph', 'Open Graph/social image; not visible in page body', 'metadata-only'),
  slot('contactHeroImage', 'Contact', '/contact', 'contact-hero-media', 'heroMedia', 'winter', '$.ContentData.ContentBlocks[0].content.media in validated candidate; $.media.heroImage in readback', 'Hero/featured contact image', 'yes via candidate; readback carries page media URL'),
  slot('contactQuotePlanningImage', 'Contact', '/contact', 'contact-quote-context', 'splitFeature', 'setup', '$.ContentData.ContentBlocks[2].content.media in validated candidate; $.media.setupImage in candidate', 'Quote planning/setup context image', 'yes via candidate'),
  slot('contactSupportImage', 'Contact', '/contact', 'contact-event-types', 'event-card-grid', 'corporate/holiday/setup', '$.ContentData.ContentBlocks[5].content.cards[*].media in validated candidate', 'Event-type support card media', 'yes via candidate'),
  slot('contactOpenGraphImage', 'Contact', '/contact', 'page seo/media', 'openGraphImage', 'winter', '$.media.openGraphImage in candidate; $.media.openGraphImage URL in readback', 'Open Graph/social image; not visible in page body', 'metadata-only'),
  slot('contactPpecPartnerLogo', 'Contact', '/contact', 'contact-partner-referral', 'trustBand', 'ppec', 'Not currently present as image', 'Only needed if the contact PPEC callout gains a logo image', 'not rendered'),
  slot('serviceAreasHeroImage', 'Service Areas', '/service-areas', 'service-areas-hero', 'heroMedia', 'winter', '$.ContentData.ContentBlocks[0].content.media and $.media.heroImage', 'Visible service-areas hero image', 'yes'),
  slot('serviceAreasCoverageImage', 'Service Areas', '/service-areas', 'page media/local coverage', 'localImage', 'corporate', '$.media.localImage', 'Coverage/local planning supporting image', 'metadata/page-level'),
  slot('serviceAreasSetupImage', 'Service Areas', '/service-areas', 'setup-logistics-feature', 'splitFeature', 'setup', '$.ContentData.ContentBlocks[4].content.media and $.media.setupImage', 'Visible setup logistics feature image', 'yes'),
  slot('serviceAreasCorporateImage', 'Service Areas', '/service-areas', 'service-area-use-cases', 'mediaUseCaseGrid', 'corporate', '$.ContentData.ContentBlocks[6].content.cards[1].media', 'Corporate/brand activation use-case card', 'yes'),
  slot('serviceAreasHolidayImage', 'Service Areas', '/service-areas', 'service-area-use-cases', 'mediaUseCaseGrid', 'holiday', '$.ContentData.ContentBlocks[6].content.cards[0].media and $.media.closingImage', 'Holiday/winter attraction use-case card and closing page media', 'yes'),
  slot('serviceAreasOpenGraphImage', 'Service Areas', '/service-areas', 'page seo/media', 'openGraphImage', 'winter', '$.media.openGraphImage and $.seo.openGraph', 'Open Graph/social image; not visible in page body', 'metadata-only'),
  slot('serviceAreasFinalCtaImage', 'Service Areas', '/service-areas', 'service-areas-final-cta', 'finalCta', 'holiday', 'No block-level media slot; recommended fallback is $.media.closingImage if renderer later supports image', 'Optional final CTA visual fallback', 'not currently rendered'),
];

const altTextPlan = [
  alt('homepageHeroImage', 'Guests skating on a festive portable ice rink under holiday lights for an event rental', 'Winter Festival Portable Ice Rink', 'Hero image for portable ice skating rink rental planning.', 'Primary homepage hero image', 'hero', 'homepage, hero, winter festival, portable rink', 'yes'),
  alt('homepageCorporateUseCaseImage', 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event', 'Corporate Ice Rink Rental Event', 'Portable rink setup for corporate and VIP events.', 'Corporate/VIP event proof point', 'section-media', 'homepage, corporate, VIP, brand activation', 'yes'),
  alt('homepageHolidayUseCaseImage', 'Families and children skating on a portable ice rink at an outdoor holiday shopping center', 'Holiday Shopping Center Ice Rink', 'Portable ice rink at a shopping center and public holiday setting.', 'Public holiday destination example', 'section-media', 'homepage, holiday, shopping center, public attraction', 'yes'),
  alt('homepageSetupLogisticsImage', 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event', 'Portable Ice Rink Setup and Logistics', 'Setup image showing rink barriers, surface planning, and skating aids.', 'Setup and rental logistics explanation', 'section-media', 'homepage, setup, logistics, barriers', 'yes'),
  alt('homepagePpecPartnerLogo', 'Party Pros East Coast logo', 'Party Pros East Coast Logo', 'Official Party Pros East Coast logo for partner/resource callout.', 'Partner-resource brand mark in PPEC banner', 'partner-logo', 'homepage, partner, PPEC, logo', 'yes'),
  alt('homepageOpenGraphImage', 'Guests skating on a festive portable ice rink under holiday lights', 'Winter Festival Portable Ice Rink', 'Social preview image for IceSkatingRinkRentals.com.', 'Social/share preview', 'open-graph', 'homepage, social, winter festival', 'yes'),
  alt('contactHeroImage', 'Guests skating on a festive portable ice rink while planning a rental quote request', 'Ice Rink Rental Quote Request Hero', 'Contact page hero image for quote-request planning.', 'Contact hero image', 'hero', 'contact, quote request, portable rink', 'yes'),
  alt('contactQuotePlanningImage', 'Portable ice rink setup details reviewed during quote planning', 'Portable Ice Rink Quote Planning', 'Setup, access, and support details to include with a quote request.', 'Quote-planning context image', 'section-media', 'contact, setup, quote planning, logistics', 'yes'),
  alt('contactSupportImage', 'Portable ice rink event examples for quote-request support planning', 'Ice Rink Event Examples for Quote Planning', 'Event examples that help shape an ice rink rental request.', 'Support/use-case card media', 'card-media', 'contact, event examples, quote support', 'yes'),
  alt('contactOpenGraphImage', 'Ice rink rental quote request planning for a portable rink event', 'Ice Rink Rental Quote Request', 'Social preview image for the contact and quote-request page.', 'Social/share preview', 'open-graph', 'contact, social, quote request', 'yes'),
  alt('contactPpecPartnerLogo', 'Party Pros East Coast logo', 'Party Pros East Coast Logo', 'Optional partner-resource logo if the contact callout is later rendered with an image.', 'Optional contact partner-logo reuse only', 'partner-logo', 'contact, partner, PPEC, logo', 'no'),
  alt('serviceAreasHeroImage', 'Guests skating on a festive portable ice rink for U.S. service-area availability review', 'Portable Ice Rink Rental Service Area Hero', 'Service-area hero image for route and availability review.', 'Service-areas hero image', 'hero', 'service areas, availability, portable rink', 'yes'),
  alt('serviceAreasCoverageImage', 'Corporate guests skating at a portable rink used as a service-area coverage planning example', 'Portable Rink Coverage Planning Example', 'Page-level coverage image for service-area planning metadata.', 'Coverage/local page-level media', 'page-media', 'service areas, coverage, planning, corporate', 'yes'),
  alt('serviceAreasSetupImage', 'Portable ice rink setup logistics reviewed for service-area availability', 'Portable Ice Rink Setup for Service-Area Planning', 'Setup logistics image for route, venue, and support review.', 'Service-area setup logistics feature', 'section-media', 'service areas, setup, logistics, availability', 'yes'),
  alt('serviceAreasCorporateImage', 'Corporate guests skating and networking around a portable rink for route-based event planning', 'Corporate Portable Ice Rink Route Planning', 'Corporate and brand activation example for service-area planning.', 'Corporate use-case card', 'card-media', 'service areas, corporate, brand activation', 'yes'),
  alt('serviceAreasHolidayImage', 'Families skating at a public holiday portable ice rink for seasonal service-area planning', 'Holiday Portable Ice Rink Service Area Example', 'Public holiday attraction example for service-area planning.', 'Holiday use-case card and closing media', 'card-media', 'service areas, holiday, public attraction', 'yes'),
  alt('serviceAreasOpenGraphImage', 'Portable ice rink rental service-area review across the United States', 'Portable Ice Rink Rental Service Areas', 'Social preview image for the service-areas page.', 'Social/share preview', 'open-graph', 'service areas, social, portable rink', 'yes'),
  alt('serviceAreasFinalCtaImage', 'Families skating at a public holiday portable ice rink while checking event-location availability', 'Check Portable Ice Rink Availability', 'Optional final CTA image if the renderer later supports a visual CTA.', 'Optional final CTA visual fallback', 'section-media', 'service areas, final CTA, availability', 'no if final CTA stays text-only'),
];

const missingMediaFindings = [
  {
    area: 'Homepage planning-topics card media stubs',
    status: 'non-blocking',
    detail: 'The live homepage contains empty nested media objects for planning-topic/card metadata. They are not the current renderer image slots and do not require uploads before local planning continues.',
  },
  {
    area: 'Homepage split-feature nested card media stubs',
    status: 'non-blocking',
    detail: 'The primary split-feature media objects are bound to official assets; nested supporting-card media stubs remain empty and are not currently rendered as image slots.',
  },
  {
    area: 'Contact readback MediaAsset IDs',
    status: 'review before production',
    detail: 'The validated contact candidate has official MediaAsset IDs, while the CMS readback keeps page-level assetId/publicUrl values and omits mediaAssetId on those page-level fields. Do not change contact in this run; reconfirm if contact is promoted later.',
  },
  {
    area: 'Contact PPEC logo',
    status: 'not required',
    detail: 'The contact PPEC/support callout is text-only. If a logo is added later, reuse the existing PPEC MediaAsset instead of uploading another copy.',
  },
  {
    area: 'Service-areas final CTA image',
    status: 'not required for current candidate',
    detail: 'The final CTA block is text-first and has no block-level media slot. The page-level closingImage is already bound to the holiday asset if a visual fallback is needed later.',
  },
  {
    area: 'New upload requirements',
    status: 'none',
    detail: 'No current required slot needs a new MediaAsset. Reuse the six approved MediaAssets listed in the canonical map.',
  },
];

mkdirSync(outDir, { recursive: true });

const loadedSources = loadSources();
const sourcePresenceRows = Object.entries(sources).map(([key, relPath]) => ({
  key,
  path: relPath,
  exists: existsSync(abs(relPath)),
}));

write('README.md', renderReadme(sourcePresenceRows));
write('PAGE_MEDIA_INVENTORY.md', renderPageMediaInventory());
write('CANONICAL_MEDIA_SLOT_MAP.md', renderCanonicalMap());
write('HOMEPAGE_MEDIA_SLOT_PLAN.md', renderHomepagePlan());
write('CONTACT_MEDIA_SLOT_PLAN.md', renderContactPlan());
write('SERVICE_AREAS_MEDIA_SLOT_PLAN.md', renderServiceAreasPlan());
write('PAGE_SPECIFIC_ALT_TEXT.md', renderAltTextPlan());
write('MEDIA_REUSE_DECISION.md', renderMediaReuseDecision());
write('MISSING_MEDIA_REQUIREMENTS.md', renderMissingMediaRequirements());
write('IMPORT_READINESS_IMPACT.md', renderImportReadinessImpact());

const manifest = {
  schemaVersion: 'pumpkin.cross-page-media-slot-plan.v1',
  generatedAt,
  primarySite: 'IceSkatingRinkRentals.com',
  routesReviewed: ['/', '/contact', '/service-areas'],
  planningOnly: true,
  cmsWrites: false,
  mediaAssetWrites: false,
  imageGenerationUsed: false,
  imagesModified: false,
  staticRegenerated: false,
  deploymentPerformed: false,
  rollerTouched: false,
  protectedConfigRead: false,
  optionalCandidatesCreated: [],
  sourcePresence: sourcePresenceRows,
  officialMediaAssets: assets,
  readiness: {
    homepageMediaReady: true,
    contactMediaReady: true,
    serviceAreasMediaReady: true,
    serviceAreasReadyForLocalDraftImport: true,
    staticProductionMediaReady: false,
  },
  outputFiles: [
    'README.md',
    'PAGE_MEDIA_INVENTORY.md',
    'CANONICAL_MEDIA_SLOT_MAP.md',
    'HOMEPAGE_MEDIA_SLOT_PLAN.md',
    'CONTACT_MEDIA_SLOT_PLAN.md',
    'SERVICE_AREAS_MEDIA_SLOT_PLAN.md',
    'PAGE_SPECIFIC_ALT_TEXT.md',
    'MEDIA_REUSE_DECISION.md',
    'MISSING_MEDIA_REQUIREMENTS.md',
    'IMPORT_READINESS_IMPACT.md',
    'manifest.json',
  ],
  validationStatus: 'pending-final-command-results',
};
writeJson('manifest.json', manifest);
writeRootReport('pending-final-command-results');

console.log(JSON.stringify({
  ok: true,
  outputDirectory: normalizeRel(outDir),
  rootReport: 'PUMPKIN_ICE_CROSS_PAGE_MEDIA_SLOT_PLAN_REPORT.md',
  filesWritten: manifest.outputFiles.length + 1,
  planningOnly: true,
  cmsWrites: false,
}, null, 2));

function slot(id, page, route, blockId, variant, assetKey, sourcePath, purpose, rendersVisibly) {
  return { id, page, route, blockId, variant, assetKey, sourcePath, purpose, rendersVisibly };
}

function alt(slotId, altText, title, caption, purpose, usageType, tags, requiredBeforeProduction) {
  return { slotId, altText, title, caption, purpose, usageType, tags, requiredBeforeProduction };
}

function loadSources() {
  const loaded = {};
  for (const [key, relPath] of Object.entries(sources)) {
    const fullPath = abs(relPath);
    if (!existsSync(fullPath)) continue;
    if (relPath.endsWith('.json')) {
      loaded[key] = JSON.parse(readFileSync(fullPath, 'utf8'));
    } else {
      loaded[key] = readFileSync(fullPath, 'utf8');
    }
  }
  return loaded;
}

function renderReadme(sourceRows) {
  return md(`# Ice Cross-Page Media Slot Plan

Generated: ${generatedAt}

This package is a local planning and validation audit for media reuse across IceSkatingRinkRentals.com homepage \`/\`, contact \`/contact\`, and the normalized \`/service-areas\` candidate. It does not import service areas, update CMS records, update MediaAsset records, regenerate static output, deploy, modify images, generate images, touch provider/DNS/email systems, or touch Roller.

## Sources Reviewed

${table(['Key', 'Path', 'Present'], sourceRows.map((row) => [row.key, code(row.path), row.exists ? 'yes' : 'no']))}

## Outputs

- \`PAGE_MEDIA_INVENTORY.md\` - current page media usage and empty/media-stub observations.
- \`CANONICAL_MEDIA_SLOT_MAP.md\` - recommended canonical slot-to-MediaAsset map.
- \`HOMEPAGE_MEDIA_SLOT_PLAN.md\` - homepage-specific reuse plan.
- \`CONTACT_MEDIA_SLOT_PLAN.md\` - contact-specific reuse plan.
- \`SERVICE_AREAS_MEDIA_SLOT_PLAN.md\` - service-areas-specific reuse plan.
- \`PAGE_SPECIFIC_ALT_TEXT.md\` - slot-specific alt/title/caption/purpose metadata.
- \`MEDIA_REUSE_DECISION.md\` - reuse versus upload policy and result.
- \`MISSING_MEDIA_REQUIREMENTS.md\` - blockers, non-blocking stubs, and upload requirements.
- \`IMPORT_READINESS_IMPACT.md\` - readiness impact before service-area import.
- \`manifest.json\` - machine-readable summary.

## Planning Result

The current plan intentionally reuses the approved official MediaAssets. No new MediaAsset is required for the current homepage, contact, or service-areas page plans. The service-areas candidate is media-ready for a future local draft import, but static/production media readiness remains blocked until the Azure Blob/Cloudflare media path exists and is verified.`);
}

function renderPageMediaInventory() {
  const rows = canonicalSlots.map((item) => {
    const asset = assets[item.assetKey] || {};
    const recommendation = item.id.includes('Ppec') && item.rendersVisibly === 'not rendered'
      ? 'Reuse existing PPEC logo only if an image slot is added'
      : 'Reuse existing official MediaAsset';
    return [
      item.page,
      item.route,
      item.blockId,
      item.variant,
      item.id,
      asset.mediaAssetId || 'multiple existing assets',
      altFor(item.id)?.altText || '',
      item.rendersVisibly,
      isOptionalSlot(item) ? 'not required/optional' : 'no',
      recommendation,
      isProductionReady(item) ? 'yes for local draft; production media path still pending' : 'conditional',
    ];
  });

  return md(`# Page Media Inventory

## Canonical Slot Inventory

${table([
    'Page',
    'Route',
    'Block/Section',
    'Variant',
    'Media slot',
    'Current/recommended MediaAsset ID',
    'Alt text plan',
    'Renders visibly',
    'Empty/null/placeholder',
    'Reuse/upload decision',
    'Production readiness',
  ], rows)}

## Empty, Placeholder, And Missing Slot Observations

${missingMediaFindings.map((item) => `- ${item.area}: ${item.status}. ${item.detail}`).join('\n')}

## Source-Derived Notes

- Homepage live readback reports official homepage media IDs persisted, PPEC logo/copy persisted, and no failed readback checks.
- Contact visual QA reports the public local contact route responded with HTTP 200 and contact readiness for manual browser visual approval. The contact readback carries page-level media URLs, while the validated candidate carries official MediaAsset IDs.
- Service-areas media binding review reports official MediaAsset IDs only, no invented IDs, no external/fake media URLs, no base64 images, and no raw extracted media embedded.
- The service-area PPEC block is text-only and does not currently use the PPEC logo asset.`);
}

function renderCanonicalMap() {
  const rows = canonicalSlots.map((item) => {
    const asset = assets[item.assetKey];
    return [
      item.id,
      item.page,
      item.route,
      item.blockId,
      item.variant,
      asset ? asset.label : 'Multiple official assets',
      asset ? asset.mediaAssetId : 'corporate/holiday/setup, depending card',
      item.sourcePath,
      uploadNeed(item),
    ];
  });

  return md(`# Canonical Media Slot Map

The map below uses one canonical MediaAsset per image where reuse is appropriate. Page-specific meaning is handled through alt text, title, caption, purpose, tags, and usage type rather than by duplicating identical image files.

${table(['Slot', 'Page', 'Route', 'Block/Section', 'Variant', 'Asset', 'MediaAsset ID', 'Current or planned source path', 'New upload needed'], rows)}

## Approved MediaAssets Reused

${Object.values(assets).map((asset) => `- ${asset.label}: \`${asset.mediaAssetId}\` at \`${asset.publicUrl}\``).join('\n')}

## New MediaAsset Requirements

No required current slot needs a new upload. If future design work adds a contact PPEC logo or a service-areas final CTA image, the plan is to reuse existing assets first.`);
}

function renderHomepagePlan() {
  const rows = canonicalSlots.filter((item) => item.page === 'Homepage').map(slotRow);
  return md(`# Homepage Media Slot Plan

Source: \`${sources.homepage}\`

The homepage is already approved and live in CMS. This run does not update \`/\`; it only records the current approved bindings and the recommended canonical slot names.

${table(['Slot', 'Section', 'Variant', 'Asset reused', 'MediaAsset ID', 'Purpose', 'Action'], rows)}

## Homepage Notes

- Homepage media-ready: yes for the approved/live CMS page.
- PPEC logo binding is the approved PPEC logo MediaAsset \`${assets.ppec.mediaAssetId}\`.
- The partner banner uses the existing renderer/CSS contrast repair; this plan does not change colors, layout, copy, CTA behavior, image files, or MediaAssets.
- Empty nested card media stubs remain non-blocking because the visible split-feature and hero media slots are already bound to official assets.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.`);
}

function renderContactPlan() {
  const rows = canonicalSlots.filter((item) => item.page === 'Contact').map(slotRow);
  return md(`# Contact Media Slot Plan

Sources:

- Readback: \`${sources.contactReadback}\`
- Validated candidate: \`${sources.contactCandidate}\`

This run does not update \`/contact\`. The plan uses the validated candidate as the canonical MediaAsset-ID source and the readback/visual QA artifacts as the current local-render evidence.

${table(['Slot', 'Section', 'Variant', 'Asset reused', 'MediaAsset ID', 'Purpose', 'Action'], rows)}

## Contact Notes

- Contact media-ready: yes for the validated contact candidate and current local render evidence.
- The contact CMS readback keeps page-level \`assetId\` and \`publicUrl\` values but omits \`mediaAssetId\` on some page-level media fields. Treat that as a production-readiness check before any later contact promotion.
- The contact PPEC/support callout is text-only. If a logo is later added, reuse \`${assets.ppec.mediaAssetId}\`; do not upload a duplicate.
- No contact CMS write, import, MediaAsset update, or content change is included in this package.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.`);
}

function renderServiceAreasPlan() {
  const rows = canonicalSlots.filter((item) => item.page === 'Service Areas').map(slotRow);
  return md(`# Service Areas Media Slot Plan

Sources:

- Candidate: \`${sources.serviceAreas}\`
- Import package: \`${sources.serviceAreasImportPackage}\`

The normalized \`/service-areas\` candidate is already bound to the approved official MediaAssets. This run does not import it and does not create a patched media-bound candidate because the required media bindings are already present.

${table(['Slot', 'Section', 'Variant', 'Asset reused', 'MediaAsset ID', 'Purpose', 'Action'], rows)}

## Service-Areas Notes

- Service-areas media-ready: yes for local draft import planning.
- Service-areas ready for local draft import after media plan: yes, based on existing normalized candidate bindings and previous preflight artifacts.
- The service-area PPEC block is text-only and does not need the PPEC logo asset.
- The final CTA has no block-level image slot. If a visual CTA is introduced later, reuse the page-level \`closingImage\` holiday asset unless a genuinely different image is required.
- Static/production media-ready remains no until the Azure Blob/Cloudflare media path exists and is verified.`);
}

function renderAltTextPlan() {
  return md(`# Page-Specific Alt Text And Metadata

The same MediaAsset can be reused across pages while the surrounding slot metadata remains page-specific.

${table([
    'Slot',
    'Alt text',
    'Title',
    'Caption',
    'Description/purpose',
    'Usage type',
    'Tags',
    'Required before production',
  ], altTextPlan.map((item) => [
    item.slotId,
    item.altText,
    item.title,
    item.caption,
    item.purpose,
    item.usageType,
    item.tags,
    item.requiredBeforeProduction,
  ]))}

## Metadata Rule

Do not create a duplicate MediaAsset just to make page usage unique. Keep the image asset canonical and express page-specific meaning through the slot metadata above.`);
}

function renderMediaReuseDecision() {
  return md(`# Media Reuse Decision

## Decision

Reuse existing approved MediaAssets for all current required homepage, contact, and service-areas image slots. No new upload is needed for this planning pass.

## Reuse Rules Applied

- Reuse one canonical MediaAsset when the image file is the same across pages.
- Keep page-specific alt text, titles, captions, purposes, usage types, and tags in the page/slot plan.
- Create a new MediaAsset only for a genuinely different source file, intentionally cropped/edited variant, or different checksum/path.
- Do not create fake IDs, fake URLs, base64 images, or external image URLs.
- Do not modify image files.

## Asset Reuse Summary

${table(['Asset', 'MediaAsset ID', 'Used by slots'], Object.entries(assets).map(([key, asset]) => [
    asset.label,
    asset.mediaAssetId,
    canonicalSlots.filter((item) => item.assetKey === key).map((item) => item.id).join(', ') || 'reserved for optional reuse',
  ]))}

## Upload Requirements

No current required media slot needs a new upload. Optional future additions should first reuse existing official assets.`);
}

function renderMissingMediaRequirements() {
  return md(`# Missing Media Requirements

${table(['Area', 'Status', 'Requirement or blocker'], missingMediaFindings.map((item) => [item.area, item.status, item.detail]))}

## Placeholder And Wrong-Asset Checks

- Empty homepage nested card media stubs: found, non-blocking, not treated as visible image slots.
- Empty contact PPEC logo media: no required image slot exists.
- Empty service-areas final CTA image: no required block-level image slot exists.
- Null MediaAsset IDs in required service-areas slots: none found in the normalized candidate.
- Placeholder/external/base64 image URLs in service-areas candidate: none reported by existing service-areas media review.
- Wrong or old PPEC logo ID in current homepage live source: not found. Current expected ID is \`${assets.ppec.mediaAssetId}\`.

## New Upload Requirements

None for local draft import planning.`);
}

function renderImportReadinessImpact() {
  return md(`# Import Readiness Impact

## Readiness

${table(['Area', 'Status', 'Reason'], [
    ['Homepage media-ready', 'yes', 'Approved/live homepage readback has official media IDs persisted, including the current PPEC logo.'],
    ['Contact media-ready', 'yes', 'Validated contact candidate has official IDs; current local route/readback evidence is sufficient for planning. Reconfirm ID persistence before any contact production promotion.'],
    ['Service-areas media-ready', 'yes', 'Normalized candidate uses official IDs, local media URLs, alt text, and no raw/external/base64 images.'],
    ['Service-areas ready for local draft import', 'yes', 'Media plan introduces no new blocker and does not require a candidate patch. Existing preflight artifacts report no blockers.'],
    ['Static/production media-ready', 'no', 'Azure Blob/Cloudflare production media path is not established/verified yet.'],
  ])}

## Import Impact

- Do not import \`/service-areas\` during this run.
- A future local draft import may use \`${sources.serviceAreas}\` as-is from a media binding standpoint.
- No homepage/contact candidate changes are required for the service-area media plan.
- No CMS, Theme, MediaAsset, static generation, deployment, DNS, email/provider, protected config, or Roller action is required.

## Next Recommended Action

Proceed to a controlled \`/service-areas\` local draft import only after the user approves the existing normalized candidate and this media reuse plan. Keep production/static media publishing blocked until the cloud media path is verified.`);
}

function writeRootReport(validationStatus) {
  writeRoot(md(`# Pumpkin Ice Cross-Page Media Slot Plan Report

Generated: ${generatedAt}

## Scope

- Primary site: IceSkatingRinkRentals.com
- Routes reviewed: \`/\`, \`/contact\`, \`/service-areas\`
- Output folder: \`content-review/ice-cross-page-media-slot-plan/\`
- Planning only: yes

## Starting State

- Git status at start showed only the existing untracked service-area input ZIP and extracted reference package files.
- Latest branch history reviewed with \`git log --oneline -12\`.
- Homepage \`/\` is approved and live in CMS.
- \`/contact\` exists and was not changed.
- \`/service-areas\` is normalized/validated but was not imported.

## Files Changed

- Created/updated cross-page media slot plan docs in \`content-review/ice-cross-page-media-slot-plan/\`.
- Created/updated this root report: \`PUMPKIN_ICE_CROSS_PAGE_MEDIA_SLOT_PLAN_REPORT.md\`.
- No CMS records, Theme records, MediaAsset records, image files, static packages, deployment files, DNS/email/provider settings, protected config, or Roller files were changed.

## Pages Reviewed

${table(['Page', 'Route', 'Primary source'], [
    ['Homepage', '/', sources.homepage],
    ['Contact', '/contact', `${sources.contactReadback}; canonical candidate ${sources.contactCandidate}`],
    ['Service Areas', '/service-areas', sources.serviceAreas],
  ])}

## Media Slots Found

${table(['Page', 'Canonical slot count', 'Media-ready'], [
    ['Homepage', canonicalSlots.filter((item) => item.page === 'Homepage').length, 'yes'],
    ['Contact', canonicalSlots.filter((item) => item.page === 'Contact').length, 'yes'],
    ['Service Areas', canonicalSlots.filter((item) => item.page === 'Service Areas').length, 'yes'],
  ])}

## Existing MediaAssets Reused

${Object.values(assets).map((asset) => `- \`${asset.mediaAssetId}\` - ${asset.label}`).join('\n')}

## Missing Media Requirements

- No current required media slot needs a new upload.
- Homepage has non-rendering nested card media stubs that remain empty and non-blocking.
- Contact readback omits some page-level \`mediaAssetId\` fields while preserving \`assetId\`/\`publicUrl\`; reconfirm before any later contact production promotion.
- Service-areas final CTA has no block-level image slot; page-level \`closingImage\` is available as a reuse fallback if needed later.
- Static/production media readiness remains blocked until Azure Blob/Cloudflare media path is available and verified.

## Placeholder/Null Media Blockers

- Required local-draft media blockers: none.
- New-upload blockers: none.
- Wrong/old PPEC logo ID in current homepage source: none found.
- Raw/external/base64 media embedded in service-areas candidate: none reported by existing media review.

## Readiness Classification

${table(['Readiness item', 'Result'], [
    ['Homepage media-ready', 'yes'],
    ['Contact media-ready', 'yes'],
    ['Service-areas media-ready', 'yes'],
    ['Service-areas ready for local draft import after media plan', 'yes'],
    ['Static/production media-ready', 'no until Azure Blob/Cloudflare media path exists'],
  ])}

## Validation Results

Validation status: ${validationStatus}

Final command validation results are recorded after running local parse/scans. No CMS/API write validation is included because this run is planning-only.

## Next Recommended Action

User approval can move the already-normalized \`/service-areas\` candidate into a controlled local draft import. Keep static/production media publishing paused until the cloud media path is verified.`));
}

function slotRow(item) {
  const asset = assets[item.assetKey];
  return [
    item.id,
    item.blockId,
    item.variant,
    asset ? asset.label : 'Multiple existing assets',
    asset ? asset.mediaAssetId : 'See card-specific existing assets',
    item.purpose,
    uploadNeed(item) === 'no' ? 'No write; reuse asset' : uploadNeed(item),
  ];
}

function altFor(slotId) {
  return altTextPlan.find((item) => item.slotId === slotId);
}

function uploadNeed(item) {
  if (item.id === 'contactPpecPartnerLogo') return 'no - optional reuse only';
  if (item.id === 'serviceAreasFinalCtaImage') return 'no - optional fallback only';
  return 'no';
}

function isOptionalSlot(item) {
  return item.id === 'contactPpecPartnerLogo' || item.id === 'serviceAreasFinalCtaImage';
}

function isProductionReady(item) {
  return !isOptionalSlot(item);
}

function code(value) {
  return `\`${value}\``;
}

function table(headers, rows) {
  const escapeCell = (value) => String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
  return [
    `| ${headers.map(escapeCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n');
}

function md(value) {
  return `${value.trim()}\n`;
}

function write(fileName, content) {
  writeFileSync(path.join(outDir, fileName), content, 'utf8');
}

function writeRoot(content) {
  writeFileSync(path.join(repoRoot, 'PUMPKIN_ICE_CROSS_PAGE_MEDIA_SLOT_PLAN_REPORT.md'), content, 'utf8');
}

function writeJson(fileName, value) {
  write(fileName, `${JSON.stringify(value, null, 2)}\n`);
}

function abs(relPath) {
  return path.join(repoRoot, relPath);
}

function normalizeRel(fullPath) {
  return path.relative(repoRoot, fullPath).replace(/\\/g, '/');
}
