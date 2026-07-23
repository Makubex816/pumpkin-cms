using Microsoft.Extensions.DependencyInjection.Extensions;

namespace pumpkin_api.Services.Publications;

public static class PublicationProductEndpoints
{
    public static IServiceCollection AddPublicationProduct(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<PublicationProductOptions>(
            configuration.GetSection(PublicationProductOptions.SectionName));
        services.TryAddSingleton(TimeProvider.System);
        services.AddSingleton<IPublicationProductStore, PublicPublicationProductStore>();
        services.AddSingleton<PublicationProductService>();
        return services;
    }

    public static WebApplication MapPublicationProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/publication-products")
            .RequireAuthorization()
            .WithTags("Admin - Publication Products");

        group.MapGet("", ListInventoryAsync)
            .WithName("ListPublicationProducts");
        group.MapGet("/center", GetSuperAdminCenterAsync)
            .WithName("GetPublicationProductCenter");
        group.MapGet("/tenants/{tenantUid}/summary", GetTenantSummaryAsync)
            .WithName("GetTenantPublicationProductSummary");
        group.MapGet("/tenants/{tenantUid}/center", GetTenantCenterAsync)
            .WithName("GetTenantPublicationProductCenter");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/releases", ListReleasesAsync)
            .WithName("ListPublicationProductReleases");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/releases/{releaseId}", GetReleaseAsync)
            .WithName("GetPublicationProductRelease");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/releases", RegisterReleaseAsync)
            .WithName("RegisterPublicationProductRelease");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/releases/{releaseId}/supersede", SupersedeReleaseAsync)
            .WithName("SupersedePublicationProductRelease");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/artifacts", ListArtifactsAsync)
            .WithName("ListTenantPublicationArtifacts");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/artifacts/{artifactId}", GetArtifactAsync)
            .WithName("GetTenantPublicationArtifact");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/artifacts", RegisterArtifactAsync)
            .WithName("RegisterTenantPublicationArtifact");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/artifacts/{artifactId}/supersede", SupersedeArtifactAsync)
            .WithName("SupersedeTenantPublicationArtifact");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/jobs", ListJobsAsync)
            .WithName("ListPublicationProductJobs");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/jobs/{jobId}", GetJobAsync)
            .WithName("GetPublicationProductJob");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/jobs", CreateJobAsync)
            .WithName("CreatePublicationProductJob");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/jobs/{jobId}/resume", ResumeJobAsync)
            .WithName("ResumePublicationProductJob");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/jobs/{jobId}/promote", PromoteJobAsync)
            .WithName("PromotePublicationProductJobRelease");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/jobs/{jobId}/rollback", RollbackJobAsync)
            .WithName("RollbackPublicationProductJob");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/form-authority", UpdateFormAuthorityAsync)
            .WithName("UpdatePublicationFormAuthority");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/revoke", RevokePublicationAsync)
            .WithName("RevokePublicationProduct");
        group.MapGet("/tenants/{tenantUid}/publications/{publicationId}/backup", GetBackupAsync)
            .WithName("GetPublicationProductBackup");
        group.MapPost("/tenants/{tenantUid}/publications/{publicationId}/restore", RestoreBackupAsync)
            .WithName("RestorePublicationProductBackup");
        return app;
    }

    private static async Task<IResult> ListInventoryAsync(
        PublicationProductService service,
        HttpContext context,
        string? tenantUid = null,
        string? status = null,
        string? releaseStatus = null,
        string? hostingClass = null,
        string? continuationToken = null,
        int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var authorization = PublicationProductAuthorization.RequireInventoryAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.ListInventoryAsync(
            tenantUid, status, releaseStatus, hostingClass, continuationToken, pageSize, cancellationToken));
    }

    private static async Task<IResult> GetSuperAdminCenterAsync(
        PublicationProductService service,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        if (context.User.Identity?.IsAuthenticated != true) return Results.Unauthorized();
        if (!PublicationProductAuthorization.IsSuperAdmin(context.User)) return Results.Forbid();
        return ToResult(context, await service.GetSuperAdminCenterAsync(cancellationToken));
    }

    private static async Task<IResult> GetTenantSummaryAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.GetTenantSummaryAsync(tenantUid, cancellationToken));
    }

    private static async Task<IResult> GetTenantCenterAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        var scope = PublicationProductAuthorization.IsSuperAdmin(context.User)
            ? "SUPER_ADMIN_ALL_TENANTS"
            : "TENANT_ADMIN_OWN_TENANT";
        return ToResult(context, await service.GetTenantCenterAsync(tenantUid, scope, cancellationToken));
    }

    private static async Task<IResult> ListReleasesAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string? status = null,
        string? continuationToken = null,
        int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.ListReleasesAsync(
            tenantUid, publicationId, status, continuationToken, pageSize, cancellationToken));
    }

    private static async Task<IResult> GetReleaseAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string releaseId,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.GetReleaseAsync(
            tenantUid, publicationId, releaseId, cancellationToken));
    }

    private static async Task<IResult> RegisterReleaseAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        RegisterPublicationReleaseRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireSuperAdmin(context);
        if (authorization != null) return authorization;
        return ToResult(context, await service.RegisterReleaseAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> SupersedeReleaseAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string releaseId,
        SupersedePublicationReleaseRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireSuperAdmin(context);
        if (authorization != null) return authorization;
        return ToResult(context, await service.SupersedeReleaseAsync(
            tenantUid, publicationId, releaseId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> ListArtifactsAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string? releaseId = null,
        string? status = null,
        string? continuationToken = null,
        int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.ListArtifactsAsync(
            tenantUid, publicationId, releaseId, status, continuationToken, pageSize, cancellationToken));
    }

    private static async Task<IResult> GetArtifactAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string artifactId,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.GetArtifactAsync(
            tenantUid, publicationId, artifactId, cancellationToken));
    }

    private static async Task<IResult> RegisterArtifactAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.RegisterArtifactAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> SupersedeArtifactAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string artifactId,
        SupersedePublicationArtifactRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.SupersedeArtifactAsync(
            tenantUid, publicationId, artifactId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> ListJobsAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string? status = null,
        string? continuationToken = null,
        int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.ListJobsAsync(
            tenantUid, publicationId, status, continuationToken, pageSize, cancellationToken));
    }

    private static async Task<IResult> GetJobAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string jobId,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.GetJobAsync(
            tenantUid, publicationId, jobId, cancellationToken));
    }

    private static async Task<IResult> CreateJobAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        CreatePublicationJobRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.CreateJobAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> ResumeJobAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string jobId,
        PublicationJobActionRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.ResumeJobAsync(
            tenantUid, publicationId, jobId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> PromoteJobAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string jobId,
        PromotePublicationJobRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.PromoteJobAsync(
            tenantUid, publicationId, jobId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> RollbackJobAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        string jobId,
        PublicationJobActionRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.RollbackJobAsync(
            tenantUid, publicationId, jobId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> RevokePublicationAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        PublicationLifecycleActionRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.RevokePublicationAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> UpdateFormAuthorityAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        UpdatePublicationFormAuthorityRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireSuperAdmin(context);
        if (authorization != null) return authorization;
        return ToResult(context, await service.UpdateFormAuthorityAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static async Task<IResult> GetBackupAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireTenantAccess(context, tenantUid);
        if (authorization != null) return authorization;
        return ToResult(context, await service.GetBackupAsync(
            tenantUid, publicationId, cancellationToken));
    }

    private static async Task<IResult> RestoreBackupAsync(
        PublicationProductService service,
        HttpContext context,
        string tenantUid,
        string publicationId,
        RestorePublicationProductRequest request,
        CancellationToken cancellationToken)
    {
        var authorization = PublicationProductAuthorization.RequireSuperAdmin(context);
        if (authorization != null) return authorization;
        return ToResult(context, await service.RestoreBackupAsync(
            tenantUid, publicationId, request,
            PublicationProductAuthorization.GetActor(context.User), ActorType(context), cancellationToken));
    }

    private static IResult ToResult<T>(
        HttpContext context,
        PublicationProductResult<T> result)
    {
        if (result.Status is PublicationProductResultStatus.Success or PublicationProductResultStatus.Created)
            return Results.Json(result.Value, statusCode:
                result.Status == PublicationProductResultStatus.Created ? StatusCodes.Status201Created : StatusCodes.Status200OK);
        var statusCode = result.Status switch
        {
            PublicationProductResultStatus.Invalid => StatusCodes.Status400BadRequest,
            PublicationProductResultStatus.Forbidden => StatusCodes.Status403Forbidden,
            PublicationProductResultStatus.NotFound => StatusCodes.Status404NotFound,
            PublicationProductResultStatus.Conflict => StatusCodes.Status409Conflict,
            PublicationProductResultStatus.ExecutionHeld => StatusCodes.Status409Conflict,
            PublicationProductResultStatus.Disabled => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status503ServiceUnavailable
        };
        return Results.Json(new PublicationProductError
        {
            ErrorCode = result.ErrorCode,
            RequestId = context.TraceIdentifier,
            Retryable = string.Equals(
                result.ErrorCode, "publication_revision_conflict", StringComparison.Ordinal)
        }, statusCode: statusCode);
    }

    private static string ActorType(HttpContext context) =>
        PublicationProductAuthorization.IsSuperAdmin(context.User) ? "SUPER_ADMIN" : "TENANT_ADMIN";
}
