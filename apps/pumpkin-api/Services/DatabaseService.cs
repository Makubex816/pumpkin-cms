using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

/// <summary>
/// Database service that routes to the appropriate database implementation (Cosmos DB or MongoDB)
/// based on configuration.
/// </summary>
public class DatabaseService : IDatabaseService, IDisposable
{
    private readonly IDataConnection _dataConnection;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(
        IOptions<DatabaseSettings> settings,
        IServiceProvider serviceProvider,
        ILogger<DatabaseService> logger)
    {
        _logger = logger;
        var databaseSettings = settings.Value;

        _logger.LogInformation("Initializing DatabaseService with provider: {Provider}", databaseSettings.Provider);

        // Route to the appropriate database implementation based on configuration
        _dataConnection = databaseSettings.Provider.ToLowerInvariant() switch
        {
            "cosmosdb" => serviceProvider.GetRequiredService<CosmosDataConnection>(),
            "mongodb" => serviceProvider.GetRequiredService<MongoDataConnection>(),
            _ => throw new InvalidOperationException($"Unsupported database provider: {databaseSettings.Provider}")
        };

        _logger.LogInformation("DatabaseService initialized with {Provider}", databaseSettings.Provider);
    }

    public Task<Page?> GetPageAsync(string apiKey, string tenantId, string pageSlug)
    {
        return _dataConnection.GetPageAsync(apiKey, tenantId, pageSlug);
    }

    public Task<Page> SavePageAsync(string apiKey, string tenantId, Page page)
    {
        return _dataConnection.SavePageAsync(apiKey, tenantId, page);
    }

    public Task<Page> UpdatePageAsync(string apiKey, string tenantId, string pageSlug, Page page)
    {
        return _dataConnection.UpdatePageAsync(apiKey, tenantId, pageSlug, page);
    }

    public Task<bool> DeletePageAsync(string apiKey, string tenantId, string pageSlug)
    {
        return _dataConnection.DeletePageAsync(apiKey, tenantId, pageSlug);
    }

    public Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry)
    {
        return _dataConnection.SaveFormEntryAsync(apiKey, tenantId, formEntry);
    }

    public Task<List<FormEntry>> GetFormEntriesByTenantAsync(string tenantId)
    {
        return _dataConnection.GetFormEntriesByTenantAsync(tenantId);
    }

    public Task<FormEntry?> GetFormEntryAsync(string tenantId, string id)
    {
        return _dataConnection.GetFormEntryAsync(tenantId, id);
    }

    public Task<FormEntry> UpdateFormEntryStatusAsync(string tenantId, string id, FormEntryStatusUpdate statusUpdate)
    {
        return _dataConnection.UpdateFormEntryStatusAsync(tenantId, id, statusUpdate);
    }

    public Task<List<SitemapEntry>> GetSitemapPagesAsync(string apiKey, string tenantId)
    {
        return _dataConnection.GetSitemapPagesAsync(apiKey, tenantId);
    }

    // Admin methods (JWT authentication required at endpoint level)
    public Task<Tenant?> GetTenantAsync(string tenantId)
    {
        return _dataConnection.GetTenantAsync(tenantId);
    }

    public Task<Tenant> CreateTenantAsync(Tenant tenant)
    {
        return _dataConnection.CreateTenantAsync(tenant);
    }

    public Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant)
    {
        return _dataConnection.UpdateTenantAsync(tenantId, tenant);
    }

    public Task<bool> DeleteTenantAsync(string tenantId)
    {
        return _dataConnection.DeleteTenantAsync(tenantId);
    }

    public Task<List<Tenant>> GetAllTenantsAsync()
    {
        return _dataConnection.GetAllTenantsAsync();
    }

    public Task<List<Page>> GetAllPagesAsync(string? tenantId = null)
    {
        return _dataConnection.GetAllPagesAsync(tenantId);
    }

    public Task<List<Page>> GetHubPagesAsync(string tenantId)
    {
        return _dataConnection.GetHubPagesAsync(tenantId);
    }

    public Task<List<Page>> GetSpokePagesAsync(string tenantId, string hubPageSlug)
    {
        return _dataConnection.GetSpokePagesAsync(tenantId, hubPageSlug);
    }

    public Task<object> GetContentHierarchyAsync(string tenantId)
    {
        return _dataConnection.GetContentHierarchyAsync(tenantId);
    }

    // JWT-authenticated admin methods (no API key required)
    public Task<Page?> GetPageBySlugAsync(string tenantId, string pageSlug)
    {
        return _dataConnection.GetPageBySlugAsync(tenantId, pageSlug);
    }

    public Task<List<Page>> GetPagesByTenantAsync(string tenantId)
    {
        return _dataConnection.GetPagesByTenantAsync(tenantId);
    }

    public Task<List<Tenant>> GetTenantsForUserAsync(string userTenantId, bool isSuperAdmin)
    {
        return _dataConnection.GetTenantsForUserAsync(userTenantId, isSuperAdmin);
    }

    public Task<Page> SavePageAdminAsync(string tenantId, Page page)
    {
        return _dataConnection.SavePageAdminAsync(tenantId, page);
    }

    public Task<Page> UpdatePageAdminAsync(string tenantId, string pageSlug, Page page, PageChangeContext? changeContext = null)
    {
        return _dataConnection.UpdatePageAdminAsync(tenantId, pageSlug, page, changeContext);
    }

    public Task<List<PublishRun>> GetPublishRunsByTenantAsync(string tenantId)
    {
        return _dataConnection.GetPublishRunsByTenantAsync(tenantId);
    }

    public Task<PublishRun?> GetPublishRunAsync(string tenantId, string id)
    {
        return _dataConnection.GetPublishRunAsync(tenantId, id);
    }

    public Task<PublishRun> SavePublishRunAsync(string tenantId, PublishRun publishRun)
    {
        return _dataConnection.SavePublishRunAsync(tenantId, publishRun);
    }

    public Task<List<ImportRun>> GetImportRunsByTenantAsync(string tenantId)
    {
        return _dataConnection.GetImportRunsByTenantAsync(tenantId);
    }

    public Task<ImportRun?> GetImportRunAsync(string tenantId, string id)
    {
        return _dataConnection.GetImportRunAsync(tenantId, id);
    }

    public Task<ImportRun> SaveImportRunAsync(string tenantId, ImportRun importRun)
    {
        return _dataConnection.SaveImportRunAsync(tenantId, importRun);
    }

    public Task<List<MediaAsset>> GetMediaAssetsByTenantAsync(string tenantId)
    {
        return _dataConnection.GetMediaAssetsByTenantAsync(tenantId);
    }

    public Task<MediaAsset?> GetMediaAssetAsync(string tenantId, string id)
    {
        return _dataConnection.GetMediaAssetAsync(tenantId, id);
    }

    public Task<MediaAsset> SaveMediaAssetAsync(string tenantId, MediaAsset mediaAsset)
    {
        return _dataConnection.SaveMediaAssetAsync(tenantId, mediaAsset);
    }

    public Task<MediaAsset> UpdateMediaAssetAsync(string tenantId, string id, MediaAsset mediaAsset)
    {
        return _dataConnection.UpdateMediaAssetAsync(tenantId, id, mediaAsset);
    }

    // Theme methods (content serving - API key required)
    public Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId)
    {
        return _dataConnection.GetThemeAsync(apiKey, tenantId, themeId);
    }

    public Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId)
    {
        return _dataConnection.GetActiveThemeAsync(apiKey, tenantId);
    }

    // Theme admin methods (JWT authentication required at endpoint level)
    public Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId)
    {
        return _dataConnection.GetThemeAdminAsync(tenantId, themeId);
    }

    public Task<Theme?> GetActiveThemeAdminAsync(string tenantId)
    {
        return _dataConnection.GetActiveThemeAdminAsync(tenantId);
    }

    public Task<List<Theme>> GetThemesByTenantAsync(string tenantId)
    {
        return _dataConnection.GetThemesByTenantAsync(tenantId);
    }

    public Task<Theme> CreateThemeAsync(string tenantId, Theme theme)
    {
        return _dataConnection.CreateThemeAsync(tenantId, theme);
    }

    public Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme)
    {
        return _dataConnection.UpdateThemeAsync(tenantId, themeId, theme);
    }

    public Task<bool> DeleteThemeAsync(string tenantId, string themeId)
    {
        return _dataConnection.DeleteThemeAsync(tenantId, themeId);
    }

    // User authentication methods
    public Task<User?> GetUserByEmailAsync(string email)
    {
        return _dataConnection.GetUserByEmailAsync(email);
    }

    public Task UpdateUserLastLoginAsync(string userId, string tenantId)
    {
        return _dataConnection.UpdateUserLastLoginAsync(userId, tenantId);
    }

    public void Dispose()
    {
        if (_dataConnection is IDisposable disposable)
        {
            disposable.Dispose();
        }
    }
}
