export type { IHtmlBlock, GenericHtmlBlock } from './models/IHtmlBlock';
export type { User, LoginRequest, LoginResponse, UserInfo } from './models/User';
export { UserRole, userRoleToString, stringToUserRole, isUserRole, userToUserInfo } from './models/User';
export type { Tenant, ApiKeyMeta, TenantSettings, Features, Contact, Billing, TenantInfo } from './models/Tenant';
export { tenantToTenantInfo } from './models/Tenant';
export type { FormEntry, FormEntryMetadata } from './models/FormEntry';
export type MediaAssetLicenseStatus = 'unknown' | 'needs_review' | 'approved' | 'rejected' | 'owned' | 'licensed' | 'ai_generated' | 'partner_provided';
export type MediaAssetUsageStatus = 'unused' | 'in_use' | 'needs_review' | 'approved_for_publish';
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
export type { Page, PageMetaData, SearchData, ContentData, SeoData, PageImageAsset, PageOpenGraphImage, PageMedia, PageFulfillment, PageGoogleAds, PageQuality, PageWorkflow, PageRedirect, PageRedirectReason, PageRevisionMetadata, PageChangeSource, PageRevisionSnapshot, PageStaticPublishing, PageTemplateIdentity, PageLinking, PageStructuredDataControls, PageFormConfig, PageImportProvenance, PageDeploymentHooks, AlternateUrl, OpenGraphData, TwitterCardData, ContentRelationships, NodePosition } from './models/Page';
export type { HeroType, HeroContent, HeroBlock } from './models/HeroBlocks';
export type { PrimaryCtaContent, PrimaryCtaBlock, SecondaryCtaContent, SecondaryCtaBlock } from './models/CtaBlocks';
export type { Card, CardGridContent, CardGridBlock, FaqItem, FaqContent, FaqBlock } from './models/ContentBlocks';
export type { BreadcrumbItem, BreadcrumbsContent, BreadcrumbsBlock, TrustBarItem, TrustBarContent, TrustBarBlock, Step, HowItWorksContent, HowItWorksBlock, ServiceAreaMapContent, ServiceAreaMapBlock, ProTipItem, LocalProTipsContent, LocalProTipsBlock } from './models/NavigationBlocks';
export type { GalleryImage, GalleryContent, GalleryBlock, TestimonialItem, TestimonialsContent, TestimonialsBlock, FormField, SocialLink, ContactContent, ContactBlock } from './models/InteractionBlocks';
export type { RelatedPost, BlogContent, BlogBlock } from './models/BlogBlocks';
export type { HtmlBlock } from './models/HtmlBlockTypes';
export { BLOCK_TYPE_MAP, SUPPORTED_BLOCK_TYPES, isBlockOfType, isHtmlBlock, createGenericBlock } from './models/HtmlBlockTypes';
export type { Theme, ThemeHeader, ThemeFooter, BlockStyleMap, MenuItem } from './models/Theme';
export type PublishRunSource = 'cms-snapshot' | 'seed-sites' | 'manual' | 'unknown';
export type PublishRunType = 'static_dry_run' | 'cms_snapshot' | 'static_export' | 'deployment_record';
export type PublishRunStatus = 'ready_for_manual_upload' | 'completed_with_warnings' | 'failed' | 'imported' | 'unknown';
export type PublishRunDeploymentTarget = 'none' | 'azure-static-web-apps' | 'azure-storage-static-website' | 'cloudflare';
export type PublishRunDeploymentStatus = 'not_deployed' | 'staged' | 'deployed' | 'failed' | 'rolled_back';
export interface PublishRun {
    id: string;
    tenantId: string;
    siteKey: string;
    domain: string;
    runId: string;
    source: PublishRunSource;
    runType: PublishRunType;
    status: PublishRunStatus;
    releaseFolder: string;
    manifestPath: string;
    summaryPath: string;
    createdAt: string;
    importedAt: string;
    createdBy: string;
    notes: string;
    sites: PublishRunSiteSummary[];
    pageCount: number;
    fileCount: number;
    redirectCount: number;
    pageQualityWarningCount: number;
    contentWarningCount: number;
    readyForManualUpload: boolean;
    errors: string[];
    warnings: string[];
    manifestSummary: PublishRunManifestSummary;
    deploymentTarget: PublishRunDeploymentTarget;
    deployedAt: string;
    deploymentStatus: PublishRunDeploymentStatus;
}
export interface PublishRunSiteSummary {
    siteKey: string;
    displayName: string;
    domain: string;
    uploadRoot: string;
    fileCount: number;
    redirectCount: number;
    pageQualityWarningCount: number;
    contentWarningCount: number;
    readyForManualUpload: boolean;
    sourceValidationOk: boolean | null;
    releaseValidationOk: boolean | null;
    canonicalOk: boolean | null;
    secretScanOk: boolean | null;
    warnings: string[];
    errors: string[];
}
export interface PublishRunManifestSummary {
    runId: string;
    generatedAt: string;
    releaseFolder: string;
    contentSource: PublishRunSource;
    deploymentAttempted: boolean;
    cloudflareModified: boolean;
    siteCount: number;
    ok: boolean | null;
}
export { PageJsonConverter } from './PageJsonConverter';
export type { JsonConverterOptions } from './PageJsonConverter';
//# sourceMappingURL=index.d.ts.map
