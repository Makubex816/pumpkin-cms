using pumpkin_api.Services;
using pumpkin_net_models.Models;

namespace pumpkin_api.Managers;

public static class PumpkinManager
{
    public static IResult GetWelcomeMessage()
    {
        return Results.Ok("🎃 Welcome to Pumpkin CMS v0.2 🎃");
    }

    public static async Task<IResult> GetPageAsync(IDatabaseService databaseService, string apiKey, string tenantId, string pageSlug, ILogger? logger = null)
    {
        try
        {
            logger?.LogInformation("GetPageAsync called - TenantId: {TenantId}, PageSlug: {PageSlug}", tenantId, pageSlug);

            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
            {
                logger?.LogWarning("GetPageAsync - Missing API key - TenantId: {TenantId}, PageSlug: {PageSlug}", tenantId, pageSlug);
                return Results.BadRequest("API key is required");
            }

            if (string.IsNullOrEmpty(tenantId))
            {
                logger?.LogWarning("GetPageAsync - Missing Tenant ID - PageSlug: {PageSlug}", pageSlug);
                return Results.BadRequest("Tenant ID is required");
            }

            if (string.IsNullOrEmpty(pageSlug))
            {
                logger?.LogWarning("GetPageAsync - Missing Page Slug - TenantId: {TenantId}", tenantId);
                return Results.BadRequest("Page slug is required");
            }

            logger?.LogInformation("Fetching page from database - TenantId: {TenantId}, PageSlug: {PageSlug}", tenantId, pageSlug);

            var page = await databaseService.GetPageAsync(apiKey, tenantId, pageSlug);

            if (page == null)
            {
                logger?.LogWarning("GetPageAsync - Page not found or access denied - TenantId: {TenantId}, PageSlug: {PageSlug}", tenantId, pageSlug);
                return Results.NotFound("Page not found or access denied");
            }

            logger?.LogInformation("GetPageAsync - Success - TenantId: {TenantId}, PageSlug: {PageSlug}, PageId: {PageId}, Title: {Title}",
                tenantId, pageSlug, page.PageId, page.MetaData.Title);

            return Results.Ok(page);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "GetPageAsync - Error retrieving page - TenantId: {TenantId}, PageSlug: {PageSlug}", tenantId, pageSlug);
            return Results.Problem($"Error retrieving page: {ex.Message}");
        }
    }

    public static async Task<IResult> SavePageAsync(IDatabaseService databaseService, string apiKey, string tenantId, Page page)
    {
        try
        {
            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            if (page == null)
                return Results.BadRequest("Page data is required");

            if (string.IsNullOrEmpty(page.PageId))
                return Results.BadRequest("Page ID is required");

            var designValidation = DesignSystemGuard.ValidatePage(page);
            if (!designValidation.Ok)
                return Results.BadRequest(designValidation);

            var savedPage = await databaseService.SavePageAsync(apiKey, tenantId, page);

            return Results.Created($"/api/pages/{tenantId}/{savedPage.PageId}", savedPage);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving page: {ex.Message}");
        }
    }

    public static async Task<IResult> UpdatePageAsync(IDatabaseService databaseService, string apiKey, string tenantId, string pageSlug, Page page)
    {
        try
        {
            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            if (string.IsNullOrEmpty(pageSlug))
                return Results.BadRequest("Page slug is required");

            if (page == null)
                return Results.BadRequest("Page data is required");

            var designValidation = DesignSystemGuard.ValidatePage(page);
            if (!designValidation.Ok)
                return Results.BadRequest(designValidation);

            var updatedPage = await databaseService.UpdatePageAsync(apiKey, tenantId, pageSlug, page);

            return Results.Ok(updatedPage);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating page: {ex.Message}");
        }
    }

    public static async Task<IResult> DeletePageAsync(IDatabaseService databaseService, string apiKey, string tenantId, string pageSlug)
    {
        try
        {
            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            if (string.IsNullOrEmpty(pageSlug))
                return Results.BadRequest("Page slug is required");

            var deleted = await databaseService.DeletePageAsync(apiKey, tenantId, pageSlug);

            return Results.NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting page: {ex.Message}");
        }
    }

    public static async Task<IResult> SaveFormEntryAsync(IDatabaseService databaseService, string apiKey, string tenantId, FormEntry formEntry, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            if (formEntry == null)
                return Results.BadRequest("Form entry data is required");

            var submissionValidation = FormSubmissionGuard.Sanitize(formEntry);
            if (!submissionValidation.Ok)
            {
                return Results.BadRequest(new
                {
                    errors = submissionValidation.Errors.Select(issue => issue.Message).ToList(),
                    warnings = submissionValidation.Warnings.Select(issue => issue.Message).ToList()
                });
            }

            if (string.IsNullOrEmpty(formEntry.FormId))
                return Results.BadRequest("Form ID is required");

            using var bound = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bound.CancelAfter(TimeSpan.FromSeconds(10));
            var savedFormEntry = await databaseService.SaveFormEntryAsync(apiKey, tenantId, formEntry, bound.Token);

            return Results.Created($"/api/forms/{tenantId}/entries/{savedFormEntry.Id}", new { success = true, formEntryId = savedFormEntry.Id, submissionId = savedFormEntry.SubmissionId, correlationId = savedFormEntry.CorrelationId, createdAt = savedFormEntry.SubmittedAt, idempotentReplay = savedFormEntry.Metadata?.IdempotentReplay == true });
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving form entry: {ex.Message}");
        }
    }

    public static async Task<IResult> SaveFormEntrySubmitAliasAsync(IDatabaseService databaseService, string apiKey, string tenantId, string type, FormEntry formEntry, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var normalizedType = NormalizeSubmitAliasFormKey(PageRedirectGuard.NormalizeSlug(type));
            if (string.IsNullOrWhiteSpace(normalizedType))
                return Results.BadRequest("Form type is required");

            if (formEntry == null)
                return Results.BadRequest("Form entry data is required");

            formEntry.TenantId = tenantId;
            formEntry.FormKey = NormalizeSubmitAliasFormKey(PageRedirectGuard.NormalizeSlug(FirstNonEmpty(formEntry.FormKey, normalizedType)));
            formEntry.FormId = FirstNonEmpty(formEntry.FormId, formEntry.FormKey);

            if (IsDefaultFormKey(formEntry.FormKey))
            {
                return await SaveFormEntryAsync(databaseService, apiKey, tenantId, formEntry, cancellationToken);
            }

            using var bound = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bound.CancelAfter(TimeSpan.FromSeconds(10));
            var formDefinition = await databaseService.GetFormDefinitionAsync(apiKey, tenantId, normalizedType, bound.Token);
            if (formDefinition == null)
                return Results.NotFound(new { success = false, errorCode = "form_definition_not_found", message = "The requested form definition is not active.", submissionId = formEntry.SubmissionId, correlationId = formEntry.CorrelationId, retryable = false, persistenceCompleted = false });

            formEntry.FormKey = formDefinition.FormKey;
            formEntry.FormId = FirstNonEmpty(formEntry.FormId, formDefinition.Id, formDefinition.FormKey);
            formEntry.SiteKey = FirstNonEmpty(formEntry.SiteKey, formDefinition.SiteKey, tenantId);

            var submissionValidation = FormSubmissionGuard.SanitizeDynamic(formEntry, formDefinition);
            if (!submissionValidation.Ok)
            {
                return Results.BadRequest(new
                {
                    errors = submissionValidation.Errors.Select(issue => issue.Message).ToList(),
                    warnings = submissionValidation.Warnings.Select(issue => issue.Message).ToList()
                });
            }

            if (string.IsNullOrEmpty(formEntry.FormId))
                return Results.BadRequest("Form ID is required");

            var savedFormEntry = await databaseService.SaveFormEntryAsync(apiKey, tenantId, formEntry, bound.Token);

            return Results.Created($"/api/forms/{tenantId}/entries/{savedFormEntry.Id}", new { success = true, formEntryId = savedFormEntry.Id, submissionId = savedFormEntry.SubmissionId, correlationId = savedFormEntry.CorrelationId, createdAt = savedFormEntry.SubmittedAt, idempotentReplay = savedFormEntry.Metadata?.IdempotentReplay == true });
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving form entry: {ex.Message}");
        }
    }

    public static async Task<IResult> GetSitemapPagesAsync(IDatabaseService databaseService, string apiKey, string tenantId)
    {
        try
        {
            // Validate required parameters
            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");

            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var sitemapEntries = await databaseService.GetSitemapPagesAsync(apiKey, tenantId);

            return Results.Ok(new { tenantId, pages = sitemapEntries, count = sitemapEntries.Count });
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving sitemap pages: {ex.Message}");
        }
    }

    public static async Task<(bool IsValid, Tenant? Tenant, bool IsAdmin)> ValidateTenantAsync(
        IDatabaseService databaseService,
        string tenantId,
        string apiKey)
    {
        try
        {
            // For now, we'll validate by trying to get a page (which validates the API key)
            // This is a temporary workaround until we add a dedicated ValidateTenantApiKeyAsync method

            // If we can access data with this tenant/key combo, it's valid
            // We'll need to add a proper ValidateTenantApiKeyAsync method to IDatabaseService later

            // For now, just return basic validation
            // TODO: Add proper tenant validation method to IDatabaseService
            return (false, null, false);
        }
        catch
        {
            return (false, null, false);
        }
    }

    // Check specific admin permissions using existing Features
    public static bool HasPermission(Tenant? tenant, string permission)
    {
        if (tenant == null || tenant.Plan != "SuperAdmin")
            return false;

        return permission switch
        {
            "CreateTenant" => tenant.Settings.Features.CanCreateTenants,
            "DeleteTenant" => tenant.Settings.Features.CanDeleteTenants,
            "ManageAllContent" => tenant.Settings.Features.CanManageAllContent,
            "ViewAllTenants" => tenant.Settings.Features.CanViewAllTenants,
            _ => false
        };
    }

    // Admin: Get specific tenant (JWT authentication at endpoint level)
    public static async Task<IResult> GetTenantAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var tenant = await databaseService.GetTenantAsync(tenantId);

            if (tenant == null)
                return Results.NotFound("Tenant not found");

            return Results.Ok(tenant);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving tenant: {ex.Message}");
        }
    }

    // Admin: Create new tenant (JWT authentication at endpoint level)
    public static async Task<IResult> CreateTenantAsync(IDatabaseService databaseService, Tenant tenant)
    {
        try
        {
            if (tenant == null)
                return Results.BadRequest("Tenant data is required");

            if (string.IsNullOrEmpty(tenant.TenantId))
                return Results.BadRequest("Tenant ID is required");

            var createdTenant = await databaseService.CreateTenantAsync(tenant);

            return Results.Created($"/api/admin/tenants/{createdTenant.TenantId}", createdTenant);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating tenant: {ex.Message}");
        }
    }

    // Admin: Get all tenants (JWT authentication at endpoint level)
    public static async Task<IResult> GetAllTenantsAsync(IDatabaseService databaseService)
    {
        try
        {
            var tenants = await databaseService.GetAllTenantsAsync();

            return Results.Ok(new { tenants, count = tenants.Count });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving tenants: {ex.Message}");
        }
    }

    // Admin: Get all pages (optionally filtered by tenant) (JWT authentication at endpoint level)
    public static async Task<IResult> GetAllPagesAsync(IDatabaseService databaseService, string? tenantId = null)
    {
        try
        {
            var pages = await databaseService.GetAllPagesAsync(tenantId);

            return Results.Ok(new { pages, count = pages.Count, tenantId = tenantId ?? "all" });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving pages: {ex.Message}");
        }
    }

    // Admin: Get hub pages for a tenant (JWT authentication at endpoint level)
    public static async Task<IResult> GetHubPagesAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var hubPages = await databaseService.GetHubPagesAsync(tenantId);

            return Results.Ok(new { tenantId, hubPages, count = hubPages.Count });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving hub pages: {ex.Message}");
        }
    }

    // Admin: Get spoke pages for a hub (JWT authentication at endpoint level)
    public static async Task<IResult> GetSpokePagesAsync(IDatabaseService databaseService, string tenantId, string hubPageSlug)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            if (string.IsNullOrEmpty(hubPageSlug))
                return Results.BadRequest("Hub page slug is required");

            var spokePages = await databaseService.GetSpokePagesAsync(tenantId, hubPageSlug);

            return Results.Ok(new { tenantId, hubPageSlug, spokePages, count = spokePages.Count });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving spoke pages: {ex.Message}");
        }
    }

    // Admin: Get complete content hierarchy visualization (JWT authentication at endpoint level)
    public static async Task<IResult> GetContentHierarchyAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var hierarchy = await databaseService.GetContentHierarchyAsync(tenantId);

            return Results.Ok(hierarchy);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving content hierarchy: {ex.Message}");
        }
    }

    // ===== FORM DEFINITION METHODS (Content Serving - API Key) =====

    public static async Task<IResult> GetFormDefinitionAsync(IDatabaseService databaseService, string apiKey, string tenantId, string type, ILogger? logger = null)
    {
        try
        {
            logger?.LogInformation("GetFormDefinitionAsync called - TenantId: {TenantId}, Type: {Type}", tenantId, type);

            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(type))
                return Results.BadRequest("Form type is required");

            var formDefinition = await databaseService.GetFormDefinitionAsync(apiKey, tenantId, PageRedirectGuard.NormalizeSlug(type));

            if (formDefinition == null)
            {
                logger?.LogWarning("GetFormDefinitionAsync - Form definition not found or access denied - TenantId: {TenantId}, Type: {Type}", tenantId, type);
                return Results.NotFound("Form definition not found or access denied");
            }

            return Results.Ok(formDefinition);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "GetFormDefinitionAsync - Error - TenantId: {TenantId}, Type: {Type}", tenantId, type);
            return Results.Problem($"Error retrieving form definition: {ex.Message}");
        }
    }

    // ===== FORM DEFINITION ADMIN METHODS (JWT Authentication) =====

    public static async Task<IResult> GetFormDefinitionsByTenantAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var formDefinitions = await databaseService.GetFormDefinitionsByTenantAsync(tenantId);

            return Results.Ok(new { formDefinitions, count = formDefinitions.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving form definitions: {ex.Message}");
        }
    }

    public static async Task<IResult> GetFormDefinitionAdminAsync(IDatabaseService databaseService, string tenantId, string id)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(id))
                return Results.BadRequest("Form definition ID is required");

            var formDefinition = await databaseService.GetFormDefinitionAdminAsync(tenantId, PageRedirectGuard.NormalizeSlug(id));

            return formDefinition == null ? Results.NotFound("Form definition not found") : Results.Ok(formDefinition);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving form definition: {ex.Message}");
        }
    }

    public static async Task<IResult> CreateFormDefinitionAsync(IDatabaseService databaseService, string tenantId, FormDefinition definition, string actor)
    {
        try
        {
            var validation = PrepareFormDefinition(tenantId, definition, actor, existing: null, isUpdate: false);
            if (!validation.Ok)
                return Results.BadRequest(validation);

            var created = await databaseService.CreateFormDefinitionAsync(tenantId, definition);

            return Results.Created($"/api/admin/forms/{tenantId}/definitions/{created.Id}", created);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating form definition: {ex.Message}");
        }
    }

    public static async Task<IResult> UpdateFormDefinitionAsync(IDatabaseService databaseService, string tenantId, string id, FormDefinition definition, string actor)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
                return Results.BadRequest("Form definition ID is required");

            var normalizedId = PageRedirectGuard.NormalizeSlug(id);
            var existing = await databaseService.GetFormDefinitionAdminAsync(tenantId, normalizedId);
            if (existing == null)
                return Results.NotFound("Form definition not found");

            var validation = PrepareFormDefinition(tenantId, definition, actor, existing, isUpdate: true);
            if (!validation.Ok)
                return Results.BadRequest(validation);

            if (!string.Equals(definition.Id, normalizedId, StringComparison.OrdinalIgnoreCase))
                return Results.BadRequest("Form definition ID cannot change");

            var updated = await databaseService.UpdateFormDefinitionAsync(tenantId, normalizedId, definition);

            return Results.Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating form definition: {ex.Message}");
        }
    }

    public static async Task<IResult> DeleteFormDefinitionAsync(IDatabaseService databaseService, string tenantId, string id)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(id))
                return Results.BadRequest("Form definition ID is required");

            var normalizedId = PageRedirectGuard.NormalizeSlug(id);
            var deleted = await databaseService.DeleteFormDefinitionAsync(tenantId, normalizedId);

            if (deleted)
                return Results.Ok(new { message = "Form definition deleted successfully", tenantId, id = normalizedId });

            return Results.NotFound("Form definition not found");
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting form definition: {ex.Message}");
        }
    }

    private static (bool Ok, string Message) PrepareFormDefinition(string tenantId, FormDefinition? definition, string actor, FormDefinition? existing, bool isUpdate)
    {
        if (string.IsNullOrWhiteSpace(tenantId))
            return (false, "Tenant ID is required");
        if (definition == null)
            return (false, "Form definition data is required");

        var normalizedId = PageRedirectGuard.NormalizeSlug(definition.Id);
        var normalizedFormKey = PageRedirectGuard.NormalizeSlug(definition.FormKey);
        var normalizedFormType = PageRedirectGuard.NormalizeSlug(definition.FormType);

        if (string.IsNullOrWhiteSpace(normalizedId) && !string.IsNullOrWhiteSpace(normalizedFormKey))
            normalizedId = normalizedFormKey;
        if (string.IsNullOrWhiteSpace(normalizedFormKey) && !string.IsNullOrWhiteSpace(normalizedId))
            normalizedFormKey = normalizedId;

        if (string.IsNullOrWhiteSpace(normalizedId))
            return (false, "Form definition ID or formKey is required");
        if (string.IsNullOrWhiteSpace(definition.Name))
            return (false, "Form definition name is required");

        var status = (definition.Status ?? string.Empty).Trim().ToLowerInvariant();
        var allowedStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "draft", "active", "published", "archived" };
        if (string.IsNullOrWhiteSpace(status))
            status = "active";
        if (!allowedStatuses.Contains(status))
            return (false, "Status must be one of: draft, active, published, archived");

        if (ContainsSecretLikeValue(definition.StaticEndpointRef) ||
            ContainsSecretLikeValue(definition.LeadRecipientRef) ||
            ContainsSecretLikeValue(definition.NotificationEmailRef))
        {
            return (false, "Form definition references must not contain secret values");
        }

        var fields = definition.Fields ?? new List<FormDefinitionField>();
        foreach (var field in fields.Concat(definition.HiddenFields ?? new List<FormDefinitionField>()))
        {
            var fieldName = PageRedirectGuard.NormalizeSlug(string.IsNullOrWhiteSpace(field.Name) ? field.Id : field.Name);
            if (string.IsNullOrWhiteSpace(fieldName))
                return (false, "Each form field must include an id or name");

            field.Id = string.IsNullOrWhiteSpace(field.Id) ? fieldName : PageRedirectGuard.NormalizeSlug(field.Id);
            field.Name = fieldName;
            field.Label = (field.Label ?? string.Empty).Trim();
            field.Type = string.IsNullOrWhiteSpace(field.Type) ? "text" : PageRedirectGuard.NormalizeSlug(field.Type);
            field.Width = string.IsNullOrWhiteSpace(field.Width) ? "half" : PageRedirectGuard.NormalizeSlug(field.Width);
        }

        var now = DateTime.UtcNow.ToString("O");
        definition.Id = normalizedId;
        definition.TenantId = tenantId;
        definition.SiteKey = string.IsNullOrWhiteSpace(definition.SiteKey) ? tenantId : PageRedirectGuard.NormalizeSlug(definition.SiteKey);
        definition.FormKey = normalizedFormKey;
        definition.FormType = string.IsNullOrWhiteSpace(normalizedFormType) ? "custom" : normalizedFormType;
        definition.Status = status;
        definition.Name = definition.Name.Trim();
        definition.Description = (definition.Description ?? string.Empty).Trim();
        definition.SubmitAction = string.IsNullOrWhiteSpace(definition.SubmitAction) ? "form-entry" : PageRedirectGuard.NormalizeSlug(definition.SubmitAction);
        definition.RuntimeSubmitPath = string.IsNullOrWhiteSpace(definition.RuntimeSubmitPath) ? $"/api/forms/{tenantId}/entries" : definition.RuntimeSubmitPath.Trim();
        definition.StaticEndpointRef = (definition.StaticEndpointRef ?? string.Empty).Trim();
        definition.LeadRecipientRef = (definition.LeadRecipientRef ?? string.Empty).Trim();
        definition.NotificationEmailRef = (definition.NotificationEmailRef ?? string.Empty).Trim();
        definition.SuccessMessage = (definition.SuccessMessage ?? string.Empty).Trim();
        definition.ErrorMessage = (definition.ErrorMessage ?? string.Empty).Trim();
        definition.Fields = fields;
        definition.HiddenFields ??= new List<FormDefinitionField>();
        definition.ValidationRules ??= new Dictionary<string, object>();
        definition.SpamProtection ??= new FormSpamProtection();
        definition.Consent ??= new FormConsent();
        definition.Routing ??= new FormRouting();
        definition.CreatedAt = isUpdate && existing != null ? existing.CreatedAt : (string.IsNullOrWhiteSpace(definition.CreatedAt) ? now : definition.CreatedAt);
        definition.CreatedBy = isUpdate && existing != null ? existing.CreatedBy : (string.IsNullOrWhiteSpace(definition.CreatedBy) ? actor : definition.CreatedBy.Trim());
        definition.UpdatedAt = now;
        definition.UpdatedBy = string.IsNullOrWhiteSpace(actor) ? definition.UpdatedBy : actor;

        return (true, "OK");
    }

    private static bool ContainsSecretLikeValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var candidate = value.ToLowerInvariant();
        return candidate.Contains("accountkey=", StringComparison.Ordinal) ||
               candidate.Contains("sharedaccesssignature=", StringComparison.Ordinal) ||
               candidate.Contains("sig=", StringComparison.Ordinal) ||
               candidate.Contains("bearer ", StringComparison.Ordinal) ||
               candidate.Contains("password=", StringComparison.Ordinal);
    }

    private static bool IsDefaultFormKey(string formKey)
    {
        return string.Equals(formKey, "default-contact", StringComparison.Ordinal) ||
               string.Equals(formKey, "contact", StringComparison.Ordinal) ||
               string.Equals(formKey, "default-quote-request", StringComparison.Ordinal) ||
               string.Equals(formKey, "quote", StringComparison.Ordinal) ||
               string.Equals(formKey, "quote-request", StringComparison.Ordinal) ||
               string.Equals(formKey, "default-quote", StringComparison.Ordinal) ||
               string.Equals(formKey, "ice-contact-quote-request", StringComparison.Ordinal);
    }

    private static string NormalizeSubmitAliasFormKey(string formKey)
    {
        return formKey switch
        {
            "contact" => "default-contact",
            "quote" => "default-quote-request",
            "quote-request" => "default-quote-request",
            "default-quote" => "default-quote-request",
            "ice-contact-quote-request" => "default-quote-request",
            _ => formKey
        };
    }

    private static string FirstNonEmpty(params string[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim() ?? string.Empty;
    }

    // ===== THEME METHODS (Content Serving - API Key) =====

    public static async Task<IResult> GetThemeAsync(IDatabaseService databaseService, string apiKey, string tenantId, string themeId, ILogger? logger = null)
    {
        try
        {
            logger?.LogInformation("GetThemeAsync called - TenantId: {TenantId}, ThemeId: {ThemeId}", tenantId, themeId);

            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(themeId))
                return Results.BadRequest("Theme ID is required");

            var theme = await databaseService.GetThemeAsync(apiKey, tenantId, themeId);

            if (theme == null)
            {
                logger?.LogWarning("GetThemeAsync - Theme not found or access denied - TenantId: {TenantId}, ThemeId: {ThemeId}", tenantId, themeId);
                return Results.NotFound("Theme not found or access denied");
            }

            return Results.Ok(theme);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "GetThemeAsync - Error - TenantId: {TenantId}, ThemeId: {ThemeId}", tenantId, themeId);
            return Results.Problem($"Error retrieving theme: {ex.Message}");
        }
    }

    public static async Task<IResult> GetActiveThemeAsync(IDatabaseService databaseService, string apiKey, string tenantId, ILogger? logger = null)
    {
        try
        {
            logger?.LogInformation("GetActiveThemeAsync called - TenantId: {TenantId}", tenantId);

            if (string.IsNullOrEmpty(apiKey))
                return Results.BadRequest("API key is required");
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var theme = await databaseService.GetActiveThemeAsync(apiKey, tenantId);

            if (theme == null)
            {
                logger?.LogWarning("GetActiveThemeAsync - No active theme - TenantId: {TenantId}", tenantId);
                return Results.NotFound("No active theme found for this tenant");
            }

            return Results.Ok(theme);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Unauthorized();
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "GetActiveThemeAsync - Error - TenantId: {TenantId}", tenantId);
            return Results.Problem($"Error retrieving active theme: {ex.Message}");
        }
    }

    // ===== THEME ADMIN METHODS (JWT Authentication) =====

    public static async Task<IResult> GetThemeAdminAsync(IDatabaseService databaseService, string tenantId, string themeId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(themeId))
                return Results.BadRequest("Theme ID is required");

            var theme = await databaseService.GetThemeAdminAsync(tenantId, themeId);

            if (theme == null)
                return Results.NotFound("Theme not found");

            return Results.Ok(theme);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving theme: {ex.Message}");
        }
    }

    public static async Task<IResult> GetActiveThemeAdminAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var theme = await databaseService.GetActiveThemeAdminAsync(tenantId);

            if (theme == null)
                return Results.NotFound("No active theme found for this tenant");

            return Results.Ok(theme);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving active theme: {ex.Message}");
        }
    }

    public static async Task<IResult> GetThemesByTenantAsync(IDatabaseService databaseService, string tenantId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");

            var themes = await databaseService.GetThemesByTenantAsync(tenantId);

            return Results.Ok(new { themes, count = themes.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving themes: {ex.Message}");
        }
    }

    public static async Task<IResult> CreateThemeAsync(IDatabaseService databaseService, string tenantId, Theme theme)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (theme == null)
                return Results.BadRequest("Theme data is required");
            if (string.IsNullOrEmpty(theme.ThemeId))
                return Results.BadRequest("Theme ID is required");

            var designValidation = DesignSystemGuard.ValidateTheme(theme, tenantId);
            if (!designValidation.Ok)
                return Results.BadRequest(designValidation);

            var created = await databaseService.CreateThemeAsync(tenantId, theme);

            return Results.Created($"/api/admin/themes/{tenantId}/{created.ThemeId}", created);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating theme: {ex.Message}");
        }
    }

    public static async Task<IResult> UpdateThemeAsync(IDatabaseService databaseService, string tenantId, string themeId, Theme theme)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(themeId))
                return Results.BadRequest("Theme ID is required");
            if (theme == null)
                return Results.BadRequest("Theme data is required");

            var designValidation = DesignSystemGuard.ValidateTheme(theme, tenantId);
            if (!designValidation.Ok)
                return Results.BadRequest(designValidation);

            var updated = await databaseService.UpdateThemeAsync(tenantId, themeId, theme);

            return Results.Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating theme: {ex.Message}");
        }
    }

    public static async Task<IResult> DeleteThemeAsync(IDatabaseService databaseService, string tenantId, string themeId)
    {
        try
        {
            if (string.IsNullOrEmpty(tenantId))
                return Results.BadRequest("Tenant ID is required");
            if (string.IsNullOrEmpty(themeId))
                return Results.BadRequest("Theme ID is required");

            var deleted = await databaseService.DeleteThemeAsync(tenantId, themeId);

            if (deleted)
                return Results.Ok(new { message = "Theme deleted successfully", tenantId, themeId });

            return Results.NotFound("Theme not found");
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting theme: {ex.Message}");
        }
    }
}
