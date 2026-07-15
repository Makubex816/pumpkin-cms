using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public sealed class IdentityManagementService
{
    public const string ForcePasswordChangeClaimType = "pumpkin:force_password_change";
    private const string ValidatedAccountItemKey = "pumpkin.identity.validated-account";
    private const string UndisclosedTemporaryPasswordMutationKind = "undisclosed-temporary-password";
    private static readonly TimeSpan QueryTimeout = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan SecurityMutationLeaseDuration = TimeSpan.FromMinutes(2);
    private const int MaxQueryRows = 500;
    private const int MaxContactRecipients = 100;
    private const int MaxContactOverrideEntries = 200;
    private const int MaxContactOverrideRecipients = 100;
    private const int MaxContactOverrideAssignments = 2_000;
    private const int MaxContactIdentifierBytes = 128;
    private const int MaxIdentityIdentifierBytes = 128;
    private const int MaxIdempotencyKeyBytes = 128;

    private readonly CosmosClient? _client;
    private readonly string _databaseName;
    private readonly IDatabaseService _legacy;
    private readonly IOptionsMonitor<IdentityFeatureOptions> _features;
    private readonly IIdentityNotificationProvider _notificationProvider;
    private readonly ILogger<IdentityManagementService> _logger;
    private readonly IConfiguration _configuration;

    public IdentityManagementService(
        IOptions<DatabaseSettings> database,
        IServiceProvider serviceProvider,
        IDatabaseService legacy,
        IOptionsMonitor<IdentityFeatureOptions> features,
        IIdentityNotificationProvider notificationProvider,
        IConfiguration configuration,
        ILogger<IdentityManagementService> logger)
    {
        _legacy = legacy;
        _features = features;
        _notificationProvider = notificationProvider;
        _configuration = configuration;
        _logger = logger;
        _databaseName = database.Value.CosmosDb.DatabaseName;

        if (database.Value.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase) &&
            !string.IsNullOrWhiteSpace(database.Value.CosmosDb.ConnectionString))
            _client = serviceProvider.GetRequiredService<CosmosDataConnection>().SharedClient;
    }

    public async Task<IdentitySessionValidationResult> ValidateProtectedSessionAsync(
        HttpContext context,
        ClaimsPrincipal principal,
        CancellationToken cancellationToken)
    {
        if (!IdentityFeaturePolicy.Foundation(_features.CurrentValue) || !_features.CurrentValue.DualReadEnabled)
            return new(IdentitySessionValidationStatus.NotRequired);

        if (_client is null)
            return new(IdentitySessionValidationStatus.ProviderUnavailable);

        var legacyUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(legacyUserId))
            return new(IdentitySessionValidationStatus.MissingIdentity);

        try
        {
            var account = await AccountByLegacyUserIdAsync(legacyUserId, cancellationToken);
            var result = EvaluateSession(account, principal);
            if (result.Status == IdentitySessionValidationStatus.Valid && account is not null)
            {
                var tenantUid = principal.FindFirstValue("tenantUid");
                var membershipId = principal.FindFirstValue("membershipId");
                var tenantRole = principal.FindFirstValue("tenantRole");
                if (string.IsNullOrWhiteSpace(tenantUid) || string.IsNullOrWhiteSpace(membershipId) || string.IsNullOrWhiteSpace(tenantRole))
                    return new(IdentitySessionValidationStatus.TenantContextInvalid, UserId: Text(account, "userId"));

                var membership = await ReadAsync("TenantMemberships", membershipId, tenantUid, cancellationToken);
                if (membership is null ||
                    !string.Equals(Text(membership, "userId"), Text(account, "userId"), StringComparison.Ordinal) ||
                    !string.Equals(Text(membership, "tenantUid"), tenantUid, StringComparison.Ordinal) ||
                    !string.Equals(Text(membership, "status"), IdentityRecordStatus.Active.ToString(), StringComparison.Ordinal) ||
                    !string.Equals(Text(membership, "role"), tenantRole, StringComparison.Ordinal))
                    return new(IdentitySessionValidationStatus.MembershipInactive, UserId: Text(account, "userId"));

                var tenant = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);
                var tokenTenantId = principal.FindFirstValue("tenantId");
                var expectedTenantId = tenant is null ? string.Empty : Text(tenant, "legacyTenantId", Text(tenant, "canonicalSlug"));
                if (tenant is null || !StatusIsActive(tenant) ||
                    !string.Equals(tokenTenantId, expectedTenantId, StringComparison.Ordinal))
                    return new(IdentitySessionValidationStatus.TenantContextInvalid, UserId: Text(account, "userId"));
                context.Items[ValidatedAccountItemKey] = account;
            }
            return result;
        }
        catch (Exception error) when (error is CosmosException or OperationCanceledException or TimeoutException)
        {
            _logger.LogWarning("Identity session validation provider failure category={Category}", error.GetType().Name);
            return new(IdentitySessionValidationStatus.ProviderUnavailable);
        }
    }

    public static IdentitySessionValidationResult EvaluateSession(JsonObject? account, ClaimsPrincipal principal)
    {
        if (account is null)
            return new(IdentitySessionValidationStatus.MissingIdentity);

        var userId = Text(account, "userId");
        if (!StatusIsActive(account))
            return new(IdentitySessionValidationStatus.AccountInactive, UserId: userId);

        if (!long.TryParse(principal.FindFirstValue("sessionVersion"), NumberStyles.None, CultureInfo.InvariantCulture, out var tokenVersion) ||
            tokenVersion != Long(account, "sessionVersion", 1))
            return new(IdentitySessionValidationStatus.VersionMismatch, UserId: userId);

        var tokenIsSuperAdmin = principal.IsInRole(UserRole.SuperAdmin.ToString());
        var accountIsSuperAdmin = string.Equals(Text(account, "globalRole"), UserRole.SuperAdmin.ToString(), StringComparison.Ordinal);
        if (tokenIsSuperAdmin != accountIsSuperAdmin)
            return new(IdentitySessionValidationStatus.RoleMismatch, UserId: userId);

        return new(IdentitySessionValidationStatus.Valid, Bool(account, "forcePasswordChange"), userId);
    }

    public async Task<IdentityLoginAuthorityResult> ResolveLoginAuthorityAsync(
        pumpkin_net_models.Models.User legacyUser,
        string verifiedLegacyPasswordHash,
        CancellationToken cancellationToken)
    {
        var features = _features.CurrentValue;
        if (!IdentityFeaturePolicy.Foundation(features) || !features.DualReadEnabled)
            return new(false, true, 1, null, null, null, null, null, null, legacyUser.Role.ToString());
        if (_client is null)
            throw new InvalidOperationException("identity_login_authority_provider_unavailable");

        var account = await AccountByLegacyUserIdAsync(legacyUser.Id, cancellationToken);
        var normalizedLegacyEmail = IdentitySecurityService.NormalizeEmail(legacyUser.Email);
        var authoritativePasswordHash = account is null ? string.Empty : Text(account, "passwordHash");
        var passwordHashParity = !string.IsNullOrWhiteSpace(verifiedLegacyPasswordHash) &&
            !string.IsNullOrWhiteSpace(authoritativePasswordHash) &&
            string.Equals(verifiedLegacyPasswordHash, legacyUser.PasswordHash, StringComparison.Ordinal) &&
            CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(Encoding.UTF8.GetBytes(verifiedLegacyPasswordHash)),
                SHA256.HashData(Encoding.UTF8.GetBytes(authoritativePasswordHash)));
        if (account is null || !StatusIsActive(account) || !passwordHashParity ||
            !string.Equals(Text(account, "legacyUserId"), legacyUser.Id, StringComparison.Ordinal) ||
            !string.Equals(Text(account, "legacyTenantId"), legacyUser.TenantId, StringComparison.Ordinal) ||
            !string.Equals(IdentitySecurityService.NormalizeEmail(Text(account, "loginEmail")), normalizedLegacyEmail, StringComparison.Ordinal) ||
            !string.Equals(Text(account, "normalizedEmail"), normalizedLegacyEmail, StringComparison.Ordinal))
            return new(true, false, 1, null, null, null, null, null, null, legacyUser.Role.ToString());

        var tenants = await QueryAsync("TenantIdentity",
            "SELECT TOP 2 * FROM c WHERE c.legacyTenantId=@legacyTenantId", cancellationToken,
            ("@legacyTenantId", legacyUser.TenantId));
        if (tenants.Count != 1 || !StatusIsActive(tenants[0]))
            return new(true, false, 1, null, null, null, null, null, null, legacyUser.Role.ToString());

        var userId = Text(account, "userId");
        var tenantUid = Text(tenants[0], "tenantUid");
        var memberships = await QueryPartitionAsync("TenantMemberships",
            "SELECT TOP 2 * FROM c WHERE c.tenantUid=@tenantUid AND c.userId=@userId",
            tenantUid, cancellationToken, ("@tenantUid", tenantUid), ("@userId", userId));
        if (memberships.Count != 1 || !StatusIsActive(memberships[0]))
            return new(true, false, 1, null, null, userId, tenantUid, null, null, legacyUser.Role.ToString());

        var membershipRole = Text(memberships[0], "role");
        if (!Enum.TryParse<TenantRole>(membershipRole, false, out var parsedMembershipRole) || !Enum.IsDefined(parsedMembershipRole))
            return new(true, false, 1, null, null, userId, tenantUid, null, null, legacyUser.Role.ToString());
        var effectiveRole = string.Equals(Text(account, "globalRole"), UserRole.SuperAdmin.ToString(), StringComparison.Ordinal)
            ? UserRole.SuperAdmin.ToString()
            : membershipRole;
        using var accountDocument = JsonDocument.Parse(account.ToJsonString());
        var sessionVersion = IdentityLoginCompatibilityWriter.ParseSessionVersion(accountDocument.RootElement);
        return new(
            true,
            true,
            sessionVersion,
            Text(account, "id"),
            Text(account, "_etag"),
            userId,
            tenantUid,
            Text(memberships[0], "membershipId"),
            membershipRole,
            effectiveRole);
    }

    public static bool IsForcePasswordChangePathAllowed(PathString path) =>
        string.Equals(path.Value, "/api/auth/verify", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(path.Value, "/api/auth/logout", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(path.Value, "/api/identity/feature-state", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(path.Value, "/api/identity/current/profile", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(path.Value, "/api/identity/current/password", StringComparison.OrdinalIgnoreCase);

    public static bool IsPasswordStrong(string? password) =>
        !string.IsNullOrWhiteSpace(password) && password.Length >= 12 &&
        Encoding.UTF8.GetByteCount(password) <= 72 &&
        password.Any(char.IsUpper) && password.Any(char.IsLower) && password.Any(char.IsDigit);

    private static bool IsBcryptVerificationInputSafe(string? password) =>
        !string.IsNullOrEmpty(password) && Encoding.UTF8.GetByteCount(password) <= 1024;

    public async Task<IResult> ProfileAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        return Results.Ok(new
        {
            userId = Text(actor.Account, "userId"),
            loginEmail = Text(actor.Account, "loginEmail"),
            emailVerified = Bool(actor.Account, "emailVerified"),
            forcePasswordChange = Bool(actor.Account, "forcePasswordChange"),
            sessionVersion = Long(actor.Account, "sessionVersion", 1),
            providerState = "held_no_delivery_provider"
        });
    }

    public async Task<IResult> CurrentMembershipsAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        var memberships = await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@id", cancellationToken,
            ("@id", Text(actor.Account, "userId")));
        return Results.Ok(await EnrichMembershipsAsync(memberships, cancellationToken));
    }

    public async Task<IResult> SessionsAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();

        var userId = Text(actor.Account, "userId");
        var currentSessionId = context.User.FindFirstValue(JwtRegisteredClaimNames.Jti) ?? "current";
        var rows = await QueryPartitionAsync("IdentityRequests",
            "SELECT TOP 100 * FROM c WHERE c.type='UserSession' AND c.userId=@u ORDER BY c.createdAt DESC",
            userId, cancellationToken, ("@u", userId));
        var sessions = rows.Select(row => new
        {
            sessionId = Text(row, "id"),
            current = string.Equals(Text(row, "id"), currentSessionId, StringComparison.Ordinal),
            sessionVersion = Long(row, "sessionVersion", 1),
            issuedAt = DateTimeText(row, "createdAt"),
            lastSeenAt = DateTimeText(row, "lastSeenAt"),
            expiresAt = DateTimeText(row, "expiresAt"),
            revokedAt = DateTimeText(row, "revokedAt")
        }).ToList();
        if (sessions.All(x => !x.current))
        {
            sessions.Insert(0, new
            {
                sessionId = currentSessionId,
                current = true,
                sessionVersion = Long(actor.Account, "sessionVersion", 1),
                issuedAt = UnixClaim(context.User, JwtRegisteredClaimNames.Iat),
                lastSeenAt = (DateTimeOffset?)null,
                expiresAt = UnixClaim(context.User, JwtRegisteredClaimNames.Exp),
                revokedAt = (DateTimeOffset?)null
            });
        }
        return Results.Ok(sessions);
    }

    public async Task<IResult> RevokeSessionsAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        var userId = Text(actor.Account, "userId");
        var sessions = await QueryPartitionAsync("IdentityRequests",
            "SELECT TOP 100 * FROM c WHERE c.type='UserSession' AND c.userId=@u AND NOT IS_DEFINED(c.revokedAt)",
            userId, cancellationToken, ("@u", userId));
        await BeginAuditAsync(context, actor, "identity_sessions_revoked", userId, null, "self-service", cancellationToken);
        var version = await BumpUserSessionsAsync(userId, cancellationToken);
        if (version is null)
        {
            await AuditAsync(context, actor, "identity_sessions_revoked", userId, null, "self-service", "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        if (sessions.Count > 0)
        {
            var revokedAt = DateTime.UtcNow;
            var batch = Container("IdentityRequests").CreateTransactionalBatch(new PartitionKey(userId));
            foreach (var session in sessions)
                batch.PatchItem(Text(session, "id"),
                    [PatchOperation.Set("/revokedAt", revokedAt), PatchOperation.Set("/revokedReason", "session-version-revoked")]);
            try
            {
                using var response = await batch.ExecuteAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                    throw new InvalidOperationException($"identity_session_batch_failed:{(int)response.StatusCode}");
            }
            catch (Exception error)
            {
                await RecordIndeterminateMutationAsync(context, actor, "identity_sessions_revoked", userId, null,
                    "self-service", "sessions", error.GetType().Name);
                throw;
            }
        }
        await AuditAsync(context, actor, "identity_sessions_revoked", userId, null, "self-service", "success", cancellationToken);
        return Results.Ok(new { revoked = sessions.Count, sessionVersion = version.Value, currentSessionRevoked = true });
    }

    public async Task<IResult> SwitchTenantAsync(HttpContext context, SwitchTenantRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.TenantSwitcher)) return Disabled(context);
        if (!IsBoundedIdentityIdentifier(request.TenantUid)) return Bad(context, "tenant_uid_invalid");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        var membership = (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active'",
            request.TenantUid, cancellationToken, ("@u", Text(actor.Account, "userId")), ("@t", request.TenantUid))).SingleOrDefault();
        if (membership is null)
        {
            await AuditAsync(context, actor, "identity_tenant_switch_denied", Text(actor.Account, "userId"), request.TenantUid,
                "membership-not-active-or-missing", "denied", cancellationToken);
            return Results.Forbid();
        }
        var tenant = await ReadAsync("TenantIdentity", request.TenantUid, request.TenantUid, cancellationToken);
        if (tenant is null || !StatusIsActive(tenant))
        {
            await AuditAsync(context, actor, "identity_tenant_switch_denied", Text(actor.Account, "userId"), request.TenantUid,
                "tenant-not-active-or-missing", "denied", cancellationToken);
            return Results.Forbid();
        }
        var expiresAt = UnixClaim(context.User, JwtRegisteredClaimNames.Exp);
        if (expiresAt is null || expiresAt <= DateTimeOffset.UtcNow) return Unauthorized();
        var token = IssueTenantToken(context.User, actor, membership, tenant, expiresAt.Value);
        if (token is null)
        {
            context.Response.Headers.CacheControl = "no-store";
            context.Response.Headers.Pragma = "no-cache";
            context.Response.Headers.RetryAfter = "5";
            return Results.Json(new IdentityError("identity_token_provider_unavailable", "A replacement tenant token could not be issued.", context.TraceIdentifier), statusCode: StatusCodes.Status503ServiceUnavailable);
        }
        await AuditAsync(context, actor, "identity_tenant_switched", Text(actor.Account, "userId"), request.TenantUid,
            "self-service", "success", cancellationToken);
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers.Pragma = "no-cache";
        return Results.Ok(new
        {
            activeTenantUid = request.TenantUid,
            legacyTenantId = Text(tenant, "legacyTenantId"),
            membershipId = Text(membership, "membershipId"),
            role = Text(membership, "role"),
            token,
            expiresAt
        });
    }

    public async Task<IResult> RequestEmailChangeAsync(HttpContext context, EmailChangeRequestDto request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ProviderAwareEmail)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        var legacy = await LegacyForAccountAsync(actor.Account, cancellationToken);
        if (legacy is null || !IsBcryptVerificationInputSafe(request.CurrentPassword) ||
            !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, legacy.PasswordHash))
            return Unauthorized();

        if (!IsSafeEmail(request.NewEmail))
            return Bad(context, "email_change_invalid");
        var normalized = IdentitySecurityService.NormalizeEmail(request.NewEmail);
        if (normalized == Text(actor.Account, "normalizedEmail"))
            return Bad(context, "email_change_invalid");

        var duplicate = (await QueryPartitionAsync("UserAccounts", "SELECT * FROM c WHERE c.normalizedEmail=@e", "global", cancellationToken,
            ("@e", normalized))).Any(x => Text(x, "userId") != Text(actor.Account, "userId"));
        if (duplicate) return Conflict(context, "email_not_unique", "Email is already in use.");

        await AuditAsync(context, actor, "identity_email_change_held", Text(actor.Account, "userId"), null,
            "provider-unavailable", "held", cancellationToken);
        return ProviderUnavailable(context);
    }

    public async Task<IResult> ConfirmEmailChangeAsync(HttpContext context, ConfirmEmailChangeRequest _, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ProviderAwareEmail)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        return actor is null ? Unauthorized() : ProviderUnavailable(context);
    }

    public async Task<IResult> ChangePasswordAsync(HttpContext context, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        if (!IsPasswordStrong(request.NewPassword)) return Bad(context, "password_policy_failed");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null) return Unauthorized();
        var legacy = await LegacyForAccountAsync(actor.Account, cancellationToken);
        if (legacy is null || !IsBcryptVerificationInputSafe(request.CurrentPassword) ||
            !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, legacy.PasswordHash)) return Unauthorized();
        if (string.Equals(request.NewPassword, request.CurrentPassword, StringComparison.Ordinal)) return Bad(context, "new_password_must_differ");
        var hash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);

        var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("own-password-change", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        try
        {
            using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
            cancellationToken = adminInvariantBudget.Token;
            var currentAccount = await AccountByUserIdAsync(Text(actor.Account, "userId"), cancellationToken);
            if (currentAccount is null || !StatusIsActive(currentAccount)) return Unauthorized();
            var activeTenantAdmin = (await QueryAsync("TenantMemberships",
                "SELECT TOP 1 * FROM c WHERE c.userId=@u AND c.status='Active' AND c.role='TenantAdmin'",
                cancellationToken, ("@u", Text(currentAccount, "userId")))).Count == 1;

            await BeginAuditAsync(context, actor, "identity_own_password_changed", Text(actor.Account, "userId"), null, "self-service", cancellationToken);
            PasswordMutationResult mutation;
            try
            {
                mutation = await UpdatePasswordPairAsync(currentAccount, hash, forcePasswordChange: false, cancellationToken,
                    request.CurrentPassword, async () =>
                    {
                        if (!activeTenantAdmin) await adminInvariantLease.DisposeAsync();
                    });
            }
            catch (IdentityConcurrencyException)
            {
                await AuditAsync(context, actor, "identity_own_password_changed", Text(actor.Account, "userId"), null, "self-service", "conflict", cancellationToken);
                return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
            }
            catch (IdentityCurrentPasswordRejectedException)
            {
                await AuditAsync(context, actor, "identity_own_password_changed", Text(actor.Account, "userId"), null, "self-service", "rejected", cancellationToken);
                return Unauthorized();
            }
            await AuditAsync(context, actor, "identity_own_password_changed", Text(actor.Account, "userId"), null, "self-service", "success", cancellationToken);
            return Results.Ok(new { changed = true, sessionVersion = mutation.SessionVersion, allSessionsRevoked = true });
        }
        finally { await adminInvariantLease.DisposeAsync(); }
    }

    public async Task<IResult> TenantSettingsAsync(HttpContext context, string tenantUid, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanAccessTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var tenant = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);
        return tenant is null ? Results.NotFound() : Results.Ok(SafeTenant(tenant));
    }

    public async Task<IResult> ContactSettingsAsync(HttpContext context, string tenantUid, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var settings = await ReadAsync("TenantContactSettings", tenantUid, tenantUid, cancellationToken);
        return settings is null ? Results.NotFound() : Results.Ok(SafeContactSettings(settings));
    }

    public async Task<IResult> UpdateContactSettingsAsync(HttpContext context, string tenantUid, ContactSettingsUpdate request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Contacts)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var ifMatchValues = context.Request.Headers["If-Match"];
        if (ifMatchValues.Count != 1 || string.IsNullOrWhiteSpace(ifMatchValues[0]) ||
            ifMatchValues[0] == "*" || ifMatchValues[0]!.Length > 512)
            return PreconditionFailed(context, "contact_settings_concurrency_token_required",
                "Reload contact settings and submit the returned concurrency token.");
        var expectedConcurrencyToken = ifMatchValues[0]!;
        var existing = await ReadAsync("TenantContactSettings", tenantUid, tenantUid, cancellationToken);
        if (existing is null)
            return PreconditionFailed(context, "contact_settings_concurrency_conflict",
                "Contact settings changed concurrently; reload before saving.");

        if (request.Recipients is null || request.FormDefinitionOverrides is null ||
            !IsSafeEmail(request.PrimaryContactEmail))
            return Bad(context, "contact_settings_invalid");
        var primaryContactEmail = request.PrimaryContactEmail.Trim();
        if (request.DefaultNotificationPolicy is not ("legacy-compatible" or "all-active" or "first-active" or "suppressed"))
            return Bad(context, "contact_settings_invalid");

        JsonArray canonicalRecipients;
        JsonObject canonicalOverrides;
        try
        {
            canonicalRecipients = CanonicalizeContactRecipients(
                request.Recipients,
                existing["recipients"] as JsonArray ?? [],
                DateTime.UtcNow);
            var validRecipientIds = canonicalRecipients.OfType<JsonObject>()
                .Select(recipient => Text(recipient, "id"))
                .ToHashSet(StringComparer.Ordinal);
            canonicalOverrides = CanonicalizeContactOverrides(request.FormDefinitionOverrides, validRecipientIds);
        }
        catch (ArgumentException)
        {
            return Bad(context, "contact_recipient_invalid");
        }

        await BeginAuditAsync(context, actor, "identity_contact_settings_changed", Text(actor.Account, "userId"), tenantUid,
            "tenant-management", cancellationToken);

        var existingPrimary = Text(existing, "primaryContactEmail");
        var primaryUnchanged = IsSafeEmail(existingPrimary) &&
            string.Equals(IdentitySecurityService.NormalizeEmail(existingPrimary),
                IdentitySecurityService.NormalizeEmail(primaryContactEmail), StringComparison.Ordinal);
        JsonObject saved;
        try
        {
            var response = await Container("TenantContactSettings").PatchItemAsync<JsonObject>(tenantUid, new PartitionKey(tenantUid),
                [PatchOperation.Set("/primaryContactEmail", primaryContactEmail),
                 PatchOperation.Set("/primaryContactVerified", primaryUnchanged && Bool(existing, "primaryContactVerified")),
                 PatchOperation.Set("/recipients", canonicalRecipients),
                 PatchOperation.Set("/defaultNotificationPolicy", request.DefaultNotificationPolicy),
                 PatchOperation.Set("/formDefinitionOverrides", canonicalOverrides),
                 PatchOperation.Set("/updatedByUserId", Text(actor.Account, "userId")),
                 PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
                requestOptions: new PatchItemRequestOptions { IfMatchEtag = expectedConcurrencyToken },
                cancellationToken: cancellationToken);
            saved = response.Resource;
        }
        catch (CosmosException error) when (error.StatusCode is System.Net.HttpStatusCode.PreconditionFailed or System.Net.HttpStatusCode.NotFound)
        {
            await AuditAsync(context, actor, "identity_contact_settings_changed", Text(actor.Account, "userId"), tenantUid,
                "tenant-management", "conflict", cancellationToken);
            return PreconditionFailed(context, "contact_settings_concurrency_conflict", "Contact settings changed concurrently; reload before saving.");
        }
        catch (Exception error) when (error is CosmosException or OperationCanceledException or TimeoutException)
        {
            await RecordIndeterminateMutationAsync(context, actor, "identity_contact_settings_changed",
                Text(actor.Account, "userId"), tenantUid, "tenant-management", "contact-settings",
                error.GetType().Name);
            throw;
        }
        await AuditAsync(context, actor, "identity_contact_settings_changed", Text(actor.Account, "userId"), tenantUid,
            "tenant-management", "success", cancellationToken);
        return Results.Ok(SafeContactSettings(saved));
    }

    public static JsonArray CanonicalizeContactRecipients(
        IReadOnlyList<FormNotificationRecipient> recipients,
        JsonArray existingRecipients,
        DateTime timestamp)
    {
        if (recipients.Count > MaxContactRecipients) throw new ArgumentException("contact_recipient_limit_exceeded", nameof(recipients));
        var existingById = new Dictionary<string, JsonObject>(StringComparer.Ordinal);
        foreach (var existingNode in existingRecipients)
        {
            if (existingNode is not JsonObject existing || !IsBoundedContactIdentifier(Text(existing, "id")) ||
                !existingById.TryAdd(Text(existing, "id"), existing))
                throw new ArgumentException("existing_contact_recipient_invalid", nameof(existingRecipients));
        }
        var recipientIds = new HashSet<string>(StringComparer.Ordinal);
        var recipientEmails = new HashSet<string>(StringComparer.Ordinal);
        var recipientOrders = new HashSet<int>();
        var canonical = new List<object>(recipients.Count);
        foreach (var recipient in recipients)
        {
            if (recipient is null) throw new ArgumentException("contact_recipient_invalid", nameof(recipients));
            var email = recipient.Email?.Trim() ?? string.Empty;
            var normalizedEmail = !IsSafeEmail(email)
                ? string.Empty
                : IdentitySecurityService.NormalizeEmail(email);
            if (!IsBoundedContactIdentifier(recipient.Id) || string.IsNullOrWhiteSpace(normalizedEmail) || recipient.Order < 0 ||
                !recipientIds.Add(recipient.Id) || !recipientEmails.Add(normalizedEmail) || !recipientOrders.Add(recipient.Order) ||
                !string.IsNullOrWhiteSpace(recipient.ReplyTo) && !IsSafeEmail(recipient.ReplyTo))
                throw new ArgumentException("contact_recipient_invalid", nameof(recipients));

            existingById.TryGetValue(recipient.Id, out var existing);
            var existingNormalized = existing is null ? string.Empty : Text(existing, "normalizedEmail");
            var emailUnchanged = existing is not null && string.Equals(existingNormalized, normalizedEmail, StringComparison.Ordinal);
            var createdAt = existing is null ? timestamp : Date(existing, "createdAt", timestamp);
            var semanticUnchanged = existing is not null && emailUnchanged &&
                string.Equals(Text(existing, "email"), email, StringComparison.Ordinal) &&
                Long(existing, "order", -1) == recipient.Order &&
                Bool(existing, "isActive") == recipient.IsActive &&
                string.Equals(Text(existing, "replyTo"), recipient.ReplyTo ?? string.Empty, StringComparison.Ordinal);
            var updatedAt = semanticUnchanged ? Date(existing!, "updatedAt", createdAt) : timestamp;

            canonical.Add(new
            {
                id = recipient.Id,
                email,
                normalizedEmail,
                order = recipient.Order,
                isActive = recipient.IsActive,
                isVerified = existing is not null && emailUnchanged && Bool(existing, "isVerified"),
                replyTo = recipient.ReplyTo,
                createdAt,
                updatedAt
            });
        }
        return JsonSerializer.SerializeToNode(canonical, new JsonSerializerOptions(JsonSerializerDefaults.Web))!.AsArray();
    }

    public static JsonObject CanonicalizeContactOverrides(
        IReadOnlyDictionary<string, List<string>> overrides,
        IReadOnlySet<string> validRecipientIds)
    {
        if (overrides.Count > MaxContactOverrideEntries)
            throw new ArgumentException("contact_override_limit_exceeded", nameof(overrides));
        var canonical = new JsonObject();
        var assignmentCount = 0;
        foreach (var entry in overrides)
        {
            if (!IsBoundedContactIdentifier(entry.Key) || entry.Value is null ||
                entry.Value.Count > MaxContactOverrideRecipients)
                throw new ArgumentException("contact_override_invalid", nameof(overrides));
            assignmentCount = checked(assignmentCount + entry.Value.Count);
            if (assignmentCount > MaxContactOverrideAssignments)
                throw new ArgumentException("contact_override_limit_exceeded", nameof(overrides));
            var uniqueRecipientIds = new HashSet<string>(StringComparer.Ordinal);
            foreach (var recipientId in entry.Value)
                if (!IsBoundedContactIdentifier(recipientId) || !validRecipientIds.Contains(recipientId) ||
                    !uniqueRecipientIds.Add(recipientId))
                    throw new ArgumentException("contact_override_invalid", nameof(overrides));
            canonical[entry.Key] = new JsonArray(entry.Value.Select(value => JsonValue.Create(value)).ToArray());
        }
        return canonical;
    }

    public async Task<IResult> TenantMembershipsAsync(HttpContext context, string tenantUid, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var memberships = await QueryPartitionAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t", tenantUid,
            cancellationToken, ("@t", tenantUid));
        return Results.Ok(await EnrichMembershipsAsync(memberships, cancellationToken));
    }

    public async Task<IResult> CreateInvitationAsync(HttpContext context, string tenantUid, InviteUserRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        if (!Enum.IsDefined(request.Role)) return Bad(context, "invitation_role_invalid");
        if (!IsBoundedIdentityIdentifier(tenantUid) ||
            !TryNormalizeIdempotencyKey(request.IdempotencyKey, out var idempotencyKey))
            return Bad(context, "invitation_request_invalid");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken) ||
            request.Role == TenantRole.TenantAdmin && !actor.SuperAdmin) return Results.Forbid();
        if (!IsSafeEmail(request.Email)) return Bad(context, "invitation_email_invalid");

        var normalized = IdentitySecurityService.NormalizeEmail(request.Email);
        var id = Digest("invitation", tenantUid, normalized);
        var requestKeyDigest = Digest("invitation-request", idempotencyKey, request.Role.ToString());
        var existingById = await ReadAsync("IdentityRequests", id, tenantUid, cancellationToken);
        if (existingById is not null)
        {
            var idempotentReplay = Text(existingById, "type") == "UserInvitation" &&
                Text(existingById, "tenantUid") == tenantUid && Text(existingById, "normalizedEmail") == normalized &&
                Text(existingById, "role") == request.Role.ToString() && Text(existingById, "status") == "Pending" &&
                Text(existingById, "idempotencyKeyDigest") == requestKeyDigest;
            await AuditAsync(context, actor, "identity_invitation_created", normalized, tenantUid, "membership-management",
                idempotentReplay ? "success" : "conflict", cancellationToken);
            if (!idempotentReplay)
                return Conflict(context, "invitation_pending_or_historical", "An invitation already exists and cannot be reactivated or replaced.");
            return Results.Ok(new
            {
                id, tenantUid, normalizedEmail = normalized, role = request.Role.ToString(), status = "Pending",
                deliveryCapability = Text(existingById, "deliveryCapability"), messageSent = false, idempotentReplay = true
            });
        }
        var pending = await QueryPartitionAsync("IdentityRequests",
            "SELECT * FROM c WHERE c.type='UserInvitation' AND c.tenantUid=@t AND c.normalizedEmail=@e AND c.status='Pending'",
            tenantUid, cancellationToken, ("@t", tenantUid), ("@e", normalized));
        if (pending.Count > 0)
        {
            await AuditAsync(context, actor, "identity_invitation_created", normalized, tenantUid, "membership-management", "conflict", cancellationToken);
            return Conflict(context, "invitation_pending", "A pending invitation already exists.");
        }
        var invitation = new
        {
            id,
            requestPartition = tenantUid,
            type = "UserInvitation",
            tenantUid,
            normalizedEmail = normalized,
            role = request.Role.ToString(),
            status = "Pending",
            deliveryCapability = _notificationProvider.Capability.ToString(),
            tokenIssued = false,
            idempotencyKeyDigest = requestKeyDigest,
            createdByUserId = Text(actor.Account, "userId"),
            createdAt = DateTime.UtcNow,
            updatedAt = DateTime.UtcNow
        };
        await BeginAuditAsync(context, actor, "identity_invitation_created", normalized, tenantUid, "membership-management", cancellationToken);
        try
        {
            await Container("IdentityRequests").CreateItemAsync(invitation, new PartitionKey(tenantUid), cancellationToken: cancellationToken);
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            var raced = await ReadAsync("IdentityRequests", id, tenantUid, cancellationToken);
            var idempotentReplay = raced is not null && Text(raced, "type") == "UserInvitation" &&
                Text(raced, "tenantUid") == tenantUid && Text(raced, "normalizedEmail") == normalized &&
                Text(raced, "role") == request.Role.ToString() && Text(raced, "status") == "Pending" &&
                Text(raced, "idempotencyKeyDigest") == requestKeyDigest;
            await AuditAsync(context, actor, "identity_invitation_created", normalized, tenantUid, "membership-management",
                idempotentReplay ? "success" : "conflict", cancellationToken);
            if (!idempotentReplay)
                return Conflict(context, "invitation_concurrency_conflict", "A concurrent invitation request won; retry from a fresh read.");
            return Results.Ok(new
            {
                id, tenantUid, normalizedEmail = normalized, role = request.Role.ToString(), status = "Pending",
                deliveryCapability = Text(raced!, "deliveryCapability"), messageSent = false, idempotentReplay = true
            });
        }
        catch (Exception error)
        {
            await RecordIndeterminateMutationAsync(context, actor, "identity_invitation_created", normalized, tenantUid,
                "membership-management", "identity_invitation_created", $"create_{error.GetType().Name}");
            throw;
        }
        await AuditAsync(context, actor, "identity_invitation_created", normalized, tenantUid, "membership-management", "success", cancellationToken);
        return Results.Created($"/api/identity/tenants/{tenantUid}/invitations/{id}", new
        {
            id,
            tenantUid,
            normalizedEmail = normalized,
            role = request.Role.ToString(),
            status = "Pending",
            deliveryCapability = _notificationProvider.Capability.ToString(),
            messageSent = false
        });
    }

    public async Task<IResult> RevokeInvitationAsync(HttpContext context, string tenantUid, string invitationId, IdentityReasonRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var invitation = await ReadAsync("IdentityRequests", invitationId, tenantUid, cancellationToken);
        if (invitation is null || Text(invitation, "type") != "UserInvitation") return Results.NotFound();
        if (Text(invitation, "status") != "Pending") return Conflict(context, "invitation_not_pending", "Only pending invitations can be revoked.");

        await BeginAuditAsync(context, actor, "identity_invitation_revoked", Text(invitation, "normalizedEmail"), tenantUid,
            reason, cancellationToken);
        try
        {
            await Container("IdentityRequests").PatchItemAsync<object>(invitationId, new PartitionKey(tenantUid),
                [PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedByUserId", Text(actor.Account, "userId")), PatchOperation.Set("/revokedAt", DateTime.UtcNow), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
                requestOptions: PatchMatch(invitation), cancellationToken: cancellationToken);
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            await AuditAsync(context, actor, "identity_invitation_revoked", Text(invitation, "normalizedEmail"), tenantUid,
                reason, "conflict", cancellationToken);
            return Conflict(context, "invitation_concurrency_conflict", "Invitation state changed concurrently; retry from a fresh read.");
        }
        catch (Exception error)
        {
            await RecordIndeterminateMutationAsync(context, actor, "identity_invitation_revoked", Text(invitation, "normalizedEmail"),
                tenantUid, reason, "identity_invitation_revoked", $"patch_{error.GetType().Name}");
            throw;
        }
        await AuditAsync(context, actor, "identity_invitation_revoked", Text(invitation, "normalizedEmail"), tenantUid,
            reason, "success", cancellationToken);
        return Results.Ok(new { invitationId, status = "Revoked" });
    }

    public async Task<IResult> AddMembershipAsync(HttpContext context, string tenantUid, AddMembershipRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        if (!Enum.IsDefined(request.Role)) return Bad(context, "membership_role_invalid");
        if (!IsBoundedIdentityIdentifier(tenantUid) || !IsBoundedIdentityIdentifier(request.UserId) ||
            !TryNormalizeIdempotencyKey(request.IdempotencyKey, out var idempotencyKey))
            return Bad(context, "membership_request_invalid");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || request.Role == TenantRole.TenantAdmin && !actor.SuperAdmin ||
            !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("membership-add", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        if (!await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var target = await AccountByUserIdAsync(request.UserId, cancellationToken);
        if (target is null || !StatusIsActive(target)) return Bad(context, "membership_user_not_active");
        var id = Digest("membership", tenantUid, request.UserId);
        var requestKeyDigest = Digest("membership-request", idempotencyKey, request.Role.ToString());
        var existing = (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.tenantUid=@t AND c.userId=@u", tenantUid, cancellationToken,
            ("@t", tenantUid), ("@u", request.UserId))).SingleOrDefault();
        if (existing is not null)
        {
            var idempotentReplay = Text(existing, "id") == id && Text(existing, "membershipId") == id &&
                Text(existing, "tenantUid") == tenantUid && Text(existing, "userId") == request.UserId &&
                Text(existing, "role") == request.Role.ToString() && Text(existing, "status") == "Active" &&
                ExplicitFalse(existing, "isPrimaryTenantAdmin") && Text(existing, "idempotencyKeyDigest") == requestKeyDigest;
            await AuditAsync(context, actor, "identity_membership_added", request.UserId, tenantUid, "membership-management",
                idempotentReplay ? "success" : "conflict", cancellationToken);
            if (!idempotentReplay) return Conflict(context, "membership_exists", "A different membership state already exists.");
            return Results.Ok(new
            {
                id, membershipId = id, tenantUid, userId = request.UserId, role = request.Role.ToString(),
                status = "Active", isPrimaryTenantAdmin = false, idempotentReplay = true
            });
        }

        var item = new
        {
            id,
            membershipId = id,
            tenantUid,
            userId = request.UserId,
            role = request.Role.ToString(),
            status = "Active",
            isPrimaryTenantAdmin = false,
            idempotencyKeyDigest = requestKeyDigest,
            createdByUserId = Text(actor.Account, "userId"),
            createdAt = DateTime.UtcNow,
            updatedAt = DateTime.UtcNow
        };
        await BeginAuditAsync(context, actor, "identity_membership_added", request.UserId, tenantUid, "membership-management", cancellationToken);
        try
        {
            await Container("TenantMemberships").CreateItemAsync(item, new PartitionKey(tenantUid), cancellationToken: cancellationToken);
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            var raced = await ReadAsync("TenantMemberships", id, tenantUid, cancellationToken);
            var idempotentReplay = raced is not null && Text(raced, "membershipId") == id &&
                Text(raced, "tenantUid") == tenantUid && Text(raced, "userId") == request.UserId &&
                Text(raced, "role") == request.Role.ToString() && Text(raced, "status") == "Active" &&
                ExplicitFalse(raced, "isPrimaryTenantAdmin") && Text(raced, "idempotencyKeyDigest") == requestKeyDigest;
            await AuditAsync(context, actor, "identity_membership_added", request.UserId, tenantUid, "membership-management",
                idempotentReplay ? "success" : "conflict", cancellationToken);
            if (!idempotentReplay)
                return Conflict(context, "membership_concurrency_conflict", "A concurrent membership request won; retry from a fresh read.");
            return Results.Ok(new
            {
                id, membershipId = id, tenantUid, userId = request.UserId, role = request.Role.ToString(),
                status = "Active", isPrimaryTenantAdmin = false, idempotentReplay = true
            });
        }
        catch (Exception error)
        {
            await RecordIndeterminateMutationAsync(context, actor, "identity_membership_added", request.UserId, tenantUid,
                "membership-management", "identity_membership_added", $"create_{error.GetType().Name}");
            throw;
        }
        await AuditAsync(context, actor, "identity_membership_added", request.UserId, tenantUid, "membership-management", "success", cancellationToken);
        return Results.Created($"/api/identity/tenants/{tenantUid}/memberships/{id}", item);
    }

    public Task<IResult> ChangeMembershipRoleAsync(HttpContext context, string tenantUid, string membershipId, ChangeMembershipRoleRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(request.Role)) return Task.FromResult(Bad(context, "membership_role_invalid"));
        return MutateMembershipAsync(context, tenantUid, membershipId, "role", request.Role.ToString(), request.Reason, cancellationToken);
    }

    public Task<IResult> ChangeMembershipStatusAsync(HttpContext context, string tenantUid, string membershipId, ChangeMembershipStatusRequest request, CancellationToken cancellationToken)
    {
        if (request.Status is not (IdentityRecordStatus.Active or IdentityRecordStatus.Suspended or IdentityRecordStatus.Revoked))
            return Task.FromResult(Bad(context, "membership_status_invalid"));
        return MutateMembershipAsync(context, tenantUid, membershipId, "status", request.Status.ToString(), request.Reason, cancellationToken);
    }

    private async Task<IResult> MutateMembershipAsync(HttpContext context, string tenantUid, string membershipId, string field, string value, string reason, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        if (!TryNormalizeAuditReason(reason, out var normalizedReason)) return Bad(context, "reason_invalid");
        reason = normalizedReason;
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("membership-mutate", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        if (!await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var membership = (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.tenantUid=@t AND c.membershipId=@m", tenantUid, cancellationToken,
            ("@t", tenantUid), ("@m", membershipId))).SingleOrDefault();
        if (membership is null) return Results.NotFound();
        var altersAuthoritativeLogin = field == "status" && value != IdentityRecordStatus.Active.ToString() ||
            field == "role" && !string.Equals(Text(membership, "role"), value, StringComparison.Ordinal);
        if (await ProtectMembershipMutationAsync(context, actor, membership, altersAuthoritativeLogin, cancellationToken) is { } protection)
            return protection;
        if (string.Equals(Text(membership, field), value, StringComparison.Ordinal))
        {
            await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "success", cancellationToken);
            return Results.Ok(new { membershipId, field, value, changed = false });
        }
        if (field == "status" && value == IdentityRecordStatus.Active.ToString() &&
            Text(membership, "role") == TenantRole.TenantAdmin.ToString() && !actor.SuperAdmin)
        {
            await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid,
                reason, "rejected", cancellationToken);
            return Results.Forbid();
        }

        var removesAdmin = Text(membership, "role") == TenantRole.TenantAdmin.ToString() &&
            (field == "status" && value != IdentityRecordStatus.Active.ToString() || field == "role" && value != TenantRole.TenantAdmin.ToString());
        if (removesAdmin && Bool(membership, "isPrimaryTenantAdmin"))
        {
            await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "conflict", cancellationToken);
            return Conflict(context, "primary_tenant_admin_transfer_required", "Transfer primary TenantAdmin responsibility first.");
        }
        if (field == "role" && value == TenantRole.TenantAdmin.ToString() && !actor.SuperAdmin)
        {
            await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "rejected", cancellationToken);
            return Results.Forbid();
        }
        List<JsonObject>? activeAdmins = null;
        if (removesAdmin)
        {
            activeAdmins = await UsableActiveAdmins(tenantUid, cancellationToken);
            if (activeAdmins.Count <= 1)
            {
                await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "conflict", cancellationToken);
                return Conflict(context, "final_tenant_admin_protected", "The final active TenantAdmin cannot be removed.");
            }
        }
        await BeginAuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, cancellationToken);
        if (await BumpUserSessionsAsync(Text(membership, "userId"), cancellationToken) is null)
        {
            await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "conflict", cancellationToken);
            return Conflict(context, "membership_session_concurrency_conflict", "Target session state changed concurrently; retry from a fresh read.");
        }

        var operations = new[] { PatchOperation.Set("/" + field, value), PatchOperation.Set("/updatedAt", DateTime.UtcNow) };
        if (removesAdmin)
        {
            var batch = Container("TenantMemberships").CreateTransactionalBatch(new PartitionKey(tenantUid));
            foreach (var admin in activeAdmins!.Where(item => Text(item, "id") != Text(membership, "id")))
                batch.ReadItem(Text(admin, "id"), BatchMatch(admin));
            batch.PatchItem(Text(membership, "id"), operations, BatchPatchMatch(membership));
            using var response = await batch.ExecuteAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "conflict", cancellationToken);
                return Conflict(context, "admin_invariant_concurrency_conflict", "TenantAdmin state changed concurrently; retry from a fresh read.");
            }
        }
        else
        {
            try
            {
                await Container("TenantMemberships").PatchItemAsync<object>(Text(membership, "id"), new PartitionKey(tenantUid),
                    operations, requestOptions: PatchMatch(membership), cancellationToken: cancellationToken);
            }
            catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "conflict", cancellationToken);
                return Conflict(context, "membership_concurrency_conflict", "Membership state changed concurrently; retry from a fresh read.");
            }
        }
        await AuditAsync(context, actor, "identity_membership_changed", Text(membership, "userId"), tenantUid, reason, "success", cancellationToken);
        return Results.Ok(new { membershipId, field, value });
    }

    public async Task<IResult> RemoveMembershipAsync(HttpContext context, string tenantUid, string membershipId, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("membership-remove", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        if (!await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var membership = (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.tenantUid=@t AND c.membershipId=@m", tenantUid, cancellationToken,
            ("@t", tenantUid), ("@m", membershipId))).SingleOrDefault();
        if (membership is null) return Results.NotFound();
        if (await ProtectMembershipMutationAsync(context, actor, membership, deactivatesAuthoritativeLogin: true, cancellationToken: cancellationToken) is { } protection)
            return protection;
        if (Text(membership, "status") == IdentityRecordStatus.Revoked.ToString())
        {
            await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "success", cancellationToken);
            return Results.Ok(new { membershipId, status = "Revoked", deleted = false, changed = false });
        }
        if (Bool(membership, "isPrimaryTenantAdmin"))
        {
            await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "conflict", cancellationToken);
            return Conflict(context, "primary_tenant_admin_transfer_required", "Transfer primary TenantAdmin responsibility first.");
        }
        var operations = new[]
        {
            PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedAt", DateTime.UtcNow),
            PatchOperation.Set("/revokedByUserId", Text(actor.Account, "userId")), PatchOperation.Set("/updatedAt", DateTime.UtcNow)
        };
        var removesActiveAdmin = Text(membership, "role") == TenantRole.TenantAdmin.ToString() && Text(membership, "status") == "Active";
        List<JsonObject>? activeAdmins = null;
        if (removesActiveAdmin)
        {
            activeAdmins = await UsableActiveAdmins(tenantUid, cancellationToken);
            if (activeAdmins.Count <= 1)
            {
                await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "conflict", cancellationToken);
                return Conflict(context, "final_tenant_admin_protected", "The final active TenantAdmin cannot be removed.");
            }
        }
        await BeginAuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", cancellationToken);
        if (await BumpUserSessionsAsync(Text(membership, "userId"), cancellationToken) is null)
        {
            await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "conflict", cancellationToken);
            return Conflict(context, "membership_session_concurrency_conflict", "Target session state changed concurrently; retry from a fresh read.");
        }

        if (removesActiveAdmin)
        {
            var batch = Container("TenantMemberships").CreateTransactionalBatch(new PartitionKey(tenantUid));
            foreach (var admin in activeAdmins!.Where(item => Text(item, "id") != Text(membership, "id")))
                batch.ReadItem(Text(admin, "id"), BatchMatch(admin));
            batch.PatchItem(Text(membership, "id"), operations, BatchPatchMatch(membership));
            using var response = await batch.ExecuteAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "conflict", cancellationToken);
                return Conflict(context, "admin_invariant_concurrency_conflict", "TenantAdmin state changed concurrently; retry from a fresh read.");
            }
        }
        else
        {
            try
            {
                await Container("TenantMemberships").PatchItemAsync<object>(Text(membership, "id"), new PartitionKey(tenantUid),
                    operations, requestOptions: PatchMatch(membership), cancellationToken: cancellationToken);
            }
            catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "conflict", cancellationToken);
                return Conflict(context, "membership_concurrency_conflict", "Membership state changed concurrently; retry from a fresh read.");
            }
        }
        await AuditAsync(context, actor, "identity_membership_revoked", Text(membership, "userId"), tenantUid, "membership-management", "success", cancellationToken);
        return Results.Ok(new { membershipId, status = "Revoked", deleted = false });
    }

    public async Task<IResult> TransferTenantAdminAsync(HttpContext context, string tenantUid, TransferTenantAdminRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.Memberships)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin || request.Confirmation != "TRANSFER TENANT ADMIN")
            return Results.Forbid();
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        if (!await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("tenant-admin-transfer", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        if (!await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        var rows = await QueryPartitionAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t AND c.status='Active'",
            tenantUid, cancellationToken, ("@t", tenantUid));
        var target = rows.SingleOrDefault(x => Text(x, "membershipId") == request.ToMembershipId);
        if (target is null || Text(target, "role") != TenantRole.TenantAdmin.ToString()) return Bad(context, "target_not_active_tenant_admin");
        var targetAccount = await AccountByUserIdAsync(Text(target, "userId"), cancellationToken);
        if (targetAccount is null || !StatusIsActive(targetAccount)) return Bad(context, "target_tenant_admin_account_not_active");
        var currentPrimary = rows.Where(x => Bool(x, "isPrimaryTenantAdmin")).ToArray();
        if (currentPrimary.Length != 1)
            return Conflict(context, "primary_tenant_admin_invariant_invalid", "Exactly one active primary TenantAdmin is required before transfer.");
        var currentPrimaryAccount = await AccountByUserIdAsync(Text(currentPrimary[0], "userId"), cancellationToken);
        if (currentPrimaryAccount is null || !StatusIsActive(currentPrimaryAccount))
            return Conflict(context, "primary_tenant_admin_invariant_invalid", "The current primary TenantAdmin account is not active.");
        if (Text(currentPrimary[0], "id") == Text(target, "id"))
        {
            await AuditAsync(context, actor, "identity_tenant_admin_transferred", Text(target, "userId"), tenantUid, reason, "success", cancellationToken);
            return Results.Ok(new { primaryMembershipId = request.ToMembershipId, changed = false });
        }

        await BeginAuditAsync(context, actor, "identity_tenant_admin_transferred", Text(target, "userId"), tenantUid, reason, cancellationToken);
        var batch = Container("TenantMemberships").CreateTransactionalBatch(new PartitionKey(tenantUid));
        foreach (var unchanged in rows.Where(x => Text(x, "id") != Text(currentPrimary[0], "id") && Text(x, "id") != Text(target, "id")))
            batch.ReadItem(Text(unchanged, "id"), BatchMatch(unchanged));
        batch.PatchItem(Text(currentPrimary[0], "id"),
            [PatchOperation.Set("/isPrimaryTenantAdmin", false), PatchOperation.Set("/updatedAt", DateTime.UtcNow)], BatchPatchMatch(currentPrimary[0]));
        batch.PatchItem(Text(target, "id"),
            [PatchOperation.Set("/isPrimaryTenantAdmin", true), PatchOperation.Set("/updatedAt", DateTime.UtcNow)], BatchPatchMatch(target));
        using var response = await batch.ExecuteAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            await AuditAsync(context, actor, "identity_tenant_admin_transferred", Text(target, "userId"), tenantUid, reason, "conflict", cancellationToken);
            return Conflict(context, "admin_invariant_concurrency_conflict", "TenantAdmin state changed concurrently; retry from a fresh read.");
        }
        await AuditAsync(context, actor, "identity_tenant_admin_transferred", Text(target, "userId"), tenantUid, reason, "success", cancellationToken);
        return Results.Ok(new { primaryMembershipId = request.ToMembershipId });
    }

    public async Task<IResult> UserMembershipsAsync(HttpContext context, string userId, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        var memberships = await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@u", cancellationToken, ("@u", userId));
        return Results.Ok(await EnrichMembershipsAsync(memberships, cancellationToken));
    }

    public async Task<IResult> GlobalUsersAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        return Results.Ok((await QueryPartitionAsync("UserAccounts", "SELECT * FROM c", "global", cancellationToken)).Select(SafeUser));
    }

    public async Task<IResult> GlobalTenantsAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        return Results.Ok((await QueryAsync("TenantIdentity", "SELECT * FROM c", cancellationToken)).Select(SafeTenant));
    }

    public async Task<IResult> AdminEmailChangeAsync(HttpContext context, string userId, AdminEmailChangeRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.SuperAdmin)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        if (!IsSafeEmail(request.NewEmail)) return Bad(context, "email_change_invalid");
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("admin-email-change", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null) return Results.NotFound();
        var normalized = IdentitySecurityService.NormalizeEmail(request.NewEmail);
        var duplicate = (await QueryPartitionAsync("UserAccounts", "SELECT * FROM c WHERE c.normalizedEmail=@e", "global", cancellationToken,
            ("@e", normalized))).Any(x => Text(x, "userId") != userId);
        if (duplicate) return Conflict(context, "email_not_unique", "Email is already in use.");
        var legacy = await LegacyForAccountAsync(account, cancellationToken);
        if (legacy is null) return Results.NotFound();

        await BeginAuditAsync(context, actor, "identity_admin_email_changed", userId, null, reason, cancellationToken);
        AccountMutationLease lease;
        try
        {
            lease = await BeginAccountMutationAsync(account, "email", requireActive: true, cancellationToken);
        }
        catch (IdentityConcurrencyException)
        {
            await AuditAsync(context, actor, "identity_admin_email_changed", userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        legacy = await LegacyForAccountAsync(lease.Original, cancellationToken);
        if (legacy is null)
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            throw new InvalidOperationException("identity_legacy_account_missing_after_lease");
        }
        var originalEmail = legacy.Email;
        var legacyUpdated = false;
        var version = Long(lease.Original, "sessionVersion", 1) + (request.RevokeSessions ? 1 : 0);
        try
        {
            legacy.Email = request.NewEmail.Trim();
            await _legacy.PatchUserLoginEmailAsync(legacy.Id, legacy.TenantId, legacy.Email, cancellationToken);
            legacyUpdated = true;
            var operations = new List<PatchOperation>
            {
                PatchOperation.Set("/loginEmail", legacy.Email), PatchOperation.Set("/normalizedEmail", normalized),
                PatchOperation.Set("/sessionVersion", version), PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")),
                PatchOperation.Set("/forcePasswordChange", request.ForcePasswordChange)
            };
            if (!string.Equals(Text(lease.Original, "normalizedEmail"), normalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/emailVerified", false));
                foreach (var metadata in new[] { "emailVerifiedAt", "emailVerificationProvider", "emailVerificationRequestId" })
                    if (lease.Original.ContainsKey(metadata)) operations.Add(PatchOperation.Remove("/" + metadata));
            }
            await CompleteAccountMutationAsync(lease, operations, cancellationToken);
        }
        catch (Exception error)
        {
            if (legacyUpdated)
            {
                legacy.Email = originalEmail;
                await TryRestoreLegacyEmailAsync(legacy.Id, legacy.TenantId, originalEmail);
            }
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            await TryRecordSecurityReconciliationAsync(userId, "email", error.GetType().Name, cancellationToken);
            throw;
        }
        await AuditAsync(context, actor, "identity_admin_email_changed", userId, null, reason, "success", cancellationToken);
        return Results.Ok(new { userId, normalizedEmail = normalized, sessionsRevoked = request.RevokeSessions, forcePasswordChange = request.ForcePasswordChange });
    }

    public async Task<IResult> ResetPasswordAsync(HttpContext context, string userId, AdminPasswordResetRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        if (!IsPasswordStrong(request.NewPassword)) return Bad(context, "password_policy_failed");
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("admin-password-reset", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null) return Results.NotFound();
        var legacy = await LegacyForAccountAsync(account, cancellationToken);
        if (legacy is null) return Results.NotFound();
        await BeginAuditAsync(context, actor, "identity_admin_password_reset", userId, null, reason, cancellationToken);
        var hash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        try
        {
            await UpdatePasswordPairAsync(account, hash, request.ForceChangeAtNextLogin, cancellationToken);
        }
        catch (IdentityConcurrencyException)
        {
            await AuditAsync(context, actor, "identity_admin_password_reset", userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        await AuditAsync(context, actor, "identity_admin_password_reset", userId, null, reason, "success", cancellationToken);
        return Results.Ok(new { userId, passwordReset = true, sessionsRevoked = true, forceChangeAtNextLogin = request.ForceChangeAtNextLogin });
    }

    public async Task<IResult> TemporaryPasswordAsync(HttpContext context, string userId, TemporaryPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("temporary-password", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null) return Results.NotFound();
        if (string.Equals(Text(account, "globalRole"), UserRole.SuperAdmin.ToString(), StringComparison.Ordinal))
            return Conflict(context, "superadmin_temporary_password_protected",
                "Temporary passwords cannot be issued to a SuperAdmin account; use a known-password reset path.");
        if (await LegacyForAccountAsync(account, cancellationToken) is null) return Results.NotFound();

        await BeginAuditAsync(context, actor, "identity_admin_temporary_password_issued", userId, null, reason, cancellationToken);
        var temporary = $"Tmp-{Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).Replace('/', 'A').Replace('+', 'B').TrimEnd('=')}-9aA";
        var hash = BCrypt.Net.BCrypt.HashPassword(temporary, 12);
        PasswordMutationResult mutation;
        try
        {
            using var operation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            operation.CancelAfter(TimeSpan.FromSeconds(15));
            mutation = await UpdatePasswordPairAsync(account, hash, forcePasswordChange: true, operation.Token);
        }
        catch (IdentityConcurrencyException)
        {
            await AuditAsync(context, actor, "identity_admin_temporary_password_issued", userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        try
        {
            await AuditAsync(context, actor, "identity_admin_temporary_password_issued", userId, null, reason, "success", cancellationToken);
        }
        catch (Exception auditError)
        {
            var compensated = false;
            try
            {
                using var compensation = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                compensated = await TryCompensatePasswordMutationAsync(mutation, compensation.Token);
            }
            catch (Exception rollbackError)
            {
                _logger.LogCritical("Temporary password rollback failed category={Category}", rollbackError.GetType().Name);
            }
            if (!compensated)
            {
                using var failClosed = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                var accountFailedClosed = await TryFailPasswordMutationClosedAsync(mutation.AccountId, failClosed.Token);
                using var reconciliation = new CancellationTokenSource(TimeSpan.FromSeconds(5));
                await TryRecordSecurityReconciliationAsync(mutation.AccountId, "password",
                    accountFailedClosed ? "temporary_password_compensation_failed_closed" : "temporary_password_fail_closed_failed",
                    reconciliation.Token);
                if (!accountFailedClosed)
                    throw new InvalidOperationException("temporary_password_fail_closed_failed", auditError);
            }
            throw;
        }
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers.Pragma = "no-cache";
        return Results.Ok(new { userId, temporaryPassword = temporary, shownOnce = true, forceChangeAtNextLogin = true });
    }

    public async Task<IResult> ForceSignOutAsync(
        HttpContext context,
        string userId,
        IdentityReasonRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.PasswordAndSessions)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        if (!TryNormalizeAuditReason(request.Reason, out var reason)) return Bad(context, "reason_invalid");
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("force-sign-out", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null) return Results.NotFound();
        await BeginAuditAsync(context, actor, "identity_force_sign_out", userId, null, reason, cancellationToken);
        long? version;
        try
        {
            version = await BumpUserSessionsAsync(userId, cancellationToken);
        }
        catch (Exception error) when (error is CosmosException or OperationCanceledException or TimeoutException)
        {
            await RecordIndeterminateMutationAsync(context, actor, "identity_force_sign_out", userId, null,
                reason, "force-sign-out", error.GetType().Name);
            throw;
        }
        if (version is null)
        {
            await AuditAsync(context, actor, "identity_force_sign_out", userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        await AuditAsync(context, actor, "identity_force_sign_out", userId, null, reason, "success", cancellationToken);
        return Results.Ok(new { userId, sessionVersion = version.Value });
    }

    public Task<IResult> DisableAccountAsync(HttpContext context, string userId, AdminAccountStateRequest request, CancellationToken cancellationToken) =>
        ChangeAccountStateAsync(context, userId, request.Reason, active: false, cancellationToken);

    public Task<IResult> RestoreAccountAsync(HttpContext context, string userId, AdminAccountStateRequest request, CancellationToken cancellationToken) =>
        ChangeAccountStateAsync(context, userId, request.Reason, active: true, cancellationToken);

    private async Task<IResult> ChangeAccountStateAsync(HttpContext context, string userId, string reason, bool active, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.SuperAdmin)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        if (!TryNormalizeAuditReason(reason, out var normalizedReason)) return Bad(context, "reason_invalid");
        reason = normalizedReason;
        var auditType = active ? "identity_account_restored" : "identity_account_disabled";
        if (!active && userId == Text(actor.Account, "userId"))
        {
            await AuditAsync(context, actor, auditType, userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "self_disable_protected", "A SuperAdmin cannot disable the current account.");
        }
        await using var adminInvariantLease = await TryAcquireAdminInvariantLeaseAsync("account-state", cancellationToken);
        if (adminInvariantLease is null)
            return Conflict(context, "tenant_admin_invariant_busy", "A tenant administration mutation is already in progress; retry.");
        using var adminInvariantBudget = AdminInvariantOperationBudget(cancellationToken, adminInvariantLease);
        cancellationToken = adminInvariantBudget.Token;
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null) return Results.NotFound();
        if (!IsCrstSyntheticValidationAccount(account))
        {
            await AuditAsync(context, actor, auditType, userId, null, reason, "denied_non_synthetic", cancellationToken);
            return Results.Forbid();
        }
        List<JsonObject>? superAdminGuards = null;
        if (!active && Text(account, "globalRole") == UserRole.SuperAdmin.ToString())
        {
            var activeSuperAdmins = await QueryPartitionAsync("UserAccounts",
                "SELECT * FROM c WHERE c.globalRole='SuperAdmin' AND c.status='Active'", "global", cancellationToken);
            superAdminGuards = new List<JsonObject>(activeSuperAdmins.Count);
            foreach (var candidate in activeSuperAdmins)
            {
                var current = await AccountByUserIdAsync(Text(candidate, "id"), cancellationToken);
                if (current is not null && StatusIsActive(current) && Text(current, "globalRole") == UserRole.SuperAdmin.ToString())
                    superAdminGuards.Add(current);
            }
            if (superAdminGuards.Count <= 1)
            {
                await AuditAsync(context, actor, auditType, userId, null, reason, "conflict", cancellationToken);
                return Conflict(context, "final_superadmin_protected", "The final active SuperAdmin cannot be disabled.");
            }
        }
        if (!active && (await QueryAsync("TenantMemberships",
                "SELECT TOP 2 * FROM c WHERE c.userId=@u AND c.status='Active' AND c.role='TenantAdmin'",
                cancellationToken, ("@u", userId))).Count > 0)
        {
            await AuditAsync(context, actor, auditType, userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "tenant_admin_account_disable_requires_membership_change",
                "Transfer and remove active TenantAdmin memberships before disabling this account.");
        }
        var legacy = await LegacyForAccountAsync(account, cancellationToken);
        if (legacy is null) return Results.NotFound();

        await BeginAuditAsync(context, actor, auditType, userId, null, reason, cancellationToken);
        AccountMutationLease lease;
        try
        {
            lease = await BeginAccountMutationAsync(account, "account-state", requireActive: !active, cancellationToken, superAdminGuards);
        }
        catch (IdentityConcurrencyException)
        {
            await AuditAsync(context, actor, auditType, userId, null, reason, "conflict", cancellationToken);
            return Conflict(context, "identity_account_concurrency_conflict", "Account state changed concurrently; retry from a fresh read.");
        }
        legacy = await LegacyForAccountAsync(lease.Original, cancellationToken);
        if (legacy is null)
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            throw new InvalidOperationException("identity_legacy_account_missing_after_lease");
        }
        var originalActive = legacy.IsActive;
        var status = active ? IdentityRecordStatus.Active.ToString() : IdentityRecordStatus.Suspended.ToString();
        var version = Long(lease.Original, "sessionVersion", 1) + 1;
        var legacyUpdated = false;
        try
        {
            legacy.IsActive = active;
            await _legacy.PatchUserActiveStateAsync(legacy.Id, legacy.TenantId, active, cancellationToken);
            legacyUpdated = true;
            await CompleteAccountMutationAsync(lease,
                [PatchOperation.Set("/sessionVersion", version), PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N"))],
                cancellationToken, finalStatus: status);
        }
        catch (Exception error)
        {
            if (legacyUpdated)
            {
                legacy.IsActive = originalActive;
                await TryRestoreLegacyActiveStateAsync(legacy.Id, legacy.TenantId, originalActive);
            }
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            await TryRecordSecurityReconciliationAsync(userId, "account-state", error.GetType().Name, cancellationToken);
            throw;
        }
        await AuditAsync(context, actor, auditType, userId, null, reason, "success", cancellationToken);
        return Results.Ok(new { userId, status, sessionsRevoked = true });
    }

    public async Task<IResult> TenantAuditAsync(HttpContext context, string tenantUid, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !await CanManageTenant(actor, tenantUid, cancellationToken)) return Results.Forbid();
        return Results.Ok((await QueryPartitionAsync("SecurityAuditEvents",
            "SELECT TOP 200 * FROM c WHERE c.targetTenantUid=@t ORDER BY c.createdAt DESC", "global", cancellationToken, ("@t", tenantUid))).Select(SafeAudit));
    }

    public async Task<IResult> GlobalAuditAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        return Results.Ok((await QueryPartitionAsync("SecurityAuditEvents", "SELECT TOP 200 * FROM c ORDER BY c.createdAt DESC", "global", cancellationToken)).Select(SafeAudit));
    }

    public async Task<IResult> MigrationConflictsAsync(HttpContext context, CancellationToken cancellationToken)
    {
        if (!Enabled(IdentityFeaturePolicy.ManagementRead)) return Disabled(context);
        var actor = await ActorAsync(context, cancellationToken);
        if (actor is null || !actor.SuperAdmin) return Results.Forbid();
        var rows = await QueryPartitionAsync("IdentityMigration",
            "SELECT TOP 500 * FROM c WHERE c.type='IdentityMigrationConflict' OR c.type='IdentityLoginReconciliation' OR c.type='IdentitySecurityMutationReconciliation' OR IS_DEFINED(c.category)",
            "global", cancellationToken);
        return Results.Ok(rows.Select(x => new
        {
            id = Text(x, "id"),
            type = Text(x, "type"),
            category = Text(x, "category"),
            tenantUid = Text(x, "tenantUid"),
            legacyTenantId = Text(x, "legacyTenantId"),
            userId = Text(x, "userId", Text(x, "targetUserId")),
            requestId = Text(x, "requestId"),
            operation = Text(x, "mutationType"),
            safeCode = Text(x, "errorCode", Text(x, "safeDetail")),
            status = Text(x, "status"),
            createdAt = Text(x, "createdAt")
        }));
    }

    private async Task<Actor?> ActorAsync(HttpContext context, CancellationToken cancellationToken)
    {
        var legacyUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(legacyUserId) || _client is null) return null;
        var account = context.Items.TryGetValue(ValidatedAccountItemKey, out var cached) && cached is JsonObject value
            ? value
            : await AccountByLegacyUserIdAsync(legacyUserId, cancellationToken);
        if (EvaluateSession(account, context.User).Status != IdentitySessionValidationStatus.Valid || account is null) return null;
        var superAdmin = context.User.IsInRole(UserRole.SuperAdmin.ToString());
        var actorRole = superAdmin
            ? UserRole.SuperAdmin.ToString()
            : context.User.FindFirstValue("tenantRole") ?? context.User.FindFirstValue(ClaimTypes.Role) ?? UserRole.Viewer.ToString();
        return new(account, legacyUserId,
            Text(account, "legacyTenantId", context.User.FindFirstValue("tenantId") ?? string.Empty),
            context.User.FindFirstValue("tenantUid"), superAdmin, actorRole);
    }

    private async Task<bool> CanAccessTenant(Actor actor, string tenantUid, CancellationToken cancellationToken)
    {
        var tenant = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);
        if (tenant is null || !StatusIsActive(tenant)) return false;
        return actor.SuperAdmin || string.Equals(actor.ActiveTenantUid, tenantUid, StringComparison.Ordinal) &&
            (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active'", tenantUid, cancellationToken,
            ("@u", Text(actor.Account, "userId")), ("@t", tenantUid))).Count == 1;
    }

    private async Task<bool> CanManageTenant(Actor actor, string tenantUid, CancellationToken cancellationToken)
    {
        var tenant = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);
        if (tenant is null || !StatusIsActive(tenant)) return false;
        return actor.SuperAdmin || string.Equals(actor.ActiveTenantUid, tenantUid, StringComparison.Ordinal) &&
            (await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active' AND c.role='TenantAdmin'", tenantUid, cancellationToken,
            ("@u", Text(actor.Account, "userId")), ("@t", tenantUid))).Count == 1;
    }

    private async Task<AdminInvariantLease?> TryAcquireAdminInvariantLeaseAsync(string operation, CancellationToken cancellationToken)
    {
        const string lockId = "tenant-admin-invariant-global-lock";
        const string partition = "global";
        var ownerId = Guid.NewGuid().ToString("N");
        var now = DateTime.UtcNow;
        var document = new JsonObject
        {
            ["id"] = lockId,
            ["requestPartition"] = partition,
            ["type"] = "TenantAdminInvariantLock",
            ["ownerId"] = ownerId,
            ["operation"] = operation,
            ["acquiredAt"] = now,
            ["expiresAt"] = now.AddMinutes(2)
        };
        try
        {
            await Container("IdentityRequests").CreateItemAsync(document, new PartitionKey(partition),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            var existing = await ReadAsync("IdentityRequests", lockId, partition, cancellationToken);
            if (existing is null || Date(existing, "expiresAt", DateTime.MaxValue) > now) return null;
            try
            {
                await Container("IdentityRequests").ReplaceItemAsync(document, lockId, new PartitionKey(partition),
                    new ItemRequestOptions { IfMatchEtag = Text(existing, "_etag") }, cancellationToken);
            }
            catch (CosmosException replaceError) when (replaceError.StatusCode is System.Net.HttpStatusCode.PreconditionFailed or System.Net.HttpStatusCode.Conflict)
            {
                return null;
            }
        }
        var lease = new AdminInvariantLease(async renewalToken =>
        {
            try
            {
                var current = await ReadAsync("IdentityRequests", lockId, partition, renewalToken);
                if (current is null || Text(current, "ownerId") != ownerId) return false;
                var renewedAt = DateTime.UtcNow;
                var renewed = new JsonObject
                {
                    ["id"] = lockId,
                    ["requestPartition"] = partition,
                    ["type"] = "TenantAdminInvariantLock",
                    ["ownerId"] = ownerId,
                    ["operation"] = operation,
                    ["acquiredAt"] = Date(current, "acquiredAt", now),
                    ["renewedAt"] = renewedAt,
                    ["expiresAt"] = renewedAt.AddMinutes(2)
                };
                await Container("IdentityRequests").ReplaceItemAsync(renewed, lockId, new PartitionKey(partition),
                    new ItemRequestOptions { IfMatchEtag = RequireEtag(current) }, renewalToken);
                return true;
            }
            catch (Exception renewalError)
            {
                using var reconciliation = new CancellationTokenSource(TimeSpan.FromSeconds(2));
                await TryRecordSecurityReconciliationAsync(ownerId, "tenant-admin-invariant-lock-renewal",
                    renewalError.GetType().Name, reconciliation.Token);
                return false;
            }
        }, async () =>
        {
            try
            {
                var current = await ReadAsync("IdentityRequests", lockId, partition, CancellationToken.None);
                if (current is null || Text(current, "ownerId") != ownerId) return;
                await Container("IdentityRequests").DeleteItemAsync<object>(lockId, new PartitionKey(partition),
                    new ItemRequestOptions { IfMatchEtag = Text(current, "_etag") }, CancellationToken.None);
            }
            catch (Exception releaseError)
            {
                await TryRecordSecurityReconciliationAsync(ownerId, "tenant-admin-invariant-lock-release",
                    releaseError.GetType().Name, CancellationToken.None);
            }
        });
        lease.Start();
        return lease;
    }

    private static CancellationTokenSource AdminInvariantOperationBudget(CancellationToken requestToken, AdminInvariantLease lease)
    {
        var budget = CancellationTokenSource.CreateLinkedTokenSource(requestToken, lease.LostToken);
        budget.CancelAfter(TimeSpan.FromSeconds(45));
        return budget;
    }

    private async Task<IResult?> ProtectMembershipMutationAsync(
        HttpContext context,
        Actor actor,
        JsonObject membership,
        bool deactivatesAuthoritativeLogin,
        CancellationToken cancellationToken)
    {
        var targetAccount = await AccountByUserIdAsync(Text(membership, "userId"), cancellationToken);
        if (targetAccount is null)
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), Text(membership, "tenantUid"),
                "target-account-unavailable", "conflict", cancellationToken);
            return Conflict(context, "membership_target_account_unavailable", "The membership account cannot be verified.");
        }
        if (!StatusIsActive(targetAccount))
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), Text(membership, "tenantUid"),
                "target-account-not-active", "conflict", cancellationToken);
            return Conflict(context, "membership_target_account_not_active", "The membership account must be active before membership mutation.");
        }
        if (!actor.SuperAdmin && string.Equals(Text(targetAccount, "globalRole"), UserRole.SuperAdmin.ToString(), StringComparison.Ordinal))
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), Text(membership, "tenantUid"),
                "superadmin-target-protected", "rejected", cancellationToken);
            return Results.Forbid();
        }
        if (!deactivatesAuthoritativeLogin) return null;

        var legacyTenantId = Text(targetAccount, "legacyTenantId");
        var tenantUid = Text(membership, "tenantUid");
        if (string.IsNullOrWhiteSpace(legacyTenantId) || string.IsNullOrWhiteSpace(tenantUid))
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), tenantUid,
                "authoritative-login-unresolved", "conflict", cancellationToken);
            return Conflict(context, "authoritative_login_membership_unresolved", "The authoritative login membership cannot be verified.");
        }
        var tenant = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);
        if (tenant is null || string.IsNullOrWhiteSpace(Text(tenant, "legacyTenantId")))
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), tenantUid,
                "authoritative-login-unresolved", "conflict", cancellationToken);
            return Conflict(context, "authoritative_login_membership_unresolved", "The authoritative login membership cannot be verified.");
        }
        if (string.Equals(Text(tenant, "legacyTenantId"), legacyTenantId, StringComparison.Ordinal))
        {
            await AuditAsync(context, actor, "identity_membership_mutation_denied", Text(membership, "userId"), tenantUid,
                "authoritative-home-membership-protected", "conflict", cancellationToken);
            return Conflict(context, "authoritative_login_membership_protected",
                "An authoritative home membership cannot change role or be suspended, revoked, or removed through membership management.");
        }
        return null;
    }

    private async Task<List<JsonObject>> UsableActiveAdmins(string tenantUid, CancellationToken cancellationToken)
    {
        var memberships = await QueryPartitionAsync("TenantMemberships",
            "SELECT * FROM c WHERE c.tenantUid=@t AND c.status='Active' AND c.role='TenantAdmin'", tenantUid, cancellationToken,
            ("@t", tenantUid));
        var usable = new List<JsonObject>(memberships.Count);
        foreach (var membership in memberships)
        {
            var account = await AccountByUserIdAsync(Text(membership, "userId"), cancellationToken);
            if (account is not null && StatusIsActive(account)) usable.Add(membership);
        }
        return usable;
    }

    private async Task<long?> BumpUserSessionsAsync(string userId, CancellationToken cancellationToken)
    {
        var account = await AccountByUserIdAsync(userId, cancellationToken);
        if (account is null || !StatusIsActive(account)) return null;
        var sessionVersion = Long(account, "sessionVersion", 1) + 1;
        try
        {
            await Container("UserAccounts").PatchItemAsync<object>(Text(account, "id"), new PartitionKey("global"),
                [PatchOperation.Set("/sessionVersion", sessionVersion),
                 PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")),
                 PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
                requestOptions: PatchMatch(account), cancellationToken: cancellationToken);
            return sessionVersion;
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            return null;
        }
    }

    private async Task<IReadOnlyList<object>> EnrichMembershipsAsync(
        IReadOnlyList<JsonObject> memberships,
        CancellationToken cancellationToken)
    {
        var tenants = new Dictionary<string, JsonObject?>(StringComparer.Ordinal);
        foreach (var tenantUid in memberships.Select(value => Text(value, "tenantUid")).Where(value => value.Length > 0).Distinct(StringComparer.Ordinal))
            tenants[tenantUid] = await ReadAsync("TenantIdentity", tenantUid, tenantUid, cancellationToken);

        return memberships.OrderBy(membership =>
        {
            tenants.TryGetValue(Text(membership, "tenantUid"), out var tenant);
            return tenant is null ? string.Empty : Text(tenant, "canonicalSlug");
        }, StringComparer.Ordinal).Select(membership =>
        {
            var tenantUid = Text(membership, "tenantUid");
            tenants.TryGetValue(tenantUid, out var tenant);
            return (object)new
            {
                membershipId = Text(membership, "membershipId", Text(membership, "id")),
                tenantUid,
                legacyTenantId = tenant is null ? string.Empty : Text(tenant, "legacyTenantId"),
                canonicalSlug = tenant is null ? string.Empty : Text(tenant, "canonicalSlug"),
                displayName = tenant is null ? string.Empty : Text(tenant, "displayName"),
                userId = Text(membership, "userId"),
                role = Text(membership, "role"),
                status = Text(membership, "status"),
                isPrimaryTenantAdmin = Bool(membership, "isPrimaryTenantAdmin")
            };
        }).ToArray();
    }

    private string? IssueTenantToken(ClaimsPrincipal principal, Actor actor, JsonObject membership, JsonObject tenant, DateTimeOffset expiresAt)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secret = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
            return null;

        var role = actor.SuperAdmin ? UserRole.SuperAdmin.ToString() : Text(membership, "role");
        var issuedAt = DateTimeOffset.UtcNow;
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, actor.LegacyUserId),
            new(ClaimTypes.Email, principal.FindFirstValue(ClaimTypes.Email) ?? Text(actor.Account, "loginEmail")),
            new(ClaimTypes.Name, principal.FindFirstValue(ClaimTypes.Name) ?? actor.LegacyUserId),
            new(ClaimTypes.Role, role),
            new("tenantId", Text(tenant, "legacyTenantId", Text(tenant, "canonicalSlug"))),
            new("tenantUid", Text(tenant, "tenantUid")),
            new("tenantRole", Text(membership, "role")),
            new("membershipId", Text(membership, "membershipId")),
            new("sessionVersion", Long(actor.Account, "sessionVersion", 1).ToString(CultureInfo.InvariantCulture)),
            new(JwtRegisteredClaimNames.Jti, principal.FindFirstValue(JwtRegisteredClaimNames.Jti) ?? Guid.NewGuid().ToString("N")),
            new(JwtRegisteredClaimNames.Iat, issuedAt.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture), ClaimValueTypes.Integer64)
        };
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            notBefore: issuedAt.UtcDateTime.AddSeconds(-5),
            expires: expiresAt.UtcDateTime,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<JsonObject?> AccountByLegacyUserIdAsync(string legacyUserId, CancellationToken cancellationToken)
    {
        var rows = await QueryPartitionAsync("UserAccounts", "SELECT TOP 2 * FROM c WHERE c.legacyUserId=@id", "global", cancellationToken,
            ("@id", legacyUserId));
        if (rows.Count != 1) return null;
        var account = await ReadAsync("UserAccounts", Text(rows[0], "id"), "global", cancellationToken);
        if (account is not null && IsCompleteSecurityMutationPending(account) &&
            Date(account, "securityMutationStartedAt", DateTime.MinValue) + SecurityMutationLeaseDuration <= DateTime.UtcNow)
        {
            await RecoverExpiredAccountMutationAsync(account, cancellationToken);
            account = await ReadAsync("UserAccounts", Text(rows[0], "id"), "global", cancellationToken);
        }
        return account;
    }

    private Task<JsonObject?> AccountByUserIdAsync(string userId, CancellationToken cancellationToken) =>
        ReadAsync("UserAccounts", userId, "global", cancellationToken);

    private async Task<pumpkin_net_models.Models.User?> LegacyForAccountAsync(
        JsonObject account,
        CancellationToken cancellationToken)
    {
        var legacyUserId = Text(account, "legacyUserId");
        var legacyTenantId = Text(account, "legacyTenantId");
        var hasLegacyUserId = !string.IsNullOrWhiteSpace(legacyUserId);
        var hasLegacyTenantId = !string.IsNullOrWhiteSpace(legacyTenantId);
        using var lookupBudget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        lookupBudget.CancelAfter(TimeSpan.FromSeconds(5));
        if (hasLegacyUserId || hasLegacyTenantId)
        {
            if (!hasLegacyUserId || !hasLegacyTenantId) return null;
            return await _legacy.GetUserByIdAsync(legacyTenantId, legacyUserId, lookupBudget.Token);
        }
        return await _legacy.GetUserByEmailAsync(Text(account, "loginEmail"), lookupBudget.Token);
    }

    private async Task<PasswordMutationResult> UpdatePasswordPairAsync(
        JsonObject account,
        string hash,
        bool forcePasswordChange,
        CancellationToken cancellationToken,
        string? expectedCurrentPassword = null,
        Func<Task>? pendingLeaseAcquired = null)
    {
        var lease = await BeginAccountMutationAsync(account, "password", requireActive: true, cancellationToken);
        if (pendingLeaseAcquired is not null)
        {
            try { await pendingLeaseAcquired(); }
            catch
            {
                await TryRollbackAccountMutationAsync(lease, cancellationToken);
                throw;
            }
        }
        var legacy = await LegacyForAccountAsync(lease.Original, cancellationToken);
        if (legacy is null)
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            throw new InvalidOperationException("identity_legacy_account_missing_after_lease");
        }
        if (expectedCurrentPassword is not null && !BCrypt.Net.BCrypt.Verify(expectedCurrentPassword, legacy.PasswordHash))
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            throw new IdentityCurrentPasswordRejectedException();
        }
        var originalHash = legacy.PasswordHash;
        var legacyUpdated = false;
        try
        {
            legacy.PasswordHash = hash;
            await _legacy.PatchUserPasswordHashAsync(legacy.Id, legacy.TenantId, hash, cancellationToken);
            legacyUpdated = true;
            var sessionVersion = Long(lease.Original, "sessionVersion", 1) + 1;
            var securityStamp = Guid.NewGuid().ToString("N");
            await CompleteAccountMutationAsync(lease,
                [PatchOperation.Set("/passwordHash", hash),
                  PatchOperation.Set("/forcePasswordChange", forcePasswordChange),
                  PatchOperation.Set("/securityStamp", securityStamp),
                  PatchOperation.Set("/sessionVersion", sessionVersion)], cancellationToken);
            return new PasswordMutationResult(
                Text(lease.Original, "id", Text(lease.Original, "userId")),
                originalHash,
                Bool(lease.Original, "forcePasswordChange"),
                hash,
                sessionVersion,
                securityStamp);
        }
        catch (Exception error)
        {
            if (legacyUpdated)
            {
                legacy.PasswordHash = originalHash;
                await TryRestoreLegacyPasswordHashAsync(legacy.Id, legacy.TenantId, originalHash);
            }
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            await TryRecordSecurityReconciliationAsync(Text(lease.Original, "userId"), "password", error.GetType().Name, cancellationToken);
            throw;
        }
    }

    private async Task<bool> TryCompensatePasswordMutationAsync(PasswordMutationResult mutation, CancellationToken cancellationToken)
    {
        var current = await AccountByUserIdAsync(mutation.AccountId, cancellationToken);
        if (!PasswordMutationStillCurrent(current, mutation)) return false;

        AccountMutationLease lease;
        try
        {
            lease = await BeginAccountMutationAsync(current!, "password", requireActive: true, cancellationToken);
        }
        catch (IdentityConcurrencyException)
        {
            return false;
        }
        if (!PasswordMutationStillCurrent(lease.Original, mutation))
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            return false;
        }

        var legacy = await LegacyForAccountAsync(lease.Original, cancellationToken);
        if (legacy is null || !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(legacy.PasswordHash), Encoding.UTF8.GetBytes(mutation.AppliedHash)))
        {
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            return false;
        }

        legacy.PasswordHash = mutation.PreviousHash;
        var legacyUpdated = false;
        try
        {
            await _legacy.PatchUserPasswordHashAsync(legacy.Id, legacy.TenantId, mutation.PreviousHash, cancellationToken);
            legacyUpdated = true;
            await CompleteAccountMutationAsync(lease,
                [PatchOperation.Set("/passwordHash", mutation.PreviousHash),
                 PatchOperation.Set("/forcePasswordChange", mutation.PreviousForcePasswordChange),
                 PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")),
                 PatchOperation.Set("/sessionVersion", mutation.SessionVersion + 1)], cancellationToken);
            return true;
        }
        catch
        {
            if (legacyUpdated)
            {
                legacy.PasswordHash = mutation.AppliedHash;
                await TryRestoreLegacyPasswordHashAsync(legacy.Id, legacy.TenantId, mutation.AppliedHash);
            }
            await TryRollbackAccountMutationAsync(lease, cancellationToken);
            throw;
        }
    }

    private async Task<bool> TryFailPasswordMutationClosedAsync(string accountId, CancellationToken cancellationToken)
    {
        try
        {
            var current = await AccountByUserIdAsync(accountId, cancellationToken);
            if (current is null) return false;
            var alreadyPending = string.Equals(Text(current, "status"), "SecurityMutationPending", StringComparison.Ordinal);
            if (alreadyPending && (!IsCompleteSecurityMutationPending(current) ||
                Text(current, "securityMutationKind") is not ("password" or UndisclosedTemporaryPasswordMutationKind)))
                return false;
            if (alreadyPending && Text(current, "securityMutationKind") == UndisclosedTemporaryPasswordMutationKind)
                return true;
            var mutationId = alreadyPending ? Text(current, "securityMutationId") : Guid.NewGuid().ToString("N");
            var previousStatus = alreadyPending
                ? Text(current, "securityMutationPreviousStatus", IdentityRecordStatus.Suspended.ToString())
                : Text(current, "status", IdentityRecordStatus.Suspended.ToString());
            var startedAt = alreadyPending
                ? Date(current, "securityMutationStartedAt", DateTime.UtcNow)
                : DateTime.UtcNow;
            await Container("UserAccounts").PatchItemAsync<object>(Text(current, "id"), new PartitionKey("global"),
                [PatchOperation.Set("/status", "SecurityMutationPending"),
                 PatchOperation.Set("/securityMutationId", mutationId),
                 PatchOperation.Set("/securityMutationKind", UndisclosedTemporaryPasswordMutationKind),
                 PatchOperation.Set("/securityMutationPreviousStatus", previousStatus),
                 PatchOperation.Set("/securityMutationStartedAt", startedAt),
                 PatchOperation.Set("/securityMutationAutoRecoveryBlocked", true),
                 PatchOperation.Set("/securityMutationFailureReason", "temporary_password_not_disclosed_compensation_incomplete"),
                 PatchOperation.Set("/forcePasswordChange", true),
                 PatchOperation.Set("/sessionVersion", Long(current, "sessionVersion", 1) + 1),
                 PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")),
                 PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
                requestOptions: PatchMatch(current), cancellationToken: cancellationToken);
            var readback = await AccountByUserIdAsync(accountId, cancellationToken);
            return readback is not null && IsCompleteSecurityMutationPending(readback) &&
                Text(readback, "securityMutationId") == mutationId &&
                Text(readback, "securityMutationKind") == UndisclosedTemporaryPasswordMutationKind &&
                Bool(readback, "securityMutationAutoRecoveryBlocked") && Bool(readback, "forcePasswordChange");
        }
        catch (Exception error)
        {
            _logger.LogCritical("Temporary password fail-closed transition failed category={Category}", error.GetType().Name);
            return false;
        }
    }

    private static bool PasswordMutationStillCurrent(JsonObject? account, PasswordMutationResult mutation) =>
        account is not null &&
        Long(account, "sessionVersion", 1) == mutation.SessionVersion &&
        string.Equals(Text(account, "securityStamp"), mutation.SecurityStamp, StringComparison.Ordinal) &&
        CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(Text(account, "passwordHash")), Encoding.UTF8.GetBytes(mutation.AppliedHash));

    private async Task<AccountMutationLease> BeginAccountMutationAsync(
        JsonObject account,
        string kind,
        bool requireActive,
        CancellationToken cancellationToken,
        IReadOnlyList<JsonObject>? guardAccounts = null)
    {
        var accountId = Text(account, "id", Text(account, "userId"));
        var current = await AccountByUserIdAsync(accountId, cancellationToken)
            ?? throw new InvalidOperationException("identity_account_missing");
        if (string.Equals(Text(current, "status"), "SecurityMutationPending", StringComparison.Ordinal))
        {
            if (!IsCompleteSecurityMutationPending(current)) throw new IdentityConcurrencyException();
            var startedAt = Date(current, "securityMutationStartedAt", DateTime.MinValue);
            if (startedAt + SecurityMutationLeaseDuration > DateTime.UtcNow) throw new IdentityConcurrencyException();
            await RecoverExpiredAccountMutationAsync(current, cancellationToken);
            current = await AccountByUserIdAsync(accountId, cancellationToken)
                ?? throw new InvalidOperationException("identity_account_missing_after_recovery");
        }
        var originalStatus = Text(current, "status");
        if (string.Equals(originalStatus, "SecurityMutationPending", StringComparison.Ordinal)) throw new IdentityConcurrencyException();
        if (requireActive && !StatusIsActive(current)) throw new InvalidOperationException("identity_account_not_active");
        var mutationId = Guid.NewGuid().ToString("N");
        try
        {
            var operations = new[]
            {
                PatchOperation.Set("/status", "SecurityMutationPending"),
                PatchOperation.Set("/securityMutationId", mutationId),
                PatchOperation.Set("/securityMutationKind", kind),
                PatchOperation.Set("/securityMutationPreviousStatus", originalStatus),
                PatchOperation.Set("/securityMutationStartedAt", DateTime.UtcNow),
                PatchOperation.Set("/updatedAt", DateTime.UtcNow)
            };
            if (guardAccounts is null)
            {
                var response = await Container("UserAccounts").PatchItemAsync<JsonObject>(Text(current, "id"), new PartitionKey("global"),
                    operations, requestOptions: PatchMatch(current), cancellationToken: cancellationToken);
                return new(current, response.ETag, mutationId);
            }

            var batch = Container("UserAccounts").CreateTransactionalBatch(new PartitionKey("global"));
            foreach (var guard in guardAccounts.Where(value => Text(value, "id") != Text(current, "id")))
                batch.ReadItem(Text(guard, "id"), BatchMatch(guard));
            batch.PatchItem(Text(current, "id"), operations, BatchPatchMatch(current));
            using var batchResponse = await batch.ExecuteAsync(cancellationToken);
            if (!batchResponse.IsSuccessStatusCode) throw new IdentityConcurrencyException();
            var pending = await AccountByUserIdAsync(Text(current, "id"), cancellationToken);
            if (pending is null || Text(pending, "securityMutationId") != mutationId) throw new IdentityConcurrencyException();
            return new(current, RequireEtag(pending), mutationId);
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            throw new IdentityConcurrencyException();
        }
    }

    private async Task CompleteAccountMutationAsync(
        AccountMutationLease lease,
        IReadOnlyList<PatchOperation> operations,
        CancellationToken cancellationToken,
        string? finalStatus = null)
    {
        var final = operations.Concat(new[]
        {
            PatchOperation.Set("/status", finalStatus ?? Text(lease.Original, "status")),
            PatchOperation.Remove("/securityMutationId"),
            PatchOperation.Remove("/securityMutationKind"),
            PatchOperation.Remove("/securityMutationPreviousStatus"),
            PatchOperation.Remove("/securityMutationStartedAt"),
            PatchOperation.Set("/updatedAt", DateTime.UtcNow)
        }).ToArray();
        try
        {
            if (final.Length <= 10)
            {
                await Container("UserAccounts").PatchItemAsync<object>(Text(lease.Original, "id"), new PartitionKey("global"), final,
                    requestOptions: new PatchItemRequestOptions { IfMatchEtag = lease.PendingEtag }, cancellationToken: cancellationToken);
            }
            else
            {
                var batch = Container("UserAccounts").CreateTransactionalBatch(new PartitionKey("global"));
                batch.PatchItem(Text(lease.Original, "id"), final.Take(10).ToArray(),
                    new TransactionalBatchPatchItemRequestOptions { IfMatchEtag = lease.PendingEtag });
                batch.PatchItem(Text(lease.Original, "id"), final.Skip(10).ToArray());
                using var response = await batch.ExecuteAsync(cancellationToken);
                if (!response.IsSuccessStatusCode) throw new IdentityConcurrencyException();
            }
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            throw new IdentityConcurrencyException();
        }
    }

    private async Task TryRollbackAccountMutationAsync(AccountMutationLease lease, CancellationToken cancellationToken)
    {
        try
        {
            await Container("UserAccounts").PatchItemAsync<object>(Text(lease.Original, "id"), new PartitionKey("global"),
                [PatchOperation.Set("/status", Text(lease.Original, "status")),
                 PatchOperation.Remove("/securityMutationId"),
                 PatchOperation.Remove("/securityMutationKind"),
                 PatchOperation.Remove("/securityMutationPreviousStatus"),
                 PatchOperation.Remove("/securityMutationStartedAt"),
                 PatchOperation.Set("/updatedAt", Date(lease.Original, "updatedAt", DateTime.UtcNow))],
                requestOptions: new PatchItemRequestOptions { IfMatchEtag = lease.PendingEtag }, cancellationToken: cancellationToken);
        }
        catch (Exception error)
        {
            _logger.LogCritical("Identity account mutation rollback failed category={Category}", error.GetType().Name);
        }
    }

    private async Task RecoverExpiredAccountMutationAsync(JsonObject pending, CancellationToken cancellationToken)
    {
        var kind = Text(pending, "securityMutationKind");
        if (kind == UndisclosedTemporaryPasswordMutationKind)
        {
            if (!IsCompleteSecurityMutationPending(pending) || !Bool(pending, "securityMutationAutoRecoveryBlocked"))
                throw new InvalidOperationException("identity_undisclosed_temporary_password_state_incomplete");
            _logger.LogCritical("Undisclosed temporary password remains failed closed pending explicit reconciliation user={UserDigest}",
                Digest("undisclosed-temporary-password", Text(pending, "userId")));
            return;
        }
        var legacy = await LegacyForAccountAsync(pending, cancellationToken)
            ?? throw new InvalidOperationException("identity_pending_mutation_legacy_missing");
        var previousStatus = Text(pending, "securityMutationPreviousStatus", IdentityRecordStatus.Suspended.ToString());
        var version = Long(pending, "sessionVersion", 1) + 1;
        var operations = new List<PatchOperation>
        {
            PatchOperation.Set("/sessionVersion", version),
            PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")),
            PatchOperation.Remove("/securityMutationId"),
            PatchOperation.Remove("/securityMutationKind"),
            PatchOperation.Remove("/securityMutationPreviousStatus"),
            PatchOperation.Remove("/securityMutationStartedAt"),
            PatchOperation.Set("/updatedAt", DateTime.UtcNow)
        };
        if (kind == "password")
        {
            operations.Add(PatchOperation.Set("/passwordHash", legacy.PasswordHash));
            operations.Add(PatchOperation.Set("/forcePasswordChange", true));
            operations.Add(PatchOperation.Set("/status", previousStatus));
        }
        else if (kind == "email")
        {
            var recoveredNormalized = IdentitySecurityService.NormalizeEmail(legacy.Email);
            operations.Add(PatchOperation.Set("/loginEmail", legacy.Email));
            operations.Add(PatchOperation.Set("/normalizedEmail", recoveredNormalized));
            if (!string.Equals(Text(pending, "normalizedEmail"), recoveredNormalized, StringComparison.Ordinal))
            {
                operations.Add(PatchOperation.Set("/emailVerified", false));
                foreach (var metadata in new[] { "emailVerifiedAt", "emailVerificationProvider", "emailVerificationRequestId" })
                    if (pending.ContainsKey(metadata)) operations.Add(PatchOperation.Remove("/" + metadata));
            }
            operations.Add(PatchOperation.Set("/status", previousStatus));
        }
        else if (kind == "account-state")
        {
            operations.Add(PatchOperation.Set("/status", legacy.IsActive
                ? IdentityRecordStatus.Active.ToString()
                : IdentityRecordStatus.Suspended.ToString()));
        }
        else
        {
            operations.Add(PatchOperation.Set("/status", IdentityRecordStatus.Suspended.ToString()));
        }
        await Container("UserAccounts").PatchItemAsync<object>(Text(pending, "id"), new PartitionKey("global"), operations,
            requestOptions: PatchMatch(pending), cancellationToken: cancellationToken);
        await TryRecordSecurityReconciliationAsync(Text(pending, "userId"), kind, "expired_lease_recovered", cancellationToken);
    }

    private async Task TryRestoreLegacyEmailAsync(string userId, string tenantId, string email)
    {
        try
        {
            using var bounded = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await _legacy.PatchUserLoginEmailAsync(userId, tenantId, email, bounded.Token);
        }
        catch (Exception error) { _logger.LogCritical("Identity legacy compensation failed category={Category}", error.GetType().Name); }
    }

    private async Task TryRestoreLegacyPasswordHashAsync(string userId, string tenantId, string passwordHash)
    {
        try
        {
            using var bounded = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await _legacy.PatchUserPasswordHashAsync(userId, tenantId, passwordHash, bounded.Token);
        }
        catch (Exception error) { _logger.LogCritical("Identity legacy compensation failed category={Category}", error.GetType().Name); }
    }

    private async Task TryRestoreLegacyActiveStateAsync(string userId, string tenantId, bool isActive)
    {
        try
        {
            using var bounded = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await _legacy.PatchUserActiveStateAsync(userId, tenantId, isActive, bounded.Token);
        }
        catch (Exception error) { _logger.LogCritical("Identity legacy compensation failed category={Category}", error.GetType().Name); }
    }

    private static PatchItemRequestOptions PatchMatch(JsonObject value) => new() { IfMatchEtag = RequireEtag(value) };
    private static TransactionalBatchItemRequestOptions BatchMatch(JsonObject value) => new() { IfMatchEtag = RequireEtag(value) };
    private static TransactionalBatchPatchItemRequestOptions BatchPatchMatch(JsonObject value) => new() { IfMatchEtag = RequireEtag(value) };
    private static string RequireEtag(JsonObject value)
    {
        var etag = Text(value, "_etag");
        return string.IsNullOrWhiteSpace(etag)
            ? throw new InvalidOperationException("identity_concurrency_etag_missing")
            : etag;
    }

    private bool Enabled(Func<IdentityFeatureOptions, bool> test) => test(_features.CurrentValue);
    private Container Container(string name) => _client!.GetDatabase(_databaseName).GetContainer(name);

    private Task<List<JsonObject>> QueryAsync(string container, string sql, CancellationToken cancellationToken, params (string Name, object Value)[] parameters) =>
        QueryCoreAsync(container, sql, null, cancellationToken, parameters);

    private Task<List<JsonObject>> QueryPartitionAsync(string container, string sql, string partitionKey, CancellationToken cancellationToken, params (string Name, object Value)[] parameters) =>
        QueryCoreAsync(container, sql, partitionKey, cancellationToken, parameters);

    private async Task<List<JsonObject>> QueryCoreAsync(string container, string sql, string? partitionKey, CancellationToken cancellationToken, params (string Name, object Value)[] parameters)
    {
        using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        bounded.CancelAfter(QueryTimeout);
        var definition = new QueryDefinition(sql);
        foreach (var parameter in parameters) definition.WithParameter(parameter.Name, parameter.Value);
        var options = new QueryRequestOptions { MaxItemCount = 100 };
        if (partitionKey is not null) options.PartitionKey = new PartitionKey(partitionKey);
        using var iterator = Container(container).GetItemQueryIterator<JsonObject>(definition, requestOptions: options);
        var rows = new List<JsonObject>();
        while (iterator.HasMoreResults)
        {
            rows.AddRange(await iterator.ReadNextAsync(bounded.Token).WaitAsync(bounded.Token));
            if (rows.Count > MaxQueryRows)
                throw new InvalidOperationException($"identity_query_row_limit_exceeded:{container}");
        }
        return rows;
    }

    private async Task<JsonObject?> ReadAsync(string container, string id, string partitionKey, CancellationToken cancellationToken)
    {
        using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        bounded.CancelAfter(QueryTimeout);
        try
        {
            var response = await Container(container).ReadItemAsync<JsonObject>(id, new PartitionKey(partitionKey), cancellationToken: bounded.Token).WaitAsync(bounded.Token);
            return response.Resource;
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    private async Task AuditAsync(HttpContext context, Actor actor, string type, string target, string? tenant, string reason, string result, CancellationToken cancellationToken)
    {
        using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        bounded.CancelAfter(QueryTimeout);
        var item = new
        {
            id = $"{type}-{context.TraceIdentifier}",
            auditPartition = "global",
            eventType = type,
            actorUserId = Text(actor.Account, "userId"),
            actorRole = actor.Role,
            targetUserId = target,
            targetTenantUid = tenant,
            requestId = context.TraceIdentifier,
            reason,
            result,
            createdAt = DateTime.UtcNow
        };
        try
        {
            await Container("SecurityAuditEvents").UpsertItemAsync(item, new PartitionKey("global"), cancellationToken: bounded.Token).WaitAsync(bounded.Token);
        }
        catch (Exception error) when (error is CosmosException or OperationCanceledException or TimeoutException)
        {
            using var reconciliation = new CancellationTokenSource(TimeSpan.FromSeconds(2));
            await TryRecordSecurityReconciliationAsync(target, type, $"audit_{result}_{error.GetType().Name}", reconciliation.Token);
            throw;
        }
    }

    private Task BeginAuditAsync(HttpContext context, Actor actor, string type, string target, string? tenant, string reason, CancellationToken cancellationToken) =>
        AuditAsync(context, actor, type, target, tenant, reason, "pending", cancellationToken);

    private async Task TryRecordSecurityReconciliationAsync(string targetUserId, string mutationType, string errorCode, CancellationToken cancellationToken)
    {
        try
        {
            using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bounded.CancelAfter(TimeSpan.FromSeconds(2));
            var id = Digest("security-reconciliation", targetUserId, mutationType, DateTime.UtcNow.Ticks.ToString(CultureInfo.InvariantCulture));
            await Container("IdentityMigration").UpsertItemAsync(new
            {
                id,
                migrationPartition = "global",
                type = "IdentitySecurityMutationReconciliation",
                targetUserId,
                mutationType,
                errorCode,
                status = "Pending",
                createdAt = DateTime.UtcNow
            }, new PartitionKey("global"), cancellationToken: bounded.Token).WaitAsync(bounded.Token);
        }
        catch (Exception reconciliationError)
        {
            _logger.LogCritical("Identity security reconciliation write failed category={Category}", reconciliationError.GetType().Name);
        }
    }

    private async Task RecordIndeterminateMutationAsync(
        HttpContext context,
        Actor actor,
        string auditType,
        string targetUserId,
        string? tenantUid,
        string reason,
        string mutationType,
        string errorCode)
    {
        using var bounded = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        await TryRecordSecurityReconciliationAsync(targetUserId, mutationType, errorCode, bounded.Token);
        try
        {
            await AuditAsync(context, actor, auditType, targetUserId, tenantUid, reason,
                "reconciliation_required", bounded.Token);
        }
        catch (Exception auditError)
        {
            _logger.LogCritical("Identity indeterminate mutation audit finalization failed category={Category}",
                auditError.GetType().Name);
        }
    }

    private static object SafeUser(JsonObject value) => new
    {
        userId = Text(value, "userId"),
        loginEmail = Text(value, "loginEmail"),
        normalizedEmail = Text(value, "normalizedEmail"),
        globalRole = Text(value, "globalRole"),
        status = Text(value, "status"),
        isSyntheticValidation = IsCrstSyntheticValidationAccount(value),
        forcePasswordChange = Bool(value, "forcePasswordChange"),
        sessionVersion = Long(value, "sessionVersion", 1)
    };

    private static ContactSettingsResponse SafeContactSettings(JsonObject value)
    {
        var concurrencyToken = Text(value, "_etag");
        if (string.IsNullOrWhiteSpace(concurrencyToken))
            throw new InvalidOperationException("contact settings concurrency token is unavailable");
        var recipients = (value["recipients"] as JsonArray ?? [])
            .OfType<JsonObject>()
            .Select(recipient => new ContactRecipientResponse(
                Text(recipient, "id"), Text(recipient, "email"), Text(recipient, "normalizedEmail"),
                checked((int)Long(recipient, "order", 0)), Bool(recipient, "isActive"), Bool(recipient, "isVerified"),
                NullIfEmpty(Text(recipient, "replyTo")), NullIfEmpty(Text(recipient, "createdAt")),
                NullIfEmpty(Text(recipient, "updatedAt"))))
            .ToArray();
        var overrides = new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal);
        if (value["formDefinitionOverrides"] is JsonObject storedOverrides)
            foreach (var (formDefinitionId, recipientIdsNode) in storedOverrides)
                if (recipientIdsNode is JsonArray recipientIds)
                    overrides[formDefinitionId] = recipientIds.Select(node => node?.GetValue<string>() ?? string.Empty).ToArray();
        return new ContactSettingsResponse(
            Text(value, "tenantUid"), Text(value, "primaryContactEmail"), Bool(value, "primaryContactVerified"),
            Text(value, "deliveryCapability", "DisabledNoProvider"),
            Text(value, "defaultNotificationPolicy", "all-active"), recipients, overrides,
            NullIfEmpty(Text(value, "updatedAt")), concurrencyToken);
    }

    private static string? NullIfEmpty(string value) => string.IsNullOrWhiteSpace(value) ? null : value;

    private static bool TryNormalizeAuditReason(string? value, out string reason)
    {
        reason = value?.Trim() ?? string.Empty;
        return reason.Length > 0 && Encoding.UTF8.GetByteCount(reason) <= 500 &&
            !reason.Any(char.IsControl);
    }

    private static bool IsCrstSyntheticValidationAccount(JsonObject account) =>
        Bool(account, "isSyntheticValidation") && Text(account, "syntheticValidationId") == "V2.8.63CRST";

    private static object SafeTenant(JsonObject value) => new
    {
        tenantUid = Text(value, "tenantUid"),
        legacyTenantId = Text(value, "legacyTenantId"),
        canonicalSlug = Text(value, "canonicalSlug"),
        displayName = Text(value, "displayName"),
        status = Text(value, "status")
    };

    private static object SafeAudit(JsonObject value) => new
    {
        id = Text(value, "id"),
        eventType = Text(value, "eventType"),
        actorUserId = Text(value, "actorUserId"),
        actorRole = Text(value, "actorRole"),
        targetUserId = Text(value, "targetUserId"),
        targetTenantUid = Text(value, "targetTenantUid"),
        requestId = Text(value, "requestId"),
        reason = Text(value, "reason"),
        result = Text(value, "result"),
        createdAt = Text(value, "createdAt")
    };

    private static DateTimeOffset? UnixClaim(ClaimsPrincipal principal, string claimType) =>
        long.TryParse(principal.FindFirstValue(claimType), NumberStyles.None, CultureInfo.InvariantCulture, out var seconds)
            ? DateTimeOffset.FromUnixTimeSeconds(seconds)
            : null;

    private static IResult Disabled(HttpContext context) =>
        Results.Conflict(new IdentityError("identity_management_disabled", "Identity management is not active.", context.TraceIdentifier));

    private static IResult ProviderUnavailable(HttpContext context) =>
        Results.Json(new IdentityError("identity_notification_provider_unavailable", "Email delivery is not configured; no change was activated.", context.TraceIdentifier), statusCode: StatusCodes.Status503ServiceUnavailable);

    private static IResult Unauthorized() => Results.Unauthorized();
    private static IResult Bad(HttpContext context, string code) => Results.BadRequest(new IdentityError(code, code.Replace('_', ' '), context.TraceIdentifier));
    private static IResult Conflict(HttpContext context, string code, string message) => Results.Conflict(new IdentityError(code, message, context.TraceIdentifier));
    private static IResult PreconditionFailed(HttpContext context, string code, string message) =>
        Results.Json(new IdentityError(code, message, context.TraceIdentifier), statusCode: StatusCodes.Status412PreconditionFailed);
    private static string Text(JsonObject value, string name, string fallback = "") => value[name]?.GetValue<string>() ?? fallback;
    private static bool Bool(JsonObject value, string name) => value[name] is JsonValue scalar && scalar.TryGetValue<bool>(out var result) && result;
    private static bool ExplicitFalse(JsonObject value, string name) =>
        value[name] is JsonValue scalar && scalar.TryGetValue<bool>(out var result) && !result;
    private static bool StatusIsActive(JsonObject value) =>
        string.Equals(Text(value, "status"), IdentityRecordStatus.Active.ToString(), StringComparison.OrdinalIgnoreCase);
    private static long Long(JsonObject value, string name, long fallback)
    {
        if (value[name] is not JsonValue scalar) return fallback;
        if (scalar.TryGetValue<long>(out var result)) return result;
        if (scalar.TryGetValue<int>(out var integer)) return integer;
        return scalar.TryGetValue<string>(out var text) && long.TryParse(text, NumberStyles.None, CultureInfo.InvariantCulture, out result)
            ? result
            : fallback;
    }
    private static DateTimeOffset? DateTimeText(JsonObject value, string name) =>
        DateTimeOffset.TryParse(Text(value, name), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var result)
            ? result
            : null;
    private static DateTime Date(JsonObject value, string name, DateTime fallback)
    {
        if (value[name] is JsonValue scalar && scalar.TryGetValue<DateTime>(out var direct)) return direct;
        return DateTime.TryParse(Text(value, name), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var parsed)
            ? parsed
            : fallback;
    }
    private static bool IsCompleteSecurityMutationPending(JsonObject value)
    {
        var kind = Text(value, "securityMutationKind");
        return string.Equals(Text(value, "status"), "SecurityMutationPending", StringComparison.Ordinal) &&
            !string.IsNullOrWhiteSpace(Text(value, "securityMutationId")) &&
            kind is "password" or "email" or "account-state" or UndisclosedTemporaryPasswordMutationKind &&
            (kind != UndisclosedTemporaryPasswordMutationKind ||
                Bool(value, "securityMutationAutoRecoveryBlocked") && Bool(value, "forcePasswordChange")) &&
            !string.IsNullOrWhiteSpace(Text(value, "securityMutationPreviousStatus")) &&
            Date(value, "securityMutationStartedAt", DateTime.MinValue) != DateTime.MinValue &&
            !string.IsNullOrWhiteSpace(Text(value, "_etag"));
    }
    private static bool IsBoundedContactIdentifier(string? value) =>
        !string.IsNullOrWhiteSpace(value) && string.Equals(value, value.Trim(), StringComparison.Ordinal) &&
        Encoding.UTF8.GetByteCount(value) <= MaxContactIdentifierBytes && !value.Any(char.IsControl);
    private static bool IsBoundedIdentityIdentifier(string? value) =>
        !string.IsNullOrWhiteSpace(value) && string.Equals(value, value.Trim(), StringComparison.Ordinal) &&
        Encoding.UTF8.GetByteCount(value) <= MaxIdentityIdentifierBytes && !value.Any(char.IsControl);
    private static bool TryNormalizeIdempotencyKey(string? value, out string normalized)
    {
        normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length == 0)
        {
            normalized = "semantic";
            return true;
        }
        return Encoding.UTF8.GetByteCount(normalized) <= MaxIdempotencyKeyBytes && !normalized.Any(char.IsControl);
    }
    private static bool IsSafeEmail(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 320 || !string.Equals(value, value.Trim(), StringComparison.Ordinal) ||
            value.Any(char.IsWhiteSpace) || value.Any(char.IsControl)) return false;
        var separator = value.IndexOf('@');
        return separator > 0 && separator == value.LastIndexOf('@') && separator < value.Length - 1;
    }
    private static string Digest(params string[] values) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", values)))).ToLowerInvariant()[..32];

    private sealed record AccountMutationLease(JsonObject Original, string PendingEtag, string MutationId);
    private sealed record PasswordMutationResult(
        string AccountId,
        string PreviousHash,
        bool PreviousForcePasswordChange,
        string AppliedHash,
        long SessionVersion,
        string SecurityStamp);
    private sealed class IdentityConcurrencyException : Exception { }
    private sealed class IdentityCurrentPasswordRejectedException : Exception { }
    private sealed class AdminInvariantLease(Func<CancellationToken, Task<bool>> renew, Func<Task> release) : IAsyncDisposable
    {
        private readonly CancellationTokenSource _stop = new();
        private readonly CancellationTokenSource _lost = new();
        private Task? _renewal;
        private int _disposed;
        public CancellationToken LostToken => _lost.Token;

        public void Start() => _renewal = RenewAsync();

        private async Task RenewAsync()
        {
            try
            {
                while (true)
                {
                    await Task.Delay(TimeSpan.FromSeconds(20), _stop.Token);
                    if (!await renew(_stop.Token))
                    {
                        _lost.Cancel();
                        return;
                    }
                }
            }
            catch (OperationCanceledException) when (_stop.IsCancellationRequested) { }
        }

        public async ValueTask DisposeAsync()
        {
            if (Interlocked.Exchange(ref _disposed, 1) != 0) return;
            _stop.Cancel();
            if (_renewal is not null) await _renewal;
            await release();
            _lost.Dispose();
            _stop.Dispose();
        }
    }
    private sealed record Actor(JsonObject Account, string LegacyUserId, string LegacyTenantId, string? ActiveTenantUid, bool SuperAdmin, string Role);
}
