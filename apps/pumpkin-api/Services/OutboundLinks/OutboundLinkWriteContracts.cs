using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class OutboundLinkWriteProviderModes
{
    public const string LocalSimulation = "local-simulation";
    public const string FakeProvider = "fake-provider";
    public const string OfflineBundle = "offline-bundle";
    public const string LocalApiFakeProvider = "local-api-fake-provider";
    public const string LiveReadonly = "live-readonly";
    public const string LiveWriteApproved = "live-write-approved";

    public static bool IsLocalWriteMode(string? mode)
    {
        var normalized = Normalize(mode);
        return normalized is LocalSimulation or FakeProvider or OfflineBundle or LocalApiFakeProvider;
    }

    public static string Normalize(string? mode)
        => string.IsNullOrWhiteSpace(mode) ? LocalApiFakeProvider : mode.Trim().ToLowerInvariant();
}

public static class OutboundLinkWriteErrorCodes
{
    public const string WriteNotApproved = "OUTBOUND_LINK_WRITE_NOT_APPROVED";
    public const string WritePreflightOnly = "OUTBOUND_LINK_WRITE_PREFLIGHT_ONLY";
    public const string ProviderNotConfigured = "OUTBOUND_LINK_PROVIDER_NOT_CONFIGURED";
    public const string LocalSimulationOnly = "OUTBOUND_LINK_LOCAL_SIMULATION_ONLY";
    public const string ForbiddenTenant = "OUTBOUND_LINK_FORBIDDEN_TENANT";
    public const string ForbiddenRole = "OUTBOUND_LINK_FORBIDDEN_ROLE";
    public const string InvalidAction = "OUTBOUND_LINK_INVALID_ACTION";
    public const string InvalidApprovalReference = "OUTBOUND_LINK_INVALID_APPROVAL_REFERENCE";
    public const string BulkActionRequiresApproval = "OUTBOUND_LINK_BULK_ACTION_REQUIRES_APPROVAL";
    public const string LiveWriteBlocked = "OUTBOUND_LINK_LIVE_WRITE_BLOCKED";
    public const string TraceLogRequired = "OUTBOUND_LINK_TRACE_LOG_REQUIRED";
    public const string RollbackPlanRequired = "OUTBOUND_LINK_ROLLBACK_PLAN_REQUIRED";
}

public static class OutboundLinkWriteActions
{
    public const string ApproveReviewDecision = "approveReviewDecision";
    public const string BlockReviewDecision = "blockReviewDecision";
    public const string IgnoreReviewDecision = "ignoreReviewDecision";
    public const string SetLinkStatus = "setLinkStatus";
    public const string SetInstanceStatus = "setInstanceStatus";
    public const string SetPolicy = "setPolicy";
    public const string CreateScanRun = "createScanRun";
    public const string BulkDomainDisable = "bulkDomainDisable";
    public const string BulkDomainRequireReview = "bulkDomainRequireReview";
    public const string BulkPageInstanceUpdate = "bulkPageInstanceUpdate";
    public const string RestorePriorStatus = "restorePriorStatus";
}

public sealed class OutboundLinkWriteRequest
{
    public string? TenantKey { get; set; }
    public string? SiteKey { get; set; }
    public string? ProviderMode { get; set; }
    public string? Reason { get; set; }
    public string? ApprovalReference { get; set; }
    public string? RequestId { get; set; }
    public string? ActionId { get; set; }
    public string? CorrelationId { get; set; }
    public string? ActorId { get; set; }
    public string? ActorEmail { get; set; }
    public string? ActorRole { get; set; }
    public OutboundLinkWriteTarget Target { get; set; } = new();
    public Dictionary<string, JsonElement>? Payload { get; set; }
}

public sealed class OutboundLinkWriteTarget
{
    public string? LinkId { get; set; }
    public string? InstanceId { get; set; }
    public string? Domain { get; set; }
    public string? NormalizedUrl { get; set; }
    public string? LogUrl { get; set; }
    public string? PageId { get; set; }
    public string? Status { get; set; }
    public string? InstanceStatus { get; set; }
}

public sealed record OutboundLinkWriteActor(
    [property: JsonPropertyName("actorId")] string ActorId,
    [property: JsonPropertyName("actorEmail")] string? ActorEmail,
    [property: JsonPropertyName("actorRole")] string ActorRole,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("isAuthenticated")] bool IsAuthenticated)
{
    public static OutboundLinkWriteActor From(HttpContext context, OutboundLinkWriteRequest request)
    {
        var claims = context.User;
        var actorId = FirstNonEmpty(
            request.ActorId,
            claims.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            claims.FindFirst("sub")?.Value,
            "local-api-write-actor");
        var actorEmail = FirstNonEmpty(
            request.ActorEmail,
            claims.FindFirst(ClaimTypes.Email)?.Value,
            claims.FindFirst("email")?.Value);
        var actorRole = FirstNonEmpty(
            request.ActorRole,
            claims.FindFirst(ClaimTypes.Role)?.Value,
            claims.FindFirst("role")?.Value,
            "Viewer");
        var tenantKey = FirstNonEmpty(
            claims.FindFirst("tenantId")?.Value,
            request.TenantKey,
            string.Empty).Trim().ToLowerInvariant();

        return new OutboundLinkWriteActor(
            actorId.Trim(),
            string.IsNullOrWhiteSpace(actorEmail) ? null : actorEmail.Trim(),
            actorRole.Trim(),
            tenantKey,
            claims.Identity?.IsAuthenticated == true || !string.IsNullOrWhiteSpace(request.ActorId));
    }

    private static string FirstNonEmpty(params string?[] values)
        => values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;
}

public sealed record OutboundLinkPublishingImpact(
    [property: JsonPropertyName("affectedLinkCount")] int AffectedLinkCount,
    [property: JsonPropertyName("affectedInstanceCount")] int AffectedInstanceCount,
    [property: JsonPropertyName("affectedPageCount")] int AffectedPageCount,
    [property: JsonPropertyName("affectedDomainCount")] int AffectedDomainCount,
    [property: JsonPropertyName("staticRebuildMayBeNeeded")] bool StaticRebuildMayBeNeeded,
    [property: JsonPropertyName("affectedPageIds")] IReadOnlyList<string> AffectedPageIds,
    [property: JsonPropertyName("affectedInstanceIds")] IReadOnlyList<string> AffectedInstanceIds,
    [property: JsonPropertyName("domains")] IReadOnlyList<string> Domains);

public sealed record OutboundLinkAuditEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("action")] string Action,
    [property: JsonPropertyName("recordType")] string RecordType,
    [property: JsonPropertyName("recordId")] string RecordId,
    [property: JsonPropertyName("actorId")] string ActorId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("reason")] string Reason,
    [property: JsonPropertyName("createdAt")] DateTimeOffset CreatedAt);

public sealed record OutboundLinkRollbackPlan(
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("action")] string Action,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("blocked")] bool Blocked,
    [property: JsonPropertyName("executableAgainstLiveSystems")] bool ExecutableAgainstLiveSystems,
    [property: JsonPropertyName("rollbackExecutionImplemented")] bool RollbackExecutionImplemented,
    [property: JsonPropertyName("changes")] IReadOnlyList<OutboundLinkRollbackChange> Changes);

public sealed record OutboundLinkRollbackChange(
    [property: JsonPropertyName("recordType")] string RecordType,
    [property: JsonPropertyName("recordId")] string RecordId,
    [property: JsonPropertyName("previousStateHash")] string PreviousStateHash,
    [property: JsonPropertyName("newStateHash")] string NewStateHash);

public sealed record OutboundLinkWriteTrace(
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("actionId")] string ActionId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("actorId")] string ActorId,
    [property: JsonPropertyName("actorEmail")] string? ActorEmail,
    [property: JsonPropertyName("actorRole")] string ActorRole,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("approvalState")] string ApprovalState,
    [property: JsonPropertyName("approvalReference")] string? ApprovalReference,
    [property: JsonPropertyName("outboundLinkId")] string? OutboundLinkId,
    [property: JsonPropertyName("outboundLinkInstanceId")] string? OutboundLinkInstanceId,
    [property: JsonPropertyName("policyId")] string? PolicyId,
    [property: JsonPropertyName("policyVersion")] string? PolicyVersion,
    [property: JsonPropertyName("scanRunId")] string? ScanRunId,
    [property: JsonPropertyName("reviewDecisionId")] string? ReviewDecisionId,
    [property: JsonPropertyName("bulkActionId")] string? BulkActionId,
    [property: JsonPropertyName("auditEventIds")] IReadOnlyList<string> AuditEventIds,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("affectedPageIds")] IReadOnlyList<string> AffectedPageIds,
    [property: JsonPropertyName("affectedInstanceIds")] IReadOnlyList<string> AffectedInstanceIds,
    [property: JsonPropertyName("affectedDomain")] string? AffectedDomain,
    [property: JsonPropertyName("normalizedUrl")] string? NormalizedUrl,
    [property: JsonPropertyName("beforeStateHash")] string BeforeStateHash,
    [property: JsonPropertyName("afterStateHash")] string AfterStateHash,
    [property: JsonPropertyName("performedAt")] DateTimeOffset PerformedAt,
    [property: JsonPropertyName("reason")] string Reason,
    [property: JsonPropertyName("outcome")] string Outcome,
    [property: JsonPropertyName("blockReason")] string? BlockReason,
    [property: JsonPropertyName("validationResultId")] string ValidationResultId);

public sealed record OutboundLinkWriteResponse(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("actionId")] string ActionId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("actorId")] string ActorId,
    [property: JsonPropertyName("actorEmail")] string? ActorEmail,
    [property: JsonPropertyName("actorRole")] string ActorRole,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("approvalRequired")] bool ApprovalRequired,
    [property: JsonPropertyName("approvalState")] string ApprovalState,
    [property: JsonPropertyName("approvalReference")] string? ApprovalReference,
    [property: JsonPropertyName("liveWriteAllowed")] bool LiveWriteAllowed,
    [property: JsonPropertyName("simulatedOnly")] bool SimulatedOnly,
    [property: JsonPropertyName("applied")] bool Applied,
    [property: JsonPropertyName("outboundLinkId")] string? OutboundLinkId,
    [property: JsonPropertyName("outboundLinkInstanceId")] string? OutboundLinkInstanceId,
    [property: JsonPropertyName("policyId")] string? PolicyId,
    [property: JsonPropertyName("policyVersion")] string? PolicyVersion,
    [property: JsonPropertyName("scanRunId")] string? ScanRunId,
    [property: JsonPropertyName("reviewDecisionId")] string? ReviewDecisionId,
    [property: JsonPropertyName("bulkActionId")] string? BulkActionId,
    [property: JsonPropertyName("affectedPageIds")] IReadOnlyList<string> AffectedPageIds,
    [property: JsonPropertyName("affectedInstanceIds")] IReadOnlyList<string> AffectedInstanceIds,
    [property: JsonPropertyName("beforeStateHash")] string BeforeStateHash,
    [property: JsonPropertyName("afterStateHash")] string AfterStateHash,
    [property: JsonPropertyName("publishingImpact")] OutboundLinkPublishingImpact PublishingImpact,
    [property: JsonPropertyName("auditEventIds")] IReadOnlyList<string> AuditEventIds,
    [property: JsonPropertyName("auditLog")] IReadOnlyList<OutboundLinkAuditEvent> AuditLog,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("rollbackPlan")] OutboundLinkRollbackPlan RollbackPlan,
    [property: JsonPropertyName("traceLog")] OutboundLinkWriteTrace TraceLog,
    [property: JsonPropertyName("errors")] IReadOnlyList<OutboundLinkApiError> Errors,
    [property: JsonPropertyName("meta")] IReadOnlyDictionary<string, object> Meta);
