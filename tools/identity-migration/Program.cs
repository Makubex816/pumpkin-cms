using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Azure.Cosmos;
using pumpkin_api.Services;
using pumpkin_api.Services.Identity;
using pumpkin_net_models.Models;

const string ToolVersion = "v2.8.63b.1";
var command = args.FirstOrDefault()?.ToLowerInvariant() ?? "help";
var connection = Environment.GetEnvironmentVariable("PUMPKIN_IDENTITY_COSMOS_CONNECTION");
var databaseName = Environment.GetEnvironmentVariable("PUMPKIN_IDENTITY_DATABASE") ?? "pumpkin-prod-cms";
if (string.IsNullOrWhiteSpace(connection)) throw new InvalidOperationException("PUMPKIN_IDENTITY_COSMOS_CONNECTION is required");
using var client = new CosmosClient(connection, new CosmosClientOptions
{
    ConnectionMode = ConnectionMode.Gateway,
    Serializer = new CosmosSystemTextJsonSerializer(new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    })
});
var database = client.GetDatabase(databaseName);
var output = Option("--output") ?? throw new ArgumentException("--output is required");
Directory.CreateDirectory(output);

switch (command)
{
    case "backup": await BackupAsync(); break;
    case "provision": await ProvisionAsync(); break;
    case "dry-run": await DryRunAsync(); break;
    case "apply": await ApplyAsync(); break;
    case "compare": await CompareAsync(); break;
    case "activate": await ActivateAsync(); break;
    case "verify": await VerifyAsync(); break;
    case "login-acceptance": await LoginAcceptanceAsync(); break;
    default: throw new ArgumentException("command must be backup, provision, dry-run, apply, compare, activate, verify, or login-acceptance");
}

string? Option(string name)
{
    var index = Array.FindIndex(args, x => x.Equals(name, StringComparison.OrdinalIgnoreCase));
    return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
}

async Task<List<JsonObject>> ReadAllAsync(string containerName)
{
    var result = new List<JsonObject>();
    var iterator = database.GetContainer(containerName).GetItemQueryIterator<JsonObject>(new QueryDefinition("SELECT * FROM c"));
    while (iterator.HasMoreResults) result.AddRange(await iterator.ReadNextAsync());
    return result;
}

async Task BackupAsync()
{
    var tenantDocs = await ReadAllAsync("Tenant");
    var userDocs = await ReadAllAsync("User");
    var formDocs = await ReadAllAsync("FormDefinition");
    var restricted = Path.Combine(output, "restricted-rollback");
    var sanitized = Path.Combine(output, "sanitized-validation");
    Directory.CreateDirectory(restricted); Directory.CreateDirectory(sanitized);
    await WriteJsonAsync(Path.Combine(restricted, "Tenant.json"), tenantDocs);
    await WriteJsonAsync(Path.Combine(restricted, "User.json"), userDocs);
    await WriteJsonAsync(Path.Combine(restricted, "FormDefinition.json"), formDocs);
    await WriteJsonAsync(Path.Combine(sanitized, "tenants.json"), tenantDocs.Select(SanitizeTenant).ToArray());
    await WriteJsonAsync(Path.Combine(sanitized, "users.json"), userDocs.Select(SanitizeUser).ToArray());
    await WriteJsonAsync(Path.Combine(sanitized, "form-notification-references.json"), formDocs.Select(SanitizeFormReference).ToArray());
    var inventory = new
    {
        toolVersion = ToolVersion, capturedAt = DateTime.UtcNow, databaseName,
        counts = new { tenants = tenantDocs.Count, users = userDocs.Count, formDefinitions = formDocs.Count },
        passwordHashPresenceCount = userDocs.Count(x => Text(x, "passwordHash").Length > 0),
        sourceContainers = new[] { "Tenant", "User", "FormDefinition" },
        restoreOrder = new[] { "Tenant", "User", "FormDefinition", "disable-identity-flags", "validate-login-and-access" },
        restrictedBackup = true, sanitizedExport = true
    };
    await WriteJsonAsync(Path.Combine(output, "inventory.json"), inventory);
    await WriteChecksumManifestAsync(output);
    Console.WriteLine(JsonSerializer.Serialize(new { status = "backup_complete", tenants = tenantDocs.Count, users = userDocs.Count, output, toolVersion = ToolVersion }));
}

async Task ProvisionAsync()
{
    var definitions = new[]
    {
        Def("TenantIdentity", "/tenantUid", new[] { new[] { "/canonicalSlug" }, new[] { "/tenantUid" } }),
        Def("TenantIdentifierAliases", "/tenantUid", new[] { new[] { "/previousSlug" } }),
        Def("TenantRenameJobs", "/tenantUid", Array.Empty<string[]>()),
        Def("UserAccounts", "/identityPartition", new[] { new[] { "/normalizedEmail" }, new[] { "/userId" } }),
        Def("TenantMemberships", "/tenantUid", new[] { new[] { "/userId" }, new[] { "/membershipId" } }),
        Def("IdentityRequests", "/requestPartition", Array.Empty<string[]>()),
        Def("TenantContactSettings", "/tenantUid", new[] { new[] { "/tenantUid" } }),
        Def("IdentityNotificationOutbox", "/recipientNormalizedEmail", new[] { new[] { "/deduplicationKey" } }),
        Def("SecurityAuditEvents", "/auditPartition", Array.Empty<string[]>()),
        Def("IdentityMigration", "/migrationPartition", Array.Empty<string[]>())
    };
    var created = new List<object>();
    foreach (var definition in definitions)
    {
        var response = await database.CreateContainerIfNotExistsAsync(definition, throughput: 400);
        created.Add(new { definition.Id, partitionKey = definition.PartitionKeyPath, status = response.StatusCode.ToString() });
    }
    await WriteJsonAsync(Path.Combine(output, "storage-readback.json"), created);
    Console.WriteLine(JsonSerializer.Serialize(new { status = "provision_complete", containers = created.Count }));
}

async Task DryRunAsync()
{
    var snapshot = await LoadSnapshotAsync();
    var plan = IdentityMigrationPlanner.CreateDryRun(snapshot.Snapshot);
    var proposed = new
    {
        plan.InputFingerprint, plan.DryRun, plan.ExecutionEnabled, plan.ResumeToken, plan.Tenants, plan.Users, plan.Memberships,
        contacts = snapshot.Tenants.Select(t => new { legacyTenantId = Text(t, "tenantId"), primaryContactEmail = Text(t["contact"] as JsonObject, "email"), notificationReferences = FormReferences(snapshot.Definitions, Text(t, "tenantId")) }),
        featureState = snapshot.Tenants.Select(t => new { legacyTenantId = Text(t, "tenantId"), foundationEnabled = false, dualReadEnabled = false, dualWriteEnabled = false }),
        plan.Conflicts,
        executionOrder = new[] { "run", "tenantUid", "canonicalSlug", "mapping", "accounts", "memberships", "primaryAdmin", "contacts", "recipients", "sessions", "audit", "featureState" },
        rollbackOrder = IdentityRestoreOrder.Steps
    };
    await WriteJsonAsync(Path.Combine(output, "migration-plan.json"), proposed);
    Console.WriteLine(JsonSerializer.Serialize(new { status = "dry_run_complete", planHash = plan.InputFingerprint, tenants = plan.Tenants.Count, users = plan.Users.Count, memberships = plan.Memberships.Count, conflicts = plan.Conflicts.Count }));
}

async Task ApplyAsync()
{
    var snapshot = await LoadSnapshotAsync();
    var plan = IdentityMigrationPlanner.CreateDryRun(snapshot.Snapshot);
    var blocking = plan.Conflicts.Where(x => x.Category is "tenant_slug_collision" or "orphaned_user").ToArray();
    if (blocking.Length > 0) throw new InvalidOperationException($"blocking migration conflicts: {blocking.Length}");
    var runId = $"identity-backfill-{plan.InputFingerprint[..16]}";
    var migration = database.GetContainer("IdentityMigration");
    await UpsertAsync(migration, new { id = runId, migrationPartition = "global", type = "IdentityBackfillRun", planHash = plan.InputFingerprint, status = "running", dryRun = false, createdAt = DateTime.UtcNow }, new("global"));
    var tenantIdentity = database.GetContainer("TenantIdentity");
    var accounts = database.GetContainer("UserAccounts");
    var memberships = database.GetContainer("TenantMemberships");
    var contacts = database.GetContainer("TenantContactSettings");
    var audits = database.GetContainer("SecurityAuditEvents");
    var legacyTenants = database.GetContainer("Tenant");
    foreach (var tenantPlan in plan.Tenants.Where(x => x.Status == "planned"))
    {
        var source = snapshot.Tenants.Single(x => Text(x, "tenantId") == tenantPlan.LegacyTenantId);
        await UpsertAsync(tenantIdentity, new { id = tenantPlan.ProposedTenantUid, tenantUid = tenantPlan.ProposedTenantUid, canonicalSlug = tenantPlan.CanonicalSlug, legacyTenantId = tenantPlan.LegacyTenantId, displayName = Text(source, "name"), status = Text(source, "status"), createdAt = DateTime.UtcNow, updatedAt = DateTime.UtcNow }, new(tenantPlan.ProposedTenantUid));
        var legacyId = Text(source, "id");
        await legacyTenants.PatchItemAsync<JsonObject>(legacyId, new(tenantPlan.LegacyTenantId),
            new[] { PatchOperation.Set("/tenantUid", tenantPlan.ProposedTenantUid), PatchOperation.Set("/tenantSlug", tenantPlan.CanonicalSlug) });
        var contactEmail = Text(source["contact"] as JsonObject, "email");
        var references = FormReferences(snapshot.Definitions, tenantPlan.LegacyTenantId);
        var recipientEmails = references.Where(x => x.Contains('@')).Distinct(StringComparer.OrdinalIgnoreCase).Select((email, index) => new { id = SafeDigest(tenantPlan.ProposedTenantUid, email)[..32], email, normalizedEmail = IdentitySecurityService.NormalizeEmail(email), order = index, isActive = true, isVerified = false }).ToArray();
        await UpsertAsync(contacts, new { id = tenantPlan.ProposedTenantUid, tenantUid = tenantPlan.ProposedTenantUid, primaryContactEmail = contactEmail, primaryContactVerified = false, recipients = recipientEmails, legacyNotificationReferences = references, defaultNotificationPolicy = "legacy-compatible", deliveryCapability = "DisabledNoProvider", createdAt = DateTime.UtcNow, updatedAt = DateTime.UtcNow }, new(tenantPlan.ProposedTenantUid));
    }
    foreach (var userPlan in plan.Users.Where(x => x.Status == "planned"))
    {
        var source = snapshot.Users.Single(x => Text(x, "id") == userPlan.LegacyUserId);
        await UpsertAsync(accounts, new { id = userPlan.ProposedUserId, identityPartition = "global", userId = userPlan.ProposedUserId, legacyUserId = userPlan.LegacyUserId, loginEmail = Text(source, "email"), normalizedEmail = userPlan.NormalizedEmail, passwordHash = Text(source, "passwordHash"), globalRole = Role(source) == "SuperAdmin" ? "SuperAdmin" : "Viewer", status = Bool(source, "isActive", true) ? "Active" : "Suspended", emailVerified = false, forcePasswordChange = false, securityStamp = Text(source, "securityStamp", Guid.NewGuid().ToString("N")), sessionVersion = Number(source, "sessionVersion", 1), createdAt = DateTime.UtcNow, updatedAt = DateTime.UtcNow }, new("global"));
    }
    foreach (var member in plan.Memberships.Where(x => x.TenantUid != "unresolved" && x.UserId != "unresolved"))
        await UpsertAsync(memberships, new { id = member.MembershipId, member.MembershipId, member.TenantUid, member.UserId, role = member.Role.ToString(), permissions = member.Permissions, status = member.Status.ToString(), member.IsPrimaryTenantAdmin, createdByUserId = "identity-backfill", createdAt = DateTime.UtcNow, updatedAt = DateTime.UtcNow }, new(member.TenantUid));
    await UpsertAsync(audits, new { id = Guid.NewGuid().ToString("N"), auditPartition = "global", eventType = "identity_backfill_completed", actorRole = "system", requestId = runId, result = "success", createdAt = DateTime.UtcNow }, new("global"));
    await UpsertAsync(migration, new { id = runId, migrationPartition = "global", type = "IdentityBackfillRun", planHash = plan.InputFingerprint, status = "completed", dryRun = false, tenantCount = plan.Tenants.Count, userCount = plan.Users.Count(x => x.Status == "planned"), membershipCount = plan.Memberships.Count, completedAt = DateTime.UtcNow }, new("global"));
    await WriteJsonAsync(Path.Combine(output, "backfill-result.json"), new { runId, planHash = plan.InputFingerprint, tenants = plan.Tenants.Count, users = plan.Users.Count(x => x.Status == "planned"), memberships = plan.Memberships.Count, blockingConflicts = blocking.Length });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "apply_complete", runId, planHash = plan.InputFingerprint }));
}

async Task CompareAsync()
{
    var snapshot = await LoadSnapshotAsync();
    var plan = IdentityMigrationPlanner.CreateDryRun(snapshot.Snapshot);
    var tenantIdentities = await ReadAllAsync("TenantIdentity"); var accounts = await ReadAllAsync("UserAccounts");
    var memberships = await ReadAllAsync("TenantMemberships"); var contacts = await ReadAllAsync("TenantContactSettings");
    var comparisons = new List<object>(); var mismatches = 0;
    foreach (var tenant in plan.Tenants)
    {
        var source = snapshot.Tenants.Single(x => Text(x, "tenantId") == tenant.LegacyTenantId);
        var target = tenantIdentities.SingleOrDefault(x => Text(x, "tenantUid") == tenant.ProposedTenantUid);
        var contact = contacts.SingleOrDefault(x => Text(x, "tenantUid") == tenant.ProposedTenantUid);
        var expectedRefs = FormReferences(snapshot.Definitions, tenant.LegacyTenantId);
        var actualRefs = contact?["legacyNotificationReferences"]?.Deserialize<string[]>() ?? [];
        var match = target is not null && Text(target, "canonicalSlug") == tenant.CanonicalSlug && Text(contact, "primaryContactEmail") == Text(source["contact"] as JsonObject, "email") && expectedRefs.SequenceEqual(actualRefs);
        if (!match) mismatches++; comparisons.Add(new { operation = "tenant-and-contact", tenantUid = tenant.ProposedTenantUid, legacyDigest = SafeDigest(tenant.LegacyTenantId, Text(source["contact"] as JsonObject, "email")), newDigest = target is null ? "missing" : SafeDigest(Text(target, "canonicalSlug"), Text(contact, "primaryContactEmail")), match });
    }
    foreach (var user in plan.Users.Where(x => x.Status == "planned"))
    {
        var source = snapshot.Users.Single(x => Text(x, "id") == user.LegacyUserId); var target = accounts.SingleOrDefault(x => Text(x, "userId") == user.ProposedUserId);
        var hashPreserved = target is not null && Text(target, "passwordHash") == Text(source, "passwordHash");
        var emailPreserved = target is not null && Text(target, "loginEmail") == Text(source, "email");
        var memberCount = memberships.Count(x => Text(x, "userId") == user.ProposedUserId);
        var match = hashPreserved && emailPreserved && memberCount == user.TenantUids.Count;
        if (!match) mismatches++; comparisons.Add(new { operation = "user-membership-credential", userId = user.ProposedUserId, emailPreserved, passwordHashFingerprintPreserved = hashPreserved, expectedMemberships = user.TenantUids.Count, actualMemberships = memberCount, match });
    }
    await WriteJsonAsync(Path.Combine(output, "dual-read-comparison.json"), new { planHash = plan.InputFingerprint, comparisons, mismatches, passed = mismatches == 0 });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "compare_complete", comparisons = comparisons.Count, mismatches, passed = mismatches == 0 }));
    if (mismatches > 0) Environment.ExitCode = 2;
}

async Task ActivateAsync()
{
    var expectedPlanHash = Option("--plan-hash") ?? throw new ArgumentException("--plan-hash is required");
    var snapshot = await LoadSnapshotAsync();
    var plan = IdentityMigrationPlanner.CreateDryRun(snapshot.Snapshot);
    if (!string.Equals(plan.InputFingerprint, expectedPlanHash, StringComparison.Ordinal))
        throw new InvalidOperationException("source changed after dual-read comparison");
    var migration = database.GetContainer("IdentityMigration");
    foreach (var tenant in plan.Tenants)
    {
        await UpsertAsync(migration, new
        {
            id = $"identity-feature-{tenant.ProposedTenantUid}", migrationPartition = "global", type = "IdentityFeatureState",
            tenantUid = tenant.ProposedTenantUid, foundationEnabled = true, dualReadEnabled = true, dualWriteEnabled = true,
            compatibilityAdaptersEnabled = true, legacyCompatibilityRetained = true, selfServiceEnabled = false,
            tenantRenameEnabled = false, notificationProviderEnabled = false, updatedAt = DateTime.UtcNow,
            planHash = plan.InputFingerprint
        }, new("global"));
    }
    var audit = database.GetContainer("SecurityAuditEvents");
    await UpsertAsync(audit, new
    {
        id = $"identity-activation-{plan.InputFingerprint[..16]}", auditPartition = "global", eventType = "identity_dual_write_activated",
        actorRole = "system", requestId = $"identity-backfill-{plan.InputFingerprint[..16]}", result = "success",
        safeNewMetadataJson = JsonSerializer.Serialize(new { dualRead = true, dualWrite = true, selfService = false }), createdAt = DateTime.UtcNow
    }, new("global"));
    await WriteJsonAsync(Path.Combine(output, "activation-result.json"), new { planHash = plan.InputFingerprint, tenants = plan.Tenants.Count, dualRead = true, dualWrite = true, selfService = false });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "activation_complete", planHash = plan.InputFingerprint, tenants = plan.Tenants.Count }));
}

async Task VerifyAsync()
{
    var tenants = await ReadAllAsync("TenantIdentity");
    var accounts = await ReadAllAsync("UserAccounts");
    var memberships = await ReadAllAsync("TenantMemberships");
    var contacts = await ReadAllAsync("TenantContactSettings");
    var audits = await ReadAllAsync("SecurityAuditEvents");
    var migrations = await ReadAllAsync("IdentityMigration");
    var formEntries = await CountAsync("FormEntry");
    var result = new
    {
        tenants = tenants.Count, accounts = accounts.Count, memberships = memberships.Count, contacts = contacts.Count,
        featureStates = migrations.Count(x => Text(x, "type") == "IdentityFeatureState"),
        completedRuns = migrations.Count(x => Text(x, "type") == "IdentityBackfillRun" && Text(x, "status") == "completed"),
        loginDualWrites = accounts.Count(x => !string.IsNullOrWhiteSpace(Text(x, "lastLoginAt"))),
        loginDualWriteAudits = audits.Count(x => Text(x, "eventType") == "identity_login_dual_write"),
        formEntries, verifiedAt = DateTime.UtcNow
    };
    await WriteJsonAsync(Path.Combine(output, "production-identity-readback.json"), result);
    Console.WriteLine(JsonSerializer.Serialize(result));
}

async Task LoginAcceptanceAsync()
{
    var requestedEmails = (Option("--emails") ?? throw new ArgumentException("--emails is required"))
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(IdentitySecurityService.NormalizeEmail).ToHashSet(StringComparer.Ordinal);
    var users = await ReadAllAsync("User");
    var accounts = await ReadAllAsync("UserAccounts");
    var memberships = await ReadAllAsync("TenantMemberships");
    var audits = await ReadAllAsync("SecurityAuditEvents");
    var selected = users.Where(x => requestedEmails.Contains(IdentitySecurityService.NormalizeEmail(Text(x, "email"))))
        .Select(legacy =>
        {
            var normalized = IdentitySecurityService.NormalizeEmail(Text(legacy, "email"));
            var account = accounts.Single(x => Text(x, "normalizedEmail") == normalized);
            var userId = Text(account, "userId");
            var memberRows = memberships.Where(x => Text(x, "userId") == userId).Select(x => new
            {
                membershipId = Text(x, "membershipId"), tenantUid = Text(x, "tenantUid"), role = Text(x, "role"),
                status = Text(x, "status"), isPrimaryTenantAdmin = Bool(x, "isPrimaryTenantAdmin", false)
            }).ToArray();
            var loginAudits = audits.Where(x => Text(x, "actorUserId") == userId && Text(x, "eventType") == "identity_login_dual_write")
                .OrderBy(x => Text(x, "createdAt")).Select(x => new
                {
                    eventId = Text(x, "id"), requestId = Text(x, "requestId"), result = Text(x, "result"), createdAt = Text(x, "createdAt")
                }).ToArray();
            return new
            {
                legacyUserId = Text(legacy, "id"), normalizedEmail = normalized, legacyRole = Role(legacy),
                legacyTenantId = Text(legacy, "tenantId"), legacyActive = Bool(legacy, "isActive", true),
                legacyLastLogin = Text(legacy, "lastLogin"), userId, globalRole = Text(account, "globalRole"),
                accountStatus = Text(account, "status"), accountLastLoginAt = Text(account, "lastLoginAt"),
                sessionVersion = Number(account, "sessionVersion", 1),
                passwordFingerprintEqual = SafeDigest(Text(legacy, "passwordHash")) == SafeDigest(Text(account, "passwordHash")),
                loginEmailEqual = string.Equals(Text(legacy, "email"), Text(account, "loginEmail"), StringComparison.Ordinal),
                memberships = memberRows, successfulLoginAudits = loginAudits
            };
        }).OrderBy(x => x.normalizedEmail).ToArray();
    if (selected.Length != requestedEmails.Count) throw new InvalidOperationException("one or more requested identities were not found");
    await WriteJsonAsync(Path.Combine(output, "login-acceptance-readback.json"), new { capturedAt = DateTime.UtcNow, identities = selected });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "login_acceptance_readback_complete", identities = selected.Length, audits = selected.Sum(x => x.successfulLoginAudits.Length) }));
}

async Task<int> CountAsync(string containerName)
{
    var iterator = database.GetContainer(containerName).GetItemQueryIterator<int>(new QueryDefinition("SELECT VALUE COUNT(1) FROM c"));
    var count = 0;
    while (iterator.HasMoreResults) count += (await iterator.ReadNextAsync()).FirstOrDefault();
    return count;
}

async Task<(LegacyIdentitySnapshot Snapshot, List<JsonObject> Tenants, List<JsonObject> Users, List<JsonObject> Definitions)> LoadSnapshotAsync()
{
    var tenants = await ReadAllAsync("Tenant"); var users = await ReadAllAsync("User"); var definitions = await ReadAllAsync("FormDefinition");
    var tenantModels = tenants.Select(x => new Tenant { Id = Text(x, "id"), TenantId = Text(x, "tenantId"), Name = Text(x, "name"), Status = Text(x, "status"), Contact = new Contact { Email = Text(x["contact"] as JsonObject, "email"), Phone = Text(x["contact"] as JsonObject, "phone") } }).ToArray();
    var userModels = users.Select(x => new pumpkin_net_models.Models.User { Id = Text(x, "id"), TenantId = Text(x, "tenantId"), Email = Text(x, "email"), Username = Text(x, "username"), PasswordHash = Text(x, "passwordHash"), Role = Enum.TryParse<UserRole>(Role(x), out var role) ? role : UserRole.Viewer, IsActive = Bool(x, "isActive", true), Permissions = x["permissions"]?.Deserialize<List<string>>() ?? [] }).ToArray();
    var references = tenantModels.ToDictionary(x => x.TenantId, x => (IReadOnlyList<string>)FormReferences(definitions, x.TenantId));
    return (new(tenantModels, userModels, references, new Dictionary<string, IReadOnlyList<string>>()), tenants, users, definitions);
}

ContainerProperties Def(string id, string partitionKey, string[][] uniqueKeys)
{
    var value = new ContainerProperties(id, partitionKey);
    foreach (var paths in uniqueKeys) { var key = new UniqueKey(); foreach (var path in paths) key.Paths.Add(path); value.UniqueKeyPolicy.UniqueKeys.Add(key); }
    return value;
}
async Task UpsertAsync<T>(Container container, T item, PartitionKey partitionKey) => await container.UpsertItemAsync(item, partitionKey);
object SanitizeTenant(JsonObject x) => new { id = Text(x, "id"), tenantId = Text(x, "tenantId"), name = Text(x, "name"), status = Text(x, "status"), contact = new { email = Text(x["contact"] as JsonObject, "email") }, safeDigest = SafeDigest(x.ToJsonString()) };
object SanitizeUser(JsonObject x) => new { id = Text(x, "id"), tenantId = Text(x, "tenantId"), email = Text(x, "email"), normalizedEmail = IdentitySecurityService.NormalizeEmail(Text(x, "email")), role = Role(x), isActive = Bool(x, "isActive", true), passwordHashPresent = Text(x, "passwordHash").Length > 0, passwordHashFingerprint = SafeDigest(Text(x, "passwordHash")), safeDigest = SafeDigest(Text(x, "id"), Text(x, "tenantId"), Text(x, "email"), Role(x)) };
object SanitizeFormReference(JsonObject x) => new { id = Text(x, "id"), tenantId = Text(x, "tenantId"), formKey = Text(x, "formKey"), leadRecipientRef = Text(x, "leadRecipientRef"), notificationEmailRef = Text(x, "notificationEmailRef"), recipientGroupRef = Text(x["routing"] as JsonObject, "recipientGroupRef"), safeDigest = SafeDigest(Text(x, "id"), Text(x, "tenantId"), Text(x, "leadRecipientRef"), Text(x, "notificationEmailRef"), Text(x["routing"] as JsonObject, "recipientGroupRef")) };
static string[] FormReferences(IEnumerable<JsonObject> definitions, string tenantId) => definitions.Where(x => Text(x, "tenantId") == tenantId).SelectMany(x => new[] { Text(x, "leadRecipientRef"), Text(x, "notificationEmailRef"), Text(x["routing"] as JsonObject, "recipientGroupRef") }).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.Ordinal).OrderBy(x => x, StringComparer.Ordinal).ToArray();
string Role(JsonObject x) => x["role"] is JsonValue value && value.TryGetValue<int>(out var number) ? ((UserRole)number).ToString() : Text(x, "role", "Viewer");
static string Text(JsonObject? x, string name, string fallback = "") => x?[name]?.GetValue<string>() ?? fallback;
static bool Bool(JsonObject x, string name, bool fallback) => x[name] is JsonValue value && value.TryGetValue<bool>(out var result) ? result : fallback;
static long Number(JsonObject x, string name, long fallback) => x[name] is JsonValue value && value.TryGetValue<long>(out var result) ? result : fallback;
static string SafeDigest(params string[] values) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", values)))).ToLowerInvariant();
static async Task WriteJsonAsync(string path, object value) => await File.WriteAllTextAsync(path, JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
static async Task WriteChecksumManifestAsync(string root)
{
    var manifest = Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories).Where(x => !x.EndsWith("checksums.json")).OrderBy(x => x).Select(x => new { path = Path.GetRelativePath(root, x).Replace('\\', '/'), sha256 = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(x))).ToLowerInvariant(), bytes = new FileInfo(x).Length }).ToArray();
    await WriteJsonAsync(Path.Combine(root, "checksums.json"), manifest);
}
