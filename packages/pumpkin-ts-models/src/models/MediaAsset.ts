export type MediaAssetLicenseStatus =
  | 'unknown'
  | 'needs_review'
  | 'approved'
  | 'rejected'
  | 'owned'
  | 'licensed'
  | 'ai_generated'
  | 'partner_provided';

export type MediaAssetUsageStatus =
  | 'unused'
  | 'in_use'
  | 'needs_review'
  | 'approved_for_publish';

export type MediaAssetStatus =
  | 'draft'
  | 'active'
  | 'archived'
  | 'replaced'
  | 'deleted-pending';

export type MediaAssetUsageType =
  | 'hero'
  | 'card'
  | 'gallery'
  | 'og-image'
  | 'icon'
  | 'background'
  | 'inline'
  | 'document';

export type MediaAssetStorageProvider =
  | 'local-dev'
  | 'azure-blob'
  | 'external';

export interface MediaAssetFocalPoint {
  x: number | null;
  y: number | null;
}

export interface MediaAssetUsageReference {
  pageId: string;
  pageSlug: string;
  fieldPath: string;
  blockType: string;
  imageRole: string;
}

export interface MediaAssetVariant {
  name: string;
  url: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  sizeBytes: number | null;
  storageProvider: MediaAssetStorageProvider;
  blobPath: string;
  generatedAt: string;
  status: 'available' | 'planned' | 'failed';
}

export interface MediaAsset {
  id: string;
  tenantId: string;
  siteKey?: string;
  assetId: string;
  status?: MediaAssetStatus;
  url: string;
  publicUrl?: string;
  thumbnailUrl?: string;
  fileName: string;
  originalFileName?: string;
  safeFileName?: string;
  title: string;
  alt: string;
  altText?: string;
  caption: string;
  source: string;
  credit?: string;
  license?: string;
  sourceUrl: string;
  usageType?: MediaAssetUsageType;
  licenseStatus: MediaAssetLicenseStatus;
  usageStatus: MediaAssetUsageStatus;
  width: number | null;
  height: number | null;
  mimeType: string;
  extension?: string;
  fileSize: number | null;
  sizeBytes?: number | null;
  checksum?: string;
  hash?: string;
  storageProvider?: MediaAssetStorageProvider;
  storageContainer?: string;
  blobPath?: string;
  focalPoint: MediaAssetFocalPoint;
  decorative: boolean;
  tags: string[];
  notes: string;
  variants?: MediaAssetVariant[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  uploadedBy?: string;
  lastReviewedAt: string;
  reviewedBy: string;
  usageReferences: MediaAssetUsageReference[];
  usedByPages?: MediaAssetUsageReference[];
  replacedByMediaAssetId?: string;
  archivedAt?: string;
  archivedBy?: string;
}
