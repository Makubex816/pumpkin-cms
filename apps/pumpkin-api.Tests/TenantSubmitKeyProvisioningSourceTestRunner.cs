using pumpkin_api.Services;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class TenantSubmitKeyProvisioningSourceTestRunner
{
    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.61OSD tenant submit-key provisioning source tests");

        Assert(TenantSubmitKeyProvisioningService.IsSuperAdminRole("SuperAdmin"), "SuperAdmin role is accepted");
        Assert(!TenantSubmitKeyProvisioningService.IsSuperAdminRole("TenantAdmin"), "TenantAdmin role is rejected");
        Assert(!TenantSubmitKeyProvisioningService.IsSuperAdminRole(null), "missing role is rejected");

        Assert(TenantSubmitKeyProvisioningService.ValidateSubmitKey(null) != null, "missing submit key is rejected");
        Assert(TenantSubmitKeyProvisioningService.ValidateSubmitKey("   ") != null, "blank submit key is rejected");
        Assert(TenantSubmitKeyProvisioningService.ValidateSubmitKey("Owner-Provided-Submit-Key-OSD") == null, "nonblank submit key is accepted");

        var submitKey = "  Owner-Provided-Submit-Key-OSD  ";
        var normalizedSubmitKey = TenantSubmitKeyProvisioningService.NormalizeSubmitKey(submitKey);
        var hash = TenantSubmitKeyProvisioningService.HashSubmitKey(normalizedSubmitKey);
        Assert(hash != normalizedSubmitKey, "submit key hash does not disclose plaintext");
        Assert(TenantSubmitKeyProvisioningService.VerifySubmitKey(normalizedSubmitKey, hash), "submit key hash verifies");
        Assert(!TenantSubmitKeyProvisioningService.VerifySubmitKey("wrong-key", hash), "wrong submit key does not verify");

        var database = new SubmitKeyProvisioningFakeDatabase();
        var response = await TenantSubmitKeyProvisioningService.ProvisionSubmitKeyAsync(
            database,
            "party-pros-philadelphia",
            submitKey);

        Assert(database.StoredTenant?.TenantId == "party-pros-philadelphia", "provisioning targets the requested tenant");
        Assert(database.StoredTenant?.ApiKey == string.Empty, "stored tenant omits plaintext api key");
        Assert(!string.IsNullOrWhiteSpace(database.StoredTenant?.ApiKeyHash), "stored tenant has api key hash");
        Assert(database.ReceivedHash != normalizedSubmitKey, "database receives hash instead of plaintext");
        Assert(TenantSubmitKeyProvisioningService.VerifySubmitKey(normalizedSubmitKey, database.ReceivedHash!), "database hash verifies against submit key");
        Assert(response.TenantId == "party-pros-philadelphia", "response is tenant-scoped");
        Assert(response.KeyHashStored, "response confirms a hash is stored");
        Assert(!response.PlaintextReturned, "response says plaintext was not returned");
        Assert(response.GetType().GetProperty("ApiKey") == null, "response omits api key");
        Assert(response.GetType().GetProperty("ApiKeyHash") == null, "response omits api key hash");

        Console.WriteLine("V2.8.61OSD tenant submit-key provisioning source tests passed.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException($"Assertion failed: {message}");
        }

        Console.WriteLine($"pass: {message}");
    }

    private sealed class SubmitKeyProvisioningFakeDatabase : IDatabaseService
    {
        public string? ReceivedHash { get; private set; }
        public Tenant? StoredTenant { get; private set; }

        public Task<Tenant> ProvisionTenantApiKeyHashAsync(string tenantId, string apiKeyHash)
        {
            ReceivedHash = apiKeyHash;
            StoredTenant = new Tenant
            {
                Id = tenantId,
                TenantId = tenantId,
                Name = "Party Pros East Coast Philadelphia",
                Plan = "standard",
                Status = "active",
                ApiKey = string.Empty,
                ApiKeyHash = apiKeyHash,
                ApiKeyMeta = new ApiKeyMeta
                {
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow
            };

            return Task.FromResult(StoredTenant);
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
        public Task<Tenant?> GetTenantAsync(string tenantId) => throw NotUsed();
        public Task<Tenant> CreateTenantAsync(Tenant tenant) => throw NotUsed();
        public Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant) => throw NotUsed();
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
        public Task<User?> GetUserByEmailAsync(string email) => throw NotUsed();
        public Task<User> CreateUserAsync(User user) => throw NotUsed();
        public Task<User> UpdateUserAsync(User user) => throw NotUsed();
        public Task UpdateUserLastLoginAsync(string userId, string tenantId) => throw NotUsed();

        private static NotSupportedException NotUsed() => new("This test fake method is not used.");
    }
}
