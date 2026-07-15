using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;
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
            ,("management defaults remain disabled", ManagementDefaults)
            ,("JWT session version is issued and enforced", SessionVersionSource)
            ,("management routes use tenant authorization", ManagementAuthorizationSource)
            ,("session version production shapes are compatible", SessionVersionShapes)
            ,("production login lookup is gateway bounded and stage traced", ProductionLoginLookupBounded)
            ,("credential routes are bounded, rate limited, diagnostic gated, and never cacheable", CredentialCapacityGuardsSource)
            ,("management stages require dual-read and mutations require dual-write", ManagementFeaturePolicy)
            ,("protected session evaluation rejects stale or inactive identity", ProtectedSessionEvaluation)
            ,("forced password rotation only permits recovery routes", ForcedPasswordRecoveryPaths)
            ,("production identity partition paths match provisioned containers", ProductionPartitionPaths)
            ,("protected JWT validation and forced-rotation middleware are global", GlobalIdentityEnforcementSource)
            ,("login timing is correlated, safe, and invokes BCrypt once", LoginCapacityInstrumentationSource)
            ,("login authority revalidates the exact verified credential snapshot", LoginCredentialParitySource)
            ,("session writes, listing, and revocation use the production request partition", SessionManagementSource)
            ,("tenant switch reissues and verifies an active-membership token", TenantSwitchSource)
            ,("identity management route activation is implemented and rename remains held", ManagementRouteCoverageSource)
            ,("SuperAdmin mutation gates and actor audit attribution are explicit", AdministrativeMutationSource)
            ,("identity Cosmos reads are endpoint-pinned and total-row bounded", ManagementCosmosBoundSource)
            ,("identity mutation DTOs bind string enum names", IdentityMutationEnumBinding)
            ,("contact recipients round-trip with canonical camel-case fields", ContactRecipientRoundTrip)
            ,("contact settings expose an opaque client concurrency contract", ContactConcurrencyContractSource)
            ,("legacy identity writes cannot bypass authoritative pairs", LegacyWriteBypassSource)
            ,("global SuperAdmin and authoritative home memberships resist lockout", MembershipLockoutProtectionSource)
            ,("identity idempotency and admin invariant lease are durable", IdempotencyAndInvariantLeaseSource)
            ,("synthetic validation tooling is compensating, non-delivery, and cleanup-complete", SyntheticValidationToolSource)
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
    private static void ManagementDefaults()
    {
        var options = new IdentityFeatureOptions();
        Assert(!options.ManagementEnabled && !options.TenantSwitcherEnabled && !options.SuperAdminManagementEnabled, "management defaults are active");
    }
    private static void SessionVersionSource()
    {
        var root = FindRepositoryRoot();
        var program = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        var service = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs"));
        Assert(program.Contains("new Claim(\"sessionVersion\"") && service.Contains("tokenVersion != Long(account, \"sessionVersion\"") &&
               service.Contains("IsLegacyProductionDiagnosticRequest") && service.Contains("EvaluateLegacyProductionDiagnosticSession"),
            "session version is not issued/enforced with diagnostic-only production-token compatibility");
    }
    private static void ManagementAuthorizationSource()
    {
        var root = FindRepositoryRoot();
        var service = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs"));
        Assert(service.Contains("CanManageTenant") && service.Contains("final_tenant_admin_protected") && service.Contains("email_not_unique"), "management authorization invariants missing");
    }
    private static void SessionVersionShapes()
    {
        static long Parse(string json) { using var document = JsonDocument.Parse(json); return IdentityLoginCompatibilityWriter.ParseSessionVersion(document.RootElement); }
        Assert(Parse("{}") == 1 && Parse("{\"sessionVersion\":null}") == 1 && Parse("{\"sessionVersion\":3}") == 3 && Parse("{\"sessionVersion\":\"4\"}") == 4, "compatible session version shape rejected");
        var threw = false; try { Parse("{\"sessionVersion\":\"broken\"}"); } catch (JsonException) { threw = true; }
        Assert(threw, "malformed session version accepted");
    }
    private static void ProductionLoginLookupBounded()
    {
        var root = FindRepositoryRoot();
        var program = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        var cosmos = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var writer = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "Identity", "IdentityLoginCompatibilityWriter.cs"));
        Assert(cosmos.Contains("ConnectionMode = ConnectionMode.Gateway") &&
               cosmos.Contains("overall.CancelAfter(TimeSpan.FromMilliseconds(4800))") &&
               cosmos.Contains("attemptTimeout.CancelAfter(TimeSpan.FromMilliseconds(2200))") &&
               cosmos.Contains("ReadNextAsync(cancellationToken)"), "login lookup can wait without a bounded gateway budget");
        Assert(program.Contains("stage=legacy_lookup_started") &&
               program.Contains("stage=legacy_lookup_completed") &&
               program.Contains("loginBudget.CancelAfter(TimeSpan.FromSeconds(9))") &&
               !program.Contains("request.Password}"), "safe login stage tracing or the request-wide budget is missing");
        Assert(cosmos.Contains("PartitionKey = new PartitionKey(\"global\")") &&
               cosmos.Contains("legacy_login_locator_missing") &&
               cosmos.Contains("__identity_login_enumeration_probe__") &&
               cosmos.Contains("ReadItemAsync<pumpkin_net_models.Models.User>"),
            "legacy login does not use the single-partition locator, fixed miss, and point read");
        Assert(cosmos.Contains("attempt <= 2") &&
               cosmos.Contains("catch (OperationCanceledException) when (") &&
               cosmos.Contains("legacy_login_locator_retry_exhausted"),
            "legacy login does not provide one bounded retry for a cold worker timeout");
        Assert(cosmos.Contains("LimitToEndpoint = true") && cosmos.Contains("RequestTimeout = TimeSpan.FromSeconds(10)"),
            "Cosmos endpoint discovery is not bounded to the configured account endpoint");
        Assert(writer.Contains("GetRequiredService<CosmosDataConnection>().SharedClient") &&
               !writer.Contains("new CosmosClient(") && writer.Contains("PatchOperation.Set(\"/lastLoginAt\"") &&
               writer.Contains("new CancellationTokenSource(TimeSpan.FromSeconds(2))"),
            "login compatibility writes create a second client, replace an account, or lack independent reconciliation cancellation");
        var updateLastLogin = SliceBetween(cosmos, "public async Task UpdateUserLastLoginAsync(", "public async Task<List<TenantRedirect>>");
        Assert(updateLastLogin.Contains("PatchItemAsync<object>") && updateLastLogin.Contains("PatchOperation.Set(\"/lastLogin\"") &&
               !updateLastLogin.Contains("ReplaceItemAsync"), "legacy last-login accounting overwrites the full user document");
    }

    private static void CredentialCapacityGuardsSource()
    {
        var program = Source("apps", "pumpkin-api", "Program.cs");
        var endpoints = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs");
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var dataContract = Source("apps", "pumpkin-api", "Services", "IDataConnection.cs");
        var databaseContract = Source("apps", "pumpkin-api", "Services", "IDatabaseService.cs");
        var databaseService = Source("apps", "pumpkin-api", "Services", "DatabaseService.cs");
        var cosmos = Source("apps", "pumpkin-api", "Services", "CosmosDataConnection.cs");
        var mongo = Source("apps", "pumpkin-api", "Services", "MongoDataConnection.cs");
        Assert(program.Contains("StartsWithSegments(\"/api/auth\"") &&
               program.Contains("StartsWithSegments(\"/api/identity\"") &&
               program.Contains("context.Response.Headers.CacheControl = \"no-store\"") &&
               program.Contains("context.Response.Headers.Pragma = \"no-cache\""),
            "auth and identity responses can be cached on an early response path");
        Assert(program.Contains("maximumCredentialBodyBytes = 4096") &&
               program.Contains("IHttpMaxRequestBodySizeFeature") && program.Contains("Status413PayloadTooLarge") &&
               program.Contains("Encoding.UTF8.GetByteCount(request.Password) > 1024") &&
               program.Contains("Encoding.UTF8.GetByteCount(request.Email) > 320"),
            "credential request bodies or fields are unbounded");
        Assert(program.Contains("PermitLimit = 2") && program.Contains("options.AddPolicy(\"identity-login\"") &&
               program.Contains("options.AddPolicy(\"identity-credential-mutation\"") &&
               program.Contains("RequireRateLimiting(\"identity-login\")") &&
               endpoints.Contains("RequireRateLimiting(\"identity-credential-mutation\")") &&
               program.Contains("Response.Headers.RetryAfter = \"5\""),
            "expensive credential routes lack worker, endpoint, or retry bounds");
        var diagnostic = SliceBetween(program, "app.MapPost(\"/api/identity/diagnostics/legacy-lookup\"", "// Login endpoint");
        Assert(diagnostic.Contains("UserRole.SuperAdmin") && diagnostic.Contains("CapacityDiagnosticsEnabled") &&
               diagnostic.Contains("Encoding.UTF8.GetByteCount(request.Email) > 320") &&
               diagnostic.Contains("RequireAuthorization()") &&
               diagnostic.Contains("RequireRateLimiting(\"identity-credential-mutation\")"),
            "legacy diagnostic is not capacity-gated, SuperAdmin-only, size-bounded, and rate-limited");
        var legacyLookup = SliceBetween(service, "private async Task<pumpkin_net_models.Models.User?> LegacyForAccountAsync", "private async Task<PasswordMutationResult> UpdatePasswordPairAsync");
        Assert(legacyLookup.Contains("CancellationToken cancellationToken") &&
               legacyLookup.Contains("CreateLinkedTokenSource(cancellationToken)") &&
               legacyLookup.Contains("CancelAfter(TimeSpan.FromSeconds(5))") &&
               legacyLookup.Contains("if (hasLegacyUserId || hasLegacyTenantId)") &&
               legacyLookup.Contains("if (!hasLegacyUserId || !hasLegacyTenantId) return null") &&
               legacyLookup.Contains("GetUserByIdAsync(legacyTenantId, legacyUserId, lookupBudget.Token)") &&
               legacyLookup.Contains("GetUserByEmailAsync(Text(account, \"loginEmail\"), lookupBudget.Token)"),
            "legacy account mutation lookup can outlive its operation budget or fall back from a stable id to mutable email");
        const string cancellableIdSignature = "GetUserByIdAsync(string tenantId, string userId, CancellationToken cancellationToken)";
        Assert(dataContract.Contains(cancellableIdSignature) && databaseContract.Contains(cancellableIdSignature) &&
               databaseService.Contains(cancellableIdSignature) &&
               cosmos.Contains("CancellationToken cancellationToken") && mongo.Contains(cancellableIdSignature) &&
               cosmos.Contains("cancellationToken: cancellationToken") &&
               mongo.Contains("FirstOrDefaultAsync(cancellationToken)"),
            "legacy id point reads do not propagate cancellation through service and provider boundaries");
    }

    private static void ManagementFeaturePolicy()
    {
        var options = new IdentityFeatureOptions { Enabled = true, DualReadEnabled = true, ManagementEnabled = true };
        Assert(IdentityFeaturePolicy.Foundation(options) && IdentityFeaturePolicy.ManagementRead(options), "read-only management stage is not available");
        options.TenantSwitcherEnabled = true;
        Assert(!IdentityFeaturePolicy.ManagementMutation(options) && !IdentityFeaturePolicy.TenantSwitcher(options) &&
               !IdentityFeaturePolicy.PasswordAndSessions(options) && !IdentityFeaturePolicy.Memberships(options) &&
               !IdentityFeaturePolicy.Contacts(options) && !IdentityFeaturePolicy.SuperAdmin(options),
            "a management mutation is available before dual-write");
        options.DualWriteEnabled = true;
        options.PasswordAndSessionManagementEnabled = true;
        options.MembershipManagementEnabled = true;
        options.ContactManagementEnabled = true;
        options.SuperAdminManagementEnabled = true;
        options.ProviderAwareEmailRequestsEnabled = true;
        Assert(IdentityFeaturePolicy.ManagementMutation(options) && IdentityFeaturePolicy.TenantSwitcher(options) &&
               IdentityFeaturePolicy.PasswordAndSessions(options) && IdentityFeaturePolicy.Memberships(options) &&
               IdentityFeaturePolicy.Contacts(options) && IdentityFeaturePolicy.SuperAdmin(options) &&
               IdentityFeaturePolicy.ProviderAwareEmail(options), "an explicitly activated management stage remains unavailable");
        options.DualReadEnabled = false;
        Assert(!IdentityFeaturePolicy.ManagementRead(options) && !IdentityFeaturePolicy.SuperAdmin(options),
            "management bypasses dual-read safety");
    }

    private static void ProtectedSessionEvaluation()
    {
        var account = new JsonObject
        {
            ["userId"] = "user-1",
            ["status"] = "Active",
            ["globalRole"] = "Viewer",
            ["sessionVersion"] = 3,
            ["forcePasswordChange"] = true
        };
        var principal = Principal(new Claim("sessionVersion", "3"), new Claim(ClaimTypes.Role, "Viewer"));
        var valid = IdentityManagementService.EvaluateSession(account, principal);
        Assert(valid.Status == IdentitySessionValidationStatus.Valid && valid.ForcePasswordChange, "valid forced-rotation session rejected");

        account["status"] = "Suspended";
        Assert(IdentityManagementService.EvaluateSession(account, principal).Status == IdentitySessionValidationStatus.AccountInactive,
            "suspended account session accepted");
        account["status"] = "Active";
        Assert(IdentityManagementService.EvaluateSession(account, Principal(new Claim("sessionVersion", "2"), new Claim(ClaimTypes.Role, "Viewer"))).Status == IdentitySessionValidationStatus.VersionMismatch,
            "stale session version accepted");
        Assert(IdentityManagementService.EvaluateSession(account, Principal(new Claim("sessionVersion", "3"), new Claim(ClaimTypes.Role, "SuperAdmin"))).Status == IdentitySessionValidationStatus.RoleMismatch,
            "stale SuperAdmin role accepted");

        var legacySuperAdmin = Principal(
            new Claim(ClaimTypes.NameIdentifier, "legacy-user-1"),
            new Claim(ClaimTypes.Role, "SuperAdmin"),
            new Claim("tenantId", "legacy-tenant-1"));
        var legacyAccount = new JsonObject
        {
            ["userId"] = "identity-user-1",
            ["legacyUserId"] = "legacy-user-1",
            ["legacyTenantId"] = "legacy-tenant-1",
            ["status"] = "Active",
            ["globalRole"] = "SuperAdmin",
            ["sessionVersion"] = 1,
            ["forcePasswordChange"] = false
        };
        Assert(IdentityManagementService.IsLegacyProductionTokenShape(legacySuperAdmin) &&
               IdentityManagementService.IsLegacyProductionDiagnosticRequest(
                   new PathString("/api/identity/diagnostics/legacy-lookup"), true, legacySuperAdmin) &&
               IdentityManagementService.EvaluateLegacyProductionDiagnosticSession(legacyAccount, legacySuperAdmin).Status == IdentitySessionValidationStatus.Valid,
            "the exact currently issued production SuperAdmin token shape is not diagnostic-compatible");
        Assert(!IdentityManagementService.IsLegacyProductionDiagnosticRequest(
                   new PathString("/api/auth/verify"), true, legacySuperAdmin) &&
               !IdentityManagementService.IsLegacyProductionDiagnosticRequest(
                   new PathString("/api/identity/admin/users/target/password-reset"), true, legacySuperAdmin) &&
               !IdentityManagementService.IsLegacyProductionDiagnosticRequest(
                   new PathString("/api/identity/diagnostics/legacy-lookup"), false, legacySuperAdmin),
            "legacy production-token compatibility escapes the temporary diagnostic route and flag boundary");
        var malformedCurrentToken = Principal(
            new Claim(ClaimTypes.NameIdentifier, "legacy-user-1"),
            new Claim(ClaimTypes.Role, "SuperAdmin"),
            new Claim("tenantId", "legacy-tenant-1"),
            new Claim("sessionVersion", string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, "new-token-with-missing-version"));
        Assert(!IdentityManagementService.IsLegacyProductionTokenShape(malformedCurrentToken) &&
               IdentityManagementService.EvaluateLegacyProductionDiagnosticSession(legacyAccount, malformedCurrentToken).Status == IdentitySessionValidationStatus.VersionMismatch,
            "a malformed current token can enter the legacy production compatibility path");
        legacyAccount["sessionVersion"] = 2;
        Assert(IdentityManagementService.EvaluateLegacyProductionDiagnosticSession(legacyAccount, legacySuperAdmin).Status == IdentitySessionValidationStatus.VersionMismatch,
            "session revocation does not invalidate the diagnostic-only legacy production token");
    }

    private static void ForcedPasswordRecoveryPaths()
    {
        Assert(IdentityManagementService.IsForcePasswordChangePathAllowed(new PathString("/api/identity/current/password")), "password recovery route blocked");
        Assert(IdentityManagementService.IsForcePasswordChangePathAllowed(new PathString("/API/AUTH/LOGOUT")), "logout recovery route is case-sensitive");
        Assert(!IdentityManagementService.IsForcePasswordChangePathAllowed(new PathString("/api/admin/tenants")), "ordinary protected route allowed before forced rotation");
    }

    private static void ProductionPartitionPaths()
    {
        Assert(IdentityProviderParity.Definitions.Single(x => x.Name == "IdentityRequests").PartitionKey == "/requestPartition", "IdentityRequests partition drift");
        Assert(IdentityProviderParity.Definitions.Single(x => x.Name == "SecurityAuditEvents").PartitionKey == "/auditPartition", "SecurityAuditEvents partition drift");
        Assert(IdentityProviderParity.Definitions.Single(x => x.Name == "IdentityMigration").PartitionKey == "/migrationPartition", "IdentityMigration partition drift");
    }

    private static void GlobalIdentityEnforcementSource()
    {
        var program = Source("apps", "pumpkin-api", "Program.cs");
        Assert(program.Contains("OnTokenValidated = async context") &&
               program.Contains("ValidateProtectedSessionAsync") &&
               program.Contains("identity_session_invalid"), "JWT validation does not consult live identity state");
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var legacyCompatibility = SliceBetween(service, "public static bool IsLegacyProductionDiagnosticRequest", "public async Task<IdentityLoginAuthorityResult> ResolveLoginAuthorityAsync");
        Assert(legacyCompatibility.Contains("JwtRegisteredClaimNames.Jti") &&
               legacyCompatibility.Contains("JwtRegisteredClaimNames.Iat") &&
               legacyCompatibility.Contains("FindAll(\"sessionVersion\").Count() == 0") &&
               legacyCompatibility.Contains("CapacityDiagnosticsEnabled") == false &&
               service.Contains("_features.CurrentValue.CapacityDiagnosticsEnabled") &&
               legacyCompatibility.Contains("/api/identity/diagnostics/legacy-lookup") &&
               legacyCompatibility.Contains("Long(account, \"sessionVersion\", 1) != 1") &&
               !legacyCompatibility.Contains("TenantAdmin") &&
               service.Contains("context.Items[ValidatedAccountItemKey] = account"),
            "legacy production-token compatibility is not exact-shape, baseline-version, and diagnostic-only bounded");
        Assert(program.Contains("IdentitySessionValidationStatus.ProviderUnavailable") &&
               program.Contains("OnChallenge = async context") && program.Contains("context.HandleResponse()") &&
               program.Contains("StatusCodes.Status503ServiceUnavailable") &&
               program.Contains("identity_provider_temporarily_unavailable"),
            "transient identity-provider failure is presented as authoritative credential rejection");
        Assert(program.Contains("ForcePasswordChangeClaimType") &&
               program.Contains("IsForcePasswordChangePathAllowed") &&
               program.Contains("force_password_change_required"), "forced rotation is not globally enforced");
    }

    private static void LoginCapacityInstrumentationSource()
    {
        var program = Source("apps", "pumpkin-api", "Program.cs");
        var login = SliceBetween(program, "app.MapPost(\"/api/auth/login\"", ".WithName(\"Login\")");
        Assert(Count(login, "BCrypt.Net.BCrypt.Verify(") == 1, "login has duplicate BCrypt verification points");
        Assert(program.Contains("LoginEnumerationSafeBcryptHash") &&
               login.Contains("user is { IsActive: true }") &&
               login.IndexOf("BCrypt.Net.BCrypt.Verify(", StringComparison.Ordinal) <
               login.IndexOf("user is null || !user.IsActive || !passwordVerified", StringComparison.Ordinal),
            "unknown or inactive accounts bypass the single enumeration-safe BCrypt verification");
        Assert(login.Contains("bcryptCallCount = 1") && login.Contains("bcryptMs") && login.Contains("legacyLookupMs") &&
               login.Contains("identityWrite.IdentityWriteMs") && login.Contains("identityWrite.SessionWriteMs") &&
               login.Contains("identityWrite.AuditWriteMs"), "required login stage timings are incomplete");
        Assert(program.Contains("IdentityLoginTerminal requestId={RequestId}") &&
               program.Contains("Environment.GetEnvironmentVariable(\"WEBSITE_INSTANCE_ID\")") &&
               program.Contains("SHA256.HashData") && program.Contains("X-Pumpkin-Request-Id") &&
               program.Contains("CapacityDiagnosticsEnabled") && program.Contains("pumpkin.capacity-diagnostics") &&
               program.Contains("workerInstance={WorkerInstance}") &&
               program.Contains("auditWriteMs={AuditWriteMs}") && program.Contains("totalMs={TotalMs}"),
            "safe worker/correlation instrumentation is missing");
        Assert(!program.Contains("X-Pumpkin-Worker") && !program.Contains("X-Pumpkin-BCrypt-Calls") &&
               !program.Contains("Server-Timing"),
            "anonymous login diagnostics expose an account-existence timing oracle");
        Assert(!login.Contains("Console.WriteLine") && !login.Contains("Email={Email}") &&
               !login.Contains("Password={Password}") && !program.Contains("request.Password}") &&
               !program.Contains("user.PasswordHash}"),
            "login diagnostics expose identity or credential material");
    }

    private static void LoginCredentialParitySource()
    {
        var program = Source("apps", "pumpkin-api", "Program.cs");
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var login = SliceBetween(program, "app.MapPost(\"/api/auth/login\"", ".WithName(\"Login\")");
        var authority = SliceBetween(service, "ResolveLoginAuthorityAsync", "IsForcePasswordChangePathAllowed");
        var bcryptIndex = login.IndexOf("BCrypt.Net.BCrypt.Verify(request.Password, verifiedLegacyPasswordHash)", StringComparison.Ordinal);
        var authorityIndex = login.IndexOf("ResolveLoginAuthorityAsync", StringComparison.Ordinal);
        Assert(login.Contains("var verifiedLegacyPasswordHash = user is { IsActive: true }") &&
               bcryptIndex >= 0 && authorityIndex > bcryptIndex &&
               login.Contains("user, verifiedLegacyPasswordHash, loginBudget.Token"),
            "login authority does not receive the exact legacy hash snapshot verified by BCrypt");
        Assert(authority.Contains("authoritativePasswordHash") &&
               authority.Contains("CryptographicOperations.FixedTimeEquals") &&
               authority.Contains("SHA256.HashData(Encoding.UTF8.GetBytes(verifiedLegacyPasswordHash))") &&
               authority.Contains("Text(account, \"legacyUserId\")") &&
               authority.Contains("Text(account, \"legacyTenantId\")") &&
               authority.Contains("Text(account, \"loginEmail\")") &&
               authority.Contains("Text(account, \"normalizedEmail\")"),
            "login authority can accept a post-reset version without credential and stable-linkage parity");
    }

    private static void SessionManagementSource()
    {
        var writer = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityLoginCompatibilityWriter.cs");
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        Assert(writer.Contains("requestPartition = userId") && writer.Contains("type = \"UserSession\"") &&
               writer.Contains("IdentityLoginWriteResult") && writer.Contains("SessionWriteMs") && writer.Contains("AuditWriteMs"),
            "successful login does not persist or time the session/audit writes");
        Assert(service.Contains("SELECT TOP 2 * FROM c WHERE c.legacyUserId=@id") &&
               writer.Contains("authority.AccountId") && writer.Contains("authority.UserId") &&
               !writer.Contains("DeterministicId(\"user\", legacyUser.Id"),
            "successful login derives the account id from mutable email instead of stable legacy linkage");
        Assert(service.Contains("SELECT TOP 100 * FROM c WHERE c.type='UserSession'") &&
               service.Contains("CreateTransactionalBatch(new PartitionKey(userId))") &&
               service.Contains("PatchOperation.Set(\"/sessionVersion\""),
            "session listing/revocation is not partition-pinned and version-backed");
    }

    private static void TenantSwitchSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var program = Source("apps", "pumpkin-api", "Program.cs");
        Assert(service.Contains("IssueTenantToken") && service.Contains("new(\"tenantUid\"") &&
               service.Contains("new(\"membershipId\"") && service.Contains("identity_tenant_switched") &&
               service.Contains("IdentitySessionValidationStatus.MembershipInactive") &&
               service.Contains("IsBoundedIdentityIdentifier(request.TenantUid)"),
            "tenant switch does not issue or continuously validate membership context");
        Assert(program.Contains("var tenantUid = context.User.FindFirst(\"tenantUid\")") &&
               program.Contains("string.IsNullOrWhiteSpace(tenantUid) && user.TenantId != tenantId") &&
               program.Contains("TenantId = tenantId") && program.Contains("Role = role"),
            "verify endpoint rejects or misreports a valid switched-tenant token");
    }

    private static void ManagementRouteCoverageSource()
    {
        var endpoints = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs");
        foreach (var marker in new[]
        {
            "s.RequestEmailChangeAsync", "s.SessionsAsync", "s.RevokeSessionsAsync", "s.SwitchTenantAsync",
            "s.CreateInvitationAsync", "s.RevokeInvitationAsync", "s.RemoveMembershipAsync", "s.TransferTenantAdminAsync",
            "s.GlobalUsersAsync", "s.GlobalTenantsAsync", "s.GlobalAuditAsync", "s.MigrationConflictsAsync",
            "s.ResetPasswordAsync", "s.DisableAccountAsync", "s.RestoreAccountAsync"
        }) Assert(endpoints.Contains(marker), $"implemented identity route missing: {marker}");
        Assert(endpoints.Contains("tenant.MapPost(\"/rename\", DisabledBody<RenameRequest>)") &&
               endpoints.Contains("admin.MapPost(\"/tenants/{tenantUid}/rename\", DisabledBody<RenameRequest>)"),
            "tenant rename hold was removed");
    }

    private static void AdministrativeMutationSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var endpoints = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs");
        var identityClient = Source("apps", "admin", "src", "lib", "identity", "client.ts");
        var adminPage = Source("apps", "admin", "src", "app", "dashboard", "identity", "page.tsx");
        var emailMutation = SliceBetween(service, "AdminEmailChangeAsync", "ResetPasswordAsync");
        var passwordMutation = SliceBetween(service, "ResetPasswordAsync", "TemporaryPasswordAsync");
        var temporaryMutation = SliceBetween(service, "TemporaryPasswordAsync", "ForceSignOutAsync");
        var signOutMutation = SliceBetween(service, "ForceSignOutAsync", "DisableAccountAsync");
        var failClosedPassword = SliceBetween(service, "private async Task<bool> TryFailPasswordMutationClosedAsync", "private static bool PasswordMutationStillCurrent");
        var expiredRecovery = SliceBetween(service, "private async Task RecoverExpiredAccountMutationAsync", "private async Task TryRestoreLegacyEmailAsync");
        Assert(emailMutation.Contains("IdentityFeaturePolicy.SuperAdmin") &&
               passwordMutation.Contains("IdentityFeaturePolicy.PasswordAndSessions") &&
               temporaryMutation.Contains("IdentityFeaturePolicy.PasswordAndSessions") &&
               signOutMutation.Contains("IdentityFeaturePolicy.PasswordAndSessions"),
            "credential and session mutations do not follow the required activation stages");
        Assert(service.Contains("actorRole = actor.Role") && service.Contains("final_superadmin_protected") &&
               service.Contains("final_tenant_admin_protected"), "audit actor or final-admin protections are incomplete");
        Assert(service.Contains("identity_notification_provider_unavailable") && service.Contains("Status503ServiceUnavailable"),
            "provider-unavailable email request is not explicit");
        var accountState = SliceBetween(service, "private async Task<IResult> ChangeAccountStateAsync", "private async Task<IResult?> ProtectMembershipMutationAsync");
        Assert(accountState.Contains("IsCrstSyntheticValidationAccount(account)") &&
               accountState.Contains("denied_non_synthetic") && service.Contains("syntheticValidationId") &&
               service.Contains("isSyntheticValidation = IsCrstSyntheticValidationAccount(value)"),
            "account disable/restore trusts the UI or mutable email instead of the immutable CRST classification");
        Assert(temporaryMutation.Contains("compensated = await TryCompensatePasswordMutationAsync") &&
               temporaryMutation.Contains("TryFailPasswordMutationClosedAsync") &&
               temporaryMutation.Contains("temporary_password_compensation_failed_closed") &&
               signOutMutation.Contains("TryAcquireAdminInvariantLeaseAsync(\"force-sign-out\"") &&
               service.Contains("SecurityMutationPending"),
            "temporary-secret audit failure can leak an unknown password or force-sign-out can race password compensation");
        var undisclosedRecoveryBranch = expiredRecovery.IndexOf("if (kind == UndisclosedTemporaryPasswordMutationKind)", StringComparison.Ordinal);
        var legacyRecoveryRead = expiredRecovery.IndexOf("LegacyForAccountAsync", StringComparison.Ordinal);
        Assert(failClosedPassword.Contains("UndisclosedTemporaryPasswordMutationKind") &&
               failClosedPassword.Contains("securityMutationAutoRecoveryBlocked") &&
               failClosedPassword.Contains("temporary_password_not_disclosed_compensation_incomplete") &&
               service.Contains("or UndisclosedTemporaryPasswordMutationKind") &&
               undisclosedRecoveryBranch >= 0 && legacyRecoveryRead > undisclosedRecoveryBranch &&
               expiredRecovery[undisclosedRecoveryBranch..legacyRecoveryRead].Contains("return;") &&
               !expiredRecovery[undisclosedRecoveryBranch..legacyRecoveryRead].Contains("PatchItemAsync"),
            "expired recovery can reactivate an account with an undisclosed temporary password");
        Assert(signOutMutation.Contains("IdentityReasonRequest request") &&
               signOutMutation.Contains("TryNormalizeAuditReason(request.Reason, out var reason)") &&
               !signOutMutation.Contains("\"administrative\"") &&
               endpoints.Contains("IdentityReasonRequest r") &&
               identityClient.Contains("forceSignOut(userId: string, reason: string)") &&
               identityClient.Contains("JSON.stringify({ reason: reason.trim() })") &&
               adminPage.Contains("client.forceSignOut(selectedGlobalUser.userId, adminReasonValue)"),
            "force-sign-out discards the required operator reason before audit or reconciliation");
        Assert(service.Contains("SecurityMutationLeaseDuration = TimeSpan.FromMinutes(2)") &&
               service.Contains("AdminInvariantOperationBudget") && service.Contains("TimeSpan.FromSeconds(45)"),
            "account mutation stale recovery can overtake a still-live bounded operation");
        Assert(service.Contains("TryNormalizeAuditReason") && service.Contains("Encoding.UTF8.GetByteCount(reason) <= 500") &&
               service.Contains("reason.Any(char.IsControl)") &&
               Count(endpoints, "RequestSizeLimitAttribute(4096)") >= 8,
            "audit reasons or non-BCrypt identity mutation bodies are not server bounded");
    }

    private static void ManagementCosmosBoundSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var cosmos = Source("apps", "pumpkin-api", "Services", "CosmosDataConnection.cs");
        Assert(service.Contains("GetRequiredService<CosmosDataConnection>().SharedClient") &&
               service.Contains("QueryTimeout = TimeSpan.FromSeconds(5)") && !service.Contains("new CosmosClient(") &&
               cosmos.Contains("ConnectionMode = ConnectionMode.Gateway") && cosmos.Contains("LimitToEndpoint = true") &&
               cosmos.Contains("RequestTimeout = TimeSpan.FromSeconds(10)"),
            "identity management Cosmos client is not endpoint/time bounded");
        Assert(service.Contains("MaxQueryRows = 500") && service.Contains("identity_query_row_limit_exceeded") &&
               service.Contains("options.PartitionKey = new PartitionKey(partitionKey)"),
            "identity query total rows or partition access are unbounded");
    }

    private static void IdentityMutationEnumBinding()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var invite = JsonSerializer.Deserialize<InviteUserRequest>("{\"email\":\"person@example.invalid\",\"role\":\"Viewer\",\"idempotencyKey\":\"one\"}", options);
        var add = JsonSerializer.Deserialize<AddMembershipRequest>("{\"userId\":\"u\",\"role\":\"Editor\",\"idempotencyKey\":\"two\"}", options);
        var role = JsonSerializer.Deserialize<ChangeMembershipRoleRequest>("{\"role\":\"TenantAdmin\",\"reason\":\"proof\"}", options);
        var status = JsonSerializer.Deserialize<ChangeMembershipStatusRequest>("{\"status\":\"Suspended\",\"reason\":\"proof\"}", options);
        Assert(invite?.Role == TenantRole.Viewer && add?.Role == TenantRole.Editor &&
               role?.Role == TenantRole.TenantAdmin && status?.Status == IdentityRecordStatus.Suspended,
            "string enum request values did not bind");
        var roundTrip = JsonSerializer.Serialize(status, options);
        Assert(roundTrip.Contains("\"status\":\"Suspended\"", StringComparison.Ordinal), "enum response drifted to a numeric value");
        static bool Rejects(string json, JsonSerializerOptions serializerOptions)
        {
            try { JsonSerializer.Deserialize<ChangeMembershipRoleRequest>(json, serializerOptions); return false; }
            catch (JsonException) { return true; }
        }
        Assert(Rejects("{\"role\":1,\"reason\":\"proof\"}", options) &&
               Rejects("{\"role\":\"1\",\"reason\":\"proof\"}", options) &&
               Rejects("{\"role\":\"UnknownRole\",\"reason\":\"proof\"}", options),
            "numeric, quoted-numeric, or unknown enum values were accepted");
    }

    private static void ContactRecipientRoundTrip()
    {
        var createdAt = new DateTime(2026, 7, 15, 12, 0, 0, DateTimeKind.Utc);
        var updatedAt = createdAt.AddMinutes(1);
        var savedAt = createdAt.AddHours(1);
        var recipient = new FormNotificationRecipient
        {
            Id = "recipient-1",
            Email = " Person@Example.Invalid ",
            NormalizedEmail = "browser-value-must-not-win",
            Order = 4,
            IsActive = false,
            IsVerified = true,
            ReplyTo = "reply@example.invalid",
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };
        var existing = new JsonArray(new JsonObject
        {
            ["id"] = recipient.Id,
            ["email"] = "Person@Example.Invalid",
            ["normalizedEmail"] = "PERSON@EXAMPLE.INVALID",
            ["order"] = 4,
            ["isActive"] = false,
            ["isVerified"] = true,
            ["replyTo"] = "reply@example.invalid",
            ["createdAt"] = createdAt,
            ["updatedAt"] = updatedAt
        });
        var canonical = IdentityManagementService.CanonicalizeContactRecipients([recipient], existing, savedAt);
        var value = canonical[0]!.AsObject();
        Assert(value["id"]?.GetValue<string>() == recipient.Id && value["order"]?.GetValue<int>() == 4,
            "canonical recipient lost its id or order");
        Assert(value["normalizedEmail"]?.GetValue<string>() == "PERSON@EXAMPLE.INVALID",
            "canonical recipient email normalization drifted");
        Assert(value["createdAt"]?.GetValue<DateTime>() == createdAt && value["updatedAt"]?.GetValue<DateTime>() == updatedAt,
            "canonical recipient timestamps drifted");
        var wireNames = value.Select(property => property.Key).ToHashSet(StringComparer.Ordinal);
        Assert(!wireNames.Contains("Email") && wireNames.Contains("email") && wireNames.Contains("isVerified"),
            "canonical recipient wire names are not camel-case");
        var reparsed = JsonNode.Parse(canonical.ToJsonString())!.AsArray()[0]!.AsObject();
        Assert(reparsed["normalizedEmail"]?.GetValue<string>() == "PERSON@EXAMPLE.INVALID", "canonical recipient did not round-trip");

        var newRecipient = new FormNotificationRecipient
        {
            Id = "recipient-2",
            Email = "new-person@example.invalid",
            NormalizedEmail = "browser-value-must-not-win",
            Order = 5,
            IsActive = true,
            IsVerified = true,
            CreatedAt = createdAt.AddYears(-1),
            UpdatedAt = updatedAt.AddYears(-1)
        };
        var created = IdentityManagementService.CanonicalizeContactRecipients([newRecipient], [], savedAt)[0]!.AsObject();
        Assert(created["isVerified"]?.GetValue<bool>() == false &&
               created["createdAt"]?.GetValue<DateTime>() == savedAt &&
               created["updatedAt"]?.GetValue<DateTime>() == savedAt,
            "new recipient accepted client-managed verification or timestamps");
        var overrides = IdentityManagementService.CanonicalizeContactOverrides(new Dictionary<string, List<string>>
            { ["form-Key"] = ["recipient-1"] }, new HashSet<string>(StringComparer.Ordinal) { "recipient-1" });
        Assert(overrides.ContainsKey("form-Key"), "form override key was rewritten");
        AssertThrows<ArgumentException>(() => IdentityManagementService.CanonicalizeContactOverrides(
                new Dictionary<string, List<string>> { ["form-Key"] = ["unknown-recipient"] },
                new HashSet<string>(StringComparer.Ordinal) { "recipient-1" }),
            "contact override accepted an unknown recipient id");
        AssertThrows<ArgumentException>(() => IdentityManagementService.CanonicalizeContactOverrides(
                new Dictionary<string, List<string>> { ["form-Key"] = ["recipient-1", "recipient-1"] },
                new HashSet<string>(StringComparer.Ordinal) { "recipient-1" }),
            "contact override accepted a duplicate recipient id");
    }

    private static void ContactConcurrencyContractSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var contracts = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityContracts.cs");
        var contactRead = SliceBetween(service, "public async Task<IResult> ContactSettingsAsync", "public async Task<IResult> UpdateContactSettingsAsync");
        var contactWrite = SliceBetween(service, "public async Task<IResult> UpdateContactSettingsAsync", "public static JsonArray CanonicalizeContactRecipients");
        var safeContact = SliceBetween(service, "private static ContactSettingsResponse SafeContactSettings", "private static string? NullIfEmpty");
        var endpoints = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs");
        Assert(contracts.Contains("ContactSettingsResponse") && contracts.Contains("string ConcurrencyToken") &&
               contactRead.Contains("SafeContactSettings(settings)") && !contactRead.Contains("Results.Ok(await ReadAsync"),
            "contact GET returns a raw Cosmos document or lacks an opaque concurrency DTO");
        Assert(contactWrite.Contains("context.Request.Headers[\"If-Match\"]") &&
               contactWrite.Contains("IfMatchEtag = expectedConcurrencyToken") &&
               contactWrite.Contains("contact_settings_concurrency_token_required") &&
               contactWrite.Contains("contact_settings_concurrency_conflict") &&
               contactWrite.Contains("if (existing is null)") &&
               contactWrite.Contains("PreconditionFailed(context") && contactWrite.Contains("SafeContactSettings(saved)"),
            "contact PUT rereads the latest ETag, accepts a missing token, or returns stale Cosmos shape");
        Assert(contactWrite.Contains("validRecipientIds") &&
               service.Contains("MaxContactOverrideEntries") && service.Contains("MaxContactOverrideAssignments") &&
               service.Contains("validRecipientIds.Contains(recipientId)") && service.Contains("uniqueRecipientIds.Add(recipientId)") &&
               Count(endpoints, "RequestSizeLimitAttribute(131072)") >= 4,
            "contact settings accept an unbounded body, oversized override graph, duplicate, or dangling recipient reference");
        Assert(safeContact.Contains("Text(value, \"_etag\")") && safeContact.Contains("concurrencyToken") &&
               !contracts.Contains("_etag"), "Cosmos system metadata leaked into the contact response contract");
    }

    private static void LegacyWriteBypassSource()
    {
        var program = Source("apps", "pumpkin-api", "Program.cs");
        Assert(program.Contains("identity_tenant_admin_creation_requires_authoritative_route") &&
               program.Contains("identity_email_change_requires_authoritative_route") &&
               program.Contains("identityManagement.ChangePasswordAsync") &&
               Count(program, "IdentityFeaturePolicy.Foundation(identityFeatures.CurrentValue) && identityFeatures.CurrentValue.DualReadEnabled") >= 3,
            "a legacy identity write can bypass authoritative paired mutation");
    }

    private static void MembershipLockoutProtectionSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var mutate = SliceBetween(service, "private async Task<IResult> MutateMembershipAsync", "public async Task<IResult> RemoveMembershipAsync");
        var remove = SliceBetween(service, "public async Task<IResult> RemoveMembershipAsync", "public async Task<IResult> TransferTenantAdminAsync");
        var protection = SliceBetween(service, "private async Task<IResult?> ProtectMembershipMutationAsync", "private async Task<List<JsonObject>> UsableActiveAdmins");
        Assert(mutate.IndexOf("ProtectMembershipMutationAsync", StringComparison.Ordinal) <
               mutate.IndexOf("BumpUserSessionsAsync", StringComparison.Ordinal) &&
               remove.IndexOf("ProtectMembershipMutationAsync", StringComparison.Ordinal) <
               remove.IndexOf("BumpUserSessionsAsync", StringComparison.Ordinal),
            "membership lockout checks run after session invalidation or mutation");
        Assert(mutate.Contains("field == \"status\" && value != IdentityRecordStatus.Active.ToString()") &&
               remove.Contains("deactivatesAuthoritativeLogin: true") &&
               protection.Contains("!actor.SuperAdmin") && protection.Contains("globalRole") &&
               protection.Contains("UserRole.SuperAdmin.ToString()") && protection.Contains("Results.Forbid()"),
            "a tenant administrator can mutate or remove a global SuperAdmin membership");
        Assert(protection.Contains("if (!deactivatesAuthoritativeLogin) return null") &&
               protection.Contains("ReadAsync(\"TenantIdentity\", tenantUid, tenantUid") &&
               protection.Contains("legacyTenantId") &&
               protection.Contains("authoritative_login_membership_unresolved") &&
               protection.Contains("authoritative_login_membership_protected"),
            "an authoritative home membership can be deactivated or removed through membership management");
        Assert(mutate.Contains("value == IdentityRecordStatus.Active.ToString()") &&
               mutate.Contains("Text(membership, \"role\") == TenantRole.TenantAdmin.ToString()") &&
               mutate.Contains("!actor.SuperAdmin") && mutate.Contains("reason, \"rejected\"") &&
               mutate.Contains("return Results.Forbid()"),
            "a tenant administrator can reactivate a stored TenantAdmin membership");
    }

    private static void IdempotencyAndInvariantLeaseSource()
    {
        var service = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityManagementService.cs");
        var tool = Source("tools", "identity-migration", "Program.cs");
        var endpoints = Source("apps", "pumpkin-api", "Services", "Identity", "IdentityEndpoints.cs");
        var invitation = SliceBetween(service, "public async Task<IResult> CreateInvitationAsync", "public async Task<IResult> RevokeInvitationAsync");
        var membership = SliceBetween(service, "public async Task<IResult> AddMembershipAsync", "public Task<IResult> ChangeMembershipRoleAsync");
        Assert(invitation.Contains("Digest(\"invitation-request\"") && invitation.Contains("idempotencyKeyDigest") &&
               invitation.Contains("TryNormalizeIdempotencyKey(request.IdempotencyKey, out var idempotencyKey)") &&
               invitation.Contains("IsBoundedIdentityIdentifier(tenantUid)") &&
               invitation.Contains("CreateItemAsync") && invitation.Contains("idempotentReplay") &&
               invitation.Contains("ReadAsync(\"IdentityRequests\", id"),
            "invitation idempotency is not payload-bound or race-read after deterministic create");
        Assert(membership.Contains("Digest(\"membership-request\"") && membership.Contains("idempotencyKeyDigest") &&
               membership.Contains("TryNormalizeIdempotencyKey(request.IdempotencyKey, out var idempotencyKey)") &&
               membership.Contains("IsBoundedIdentityIdentifier(request.UserId)") &&
               membership.Contains("CreateItemAsync") && membership.Contains("idempotentReplay"),
            "membership idempotency is not payload-bound or persisted");
        Assert(Count(endpoints, "RequestSizeLimitAttribute(4096)") >= 17 &&
               endpoints.Contains("MapPost(\"/switch-tenant\"") && endpoints.Contains("MapPost(\"/invitations\"") &&
               endpoints.Contains("MapPost(\"/memberships\"") && endpoints.Contains("DisabledBody<RenameRequest>"),
            "small identity DTO routes accept Kestrel-scale request bodies");
        Assert(service.Contains("tenant-admin-invariant-global-lock") && service.Contains("TenantAdminInvariantLock") &&
               service.Contains("expiresAt") && service.Contains("RenewAsync") &&
               service.Contains("LostToken") && service.Contains("AdminInvariantOperationBudget") &&
               service.Contains("TimeSpan.FromSeconds(20)") && service.Contains("IfMatchEtag") &&
               tool.Contains("tenant-admin-invariant-global-lock") && tool.Contains("AcquireToolAdminInvariantLeaseAsync") &&
               tool.Contains("TimeSpan.FromSeconds(20)") && tool.Contains("expiresAt") && tool.Contains("EnsureOwnedAsync"),
            "API and migration tooling do not share a renewable, fenced global admin invariant lease");
    }

    private static void SyntheticValidationToolSource()
    {
        var tool = Source("tools", "identity-migration", "Program.cs");
        var backup = SliceBetween(tool, "async Task BackupAsync()", "static string SanitizeIdentityJson");
        var dryRun = SliceBetween(tool, "async Task DryRunAsync()", "async Task ApplyAsync()");
        var loginReconciliation = SliceBetween(tool, "async Task ReconcilePendingLoginAsync()", "async Task LoginAcceptanceAsync()");
        var acceptance = SliceBetween(tool, "async Task LoginAcceptanceAsync()", "async Task RepairLoginLocatorsAsync()");
        var acceptanceExactMatches = SliceBetween(acceptance, "var acceptanceAudits", "if (expectDualWrite &&");
        var creation = SliceBetween(tool, "async Task SyntheticCreateAsync()", "async Task SyntheticVerifyAsync()");
        var verification = SliceBetween(tool, "async Task SyntheticVerifyAsync()", "async Task SyntheticSwitchFixtureStatusAsync()");
        var switchFixture = SliceBetween(tool, "async Task SyntheticSwitchFixtureStatusAsync()", "async Task SyntheticContactSnapshotAsync()");
        var cleanup = SliceBetween(tool, "async Task SyntheticCleanupAsync()", "static string[] StringArray");
        Assert(tool.Contains("case \"synthetic-create\"") && tool.Contains("case \"synthetic-verify\"") &&
               tool.Contains("case \"synthetic-switch-fixture-status\"") &&
               tool.Contains("case \"synthetic-contact-snapshot\"") && tool.Contains("case \"synthetic-cleanup\""),
            "synthetic lifecycle commands are incomplete");
        Assert(tool.Contains("case \"reconcile-login-pending\"") &&
               loginReconciliation.Contains("no_session_or_audit_later_success_verified") &&
               loginReconciliation.Contains("complete_write_set_verified") &&
               loginReconciliation.Contains("later exact successful-login audit") &&
               loginReconciliation.Contains("requestPartition") &&
               loginReconciliation.Contains("auditPartition") &&
               loginReconciliation.Contains("sessionCreatedAt != auditCreatedAt") &&
               loginReconciliation.Contains("a partial or inconsistent write set") &&
               loginReconciliation.Contains("identity_login_reconciliation_resolved") &&
               loginReconciliation.Contains("one resumable migration row") &&
               loginReconciliation.Contains("result = \"pending\"") &&
               loginReconciliation.Contains("remainingPendingAudits") &&
               loginReconciliation.Contains("reconciledThisRun") &&
               loginReconciliation.Contains("resolvedRows.Select") &&
               loginReconciliation.Contains("IfMatchEtag") &&
               loginReconciliation.Contains("requestIdDigest = OpaqueDigest") &&
               loginReconciliation.Contains("CryptographicOperations.ZeroMemory(digestKey)"),
            "pending login reconciliation is not bounded, audited, resumable, or identifier-safe");
        Assert(creation.Contains("SyntheticCreationOperation") && creation.Contains("status = \"Pending\"") &&
               creation.Contains("handoffSha256") && creation.Contains("syntheticValidationId = \"V2.8.63CRST\"") &&
               creation.Contains("isSyntheticValidation = true") && creation.Contains("partialDataPresent") &&
               creation.Contains("DeleteOwnedAsync") && creation.Contains("BCrypt.Net.BCrypt.HashPassword(password, 12)"),
            "synthetic creation is not journaled/resumable, exact-classified, or safe for partial artifacts");
        Assert(tool.Contains("ValidateCredentialHandoffPath") && tool.Contains("Path.IsPathFullyQualified") &&
               tool.Contains("must be outside the repository and evidence output") &&
               tool.Contains("VerifyOwnerOnlyFileAcl") && tool.Contains("VerifyOwnerOnlyDirectoryAcl") &&
               tool.Contains("FileSystemAclExtensions.Create(new FileInfo(path), FileMode.CreateNew") &&
               tool.Contains("File.Replace(temporaryPath, expected.FullPath") && tool.Contains("secretRemoved = true"),
            "credential handoff is not isolated, atomically owner-only, or secret-removing");
        Assert(tool.Contains("party-pros-philadelphia") && tool.Contains("ice-rink-rentals") &&
               tool.Contains("strip-club-near-me-vegas") && tool.Contains("stage4-add-target") &&
               creation.Contains("expectedPrimarySnapshotCount = approvedFixtures.Length") &&
               creation.Contains("SyntheticPrimaryAdminSnapshot") && verification.Contains("membershipStatesExact") &&
               switchFixture.Contains("--status must be Active or Suspended") &&
               switchFixture.Contains("identity_synthetic_switch_fixture_status_changed"),
            "synthetic fixtures are not exact, UID-resolved, switchable, and primary-admin snapshotted");
        Assert(verification.Contains("normalizedEmailLinked") && verification.Contains("result.accountGlobalRole != \"Viewer\"") &&
               verification.Contains("result.legacyRole != \"Viewer\"") && verification.Contains("!result.forcePasswordChange") &&
               verification.Contains("result.sessionVersion < 1") && verification.Contains("syntheticClassificationExact"),
            "synthetic verification accepts an elevated, unlinked, rotation-complete, or unclassified identity");
        var accountInvalidation = switchFixture.IndexOf("accountContainer.PatchItemAsync", StringComparison.Ordinal);
        var membershipMutation = switchFixture.IndexOf("membershipContainer.PatchItemAsync", StringComparison.Ordinal);
        Assert(accountInvalidation >= 0 && membershipMutation > accountInvalidation &&
               switchFixture.Contains("PatchOperation.Set(\"/sessionVersion\", nextSessionVersion)") &&
               switchFixture.Contains("PatchOperation.Set(\"/securityStamp\", nextSecurityStamp)") &&
               switchFixture.Contains("freshLoginRequired = statusTransitioned") &&
               switchFixture.Contains("identity_synthetic_switch_fixture_reconciliation_required") &&
               switchFixture.Contains("IdentitySecurityMutationReconciliation") &&
               switchFixture.Contains("final reconciliation readback failed") &&
               switchFixture.Contains("ResolveSyntheticSwitchFixtureReconciliationAsync"),
            "fixture authorization transition can resurrect an old JWT or lacks recoverable failed-closed evidence");
        Assert(tool.Contains("identity_synthetic_switch_fixture_reconciled") &&
               tool.Contains("exact_membership_and_account_readback_verified") &&
               tool.Contains("synthetic switch fixture reconciliation row failed integrity validation"),
            "a transient switch-fixture failure permanently poisons verification or can be resolved without exact integrity checks");
        Assert(cleanup.Contains("identity_disable_ready") && cleanup.Contains("identity_disabled") &&
               cleanup.Contains("cleanup_state_finalized") && cleanup.Contains("resumingAfterIdentityDisable") &&
               cleanup.Contains("post-disable-login-write-drain") && cleanup.Contains("Task.Delay(TimeSpan.FromSeconds(5))") &&
               cleanup.Contains("post-disable-owned-record-sweep") && cleanup.Contains("final-owned-record-readback") &&
               cleanup.Contains("finalOwnedSessions") && cleanup.Contains("retainedSessions") &&
               cleanup.Contains("resumePendingInvitations") && cleanup.Contains("ResolveSyntheticCleanupReconciliationAsync") &&
               cleanup.Contains("inactiveHandoffReadback") && cleanup.Contains("IfMatchEtag"),
            "cleanup cannot resume, sweep late sessions/invitations, or close reconciliation after invalidation");
        Assert(cleanup.IndexOf("failureStage = \"final-owned-record-readback\"", StringComparison.Ordinal) <
               cleanup.IndexOf("failureStage = \"cleanup-success-audit\"", StringComparison.Ordinal) &&
               cleanup.Contains("sessions = finalOwnedSessions") && cleanup.Contains("invitations.Length != cleanupInvitationIds.Count") &&
               cleanup.Contains("pendingInvitationsRevoked = invitations.Length") &&
               cleanup.Contains("SameOrdinalSet(StringArray(x, \"sessionIds\")") &&
               cleanup.Contains("SameOrdinalSet(StringArray(x, \"pendingInvitationIds\")"),
            "cleanup finalizes success before the last owned-record sweep or reports stale session/invitation counts");
        Assert(cleanup.Contains("unsafeAdminTransferState") && cleanup.Contains("isPrimaryTenantAdmin") &&
               cleanup.Contains("optionalStage4TenantUid") && cleanup.Contains("memberships.Length is < 2 or > 3") &&
               cleanup.Contains("primaryTenantAdminsRestored") && cleanup.Contains("SyntheticContactSettingsSnapshot") &&
               cleanup.Contains("baselineDocument") && cleanup.Contains("baselineDigest") &&
               cleanup.Contains("PatchOperation.Remove(\"/baselineDocument\")") &&
               cleanup.Contains("accountDisabled") && cleanup.Contains("legacyUserDisabled") &&
               cleanup.Contains("accountPasswordHashPreserved") && cleanup.Contains("legacyPasswordHashPreserved") &&
               cleanup.Contains("creationAuditPreserved") && cleanup.Contains("cleanupAuditWritten") &&
               cleanup.Contains("identity_synthetic_validation_cleaned") && !cleanup.Contains("DeleteIfExistsAsync"),
            "cleanup is transfer-unsafe, loses exact contact state, or deletes retained identity evidence");
        Assert(acceptance.Contains("expectedRequestIds") && acceptance.Contains("expectedCount") &&
               acceptance.Contains("--expect-dual-write") && acceptance.Contains("expectDualWrite") &&
               acceptance.Contains("dual-write-disabled login acceptance found an audit or UserSession") &&
               !acceptanceExactMatches.Contains("WithinAcceptanceWindow") &&
               acceptance.Contains("requestIdDigest") && acceptance.Contains("normalizedEmailDigest") &&
               acceptance.Contains("WithinAcceptanceWindow") && acceptance.Contains("sessionVersion") &&
               acceptance.Contains("requestIdDigests") && acceptance.Contains("legacyUserIdDigest") &&
               acceptance.Contains("legacyTenantIdDigest") && acceptance.Contains("userIdDigest") &&
               acceptance.Contains("membershipIdDigest") && acceptance.Contains("tenantUidDigest") &&
               acceptance.Contains("RandomNumberGenerator.GetBytes(32)") &&
               acceptance.Contains("OpaqueDigest(evidenceDigestKey") &&
               acceptance.Contains("CryptographicOperations.ZeroMemory(evidenceDigestKey)") &&
               !acceptance.Contains("legacyUserId = Text(legacy") &&
               !acceptance.Contains("legacyTenantId = Text(legacy") &&
               !acceptance.Contains("membershipId = Text(x, \"membershipId\")") &&
               !acceptance.Contains("requestIds = expectedRequestIds"),
            "login acceptance lacks per-request/session/time parity or emits raw request IDs");
        Assert(tool.Contains("pendingSecurityMutations") && tool.Contains("staleSecurityMutations") &&
               tool.Contains("pendingSyntheticOperations") && tool.Contains("pendingAudits") &&
               tool.Contains("result = \"failed_closed\""),
            "verification does not fail on all mutation, synthetic operation, and audit reconciliation states");
        Assert(backup.Contains("--restricted-output is required for backup") &&
               backup.Contains("ValidateRestrictedBackupDirectory") && backup.Contains("WriteNewRestrictedJsonAsync") &&
               backup.Contains("OpaqueDigest") && backup.Contains("recordDigests") &&
               !backup.Contains("safeDigests = item.Value.Select(x => new { id"),
            "rollback secrets share ordinary evidence or sanitized inventory exposes raw identifiers");
        Assert(dryRun.Contains("aggregateDigests") && dryRun.Contains("conflictCategories") &&
               dryRun.Contains("primaryContactEmailsPresent") && !dryRun.Contains("plan.Tenants, plan.Users") &&
               !dryRun.Contains("primaryContactEmail = Text"),
            "ordinary dry-run evidence contains executable customer identities or contact data");
    }

    private static ClaimsPrincipal Principal(params Claim[] claims) =>
        new(new ClaimsIdentity(claims, "test", ClaimTypes.Name, ClaimTypes.Role));

    private static string Source(params string[] segments) =>
        File.ReadAllText(Path.Combine([FindRepositoryRoot(), .. segments]));

    private static string SliceBetween(string source, string start, string end)
    {
        var startIndex = source.IndexOf(start, StringComparison.Ordinal);
        var endIndex = startIndex < 0 ? -1 : source.IndexOf(end, startIndex, StringComparison.Ordinal);
        Assert(startIndex >= 0 && endIndex > startIndex, $"source slice missing: {start} -> {end}");
        return source[startIndex..endIndex];
    }

    private static int Count(string source, string value)
    {
        var count = 0;
        for (var index = 0; (index = source.IndexOf(value, index, StringComparison.Ordinal)) >= 0; index += value.Length) count++;
        return count;
    }

    private static Tenant Tenant(string slug) => new() { Id = $"legacy-{slug}", TenantId = slug, Name = slug, Status = "active" };
    private static User User(string id, string tenant, string email, UserRole role = UserRole.Viewer) => new()
        { Id = id, TenantId = tenant, Email = email, Username = id, PasswordHash = "legacy-valid-hash", Role = role };
    private static IReadOnlyDictionary<string, IReadOnlyList<string>> EmptyRecipients() => new Dictionary<string, IReadOnlyList<string>>();
    private static IReadOnlyDictionary<string, IReadOnlyList<string>> EmptyDependencies() => new Dictionary<string, IReadOnlyList<string>>();
    private static void AssertThrows<TException>(Action action, string message) where TException : Exception
    {
        try { action(); }
        catch (TException) { return; }
        throw new InvalidOperationException(message);
    }
    private static void Assert(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null && !Directory.Exists(Path.Combine(current.FullName, "apps"))) current = current.Parent;
        return current?.FullName ?? throw new DirectoryNotFoundException("repository root not found");
    }
}
