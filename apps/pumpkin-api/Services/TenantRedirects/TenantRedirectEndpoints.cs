using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectEndpoints
{
    public static WebApplication MapTenantRedirectEndpoints(this WebApplication app)
    {
        app.MapGet("/api/redirects/{tenantId}/resolve", ResolveRuntimeAsync)
            .WithTags("Redirects")
            .WithName("ResolveTenantRedirect")
            .WithSummary("Resolve an active tenant redirect")
            .WithDescription("Returns minimal redirect metadata for a tenant runtime. Requires the tenant API key and does not expose Admin audit data.")
            .RequireCors("TenantCors");

        app.MapGet("/api/admin/tenants/{tenantId}/redirects", ListAsync)
            .RequireAuthorization()
            .WithTags("Admin - Tenant Redirects")
            .WithName("ListTenantRedirects")
            .WithSummary("List tenant redirects");

        app.MapPost("/api/admin/tenants/{tenantId}/redirects", CreateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Tenant Redirects")
            .WithName("CreateTenantRedirect")
            .WithSummary("Create an idempotent tenant redirect");

        app.MapPut("/api/admin/tenants/{tenantId}/redirects/{redirectId}", UpdateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Tenant Redirects")
            .WithName("UpdateTenantRedirect")
            .WithSummary("Update a tenant redirect");

        app.MapDelete("/api/admin/tenants/{tenantId}/redirects/{redirectId}", DeactivateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Tenant Redirects")
            .WithName("DeactivateTenantRedirect")
            .WithSummary("Soft-delete a tenant redirect");

        app.MapPost("/api/admin/tenants/{tenantId}/redirects/validate", ValidateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Tenant Redirects")
            .WithName("ValidateTenantRedirect")
            .WithSummary("Validate a tenant redirect without mutation");

        return app;
    }

    private static async Task<IResult> ListAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        bool includeInactive = false)
    {
        var auth = TenantRedirectAuthorization.RequireTenantAccess(context, tenantId);
        if (auth != null) return auth;

        var redirects = await databaseService.GetTenantRedirectsAsync(tenantId, includeInactive);
        return Results.Ok(new TenantRedirectListResponse
        {
            Redirects = redirects,
            Count = redirects.Count,
            IncludeInactive = includeInactive
        });
    }

    private static async Task<IResult> ValidateAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        TenantRedirectUpsertRequest request)
    {
        var auth = TenantRedirectAuthorization.RequireTenantAccess(context, tenantId);
        if (auth != null) return auth;
        if (await databaseService.GetTenantAsync(tenantId) == null)
        {
            return Results.NotFound(new { message = $"Tenant '{tenantId}' was not found." });
        }

        var validation = await TenantRedirectValidationService.ValidateAsync(databaseService, tenantId, request);
        return validation.Valid ? Results.Ok(validation) : Results.BadRequest(validation);
    }

    private static async Task<IResult> CreateAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        TenantRedirectUpsertRequest request)
    {
        var auth = TenantRedirectAuthorization.RequireTenantAccess(context, tenantId);
        if (auth != null) return auth;
        if (await databaseService.GetTenantAsync(tenantId) == null)
        {
            return Results.NotFound(new { message = $"Tenant '{tenantId}' was not found." });
        }

        var validation = await TenantRedirectValidationService.ValidateAsync(databaseService, tenantId, request);
        if (!validation.Valid)
        {
            return Results.BadRequest(validation);
        }

        if (!string.IsNullOrWhiteSpace(validation.IdempotentMatchId))
        {
            var existing = await databaseService.GetTenantRedirectAsync(tenantId, validation.IdempotentMatchId);
            if (existing != null)
            {
                return Results.Ok(new TenantRedirectMutationResponse
                {
                    Redirect = existing,
                    Validation = validation,
                    IdempotentReplay = true
                });
            }
        }

        try
        {
            var actor = TenantRedirectAuthorization.GetActor(context.User);
            var redirect = TenantRedirectMutation.PrepareForCreate(tenantId, request, validation, actor);
            var created = await databaseService.CreateTenantRedirectAsync(tenantId, redirect);
            return Results.Created(
                $"/api/admin/tenants/{tenantId}/redirects/{created.Id}",
                new TenantRedirectMutationResponse
                {
                    Redirect = created,
                    Validation = validation,
                    IdempotentReplay = false
                });
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    private static async Task<IResult> UpdateAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        string redirectId,
        TenantRedirectUpsertRequest request)
    {
        var auth = TenantRedirectAuthorization.RequireTenantAccess(context, tenantId);
        if (auth != null) return auth;
        var existing = await databaseService.GetTenantRedirectAsync(tenantId, redirectId);
        if (existing == null) return Results.NotFound();

        var validation = await TenantRedirectValidationService.ValidateAsync(
            databaseService,
            tenantId,
            request,
            redirectId,
            existing.SourcePath);
        if (!validation.Valid)
        {
            return Results.BadRequest(validation);
        }

        try
        {
            var actor = TenantRedirectAuthorization.GetActor(context.User);
            var redirect = TenantRedirectMutation.PrepareForUpdate(existing, request, validation, actor);
            var updated = await databaseService.UpdateTenantRedirectAsync(tenantId, redirectId, redirect);
            return Results.Ok(new TenantRedirectMutationResponse
            {
                Redirect = updated,
                Validation = validation,
                IdempotentReplay = false
            });
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    private static async Task<IResult> DeactivateAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        string redirectId)
    {
        var auth = TenantRedirectAuthorization.RequireTenantAccess(context, tenantId);
        if (auth != null) return auth;
        var existing = await databaseService.GetTenantRedirectAsync(tenantId, redirectId);
        if (existing == null) return Results.NotFound();
        if (!existing.Active) return Results.NoContent();

        var actor = TenantRedirectAuthorization.GetActor(context.User);
        var redirect = TenantRedirectMutation.PrepareForDeactivate(existing, actor);
        await databaseService.UpdateTenantRedirectAsync(tenantId, redirectId, redirect);
        return Results.NoContent();
    }

    private static async Task<IResult> ResolveRuntimeAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        string sourcePath,
        string? query = null)
    {
        var apiKey = ReadBearer(context.Request.Headers.Authorization.FirstOrDefault());
        var redirect = await databaseService.ResolveTenantRedirectAsync(apiKey, tenantId, sourcePath);
        if (redirect == null) return Results.NotFound();

        return Results.Ok(new TenantRedirectRuntimeResponse
        {
            Location = TenantRedirectNormalizer.BuildLocation(redirect, query),
            StatusCode = redirect.StatusCode,
            PreserveQueryString = redirect.PreserveQueryString
        });
    }

    private static string ReadBearer(string? header)
    {
        return !string.IsNullOrWhiteSpace(header) && header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? header["Bearer ".Length..].Trim()
            : string.Empty;
    }
}
