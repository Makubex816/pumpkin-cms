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
   * Saved XYFlow node positions for page relationship visualization
   */
  layoutPositions?: Record<string, NodePosition>;
}

/**
 * Reusable image asset metadata for page-level media slots
 */
export interface PageImageAsset {
  url: string;
  alt: string;
  title: string;
  caption: string;
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
}

/**
 * Editorial page quality metadata
 */
export interface PageQuality {
  buyerIntent: string;
  landingPageType: string;
  launchNotes: string;
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
