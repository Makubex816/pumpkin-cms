using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

/// <summary>
/// Immutable release-to-form authority used by anonymous public form endpoints.
/// Signing key material is deliberately not part of this record.
/// </summary>
public sealed class PublicPublication
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; set; } = string.Empty;

    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = "1.0.0";

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "draft";

    [JsonPropertyName("indexingState")]
    public string IndexingState { get; set; } = "disabled";

    [JsonPropertyName("activeFromUtc")]
    public DateTimeOffset? ActiveFromUtc { get; set; }

    [JsonPropertyName("activeUntilUtc")]
    public DateTimeOffset? ActiveUntilUtc { get; set; }

    [JsonPropertyName("allowedOrigins")]
    public List<string> AllowedOrigins { get; set; } = new();

    [JsonPropertyName("allowedHostnames")]
    public List<string> AllowedHostnames { get; set; } = new();

    [JsonPropertyName("formMappings")]
    public List<PublicPublicationFormMapping> FormMappings { get; set; } = new();

    [JsonPropertyName("ticketKeyId")]
    public string TicketKeyId { get; set; } = string.Empty;

    [JsonPropertyName("ticketTtlSeconds")]
    public int TicketTtlSeconds { get; set; } = 120;

    [JsonPropertyName("revision")]
    public long Revision { get; set; } = 1;

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; }

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; }

    [JsonPropertyName("updatedBy")]
    public string UpdatedBy { get; set; } = string.Empty;

    [JsonPropertyName("activatedAtUtc")]
    public DateTimeOffset? ActivatedAtUtc { get; set; }

    [JsonPropertyName("activatedBy")]
    public string ActivatedBy { get; set; } = string.Empty;

    [JsonPropertyName("revokedAtUtc")]
    public DateTimeOffset? RevokedAtUtc { get; set; }

    [JsonPropertyName("revokedBy")]
    public string RevokedBy { get; set; } = string.Empty;

    [JsonPropertyName("_etag")]
    public string ETag { get; set; } = string.Empty;
}

public sealed class PublicPublicationFormMapping
{
    [JsonPropertyName("formMappingId")]
    public string FormMappingId { get; set; } = string.Empty;

    [JsonPropertyName("formDefinitionId")]
    public string FormDefinitionId { get; set; } = string.Empty;

    [JsonPropertyName("active")]
    public bool Active { get; set; } = true;

    [JsonPropertyName("submitMode")]
    public string SubmitMode { get; set; } = "public-ticket";

    [JsonPropertyName("fieldContractVersion")]
    public string FieldContractVersion { get; set; } = string.Empty;

    [JsonPropertyName("formKey")]
    public string FormKey { get; set; } = string.Empty;

    [JsonPropertyName("siteKey")]
    public string SiteKey { get; set; } = string.Empty;

    [JsonPropertyName("pageSlug")]
    public string PageSlug { get; set; } = string.Empty;
}

public enum PublicFormEntryCreateStatus
{
    Created,
    Replay,
    Conflict
}

public sealed record PublicFormEntryCreateResult(PublicFormEntryCreateStatus Status, FormEntry? Entry);
