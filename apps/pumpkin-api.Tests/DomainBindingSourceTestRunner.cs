using pumpkin_api.Services;
using pumpkin_api.Services.DomainBindings;
using pumpkin_net_models.Models;
using System.Text.Json;

namespace pumpkin_api.Tests;

public static class DomainBindingSourceTestRunner
{
    private const string AirstripTenantId = "airstrip-club-las-vegas";
    private const string AirstripDomain = "airstripclublasvegas.com";
    private const string AirstripWwwDomain = "www.airstripclublasvegas.com";
    private const string AirstripInboundIp = "20.118.48.17";
    private const string AirstripVerificationId = "17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD";
    private const string AirstripDefaultHost = "app-airstrip-prod-centralus-001.azurewebsites.net";

    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.60T DomainBinding source tests");

        Assert(DomainBindingAuthorization.IsSuperAdminRole("SuperAdmin"), "SuperAdmin role can access DomainBinding routes");
        Assert(!DomainBindingAuthorization.IsSuperAdminRole("TenantAdmin"), "TenantAdmin role is denied DomainBinding routes");
        Assert(!DomainBindingAuthorization.IsSuperAdminRole(null), "missing role is denied DomainBinding routes");

        var database = new DomainBindingFakeDatabase();
        var binding = DomainBindingMutation.PrepareForCreate(BuildAirstripBinding(), AirstripTenantId, "source-test-superadmin");
        var created = await database.CreateDomainBindingAsync(AirstripTenantId, binding);
        Assert(created.TenantId == AirstripTenantId, "SuperAdmin source path can create DomainBinding");

        var readBack = await database.GetDomainBindingAsync(AirstripTenantId, created.Id);
        Assert(readBack?.Domain == AirstripDomain, "SuperAdmin source path can read DomainBinding");

        readBack!.Status = "pending_owner_approval";
        var updated = await database.UpdateDomainBindingAsync(
            AirstripTenantId,
            readBack.Id,
            DomainBindingMutation.PrepareForUpdate(readBack, AirstripTenantId, readBack.Id, "source-test-superadmin"));
        Assert(updated.Status == "pending_owner_approval", "SuperAdmin source path can update DomainBinding");

        var wrongTenant = await database.GetDomainBindingAsync("wrong-tenant", created.Id);
        Assert(wrongTenant == null, "wrong tenant path is not found");

        var duplicate = DomainBindingMutation.PrepareForCreate(BuildAirstripBinding(), AirstripTenantId, "source-test-superadmin");
        await AssertThrowsAsync<InvalidOperationException>(
            () => database.CreateDomainBindingAsync(AirstripTenantId, duplicate),
            "duplicate domain conflict is deterministic");

        var packet = DomainBindingDnsPacketService.GenerateAzureAppServicePacket(
            BuildAirstripBinding(),
            new DomainBindingDnsPacketRequest
            {
                InboundIpAddress = AirstripInboundIp,
                CustomDomainVerificationId = AirstripVerificationId,
                DefaultHost = AirstripDefaultHost
            });
        Assert(packet.Count == 4, "DNS packet has four Azure App Service records");
        Assert(packet.Any(record => record.Type == "A" && record.Host == "@" && record.Value == AirstripInboundIp), "DNS packet includes apex A record");
        Assert(packet.Any(record => record.Type == "TXT" && record.Host == "asuid" && record.Value == AirstripVerificationId), "DNS packet includes apex ownership TXT");
        Assert(packet.Any(record => record.Type == "CNAME" && record.Host == "www" && record.Value == AirstripDefaultHost), "DNS packet includes www CNAME");
        Assert(packet.Any(record => record.Type == "TXT" && record.Host == "asuid.www" && record.Value == AirstripVerificationId), "DNS packet includes www ownership TXT");

        Assert(!DomainBindingDnsValidationService.IsRecordVerified(packet[0], Array.Empty<string>()), "DNS validation remains pending when record is absent");

        DomainBindingMutation.AppendAudit(updated, "source-test-superadmin", "validate_dns_readonly", "pending_dns_records", "pending_dns_records", "Read-only DNS validation completed.");
        var serialized = JsonSerializer.Serialize(updated);
        Assert(!serialized.Contains("password", StringComparison.OrdinalIgnoreCase), "DomainBinding response does not include password fields");
        Assert(!serialized.Contains("bearer", StringComparison.OrdinalIgnoreCase), "DomainBinding response does not include bearer token fields");
        Assert(updated.AuditEvents.Count > 0, "audit events are appended");

        Console.WriteLine("V2.8.60T DomainBinding source tests passed.");
    }

    private static DomainBinding BuildAirstripBinding()
    {
        return new DomainBinding
        {
            Id = "domainbinding-airstrip-club-las-vegas-airstripclublasvegas-com",
            TenantId = AirstripTenantId,
            Domain = AirstripDomain,
            WwwDomain = AirstripWwwDomain,
            Canonical = false,
            Provider = "bluehost",
            Status = "pending_dns_records",
            HostingTarget = new DomainBindingHostingTarget
            {
                Type = "azure-app-service",
                ResourceGroup = "rg-pumpkin-api-prod-centralus",
                AppName = "app-airstrip-prod-centralus-001",
                DefaultHost = AirstripDefaultHost,
                DefaultHostUrl = $"https://{AirstripDefaultHost}",
                InboundIpAddress = AirstripInboundIp,
                CustomDomainVerificationId = AirstripVerificationId
            }
        };
    }

    private static async Task AssertThrowsAsync<TException>(Func<Task> action, string message)
        where TException : Exception
    {
        try
        {
            await action();
        }
        catch (TException)
        {
            Console.WriteLine($"pass: {message}");
            return;
        }

        throw new InvalidOperationException($"Assertion failed: {message}");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException($"Assertion failed: {message}");
        }

        Console.WriteLine($"pass: {message}");
    }

    private sealed class DomainBindingFakeDatabase : IDatabaseService
    {
        private readonly List<DomainBinding> _bindings = new();

        public Task EnsureDomainBindingContainerAsync() => Task.CompletedTask;

        public Task<List<DomainBinding>> GetDomainBindingsAsync(string? tenantId = null)
        {
            var bindings = string.IsNullOrWhiteSpace(tenantId)
                ? _bindings
                : _bindings.Where(binding => string.Equals(binding.TenantId, tenantId, StringComparison.OrdinalIgnoreCase)).ToList();
            return Task.FromResult(bindings.ToList());
        }

        public Task<DomainBinding?> GetDomainBindingAsync(string tenantId, string id)
        {
            return Task.FromResult(_bindings.FirstOrDefault(binding =>
                string.Equals(binding.TenantId, tenantId, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(binding.Id, id, StringComparison.OrdinalIgnoreCase)));
        }

        public Task<DomainBinding> CreateDomainBindingAsync(string tenantId, DomainBinding domainBinding)
        {
            if (_bindings.Any(binding =>
                string.Equals(binding.Domain, domainBinding.Domain, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(binding.WwwDomain, domainBinding.Domain, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(binding.Domain, domainBinding.WwwDomain, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(binding.WwwDomain, domainBinding.WwwDomain, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("duplicate domain");
            }

            _bindings.Add(domainBinding);
            return Task.FromResult(domainBinding);
        }

        public Task<DomainBinding> UpdateDomainBindingAsync(string tenantId, string id, DomainBinding domainBinding)
        {
            var index = _bindings.FindIndex(binding =>
                string.Equals(binding.TenantId, tenantId, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(binding.Id, id, StringComparison.OrdinalIgnoreCase));
            if (index < 0)
            {
                throw new KeyNotFoundException("not found");
            }

            _bindings[index] = domainBinding;
            return Task.FromResult(domainBinding);
        }

        public Task<Tenant?> GetTenantAsync(string tenantId) => Task.FromResult<Tenant?>(new Tenant { TenantId = tenantId, Id = tenantId, Name = tenantId, Status = "active", Plan = "standard" });

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
        public Task<List<Page>> GetPagesByTenantAsync(string tenantId) => throw NotUsed();
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
        public Task<User?> GetUserByEmailAsync(string email) => throw NotUsed();
        public Task<User> CreateUserAsync(User user) => throw NotUsed();
        public Task<User> UpdateUserAsync(User user) => throw NotUsed();
        public Task UpdateUserLastLoginAsync(string userId, string tenantId) => throw NotUsed();

        private static NotSupportedException NotUsed() => new("This test fake method is not used.");
    }
}
