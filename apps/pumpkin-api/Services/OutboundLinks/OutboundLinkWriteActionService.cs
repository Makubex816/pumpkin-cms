namespace pumpkin_api.Services;

public interface IOutboundLinkWriteActionService
{
    Task<OutboundLinkWriteResponse> ExecuteAsync(
        string action,
        string? routeId,
        OutboundLinkWriteRequest request,
        OutboundLinkWriteActor actor,
        CancellationToken cancellationToken = default);
}

public sealed class OutboundLinkWriteActionService(
    IOutboundLinkWriteGuardService guardService,
    IOutboundLinkWriteProvider provider,
    IOutboundLinkWriteTraceLogger traceLogger) : IOutboundLinkWriteActionService
{
    public async Task<OutboundLinkWriteResponse> ExecuteAsync(
        string action,
        string? routeId,
        OutboundLinkWriteRequest request,
        OutboundLinkWriteActor actor,
        CancellationToken cancellationToken = default)
    {
        request.ProviderMode = OutboundLinkWriteProviderModes.Normalize(request.ProviderMode);
        request.RequestId = IdOrDefault(request.RequestId, "olwr");
        request.ActionId = IdOrDefault(request.ActionId, "olwa");
        request.CorrelationId = IdOrDefault(request.CorrelationId, "olwc");

        var guard = guardService.Evaluate(action, request, actor);
        if (!guard.Approved)
        {
            return Blocked(action, request, actor, guard);
        }

        var mutation = await provider.ApplyAsync(action, routeId, request, actor, cancellationToken);
        if (mutation is null)
        {
            return Blocked(action, request, actor, new OutboundLinkWriteGuardResult(
                false,
                OutboundLinkWriteErrorCodes.InvalidAction,
                "target entity was not found for scoped fake-provider write action.",
                "target not found"));
        }

        var beforeHash = traceLogger.HashState(mutation.BeforeState);
        var afterHash = traceLogger.HashState(mutation.AfterState);
        var audit = new OutboundLinkAuditEvent(
            $"ola_{ShortId($"{request.ActionId}|{action}|audit")}",
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            action,
            RecordTypeFor(action),
            mutation.OutboundLinkId ?? mutation.OutboundLinkInstanceId ?? mutation.PolicyId ?? mutation.ScanRunId ?? mutation.BulkActionId ?? "unknown",
            actor.ActorId,
            request.ProviderMode,
            request.Reason!,
            DateTimeOffset.UtcNow);
        var rollbackPlanId = $"olrp_{ShortId($"{request.ActionId}|rollback")}";
        var rollbackPlan = new OutboundLinkRollbackPlan(
            rollbackPlanId,
            action,
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            false,
            false,
            false,
            mutation.Changes);
        var impact = Impact(mutation);
        var trace = new OutboundLinkWriteTrace(
            request.RequestId,
            request.ActionId,
            request.CorrelationId,
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            actor.ActorId,
            actor.ActorEmail,
            actor.ActorRole,
            request.ProviderMode,
            "approved-local-fake",
            request.ApprovalReference,
            mutation.OutboundLinkId,
            mutation.OutboundLinkInstanceId,
            mutation.PolicyId,
            mutation.PolicyVersion,
            mutation.ScanRunId,
            mutation.ReviewDecisionId,
            mutation.BulkActionId,
            [audit.Id],
            rollbackPlanId,
            mutation.AffectedPageIds,
            mutation.AffectedInstanceIds,
            mutation.AffectedDomain,
            traceLogger.RedactUrlForLog(request.Target.LogUrl ?? request.Target.NormalizedUrl ?? mutation.NormalizedUrl),
            beforeHash,
            afterHash,
            DateTimeOffset.UtcNow,
            request.Reason!,
            "applied-local-fake",
            null,
            $"olvr_{ShortId($"{request.ActionId}|validation")}");

        return new OutboundLinkWriteResponse(
            true,
            StatusCodes.Status200OK,
            OutboundLinkApiErrorCodes.Ok,
            "Scoped local/fake Outbound Link Manager write action completed.",
            request.RequestId,
            request.ActionId,
            request.CorrelationId,
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            actor.ActorId,
            actor.ActorEmail,
            actor.ActorRole,
            request.ProviderMode,
            true,
            "approved-local-fake",
            request.ApprovalReference,
            false,
            true,
            true,
            mutation.OutboundLinkId,
            mutation.OutboundLinkInstanceId,
            mutation.PolicyId,
            mutation.PolicyVersion,
            mutation.ScanRunId,
            mutation.ReviewDecisionId,
            mutation.BulkActionId,
            mutation.AffectedPageIds,
            mutation.AffectedInstanceIds,
            beforeHash,
            afterHash,
            impact,
            [audit.Id],
            [audit],
            rollbackPlanId,
            rollbackPlan,
            trace,
            [],
            Meta(action, request.ProviderMode));
    }

    private OutboundLinkWriteResponse Blocked(
        string action,
        OutboundLinkWriteRequest request,
        OutboundLinkWriteActor actor,
        OutboundLinkWriteGuardResult guard)
    {
        var emptyState = new { action, tenantKey = Normalize(request.TenantKey), siteKey = Normalize(request.SiteKey), providerMode = request.ProviderMode };
        var stateHash = traceLogger.HashState(emptyState);
        var rollbackPlanId = $"olrp_{ShortId($"{request.ActionId}|blocked")}";
        var rollbackPlan = new OutboundLinkRollbackPlan(
            rollbackPlanId,
            action,
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            true,
            false,
            false,
            []);
        var impact = new OutboundLinkPublishingImpact(0, 0, 0, 0, false, [], [], []);
        var trace = new OutboundLinkWriteTrace(
            request.RequestId ?? IdOrDefault(null, "olwr"),
            request.ActionId ?? IdOrDefault(null, "olwa"),
            request.CorrelationId ?? IdOrDefault(null, "olwc"),
            Normalize(request.TenantKey),
            Normalize(request.SiteKey),
            actor.ActorId,
            actor.ActorEmail,
            actor.ActorRole,
            request.ProviderMode ?? OutboundLinkWriteProviderModes.LocalApiFakeProvider,
            "blocked",
            request.ApprovalReference,
            request.Target.LinkId,
            request.Target.InstanceId,
            null,
            null,
            null,
            null,
            action.StartsWith("bulk", StringComparison.OrdinalIgnoreCase) ? $"olba_{ShortId(request.ActionId ?? action)}" : null,
            [],
            rollbackPlanId,
            [],
            [],
            request.Target.Domain,
            traceLogger.RedactUrlForLog(request.Target.LogUrl ?? request.Target.NormalizedUrl),
            stateHash,
            stateHash,
            DateTimeOffset.UtcNow,
            request.Reason ?? string.Empty,
            "blocked",
            guard.BlockReason,
            $"olvr_{ShortId($"{request.ActionId}|validation")}");

        var code = guard.Code ?? OutboundLinkWriteErrorCodes.WriteNotApproved;
        return new OutboundLinkWriteResponse(
            false,
            StatusCodes.Status403Forbidden,
            code,
            guard.Message ?? "Scoped write action was blocked.",
            trace.RequestId,
            trace.ActionId,
            trace.CorrelationId,
            trace.TenantKey,
            trace.SiteKey,
            actor.ActorId,
            actor.ActorEmail,
            actor.ActorRole,
            trace.ProviderMode,
            true,
            "blocked",
            request.ApprovalReference,
            false,
            true,
            false,
            trace.OutboundLinkId,
            trace.OutboundLinkInstanceId,
            trace.PolicyId,
            trace.PolicyVersion,
            trace.ScanRunId,
            trace.ReviewDecisionId,
            trace.BulkActionId,
            trace.AffectedPageIds,
            trace.AffectedInstanceIds,
            stateHash,
            stateHash,
            impact,
            [],
            [],
            rollbackPlanId,
            rollbackPlan,
            trace,
            [new OutboundLinkApiError(code, guard.Message ?? "write action blocked", "providerMode")],
            Meta(action, trace.ProviderMode));
    }

    private static OutboundLinkPublishingImpact Impact(OutboundLinkWriteMutationResult mutation)
        => new(
            mutation.OutboundLinkId is not null || mutation.BulkActionId is not null ? Math.Max(1, mutation.AffectedInstanceIds.Count) : 0,
            mutation.AffectedInstanceIds.Count,
            mutation.AffectedPageIds.Count,
            string.IsNullOrWhiteSpace(mutation.AffectedDomain) ? 0 : 1,
            mutation.AffectedInstanceIds.Count > 0,
            mutation.AffectedPageIds,
            mutation.AffectedInstanceIds,
            string.IsNullOrWhiteSpace(mutation.AffectedDomain) ? [] : [mutation.AffectedDomain]);

    private static IReadOnlyDictionary<string, object> Meta(string action, string providerMode)
        => new Dictionary<string, object>
        {
            ["mode"] = "scoped-write-action-foundation",
            ["action"] = action,
            ["providerMode"] = providerMode,
            ["localOnly"] = true,
            ["liveProviderWrites"] = false,
            ["externalHttpCrawling"] = false,
            ["cmsApiCalls"] = false,
            ["cmsWrites"] = false,
            ["protectedConfigReads"] = false,
            ["databaseMigration"] = false
        };

    private static string IdOrDefault(string? value, string prefix)
        => string.IsNullOrWhiteSpace(value)
            ? $"{prefix}_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..Math.Min(32, $"{prefix}_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}".Length)]
            : value.Trim();

    private static string Normalize(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();

    private static string ShortId(string value)
        => Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value))).ToLowerInvariant()[..12];

    private static string RecordTypeFor(string action)
        => action switch
        {
            OutboundLinkWriteActions.SetInstanceStatus => "outbound_link_instance",
            OutboundLinkWriteActions.SetPolicy => "outbound_link_policy",
            OutboundLinkWriteActions.CreateScanRun => "outbound_link_scan_run",
            _ when action.StartsWith("bulk", StringComparison.OrdinalIgnoreCase) => "bulk_action",
            _ => "outbound_link"
        };
}
