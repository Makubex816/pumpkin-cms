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

export interface MediaAsset {
  id: string;
  tenantId: string;
  assetId: string;
  url: string;
  fileName: string;
  title: string;
  alt: string;
  caption: string;
  source: string;
  sourceUrl: string;
  licenseStatus: MediaAssetLicenseStatus;
  usageStatus: MediaAssetUsageStatus;
  width: number | null;
  height: number | null;
  mimeType: string;
  fileSize: number | null;
  focalPoint: MediaAssetFocalPoint;
  decorative: boolean;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastReviewedAt: string;
  reviewedBy: string;
  usageReferences: MediaAssetUsageReference[];
}
