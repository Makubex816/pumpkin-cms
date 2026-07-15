using System.Text.Json;
using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public sealed record IdentityActor(string UserId, UserRole GlobalRole, string? ActiveTenantUid, string? MembershipId, long SessionVersion);
public sealed record CurrentProfileResponse(string UserId, string LoginEmail, bool EmailVerified, bool ForcePasswordChange, long SessionVersion);
public sealed record SwitchTenantRequest(string TenantUid);
public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword, bool RevokeOtherSessions = true);
public sealed record EmailChangeRequestDto(string NewEmail, string CurrentPassword);
public sealed record ConfirmEmailChangeRequest(string RequestId, string Token);
public sealed record InviteUserRequest(
    string Email,
    [property: JsonConverter(typeof(StrictStringEnumJsonConverter))] TenantRole Role,
    string? IdempotencyKey);
public sealed record IdentityReasonRequest(string Reason);
public sealed record AddMembershipRequest(
    string UserId,
    [property: JsonConverter(typeof(StrictStringEnumJsonConverter))] TenantRole Role,
    string? IdempotencyKey);
public sealed record ChangeMembershipRoleRequest(
    [property: JsonConverter(typeof(StrictStringEnumJsonConverter))] TenantRole Role,
    string Reason);
public sealed record ChangeMembershipStatusRequest(
    [property: JsonConverter(typeof(StrictStringEnumJsonConverter))] IdentityRecordStatus Status,
    string Reason);
public sealed record TransferTenantAdminRequest(string ToMembershipId, string Reason, string Confirmation);
public sealed record RenamePreflightRequest(string NewSlug);
public sealed record RenameRequest(string NewSlug, string Confirmation, string CurrentPassword, string? Reason, string? IdempotencyKey);
public sealed record AdminEmailChangeRequest(string NewEmail, string Reason, bool RevokeSessions = true, bool ForcePasswordChange = false);
public sealed record AdminPasswordResetRequest(string NewPassword, string Reason, bool ForceChangeAtNextLogin = true);
public sealed record AdminAccountStateRequest(string Reason);
public sealed record TemporaryPasswordRequest(string Reason, bool ForceChangeAtNextLogin = true);
public sealed record ContactSettingsUpdate(string PrimaryContactEmail, IReadOnlyList<FormNotificationRecipient> Recipients,
    string DefaultNotificationPolicy, IReadOnlyDictionary<string, List<string>> FormDefinitionOverrides);
public sealed record ContactRecipientResponse(string Id, string Email, string NormalizedEmail, int Order,
    bool IsActive, bool IsVerified, string? ReplyTo, string? CreatedAt, string? UpdatedAt);
public sealed record ContactSettingsResponse(string TenantUid, string PrimaryContactEmail, bool PrimaryContactVerified,
    string DeliveryCapability, string DefaultNotificationPolicy, IReadOnlyList<ContactRecipientResponse> Recipients,
    IReadOnlyDictionary<string, IReadOnlyList<string>> FormDefinitionOverrides, string? UpdatedAt, string ConcurrencyToken);
public sealed record RenameImpact(int Pages, int FormDefinitions, int FormEntries, int Redirects, int Domains,
    int Memberships, IReadOnlyList<string> ExternalDependencies);
public sealed record RenamePreflightResponse(bool Available, IReadOnlyList<string> Errors, IReadOnlyList<string> Warnings, RenameImpact Impact);
public sealed record IdentityError(string Code, string Message, string RequestId);

public sealed class StrictStringEnumJsonConverter : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert) => typeToConvert.IsEnum;

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options) =>
        (JsonConverter)(Activator.CreateInstance(typeof(StrictStringEnumJsonConverterInner<>).MakeGenericType(typeToConvert))
            ?? throw new InvalidOperationException("strict enum converter could not be created"));

    private sealed class StrictStringEnumJsonConverterInner<TEnum> : JsonConverter<TEnum> where TEnum : struct, Enum
    {
        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.String) throw new JsonException("enum value must be a named string");
            var raw = reader.GetString();
            if (string.IsNullOrWhiteSpace(raw) ||
                !Enum.GetNames<TEnum>().Any(name => string.Equals(name, raw, StringComparison.OrdinalIgnoreCase)) ||
                !Enum.TryParse<TEnum>(raw, ignoreCase: true, out var parsed) || !Enum.IsDefined(parsed))
                throw new JsonException("enum value is unknown");
            return parsed;
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options) =>
            writer.WriteStringValue(value.ToString());
    }
}

public enum IdentitySessionValidationStatus
{
    NotRequired,
    Valid,
    MissingIdentity,
    AccountInactive,
    VersionMismatch,
    RoleMismatch,
    TenantContextInvalid,
    MembershipInactive,
    ProviderUnavailable
}

public sealed record IdentitySessionValidationResult(
    IdentitySessionValidationStatus Status,
    bool ForcePasswordChange = false,
    string? UserId = null);

public sealed record IdentityLoginAuthorityResult(
    bool Required,
    bool Authorized,
    long SessionVersion,
    string? AccountId,
    string? AccountEtag,
    string? UserId,
    string? TenantUid,
    string? MembershipId,
    string? TenantRole,
    string EffectiveRole);

public interface IIdentityNotificationProvider
{
    NotificationCapability Capability { get; }
    Task<bool> DeliverAsync(IdentityNotificationOutboxItem item, CancellationToken cancellationToken);
}

public sealed class DisabledIdentityNotificationProvider : IIdentityNotificationProvider
{
    public NotificationCapability Capability => NotificationCapability.DisabledNoProvider;
    public Task<bool> DeliverAsync(IdentityNotificationOutboxItem item, CancellationToken cancellationToken) => Task.FromResult(false);
}

public interface ITenantIdentityResolver
{
    Task<(string TenantUid, string CanonicalSlug, bool ViaAlias)?> ResolveAsync(string slugOrUid, CancellationToken cancellationToken);
}

public interface IMembershipAuthorizationService
{
    Task<TenantMembership?> RequireActiveMembershipAsync(IdentityActor actor, string tenantUid, CancellationToken cancellationToken);
    Task<bool> IsCurrentSessionAsync(IdentityActor actor, CancellationToken cancellationToken);
}

public interface IIdentityStore
{
    string ProviderName { get; }
    Task<UserAccount?> GetUserAsync(string userId, CancellationToken cancellationToken);
    Task<UserAccount?> GetUserByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    Task<IReadOnlyList<UserAccount>> SearchUsersAsync(string? query, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantMembership>> GetMembershipsByUserAsync(string userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<TenantMembership>> GetMembershipsByTenantAsync(string tenantUid, CancellationToken cancellationToken);
    Task<TenantContactSettings?> GetContactSettingsAsync(string tenantUid, CancellationToken cancellationToken);
    Task<TenantRenameJob?> GetRenameJobAsync(string tenantUid, string jobId, CancellationToken cancellationToken);
    Task SaveAuditAsync(SecurityAuditEvent auditEvent, CancellationToken cancellationToken);
}

public interface IIdentityMutationStore : IIdentityStore
{
    Task SaveUserAsync(UserAccount user, string? expectedSecurityStamp, CancellationToken cancellationToken);
    Task SaveMembershipAsync(TenantMembership membership, CancellationToken cancellationToken);
    Task SaveContactSettingsAsync(TenantContactSettings settings, CancellationToken cancellationToken);
    Task SaveRenameJobAsync(TenantRenameJob job, CancellationToken cancellationToken);
    Task SaveOutboxAsync(IdentityNotificationOutboxItem item, CancellationToken cancellationToken);
}
