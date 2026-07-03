using pumpkin_api.Services;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class UserProfileManagementSourceTestRunner
{
    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.58C User profile management source tests");

        Assert(UserProfileManagementService.IsSuperAdminRole("SuperAdmin"), "SuperAdmin role is accepted");
        Assert(!UserProfileManagementService.IsSuperAdminRole("TenantAdmin"), "TenantAdmin role is rejected");
        Assert(!UserProfileManagementService.IsSuperAdminRole(null), "missing role is rejected");

        var sourcePasswordHash = BCrypt.Net.BCrypt.HashPassword("Placeholder-58C-Source-Test");
        var user = new User
        {
            Id = "airstrip-admin-user",
            TenantId = "airstrip-club-las-vegas",
            Email = "admin@airstrip.example",
            Username = "airstrip-admin",
            PasswordHash = sourcePasswordHash,
            FirstName = "Airstrip",
            LastName = "Admin",
            Role = UserRole.TenantAdmin,
            IsActive = true,
            Permissions = ["pages:read", "users:read"]
        };

        var duplicate = new User
        {
            Id = "duplicate-user",
            TenantId = "ice-rink-rentals",
            Email = "duplicate@example.test",
            Username = "duplicate",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Another-Placeholder-58C"),
            FirstName = "Duplicate",
            LastName = "User",
            Role = UserRole.TenantAdmin,
            IsActive = true
        };

        var database = new UserProfileFakeDatabase(user, duplicate);

        var response = UserProfileManagementService.ToResponse(user);
        Assert(response.GetType().GetProperty("PasswordHash") == null, "response omits password hash");
        Assert(response.GetType().GetProperty("Password") == null, "response omits password");
        Assert(response.GetType().GetProperty("Token") == null, "response omits token");
        Assert(response.DisplayName == "Airstrip Admin", "display name is derived from first/last name");

        var users = await UserProfileManagementService.ListUsersAsync(database);
        Assert(users.Count == 2, "SuperAdmin list source returns sanitized user profiles");
        Assert(users.All(item => item.GetType().GetProperty("PasswordHash") == null), "list response omits password hash");

        var updated = await UserProfileManagementService.UpdateUserProfileAsync(
            database,
            "AIRSTRIP-CLUB-LAS-VEGAS",
            "airstrip-admin-user",
            new UpdateUserProfileRequest
            {
                Email = "Admin.58C@Airstrip.Example",
                FirstName = "Airstrip",
                LastName = "Admin 58C"
            });

        Assert(updated.Status == UserProfileUpdateStatus.Updated, "profile update succeeds");
        Assert(updated.User?.Email == "admin.58c@airstrip.example", "email is normalized");
        Assert(updated.User?.DisplayName == "Airstrip Admin 58C", "display name reflects updated name");

        var stored = await database.GetUserByIdAsync("airstrip-club-las-vegas", "airstrip-admin-user");
        Assert(stored?.PasswordHash == sourcePasswordHash, "profile update preserves password hash");
        Assert(stored?.Role == UserRole.TenantAdmin, "profile update preserves role");
        Assert(stored?.TenantId == "airstrip-club-las-vegas", "profile update preserves tenant");
        Assert(stored?.IsActive == true, "profile update preserves active state");

        var conflict = await UserProfileManagementService.UpdateUserProfileAsync(
            database,
            "airstrip-club-las-vegas",
            "airstrip-admin-user",
            new UpdateUserProfileRequest
            {
                Email = "duplicate@example.test",
                FirstName = "Airstrip",
                LastName = "Admin"
            });
        Assert(conflict.Status == UserProfileUpdateStatus.Conflict, "duplicate email returns conflict");

        var invalid = await UserProfileManagementService.UpdateUserProfileAsync(
            database,
            "airstrip-club-las-vegas",
            "airstrip-admin-user",
            new UpdateUserProfileRequest
            {
                Email = "not-an-email",
                FirstName = "Airstrip",
                LastName = "Admin"
            });
        Assert(invalid.Status == UserProfileUpdateStatus.BadRequest, "invalid email is rejected");

        var missing = await UserProfileManagementService.UpdateUserProfileAsync(
            database,
            "airstrip-club-las-vegas",
            "missing-user",
            new UpdateUserProfileRequest
            {
                Email = "missing@example.test",
                FirstName = "Missing",
                LastName = "User"
            });
        Assert(missing.Status == UserProfileUpdateStatus.NotFound, "missing user returns not found");

        Console.WriteLine("V2.8.58C User profile management source tests passed.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException($"Assertion failed: {message}");
        }

        Console.WriteLine($"pass: {message}");
    }

    private sealed class UserProfileFakeDatabase : IDatabaseService
    {
        private readonly List<User> _users;

        public UserProfileFakeDatabase(params User[] users)
        {
            _users = users.ToList();
        }

        public Task<List<User>> GetUsersAsync(string? tenantId = null)
        {
            var users = string.IsNullOrWhiteSpace(tenantId)
                ? _users
                : _users.Where(user => string.Equals(user.TenantId, tenantId, StringComparison.OrdinalIgnoreCase)).ToList();

            return Task.FromResult(users.ToList());
        }

        public Task<User?> GetUserByIdAsync(string tenantId, string userId)
        {
            return Task.FromResult(_users.FirstOrDefault(user =>
                string.Equals(user.TenantId, tenantId, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(user.Id, userId, StringComparison.Ordinal)));
        }

        public Task<User?> GetUserByEmailAsync(string email)
        {
            return Task.FromResult(_users.FirstOrDefault(user =>
                string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase)));
        }

        public Task<User> UpdateUserAsync(User user)
        {
            var index = _users.FindIndex(existing =>
                string.Equals(existing.TenantId, user.TenantId, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(existing.Id, user.Id, StringComparison.Ordinal));
            if (index < 0)
            {
                throw new InvalidOperationException("User not found.");
            }

            _users[index] = user;
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
        public Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId) => throw NotUsed();
        public Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId) => throw NotUsed();
        public Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId) => throw NotUsed();
        public Task<Theme?> GetActiveThemeAdminAsync(string tenantId) => throw NotUsed();
        public Task<List<Theme>> GetThemesByTenantAsync(string tenantId) => throw NotUsed();
        public Task<Theme> CreateThemeAsync(string tenantId, Theme theme) => throw NotUsed();
        public Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme) => throw NotUsed();
        public Task<bool> DeleteThemeAsync(string tenantId, string themeId) => throw NotUsed();
        public Task<User> CreateUserAsync(User user) => throw NotUsed();
        public Task UpdateUserLastLoginAsync(string userId, string tenantId) => throw NotUsed();

        private static NotSupportedException NotUsed() => new("This test fake method is not used.");
    }
}
