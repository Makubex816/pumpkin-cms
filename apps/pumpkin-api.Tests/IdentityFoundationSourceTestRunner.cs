using System.Text.Json;
using pumpkin_api.Services.Identity;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class IdentityFoundationSourceTestRunner
{
    public static Task RunAsync()
    {
        var tests = new (string Name, Action Run)[]
        {
            ("feature flags default safely disabled", FeatureFlagsDisabled),
            ("Cosmos and Mongo contracts have parity", ProviderParity),
            ("UserAccount email uniqueness is global in Cosmos", GlobalEmailUniqueness),
            ("one identity can map to multiple tenants deterministically", MultiTenantIdentity),
            ("duplicate normalized email is held as conflict", DuplicateEmailConflict),
            ("orphaned user is held as conflict", OrphanConflict),
            ("final active TenantAdmin cannot be removed", FinalAdminProtection),
            ("session revocation rotates both version and stamp", SessionRevocation),
            ("tenant slug syntax and reserved words are rejected", SlugValidation),
            ("backup projection excludes password hash and tokens", BackupRedaction),
            ("migration dry run is deterministic and execution disabled", DeterministicDryRun),
            ("notification provider honestly reports no-provider state", NoProvider)
            ,("dual-write writer is registered on login", LoginDualWriteSource)
            ,("feature state diagnostic is authenticated", FeatureDiagnosticSource)
        };
        foreach (var test in tests) { test.Run(); Console.WriteLine($"PASS: {test.Name}"); }
        Console.WriteLine($"Identity foundation source tests passed: {tests.Length}/{tests.Length}");
        return Task.CompletedTask;
    }

    private static void FeatureFlagsDisabled() => Assert(new IdentityFeatureOptions().IsSafeV2_8_63A, "unsafe defaults");
    private static void ProviderParity()
    {
        IdentityProviderParity.AssertEquivalent("CosmosDb", IdentityProviderParity.Definitions);
        IdentityProviderParity.AssertEquivalent("MongoDb", IdentityProviderParity.Definitions);
    }
    private static void GlobalEmailUniqueness()
    {
        var users = IdentityProviderParity.Definitions.Single(x => x.Name == "UserAccounts");
        Assert(users.PartitionKey == "/identityPartition" && users.UniqueKeys.Contains("/normalizedEmail"), "email uniqueness is partition-local");
        var account = new UserAccount { UserId = "u", LoginEmail = "a@example.com", NormalizedEmail = "A@EXAMPLE.COM", PasswordHash = "hash" };
        Assert(account.PartitionKey == "global", "UserAccount partition is not global");
    }
    private static void MultiTenantIdentity()
    {
        var tenants = new[] { Tenant("one"), Tenant("two") };
        var users = new[] { User("u1", "one", "person@example.com"), User("u2", "two", "PERSON@example.com") };
        var plan = IdentityMigrationPlanner.CreateDryRun(new(tenants, users, EmptyRecipients(), EmptyDependencies()));
        Assert(plan.Users.Count == 1 && plan.Users[0].TenantUids.Count == 2, "global identity not consolidated");
        Assert(plan.Conflicts.Any(x => x.Category == "duplicate_normalized_email"), "required controlled conflict missing");
    }
    private static void DuplicateEmailConflict()
    {
        var plan = IdentityMigrationPlanner.CreateDryRun(new([Tenant("one")],
            [User("u1", "one", "a@example.com"), User("u2", "one", "A@example.com")], EmptyRecipients(), EmptyDependencies()));
        Assert(plan.Conflicts.Count(x => x.Category == "duplicate_normalized_email") == 1, "duplicate not detected");
    }
    private static void OrphanConflict()
    {
        var plan = IdentityMigrationPlanner.CreateDryRun(new([Tenant("one")], [User("u1", "missing", "a@example.com")], EmptyRecipients(), EmptyDependencies()));
        Assert(plan.Conflicts.Any(x => x.Category == "orphaned_user"), "orphan not detected");
    }
    private static void FinalAdminProtection()
    {
        var admin = new TenantMembership { MembershipId = "m", TenantUid = "t", UserId = "u", Role = TenantRole.TenantAdmin };
        var threw = false;
        try { IdentitySecurityService.EnsureFinalAdminInvariant([admin], admin, IdentityRecordStatus.Revoked); }
        catch (InvalidOperationException) { threw = true; }
        Assert(threw, "final admin removal allowed");
    }
    private static void SessionRevocation()
    {
        var user = new UserAccount { UserId = "u", LoginEmail = "a@example.com", NormalizedEmail = "A@EXAMPLE.COM", PasswordHash = "not-exported" };
        var stamp = user.SecurityStamp; IdentitySecurityService.RevokeSessions(user, true);
        Assert(user.SessionVersion == 2 && user.SecurityStamp != stamp && user.ForcePasswordChange, "session not rotated");
    }
    private static void SlugValidation()
    {
        Assert(IdentitySecurityService.ValidateSlug("valid-slug").Count == 0, "valid slug rejected");
        Assert(IdentitySecurityService.ValidateSlug("admin").Contains("slug_reserved"), "reserved slug accepted");
        Assert(IdentitySecurityService.ValidateSlug("Bad Slug").Contains("slug_invalid_syntax"), "invalid slug accepted");
    }
    private static void BackupRedaction()
    {
        var user = new UserAccount { UserId = "u", LoginEmail = "a@example.com", NormalizedEmail = "A@EXAMPLE.COM", PasswordHash = "SENSITIVE_HASH" };
        var json = JsonSerializer.Serialize(IdentityBackupContract.Sanitize(user));
        Assert(!json.Contains("SENSITIVE_HASH") && !json.Contains("PasswordHash"), "credential leaked");
    }
    private static void DeterministicDryRun()
    {
        var snapshot = new LegacyIdentitySnapshot([Tenant("one")], [User("u", "one", "a@example.com", UserRole.TenantAdmin)], EmptyRecipients(), EmptyDependencies());
        var a = IdentityMigrationPlanner.CreateDryRun(snapshot); var b = IdentityMigrationPlanner.CreateDryRun(snapshot);
        Assert(a.InputFingerprint == b.InputFingerprint && a.ResumeToken == b.ResumeToken && !a.ExecutionEnabled, "dry run not deterministic/safe");
        var reloaded = new LegacyIdentitySnapshot([Tenant("one")], [User("u", "one", "a@example.com", UserRole.TenantAdmin)], EmptyRecipients(), EmptyDependencies());
        Assert(a.InputFingerprint == IdentityMigrationPlanner.CreateDryRun(reloaded).InputFingerprint, "model default timestamps changed plan hash");
    }
    private static void NoProvider() => Assert(new DisabledIdentityNotificationProvider().Capability == NotificationCapability.DisabledNoProvider, "provider state dishonest");
    private static void LoginDualWriteSource()
    {
        var root = FindRepositoryRoot();
        var program = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        Assert(program.Contains("IIdentityLoginCompatibilityWriter identityWriter") && program.Contains("WriteSuccessfulLoginAsync"), "login does not invoke identity dual-write");
    }
    private static void FeatureDiagnosticSource()
    {
        var root = FindRepositoryRoot();
        var endpoints = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs"));
        Assert(endpoints.Contains("/api/identity/feature-state") && endpoints.Contains("RequireAuthorization()"), "feature diagnostic is missing or public");
    }

    private static Tenant Tenant(string slug) => new() { Id = $"legacy-{slug}", TenantId = slug, Name = slug, Status = "active" };
    private static User User(string id, string tenant, string email, UserRole role = UserRole.Viewer) => new()
        { Id = id, TenantId = tenant, Email = email, Username = id, PasswordHash = "legacy-valid-hash", Role = role };
    private static IReadOnlyDictionary<string, IReadOnlyList<string>> EmptyRecipients() => new Dictionary<string, IReadOnlyList<string>>();
    private static IReadOnlyDictionary<string, IReadOnlyList<string>> EmptyDependencies() => new Dictionary<string, IReadOnlyList<string>>();
    private static void Assert(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null && !Directory.Exists(Path.Combine(current.FullName, "apps"))) current = current.Parent;
        return current?.FullName ?? throw new DirectoryNotFoundException("repository root not found");
    }
}
