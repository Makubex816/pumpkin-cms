namespace pumpkin_api.Services;

public static class OutboundLinkWriteEndpoints
{
    public static IServiceCollection AddOutboundLinkWriteFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IOutboundLinkWriteTraceLogger, OutboundLinkWriteTraceLogger>();
        services.AddSingleton<IOutboundLinkWriteGuardService, OutboundLinkWriteGuardService>();
        services.AddSingleton<IOutboundLinkWriteProvider, OutboundLinkWriteFakeProvider>();
        services.AddSingleton<IOutboundLinkWriteActionService, OutboundLinkWriteActionService>();
        return services;
    }

    public static IEndpointRouteBuilder MapOutboundLinkWriteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin")
            .RequireAuthorization()
            .WithTags("Admin - Outbound Links");

        group.MapPatch("/outbound-links/{id}/status", SetLinkStatusAsync)
            .WithName("SetOutboundLinkStatus")
            .WithSummary("Set outbound link status")
            .WithDescription("Scoped local/fake Outbound Link Manager write foundation. Live provider writes remain blocked.");

        group.MapPatch("/outbound-link-instances/{id}/status", SetInstanceStatusAsync)
            .WithName("SetOutboundLinkInstanceStatus")
            .WithSummary("Set outbound link instance status")
            .WithDescription("Scoped local/fake Outbound Link Manager instance write foundation.");

        group.MapPut("/outbound-link-policies", SetPolicyAsync)
            .WithName("SetOutboundLinkPolicy")
            .WithSummary("Set outbound link policy")
            .WithDescription("Scoped local/fake policy write foundation.");

        group.MapPost("/outbound-link-scan-runs", CreateScanRunAsync)
            .WithName("CreateOutboundLinkScanRun")
            .WithSummary("Create outbound link scan run")
            .WithDescription("Creates local/fake scan-run metadata only. No external crawling.");

        group.MapPost("/outbound-links/bulk-actions", BulkActionAsync)
            .WithName("RunOutboundLinkBulkAction")
            .WithSummary("Run scoped outbound link bulk action")
            .WithDescription("Runs scoped local/fake bulk preflight/execution only.");

        group.MapPost("/outbound-links/review-decisions", ReviewDecisionAsync)
            .WithName("RunOutboundLinkReviewDecision")
            .WithSummary("Run outbound link review decision")
            .WithDescription("Runs approve/block/ignore review decisions in scoped local/fake mode.");

        group.MapPost("/outbound-links/{id}/restore-status", RestoreStatusAsync)
            .WithName("RestoreOutboundLinkStatus")
            .WithSummary("Restore prior outbound link status")
            .WithDescription("Runs local/fake restore status foundation only.");

        return app;
    }

    public static Task<IResult> SetLinkStatusAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        string id,
        OutboundLinkWriteRequest request)
        => Execute(service, context, OutboundLinkWriteActions.SetLinkStatus, id, request);

    public static Task<IResult> SetInstanceStatusAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        string id,
        OutboundLinkWriteRequest request)
        => Execute(service, context, OutboundLinkWriteActions.SetInstanceStatus, id, request);

    public static Task<IResult> SetPolicyAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        OutboundLinkWriteRequest request)
        => Execute(service, context, OutboundLinkWriteActions.SetPolicy, null, request);

    public static Task<IResult> CreateScanRunAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        OutboundLinkWriteRequest request)
        => Execute(service, context, OutboundLinkWriteActions.CreateScanRun, null, request);

    public static Task<IResult> BulkActionAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        OutboundLinkWriteRequest request)
    {
        var action = request.Target.InstanceStatus is not null || request.Target.PageId is not null
            ? OutboundLinkWriteActions.BulkPageInstanceUpdate
            : string.Equals(request.Target.Status, "pending_review", StringComparison.OrdinalIgnoreCase)
                ? OutboundLinkWriteActions.BulkDomainRequireReview
                : OutboundLinkWriteActions.BulkDomainDisable;
        return Execute(service, context, action, null, request);
    }

    public static Task<IResult> ReviewDecisionAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        OutboundLinkWriteRequest request)
    {
        var action = (request.Target.Status ?? PayloadValue(request, "decision") ?? "approve").Trim().ToLowerInvariant() switch
        {
            "block" or "blocked" or "domain_blocked" => OutboundLinkWriteActions.BlockReviewDecision,
            "ignore" or "ignored" => OutboundLinkWriteActions.IgnoreReviewDecision,
            _ => OutboundLinkWriteActions.ApproveReviewDecision
        };
        return Execute(service, context, action, null, request);
    }

    public static Task<IResult> RestoreStatusAsync(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        string id,
        OutboundLinkWriteRequest request)
        => Execute(service, context, OutboundLinkWriteActions.RestorePriorStatus, id, request);

    private static async Task<IResult> Execute(
        IOutboundLinkWriteActionService service,
        HttpContext context,
        string action,
        string? routeId,
        OutboundLinkWriteRequest request)
    {
        var actor = OutboundLinkWriteActor.From(context, request);
        var response = await service.ExecuteAsync(action, routeId, request, actor, context.RequestAborted);
        return Results.Json(response, statusCode: response.Status);
    }

    private static string? PayloadValue(OutboundLinkWriteRequest request, string key)
        => request.Payload is not null
            && request.Payload.TryGetValue(key, out var value)
            && value.ValueKind == System.Text.Json.JsonValueKind.String
                ? value.GetString()
                : null;
}
