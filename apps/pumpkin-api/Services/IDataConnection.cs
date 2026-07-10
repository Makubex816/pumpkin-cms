using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

/// <summary>
/// Common interface for database-specific operations.
/// Both Cosmos DB and MongoDB implementations should implement this interface.
/// </summary>
public interface IDataConnection
{
    Task<Page?> GetPageAsync(string apiKey, string tenantId, string pageSlug);
    Task<Page> SavePageAsync(string apiKey, string tenantId, Page page);
    Task<Page> UpdatePageAsync(string apiKey, string tenantId, string pageSlug, Page page);
    Task<bool> DeletePageAsync(string apiKey, string tenantId, string pageSlug);
    Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry);
    Task<List<FormEntry>> GetFormEntriesByTenantAsync(string tenantId);
    Task<FormEntry?> GetFormEntryAsync(string tenantId, string id);
    Task<FormEntry> UpdateFormEntryStatusAsync(string tenantId, string id, FormEntryStatusUpdate statusUpdate);
    Task<FormDefinition?> GetFormDefinitionAsync(string apiKey, string tenantId, string type);
    Task<List<FormDefinition>> GetFormDefinitionsByTenantAsync(string tenantId);
    Task<FormDefinition?> GetFormDefinitionAdminAsync(string tenantId, string id);
    Task<FormDefinition> CreateFormDefinitionAsync(string tenantId, FormDefinition definition);
    Task<FormDefinition> UpdateFormDefinitionAsync(string tenantId, string id, FormDefinition definition);
    Task<bool> DeleteFormDefinitionAsync(string tenantId, string id);
    Task<List<SitemapEntry>> GetSitemapPagesAsync(string apiKey, string tenantId);
    
    
    // Admin methods (JWT authentication required at endpoint level)
    Task<Tenant?> GetTenantAsync(string tenantId);
    Task<Tenant> CreateTenantAsync(Tenant tenant);
    Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant);
    Task<Tenant> ProvisionTenantApiKeyHashAsync(string tenantId, string apiKeyHash);
    Task<bool> DeleteTenantAsync(string tenantId);
    Task<List<Tenant>> GetAllTenantsAsync();
    Task<List<Page>> GetAllPagesAsync(string? tenantId = null);
    Task<List<Page>> GetHubPagesAsync(string tenantId);
    Task<List<Page>> GetSpokePagesAsync(string tenantId, string hubPageSlug);
    Task<object> GetContentHierarchyAsync(string tenantId);
    
    // JWT-authenticated admin methods (no API key required)
    Task<Page?> GetPageBySlugAsync(string tenantId, string pageSlug);
    Task<List<Page>> GetPagesByTenantAsync(string tenantId);
    Task<List<Tenant>> GetTenantsForUserAsync(string userTenantId, bool isSuperAdmin);
    Task<Page> SavePageAdminAsync(string tenantId, Page page);
    Task<Page> UpdatePageAdminAsync(string tenantId, string pageSlug, Page page, PageChangeContext? changeContext = null);
    Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug);

    // Publish run registry methods (JWT authentication required at endpoint level)
    Task<List<PublishRun>> GetPublishRunsByTenantAsync(string tenantId);
    Task<PublishRun?> GetPublishRunAsync(string tenantId, string id);
    Task<PublishRun> SavePublishRunAsync(string tenantId, PublishRun publishRun);

    // Import run registry methods (JWT authentication required at endpoint level)
    Task<List<ImportRun>> GetImportRunsByTenantAsync(string tenantId);
    Task<ImportRun?> GetImportRunAsync(string tenantId, string id);
    Task<ImportRun> SaveImportRunAsync(string tenantId, ImportRun importRun);

    // Media asset registry methods (JWT authentication required at endpoint level)
    Task<List<MediaAsset>> GetMediaAssetsByTenantAsync(string tenantId);
    Task<MediaAsset?> GetMediaAssetAsync(string tenantId, string id);
    Task<MediaAsset> SaveMediaAssetAsync(string tenantId, MediaAsset mediaAsset);
    Task<MediaAsset> UpdateMediaAssetAsync(string tenantId, string id, MediaAsset mediaAsset);
    Task<bool> DeleteMediaAssetAsync(string tenantId, string id);

    // Domain binding registry methods (JWT authentication required at endpoint level)
    Task EnsureDomainBindingContainerAsync();
    Task<List<DomainBinding>> GetDomainBindingsAsync(string? tenantId = null);
    Task<DomainBinding?> GetDomainBindingAsync(string tenantId, string id);
    Task<DomainBinding> CreateDomainBindingAsync(string tenantId, DomainBinding domainBinding);
    Task<DomainBinding> UpdateDomainBindingAsync(string tenantId, string id, DomainBinding domainBinding);

    // Theme methods (content serving - API key required)
    Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId);
    Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId);

    // Theme admin methods (JWT authentication required at endpoint level)
    Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId);
    Task<Theme?> GetActiveThemeAdminAsync(string tenantId);
    Task<List<Theme>> GetThemesByTenantAsync(string tenantId);
    Task<Theme> CreateThemeAsync(string tenantId, Theme theme);
    Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme);
    Task<bool> DeleteThemeAsync(string tenantId, string themeId);

    // User authentication methods
    Task<List<User>> GetUsersAsync(string? tenantId = null);
    Task<User?> GetUserByIdAsync(string tenantId, string userId);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task UpdateUserLastLoginAsync(string userId, string tenantId);
}
