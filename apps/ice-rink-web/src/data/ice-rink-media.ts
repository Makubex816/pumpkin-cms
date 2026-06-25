import type { PageImageAsset } from 'pumpkin-ts-models';

export const ICE_PUBLIC_CONTACT_EMAIL = 'contact@iceskatingrinkrentals.com';
export const ICE_MEDIA_PUBLIC_BASE_URL =
  'https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media';

export type IceMediaAssetKey =
  | 'contactPlanningHero'
  | 'contactQuotePlanning'
  | 'contactSetupLogistics'
  | 'corporateEvent'
  | 'holidayRink'
  | 'setupLogistics'
  | 'siteLogo'
  | 'ppecLogo'
  | 'winterFest';

export interface IceExistingAzureMediaAsset {
  assetId: string;
  mediaAssetId: string;
  title: string;
  publicUrl: string;
  alt: string;
  source: string;
  licenseStatus: string;
  usageStatus: string;
  width: number | null;
  height: number | null;
  contentType: 'image/png';
  sizeBytes: number;
  cacheControl: string;
  existingBlobName: string;
}

const cacheControl = 'public, max-age=31536000, immutable';

function blobUrl(blobName: string) {
  return `${ICE_MEDIA_PUBLIC_BASE_URL}/${blobName}`;
}

export const ICE_EXISTING_AZURE_MEDIA_ASSETS: Record<IceMediaAssetKey, IceExistingAzureMediaAsset> = {
  contactPlanningHero: {
    assetId: 'chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd',
    mediaAssetId: 'ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd',
    title: 'Contact Quote Planning Hero',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png'
    ),
    alt: 'Portable ice rink rental planning image for quote requests',
    source: 'existing Azure Blob media',
    licenseStatus: 'ai_generated',
    usageStatus: 'needs_visual_owner_review',
    width: null,
    height: null,
    contentType: 'image/png',
    sizeBytes: 1923827,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png',
  },
  contactQuotePlanning: {
    assetId: 'chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7',
    mediaAssetId: 'ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7',
    title: 'Contact Quote Planning Review',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png'
    ),
    alt: 'Portable ice rink setup details used to prepare an ice rink rental quote',
    source: 'existing Azure Blob media',
    licenseStatus: 'ai_generated',
    usageStatus: 'needs_visual_owner_review',
    width: null,
    height: null,
    contentType: 'image/png',
    sizeBytes: 2253456,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png',
  },
  contactSetupLogistics: {
    assetId: 'chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d',
    mediaAssetId: 'ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d',
    title: 'Contact Setup Logistics Review',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png'
    ),
    alt: 'Portable ice rink setup with event site review for rental planning',
    source: 'existing Azure Blob media',
    licenseStatus: 'ai_generated',
    usageStatus: 'needs_visual_owner_review',
    width: null,
    height: null,
    contentType: 'image/png',
    sizeBytes: 2105292,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png',
  },
  corporateEvent: {
    assetId: 'corporateicerinkrentalevent-18e985ca59bd',
    mediaAssetId: 'ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd',
    title: 'Corporate Ice Rink Rental Event',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png'
    ),
    alt: 'Corporate guests skating and networking around a temporary outdoor ice rink at an evening event',
    source: 'existing Azure Blob media',
    licenseStatus: 'owned',
    usageStatus: 'owner_recovered_original',
    width: 1672,
    height: 941,
    contentType: 'image/png',
    sizeBytes: 3685341,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png',
  },
  holidayRink: {
    assetId: 'holidayicerink-973ce7691377',
    mediaAssetId: 'ice-rink-rentals-holidayicerink-973ce7691377',
    title: 'Holiday Ice Rink Rental',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png'
    ),
    alt: 'Families and children skating on a portable ice rink at an outdoor holiday shopping center',
    source: 'existing Azure Blob media',
    licenseStatus: 'owned',
    usageStatus: 'owner_recovered_original',
    width: 1672,
    height: 941,
    contentType: 'image/png',
    sizeBytes: 3866376,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png',
  },
  setupLogistics: {
    assetId: 'icerinkrentalssetup-113d218572e4',
    mediaAssetId: 'ice-rink-rentals-icerinkrentalssetup-113d218572e4',
    title: 'Portable Ice Rink Setup',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png'
    ),
    alt: 'Portable ice rink setup with white safety barriers and skate aids before an outdoor event',
    source: 'existing Azure Blob media',
    licenseStatus: 'owned',
    usageStatus: 'owner_recovered_original',
    width: 1448,
    height: 1086,
    contentType: 'image/png',
    sizeBytes: 3545952,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png',
  },
  siteLogo: {
    assetId: 'iceskatingrinkrentalslogo-0d1f970f0411',
    mediaAssetId: 'ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411',
    title: 'Ice Rink Rentals Logo',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png'
    ),
    alt: 'Ice Rink Rentals logo with ice skate and snowflake graphic',
    source: 'existing Azure Blob media',
    licenseStatus: 'owned',
    usageStatus: 'owner_recovered_original',
    width: 1448,
    height: 1086,
    contentType: 'image/png',
    sizeBytes: 1627660,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png',
  },
  ppecLogo: {
    assetId: 'partyproseastcoastlogo-cfd1fc9f60ae',
    mediaAssetId: 'ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae',
    title: 'Party Pros East Coast Logo',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png'
    ),
    alt: 'Party Pros East Coast logo',
    source: 'existing Azure Blob media',
    licenseStatus: 'partner_provided',
    usageStatus: 'needs_visual_owner_review',
    width: null,
    height: null,
    contentType: 'image/png',
    sizeBytes: 24434,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png',
  },
  winterFest: {
    assetId: 'winterfesticerinkrentals-324b1b89777d',
    mediaAssetId: 'ice-rink-rentals-winterfesticerinkrentals-324b1b89777d',
    title: 'Winter Festival Ice Rink Rental',
    publicUrl: blobUrl(
      'ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png'
    ),
    alt: 'Guests skating on a festive outdoor ice rink surrounded by holiday lights at a winter festival',
    source: 'existing Azure Blob media',
    licenseStatus: 'owned',
    usageStatus: 'owner_recovered_original',
    width: 1672,
    height: 941,
    contentType: 'image/png',
    sizeBytes: 3607110,
    cacheControl,
    existingBlobName:
      'ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png',
  },
};

export const ICE_EXISTING_AZURE_MEDIA_URLS = Object.values(ICE_EXISTING_AZURE_MEDIA_ASSETS).map(
  (asset) => asset.publicUrl
);

export function iceMedia(key: IceMediaAssetKey, usageType = 'page-media'): PageImageAsset {
  const asset = ICE_EXISTING_AZURE_MEDIA_ASSETS[key];

  return {
    mediaAssetId: asset.mediaAssetId,
    assetId: asset.assetId,
    publicUrl: asset.publicUrl,
    url: asset.publicUrl,
    src: asset.publicUrl,
    alt: asset.alt,
    altText: asset.alt,
    title: asset.title,
    caption: '',
    description: asset.title,
    source: asset.source,
    licenseStatus: asset.licenseStatus,
    usageStatus: asset.usageStatus,
    usageType,
    status: 'existing-azure-blob',
    tags: ['ice-rink-rentals', usageType],
    blocker: false,
    width: asset.width,
    height: asset.height,
    focalPointX: null,
    focalPointY: null,
    decorative: false,
    storageProvider: 'Azure Blob Storage',
    storageAccount: 'iceskatingmedia',
    storageContainer: 'ice-rink-rentals-media',
    blobPath: asset.existingBlobName,
    contentType: asset.contentType,
    sizeBytes: asset.sizeBytes,
    cacheControl: asset.cacheControl,
  };
}
