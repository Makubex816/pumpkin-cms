namespace pumpkin_api.Services;

public static class AuditJobReadOnlyEndpoints
{
    public static IServiceCollection AddAuditJobReadOnlyFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IAuditJobReadOnlyProvider, FixtureAuditJobReadOnlyProvider>();
        services.AddSingleton<IAuditJobAuthorizationService, AuditJobAuthorizationService>();
        services.AddSingleton<IAuditJobReadOnlyService, AuditJobReadOnlyService>();
        return services;
    }

    public static IEndpointRouteBuilder MapAuditJobReadOnlyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/audit-jobs")
            .RequireAuthorization()
            .WithTags("Admin - Audit Jobs");

        group.MapGet("/viewer-summary", GetViewerSummaryAsync)
            .WithName("GetAuditJobViewerSummary")
            .WithSummary("Get Audit Jobs viewer summary")
            .WithDescription("GET-only Audit Jobs read-only endpoint backed by the local validated fixture. No provider writes, CMS writes, deployment, indexing, contact-form action, Azure mutation, external crawling, or protected config reads.");

        group.MapGet("/events", ListEventsAsync)
            .WithName("ListAuditJobEvents")
            .WithSummary("List Audit Jobs events")
            .WithDescription("GET-only Audit Jobs event list from the local read-only fixture.");

        group.MapGet("/job-runs", ListJobRunsAsync)
            .WithName("ListAuditJobRuns")
            .WithSummary("List Audit Jobs job runs")
            .WithDescription("GET-only Audit Jobs job-run list from the local read-only fixture.");

        group.MapGet("/promotion-gates", ListPromotionGatesAsync)
            .WithName("ListAuditJobPromotionGates")
            .WithSummary("List Audit Jobs promotion gates")
            .WithDescription("GET-only Audit Jobs promotion-gate list from the local read-only fixture.");

        group.MapGet("/evidence-bindings", ListEvidenceBindingsAsync)
            .WithName("ListAuditJobEvidenceBindings")
            .WithSummary("List Audit Jobs evidence bindings")
            .WithDescription("GET-only Audit Jobs evidence-binding list from the local read-only fixture.");

        group.MapGet("/traces", ListTracesAsync)
            .WithName("ListAuditJobTraces")
            .WithSummary("List Audit Jobs trace entries")
            .WithDescription("GET-only Audit Jobs trace explorer entries from the local read-only fixture.");

        group.MapGet("/blockers", ListBlockersAsync)
            .WithName("ListAuditJobBlockers")
            .WithSummary("List Audit Jobs blockers")
            .WithDescription("GET-only Audit Jobs blocker list from the local read-only fixture.");

        group.MapGet("/next-gates", ListNextGatesAsync)
            .WithName("ListAuditJobNextGates")
            .WithSummary("List Audit Jobs next gates")
            .WithDescription("GET-only Audit Jobs future-gated next actions from the local read-only fixture.");

        return app;
    }

    public static async Task<IResult> GetViewerSummaryAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<AuditJobViewerSummaryDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.GetViewerSummaryAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListEventsAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<AuditEventListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListEventsAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListJobRunsAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<JobRunListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListJobRunsAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListPromotionGatesAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<PromotionGateListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListPromotionGatesAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListEvidenceBindingsAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<EvidenceBindingListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListEvidenceBindingsAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListTracesAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<TraceEntryListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListTracesAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListBlockersAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<AuditJobBlockerListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListBlockersAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListNextGatesAsync(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        [AsParameters] AuditJobApiQuery query)
    {
        var authError = Authorize<AuditJobNextGateListDto>(authorization, context, query);
        return authError is not null
            ? ToResult(authError)
            : ToResult(await service.ListNextGatesAsync(query, context.RequestAborted));
    }

    private static ReadOnlyApiEnvelopeDto<T>? Authorize<T>(
        IAuditJobAuthorizationService authorization,
        HttpContext context,
        AuditJobApiQuery query)
    {
        var tenantKey = NormalizeKey(query.TenantKey);
        var siteKey = NormalizeKey(query.SiteKey);
        if (string.IsNullOrWhiteSpace(tenantKey) || string.IsNullOrWhiteSpace(siteKey))
        {
            return ReadOnlyApiEnvelopeDto<T>.Error(
                AuditJobApiErrorCodes.ScopeRequired,
                StatusCodes.Status400BadRequest,
                "tenantKey and siteKey are required.",
                tenantKey,
                siteKey);
        }

        var auth = authorization.AuthorizeRead(AuditJobLocalActor.FromClaims(context.User), tenantKey, siteKey);
        return auth?.ToEnvelope<T>();
    }

    private static IResult ToResult<T>(ReadOnlyApiEnvelopeDto<T> envelope) => Results.Json(envelope, statusCode: envelope.Status);

    private static string NormalizeKey(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();
}
