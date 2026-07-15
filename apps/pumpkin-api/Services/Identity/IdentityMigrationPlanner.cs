using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public sealed record LegacyIdentitySnapshot(IReadOnlyList<Tenant> Tenants, IReadOnlyList<User> Users,
    IReadOnlyDictionary<string, IReadOnlyList<string>> FormRecipients,
    IReadOnlyDictionary<string, IReadOnlyList<string>> DependencyReferences);
public sealed record TenantBackfillPlan(string LegacyTenantId, string ProposedTenantUid, string CanonicalSlug,
    IReadOnlyList<string> Dependencies, string Status);
public sealed record UserBackfillPlan(string LegacyUserId, string NormalizedEmail, string ProposedUserId,
    IReadOnlyList<string> TenantUids, string Status);
public sealed record IdentityMigrationPlan(string InputFingerprint, bool DryRun, bool ExecutionEnabled,
    IReadOnlyList<TenantBackfillPlan> Tenants, IReadOnlyList<UserBackfillPlan> Users,
    IReadOnlyList<TenantMembership> Memberships, IReadOnlyList<IdentityMigrationConflict> Conflicts,
    string ResumeToken);

public static class IdentityMigrationPlanner
{
    public static IdentityMigrationPlan CreateDryRun(LegacyIdentitySnapshot snapshot)
    {
        var fingerprint = Fingerprint(snapshot);
        var conflicts = new List<IdentityMigrationConflict>();
        var tenantSlugs = snapshot.Tenants.GroupBy(x => x.TenantId.Trim().ToLowerInvariant()).ToList();
        foreach (var duplicate in tenantSlugs.Where(x => x.Count() > 1))
            conflicts.Add(Conflict("tenant_slug_collision", duplicate.Key, null, $"{duplicate.Count()} legacy tenants share this slug"));

        var tenantPlans = snapshot.Tenants.OrderBy(x => x.TenantId, StringComparer.Ordinal).Select(tenant =>
        {
            var slug = tenant.TenantId.Trim().ToLowerInvariant();
            var uid = DeterministicId("tenant", tenant.Id, slug);
            var deps = snapshot.DependencyReferences.TryGetValue(tenant.TenantId, out var values) ? values : [];
            return new TenantBackfillPlan(tenant.TenantId, uid, slug, deps.OrderBy(x => x, StringComparer.Ordinal).ToArray(),
                conflicts.Any(x => x.LegacyTenantId == slug) ? "conflict_hold" : "planned");
        }).ToArray();

        var userGroups = snapshot.Users.GroupBy(x => IdentitySecurityService.NormalizeEmail(x.Email)).ToList();
        foreach (var group in userGroups.Where(x => x.Count() > 1))
            conflicts.Add(Conflict("duplicate_normalized_email", null, null, $"{group.Count()} legacy users share normalized email {group.Key}"));

        foreach (var user in snapshot.Users.Where(x => !snapshot.Tenants.Any(t => t.TenantId == x.TenantId)))
            conflicts.Add(Conflict("orphaned_user", user.TenantId, user.Id, "Legacy user references a missing tenant"));

        var userPlans = userGroups.OrderBy(x => x.Key, StringComparer.Ordinal).Select(group =>
        {
            var first = group.OrderBy(x => x.Id, StringComparer.Ordinal).First();
            var tenantUids = group.Select(user => tenantPlans.FirstOrDefault(t => t.LegacyTenantId == user.TenantId)?.ProposedTenantUid)
                .Where(x => x is not null).Cast<string>().Distinct().OrderBy(x => x, StringComparer.Ordinal).ToArray();
            return new UserBackfillPlan(first.Id, group.Key, DeterministicId("user", first.Id, group.Key), tenantUids,
                group.Count() > 1 ? "conflict_hold" : "planned");
        }).ToArray();

        var memberships = snapshot.Users.OrderBy(x => x.TenantId).ThenBy(x => x.Id).Select(user =>
        {
            var tenantUid = tenantPlans.FirstOrDefault(x => x.LegacyTenantId == user.TenantId)?.ProposedTenantUid ?? "unresolved";
            var userId = userPlans.FirstOrDefault(x => x.NormalizedEmail == IdentitySecurityService.NormalizeEmail(user.Email))?.ProposedUserId ?? "unresolved";
            return new TenantMembership
            {
                MembershipId = DeterministicId("membership", tenantUid, userId), TenantUid = tenantUid, UserId = userId,
                Role = user.Role switch { UserRole.TenantAdmin => TenantRole.TenantAdmin, UserRole.Editor => TenantRole.Editor, _ => TenantRole.Viewer },
                Permissions = [.. user.Permissions], Status = user.IsActive ? IdentityRecordStatus.Active : IdentityRecordStatus.Suspended,
                IsPrimaryTenantAdmin = user.Role == UserRole.TenantAdmin, CreatedByUserId = "legacy-backfill"
            };
        }).ToArray();

        foreach (var tenant in tenantPlans)
        {
            var admins = memberships.Count(x => x.TenantUid == tenant.ProposedTenantUid && x.Role == TenantRole.TenantAdmin && x.Status == IdentityRecordStatus.Active);
            if (admins == 0) conflicts.Add(Conflict("tenant_without_active_admin", tenant.LegacyTenantId, null, "No active TenantAdmin discovered"));
            if (admins > 1) conflicts.Add(Conflict("multiple_apparent_primary_admins", tenant.LegacyTenantId, null, $"{admins} active TenantAdmins discovered"));
        }

        return new IdentityMigrationPlan(fingerprint, true, false, tenantPlans, userPlans, memberships,
            conflicts.OrderBy(x => x.Category).ThenBy(x => x.LegacyTenantId).ToArray(), Convert.ToBase64String(Encoding.UTF8.GetBytes(fingerprint)));
    }

    public static string ToSafeJson(IdentityMigrationPlan plan) => JsonSerializer.Serialize(plan, new JsonSerializerOptions { WriteIndented = true });
    private static string DeterministicId(params string[] parts) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", parts)))).ToLowerInvariant()[..32];
    private static string Fingerprint(LegacyIdentitySnapshot snapshot) => DeterministicId("v2.8.63a", JsonSerializer.Serialize(snapshot));
    private static IdentityMigrationConflict Conflict(string category, string? tenantId, string? userId, string detail) => new()
        { Category = category, LegacyTenantId = tenantId, UserId = userId, SafeDetail = detail };
}
