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
    public string SchemaVersion { get; set; } = "1.1.0";

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "draft";

    [JsonPropertyName("indexingState")]
    public string IndexingState { get; set; } = "disabled";

    [JsonPropertyName("indexingMode")]
    public string IndexingMode { get; set; } = PublicationProductModes.HeldNoIndex;

    [JsonPropertyName("formMode")]
    public string FormMode { get; set; } = PublicationProductModes.PreviewNoPost;

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

    [JsonPropertyName("ticketIssuer")]
    public string TicketIssuer { get; set; } = string.Empty;

    [JsonPropertyName("ticketAudience")]
    public string TicketAudience { get; set; } = string.Empty;

    [JsonPropertyName("signingMetadataVersion")]
    public long SigningMetadataVersion { get; set; } = 1;

    [JsonPropertyName("signingMetadataUpdatedAtUtc")]
    public DateTimeOffset? SigningMetadataUpdatedAtUtc { get; set; }

    [JsonPropertyName("ticketVersion")]
    public int TicketVersion { get; set; } = 1;

    /// <summary>
    /// Incremented before a restored publication can issue tickets again.
    /// Tickets and FormEntries bind to this value so pre-restore tickets cannot
    /// be replayed against restored authority.
    /// </summary>
    [JsonPropertyName("replayProtectionVersion")]
    public long ReplayProtectionVersion { get; set; } = 1;

    [JsonPropertyName("productRegistryEnabled")]
    public bool ProductRegistryEnabled { get; set; }

    [JsonPropertyName("customerExecutionEnabled")]
    public bool CustomerExecutionEnabled { get; set; }

    [JsonPropertyName("productRollbackReleaseId")]
    public string ProductRollbackReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("productRollbackArtifactId")]
    public string ProductRollbackArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("productReleases")]
    public List<PublicationProductRelease> ProductReleases { get; set; } = new();

    [JsonPropertyName("publicationArtifacts")]
    public List<TenantPublicationArtifact> PublicationArtifacts { get; set; } = new();

    [JsonPropertyName("publicationJobs")]
    public List<PublicationProductJob> PublicationJobs { get; set; } = new();

    [JsonPropertyName("productAuditEvents")]
    public List<PublicationProductAuditEvent> ProductAuditEvents { get; set; } = new();

    [JsonPropertyName("productMetadata")]
    public PublicationProductMetadata ProductMetadata { get; set; } = new();

    [JsonPropertyName("publicFormRatePolicy")]
    public PublicFormRatePolicy PublicFormRatePolicy { get; set; } = new();

    [JsonPropertyName("publicFormAbuseState")]
    public PublicFormAbuseState PublicFormAbuseState { get; set; } = new();

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

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicPublicationFormMapping
{
    [JsonPropertyName("formMappingId")]
    public string FormMappingId { get; set; } = string.Empty;

    [JsonPropertyName("formDefinitionId")]
    public string FormDefinitionId { get; set; } = string.Empty;

    [JsonPropertyName("active")]
    public bool Active { get; set; } = true;

    [JsonPropertyName("enabledForPublication")]
    public bool EnabledForPublication { get; set; } = true;

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

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicFormRatePolicy
{
    [JsonPropertyName("policyVersion")]
    public string PolicyVersion { get; set; } = "public-form-rate-v1";

    [JsonPropertyName("preflightPermitLimit")]
    public int PreflightPermitLimit { get; set; } = 30;

    [JsonPropertyName("submitPermitLimit")]
    public int SubmitPermitLimit { get; set; } = 10;

    [JsonPropertyName("windowSeconds")]
    public int WindowSeconds { get; set; } = 60;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicFormAbuseState
{
    [JsonPropertyName("state")]
    public string State { get; set; } = "NORMAL";

    [JsonPropertyName("reasonReference")]
    public string ReasonReference { get; set; } = string.Empty;

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset? UpdatedAtUtc { get; set; }
}

public enum PublicFormEntryCreateStatus
{
    Created,
    Replay,
    Conflict
}

public sealed record PublicFormEntryCreateResult(PublicFormEntryCreateStatus Status, FormEntry? Entry);
