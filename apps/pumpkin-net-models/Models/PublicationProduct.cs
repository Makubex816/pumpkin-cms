using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

/// <summary>
/// Immutable artifact identity accepted into the publication product registry.
/// Credential values and deployment tokens are deliberately not representable.
/// </summary>
public sealed class PublicationProductRelease
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = "pub-30-a01-release-v1";

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; set; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; set; } = string.Empty;

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

    [JsonPropertyName("status")]
    public string Status { get; set; } = PublicationProductStates.Draft;

    [JsonPropertyName("hostingClass")]
    public string HostingClass { get; set; } = "unassigned";

    [JsonPropertyName("immutable")]
    public bool Immutable { get; set; }

    [JsonPropertyName("supersedesReleaseId")]
    public string SupersedesReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("supersededByReleaseId")]
    public string SupersededByReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("replayProtectionVersion")]
    public long ReplayProtectionVersion { get; set; } = 1;

    [JsonPropertyName("revision")]
    public long Revision { get; set; } = 1;

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; }

    [JsonPropertyName("createdByReference")]
    public string CreatedByReference { get; set; } = string.Empty;

    [JsonPropertyName("acceptedAtUtc")]
    public DateTimeOffset? AcceptedAtUtc { get; set; }

    [JsonPropertyName("acceptedByReference")]
    public string AcceptedByReference { get; set; } = string.Empty;

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; }
}

public sealed class PublicationReleaseTestEvidence
{
    [JsonPropertyName("suiteId")]
    public string SuiteId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("evidenceSha256")]
    public string EvidenceSha256 { get; set; } = string.Empty;
}

/// <summary>
/// Immutable tenant-specific artifact accepted into a publication registry.
/// It contains identity and inventory metadata only, never files or payloads.
/// </summary>
public sealed class TenantPublicationArtifact
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = "pumpkin.tenant-publication-artifact.v1";

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; set; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; set; } = string.Empty;

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

    [JsonPropertyName("status")]
    public string Status { get; set; } = PublicationProductStates.Accepted;

    [JsonPropertyName("immutable")]
    public bool Immutable { get; set; }

    [JsonPropertyName("supersededByArtifactId")]
    public string SupersededByArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("recordSha256")]
    public string RecordSha256 { get; set; } = string.Empty;

    [JsonPropertyName("revision")]
    public long Revision { get; set; } = 1;

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; }

    [JsonPropertyName("acceptedAtUtc")]
    public DateTimeOffset? AcceptedAtUtc { get; set; }

    [JsonPropertyName("acceptedByReference")]
    public string AcceptedByReference { get; set; } = string.Empty;

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; }
}

public sealed class PublicationProductJob
{
    [JsonPropertyName("schemaVersion")]
    public string SchemaVersion { get; set; } = "pub-30-a01-job-v1";

    [JsonPropertyName("jobId")]
    public string JobId { get; set; } = string.Empty;

    [JsonPropertyName("tenantUid")]
    public string TenantUid { get; set; } = string.Empty;

    [JsonPropertyName("publicationId")]
    public string PublicationId { get; set; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("kind")]
    public string Kind { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = PublicationProductStates.Pending;

    [JsonPropertyName("currentStep")]
    public string CurrentStep { get; set; } = string.Empty;

    [JsonPropertyName("steps")]
    public List<PublicationProductJobStep> Steps { get; set; } = new();

    [JsonPropertyName("idempotencyKeyHash")]
    public string IdempotencyKeyHash { get; set; } = string.Empty;

    [JsonPropertyName("deterministicPlanSha256")]
    public string DeterministicPlanSha256 { get; set; } = string.Empty;

    [JsonPropertyName("attempt")]
    public int Attempt { get; set; } = 1;

    [JsonPropertyName("revision")]
    public long Revision { get; set; } = 1;

    [JsonPropertyName("createdAtUtc")]
    public DateTimeOffset CreatedAtUtc { get; set; }

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset UpdatedAtUtc { get; set; }

    [JsonPropertyName("completedAtUtc")]
    public DateTimeOffset? CompletedAtUtc { get; set; }

    [JsonPropertyName("rollbackReleaseId")]
    public string RollbackReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("rollbackArtifactId")]
    public string RollbackArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("lastErrorCode")]
    public string LastErrorCode { get; set; } = string.Empty;
}

public sealed class PublicationProductJobStep
{
    [JsonPropertyName("stepId")]
    public string StepId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = PublicationProductStates.Pending;

    [JsonPropertyName("attempt")]
    public int Attempt { get; set; }

    [JsonPropertyName("startedAtUtc")]
    public DateTimeOffset? StartedAtUtc { get; set; }

    [JsonPropertyName("completedAtUtc")]
    public DateTimeOffset? CompletedAtUtc { get; set; }

    [JsonPropertyName("resultCode")]
    public string ResultCode { get; set; } = string.Empty;
}

/// <summary>
/// Redacted lifecycle audit event. Actor and reason are one-way references;
/// arbitrary request text is never retained.
/// </summary>
public sealed class PublicationProductAuditEvent
{
    [JsonPropertyName("eventId")]
    public string EventId { get; set; } = string.Empty;

    [JsonPropertyName("eventType")]
    public string EventType { get; set; } = string.Empty;

    [JsonPropertyName("actorReference")]
    public string ActorReference { get; set; } = string.Empty;

    [JsonPropertyName("actorType")]
    public string ActorType { get; set; } = "SYSTEM";

    [JsonPropertyName("reasonReference")]
    public string ReasonReference { get; set; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactId")]
    public string ArtifactId { get; set; } = string.Empty;

    [JsonPropertyName("jobId")]
    public string JobId { get; set; } = string.Empty;

    [JsonPropertyName("result")]
    public string Result { get; set; } = string.Empty;

    [JsonPropertyName("occurredAtUtc")]
    public DateTimeOffset OccurredAtUtc { get; set; }
}

/// <summary>
/// Non-secret display/readiness projection persisted with the publication.
/// This avoids live resource discovery from an authenticated inventory read.
/// </summary>
public sealed class PublicationProductMetadata
{
    [JsonPropertyName("tenantDisplayName")]
    public string TenantDisplayName { get; set; } = string.Empty;

    [JsonPropertyName("defaultHostname")]
    public string DefaultHostname { get; set; } = string.Empty;

    [JsonPropertyName("domainStage")]
    public string DomainStage { get; set; } = "not_configured";

    [JsonPropertyName("formReadiness")]
    public string FormReadiness { get; set; } = "preview_no_post";

    [JsonPropertyName("routeCount")]
    public int RouteCount { get; set; }

    [JsonPropertyName("redirectCount")]
    public int RedirectCount { get; set; }

    [JsonPropertyName("mediaCount")]
    public int MediaCount { get; set; }

    [JsonPropertyName("formCount")]
    public int FormCount { get; set; }

    [JsonPropertyName("compatibilityHolds")]
    public List<string> CompatibilityHolds { get; set; } = new();

    [JsonPropertyName("frontendResourceBinding")]
    public PublicationFrontendResourceBinding FrontendResourceBinding { get; set; } = new();

    [JsonPropertyName("originBindings")]
    public List<PublicationOriginBinding> OriginBindings { get; set; } = new();

    [JsonPropertyName("domainReadiness")]
    public PublicationDomainReadiness DomainReadiness { get; set; } = new();
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicationFrontendResourceBinding
{
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    [JsonPropertyName("resourceKind")]
    public string ResourceKind { get; set; } = string.Empty;

    [JsonPropertyName("resourceReference")]
    public string ResourceReference { get; set; } = string.Empty;

    [JsonPropertyName("defaultHostname")]
    public string DefaultHostname { get; set; } = string.Empty;

    [JsonPropertyName("state")]
    public string State { get; set; } = "UNBOUND";

    [JsonPropertyName("credentialReferenceId")]
    public string CredentialReferenceId { get; set; } = string.Empty;

    [JsonPropertyName("updatedAtUtc")]
    public DateTimeOffset? UpdatedAtUtc { get; set; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicationOriginBinding
{
    [JsonPropertyName("origin")]
    public string Origin { get; set; } = string.Empty;

    [JsonPropertyName("hostname")]
    public string Hostname { get; set; } = string.Empty;

    [JsonPropertyName("state")]
    public string State { get; set; } = "HELD";

    [JsonPropertyName("revision")]
    public long Revision { get; set; } = 1;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicationDomainReadiness
{
    [JsonPropertyName("stage")]
    public string Stage { get; set; } = "HELD";

    [JsonPropertyName("hostname")]
    public string Hostname { get; set; } = string.Empty;

    [JsonPropertyName("dnsState")]
    public string DnsState { get; set; } = "NOT_REQUESTED";

    [JsonPropertyName("tlsState")]
    public string TlsState { get; set; } = "NOT_REQUESTED";

    [JsonPropertyName("ownerApprovalRequired")]
    public bool OwnerApprovalRequired { get; set; } = true;

    [JsonPropertyName("mutationAllowed")]
    public bool MutationAllowed { get; set; }
}

public static class PublicationProductStates
{
    public const string Draft = "draft";
    public const string Active = "active";
    public const string Accepted = "accepted";
    public const string Superseded = "superseded";
    public const string Revoked = "revoked";
    public const string Pending = "pending";
    public const string Running = "running";
    public const string Completed = "completed";
    public const string Failed = "failed";
    public const string RolledBack = "rolled_back";
    public const string Planned = "planned";
    public const string Building = "building";
    public const string Ready = "ready";
    public const string Deploying = "deploying";
    public const string Archived = "archived";
    public const string Blocked = "blocked";
    public const string Partial = "partial";
    public const string RollingBack = "rolling_back";
    public const string RollbackFailed = "rollback_failed";
    public const string Cancelled = "cancelled";
    public const string Skipped = "skipped";
}

public static class PublicationProductModes
{
    public const string HeldNoIndex = "HELD_NOINDEX";
    public const string PublicNoIndex = "PUBLIC_NOINDEX";
    public const string IndexableOwnerApprovalRequired = "PUBLIC_INDEXABLE_OWNER_APPROVAL_REQUIRED";
    public const string PreviewNoPost = "PREVIEW_NO_POST";
    public const string PublicFormsLive = "PUBLIC_FORMS_LIVE";
}
