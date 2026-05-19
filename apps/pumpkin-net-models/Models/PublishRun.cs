using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class PublishRun
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("siteKey")]
    public string SiteKey { get; set; } = string.Empty;

    [JsonPropertyName("domain")]
    public string Domain { get; set; } = string.Empty;

    [JsonPropertyName("runId")]
    public string RunId { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = "unknown";

    [JsonPropertyName("runType")]
    public string RunType { get; set; } = "static_dry_run";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "unknown";

    [JsonPropertyName("releaseFolder")]
    public string ReleaseFolder { get; set; } = string.Empty;

    [JsonPropertyName("manifestPath")]
    public string ManifestPath { get; set; } = string.Empty;

    [JsonPropertyName("summaryPath")]
    public string SummaryPath { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("importedAt")]
    public string ImportedAt { get; set; } = string.Empty;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;

    [JsonPropertyName("sites")]
    public List<PublishRunSiteSummary> Sites { get; set; } = new();

    [JsonPropertyName("pageCount")]
    public int PageCount { get; set; } = 0;

    [JsonPropertyName("fileCount")]
    public int FileCount { get; set; } = 0;

    [JsonPropertyName("redirectCount")]
    public int RedirectCount { get; set; } = 0;

    [JsonPropertyName("pageQualityWarningCount")]
    public int PageQualityWarningCount { get; set; } = 0;

    [JsonPropertyName("contentWarningCount")]
    public int ContentWarningCount { get; set; } = 0;

    [JsonPropertyName("readyForManualUpload")]
    public bool ReadyForManualUpload { get; set; } = false;

    [JsonPropertyName("errors")]
    public List<string> Errors { get; set; } = new();

    [JsonPropertyName("warnings")]
    public List<string> Warnings { get; set; } = new();

    [JsonPropertyName("manifestSummary")]
    public PublishRunManifestSummary ManifestSummary { get; set; } = new();

    [JsonPropertyName("deploymentTarget")]
    public string DeploymentTarget { get; set; } = "none";

    [JsonPropertyName("deployedAt")]
    public string DeployedAt { get; set; } = string.Empty;

    [JsonPropertyName("deploymentStatus")]
    public string DeploymentStatus { get; set; } = "not_deployed";
}

public class PublishRunSiteSummary
{
    [JsonPropertyName("siteKey")]
    public string SiteKey { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("domain")]
    public string Domain { get; set; } = string.Empty;

    [JsonPropertyName("uploadRoot")]
    public string UploadRoot { get; set; } = string.Empty;

    [JsonPropertyName("fileCount")]
    public int FileCount { get; set; } = 0;

    [JsonPropertyName("redirectCount")]
    public int RedirectCount { get; set; } = 0;

    [JsonPropertyName("pageQualityWarningCount")]
    public int PageQualityWarningCount { get; set; } = 0;

    [JsonPropertyName("contentWarningCount")]
    public int ContentWarningCount { get; set; } = 0;

    [JsonPropertyName("readyForManualUpload")]
    public bool ReadyForManualUpload { get; set; } = false;

    [JsonPropertyName("sourceValidationOk")]
    public bool? SourceValidationOk { get; set; }

    [JsonPropertyName("releaseValidationOk")]
    public bool? ReleaseValidationOk { get; set; }

    [JsonPropertyName("canonicalOk")]
    public bool? CanonicalOk { get; set; }

    [JsonPropertyName("secretScanOk")]
    public bool? SecretScanOk { get; set; }

    [JsonPropertyName("warnings")]
    public List<string> Warnings { get; set; } = new();

    [JsonPropertyName("errors")]
    public List<string> Errors { get; set; } = new();
}

public class PublishRunManifestSummary
{
    [JsonPropertyName("runId")]
    public string RunId { get; set; } = string.Empty;

    [JsonPropertyName("generatedAt")]
    public string GeneratedAt { get; set; } = string.Empty;

    [JsonPropertyName("releaseFolder")]
    public string ReleaseFolder { get; set; } = string.Empty;

    [JsonPropertyName("contentSource")]
    public string ContentSource { get; set; } = "unknown";

    [JsonPropertyName("deploymentAttempted")]
    public bool DeploymentAttempted { get; set; } = false;

    [JsonPropertyName("cloudflareModified")]
    public bool CloudflareModified { get; set; } = false;

    [JsonPropertyName("siteCount")]
    public int SiteCount { get; set; } = 0;

    [JsonPropertyName("ok")]
    public bool? Ok { get; set; }
}
