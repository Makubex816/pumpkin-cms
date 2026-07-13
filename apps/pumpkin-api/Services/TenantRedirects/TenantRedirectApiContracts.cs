using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public sealed class TenantRedirectUpsertRequest
{
    [JsonPropertyName("sourcePath")]
    public string SourcePath { get; set; } = string.Empty;

    [JsonPropertyName("target")]
    public string Target { get; set; } = string.Empty;

    [JsonPropertyName("targetKind")]
    public string TargetKind { get; set; } = "internal";

    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; } = 301;

    [JsonPropertyName("active")]
    public bool Active { get; set; } = true;

    [JsonPropertyName("preserveQueryString")]
    public bool PreserveQueryString { get; set; } = true;

    [JsonPropertyName("targetStatus")]
    public string TargetStatus { get; set; } = "resolved";

    [JsonPropertyName("pageShadowMode")]
    public string PageShadowMode { get; set; } = "none";

    [JsonPropertyName("sourcePackagePath")]
    public string SourcePackagePath { get; set; } = string.Empty;

    [JsonPropertyName("sourceDeclaration")]
    public string SourceDeclaration { get; set; } = string.Empty;

    [JsonPropertyName("importCorrelationId")]
    public string ImportCorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("auditCorrelationId")]
    public string AuditCorrelationId { get; set; } = string.Empty;
}

public sealed class TenantRedirectListResponse
{
    [JsonPropertyName("redirects")]
    public List<TenantRedirect> Redirects { get; set; } = new();

    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("includeInactive")]
    public bool IncludeInactive { get; set; }
}

public sealed class TenantRedirectValidationResponse
{
    [JsonPropertyName("valid")]
    public bool Valid { get; set; }

    [JsonPropertyName("persistable")]
    public bool Persistable { get; set; }

    [JsonPropertyName("normalizedSourcePath")]
    public string NormalizedSourcePath { get; set; } = string.Empty;

    [JsonPropertyName("normalizedTarget")]
    public string NormalizedTarget { get; set; } = string.Empty;

    [JsonPropertyName("targetKind")]
    public string TargetKind { get; set; } = string.Empty;

    [JsonPropertyName("targetResolutionStatus")]
    public string TargetResolutionStatus { get; set; } = "unresolved";

    [JsonPropertyName("targetExists")]
    public bool TargetExists { get; set; }

    [JsonPropertyName("routePrecedence")]
    public string RoutePrecedence { get; set; } = "redirect_before_page";

    [JsonPropertyName("shadowedPageId")]
    public string ShadowedPageId { get; set; } = string.Empty;

    [JsonPropertyName("shadowedPageSlug")]
    public string ShadowedPageSlug { get; set; } = string.Empty;

    [JsonPropertyName("idempotentMatchId")]
    public string IdempotentMatchId { get; set; } = string.Empty;

    [JsonPropertyName("errors")]
    public List<TenantRedirectValidationIssue> Errors { get; set; } = new();

    [JsonPropertyName("warnings")]
    public List<TenantRedirectValidationIssue> Warnings { get; set; } = new();

    [JsonPropertyName("cycles")]
    public List<List<string>> Cycles { get; set; } = new();
}

public sealed class TenantRedirectValidationIssue
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

public sealed class TenantRedirectMutationResponse
{
    [JsonPropertyName("redirect")]
    public TenantRedirect Redirect { get; set; } = new();

    [JsonPropertyName("validation")]
    public TenantRedirectValidationResponse Validation { get; set; } = new();

    [JsonPropertyName("idempotentReplay")]
    public bool IdempotentReplay { get; set; }
}

public sealed class TenantRedirectRuntimeResponse
{
    [JsonPropertyName("matched")]
    public bool Matched { get; set; } = true;

    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;

    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("preserveQueryString")]
    public bool PreserveQueryString { get; set; }
}

public sealed class TenantRedirectBackupEnvelope
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = TenantRedirectBackupContract.SchemaVersion;

    [JsonPropertyName("kind")]
    public string Kind { get; set; } = TenantRedirectBackupContract.Kind;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("exportedAt")]
    public DateTime ExportedAt { get; set; }

    [JsonPropertyName("redirects")]
    public List<TenantRedirect> Redirects { get; set; } = new();
}

public sealed class TenantRedirectBackupValidationResult
{
    [JsonPropertyName("valid")]
    public bool Valid { get; set; }

    [JsonPropertyName("errors")]
    public List<string> Errors { get; set; } = new();
}
