namespace pumpkin_api.Services;

public static class OutboundLinkReadOnlyEndpoints
{
    public static IServiceCollection AddOutboundLinkReadOnlyFoundation(this IServiceCollection services)
    {
        services.AddSingleton<IOutboundLinkReadOnlyProvider, FakeOutboundLinkReadOnlyProvider>();
        services.AddSingleton<IOutboundLinkAuthorizationService, OutboundLinkAuthorizationService>();
        services.AddSingleton<IOutboundLinkReadOnlyService, OutboundLinkReadOnlyService>();
        return services;
    }

    public static IEndpointRouteBuilder MapOutboundLinkReadOnlyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin")
            .RequireAuthorization()
            .WithTags("Admin - Outbound Links");

        group.MapGet("/outbound-links", ListLinksAsync)
            .WithName("ListOutboundLinks")
            .WithSummary("List outbound links")
            .WithDescription("Read-only Outbound Link Manager endpoint. Supports local/fake and staging-backed read-only provider metadata. No CMS writes, external crawling, or protected config reads.");

        group.MapGet("/outbound-links/{id}", GetLinkAsync)
            .WithName("GetOutboundLink")
            .WithSummary("Get outbound link detail")
            .WithDescription("Read-only Outbound Link Manager detail endpoint.");

        group.MapGet("/outbound-links/{id}/instances", ListLinkInstancesAsync)
            .WithName("ListOutboundLinkInstancesForLink")
            .WithSummary("List outbound link instances for one link")
            .WithDescription("Read-only Outbound Link Manager instance endpoint.");

        group.MapGet("/outbound-link-instances", ListInstancesAsync)
            .WithName("ListOutboundLinkInstances")
            .WithSummary("List outbound link instances")
            .WithDescription("Read-only Outbound Link Manager instance search endpoint.");

        group.MapGet("/outbound-link-policies", ListPoliciesAsync)
            .WithName("ListOutboundLinkPolicies")
            .WithSummary("List outbound link policies")
            .WithDescription("Read-only Outbound Link Manager policy endpoint.");

        group.MapGet("/outbound-link-scan-runs", ListScanRunsAsync)
            .WithName("ListOutboundLinkScanRuns")
            .WithSummary("List outbound link scan runs")
            .WithDescription("Read-only Outbound Link Manager scan-run endpoint.");

        group.MapGet("/outbound-link-audit", ListAuditLogsAsync)
            .WithName("ListOutboundLinkAudit")
            .WithSummary("List outbound link audit logs")
            .WithDescription("Read-only Outbound Link Manager audit endpoint.");

        group.MapGet("/outbound-link-dashboard-summary", GetDashboardSummaryAsync)
            .WithName("GetOutboundLinkDashboardSummary")
            .WithSummary("Get outbound link dashboard summary")
            .WithDescription("Read-only Outbound Link Manager dashboard summary endpoint.");

        group.MapGet("/outbound-link-operator-readiness", GetOperatorReadinessAsync)
            .WithName("GetOutboundLinkOperatorReadiness")
            .WithSummary("Get outbound link operator console readiness")
            .WithDescription("GET-only Outbound Link Manager operator-console readiness metadata. Reports Runtime QA, Resource Registry, Backup Center, provider profile, and write-action guard state without provider writes, CMS writes, external crawling, or protected config reads.");

        return app;
    }

    public static async Task<IResult> ListLinksAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListLinksAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> GetLinkAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        string id,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.GetLinkAsync(id, query, context.RequestAborted));
    }

    public static async Task<IResult> ListLinkInstancesAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        string id,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListInstancesAsync(id, query, context.RequestAborted));
    }

    public static async Task<IResult> ListInstancesAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListInstancesAsync(null, query, context.RequestAborted));
    }

    public static async Task<IResult> ListPoliciesAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListPoliciesAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListScanRunsAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListScanRunsAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> ListAuditLogsAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.ListAuditLogsAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> GetDashboardSummaryAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.GetDashboardSummaryAsync(query, context.RequestAborted));
    }

    public static async Task<IResult> GetOperatorReadinessAsync(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        [AsParameters] OutboundLinkApiQuery query)
    {
        var authError = Authorize<object>(authorization, context, query);
        if (authError is not null)
        {
            return ToResult(authError);
        }

        return ToResult(await service.GetOperatorReadinessAsync(query, context.RequestAborted));
    }

    private static OutboundLinkApiEnvelope<T>? Authorize<T>(
        IOutboundLinkAuthorizationService authorization,
        HttpContext context,
        OutboundLinkApiQuery query)
    {
        var tenantKey = NormalizeKey(query.TenantKey);
        var siteKey = NormalizeKey(query.SiteKey);
        if (string.IsNullOrWhiteSpace(tenantKey) || string.IsNullOrWhiteSpace(siteKey))
        {
            return OutboundLinkApiEnvelope<T>.Error(
                OutboundLinkApiErrorCodes.InvalidFilter,
                StatusCodes.Status400BadRequest,
                "tenantKey and siteKey are required.",
                tenantKey,
                siteKey);
        }

        var auth = authorization.AuthorizeRead(OutboundLinkLocalActor.FromClaims(context.User), tenantKey, siteKey);
        if (auth is null)
        {
            return null;
        }

        return OutboundLinkApiEnvelope<T>.Error(
            auth.Code,
            auth.Status,
            auth.Message,
            auth.TenantKey,
            auth.SiteKey,
            auth.Errors,
            auth.Meta);
    }

    private static IResult ToResult<T>(OutboundLinkApiEnvelope<T> envelope) => Results.Json(envelope, statusCode: envelope.Status);

    private static string NormalizeKey(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();
}
