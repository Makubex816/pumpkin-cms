using System.Security.Cryptography;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Azure.Cosmos;
using pumpkin_api.Services;
using pumpkin_api.Services.Identity;
using pumpkin_net_models.Models;

const string ToolVersion = "v2.8.63crst.1";
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
    case "reconcile-login-pending": await ReconcilePendingLoginAsync(); break;
    case "login-acceptance": await LoginAcceptanceAsync(); break;
    case "repair-login-locators": await RepairLoginLocatorsAsync(); break;
    case "synthetic-create": await SyntheticCreateAsync(); break;
    case "synthetic-verify": await SyntheticVerifyAsync(); break;
    case "synthetic-switch-fixture-status": await SyntheticSwitchFixtureStatusAsync(); break;
    case "synthetic-contact-snapshot": await SyntheticContactSnapshotAsync(); break;
    case "synthetic-cleanup": await SyntheticCleanupAsync(); break;
    default: throw new ArgumentException("command must be backup, provision, dry-run, apply, compare, activate, verify, reconcile-login-pending, login-acceptance, repair-login-locators, synthetic-create, synthetic-verify, synthetic-switch-fixture-status, synthetic-contact-snapshot, or synthetic-cleanup");
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
    var identityContainers = new[] { "TenantIdentity", "TenantIdentifierAliases", "TenantRenameJobs", "UserAccounts",
        "TenantMemberships", "IdentityRequests", "TenantContactSettings", "IdentityNotificationOutbox",
        "SecurityAuditEvents", "IdentityMigration" };
    var identityDocs = new Dictionary<string, List<JsonObject>>(StringComparer.Ordinal);
    foreach (var container in identityContainers) identityDocs[container] = await ReadAllAsync(container);
    var restrictedOutput = Option("--restricted-output") ?? throw new ArgumentException("--restricted-output is required for backup");
    var restricted = ValidateRestrictedBackupDirectory(restrictedOutput, output);
    var sanitized = Path.Combine(output, "sanitized-validation");
    EnsureOwnerOnlyDirectory(restricted);
    Directory.CreateDirectory(sanitized);
    var validationDigestKey = RandomNumberGenerator.GetBytes(32);
    await WriteNewRestrictedJsonAsync(Path.Combine(restricted, "sanitized-validation-digest-key.json"), new
    {
        algorithm = "HMAC-SHA256", keyBase64 = Convert.ToBase64String(validationDigestKey), createdAt = DateTime.UtcNow
    });
    await WriteNewRestrictedJsonAsync(Path.Combine(restricted, "Tenant.json"), tenantDocs);
    await WriteNewRestrictedJsonAsync(Path.Combine(restricted, "User.json"), userDocs);
    await WriteNewRestrictedJsonAsync(Path.Combine(restricted, "FormDefinition.json"), formDocs);
    foreach (var item in identityDocs)
        await WriteNewRestrictedJsonAsync(Path.Combine(restricted, $"{item.Key}.json"), item.Value);
    await WriteJsonAsync(Path.Combine(sanitized, "tenants.json"), tenantDocs.Select(x => SanitizeTenant(x, validationDigestKey)).ToArray());
    await WriteJsonAsync(Path.Combine(sanitized, "users.json"), userDocs.Select(x => SanitizeUser(x, validationDigestKey)).ToArray());
    await WriteJsonAsync(Path.Combine(sanitized, "form-notification-references.json"), formDocs.Select(x => SanitizeFormReference(x, validationDigestKey)).ToArray());
    await WriteJsonAsync(Path.Combine(sanitized, "identity-inventory.json"), identityDocs.Select(item => new
    {
        container = item.Key, count = item.Value.Count,
        recordDigests = item.Value.Select(x => OpaqueDigest(validationDigestKey, item.Key, SanitizeIdentityJson(x))).ToArray()
    }).ToArray());
    var inventory = new
    {
        toolVersion = ToolVersion, capturedAt = DateTime.UtcNow, databaseName,
        counts = new { tenants = tenantDocs.Count, users = userDocs.Count, formDefinitions = formDocs.Count },
        passwordHashPresenceCount = userDocs.Count(x => Text(x, "passwordHash").Length > 0),
        identityCounts = identityDocs.ToDictionary(x => x.Key, x => x.Value.Count),
        sourceContainers = new[] { "Tenant", "User", "FormDefinition" }.Concat(identityContainers).ToArray(),
        restoreOrder = new[] { "Tenant", "User", "FormDefinition" }.Concat(identityContainers).Concat(["disable-identity-flags", "validate-login-and-access"]).ToArray(),
        restrictedBackup = true, sanitizedExport = true
    };
    await WriteJsonAsync(Path.Combine(output, "inventory.json"), inventory);
    var checksumFiles = new List<string>
    {
        Path.Combine(sanitized, "tenants.json"),
        Path.Combine(sanitized, "users.json"),
        Path.Combine(sanitized, "form-notification-references.json"),
        Path.Combine(sanitized, "identity-inventory.json"),
        Path.Combine(output, "inventory.json")
    };
    await WriteChecksumManifestAsync(output, checksumFiles);
    var restrictedChecksumFiles = new List<string>
    {
        Path.Combine(restricted, "Tenant.json"),
        Path.Combine(restricted, "User.json"),
        Path.Combine(restricted, "FormDefinition.json"),
        Path.Combine(restricted, "sanitized-validation-digest-key.json")
    };
    restrictedChecksumFiles.AddRange(identityDocs.Keys.Select(name => Path.Combine(restricted, $"{name}.json")));
    await WriteChecksumManifestAsync(restricted, restrictedChecksumFiles);
    Console.WriteLine(JsonSerializer.Serialize(new { status = "backup_complete", tenants = tenantDocs.Count, users = userDocs.Count, output, toolVersion = ToolVersion }));
}

static string SanitizeIdentityJson(JsonObject source)
{
    var clone = source.DeepClone().AsObject();
    foreach (var name in new[] { "passwordHash", "tokenHash", "tokenReferenceHash", "templateDataJson", "sourceIp", "userAgent" })
        clone.Remove(name);
    return clone.ToJsonString();
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
        plan.InputFingerprint, plan.DryRun, plan.ExecutionEnabled, plan.ResumeToken,
        counts = new
        {
            tenants = plan.Tenants.Count, users = plan.Users.Count, memberships = plan.Memberships.Count,
            contacts = snapshot.Tenants.Count, notificationReferences = snapshot.Tenants.Sum(t => FormReferences(snapshot.Definitions, Text(t, "tenantId")).Length),
            primaryContactEmailsPresent = snapshot.Tenants.Count(t => !string.IsNullOrWhiteSpace(Text(t["contact"] as JsonObject, "email"))),
            conflicts = plan.Conflicts.Count
        },
        aggregateDigests = new
        {
            tenants = SafeDigest("dry-run-tenants-v1", JsonSerializer.Serialize(plan.Tenants)),
            users = SafeDigest("dry-run-users-v1", JsonSerializer.Serialize(plan.Users)),
            memberships = SafeDigest("dry-run-memberships-v1", JsonSerializer.Serialize(plan.Memberships))
        },
        conflictCategories = plan.Conflicts.GroupBy(conflict => conflict.Category, StringComparer.Ordinal)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => new { category = group.Key, count = group.Count() }).ToArray(),
        featureState = new { tenantCount = snapshot.Tenants.Count, foundationEnabled = false, dualReadEnabled = false, dualWriteEnabled = false },
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
    var requests = await ReadAllAsync("IdentityRequests");
    var audits = await ReadAllAsync("SecurityAuditEvents");
    var migrations = await ReadAllAsync("IdentityMigration");
    var formEntries = await CountAsync("FormEntry");
    var pendingReconciliations = migrations.Where(x =>
        Text(x, "type") is "IdentityLoginReconciliation" or "IdentitySecurityMutationReconciliation" &&
        string.Equals(Text(x, "status"), "Pending", StringComparison.OrdinalIgnoreCase)).ToArray();
    var pendingSecurityMutations = accounts.Where(x =>
        string.Equals(Text(x, "status"), "SecurityMutationPending", StringComparison.Ordinal)).ToArray();
    var staleSecurityMutations = pendingSecurityMutations.Where(x =>
    {
        return !DateTime.TryParse(Text(x, "securityMutationStartedAt"), null, System.Globalization.DateTimeStyles.RoundtripKind, out var startedAt) ||
            startedAt.ToUniversalTime() <= DateTime.UtcNow.AddSeconds(-30);
    }).ToArray();
    var pendingSyntheticOperations = requests.Where(x => Text(x, "type") == "SyntheticCreationOperation" &&
        string.Equals(Text(x, "status"), "Pending", StringComparison.OrdinalIgnoreCase)).ToArray();
    var pendingAudits = audits.Where(x =>
        string.Equals(Text(x, "result"), "pending", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(Text(x, "result"), "failed_closed", StringComparison.OrdinalIgnoreCase) ||
        Text(x, "eventType").Contains("reconciliation_required", StringComparison.OrdinalIgnoreCase)).ToArray();
    var result = new
    {
        tenants = tenants.Count, accounts = accounts.Count, memberships = memberships.Count, contacts = contacts.Count,
        featureStates = migrations.Count(x => Text(x, "type") == "IdentityFeatureState"),
        completedRuns = migrations.Count(x => Text(x, "type") == "IdentityBackfillRun" && Text(x, "status") == "completed"),
        loginDualWrites = accounts.Count(x => !string.IsNullOrWhiteSpace(Text(x, "lastLoginAt"))),
        loginDualWriteAudits = audits.Count(x => Text(x, "eventType") == "identity_login_dual_write"),
        pendingReconciliations = pendingReconciliations.Length,
        pendingSecurityMutations = pendingSecurityMutations.Length,
        freshSecurityMutations = pendingSecurityMutations.Length - staleSecurityMutations.Length,
        staleSecurityMutations = staleSecurityMutations.Length,
        pendingSyntheticOperations = pendingSyntheticOperations.Length,
        pendingAudits = pendingAudits.Length,
        reconciliationClear = pendingReconciliations.Length == 0 && pendingSecurityMutations.Length == 0 &&
            pendingSyntheticOperations.Length == 0 && pendingAudits.Length == 0,
        formEntries, verifiedAt = DateTime.UtcNow
    };
    await WriteJsonAsync(Path.Combine(output, "production-identity-readback.json"), result);
    if (!result.reconciliationClear)
        throw new InvalidOperationException("production identity verification found pending reconciliation, security mutation, or pending audit state");
    Console.WriteLine(JsonSerializer.Serialize(result));
}

async Task ReconcilePendingLoginAsync()
{
    var migrations = await ReadAllAsync("IdentityMigration");
    var requests = await ReadAllAsync("IdentityRequests");
    var audits = await ReadAllAsync("SecurityAuditEvents");
    var accounts = await ReadAllAsync("UserAccounts");
    var reconciliationAudits = audits.Where(x =>
        Text(x, "eventType") == "identity_login_reconciliation_resolved").ToList();

    foreach (var pendingAudit in reconciliationAudits.Where(x => Text(x, "result") == "pending"))
    {
        var linkedResolved = migrations.Where(x =>
            Text(x, "type") == "IdentityLoginReconciliation" &&
            Text(x, "status") == "Resolved" &&
            Text(x, "resolutionAuditId") == Text(pendingAudit, "id")).ToArray();
        var linkedPending = migrations.Where(x =>
            Text(x, "type") == "IdentityLoginReconciliation" &&
            Text(x, "status") == "Pending" &&
            $"login-reconciliation-resolved-{SafeDigest(Text(x, "id"))[..24]}" == Text(pendingAudit, "id")).ToArray();
        if (linkedResolved.Length == 1 && linkedPending.Length == 0)
        {
            await database.GetContainer("SecurityAuditEvents").PatchItemAsync<object>(Text(pendingAudit, "id"), new("global"),
            [
                PatchOperation.Set("/result", "success"),
                PatchOperation.Set("/updatedAt", DateTime.UtcNow)
            ], new PatchItemRequestOptions { IfMatchEtag = Text(pendingAudit, "_etag") });
        }
        else if (linkedResolved.Length != 0 || linkedPending.Length != 1)
        {
            throw new InvalidOperationException("a pending login reconciliation audit lacks one resumable migration row");
        }
    }

    audits = await ReadAllAsync("SecurityAuditEvents");
    reconciliationAudits = audits.Where(x =>
        Text(x, "eventType") == "identity_login_reconciliation_resolved").ToList();
    var pending = migrations.Where(x =>
        Text(x, "type") == "IdentityLoginReconciliation" &&
        Text(x, "status") == "Pending").ToArray();

    (string Resolution, int SessionCount, int LoginAuditCount, int SupersedingAuditCount) Evaluate(JsonObject row)
    {
        var id = Text(row, "id");
        var userId = Text(row, "userId");
        var requestId = Text(row, "requestId");
        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(requestId) ||
            !DateTimeOffset.TryParse(Text(row, "createdAt"), out var createdAt))
            throw new InvalidOperationException("a login reconciliation row is malformed");

        var matchingAccounts = accounts.Where(x => Text(x, "userId") == userId).ToArray();
        var matchingSessions = requests.Where(x =>
            Text(x, "type") == "UserSession" && Text(x, "requestId") == requestId).ToArray();
        var matchingLoginAudits = audits.Where(x =>
            Text(x, "eventType") == "identity_login_dual_write" && Text(x, "requestId") == requestId).ToArray();
        if (matchingAccounts.Length != 1 ||
            !DateTimeOffset.TryParse(Text(matchingAccounts[0], "lastLoginAt"), out var accountLastLoginAt))
            throw new InvalidOperationException("a login reconciliation lacks one linked account with verified accounting");

        var supersedingAudits = audits.Where(x =>
        {
            if (Text(x, "eventType") != "identity_login_dual_write" ||
                Text(x, "actorUserId") != userId || Text(x, "targetUserId") != userId ||
                Text(x, "result") != "success" || Text(x, "auditPartition") != "global" ||
                string.IsNullOrWhiteSpace(Text(x, "requestId")) ||
                Text(x, "id") != $"login-{Text(x, "requestId")}" ||
                !DateTimeOffset.TryParse(Text(x, "createdAt"), out var auditAt))
                return false;
            return auditAt > createdAt && auditAt == accountLastLoginAt;
        }).ToArray();

        if (matchingSessions.Length == 0 && matchingLoginAudits.Length == 0)
        {
            if (supersedingAudits.Length == 0)
                throw new InvalidOperationException("an incomplete login reconciliation lacks a later exact successful-login audit");
            return ("no_session_or_audit_later_success_verified", 0, 0, supersedingAudits.Length);
        }

        if (matchingSessions.Length != 1 || matchingLoginAudits.Length != 1 ||
            Text(matchingSessions[0], "userId") != userId ||
            Text(matchingSessions[0], "requestPartition") != userId ||
            string.IsNullOrWhiteSpace(Text(matchingSessions[0], "id")) ||
            Number(matchingSessions[0], "sessionVersion", 0) < 1 ||
            Text(matchingLoginAudits[0], "actorUserId") != userId ||
            Text(matchingLoginAudits[0], "targetUserId") != userId ||
            Text(matchingLoginAudits[0], "result") != "success" ||
            Text(matchingLoginAudits[0], "auditPartition") != "global" ||
            Text(matchingLoginAudits[0], "id") != $"login-{requestId}" ||
            !DateTimeOffset.TryParse(Text(matchingSessions[0], "createdAt"), out var sessionCreatedAt) ||
            !DateTimeOffset.TryParse(Text(matchingLoginAudits[0], "createdAt"), out var auditCreatedAt) ||
            sessionCreatedAt != auditCreatedAt || accountLastLoginAt < auditCreatedAt)
            throw new InvalidOperationException("a pending login reconciliation has a partial or inconsistent write set");
        return ("complete_write_set_verified", 1, 1, supersedingAudits.Length);
    }

    var digestKey = RandomNumberGenerator.GetBytes(32);
    try
    {
        foreach (var row in pending)
        {
            var id = Text(row, "id");
            var userId = Text(row, "userId");
            if (string.IsNullOrWhiteSpace(Text(row, "_etag")))
                throw new InvalidOperationException("a pending login reconciliation row lacks a concurrency token");
            var evaluation = Evaluate(row);

            var resolvedAt = DateTime.UtcNow;
            var resolutionAuditId = $"login-reconciliation-resolved-{SafeDigest(id)[..24]}";
            var existingResolutionAudits = reconciliationAudits.Where(x => Text(x, "id") == resolutionAuditId).ToArray();
            if (existingResolutionAudits.Length > 1 ||
                (existingResolutionAudits.Length == 1 &&
                 (Text(existingResolutionAudits[0], "eventType") != "identity_login_reconciliation_resolved" ||
                  Text(existingResolutionAudits[0], "targetUserId") != userId ||
                  Text(existingResolutionAudits[0], "resolutionCategory") != evaluation.Resolution ||
                  Text(existingResolutionAudits[0], "result") is not ("pending" or "success"))))
                throw new InvalidOperationException("a login reconciliation resolution audit failed integrity validation");
            if (existingResolutionAudits.Length == 0)
            {
                await database.GetContainer("SecurityAuditEvents").CreateItemAsync(new
                {
                    id = resolutionAuditId,
                    auditPartition = "global",
                    eventType = "identity_login_reconciliation_resolved",
                    actorRole = "system",
                    targetUserId = userId,
                    requestId = $"reconcile-{SafeDigest(id)[..24]}",
                    resolutionCategory = evaluation.Resolution,
                    result = "pending",
                    createdAt = resolvedAt
                }, new PartitionKey("global"));
            }

            await database.GetContainer("IdentityMigration").PatchItemAsync<object>(id, new("global"),
            [
                PatchOperation.Set("/status", "Resolved"),
                PatchOperation.Set("/resolutionCategory", evaluation.Resolution),
                PatchOperation.Set("/resolutionAuditId", resolutionAuditId),
                PatchOperation.Set("/resolvedAt", resolvedAt),
                PatchOperation.Set("/updatedAt", resolvedAt)
            ], new PatchItemRequestOptions { IfMatchEtag = Text(row, "_etag") });

            var auditReadback = await database.GetContainer("SecurityAuditEvents")
                .ReadItemAsync<JsonObject>(resolutionAuditId, new("global"));
            if (Text(auditReadback.Resource, "result") == "pending")
            {
                await database.GetContainer("SecurityAuditEvents").PatchItemAsync<object>(resolutionAuditId, new("global"),
                [
                    PatchOperation.Set("/result", "success"),
                    PatchOperation.Set("/updatedAt", DateTime.UtcNow)
                ], new PatchItemRequestOptions { IfMatchEtag = Text(auditReadback.Resource, "_etag") });
            }

        }

        migrations = await ReadAllAsync("IdentityMigration");
        audits = await ReadAllAsync("SecurityAuditEvents");
        foreach (var pendingAudit in audits.Where(x =>
                     Text(x, "eventType") == "identity_login_reconciliation_resolved" && Text(x, "result") == "pending"))
        {
            var linked = migrations.Where(x =>
                Text(x, "type") == "IdentityLoginReconciliation" && Text(x, "status") == "Resolved" &&
                Text(x, "resolutionAuditId") == Text(pendingAudit, "id")).ToArray();
            if (linked.Length != 1)
                throw new InvalidOperationException("a terminal login reconciliation audit lacks one resolved migration row");
            await database.GetContainer("SecurityAuditEvents").PatchItemAsync<object>(Text(pendingAudit, "id"), new("global"),
            [
                PatchOperation.Set("/result", "success"),
                PatchOperation.Set("/updatedAt", DateTime.UtcNow)
            ], new PatchItemRequestOptions { IfMatchEtag = Text(pendingAudit, "_etag") });
        }

        migrations = await ReadAllAsync("IdentityMigration");
        audits = await ReadAllAsync("SecurityAuditEvents");
        var remainingPending = migrations.Count(x =>
            Text(x, "type") == "IdentityLoginReconciliation" && Text(x, "status") == "Pending");
        var remainingPendingAudits = audits.Count(x =>
            Text(x, "eventType") == "identity_login_reconciliation_resolved" && Text(x, "result") == "pending");
        if (remainingPending != 0 || remainingPendingAudits != 0)
            throw new InvalidOperationException("login reconciliation did not reach a fully audited terminal state");

        var resolvedRows = migrations.Where(x =>
            Text(x, "type") == "IdentityLoginReconciliation" && Text(x, "status") == "Resolved" &&
            !string.IsNullOrWhiteSpace(Text(x, "resolutionAuditId"))).ToArray();
        var results = resolvedRows.Select(row =>
        {
            var evaluation = Evaluate(row);
            var resolutionAuditId = Text(row, "resolutionAuditId");
            var resolutionAudit = audits.Where(x => Text(x, "id") == resolutionAuditId).ToArray();
            if (resolutionAudit.Length != 1 ||
                Text(resolutionAudit[0], "eventType") != "identity_login_reconciliation_resolved" ||
                Text(resolutionAudit[0], "targetUserId") != Text(row, "userId") ||
                Text(resolutionAudit[0], "resolutionCategory") != evaluation.Resolution ||
                Text(resolutionAudit[0], "result") != "success" ||
                Text(row, "resolutionCategory") != evaluation.Resolution ||
                resolutionAuditId != $"login-reconciliation-resolved-{SafeDigest(Text(row, "id"))[..24]}" ||
                !DateTimeOffset.TryParse(Text(row, "resolvedAt"), out var resolvedAt))
                throw new InvalidOperationException("a resolved login reconciliation failed final audit integrity validation");
            return new
            {
                migrationIdDigest = OpaqueDigest(digestKey, "login-reconciliation", Text(row, "id"))[..16],
                requestIdDigest = OpaqueDigest(digestKey, "login-request", Text(row, "requestId"))[..16],
                userIdDigest = OpaqueDigest(digestKey, "login-user", Text(row, "userId"))[..16],
                resolution = evaluation.Resolution,
                matchingSessionCount = evaluation.SessionCount,
                matchingLoginAuditCount = evaluation.LoginAuditCount,
                supersedingAuditCount = evaluation.SupersedingAuditCount,
                resolvedAt
            };
        }).ToArray();

        var result = new
        {
            toolVersion = ToolVersion,
            reconciledThisRun = pending.Length,
            reconciledCount = results.Length,
            remainingPending,
            remainingPendingAudits,
            results,
            completedAt = DateTime.UtcNow
        };
        var resultPath = Path.Combine(output, "login-reconciliation-result.json");
        await WriteJsonAsync(resultPath, result);
        await WriteChecksumManifestAsync(output, [resultPath]);
        Console.WriteLine(JsonSerializer.Serialize(new
        {
            status = "login_reconciliation_complete",
            reconciledThisRun = pending.Length,
            reconciledCount = results.Length,
            remainingPending,
            remainingPendingAudits
        }));
    }
    finally
    {
        CryptographicOperations.ZeroMemory(digestKey);
    }
}

async Task LoginAcceptanceAsync()
{
    var requestedEmailValues = (Option("--emails") ?? throw new ArgumentException("--emails is required"))
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(IdentitySecurityService.NormalizeEmail).ToArray();
    var requestedEmails = requestedEmailValues.ToHashSet(StringComparer.Ordinal);
    var expectedRequestIdValues = (Option("--request-ids") ?? throw new ArgumentException("--request-ids is required"))
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    var expectedRequestIds = expectedRequestIdValues.ToHashSet(StringComparer.Ordinal);
    if (requestedEmails.Count == 0 || requestedEmails.Count != requestedEmailValues.Length ||
        expectedRequestIds.Count != expectedRequestIdValues.Length)
        throw new InvalidOperationException("login acceptance inputs must be nonempty and unique");
    if (!int.TryParse(Option("--expected-count"), out var expectedCount) || expectedCount < 1)
        throw new ArgumentException("--expected-count must be a positive integer");
    var expectDualWriteOption = Option("--expect-dual-write") ??
        throw new ArgumentException("--expect-dual-write true|false is required");
    var expectDualWrite = expectDualWriteOption.Equals("true", StringComparison.OrdinalIgnoreCase) ? true :
        expectDualWriteOption.Equals("false", StringComparison.OrdinalIgnoreCase) ? false :
        throw new ArgumentException("--expect-dual-write must be true or false");
    if (!DateTimeOffset.TryParse(Option("--window-start"), out var windowStart) ||
        !DateTimeOffset.TryParse(Option("--window-end"), out var windowEnd) || windowEnd <= windowStart)
        throw new ArgumentException("--window-start and --window-end must define a valid bounded interval");
    if (expectedRequestIds.Count != expectedCount)
        throw new InvalidOperationException("expected request ID cardinality does not match --expected-count");
    var evidenceDigestKey = RandomNumberGenerator.GetBytes(32);
    var users = await ReadAllAsync("User");
    var accounts = await ReadAllAsync("UserAccounts");
    var memberships = await ReadAllAsync("TenantMemberships");
    var tenants = await ReadAllAsync("TenantIdentity");
    var requests = await ReadAllAsync("IdentityRequests");
    var audits = await ReadAllAsync("SecurityAuditEvents");
    var acceptanceAudits = audits.Where(x => expectedRequestIds.Contains(Text(x, "requestId")) &&
        Text(x, "eventType") == "identity_login_dual_write").ToArray();
    var acceptanceSessions = requests.Where(x => expectedRequestIds.Contains(Text(x, "requestId")) &&
        Text(x, "type") == "UserSession").ToArray();
    if (expectDualWrite &&
        (acceptanceAudits.Length != expectedCount || acceptanceSessions.Length != expectedCount ||
         acceptanceAudits.Select(x => Text(x, "id")).Distinct(StringComparer.Ordinal).Count() != expectedCount ||
         acceptanceSessions.Select(x => Text(x, "id")).Distinct(StringComparer.Ordinal).Count() != expectedCount))
        throw new InvalidOperationException("dual-write login acceptance audit/session cardinality or ID uniqueness failed");
    if (!expectDualWrite && (acceptanceAudits.Length != 0 || acceptanceSessions.Length != 0))
        throw new InvalidOperationException("dual-write-disabled login acceptance found an audit or UserSession for the exact request window");
    foreach (var requestId in expectDualWrite ? expectedRequestIds : Enumerable.Empty<string>())
    {
        var requestAudits = acceptanceAudits.Where(x => Text(x, "requestId") == requestId).ToArray();
        var requestSessions = acceptanceSessions.Where(x => Text(x, "requestId") == requestId).ToArray();
        if (requestAudits.Length != 1 || requestSessions.Length != 1 || Text(requestAudits[0], "result") != "success" ||
            Text(requestAudits[0], "id") != $"login-{requestId}" ||
            Text(requestAudits[0], "actorUserId") != Text(requestSessions[0], "userId") ||
            Text(requestSessions[0], "requestPartition") != Text(requestSessions[0], "userId") ||
            string.IsNullOrWhiteSpace(Text(requestSessions[0], "id")) || Number(requestSessions[0], "sessionVersion", 0) < 1 ||
            !WithinAcceptanceWindow(requestAudits[0], "createdAt", windowStart, windowEnd) ||
            !WithinAcceptanceWindow(requestSessions[0], "createdAt", windowStart, windowEnd))
            throw new InvalidOperationException($"login acceptance request {OpaqueDigest(evidenceDigestKey, "request", requestId)[..16]} lacks one matching success audit and UserSession");
    }
    var selected = users.Where(x => requestedEmails.Contains(IdentitySecurityService.NormalizeEmail(Text(x, "email"))))
        .Select(legacy =>
        {
            var normalized = IdentitySecurityService.NormalizeEmail(Text(legacy, "email"));
            var accountRows = accounts.Where(x => Text(x, "normalizedEmail") == normalized).ToArray();
            if (accountRows.Length != 1) throw new InvalidOperationException("login acceptance account linkage is missing or ambiguous");
            var account = accountRows[0];
            var userId = Text(account, "userId");
            var memberRows = memberships.Where(x => Text(x, "userId") == userId).Select(x => new
            {
                membershipIdDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-membership", Text(x, "membershipId"))[..16],
                tenantUidDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-tenant", Text(x, "tenantUid"))[..16], role = Text(x, "role"),
                status = Text(x, "status"), isPrimaryTenantAdmin = Bool(x, "isPrimaryTenantAdmin", false)
            }).ToArray();
            var homeTenants = tenants.Where(x => Text(x, "legacyTenantId") == Text(legacy, "tenantId") &&
                string.Equals(Text(x, "status"), "Active", StringComparison.OrdinalIgnoreCase)).ToArray();
            var homeMembershipLinked = homeTenants.Length == 1 && memberships.Count(x =>
                Text(x, "userId") == userId && Text(x, "tenantUid") == Text(homeTenants[0], "tenantUid") &&
                Text(x, "status") == "Active") == 1;
            var loginAudits = acceptanceAudits.Where(x => Text(x, "actorUserId") == userId)
                .OrderBy(x => Text(x, "createdAt")).Select(x => new
                {
                    eventDigest = OpaqueDigest(evidenceDigestKey, "login-event", Text(x, "id"))[..16],
                    requestIdDigest = OpaqueDigest(evidenceDigestKey, "login-request", Text(x, "requestId"))[..16],
                    result = Text(x, "result"), createdAt = Text(x, "createdAt")
                }).ToArray();
            var loginSessions = acceptanceSessions.Where(x => Text(x, "userId") == userId)
                .OrderBy(x => Text(x, "createdAt")).Select(x => new
                {
                    sessionDigest = OpaqueDigest(evidenceDigestKey, "login-session", Text(x, "id"))[..16],
                    requestIdDigest = OpaqueDigest(evidenceDigestKey, "login-request", Text(x, "requestId"))[..16],
                    sessionVersion = Number(x, "sessionVersion", 0), createdAt = Text(x, "createdAt"),
                    partitionMatchesUser = Text(x, "requestPartition") == userId
                }).ToArray();
            return new
            {
                legacyUserIdDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-legacy-user", Text(legacy, "id"))[..16],
                normalizedEmailDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-email", normalized)[..16], legacyRole = Role(legacy),
                legacyTenantIdDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-legacy-tenant", Text(legacy, "tenantId"))[..16],
                legacyActive = Bool(legacy, "isActive", true), legacyLastLogin = Text(legacy, "lastLogin"),
                userIdDigest = OpaqueDigest(evidenceDigestKey, "login-acceptance-user", userId)[..16], globalRole = Text(account, "globalRole"),
                accountStatus = Text(account, "status"), accountLastLoginAt = Text(account, "lastLoginAt"),
                sessionVersion = Number(account, "sessionVersion", 1),
                passwordFingerprintEqual = SafeDigest(Text(legacy, "passwordHash")) == SafeDigest(Text(account, "passwordHash")),
                loginEmailEqual = string.Equals(Text(legacy, "email"), Text(account, "loginEmail"), StringComparison.Ordinal),
                normalizedEmailEqual = Text(account, "normalizedEmail") == normalized &&
                    IdentitySecurityService.NormalizeEmail(Text(account, "loginEmail")) == normalized,
                stableLegacyLinkage = Text(account, "legacyUserId") == Text(legacy, "id") &&
                    Text(account, "legacyTenantId") == Text(legacy, "tenantId"),
                legacyLastLoginInWindow = WithinAcceptanceWindow(legacy, "lastLogin", windowStart, windowEnd),
                accountLastLoginInWindow = WithinAcceptanceWindow(account, "lastLoginAt", windowStart, windowEnd),
                sessionParity = loginSessions.Length == loginAudits.Length && loginSessions.All(session =>
                    session.partitionMatchesUser && session.sessionVersion == Number(account, "sessionVersion", 1)),
                homeMembershipLinked,
                memberships = memberRows, successfulLoginAudits = loginAudits, successfulLoginSessions = loginSessions
            };
        }).OrderBy(x => x.normalizedEmailDigest).ToArray();
    if (selected.Length != requestedEmails.Count ||
        expectDualWrite && (selected.Sum(x => x.successfulLoginAudits.Length) != expectedCount ||
            selected.Any(x => x.successfulLoginAudits.Length == 0 || x.successfulLoginSessions.Length == 0)) ||
        selected.Any(x => !x.legacyActive || x.accountStatus != "Active" || x.sessionVersion < 1 ||
            !x.passwordFingerprintEqual || !x.loginEmailEqual || !x.normalizedEmailEqual || !x.stableLegacyLinkage ||
            !x.legacyLastLoginInWindow || expectDualWrite && !x.accountLastLoginInWindow ||
            !x.sessionParity || !x.homeMembershipLinked))
        throw new InvalidOperationException("login acceptance identity, credential, email, membership, or audit parity failed");
    await WriteJsonAsync(Path.Combine(output, "login-acceptance-readback.json"), new
    {
        capturedAt = DateTime.UtcNow, windowStart, windowEnd, expectedCount, expectDualWrite,
        requestIdDigests = expectedRequestIds.OrderBy(x => x, StringComparer.Ordinal)
            .Select(x => OpaqueDigest(evidenceDigestKey, "login-request", x)[..16]).ToArray(),
        matchingDualWriteAudits = acceptanceAudits.Length, matchingUserSessions = acceptanceSessions.Length,
        identities = selected
    });
    CryptographicOperations.ZeroMemory(evidenceDigestKey);
    Console.WriteLine(JsonSerializer.Serialize(new
    {
        status = "login_acceptance_verified", expectDualWrite, identities = selected.Length,
        audits = acceptanceAudits.Length, sessions = acceptanceSessions.Length, expectedCount
    }));
}

async Task RepairLoginLocatorsAsync()
{
    var users = await ReadAllAsync("User");
    var accounts = await ReadAllAsync("UserAccounts");
    var container = database.GetContainer("UserAccounts");
    var repaired = 0;
    foreach (var account in accounts)
    {
        var legacyId = Text(account, "legacyUserId");
        var legacy = users.SingleOrDefault(x => Text(x, "id") == legacyId)
            ?? throw new InvalidOperationException("account legacy user mapping missing");
        var tenantId = Text(legacy, "tenantId");
        if (string.IsNullOrWhiteSpace(tenantId)) throw new InvalidOperationException("legacy tenant partition missing");
        if (Text(account, "legacyTenantId") == tenantId) continue;
        await container.PatchItemAsync<JsonObject>(Text(account, "id"), new("global"),
            [PatchOperation.Set("/legacyTenantId", tenantId)]);
        repaired++;
    }
    await WriteJsonAsync(Path.Combine(output, "login-locator-repair.json"), new
    {
        status = "complete", accounts = accounts.Count, repaired,
        passwordFieldsRead = false, passwordFieldsWritten = false, membershipWrites = 0
    });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "login_locator_repair_complete", accounts = accounts.Count, repaired }));
}

async Task SyntheticCreateAsync()
{
    const string legacyUserId = "crst-synthetic-validation-user";
    const string email = "pumpkin-crst-validation@example.invalid";
    const string primaryLegacyTenantId = "party-pros-philadelphia";
    string normalizedEmail = IdentitySecurityService.NormalizeEmail(email);
    string userId = SafeDigest("user", legacyUserId, normalizedEmail)[..32];
    string credentialOutput = Option("--credential-output") ?? throw new ArgumentException("--credential-output is required");
    var credentialPath = ValidateCredentialHandoffPath(credentialOutput, output);

    var legacyUsers = await ReadAllAsync("User");
    var accounts = await ReadAllAsync("UserAccounts");
    var approvedFixtures = ResolveSyntheticTenantFixtures(await ReadAllAsync("TenantIdentity"));
    var fixtures = approvedFixtures.Where(x => x.Purpose is "home" or "switch-target").ToArray();
    if (fixtures.Length != 2) throw new InvalidOperationException("synthetic initial fixture count is not exactly two");
    var primaryTenantUid = fixtures.Single(x => x.Purpose == "home").TenantUid;
    var requestContainer = database.GetContainer("IdentityRequests");
    var auditContainer = database.GetContainer("SecurityAuditEvents");
    var creationMarkerId = $"crst-synthetic-create-marker-{userId}";
    var creationAuditId = $"crst-synthetic-created-{userId}";
    var markerTimestamp = DateTime.UtcNow;
    var existingMarkers = (await ReadAllAsync("IdentityRequests")).Where(x =>
        Text(x, "id") == creationMarkerId && Text(x, "requestPartition") == "global").ToArray();
    if (existingMarkers.Length > 1 || existingMarkers.Length == 1 &&
         (Text(existingMarkers[0], "type") != "SyntheticCreationOperation" || Text(existingMarkers[0], "syntheticUserId") != userId ||
          Text(existingMarkers[0], "syntheticValidationId") != "V2.8.63CRST" ||
         Text(existingMarkers[0], "normalizedEmailDigest") != SafeDigest(normalizedEmail) ||
         Text(existingMarkers[0], "status") is not ("Pending" or "Completed")))
        throw new InvalidOperationException("synthetic creation marker is ambiguous or failed integrity validation");
    if (existingMarkers.Length == 0)
        await requestContainer.CreateItemAsync(new
        {
            id = creationMarkerId, requestPartition = "global", type = "SyntheticCreationOperation",
            syntheticUserId = userId, syntheticValidationId = "V2.8.63CRST", normalizedEmailDigest = SafeDigest(normalizedEmail),
            expectedLegacyUserId = legacyUserId, expectedMembershipCount = fixtures.Length,
            expectedPrimarySnapshotCount = approvedFixtures.Length, status = "Pending",
            createdAt = markerTimestamp, updatedAt = markerTimestamp
        }, new("global"));
    var existingCreationAudits = (await ReadAllAsync("SecurityAuditEvents")).Where(x => Text(x, "id") == creationAuditId).ToArray();
    if (existingCreationAudits.Length > 1 || existingCreationAudits.Length == 1 &&
        (Text(existingCreationAudits[0], "eventType") != "identity_synthetic_validation_created" ||
         Text(existingCreationAudits[0], "targetUserId") != userId || Text(existingCreationAudits[0], "result") is not ("pending" or "success")))
        throw new InvalidOperationException("synthetic creation audit is ambiguous or failed integrity validation");
    if (existingCreationAudits.Length == 0)
        await auditContainer.CreateItemAsync(new
        {
            id = creationAuditId, auditPartition = "global", eventType = "identity_synthetic_validation_created",
            actorRole = "system", targetUserId = userId, targetTenantUid = primaryTenantUid,
            requestId = "V2.8.63CRST", result = "pending", fixtureCount = fixtures.Length,
            creationMarkerId, createdAt = markerTimestamp
        }, new("global"));
    var pendingMarkerDurable = (await ReadAllAsync("IdentityRequests")).Count(x => Text(x, "id") == creationMarkerId &&
        Text(x, "type") == "SyntheticCreationOperation" && Text(x, "syntheticUserId") == userId &&
        Text(x, "syntheticValidationId") == "V2.8.63CRST") == 1;
    var pendingAuditDurable = (await ReadAllAsync("SecurityAuditEvents")).Count(x => Text(x, "id") == creationAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_created" && Text(x, "targetUserId") == userId) == 1;
    if (!pendingMarkerDurable || !pendingAuditDurable)
        throw new InvalidOperationException("synthetic creation pending marker and audit are not durably readable");
    await using var adminInvariantLease = await AcquireToolAdminInvariantLeaseAsync("V2.8.63CRST-synthetic-create");
    legacyUsers = await ReadAllAsync("User");
    accounts = await ReadAllAsync("UserAccounts");
    var existingMemberships = await ReadAllAsync("TenantMemberships");
    var primaryAdminBaselines = new List<(string TenantUid, string LegacyTenantId, string MembershipId, string UserId, string Etag)>();
    foreach (var fixture in approvedFixtures)
    {
        var activePrimaryMemberships = existingMemberships.Where(x =>
            Text(x, "tenantUid") == fixture.TenantUid &&
            string.Equals(Text(x, "status"), "Active", StringComparison.OrdinalIgnoreCase) &&
            Bool(x, "isPrimaryTenantAdmin", false)).ToArray();
        var activePrimaryAccounts = activePrimaryMemberships.Length == 1
            ? accounts.Where(x => Text(x, "userId", Text(x, "id")) == Text(activePrimaryMemberships[0], "userId") &&
                Text(x, "status") == "Active").ToArray()
            : [];
        if (activePrimaryMemberships.Length != 1 || Text(activePrimaryMemberships[0], "userId") == userId ||
            activePrimaryAccounts.Length != 1 ||
            !string.Equals(Text(activePrimaryMemberships[0], "role"), "TenantAdmin", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(Text(activePrimaryMemberships[0], "id")) ||
            string.IsNullOrWhiteSpace(Text(activePrimaryMemberships[0], "_etag")))
            throw new InvalidOperationException($"synthetic fixture tenant {fixture.LegacyTenantId} does not have one safe customer primary TenantAdmin");
        primaryAdminBaselines.Add((fixture.TenantUid, fixture.LegacyTenantId,
            Text(activePrimaryMemberships[0], "id"), Text(activePrimaryMemberships[0], "userId"), Text(activePrimaryMemberships[0], "_etag")));
    }
    var legacyRows = legacyUsers.Where(x => Text(x, "id") == legacyUserId).ToArray();
    var accountRows = accounts.Where(x => Text(x, "userId", Text(x, "id")) == userId).ToArray();
    var membershipRows = existingMemberships.Where(x => Text(x, "userId") == userId).ToArray();
    var snapshotRows = (await ReadAllAsync("IdentityRequests")).Where(x =>
        Text(x, "type") == "SyntheticPrimaryAdminSnapshot" && Text(x, "syntheticUserId") == userId).ToArray();
    var expectedMembershipIds = fixtures.ToDictionary(x => x.TenantUid,
        x => SafeDigest("membership", x.TenantUid, userId)[..32], StringComparer.Ordinal);
    var expectedSnapshotIds = approvedFixtures.ToDictionary(x => x.TenantUid,
        x => $"crst-primary-admin-snapshot-{x.TenantUid}-{userId}", StringComparer.Ordinal);
    bool SafeLegacy(JsonObject row) => Text(row, "tenantId") == primaryLegacyTenantId &&
        IdentitySecurityService.NormalizeEmail(Text(row, "email")) == normalizedEmail &&
        Number(row, "role", -1) == (long)UserRole.Viewer && Bool(row, "isActive", false) &&
        !string.IsNullOrWhiteSpace(Text(row, "passwordHash")) && !string.IsNullOrWhiteSpace(Text(row, "_etag"));
    bool SafeAccount(JsonObject row) => Text(row, "id") == userId && Text(row, "identityPartition") == "global" &&
        Text(row, "legacyUserId") == legacyUserId && Text(row, "legacyTenantId") == primaryLegacyTenantId &&
        Text(row, "normalizedEmail") == normalizedEmail && Text(row, "globalRole") == "Viewer" &&
        IsExactCrstSyntheticAccount(row) &&
        Text(row, "status") == "Active" && Bool(row, "forcePasswordChange", false) &&
        !string.IsNullOrWhiteSpace(Text(row, "passwordHash")) && !string.IsNullOrWhiteSpace(Text(row, "_etag"));
    bool SafeMembership(JsonObject row) => expectedMembershipIds.TryGetValue(Text(row, "tenantUid"), out var expectedId) &&
        Text(row, "id") == expectedId && Text(row, "membershipId") == expectedId && Text(row, "role") == "Viewer" &&
        Text(row, "status") == "Active" && ExplicitFalse(row, "isPrimaryTenantAdmin") && !string.IsNullOrWhiteSpace(Text(row, "_etag"));
    bool SafeSnapshot(JsonObject row) => expectedSnapshotIds.TryGetValue(Text(row, "tenantUid"), out var expectedId) &&
        Text(row, "id") == expectedId && Text(row, "requestPartition") == Text(row, "tenantUid") &&
        Text(row, "status") == "Active" && primaryAdminBaselines.Any(baseline => baseline.TenantUid == Text(row, "tenantUid") &&
            baseline.MembershipId == Text(row, "primaryMembershipId") && baseline.UserId == Text(row, "primaryUserId")) &&
        !string.IsNullOrWhiteSpace(Text(row, "baselineMembershipEtag")) && !string.IsNullOrWhiteSpace(Text(row, "_etag"));
    if (legacyRows.Length > 1 || accountRows.Length > 1 || membershipRows.Length > fixtures.Length ||
        snapshotRows.Length > approvedFixtures.Length ||
        legacyUsers.Any(x => Text(x, "id") != legacyUserId && IdentitySecurityService.NormalizeEmail(Text(x, "email")) == normalizedEmail) ||
        accounts.Any(x => Text(x, "userId", Text(x, "id")) != userId && Text(x, "normalizedEmail") == normalizedEmail) ||
        legacyRows.Any(row => !SafeLegacy(row)) || accountRows.Any(row => !SafeAccount(row)) ||
        membershipRows.Any(row => !SafeMembership(row)) || snapshotRows.Any(row => !SafeSnapshot(row)))
        throw new InvalidOperationException("synthetic partial creation contains an ambiguous, unrelated, or unsafe artifact");

    CredentialHandoffState? credentialHandoff = File.Exists(credentialPath)
        ? await ReadActiveCredentialHandoffAsync(credentialPath, output, userId, email)
        : null;
    var partialDataPresent = legacyRows.Length + accountRows.Length + membershipRows.Length + snapshotRows.Length > 0;
    var legacy = database.GetContainer("User");
    var accountContainer = database.GetContainer("UserAccounts");
    var membershipContainer = database.GetContainer("TenantMemberships");
    if (credentialHandoff is null && partialDataPresent)
    {
        async Task DeleteOwnedAsync(Container container, JsonObject row, PartitionKey partition)
        {
            await adminInvariantLease.EnsureOwnedAsync();
            await container.DeleteItemAsync<object>(Text(row, "id"), partition,
                new ItemRequestOptions { IfMatchEtag = Text(row, "_etag") });
        }
        foreach (var snapshot in snapshotRows) await DeleteOwnedAsync(requestContainer, snapshot, new(Text(snapshot, "tenantUid")));
        foreach (var membership in membershipRows) await DeleteOwnedAsync(membershipContainer, membership, new(Text(membership, "tenantUid")));
        foreach (var account in accountRows) await DeleteOwnedAsync(accountContainer, account, new("global"));
        foreach (var legacyRow in legacyRows) await DeleteOwnedAsync(legacy, legacyRow, new(primaryLegacyTenantId));
        legacyRows = [];
        accountRows = [];
        membershipRows = [];
        snapshotRows = [];
        await auditContainer.UpsertItemAsync(new
        {
            id = $"crst-synthetic-create-compensated-{userId}", auditPartition = "global",
            eventType = "identity_synthetic_validation_creation_partial_compensated", actorRole = "system",
            targetUserId = userId, requestId = "V2.8.63CRST", result = "success", createdAt = DateTime.UtcNow
        }, new("global"));
    }
    credentialHandoff ??= await CreateActiveCredentialHandoffAsync(credentialPath, output, userId, email,
        CreateTemporaryPassword(), DateTime.UtcNow);
    var password = credentialHandoff.TemporaryPassword;
    var existingHashes = legacyRows.Select(row => Text(row, "passwordHash"))
        .Concat(accountRows.Select(row => Text(row, "passwordHash"))).Distinct(StringComparer.Ordinal).ToArray();
    if (existingHashes.Length > 1 || existingHashes.Any(hash => !BCrypt.Net.BCrypt.Verify(password, hash)))
        throw new InvalidOperationException("synthetic partial creation password does not match its restricted handoff");
    var passwordHash = existingHashes.SingleOrDefault() ?? BCrypt.Net.BCrypt.HashPassword(password, 12);
    var markerForHandoff = (await ReadAllAsync("IdentityRequests")).Single(x =>
        Text(x, "id") == creationMarkerId && Text(x, "requestPartition") == "global");
    await requestContainer.PatchItemAsync<object>(creationMarkerId, new("global"),
        [PatchOperation.Set("/handoffSha256", credentialHandoff.ContentSha256), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
        new PatchItemRequestOptions { IfMatchEtag = Text(markerForHandoff, "_etag") });
    var timestamp = DateTime.UtcNow;
    try
    {
        if (legacyRows.Length == 0)
        {
            await adminInvariantLease.EnsureOwnedAsync();
            await legacy.CreateItemAsync(new
            {
                id = legacyUserId, tenantId = primaryLegacyTenantId, email, username = "crst-validation",
                passwordHash, firstName = "CRST", lastName = "Validation", role = (int)UserRole.Viewer,
                isActive = true, createdDate = timestamp, lastLogin = (DateTime?)null,
                permissions = Array.Empty<string>()
            }, new(primaryLegacyTenantId));
        }
        if (accountRows.Length == 0)
        {
            await adminInvariantLease.EnsureOwnedAsync();
            await accountContainer.CreateItemAsync(new
            {
                id = userId, identityPartition = "global", userId, legacyUserId,
                legacyTenantId = primaryLegacyTenantId, loginEmail = email, normalizedEmail, passwordHash,
                globalRole = "Viewer", status = "Active", emailVerified = false,
                isSyntheticValidation = true, syntheticValidationId = "V2.8.63CRST",
                forcePasswordChange = true, securityStamp = Guid.NewGuid().ToString("N"),
                sessionVersion = 1, failedLoginCount = 0, createdAt = timestamp, updatedAt = timestamp
            }, new("global"));
        }
        foreach (var fixture in fixtures.Where(fixture => membershipRows.All(row => Text(row, "tenantUid") != fixture.TenantUid)))
        {
            await adminInvariantLease.EnsureOwnedAsync();
            var membershipId = expectedMembershipIds[fixture.TenantUid];
            await membershipContainer.CreateItemAsync(new
            {
                id = membershipId, membershipId, tenantUid = fixture.TenantUid,
                userId, role = "Viewer", permissions = Array.Empty<string>(), status = fixture.MembershipStatus,
                isPrimaryTenantAdmin = false, createdByUserId = "crst-operator", createdAt = timestamp, updatedAt = timestamp
            }, new(fixture.TenantUid));
        }
        foreach (var baseline in primaryAdminBaselines)
        {
            if (snapshotRows.Any(row => Text(row, "tenantUid") == baseline.TenantUid)) continue;
            await adminInvariantLease.EnsureOwnedAsync();
            var snapshotId = expectedSnapshotIds[baseline.TenantUid];
            await requestContainer.CreateItemAsync(new
            {
                id = snapshotId, requestPartition = baseline.TenantUid, type = "SyntheticPrimaryAdminSnapshot",
                syntheticUserId = userId, tenantUid = baseline.TenantUid, legacyTenantId = baseline.LegacyTenantId,
                primaryMembershipId = baseline.MembershipId, primaryUserId = baseline.UserId,
                baselineMembershipEtag = baseline.Etag, status = "Active", createdAt = timestamp, updatedAt = timestamp
            }, new(baseline.TenantUid));
        }
        var finalLegacy = (await ReadAllAsync("User")).Where(x => Text(x, "id") == legacyUserId).ToArray();
        var finalAccounts = (await ReadAllAsync("UserAccounts")).Where(x => Text(x, "userId") == userId).ToArray();
        var finalMemberships = (await ReadAllAsync("TenantMemberships")).Where(x => Text(x, "userId") == userId).ToArray();
        var finalSnapshots = (await ReadAllAsync("IdentityRequests")).Where(x =>
            Text(x, "type") == "SyntheticPrimaryAdminSnapshot" && Text(x, "syntheticUserId") == userId).ToArray();
        if (finalLegacy.Length != 1 || finalAccounts.Length != 1 || !SafeLegacy(finalLegacy[0]) || !SafeAccount(finalAccounts[0]) ||
            finalMemberships.Length != fixtures.Length || finalMemberships.Any(row => !SafeMembership(row)) ||
            finalSnapshots.Length != approvedFixtures.Length || finalSnapshots.Any(row => !SafeSnapshot(row)) ||
            Text(finalLegacy[0], "passwordHash") != Text(finalAccounts[0], "passwordHash") ||
            !BCrypt.Net.BCrypt.Verify(password, Text(finalAccounts[0], "passwordHash")))
            throw new InvalidOperationException("synthetic creation paired readback failed");

        await auditContainer.UpsertItemAsync(new
        {
            id = creationAuditId, auditPartition = "global",
            eventType = "identity_synthetic_validation_created", actorRole = "system",
            targetUserId = userId, targetTenantUid = primaryTenantUid, requestId = "V2.8.63CRST",
            result = "success", fixtureCount = fixtures.Length, creationMarkerId,
            handoffSha256 = credentialHandoff.ContentSha256, createdAt = markerTimestamp, finalizedAt = DateTime.UtcNow
        }, new("global"));
        var markerToComplete = (await ReadAllAsync("IdentityRequests")).Single(x =>
            Text(x, "id") == creationMarkerId && Text(x, "requestPartition") == "global");
        await requestContainer.PatchItemAsync<object>(creationMarkerId, new("global"),
            [PatchOperation.Set("/status", "Completed"), PatchOperation.Set("/completedAt", DateTime.UtcNow),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(markerToComplete, "_etag") });
        var creationReconciliations = (await ReadAllAsync("IdentityMigration")).Where(x =>
            Text(x, "id") == $"crst-synthetic-create-reconcile-{userId}" &&
            Text(x, "type") == "IdentitySecurityMutationReconciliation" && Text(x, "status") == "Pending").ToArray();
        foreach (var reconciliation in creationReconciliations)
            await database.GetContainer("IdentityMigration").PatchItemAsync<object>(Text(reconciliation, "id"), new("global"),
                [PatchOperation.Set("/status", "Resolved"), PatchOperation.Set("/resolvedAt", DateTime.UtcNow)],
                new PatchItemRequestOptions { IfMatchEtag = Text(reconciliation, "_etag") });
        await WriteJsonAsync(Path.Combine(output, "synthetic-identity.json"), new
        {
            syntheticUserId = userId, legacyUserId, primaryLegacyTenantId, primaryTenantUid,
            creationMarkerId, creationResumable = true, pendingMarkerDurable, pendingAuditDurable,
            membershipFixtures = fixtures.Select(x => new
            {
                x.Purpose, x.LegacyTenantId, x.TenantUid,
                membershipId = SafeDigest("membership", x.TenantUid, userId)[..32],
                role = "Viewer", status = x.MembershipStatus, isPrimaryTenantAdmin = false
            }).ToArray(),
            primaryAdminSnapshots = primaryAdminBaselines.Select(x => new
            {
                x.LegacyTenantId, x.TenantUid, primaryMembershipDigest = SafeDigest(x.MembershipId),
                primaryUserDigest = SafeDigest(x.UserId)
            }).ToArray(),
            normalizedEmailDigest = SafeDigest(normalizedEmail), handoffDigest = credentialHandoff.ContentSha256,
            forcePasswordChange = true,
            passwordFingerprint = SafeDigest(passwordHash), createdAt = timestamp
        });
    }
    catch (Exception creationError)
    {
        try
        {
            await database.GetContainer("IdentityMigration").UpsertItemAsync(new
            {
                id = $"crst-synthetic-create-reconcile-{userId}", migrationPartition = "global",
                type = "IdentitySecurityMutationReconciliation", targetUserId = userId,
                mutationType = "V2.8.63CRST-synthetic-create", errorCode = creationError.GetType().Name,
                status = "Pending", createdAt = DateTime.UtcNow
            }, new("global"));
        }
        catch { }
        try
        {
            var marker = (await ReadAllAsync("IdentityRequests")).SingleOrDefault(x =>
                Text(x, "id") == creationMarkerId && Text(x, "requestPartition") == "global");
            if (marker is not null)
                await requestContainer.PatchItemAsync<object>(creationMarkerId, new("global"),
                    [PatchOperation.Set("/status", "Pending"), PatchOperation.Set("/lastFailureCode", creationError.GetType().Name),
                     PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
                    new PatchItemRequestOptions { IfMatchEtag = Text(marker, "_etag") });
        }
        catch { }
        throw;
    }
    Console.WriteLine(JsonSerializer.Serialize(new
    {
        status = "synthetic_created", syntheticUserId = userId, primaryTenantUid,
        membershipCount = fixtures.Length, creationMarkerId
    }));
}

async Task SyntheticVerifyAsync()
{
    const string legacyUserId = "crst-synthetic-validation-user";
    const string email = "pumpkin-crst-validation@example.invalid";
    string normalizedEmail = IdentitySecurityService.NormalizeEmail(email);
    string userId = SafeDigest("user", legacyUserId, normalizedEmail)[..32];
    var fixtures = ResolveSyntheticTenantFixtures(await ReadAllAsync("TenantIdentity"))
        .Where(x => x.Purpose is "home" or "switch-target").ToArray();
    if (fixtures.Length != 2) throw new InvalidOperationException("synthetic initial fixture count is not exactly two");
    var legacy = (await ReadAllAsync("User")).SingleOrDefault(x => Text(x, "id") == legacyUserId);
    var account = (await ReadAllAsync("UserAccounts")).SingleOrDefault(x => Text(x, "userId") == userId);
    var memberships = (await ReadAllAsync("TenantMemberships")).Where(x => Text(x, "userId") == userId).ToArray();
    var membershipStatesExact = memberships.Length == fixtures.Length && fixtures.All(fixture =>
    {
        var expectedId = SafeDigest("membership", fixture.TenantUid, userId)[..32];
        var matches = memberships.Where(x => Text(x, "tenantUid") == fixture.TenantUid).ToArray();
        return matches.Length == 1 &&
            Text(matches[0], "id") == expectedId && Text(matches[0], "membershipId") == expectedId &&
            string.Equals(Text(matches[0], "role"), "Viewer", StringComparison.Ordinal) &&
            string.Equals(Text(matches[0], "status"), fixture.MembershipStatus, StringComparison.Ordinal) &&
            ExplicitFalse(matches[0], "isPrimaryTenantAdmin");
    });
    var result = new
    {
        syntheticUserId = userId, legacyPresent = legacy is not null, accountPresent = account is not null,
        passwordFingerprintEqual = legacy is not null && account is not null && SafeDigest(Text(legacy, "passwordHash")) == SafeDigest(Text(account, "passwordHash")),
        loginEmailEqual = legacy is not null && account is not null && string.Equals(Text(legacy, "email"), Text(account, "loginEmail"), StringComparison.Ordinal),
        normalizedEmailLinked = legacy is not null && account is not null &&
            IdentitySecurityService.NormalizeEmail(Text(legacy, "email")) == normalizedEmail &&
            IdentitySecurityService.NormalizeEmail(Text(account, "loginEmail")) == normalizedEmail &&
            Text(account, "normalizedEmail") == normalizedEmail,
        accountStatus = account is null ? "missing" : Text(account, "status"),
        accountGlobalRole = account is null ? "missing" : Text(account, "globalRole"),
        syntheticClassificationExact = account is not null && IsExactCrstSyntheticAccount(account),
        legacyRole = legacy is null ? "missing" : Role(legacy),
        forcePasswordChange = account is not null && Bool(account, "forcePasswordChange", false),
        sessionVersion = account is null ? 0 : Number(account, "sessionVersion", 0),
        membershipStatesExact,
        memberships = fixtures.Select(fixture => new
        {
            fixture.Purpose, fixture.LegacyTenantId, fixture.TenantUid,
            membershipId = SafeDigest("membership", fixture.TenantUid, userId)[..32],
            role = "Viewer", status = fixture.MembershipStatus, isPrimaryTenantAdmin = false
        }).ToArray()
    };
    await WriteJsonAsync(Path.Combine(output, "synthetic-verification.json"), result);
    if (!result.legacyPresent || !result.accountPresent || !result.passwordFingerprintEqual || !result.loginEmailEqual || !result.normalizedEmailLinked ||
        legacy is null || !Bool(legacy, "isActive", false) || Text(legacy, "tenantId") != "party-pros-philadelphia" ||
        account is null || Text(account, "legacyUserId") != legacyUserId || Text(account, "legacyTenantId") != "party-pros-philadelphia" ||
        !string.Equals(result.accountStatus, "Active", StringComparison.Ordinal) || result.accountGlobalRole != "Viewer" ||
        !result.syntheticClassificationExact ||
        result.legacyRole != "Viewer" || !result.forcePasswordChange || result.sessionVersion < 1 ||
        string.IsNullOrWhiteSpace(Text(account, "securityStamp")) || !result.membershipStatesExact)
        throw new InvalidOperationException("synthetic validation identity verification failed");
    Console.WriteLine(JsonSerializer.Serialize(new { status = "synthetic_verified", result.legacyPresent, result.accountPresent, membershipCount = result.memberships.Length }));
}

async Task SyntheticSwitchFixtureStatusAsync()
{
    const string legacyUserId = "crst-synthetic-validation-user";
    const string email = "pumpkin-crst-validation@example.invalid";
    var requestedStatus = Option("--status") ?? throw new ArgumentException("--status is required");
    var status = requestedStatus.Equals("Active", StringComparison.OrdinalIgnoreCase) ? "Active" :
        requestedStatus.Equals("Suspended", StringComparison.OrdinalIgnoreCase) ? "Suspended" :
        throw new ArgumentException("--status must be Active or Suspended");
    await using var adminInvariantLease = await AcquireToolAdminInvariantLeaseAsync("V2.8.63CRST-switch-fixture-status");
    string normalizedEmail = IdentitySecurityService.NormalizeEmail(email);
    string userId = SafeDigest("user", legacyUserId, normalizedEmail)[..32];
    var fixture = ResolveSyntheticTenantFixtures(await ReadAllAsync("TenantIdentity"))
        .Single(x => x.Purpose == "switch-target");
    var expectedMembershipId = SafeDigest("membership", fixture.TenantUid, userId)[..32];
    var reconciliationId = $"crst-synthetic-switch-fixture-reconcile-{status.ToLowerInvariant()}-{userId}";
    var matches = (await ReadAllAsync("TenantMemberships")).Where(x =>
        Text(x, "userId") == userId && Text(x, "tenantUid") == fixture.TenantUid).ToArray();
    if (matches.Length != 1 || Text(matches[0], "id") != expectedMembershipId ||
        Text(matches[0], "membershipId") != expectedMembershipId ||
        !string.Equals(Text(matches[0], "role"), "Viewer", StringComparison.Ordinal) ||
        !ExplicitFalse(matches[0], "isPrimaryTenantAdmin"))
        throw new InvalidOperationException("synthetic switch fixture is missing, ambiguous, elevated, or outside its deterministic boundary");
    if (Text(matches[0], "status") is not ("Active" or "Suspended"))
        throw new InvalidOperationException("synthetic switch fixture has an unsafe source status");

    var accountMatches = (await ReadAllAsync("UserAccounts")).Where(x => Text(x, "userId") == userId).ToArray();
    if (accountMatches.Length != 1 || Text(accountMatches[0], "id") != userId ||
        Text(accountMatches[0], "identityPartition") != "global" || Text(accountMatches[0], "legacyUserId") != legacyUserId ||
        Text(accountMatches[0], "status") != "Active" || Text(accountMatches[0], "globalRole") != "Viewer" ||
        Text(accountMatches[0], "normalizedEmail") != normalizedEmail || !IsExactCrstSyntheticAccount(accountMatches[0]) ||
        Number(accountMatches[0], "sessionVersion", 0) < 1 ||
        string.IsNullOrWhiteSpace(Text(accountMatches[0], "securityStamp")))
        throw new InvalidOperationException("synthetic switch fixture account is missing, ambiguous, inactive, elevated, or unversioned");

    var account = accountMatches[0];
    var previousMembershipStatus = Text(matches[0], "status");
    var previousSessionVersion = Number(account, "sessionVersion", 0);
    var timestamp = DateTime.UtcNow;
    var statusTransitioned = previousMembershipStatus != status;
    var accountSessionVersionBumped = false;
    var membershipStatusUpdated = false;
    var failureStage = "none";
    var nextSessionVersion = previousSessionVersion;
    var nextSecurityStamp = Text(account, "securityStamp");
    var accountContainer = database.GetContainer("UserAccounts");
    var membershipContainer = database.GetContainer("TenantMemberships");
    var auditContainer = database.GetContainer("SecurityAuditEvents");

    if (statusTransitioned)
    {
        nextSessionVersion = checked(previousSessionVersion + 1);
        nextSecurityStamp = Guid.NewGuid().ToString("N");
        try
        {
            failureStage = "account-session-invalidation";
            await adminInvariantLease.EnsureOwnedAsync();
            await accountContainer.PatchItemAsync<object>(userId, new("global"),
                [PatchOperation.Set("/sessionVersion", nextSessionVersion), PatchOperation.Set("/securityStamp", nextSecurityStamp),
                 PatchOperation.Set("/fixtureAuthorizationChangedBy", "crst-operator"),
                 PatchOperation.Set("/fixtureAuthorizationChangedAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)]);
            accountSessionVersionBumped = true;
            var invalidatedAccount = (await ReadAllAsync("UserAccounts")).Single(x => Text(x, "userId") == userId);
            if (Text(invalidatedAccount, "status") != "Active" || Text(invalidatedAccount, "globalRole") != "Viewer" ||
                !IsExactCrstSyntheticAccount(invalidatedAccount) ||
                Number(invalidatedAccount, "sessionVersion", 0) != nextSessionVersion ||
                Text(invalidatedAccount, "securityStamp") != nextSecurityStamp)
                throw new InvalidOperationException("synthetic switch fixture account invalidation readback failed");

            failureStage = "membership-status-update";
            await adminInvariantLease.EnsureOwnedAsync();
            await membershipContainer.PatchItemAsync<object>(expectedMembershipId, new(fixture.TenantUid),
                [PatchOperation.Set("/status", status), PatchOperation.Set("/fixtureStatusChangedBy", "crst-operator"),
                 PatchOperation.Set("/fixtureStatusChangedAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)]);
            membershipStatusUpdated = true;
            failureStage = "paired-readback";
            var readbackMembership = (await ReadAllAsync("TenantMemberships")).Single(x =>
                Text(x, "userId") == userId && Text(x, "tenantUid") == fixture.TenantUid);
            var readbackAccount = (await ReadAllAsync("UserAccounts")).Single(x => Text(x, "userId") == userId);
            if (Text(readbackMembership, "id") != expectedMembershipId || Text(readbackMembership, "status") != status ||
                Text(readbackMembership, "role") != "Viewer" || !ExplicitFalse(readbackMembership, "isPrimaryTenantAdmin") ||
                Text(readbackAccount, "status") != "Active" || Text(readbackAccount, "globalRole") != "Viewer" ||
                !IsExactCrstSyntheticAccount(readbackAccount) ||
                Number(readbackAccount, "sessionVersion", 0) != nextSessionVersion ||
                Text(readbackAccount, "securityStamp") != nextSecurityStamp)
                throw new InvalidOperationException("synthetic switch fixture paired readback failed");
        }
        catch (Exception transitionError)
        {
            try
            {
                await database.GetContainer("IdentityMigration").UpsertItemAsync(new
                {
                    id = reconciliationId, migrationPartition = "global",
                    type = "IdentitySecurityMutationReconciliation", targetUserId = userId,
                    targetTenantUid = fixture.TenantUid, membershipId = expectedMembershipId,
                    mutationType = "V2.8.63CRST-synthetic-switch-fixture-status",
                    requestedMembershipStatus = status, previousMembershipStatus,
                    accountSessionVersionBumped, membershipStatusUpdated, failureStage,
                    errorCode = transitionError.GetType().Name, status = "Pending",
                    createdAt = timestamp, updatedAt = DateTime.UtcNow
                }, new("global"));
            }
            catch { }
            try
            {
                await auditContainer.UpsertItemAsync(new
                {
                    id = reconciliationId, auditPartition = "global",
                    eventType = "identity_synthetic_switch_fixture_reconciliation_required", actorRole = "system",
                    targetUserId = userId, targetTenantUid = fixture.TenantUid, requestId = "V2.8.63CRST",
                    result = "failed_closed", membershipId = expectedMembershipId,
                    requestedMembershipStatus = status, previousMembershipStatus,
                    accountSessionVersionBumped, membershipStatusUpdated, failureStage,
                    failureType = transitionError.GetType().Name, createdAt = timestamp, updatedAt = DateTime.UtcNow
                }, new("global"));
            }
            catch { }
            try
            {
                await WriteJsonAsync(Path.Combine(output, $"synthetic-switch-fixture-{status.ToLowerInvariant()}-reconciliation.json"), new
                {
                    syntheticUserId = userId, fixture.Purpose, fixture.LegacyTenantId, fixture.TenantUid,
                    membershipId = expectedMembershipId, requestedMembershipStatus = status, previousMembershipStatus,
                    accountSessionVersionBumped, membershipStatusUpdated, failureStage,
                    failureType = transitionError.GetType().Name, failedClosed = true, reconciliationRequired = true,
                    attemptedAt = timestamp
                });
            }
            catch { }
            throw new InvalidOperationException($"synthetic switch fixture transition failed closed at {failureStage}; reconciliation is required", transitionError);
        }
    }

    await adminInvariantLease.EnsureOwnedAsync();
    var finalMembershipRows = (await ReadAllAsync("TenantMemberships")).Where(x =>
        Text(x, "userId") == userId && Text(x, "tenantUid") == fixture.TenantUid).ToArray();
    var finalAccountRows = (await ReadAllAsync("UserAccounts")).Where(x => Text(x, "userId") == userId).ToArray();
    if (finalMembershipRows.Length != 1 || finalAccountRows.Length != 1 ||
        Text(finalMembershipRows[0], "id") != expectedMembershipId ||
        Text(finalMembershipRows[0], "membershipId") != expectedMembershipId ||
        Text(finalMembershipRows[0], "status") != status || Text(finalMembershipRows[0], "role") != "Viewer" ||
        !ExplicitFalse(finalMembershipRows[0], "isPrimaryTenantAdmin") ||
        Text(finalAccountRows[0], "id") != userId || Text(finalAccountRows[0], "status") != "Active" ||
        Text(finalAccountRows[0], "globalRole") != "Viewer" || !IsExactCrstSyntheticAccount(finalAccountRows[0]) ||
        Number(finalAccountRows[0], "sessionVersion", 0) != nextSessionVersion ||
        Text(finalAccountRows[0], "securityStamp") != nextSecurityStamp)
        throw new InvalidOperationException("synthetic switch fixture final reconciliation readback failed");
    await ResolveSyntheticSwitchFixtureReconciliationAsync(
        reconciliationId, userId, fixture.TenantUid, expectedMembershipId, status);

    failureStage = "complete";
    await auditContainer.UpsertItemAsync(new
    {
        id = $"crst-synthetic-switch-fixture-{status.ToLowerInvariant()}-{userId}", auditPartition = "global",
        eventType = "identity_synthetic_switch_fixture_status_changed", actorRole = "system",
        targetUserId = userId, targetTenantUid = fixture.TenantUid, requestId = "V2.8.63CRST",
        result = statusTransitioned ? "success" : "no_op_already_in_requested_state",
        previousMembershipStatus, membershipStatus = status, statusTransitioned,
        accountSessionVersionBumped, previousSessionVersion, sessionVersion = nextSessionVersion,
        freshLoginRequired = statusTransitioned, createdAt = timestamp
    }, new("global"));
    await WriteJsonAsync(Path.Combine(output, $"synthetic-switch-fixture-{status.ToLowerInvariant()}.json"), new
    {
        syntheticUserId = userId, fixture.Purpose, fixture.LegacyTenantId, fixture.TenantUid,
        membershipId = expectedMembershipId, membershipRole = "Viewer", previousMembershipStatus,
        membershipStatus = status, statusTransitioned, isPrimaryTenantAdmin = false,
        accountStatus = "Active", accountGlobalRole = "Viewer", accountSessionVersionBumped,
        previousSessionVersion, sessionVersion = nextSessionVersion, freshLoginRequired = statusTransitioned,
        changedAt = timestamp
    });
    Console.WriteLine(JsonSerializer.Serialize(new
    {
        status = statusTransitioned ? "synthetic_switch_fixture_status_changed" : "synthetic_switch_fixture_status_unchanged",
        syntheticUserId = userId, membershipStatus = status, accountSessionVersionBumped,
        freshLoginRequired = statusTransitioned
    }));
}

async Task SyntheticContactSnapshotAsync()
{
    const string legacyUserId = "crst-synthetic-validation-user";
    const string email = "pumpkin-crst-validation@example.invalid";
    var requestedTenant = Option("--tenant") ?? throw new ArgumentException("--tenant is required");
    string normalizedEmail = IdentitySecurityService.NormalizeEmail(email);
    string userId = SafeDigest("user", legacyUserId, normalizedEmail)[..32];
    var fixture = ResolveSyntheticTenantFixtures(await ReadAllAsync("TenantIdentity"))
        .SingleOrDefault(x => string.Equals(x.LegacyTenantId, requestedTenant, StringComparison.Ordinal)) ;
    if (string.IsNullOrWhiteSpace(fixture.TenantUid))
        throw new InvalidOperationException("synthetic contact snapshot tenant is not an exact approved non-Airstrip tenant");
    var accounts = (await ReadAllAsync("UserAccounts")).Where(x => Text(x, "userId") == userId).ToArray();
    if (accounts.Length != 1 || Text(accounts[0], "status") != "Active" || Text(accounts[0], "globalRole") != "Viewer" ||
        !IsExactCrstSyntheticAccount(accounts[0]))
        throw new InvalidOperationException("synthetic contact snapshot identity is unavailable, inactive, or elevated");

    var contacts = (await ReadAllAsync("TenantContactSettings")).Where(x =>
        Text(x, "tenantUid") == fixture.TenantUid && Text(x, "id") == fixture.TenantUid).ToArray();
    if (contacts.Length != 1 || string.IsNullOrWhiteSpace(Text(contacts[0], "_etag")))
        throw new InvalidOperationException("synthetic contact snapshot source is missing or ambiguous");
    var baselineDocument = ContactUserDocument(contacts[0]);
    var syntheticRecipientState = SyntheticContactRecipientState(baselineDocument, normalizedEmail);
    if (syntheticRecipientState.Count != 0)
        throw new InvalidOperationException("synthetic contact recipient already exists before the Stage 5 snapshot");
    var baselineDigest = SafeDigest(baselineDocument.ToJsonString());
    var snapshotId = $"crst-contact-snapshot-{fixture.TenantUid}-{userId}";
    var existingSnapshots = (await ReadAllAsync("IdentityRequests")).Where(x =>
        Text(x, "id") == snapshotId ||
        Text(x, "type") == "SyntheticContactSettingsSnapshot" && Text(x, "syntheticUserId") == userId).ToArray();
    if (existingSnapshots.Length != 0)
        throw new InvalidOperationException("synthetic contact snapshot already exists; it cannot be replaced after Stage 5 may have started");

    var timestamp = DateTime.UtcNow;
    await database.GetContainer("IdentityRequests").CreateItemAsync(new
    {
        id = snapshotId, requestPartition = fixture.TenantUid, type = "SyntheticContactSettingsSnapshot",
        syntheticUserId = userId, tenantUid = fixture.TenantUid, legacyTenantId = fixture.LegacyTenantId,
        syntheticNormalizedEmail = normalizedEmail, baselineEtag = Text(contacts[0], "_etag"),
        baselineDigest, baselineDocument, status = "Active", createdAt = timestamp, updatedAt = timestamp
    }, new(fixture.TenantUid));
    await database.GetContainer("SecurityAuditEvents").UpsertItemAsync(new
    {
        id = $"crst-synthetic-contact-snapshot-{fixture.TenantUid}-{userId}", auditPartition = "global",
        eventType = "identity_synthetic_contact_snapshot_created", actorRole = "system",
        targetUserId = userId, targetTenantUid = fixture.TenantUid, requestId = "V2.8.63CRST",
        result = "success", baselineDigest, createdAt = timestamp
    }, new("global"));
    await WriteJsonAsync(Path.Combine(output, "synthetic-contact-snapshot.json"), new
    {
        syntheticUserId = userId, fixture.LegacyTenantId, fixture.TenantUid, snapshotId,
        baselineDigest, exactCustomerSnapshotStoredInIdentityRequests = true,
        containsCustomerValues = false, capturedAt = timestamp
    });
    Console.WriteLine(JsonSerializer.Serialize(new
    {
        status = "synthetic_contact_snapshot_created", syntheticUserId = userId,
        fixture.LegacyTenantId, fixture.TenantUid, snapshotId
    }));
}

async Task SyntheticCleanupAsync()
{
    const string legacyUserId = "crst-synthetic-validation-user";
    const string email = "pumpkin-crst-validation@example.invalid";
    const string primaryTenant = "party-pros-philadelphia";
    string normalizedEmail = IdentitySecurityService.NormalizeEmail(email);
    string userId = SafeDigest("user", legacyUserId, normalizedEmail)[..32];
    var credentialOutput = Option("--credential-output") ?? throw new ArgumentException("--credential-output is required");
    var credentialHandoffState = await ReadCredentialHandoffForCleanupAsync(credentialOutput, output, userId, email);
    var credentialHandoff = credentialHandoffState.ActiveState;
    await using var adminInvariantLease = await AcquireToolAdminInvariantLeaseAsync("V2.8.63CRST-synthetic-cleanup");

    var fixtures = ResolveSyntheticTenantFixtures(await ReadAllAsync("TenantIdentity"));
    var requiredFixtureTenantUids = fixtures.Where(x => x.Purpose is "home" or "switch-target")
        .Select(x => x.TenantUid).ToHashSet(StringComparer.Ordinal);
    var optionalStage4TenantUid = fixtures.Single(x => x.Purpose == "stage4-add-target").TenantUid;
    var requests = await ReadAllAsync("IdentityRequests");
    var allAccounts = await ReadAllAsync("UserAccounts");
    var allMemberships = await ReadAllAsync("TenantMemberships");
    var memberships = allMemberships.Where(x => Text(x, "userId") == userId).ToArray();
    var expectedTenantUids = fixtures.Select(x => x.TenantUid).ToHashSet(StringComparer.Ordinal);
    if (!credentialHandoffState.Active)
    {
        var resumeLegacy = (await ReadAllAsync("User")).Where(x => Text(x, "id") == legacyUserId).ToArray();
        var resumeAccounts = allAccounts.Where(x => Text(x, "userId") == userId).ToArray();
        var resumeAudits = await ReadAllAsync("SecurityAuditEvents");
        var resumePrimarySnapshots = requests.Where(x => Text(x, "type") == "SyntheticPrimaryAdminSnapshot" &&
            Text(x, "syntheticUserId") == userId && Text(x, "status") == "Restored").ToArray();
        var resumeCreationMarkers = requests.Where(x => Text(x, "id") == $"crst-synthetic-create-marker-{userId}" &&
            Text(x, "type") == "SyntheticCreationOperation" && Text(x, "syntheticUserId") == userId &&
            Text(x, "syntheticValidationId") == "V2.8.63CRST" &&
            Text(x, "status") == "Completed" && !string.IsNullOrWhiteSpace(Text(x, "handoffSha256"))).ToArray();
        var resumeContactSnapshots = requests.Where(x => Text(x, "type") == "SyntheticContactSettingsSnapshot" &&
            Text(x, "syntheticUserId") == userId).ToArray();
        var resumeSessions = requests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
        var resumeSyntheticEmails = new HashSet<string>(StringComparer.Ordinal) { normalizedEmail };
        if (resumeLegacy.Length == 1) resumeSyntheticEmails.Add(IdentitySecurityService.NormalizeEmail(Text(resumeLegacy[0], "email")));
        if (resumeAccounts.Length == 1) resumeSyntheticEmails.Add(IdentitySecurityService.NormalizeEmail(Text(resumeAccounts[0], "loginEmail")));
        var resumePendingInvitations = requests.Where(x => Text(x, "type") == "UserInvitation" &&
            resumeSyntheticEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending").ToArray();
        var exactRevokedMemberships = memberships.Length is 2 or 3 && memberships.All(membership =>
            expectedTenantUids.Contains(Text(membership, "tenantUid")) &&
            Text(membership, "id") == SafeDigest("membership", Text(membership, "tenantUid"), userId)[..32] &&
            Text(membership, "status") == "Revoked" && ExplicitFalse(membership, "isPrimaryTenantAdmin"));
        var exactDisabledIdentity = resumeLegacy.Length == 1 && resumeAccounts.Length == 1 &&
            !Bool(resumeLegacy[0], "isActive", true) && Text(resumeAccounts[0], "status") == "Suspended" &&
            IsExactCrstSyntheticAccount(resumeAccounts[0]) &&
            !string.IsNullOrWhiteSpace(Text(resumeLegacy[0], "passwordHash")) &&
            Text(resumeLegacy[0], "passwordHash") == Text(resumeAccounts[0], "passwordHash");
        var snapshotsFinalized = resumePrimarySnapshots.Length == fixtures.Length && resumeContactSnapshots.Length <= 1 &&
            resumeContactSnapshots.All(snapshot => Text(snapshot, "status") == "Restored" &&
                !snapshot.ContainsKey("baselineDocument") && !snapshot.ContainsKey("baselineEtag") &&
                !snapshot.ContainsKey("syntheticNormalizedEmail"));
        var auditsFinalized = resumeCreationMarkers.Length == 1 &&
            resumeAudits.Count(audit => Text(audit, "id") == $"crst-synthetic-created-{userId}" &&
                Text(audit, "result") == "success" &&
                Text(audit, "handoffSha256") == Text(resumeCreationMarkers[0], "handoffSha256")) == 1 &&
            resumeAudits.Count(audit => Text(audit, "id") == $"crst-synthetic-cleanup-pending-{userId}" &&
                Text(audit, "result") == "success") == 1 &&
            resumeAudits.Count(audit => Text(audit, "id") == $"crst-synthetic-cleaned-{userId}" &&
                Text(audit, "result") == "success") == 1;
        var allSessionsRevoked = resumeSessions.All(session => Text(session, "requestPartition") == userId &&
            !string.IsNullOrWhiteSpace(Text(session, "revokedAt")) &&
            Text(session, "revokedReason") == "V2.8.63CRST synthetic cleanup");
        if (!exactRevokedMemberships || !exactDisabledIdentity || !snapshotsFinalized || !auditsFinalized ||
            !allSessionsRevoked || resumePendingInvitations.Length != 0)
            throw new InvalidOperationException("inactive synthetic credential handoff is not backed by a complete cleanup state");
        await ResolveSyntheticCleanupReconciliationAsync(userId, $"crst-synthetic-cleanup-pending-{userId}");
        await WriteJsonAsync(Path.Combine(output, "synthetic-cleanup.json"), new
        {
            syntheticUserId = userId, resumedAfterCredentialInvalidation = true,
            membershipsRevoked = memberships.Length, accountDisabled = true, legacyUserDisabled = true,
            primaryTenantAdminsRestored = true, primaryAdminSnapshots = resumePrimarySnapshots.Length,
            contactSnapshotRedacted = resumeContactSnapshots.Length == 1,
            creationAuditPreserved = true, pendingAuditPreserved = true, cleanupAuditWritten = true,
            credentialHandoffInactive = true, resumedAt = DateTime.UtcNow
        });
        Console.WriteLine(JsonSerializer.Serialize(new { status = "synthetic_cleanup_already_complete", syntheticUserId = userId }));
        return;
    }
    var syntheticPrimaryMemberships = memberships.Where(x => Bool(x, "isPrimaryTenantAdmin", false)).ToArray();
    var unsafeAdminTransferState = syntheticPrimaryMemberships.Length > 1 ||
        memberships.Any(x => !ExplicitFalse(x, "isPrimaryTenantAdmin") && !Bool(x, "isPrimaryTenantAdmin", false)) ||
        syntheticPrimaryMemberships.Any(x => Text(x, "status") != "Active" || Text(x, "role") != "TenantAdmin") ||
        memberships.Length is < 2 or > 3 ||
        memberships.Any(x => !expectedTenantUids.Contains(Text(x, "tenantUid"))) ||
        requiredFixtureTenantUids.Any(tenantUid => memberships.Count(x => Text(x, "tenantUid") == tenantUid) != 1) ||
        memberships.Count(x => Text(x, "tenantUid") == optionalStage4TenantUid) > 1 ||
        memberships.Any(x => Text(x, "id") != SafeDigest("membership", Text(x, "tenantUid"), userId)[..32] ||
            Text(x, "membershipId") != SafeDigest("membership", Text(x, "tenantUid"), userId)[..32]) ||
        fixtures.Where(fixture => memberships.Any(x => Text(x, "tenantUid") == fixture.TenantUid)).Any(fixture =>
        {
            var activePrimaries = allMemberships.Where(x =>
                Text(x, "tenantUid") == fixture.TenantUid &&
                string.Equals(Text(x, "status"), "Active", StringComparison.OrdinalIgnoreCase) &&
                Bool(x, "isPrimaryTenantAdmin", false)).ToArray();
            return activePrimaries.Length != 1 ||
                !string.Equals(Text(activePrimaries[0], "role"), "TenantAdmin", StringComparison.OrdinalIgnoreCase);
        });
    if (unsafeAdminTransferState)
        throw new InvalidOperationException("synthetic cleanup blocked: unsafe TenantAdmin-transfer state");
    var primarySnapshots = requests.Where(x => Text(x, "type") == "SyntheticPrimaryAdminSnapshot" &&
        Text(x, "syntheticUserId") == userId).ToArray();
    if (primarySnapshots.Length != fixtures.Length)
        throw new InvalidOperationException("synthetic cleanup blocked: original primary TenantAdmin snapshots are missing or ambiguous");
    var primaryRestorePlans = new List<(JsonObject Snapshot, JsonObject Baseline, JsonObject CurrentPrimary)>();
    foreach (var fixture in fixtures)
    {
        var snapshots = primarySnapshots.Where(x => Text(x, "tenantUid") == fixture.TenantUid &&
            Text(x, "requestPartition") == fixture.TenantUid).ToArray();
        if (snapshots.Length != 1 || Text(snapshots[0], "status") is not ("Active" or "Restored") ||
            string.IsNullOrWhiteSpace(Text(snapshots[0], "_etag")))
            throw new InvalidOperationException("synthetic cleanup blocked: primary TenantAdmin snapshot integrity failed");
        var baselineMembershipId = Text(snapshots[0], "primaryMembershipId");
        var baselineUserId = Text(snapshots[0], "primaryUserId");
        var baselineRows = allMemberships.Where(x => Text(x, "tenantUid") == fixture.TenantUid &&
            Text(x, "id") == baselineMembershipId && Text(x, "membershipId") == baselineMembershipId &&
            Text(x, "userId") == baselineUserId).ToArray();
        var currentPrimaries = allMemberships.Where(x => Text(x, "tenantUid") == fixture.TenantUid &&
            Text(x, "status") == "Active" && Text(x, "role") == "TenantAdmin" &&
            Bool(x, "isPrimaryTenantAdmin", false)).ToArray();
        var baselineAccounts = allAccounts.Where(x => Text(x, "userId", Text(x, "id")) == baselineUserId &&
            Text(x, "status") == "Active").ToArray();
        var currentPrimaryAccounts = currentPrimaries.Length == 1
            ? allAccounts.Where(x => Text(x, "userId", Text(x, "id")) == Text(currentPrimaries[0], "userId") &&
                Text(x, "status") == "Active").ToArray()
            : [];
        if (baselineRows.Length != 1 || Text(baselineRows[0], "status") != "Active" ||
            Text(baselineRows[0], "role") != "TenantAdmin" || baselineUserId == userId ||
            currentPrimaries.Length != 1 || baselineAccounts.Length != 1 || currentPrimaryAccounts.Length != 1 ||
            Text(currentPrimaries[0], "userId") != baselineUserId && Text(currentPrimaries[0], "userId") != userId ||
            string.IsNullOrWhiteSpace(Text(baselineRows[0], "_etag")) || string.IsNullOrWhiteSpace(Text(currentPrimaries[0], "_etag")))
            throw new InvalidOperationException("synthetic cleanup blocked: primary TenantAdmin restoration is unsafe");
        primaryRestorePlans.Add((snapshots[0], baselineRows[0], currentPrimaries[0]));
    }

    var legacyRows = (await ReadAllAsync("User")).Where(x => Text(x, "id") == legacyUserId).ToArray();
    var accountRows = (await ReadAllAsync("UserAccounts")).Where(x => Text(x, "userId") == userId).ToArray();
    if (legacyRows.Length != 1 || accountRows.Length != 1 || Text(legacyRows[0], "tenantId") != primaryTenant ||
        Text(accountRows[0], "id") != userId || Text(accountRows[0], "legacyUserId") != legacyUserId ||
        Text(accountRows[0], "status") is not ("Active" or "Suspended") || Text(accountRows[0], "globalRole") != "Viewer" ||
        !IsExactCrstSyntheticAccount(accountRows[0]) ||
        accountRows[0].ContainsKey("securityMutationId") || accountRows[0].ContainsKey("securityMutationKind") ||
        accountRows[0].ContainsKey("securityMutationPreviousStatus") || accountRows[0].ContainsKey("securityMutationStartedAt"))
        throw new InvalidOperationException("synthetic cleanup blocked: identity records are missing or ambiguous");
    var legacy = legacyRows[0];
    var account = accountRows[0];
    var resumingAfterIdentityDisable = Text(account, "status") == "Suspended";
    if (resumingAfterIdentityDisable &&
        (!Bool(account, "forcePasswordChange", false) || string.IsNullOrWhiteSpace(Text(account, "disabledAt")) ||
         string.IsNullOrWhiteSpace(Text(account, "securityStamp")) || Text(account, "disabledByUserId") != "crst-operator" ||
         Text(account, "disableReason") != "V2.8.63CRST synthetic cleanup" || Number(account, "sessionVersion", 0) < 2))
        throw new InvalidOperationException("synthetic cleanup blocked: suspended identity is not an exact CRST cleanup partial state");
    var legacyPasswordFingerprint = SafeDigest(Text(legacy, "passwordHash"));
    var accountPasswordFingerprint = SafeDigest(Text(account, "passwordHash"));
    if (string.IsNullOrWhiteSpace(Text(legacy, "passwordHash")) || legacyPasswordFingerprint != accountPasswordFingerprint)
        throw new InvalidOperationException("synthetic cleanup blocked: password linkage is unsafe");
    var creationMarkers = requests.Where(x => Text(x, "id") == $"crst-synthetic-create-marker-{userId}" &&
        Text(x, "requestPartition") == "global" && Text(x, "type") == "SyntheticCreationOperation" &&
        Text(x, "syntheticUserId") == userId && Text(x, "syntheticValidationId") == "V2.8.63CRST" &&
        Text(x, "status") == "Completed").ToArray();
    if (credentialHandoff is null || creationMarkers.Length != 1 ||
        Text(creationMarkers[0], "handoffSha256") != credentialHandoff.ContentSha256)
        throw new InvalidOperationException("synthetic cleanup blocked: credential handoff is not bound to the completed creation marker");
    var creationAuditId = $"crst-synthetic-created-{userId}";
    var cleanupAuditId = $"crst-synthetic-cleaned-{userId}";
    var cleanupPendingAuditId = $"crst-synthetic-cleanup-pending-{userId}";
    var auditsBeforeCleanup = await ReadAllAsync("SecurityAuditEvents");
    if (auditsBeforeCleanup.Count(x => Text(x, "id") == creationAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_created" && Text(x, "targetUserId") == userId &&
        Text(x, "result") == "success" && Text(x, "handoffSha256") == credentialHandoff.ContentSha256) != 1)
        throw new InvalidOperationException("synthetic cleanup blocked: creation audit is missing or ambiguous");

    var sessions = requests.Where(x => Text(x, "userId") == userId && Text(x, "type") == "UserSession").ToArray();
    var syntheticNormalizedEmails = new HashSet<string>(StringComparer.Ordinal)
    {
        normalizedEmail,
        IdentitySecurityService.NormalizeEmail(Text(legacy, "email")),
        IdentitySecurityService.NormalizeEmail(Text(account, "loginEmail"))
    };
    var allSyntheticInvitations = requests.Where(x => Text(x, "type") == "UserInvitation" &&
        syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail"))).ToArray();
    var invitations = allSyntheticInvitations.Where(x => Text(x, "status") == "Pending").ToArray();
    JsonObject? cleanupJournal = null;
    if (resumingAfterIdentityDisable)
    {
        var cleanupJournals = auditsBeforeCleanup.Where(x => Text(x, "id") == cleanupPendingAuditId &&
            Text(x, "auditPartition") == "global" &&
            Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" &&
            Text(x, "targetUserId") == userId && Text(x, "requestId") == "V2.8.63CRST").ToArray();
        if (cleanupJournals.Length != 1 || Text(cleanupJournals[0], "stage") is not
                ("identity_disable_ready" or "identity_disabled" or "cleanup_state_finalized") ||
            Text(cleanupJournals[0], "result") is not ("pending" or "success") ||
            string.IsNullOrWhiteSpace(Text(cleanupJournals[0], "_etag")) ||
            Text(cleanupJournals[0], "handoffSha256") != credentialHandoff!.ContentSha256 ||
            Number(cleanupJournals[0], "expectedSessionVersion", 0) != Number(account, "sessionVersion", 0) ||
            Number(cleanupJournals[0], "previousSessionVersion", -1) + 1 != Number(account, "sessionVersion", 0))
            throw new InvalidOperationException("synthetic cleanup blocked: suspended identity lacks an exact durable cleanup journal");
        cleanupJournal = cleanupJournals[0];
        var journalSessionIds = StringArray(cleanupJournal, "sessionIds");
        var journalInvitationIds = StringArray(cleanupJournal, "pendingInvitationIds");
        var journalMembershipIds = StringArray(cleanupJournal, "membershipIds");
        if (!IsOrdinalSubset(journalSessionIds, sessions.Select(x => Text(x, "id"))) ||
            !SameOrdinalSet(journalMembershipIds, memberships.Select(x => Text(x, "id"))) ||
            journalInvitationIds.Length != journalInvitationIds.Distinct(StringComparer.Ordinal).Count() ||
            journalInvitationIds.Any(string.IsNullOrWhiteSpace))
            throw new InvalidOperationException("synthetic cleanup blocked: cleanup journal owned-record sets do not match");
        invitations = journalInvitationIds.Select(invitationId =>
        {
            var rows = allSyntheticInvitations.Where(x => Text(x, "id") == invitationId).ToArray();
            if (rows.Length != 1) throw new InvalidOperationException("synthetic cleanup blocked: journaled invitation is missing or ambiguous");
            return rows[0];
        }).ToArray();
        if (invitations.Any(x => Text(x, "status") != "Revoked" || string.IsNullOrWhiteSpace(Text(x, "revokedAt"))) ||
            sessions.Any(x => Text(x, "requestPartition") != userId || string.IsNullOrWhiteSpace(Text(x, "id")) ||
                string.IsNullOrWhiteSpace(Text(x, "_etag"))) ||
            sessions.Where(x => journalSessionIds.Contains(Text(x, "id"), StringComparer.Ordinal)).Any(x =>
                string.IsNullOrWhiteSpace(Text(x, "revokedAt")) || Text(x, "revokedReason") != "V2.8.63CRST synthetic cleanup") ||
            memberships.Any(x => Text(x, "status") != "Revoked" || !ExplicitFalse(x, "isPrimaryTenantAdmin")))
            throw new InvalidOperationException("synthetic cleanup blocked: journaled revocations are incomplete or changed");
    }
    var cleanupInvitationIds = invitations.Select(x => Text(x, "id")).ToHashSet(StringComparer.Ordinal);
    var contactSnapshots = requests.Where(x => Text(x, "type") == "SyntheticContactSettingsSnapshot" &&
        Text(x, "syntheticUserId") == userId).ToArray();
    if (contactSnapshots.Length > 1)
        throw new InvalidOperationException("synthetic cleanup blocked: contact snapshots are ambiguous");
    JsonObject? contactSnapshot = contactSnapshots.SingleOrDefault();
    JsonObject? contactBaseline = null;
    JsonObject? currentContact = null;
    var contactRestoreRequired = false;
    var contactRestorationRequired = contactSnapshot is not null;
    var contactSnapshotNeedsRedaction = false;
    var contactSnapshotRedacted = contactSnapshot is null;
    var contactTenantUid = string.Empty;
    var contactSnapshotId = string.Empty;
    var contactBaselineDigest = string.Empty;
    if (contactSnapshot is not null)
    {
        contactTenantUid = Text(contactSnapshot, "tenantUid");
        contactSnapshotId = Text(contactSnapshot, "id");
        contactBaselineDigest = Text(contactSnapshot, "baselineDigest");
        contactBaseline = contactSnapshot["baselineDocument"] as JsonObject;
        if (Text(contactSnapshot, "requestPartition") != contactTenantUid ||
            !expectedTenantUids.Contains(contactTenantUid) || string.IsNullOrWhiteSpace(Text(contactSnapshot, "_etag")) ||
            Text(contactSnapshot, "status") is not ("Active" or "Restored") || string.IsNullOrWhiteSpace(contactBaselineDigest))
            throw new InvalidOperationException("synthetic cleanup blocked: contact snapshot failed integrity validation");
        var currentContacts = (await ReadAllAsync("TenantContactSettings")).Where(x =>
            Text(x, "id") == contactTenantUid && Text(x, "tenantUid") == contactTenantUid).ToArray();
        if (currentContacts.Length != 1 || string.IsNullOrWhiteSpace(Text(currentContacts[0], "_etag")))
            throw new InvalidOperationException("synthetic cleanup blocked: current contact settings are missing or ambiguous");
        currentContact = currentContacts[0];
        if (contactBaseline is null)
        {
            if (Text(contactSnapshot, "status") != "Restored" || contactSnapshot.ContainsKey("baselineEtag") ||
                contactSnapshot.ContainsKey("syntheticNormalizedEmail") ||
                SafeDigest(ContactUserDocument(currentContact).ToJsonString()) != contactBaselineDigest ||
                SyntheticContactRecipientState(currentContact, normalizedEmail).Count != 0)
                throw new InvalidOperationException("synthetic cleanup blocked: redacted contact snapshot readback is inconsistent");
            contactSnapshotRedacted = true;
        }
        else
        {
            contactSnapshotNeedsRedaction = true;
            var snapshotNormalizedEmail = Text(contactSnapshot, "syntheticNormalizedEmail");
            if (snapshotNormalizedEmail != normalizedEmail ||
                SafeDigest(contactBaseline.ToJsonString()) != contactBaselineDigest ||
                Text(contactBaseline, "id") != contactTenantUid || Text(contactBaseline, "tenantUid") != contactTenantUid ||
                SyntheticContactRecipientState(contactBaseline, normalizedEmail).Count != 0)
                throw new InvalidOperationException("synthetic cleanup blocked: contact snapshot synthetic-recipient boundary is invalid");
            var currentSyntheticRecipients = SyntheticContactRecipientState(currentContact, normalizedEmail);
            if (currentSyntheticRecipients.Count > 1 || !currentSyntheticRecipients.AllInactive)
                throw new InvalidOperationException("synthetic cleanup blocked: temporary contact recipient is ambiguous or active");
            var baselineCustomerProjection = ContactCustomerProjection(contactBaseline, normalizedEmail, removeSyntheticRecipient: false);
            var currentCustomerProjection = ContactCustomerProjection(currentContact, normalizedEmail, removeSyntheticRecipient: true);
            if (!JsonNode.DeepEquals(baselineCustomerProjection, currentCustomerProjection))
                throw new InvalidOperationException("synthetic cleanup blocked: contact settings contain a non-synthetic concurrent customer change");
            contactRestoreRequired = !JsonNode.DeepEquals(contactBaseline, ContactUserDocument(currentContact));
        }
    }
    else
    {
        var syntheticRecipientPresentWithoutSnapshot = (await ReadAllAsync("TenantContactSettings"))
            .Any(settings => SyntheticContactRecipientState(settings, normalizedEmail).Count > 0);
        if (syntheticRecipientPresentWithoutSnapshot)
            throw new InvalidOperationException("synthetic cleanup blocked: a temporary contact recipient exists without an exact snapshot");
    }
    if (resumingAfterIdentityDisable)
    {
        if (cleanupJournal is null ||
            !SameOrdinalSet(StringArray(cleanupJournal, "primarySnapshotIds"), primarySnapshots.Select(x => Text(x, "id"))) ||
            Text(cleanupJournal, "contactSnapshotId") != contactSnapshotId ||
            Text(cleanupJournal, "contactBaselineDigest") != contactBaselineDigest ||
            Text(cleanupJournal, "stage") == "cleanup_state_finalized" && Text(cleanupJournal, "result") != "success" ||
            Text(cleanupJournal, "stage") != "cleanup_state_finalized" && Text(cleanupJournal, "result") != "pending")
            throw new InvalidOperationException("synthetic cleanup blocked: cleanup journal snapshot boundary does not match");
        var legacyAlreadyDisabled = !Bool(legacy, "isActive", true);
        if (legacyAlreadyDisabled &&
            (string.IsNullOrWhiteSpace(Text(legacy, "disabledAt")) ||
             Text(legacy, "disableReason") != "V2.8.63CRST synthetic cleanup") ||
            !legacyAlreadyDisabled &&
            (Text(cleanupJournal, "stage") != "identity_disable_ready" || Text(cleanupJournal, "result") != "pending"))
            throw new InvalidOperationException("synthetic cleanup blocked: legacy disable state is not journal-consistent");
    }
    var timestamp = DateTime.UtcNow;
    var requestContainer = database.GetContainer("IdentityRequests");
    var membershipContainer = database.GetContainer("TenantMemberships");
    var auditContainer = database.GetContainer("SecurityAuditEvents");
    if (!resumingAfterIdentityDisable)
        await auditContainer.UpsertItemAsync(new
        {
            id = cleanupPendingAuditId, auditPartition = "global",
            eventType = "identity_synthetic_validation_cleanup_pending", actorRole = "system",
            targetUserId = userId, targetTenantUid = contactRestorationRequired ? contactTenantUid : null,
            requestId = "V2.8.63CRST", result = "pending", stage = "started", contactRestorationRequired,
            handoffSha256 = credentialHandoff!.ContentSha256, createdAt = timestamp
        }, new("global"));
    var pendingAuditDurable = (await ReadAllAsync("SecurityAuditEvents")).Count(x =>
        Text(x, "id") == cleanupPendingAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" &&
        Text(x, "result") is "pending" or "success" && Text(x, "targetUserId") == userId &&
        Text(x, "handoffSha256") == credentialHandoff!.ContentSha256) == 1;
    if (!pendingAuditDurable)
        throw new InvalidOperationException("synthetic cleanup blocked: pending audit is not durable");

    var failureStage = "contact-restoration";
    try
    {
    failureStage = "primary-admin-restoration";
    var accountsBeforePrimaryRestore = await ReadAllAsync("UserAccounts");
    if (primaryRestorePlans.Any(plan =>
            accountsBeforePrimaryRestore.Count(account =>
                Text(account, "userId", Text(account, "id")) == Text(plan.Baseline, "userId") && Text(account, "status") == "Active") != 1 ||
            accountsBeforePrimaryRestore.Count(account =>
                Text(account, "userId", Text(account, "id")) == Text(plan.CurrentPrimary, "userId") && Text(account, "status") == "Active") != 1))
        throw new InvalidOperationException("synthetic primary TenantAdmin restoration account state changed before restore");
    foreach (var restorePlan in primaryRestorePlans.Where(plan => Text(plan.CurrentPrimary, "id") != Text(plan.Baseline, "id")))
    {
        await adminInvariantLease.EnsureOwnedAsync();
        var tenantUid = Text(restorePlan.Baseline, "tenantUid");
        var batch = membershipContainer.CreateTransactionalBatch(new(tenantUid));
        foreach (var unchanged in allMemberships.Where(membership => Text(membership, "tenantUid") == tenantUid &&
                     Text(membership, "id") != Text(restorePlan.CurrentPrimary, "id") &&
                     Text(membership, "id") != Text(restorePlan.Baseline, "id")))
            batch.ReadItem(Text(unchanged, "id"),
                new TransactionalBatchItemRequestOptions { IfMatchEtag = Text(unchanged, "_etag") });
        batch.PatchItem(Text(restorePlan.CurrentPrimary, "id"),
            [PatchOperation.Set("/isPrimaryTenantAdmin", false), PatchOperation.Set("/updatedAt", timestamp)],
            new TransactionalBatchPatchItemRequestOptions { IfMatchEtag = Text(restorePlan.CurrentPrimary, "_etag") });
        batch.PatchItem(Text(restorePlan.Baseline, "id"),
            [PatchOperation.Set("/isPrimaryTenantAdmin", true), PatchOperation.Set("/updatedAt", timestamp)],
            new TransactionalBatchPatchItemRequestOptions { IfMatchEtag = Text(restorePlan.Baseline, "_etag") });
        using var response = await batch.ExecuteAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("synthetic primary TenantAdmin restoration concurrency conflict");
    }
    var restoredMembershipState = await ReadAllAsync("TenantMemberships");
    var accountsAfterPrimaryRestore = await ReadAllAsync("UserAccounts");
    var primaryTenantAdminsRestored = primaryRestorePlans.All(plan =>
        restoredMembershipState.Count(x => Text(x, "tenantUid") == Text(plan.Baseline, "tenantUid") &&
            Text(x, "status") == "Active" && Text(x, "role") == "TenantAdmin" &&
            Bool(x, "isPrimaryTenantAdmin", false)) == 1 &&
        restoredMembershipState.Count(x => Text(x, "tenantUid") == Text(plan.Baseline, "tenantUid") &&
            Text(x, "id") == Text(plan.Baseline, "id") && Text(x, "userId") == Text(plan.Baseline, "userId") &&
            Text(x, "status") == "Active" && Text(x, "role") == "TenantAdmin" &&
            Bool(x, "isPrimaryTenantAdmin", false)) == 1 &&
        accountsAfterPrimaryRestore.Count(account =>
            Text(account, "userId", Text(account, "id")) == Text(plan.Baseline, "userId") && Text(account, "status") == "Active") == 1);
    if (!primaryTenantAdminsRestored)
        throw new InvalidOperationException("synthetic primary TenantAdmin restoration readback failed");
    failureStage = "contact-restoration";
    if (contactSnapshot is not null && contactBaseline is not null && currentContact is not null)
    {
        if (contactRestoreRequired)
        {
            try
            {
                await adminInvariantLease.EnsureOwnedAsync();
                await database.GetContainer("TenantContactSettings").ReplaceItemAsync(
                    (JsonObject)contactBaseline.DeepClone(), contactTenantUid, new(contactTenantUid),
                    new ItemRequestOptions { IfMatchEtag = Text(currentContact, "_etag") });
            }
            catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                throw new InvalidOperationException("synthetic contact restoration concurrency conflict", error);
            }
        }
        var restoredContacts = (await ReadAllAsync("TenantContactSettings")).Where(x =>
            Text(x, "id") == contactTenantUid && Text(x, "tenantUid") == contactTenantUid).ToArray();
        if (restoredContacts.Length != 1 || !JsonNode.DeepEquals(contactBaseline, ContactUserDocument(restoredContacts[0])))
            throw new InvalidOperationException("synthetic contact restoration readback failed");
    }
    failureStage = "invitation-revocation";
    foreach (var invitation in resumingAfterIdentityDisable ? [] : invitations)
    {
        await adminInvariantLease.EnsureOwnedAsync();
        var partition = Text(invitation, "requestPartition", Text(invitation, "tenantUid"));
        if (string.IsNullOrWhiteSpace(partition)) throw new InvalidOperationException("synthetic invitation partition is missing");
        await requestContainer.PatchItemAsync<object>(Text(invitation, "id"), new(partition),
            [PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedByUserId", "crst-operator"),
             PatchOperation.Set("/revokedAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)]);
    }
    failureStage = "membership-revocation";
    foreach (var membership in resumingAfterIdentityDisable ? [] : memberships)
    {
        await adminInvariantLease.EnsureOwnedAsync();
        await membershipContainer.PatchItemAsync<object>(Text(membership, "id"), new(Text(membership, "tenantUid")),
            [PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedByUserId", "crst-operator"),
             PatchOperation.Set("/revokedAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)]);
    }
    failureStage = "session-revocation";
    foreach (var session in resumingAfterIdentityDisable ? [] : sessions)
    {
        await adminInvariantLease.EnsureOwnedAsync();
        var partition = Text(session, "requestPartition");
        if (string.IsNullOrWhiteSpace(partition)) throw new InvalidOperationException("synthetic session partition is missing");
        await requestContainer.PatchItemAsync<object>(Text(session, "id"), new(partition),
            [PatchOperation.Set("/revokedAt", timestamp), PatchOperation.Set("/revokedReason", "V2.8.63CRST synthetic cleanup"),
             PatchOperation.Set("/updatedAt", timestamp)]);
    }
    var sessionVersion = resumingAfterIdentityDisable
        ? Number(account, "sessionVersion", 0)
        : Number(account, "sessionVersion", 1) + 1;
    if (!resumingAfterIdentityDisable)
    {
        failureStage = "identity-disable-journal";
        var journalBeforeDisable = (await ReadAllAsync("SecurityAuditEvents")).Single(x =>
            Text(x, "id") == cleanupPendingAuditId && Text(x, "auditPartition") == "global" &&
            Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" &&
            Text(x, "targetUserId") == userId && Text(x, "result") == "pending" && Text(x, "stage") == "started" &&
            Text(x, "handoffSha256") == credentialHandoff!.ContentSha256);
        await auditContainer.PatchItemAsync<object>(cleanupPendingAuditId, new("global"),
            [PatchOperation.Set("/stage", "identity_disable_ready"),
             PatchOperation.Set("/previousSessionVersion", Number(account, "sessionVersion", 1)),
             PatchOperation.Set("/expectedSessionVersion", sessionVersion),
             PatchOperation.Set("/membershipIds", memberships.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/sessionIds", sessions.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/pendingInvitationIds", invitations.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/primarySnapshotIds", primarySnapshots.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/contactSnapshotId", contactSnapshotId),
             PatchOperation.Set("/contactBaselineDigest", contactBaselineDigest),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(journalBeforeDisable, "_etag") });
        var durableDisableJournal = (await ReadAllAsync("SecurityAuditEvents")).Single(x =>
            Text(x, "id") == cleanupPendingAuditId && Text(x, "stage") == "identity_disable_ready" &&
            Text(x, "result") == "pending" && Text(x, "handoffSha256") == credentialHandoff!.ContentSha256);
        if (!SameOrdinalSet(StringArray(durableDisableJournal, "membershipIds"), memberships.Select(x => Text(x, "id"))) ||
            !SameOrdinalSet(StringArray(durableDisableJournal, "sessionIds"), sessions.Select(x => Text(x, "id"))) ||
            !SameOrdinalSet(StringArray(durableDisableJournal, "pendingInvitationIds"), invitations.Select(x => Text(x, "id"))) ||
            !SameOrdinalSet(StringArray(durableDisableJournal, "primarySnapshotIds"), primarySnapshots.Select(x => Text(x, "id"))) ||
            Number(durableDisableJournal, "expectedSessionVersion", 0) != sessionVersion)
            throw new InvalidOperationException("synthetic cleanup identity-disable journal readback failed");
    }
    failureStage = "account-disable";
    await adminInvariantLease.EnsureOwnedAsync();
    if (!resumingAfterIdentityDisable)
        await database.GetContainer("UserAccounts").PatchItemAsync<object>(Text(account, "id"), new("global"),
            [PatchOperation.Set("/status", "Suspended"), PatchOperation.Set("/sessionVersion", sessionVersion),
             PatchOperation.Set("/securityStamp", Guid.NewGuid().ToString("N")), PatchOperation.Set("/forcePasswordChange", true),
             PatchOperation.Set("/disabledAt", timestamp), PatchOperation.Set("/disabledByUserId", "crst-operator"),
             PatchOperation.Set("/disableReason", "V2.8.63CRST synthetic cleanup"), PatchOperation.Set("/updatedAt", timestamp)],
            new PatchItemRequestOptions { IfMatchEtag = Text(account, "_etag") });
    if (Bool(legacy, "isActive", true))
        await database.GetContainer("User").PatchItemAsync<object>(Text(legacy, "id"), new(primaryTenant),
            [PatchOperation.Set("/isActive", false), PatchOperation.Set("/disabledAt", timestamp),
             PatchOperation.Set("/disableReason", "V2.8.63CRST synthetic cleanup")],
            new PatchItemRequestOptions { IfMatchEtag = Text(legacy, "_etag") });
    var journalAfterDisable = (await ReadAllAsync("SecurityAuditEvents")).Single(x =>
        Text(x, "id") == cleanupPendingAuditId && Text(x, "auditPartition") == "global" &&
        Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" && Text(x, "targetUserId") == userId);
    if (Text(journalAfterDisable, "stage") == "identity_disable_ready")
        await auditContainer.PatchItemAsync<object>(cleanupPendingAuditId, new("global"),
            [PatchOperation.Set("/stage", "identity_disabled"), PatchOperation.Set("/identityDisabledAt", DateTime.UtcNow),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(journalAfterDisable, "_etag") });
    else if (Text(journalAfterDisable, "stage") is not ("identity_disabled" or "cleanup_state_finalized"))
        throw new InvalidOperationException("synthetic cleanup durable journal advanced unexpectedly");

    failureStage = "post-disable-login-write-drain";
    await Task.Delay(TimeSpan.FromSeconds(5));
    await adminInvariantLease.EnsureOwnedAsync();
    failureStage = "post-disable-owned-record-sweep";
    var postDisableRequests = await ReadAllAsync("IdentityRequests");
    var postDisableSessions = postDisableRequests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
    if (postDisableSessions.Any(session => Text(session, "requestPartition") != userId ||
        string.IsNullOrWhiteSpace(Text(session, "id")) || string.IsNullOrWhiteSpace(Text(session, "_etag"))))
        throw new InvalidOperationException("synthetic cleanup found an unsafe post-disable session record");
    foreach (var session in postDisableSessions.Where(session => string.IsNullOrWhiteSpace(Text(session, "revokedAt"))))
    {
        await adminInvariantLease.EnsureOwnedAsync();
        await requestContainer.PatchItemAsync<object>(Text(session, "id"), new(userId),
            [PatchOperation.Set("/revokedAt", DateTime.UtcNow),
             PatchOperation.Set("/revokedReason", "V2.8.63CRST synthetic cleanup"),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(session, "_etag") });
    }
    var postDisablePendingInvitations = postDisableRequests.Where(x => Text(x, "type") == "UserInvitation" &&
        syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending").ToArray();
    foreach (var invitation in postDisablePendingInvitations)
    {
        await adminInvariantLease.EnsureOwnedAsync();
        var partition = Text(invitation, "requestPartition", Text(invitation, "tenantUid"));
        if (string.IsNullOrWhiteSpace(partition) || string.IsNullOrWhiteSpace(Text(invitation, "_etag")))
            throw new InvalidOperationException("synthetic cleanup found an unsafe post-disable invitation record");
        cleanupInvitationIds.Add(Text(invitation, "id"));
        await requestContainer.PatchItemAsync<object>(Text(invitation, "id"), new(partition),
            [PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedByUserId", "crst-operator"),
             PatchOperation.Set("/revokedAt", DateTime.UtcNow), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(invitation, "_etag") });
    }
    var sweptRequests = await ReadAllAsync("IdentityRequests");
    sessions = sweptRequests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
    invitations = sweptRequests.Where(x => Text(x, "type") == "UserInvitation" && cleanupInvitationIds.Contains(Text(x, "id"))).ToArray();
    if (sessions.Any(session => Text(session, "requestPartition") != userId ||
            string.IsNullOrWhiteSpace(Text(session, "revokedAt")) ||
            Text(session, "revokedReason") != "V2.8.63CRST synthetic cleanup") ||
        invitations.Count() != cleanupInvitationIds.Count ||
        invitations.Any(invitation => Text(invitation, "status") != "Revoked" || string.IsNullOrWhiteSpace(Text(invitation, "revokedAt"))) ||
        sweptRequests.Any(x => Text(x, "type") == "UserInvitation" &&
            syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending"))
        throw new InvalidOperationException("synthetic cleanup post-disable owned-record sweep readback failed");
    var journalAfterSweep = (await ReadAllAsync("SecurityAuditEvents")).Single(x =>
        Text(x, "id") == cleanupPendingAuditId && Text(x, "auditPartition") == "global" &&
        Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" && Text(x, "targetUserId") == userId);
    if (Text(journalAfterSweep, "stage") == "identity_disabled")
        await auditContainer.PatchItemAsync<object>(cleanupPendingAuditId, new("global"),
            [PatchOperation.Set("/sessionIds", sessions.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/pendingInvitationIds", cleanupInvitationIds.Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/postDisableSweepAt", DateTime.UtcNow), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(journalAfterSweep, "_etag") });

    failureStage = "cleanup-readback";
    var retainedMemberships = (await ReadAllAsync("TenantMemberships")).Where(x => Text(x, "userId") == userId).ToArray();
    var retainedAccount = (await ReadAllAsync("UserAccounts")).Single(x => Text(x, "userId") == userId);
    var retainedLegacy = (await ReadAllAsync("User")).Single(x => Text(x, "id") == legacyUserId);
    var retainedRequests = await ReadAllAsync("IdentityRequests");
    var retainedSessions = retainedRequests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
    var membershipsRevoked = retainedMemberships.Length == memberships.Length &&
        retainedMemberships.All(x => Text(x, "status") == "Revoked" && ExplicitFalse(x, "isPrimaryTenantAdmin"));
    var sessionRecordsRevoked = retainedSessions.Length == sessions.Length && retainedSessions.All(session =>
        Text(session, "requestPartition") == userId && !string.IsNullOrWhiteSpace(Text(session, "revokedAt")) &&
        Text(session, "revokedReason") == "V2.8.63CRST synthetic cleanup");
    var pendingInvitationRecordsRevoked = invitations.All(invitation => retainedRequests.Any(x =>
        Text(x, "id") == Text(invitation, "id") && Text(x, "status") == "Revoked" &&
        !string.IsNullOrWhiteSpace(Text(x, "revokedAt")))) &&
        !retainedRequests.Any(x => Text(x, "type") == "UserInvitation" &&
            syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending");
    var accountPasswordHashPreserved = SafeDigest(Text(retainedAccount, "passwordHash")) == accountPasswordFingerprint;
    var legacyPasswordHashPreserved = SafeDigest(Text(retainedLegacy, "passwordHash")) == legacyPasswordFingerprint;
    var accountDisabled = Text(retainedAccount, "status") == "Suspended" &&
        Number(retainedAccount, "sessionVersion", 0) == sessionVersion && Bool(retainedAccount, "forcePasswordChange", false);
    var legacyUserDisabled = !Bool(retainedLegacy, "isActive", true);
    if (!membershipsRevoked || !sessionRecordsRevoked || !pendingInvitationRecordsRevoked || !accountDisabled || !legacyUserDisabled ||
        !accountPasswordHashPreserved || !legacyPasswordHashPreserved)
        throw new InvalidOperationException("synthetic cleanup readback verification failed");

    failureStage = "contact-snapshot-finalization";
    if (contactSnapshot is not null && contactSnapshotNeedsRedaction)
    {
        try
        {
            var redactedSnapshot = (await requestContainer.PatchItemAsync<JsonObject>(contactSnapshotId, new(contactTenantUid),
                [PatchOperation.Set("/status", "Restored"), PatchOperation.Set("/restoredAt", timestamp),
                  PatchOperation.Set("/updatedAt", timestamp), PatchOperation.Remove("/baselineDocument"),
                  PatchOperation.Remove("/baselineEtag"), PatchOperation.Remove("/syntheticNormalizedEmail")],
                new PatchItemRequestOptions { IfMatchEtag = Text(contactSnapshot, "_etag") })).Resource;
            contactSnapshotRedacted = Text(redactedSnapshot, "status") == "Restored" &&
                Text(redactedSnapshot, "baselineDigest") == contactBaselineDigest &&
                !redactedSnapshot.ContainsKey("baselineDocument") && !redactedSnapshot.ContainsKey("baselineEtag") &&
                (!redactedSnapshot.ContainsKey("syntheticNormalizedEmail"));
            if (!contactSnapshotRedacted)
                throw new InvalidOperationException("synthetic contact snapshot redaction readback failed");
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            throw new InvalidOperationException("synthetic contact snapshot finalization concurrency conflict", error);
        }
    }
    failureStage = "primary-admin-snapshot-finalization";
    foreach (var restorePlan in primaryRestorePlans)
    {
        try
        {
            await requestContainer.PatchItemAsync<object>(Text(restorePlan.Snapshot, "id"), new(Text(restorePlan.Snapshot, "tenantUid")),
                [PatchOperation.Set("/status", "Restored"), PatchOperation.Set("/restoredAt", timestamp),
                 PatchOperation.Set("/updatedAt", timestamp)],
                new PatchItemRequestOptions { IfMatchEtag = Text(restorePlan.Snapshot, "_etag") });
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
        {
            throw new InvalidOperationException("synthetic primary TenantAdmin snapshot finalization concurrency conflict", error);
        }
    }
    failureStage = "final-owned-record-readback";
    await adminInvariantLease.EnsureOwnedAsync();
    var finalOwnedRequests = await ReadAllAsync("IdentityRequests");
    var finalOwnedSessions = finalOwnedRequests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
    foreach (var session in finalOwnedSessions.Where(session => string.IsNullOrWhiteSpace(Text(session, "revokedAt"))))
    {
        if (Text(session, "requestPartition") != userId || string.IsNullOrWhiteSpace(Text(session, "_etag")))
            throw new InvalidOperationException("synthetic cleanup final session record is unsafe");
        await requestContainer.PatchItemAsync<object>(Text(session, "id"), new(userId),
            [PatchOperation.Set("/revokedAt", DateTime.UtcNow),
             PatchOperation.Set("/revokedReason", "V2.8.63CRST synthetic cleanup"),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(session, "_etag") });
    }
    foreach (var invitation in finalOwnedRequests.Where(x => Text(x, "type") == "UserInvitation" &&
                 syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending"))
    {
        var partition = Text(invitation, "requestPartition", Text(invitation, "tenantUid"));
        if (string.IsNullOrWhiteSpace(partition) || string.IsNullOrWhiteSpace(Text(invitation, "_etag")))
            throw new InvalidOperationException("synthetic cleanup final invitation record is unsafe");
        cleanupInvitationIds.Add(Text(invitation, "id"));
        await requestContainer.PatchItemAsync<object>(Text(invitation, "id"), new(partition),
            [PatchOperation.Set("/status", "Revoked"), PatchOperation.Set("/revokedByUserId", "crst-operator"),
             PatchOperation.Set("/revokedAt", DateTime.UtcNow), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(invitation, "_etag") });
    }
    finalOwnedRequests = await ReadAllAsync("IdentityRequests");
    finalOwnedSessions = finalOwnedRequests.Where(x => Text(x, "type") == "UserSession" && Text(x, "userId") == userId).ToArray();
    invitations = finalOwnedRequests.Where(x => Text(x, "type") == "UserInvitation" &&
        cleanupInvitationIds.Contains(Text(x, "id"))).ToArray();
    if (finalOwnedSessions.Any(session => Text(session, "requestPartition") != userId ||
            string.IsNullOrWhiteSpace(Text(session, "revokedAt")) ||
            Text(session, "revokedReason") != "V2.8.63CRST synthetic cleanup") ||
        invitations.Length != cleanupInvitationIds.Count ||
        invitations.Any(invitation => Text(invitation, "status") != "Revoked" ||
            string.IsNullOrWhiteSpace(Text(invitation, "revokedAt"))) ||
        finalOwnedRequests.Any(x => Text(x, "type") == "UserInvitation" &&
            syntheticNormalizedEmails.Contains(Text(x, "normalizedEmail")) && Text(x, "status") == "Pending"))
        throw new InvalidOperationException("synthetic cleanup final owned-record readback failed");
    sessions = finalOwnedSessions;
    sessionRecordsRevoked = true;
    pendingInvitationRecordsRevoked = true;

    failureStage = "cleanup-success-audit";
    var journalBeforeFinalization = (await ReadAllAsync("SecurityAuditEvents")).Single(x =>
        Text(x, "id") == cleanupPendingAuditId && Text(x, "auditPartition") == "global" &&
        Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" && Text(x, "targetUserId") == userId);
    if (Text(journalBeforeFinalization, "stage") == "identity_disabled" && Text(journalBeforeFinalization, "result") == "pending")
        await auditContainer.PatchItemAsync<object>(cleanupPendingAuditId, new("global"),
            [PatchOperation.Set("/sessionIds", sessions.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/pendingInvitationIds", cleanupInvitationIds.Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/stage", "cleanup_state_finalized"), PatchOperation.Set("/result", "success"),
             PatchOperation.Set("/finalizedAt", DateTime.UtcNow), PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(journalBeforeFinalization, "_etag") });
    else if (Text(journalBeforeFinalization, "stage") != "cleanup_state_finalized" ||
             Text(journalBeforeFinalization, "result") != "success")
        throw new InvalidOperationException("synthetic cleanup durable journal cannot be finalized from its current state");
    else if (!SameOrdinalSet(StringArray(journalBeforeFinalization, "sessionIds"), sessions.Select(x => Text(x, "id"))) ||
             !SameOrdinalSet(StringArray(journalBeforeFinalization, "pendingInvitationIds"), cleanupInvitationIds))
        await auditContainer.PatchItemAsync<object>(cleanupPendingAuditId, new("global"),
            [PatchOperation.Set("/sessionIds", sessions.Select(x => Text(x, "id")).Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/pendingInvitationIds", cleanupInvitationIds.Order(StringComparer.Ordinal).ToArray()),
             PatchOperation.Set("/updatedAt", DateTime.UtcNow)],
            new PatchItemRequestOptions { IfMatchEtag = Text(journalBeforeFinalization, "_etag") });
    await auditContainer.UpsertItemAsync(new
    {
        id = cleanupAuditId, auditPartition = "global",
        eventType = "identity_synthetic_validation_cleaned", actorRole = "system",
        targetUserId = userId, requestId = "V2.8.63CRST", result = "success",
        membershipsRevoked = memberships.Length, sessionsRevoked = sessions.Length,
        pendingInvitationsRevoked = invitations.Length,
        accountDisabled = true, legacyUserDisabled = true, pendingAuditId = cleanupPendingAuditId,
        primaryTenantAdminsRestored = true, primaryAdminSnapshotCount = primaryRestorePlans.Count,
        contactRestored = contactRestorationRequired, contactTenantUid = contactRestorationRequired ? contactTenantUid : null,
        contactBaselineDigest = contactRestorationRequired ? contactBaselineDigest : null,
        handoffSha256 = credentialHandoff!.ContentSha256, createdAt = timestamp
    }, new("global"));
    var auditsAfterCleanup = await ReadAllAsync("SecurityAuditEvents");
    var creationAuditPreserved = auditsAfterCleanup.Count(x => Text(x, "id") == creationAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_created" && Text(x, "targetUserId") == userId) == 1;
    var cleanupAuditWritten = auditsAfterCleanup.Count(x => Text(x, "id") == cleanupAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_cleaned" && Text(x, "targetUserId") == userId &&
        Number(x, "membershipsRevoked", -1) == memberships.Length && Number(x, "sessionsRevoked", -1) == sessions.Length &&
        Number(x, "pendingInvitationsRevoked", -1) == invitations.Length) == 1;
    var pendingAuditPreserved = auditsAfterCleanup.Count(x => Text(x, "id") == cleanupPendingAuditId &&
        Text(x, "eventType") == "identity_synthetic_validation_cleanup_pending" &&
        Text(x, "result") == "success" && Text(x, "targetUserId") == userId &&
        SameOrdinalSet(StringArray(x, "sessionIds"), sessions.Select(session => Text(session, "id"))) &&
        SameOrdinalSet(StringArray(x, "pendingInvitationIds"), cleanupInvitationIds)) == 1;
    if (!creationAuditPreserved || !pendingAuditPreserved || !cleanupAuditWritten)
        throw new InvalidOperationException("synthetic cleanup audit preservation verification failed");
    failureStage = "credential-invalidation";
    await ReplaceActiveCredentialHandoffAsync(credentialHandoff!, output, userId, email, timestamp);
    var inactiveHandoffReadback = await ReadCredentialHandoffForCleanupAsync(credentialOutput, output, userId, email);
    if (inactiveHandoffReadback.Active)
        throw new InvalidOperationException("synthetic cleanup credential invalidation did not persist");
    failureStage = "cleanup-reconciliation-resolution";
    await ResolveSyntheticCleanupReconciliationAsync(userId, cleanupPendingAuditId);
    failureStage = "cleanup-evidence";
    await WriteJsonAsync(Path.Combine(output, "synthetic-cleanup.json"), new
    {
        syntheticUserId = userId, membershipsRevoked = memberships.Length, sessionsRevoked = sessions.Length,
        pendingInvitationsRevoked = invitations.Length, sessionRecordsRevoked, pendingInvitationRecordsRevoked,
        accountDisabled, legacyUserDisabled,
        accountPasswordHashPreserved, legacyPasswordHashPreserved,
        recordsRetained = retainedMemberships.Length == memberships.Length,
        contactSnapshotPresent = contactRestorationRequired, contactRestored = contactRestorationRequired,
        contactRestoreRequired, contactSnapshotRedacted,
        contactBaselineDigest = contactRestorationRequired ? contactBaselineDigest : null,
        primaryTenantAdminsRestored = true, primaryAdminSnapshots = primaryRestorePlans.Count,
        pendingAuditDurable, creationAuditPreserved, pendingAuditPreserved, cleanupAuditWritten,
        credentialHandoffInactive = true,
        cleanedAt = timestamp
    });
    Console.WriteLine(JsonSerializer.Serialize(new { status = "synthetic_cleaned", syntheticUserId = userId }));
    }
    catch (Exception cleanupError)
    {
        try
        {
            await database.GetContainer("IdentityMigration").UpsertItemAsync(new
            {
                id = $"crst-synthetic-cleanup-reconcile-{userId}", migrationPartition = "global",
                type = "IdentitySecurityMutationReconciliation", targetUserId = userId,
                mutationType = "V2.8.63CRST-synthetic-cleanup", errorCode = $"{failureStage}_{cleanupError.GetType().Name}",
                status = "Pending", createdAt = DateTime.UtcNow
            }, new("global"));
        }
        catch { }
        try
        {
            await auditContainer.UpsertItemAsync(new
            {
                id = $"crst-synthetic-cleanup-reconcile-{userId}", auditPartition = "global",
                eventType = "identity_synthetic_validation_cleanup_reconciliation_required", actorRole = "system",
                targetUserId = userId, targetTenantUid = contactRestorationRequired ? contactTenantUid : null,
                requestId = "V2.8.63CRST", result = "failed_closed", pendingAuditId = cleanupPendingAuditId,
                failureStage, failureType = cleanupError.GetType().Name, createdAt = DateTime.UtcNow
            }, new("global"));
        }
        catch { }
        try
        {
            await WriteJsonAsync(Path.Combine(output, "synthetic-cleanup-reconciliation.json"), new
            {
                syntheticUserId = userId, failedClosed = true, reconciliationRequired = true,
                pendingAuditId = cleanupPendingAuditId, pendingAuditDurable, failureStage,
                failureType = cleanupError.GetType().Name, contactRestorationRequired,
                failedAt = DateTime.UtcNow
            });
        }
        catch { }
        throw;
    }
}

static string[] StringArray(JsonObject source, string property) => source[property] is JsonArray values
    ? values.Select(value => value?.GetValue<string>() ?? string.Empty).ToArray()
    : [];

static bool IsExactCrstSyntheticAccount(JsonObject account) =>
    Bool(account, "isSyntheticValidation", false) && Text(account, "syntheticValidationId") == "V2.8.63CRST";

static bool SameOrdinalSet(IEnumerable<string> left, IEnumerable<string> right)
{
    var leftValues = left.ToArray();
    var rightValues = right.ToArray();
    return leftValues.Length == leftValues.Distinct(StringComparer.Ordinal).Count() &&
        rightValues.Length == rightValues.Distinct(StringComparer.Ordinal).Count() &&
        leftValues.ToHashSet(StringComparer.Ordinal).SetEquals(rightValues);
}

static bool IsOrdinalSubset(IEnumerable<string> expectedSubset, IEnumerable<string> available)
{
    var subset = expectedSubset.ToArray();
    var availableValues = available.ToArray();
    return subset.Length == subset.Distinct(StringComparer.Ordinal).Count() &&
        availableValues.Length == availableValues.Distinct(StringComparer.Ordinal).Count() &&
        subset.All(availableValues.ToHashSet(StringComparer.Ordinal).Contains);
}

async Task ResolveSyntheticSwitchFixtureReconciliationAsync(
    string reconciliationId,
    string syntheticUserId,
    string tenantUid,
    string membershipId,
    string requestedStatus)
{
    var migrationRows = (await ReadAllAsync("IdentityMigration")).Where(row => Text(row, "id") == reconciliationId).ToArray();
    if (migrationRows.Length > 1)
        throw new InvalidOperationException("synthetic switch fixture reconciliation row is ambiguous");
    if (migrationRows.Length == 1)
    {
        var row = migrationRows[0];
        if (Text(row, "migrationPartition") != "global" ||
            Text(row, "type") != "IdentitySecurityMutationReconciliation" ||
            Text(row, "targetUserId") != syntheticUserId || Text(row, "targetTenantUid") != tenantUid ||
            Text(row, "membershipId") != membershipId ||
            Text(row, "mutationType") != "V2.8.63CRST-synthetic-switch-fixture-status" ||
            Text(row, "requestedMembershipStatus") != requestedStatus ||
            Text(row, "status") is not ("Pending" or "Resolved") || string.IsNullOrWhiteSpace(Text(row, "_etag")))
            throw new InvalidOperationException("synthetic switch fixture reconciliation row failed integrity validation");
        if (Text(row, "status") == "Pending")
            await database.GetContainer("IdentityMigration").PatchItemAsync<object>(reconciliationId, new("global"),
                [PatchOperation.Set("/status", "Resolved"), PatchOperation.Set("/resolvedAt", DateTime.UtcNow),
                 PatchOperation.Set("/updatedAt", DateTime.UtcNow),
                 PatchOperation.Set("/resolution", "exact_membership_and_account_readback_verified")],
                new PatchItemRequestOptions { IfMatchEtag = Text(row, "_etag") });
    }

    var auditRows = (await ReadAllAsync("SecurityAuditEvents")).Where(row => Text(row, "id") == reconciliationId).ToArray();
    if (auditRows.Length > 1)
        throw new InvalidOperationException("synthetic switch fixture reconciliation audit is ambiguous");
    if (auditRows.Length == 1)
    {
        var audit = auditRows[0];
        if (Text(audit, "auditPartition") != "global" || Text(audit, "targetUserId") != syntheticUserId ||
            Text(audit, "targetTenantUid") != tenantUid || Text(audit, "membershipId") != membershipId ||
            Text(audit, "requestId") != "V2.8.63CRST" || Text(audit, "requestedMembershipStatus") != requestedStatus ||
            Text(audit, "eventType") is not
                ("identity_synthetic_switch_fixture_reconciliation_required" or "identity_synthetic_switch_fixture_reconciled") ||
            Text(audit, "result") is not ("failed_closed" or "resolved") || string.IsNullOrWhiteSpace(Text(audit, "_etag")))
            throw new InvalidOperationException("synthetic switch fixture reconciliation audit failed integrity validation");
        if (Text(audit, "result") == "failed_closed")
            await database.GetContainer("SecurityAuditEvents").PatchItemAsync<object>(reconciliationId, new("global"),
                [PatchOperation.Set("/eventType", "identity_synthetic_switch_fixture_reconciled"),
                 PatchOperation.Set("/result", "resolved"), PatchOperation.Set("/resolvedAt", DateTime.UtcNow),
                 PatchOperation.Set("/updatedAt", DateTime.UtcNow),
                 PatchOperation.Set("/resolution", "exact_membership_and_account_readback_verified")],
                new PatchItemRequestOptions { IfMatchEtag = Text(audit, "_etag") });
    }
}

async Task ResolveSyntheticCleanupReconciliationAsync(string syntheticUserId, string cleanupPendingAuditId)
{
    var reconciliationId = $"crst-synthetic-cleanup-reconcile-{syntheticUserId}";
    var migrationRows = (await ReadAllAsync("IdentityMigration")).Where(row => Text(row, "id") == reconciliationId).ToArray();
    if (migrationRows.Length > 1)
        throw new InvalidOperationException("synthetic cleanup reconciliation row is ambiguous");
    if (migrationRows.Length == 1)
    {
        var row = migrationRows[0];
        if (Text(row, "migrationPartition") != "global" ||
            Text(row, "type") != "IdentitySecurityMutationReconciliation" ||
            Text(row, "targetUserId") != syntheticUserId ||
            Text(row, "mutationType") != "V2.8.63CRST-synthetic-cleanup" ||
            Text(row, "status") is not ("Pending" or "Resolved") || string.IsNullOrWhiteSpace(Text(row, "_etag")))
            throw new InvalidOperationException("synthetic cleanup reconciliation row failed integrity validation");
        if (Text(row, "status") == "Pending")
            await database.GetContainer("IdentityMigration").PatchItemAsync<object>(reconciliationId, new("global"),
                [PatchOperation.Set("/status", "Resolved"), PatchOperation.Set("/resolvedAt", DateTime.UtcNow),
                 PatchOperation.Set("/resolution", "exact_cleanup_and_inactive_handoff_verified")],
                new PatchItemRequestOptions { IfMatchEtag = Text(row, "_etag") });
    }

    var auditRows = (await ReadAllAsync("SecurityAuditEvents")).Where(row => Text(row, "id") == reconciliationId).ToArray();
    if (auditRows.Length > 1)
        throw new InvalidOperationException("synthetic cleanup reconciliation audit is ambiguous");
    if (auditRows.Length == 1)
    {
        var audit = auditRows[0];
        if (Text(audit, "auditPartition") != "global" || Text(audit, "targetUserId") != syntheticUserId ||
            Text(audit, "requestId") != "V2.8.63CRST" || Text(audit, "pendingAuditId") != cleanupPendingAuditId ||
            Text(audit, "eventType") is not
                ("identity_synthetic_validation_cleanup_reconciliation_required" or "identity_synthetic_validation_cleanup_reconciled") ||
            Text(audit, "result") is not ("failed_closed" or "resolved") || string.IsNullOrWhiteSpace(Text(audit, "_etag")))
            throw new InvalidOperationException("synthetic cleanup reconciliation audit failed integrity validation");
        if (Text(audit, "result") == "failed_closed")
            await database.GetContainer("SecurityAuditEvents").PatchItemAsync<object>(reconciliationId, new("global"),
                [PatchOperation.Set("/eventType", "identity_synthetic_validation_cleanup_reconciled"),
                 PatchOperation.Set("/result", "resolved"), PatchOperation.Set("/resolvedAt", DateTime.UtcNow),
                 PatchOperation.Set("/resolution", "exact_cleanup_and_inactive_handoff_verified")],
                new PatchItemRequestOptions { IfMatchEtag = Text(audit, "_etag") });
    }
}

static JsonObject ContactUserDocument(JsonObject source)
{
    var clone = JsonNode.Parse(source.ToJsonString())?.AsObject()
        ?? throw new InvalidOperationException("contact settings document cannot be cloned");
    foreach (var systemProperty in new[] { "_rid", "_self", "_etag", "_attachments", "_ts" })
        clone.Remove(systemProperty);
    return clone;
}

static JsonObject ContactCustomerProjection(JsonObject source, string syntheticNormalizedEmail, bool removeSyntheticRecipient)
{
    var projection = ContactUserDocument(source);
    projection.Remove("updatedAt");
    projection.Remove("updatedByUserId");
    if (!removeSyntheticRecipient || projection["recipients"] is not JsonArray recipients) return projection;
    var retained = new JsonArray();
    foreach (var node in recipients)
    {
        if (node is JsonObject recipient)
        {
            var recipientEmail = Text(recipient, "normalizedEmail");
            if (string.IsNullOrWhiteSpace(recipientEmail))
                recipientEmail = IdentitySecurityService.NormalizeEmail(Text(recipient, "email"));
            if (string.Equals(recipientEmail, syntheticNormalizedEmail, StringComparison.Ordinal)) continue;
        }
        retained.Add(node?.DeepClone());
    }
    projection["recipients"] = retained;
    return projection;
}

static (int Count, bool AllInactive) SyntheticContactRecipientState(JsonObject source, string syntheticNormalizedEmail)
{
    if (source["recipients"] is not JsonArray recipients) return (0, true);
    var matches = recipients.OfType<JsonObject>().Where(recipient =>
    {
        var recipientEmail = Text(recipient, "normalizedEmail");
        if (string.IsNullOrWhiteSpace(recipientEmail))
            recipientEmail = IdentitySecurityService.NormalizeEmail(Text(recipient, "email"));
        return string.Equals(recipientEmail, syntheticNormalizedEmail, StringComparison.Ordinal);
    }).ToArray();
    return (matches.Length, matches.All(recipient => ExplicitFalse(recipient, "isActive")));
}

static bool WithinAcceptanceWindow(JsonObject source, string property, DateTimeOffset start, DateTimeOffset end) =>
    DateTimeOffset.TryParse(Text(source, property), out var timestamp) && timestamp >= start && timestamp <= end;

static (string Purpose, string LegacyTenantId, string MembershipStatus, string TenantUid)[] ResolveSyntheticTenantFixtures(IReadOnlyList<JsonObject> tenants)
{
    var specifications = new[]
    {
        (Purpose: "home", LegacyTenantId: "party-pros-philadelphia", MembershipStatus: "Active"),
        (Purpose: "switch-target", LegacyTenantId: "ice-rink-rentals", MembershipStatus: "Active"),
        (Purpose: "stage4-add-target", LegacyTenantId: "strip-club-near-me-vegas", MembershipStatus: "Active")
    };
    var result = new List<(string Purpose, string LegacyTenantId, string MembershipStatus, string TenantUid)>();
    foreach (var specification in specifications)
    {
        if (specification.LegacyTenantId.Contains("airstrip", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Airstrip cannot be used for synthetic identity validation");
        var candidates = tenants.Where(x =>
            string.Equals(Text(x, "legacyTenantId"), specification.LegacyTenantId, StringComparison.Ordinal) ||
            string.Equals(Text(x, "canonicalSlug"), specification.LegacyTenantId, StringComparison.Ordinal)).ToArray();
        if (candidates.Length != 1 ||
            !string.Equals(Text(candidates[0], "legacyTenantId"), specification.LegacyTenantId, StringComparison.Ordinal) ||
            !string.Equals(Text(candidates[0], "canonicalSlug"), specification.LegacyTenantId, StringComparison.Ordinal) ||
            !string.Equals(Text(candidates[0], "status"), "active", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"approved synthetic tenant {specification.LegacyTenantId} is unavailable, inactive, renamed, or ambiguous");
        var tenantUid = Text(candidates[0], "tenantUid");
        var boundaryText = string.Join('|', Text(candidates[0], "legacyTenantId"), Text(candidates[0], "canonicalSlug"), Text(candidates[0], "displayName"));
        if (string.IsNullOrWhiteSpace(tenantUid) || boundaryText.Contains("airstrip", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("synthetic tenant is outside the approved non-Airstrip boundary");
        result.Add((specification.Purpose, specification.LegacyTenantId, specification.MembershipStatus, tenantUid));
    }
    if (result.Select(x => x.TenantUid).Distinct(StringComparer.Ordinal).Count() != specifications.Length)
        throw new InvalidOperationException("approved synthetic tenant UIDs are not unique");
    return result.ToArray();
}

async Task<ToolAdminInvariantLease> AcquireToolAdminInvariantLeaseAsync(string operation)
{
    const string lockId = "tenant-admin-invariant-global-lock";
    const string partition = "global";
    var ownerId = Guid.NewGuid().ToString("N");
    var acquiredAt = DateTime.UtcNow;
    var container = database.GetContainer("IdentityRequests");
    JsonObject NewDocument(DateTime timestamp) => new()
    {
        ["id"] = lockId,
        ["requestPartition"] = partition,
        ["type"] = "TenantAdminInvariantLock",
        ["ownerId"] = ownerId,
        ["operation"] = operation,
        ["acquiredAt"] = acquiredAt,
        ["renewedAt"] = timestamp,
        ["expiresAt"] = timestamp.AddMinutes(2)
    };
    async Task<JsonObject?> ReadLockAsync(CancellationToken token)
    {
        try
        {
            return (await container.ReadItemAsync<JsonObject>(lockId, new(partition), cancellationToken: token)).Resource;
        }
        catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.NotFound) { return null; }
    }
    try
    {
        await container.CreateItemAsync(NewDocument(acquiredAt), new(partition));
    }
    catch (CosmosException error) when (error.StatusCode == System.Net.HttpStatusCode.Conflict)
    {
        var existing = await ReadLockAsync(CancellationToken.None);
        var expiresAt = existing is null || !DateTimeOffset.TryParse(Text(existing, "expiresAt"), out var parsed)
            ? DateTimeOffset.MaxValue
            : parsed;
        if (existing is null || expiresAt > DateTimeOffset.UtcNow || string.IsNullOrWhiteSpace(Text(existing, "_etag")))
            throw new InvalidOperationException("tenant administration invariant is busy; retry the synthetic operation");
        try
        {
            await container.ReplaceItemAsync(NewDocument(acquiredAt), lockId, new(partition),
                new ItemRequestOptions { IfMatchEtag = Text(existing, "_etag") });
        }
        catch (CosmosException replaceError) when (replaceError.StatusCode is System.Net.HttpStatusCode.PreconditionFailed or System.Net.HttpStatusCode.Conflict)
        {
            throw new InvalidOperationException("tenant administration invariant was acquired concurrently; retry the synthetic operation", replaceError);
        }
    }

    async Task RecordLeaseFailureAsync(string stage, Exception error)
    {
        try
        {
            await database.GetContainer("IdentityMigration").UpsertItemAsync(new
            {
                id = $"crst-admin-invariant-{stage}-{ownerId}", migrationPartition = "global",
                type = "IdentitySecurityMutationReconciliation", targetUserId = ownerId,
                mutationType = $"V2.8.63CRST-admin-invariant-{stage}", errorCode = error.GetType().Name,
                status = "Pending", createdAt = DateTime.UtcNow
            }, new("global"));
        }
        catch { }
    }

    var lease = new ToolAdminInvariantLease(ownerId, async token =>
    {
        try
        {
            var current = await ReadLockAsync(token);
            if (current is null || Text(current, "ownerId") != ownerId || string.IsNullOrWhiteSpace(Text(current, "_etag"))) return false;
            await container.ReplaceItemAsync(NewDocument(DateTime.UtcNow), lockId, new(partition),
                new ItemRequestOptions { IfMatchEtag = Text(current, "_etag") }, token);
            return true;
        }
        catch (Exception renewalError)
        {
            await RecordLeaseFailureAsync("renewal", renewalError);
            return false;
        }
    }, async token =>
    {
        var current = await ReadLockAsync(token);
        if (current is null || Text(current, "ownerId") != ownerId ||
            !DateTimeOffset.TryParse(Text(current, "expiresAt"), out var expiry) || expiry <= DateTimeOffset.UtcNow)
            throw new InvalidOperationException("synthetic operation lost the tenant administration invariant lease");
    }, async () =>
    {
        try
        {
            var current = await ReadLockAsync(CancellationToken.None);
            if (current is null || Text(current, "ownerId") != ownerId) return;
            await container.DeleteItemAsync<object>(lockId, new(partition),
                new ItemRequestOptions { IfMatchEtag = Text(current, "_etag") }, CancellationToken.None);
        }
        catch (Exception releaseError) { await RecordLeaseFailureAsync("release", releaseError); }
    });
    lease.Start();
    await lease.EnsureOwnedAsync();
    return lease;
}

static string CreateTemporaryPassword()
{
    const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const string lower = "abcdefghijkmnopqrstuvwxyz";
    const string digit = "23456789";
    const string symbol = "!@$%*-_+";
    const string all = upper + lower + digit + symbol;
    var chars = new List<char> { upper[RandomNumberGenerator.GetInt32(upper.Length)], lower[RandomNumberGenerator.GetInt32(lower.Length)], digit[RandomNumberGenerator.GetInt32(digit.Length)], symbol[RandomNumberGenerator.GetInt32(symbol.Length)] };
    while (chars.Count < 24) chars.Add(all[RandomNumberGenerator.GetInt32(all.Length)]);
    for (var index = chars.Count - 1; index > 0; index--)
    {
        var swap = RandomNumberGenerator.GetInt32(index + 1);
        (chars[index], chars[swap]) = (chars[swap], chars[index]);
    }
    return new string(chars.ToArray());
}

static string ValidateCredentialHandoffPath(string candidate, string evidenceOutput)
{
    if (!OperatingSystem.IsWindows())
        throw new PlatformNotSupportedException("the CRST credential handoff requires owner-only Windows ACL enforcement");
    if (!Path.IsPathFullyQualified(candidate))
        throw new InvalidOperationException("synthetic credential handoff path must be absolute");
    var fullPath = Path.GetFullPath(candidate);
    var outputPath = Path.GetFullPath(evidenceOutput);
    var repositoryRoot = FindRepositoryRoot(Directory.GetCurrentDirectory()) ?? FindRepositoryRoot(outputPath)
        ?? throw new InvalidOperationException("repository root could not be resolved for credential-path isolation");
    if (PathIsWithin(fullPath, repositoryRoot) || PathIsWithin(fullPath, outputPath))
        throw new InvalidOperationException("synthetic credential handoff must be outside the repository and evidence output");
    var rootLength = Path.GetPathRoot(fullPath)?.Length ?? 0;
    if (fullPath.AsSpan(rootLength).Contains(':'))
        throw new InvalidOperationException("synthetic credential handoff cannot use an alternate data stream");
    var parent = Path.GetDirectoryName(fullPath);
    if (string.IsNullOrWhiteSpace(parent) || !Directory.Exists(parent))
        throw new InvalidOperationException("synthetic credential handoff directory must already exist");
    EnsureNoReparseDirectoryChain(parent);
    VerifyOwnerOnlyDirectoryAcl(parent);
    if ((File.Exists(fullPath) || Directory.Exists(fullPath)) &&
        (File.GetAttributes(fullPath) & FileAttributes.ReparsePoint) != 0)
        throw new InvalidOperationException("synthetic credential handoff cannot be a reparse point");
    return fullPath;
}

static string ValidateRestrictedBackupDirectory(string candidate, string evidenceOutput)
{
    if (!OperatingSystem.IsWindows())
        throw new PlatformNotSupportedException("restricted rollback backup requires owner-only Windows ACL enforcement");
    if (!Path.IsPathFullyQualified(candidate))
        throw new InvalidOperationException("restricted rollback path must be absolute");
    var fullPath = Path.GetFullPath(candidate);
    var outputPath = Path.GetFullPath(evidenceOutput);
    var repositoryRoot = FindRepositoryRoot(Directory.GetCurrentDirectory()) ?? FindRepositoryRoot(outputPath)
        ?? throw new InvalidOperationException("repository root could not be resolved for restricted rollback isolation");
    if (PathIsWithin(fullPath, repositoryRoot) || PathIsWithin(fullPath, outputPath) || PathIsWithin(outputPath, fullPath))
        throw new InvalidOperationException("restricted rollback must be outside the repository and ordinary evidence output");
    var rootLength = Path.GetPathRoot(fullPath)?.Length ?? 0;
    if (fullPath.AsSpan(rootLength).Contains(':'))
        throw new InvalidOperationException("restricted rollback cannot use an alternate data stream");
    if (File.Exists(fullPath) || Directory.Exists(fullPath))
        throw new InvalidOperationException("restricted rollback target must be a new directory");
    var parent = Path.GetDirectoryName(fullPath);
    if (string.IsNullOrWhiteSpace(parent) || !Directory.Exists(parent))
        throw new InvalidOperationException("restricted rollback parent directory must already exist");
    EnsureNoReparseDirectoryChain(parent);
    VerifyOwnerOnlyDirectoryAcl(parent);
    return fullPath;
}

static string? FindRepositoryRoot(string start)
{
    var current = new DirectoryInfo(Directory.Exists(start) ? start : Path.GetDirectoryName(start)!);
    while (current is not null)
    {
        if (Directory.Exists(Path.Combine(current.FullName, ".git")) || File.Exists(Path.Combine(current.FullName, ".git")))
            return current.FullName;
        current = current.Parent;
    }
    return null;
}

static bool PathIsWithin(string candidate, string root)
{
    var relative = Path.GetRelativePath(Path.GetFullPath(root), Path.GetFullPath(candidate));
    return relative == "." || !Path.IsPathRooted(relative) && relative != ".." &&
        !relative.StartsWith($"..{Path.DirectorySeparatorChar}", StringComparison.Ordinal) &&
        !relative.StartsWith($"..{Path.AltDirectorySeparatorChar}", StringComparison.Ordinal);
}

static void EnsureNoReparseDirectoryChain(string directory)
{
    for (var current = new DirectoryInfo(Path.GetFullPath(directory)); current is not null; current = current.Parent)
        if ((current.Attributes & FileAttributes.ReparsePoint) != 0)
            throw new InvalidOperationException("synthetic credential handoff directory chain contains a reparse point");
}

static void EnsureOwnerOnlyDirectory(string path)
{
    var fullPath = Path.GetFullPath(path);
    if (File.Exists(fullPath)) throw new InvalidOperationException("restricted rollback path is not a directory");
    if (Directory.Exists(fullPath))
    {
        if ((File.GetAttributes(fullPath) & FileAttributes.ReparsePoint) != 0)
            throw new InvalidOperationException("restricted rollback directory cannot be a reparse point");
        VerifyOwnerOnlyDirectoryAcl(fullPath);
        return;
    }
    var parent = Path.GetDirectoryName(fullPath);
    if (string.IsNullOrWhiteSpace(parent) || !Directory.Exists(parent))
        throw new InvalidOperationException("restricted rollback parent directory must already exist");
    EnsureNoReparseDirectoryChain(parent);
    var owner = CurrentOwnerSid();
    var security = new DirectorySecurity();
    security.SetOwner(owner);
    security.SetAccessRuleProtection(isProtected: true, preserveInheritance: false);
    security.AddAccessRule(new FileSystemAccessRule(owner, FileSystemRights.FullControl,
        InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
    FileSystemAclExtensions.Create(new DirectoryInfo(fullPath), security);
    VerifyOwnerOnlyDirectoryAcl(fullPath);
}

static SecurityIdentifier CurrentOwnerSid() => WindowsIdentity.GetCurrent().User
    ?? throw new InvalidOperationException("current Windows owner SID is unavailable");

static void VerifyOwnerOnlyFileAcl(string path)
{
    var owner = CurrentOwnerSid();
    var security = new FileInfo(path).GetAccessControl(AccessControlSections.Owner | AccessControlSections.Access);
    var actualOwner = security.GetOwner(typeof(SecurityIdentifier)) as SecurityIdentifier;
    var rules = security.GetAccessRules(includeExplicit: true, includeInherited: true, typeof(SecurityIdentifier))
        .OfType<FileSystemAccessRule>().ToArray();
    if (actualOwner is null || !owner.Equals(actualOwner) || !security.AreAccessRulesProtected || rules.Length != 1 ||
        rules[0].IsInherited || rules[0].AccessControlType != AccessControlType.Allow ||
        !owner.Equals(rules[0].IdentityReference) ||
        (rules[0].FileSystemRights & FileSystemRights.FullControl) != FileSystemRights.FullControl)
        throw new InvalidOperationException("synthetic credential handoff ACL is not owner-only");
}

static void VerifyOwnerOnlyDirectoryAcl(string path)
{
    var owner = CurrentOwnerSid();
    var security = new DirectoryInfo(path).GetAccessControl(AccessControlSections.Owner | AccessControlSections.Access);
    var actualOwner = security.GetOwner(typeof(SecurityIdentifier)) as SecurityIdentifier;
    var rules = security.GetAccessRules(includeExplicit: true, includeInherited: true, typeof(SecurityIdentifier))
        .OfType<FileSystemAccessRule>().ToArray();
    if (actualOwner is null || !owner.Equals(actualOwner) || !security.AreAccessRulesProtected || rules.Length != 1 ||
        rules[0].IsInherited || rules[0].AccessControlType != AccessControlType.Allow ||
        !owner.Equals(rules[0].IdentityReference) ||
        (rules[0].FileSystemRights & FileSystemRights.FullControl) != FileSystemRights.FullControl)
        throw new InvalidOperationException("synthetic credential handoff directory ACL is not owner-only");
}

static async Task WriteNewRestrictedJsonAsync(string path, object value)
{
    if (File.Exists(path) || Directory.Exists(path))
        throw new InvalidOperationException("synthetic credential handoff target already exists");
    var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
    try
    {
        var owner = CurrentOwnerSid();
        var security = new FileSecurity();
        security.SetOwner(owner);
        security.SetAccessRuleProtection(isProtected: true, preserveInheritance: false);
        security.AddAccessRule(new FileSystemAccessRule(owner, FileSystemRights.FullControl, AccessControlType.Allow));
        await using (var stream = FileSystemAclExtensions.Create(new FileInfo(path), FileMode.CreateNew,
            FileSystemRights.FullControl, FileShare.None, 4096, FileOptions.WriteThrough | FileOptions.SequentialScan, security))
        {
            if ((File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0)
                throw new InvalidOperationException("synthetic credential handoff became a reparse point");
            VerifyOwnerOnlyFileAcl(path);
            await stream.WriteAsync(bytes);
            await stream.FlushAsync();
            stream.Flush(flushToDisk: true);
        }
        VerifyOwnerOnlyFileAcl(path);
    }
    catch
    {
        try { if (File.Exists(path)) File.Delete(path); } catch { }
        throw;
    }
}

static async Task<CredentialHandoffState> CreateActiveCredentialHandoffAsync(
    string candidate,
    string evidenceOutput,
    string syntheticUserId,
    string email,
    string temporaryPassword,
    DateTime createdAt)
{
    var path = ValidateCredentialHandoffPath(candidate, evidenceOutput);
    await WriteNewRestrictedJsonAsync(path, new
    {
        phase = "V2.8.63CRST", syntheticUserId, email, temporaryPassword,
        forcePasswordChange = true, active = true, createdAt
    });
    return await ReadActiveCredentialHandoffAsync(path, evidenceOutput, syntheticUserId, email);
}

static async Task<CredentialHandoffState> ReadActiveCredentialHandoffAsync(
    string candidate,
    string evidenceOutput,
    string syntheticUserId,
    string email)
{
    var path = ValidateCredentialHandoffPath(candidate, evidenceOutput);
    if (!File.Exists(path) || (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0)
        throw new InvalidOperationException("synthetic credential handoff is missing or unsafe");
    VerifyOwnerOnlyFileAcl(path);
    byte[] bytes;
    await using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 4096,
        FileOptions.SequentialScan))
    {
        if (stream.Length is <= 0 or > 65536)
            throw new InvalidOperationException("synthetic credential handoff size is invalid");
        using var buffer = new MemoryStream((int)stream.Length);
        await stream.CopyToAsync(buffer);
        bytes = buffer.ToArray();
    }
    using var document = JsonDocument.Parse(bytes);
    var root = document.RootElement;
    string RequiredString(string name) => root.TryGetProperty(name, out var property) && property.ValueKind == JsonValueKind.String
        ? property.GetString() ?? string.Empty
        : string.Empty;
    bool RequiredBoolean(string name) => root.TryGetProperty(name, out var property) && property.ValueKind is JsonValueKind.True or JsonValueKind.False && property.GetBoolean();
    var password = RequiredString("temporaryPassword");
    var propertyNames = root.ValueKind == JsonValueKind.Object
        ? root.EnumerateObject().Select(property => property.Name).ToHashSet(StringComparer.Ordinal)
        : [];
    var expectedProperties = new HashSet<string>(StringComparer.Ordinal)
    {
        "phase", "syntheticUserId", "email", "temporaryPassword", "forcePasswordChange", "active", "createdAt"
    };
    if (root.ValueKind != JsonValueKind.Object || RequiredString("phase") != "V2.8.63CRST" ||
        RequiredString("syntheticUserId") != syntheticUserId || RequiredString("email") != email ||
        !RequiredBoolean("active") || !RequiredBoolean("forcePasswordChange") || string.IsNullOrWhiteSpace(password) ||
        !propertyNames.SetEquals(expectedProperties) || !root.TryGetProperty("createdAt", out var createdAt) ||
        createdAt.ValueKind != JsonValueKind.String || !DateTimeOffset.TryParse(createdAt.GetString(), out _))
        throw new InvalidOperationException("synthetic credential handoff does not match the active CRST identity");
    VerifyOwnerOnlyFileAcl(path);
    return new(path, Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(), password);
}

static async Task<CredentialCleanupHandoffState> ReadCredentialHandoffForCleanupAsync(
    string candidate,
    string evidenceOutput,
    string syntheticUserId,
    string email)
{
    var path = ValidateCredentialHandoffPath(candidate, evidenceOutput);
    if (!File.Exists(path) || (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0)
        throw new InvalidOperationException("synthetic credential handoff is missing or unsafe");
    VerifyOwnerOnlyFileAcl(path);
    var bytes = await File.ReadAllBytesAsync(path);
    if (bytes.Length is <= 0 or > 65536) throw new InvalidOperationException("synthetic credential handoff size is invalid");
    using var document = JsonDocument.Parse(bytes);
    var root = document.RootElement;
    if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("active", out var activeProperty) ||
        activeProperty.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
        throw new InvalidOperationException("synthetic credential handoff state is invalid");
    if (activeProperty.GetBoolean())
        return new(true, await ReadActiveCredentialHandoffAsync(path, evidenceOutput, syntheticUserId, email));

    var names = root.EnumerateObject().Select(property => property.Name).ToHashSet(StringComparer.Ordinal);
    var expected = new HashSet<string>(StringComparer.Ordinal)
    {
        "phase", "syntheticUserId", "email", "active", "secretRemoved", "invalidatedAt"
    };
    if (!names.SetEquals(expected) || root.GetProperty("phase").GetString() != "V2.8.63CRST" ||
        root.GetProperty("syntheticUserId").GetString() != syntheticUserId || root.GetProperty("email").GetString() != email ||
        !root.GetProperty("secretRemoved").GetBoolean() ||
        root.GetProperty("invalidatedAt").ValueKind != JsonValueKind.String ||
        !DateTimeOffset.TryParse(root.GetProperty("invalidatedAt").GetString(), out _))
        throw new InvalidOperationException("inactive synthetic credential handoff does not match the completed CRST identity");
    VerifyOwnerOnlyFileAcl(path);
    return new(false, null);
}

static async Task ReplaceActiveCredentialHandoffAsync(
    CredentialHandoffState expected,
    string evidenceOutput,
    string syntheticUserId,
    string email,
    DateTime invalidatedAt)
{
    var current = await ReadActiveCredentialHandoffAsync(expected.FullPath, evidenceOutput, syntheticUserId, email);
    if (current.ContentSha256 != expected.ContentSha256 ||
        !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(current.TemporaryPassword), Encoding.UTF8.GetBytes(expected.TemporaryPassword)))
        throw new InvalidOperationException("synthetic credential handoff changed before invalidation");
    var temporaryPath = expected.FullPath + $".inactive-{Guid.NewGuid():N}.tmp";
    ValidateCredentialHandoffPath(temporaryPath, evidenceOutput);
    try
    {
        await WriteNewRestrictedJsonAsync(temporaryPath, new
        {
            phase = "V2.8.63CRST", syntheticUserId, email,
            active = false, secretRemoved = true, invalidatedAt
        });
        var immediatelyCurrent = await ReadActiveCredentialHandoffAsync(expected.FullPath, evidenceOutput, syntheticUserId, email);
        if (immediatelyCurrent.ContentSha256 != expected.ContentSha256)
            throw new InvalidOperationException("synthetic credential handoff changed during invalidation");
        File.Replace(temporaryPath, expected.FullPath, destinationBackupFileName: null, ignoreMetadataErrors: false);
        VerifyOwnerOnlyFileAcl(expected.FullPath);
        using var inactive = JsonDocument.Parse(await File.ReadAllBytesAsync(expected.FullPath));
        var root = inactive.RootElement;
        if (root.GetProperty("phase").GetString() != "V2.8.63CRST" ||
            root.GetProperty("syntheticUserId").GetString() != syntheticUserId || root.GetProperty("email").GetString() != email ||
            root.GetProperty("active").GetBoolean() || !root.GetProperty("secretRemoved").GetBoolean() ||
            root.TryGetProperty("temporaryPassword", out _))
            throw new InvalidOperationException("synthetic credential handoff invalidation readback failed");
    }
    finally
    {
        try { if (File.Exists(temporaryPath)) File.Delete(temporaryPath); } catch { }
    }
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
object SanitizeTenant(JsonObject x, byte[] digestKey) => new
{
    recordDigest = OpaqueDigest(digestKey, "tenant", Text(x, "id"), Text(x, "tenantId")),
    status = Text(x, "status"),
    contactEmailPresent = !string.IsNullOrWhiteSpace(Text(x["contact"] as JsonObject, "email")),
    contactEmailDigest = OpaqueDigest(digestKey, "tenant-contact", Text(x["contact"] as JsonObject, "email"))
};
object SanitizeUser(JsonObject x, byte[] digestKey) => new
{
    recordDigest = OpaqueDigest(digestKey, "user", Text(x, "id"), Text(x, "tenantId")),
    tenantDigest = OpaqueDigest(digestKey, "tenant", Text(x, "tenantId")),
    emailDigest = OpaqueDigest(digestKey, "email", IdentitySecurityService.NormalizeEmail(Text(x, "email"))),
    role = Role(x), isActive = Bool(x, "isActive", true), passwordHashPresent = Text(x, "passwordHash").Length > 0
};
object SanitizeFormReference(JsonObject x, byte[] digestKey)
{
    var references = new[]
    {
        Text(x, "leadRecipientRef"), Text(x, "notificationEmailRef"), Text(x["routing"] as JsonObject, "recipientGroupRef")
    }.Where(value => !string.IsNullOrWhiteSpace(value)).ToArray();
    return new
    {
        recordDigest = OpaqueDigest(digestKey, "form-definition", Text(x, "id"), Text(x, "tenantId"), Text(x, "formKey")),
        tenantDigest = OpaqueDigest(digestKey, "tenant", Text(x, "tenantId")),
        referenceCount = references.Length,
        referenceDigests = references.Select(reference => OpaqueDigest(digestKey, "notification-reference", reference)).ToArray()
    };
}
static string[] FormReferences(IEnumerable<JsonObject> definitions, string tenantId) => definitions.Where(x => Text(x, "tenantId") == tenantId).SelectMany(x => new[] { Text(x, "leadRecipientRef"), Text(x, "notificationEmailRef"), Text(x["routing"] as JsonObject, "recipientGroupRef") }).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.Ordinal).OrderBy(x => x, StringComparer.Ordinal).ToArray();
string Role(JsonObject x) => x["role"] is JsonValue value && value.TryGetValue<int>(out var number) ? ((UserRole)number).ToString() : Text(x, "role", "Viewer");
static string Text(JsonObject? x, string name, string fallback = "") => x?[name]?.GetValue<string>() ?? fallback;
static bool Bool(JsonObject x, string name, bool fallback) => x[name] is JsonValue value && value.TryGetValue<bool>(out var result) ? result : fallback;
static bool ExplicitFalse(JsonObject x, string name) => x[name] is JsonValue value && value.TryGetValue<bool>(out var result) && !result;
static long Number(JsonObject x, string name, long fallback) => x[name] is JsonValue value && value.TryGetValue<long>(out var result) ? result : fallback;
static string SafeDigest(params string[] values) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", values)))).ToLowerInvariant();
static string OpaqueDigest(byte[] key, params string[] values) =>
    Convert.ToHexString(HMACSHA256.HashData(key, Encoding.UTF8.GetBytes(string.Join("\n", values)))).ToLowerInvariant();
static async Task WriteJsonAsync(string path, object value) => await File.WriteAllTextAsync(path, JsonSerializer.Serialize(value, new JsonSerializerOptions { WriteIndented = true }));
static async Task WriteChecksumManifestAsync(string root, IReadOnlyCollection<string> expectedFiles)
{
    var rootPath = Path.GetFullPath(root);
    var manifest = expectedFiles.Select(Path.GetFullPath).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x, StringComparer.OrdinalIgnoreCase).Select(x =>
    {
        if (!PathIsWithin(x, rootPath) || !File.Exists(x) || (File.GetAttributes(x) & FileAttributes.ReparsePoint) != 0)
            throw new InvalidOperationException("checksum input is missing, outside the evidence root, or a reparse point");
        return new { path = Path.GetRelativePath(rootPath, x).Replace('\\', '/'), sha256 = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(x))).ToLowerInvariant(), bytes = new FileInfo(x).Length };
    }).ToArray();
    await WriteJsonAsync(Path.Combine(root, "checksums.json"), manifest);
}

sealed record CredentialHandoffState(string FullPath, string ContentSha256, string TemporaryPassword);
sealed record CredentialCleanupHandoffState(bool Active, CredentialHandoffState? ActiveState);

sealed class ToolAdminInvariantLease(
    string ownerId,
    Func<CancellationToken, Task<bool>> renew,
    Func<CancellationToken, Task> ensureOwned,
    Func<Task> release) : IAsyncDisposable
{
    private readonly CancellationTokenSource _stop = new();
    private readonly CancellationTokenSource _lost = new();
    private Task? _renewal;
    private int _disposed;
    public string OwnerId { get; } = ownerId;

    public void Start() => _renewal = RenewAsync();

    public async Task EnsureOwnedAsync()
    {
        if (_lost.IsCancellationRequested) throw new InvalidOperationException("tenant administration invariant lease was lost");
        await ensureOwned(_lost.Token);
    }

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
