using System.Text.Json;
using pumpkin_api.Services;
using pumpkin_api.Services.TenantRedirects;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class TenantRedirectSourceTestRunner
{
    private const string TenantId = "redirect-fixture";

    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.62DRT tenant redirect source tests");

        Assert(TenantRedirectAuthorization.CanAccess("SuperAdmin", "platform", TenantId), "SuperAdmin can access any tenant redirect");
        Assert(TenantRedirectAuthorization.CanAccess("TenantAdmin", TenantId, TenantId), "TenantAdmin can access its own tenant redirects");
        Assert(!TenantRedirectAuthorization.CanAccess("TenantAdmin", "other-tenant", TenantId), "TenantAdmin cross-tenant access is denied");
        Assert(!TenantRedirectAuthorization.CanAccess("Operator", TenantId, TenantId), "unsupported roles are denied");

        var database = BuildDatabase();
        var request = Request("/old/path/", "/target/path?fixed=1#details", pageShadowMode: "redirect_precedes_page");
        var validation = await TenantRedirectValidationService.ValidateAsync(database, TenantId, request);
        Assert(validation.Valid && validation.Persistable, "distinct internal redirect validates");
        Assert(validation.NormalizedSourcePath == "/old/path", "source path normalization preserves route segments");
        Assert(validation.NormalizedTarget == "/target/path?fixed=1#details", "target query and client fragment are preserved");
        Assert(validation.TargetExists && validation.TargetResolutionStatus == "resolved", "internal target resolves to a tenant page");
        Assert(validation.ShadowedPageSlug == "old-path", "page shadow relationship is visible");
        Assert(
            !TenantRedirectNormalizer.TryNormalizeSourcePath("https://example.test/old", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath("//example.test/old", out _, out _),
            "absolute and protocol-relative source URLs are rejected without platform-specific file URI parsing");
        Assert(
            TenantRedirectNormalizer.TryNormalizeSourcePath("/guides/couples-night", out var linuxStyleRoute, out _) &&
            linuxStyleRoute == "/guides/couples-night" &&
            TenantRedirectNormalizer.TryNormalizeTarget("/path?query=value", "internal", out var queryTarget, out _, out _, out _) &&
            queryTarget == "/path?query=value",
            "leading-slash URL routes and query-bearing internal targets are accepted consistently");
        Assert(
            !TenantRedirectNormalizer.TryNormalizeSourcePath(@"C:\local\path", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath(@"\\server\share", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath(@"\rooted\path", out _, out _),
            "Windows drive, UNC, and rooted backslash paths are rejected");
        Assert(
            !TenantRedirectNormalizer.TryNormalizeSourcePath("file:///etc/passwd", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath("ftp://example.test/old", out _, out _),
            "file URIs and unsupported URI schemes are rejected");
        Assert(
            !TenantRedirectNormalizer.TryNormalizeSourcePath("../path", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath("/../../path", out _, out _) &&
            !TenantRedirectNormalizer.TryNormalizeSourcePath("/path\0control", out _, out _),
            "relative traversal, rooted traversal, and control characters are rejected");
        Assert(
            !TenantRedirectNormalizer.TryNormalizeTarget("https://example.test/target", "internal", out _, out _, out _, out _),
            "absolute target URL requires explicit external classification");

        var created = TenantRedirectMutation.PrepareForCreate(TenantId, request, validation, "source-test-admin");
        await database.CreateTenantRedirectAsync(TenantId, created);
        Assert((await database.GetTenantRedirectAsync(TenantId, created.Id))?.SourcePath == "/old/path", "created redirect reads back by tenant");
        Assert((await database.GetTenantRedirectAsync("other-tenant", created.Id)) == null, "redirect does not read across tenants");

        var replay = await TenantRedirectValidationService.ValidateAsync(database, TenantId, request);
        Assert(replay.Valid && replay.IdempotentMatchId == created.Id, "identical create request is an idempotent replay");

        var duplicate = await TenantRedirectValidationService.ValidateAsync(
            database,
            TenantId,
            Request("/old/path", "/other-target", statusCode: 302, pageShadowMode: "redirect_precedes_page"));
        Assert(!duplicate.Valid && HasError(duplicate, "source.duplicateActive"), "different active duplicate source is rejected");

        var updateRequest = Request("/old/path", "/other-target?campaign=summer", statusCode: 308, pageShadowMode: "redirect_precedes_page");
        var updateValidation = await TenantRedirectValidationService.ValidateAsync(database, TenantId, updateRequest, created.Id);
        Assert(updateValidation.Valid, "existing redirect validates for update");
        var updated = TenantRedirectMutation.PrepareForUpdate(created, updateRequest, updateValidation, "source-test-admin");
        await database.UpdateTenantRedirectAsync(TenantId, created.Id, updated);
        Assert(updated.StatusCode == 308 && updated.Target == "/other-target?campaign=summer", "target and status update persists");
        var renamedSource = Request("/renamed-source", "/other-target", pageShadowMode: "redirect_precedes_page");
        Assert(
            HasError(
                await TenantRedirectValidationService.ValidateAsync(database, TenantId, renamedSource, created.Id, created.SourcePath),
                "source.immutable"),
            "update rejects a source-path rename that would break deterministic identity");

        foreach (var statusCode in new[] { 301, 302, 307, 308 })
        {
            var statusDatabase = BuildDatabase();
            var statusValidation = await TenantRedirectValidationService.ValidateAsync(
                statusDatabase,
                TenantId,
                Request($"/status-{statusCode}", "/target/path", statusCode));
            Assert(statusValidation.Valid, $"status {statusCode} is supported");
        }

        var runtime = await database.ResolveTenantRedirectAsync("fixture-key", TenantId, "/old/path");
        Assert(runtime?.Id == created.Id, "runtime resolution is tenant and API-key scoped");
        Assert(await database.ResolveTenantRedirectAsync("wrong-key", TenantId, "/old/path") == null, "runtime resolution rejects an invalid API key");
        Assert(
            TenantRedirectNormalizer.BuildLocation(updated, "ref=source") == "/other-target?campaign=summer&ref=source",
            "meaningful request query is preserved after declared target query");
        updated.PreserveQueryString = false;
        Assert(
            TenantRedirectNormalizer.BuildLocation(updated, "ref=source") == "/other-target?campaign=summer",
            "query preservation can be explicitly disabled");

        var deactivated = TenantRedirectMutation.PrepareForDeactivate(updated, "source-test-admin", "deactivate-correlation");
        await database.UpdateTenantRedirectAsync(TenantId, created.Id, deactivated);
        Assert(!deactivated.Active && deactivated.DeletedAt.HasValue, "delete contract soft-deactivates and audits the redirect");
        Assert((await database.GetTenantRedirectsAsync(TenantId)).Count == 0, "inactive redirects are excluded from the default list");
        Assert((await database.GetTenantRedirectsAsync(TenantId, includeInactive: true)).Count == 1, "inactive redirects remain backup-readable");

        var selfLoop = await TenantRedirectValidationService.ValidateAsync(database, TenantId, Request("/same", "/same"));
        Assert(!selfLoop.Valid && HasError(selfLoop, "redirect.selfLoop"), "normalized self-loop is rejected");

        var twoNode = BuildDatabase();
        twoNode.Seed(Redirect("/cycle-a", "/cycle-b"));
        var twoNodeResult = await TenantRedirectValidationService.ValidateAsync(twoNode, TenantId, Request("/cycle-b", "/cycle-a"));
        Assert(!twoNodeResult.Valid && HasError(twoNodeResult, "redirect.cycle"), "two-node cycle is rejected");

        var multiNode = BuildDatabase();
        multiNode.Seed(Redirect("/cycle-a", "/cycle-b"), Redirect("/cycle-b", "/cycle-c"));
        var multiNodeResult = await TenantRedirectValidationService.ValidateAsync(multiNode, TenantId, Request("/cycle-c", "/cycle-a"));
        Assert(!multiNodeResult.Valid && multiNodeResult.Cycles.Any(cycle => cycle.Count == 4), "multi-node cycle is rejected");

        var pageConflict = await TenantRedirectValidationService.ValidateAsync(
            BuildDatabase(),
            TenantId,
            Request("/old/path", "/target/path"));
        Assert(!pageConflict.Valid && HasError(pageConflict, "source.pageConflictRequiresExplicitShadow"), "active page source requires explicit redirect precedence");

        var missing = await TenantRedirectValidationService.ValidateAsync(BuildDatabase(), TenantId, Request("/new-source", "/missing"));
        Assert(!missing.Valid && HasError(missing, "target.unresolved"), "unresolved internal target is rejected");
        var pending = Request("/new-source", "/missing");
        pending.TargetStatus = "pending";
        pending.Active = false;
        var pendingResult = await TenantRedirectValidationService.ValidateAsync(BuildDatabase(), TenantId, pending);
        Assert(pendingResult.Valid && pendingResult.TargetResolutionStatus == "pending", "explicit pending internal target is supported");
        pending.Active = true;
        Assert(
            HasError(await TenantRedirectValidationService.ValidateAsync(BuildDatabase(), TenantId, pending), "target.pendingRequiresInactive"),
            "unresolved pending target cannot become runtime-active");

        var pendingResolvedDatabase = BuildDatabase();
        var pendingResolved = Request("/pending-resolved", "/target/path");
        pendingResolved.TargetStatus = "pending";
        var pendingResolvedValidation = await TenantRedirectValidationService.ValidateAsync(pendingResolvedDatabase, TenantId, pendingResolved);
        var pendingResolvedRedirect = TenantRedirectMutation.PrepareForCreate(TenantId, pendingResolved, pendingResolvedValidation, "source-test-admin");
        await pendingResolvedDatabase.CreateTenantRedirectAsync(TenantId, pendingResolvedRedirect);
        Assert(
            (await TenantRedirectValidationService.ValidateAsync(pendingResolvedDatabase, TenantId, pendingResolved)).IdempotentMatchId == pendingResolvedRedirect.Id,
            "derived resolved target metadata does not break idempotent replay");

        var external = Request("/external-source", "https://example.test/destination?x=1", targetKind: "external", statusCode: 307);
        var externalDatabase = BuildDatabase();
        var externalResult = await TenantRedirectValidationService.ValidateAsync(externalDatabase, TenantId, external);
        Assert(externalResult.Valid && externalResult.TargetResolutionStatus == "external", "explicit external redirect validates separately");
        var externalRedirect = TenantRedirectMutation.PrepareForCreate(TenantId, external, externalResult, "source-test-admin");
        await externalDatabase.CreateTenantRedirectAsync(TenantId, externalRedirect);
        Assert((await TenantRedirectValidationService.ValidateAsync(externalDatabase, TenantId, external)).IdempotentMatchId == externalRedirect.Id, "external redirect replay is idempotent");
        external.TargetKind = "internal";
        Assert(!(await TenantRedirectValidationService.ValidateAsync(BuildDatabase(), TenantId, external)).Valid, "external target without external classification is rejected");

        var envelope = TenantRedirectBackupContract.CreateEnvelope(
            TenantId,
            await database.GetTenantRedirectsAsync(TenantId, includeInactive: true),
            DateTime.UnixEpoch);
        var serialized = JsonSerializer.Serialize(envelope);
        var restored = JsonSerializer.Deserialize<TenantRedirectBackupEnvelope>(serialized);
        var backupValidation = TenantRedirectBackupContract.ValidateForRestore(restored, TenantId);
        Assert(backupValidation.Valid, "versioned redirect backup envelope is restore-valid for its tenant");
        Assert(
            restored?.Redirects.Single().SourcePath == deactivated.SourcePath &&
            restored.Redirects.Single().AuditEvents.Count == deactivated.AuditEvents.Count &&
            !restored.Redirects.Single().Active,
            "redirect backup JSON round-trip preserves inactive state, audit, and route fields");
        Assert(!TenantRedirectBackupContract.ValidateForRestore(restored, "other-tenant").Valid, "redirect backup restore rejects a cross-tenant target");
        Assert(!serialized.Contains("password", StringComparison.OrdinalIgnoreCase), "redirect backup representation contains no password field");
        Assert(!serialized.Contains("token", StringComparison.OrdinalIgnoreCase), "redirect backup representation contains no token field");

        AssertProviderAndEndpointSourceContracts();
        Console.WriteLine("V2.8.62DRT tenant redirect source tests passed.");
    }

    private static void AssertProviderAndEndpointSourceContracts()
    {
        var repoRoot = Directory.GetCurrentDirectory();
        var cosmos = File.ReadAllText(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var mongo = File.ReadAllText(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "MongoDataConnection.cs"));
        var endpoints = File.ReadAllText(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "TenantRedirects", "TenantRedirectEndpoints.cs"));

        Assert(cosmos.Contains("new PartitionKey(normalizedTenantId)", StringComparison.Ordinal), "Cosmos reads use the tenant partition key");
        Assert(cosmos.Contains("CreateContainerIfNotExistsAsync(properties)", StringComparison.Ordinal), "Cosmos write path provisions the dedicated tenant-partitioned container");
        Assert(cosmos.Contains("sourcePath = @sourcePath AND c.active = true", StringComparison.Ordinal), "Cosmos enforces active source lookup uniqueness");
        Assert(mongo.Contains("tenant_source_active_unique", StringComparison.Ordinal), "Mongo defines a compound tenant/source/active unique index");
        Assert(mongo.Contains("item => item.TenantId", StringComparison.Ordinal), "Mongo filters redirect records by tenant");
        Assert(endpoints.Contains("/api/admin/tenants/{tenantId}/redirects/validate", StringComparison.Ordinal), "non-mutating validation endpoint is mapped");
        Assert(endpoints.Contains("/api/redirects/{tenantId}/resolve", StringComparison.Ordinal), "minimal public runtime resolution endpoint is mapped");
        var normalizer = File.ReadAllText(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "TenantRedirects", "TenantRedirectNormalizer.cs"));
        Assert(
            normalizer.Split("Uri.TryCreate(candidate, UriKind.Absolute", StringSplitOptions.None).Length - 1 == 1 &&
            normalizer.Contains("HasUriScheme(candidate)", StringComparison.Ordinal),
            "internal path validation does not use platform-specific absolute file URI detection");
    }

    private static TenantRedirectUpsertRequest Request(
        string source,
        string target,
        int statusCode = 301,
        string targetKind = "internal",
        string pageShadowMode = "none")
    {
        return new TenantRedirectUpsertRequest
        {
            SourcePath = source,
            Target = target,
            TargetKind = targetKind,
            StatusCode = statusCode,
            Active = true,
            PreserveQueryString = true,
            TargetStatus = "resolved",
            PageShadowMode = pageShadowMode,
            SourcePackagePath = "fixture/source.html",
            SourceDeclaration = "meta-refresh-and-canonical",
            ImportCorrelationId = "fixture-import",
            AuditCorrelationId = "fixture-audit"
        };
    }

    private static TenantRedirect Redirect(string source, string target)
    {
        return new TenantRedirect
        {
            Id = TenantRedirectMutation.BuildId(TenantId, source),
            TenantId = TenantId,
            SourcePath = source,
            Target = target,
            TargetKind = "internal",
            StatusCode = 301,
            Active = true,
            TargetStatus = "resolved",
            RoutePrecedence = "redirect_before_page",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static RedirectFakeDatabase BuildDatabase()
    {
        return new RedirectFakeDatabase(new[]
        {
            Page("old-path"),
            Page("target-path"),
            Page("other-target"),
            Page("cycle-a"),
            Page("cycle-b"),
            Page("cycle-c")
        });
    }

    private static Page Page(string slug)
    {
        return new Page { Id = $"page-{slug}", PageId = $"page-{slug}", TenantId = TenantId, PageSlug = slug };
    }

    private static bool HasError(TenantRedirectValidationResponse response, string code)
    {
        return response.Errors.Any(issue => issue.Code == code);
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException($"Assertion failed: {message}");
        Console.WriteLine($"pass: {message}");
    }

    private sealed class RedirectFakeDatabase : IDatabaseService
    {
        private readonly List<TenantRedirect> _redirects = new();
        private readonly List<Page> _pages;

        public RedirectFakeDatabase(IEnumerable<Page> pages)
        {
            _pages = pages.ToList();
        }

        public void Seed(params TenantRedirect[] redirects)
        {
            _redirects.AddRange(redirects);
        }

        public Task<Tenant?> GetTenantAsync(string tenantId)
        {
            return Task.FromResult<Tenant?>(tenantId == TenantId
                ? new Tenant { Id = TenantId, TenantId = TenantId, Name = "Redirect Fixture", Status = "active", Plan = "standard" }
                : null);
        }

        public Task<List<Page>> GetPagesByTenantAsync(string tenantId)
        {
            return Task.FromResult(_pages.Where(page => page.TenantId == tenantId).ToList());
        }

        public Task<List<TenantRedirect>> GetTenantRedirectsAsync(string tenantId, bool includeInactive = false)
        {
            return Task.FromResult(_redirects
                .Where(item => item.TenantId == tenantId && (includeInactive || item.Active))
                .ToList());
        }

        public Task<TenantRedirect?> GetTenantRedirectAsync(string tenantId, string id)
        {
            return Task.FromResult(_redirects.FirstOrDefault(item => item.TenantId == tenantId && item.Id == id));
        }

        public Task<TenantRedirect> CreateTenantRedirectAsync(string tenantId, TenantRedirect redirect)
        {
            if (_redirects.Any(item => item.TenantId == tenantId && item.Active && redirect.Active && item.SourcePath == redirect.SourcePath))
            {
                throw new InvalidOperationException("duplicate active source");
            }
            _redirects.Add(redirect);
            return Task.FromResult(redirect);
        }

        public Task<TenantRedirect> UpdateTenantRedirectAsync(string tenantId, string id, TenantRedirect redirect)
        {
            var index = _redirects.FindIndex(item => item.TenantId == tenantId && item.Id == id);
            if (index < 0) throw new KeyNotFoundException();
            if (_redirects.Any(item => item.TenantId == tenantId && item.Id != id && item.Active && redirect.Active && item.SourcePath == redirect.SourcePath))
            {
                throw new InvalidOperationException("duplicate active source");
            }
            _redirects[index] = redirect;
            return Task.FromResult(redirect);
        }

        public Task<TenantRedirect?> ResolveTenantRedirectAsync(string apiKey, string tenantId, string sourcePath)
        {
            if (apiKey != "fixture-key" || !TenantRedirectNormalizer.TryNormalizeSourcePath(sourcePath, out var normalized, out _))
            {
                return Task.FromResult<TenantRedirect?>(null);
            }
            return Task.FromResult(_redirects.FirstOrDefault(item => item.TenantId == tenantId && item.Active && item.SourcePath == normalized));
        }

        public Task<Page?> GetPageAsync(string apiKey, string tenantId, string pageSlug) => throw NotUsed();
        public Task<Page> SavePageAsync(string apiKey, string tenantId, Page page) => throw NotUsed();
        public Task<Page> UpdatePageAsync(string apiKey, string tenantId, string pageSlug, Page page) => throw NotUsed();
        public Task<bool> DeletePageAsync(string apiKey, string tenantId, string pageSlug) => throw NotUsed();
        public Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry) => throw NotUsed();
        public Task<List<FormEntry>> GetFormEntriesByTenantAsync(string tenantId) => throw NotUsed();
        public Task<FormEntry?> GetFormEntryAsync(string tenantId, string id) => throw NotUsed();
        public Task<FormEntry> UpdateFormEntryStatusAsync(string tenantId, string id, FormEntryStatusUpdate statusUpdate) => throw NotUsed();
        public Task<FormDefinition?> GetFormDefinitionAsync(string apiKey, string tenantId, string type) => throw NotUsed();
        public Task<List<FormDefinition>> GetFormDefinitionsByTenantAsync(string tenantId) => throw NotUsed();
        public Task<FormDefinition?> GetFormDefinitionAdminAsync(string tenantId, string id) => throw NotUsed();
        public Task<FormDefinition> CreateFormDefinitionAsync(string tenantId, FormDefinition definition) => throw NotUsed();
        public Task<FormDefinition> UpdateFormDefinitionAsync(string tenantId, string id, FormDefinition definition) => throw NotUsed();
        public Task<bool> DeleteFormDefinitionAsync(string tenantId, string id) => throw NotUsed();
        public Task<List<SitemapEntry>> GetSitemapPagesAsync(string apiKey, string tenantId) => throw NotUsed();
        public Task<Tenant> CreateTenantAsync(Tenant tenant) => throw NotUsed();
        public Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant) => throw NotUsed();
        public Task<Tenant> ProvisionTenantApiKeyHashAsync(string tenantId, string apiKeyHash) => throw NotUsed();
        public Task<bool> DeleteTenantAsync(string tenantId) => throw NotUsed();
        public Task<List<Tenant>> GetAllTenantsAsync() => throw NotUsed();
        public Task<List<Page>> GetAllPagesAsync(string? tenantId = null) => throw NotUsed();
        public Task<List<Page>> GetHubPagesAsync(string tenantId) => throw NotUsed();
        public Task<List<Page>> GetSpokePagesAsync(string tenantId, string hubPageSlug) => throw NotUsed();
        public Task<object> GetContentHierarchyAsync(string tenantId) => throw NotUsed();
        public Task<Page?> GetPageBySlugAsync(string tenantId, string pageSlug) => throw NotUsed();
        public Task<List<Tenant>> GetTenantsForUserAsync(string userTenantId, bool isSuperAdmin) => throw NotUsed();
        public Task<Page> SavePageAdminAsync(string tenantId, Page page) => throw NotUsed();
        public Task<Page> UpdatePageAdminAsync(string tenantId, string pageSlug, Page page, PageChangeContext? changeContext = null) => throw NotUsed();
        public Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug) => throw NotUsed();
        public Task<List<PublishRun>> GetPublishRunsByTenantAsync(string tenantId) => throw NotUsed();
        public Task<PublishRun?> GetPublishRunAsync(string tenantId, string id) => throw NotUsed();
        public Task<PublishRun> SavePublishRunAsync(string tenantId, PublishRun publishRun) => throw NotUsed();
        public Task<List<ImportRun>> GetImportRunsByTenantAsync(string tenantId) => throw NotUsed();
        public Task<ImportRun?> GetImportRunAsync(string tenantId, string id) => throw NotUsed();
        public Task<ImportRun> SaveImportRunAsync(string tenantId, ImportRun importRun) => throw NotUsed();
        public Task<List<MediaAsset>> GetMediaAssetsByTenantAsync(string tenantId) => throw NotUsed();
        public Task<MediaAsset?> GetMediaAssetAsync(string tenantId, string id) => throw NotUsed();
        public Task<MediaAsset> SaveMediaAssetAsync(string tenantId, MediaAsset mediaAsset) => throw NotUsed();
        public Task<MediaAsset> UpdateMediaAssetAsync(string tenantId, string id, MediaAsset mediaAsset) => throw NotUsed();
        public Task<bool> DeleteMediaAssetAsync(string tenantId, string id) => throw NotUsed();
        public Task EnsureDomainBindingContainerAsync() => throw NotUsed();
        public Task<List<DomainBinding>> GetDomainBindingsAsync(string? tenantId = null) => throw NotUsed();
        public Task<DomainBinding?> GetDomainBindingAsync(string tenantId, string id) => throw NotUsed();
        public Task<DomainBinding> CreateDomainBindingAsync(string tenantId, DomainBinding domainBinding) => throw NotUsed();
        public Task<DomainBinding> UpdateDomainBindingAsync(string tenantId, string id, DomainBinding domainBinding) => throw NotUsed();
        public Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId) => throw NotUsed();
        public Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId) => throw NotUsed();
        public Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId) => throw NotUsed();
        public Task<Theme?> GetActiveThemeAdminAsync(string tenantId) => throw NotUsed();
        public Task<List<Theme>> GetThemesByTenantAsync(string tenantId) => throw NotUsed();
        public Task<Theme> CreateThemeAsync(string tenantId, Theme theme) => throw NotUsed();
        public Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme) => throw NotUsed();
        public Task<bool> DeleteThemeAsync(string tenantId, string themeId) => throw NotUsed();
        public Task<List<User>> GetUsersAsync(string? tenantId = null) => throw NotUsed();
        public Task<User?> GetUserByIdAsync(string tenantId, string userId) => throw NotUsed();
        public Task<User?> GetUserByIdAsync(string tenantId, string userId, CancellationToken cancellationToken) => throw NotUsed();
        public Task<User?> GetUserByEmailAsync(string email) => throw NotUsed();
        public Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken) => throw NotUsed();
        public Task<User> CreateUserAsync(User user) => throw NotUsed();
        public Task<User> UpdateUserAsync(User user) => throw NotUsed();
        public Task UpdateUserLastLoginAsync(string userId, string tenantId) => throw NotUsed();
        public Task PatchUserLoginEmailAsync(string userId, string tenantId, string loginEmail, CancellationToken cancellationToken) => throw NotUsed();
        public Task PatchUserPasswordHashAsync(string userId, string tenantId, string passwordHash, CancellationToken cancellationToken) => throw NotUsed();
        public Task PatchUserActiveStateAsync(string userId, string tenantId, bool isActive, CancellationToken cancellationToken) => throw NotUsed();
        public Task PatchUserProfileNamesAsync(string userId, string tenantId, string? firstName, string? lastName, CancellationToken cancellationToken) => throw NotUsed();

        private static NotSupportedException NotUsed() => new("This in-memory test method is not used.");
    }
}
