import { IHtmlBlock } from './IHtmlBlock';
/**
 * Node position for XYFlow layout persistence
 */
export interface NodePosition {
    x: number;
    y: number;
}
/**
 * Main page model representing a complete page structure
 */
export interface Page {
    id: string;
    PageId: string;
    tenantId: string;
    /**
     * Page slug - always stored in lowercase
     */
    pageSlug: string;
    PageVersion: number;
    Layout: string;
    MetaData: PageMetaData;
    searchData: SearchData;
    ContentData: ContentData;
    contentRelationships: ContentRelationships;
    seo: SeoData;
    isPublished: boolean;
    publishedAt: string | null;
    includeInSitemap: boolean;
    /**
     * Previous public slugs retained for future redirect planning.
     */
    previousSlugs?: string[];
    /**
     * Page-level redirect records used when slugs change before static publishing.
     */
    redirects?: PageRedirect[];
    /**
     * Optional sitemap priority for static publishing and XML sitemap generation.
     */
    sitemapPriority?: number | null;
    /**
     * Optional sitemap change frequency for static publishing and XML sitemap generation.
     */
    sitemapChangeFrequency?: string;
    /**
     * Page-level media slots used by production SEO and publishing workflows.
     */
    media?: PageMedia;
    /**
     * Fulfillment and partner routing state for launch transparency.
     */
    fulfillment?: PageFulfillment;
    /**
     * Google Ads and paid landing-page readiness metadata.
     */
    googleAds?: PageGoogleAds;
    /**
     * Editorial launch-quality metadata that does not affect rendering directly.
     */
    pageQuality?: PageQuality;
    /**
     * Editorial workflow/review state for production publishing approval.
     */
    workflow?: PageWorkflow;
    /**
     * Revision and rollback metadata. Full revision storage is future work.
     */
    revision?: PageRevisionMetadata;
    /**
     * Static publishing state used by CMS-to-static snapshot and deployment dry runs.
     */
    staticPublishing?: PageStaticPublishing;
    /**
     * Template and content-model identity for generated or structured pages.
     */
    template?: PageTemplateIdentity;
    /**
     * Internal linking and breadcrumb planning metadata.
     */
    linking?: PageLinking;
    /**
     * Structured data controls for static/public rendering decisions.
     */
    schemaControls?: PageStructuredDataControls;
    /**
     * Lead capture and form configuration metadata.
     */
    formConfig?: PageFormConfig;
    /**
     * Import/export provenance and field-locking metadata.
     */
    importProvenance?: PageImportProvenance;
    /**
     * Deployment/build history hook fields for static publishing reports.
     */
    deploymentHooks?: PageDeploymentHooks;
    /**
     * Saved XYFlow node positions for page relationship visualization
     */
    layoutPositions?: Record<string, NodePosition>;
}
export type PageRedirectReason = 'slug_changed' | 'manual' | 'imported' | 'canonical_cleanup';
/**
 * Page-level redirect record. Static publishing consumes active records to build
 * redirect manifests for Azure Static Web Apps or Cloudflare planning.
 */
export interface PageRedirect {
    from: string;
    to: string;
    type: 301;
    reason: PageRedirectReason;
    createdAt: string;
    createdBy?: string;
    active: boolean;
}
/**
 * Reusable image asset metadata for page-level media slots
 */
export interface PageImageAsset {
    assetId: string;
    url: string;
    alt: string;
    title: string;
    caption: string;
    source: string;
    licenseStatus: string;
    usageStatus: string;
    width: number | null;
    height: number | null;
    focalPointX: number | null;
    focalPointY: number | null;
    decorative: boolean;
}
/**
 * Compact Open Graph image metadata for exports and quality checks
 */
export interface PageOpenGraphImage {
    url: string;
    alt: string;
}
/**
 * Page-level media slots for production pages
 */
export interface PageMedia {
    featuredImage: PageImageAsset;
    heroImage: PageImageAsset;
    localImage: PageImageAsset;
    closingImage: PageImageAsset;
    openGraphImage: PageOpenGraphImage;
}
/**
 * Fulfillment and partner routing metadata
 */
export interface PageFulfillment {
    fulfillmentStatus: string;
    primaryPartnerAvailable: boolean;
    manualReviewRequired: boolean;
    providerResearchCompleted: boolean;
    topProviderCount: number;
    leadRoutingMode: string;
    publicDisclosureRequired: boolean;
    confirmedServiceStates: string[];
    extendedStatesPossible: string[];
}
/**
 * Google Ads readiness metadata
 */
export interface PageGoogleAds {
    eligible: boolean;
    finalUrl: string;
    landingPageType: string;
    campaignTheme: string;
    conversionGoals: string[];
    notes: string;
    policyRisk?: string;
    bridgePageRisk?: string;
    requiresDisclosure?: boolean;
}
/**
 * Editorial page quality metadata
 */
export interface PageQuality {
    status?: string;
    score?: number | null;
    warnings?: string[];
    blockingIssues?: string[];
    lastCheckedAt?: string;
    uniqueValueReason?: string;
    buyerIntent: string;
    landingPageType: string;
    launchNotes: string;
}
/**
 * Editorial workflow and review metadata
 */
export interface PageWorkflow {
    status: string;
    reviewStatus?: string;
    approvedForPublish: boolean;
    approvedBy: string;
    approvedAt: string;
    lastEditedBy: string;
    lastEditedAt: string;
}
/**
 * Minimal revision metadata until PageRevision storage exists
 */
export interface PageRevisionMetadata {
    currentRevisionId: string;
    revisionNumber: number;
    revisionLabel: string;
    lastSnapshotAt: string;
    lastRevisionAt: string;
    lastRevisionBy: string;
    rollbackAvailable: boolean;
    rollbackNotes: string;
    lastChangeSummary: string;
    lastChangedBy: string;
    lastChangeSource: PageChangeSource;
    lastChangeAt: string;
    latestSnapshot?: PageRevisionSnapshot | null;
}
export type PageChangeSource = 'admin_editor' | 'json_import' | 'csv_import' | 'xlsx_import' | 'lifecycle_action' | 'rollback' | 'cms_snapshot' | 'metadata_repair' | 'form_builder' | 'manual_unknown';
/**
 * Single latest pre-update page snapshot stored in the Page document.
 */
export interface PageRevisionSnapshot {
    revisionId: string;
    tenantId: string;
    pageId: string;
    pageSlug: string;
    pageVersion: number;
    revisionNumber: number;
    snapshotAt: string;
    changeSource: PageChangeSource;
    changeSummary: string;
    changedBy: string;
    page: Page | null;
}
/**
 * Static publishing metadata for Option C publishing
 */
export interface PageStaticPublishing {
    staticEligible: boolean;
    needsRebuild: boolean;
    lastSnapshotAt: string;
    lastStaticBuildAt: string;
    lastDeployedAt: string;
    contentHash: string;
    lastPublishedContentHash: string;
    deploymentStatus: string;
}
/**
 * Template and content model identity
 */
export interface PageTemplateIdentity {
    templateKey: string;
    templateVersion: string;
    layoutVariant: string;
    contentModelVersion: string;
}
/**
 * Internal linking and breadcrumb metadata
 */
export interface PageLinking {
    hubPage: string;
    parentPage: string;
    relatedPages: string[];
    requiredLinks: string[];
    breadcrumbTrail: string[];
}
/**
 * Structured data enablement controls
 */
export interface PageStructuredDataControls {
    enableWebPageSchema: boolean;
    enableBreadcrumbSchema: boolean;
    enableFAQSchema: boolean;
    enableServiceSchema: boolean;
    schemaWarnings: string[];
}
/**
 * Lead capture and form configuration
 */
export interface PageFormConfig {
    formId?: string;
    formType: string;
    conversionGoal: string;
    routingMode?: string;
    thankYouUrl: string;
    thankYouMessage: string;
    recipientGroup: string;
    staticFormEndpointKey: string;
    normalizedFieldMap?: Record<string, string>;
    requiresConsent?: boolean;
    consentRequired: boolean;
    spamProtectionRequired?: boolean;
    spamProtectionEnabled: boolean;
}
/**
 * Import/export provenance and field locking
 */
export interface PageImportProvenance {
    lastImportBatchId: string;
    sourceFile: string;
    sourceRow: string;
    externalId: string;
    lockedFields: string[];
    overwriteBehavior: string;
}
/**
 * Static deployment/build hooks
 */
export interface PageDeploymentHooks {
    deploymentId: string;
    buildId: string;
    buildWarningCount: number;
    publishSource: string;
}
/**
 * Page metadata containing basic page information
 */
export interface PageMetaData {
    category: string;
    product: string;
    keyword: string;
    pageType: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    author: string;
    language: string;
    market: string;
}
/**
 * Search-related data for SEO and indexing
 */
export interface SearchData {
    state: string;
    city: string;
    metro: string;
    county: string;
    keyword: string;
    tags: string[];
    contentSummary: string;
    blockTypes: string[];
}
/**
 * Container for all content blocks on a page
 */
export interface ContentData {
    ContentBlocks: IHtmlBlock[];
}
/**
 * Complete SEO metadata including Open Graph and Twitter Card data
 */
export interface SeoData {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    robots: string;
    canonicalUrl: string;
    alternateUrls: AlternateUrl[];
    structuredData: string[];
    openGraph: OpenGraphData;
    twitterCard: TwitterCardData;
}
/**
 * Alternate URL for different languages or regions
 */
export interface AlternateUrl {
    hrefLang: string;
    href: string;
}
/**
 * Open Graph metadata for social media sharing
 */
export interface OpenGraphData {
    'og:title': string;
    'og:description': string;
    'og:type': string;
    'og:url': string;
    'og:image': string;
    'og:image:alt': string;
    'og:site_name': string;
    'og:locale': string;
}
/**
 * Twitter Card metadata for Twitter sharing
 */
export interface TwitterCardData {
    'twitter:card': string;
    'twitter:title': string;
    'twitter:description': string;
    'twitter:image': string;
    'twitter:site': string;
    'twitter:creator': string;
}
/**
 * Content relationships for hub-spoke model and topic clustering
 */
export interface ContentRelationships {
    isHub: boolean;
    hubPageSlug: string;
    topicCluster: string;
    relatedHubs: string[];
    spokePriority: number;
}
//# sourceMappingURL=Page.d.ts.map
