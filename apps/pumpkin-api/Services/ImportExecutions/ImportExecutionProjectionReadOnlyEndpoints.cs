namespace pumpkin_api.Services;

public static class ImportExecutionProjectionReadOnlyEndpoints
{
    public static IServiceCollection AddImportExecutionProjectionReadOnlyFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IImportExecutionProjectionReadOnlyProvider, FixtureImportExecutionProjectionReadOnlyProvider>();
        services.AddSingleton<IImportExecutionProjectionReadOnlyService, ImportExecutionProjectionReadOnlyService>();
        return services;
    }

    public static IEndpointRouteBuilder MapImportExecutionProjectionReadOnlyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/import-executions")
            .RequireAuthorization()
            .WithTags("Admin - Import Executions");

        group.MapGet("/", ListExecutionsAsync)
            .WithName("ListImportExecutionProjections")
            .WithSummary("List import execution projections")
            .WithDescription("GET-only import-execution projection summaries backed by frozen local V2.11.8/V2.11.7A evidence. No import execution, tenant creation, Roller resume, CMS writes, provider writes, MediaAsset writes, deployment, indexing, contact-form action, Azure mutation, or protected config reads.");

        group.MapGet("/{executionRunId}", GetExecutionAsync)
            .WithName("GetImportExecutionProjection")
            .WithSummary("Get import execution projection")
            .WithDescription("GET-only import-execution read-only projection from the local frozen evidence provider.");

        group.MapGet("/{executionRunId}/readback", GetReadbackAsync)
            .WithName("GetImportExecutionReadback")
            .WithSummary("Get import execution readback verification")
            .WithDescription("GET-only readback verification, including frozen count comparisons and no-prohibited-action result.");

        group.MapGet("/{executionRunId}/entity-mappings", GetEntityMappingsAsync)
            .WithName("GetImportExecutionEntityMappings")
            .WithSummary("Get import execution entity mappings")
            .WithDescription("GET-only entity mappings from the frozen local scoped Ice import execution.");

        group.MapGet("/{executionRunId}/audit", GetAuditAsync)
            .WithName("GetImportExecutionAudit")
            .WithSummary("Get import execution audit trace")
            .WithDescription("GET-only trace, audit, rollback, readback, and evidence-chain references.");

        group.MapGet("/{executionRunId}/rollback", GetRollbackAsync)
            .WithName("GetImportExecutionRollback")
            .WithSummary("Get import execution rollback and abort references")
            .WithDescription("GET-only rollback and abort references. Rollback/abort actions remain future-gated.");

        group.MapGet("/{executionRunId}/operator-projection", GetOperatorProjectionAsync)
            .WithName("GetImportExecutionOperatorProjection")
            .WithSummary("Get complete import execution operator projection")
            .WithDescription("GET-only complete operator projection for Admin read-only rendering.");

        return app;
    }

    public static async Task<IResult> ListExecutionsAsync(
        IImportExecutionProjectionReadOnlyService service,
        [AsParameters] ImportExecutionProjectionApiQuery query,
        HttpContext context)
        => ToResult(await service.ListExecutionsAsync(query, context.RequestAborted));

    public static async Task<IResult> GetExecutionAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetExecutionAsync(executionRunId, context.RequestAborted));

    public static async Task<IResult> GetReadbackAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetReadbackAsync(executionRunId, context.RequestAborted));

    public static async Task<IResult> GetEntityMappingsAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetEntityMappingsAsync(executionRunId, context.RequestAborted));

    public static async Task<IResult> GetAuditAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetAuditAsync(executionRunId, context.RequestAborted));

    public static async Task<IResult> GetRollbackAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetRollbackAsync(executionRunId, context.RequestAborted));

    public static async Task<IResult> GetOperatorProjectionAsync(
        IImportExecutionProjectionReadOnlyService service,
        string executionRunId,
        HttpContext context)
        => ToResult(await service.GetOperatorProjectionAsync(executionRunId, context.RequestAborted));

    private static IResult ToResult<T>(ImportExecutionProjectionReadOnlyApiEnvelopeDto<T> envelope)
        => Results.Json(envelope, statusCode: envelope.Status);
}
