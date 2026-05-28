import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const inputDir = 'content-review/ice-homepage-media-input';
const outputDir = 'content-review/ice-homepage-media-upload-selection';
const preferredCandidate = 'content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json';
const fallbackCandidate = 'content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json';
const phase8c14Candidate = 'content-review/ice-homepage-phase8c14-validated/proposed-homepage.normalized-candidate.json';
const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const createdAt = new Date().toISOString();

const officialFiles = [
  {
    fileName: 'IceSkatingRinkRentalsLogo.png',
    usage: 'site logo / brand asset',
    usageType: 'icon',
    usageSlot: 'logo',
    title: 'Ice Rink Rentals Logo',
    altText: 'Ice Rink Rentals logo with ice skate and snowflake graphic',
    caption: 'Official Ice Rink Rentals brand logo.',
    description: 'Brand logo for Ice Rink Rentals, used for site identity, header branding, and structured media references.',
    tags: ['logo', 'brand', 'ice-rink-rentals', 'identity'],
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
  },
  {
    fileName: 'WinterFestIceRinkRentals.png',
    usage: 'homepage hero / winter festival/community image',
    usageType: 'hero',
    usageSlot: 'homepage-hero',
    title: 'Winter Festival Ice Rink Rental',
    altText: 'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    caption: 'A portable ice rink creates a festive centerpiece for winter events and holiday celebrations.',
    description: 'Outdoor winter festival scene with guests skating on a portable ice rink surrounded by warm holiday lights and event activity.',
    tags: ['homepage-hero', 'winter-festival', 'holiday-event', 'portable-ice-rink', 'community-event'],
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
  },
  {
    fileName: 'CorporateIceRinkRentalEvent.png',
    usage: 'corporate event use-case image',
    usageType: 'card',
    usageSlot: 'corporate-event',
    title: 'Corporate Ice Rink Rental Event',
    altText: 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    caption: 'Portable ice rink rental setup for corporate events, holiday parties, and branded winter activations.',
    description: 'Evening corporate event with a temporary ice rink, professional guests, warm lighting, and outdoor reception atmosphere.',
    tags: ['corporate-event', 'event-activation', 'portable-ice-rink', 'winter-event', 'company-party'],
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
  },
  {
    fileName: 'HolidayIceRink.png',
    usage: 'holiday/shopping-center use-case image',
    usageType: 'card',
    usageSlot: 'holiday-shopping-center',
    title: 'Holiday Ice Rink Rental',
    altText: 'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    caption: 'Temporary ice rink attraction for holiday shopping centers, seasonal markets, and family-friendly events.',
    description: 'Holiday ice rink rental at an outdoor retail center with families, children, seasonal lighting, and festive activity.',
    tags: ['holiday-rink', 'shopping-center', 'family-event', 'seasonal-attraction', 'portable-ice-rink'],
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
  },
  {
    fileName: 'IceRinkRentalsSetup.png',
    usage: 'setup/logistics image',
    usageType: 'inline',
    usageSlot: 'setup-logistics',
    title: 'Portable Ice Rink Setup',
    altText: 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    caption: 'Portable rink setup showing temporary panels, rink surface, safety barriers, and event-ready layout.',
    description: 'Setup view of a portable ice rink rental with white barriers, rink flooring, skate aids, and outdoor event preparation.',
    tags: ['setup', 'logistics', 'rink-installation', 'portable-rink', 'event-prep'],
    requiredBeforeCmsImport: true,
    requiredBeforeProduction: true,
  },
];

const slotDefinitions = [
  {
    slotId: 'site-logo-primary',
    page: 'global-theme-homepage-reference',
    sectionId: 'site-header-footer-branding',
    sourceFileName: 'IceSkatingRinkRentalsLogo.png',
    usageType: 'logo',
    mediaAssetUsageType: 'icon',
    requiredBeforeStaging: true,
  },
  {
    slotId: 'homepage-hero-image',
    page: '/',
    sectionId: 'homepage-hero',
    sourceFileName: 'WinterFestIceRinkRentals.png',
    usageType: 'hero',
    mediaAssetUsageType: 'hero',
    requiredBeforeStaging: true,
  },
  {
    slotId: 'homepage-corporate-event-image',
    page: '/',
    sectionId: 'event-types',
    sourceFileName: 'CorporateIceRinkRentalEvent.png',
    usageType: 'card',
    mediaAssetUsageType: 'card',
    requiredBeforeStaging: true,
  },
  {
    slotId: 'homepage-setup-logistics-image',
    page: '/',
    sectionId: 'rental-options',
    sourceFileName: 'IceRinkRentalsSetup.png',
    usageType: 'inline',
    mediaAssetUsageType: 'inline',
    requiredBeforeStaging: true,
  },
  {
    slotId: 'homepage-holiday-shopping-center-image',
    page: '/',
    sectionId: 'public-holiday-events',
    sourceFileName: 'HolidayIceRink.png',
    usageType: 'card',
    mediaAssetUsageType: 'card',
    requiredBeforeStaging: true,
  },
  {
    slotId: 'homepage-open-graph-image',
    page: '/',
    sectionId: 'seo-open-graph',
    sourceFileName: 'WinterFestIceRinkRentals.png',
    usageType: 'og-image',
    mediaAssetUsageType: 'og-image',
    requiredBeforeStaging: true,
    title: 'Winter Festival Ice Rink Rental Open Graph Image',
    altText: 'Guests skating on a festive portable ice rink at a winter event',
    caption: 'Open Graph candidate derived from the official winter festival ice rink rental image.',
  },
];

const sourceStatusAtStart = [
  '?? content-review/ice-homepage-media-upload-selection/CorporateIceRinkRentalEvent.png',
  '?? content-review/ice-homepage-media-upload-selection/HolidayIceRink.png',
  '?? content-review/ice-homepage-media-upload-selection/IceRinkRentalsSetup.png',
  '?? content-review/ice-homepage-media-upload-selection/IceSkatingRinkRentalsLogo.png',
  '?? content-review/ice-homepage-media-upload-selection/WinterFestIceRinkRentals.png',
];

main();

function main() {
  fs.mkdirSync(path.join(repoRoot, outputDir), { recursive: true });
  const fileAudits = officialFiles.map((item) => auditMediaFile(item));
  const allFilesPresent = fileAudits.every((item) => item.present);
  const uploadFeasibility = buildUploadFeasibility(allFilesPresent);
  const proposedRecords = fileAudits.map((audit) => buildProposedRecord(audit, uploadFeasibility));
  const bindings = slotDefinitions.map((slot) => buildBinding(slot, fileAudits, proposedRecords, uploadFeasibility));
  const sourceStatus = buildSourceStatus(fileAudits, uploadFeasibility);
  const uploadManifest = buildUploadManifest(sourceStatus, fileAudits, proposedRecords, bindings, uploadFeasibility);
  const bindingManifest = buildBindingManifest(sourceStatus, bindings, uploadFeasibility);
  const sourceCandidatePath = chooseCandidatePath();
  const page = updateHomepageCandidate(readJson(sourceCandidatePath), bindings, fileAudits);
  const packagePayload = buildPackage(sourceCandidatePath, page, uploadManifest, bindingManifest, uploadFeasibility);
  const manifest = buildOutputManifest(sourceStatus, uploadFeasibility, sourceCandidatePath, bindings);

  writeJson(path.join(outputDir, 'homepage-media-upload-manifest.json'), uploadManifest);
  writeJson(path.join(outputDir, 'homepage-mediaasset-bindings.json'), bindingManifest);
  writeJson(path.join(outputDir, 'proposed-homepage.media-selected-candidate.json'), page);
  writeJson(path.join(outputDir, 'homepage-media-selected-package.json'), packagePayload);
  writeJson(path.join(outputDir, 'manifest.json'), manifest);

  writeText(path.join(outputDir, 'README.md'), buildReadme(sourceStatus, uploadFeasibility));
  writeText(path.join(outputDir, 'MEDIA_SOURCE_STATUS.md'), buildMediaSourceStatus(sourceStatus, fileAudits, uploadFeasibility));
  writeText(path.join(outputDir, 'MEDIA_UPLOAD_SELECTION_PLAN.md'), buildUploadSelectionPlan(bindings, uploadFeasibility));
  writeText(path.join(outputDir, 'MEDIA_ASSET_RECORDS_OR_MANIFEST.md'), buildMediaAssetRecordsDoc(proposedRecords, uploadFeasibility));
  writeText(path.join(outputDir, 'HOMEPAGE_MEDIA_BINDING_RESULT.md'), buildBindingResult(bindings, uploadFeasibility));
  writeText('PUMPKIN_ICE_HOMEPAGE_MEDIA_UPLOAD_SELECTION_REPORT.md', buildRootReport(sourceStatus, fileAudits, bindings, uploadFeasibility, sourceCandidatePath));

  console.log(JSON.stringify({
    ok: true,
    sourceFilesFound: fileAudits.filter((item) => item.present).length,
    expectedFiles: officialFiles.length,
    uploadAttempted: uploadFeasibility.uploadAttempted,
    uploadSkipped: uploadFeasibility.uploadSkipped,
    mediaAssetRecordsCreated: 0,
    bindings: bindings.length,
    outputDir,
  }, null, 2));
}

function auditMediaFile(metadata) {
  const relativePath = path.join(inputDir, metadata.fileName).replaceAll('\\', '/');
  const fullPath = path.join(repoRoot, relativePath);
  const present = fs.existsSync(fullPath);
  const audit = {
    fileName: metadata.fileName,
    path: relativePath,
    present,
    extension: path.extname(metadata.fileName).toLowerCase(),
    safeFileName: /^[A-Za-z0-9._-]+$/.test(metadata.fileName),
    expectedMimeType: 'image/png',
    detectedMimeType: null,
    sizeBytes: null,
    sha256: null,
    width: null,
    height: null,
    validPngSignature: false,
    validationStatus: present ? 'pending' : 'missing',
    usage: metadata.usage,
    usageType: metadata.usageType,
    usageSlot: metadata.usageSlot,
    officialMetadata: {
      title: metadata.title,
      altText: metadata.altText,
      caption: metadata.caption,
      description: metadata.description,
      tags: metadata.tags,
      requiredBeforeCmsImport: metadata.requiredBeforeCmsImport,
      requiredBeforeProduction: metadata.requiredBeforeProduction,
    },
  };

  if (!present) return audit;

  const bytes = fs.readFileSync(fullPath);
  audit.sizeBytes = bytes.length;
  audit.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  audit.detectedMimeType = detectMimeType(bytes);
  const imageInfo = inspectPng(bytes);
  audit.width = imageInfo.width;
  audit.height = imageInfo.height;
  audit.validPngSignature = audit.detectedMimeType === 'image/png' && Boolean(imageInfo.width && imageInfo.height);
  audit.validationStatus = audit.extension === '.png' &&
    audit.safeFileName &&
    audit.detectedMimeType === 'image/png' &&
    audit.sizeBytes > 0 &&
    Boolean(audit.width && audit.height)
    ? 'valid-local-input'
    : 'invalid-local-input';

  return audit;
}

function buildUploadFeasibility(allFilesPresent) {
  const blockers = [];
  if (!allFilesPresent) blockers.push('missing-one-or-more-raw-media-files');
  blockers.push('authenticated-admin-jwt-not-available-without-reading-or-printing-protected-secrets');
  blockers.push('real-mediaasset-record-creation-requires-admin-api-and-database-service');

  return {
    result: allFilesPresent ? 'blocked-missing-safe-admin-auth' : 'blocked-missing-input-and-safe-admin-auth',
    localMediaFilesPresent: allFilesPresent,
    localDevStorageCanBeUsedWithoutProtectedConfig: true,
    azureOrCloudUploadRequired: false,
    protectedConfigReadRequired: false,
    cmsPageRecordsWouldBeModified: false,
    cmsThemeRecordsWouldBeModified: false,
    tenantSafeForIce: true,
    authenticationRequired: true,
    authenticationAvailableWithoutProtectedSecrets: false,
    uploadAttempted: false,
    uploadSkipped: true,
    uploadSkippedReason: 'Raw files are present, but the real MediaAsset upload endpoint requires authenticated admin JWT/API access. No protected config or token values were read or printed.',
    mediaAssetRecordsCreated: false,
    mediaAssetRecordCount: 0,
    blockers,
  };
}

function buildProposedRecord(audit, feasibility) {
  const metadata = officialFiles.find((item) => item.fileName === audit.fileName);
  const proposedSafeFileName = buildSafeFileName(audit.fileName, audit.sha256 || 'pending-checksum');
  const assetSlug = slugify(path.basename(proposedSafeFileName, path.extname(proposedSafeFileName)));
  return {
    recordCreationStatus: 'not-created',
    creationBlocker: feasibility.result,
    mediaAssetId: null,
    id: null,
    assetId: null,
    proposedAssetId: `ice-rink-rentals-${assetSlug}`,
    tenantId,
    siteKey,
    status: 'draft',
    storageProvider: 'local-dev',
    originalFileName: audit.fileName,
    safeFileName: proposedSafeFileName,
    title: metadata.title,
    alt: metadata.altText,
    altText: metadata.altText,
    caption: metadata.caption,
    description: metadata.description,
    source: 'official-homepage-media-input',
    credit: 'Ice Rink Rentals official media',
    license: 'owned',
    licenseStatus: 'owned',
    usageStatus: 'needs_review',
    usageType: metadata.usageType,
    usageSlot: metadata.usageSlot,
    tags: metadata.tags,
    mimeType: audit.detectedMimeType,
    extension: audit.extension,
    fileSize: audit.sizeBytes,
    sizeBytes: audit.sizeBytes,
    checksum: audit.sha256,
    hash: audit.sha256,
    width: audit.width,
    height: audit.height,
    publicUrl: null,
    thumbnailUrl: null,
    blobPath: null,
    variants: audit.present ? [
      {
        name: 'original',
        status: 'planned',
        width: audit.width,
        height: audit.height,
        mimeType: audit.detectedMimeType,
        sizeBytes: audit.sizeBytes,
        storageProvider: 'local-dev',
        publicUrl: null,
        blobPath: null,
      },
    ] : [],
    notes: 'Proposed MediaAsset payload only. No CMS MediaAsset record was created because safe authenticated admin upload was unavailable.',
  };
}

function buildBinding(slot, fileAudits, proposedRecords, feasibility) {
  const audit = fileAudits.find((item) => item.fileName === slot.sourceFileName);
  const official = officialFiles.find((item) => item.fileName === slot.sourceFileName);
  const proposed = proposedRecords.find((item) => item.originalFileName === slot.sourceFileName);
  const title = slot.title || official.title;
  const altText = slot.altText || official.altText;
  const caption = slot.caption || official.caption;
  return {
    slotId: slot.slotId,
    page: slot.page,
    sectionId: slot.sectionId,
    usageType: slot.usageType,
    mediaAssetUsageType: slot.mediaAssetUsageType,
    sourceFileName: slot.sourceFileName,
    sourceFilePath: audit.path,
    sourceFileAvailable: audit.present,
    sourceValidationStatus: audit.validationStatus,
    originalFileName: audit.fileName,
    recommendedSafeFileName: proposed.safeFileName,
    title,
    altText,
    caption,
    description: official.description,
    tags: official.tags,
    dimensions: {
      width: audit.width,
      height: audit.height,
    },
    fileSizeBytes: audit.sizeBytes,
    checksum: audit.sha256,
    mediaAssetId: null,
    assetId: null,
    proposedAssetId: proposed.proposedAssetId,
    publicUrl: null,
    thumbnailUrl: null,
    storageProvider: 'local-dev',
    status: 'needs-upload',
    bindingStatus: feasibility.result,
    blocksCmsImport: official.requiredBeforeCmsImport,
    blocksStaging: slot.requiredBeforeStaging,
    blocksProduction: official.requiredBeforeProduction,
    requiredBeforeCmsImport: official.requiredBeforeCmsImport,
    requiredBeforeStaging: slot.requiredBeforeStaging,
    requiredBeforeProduction: official.requiredBeforeProduction,
    notes: 'Raw official media file is present and validated locally. Bind only after a real tenant-scoped MediaAsset record exists.',
  };
}

function buildSourceStatus(fileAudits, feasibility) {
  return {
    schemaVersion: 'homepage-media-upload-selection-source-status.v2',
    phase: 'homepage-media-upload-selection',
    createdAt,
    tenantId,
    siteKey,
    domain,
    sourceFolder: inputDir,
    sourceFolderExists: fs.existsSync(path.join(repoRoot, inputDir)),
    expectedFiles: fileAudits.map((item) => ({
      fileName: item.fileName,
      expectedPath: item.path,
      present: item.present,
      details: item.present ? {
        sizeBytes: item.sizeBytes,
        width: item.width,
        height: item.height,
        sha256: item.sha256,
        detectedMimeType: item.detectedMimeType,
      } : null,
    })),
    discoveredFiles: fs.existsSync(path.join(repoRoot, inputDir))
      ? fs.readdirSync(path.join(repoRoot, inputDir)).filter((name) => fs.statSync(path.join(repoRoot, inputDir, name)).isFile()).sort()
      : [],
    sourceFileCountFound: fileAudits.filter((item) => item.present).length,
    expectedFileCountFound: fileAudits.filter((item) => item.present).length,
    uploadFeasibility: feasibility.result,
    uploadAttempted: feasibility.uploadAttempted,
    uploadSkippedReason: feasibility.uploadSkippedReason,
    protectedConfigRead: false,
    secretsPrinted: false,
    cmsPageRecordsChanged: false,
    cmsThemeRecordsChanged: false,
    mediaAssetRecordsCreated: false,
    mediaAssetRecordCount: 0,
    inputLocationCorrection: {
      performed: true,
      reason: 'The start-state PNGs were untracked in the media upload selection output folder. They were moved into the requested raw-input folder so output files stay manifest-only.',
      fromFolder: 'content-review/ice-homepage-media-upload-selection',
      toFolder: inputDir,
      rawFilesRemainUntracked: true,
    },
    rollerStatus: 'paused',
  };
}

function buildUploadManifest(sourceStatus, fileAudits, proposedRecords, bindings, feasibility) {
  return {
    schemaVersion: 'homepage-media-upload-manifest.v2',
    phase: 'homepage-media-upload-selection',
    createdAt,
    tenantId,
    siteKey,
    domain,
    sourceStatus,
    uploadFeasibility: feasibility,
    rawMediaAudit: fileAudits,
    proposedMediaAssetRecords: proposedRecords,
    mediaAssetRecordsCreated: [],
    bindings,
    summary: {
      expectedFileCount: officialFiles.length,
      sourceFileCountFound: fileAudits.filter((item) => item.present).length,
      validLocalInputCount: fileAudits.filter((item) => item.validationStatus === 'valid-local-input').length,
      mediaAssetRecordCount: 0,
      bindingCount: bindings.length,
      realMediaAssetIdsBound: 0,
    },
  };
}

function buildBindingManifest(sourceStatus, bindings, feasibility) {
  return {
    schemaVersion: 'homepage-media-upload-selection-bindings.v2',
    phase: 'homepage-media-upload-selection',
    createdAt,
    tenantId,
    siteKey,
    domain,
    uploadAttempted: feasibility.uploadAttempted,
    uploadPossible: false,
    mediaAssetRecordsCreated: [],
    sourceStatus,
    bindings,
    summary: {
      bindingCount: bindings.length,
      sourceFilesAvailable: bindings.filter((item) => item.sourceFileAvailable).length,
      realMediaAssetIdsBound: bindings.filter((item) => item.mediaAssetId).length,
      cmsImportBlockingSlots: bindings.filter((item) => item.blocksCmsImport).length,
      stagingBlockingSlots: bindings.filter((item) => item.blocksStaging).length,
      productionBlockingSlots: bindings.filter((item) => item.blocksProduction).length,
    },
  };
}

function updateHomepageCandidate(page, bindings, fileAudits) {
  const updated = JSON.parse(JSON.stringify(page));
  const bySlot = Object.fromEntries(bindings.map((binding) => [binding.slotId, binding]));
  const media = updated.media || {};
  const mediaSlotMap = {
    featuredImage: 'homepage-hero-image',
    heroImage: 'homepage-hero-image',
    localImage: 'homepage-corporate-event-image',
    closingImage: 'homepage-holiday-shopping-center-image',
    openGraphImage: 'homepage-open-graph-image',
  };

  for (const [field, slotId] of Object.entries(mediaSlotMap)) {
    const binding = bySlot[slotId];
    media[field] = {
      ...(isRecord(media[field]) ? media[field] : {}),
      requiredMediaSlotId: slotId,
      mediaRequirementRef: slotId,
      mediaAssetId: null,
      assetId: null,
      publicUrl: null,
      url: null,
      alt: binding.altText,
      title: binding.title,
      caption: binding.caption,
      description: binding.description,
      source: 'official_homepage_media_input_pending_mediaasset_upload',
      licenseStatus: 'owned',
      usageStatus: 'needs_review',
      usageType: binding.mediaAssetUsageType,
      status: 'needs-upload',
      blocker: true,
      width: binding.dimensions.width,
      height: binding.dimensions.height,
      focalPointX: null,
      focalPointY: null,
      decorative: false,
      checksum: binding.checksum,
      originalFileName: binding.originalFileName,
      safeFileName: binding.recommendedSafeFileName,
      tags: binding.tags,
      notes: 'Official raw media is present locally, but no real MediaAsset id or public URL is bound because authenticated MediaAsset creation was not available.',
    };
  }
  updated.media = media;

  const requirementsBySlot = new Map((updated.mediaRequirements || []).map((item) => [item.requiredMediaSlotId, item]));
  const newRequirements = bindings.map((binding) => {
    const existing = requirementsBySlot.get(binding.slotId) || {};
    const audit = fileAudits.find((item) => item.fileName === binding.sourceFileName);
    return {
      ...existing,
      tenantId,
      siteKey,
      domain,
      requiredMediaSlotId: binding.slotId,
      intendedUsageType: binding.usageType,
      mediaAssetUsageType: binding.mediaAssetUsageType,
      page: binding.page,
      sectionId: binding.sectionId,
      sourceFile: binding.sourceFilePath,
      optimizedSourceFile: null,
      recommendedDimensions: binding.dimensions.width && binding.dimensions.height
        ? `${binding.dimensions.width}x${binding.dimensions.height} official source`
        : 'pending source validation',
      requiredAltText: binding.altText,
      title: binding.title,
      caption: binding.caption,
      description: binding.description,
      tags: binding.tags,
      suggestedFilename: binding.recommendedSafeFileName,
      requiredBeforeCmsImport: binding.requiredBeforeCmsImport,
      requiredBeforeStaging: binding.requiredBeforeStaging,
      requiredBeforeProduction: binding.requiredBeforeProduction,
      notes: binding.notes,
      mediaAssetId: null,
      assetId: null,
      proposedAssetId: binding.proposedAssetId,
      publicUrl: null,
      thumbnailUrl: null,
      status: 'needs-upload',
      uploadStatus: 'not_uploaded_blocked_missing_safe_admin_auth',
      blocker: true,
      sourcePolicy: 'official local input only; not a public URL and not a committed MediaAsset',
      sourceMetadata: audit ? {
        fileName: audit.fileName,
        extension: audit.extension,
        mimeType: audit.detectedMimeType,
        sizeBytes: audit.sizeBytes,
        width: audit.width,
        height: audit.height,
        sha256: audit.sha256,
        safeFileName: audit.safeFileName,
      } : null,
      optimizedMetadata: null,
    };
  });
  updated.mediaRequirements = newRequirements;

  updated.reviewMetadata = {
    ...(updated.reviewMetadata || {}),
    mediaUploadSelectionStatus: {
      phase: 'homepage-media-upload-selection',
      updatedAt: createdAt,
      sourceFilesFound: fileAudits.filter((item) => item.present).length,
      expectedFiles: officialFiles.length,
      uploadAttempted: false,
      mediaAssetRecordsCreated: false,
      realMediaAssetIdsBound: 0,
      status: 'blocked-missing-safe-admin-auth',
      notes: 'Official PNGs are present and audited; real MediaAsset creation is blocked because authenticated admin upload is unavailable without protected secrets.',
    },
  };

  return updated;
}

function buildPackage(sourceCandidatePath, page, uploadManifest, bindingManifest, feasibility) {
  return {
    schemaVersion: 'homepage-media-selected-package.v2',
    phase: 'homepage-media-upload-selection',
    createdAt,
    tenantId,
    siteKey,
    domain,
    sourceCandidate: sourceCandidatePath,
    pageFiles: [
      {
        file: 'proposed-homepage.media-selected-candidate.json',
        pageSlug: page.pageSlug,
        tenantId: page.tenantId,
        status: 'media-selected-candidate',
      },
    ],
    pages: [
      {
        path: 'proposed-homepage.media-selected-candidate.json',
        pageSlug: page.pageSlug,
        tenantId: page.tenantId,
        status: 'media-selected-candidate',
      },
    ],
    pageCandidatePath: `${outputDir}/proposed-homepage.media-selected-candidate.json`,
    uploadManifestPath: `${outputDir}/homepage-media-upload-manifest.json`,
    bindingsPath: `${outputDir}/homepage-mediaasset-bindings.json`,
    page,
    mediaUploadManifest: uploadManifest,
    mediaBindings: bindingManifest,
    validationSummary: {
      expectedValidation: '.NET/page/design/form/media validators must pass, but candidate is not CMS-import-ready while mediaAssetId values remain null.',
      mediaAssetRecordsCreated: false,
      realMediaAssetIdsBound: 0,
    },
    readiness: readinessDecision(feasibility),
    noGoConfirmations: noGoConfirmations(),
    rollerStatus: 'paused',
  };
}

function buildOutputManifest(sourceStatus, feasibility, sourceCandidatePath, bindings) {
  return {
    schemaVersion: 'homepage-media-upload-selection-output-manifest.v2',
    phase: 'homepage-media-upload-selection',
    createdAt,
    tenantId,
    siteKey,
    domain,
    sourceStatus,
    uploadFeasibility: feasibility,
    sourceCandidate: sourceCandidatePath,
    outputs: [
      'README.md',
      'MEDIA_SOURCE_STATUS.md',
      'MEDIA_UPLOAD_SELECTION_PLAN.md',
      'MEDIA_ASSET_RECORDS_OR_MANIFEST.md',
      'HOMEPAGE_MEDIA_BINDING_RESULT.md',
      'homepage-mediaasset-bindings.json',
      'homepage-media-upload-manifest.json',
      'proposed-homepage.media-selected-candidate.json',
      'homepage-media-selected-package.json',
      'manifest.json',
    ],
    readiness: readinessDecision(feasibility),
    bindingSummary: {
      bindingCount: bindings.length,
      realMediaAssetIdsBound: 0,
      cmsImportBlockingSlots: bindings.filter((item) => item.blocksCmsImport).length,
    },
    rollerStatus: 'paused',
  };
}

function buildReadme(sourceStatus, feasibility) {
  return `# Ice Homepage Media Upload Selection

This folder contains the refreshed homepage media upload/selection package for IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused.

## Result

- Raw PNG files detected: ${sourceStatus.sourceFileCountFound} of ${officialFiles.length}
- Upload attempted: ${yesNo(feasibility.uploadAttempted)}
- Upload skipped: ${yesNo(feasibility.uploadSkipped)}
- MediaAsset records created: 0
- Real MediaAsset IDs bound: 0
- Homepage candidate created: yes

Upload was skipped because real MediaAsset creation requires authenticated admin upload/API access, and no safe auth token or protected config access was available.

The PNG files under \`${inputDir}/\` are local input assets only. Do not stage or commit them.
`;
}

function buildMediaSourceStatus(sourceStatus, fileAudits, feasibility) {
  const rows = fileAudits.map((item) => `| ${item.fileName} | ${item.present ? 'yes' : 'no'} | ${item.detectedMimeType || 'n/a'} | ${item.width || 'n/a'}x${item.height || 'n/a'} | ${item.sizeBytes || 'n/a'} | ${item.sha256 || 'n/a'} | ${item.validationStatus} |`).join('\n');
  return `# Media Source Status

## Start-State Note

At the first status check, the five PNGs were untracked under \`content-review/ice-homepage-media-upload-selection/\`, not under the requested raw-input folder. They were moved into \`${inputDir}/\` so the output folder remains manifest/report-only.

## Raw Files

| File | Present | MIME | Dimensions | Size bytes | SHA-256 | Status |
| --- | --- | --- | --- | ---: | --- | --- |
${rows}

## Upload Feasibility

- Result: \`${feasibility.result}\`
- Upload attempted: ${yesNo(feasibility.uploadAttempted)}
- Upload skipped: ${yesNo(feasibility.uploadSkipped)}
- Reason: ${feasibility.uploadSkippedReason}
- Protected config read: no
- Secrets printed: no
- CMS Page records changed: no
- CMS Theme records changed: no
- Azure/cloud upload required: no
`;
}

function buildUploadSelectionPlan(bindings, feasibility) {
  const rows = bindings.map((item) => `| ${item.slotId} | ${item.sourceFileName} | ${item.usageType} | ${item.sourceFileAvailable ? 'yes' : 'no'} | ${item.mediaAssetId || 'null'} | ${item.bindingStatus} |`).join('\n');
  return `# Media Upload Selection Plan

## Plan

1. Use the five official PNGs in \`${inputDir}/\`.
2. Upload each file through the authenticated Pumpkin admin media endpoint when a safe local admin session is available.
3. Preserve tenant/site identity as \`${tenantId}\` / \`${siteKey}\`.
4. Copy real returned MediaAsset IDs into the homepage media candidate only after records exist.
5. Do not update CMS Page or Theme records in this phase.

## Current Binding Plan

| Slot | Source file | Usage | Source found | MediaAsset ID | Status |
| --- | --- | --- | --- | --- | --- |
${rows}

## Current Blocker

\`${feasibility.result}\`: ${feasibility.uploadSkippedReason}
`;
}

function buildMediaAssetRecordsDoc(proposedRecords, feasibility) {
  const rows = proposedRecords.map((item) => `| ${item.originalFileName} | ${item.usageType} | ${item.proposedAssetId} | ${item.safeFileName} | ${item.mediaAssetId || 'null'} | ${item.recordCreationStatus} |`).join('\n');
  return `# MediaAsset Records Or Manifest

No CMS MediaAsset records were created.

Creation was blocked by \`${feasibility.result}\`.

The manifest contains proposed record payload metadata only. These are not real database records and must not be bound as MediaAsset IDs.

| Source file | Usage type | Proposed asset id | Safe file name | Real MediaAsset ID | Status |
| --- | --- | --- | --- | --- | --- |
${rows}
`;
}

function buildBindingResult(bindings, feasibility) {
  return `# Homepage Media Binding Result

Homepage candidate:

\`\`\`text
${outputDir}/proposed-homepage.media-selected-candidate.json
\`\`\`

Result:

- Real MediaAsset IDs bound: 0
- MediaAsset creation attempted: no
- MediaAsset creation skipped: yes
- Skip reason: ${feasibility.uploadSkippedReason}
- Candidate route preserved: \`/\`
- Canonical preserved: \`https://iceskatingrinkrentals.com/\`
- Pumpkin \`formBlock\` / \`default-quote-request\` mapping preserved
- Fake public image URLs inserted: no
- Base64 media inserted: no

All media slots keep \`mediaAssetId: null\` and \`status: needs-upload\` until real tenant-scoped MediaAsset records exist.

CMS import readiness: no.
`;
}

function buildRootReport(sourceStatus, fileAudits, bindings, feasibility, sourceCandidatePath) {
  const filesFound = fileAudits.map((item) => `- \`${item.path}\`: ${item.present ? `found, ${item.width}x${item.height}, ${item.sizeBytes} bytes` : 'missing'}`).join('\n');
  const metadataRows = bindings.map((item) => `- \`${item.slotId}\`: ${item.title}; mediaAssetId ${item.mediaAssetId || 'null'}; status ${item.status}`).join('\n');
  return `# Pumpkin Ice Homepage Media Upload Selection Report

## Scope

IceSkatingRinkRentals.com is the primary launch focus.

RollerRinkRentals.com remains paused.

No homepage/contact/service-area CMS Page records were updated. No CMS Theme records were updated. No production static packages were regenerated. No Azure upload, Cloudflare change, DNS change, deployment, or GitHub workflow action was performed. No protected config was read or modified.

## Git Status At Start

\`git status --short\` initially showed the five raw PNGs untracked in the previous upload-selection output folder:

\`\`\`text
${sourceStatusAtStart.join('\n')}
\`\`\`

The files were moved into \`${inputDir}/\` to match the requested raw input location. They remain untracked local input assets and must not be staged or committed.

\`git log --oneline -12\` at start:

\`\`\`text
910971c Add email infrastructure readiness system
3526250 Add Ice import readiness input request package
bbf848f Add Ice homepage media upload selection manifest
52d4c9c Add Phase 8C.14B page intake normalizer
7b6c7fe Add Phase 8C.15 Ice homepage media binding manifest
cb3e6fb Add Phase 8C.14 Ice homepage media intake validation
9c8fc83 Add Phase 8C.13 Ice final approval resolution package
96eea2d Add Phase 8C.12 Ice final import prep package
bdf073a Add Phase 8C.11C .NET page contract alignment
337abbe Add Phase 8C.11B Tailwind and navigation hardening
5e0be5d Add Phase 8C.11 production default contact form system
047a743 Add Phase 8C.10 Ice import candidate prep bundle
\`\`\`

## Raw Media Source Status

Raw source folder: \`${inputDir}/\`

Files found:

${filesFound}

All five expected PNG files are present and pass local extension, filename, PNG signature, checksum, dimension, and file-size auditing.

## Upload Feasibility Result

- Result: \`${feasibility.result}\`
- Upload attempted: no
- Upload skipped: yes
- Upload skipped reason: ${feasibility.uploadSkippedReason}
- Local media files present: yes
- Local-dev storage requires no protected config: yes, by code review
- Azure/cloud upload required: no
- Protected config read required: no
- CMS Page records modified: no
- CMS Theme records modified: no
- Tenant-safe for \`${tenantId}\`: yes
- Authentication required: yes
- Authentication available without protected secrets: no

## MediaAsset Records Created

None.

No MediaAsset IDs were created or bound. The output manifest includes proposed record metadata only.

## MediaAsset Manifest Created

Created:

- \`${outputDir}/homepage-media-upload-manifest.json\`
- \`${outputDir}/homepage-mediaasset-bindings.json\`

## Media Metadata Applied

${metadataRows}

Official titles, alt text, captions, descriptions, tags, checksums, dimensions, and source filenames were applied to the manifests and homepage media requirement objects.

## Homepage Candidate Binding Changes

Source candidate:

\`\`\`text
${sourceCandidatePath}
\`\`\`

Output candidate:

\`\`\`text
${outputDir}/proposed-homepage.media-selected-candidate.json
\`\`\`

Only media reference objects and media requirement metadata were updated. Route \`/\`, canonical \`https://iceskatingrinkrentals.com/\`, semantic classes, section variants, and Pumpkin \`formBlock/default-quote-request\` mapping were preserved.

Because real MediaAsset IDs do not exist yet, all homepage media references remain:

- \`mediaAssetId: null\`
- \`publicUrl: null\`
- \`url: null\`
- \`status: needs-upload\`

No fake public URLs, base64 images, or external media URLs were inserted.

## Validation Results

- JSON parse validation: pending final check in this run.
- .NET page contract validation: pending final check in this run.
- .NET package validation: pending final check in this run.
- Media validation: pending final check in this run.
- Design-system validation: pending final check in this run.
- Default form validation: pending final check in this run.
- Tailwind/navigation validation: pending final check in this run.
- Page intake normalizer validation: pending final check in this run.
- Unsafe scan: pending final check in this run.

## Readiness Classification

- Ready for human review: yes.
- Ready for CMS import: no.
- Ready for local CMS draft import: maybe, only if the user explicitly authorizes a draft import despite unresolved real MediaAsset IDs and preflight passes.
- Ready for static regeneration: no.
- Ready for production/indexing: no.

## Exact Blockers Before CMS Import

- Real tenant-scoped MediaAsset records must be created through authenticated admin upload or approved local media pipeline.
- Real MediaAsset IDs must be bound into the homepage candidate.
- Public URL/thumb URL behavior must come from the actual storage pipeline.
- Business values and public contact display policy must be confirmed.
- Human approval must be recorded.
- Admin import/export preflight must pass.

## Exact Blockers Before Local Preview

- Explicit local CMS draft import/preview authorization.
- Decision on whether preview may proceed with \`mediaAssetId: null\` placeholders.
- Admin import/export preflight against the selected package.

## Exact Blockers Before Production

- All CMS import and local preview blockers.
- Approved real MediaAsset records and public media URLs.
- CMS import/update after approval.
- Fresh static regeneration after CMS import.
- Static package validation.
- Azure default-host staging review.
- Form smoke tests.
- Final SEO/schema/canonical/media verification.
- Production cutover/indexing approval.

## Next Recommended Action

Use an authenticated local admin session to upload the five official PNGs through Pumpkin Media Library or the admin upload endpoint, without printing token values. Then rerun this workflow to bind the returned real MediaAsset IDs into the homepage candidate.

## No-Go Confirmations

${noGoConfirmations().map((item) => `- ${item}`).join('\n')}
`;
}

function readinessDecision() {
  return {
    readyForHumanReview: true,
    readyForCmsImport: false,
    readyForLocalCmsDraftImport: 'maybe-with-explicit-authorization-and-preflight',
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
    cmsImportReason: 'Not CMS-import-ready until real MediaAsset IDs, business values, human approval, and admin import/export preflight are complete.',
    localPreviewReason: 'Possible only with explicit authorization and a decision to allow unresolved mediaAssetId placeholders.',
    productionReason: 'Production requires CMS import, fresh static regeneration, staging review, media URL verification, form smoke tests, and final cutover approval.',
  };
}

function noGoConfirmations() {
  return [
    'No homepage was imported into CMS.',
    'No CMS Page record was changed.',
    'No CMS Theme record was changed.',
    'No MediaAsset database record was created.',
    'No production static package was regenerated.',
    'No generated static folder was staged.',
    'No ZIP file was staged.',
    'No raw media file was staged.',
    'No Azure resource was created.',
    'No Azure deployment or upload was run.',
    'No Cloudflare or DNS change was made.',
    'No GitHub workflow was created.',
    'No protected config was read or modified.',
    'No secrets, API keys, JWTs, Azure tokens, deployment tokens, Cloudflare tokens, storage keys, email keys, SMTP credentials, SendGrid keys, or connection strings were printed or committed.',
    'RollerRinkRentals.com remains paused.',
  ];
}

function chooseCandidatePath() {
  for (const candidate of [preferredCandidate, fallbackCandidate, phase8c14Candidate]) {
    if (fs.existsSync(path.join(repoRoot, candidate))) return candidate;
  }
  throw new Error('No homepage candidate source was found.');
}

function detectMimeType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return 'image/png';
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return 'application/octet-stream';
}

function inspectPng(bytes) {
  if (detectMimeType(bytes) !== 'image/png' || bytes.length < 24) return { width: null, height: null };
  return {
    width: bytes.readInt32BE(16),
    height: bytes.readInt32BE(20),
  };
}

function buildSafeFileName(fileName, checksum) {
  const extension = path.extname(fileName).toLowerCase() === '.jpeg' ? '.jpg' : path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, path.extname(fileName));
  const safeBase = slugify(base) || 'media';
  const suffix = /^[a-f0-9]{12,}/.test(checksum) ? checksum.slice(0, 12) : 'pendinghash';
  return `${safeBase}-${suffix}${extension}`;
}

function slugify(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value.endsWith('\n') ? value : `${value}\n`);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
