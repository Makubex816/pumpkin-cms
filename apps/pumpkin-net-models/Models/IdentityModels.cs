using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public enum IdentityRecordStatus { Pending, Active, Suspended, Revoked, Completed, Failed, DeadLetter }
public enum TenantRole { TenantAdmin, Editor, Viewer }
public enum TenantRenameStatus { Preflight, Queued, Running, Completed, Failed, RollbackAvailable, RolledBack }
public enum NotificationCapability { DisabledNoProvider, Suppressed, Configured }

public abstract class IdentityRecord
{
    [JsonPropertyName("id")] public string Id { get; set; } = Guid.NewGuid().ToString("N");
    [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [JsonPropertyName("updatedAt")] public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class TenantIdentifierAlias : IdentityRecord
{
    public required string TenantUid { get; set; }
    public required string PreviousSlug { get; set; }
    public required string CanonicalSlug { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Active;
    public DateTime? ExpiresAt { get; set; }
    public bool IsPermanent { get; set; } = true;
    public string RedirectBehavior { get; set; } = "canonicalize";
    public required string AuditEventId { get; set; }
    [JsonIgnore] public string PartitionKey => TenantUid;
}

public sealed class TenantRenameJob : IdentityRecord
{
    public required string TenantUid { get; set; }
    public required string CurrentSlug { get; set; }
    public required string RequestedSlug { get; set; }
    public TenantRenameStatus Status { get; set; } = TenantRenameStatus.Preflight;
    public string? ActorUserId { get; set; }
    public string? Reason { get; set; }
    public string? IdempotencyKey { get; set; }
    public List<TenantRenameJobStep> Steps { get; set; } = [];
    public bool RollbackAvailable { get; set; }
    [JsonIgnore] public string PartitionKey => TenantUid;
}

public sealed class TenantRenameJobStep : IdentityRecord
{
    public required string JobId { get; set; }
    public required string Name { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public int Attempt { get; set; }
    public string? SafeDetail { get; set; }
}

public sealed class UserAccount : IdentityRecord
{
    public string IdentityPartition { get; set; } = "global";
    public required string UserId { get; set; }
    public required string LoginEmail { get; set; }
    public required string NormalizedEmail { get; set; }
    [JsonIgnore] public required string PasswordHash { get; set; }
    public UserRole GlobalRole { get; set; } = UserRole.Viewer;
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Active;
    public bool EmailVerified { get; set; }
    public bool ForcePasswordChange { get; set; }
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");
    public long SessionVersion { get; set; } = 1;
    public int FailedLoginCount { get; set; }
    public DateTime? LockedUntil { get; set; }
    [JsonIgnore] public string PartitionKey => IdentityPartition;
}

public sealed class TenantMembership : IdentityRecord
{
    public required string MembershipId { get; set; }
    public required string TenantUid { get; set; }
    public required string UserId { get; set; }
    public TenantRole Role { get; set; }
    public List<string> Permissions { get; set; } = [];
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Active;
    public bool IsPrimaryTenantAdmin { get; set; }
    public string? InvitationId { get; set; }
    public string? CreatedByUserId { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public string? SuspendedByUserId { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByUserId { get; set; }
    [JsonIgnore] public string PartitionKey => TenantUid;
}

public sealed class UserInvitation : IdentityRecord
{
    public required string TenantUid { get; set; }
    public required string NormalizedEmail { get; set; }
    public TenantRole Role { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public required string TokenHash { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? AcceptedUserId { get; set; }
    public string? CreatedByUserId { get; set; }
}

public sealed class MembershipTransferRequest : IdentityRecord
{
    public required string TenantUid { get; set; }
    public required string FromMembershipId { get; set; }
    public required string ToMembershipId { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public required string RequestedByUserId { get; set; }
    public string? Reason { get; set; }
}

public sealed class EmailChangeRequest : IdentityRecord
{
    public required string UserId { get; set; }
    public required string NewNormalizedEmail { get; set; }
    public required string TokenHash { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public string? AdministrativeReason { get; set; }
}

public sealed class PasswordResetRequest : IdentityRecord
{
    public required string UserId { get; set; }
    public required string TokenHash { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
}

public sealed class TenantContactSettings : IdentityRecord
{
    public required string TenantUid { get; set; }
    public string PrimaryContactEmail { get; set; } = string.Empty;
    public bool PrimaryContactVerified { get; set; }
    public string DefaultNotificationPolicy { get; set; } = "all-active";
    public NotificationCapability DeliveryCapability { get; set; } = NotificationCapability.DisabledNoProvider;
    public List<FormNotificationRecipient> Recipients { get; set; } = [];
    public Dictionary<string, List<string>> FormDefinitionOverrides { get; set; } = [];
    public string? UpdatedByUserId { get; set; }
    public string? AuditEventId { get; set; }
    [JsonIgnore] public string PartitionKey => TenantUid;
}

public sealed class FormNotificationRecipient : IdentityRecord
{
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; }
    public string? ReplyTo { get; set; }
}

public sealed class UserSession : IdentityRecord
{
    public required string UserId { get; set; }
    public long SessionVersion { get; set; }
    public DateTime LastSeenAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
}

public sealed class IdentityNotificationOutboxItem : IdentityRecord
{
    public required string MessageType { get; set; }
    public required string RecipientNormalizedEmail { get; set; }
    public required string TemplateDataJson { get; set; }
    public string? TokenReferenceHash { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public int AttemptCount { get; set; }
    public DateTime? NextAttemptAt { get; set; }
    public string? DeduplicationKey { get; set; }
    public string? SafeLastError { get; set; }
}

public sealed class SecurityAuditEvent : IdentityRecord
{
    public required string EventType { get; set; }
    public string? ActorUserId { get; set; }
    public string? ActorRole { get; set; }
    public string? TargetUserId { get; set; }
    public string? TargetTenantUid { get; set; }
    public string? RequestId { get; set; }
    public string? SafeOldMetadataJson { get; set; }
    public string? SafeNewMetadataJson { get; set; }
    public string? Reason { get; set; }
    public required string Result { get; set; }
    public string? SourceIp { get; set; }
    public string? UserAgent { get; set; }
}

public sealed class IdentityMigrationConflict : IdentityRecord
{
    public required string Category { get; set; }
    public string? TenantUid { get; set; }
    public string? LegacyTenantId { get; set; }
    public string? UserId { get; set; }
    public required string SafeDetail { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
}

public sealed class IdentityBackfillRun : IdentityRecord
{
    public bool DryRun { get; set; } = true;
    public bool ExecutionEnabled { get; set; }
    public required string InputFingerprint { get; set; }
    public string? ResumeToken { get; set; }
    public IdentityRecordStatus Status { get; set; } = IdentityRecordStatus.Pending;
    public List<IdentityMigrationConflict> Conflicts { get; set; } = [];
}

public sealed class IdentityFeatureState
{
    public bool Enabled { get; set; }
    public bool DualReadEnabled { get; set; }
    public bool DualWriteEnabled { get; set; }
    public bool RenameExecutionEnabled { get; set; }
    public bool MigrationExecutionEnabled { get; set; }
    public bool ExternalNotificationProviderEnabled { get; set; }
    public string Version { get; set; } = "v2.8.63a";
}
