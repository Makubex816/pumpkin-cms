using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class Page
{
    [JsonPropertyName("id")]
    public string Id 
    { 
        get => PageId; 
        set => PageId = value; 
    }

    [JsonPropertyName("PageId")]
    public string PageId { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    private string _pageSlug = string.Empty;
    
    [JsonPropertyName("pageSlug")]
    public string PageSlug 
    { 
        get => _pageSlug;
        set 
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                _pageSlug = string.Empty;
                return;
            }

            // Convert to lowercase
            var slug = value.ToLowerInvariant();
            
            // Replace spaces, slashes, and backslashes with hyphens
            slug = slug.Replace(' ', '-')
                       .Replace('/', '-')
                       .Replace('\\', '-');
            
            // Remove consecutive hyphens
            while (slug.Contains("--"))
            {
                slug = slug.Replace("--", "-");
            }
            
            // Remove leading/trailing hyphens
            _pageSlug = slug.Trim('-');
        }
    }

    [JsonPropertyName("PageVersion")]
    public int PageVersion { get; set; } = 1;

    [JsonPropertyName("Layout")]
    public string Layout { get; set; } = string.Empty;

    [JsonPropertyName("MetaData")]
    public PageMetaData MetaData { get; set; } = new();

    [JsonPropertyName("searchData")]
    public SearchData SearchData { get; set; } = new();

    [JsonPropertyName("ContentData")]
    public ContentData ContentData { get; set; } = new();

    [JsonPropertyName("contentRelationships")]
    public ContentRelationships ContentRelationships { get; set; } = new();

    [JsonPropertyName("seo")]
    public SeoData Seo { get; set; } = new();

    [JsonPropertyName("isPublished")]
    public bool IsPublished { get; set; } = false;

    [JsonPropertyName("publishedAt")]
    public DateTime? PublishedAt { get; set; } = null;

    [JsonPropertyName("includeInSitemap")]
    public bool IncludeInSitemap { get; set; } = true;

    [JsonPropertyName("previousSlugs")]
    public List<string> PreviousSlugs { get; set; } = new();

    [JsonPropertyName("redirects")]
    public List<PageRedirect> Redirects { get; set; } = new();

    [JsonPropertyName("sitemapPriority")]
    public double? SitemapPriority { get; set; }

    [JsonPropertyName("sitemapChangeFrequency")]
    public string SitemapChangeFrequency { get; set; } = string.Empty;

    [JsonPropertyName("media")]
    public PageMedia Media { get; set; } = new();

    [JsonPropertyName("fulfillment")]
    public PageFulfillment Fulfillment { get; set; } = new();

    [JsonPropertyName("googleAds")]
    public PageGoogleAds GoogleAds { get; set; } = new();

    [JsonPropertyName("pageQuality")]
    public PageQuality PageQuality { get; set; } = new();

    [JsonPropertyName("workflow")]
    public PageWorkflow Workflow { get; set; } = new();

    [JsonPropertyName("revision")]
    public PageRevisionMetadata Revision { get; set; } = new();

    [JsonPropertyName("staticPublishing")]
    public PageStaticPublishing StaticPublishing { get; set; } = new();

    [JsonPropertyName("template")]
    public PageTemplateIdentity Template { get; set; } = new();

    [JsonPropertyName("linking")]
    public PageLinking Linking { get; set; } = new();

    [JsonPropertyName("schemaControls")]
    public PageStructuredDataControls SchemaControls { get; set; } = new();

    [JsonPropertyName("formConfig")]
    public PageFormConfig FormConfig { get; set; } = new();

    [JsonPropertyName("importProvenance")]
    public PageImportProvenance ImportProvenance { get; set; } = new();

    [JsonPropertyName("deploymentHooks")]
    public PageDeploymentHooks DeploymentHooks { get; set; } = new();

    [JsonPropertyName("layoutPositions")]
    public Dictionary<string, NodePosition>? LayoutPositions { get; set; }
}

public class PageRedirect
{
    [JsonPropertyName("from")]
    public string From { get; set; } = string.Empty;

    [JsonPropertyName("to")]
    public string To { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public int Type { get; set; } = 301;

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = "slug_changed";

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("active")]
    public bool Active { get; set; } = true;
}

public class PageImageAsset
{
    [JsonPropertyName("assetId")]
    public string AssetId { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("alt")]
    public string Alt { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("caption")]
    public string Caption { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("licenseStatus")]
    public string LicenseStatus { get; set; } = string.Empty;

    [JsonPropertyName("usageStatus")]
    public string UsageStatus { get; set; } = string.Empty;

    [JsonPropertyName("width")]
    public int? Width { get; set; }

    [JsonPropertyName("height")]
    public int? Height { get; set; }

    [JsonPropertyName("focalPointX")]
    public double? FocalPointX { get; set; }

    [JsonPropertyName("focalPointY")]
    public double? FocalPointY { get; set; }

    [JsonPropertyName("decorative")]
    public bool Decorative { get; set; } = false;
}

public class PageOpenGraphImage
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("alt")]
    public string Alt { get; set; } = string.Empty;
}

public class PageMedia
{
    [JsonPropertyName("featuredImage")]
    public PageImageAsset FeaturedImage { get; set; } = new();

    [JsonPropertyName("heroImage")]
    public PageImageAsset HeroImage { get; set; } = new();

    [JsonPropertyName("localImage")]
    public PageImageAsset LocalImage { get; set; } = new();

    [JsonPropertyName("closingImage")]
    public PageImageAsset ClosingImage { get; set; } = new();

    [JsonPropertyName("openGraphImage")]
    public PageOpenGraphImage OpenGraphImage { get; set; } = new();
}

public class PageFulfillment
{
    [JsonPropertyName("fulfillmentStatus")]
    public string FulfillmentStatus { get; set; } = string.Empty;

    [JsonPropertyName("primaryPartnerAvailable")]
    public bool PrimaryPartnerAvailable { get; set; } = false;

    [JsonPropertyName("manualReviewRequired")]
    public bool ManualReviewRequired { get; set; } = true;

    [JsonPropertyName("providerResearchCompleted")]
    public bool ProviderResearchCompleted { get; set; } = false;

    [JsonPropertyName("topProviderCount")]
    public int TopProviderCount { get; set; } = 0;

    [JsonPropertyName("leadRoutingMode")]
    public string LeadRoutingMode { get; set; } = string.Empty;

    [JsonPropertyName("publicDisclosureRequired")]
    public bool PublicDisclosureRequired { get; set; } = false;

    [JsonPropertyName("confirmedServiceStates")]
    public List<string> ConfirmedServiceStates { get; set; } = new();

    [JsonPropertyName("extendedStatesPossible")]
    public List<string> ExtendedStatesPossible { get; set; } = new();
}

public class PageGoogleAds
{
    [JsonPropertyName("eligible")]
    public bool Eligible { get; set; } = false;

    [JsonPropertyName("finalUrl")]
    public string FinalUrl { get; set; } = string.Empty;

    [JsonPropertyName("landingPageType")]
    public string LandingPageType { get; set; } = string.Empty;

    [JsonPropertyName("campaignTheme")]
    public string CampaignTheme { get; set; } = string.Empty;

    [JsonPropertyName("conversionGoals")]
    public List<string> ConversionGoals { get; set; } = new();

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;
}

public class PageQuality
{
    [JsonPropertyName("buyerIntent")]
    public string BuyerIntent { get; set; } = string.Empty;

    [JsonPropertyName("landingPageType")]
    public string LandingPageType { get; set; } = string.Empty;

    [JsonPropertyName("launchNotes")]
    public string LaunchNotes { get; set; } = string.Empty;
}

public class PageWorkflow
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = "draft";

    [JsonPropertyName("approvedForPublish")]
    public bool ApprovedForPublish { get; set; } = false;

    [JsonPropertyName("approvedBy")]
    public string ApprovedBy { get; set; } = string.Empty;

    [JsonPropertyName("approvedAt")]
    public string ApprovedAt { get; set; } = string.Empty;

    [JsonPropertyName("lastEditedBy")]
    public string LastEditedBy { get; set; } = string.Empty;

    [JsonPropertyName("lastEditedAt")]
    public string LastEditedAt { get; set; } = string.Empty;
}

public class PageRevisionMetadata
{
    [JsonPropertyName("currentRevisionId")]
    public string CurrentRevisionId { get; set; } = string.Empty;

    [JsonPropertyName("revisionNumber")]
    public int RevisionNumber { get; set; } = 1;

    [JsonPropertyName("revisionLabel")]
    public string RevisionLabel { get; set; } = string.Empty;

    [JsonPropertyName("lastSnapshotAt")]
    public string LastSnapshotAt { get; set; } = string.Empty;

    [JsonPropertyName("lastRevisionAt")]
    public string LastRevisionAt { get; set; } = string.Empty;

    [JsonPropertyName("lastRevisionBy")]
    public string LastRevisionBy { get; set; } = string.Empty;

    [JsonPropertyName("rollbackAvailable")]
    public bool RollbackAvailable { get; set; } = false;

    [JsonPropertyName("rollbackNotes")]
    public string RollbackNotes { get; set; } = "No rollback snapshot has been created yet.";

    [JsonPropertyName("lastChangeSummary")]
    public string LastChangeSummary { get; set; } = string.Empty;

    [JsonPropertyName("lastChangedBy")]
    public string LastChangedBy { get; set; } = string.Empty;

    [JsonPropertyName("lastChangeSource")]
    public string LastChangeSource { get; set; } = "manual_unknown";

    [JsonPropertyName("lastChangeAt")]
    public string LastChangeAt { get; set; } = string.Empty;

    [JsonPropertyName("latestSnapshot")]
    public PageRevisionSnapshot? LatestSnapshot { get; set; }
}

public class PageRevisionSnapshot
{
    [JsonPropertyName("revisionId")]
    public string RevisionId { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("pageId")]
    public string PageId { get; set; } = string.Empty;

    [JsonPropertyName("pageSlug")]
    public string PageSlug { get; set; } = string.Empty;

    [JsonPropertyName("pageVersion")]
    public int PageVersion { get; set; } = 1;

    [JsonPropertyName("revisionNumber")]
    public int RevisionNumber { get; set; } = 1;

    [JsonPropertyName("snapshotAt")]
    public string SnapshotAt { get; set; } = string.Empty;

    [JsonPropertyName("changeSource")]
    public string ChangeSource { get; set; } = "manual_unknown";

    [JsonPropertyName("changeSummary")]
    public string ChangeSummary { get; set; } = string.Empty;

    [JsonPropertyName("changedBy")]
    public string ChangedBy { get; set; } = string.Empty;

    [JsonPropertyName("page")]
    public Page? Page { get; set; }
}

public class PageChangeContext
{
    [JsonPropertyName("changeSource")]
    public string ChangeSource { get; set; } = "manual_unknown";

    [JsonPropertyName("changeSummary")]
    public string ChangeSummary { get; set; } = string.Empty;

    [JsonPropertyName("changedBy")]
    public string ChangedBy { get; set; } = string.Empty;
}

public class PageStaticPublishing
{
    [JsonPropertyName("staticEligible")]
    public bool StaticEligible { get; set; } = false;

    [JsonPropertyName("needsRebuild")]
    public bool NeedsRebuild { get; set; } = true;

    [JsonPropertyName("lastSnapshotAt")]
    public string LastSnapshotAt { get; set; } = string.Empty;

    [JsonPropertyName("lastStaticBuildAt")]
    public string LastStaticBuildAt { get; set; } = string.Empty;

    [JsonPropertyName("lastDeployedAt")]
    public string LastDeployedAt { get; set; } = string.Empty;

    [JsonPropertyName("contentHash")]
    public string ContentHash { get; set; } = string.Empty;

    [JsonPropertyName("lastPublishedContentHash")]
    public string LastPublishedContentHash { get; set; } = string.Empty;

    [JsonPropertyName("deploymentStatus")]
    public string DeploymentStatus { get; set; } = "not_deployed";
}

public class PageTemplateIdentity
{
    [JsonPropertyName("templateKey")]
    public string TemplateKey { get; set; } = string.Empty;

    [JsonPropertyName("templateVersion")]
    public string TemplateVersion { get; set; } = string.Empty;

    [JsonPropertyName("layoutVariant")]
    public string LayoutVariant { get; set; } = string.Empty;

    [JsonPropertyName("contentModelVersion")]
    public string ContentModelVersion { get; set; } = "1";
}

public class PageLinking
{
    [JsonPropertyName("hubPage")]
    public string HubPage { get; set; } = string.Empty;

    [JsonPropertyName("parentPage")]
    public string ParentPage { get; set; } = string.Empty;

    [JsonPropertyName("relatedPages")]
    public List<string> RelatedPages { get; set; } = new();

    [JsonPropertyName("requiredLinks")]
    public List<string> RequiredLinks { get; set; } = new();

    [JsonPropertyName("breadcrumbTrail")]
    public List<string> BreadcrumbTrail { get; set; } = new();
}

public class PageStructuredDataControls
{
    [JsonPropertyName("enableWebPageSchema")]
    public bool EnableWebPageSchema { get; set; } = true;

    [JsonPropertyName("enableBreadcrumbSchema")]
    public bool EnableBreadcrumbSchema { get; set; } = true;

    [JsonPropertyName("enableFAQSchema")]
    public bool EnableFAQSchema { get; set; } = true;

    [JsonPropertyName("enableServiceSchema")]
    public bool EnableServiceSchema { get; set; } = true;

    [JsonPropertyName("schemaWarnings")]
    public List<string> SchemaWarnings { get; set; } = new();
}

public class PageFormConfig
{
    [JsonPropertyName("formType")]
    public string FormType { get; set; } = string.Empty;

    [JsonPropertyName("conversionGoal")]
    public string ConversionGoal { get; set; } = string.Empty;

    [JsonPropertyName("thankYouUrl")]
    public string ThankYouUrl { get; set; } = string.Empty;

    [JsonPropertyName("thankYouMessage")]
    public string ThankYouMessage { get; set; } = string.Empty;

    [JsonPropertyName("recipientGroup")]
    public string RecipientGroup { get; set; } = string.Empty;

    [JsonPropertyName("staticFormEndpointKey")]
    public string StaticFormEndpointKey { get; set; } = string.Empty;

    [JsonPropertyName("consentRequired")]
    public bool ConsentRequired { get; set; } = true;

    [JsonPropertyName("spamProtectionEnabled")]
    public bool SpamProtectionEnabled { get; set; } = false;
}

public class PageImportProvenance
{
    [JsonPropertyName("lastImportBatchId")]
    public string LastImportBatchId { get; set; } = string.Empty;

    [JsonPropertyName("sourceFile")]
    public string SourceFile { get; set; } = string.Empty;

    [JsonPropertyName("sourceRow")]
    public string SourceRow { get; set; } = string.Empty;

    [JsonPropertyName("externalId")]
    public string ExternalId { get; set; } = string.Empty;

    [JsonPropertyName("lockedFields")]
    public List<string> LockedFields { get; set; } = new();

    [JsonPropertyName("overwriteBehavior")]
    public string OverwriteBehavior { get; set; } = "warn";
}

public class PageDeploymentHooks
{
    [JsonPropertyName("deploymentId")]
    public string DeploymentId { get; set; } = string.Empty;

    [JsonPropertyName("buildId")]
    public string BuildId { get; set; } = string.Empty;

    [JsonPropertyName("buildWarningCount")]
    public int BuildWarningCount { get; set; } = 0;

    [JsonPropertyName("publishSource")]
    public string PublishSource { get; set; } = string.Empty;
}

public class NodePosition
{
    [JsonPropertyName("x")]
    public double X { get; set; }

    [JsonPropertyName("y")]
    public double Y { get; set; }
}

public class PageMetaData
{
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("product")]
    public string Product { get; set; } = string.Empty;

    [JsonPropertyName("keyword")]
    public string Keyword { get; set; } = string.Empty;

    [JsonPropertyName("pageType")]
    public string PageType { get; set; } = "Keyword";

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("author")]
    public string Author { get; set; } = string.Empty;

    [JsonPropertyName("language")]
    public string Language { get; set; } = "en-us";

    [JsonPropertyName("market")]
    public string Market { get; set; } = string.Empty;
}

public class SearchData
{
    [JsonPropertyName("state")]
    public string State { get; set; } = string.Empty;

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("metro")]
    public string Metro { get; set; } = string.Empty;

    [JsonPropertyName("county")]
    public string County { get; set; } = string.Empty;

    [JsonPropertyName("keyword")]
    public string Keyword { get; set; } = string.Empty;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    [JsonPropertyName("contentSummary")]
    public string ContentSummary { get; set; } = string.Empty;

    [JsonPropertyName("blockTypes")]
    public List<string> BlockTypes { get; set; } = new();
}

public class ContentData
{
    [JsonPropertyName("ContentBlocks")]
    public List<HtmlBlockBase> ContentBlocks { get; set; } = new();
}

public class SeoData
{
    [JsonPropertyName("metaTitle")]
    public string MetaTitle { get; set; } = string.Empty;

    [JsonPropertyName("metaDescription")]
    public string MetaDescription { get; set; } = string.Empty;

    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; } = new();

    [JsonPropertyName("robots")]
    public string Robots { get; set; } = "index, follow";

    [JsonPropertyName("canonicalUrl")]
    public string CanonicalUrl { get; set; } = string.Empty;

    [JsonPropertyName("alternateUrls")]
    public List<AlternateUrl> AlternateUrls { get; set; } = new();

    [JsonPropertyName("structuredData")]
    public List<string> StructuredData { get; set; } = new();

    [JsonPropertyName("openGraph")]
    public OpenGraphData OpenGraph { get; set; } = new();

    [JsonPropertyName("twitterCard")]
    public TwitterCardData TwitterCard { get; set; } = new();
}

public class AlternateUrl
{
    [JsonPropertyName("hrefLang")]
    public string HrefLang { get; set; } = string.Empty;

    [JsonPropertyName("href")]
    public string Href { get; set; } = string.Empty;
}

public class OpenGraphData
{
    [JsonPropertyName("og:title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("og:description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("og:type")]
    public string Type { get; set; } = "website";

    [JsonPropertyName("og:url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("og:image")]
    public string Image { get; set; } = string.Empty;

    [JsonPropertyName("og:image:alt")]
    public string ImageAlt { get; set; } = string.Empty;

    [JsonPropertyName("og:site_name")]
    public string SiteName { get; set; } = string.Empty;

    [JsonPropertyName("og:locale")]
    public string Locale { get; set; } = "en_US";
}

public class TwitterCardData
{
    [JsonPropertyName("twitter:card")]
    public string Card { get; set; } = "summary_large_image";

    [JsonPropertyName("twitter:title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("twitter:description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("twitter:image")]
    public string Image { get; set; } = string.Empty;

    [JsonPropertyName("twitter:site")]
    public string Site { get; set; } = string.Empty;

    [JsonPropertyName("twitter:creator")]
    public string Creator { get; set; } = string.Empty;
}

public class ContentRelationships
{
    [JsonPropertyName("isHub")]
    public bool IsHub { get; set; } = false;

    [JsonPropertyName("hubPageSlug")]
    public string HubPageSlug { get; set; } = string.Empty;

    [JsonPropertyName("topicCluster")]
    public string TopicCluster { get; set; } = string.Empty;

    [JsonPropertyName("relatedHubs")]
    public List<string> RelatedHubs { get; set; } = new();

    [JsonPropertyName("spokePriority")]
    public int SpokePriority { get; set; } = 0;
}
