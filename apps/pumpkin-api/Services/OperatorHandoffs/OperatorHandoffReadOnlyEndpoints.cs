namespace pumpkin_api.Services;

public static class OperatorHandoffReadOnlyEndpoints
{
    public static IServiceCollection AddOperatorHandoffReadOnlyFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IOperatorHandoffReadOnlyProvider, FixtureOperatorHandoffReadOnlyProvider>();
        services.AddSingleton<IOperatorHandoffReadOnlyService, OperatorHandoffReadOnlyService>();
        return services;
    }

    public static IEndpointRouteBuilder MapOperatorHandoffReadOnlyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/operator-handoffs")
            .RequireAuthorization()
            .WithTags("Admin - Operator Handoffs");

        group.MapGet("/", ListHandoffsAsync)
            .WithName("ListOperatorHandoffs")
            .WithSummary("List operator handoffs")
            .WithDescription("GET-only operator handoff summaries backed by local V2.12.1 handoff fixtures. No import execution, tenant creation, Roller resume, CMS/provider writes, OLM staging write, deployment, indexing, contact-form action, Azure mutation, Electron runtime, or protected config reads.");

        group.MapGet("/{handoffPacketId}", GetHandoffAsync)
            .WithName("GetOperatorHandoff")
            .WithSummary("Get operator handoff")
            .WithDescription("GET-only operator handoff consumer model from local fixture evidence.");

        group.MapGet("/{handoffPacketId}/parity", GetParityAsync)
            .WithName("GetOperatorHandoffParity")
            .WithSummary("Get operator handoff parity")
            .WithDescription("GET-only fixture parity status for the operator handoff packet.");

        group.MapGet("/{handoffPacketId}/evidence", GetEvidenceAsync)
            .WithName("GetOperatorHandoffEvidence")
            .WithSummary("Get operator handoff evidence")
            .WithDescription("GET-only evidence references for readback, mappings, Backup, Registry, Provider, RuntimeQA, Audit Jobs, and OLM carryforward.");

        group.MapGet("/{handoffPacketId}/consumer-projection", GetConsumerProjectionAsync)
            .WithName("GetOperatorHandoffConsumerProjection")
            .WithSummary("Get operator handoff consumer projection")
            .WithDescription("GET-only Admin-ready operator handoff consumer projection.");

        group.MapGet("/{handoffPacketId}/qa-checklist", GetQaChecklistAsync)
            .WithName("GetOperatorHandoffQaChecklist")
            .WithSummary("Get operator handoff QA checklist")
            .WithDescription("GET-only QA checklist confirming read-only and disabled-action boundaries.");

        return app;
    }

    public static async Task<IResult> ListHandoffsAsync(
        IOperatorHandoffReadOnlyService service,
        [AsParameters] OperatorHandoffApiQuery query,
        HttpContext context)
        => ToResult(await service.ListHandoffsAsync(query, context.RequestAborted));

    public static async Task<IResult> GetHandoffAsync(
        IOperatorHandoffReadOnlyService service,
        string handoffPacketId,
        HttpContext context)
        => ToResult(await service.GetHandoffAsync(handoffPacketId, context.RequestAborted));

    public static async Task<IResult> GetParityAsync(
        IOperatorHandoffReadOnlyService service,
        string handoffPacketId,
        HttpContext context)
        => ToResult(await service.GetParityAsync(handoffPacketId, context.RequestAborted));

    public static async Task<IResult> GetEvidenceAsync(
        IOperatorHandoffReadOnlyService service,
        string handoffPacketId,
        HttpContext context)
        => ToResult(await service.GetEvidenceAsync(handoffPacketId, context.RequestAborted));

    public static async Task<IResult> GetConsumerProjectionAsync(
        IOperatorHandoffReadOnlyService service,
        string handoffPacketId,
        HttpContext context)
        => ToResult(await service.GetConsumerProjectionAsync(handoffPacketId, context.RequestAborted));

    public static async Task<IResult> GetQaChecklistAsync(
        IOperatorHandoffReadOnlyService service,
        string handoffPacketId,
        HttpContext context)
        => ToResult(await service.GetQaChecklistAsync(handoffPacketId, context.RequestAborted));

    private static IResult ToResult<T>(OperatorHandoffReadOnlyApiEnvelopeDto<T> envelope)
        => Results.Json(envelope, statusCode: envelope.Status);
}
