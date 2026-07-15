using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public sealed class IdentityManagementService : IDisposable
{
    private readonly CosmosClient? _client;
    private readonly string _databaseName;
    private readonly IDatabaseService _legacy;
    private readonly IOptionsMonitor<IdentityFeatureOptions> _features;

    public IdentityManagementService(IOptions<DatabaseSettings> database, IOptions<CosmosDbSettings> cosmos,
        IDatabaseService legacy, IOptionsMonitor<IdentityFeatureOptions> features)
    {
        _legacy = legacy; _features = features; _databaseName = database.Value.CosmosDb.DatabaseName;
        if (database.Value.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(cosmos.Value.ConnectionString))
            _client = new CosmosClient(cosmos.Value.ConnectionString, new CosmosClientOptions { ConnectionMode = ConnectionMode.Gateway, Serializer = new CosmosSystemTextJsonSerializer() });
    }

    public async Task<IResult> ProfileAsync(HttpContext c, CancellationToken ct)
    {
        var actor = await ActorAsync(c, ct); if (actor is null) return Unauthorized(c);
        return Results.Ok(new { userId = Text(actor.Account, "userId"), loginEmail = Text(actor.Account, "loginEmail"), emailVerified = Bool(actor.Account, "emailVerified"), forcePasswordChange = Bool(actor.Account, "forcePasswordChange"), sessionVersion = Long(actor.Account, "sessionVersion", 1), providerState = "held_no_delivery_provider" });
    }

    public async Task<IResult> CurrentMembershipsAsync(HttpContext c, CancellationToken ct)
    { var a = await ActorAsync(c, ct); return a is null ? Unauthorized(c) : Results.Ok(await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@id", ("@id", Text(a.Account, "userId")), ct)); }

    public async Task<IResult> SwitchTenantAsync(HttpContext c, SwitchTenantRequest r, CancellationToken ct)
    {
        if (!Enabled(x => x.ManagementEnabled && x.TenantSwitcherEnabled)) return Disabled(c);
        var a = await ActorAsync(c, ct); if (a is null) return Unauthorized(c);
        var m = (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active'", ("@u", Text(a.Account, "userId")), ("@t", r.TenantUid), ct)).SingleOrDefault();
        return m is null ? Results.Forbid() : Results.Ok(new { activeTenantUid = r.TenantUid, membershipId = Text(m, "membershipId"), role = Text(m, "role") });
    }

    public async Task<IResult> ChangePasswordAsync(HttpContext c, ChangePasswordRequest r, CancellationToken ct)
    {
        if (!Enabled(x => x.ManagementEnabled && x.PasswordAndSessionManagementEnabled)) return Disabled(c);
        if (r.NewPassword.Length < 12 || !r.NewPassword.Any(char.IsUpper) || !r.NewPassword.Any(char.IsLower) || !r.NewPassword.Any(char.IsDigit)) return Bad(c, "password_policy_failed");
        var a = await ActorAsync(c, ct); if (a is null) return Unauthorized(c);
        var legacy = await _legacy.GetUserByIdAsync(a.LegacyTenantId, a.LegacyUserId);
        if (legacy is null || !BCrypt.Net.BCrypt.Verify(r.CurrentPassword, legacy.PasswordHash)) return Results.Unauthorized();
        var hash = BCrypt.Net.BCrypt.HashPassword(r.NewPassword, workFactor: 12); legacy.PasswordHash = hash; await _legacy.UpdateUserAsync(legacy);
        var stamp = Guid.NewGuid().ToString("N"); var version = Long(a.Account, "sessionVersion", 1) + 1; var now = DateTime.UtcNow;
        await Container("UserAccounts").PatchItemAsync<object>(Text(a.Account, "id"), new("global"), [PatchOperation.Set("/passwordHash", hash), PatchOperation.Set("/securityStamp", stamp), PatchOperation.Set("/sessionVersion", version), PatchOperation.Set("/forcePasswordChange", false), PatchOperation.Set("/updatedAt", now)], cancellationToken: ct);
        await AuditAsync(c, "identity_own_password_changed", Text(a.Account, "userId"), null, "self-service", ct);
        return Results.Ok(new { changed = true, sessionVersion = version, otherSessionsRevoked = r.RevokeOtherSessions });
    }

    public async Task<IResult> TenantMembershipsAsync(HttpContext c, string tenantUid, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !await CanManageTenant(a, tenantUid, ct)) return Results.Forbid(); return Results.Ok(await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t", ("@t", tenantUid), ct)); }

    public async Task<IResult> UserMembershipsAsync(HttpContext c, string userId, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin) return Results.Forbid(); return Results.Ok(await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@u", ("@u", userId), ct)); }

    public async Task<IResult> GlobalUsersAsync(HttpContext c, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin || !Enabled(x => x.SuperAdminManagementEnabled)) return Results.Forbid(); var users = await QueryAsync("UserAccounts", "SELECT * FROM c", ct); return Results.Ok(users.Select(SafeUser)); }

    public async Task<IResult> ContactSettingsAsync(HttpContext c, string tenantUid, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !await CanAccessTenant(a, tenantUid, ct)) return Results.Forbid(); return Results.Ok((await QueryAsync("TenantContactSettings", "SELECT * FROM c WHERE c.tenantUid=@t", ("@t", tenantUid), ct)).SingleOrDefault()); }

    public async Task<IResult> UpdateContactSettingsAsync(HttpContext c, string tenantUid, ContactSettingsUpdate r, CancellationToken ct)
    {
        if (!Enabled(x => x.ManagementEnabled && x.ContactManagementEnabled)) return Disabled(c); var a = await ActorAsync(c, ct);
        if (a is null || !await CanManageTenant(a, tenantUid, ct)) return Results.Forbid();
        var existing = (await QueryAsync("TenantContactSettings", "SELECT * FROM c WHERE c.tenantUid=@t", ("@t", tenantUid), ct)).SingleOrDefault(); if (existing is null) return Results.NotFound();
        existing["primaryContactEmail"] = r.PrimaryContactEmail; existing["recipients"] = JsonSerializer.SerializeToNode(r.Recipients); existing["defaultNotificationPolicy"] = r.DefaultNotificationPolicy; existing["formDefinitionOverrides"] = JsonSerializer.SerializeToNode(r.FormDefinitionOverrides); existing["updatedByUserId"] = Text(a.Account, "userId"); existing["updatedAt"] = DateTime.UtcNow;
        await Container("TenantContactSettings").UpsertItemAsync(existing, new(tenantUid), cancellationToken: ct); await AuditAsync(c, "identity_contact_settings_changed", Text(a.Account, "userId"), tenantUid, "tenant-management", ct); return Results.Ok(existing);
    }

    public async Task<IResult> AddMembershipAsync(HttpContext c, string tenantUid, AddMembershipRequest r, CancellationToken ct)
    {
        if (!Enabled(x => x.ManagementEnabled && x.MembershipManagementEnabled)) return Disabled(c); var a = await ActorAsync(c, ct); if (a is null || !await CanManageTenant(a, tenantUid, ct) || r.Role == TenantRole.TenantAdmin && !a.SuperAdmin) return Results.Forbid();
        var existing = (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t AND c.userId=@u", ("@t", tenantUid), ("@u", r.UserId), ct)).SingleOrDefault(); if (existing is not null) return Results.Conflict(new IdentityError("membership_exists", "Membership already exists.", c.TraceIdentifier));
        var id = Digest(tenantUid, r.UserId); var item = new { id, membershipId = id, tenantUid, userId = r.UserId, role = r.Role.ToString(), status = "Active", isPrimaryTenantAdmin = false, createdByUserId = Text(a.Account, "userId"), createdAt = DateTime.UtcNow, updatedAt = DateTime.UtcNow };
        await Container("TenantMemberships").CreateItemAsync(item, new(tenantUid), cancellationToken: ct); await AuditAsync(c, "identity_membership_added", r.UserId, tenantUid, "membership-management", ct); return Results.Created($"/api/identity/tenants/{tenantUid}/memberships/{id}", item);
    }

    public Task<IResult> ChangeMembershipRoleAsync(HttpContext c, string tenantUid, string membershipId, ChangeMembershipRoleRequest r, CancellationToken ct) => MutateMembership(c, tenantUid, membershipId, "role", r.Role.ToString(), r.Reason, ct);
    public Task<IResult> ChangeMembershipStatusAsync(HttpContext c, string tenantUid, string membershipId, ChangeMembershipStatusRequest r, CancellationToken ct) => MutateMembership(c, tenantUid, membershipId, "status", r.Status.ToString(), r.Reason, ct);

    private async Task<IResult> MutateMembership(HttpContext c, string tenantUid, string id, string field, string value, string reason, CancellationToken ct)
    {
        if (!Enabled(x => x.ManagementEnabled && x.MembershipManagementEnabled)) return Disabled(c); var a = await ActorAsync(c, ct); if (a is null || !await CanManageTenant(a, tenantUid, ct)) return Results.Forbid();
        var m = (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t AND c.membershipId=@m", ("@t", tenantUid), ("@m", id), ct)).SingleOrDefault(); if (m is null) return Results.NotFound();
        if (Text(m, "role") == "TenantAdmin" && (field == "status" && value != "Active" || field == "role" && value != "TenantAdmin") && await ActiveAdminCount(tenantUid, ct) <= 1) return Results.Conflict(new IdentityError("final_tenant_admin_protected", "The final active TenantAdmin cannot be removed.", c.TraceIdentifier));
        if (field == "role" && value == "TenantAdmin" && !a.SuperAdmin) return Results.Forbid();
        await Container("TenantMemberships").PatchItemAsync<object>(Text(m, "id"), new(tenantUid), [PatchOperation.Set("/" + field, value), PatchOperation.Set("/updatedAt", DateTime.UtcNow)], cancellationToken: ct); await AuditAsync(c, "identity_membership_changed", Text(m, "userId"), tenantUid, reason, ct); return Results.Ok(new { membershipId = id, field, value });
    }

    public async Task<IResult> TransferTenantAdminAsync(HttpContext c, string tenantUid, TransferTenantAdminRequest r, CancellationToken ct)
    {
        var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin || r.Confirmation != "TRANSFER TENANT ADMIN") return Results.Forbid(); var rows = await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t AND c.status='Active'", ("@t", tenantUid), ct); var target = rows.SingleOrDefault(x => Text(x, "membershipId") == r.ToMembershipId); if (target is null || Text(target, "role") != "TenantAdmin") return Bad(c, "target_not_active_tenant_admin"); foreach (var row in rows.Where(x => Bool(x, "isPrimaryTenantAdmin"))) await Container("TenantMemberships").PatchItemAsync<object>(Text(row, "id"), new(tenantUid), [PatchOperation.Set("/isPrimaryTenantAdmin", false)], cancellationToken: ct); await Container("TenantMemberships").PatchItemAsync<object>(Text(target, "id"), new(tenantUid), [PatchOperation.Set("/isPrimaryTenantAdmin", true)], cancellationToken: ct); await AuditAsync(c, "identity_tenant_admin_transferred", Text(target, "userId"), tenantUid, r.Reason, ct); return Results.Ok(new { primaryMembershipId = r.ToMembershipId });
    }

    public async Task<IResult> AdminEmailChangeAsync(HttpContext c, string userId, AdminEmailChangeRequest r, CancellationToken ct)
    {
        var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin || !Enabled(x => x.SuperAdminManagementEnabled) || string.IsNullOrWhiteSpace(r.Reason)) return Results.Forbid(); var normalized = IdentitySecurityService.NormalizeEmail(r.NewEmail); if ((await QueryAsync("UserAccounts", "SELECT * FROM c WHERE c.normalizedEmail=@e", ("@e", normalized), ct)).Count > 0) return Results.Conflict(new IdentityError("email_not_unique", "Email is already in use.", c.TraceIdentifier)); var account = (await QueryAsync("UserAccounts", "SELECT * FROM c WHERE c.userId=@u", ("@u", userId), ct)).SingleOrDefault(); if (account is null) return Results.NotFound(); var legacy = await _legacy.GetUserByIdAsync(Text(account, "legacyTenantId"), Text(account, "legacyUserId")); if (legacy is null) return Results.NotFound(); legacy.Email = r.NewEmail; await _legacy.UpdateUserAsync(legacy); var version = Long(account, "sessionVersion", 1) + 1; await Container("UserAccounts").PatchItemAsync<object>(Text(account, "id"), new("global"), [PatchOperation.Set("/loginEmail", r.NewEmail), PatchOperation.Set("/normalizedEmail", normalized), PatchOperation.Set("/sessionVersion", version), PatchOperation.Set("/forcePasswordChange", r.ForcePasswordChange)], cancellationToken: ct); await AuditAsync(c, "identity_admin_email_changed", userId, null, r.Reason, ct); return Results.Ok(new { userId, normalizedEmail = normalized, sessionsRevoked = r.RevokeSessions });
    }

    public async Task<IResult> TemporaryPasswordAsync(HttpContext c, string userId, TemporaryPasswordRequest r, CancellationToken ct)
    {
        var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin || !Enabled(x => x.SuperAdminManagementEnabled) || string.IsNullOrWhiteSpace(r.Reason)) return Results.Forbid(); var account = (await QueryAsync("UserAccounts", "SELECT * FROM c WHERE c.userId=@u", ("@u", userId), ct)).SingleOrDefault(); if (account is null) return Results.NotFound(); var legacy = await _legacy.GetUserByIdAsync(Text(account, "legacyTenantId"), Text(account, "legacyUserId")); if (legacy is null) return Results.NotFound(); var temporary = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).Replace("/", "A").Replace("+", "B"); var hash = BCrypt.Net.BCrypt.HashPassword(temporary, 12); legacy.PasswordHash = hash; await _legacy.UpdateUserAsync(legacy); var version = Long(account, "sessionVersion", 1) + 1; await Container("UserAccounts").PatchItemAsync<object>(Text(account, "id"), new("global"), [PatchOperation.Set("/passwordHash", hash), PatchOperation.Set("/forcePasswordChange", r.ForceChangeAtNextLogin), PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")), PatchOperation.Set("/sessionVersion", version)], cancellationToken: ct); await AuditAsync(c, "identity_admin_temporary_password_issued", userId, null, r.Reason, ct); return Results.Ok(new { userId, temporaryPassword = temporary, shownOnce = true, forceChangeAtNextLogin = r.ForceChangeAtNextLogin });
    }

    public async Task<IResult> ForceSignOutAsync(HttpContext c, string userId, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !a.SuperAdmin) return Results.Forbid(); var account = (await QueryAsync("UserAccounts", "SELECT * FROM c WHERE c.userId=@u", ("@u", userId), ct)).SingleOrDefault(); if (account is null) return Results.NotFound(); var version = Long(account, "sessionVersion", 1) + 1; await Container("UserAccounts").PatchItemAsync<object>(Text(account, "id"), new("global"), [PatchOperation.Set("/sessionVersion", version)], cancellationToken: ct); await AuditAsync(c, "identity_force_sign_out", userId, null, "administrative", ct); return Results.Ok(new { userId, sessionVersion = version }); }

    public async Task<IResult> TenantAuditAsync(HttpContext c, string tenantUid, CancellationToken ct)
    { var a = await ActorAsync(c, ct); if (a is null || !await CanAccessTenant(a, tenantUid, ct)) return Results.Forbid(); return Results.Ok(await QueryAsync("SecurityAuditEvents", "SELECT * FROM c WHERE c.targetTenantUid=@t", ("@t", tenantUid), ct)); }

    private async Task<Actor?> ActorAsync(HttpContext c, CancellationToken ct)
    { var legacyId = c.User.FindFirstValue(ClaimTypes.NameIdentifier); if (legacyId is null || _client is null) return null; var account = (await QueryAsync("UserAccounts", "SELECT * FROM c WHERE c.legacyUserId=@id", ("@id", legacyId), ct)).SingleOrDefault(); if (account is null || !long.TryParse(c.User.FindFirstValue("sessionVersion"), out var tokenVersion) || tokenVersion != Long(account, "sessionVersion", 1)) return null; return new(account, legacyId, Text(account, "legacyTenantId"), c.User.IsInRole("SuperAdmin")); }
    private async Task<bool> CanAccessTenant(Actor a, string t, CancellationToken ct) => a.SuperAdmin || (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active'", ("@u", Text(a.Account, "userId")), ("@t", t), ct)).Count == 1;
    private async Task<bool> CanManageTenant(Actor a, string t, CancellationToken ct) => a.SuperAdmin || (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.userId=@u AND c.tenantUid=@t AND c.status='Active' AND c.role='TenantAdmin'", ("@u", Text(a.Account, "userId")), ("@t", t), ct)).Count == 1;
    private async Task<int> ActiveAdminCount(string t, CancellationToken ct) => (await QueryAsync("TenantMemberships", "SELECT * FROM c WHERE c.tenantUid=@t AND c.status='Active' AND c.role='TenantAdmin'", ("@t", t), ct)).Count;
    private bool Enabled(Func<IdentityFeatureOptions, bool> test) => _features.CurrentValue.Enabled && test(_features.CurrentValue);
    private Container Container(string name) => _client!.GetDatabase(_databaseName).GetContainer(name);
    private async Task<List<JsonObject>> QueryAsync(string container, string sql, CancellationToken ct) => await QueryAsync(container, sql, [], ct);
    private async Task<List<JsonObject>> QueryAsync(string container, string sql, (string, object) p1, CancellationToken ct) => await QueryAsync(container, sql, [p1], ct);
    private async Task<List<JsonObject>> QueryAsync(string container, string sql, (string, object) p1, (string, object) p2, CancellationToken ct) => await QueryAsync(container, sql, [p1, p2], ct);
    private async Task<List<JsonObject>> QueryAsync(string container, string sql, (string, object)[] ps, CancellationToken ct) { var q = new QueryDefinition(sql); foreach (var p in ps) q.WithParameter(p.Item1, p.Item2); var it = Container(container).GetItemQueryIterator<JsonObject>(q); var rows = new List<JsonObject>(); while (it.HasMoreResults) rows.AddRange(await it.ReadNextAsync(ct)); return rows; }
    private async Task AuditAsync(HttpContext c, string type, string target, string? tenant, string reason, CancellationToken ct) { var a = await ActorAsync(c, ct); var item = new { id = $"{type}-{c.TraceIdentifier}", auditPartition = "global", eventType = type, actorUserId = a is null ? null : Text(a.Account, "userId"), actorRole = a?.SuperAdmin == true ? "SuperAdmin" : "TenantAdmin", targetUserId = target, targetTenantUid = tenant, requestId = c.TraceIdentifier, reason, result = "success", createdAt = DateTime.UtcNow }; await Container("SecurityAuditEvents").UpsertItemAsync(item, new("global"), cancellationToken: ct); }
    private static object SafeUser(JsonObject x) => new { userId = Text(x, "userId"), loginEmail = Text(x, "loginEmail"), normalizedEmail = Text(x, "normalizedEmail"), globalRole = Text(x, "globalRole"), status = Text(x, "status"), forcePasswordChange = Bool(x, "forcePasswordChange"), sessionVersion = Long(x, "sessionVersion", 1) };
    private static IResult Disabled(HttpContext c) => Results.Conflict(new IdentityError("identity_management_disabled", "Identity management is not active.", c.TraceIdentifier));
    private static IResult Unauthorized(HttpContext c) => Results.Unauthorized();
    private static IResult Bad(HttpContext c, string code) => Results.BadRequest(new IdentityError(code, code.Replace('_', ' '), c.TraceIdentifier));
    private static string Text(JsonObject x, string n) => x[n]?.GetValue<string>() ?? "";
    private static bool Bool(JsonObject x, string n) => x[n] is JsonValue v && v.TryGetValue<bool>(out var b) && b;
    private static long Long(JsonObject x, string n, long fallback) => x[n] is JsonValue v && v.TryGetValue<long>(out var l) ? l : fallback;
    private static string Digest(params string[] values) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", values)))).ToLowerInvariant()[..32];
    public void Dispose() => _client?.Dispose();
    private sealed record Actor(JsonObject Account, string LegacyUserId, string LegacyTenantId, bool SuperAdmin);
}
