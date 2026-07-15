using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public sealed record PortableUserAccount(string UserId, string LoginEmail, string GlobalRole, string Status,
    bool EmailVerified, bool ForcePasswordChange, long SessionVersion, DateTime CreatedAt, DateTime UpdatedAt);
public sealed record SafeIdentityRequest(string Id, string UserId, string Status, DateTime ExpiresAt, DateTime? UsedAt);

public sealed class IdentityBackupContract
{
    public string SchemaVersion { get; init; } = "v2.8.63a";
    public required string TenantUid { get; init; }
    public required string CanonicalSlug { get; init; }
    public List<TenantIdentifierAlias> Aliases { get; init; } = [];
    public List<TenantRenameJob> RenameJobs { get; init; } = [];
    public List<PortableUserAccount> Users { get; init; } = [];
    public List<TenantMembership> Memberships { get; init; } = [];
    public List<UserInvitation> Invitations { get; init; } = [];
    public TenantContactSettings? ContactSettings { get; init; }
    public List<SafeIdentityRequest> EmailChangeRequests { get; init; } = [];
    public List<SafeIdentityRequest> PasswordResetRequests { get; init; } = [];
    public List<SecurityAuditEvent> SecurityAuditEvents { get; init; } = [];
    public List<IdentityMigrationConflict> MigrationConflicts { get; init; } = [];
    public IdentityBackfillRun? BackfillRun { get; init; }

    public static PortableUserAccount Sanitize(UserAccount user) => new(user.UserId, user.LoginEmail,
        user.GlobalRole.ToString(), user.Status.ToString(), user.EmailVerified, user.ForcePasswordChange,
        user.SessionVersion, user.CreatedAt, user.UpdatedAt);
}

public static class IdentityRestoreOrder
{
    public static IReadOnlyList<string> Steps { get; } =
    ["tenantUid-and-canonical-slug", "aliases", "users-without-credentials", "memberships", "contact-settings",
     "invitations-and-safe-requests", "rename-jobs", "immutable-audit", "migration-state", "validate-final-admin-and-email-uniqueness"];
}
