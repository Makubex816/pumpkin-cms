using pumpkin_net_models.Models;

namespace pumpkin_api.Services.DomainBindings;

public static class DomainBindingEndpoints
{
    public static IServiceCollection AddDomainBindingFoundation(this IServiceCollection services)
    {
        services.AddHttpClient<DomainBindingDnsValidationService>();
        return services;
    }

    public static WebApplication MapDomainBindingEndpoints(this WebApplication app)
    {
        app.MapGet("/api/admin/domain-bindings", ListAllAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("ListDomainBindings")
            .WithSummary("List DomainBinding records")
            .WithDescription("Lists DomainBinding records. Requires SuperAdmin role and JWT authentication.");

        app.MapGet("/api/admin/tenants/{tenantId}/domain-bindings", ListTenantAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("ListTenantDomainBindings")
            .WithSummary("List tenant DomainBinding records")
            .WithDescription("Lists DomainBinding records for a tenant. Requires SuperAdmin role and JWT authentication.");

        app.MapGet("/api/admin/tenants/{tenantId}/domain-bindings/{id}", GetAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("GetTenantDomainBinding")
            .WithSummary("Get tenant DomainBinding")
            .WithDescription("Gets a DomainBinding record for a tenant. Requires SuperAdmin role and JWT authentication.");

        app.MapPost("/api/admin/tenants/{tenantId}/domain-bindings", CreateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("CreateTenantDomainBinding")
            .WithSummary("Create tenant DomainBinding")
            .WithDescription("Creates a DomainBinding record for a tenant. Requires SuperAdmin role and JWT authentication.");

        app.MapPut("/api/admin/tenants/{tenantId}/domain-bindings/{id}", UpdateAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("UpdateTenantDomainBinding")
            .WithSummary("Update tenant DomainBinding")
            .WithDescription("Updates a DomainBinding record for a tenant. Requires SuperAdmin role and JWT authentication.");

        app.MapPost("/api/admin/tenants/{tenantId}/domain-bindings/{id}/generate-dns-packet", GenerateDnsPacketAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("GenerateTenantDomainBindingDnsPacket")
            .WithSummary("Generate Azure App Service DNS packet")
            .WithDescription("Generates public DNS record requirements for Azure App Service hostname validation. Requires SuperAdmin role and JWT authentication.");

        app.MapPost("/api/admin/tenants/{tenantId}/domain-bindings/{id}/validate-dns", ValidateDnsAsync)
            .RequireAuthorization()
            .WithTags("Admin - Domain Bindings")
            .WithName("ValidateTenantDomainBindingDns")
            .WithSummary("Validate DomainBinding DNS read-only")
            .WithDescription("Performs read-only public DNS validation for a DomainBinding record. Requires SuperAdmin role and JWT authentication.");

        return app;
    }

    private static async Task<IResult> ListAllAsync(IDatabaseService databaseService, HttpContext context)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        var bindings = await databaseService.GetDomainBindingsAsync();
        return Results.Ok(new DomainBindingListResponse { DomainBindings = bindings, Count = bindings.Count });
    }

    private static async Task<IResult> ListTenantAsync(IDatabaseService databaseService, HttpContext context, string tenantId)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        var bindings = await databaseService.GetDomainBindingsAsync(tenantId);
        return Results.Ok(new DomainBindingListResponse { DomainBindings = bindings, Count = bindings.Count });
    }

    private static async Task<IResult> GetAsync(IDatabaseService databaseService, HttpContext context, string tenantId, string id)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        var binding = await databaseService.GetDomainBindingAsync(tenantId, id);
        return binding == null ? Results.NotFound() : Results.Ok(binding);
    }

    private static async Task<IResult> CreateAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        DomainBinding request)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        if (await databaseService.GetTenantAsync(tenantId) == null)
        {
            return Results.NotFound(new { message = $"Tenant '{tenantId}' was not found." });
        }

        try
        {
            var actor = DomainBindingAuthorization.GetActor(context.User);
            var binding = DomainBindingMutation.PrepareForCreate(request, tenantId, actor);
            var created = await databaseService.CreateDomainBindingAsync(tenantId, binding);
            return Results.Created($"/api/admin/tenants/{tenantId}/domain-bindings/{created.Id}", created);
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
        string id,
        DomainBinding request)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        try
        {
            var actor = DomainBindingAuthorization.GetActor(context.User);
            var binding = DomainBindingMutation.PrepareForUpdate(request, tenantId, id, actor);
            var updated = await databaseService.UpdateDomainBindingAsync(tenantId, id, binding);
            return Results.Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    private static async Task<IResult> GenerateDnsPacketAsync(
        IDatabaseService databaseService,
        HttpContext context,
        string tenantId,
        string id,
        DomainBindingDnsPacketRequest request)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        var binding = await databaseService.GetDomainBindingAsync(tenantId, id);
        if (binding == null) return Results.NotFound();

        try
        {
            var fromStatus = binding.Status;
            binding.DnsRecords = DomainBindingDnsPacketService.GenerateAzureAppServicePacket(binding, request);
            binding.DnsValidationStatus = "pending";
            binding.Status = "pending_dns_records";
            binding.UpdatedBy = DomainBindingAuthorization.GetActor(context.User);
            binding.UpdatedAt = DateTime.UtcNow;
            DomainBindingMutation.AppendAudit(binding, binding.UpdatedBy, "generate_dns_packet", fromStatus, binding.Status, "Azure App Service DNS packet generated.");

            var updated = await databaseService.UpdateDomainBindingAsync(tenantId, id, binding);
            return Results.Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> ValidateDnsAsync(
        IDatabaseService databaseService,
        DomainBindingDnsValidationService dnsValidationService,
        HttpContext context,
        string tenantId,
        string id,
        CancellationToken cancellationToken)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;

        var binding = await databaseService.GetDomainBindingAsync(tenantId, id);
        if (binding == null) return Results.NotFound();

        var fromStatus = binding.Status;
        var allVerified = await dnsValidationService.ValidateAsync(binding, cancellationToken);
        binding.UpdatedBy = DomainBindingAuthorization.GetActor(context.User);
        binding.UpdatedAt = DateTime.UtcNow;
        DomainBindingMutation.AppendAudit(binding, binding.UpdatedBy, "validate_dns_readonly", fromStatus, binding.Status, "Read-only DNS validation completed.");

        var updated = await databaseService.UpdateDomainBindingAsync(tenantId, id, binding);
        return Results.Ok(new DomainBindingDnsValidationResponse
        {
            DomainBinding = updated,
            Status = updated.DnsValidationStatus,
            AllRecordsVerified = allVerified
        });
    }
}
