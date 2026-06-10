namespace pumpkin_api.Services;

public interface IOutboundLinkWriteProvider
{
    Task<OutboundLinkWriteMutationResult?> ApplyAsync(string action, string? routeId, OutboundLinkWriteRequest request, OutboundLinkWriteActor actor, CancellationToken cancellationToken = default);
}

public sealed record OutboundLinkWriteMutationResult(
    string? OutboundLinkId,
    string? OutboundLinkInstanceId,
    string? PolicyId,
    string? PolicyVersion,
    string? ScanRunId,
    string? ReviewDecisionId,
    string? BulkActionId,
    string? AffectedDomain,
    string? NormalizedUrl,
    IReadOnlyList<string> AffectedPageIds,
    IReadOnlyList<string> AffectedInstanceIds,
    object BeforeState,
    object AfterState,
    IReadOnlyList<OutboundLinkRollbackChange> Changes);

public sealed class OutboundLinkWriteFakeProvider(IOutboundLinkWriteTraceLogger traceLogger) : IOutboundLinkWriteProvider
{
    private readonly object _lock = new();
    private readonly List<MutableLink> _links = BuildLinks();
    private readonly List<MutableInstance> _instances = BuildInstances();
    private readonly List<MutablePolicy> _policies = [BuildPolicy()];
    private readonly List<OutboundLinkScanRunRecord> _scanRuns = [];

    public Task<OutboundLinkWriteMutationResult?> ApplyAsync(string action, string? routeId, OutboundLinkWriteRequest request, OutboundLinkWriteActor actor, CancellationToken cancellationToken = default)
    {
        lock (_lock)
        {
            var before = Snapshot();
            var result = action switch
            {
                OutboundLinkWriteActions.ApproveReviewDecision => ApplyReview(request, "active", "approved"),
                OutboundLinkWriteActions.BlockReviewDecision => ApplyReview(request, "domain_blocked", "blocked"),
                OutboundLinkWriteActions.IgnoreReviewDecision => ApplyReview(request, "pending_review", "ignored"),
                OutboundLinkWriteActions.SetLinkStatus => ApplyLinkStatus(routeId, request, request.Target.Status ?? "disabled", actor),
                OutboundLinkWriteActions.RestorePriorStatus => ApplyLinkStatus(routeId, request, PayloadString(request, "priorStatus") ?? request.Target.Status ?? "active", actor),
                OutboundLinkWriteActions.SetInstanceStatus => ApplyInstanceStatus(routeId, request, request.Target.InstanceStatus ?? request.Target.Status ?? "plain_text"),
                OutboundLinkWriteActions.SetPolicy => ApplyPolicy(request),
                OutboundLinkWriteActions.CreateScanRun => ApplyScanRun(request),
                OutboundLinkWriteActions.BulkDomainDisable => ApplyBulkDomain(request, "disabled", "plain_text"),
                OutboundLinkWriteActions.BulkDomainRequireReview => ApplyBulkDomain(request, "pending_review", "pending_review"),
                OutboundLinkWriteActions.BulkPageInstanceUpdate => ApplyBulkPageInstances(request),
                _ => null
            };

            if (result is null)
            {
                return Task.FromResult<OutboundLinkWriteMutationResult?>(null);
            }

            var after = Snapshot();
            var changes = new List<OutboundLinkRollbackChange>
            {
                new("outbound_link_write_snapshot", result.OutboundLinkId ?? result.OutboundLinkInstanceId ?? result.PolicyId ?? result.ScanRunId ?? result.BulkActionId ?? "unknown", traceLogger.HashState(before), traceLogger.HashState(after))
            };

            return Task.FromResult<OutboundLinkWriteMutationResult?>(result with
            {
                BeforeState = before,
                AfterState = after,
                Changes = changes
            });
        }
    }

    private OutboundLinkWriteMutationResult? ApplyReview(OutboundLinkWriteRequest request, string status, string decision)
    {
        var link = SelectLink(request);
        if (link is null) return null;
        link.Status = status;
        link.UpdatedAt = requestTime(request);
        var affectedInstances = InstancesForLink(link.Id);
        return Result(
            outboundLinkId: link.Id,
            reviewDecisionId: $"olrd_{ShortId(request.ActionId ?? decision)}",
            domain: link.Domain,
            normalizedUrl: link.NormalizedUrl,
            instances: affectedInstances);
    }

    private OutboundLinkWriteMutationResult? ApplyLinkStatus(string? routeId, OutboundLinkWriteRequest request, string status, OutboundLinkWriteActor actor)
    {
        var link = SelectLink(request, routeId);
        if (link is null) return null;
        link.Status = status;
        link.UpdatedAt = requestTime(request);
        if (status == "disabled")
        {
            link.DisabledAt = requestTime(request);
            link.DisabledBy = actor.ActorId;
            link.DisabledReason = request.Reason;
        }
        var affectedInstances = InstancesForLink(link.Id);
        return Result(link.Id, null, null, null, null, null, null, link.Domain, link.NormalizedUrl, affectedInstances);
    }

    private OutboundLinkWriteMutationResult? ApplyInstanceStatus(string? routeId, OutboundLinkWriteRequest request, string status)
    {
        var instance = SelectInstance(request, routeId);
        if (instance is null) return null;
        instance.Status = status;
        instance.IsEnabled = status == "enabled";
        var link = _links.SingleOrDefault(item => item.Id == instance.OutboundLinkId);
        return Result(link?.Id, instance.Id, null, null, null, null, null, link?.Domain, link?.NormalizedUrl, [instance]);
    }

    private OutboundLinkWriteMutationResult ApplyPolicy(OutboundLinkWriteRequest request)
    {
        var policyId = PayloadString(request, "policyId") ?? $"policy_{ShortId(request.ActionId ?? "policy")}";
        var policy = new MutablePolicy(policyId, request.TenantKey ?? "fixture-tenant", request.SiteKey ?? "fixture-site", requestTime(request));
        _policies.RemoveAll(item => item.Id == policy.Id);
        _policies.Add(policy);
        return Result(null, null, policy.Id, "1", null, null, null, null, null, []);
    }

    private OutboundLinkWriteMutationResult ApplyScanRun(OutboundLinkWriteRequest request)
    {
        var scanRunId = $"olsr_{ShortId(request.ActionId ?? "scan")}";
        _scanRuns.Add(new OutboundLinkScanRunRecord(scanRunId, request.TenantKey ?? "fixture-tenant", request.SiteKey ?? "fixture-site", "simulated_local_only", "local-api-fake-provider", requestTime(request), requestTime(request), 0, _links.Count, 0, 0));
        return Result(null, null, null, null, scanRunId, null, null, null, null, _instances);
    }

    private OutboundLinkWriteMutationResult ApplyBulkDomain(OutboundLinkWriteRequest request, string linkStatus, string instanceStatus)
    {
        var domain = (request.Target.Domain ?? string.Empty).Trim().ToLowerInvariant();
        var links = _links.Where(item => item.Domain == domain).ToList();
        var linkIds = links.Select(item => item.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var instances = _instances.Where(item => linkIds.Contains(item.OutboundLinkId)).ToList();
        foreach (var link in links)
        {
            link.Status = linkStatus;
            link.UpdatedAt = requestTime(request);
        }
        foreach (var instance in instances)
        {
            instance.Status = instanceStatus;
            instance.IsEnabled = instanceStatus == "enabled";
        }
        return Result(null, null, null, null, null, null, $"olba_{ShortId(request.ActionId ?? "bulk")}", domain, null, instances, links.Select(item => item.Id).ToList());
    }

    private OutboundLinkWriteMutationResult ApplyBulkPageInstances(OutboundLinkWriteRequest request)
    {
        var pageId = request.Target.PageId;
        var status = request.Target.InstanceStatus ?? request.Target.Status ?? "plain_text";
        var instances = _instances.Where(item => item.PageId == pageId).ToList();
        foreach (var instance in instances)
        {
            instance.Status = status;
            instance.IsEnabled = status == "enabled";
        }
        return Result(null, null, null, null, null, null, $"olba_{ShortId(request.ActionId ?? "bulkpage")}", null, null, instances);
    }

    private OutboundLinkWriteMutationResult Result(
        string? outboundLinkId = null,
        string? outboundLinkInstanceId = null,
        string? policyId = null,
        string? policyVersion = null,
        string? scanRunId = null,
        string? reviewDecisionId = null,
        string? bulkActionId = null,
        string? domain = null,
        string? normalizedUrl = null,
        IReadOnlyList<MutableInstance>? instances = null,
        IReadOnlyList<string>? affectedLinkIds = null)
    {
        instances ??= [];
        return new OutboundLinkWriteMutationResult(
            outboundLinkId ?? affectedLinkIds?.FirstOrDefault(),
            outboundLinkInstanceId ?? instances.FirstOrDefault()?.Id,
            policyId,
            policyVersion,
            scanRunId,
            reviewDecisionId,
            bulkActionId,
            domain,
            normalizedUrl,
            instances.Select(item => item.PageId).Where(value => !string.IsNullOrWhiteSpace(value)).Distinct().Cast<string>().ToList(),
            instances.Select(item => item.Id).Distinct().ToList(),
            new { },
            new { },
            []);
    }

    private MutableLink? SelectLink(OutboundLinkWriteRequest request, string? routeId = null)
    {
        var linkId = routeId ?? request.Target.LinkId;
        if (!string.IsNullOrWhiteSpace(linkId))
        {
            return _links.FirstOrDefault(item => item.Id.Equals(linkId, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(request.Target.Domain))
        {
            return _links.FirstOrDefault(item => item.Domain.Equals(request.Target.Domain.Trim(), StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(request.Target.NormalizedUrl))
        {
            return _links.FirstOrDefault(item => item.NormalizedUrl.Equals(request.Target.NormalizedUrl.Trim(), StringComparison.OrdinalIgnoreCase));
        }
        return null;
    }

    private MutableInstance? SelectInstance(OutboundLinkWriteRequest request, string? routeId = null)
    {
        var instanceId = routeId ?? request.Target.InstanceId;
        if (!string.IsNullOrWhiteSpace(instanceId))
        {
            return _instances.FirstOrDefault(item => item.Id.Equals(instanceId, StringComparison.OrdinalIgnoreCase));
        }
        var link = SelectLink(request);
        return link is null ? null : _instances.FirstOrDefault(item => item.OutboundLinkId == link.Id);
    }

    private IReadOnlyList<MutableInstance> InstancesForLink(string linkId)
        => _instances.Where(item => item.OutboundLinkId == linkId).ToList();

    private object Snapshot() => new
    {
        links = _links.Select(item => new { item.Id, item.Domain, item.NormalizedUrl, item.Status, item.DisabledBy, item.DisabledAt, item.DisabledReason }).ToList(),
        instances = _instances.Select(item => new { item.Id, item.OutboundLinkId, item.PageId, item.Status, item.IsEnabled }).ToList(),
        policies = _policies.Select(item => new { item.Id, item.UpdatedAt }).ToList(),
        scanRuns = _scanRuns.Select(item => item.Id).ToList()
    };

    private static List<MutableLink> BuildLinks()
    {
        var now = DateTimeOffset.Parse("2026-06-10T00:00:00.000Z");
        return
        [
            new("ol_docs_help", "https://docs.example/help", "docs.example", "active", now),
            new("ol_example_home_cta", "https://example.com/home-cta", "example.com", "active", now),
            new("ol_example_social", "https://example.com/social", "example.com", "active", now),
            new("ol_example_theme", "https://example.com/theme-reference", "example.com", "active", now),
            new("ol_partner_vendors", "https://partner.example/vendors", "partner.example", "pending_review", now)
        ];
    }

    private static List<MutableInstance> BuildInstances()
    {
        var now = DateTimeOffset.Parse("2026-06-10T00:00:00.000Z");
        return
        [
            new("oli_home_hero_cta", "ol_example_home_cta", "home", "enabled", true, now),
            new("oli_home_partner", "ol_partner_vendors", "home", "pending_review", false, now),
            new("oli_nav_docs", "ol_docs_help", null, "enabled", true, now),
            new("oli_footer_example", "ol_example_social", null, "enabled", true, now),
            new("oli_theme_reference", "ol_example_theme", null, "enabled", true, now)
        ];
    }

    private static MutablePolicy BuildPolicy()
        => new("policy_test_default", "fixture-tenant", "fixture-site", DateTimeOffset.Parse("2026-06-10T00:00:00.000Z"));

    private static DateTimeOffset requestTime(OutboundLinkWriteRequest request)
        => DateTimeOffset.UtcNow;

    private static string? PayloadString(OutboundLinkWriteRequest request, string key)
        => request.Payload is not null
            && request.Payload.TryGetValue(key, out var value)
            && value.ValueKind == System.Text.Json.JsonValueKind.String
                ? value.GetString()
                : null;

    private static string ShortId(string value)
        => Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value))).ToLowerInvariant()[..12];

    private sealed class MutableLink(string id, string normalizedUrl, string domain, string status, DateTimeOffset updatedAt)
    {
        public string Id { get; } = id;
        public string NormalizedUrl { get; } = normalizedUrl;
        public string Domain { get; } = domain;
        public string Status { get; set; } = status;
        public DateTimeOffset UpdatedAt { get; set; } = updatedAt;
        public string? DisabledBy { get; set; }
        public DateTimeOffset? DisabledAt { get; set; }
        public string? DisabledReason { get; set; }
    }

    private sealed class MutableInstance(string id, string outboundLinkId, string? pageId, string status, bool isEnabled, DateTimeOffset updatedAt)
    {
        public string Id { get; } = id;
        public string OutboundLinkId { get; } = outboundLinkId;
        public string? PageId { get; } = pageId;
        public string Status { get; set; } = status;
        public bool IsEnabled { get; set; } = isEnabled;
        public DateTimeOffset UpdatedAt { get; set; } = updatedAt;
    }

    private sealed class MutablePolicy(string id, string tenantKey, string siteKey, DateTimeOffset updatedAt)
    {
        public string Id { get; } = id;
        public string TenantKey { get; } = tenantKey;
        public string SiteKey { get; } = siteKey;
        public DateTimeOffset UpdatedAt { get; } = updatedAt;
    }
}
