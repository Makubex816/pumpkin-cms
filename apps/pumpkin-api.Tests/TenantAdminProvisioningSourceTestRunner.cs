using pumpkin_api.Services;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class TenantAdminProvisioningSourceTestRunner
{
    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.58A TenantAdmin provisioning source tests");

        Assert(TenantAdminUserProvisioningService.IsSuperAdminRole("SuperAdmin"), "SuperAdmin role is accepted");
        Assert(!TenantAdminUserProvisioningService.IsSuperAdminRole("TenantAdmin"), "TenantAdmin role is rejected");
        Assert(!TenantAdminUserProvisioningService.IsSuperAdminRole(null), "missing role is rejected");

        var request = new CreateTenantAdminUserRequest
        {
            Email = "  Admin@Example.Test ",
            Password = "Correct-Horse-58A",
            Username = " airstrip-admin ",
            FirstName = " Airstrip ",
            LastName = " Admin "
        };

        var built = TenantAdminUserProvisioningService.BuildTenantAdminUser("Airstrip-Club-Las-Vegas", request);
        Assert(built.TenantId == "airstrip-club-las-vegas", "tenantId is normalized for partition safety");
        Assert(built.Email == "admin@example.test", "email is normalized");
        Assert(built.Username == "airstrip-admin", "username is trimmed");
        Assert(built.Role == UserRole.TenantAdmin, "role is TenantAdmin");
        Assert(built.IsActive, "created user is active");
        Assert(built.PasswordHash != request.Password, "password hash does not disclose plaintext");
        Assert(BCrypt.Net.BCrypt.Verify(request.Password, built.PasswordHash), "password hash verifies with BCrypt");

        var response = TenantAdminUserProvisioningService.ToResponse(built);
        Assert(response.Role == "TenantAdmin", "response role is TenantAdmin");
        Assert(response.GetType().GetProperty("PasswordHash") == null, "response omits password hash");
        Assert(response.GetType().GetProperty("Password") == null, "response omits password");

        var successDb = new TenantAdminProvisioningFakeDatabase(hasTenant: true);
        var success = await TenantAdminUserProvisioningService.CreateTenantAdminAsync(
            successDb,
            "airstrip-club-las-vegas",
            request);
        Assert(success.Status == TenantAdminUserProvisioningStatus.Created, "create path can create a TenantAdmin");
        Assert(success.User?.TenantId == "airstrip-club-las-vegas", "created response is tenant-scoped");
        Assert(successDb.CreatedUser?.TenantId == "airstrip-club-las-vegas", "created user uses tenant partition");
        Assert(successDb.CreatedUser?.Role == UserRole.TenantAdmin, "created user is not privileged above TenantAdmin");

        var conflictDb = new TenantAdminProvisioningFakeDatabase(hasTenant: true, existingEmail: "admin@example.test");
        var conflict = await TenantAdminUserProvisioningService.CreateTenantAdminAsync(
            conflictDb,
            "airstrip-club-las-vegas",
            request);
        Assert(conflict.Status == TenantAdminUserProvisioningStatus.Conflict, "duplicate email returns conflict");
        Assert(conflictDb.CreatedUser == null, "conflict does not create user");

        var missingTenantDb = new TenantAdminProvisioningFakeDatabase(hasTenant: false);
        var missingTenant = await TenantAdminUserProvisioningService.CreateTenantAdminAsync(
            missingTenantDb,
            "airstrip-club-las-vegas",
            request);
        Assert(missingTenant.Status == TenantAdminUserProvisioningStatus.TenantNotFound, "missing tenant is rejected");
        Assert(missingTenantDb.CreatedUser == null, "missing tenant does not create user");

        var invalid = await TenantAdminUserProvisioningService.CreateTenantAdminAsync(
            successDb,
            "airstrip-club-las-vegas",
            new CreateTenantAdminUserRequest { Email = "bad", Password = "short" });
        Assert(invalid.Status == TenantAdminUserProvisioningStatus.BadRequest, "invalid request is rejected");

        Console.WriteLine("V2.8.58A TenantAdmin provisioning source tests passed.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException($"Assertion failed: {message}");
        }

        Console.WriteLine($"pass: {message}");
    }

    private sealed class TenantAdminProvisioningFakeDatabase : IDatabaseService
    {
        private readonly bool _hasTenant;
        private readonly string? _existingEmail;

        public TenantAdminProvisioningFakeDatabase(bool hasTenant, string? existingEmail = null)
        {
            _hasTenant = hasTenant;
            _existingEmail = existingEmail;
        }

        public User? CreatedUser { get; private set; }

        public Task<Tenant?> GetTenantAsync(string tenantId)
        {
            return Task.FromResult<Tenant?>(_hasTenant
                ? new Tenant { TenantId = tenantId, Id = tenantId, Name = "Fixture", Status = "active", Plan = "standard" }
                : null);
        }

        public Task<User?> GetUserByEmailAsync(string email)
        {
            if (!string.Equals(email, _existingEmail, StringComparison.OrdinalIgnoreCase))
            {
                return Task.FromResult<User?>(null);
            }

            return Task.FromResult<User?>(new User
            {
                TenantId = "existing-tenant",
                Email = email,
                Username = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Existing-Password-58A")
            });
        }

        public Task<User> CreateUserAsync(User user)
        {
            CreatedUser = user;
            return Task.FromResult(user);
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
        public Task UpdateUserLastLoginAsync(string userId, string tenantId) => throw NotUsed();

        private static NotSupportedException NotUsed() => new("This test fake method is not used.");
    }
}
