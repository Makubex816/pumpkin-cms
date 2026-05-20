using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class MediaAsset
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("assetId")]
    public string AssetId { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("alt")]
    public string Alt { get; set; } = string.Empty;

    [JsonPropertyName("caption")]
    public string Caption { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("sourceUrl")]
    public string SourceUrl { get; set; } = string.Empty;

    [JsonPropertyName("licenseStatus")]
    public string LicenseStatus { get; set; } = "unknown";

    [JsonPropertyName("usageStatus")]
    public string UsageStatus { get; set; } = "unused";

    [JsonPropertyName("width")]
    public int? Width { get; set; }

    [JsonPropertyName("height")]
    public int? Height { get; set; }

    [JsonPropertyName("mimeType")]
    public string MimeType { get; set; } = string.Empty;

    [JsonPropertyName("fileSize")]
    public long? FileSize { get; set; }

    [JsonPropertyName("focalPoint")]
    public MediaAssetFocalPoint FocalPoint { get; set; } = new();

    [JsonPropertyName("decorative")]
    public bool Decorative { get; set; } = false;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("updatedAt")]
    public string UpdatedAt { get; set; } = string.Empty;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("lastReviewedAt")]
    public string LastReviewedAt { get; set; } = string.Empty;

    [JsonPropertyName("reviewedBy")]
    public string ReviewedBy { get; set; } = string.Empty;

    [JsonPropertyName("usageReferences")]
    public List<MediaAssetUsageReference> UsageReferences { get; set; } = new();
}

public class MediaAssetFocalPoint
{
    [JsonPropertyName("x")]
    public double? X { get; set; }

    [JsonPropertyName("y")]
    public double? Y { get; set; }
}

public class MediaAssetUsageReference
{
    [JsonPropertyName("pageId")]
    public string PageId { get; set; } = string.Empty;

    [JsonPropertyName("pageSlug")]
    public string PageSlug { get; set; } = string.Empty;

    [JsonPropertyName("fieldPath")]
    public string FieldPath { get; set; } = string.Empty;

    [JsonPropertyName("blockType")]
    public string BlockType { get; set; } = string.Empty;

    [JsonPropertyName("imageRole")]
    public string ImageRole { get; set; } = string.Empty;
}
