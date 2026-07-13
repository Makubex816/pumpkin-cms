using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public sealed class TenantRedirect
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

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

    [JsonPropertyName("routePrecedence")]
    public string RoutePrecedence { get; set; } = "redirect_before_page";

    [JsonPropertyName("pageShadowMode")]
    public string PageShadowMode { get; set; } = "none";

    [JsonPropertyName("shadowedPageId")]
    public string ShadowedPageId { get; set; } = string.Empty;

    [JsonPropertyName("shadowedPageSlug")]
    public string ShadowedPageSlug { get; set; } = string.Empty;

    [JsonPropertyName("sourcePackagePath")]
    public string SourcePackagePath { get; set; } = string.Empty;

    [JsonPropertyName("sourceDeclaration")]
    public string SourceDeclaration { get; set; } = string.Empty;

    [JsonPropertyName("importCorrelationId")]
    public string ImportCorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("auditCorrelationId")]
    public string AuditCorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("deletedAt")]
    public DateTime? DeletedAt { get; set; }

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("updatedBy")]
    public string UpdatedBy { get; set; } = string.Empty;

    [JsonPropertyName("auditEvents")]
    public List<TenantRedirectAuditEvent> AuditEvents { get; set; } = new();
}

public sealed class TenantRedirectAuditEvent
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("at")]
    public DateTime At { get; set; }

    [JsonPropertyName("actor")]
    public string Actor { get; set; } = string.Empty;

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;
}
