using Microsoft.Extensions.Options;
using pumpkin_api.Services.PublicForms;
using pumpkin_api.Services.TenantRedirects;
using pumpkin_net_models.Models;
using System.Security.Cryptography;
#if USE_MONGODB
using MongoDB.Driver;
#endif

namespace pumpkin_api.Services;

/// <summary>
/// MongoDB implementation of IDataConnection.
/// Handles all MongoDB-specific operations.
/// Note: Requires MongoDB.Driver NuGet package. Install with: dotnet add package MongoDB.Driver
/// </summary>
public class MongoDataConnection : IDataConnection, IDisposable
{
#if USE_MONGODB
    private readonly IMongoClient _mongoClient;
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDataConnection> _logger;
    private readonly SemaphoreSlim _publicIndexGate = new(1, 1);
    private bool _publicIndexesReady;
    private bool _disposed = false;

    public MongoDataConnection(IOptions<MongoDbSettings> settings, ILogger<MongoDataConnection> logger)
    {
        _logger = logger;
        var mongoSettings = settings.Value;

        var clientSettings = MongoClientSettings.FromConnectionString(mongoSettings.ConnectionString);
        clientSettings.MaxConnectionPoolSize = mongoSettings.MaxConnectionPoolSize;
        clientSettings.ConnectTimeout = TimeSpan.FromMilliseconds(mongoSettings.ConnectTimeoutMs);
        clientSettings.ServerSelectionTimeout = TimeSpan.FromMilliseconds(mongoSettings.ServerSelectionTimeoutMs);

        _mongoClient = new MongoClient(clientSettings);
        _database = _mongoClient.GetDatabase(mongoSettings.DatabaseName);

        _logger.LogInformation("MongoDB Data Connection initialized for database: {DatabaseName}",
            mongoSettings.DatabaseName);
    }

    public async Task<Page?> GetPageAsync(string apiKey, string tenantId, string pageSlug)
    {
        try
        {
            _logger.LogInformation("GetPageAsync called - TenantId: {TenantId}, PageSlug: '{PageSlug}'", tenantId, pageSlug);
            
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                return null;
            }

            // If tenant is valid, proceed to get the page
            var pagesCollection = _database.GetCollection<Page>("Page");
            
            // Normalize slug to lowercase to match stored value
            var normalizedSlug = pageSlug.ToLowerInvariant();
            _logger.LogInformation("Querying with normalized slug: '{NormalizedSlug}'", normalizedSlug);
            
            // Query for page by pageSlug and tenantId
            var filter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
                Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug),
                Builders<Page>.Filter.Eq(p => p.IsPublished, true)
            );

            var page = await pagesCollection.Find(filter).FirstOrDefaultAsync();
            
            if (page != null)
            {
                _logger.LogInformation("Page retrieved successfully - Slug: {Slug}, PageId: {PageId}, TenantId: {TenantId}", 
                    normalizedSlug, page.PageId, tenantId);
                return page;
            }
            
            _logger.LogInformation("Page not found - Slug: '{Slug}', TenantId: {TenantId}", normalizedSlug, tenantId);
            return null;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error retrieving page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
    }

    public async Task<Page> SavePageAsync(string apiKey, string tenantId, Page page)
    {
        try
        {
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                throw new UnauthorizedAccessException("Invalid API key or tenant ID");
            }

            // Ensure the page has required fields
            if (string.IsNullOrEmpty(page.PageId))
            {
                throw new ArgumentException("PageId is required", nameof(page));
            }

            var pagesCollection = _database.GetCollection<Page>("Page");

            // Check if page already exists
            var existingFilter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.PageId, page.PageId),
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId)
            );
            var exists = await pagesCollection.Find(existingFilter).AnyAsync();
            
            if (exists)
            {
                _logger.LogWarning("Page already exists - PageId: {PageId}, TenantId: {TenantId}", page.PageId, tenantId);
                throw new InvalidOperationException($"Page with ID {page.PageId} already exists");
            }

            // Set timestamps
            if (page.MetaData.CreatedAt == default)
            {
                page.MetaData.CreatedAt = DateTime.UtcNow;
            }
            page.MetaData.UpdatedAt = DateTime.UtcNow;

            // Insert the page
            await pagesCollection.InsertOneAsync(page);

            _logger.LogInformation("Page created successfully - PageId: {PageId}, TenantId: {TenantId}",
                page.PageId, tenantId);

            return page;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error creating page - PageId: {PageId}, TenantId: {TenantId}", page.PageId, tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating page - PageId: {PageId}, TenantId: {TenantId}", page.PageId, tenantId);
            throw;
        }
    }

    public async Task<Page> UpdatePageAsync(string apiKey, string tenantId, string pageSlug, Page page)
    {
        try
        {
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                throw new UnauthorizedAccessException("Invalid API key or tenant ID");
            }

            var pagesCollection = _database.GetCollection<Page>("Page");

            // Normalize slug to lowercase to match stored value
            var normalizedSlug = pageSlug.ToLowerInvariant();

            // Find the existing page by slug
            var findFilter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
                Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug)
            );

            var existingPage = await pagesCollection.Find(findFilter).FirstOrDefaultAsync();

            if (existingPage == null)
            {
                _logger.LogWarning("Page not found for update - Slug: {Slug}, TenantId: {TenantId}", normalizedSlug, tenantId);
                throw new KeyNotFoundException($"Page with slug '{pageSlug}' not found");
            }

            // Ensure the pageSlug matches (after normalization)
            var normalizedInputSlug = page.PageSlug.ToLowerInvariant();
            if (normalizedInputSlug != normalizedSlug)
            {
                throw new ArgumentException("PageSlug in the URL must match the PageSlug in the request body");
            }

            // Preserve the PageId from the existing page
            page.PageId = existingPage.PageId;

            // Update timestamp
            page.MetaData.UpdatedAt = DateTime.UtcNow;

            // Increment version
            page.PageVersion++;

            // Replace the page
            var replaceFilter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.PageId, existingPage.PageId),
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId)
            );
            
            var result = await pagesCollection.ReplaceOneAsync(replaceFilter, page);

            if (result.ModifiedCount == 0)
            {
                _logger.LogWarning("Page update did not modify any documents - Slug: {Slug}, TenantId: {TenantId}", normalizedSlug, tenantId);
                throw new InvalidOperationException("Page update failed");
            }

            _logger.LogInformation("Page updated successfully - Slug: {Slug}, PageId: {PageId}, TenantId: {TenantId}, Version: {Version}",
                normalizedSlug, existingPage.PageId, tenantId, page.PageVersion);

            return page;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error updating page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
    }

    public async Task<bool> DeletePageAsync(string apiKey, string tenantId, string pageSlug)
    {
        try
        {
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                throw new UnauthorizedAccessException("Invalid API key or tenant ID");
            }

            // Ensure the pageSlug is provided
            if (string.IsNullOrEmpty(pageSlug))
            {
                throw new ArgumentException("PageSlug is required", nameof(pageSlug));
            }

            var pagesCollection = _database.GetCollection<Page>("Page");

            // Normalize slug to lowercase to match stored value
            var normalizedSlug = pageSlug.ToLowerInvariant();

            // Delete the page by slug and tenantId
            var deleteFilter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
                Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug)
            );

            var result = await pagesCollection.DeleteOneAsync(deleteFilter);

            if (result.DeletedCount == 0)
            {
                _logger.LogWarning("Page not found for deletion - Slug: {Slug}, TenantId: {TenantId}", normalizedSlug, tenantId);
                throw new KeyNotFoundException($"Page with slug '{pageSlug}' not found");
            }

            _logger.LogInformation("Page deleted successfully - Slug: {Slug}, TenantId: {TenantId}",
                normalizedSlug, tenantId);

            return true;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error deleting page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting page - Slug: {Slug}, TenantId: {TenantId}", pageSlug, tenantId);
            throw;
        }
    }

    public Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry) => SaveFormEntryAsync(apiKey, tenantId, formEntry, CancellationToken.None);

    public async Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry, CancellationToken cancellationToken)
    {
        try
        {
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                throw new UnauthorizedAccessException("Invalid API key or tenant ID");
            }

            // Ensure the form entry has required fields
            if (string.IsNullOrWhiteSpace(formEntry.SubmissionId))
                formEntry.SubmissionId = Guid.NewGuid().ToString();
            formEntry.Id = formEntry.SubmissionId;
            formEntry.IdempotencyKey = string.IsNullOrWhiteSpace(formEntry.IdempotencyKey) ? formEntry.SubmissionId : formEntry.IdempotencyKey;
            formEntry.Metadata ??= new FormEntryMetadata();
            formEntry.Metadata.SubmissionId = formEntry.SubmissionId;
            formEntry.Metadata.CorrelationId = formEntry.CorrelationId;

            // Set tenant ID if not already set
            if (string.IsNullOrEmpty(formEntry.TenantId))
            {
                formEntry.TenantId = tenantId;
            }

            var formEntryCollection = _database.GetCollection<FormEntry>("FormEntry");

            // Check if form entry already exists
            var existingFilter = Builders<FormEntry>.Filter.And(
                Builders<FormEntry>.Filter.Eq(f => f.Id, formEntry.Id),
                Builders<FormEntry>.Filter.Eq(f => f.TenantId, tenantId)
            );
            var existing = await formEntryCollection.Find(existingFilter).FirstOrDefaultAsync(cancellationToken);
            
            if (existing != null)
            {
                _logger.LogWarning("Form entry already exists - FormEntryId: {FormEntryId}, TenantId: {TenantId}", formEntry.Id, tenantId);
                existing.Metadata ??= new FormEntryMetadata();
                existing.Metadata.IdempotentReplay = true;
                return existing;
            }

            // Set timestamp
            if (formEntry.SubmittedAt == default)
            {
                formEntry.SubmittedAt = DateTime.UtcNow;
            }

            // Insert the form entry
            await formEntryCollection.InsertOneAsync(formEntry, cancellationToken: cancellationToken);

            _logger.LogInformation("Form entry created successfully - FormEntryId: {FormEntryId}, FormId: {FormId}, TenantId: {TenantId}",
                formEntry.Id, formEntry.FormId, tenantId);

            return formEntry;
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            var existing = await _database.GetCollection<FormEntry>("FormEntry").Find(item => item.Id == formEntry.Id && item.TenantId == tenantId).FirstOrDefaultAsync(cancellationToken);
            if (existing == null) throw;
            existing.Metadata ??= new FormEntryMetadata();
            existing.Metadata.IdempotentReplay = true;
            return existing;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error creating form entry - FormEntryId: {FormEntryId}, TenantId: {TenantId}", formEntry.Id, tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating form entry - FormEntryId: {FormEntryId}, TenantId: {TenantId}", formEntry.Id, tenantId);
            throw;
        }
    }

    public async Task<PublicFormEntryCreateResult> CreatePublicFormEntryAsync(
        FormEntry formEntry,
        CancellationToken cancellationToken)
    {
        if (!PublicFormPersistenceContract.IsValidCandidate(formEntry))
            throw new ArgumentException("public_form_entry_invalid", nameof(formEntry));
        await EnsurePublicIndexesAsync(cancellationToken);
        var collection = _database.GetCollection<FormEntry>("FormEntry");
        try
        {
            await collection.InsertOneAsync(formEntry, cancellationToken: cancellationToken);
            return new(PublicFormEntryCreateStatus.Created, formEntry);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            var existing = await collection.Find(item => item.Id == formEntry.Id)
                .FirstOrDefaultAsync(cancellationToken);
            return existing == null
                ? new(PublicFormEntryCreateStatus.Conflict, null)
                : PublicFormPersistenceContract.ResolveDuplicate(existing, formEntry);
        }
    }

    public async Task<List<FormEntry>> GetFormEntriesByTenantAsync(string tenantId)
    {
        var formEntryCollection = _database.GetCollection<FormEntry>("FormEntry");
        var filter = Builders<FormEntry>.Filter.Eq(entry => entry.TenantId, tenantId);

        return await formEntryCollection
            .Find(filter)
            .SortByDescending(entry => entry.SubmittedAt)
            .ToListAsync();
    }

    public async Task<FormEntry?> GetFormEntryAsync(string tenantId, string id)
    {
        var formEntryCollection = _database.GetCollection<FormEntry>("FormEntry");
        var filter = Builders<FormEntry>.Filter.And(
            Builders<FormEntry>.Filter.Eq(entry => entry.TenantId, tenantId),
            Builders<FormEntry>.Filter.Eq(entry => entry.Id, id)
        );

        return await formEntryCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<FormEntry> UpdateFormEntryStatusAsync(string tenantId, string id, FormEntryStatusUpdate statusUpdate)
    {
        var formEntryCollection = _database.GetCollection<FormEntry>("FormEntry");
        var filter = Builders<FormEntry>.Filter.And(
            Builders<FormEntry>.Filter.Eq(entry => entry.TenantId, tenantId),
            Builders<FormEntry>.Filter.Eq(entry => entry.Id, id)
        );

        var formEntry = await formEntryCollection.Find(filter).FirstOrDefaultAsync();
        if (formEntry == null)
        {
            throw new KeyNotFoundException($"Form entry '{id}' not found");
        }

        formEntry.Metadata ??= new FormEntryMetadata();
        formEntry.Metadata.Status = statusUpdate.Status;
        if (statusUpdate.Tags != null)
        {
            formEntry.Metadata.Tags = statusUpdate.Tags;
        }

        await formEntryCollection.ReplaceOneAsync(filter, formEntry);
        return formEntry;
    }

    public async Task<FormDefinition?> GetFormDefinitionAsync(string apiKey, string tenantId, string type)
    {
        var isValid = await ValidateTenantApiKeyAsync(apiKey, tenantId);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid API key");

        var definition = await GetFormDefinitionByTypeAdminAsync(tenantId, type);
        return definition != null && IsPublicFormDefinition(definition) ? definition : null;
    }

    public async Task<List<FormDefinition>> GetFormDefinitionsByTenantAsync(string tenantId)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var filter = Builders<FormDefinition>.Filter.Eq(definition => definition.TenantId, tenantId);
        var sort = Builders<FormDefinition>.Sort.Descending(definition => definition.UpdatedAt);
        return await collection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<FormDefinition?> GetFormDefinitionAdminAsync(string tenantId, string id)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var filter = Builders<FormDefinition>.Filter.And(
            Builders<FormDefinition>.Filter.Eq(definition => definition.TenantId, tenantId),
            Builders<FormDefinition>.Filter.Eq(definition => definition.Id, id)
        );
        return await collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<FormDefinition> CreateFormDefinitionAsync(string tenantId, FormDefinition definition)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var existing = await GetFormDefinitionAdminAsync(tenantId, definition.Id);
        if (existing != null)
            throw new InvalidOperationException($"FormDefinition with ID '{definition.Id}' already exists for tenant '{tenantId}'");

        definition.TenantId = tenantId;
        await collection.InsertOneAsync(definition);
        return definition;
    }

    public async Task<FormDefinition> UpdateFormDefinitionAsync(string tenantId, string id, FormDefinition definition)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var filter = Builders<FormDefinition>.Filter.And(
            Builders<FormDefinition>.Filter.Eq(item => item.TenantId, tenantId),
            Builders<FormDefinition>.Filter.Eq(item => item.Id, id)
        );

        var existing = await collection.Find(filter).FirstOrDefaultAsync();
        if (existing == null)
            throw new KeyNotFoundException($"FormDefinition with ID '{id}' not found for tenant '{tenantId}'");

        definition.Id = id;
        definition.TenantId = tenantId;
        definition.CreatedAt = existing.CreatedAt;
        definition.CreatedBy = existing.CreatedBy;

        await collection.ReplaceOneAsync(filter, definition);
        return definition;
    }

    public async Task<bool> DeleteFormDefinitionAsync(string tenantId, string id)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var filter = Builders<FormDefinition>.Filter.And(
            Builders<FormDefinition>.Filter.Eq(definition => definition.TenantId, tenantId),
            Builders<FormDefinition>.Filter.Eq(definition => definition.Id, id)
        );
        var result = await collection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public async Task<PublicPublication?> GetPublicPublicationAsync(
        string publicationId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(publicationId)) return null;
        return await _database.GetCollection<PublicPublication>("PublicPublication")
            .Find(item => item.Id == publicationId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PublicPublication> CreatePublicPublicationAsync(
        PublicPublication publication,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(publication.PublicationId) ||
            !string.Equals(publication.Id, publication.PublicationId, StringComparison.Ordinal))
            throw new ArgumentException("public_publication_invalid", nameof(publication));
        await EnsurePublicIndexesAsync(cancellationToken);
        try
        {
            await _database.GetCollection<PublicPublication>("PublicPublication")
                .InsertOneAsync(publication, cancellationToken: cancellationToken);
            return publication;
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            throw new InvalidOperationException("public_publication_conflict", ex);
        }
    }

    public async Task<PublicPublication> UpdatePublicPublicationAsync(
        PublicPublication publication,
        long expectedRevision,
        CancellationToken cancellationToken)
    {
        if (expectedRevision < 1 || publication.Revision != expectedRevision + 1)
            throw new InvalidOperationException("public_publication_revision_conflict");
        var collection = _database.GetCollection<PublicPublication>("PublicPublication");
        var filter = Builders<PublicPublication>.Filter.And(
            Builders<PublicPublication>.Filter.Eq(item => item.Id, publication.PublicationId),
            Builders<PublicPublication>.Filter.Eq(item => item.Revision, expectedRevision));
        var result = await collection.ReplaceOneAsync(filter, publication, cancellationToken: cancellationToken);
        if (result.ModifiedCount != 1)
            throw new InvalidOperationException("public_publication_revision_conflict");
        return publication;
    }

    public async Task<List<PublicPublication>> ListPublicPublicationsAsync(
        string? tenantUid,
        CancellationToken cancellationToken)
    {
        var collection = _database.GetCollection<PublicPublication>("PublicPublication");
        var filter = string.IsNullOrWhiteSpace(tenantUid)
            ? Builders<PublicPublication>.Filter.Empty
            : Builders<PublicPublication>.Filter.Eq(item => item.TenantUid, tenantUid);
        return await collection.Find(filter)
            .SortByDescending(item => item.UpdatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    private async Task<FormDefinition?> GetFormDefinitionByTypeAdminAsync(string tenantId, string type)
    {
        var collection = _database.GetCollection<FormDefinition>("FormDefinition");
        var filter = Builders<FormDefinition>.Filter.And(
            Builders<FormDefinition>.Filter.Eq(definition => definition.TenantId, tenantId),
            Builders<FormDefinition>.Filter.Or(
                Builders<FormDefinition>.Filter.Eq(definition => definition.FormKey, type),
                Builders<FormDefinition>.Filter.Eq(definition => definition.FormType, type)
            )
        );
        var sort = Builders<FormDefinition>.Sort.Descending(definition => definition.UpdatedAt);
        return await collection.Find(filter).Sort(sort).FirstOrDefaultAsync();
    }

    private static bool IsPublicFormDefinition(FormDefinition definition)
    {
        return string.Equals(definition.Status, "active", StringComparison.OrdinalIgnoreCase)
            || string.Equals(definition.Status, "published", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<List<SitemapEntry>> GetSitemapPagesAsync(string apiKey, string tenantId)
    {
        try
        {
            _logger.LogInformation("GetSitemapPagesAsync called - TenantId: {TenantId}", tenantId);
            
            // Validate the API key against the Tenant collection
            var isValidTenant = await ValidateTenantApiKeyAsync(apiKey, tenantId);
            if (!isValidTenant)
            {
                _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                return new List<SitemapEntry>();
            }

            var pagesCollection = _database.GetCollection<Page>("Page");
            
            // Query for published pages with includeInSitemap = true
            var filter = Builders<Page>.Filter.And(
                Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
                Builders<Page>.Filter.Eq(p => p.IsPublished, true),
                Builders<Page>.Filter.Eq(p => p.IncludeInSitemap, true)
            );

            // Project necessary fields for sitemap: pageSlug, publishedAt, and updatedAt
            var projection = Builders<Page>.Projection
                .Include(p => p.PageSlug)
                .Include(p => p.PublishedAt)
                .Include("MetaData.updatedAt");
                
            var pages = await pagesCollection.Find(filter).Project<Page>(projection).ToListAsync();
            
            var sitemapEntries = pages.Select(p => new SitemapEntry
            {
                PageSlug = p.PageSlug,
                // Use publishedAt if available, otherwise updatedAt
                LastModified = p.PublishedAt ?? p.MetaData?.UpdatedAt ?? DateTime.UtcNow
            }).ToList();
            
            _logger.LogInformation("Retrieved {Count} sitemap entries for tenant - TenantId: {TenantId}", sitemapEntries.Count, tenantId);
            return sitemapEntries;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error retrieving sitemap pages - TenantId: {TenantId}", tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving sitemap pages - TenantId: {TenantId}", tenantId);
            throw;
        }
    }

    private async Task<bool> ValidateTenantApiKeyAsync(string apiKey, string tenantId)
    {
        try
        {
            var tenantCollection = _database.GetCollection<Tenant>("Tenant");
            
            // Find the tenant by tenantId with active status
            var filter = Builders<Tenant>.Filter.And(
                Builders<Tenant>.Filter.Eq(t => t.TenantId, tenantId),
                Builders<Tenant>.Filter.Eq(t => t.Status, "active"),
                Builders<Tenant>.Filter.Eq(t => t.ApiKeyMeta.IsActive, true)
            );

            var tenant = await tenantCollection.Find(filter).FirstOrDefaultAsync();
            
            if (tenant != null)
            {
                // Verify the API key against the stored bcrypt hash
                var isValidKey = BCrypt.Net.BCrypt.Verify(apiKey, tenant.ApiKeyHash);
                
                if (isValidKey)
                {
                    _logger.LogInformation("Tenant validation successful - TenantId: {TenantId}, Name: {Name}, Plan: {Plan}", 
                        tenantId, tenant.Name, tenant.Plan);
                    return true;
                }
                else
                {
                    _logger.LogWarning("Invalid API key for tenant - TenantId: {TenantId}", tenantId);
                }
            }
            
            _logger.LogWarning("Tenant validation failed - TenantId: {TenantId}", tenantId);
            return false;
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "Error validating tenant - TenantId: {TenantId}", tenantId);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error validating tenant - TenantId: {TenantId}", tenantId);
            throw;
        }
    }

    // Admin methods (JWT authentication required at endpoint level)
    public async Task<Tenant?> GetTenantAsync(string tenantId)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        var filter = Builders<Tenant>.Filter.Eq(t => t.TenantId, tenantId);
        return await tenantCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<Tenant> CreateTenantAsync(Tenant tenant)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        
        // Check if tenant exists
        var existing = await GetTenantAsync(tenant.TenantId);
        if (existing != null)
        {
            throw new InvalidOperationException($"Tenant with ID '{tenant.TenantId}' already exists");
        }

        // Generate API key and hash if not provided
        if (string.IsNullOrEmpty(tenant.ApiKey) || string.IsNullOrEmpty(tenant.ApiKeyHash))
        {
            // Generate a new random API key (32 bytes = 44 base64 characters)
            var keyBytes = RandomNumberGenerator.GetBytes(32);
            tenant.ApiKey = Convert.ToBase64String(keyBytes);
            
            // Hash the API key using BCrypt
            tenant.ApiKeyHash = BCrypt.Net.BCrypt.HashPassword(tenant.ApiKey, 12);
            
            _logger.LogInformation("Generated new API key for tenant - TenantId: {TenantId}", tenant.TenantId);
        }

        tenant.CreatedAt = DateTime.UtcNow;
        tenant.UpdatedAt = DateTime.UtcNow;
        tenant.ApiKeyMeta.CreatedAt = DateTime.UtcNow;
        tenant.Id = tenant.TenantId;

        await tenantCollection.InsertOneAsync(tenant);
        _logger.LogInformation("Tenant created - TenantId: {TenantId}", tenant.TenantId);
        
        return tenant;
    }

    public async Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        
        // Check if tenant exists
        var filter = Builders<Tenant>.Filter.Eq(t => t.TenantId, tenantId);
        var existing = await tenantCollection.Find(filter).FirstOrDefaultAsync();
        
        if (existing == null)
        {
            throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found");
        }

        tenant.CreatedAt = existing.CreatedAt;
        tenant.UpdatedAt = DateTime.UtcNow;
        tenant.Id = tenantId;
        tenant.TenantId = tenantId;

        if (string.IsNullOrEmpty(tenant.ApiKey))
        {
            tenant.ApiKey = existing.ApiKey;
            tenant.ApiKeyHash = existing.ApiKeyHash;
            tenant.ApiKeyMeta = existing.ApiKeyMeta;
        }

        await tenantCollection.ReplaceOneAsync(filter, tenant);
        _logger.LogInformation("Tenant updated - TenantId: {TenantId}", tenantId);

        return tenant;
    }

    public async Task<Tenant> ProvisionTenantApiKeyHashAsync(string tenantId, string apiKeyHash)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        var filter = Builders<Tenant>.Filter.Eq(t => t.TenantId, tenantId);
        var tenant = await tenantCollection.Find(filter).FirstOrDefaultAsync();

        if (tenant == null)
        {
            throw new InvalidOperationException($"Tenant with ID '{tenantId}' not found");
        }

        tenant.Id = tenantId;
        tenant.TenantId = tenantId;
        tenant.ApiKey = string.Empty;
        tenant.ApiKeyHash = apiKeyHash;
        tenant.ApiKeyMeta = new ApiKeyMeta
        {
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        tenant.UpdatedAt = DateTime.UtcNow;

        await tenantCollection.ReplaceOneAsync(filter, tenant);
        _logger.LogInformation("Tenant submit key hash provisioned - TenantId: {TenantId}", tenantId);

        return tenant;
    }

    public async Task<bool> DeleteTenantAsync(string tenantId)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        
        var filter = Builders<Tenant>.Filter.Eq(t => t.TenantId, tenantId);
        var result = await tenantCollection.DeleteOneAsync(filter);
        
        if (result.DeletedCount > 0)
        {
            _logger.LogInformation("Tenant deleted - TenantId: {TenantId}", tenantId);
            return true;
        }
        
        _logger.LogWarning("Attempted to delete non-existent tenant - TenantId: {TenantId}", tenantId);
        return false;
    }

    public async Task<List<Tenant>> GetAllTenantsAsync()
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        var sort = Builders<Tenant>.Sort.Descending(t => t.CreatedAt);
        return await tenantCollection.Find(_ => true).Sort(sort).ToListAsync();
    }

    public async Task<List<Page>> GetAllPagesAsync(string? tenantId = null)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var filter = string.IsNullOrEmpty(tenantId) 
            ? Builders<Page>.Filter.Empty
            : Builders<Page>.Filter.Eq(p => p.TenantId, tenantId);
        
        var sort = Builders<Page>.Sort.Descending("MetaData.updatedAt");
        return await pageCollection.Find(filter).Sort(sort).ToListAsync();
    }

    // JWT-authenticated admin method: Get pages by tenant (no API key validation)
    public async Task<Page?> GetPageBySlugAsync(string tenantId, string pageSlug)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var normalizedSlug = pageSlug.ToLowerInvariant();
        var filter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
            Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug)
        );
        return await pageCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<List<Page>> GetPagesByTenantAsync(string tenantId)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var filter = Builders<Page>.Filter.Eq(p => p.TenantId, tenantId);
        var sort = Builders<Page>.Sort.Descending("MetaData.updatedAt");
        return await pageCollection.Find(filter).Sort(sort).ToListAsync();
    }

    // JWT-authenticated: Get tenants for user (SuperAdmin sees all, others see only their own)
    public async Task<List<Tenant>> GetTenantsForUserAsync(string userTenantId, bool isSuperAdmin)
    {
        var tenantCollection = _database.GetCollection<Tenant>("Tenant");
        
        FilterDefinition<Tenant> filter;
        if (isSuperAdmin)
        {
            filter = Builders<Tenant>.Filter.Eq(t => t.Status, "active");
        }
        else
        {
            // Regular users see only their own tenant (no status filter)
            filter = Builders<Tenant>.Filter.Eq(t => t.TenantId, userTenantId);
        }
        
        var sort = Builders<Tenant>.Sort.Ascending(t => t.Name);
        var tenants = await tenantCollection.Find(filter).Sort(sort).ToListAsync();
        
        // If no tenant found for regular user, create a minimal one for display
        if (!isSuperAdmin && tenants.Count == 0)
        {
            tenants.Add(new Tenant
            {
                Id = userTenantId,
                TenantId = userTenantId,
                Name = $"Tenant {userTenantId}",
                Status = "active",
                Plan = "basic",
                ApiKeyMeta = new ApiKeyMeta { IsActive = true, CreatedAt = DateTime.UtcNow },
                Settings = new TenantSettings(),
                Contact = new Contact(),
                Billing = new Billing()
            });
        }
        
        return tenants;
    }

    // JWT-authenticated admin method: Save page (no API key validation)
    public async Task<Page> SavePageAdminAsync(string tenantId, Page page)
    {
        if (string.IsNullOrEmpty(page.PageId))
        {
            throw new ArgumentException("PageId is required", nameof(page));
        }

        var pagesCollection = _database.GetCollection<Page>("Page");

        // Check if page already exists
        var existingFilter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.PageId, page.PageId),
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId)
        );
        var exists = await pagesCollection.Find(existingFilter).AnyAsync();

        if (exists)
        {
            throw new InvalidOperationException($"Page with ID {page.PageId} already exists");
        }

        page.TenantId = tenantId;
        if (page.MetaData.CreatedAt == default)
        {
            page.MetaData.CreatedAt = DateTime.UtcNow;
        }
        page.MetaData.UpdatedAt = DateTime.UtcNow;

        await pagesCollection.InsertOneAsync(page);

        _logger.LogInformation("SavePageAdminAsync - Page created - PageId: {PageId}, TenantId: {TenantId}",
            page.PageId, tenantId);

        return page;
    }

    // JWT-authenticated admin method: Update page (no API key validation)
    public async Task<Page> UpdatePageAdminAsync(string tenantId, string pageSlug, Page page, PageChangeContext? changeContext = null)
    {
        var pagesCollection = _database.GetCollection<Page>("Page");
        var normalizedSlug = pageSlug.ToLowerInvariant();

        var findFilter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
            Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug)
        );

        var existingPage = await pagesCollection.Find(findFilter).FirstOrDefaultAsync();

        if (existingPage == null)
        {
            throw new KeyNotFoundException($"Page with slug '{pageSlug}' not found");
        }

        var pageToSave = PageRevisionHelper.PrepareUpdate(existingPage, page, tenantId, changeContext);

        var replaceFilter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.PageId, existingPage.PageId),
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId)
        );

        var result = await pagesCollection.ReplaceOneAsync(replaceFilter, pageToSave);
        if (result.ModifiedCount == 0)
        {
            throw new InvalidOperationException("Page update failed");
        }

        _logger.LogInformation("UpdatePageAdminAsync - Page updated - Slug: {Slug}, TenantId: {TenantId}, Version: {Version}",
            normalizedSlug, tenantId, pageToSave.PageVersion);

        return pageToSave;
    }

    public async Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var normalizedSlug = pageSlug.ToLowerInvariant();
        var filter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
            Builders<Page>.Filter.Eq(p => p.PageSlug, normalizedSlug)
        );
        var result = await pageCollection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public async Task<List<Page>> GetHubPagesAsync(string tenantId)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var filter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
            Builders<Page>.Filter.Eq("contentRelationships.isHub", true)
        );
        
        var sort = Builders<Page>.Sort.Descending("MetaData.updatedAt");
        return await pageCollection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<List<Page>> GetSpokePagesAsync(string tenantId, string hubPageSlug)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var filter = Builders<Page>.Filter.And(
            Builders<Page>.Filter.Eq(p => p.TenantId, tenantId),
            Builders<Page>.Filter.Eq("contentRelationships.hubPageSlug", hubPageSlug)
        );
        
        var sort = Builders<Page>.Sort
            .Descending("contentRelationships.spokePriority")
            .Descending("MetaData.updatedAt");
        
        return await pageCollection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<object> GetContentHierarchyAsync(string tenantId)
    {
        var pageCollection = _database.GetCollection<Page>("Page");
        var filter = Builders<Page>.Filter.Eq(p => p.TenantId, tenantId);
        var allPages = await pageCollection.Find(filter).ToListAsync();

        // Build hierarchy (same logic as Cosmos)
        var hubs = allPages.Where(p => p.ContentRelationships.IsHub).ToList();
        var orphanPages = allPages.Where(p => !p.ContentRelationships.IsHub && 
                                               string.IsNullOrEmpty(p.ContentRelationships.HubPageSlug)).ToList();
        
        return new
        {
            tenantId,
            totalPages = allPages.Count,
            hubs = hubs.Select(hub => new
            {
                pageSlug = hub.PageSlug,
                title = hub.MetaData.Title,
                pageType = hub.MetaData.PageType,
                topicCluster = hub.ContentRelationships.TopicCluster,
                isPublished = hub.IsPublished,
                spokes = allPages
                    .Where(p => p.ContentRelationships.HubPageSlug == hub.PageSlug)
                    .OrderByDescending(p => p.ContentRelationships.SpokePriority)
                    .Select(spoke => new
                    {
                        pageSlug = spoke.PageSlug,
                        title = spoke.MetaData.Title,
                        spokePriority = spoke.ContentRelationships.SpokePriority,
                        isPublished = spoke.IsPublished
                    }).ToList()
            }).ToList(),
            orphanPages = orphanPages.Select(p => new
            {
                pageSlug = p.PageSlug,
                title = p.MetaData.Title,
                isPublished = p.IsPublished
            }).ToList()
        };
    }

    public async Task<List<PublishRun>> GetPublishRunsByTenantAsync(string tenantId)
    {
        var publishRunCollection = _database.GetCollection<PublishRun>("PublishRun");
        var filter = Builders<PublishRun>.Filter.Eq(run => run.TenantId, tenantId);

        return await publishRunCollection
            .Find(filter)
            .SortByDescending(run => run.ImportedAt)
            .ToListAsync();
    }

    public async Task<PublishRun?> GetPublishRunAsync(string tenantId, string id)
    {
        var publishRunCollection = _database.GetCollection<PublishRun>("PublishRun");
        var filter = Builders<PublishRun>.Filter.And(
            Builders<PublishRun>.Filter.Eq(run => run.TenantId, tenantId),
            Builders<PublishRun>.Filter.Eq(run => run.Id, id)
        );

        return await publishRunCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<PublishRun> SavePublishRunAsync(string tenantId, PublishRun publishRun)
    {
        var publishRunCollection = _database.GetCollection<PublishRun>("PublishRun");
        publishRun.TenantId = tenantId;

        var filter = Builders<PublishRun>.Filter.And(
            Builders<PublishRun>.Filter.Eq(run => run.TenantId, tenantId),
            Builders<PublishRun>.Filter.Eq(run => run.Id, publishRun.Id)
        );

        await publishRunCollection.ReplaceOneAsync(filter, publishRun, new ReplaceOptions { IsUpsert = true });
        return publishRun;
    }

    public async Task<List<ImportRun>> GetImportRunsByTenantAsync(string tenantId)
    {
        var importRunCollection = _database.GetCollection<ImportRun>("ImportRun");
        var filter = Builders<ImportRun>.Filter.Eq(run => run.TenantId, tenantId);

        return await importRunCollection
            .Find(filter)
            .SortByDescending(run => run.CompletedAt)
            .ToListAsync();
    }

    public async Task<ImportRun?> GetImportRunAsync(string tenantId, string id)
    {
        var importRunCollection = _database.GetCollection<ImportRun>("ImportRun");
        var filter = Builders<ImportRun>.Filter.And(
            Builders<ImportRun>.Filter.Eq(run => run.TenantId, tenantId),
            Builders<ImportRun>.Filter.Eq(run => run.Id, id)
        );

        return await importRunCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<ImportRun> SaveImportRunAsync(string tenantId, ImportRun importRun)
    {
        var importRunCollection = _database.GetCollection<ImportRun>("ImportRun");
        importRun.TenantId = tenantId;

        var filter = Builders<ImportRun>.Filter.And(
            Builders<ImportRun>.Filter.Eq(run => run.TenantId, tenantId),
            Builders<ImportRun>.Filter.Eq(run => run.Id, importRun.Id)
        );

        await importRunCollection.ReplaceOneAsync(filter, importRun, new ReplaceOptions { IsUpsert = true });
        return importRun;
    }

    public async Task<List<MediaAsset>> GetMediaAssetsByTenantAsync(string tenantId)
    {
        var mediaAssetCollection = _database.GetCollection<MediaAsset>("MediaAsset");
        var filter = Builders<MediaAsset>.Filter.Eq(asset => asset.TenantId, tenantId);

        return await mediaAssetCollection
            .Find(filter)
            .SortByDescending(asset => asset.UpdatedAt)
            .ToListAsync();
    }

    public async Task<MediaAsset?> GetMediaAssetAsync(string tenantId, string id)
    {
        var mediaAssetCollection = _database.GetCollection<MediaAsset>("MediaAsset");
        var filter = Builders<MediaAsset>.Filter.And(
            Builders<MediaAsset>.Filter.Eq(asset => asset.TenantId, tenantId),
            Builders<MediaAsset>.Filter.Or(
                Builders<MediaAsset>.Filter.Eq(asset => asset.Id, id),
                Builders<MediaAsset>.Filter.Eq(asset => asset.AssetId, id)
            )
        );

        return await mediaAssetCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<MediaAsset> SaveMediaAssetAsync(string tenantId, MediaAsset mediaAsset)
    {
        var mediaAssetCollection = _database.GetCollection<MediaAsset>("MediaAsset");
        mediaAsset.TenantId = tenantId;

        var filter = Builders<MediaAsset>.Filter.And(
            Builders<MediaAsset>.Filter.Eq(asset => asset.TenantId, tenantId),
            Builders<MediaAsset>.Filter.Eq(asset => asset.Id, mediaAsset.Id)
        );

        await mediaAssetCollection.ReplaceOneAsync(filter, mediaAsset, new ReplaceOptions { IsUpsert = true });
        return mediaAsset;
    }

    public async Task<MediaAsset> UpdateMediaAssetAsync(string tenantId, string id, MediaAsset mediaAsset)
    {
        var mediaAssetCollection = _database.GetCollection<MediaAsset>("MediaAsset");
        mediaAsset.TenantId = tenantId;
        mediaAsset.Id = id;

        var filter = Builders<MediaAsset>.Filter.And(
            Builders<MediaAsset>.Filter.Eq(asset => asset.TenantId, tenantId),
            Builders<MediaAsset>.Filter.Eq(asset => asset.Id, id)
        );

        var result = await mediaAssetCollection.ReplaceOneAsync(filter, mediaAsset);
        if (result.MatchedCount == 0)
            throw new KeyNotFoundException($"Media asset '{id}' not found");

        return mediaAsset;
    }

    public async Task<bool> DeleteMediaAssetAsync(string tenantId, string id)
    {
        var mediaAssetCollection = _database.GetCollection<MediaAsset>("MediaAsset");
        var existingMediaAsset = await GetMediaAssetAsync(tenantId, id);
        if (existingMediaAsset == null)
            return false;

        var filter = Builders<MediaAsset>.Filter.And(
            Builders<MediaAsset>.Filter.Eq(asset => asset.TenantId, tenantId),
            Builders<MediaAsset>.Filter.Eq(asset => asset.Id, existingMediaAsset.Id)
        );

        var result = await mediaAssetCollection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            // MongoDB client doesn't require explicit disposal
            _publicIndexGate.Dispose();
            _disposed = true;
        }
    }

    // ===== THEME METHODS =====

    // Content serving: Get theme by ID (API key required)
    public async Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId)
    {
        var isValid = await ValidateTenantApiKeyAsync(apiKey, tenantId);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid API key");

        return await GetThemeAdminAsync(tenantId, themeId);
    }

    // Content serving: Get active theme (API key required)
    public async Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId)
    {
        var isValid = await ValidateTenantApiKeyAsync(apiKey, tenantId);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid API key");

        return await GetActiveThemeAdminAsync(tenantId);
    }

    // Admin: Get theme by ID (JWT auth, no API key)
    public async Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");
        var filter = Builders<Theme>.Filter.And(
            Builders<Theme>.Filter.Eq(t => t.TenantId, tenantId),
            Builders<Theme>.Filter.Eq(t => t.ThemeId, themeId)
        );
        return await themeCollection.Find(filter).FirstOrDefaultAsync();
    }

    // Admin: Get active theme (JWT auth, no API key)
    public async Task<Theme?> GetActiveThemeAdminAsync(string tenantId)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");
        var filter = Builders<Theme>.Filter.And(
            Builders<Theme>.Filter.Eq(t => t.TenantId, tenantId),
            Builders<Theme>.Filter.Eq(t => t.IsActive, true)
        );
        return await themeCollection.Find(filter).FirstOrDefaultAsync();
    }

    // Admin: Get all themes for a tenant
    public async Task<List<Theme>> GetThemesByTenantAsync(string tenantId)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");
        var filter = Builders<Theme>.Filter.Eq(t => t.TenantId, tenantId);
        var sort = Builders<Theme>.Sort.Descending(t => t.UpdatedAt);
        return await themeCollection.Find(filter).Sort(sort).ToListAsync();
    }

    // Admin: Create a new theme
    public async Task<Theme> CreateThemeAsync(string tenantId, Theme theme)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");

        var existing = await GetThemeAdminAsync(tenantId, theme.ThemeId);
        if (existing != null)
            throw new InvalidOperationException($"Theme with ID '{theme.ThemeId}' already exists for tenant '{tenantId}'");

        theme.TenantId = tenantId;
        theme.Id = theme.ThemeId;
        theme.CreatedAt = DateTime.UtcNow;
        theme.UpdatedAt = DateTime.UtcNow;

        await themeCollection.InsertOneAsync(theme);
        _logger.LogInformation("CreateThemeAsync - Theme created - ThemeId: {ThemeId}, TenantId: {TenantId}", theme.ThemeId, tenantId);

        return theme;
    }

    // Admin: Update an existing theme
    public async Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");

        var filter = Builders<Theme>.Filter.And(
            Builders<Theme>.Filter.Eq(t => t.TenantId, tenantId),
            Builders<Theme>.Filter.Eq(t => t.ThemeId, themeId)
        );
        var existing = await themeCollection.Find(filter).FirstOrDefaultAsync();

        if (existing == null)
            throw new KeyNotFoundException($"Theme with ID '{themeId}' not found for tenant '{tenantId}'");

        theme.ThemeId = themeId;
        theme.TenantId = tenantId;
        theme.Id = themeId;
        theme.CreatedAt = existing.CreatedAt;
        theme.UpdatedAt = DateTime.UtcNow;

        await themeCollection.ReplaceOneAsync(filter, theme);
        _logger.LogInformation("UpdateThemeAsync - Theme updated - ThemeId: {ThemeId}, TenantId: {TenantId}", themeId, tenantId);

        return theme;
    }

    // Admin: Delete a theme
    public async Task<bool> DeleteThemeAsync(string tenantId, string themeId)
    {
        var themeCollection = _database.GetCollection<Theme>("Theme");
        var filter = Builders<Theme>.Filter.And(
            Builders<Theme>.Filter.Eq(t => t.TenantId, tenantId),
            Builders<Theme>.Filter.Eq(t => t.ThemeId, themeId)
        );

        var result = await themeCollection.DeleteOneAsync(filter);

        if (result.DeletedCount > 0)
        {
            _logger.LogInformation("DeleteThemeAsync - Theme deleted - ThemeId: {ThemeId}, TenantId: {TenantId}", themeId, tenantId);
            return true;
        }

        return false;
    }

    public async Task<List<User>> GetUsersAsync(string? tenantId = null)
    {
        var collection = _database.GetCollection<User>("User");
        var filter = string.IsNullOrWhiteSpace(tenantId)
            ? Builders<User>.Filter.Empty
            : Builders<User>.Filter.Eq(u => u.TenantId, tenantId.Trim().ToLowerInvariant());

        var users = await collection.Find(filter).ToListAsync();
        return users
            .OrderBy(user => user.TenantId, StringComparer.OrdinalIgnoreCase)
            .ThenBy(user => user.Email, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public Task<User?> GetUserByIdAsync(string tenantId, string userId) =>
        GetUserByIdAsync(tenantId, userId, CancellationToken.None);

    public async Task<User?> GetUserByIdAsync(string tenantId, string userId, CancellationToken cancellationToken)
    {
        var collection = _database.GetCollection<User>("User");
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, userId),
            Builders<User>.Filter.Eq(u => u.TenantId, tenantId.Trim().ToLowerInvariant()));

        return await collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public Task<User?> GetUserByEmailAsync(string email) =>
        GetUserByEmailAsync(email, CancellationToken.None);

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var collection = _database.GetCollection<User>("User");
        var filter = Builders<User>.Filter.Eq(u => u.Email, email);
        var user = await collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        
        _logger.LogInformation("GetUserByEmail - Email: {Email}, Found: {Found}", 
            email, user != null);

        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        var collection = _database.GetCollection<User>("User");
        user.TenantId = user.TenantId.Trim().ToLowerInvariant();
        user.Email = user.Email.Trim().ToLowerInvariant();

        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, user.Id),
            Builders<User>.Filter.Eq(u => u.TenantId, user.TenantId));

        await collection.ReplaceOneAsync(filter, user);

        _logger.LogInformation("User updated - UserId: {UserId}, TenantId: {TenantId}, Role: {Role}",
            user.Id, user.TenantId, user.Role);

        return user;
    }

    public async Task<User> CreateUserAsync(User user)
    {
        var collection = _database.GetCollection<User>("User");
        var existing = await GetUserByEmailAsync(user.Email);
        if (existing != null)
        {
            throw new InvalidOperationException($"User with email '{user.Email}' already exists");
        }

        user.Id = string.IsNullOrWhiteSpace(user.Id) ? Guid.NewGuid().ToString() : user.Id;
        user.TenantId = user.TenantId.Trim().ToLowerInvariant();
        user.Email = user.Email.Trim().ToLowerInvariant();
        user.CreatedDate = DateTime.UtcNow;

        await collection.InsertOneAsync(user);

        _logger.LogInformation("User created - UserId: {UserId}, TenantId: {TenantId}, Role: {Role}",
            user.Id, user.TenantId, user.Role);

        return user;
    }

    public Task PatchUserLoginEmailAsync(string userId, string tenantId, string loginEmail, CancellationToken cancellationToken) =>
        PatchUserIdentityFieldAsync(userId, tenantId,
            Builders<User>.Update.Set(user => user.Email, loginEmail.Trim().ToLowerInvariant()), cancellationToken);

    public Task PatchUserPasswordHashAsync(string userId, string tenantId, string passwordHash, CancellationToken cancellationToken) =>
        PatchUserIdentityFieldAsync(userId, tenantId,
            Builders<User>.Update.Set(user => user.PasswordHash, passwordHash), cancellationToken);

    public Task PatchUserActiveStateAsync(string userId, string tenantId, bool isActive, CancellationToken cancellationToken) =>
        PatchUserIdentityFieldAsync(userId, tenantId,
            Builders<User>.Update.Set(user => user.IsActive, isActive), cancellationToken);

    public Task PatchUserProfileNamesAsync(string userId, string tenantId, string? firstName, string? lastName, CancellationToken cancellationToken) =>
        PatchUserIdentityFieldAsync(userId, tenantId,
            Builders<User>.Update
                .Set(user => user.FirstName, firstName)
                .Set(user => user.LastName, lastName), cancellationToken);

    private async Task PatchUserIdentityFieldAsync(
        string userId,
        string tenantId,
        UpdateDefinition<User> update,
        CancellationToken cancellationToken)
    {
        var collection = _database.GetCollection<User>("User");
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(user => user.Id, userId),
            Builders<User>.Filter.Eq(user => user.TenantId, tenantId.Trim().ToLowerInvariant()));
        var result = await collection.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
        if (result.MatchedCount != 1) throw new KeyNotFoundException("Legacy identity user was not found.");
    }

    public async Task UpdateUserLastLoginAsync(string userId, string tenantId)
    {
        var collection = _database.GetCollection<User>("User");
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, userId),
            Builders<User>.Filter.Eq(u => u.TenantId, tenantId));

        var update = Builders<User>.Update.Set(u => u.LastLogin, DateTime.UtcNow);
        await collection.UpdateOneAsync(filter, update);

        _logger.LogInformation("UpdateUserLastLogin - UserId: {UserId}, TenantId: {TenantId}",
            userId, tenantId);
    }

    public async Task<List<TenantRedirect>> GetTenantRedirectsAsync(string tenantId, bool includeInactive = false)
    {
        var collection = _database.GetCollection<TenantRedirect>("TenantRedirect");
        var normalizedTenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId);
        var filter = Builders<TenantRedirect>.Filter.Eq(item => item.TenantId, normalizedTenantId);
        if (!includeInactive)
        {
            filter &= Builders<TenantRedirect>.Filter.Eq(item => item.Active, true);
        }

        return await collection.Find(filter).SortByDescending(item => item.UpdatedAt).ToListAsync();
    }

    public async Task<TenantRedirect?> GetTenantRedirectAsync(string tenantId, string id)
    {
        var collection = _database.GetCollection<TenantRedirect>("TenantRedirect");
        var filter = Builders<TenantRedirect>.Filter.And(
            Builders<TenantRedirect>.Filter.Eq(item => item.TenantId, TenantRedirectNormalizer.NormalizeTenantId(tenantId)),
            Builders<TenantRedirect>.Filter.Eq(item => item.Id, id));
        return await collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<TenantRedirect> CreateTenantRedirectAsync(string tenantId, TenantRedirect redirect)
    {
        var collection = _database.GetCollection<TenantRedirect>("TenantRedirect");
        await EnsureTenantRedirectIndexAsync(collection);
        PrepareTenantRedirectForSave(tenantId, redirect, isCreate: true);
        await ThrowIfDuplicateTenantRedirectSourceAsync(collection, redirect, existingId: null);
        try
        {
            await collection.InsertOneAsync(redirect);
            return redirect;
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            throw new InvalidOperationException($"Tenant redirect source '{redirect.SourcePath}' already exists for tenant '{redirect.TenantId}'.", ex);
        }
    }

    public async Task<TenantRedirect> UpdateTenantRedirectAsync(string tenantId, string id, TenantRedirect redirect)
    {
        var existing = await GetTenantRedirectAsync(tenantId, id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Tenant redirect '{id}' was not found for tenant '{tenantId}'.");
        }

        var collection = _database.GetCollection<TenantRedirect>("TenantRedirect");
        PrepareTenantRedirectForSave(tenantId, redirect, isCreate: false);
        if (!string.Equals(existing.SourcePath, redirect.SourcePath, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("A redirect source path is immutable.");
        }
        redirect.Id = id;
        redirect.CreatedAt = existing.CreatedAt;
        redirect.CreatedBy = existing.CreatedBy;
        await ThrowIfDuplicateTenantRedirectSourceAsync(collection, redirect, existingId: id);
        var filter = Builders<TenantRedirect>.Filter.And(
            Builders<TenantRedirect>.Filter.Eq(item => item.TenantId, redirect.TenantId),
            Builders<TenantRedirect>.Filter.Eq(item => item.Id, id));
        var result = await collection.ReplaceOneAsync(filter, redirect);
        if (result.MatchedCount == 0)
        {
            throw new KeyNotFoundException($"Tenant redirect '{id}' was not found for tenant '{tenantId}'.");
        }

        return redirect;
    }

    public async Task<TenantRedirect?> ResolveTenantRedirectAsync(string apiKey, string tenantId, string sourcePath)
    {
        var normalizedTenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId);
        if (!await ValidateTenantApiKeyAsync(apiKey, normalizedTenantId) ||
            !TenantRedirectNormalizer.TryNormalizeSourcePath(sourcePath, out var normalizedSource, out _))
        {
            return null;
        }

        var collection = _database.GetCollection<TenantRedirect>("TenantRedirect");
        var filter = Builders<TenantRedirect>.Filter.And(
            Builders<TenantRedirect>.Filter.Eq(item => item.TenantId, normalizedTenantId),
            Builders<TenantRedirect>.Filter.Eq(item => item.SourcePath, normalizedSource),
            Builders<TenantRedirect>.Filter.Eq(item => item.Active, true),
            Builders<TenantRedirect>.Filter.Eq(item => item.TargetStatus, "resolved"));
        return await collection.Find(filter).FirstOrDefaultAsync();
    }

    private static async Task EnsureTenantRedirectIndexAsync(IMongoCollection<TenantRedirect> collection)
    {
        var keys = Builders<TenantRedirect>.IndexKeys
            .Ascending(item => item.TenantId)
            .Ascending(item => item.SourcePath)
            .Ascending(item => item.Active);
        await collection.Indexes.CreateOneAsync(new CreateIndexModel<TenantRedirect>(
            keys,
            new CreateIndexOptions { Unique = true, Name = "tenant_source_active_unique" }));
    }

    private static void PrepareTenantRedirectForSave(string tenantId, TenantRedirect redirect, bool isCreate)
    {
        redirect.TenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId);
        if (!TenantRedirectNormalizer.TryNormalizeSourcePath(redirect.SourcePath, out var sourcePath, out var sourceError))
        {
            throw new InvalidOperationException(sourceError);
        }

        if (!TenantRedirectNormalizer.TryNormalizeTarget(
                redirect.Target,
                redirect.TargetKind,
                out var target,
                out _,
                out var targetKind,
                out var targetError))
        {
            throw new InvalidOperationException(targetError);
        }

        redirect.SourcePath = sourcePath;
        redirect.Target = target;
        redirect.TargetKind = targetKind;
        redirect.RoutePrecedence = "redirect_before_page";
        redirect.UpdatedAt = DateTime.UtcNow;
        if (isCreate)
        {
            redirect.CreatedAt = redirect.CreatedAt == default ? redirect.UpdatedAt : redirect.CreatedAt;
            redirect.Id = string.IsNullOrWhiteSpace(redirect.Id)
                ? TenantRedirectMutation.BuildId(redirect.TenantId, redirect.SourcePath)
                : redirect.Id;
        }
    }

    private static async Task ThrowIfDuplicateTenantRedirectSourceAsync(
        IMongoCollection<TenantRedirect> collection,
        TenantRedirect redirect,
        string? existingId)
    {
        if (!redirect.Active) return;
        var filter = Builders<TenantRedirect>.Filter.And(
            Builders<TenantRedirect>.Filter.Eq(item => item.TenantId, redirect.TenantId),
            Builders<TenantRedirect>.Filter.Eq(item => item.SourcePath, redirect.SourcePath),
            Builders<TenantRedirect>.Filter.Eq(item => item.Active, true));
        var duplicate = await collection.Find(filter).FirstOrDefaultAsync();
        if (duplicate != null && !string.Equals(duplicate.Id, existingId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"Active tenant redirect source '{redirect.SourcePath}' already exists for tenant '{redirect.TenantId}'.");
        }
    }

    public Task EnsureDomainBindingContainerAsync()
    {
        return Task.CompletedTask;
    }

    public async Task<List<DomainBinding>> GetDomainBindingsAsync(string? tenantId = null)
    {
        var collection = _database.GetCollection<DomainBinding>("DomainBinding");
        var filter = string.IsNullOrWhiteSpace(tenantId)
            ? Builders<DomainBinding>.Filter.Empty
            : Builders<DomainBinding>.Filter.Eq(binding => binding.TenantId, NormalizeDomainBindingKey(tenantId));
        var sort = Builders<DomainBinding>.Sort.Descending(binding => binding.UpdatedAt);
        return await collection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<DomainBinding?> GetDomainBindingAsync(string tenantId, string id)
    {
        var collection = _database.GetCollection<DomainBinding>("DomainBinding");
        var filter = Builders<DomainBinding>.Filter.And(
            Builders<DomainBinding>.Filter.Eq(binding => binding.TenantId, NormalizeDomainBindingKey(tenantId)),
            Builders<DomainBinding>.Filter.Eq(binding => binding.Id, id));
        return await collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<DomainBinding> CreateDomainBindingAsync(string tenantId, DomainBinding domainBinding)
    {
        var collection = _database.GetCollection<DomainBinding>("DomainBinding");
        PrepareDomainBindingForSave(tenantId, domainBinding, isCreate: true);
        await ThrowIfDuplicateDomainBindingAsync(collection, domainBinding, existingId: null);
        await collection.InsertOneAsync(domainBinding);
        return domainBinding;
    }

    public async Task<DomainBinding> UpdateDomainBindingAsync(string tenantId, string id, DomainBinding domainBinding)
    {
        var collection = _database.GetCollection<DomainBinding>("DomainBinding");
        var existing = await GetDomainBindingAsync(tenantId, id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"DomainBinding '{id}' was not found for tenant '{tenantId}'.");
        }

        PrepareDomainBindingForSave(tenantId, domainBinding, isCreate: false);
        domainBinding.Id = id;
        domainBinding.CreatedAt = existing.CreatedAt;
        domainBinding.CreatedBy = string.IsNullOrWhiteSpace(domainBinding.CreatedBy) ? existing.CreatedBy : domainBinding.CreatedBy;
        if (domainBinding.AuditEvents.Count == 0 && existing.AuditEvents.Count > 0)
        {
            domainBinding.AuditEvents = existing.AuditEvents;
        }

        await ThrowIfDuplicateDomainBindingAsync(collection, domainBinding, existingId: id);
        var filter = Builders<DomainBinding>.Filter.And(
            Builders<DomainBinding>.Filter.Eq(binding => binding.TenantId, domainBinding.TenantId),
            Builders<DomainBinding>.Filter.Eq(binding => binding.Id, id));
        await collection.ReplaceOneAsync(filter, domainBinding);
        return domainBinding;
    }

    private static void PrepareDomainBindingForSave(string tenantId, DomainBinding binding, bool isCreate)
    {
        var normalizedTenantId = NormalizeDomainBindingKey(tenantId);
        binding.TenantId = normalizedTenantId;
        binding.Domain = NormalizeDomainName(binding.Domain);
        binding.WwwDomain = NormalizeDomainName(binding.WwwDomain);
        binding.Provider = NormalizeDomainBindingKey(binding.Provider);
        binding.Status = NormalizeDomainBindingKey(binding.Status);
        binding.DnsValidationStatus = NormalizeDomainBindingKey(binding.DnsValidationStatus);
        binding.AzureHostnameStatus = NormalizeDomainBindingKey(binding.AzureHostnameStatus);
        binding.TlsStatus = NormalizeDomainBindingKey(binding.TlsStatus);
        binding.RuntimeStatus = NormalizeDomainBindingKey(binding.RuntimeStatus);
        binding.PromotionStatus = NormalizeDomainBindingKey(binding.PromotionStatus);
        binding.UpdatedAt = DateTime.UtcNow;
        if (isCreate)
        {
            binding.CreatedAt = DateTime.UtcNow;
        }

        if (string.IsNullOrWhiteSpace(binding.Id))
        {
            binding.Id = $"domainbinding-{normalizedTenantId}-{binding.Domain.Replace(".", "-", StringComparison.Ordinal)}";
        }
    }

    private static async Task ThrowIfDuplicateDomainBindingAsync(
        IMongoCollection<DomainBinding> collection,
        DomainBinding binding,
        string? existingId)
    {
        var filter = Builders<DomainBinding>.Filter.Or(
            Builders<DomainBinding>.Filter.Eq(item => item.Domain, binding.Domain),
            Builders<DomainBinding>.Filter.Eq(item => item.WwwDomain, binding.Domain),
            Builders<DomainBinding>.Filter.Eq(item => item.Domain, binding.WwwDomain),
            Builders<DomainBinding>.Filter.Eq(item => item.WwwDomain, binding.WwwDomain));
        var matches = await collection.Find(filter).ToListAsync();
        var duplicate = matches.FirstOrDefault(item =>
            !string.Equals(item.Id, existingId, StringComparison.OrdinalIgnoreCase));
        if (duplicate != null)
        {
            throw new InvalidOperationException($"DomainBinding for domain '{binding.Domain}' already exists.");
        }
    }

    private static string NormalizeDomainBindingKey(string value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLowerInvariant();
    }

    private async Task EnsurePublicIndexesAsync(CancellationToken cancellationToken)
    {
        if (_publicIndexesReady) return;
        await _publicIndexGate.WaitAsync(cancellationToken);
        try
        {
            if (_publicIndexesReady) return;
            var entries = _database.GetCollection<FormEntry>("FormEntry");
            var publicEntryFilter = Builders<FormEntry>.Filter.Gt(item => item.PublicationId, string.Empty);
            var submissionKeys = Builders<FormEntry>.IndexKeys
                .Ascending(item => item.TenantUid)
                .Ascending(item => item.SubmissionId);
            var identityKeys = Builders<FormEntry>.IndexKeys
                .Ascending(item => item.TenantUid)
                .Ascending(item => item.PublicIdempotencyIdentity);
            await entries.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<FormEntry>(submissionKeys, new CreateIndexOptions<FormEntry>
                {
                    Name = "ux_public_form_submission",
                    Unique = true,
                    PartialFilterExpression = publicEntryFilter
                }),
                new CreateIndexModel<FormEntry>(identityKeys, new CreateIndexOptions<FormEntry>
                {
                    Name = "ux_public_form_idempotency",
                    Unique = true,
                    PartialFilterExpression = publicEntryFilter
                })
            }, cancellationToken);

            var publications = _database.GetCollection<PublicPublication>("PublicPublication");
            var publicationKeys = Builders<PublicPublication>.IndexKeys
                .Ascending(item => item.TenantId)
                .Ascending(item => item.Status)
                .Ascending(item => item.ActiveUntilUtc);
            await publications.Indexes.CreateOneAsync(
                new CreateIndexModel<PublicPublication>(publicationKeys, new CreateIndexOptions
                {
                    Name = "ix_public_publication_tenant_status_expiry"
                }),
                cancellationToken: cancellationToken);
            _publicIndexesReady = true;
        }
        finally
        {
            _publicIndexGate.Release();
        }
    }

    private static string NormalizeDomainName(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var trimmed = value.Trim().ToLowerInvariant();
        trimmed = trimmed.Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim('/');
        return trimmed;
    }
#else
    private readonly ILogger<MongoDataConnection> _logger;

    public MongoDataConnection(IOptions<MongoDbSettings> settings, ILogger<MongoDataConnection> logger)
    {
        _logger = logger;
        _logger.LogWarning("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page?> GetPageAsync(string apiKey, string tenantId, string pageSlug)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page> SavePageAsync(string apiKey, string tenantId, Page page)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page> UpdatePageAsync(string apiKey, string tenantId, string pageSlug, Page page)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeletePageAsync(string apiKey, string tenantId, string pageSlug)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormEntry> SaveFormEntryAsync(string apiKey, string tenantId, FormEntry formEntry)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<FormEntry>> GetFormEntriesByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormEntry?> GetFormEntryAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormEntry> UpdateFormEntryStatusAsync(string tenantId, string id, FormEntryStatusUpdate statusUpdate)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormDefinition?> GetFormDefinitionAsync(string apiKey, string tenantId, string type)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<FormDefinition>> GetFormDefinitionsByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormDefinition?> GetFormDefinitionAdminAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormDefinition> CreateFormDefinitionAsync(string tenantId, FormDefinition definition)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<FormDefinition> UpdateFormDefinitionAsync(string tenantId, string id, FormDefinition definition)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeleteFormDefinitionAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<SitemapEntry>> GetSitemapPagesAsync(string apiKey, string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Tenant?> GetTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Tenant> CreateTenantAsync(Tenant tenant)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Tenant> UpdateTenantAsync(string tenantId, Tenant tenant)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Tenant> ProvisionTenantApiKeyHashAsync(string tenantId, string apiKeyHash)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeleteTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Tenant>> GetAllTenantsAsync()
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Page>> GetAllPagesAsync(string? tenantId = null)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page?> GetPageBySlugAsync(string tenantId, string pageSlug)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Page>> GetPagesByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Tenant>> GetTenantsForUserAsync(string userTenantId, bool isSuperAdmin)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page> SavePageAdminAsync(string tenantId, Page page)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Page> UpdatePageAdminAsync(string tenantId, string pageSlug, Page page, PageChangeContext? changeContext = null)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<PublishRun>> GetPublishRunsByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<PublishRun?> GetPublishRunAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<PublishRun> SavePublishRunAsync(string tenantId, PublishRun publishRun)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<ImportRun>> GetImportRunsByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<ImportRun?> GetImportRunAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<ImportRun> SaveImportRunAsync(string tenantId, ImportRun importRun)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<MediaAsset>> GetMediaAssetsByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<MediaAsset?> GetMediaAssetAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<MediaAsset> SaveMediaAssetAsync(string tenantId, MediaAsset mediaAsset)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<MediaAsset> UpdateMediaAssetAsync(string tenantId, string id, MediaAsset mediaAsset)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeleteMediaAssetAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Page>> GetHubPagesAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Page>> GetSpokePagesAsync(string tenantId, string hubPageSlug)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<object> GetContentHierarchyAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<User>> GetUsersAsync(string? tenantId = null)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User?> GetUserByIdAsync(string tenantId, string userId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User?> GetUserByIdAsync(string tenantId, string userId, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User?> GetUserByEmailAsync(string email)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User> UpdateUserAsync(User user)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task PatchUserLoginEmailAsync(string userId, string tenantId, string loginEmail, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task PatchUserPasswordHashAsync(string userId, string tenantId, string passwordHash, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task PatchUserActiveStateAsync(string userId, string tenantId, bool isActive, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task PatchUserProfileNamesAsync(string userId, string tenantId, string? firstName, string? lastName, CancellationToken cancellationToken)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<User> CreateUserAsync(User user)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task UpdateUserLastLoginAsync(string userId, string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme?> GetThemeAsync(string apiKey, string tenantId, string themeId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme?> GetActiveThemeAsync(string apiKey, string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme?> GetThemeAdminAsync(string tenantId, string themeId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme?> GetActiveThemeAdminAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<Theme>> GetThemesByTenantAsync(string tenantId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme> CreateThemeAsync(string tenantId, Theme theme)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<Theme> UpdateThemeAsync(string tenantId, string themeId, Theme theme)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<bool> DeleteThemeAsync(string tenantId, string themeId)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task EnsureDomainBindingContainerAsync()
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<DomainBinding>> GetDomainBindingsAsync(string? tenantId = null)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<DomainBinding?> GetDomainBindingAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<DomainBinding> CreateDomainBindingAsync(string tenantId, DomainBinding domainBinding)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<DomainBinding> UpdateDomainBindingAsync(string tenantId, string id, DomainBinding domainBinding)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<List<TenantRedirect>> GetTenantRedirectsAsync(string tenantId, bool includeInactive = false)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<TenantRedirect?> GetTenantRedirectAsync(string tenantId, string id)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<TenantRedirect> CreateTenantRedirectAsync(string tenantId, TenantRedirect redirect)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<TenantRedirect> UpdateTenantRedirectAsync(string tenantId, string id, TenantRedirect redirect)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<TenantRedirect?> ResolveTenantRedirectAsync(string apiKey, string tenantId, string sourcePath)
    {
        throw new NotSupportedException("MongoDB support is not enabled. Install MongoDB.Driver package and define USE_MONGODB to enable MongoDB support.");
    }

    public Task<PublicFormEntryCreateResult> CreatePublicFormEntryAsync(FormEntry formEntry, CancellationToken cancellationToken) =>
        throw new NotSupportedException("MongoDB support is not enabled.");

    public Task<PublicPublication?> GetPublicPublicationAsync(string publicationId, CancellationToken cancellationToken) =>
        throw new NotSupportedException("MongoDB support is not enabled.");

    public Task<PublicPublication> CreatePublicPublicationAsync(PublicPublication publication, CancellationToken cancellationToken) =>
        throw new NotSupportedException("MongoDB support is not enabled.");

    public Task<PublicPublication> UpdatePublicPublicationAsync(PublicPublication publication, long expectedRevision, CancellationToken cancellationToken) =>
        throw new NotSupportedException("MongoDB support is not enabled.");

    public Task<List<PublicPublication>> ListPublicPublicationsAsync(string? tenantUid, CancellationToken cancellationToken) =>
        throw new NotSupportedException("MongoDB support is not enabled.");

    public void Dispose()
    {
        // Nothing to dispose
    }
#endif
}
