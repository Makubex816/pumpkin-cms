using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Publications;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class RegisterPublicationReleaseRequest
{
    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("manifestSha256")]
    public string ManifestSha256 { get; set; } = string.Empty;

    [JsonPropertyName("sourceCommit")]
    public string SourceCommit { get; set; } = string.Empty;

    [JsonPropertyName("sourceRef")]
    public string SourceRef { get; set; } = string.Empty;

    [JsonPropertyName("lockfileSha256")]
    public string LockfileSha256 { get; set; } = string.Empty;

    [JsonPropertyName("packageLockSha256")]
    public string PackageLockSha256 { get; set; } = string.Empty;

    [JsonPropertyName("packageVersions")]
    public Dictionary<string, string> PackageVersions { get; set; } = new(StringComparer.Ordinal);

    [JsonPropertyName("testEvidence")]
    public List<PublicationReleaseTestEvidence> TestEvidence { get; set; } = new();

    [JsonPropertyName("licensingStatus")]
    public string LicensingStatus { get; set; } = "not_recorded";

    [JsonPropertyName("noticeStatus")]
    public string NoticeStatus { get; set; } = "not_recorded";

    [JsonPropertyName("starterArtifactSha256")]
    public string StarterArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("starterImageDigest")]
    public string StarterImageDigest { get; set; } = string.Empty;

    [JsonPropertyName("hostingClass")]
    public string HostingClass { get; set; } = string.Empty;

    [JsonPropertyName("supersedesReleaseId")]
    public string SupersedesReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreatePublicationJobRequest
{
    [JsonPropertyName("jobId")]
    public string JobId { get; set; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("rollbackReleaseId")]
    public string RollbackReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("rollbackArtifactId")]
    public string RollbackArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("kind")]
    public string Kind { get; set; } = string.Empty;

    [JsonPropertyName("steps")]
    public List<string> Steps { get; set; } = new();

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class RegisterTenantPublicationArtifactRequest
{
    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("sourceSnapshotSha256")]
    public string SourceSnapshotSha256 { get; set; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("manifestSha256")]
    public string ManifestSha256 { get; set; } = string.Empty;

    [JsonPropertyName("hostingClass")]
    public string HostingClass { get; set; } = string.Empty;

    [JsonPropertyName("indexingMode")]
    public string IndexingMode { get; set; } = PublicationProductModes.HeldNoIndex;

    [JsonPropertyName("formMode")]
    public string FormMode { get; set; } = PublicationProductModes.PreviewNoPost;

    [JsonPropertyName("routeCount")]
    public int RouteCount { get; set; }

    [JsonPropertyName("redirectCount")]
    public int RedirectCount { get; set; }

    [JsonPropertyName("mediaCount")]
    public int MediaCount { get; set; }

    [JsonPropertyName("formCount")]
    public int FormCount { get; set; }

    [JsonPropertyName("predecessorArtifactId")]
    public string PredecessorArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("predecessorPublicationId")]
    public string PredecessorPublicationId { get; set; } = string.Empty;

    [JsonPropertyName("predecessorArtifactSha256")]
    public string PredecessorArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("rollbackArtifactId")]
    public string RollbackArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class SupersedePublicationArtifactRequest
{
    [JsonPropertyName("successorArtifactId")]
    public string SuccessorArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicationJobActionRequest
{
    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;

    [JsonPropertyName("rollbackReleaseId")]
    public string RollbackReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("rollbackArtifactId")]
    public string RollbackArtifactId { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PromotePublicationJobRequest
{
    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicationLifecycleActionRequest
{
    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class UpdatePublicationFormAuthorityRequest
{
    [JsonPropertyName("allowedOrigins")]
    public List<string> AllowedOrigins { get; set; } = new();

    [JsonPropertyName("formMappings")]
    public List<PublicPublicationFormMapping> FormMappings { get; set; } = new();

    [JsonPropertyName("ticketKeyId")]
    public string TicketKeyId { get; set; } = string.Empty;

    [JsonPropertyName("ticketIssuer")]
    public string TicketIssuer { get; set; } = string.Empty;

    [JsonPropertyName("ticketAudience")]
    public string TicketAudience { get; set; } = string.Empty;

    [JsonPropertyName("signingMetadataVersion")]
    public long SigningMetadataVersion { get; set; }

    [JsonPropertyName("ticketVersion")]
    public int TicketVersion { get; set; }

    [JsonPropertyName("ratePolicy")]
    public PublicFormRatePolicy RatePolicy { get; set; } = new();

    [JsonPropertyName("abuseState")]
    public string AbuseState { get; set; } = "NORMAL";

    [JsonPropertyName("abuseReasonSha256")]
    public string AbuseReasonSha256 { get; set; } = string.Empty;

    [JsonPropertyName("frontendResourceBinding")]
    public PublicationFrontendResourceBinding FrontendResourceBinding { get; set; } = new();

    [JsonPropertyName("domainReadiness")]
    public PublicationDomainReadiness DomainReadiness { get; set; } = new();

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class SupersedePublicationReleaseRequest
{
    [JsonPropertyName("successorReleaseId")]
    public string SuccessorReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

public sealed class PublicationProductPage<T>
{
    [JsonPropertyName("items")]
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();

    [JsonPropertyName("continuationToken")]
    public string ContinuationToken { get; init; } = string.Empty;

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; init; }
}

public sealed class PublicationTenantSummary
{
    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("publicationCount")]
    public int PublicationCount { get; init; }

    [JsonPropertyName("releaseCount")]
    public int ReleaseCount { get; init; }

    [JsonPropertyName("artifactCount")]
    public int ArtifactCount { get; init; }

    [JsonPropertyName("activePublicationCount")]
    public int ActivePublicationCount { get; init; }

    [JsonPropertyName("acceptedReleaseCount")]
    public int AcceptedReleaseCount { get; init; }

    [JsonPropertyName("runningJobCount")]
    public int RunningJobCount { get; init; }

    [JsonPropertyName("latestPublication")]
    public PublicPublication? LatestPublication { get; init; }

    [JsonPropertyName("latestRelease")]
    public PublicationProductRelease? LatestRelease { get; init; }

    [JsonPropertyName("customerExecutionEnabled")]
    public bool CustomerExecutionEnabled { get; init; }
}

public sealed record PublicationReleaseActionResponse(
    [property: JsonPropertyName("release")] PublicationProductRelease Release,
    [property: JsonPropertyName("publicationRevision")] long PublicationRevision,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationArtifactActionResponse(
    [property: JsonPropertyName("artifact")] TenantPublicationArtifact Artifact,
    [property: JsonPropertyName("publicationRevision")] long PublicationRevision,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationArtifactSupersessionResponse(
    [property: JsonPropertyName("artifact")] TenantPublicationArtifact Artifact,
    [property: JsonPropertyName("successorArtifact")] TenantPublicationArtifact SuccessorArtifact,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationJobActionResponse(
    [property: JsonPropertyName("job")] PublicationProductJob Job,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationRollbackActionResponse(
    [property: JsonPropertyName("job")] PublicationProductJob Job,
    [property: JsonPropertyName("publication")] PublicPublication Publication,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationPromotionActionResponse(
    [property: JsonPropertyName("job")] PublicationProductJob Job,
    [property: JsonPropertyName("publication")] PublicPublication Publication,
    [property: JsonPropertyName("predecessorReleaseId")] string PredecessorReleaseId,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationLifecycleActionResponse(
    [property: JsonPropertyName("publication")] PublicPublication Publication,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed record PublicationSupersessionActionResponse(
    [property: JsonPropertyName("release")] PublicationProductRelease Release,
    [property: JsonPropertyName("successorRelease")] PublicationProductRelease SuccessorRelease,
    [property: JsonPropertyName("idempotentReplay")] bool IdempotentReplay);

public sealed class PublicationProductError
{
    [JsonPropertyName("errorCode")]
    public string ErrorCode { get; init; } = string.Empty;

    [JsonPropertyName("requestId")]
    public string RequestId { get; init; } = string.Empty;

    [JsonPropertyName("retryable")]
    public bool Retryable { get; init; }
}

public enum PublicationProductResultStatus
{
    Success,
    Created,
    NotFound,
    Invalid,
    Forbidden,
    Conflict,
    Disabled,
    ExecutionHeld
}

public sealed record PublicationProductResult<T>(
    PublicationProductResultStatus Status,
    T? Value = default,
    string ErrorCode = "");

public sealed class PublicationProductBackupEnvelope
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; init; } = "pumpkin.publication-product-backup.v1";

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; init; } = string.Empty;

    [JsonPropertyName("snapshot")]
    public PublicPublication Snapshot { get; init; } = new();

    [JsonPropertyName("snapshotSha256")]
    public string SnapshotSha256 { get; init; } = string.Empty;

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; init; }

    [JsonPropertyName("valuesIncluded")]
    public bool ValuesIncluded { get; init; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class RestorePublicationProductRequest
{
    [JsonPropertyName("backup")]
    public PublicationProductBackupEnvelope Backup { get; set; } = new();

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("expectedRevision")]
    public long ExpectedRevision { get; set; }

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

public sealed class PublicationProductInventoryItem
{
    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; init; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("releaseStatus")]
    public string ReleaseStatus { get; init; } = string.Empty;

    [JsonPropertyName("hostingClass")]
    public string HostingClass { get; init; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; init; } = string.Empty;

    [JsonPropertyName("revision")]
    public long Revision { get; init; }

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; init; }
}

public sealed class PublicationProductCenterSnapshot
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; init; } = "pub-30-a01-ui-v1";

    [JsonPropertyName("generatedAt")]
    public DateTimeOffset GeneratedAt { get; init; }

    [JsonPropertyName("authorizationScope")]
    public string AuthorizationScope { get; init; } = string.Empty;

    [JsonPropertyName("customerExecutionEnabled")]
    public bool CustomerExecutionEnabled { get; init; }

    [JsonPropertyName("tenant")]
    public PublicationProductTenantView? Tenant { get; init; }

    [JsonPropertyName("tenants")]
    public IReadOnlyList<PublicationProductTenantView>? Tenants { get; init; }

    [JsonPropertyName("releases")]
    public IReadOnlyList<PublicationProductReleaseView> Releases { get; init; } = Array.Empty<PublicationProductReleaseView>();

    [JsonPropertyName("artifacts")]
    public IReadOnlyList<TenantPublicationArtifact> Artifacts { get; init; } = Array.Empty<TenantPublicationArtifact>();

    [JsonPropertyName("jobs")]
    public IReadOnlyList<PublicationProductJobView> Jobs { get; init; } = Array.Empty<PublicationProductJobView>();

    [JsonPropertyName("credentialReferences")]
    public IReadOnlyList<PublicationCredentialReferenceMetadata>? CredentialReferences { get; init; }
}

public sealed class PublicationProductTenantView
{
    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("tenantName")]
    public string TenantName { get; init; } = string.Empty;

    [JsonPropertyName("hostingClass")]
    public string HostingClass { get; init; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; init; } = string.Empty;

    [JsonPropertyName("publicationState")]
    public string PublicationState { get; init; } = string.Empty;

    [JsonPropertyName("publicationRevision")]
    public long PublicationRevision { get; init; }

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; init; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; init; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; init; } = string.Empty;

    [JsonPropertyName("manifestSha256")]
    public string ManifestSha256 { get; init; } = string.Empty;

    [JsonPropertyName("defaultHostname")]
    public string DefaultHostname { get; init; } = string.Empty;

    [JsonPropertyName("indexingMode")]
    public string IndexingMode { get; init; } = "HELD_NOINDEX";

    [JsonPropertyName("formMode")]
    public string FormMode { get; init; } = "PREVIEW_NO_POST";

    [JsonPropertyName("formReadiness")]
    public string FormReadiness { get; init; } = string.Empty;

    [JsonPropertyName("domainStage")]
    public string DomainStage { get; init; } = string.Empty;

    [JsonPropertyName("inventories")]
    public PublicationProductInventoryView Inventories { get; init; } = new();

    [JsonPropertyName("frontendResourceBinding")]
    public PublicationFrontendResourceBinding FrontendResourceBinding { get; init; } = new();

    [JsonPropertyName("originBindings")]
    public IReadOnlyList<PublicationOriginBinding> OriginBindings { get; init; } = Array.Empty<PublicationOriginBinding>();

    [JsonPropertyName("domainReadiness")]
    public PublicationDomainReadiness DomainReadiness { get; init; } = new();

    [JsonPropertyName("compatibilityHolds")]
    public IReadOnlyList<string> CompatibilityHolds { get; init; } = Array.Empty<string>();

    [JsonPropertyName("auditEvents")]
    public IReadOnlyList<PublicationProductAuditView> AuditEvents { get; init; } = Array.Empty<PublicationProductAuditView>();
}

public sealed class PublicationProductInventoryView
{
    [JsonPropertyName("routes")]
    public int Routes { get; init; }

    [JsonPropertyName("redirects")]
    public int Redirects { get; init; }

    [JsonPropertyName("media")]
    public int Media { get; init; }

    [JsonPropertyName("forms")]
    public int Forms { get; init; }
}

public sealed class PublicationProductAuditView
{
    [JsonPropertyName("eventId")]
    public string EventId { get; init; } = string.Empty;

    [JsonPropertyName("eventType")]
    public string EventType { get; init; } = string.Empty;

    [JsonPropertyName("occurredAt")]
    public DateTimeOffset OccurredAt { get; init; }

    [JsonPropertyName("actorType")]
    public string ActorType { get; init; } = "SYSTEM";

    [JsonPropertyName("outcome")]
    public string Outcome { get; init; } = string.Empty;

    [JsonPropertyName("detail")]
    public string Detail { get; init; } = string.Empty;
}

public sealed class PublicationProductReleaseView
{
    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; init; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; init; } = string.Empty;

    [JsonPropertyName("version")]
    public string Version { get; init; } = string.Empty;

    [JsonPropertyName("sourceCommit")]
    public string SourceCommit { get; init; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("acceptedAt")]
    public DateTimeOffset? AcceptedAt { get; init; }

    [JsonPropertyName("supersededByReleaseId")]
    public string SupersededByReleaseId { get; init; } = string.Empty;

    [JsonPropertyName("packageLockSha256")]
    public string PackageLockSha256 { get; init; } = string.Empty;

    [JsonPropertyName("lockfileSha256")]
    public string LockfileSha256 { get; init; } = string.Empty;

    [JsonPropertyName("licensingStatus")]
    public string LicensingStatus { get; init; } = string.Empty;

    [JsonPropertyName("noticeStatus")]
    public string NoticeStatus { get; init; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; init; } = string.Empty;
}

public sealed class PublicationProductJobView
{
    [JsonPropertyName("jobId")]
    public string JobId { get; init; } = string.Empty;

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; init; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; init; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; init; } = string.Empty;

    [JsonPropertyName("state")]
    public string State { get; init; } = string.Empty;

    [JsonPropertyName("completedSteps")]
    public int CompletedSteps { get; init; }

    [JsonPropertyName("totalSteps")]
    public int TotalSteps { get; init; }

    [JsonPropertyName("nextStep")]
    public string NextStep { get; init; } = string.Empty;

    [JsonPropertyName("deterministicPlanSha256")]
    public string DeterministicPlanSha256 { get; init; } = string.Empty;

    [JsonPropertyName("canResume")]
    public bool CanResume { get; init; }

    [JsonPropertyName("canRollback")]
    public bool CanRollback { get; init; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class PublicationCredentialReferenceMetadata
{
    [JsonPropertyName("referenceId")]
    public string ReferenceId { get; set; } = string.Empty;

    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "UNAVAILABLE";

    [JsonPropertyName("fingerprintSha256")]
    public string FingerprintSha256 { get; set; } = string.Empty;

    [JsonPropertyName("aclStatus")]
    public string AclStatus { get; set; } = string.Empty;

    [JsonPropertyName("portability")]
    public string Portability { get; set; } = string.Empty;

    [JsonPropertyName("lastVerifiedAt")]
    public DateTimeOffset? LastVerifiedAt { get; set; }
}
