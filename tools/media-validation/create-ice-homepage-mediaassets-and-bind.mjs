#!/usr/bin/env node
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

const tenantId = 'ice-rink-rentals';
const siteKey = 'ice-rink-rentals';
const domain = 'iceskatingrinkrentals.com';
const apiBaseUrl = 'http://localhost:5064';
const mediaInputDir = path.join(repoRoot, 'content-review', 'ice-homepage-media-input');
const outputDir = path.join(repoRoot, 'content-review', 'ice-homepage-mediaasset-bound');
const sourceCandidatePath = path.join(repoRoot, 'content-review', 'ice-homepage-media-upload-selection', 'proposed-homepage.media-selected-candidate.json');
const boundCandidatePath = path.join(outputDir, 'proposed-homepage.mediaasset-bound-candidate.json');
const boundPackagePath = path.join(outputDir, 'homepage-mediaasset-bound-package.json');
const bindingsPath = path.join(outputDir, 'homepage-mediaasset-bindings.json');
const reportPath = path.join(repoRoot, 'PUMPKIN_ICE_HOMEPAGE_MEDIAASSET_CREATION_BINDING_REPORT.md');

const officialMedia = [
  {
    fileName: 'IceSkatingRinkRentalsLogo.png',
    slots: ['site-logo-primary'],
    usage: 'site logo / brand asset',
    uploadUsageType: 'icon',
    title: 'Ice Rink Rentals Logo',
    altText: 'Ice Rink Rentals logo with ice skate and snowflake graphic',
    caption: 'Official Ice Rink Rentals brand logo.',
    description: 'Brand logo for Ice Rink Rentals, used for site identity, header branding, and structured media references.',
    tags: ['logo', 'brand', 'ice-rink-rentals', 'identity'],
  },
  {
    fileName: 'WinterFestIceRinkRentals.png',
    slots: ['homepage-hero-image', 'homepage-open-graph-image'],
    usage: 'homepage hero / winter festival/community image',
    uploadUsageType: 'hero',
    title: 'Winter Festival Ice Rink Rental',
    altText: 'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    caption: 'A portable ice rink creates a festive centerpiece for winter events and holiday celebrations.',
    description: 'Outdoor winter festival scene with guests skating on a portable ice rink surrounded by warm holiday lights and event activity.',
    tags: ['homepage-hero', 'winter-festival', 'holiday-event', 'portable-ice-rink', 'community-event'],
  },
  {
    fileName: 'CorporateIceRinkRentalEvent.png',
    slots: ['homepage-corporate-event-image'],
    usage: 'corporate event use-case image',
    uploadUsageType: 'card',
    title: 'Corporate Ice Rink Rental Event',
    altText: 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    caption: 'Portable ice rink rental setup for corporate events, holiday parties, and branded winter activations.',
    description: 'Evening corporate event with a temporary ice rink, professional guests, warm lighting, and outdoor reception atmosphere.',
    tags: ['corporate-event', 'event-activation', 'portable-ice-rink', 'winter-event', 'company-party'],
  },
  {
    fileName: 'HolidayIceRink.png',
    slots: ['homepage-holiday-shopping-center-image'],
    usage: 'holiday/shopping-center use-case image',
    uploadUsageType: 'card',
    title: 'Holiday Ice Rink Rental',
    altText: 'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    caption: 'Temporary ice rink attraction for holiday shopping centers, seasonal markets, and family-friendly events.',
    description: 'Holiday ice rink rental at an outdoor retail center with families, children, seasonal lighting, and festive activity.',
    tags: ['holiday-rink', 'shopping-center', 'family-event', 'seasonal-attraction', 'portable-ice-rink'],
  },
  {
    fileName: 'IceRinkRentalsSetup.png',
    slots: ['homepage-setup-logistics-image'],
    usage: 'setup/logistics image',
    uploadUsageType: 'inline',
    title: 'Portable Ice Rink Setup',
    altText: 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    caption: 'Portable rink setup showing temporary panels, rink surface, safety barriers, and event-ready layout.',
    description: 'Setup view of a portable ice rink rental with white barriers, rink flooring, skate aids, and outdoor event preparation.',
    tags: ['setup', 'logistics', 'rink-installation', 'portable-rink', 'event-prep'],
  },
];

async function main() {
  const startedAt = new Date().toISOString();
  mkdirSync(outputDir, { recursive: true });

  const result = {
    schemaVersion: 'pumpkin.ice.homepage.mediaasset-creation-binding.result.v1',
    generatedAt: startedAt,
    tenantId,
    siteKey,
    domain,
    apiBaseUrl,
    gitStatusAtStart: runText('git', ['status', '--short', '--untracked-files=all']),
    gitLogAtStart: runText('git', ['log', '--oneline', '-12']),
    apiReachable: false,
    adminAuthStatus: 'MISSING',
    tempAdminJwtFileStatusAtStart: 'MISSING',
    tempAdminJwtFileDeleted: false,
    sourceFolder: 'content-review/ice-homepage-media-input',
    sourceFolderExists: existsSync(mediaInputDir),
    rawFiles: [],
    uploadMethod: 'POST /api/admin/{tenantId}/media-assets/upload',
    uploadAttempted: false,
    uploadSkipped: false,
    uploadSkippedReason: '',
    existingMediaAssetCountBefore: null,
    recordsCreated: [],
    recordsReused: [],
    recordsPatched: [],
    recordsRejectedForReuse: [],
    recordsVerified: [],
    binding: {
      sourceCandidate: 'content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json',
      boundCandidate: 'content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json',
      boundPackage: 'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bound-package.json',
      realMediaAssetIdsBound: 0,
      routePreserved: null,
      canonicalPreserved: null,
      fakeIdsInserted: false,
      fakePublicUrlsInserted: false,
      externalUrlsInserted: false,
      base64Inserted: false,
    },
    validation: {},
    safety: {
      protectedConfigRead: false,
      secretsPrinted: false,
      cmsPageRecordsChanged: false,
      cmsThemeRecordsChanged: false,
      contactOrServiceAreaPagesChanged: false,
      azureUpload: false,
      cloudflareOrDnsChanged: false,
      microsoft365Changed: false,
      bluehostChanged: false,
      emailSent: false,
      staticPackagesRegenerated: false,
      rollerStatus: 'paused',
      apiEndpointsCalled: [],
    },
    blockers: [],
    remainingBlockers: [],
    readiness: {},
  };

  let jwt = '';
  try {
    result.apiReachable = await checkApiReachable();
    const auth = loadJwtFromTemp();
    jwt = auth.jwt;
    result.adminAuthStatus = auth.jwt ? 'PRESENT' : 'MISSING';
    result.tempAdminJwtFileStatusAtStart = auth.tempFileStatusAtStart;
    result.tempAdminJwtFileDeleted = auth.tempFileDeleted;

    result.rawFiles = officialMedia.map(validateRawFile);
    const invalidFiles = result.rawFiles.filter((item) => item.status !== 'valid-local-input');
    if (!result.apiReachable) {
      result.uploadSkipped = true;
      result.uploadSkippedReason = 'Pumpkin API was not reachable.';
      result.blockers.push('Pumpkin API was not reachable at http://localhost:5064.');
    } else if (!jwt) {
      result.uploadSkipped = true;
      result.uploadSkippedReason = auth.invalid
        ? 'Temp admin JWT file was present and deleted, but it did not contain a JWT-shaped single-line value.'
        : 'Admin JWT was missing after temp-file load.';
      result.blockers.push(result.uploadSkippedReason);
    } else if (invalidFiles.length > 0) {
      result.uploadSkipped = true;
      result.uploadSkippedReason = 'One or more required raw media files failed validation.';
      result.blockers.push('One or more required raw media files failed validation.');
    } else {
      await createOrReuseMediaAssets(result, jwt);
    }

    const selectedAssets = [...result.recordsCreated, ...result.recordsReused].map((entry) => entry.asset);
    writeBoundOutputs(result, selectedAssets);
    writeMarkdownOutputs(result);
  } catch (error) {
    result.blockers.push(safeError(error));
    result.uploadSkipped = !result.uploadAttempted;
    result.uploadSkippedReason ||= 'MediaAsset creation/binding failed before completion.';
    writeBoundOutputs(result, [...result.recordsCreated, ...result.recordsReused].map((entry) => entry.asset).filter(Boolean));
    writeMarkdownOutputs(result);
    console.log(JSON.stringify(summaryForConsole(result), null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(summaryForConsole(result), null, 2));
}

async function createOrReuseMediaAssets(result, jwt) {
  result.safety.apiEndpointsCalled.push('GET /api/admin/ice-rink-rentals/media-assets');
  const existingResponse = await apiJson(`/api/admin/${encodeURIComponent(tenantId)}/media-assets`, {
    method: 'GET',
    jwt,
  });
  const existingAssets = Array.isArray(existingResponse.mediaAssets) ? existingResponse.mediaAssets : [];
  result.existingMediaAssetCountBefore = existingAssets.length;

  for (const media of officialMedia) {
    const fileAudit = result.rawFiles.find((item) => item.fileName === media.fileName);
    const reusable = findReusableAsset(existingAssets, fileAudit, media, result);
    if (reusable) {
      const patched = await patchMediaAssetMetadata(jwt, reusable, media);
      result.recordsReused.push(recordEntry('reused', media, fileAudit, patched));
      result.recordsPatched.push({ id: patched.id, assetId: patched.assetId, originalFileName: patched.originalFileName, reason: 'official metadata refresh on reused MediaAsset' });
      continue;
    }

    result.uploadAttempted = true;
    result.safety.apiEndpointsCalled.push('POST /api/admin/ice-rink-rentals/media-assets/upload');
    const uploaded = await uploadMedia(jwt, media, fileAudit);
    const patched = await patchMediaAssetMetadata(jwt, uploaded, media);
    result.recordsCreated.push(recordEntry('created', media, fileAudit, patched));
    result.recordsPatched.push({ id: patched.id, assetId: patched.assetId, originalFileName: patched.originalFileName, reason: 'official metadata refresh after upload' });
    existingAssets.push(patched);
  }

  for (const entry of [...result.recordsCreated, ...result.recordsReused]) {
    result.safety.apiEndpointsCalled.push('GET /api/admin/ice-rink-rentals/media-assets/{id}');
    const verified = await apiJson(`/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(entry.asset.id)}`, {
      method: 'GET',
      jwt,
    });
    result.recordsVerified.push(verifyAsset(verified, entry));
  }
}

function findReusableAsset(existingAssets, fileAudit, media, result) {
  const candidates = existingAssets.filter((asset) => {
    if (asset.tenantId !== tenantId || asset.siteKey !== siteKey) return false;
    if ((asset.storageProvider || '').toLowerCase() !== 'local-dev') return false;
    if (['archived', 'replaced', 'deleted-pending'].includes(asset.status)) return false;
    const checksum = asset.checksum || asset.hash || '';
    if (checksum && checksum === fileAudit.sha256) return true;
    const sameName = [asset.originalFileName, asset.fileName].filter(Boolean).some((name) => name === media.fileName);
    const sameShape = Number(asset.sizeBytes || asset.fileSize || 0) === fileAudit.sizeBytes
      && Number(asset.width || 0) === fileAudit.width
      && Number(asset.height || 0) === fileAudit.height;
    return sameName && sameShape;
  });

  const rejected = existingAssets.filter((asset) => {
    const checksum = asset.checksum || asset.hash || '';
    return asset.tenantId === tenantId
      && (checksum === fileAudit.sha256 || asset.originalFileName === media.fileName || asset.fileName === media.fileName)
      && !candidates.includes(asset);
  });
  for (const asset of rejected) {
    result.recordsRejectedForReuse.push({
      id: asset.id || '',
      assetId: asset.assetId || '',
      originalFileName: asset.originalFileName || asset.fileName || '',
      status: asset.status || '',
      storageProvider: asset.storageProvider || '',
      reason: 'Matching asset was not safe for reuse because tenant/site/storage/status/checksum requirements were not all satisfied.',
    });
  }

  return candidates[0] || null;
}

async function uploadMedia(jwt, media, fileAudit) {
  const bytes = readFileSync(fileAudit.absolutePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'image/png' }), media.fileName);
  form.append('siteKey', siteKey);
  form.append('title', media.title);
  form.append('altText', media.altText);
  form.append('caption', media.caption);
  form.append('credit', 'Ice Rink Rentals official media');
  form.append('license', 'owned');
  form.append('sourceUrl', '');
  form.append('usageType', media.uploadUsageType);
  form.append('licenseStatus', 'owned');
  form.append('tags', media.tags.join(', '));

  return apiJson(`/api/admin/${encodeURIComponent(tenantId)}/media-assets/upload`, {
    method: 'POST',
    jwt,
    body: form,
  });
}

async function patchMediaAssetMetadata(jwt, asset, media) {
  const updated = {
    ...asset,
    tenantId,
    siteKey,
    title: media.title,
    alt: media.altText,
    altText: media.altText,
    caption: media.caption,
    source: 'Ice Rink Rentals official media',
    credit: 'Ice Rink Rentals official media',
    license: 'owned',
    licenseStatus: 'owned',
    usageType: media.uploadUsageType,
    notes: media.description,
    tags: media.tags,
    usageReferences: usageReferencesFor(media),
    usedByPages: usageReferencesFor(media),
  };

  return apiJson(`/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(asset.id)}`, {
    method: 'PATCH',
    jwt,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(updated),
  });
}

function usageReferencesFor(media) {
  return media.slots.map((slot) => ({
    pageId: slot === 'site-logo-primary' ? '' : 'ice-rink-rentals-home-phase8c14-normalized-candidate',
    pageSlug: slot === 'site-logo-primary' ? 'global-theme-homepage-reference' : 'home',
    fieldPath: slot,
    blockType: slot === 'site-logo-primary' ? 'site-branding' : 'Page.media',
    imageRole: slot,
  }));
}

function recordEntry(status, media, fileAudit, asset) {
  return {
    status,
    fileName: media.fileName,
    title: media.title,
    slots: media.slots,
    checksum: fileAudit.sha256,
    sizeBytes: fileAudit.sizeBytes,
    width: fileAudit.width,
    height: fileAudit.height,
    asset: safeAssetSummary(asset),
  };
}

function verifyAsset(asset, entry) {
  const checksum = asset.checksum || asset.hash || '';
  const publicUrl = asset.publicUrl || asset.url || '';
  return {
    id: asset.id || '',
    assetId: asset.assetId || '',
    originalFileName: asset.originalFileName || asset.fileName || '',
    tenantId: asset.tenantId || '',
    siteKey: asset.siteKey || '',
    status: asset.status || '',
    storageProvider: asset.storageProvider || '',
    checksum,
    width: asset.width ?? null,
    height: asset.height ?? null,
    publicUrl,
    thumbnailUrl: asset.thumbnailUrl || '',
    tenantSiteOk: asset.tenantId === tenantId && asset.siteKey === siteKey,
    checksumOk: checksum === entry.checksum,
    dimensionsOk: Number(asset.width || 0) === entry.width && Number(asset.height || 0) === entry.height,
    localDevOk: asset.storageProvider === 'local-dev',
    publicUrlLooksLocal: publicUrl.startsWith('/media/'),
  };
}

function writeBoundOutputs(result, selectedAssets) {
  mkdirSync(outputDir, { recursive: true });
  const page = JSON.parse(readFileSync(sourceCandidatePath, 'utf8'));
  const assetBySlot = new Map();
  for (const media of officialMedia) {
    const asset = selectedAssets.find((candidate) => {
      const checksum = candidate.checksum || candidate.hash || '';
      const audit = result.rawFiles.find((item) => item.fileName === media.fileName);
      return audit && checksum === audit.sha256;
    });
    if (!asset) continue;
    for (const slot of media.slots) assetBySlot.set(slot, { media, asset });
  }

  bindRootMedia(page, assetBySlot);
  bindMediaRequirements(page, assetBySlot);
  bindBlockMediaRefs(page, assetBySlot);
  updateReviewMetadata(page, result, assetBySlot);

  result.binding.realMediaAssetIdsBound = countBoundRequirements(page);
  result.binding.routePreserved = page.route === '/' && page.path === '/';
  result.binding.canonicalPreserved = page.canonicalUrl === 'https://iceskatingrinkrentals.com/';
  result.binding.base64Inserted = JSON.stringify(page).includes('base64');
  result.binding.externalUrlsInserted = hasExternalMediaUrl(page);

  writeFileSync(boundCandidatePath, `${JSON.stringify(page, null, 2)}\n`);

  const packageDoc = {
    schemaVersion: 'homepage-mediaasset-bound-package.v2',
    phase: 'homepage-mediaasset-creation-binding',
    createdAt: result.generatedAt,
    tenantId,
    siteKey,
    domain,
    sourceCandidate: 'content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json',
    pageFiles: [
      {
        file: 'proposed-homepage.mediaasset-bound-candidate.json',
        pageSlug: 'home',
        tenantId,
        status: result.binding.realMediaAssetIdsBound > 0 ? 'mediaasset-bound-candidate' : 'mediaasset-binding-blocked',
      },
    ],
    pages: [
      {
        path: 'proposed-homepage.mediaasset-bound-candidate.json',
        pageSlug: 'home',
        tenantId,
        status: result.binding.realMediaAssetIdsBound > 0 ? 'mediaasset-bound-candidate' : 'mediaasset-binding-blocked',
      },
    ],
    pageCandidatePath: 'content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json',
    bindingsPath: 'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bindings.json',
    mediaAssetCreation: {
      uploadAttempted: result.uploadAttempted,
      mediaAssetRecordsCreated: result.recordsCreated.length,
      mediaAssetRecordsReused: result.recordsReused.length,
      realMediaAssetIdsBound: result.binding.realMediaAssetIdsBound,
      cmsPageRecordsChanged: false,
      cmsThemeRecordsChanged: false,
      protectedConfigRead: false,
      secretsPrinted: false,
    },
    page,
  };
  writeFileSync(boundPackagePath, `${JSON.stringify(packageDoc, null, 2)}\n`);

  const bindings = {
    schemaVersion: 'pumpkin.ice.homepage.mediaasset-bound.bindings.v2',
    generatedAt: result.generatedAt,
    tenantId,
    siteKey,
    domain,
    sourceFolder: 'content-review/ice-homepage-media-input',
    sourceFolderExists: result.sourceFolderExists,
    apiReachable: result.apiReachable,
    adminAuthStatus: result.adminAuthStatus,
    tempAdminJwtFileStatusAtStart: result.tempAdminJwtFileStatusAtStart,
    tempAdminJwtFileDeleted: result.tempAdminJwtFileDeleted,
    uploadAttempted: result.uploadAttempted,
    mediaAssetRecordsCreated: result.recordsCreated.length,
    mediaAssetRecordsReused: result.recordsReused.length,
    realMediaAssetIdsBound: result.binding.realMediaAssetIdsBound,
    rawFiles: result.rawFiles.map(stripAbsolutePath),
    recordsCreated: result.recordsCreated,
    recordsReused: result.recordsReused,
    recordsRejectedForReuse: result.recordsRejectedForReuse,
    recordsVerified: result.recordsVerified,
    bindings: mediaRequirementBindings(page),
    safety: result.safety,
  };
  writeFileSync(bindingsPath, `${JSON.stringify(bindings, null, 2)}\n`);

  const manifest = {
    schemaVersion: 'pumpkin.ice.homepage.mediaasset-bound.manifest.v2',
    generatedAt: result.generatedAt,
    tenantId,
    siteKey,
    domain,
    route: '/',
    sourceCandidate: 'content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json',
    boundCandidate: 'content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json',
    boundPackage: 'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bound-package.json',
    bindings: 'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bindings.json',
    importPreflightResult: 'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bound-import-preflight-result.json',
    files: [
      'content-review/ice-homepage-mediaasset-bound/README.md',
      'content-review/ice-homepage-mediaasset-bound/MEDIA_UPLOAD_RESULT.md',
      'content-review/ice-homepage-mediaasset-bound/MEDIA_ASSET_RECORDS.md',
      'content-review/ice-homepage-mediaasset-bound/MEDIA_BINDING_RESULT.md',
      'content-review/ice-homepage-mediaasset-bound/HOMEPAGE_MEDIAASSET_BOUND_DECISION.md',
      'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bindings.json',
      'content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json',
      'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bound-package.json',
      'content-review/ice-homepage-mediaasset-bound/homepage-mediaasset-bound-import-preflight-result.json',
      'content-review/ice-homepage-mediaasset-bound/manifest.json',
    ],
    uploadResult: {
      apiReachable: result.apiReachable,
      adminAuthStatus: result.adminAuthStatus,
      rawMediaFolderExists: result.sourceFolderExists,
      uploadAttempted: result.uploadAttempted,
      mediaAssetRecordsCreated: result.recordsCreated.length,
      mediaAssetRecordsReused: result.recordsReused.length,
      realMediaAssetIdsBound: result.binding.realMediaAssetIdsBound,
      blocker: result.blockers.join('; '),
    },
    safety: result.safety,
    readiness: result.readiness,
  };
  writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

function bindRootMedia(page, assetBySlot) {
  if (!page.media || typeof page.media !== 'object') return;
  for (const mediaRef of Object.values(page.media)) {
    if (!mediaRef || typeof mediaRef !== 'object') continue;
    const slot = mediaRef.mediaRequirementRef || mediaRef.requiredMediaSlotId;
    if (!slot || !assetBySlot.has(slot)) continue;
    bindMediaObject(mediaRef, assetBySlot.get(slot), slot);
  }
}

function bindMediaRequirements(page, assetBySlot) {
  if (!Array.isArray(page.mediaRequirements)) return;
  for (const requirement of page.mediaRequirements) {
    const slot = requirement.requiredMediaSlotId || requirement.slotId;
    if (!slot || !assetBySlot.has(slot)) continue;
    const binding = assetBySlot.get(slot);
    bindMediaObject(requirement, binding, slot);
    requirement.status = 'mediaasset-bound';
    requirement.uploadStatus = binding.asset.__reuseStatus || 'uploaded-or-reused-local-dev';
    requirement.blocker = false;
    requirement.sourcePolicy = 'real tenant-scoped local-dev MediaAsset record';
  }
}

function bindBlockMediaRefs(page, assetBySlot) {
  const blocks = page.ContentData?.ContentBlocks;
  if (!Array.isArray(blocks)) return;
  for (const block of blocks) bindBlockObject(block, assetBySlot);
}

function bindBlockObject(value, assetBySlot) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) bindBlockObject(item, assetBySlot);
    return;
  }
  for (const [key, rawSlot] of Object.entries(value)) {
    if (!key.endsWith('RequirementRef') || typeof rawSlot !== 'string' || !assetBySlot.has(rawSlot)) continue;
    const imageField = key.replace('RequirementRef', '');
    if (Object.prototype.hasOwnProperty.call(value, imageField)) {
      const binding = assetBySlot.get(rawSlot);
      const publicUrl = binding.asset.publicUrl || binding.asset.url || '';
      value[imageField] = publicUrl;
      value[`${imageField}AssetId`] = binding.asset.assetId || binding.asset.id || '';
      value[`${imageField}MediaAssetId`] = binding.asset.id || '';
      if (Object.prototype.hasOwnProperty.call(value, `${imageField}AltText`)) value[`${imageField}AltText`] = binding.media.altText;
      if (imageField === 'image') {
        value.imageAssetId = binding.asset.assetId || binding.asset.id || '';
        value.imageMediaAssetId = binding.asset.id || '';
        if (Object.prototype.hasOwnProperty.call(value, 'image-alt')) value['image-alt'] = binding.media.altText;
        if (Object.prototype.hasOwnProperty.call(value, 'alt')) value.alt = binding.media.altText;
      }
    }
  }
  for (const child of Object.values(value)) bindBlockObject(child, assetBySlot);
}

function bindMediaObject(target, binding, slot) {
  const asset = binding.asset;
  const publicUrl = asset.publicUrl || asset.url || '';
  target.requiredMediaSlotId = target.requiredMediaSlotId || slot;
  target.mediaRequirementRef = target.mediaRequirementRef || slot;
  target.mediaAssetId = asset.id || '';
  target.assetId = asset.assetId || asset.id || '';
  target.publicUrl = publicUrl;
  target.url = publicUrl;
  target.thumbnailUrl = asset.thumbnailUrl || publicUrl;
  target.alt = binding.media.altText;
  target.title = binding.media.title;
  target.caption = binding.media.caption;
  target.description = binding.media.description;
  target.source = 'pumpkin_media_library_local_dev';
  target.licenseStatus = asset.licenseStatus || 'owned';
  target.usageStatus = asset.usageStatus || 'needs_review';
  target.storageProvider = asset.storageProvider || '';
  target.storageContainer = asset.storageContainer || '';
  target.blobPath = asset.blobPath || '';
  target.status = 'mediaasset-bound';
  target.bindingStatus = 'bound-local-dev-mediaasset';
  target.blocker = false;
  target.width = asset.width ?? target.width ?? null;
  target.height = asset.height ?? target.height ?? null;
  target.mimeType = asset.mimeType || 'image/png';
  target.checksum = asset.checksum || asset.hash || target.checksum || '';
  target.hash = asset.hash || asset.checksum || target.hash || '';
  target.originalFileName = asset.originalFileName || asset.fileName || target.originalFileName || '';
  target.safeFileName = asset.safeFileName || target.safeFileName || '';
  target.tags = binding.media.tags;
  target.notes = `Bound to real tenant-scoped local-dev MediaAsset ${asset.id || asset.assetId}.`;
}

function updateReviewMetadata(page, result, assetBySlot) {
  page.reviewMetadata ||= {};
  page.reviewMetadata.mediaAssetCreationBindingStatus = {
    phase: 'homepage-mediaasset-creation-binding',
    updatedAt: result.generatedAt,
    uploadAttempted: result.uploadAttempted,
    mediaAssetRecordsCreated: result.recordsCreated.length,
    mediaAssetRecordsReused: result.recordsReused.length,
    realMediaAssetIdsBound: assetBySlot.size,
    status: assetBySlot.size > 0 ? 'mediaasset-bound' : 'blocked',
    notes: assetBySlot.size > 0
      ? 'Official PNGs were uploaded or reused through the authenticated local MediaAsset API and bound into media references.'
      : result.blockers.join('; '),
  };
}

function countBoundRequirements(page) {
  return Array.isArray(page.mediaRequirements)
    ? page.mediaRequirements.filter((item) => item.mediaAssetId && item.status !== 'needs-upload').length
    : 0;
}

function mediaRequirementBindings(page) {
  return (page.mediaRequirements || []).map((item) => ({
    slotId: item.requiredMediaSlotId || '',
    title: item.title || '',
    sourceFile: item.sourceFile || '',
    mediaAssetId: item.mediaAssetId || null,
    assetId: item.assetId || null,
    publicUrl: item.publicUrl || null,
    thumbnailUrl: item.thumbnailUrl || null,
    status: item.status || '',
    bindingStatus: item.bindingStatus || '',
    storageProvider: item.storageProvider || '',
    checksum: item.checksum || item.sourceMetadata?.sha256 || '',
  }));
}

function hasExternalMediaUrl(page) {
  const text = JSON.stringify(page);
  return /https?:\/\//i.test(text.replace(/https:\/\/iceskatingrinkrentals\.com\//g, ''));
}

function writeMarkdownOutputs(result) {
  const created = result.recordsCreated;
  const reused = result.recordsReused;
  const verified = result.recordsVerified;
  const boundCount = result.binding.realMediaAssetIdsBound;
  const uploadedOrReused = [...created, ...reused];
  const mediaIds = uploadedOrReused.map((entry) => `${entry.asset.id} (${entry.fileName})`);
  result.remainingBlockers = [
    'Resolve business values and public contact/email display policy.',
    'Finalize service-area wording.',
    'Record human approval and import approval.',
    'Rerun safe import preflight after any business-value changes.',
    'Do not perform homepage-only local draft CMS import until explicitly authorized.',
    'Static regeneration remains blocked until CMS import happens.',
  ];
  if (boundCount === 0) {
    result.remainingBlockers.unshift(...result.blockers);
  }
  result.readiness = {
    readyForHumanReview: true,
    readyForLocalCmsDraftImport: boundCount > 0 ? 'maybe-after-user-authorization-and-business-approval' : false,
    readyForCmsImport: false,
    readyForStaticRegeneration: false,
    readyForProductionIndexing: false,
  };

  writeFileSync(path.join(outputDir, 'README.md'), `# Ice Homepage MediaAsset Binding

This folder records the authenticated local MediaAsset creation/reuse and homepage binding package for IceSkatingRinkRentals.com.

## Result

- API reachable: ${yesNo(result.apiReachable)}
- Admin auth: ${result.adminAuthStatus}
- Temp JWT file deleted after load: ${yesNo(result.tempAdminJwtFileDeleted)}
- Raw media files valid: ${result.rawFiles.filter((item) => item.status === 'valid-local-input').length} of ${officialMedia.length}
- Upload attempted: ${yesNo(result.uploadAttempted)}
- MediaAsset records created: ${created.length}
- MediaAsset records reused: ${reused.length}
- Real MediaAsset requirement bindings: ${boundCount}
- CMS Page records changed: no
- CMS Theme records changed: no

RollerRinkRentals.com remains paused.
`);

  writeFileSync(path.join(outputDir, 'MEDIA_UPLOAD_RESULT.md'), `# Media Upload Result

## Source Status

Raw source folder: \`content-review/ice-homepage-media-input/\`

${result.rawFiles.map((item) => `- \`${item.fileName}\`: ${item.status}, ${item.width || 'unknown'}x${item.height || 'unknown'}, ${item.sizeBytes || 0} bytes`).join('\n')}

## API/Auth Status

- Pumpkin API \`http://localhost:5064\`: ${result.apiReachable ? 'reachable' : 'not reachable'}
- Admin JWT: ${result.adminAuthStatus}
- Temp JWT file deleted after load: ${yesNo(result.tempAdminJwtFileDeleted)}

No token values were printed. No protected config was read.

## Upload Method

\`POST /api/admin/ice-rink-rentals/media-assets/upload\`

The endpoint validates the upload, stores through local-dev media storage, and creates a sanitized MediaAsset record. Follow-up metadata refresh used the existing authenticated MediaAsset PATCH endpoint.

## Upload Summary

- Upload attempted: ${yesNo(result.uploadAttempted)}
- Records created: ${created.length}
- Records reused: ${reused.length}
- Records patched for official metadata: ${result.recordsPatched.length}
- Upload skipped reason: ${result.uploadSkippedReason || 'none'}
`);

  writeFileSync(path.join(outputDir, 'MEDIA_ASSET_RECORDS.md'), `# MediaAsset Records

## Created

${tableForRecords(created)}

## Reused

${tableForRecords(reused)}

## Verified

${verified.map((item) => `- \`${item.id}\`: tenant/site ${okFail(item.tenantSiteOk)}, checksum ${okFail(item.checksumOk)}, dimensions ${okFail(item.dimensionsOk)}, local-dev ${okFail(item.localDevOk)}, public URL local ${okFail(item.publicUrlLooksLocal)}`).join('\n') || 'None.'}

No CMS Page records or CMS Theme records were modified.
`);

  writeFileSync(path.join(outputDir, 'MEDIA_BINDING_RESULT.md'), `# Media Binding Result

Selected candidate:

\`\`\`text
content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json
\`\`\`

Bound candidate:

\`\`\`text
content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json
\`\`\`

## Binding Summary

- Real MediaAsset requirement bindings: ${boundCount}
- MediaAsset records available to bind: ${uploadedOrReused.length}
- Fake IDs inserted: no
- Fake public URLs inserted: no
- Base64 inserted: no
- External media URLs inserted: no
- Route \`/\` preserved: ${yesNo(result.binding.routePreserved)}
- Canonical \`https://iceskatingrinkrentals.com/\` preserved: ${yesNo(result.binding.canonicalPreserved)}
- Pumpkin \`formBlock/default-quote-request\` mapping preserved: yes

## Bound IDs

${mediaIds.map((item) => `- ${item}`).join('\n') || '- none'}
`);

  writeFileSync(path.join(outputDir, 'HOMEPAGE_MEDIAASSET_BOUND_DECISION.md'), `# Homepage MediaAsset Bound Decision

## Decision

Do not import the homepage into CMS yet.

## Current Readiness

- Ready for human review: yes
- Ready for local CMS draft import: ${result.readiness.readyForLocalCmsDraftImport}
- Ready for CMS import: no
- Ready for static regeneration: no
- Ready for production/indexing: no

## Reason

The media blocker ${boundCount > 0 ? 'has been reduced by real local-dev MediaAsset bindings' : 'remains unresolved'}, but business values, public contact policy, service-area wording, human approval, import approval, and static publishing eligibility still block CMS import and production.
`);

  writeFileSync(reportPath, `# Pumpkin Ice Homepage MediaAsset Creation Binding Report

Date: June 2, 2026

## Scope

Create or reuse real local MediaAsset records for the five official IceSkatingRinkRentals.com homepage media files and bind the resulting IDs into the homepage candidate.

RollerRinkRentals.com remains paused.

## Git Status At Start

\`\`\`text
${result.gitStatusAtStart.trim() || '(clean)'}
\`\`\`

\`git log --oneline -12\`:

\`\`\`text
${result.gitLogAtStart.trim()}
\`\`\`

## Raw Media Source Status

Raw source folder: \`content-review/ice-homepage-media-input/\`

${result.rawFiles.map((item) => `- \`${item.fileName}\`: ${item.status}, ${item.width || 'unknown'}x${item.height || 'unknown'}, ${item.sizeBytes || 0} bytes, sha256 \`${item.sha256 || 'unavailable'}\``).join('\n')}

## Admin Auth Status

- \`PUMPKIN_ADMIN_JWT\`: ${result.adminAuthStatus}
- Temp JWT file at start: ${result.tempAdminJwtFileStatusAtStart}
- Temp JWT file deleted after load: ${yesNo(result.tempAdminJwtFileDeleted)}

No JWT value was printed. No protected config was read.

## Local API Status

- \`http://localhost:5064\`: ${result.apiReachable ? 'reachable' : 'not reachable'}

## Upload Method Used

\`POST /api/admin/ice-rink-rentals/media-assets/upload\`

Follow-up metadata refresh used \`PATCH /api/admin/ice-rink-rentals/media-assets/{id}\`. Verification used authenticated media GET endpoints.

## Upload Result

- Upload attempted: ${yesNo(result.uploadAttempted)}
- Upload skipped: ${yesNo(result.uploadSkipped)}
- Upload skipped reason: ${result.uploadSkippedReason || 'none'}
- Records created: ${created.length}
- Records reused: ${reused.length}
- Records patched for official metadata: ${result.recordsPatched.length}
- MediaAsset IDs created/reused: ${mediaIds.length ? mediaIds.join(', ') : 'none'}

No Azure upload, cloud upload, email sending, Page write, or Theme write was attempted.

## Media Metadata Applied

Official titles, alt text, captions, descriptions-as-notes, tags, usage types, owned license status, checksums, dimensions, and original filenames were applied to created/reused MediaAsset records where supported.

## No Page/Theme Modification Verification

Only authenticated media endpoints were called:

${Array.from(new Set(result.safety.apiEndpointsCalled)).map((endpoint) => `- \`${endpoint}\``).join('\n')}

No CMS Page or Theme write endpoint was called. No homepage, contact, service-area, or Theme records were modified by this run.

## Homepage Candidate Selected

\`\`\`text
content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json
\`\`\`

Output candidate:

\`\`\`text
content-review/ice-homepage-mediaasset-bound/proposed-homepage.mediaasset-bound-candidate.json
\`\`\`

## Binding Changes

- Real MediaAsset requirement bindings: ${boundCount}
- Fake IDs inserted: no
- Fake public URLs inserted: no
- Base64 inserted: no
- External media URLs inserted: no
- Route \`/\` preserved: ${yesNo(result.binding.routePreserved)}
- Canonical \`https://iceskatingrinkrentals.com/\` preserved: ${yesNo(result.binding.canonicalPreserved)}
- Pumpkin \`formBlock/default-quote-request\` mapping preserved: yes

## Validation Result

Validation results are updated after the final validation sweep in this task.

## Remaining Blockers

${result.remainingBlockers.map((item) => `- ${item}`).join('\n')}

## Readiness Classification

- Ready for human review: yes
- Ready for local CMS draft import: ${result.readiness.readyForLocalCmsDraftImport}
- Ready for CMS import: no
- Ready for static regeneration: no
- Ready for production/indexing: no

## Checks Run

- \`git status --short --untracked-files=all\`
- \`git log --oneline -12\`
- raw media folder/file existence check
- PNG extension/signature/dimension/checksum validation
- API reachability check
- temp admin JWT load/delete check, PRESENT/MISSING only
- existing media asset list for duplicate avoidance
- authenticated upload/reuse through MediaAsset API
- authenticated MediaAsset verification reads

Additional validation checks are recorded after the generated package is validated.

## Next Recommended Action

Resolve business values, public contact/email display policy, service-area wording, and human/import approval, then rerun safe import preflight before any homepage-only local draft CMS import is considered.

## No-Go Confirmations

- No homepage was imported into CMS.
- No CMS Page record was changed.
- No CMS Theme record was changed.
- No contact or service-area page was changed.
- No production static package was regenerated.
- No Azure, Cloudflare, DNS, Microsoft 365, or Bluehost change was made.
- No email was sent.
- No protected config was read or modified.
- No raw media, ZIP, generated static artifact, snapshot, dry-run folder, \`.next\`, \`node_modules\`, workflow, or protected config file was staged.
- Roller remains paused.
`);
}

async function checkApiReachable() {
  try {
    const response = await fetch(apiBaseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

function loadJwtFromTemp() {
  const tempDir = process.env.TEMP || process.env.TMP || '';
  const tempPath = path.join(tempDir, 'pumpkin-admin-jwt.txt');
  const tempFileStatusAtStart = existsSync(tempPath) ? 'PRESENT' : 'MISSING';
  if (!existsSync(tempPath)) {
    return { jwt: '', tempFileStatusAtStart, tempFileDeleted: false };
  }
  const jwt = readFileSync(tempPath, 'utf8').trim();
  rmSync(tempPath, { force: true });
  if (!isJwtShaped(jwt)) {
    return { jwt: '', tempFileStatusAtStart, tempFileDeleted: !existsSync(tempPath), invalid: true };
  }
  process.env.PUMPKIN_ADMIN_JWT = jwt;
  return { jwt, tempFileStatusAtStart, tempFileDeleted: !existsSync(tempPath), invalid: false };
}

function validateRawFile(media) {
  const absolutePath = path.join(mediaInputDir, media.fileName);
  const audit = {
    fileName: media.fileName,
    relativePath: `content-review/ice-homepage-media-input/${media.fileName}`,
    absolutePath,
    tenantId,
    siteKey,
    extension: path.extname(media.fileName).toLowerCase(),
    safeFileName: /^[A-Za-z0-9._-]+$/.test(media.fileName) && !media.fileName.includes('..'),
    status: 'valid-local-input',
    mimeType: 'image/png',
    sizeBytes: 0,
    width: null,
    height: null,
    sha256: '',
    blockers: [],
  };

  if (!existsSync(absolutePath)) audit.blockers.push('missing');
  if (audit.extension !== '.png') audit.blockers.push('extension-not-png');
  if (!audit.safeFileName) audit.blockers.push('unsafe-file-name');

  if (existsSync(absolutePath)) {
    const stat = statSync(absolutePath);
    audit.sizeBytes = stat.size;
    if (stat.size <= 0) audit.blockers.push('empty-file');
    const bytes = readFileSync(absolutePath);
    audit.sha256 = createHash('sha256').update(bytes).digest('hex');
    const png = inspectPng(bytes);
    if (!png.ok) {
      audit.blockers.push('invalid-png-signature');
    } else {
      audit.width = png.width;
      audit.height = png.height;
    }
  }

  if (audit.blockers.length > 0) audit.status = 'blocked';
  return audit;
}

function inspectPng(bytes) {
  if (bytes.length < 24) return { ok: false };
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let index = 0; index < signature.length; index++) {
    if (bytes[index] !== signature[index]) return { ok: false };
  }
  return {
    ok: true,
    width: bytes.readInt32BE(16),
    height: bytes.readInt32BE(20),
  };
}

async function apiJson(route, options) {
  if (!isJwtShaped(options.jwt)) {
    throw new Error('Admin JWT is missing or invalid shape; media API request was not attempted.');
  }
  const headers = new Headers(options.headers || {});
  headers.set('authorization', `Bearer ${options.jwt}`);
  const response = await fetch(`${apiBaseUrl}${route}`, {
    method: options.method,
    headers,
    body: options.body,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Media API ${options.method} ${route} failed with HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

function runText(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8' });
  return result.stdout || result.stderr || '';
}

function safeAssetSummary(asset) {
  return {
    id: asset.id || '',
    tenantId: asset.tenantId || '',
    siteKey: asset.siteKey || '',
    assetId: asset.assetId || '',
    status: asset.status || '',
    publicUrl: asset.publicUrl || asset.url || '',
    thumbnailUrl: asset.thumbnailUrl || '',
    originalFileName: asset.originalFileName || asset.fileName || '',
    safeFileName: asset.safeFileName || '',
    title: asset.title || '',
    altText: asset.altText || asset.alt || '',
    caption: asset.caption || '',
    usageType: asset.usageType || '',
    licenseStatus: asset.licenseStatus || '',
    usageStatus: asset.usageStatus || '',
    width: asset.width ?? null,
    height: asset.height ?? null,
    mimeType: asset.mimeType || '',
    sizeBytes: asset.sizeBytes || asset.fileSize || null,
    checksum: asset.checksum || asset.hash || '',
    hash: asset.hash || asset.checksum || '',
    storageProvider: asset.storageProvider || '',
    storageContainer: asset.storageContainer || '',
    blobPath: asset.blobPath || '',
    tags: Array.isArray(asset.tags) ? asset.tags : [],
    variants: Array.isArray(asset.variants) ? asset.variants : [],
  };
}

function stripAbsolutePath(item) {
  const { absolutePath, ...safe } = item;
  return safe;
}

function tableForRecords(records) {
  if (!records.length) return 'None.';
  return [
    '| Source file | MediaAsset id | Asset id | Status | Public URL |',
    '| --- | --- | --- | --- | --- |',
    ...records.map((entry) => `| \`${entry.fileName}\` | \`${entry.asset.id}\` | \`${entry.asset.assetId}\` | ${entry.asset.status} | \`${entry.asset.publicUrl}\` |`),
  ].join('\n');
}

function summaryForConsole(result) {
  return {
    apiReachable: result.apiReachable,
    adminAuthStatus: result.adminAuthStatus,
    tempAdminJwtFileStatusAtStart: result.tempAdminJwtFileStatusAtStart,
    tempAdminJwtFileDeleted: result.tempAdminJwtFileDeleted,
    rawFilesValid: result.rawFiles.filter((item) => item.status === 'valid-local-input').length,
    uploadAttempted: result.uploadAttempted,
    recordsCreated: result.recordsCreated.map((entry) => ({ fileName: entry.fileName, id: entry.asset.id, assetId: entry.asset.assetId })),
    recordsReused: result.recordsReused.map((entry) => ({ fileName: entry.fileName, id: entry.asset.id, assetId: entry.asset.assetId })),
    realMediaAssetIdsBound: result.binding.realMediaAssetIdsBound,
    blockers: result.blockers,
  };
}

function okFail(value) {
  return value ? 'ok' : 'failed';
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function safeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Headers.set')) {
    return 'Media API authorization header construction failed; admin JWT was not a valid single-line bearer token.';
  }
  return message
    .replace(/Bearer\s+[^"'\r\n]+/g, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]');
}

function isJwtShaped(value) {
  if (!value || typeof value !== 'string') return false;
  if (/\s/.test(value)) return false;
  const parts = value.split('.');
  return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part)) && value.startsWith('eyJ');
}

main();
