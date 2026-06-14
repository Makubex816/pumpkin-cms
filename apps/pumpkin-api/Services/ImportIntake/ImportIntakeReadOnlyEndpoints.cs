namespace pumpkin_api.Services;

public static class ImportIntakeReadOnlyEndpoints
{
    public static IServiceCollection AddImportIntakeReadOnlyFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IImportIntakeReadOnlyProvider, FixtureImportIntakeReadOnlyProvider>();
        services.AddSingleton<IImportIntakeReadOnlyService, ImportIntakeReadOnlyService>();
        return services;
    }

    public static IEndpointRouteBuilder MapImportIntakeReadOnlyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/import-intake")
            .RequireAuthorization()
            .WithTags("Admin - Import Intake");

        group.MapGet("/packages", ListPackagesAsync)
            .WithName("ListImportIntakePackages")
            .WithSummary("List import intake packages")
            .WithDescription("GET-only import-intake package summaries backed by local read-only fixtures. No import execution, tenant creation, Roller resume, CMS writes, provider writes, deployment, indexing, contact-form action, Azure mutation, or protected config reads.");

        group.MapGet("/packages/{packageId}", GetPackageAsync)
            .WithName("GetImportIntakePackage")
            .WithSummary("Get import intake package summary")
            .WithDescription("GET-only import-intake package summary from the local read-only fixture provider.");

        group.MapGet("/packages/{packageId}/preview", GetPreviewAsync)
            .WithName("GetImportIntakePreview")
            .WithSummary("Get import intake package preview")
            .WithDescription("GET-only import-intake shared preview model for Admin read-only rendering.");

        group.MapGet("/packages/{packageId}/validation", GetValidationAsync)
            .WithName("GetImportIntakeValidation")
            .WithSummary("Get import intake validation state")
            .WithDescription("GET-only validation, security, redaction, and disabled action state.");

        group.MapGet("/packages/{packageId}/no-go", ListNoGoConditionsAsync)
            .WithName("ListImportIntakeNoGoConditions")
            .WithSummary("List import intake no-go conditions")
            .WithDescription("GET-only no-go conditions, including paused Roller no-import state.");

        group.MapGet("/packages/{packageId}/rollback", GetRollbackAsync)
            .WithName("GetImportIntakeRollback")
            .WithSummary("Get import intake rollback and abort state")
            .WithDescription("GET-only rollback and abort readiness references.");

        group.MapGet("/packages/{packageId}/evidence", ListEvidenceRefsAsync)
            .WithName("ListImportIntakeEvidenceRefs")
            .WithSummary("List import intake evidence refs")
            .WithDescription("GET-only Backup Center, Runtime QA, Audit Jobs, validation, and rollback references.");

        group.MapGet("/packages/{packageId}/refs", ListResourceRefsAsync)
            .WithName("ListImportIntakeResourceRefs")
            .WithSummary("List import intake resource refs")
            .WithDescription("GET-only route, content, media, form, registry, profile, and Outbound Link Manager references.");

        return app;
    }

    public static async Task<IResult> ListPackagesAsync(
        IImportIntakeReadOnlyService service,
        [AsParameters] ImportIntakeApiQuery query,
        HttpContext context)
        => ToResult(await service.ListPackagesAsync(query, context.RequestAborted));

    public static async Task<IResult> GetPackageAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.GetPackageAsync(packageId, context.RequestAborted));

    public static async Task<IResult> GetPreviewAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.GetPreviewAsync(packageId, context.RequestAborted));

    public static async Task<IResult> GetValidationAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.GetValidationAsync(packageId, context.RequestAborted));

    public static async Task<IResult> ListNoGoConditionsAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.ListNoGoConditionsAsync(packageId, context.RequestAborted));

    public static async Task<IResult> GetRollbackAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.GetRollbackAsync(packageId, context.RequestAborted));

    public static async Task<IResult> ListEvidenceRefsAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.ListEvidenceRefsAsync(packageId, context.RequestAborted));

    public static async Task<IResult> ListResourceRefsAsync(
        IImportIntakeReadOnlyService service,
        string packageId,
        HttpContext context)
        => ToResult(await service.ListResourceRefsAsync(packageId, context.RequestAborted));

    private static IResult ToResult<T>(ImportIntakeReadOnlyApiEnvelopeDto<T> envelope)
        => Results.Json(envelope, statusCode: envelope.Status);
}
