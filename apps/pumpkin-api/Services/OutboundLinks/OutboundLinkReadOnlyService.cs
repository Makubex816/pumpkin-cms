namespace pumpkin_api.Services;

public interface IOutboundLinkReadOnlyService
{
    Task<OutboundLinkApiEnvelope<OutboundLinkListResponse>> ListLinksAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkDetailResponse>> GetLinkAsync(string id, OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkInstanceListResponse>> ListInstancesAsync(string? linkId, OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkPolicyListResponse>> ListPoliciesAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkScanRunListResponse>> ListScanRunsAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkAuditLogListResponse>> ListAuditLogsAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkDashboardSummaryResponse>> GetDashboardSummaryAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
    Task<OutboundLinkApiEnvelope<OutboundLinkOperatorReadinessResponse>> GetOperatorReadinessAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default);
}

public sealed class OutboundLinkReadOnlyService(IOutboundLinkReadOnlyProvider provider) : IOutboundLinkReadOnlyService
{
    private static readonly HashSet<string> AllowedSorts = new(StringComparer.OrdinalIgnoreCase)
    {
        "domain",
        "normalizedUrl",
        "status",
        "firstDetectedAt",
        "lastDetectedAt",
        "instanceCount"
    };

    public async Task<OutboundLinkApiEnvelope<OutboundLinkListResponse>> ListLinksAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkListResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkListResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var links = snapshot.Links
            .Select(link => ToLinkDto(link, snapshot.Instances))
            .Where(link => MatchesLink(link, snapshot.Instances, normalized))
            .ToList();
        var sorted = SortLinks(links, normalized.Sort).ToList();
        var paged = Page(sorted, normalized.Page, normalized.PageSize);
        return OutboundLinkApiEnvelope<OutboundLinkListResponse>.Success(
            new OutboundLinkListResponse(paged.Items),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, paged.PageInfo, snapshot.Provider),
            $"Outbound links listed from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkDetailResponse>> GetLinkAsync(string id, OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkDetailResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkDetailResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var link = snapshot.Links.FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));
        if (link is null)
        {
            return OutboundLinkApiEnvelope<OutboundLinkDetailResponse>.Error(
                OutboundLinkApiErrorCodes.LinkNotFound,
                StatusCodes.Status404NotFound,
                "Outbound link was not found.",
                normalized.TenantKey,
                normalized.SiteKey);
        }

        var instances = snapshot.Instances
            .Where(instance => instance.OutboundLinkId == link.Id)
            .Select(instance => ToInstanceDto(instance, link))
            .ToList();
        var policy = snapshot.Policies.FirstOrDefault(item => item.Id == snapshot.ActivePolicyId);
        return OutboundLinkApiEnvelope<OutboundLinkDetailResponse>.Success(
            new OutboundLinkDetailResponse(ToLinkDto(link, snapshot.Instances), instances, policy is null ? null : ToPolicyDto(policy)),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, SinglePage(), snapshot.Provider),
            $"Outbound link detail read from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkInstanceListResponse>> ListInstancesAsync(string? linkId, OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkInstanceListResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkInstanceListResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var linksById = snapshot.Links.ToDictionary(link => link.Id, StringComparer.OrdinalIgnoreCase);
        var records = snapshot.Instances.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(linkId))
        {
            records = records.Where(instance => string.Equals(instance.OutboundLinkId, linkId, StringComparison.OrdinalIgnoreCase));
        }

        var instances = records
            .Where(instance => MatchesInstance(instance, linksById.GetValueOrDefault(instance.OutboundLinkId), normalized))
            .Select(instance => ToInstanceDto(instance, linksById.GetValueOrDefault(instance.OutboundLinkId)))
            .OrderBy(instance => instance.Domain)
            .ThenBy(instance => instance.LocationPath)
            .ToList();
        var paged = Page(instances, normalized.Page, normalized.PageSize);
        return OutboundLinkApiEnvelope<OutboundLinkInstanceListResponse>.Success(
            new OutboundLinkInstanceListResponse(paged.Items),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, paged.PageInfo, snapshot.Provider),
            $"Outbound link instances listed from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkPolicyListResponse>> ListPoliciesAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkPolicyListResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkPolicyListResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        return OutboundLinkApiEnvelope<OutboundLinkPolicyListResponse>.Success(
            new OutboundLinkPolicyListResponse(snapshot.ActivePolicyId, snapshot.Policies.Select(ToPolicyDto).ToList()),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, SinglePage(snapshot.Policies.Count), snapshot.Provider),
            $"Outbound link policies listed from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkScanRunListResponse>> ListScanRunsAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkScanRunListResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkScanRunListResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var scanRuns = snapshot.ScanRuns.OrderByDescending(item => item.StartedAt).Select(ToScanRunDto).ToList();
        var paged = Page(scanRuns, normalized.Page, normalized.PageSize);
        return OutboundLinkApiEnvelope<OutboundLinkScanRunListResponse>.Success(
            new OutboundLinkScanRunListResponse(paged.Items),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, paged.PageInfo, snapshot.Provider),
            $"Outbound link scan runs listed from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkAuditLogListResponse>> ListAuditLogsAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkAuditLogListResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkAuditLogListResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var auditLogs = snapshot.AuditLogs.OrderByDescending(item => item.CreatedAt).Select(ToAuditLogDto).ToList();
        var paged = Page(auditLogs, normalized.Page, normalized.PageSize);
        return OutboundLinkApiEnvelope<OutboundLinkAuditLogListResponse>.Success(
            new OutboundLinkAuditLogListResponse(paged.Items),
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, paged.PageInfo, snapshot.Provider),
            $"Outbound link audit logs listed from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkDashboardSummaryResponse>> GetDashboardSummaryAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkDashboardSummaryResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkDashboardSummaryResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var domains = snapshot.Links.Select(link => link.Domain).Distinct(StringComparer.OrdinalIgnoreCase).Order().ToList();
        var response = new OutboundLinkDashboardSummaryResponse(
            snapshot.Links.Count,
            snapshot.Instances.Count,
            snapshot.Policies.Count,
            snapshot.ScanRuns.Count,
            snapshot.AuditLogs.Count,
            domains.Count,
            domains,
            CountBy(snapshot.Links, link => link.Status),
            CountBy(snapshot.Instances, instance => instance.Status),
            snapshot.Links.Count(link => link.Status == "pending_review"),
            snapshot.Links.Count(link => link.Status == "disabled"),
            snapshot.Links.Count(link => link.Status == "domain_blocked"),
            snapshot.Instances.Count(instance => instance.Status == "stale"));
        return OutboundLinkApiEnvelope<OutboundLinkDashboardSummaryResponse>.Success(
            response,
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, SinglePage(), snapshot.Provider),
            $"Outbound link dashboard summary read from {snapshot.Provider.Mode}.");
    }

    public async Task<OutboundLinkApiEnvelope<OutboundLinkOperatorReadinessResponse>> GetOperatorReadinessAsync(OutboundLinkApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<OutboundLinkOperatorReadinessResponse>(normalized.Error, normalized.TenantKey, normalized.SiteKey);
        }

        var snapshot = await provider.GetSnapshotAsync(normalized.TenantKey, normalized.SiteKey, cancellationToken);
        if (snapshot is null)
        {
            return ProviderNotConfigured<OutboundLinkOperatorReadinessResponse>(normalized.TenantKey, normalized.SiteKey);
        }

        var response = BuildOperatorReadiness(snapshot);
        return OutboundLinkApiEnvelope<OutboundLinkOperatorReadinessResponse>.Success(
            response,
            normalized.TenantKey,
            normalized.SiteKey,
            Meta(normalized, SinglePage(response.Items.Count), snapshot.Provider),
            $"Outbound link operator readiness read from {snapshot.Provider.Mode} without write actions.");
    }

    private static NormalizedQueryResult NormalizeQuery(OutboundLinkApiQuery query)
    {
        var tenantKey = NormalizeKey(query.TenantKey);
        var siteKey = NormalizeKey(query.SiteKey);
        if (string.IsNullOrWhiteSpace(tenantKey) || string.IsNullOrWhiteSpace(siteKey))
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                OutboundLinkApiErrorCodes.InvalidFilter,
                StatusCodes.Status400BadRequest,
                "tenantKey and siteKey are required.");
        }

        var page = query.Page ?? 1;
        var pageSize = query.PageSize ?? 25;
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                OutboundLinkApiErrorCodes.InvalidPagination,
                StatusCodes.Status400BadRequest,
                "page must be positive and pageSize must be between 1 and 100.");
        }

        var sortField = string.IsNullOrWhiteSpace(query.Sort) ? "domain" : query.Sort.Trim();
        var sortDirection = string.IsNullOrWhiteSpace(query.SortDirection) ? "asc" : query.SortDirection.Trim().ToLowerInvariant();
        if (!AllowedSorts.Contains(sortField) || (sortDirection != "asc" && sortDirection != "desc"))
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                OutboundLinkApiErrorCodes.InvalidSort,
                StatusCodes.Status400BadRequest,
                "sort field or direction is invalid.");
        }

        if (!TryParseOptionalDate(query.FirstDetectedFrom, out var firstDetectedFrom)
            || !TryParseOptionalDate(query.LastDetectedTo, out var lastDetectedTo))
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                OutboundLinkApiErrorCodes.InvalidFilter,
                StatusCodes.Status400BadRequest,
                "date filters must be valid ISO date values.");
        }

        return NormalizedQueryResult.Success(new OutboundLinkNormalizedQuery(
            tenantKey,
            siteKey,
            NormalizeKeyOrNull(query.Domain),
            NormalizeKeyOrNull(query.Status),
            string.IsNullOrWhiteSpace(query.PageId) ? null : query.PageId.Trim(),
            string.IsNullOrWhiteSpace(query.AnchorText) ? null : query.AnchorText.Trim().ToLowerInvariant(),
            firstDetectedFrom,
            lastDetectedTo,
            query.ReviewRequired,
            page,
            pageSize,
            new OutboundLinkSort(sortField, sortDirection)));
    }

    private static bool MatchesLink(OutboundLinkDto link, IReadOnlyList<OutboundLinkInstanceRecord> instances, NormalizedQueryResult query)
    {
        if (query.Domain is not null && link.Domain != query.Domain)
        {
            return false;
        }

        if (query.Status is not null && !string.Equals(link.Status, query.Status, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var linkedInstances = instances.Where(instance => instance.OutboundLinkId == link.Id).ToList();
        if (query.PageId is not null && linkedInstances.All(instance => instance.PageId != query.PageId))
        {
            return false;
        }

        if (query.AnchorText is not null && linkedInstances.All(instance => !(instance.AnchorText ?? string.Empty).Contains(query.AnchorText, StringComparison.OrdinalIgnoreCase)))
        {
            return false;
        }

        if (query.FirstDetectedFrom is not null && link.FirstDetectedAt < query.FirstDetectedFrom)
        {
            return false;
        }

        if (query.LastDetectedTo is not null && link.LastDetectedAt > query.LastDetectedTo)
        {
            return false;
        }

        if (query.ReviewRequired == true && link.Status is not ("pending_review" or "domain_blocked"))
        {
            return false;
        }

        return true;
    }

    private static bool MatchesInstance(OutboundLinkInstanceRecord instance, OutboundLinkRecord? link, NormalizedQueryResult query)
    {
        if (query.Domain is not null && link?.Domain != query.Domain)
        {
            return false;
        }

        if (query.Status is not null && !string.Equals(instance.Status, query.Status, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (query.PageId is not null && instance.PageId != query.PageId)
        {
            return false;
        }

        if (query.AnchorText is not null && !(instance.AnchorText ?? string.Empty).Contains(query.AnchorText, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (query.FirstDetectedFrom is not null && instance.FirstDetectedAt < query.FirstDetectedFrom)
        {
            return false;
        }

        if (query.LastDetectedTo is not null && instance.LastDetectedAt > query.LastDetectedTo)
        {
            return false;
        }

        return true;
    }

    private static IEnumerable<OutboundLinkDto> SortLinks(IEnumerable<OutboundLinkDto> links, OutboundLinkSort sort)
    {
        Func<OutboundLinkDto, object> key = sort.Field switch
        {
            "normalizedUrl" => link => link.NormalizedUrl,
            "status" => link => link.Status,
            "firstDetectedAt" => link => link.FirstDetectedAt,
            "lastDetectedAt" => link => link.LastDetectedAt,
            "instanceCount" => link => link.InstanceCount,
            _ => link => link.Domain
        };
        return sort.Direction == "desc" ? links.OrderByDescending(key) : links.OrderBy(key);
    }

    private static OutboundLinkDto ToLinkDto(OutboundLinkRecord link, IReadOnlyList<OutboundLinkInstanceRecord> instances)
    {
        var linkedInstances = instances.Where(instance => instance.OutboundLinkId == link.Id).ToList();
        return new OutboundLinkDto(
            link.Id,
            link.TenantKey,
            link.SiteKey,
            link.OriginalUrl,
            link.NormalizedUrl,
            link.Domain,
            link.Status,
            link.CreatedAt,
            link.UpdatedAt,
            linkedInstances.Count > 0 ? linkedInstances.Min(instance => instance.FirstDetectedAt) : link.FirstDetectedAt,
            linkedInstances.Count > 0 ? linkedInstances.Max(instance => instance.LastDetectedAt) : link.LastDetectedAt,
            link.CreatedBy,
            link.DisabledBy,
            link.DisabledAt,
            link.DisabledReason,
            linkedInstances.Count,
            linkedInstances.Count(instance => instance.Status == "enabled"),
            linkedInstances.Count(instance => instance.Status == "stale"),
            linkedInstances.Count(instance => instance.Status == "pending_review"));
    }

    private static OutboundLinkInstanceDto ToInstanceDto(OutboundLinkInstanceRecord instance, OutboundLinkRecord? link) => new(
        instance.Id,
        instance.TenantKey,
        instance.SiteKey,
        instance.OutboundLinkId,
        instance.PageId,
        instance.ContentType,
        instance.ContentBlockId,
        instance.FieldName,
        instance.AnchorText,
        instance.LocationPath,
        instance.IsEnabled,
        instance.Status,
        instance.FirstDetectedAt,
        instance.LastDetectedAt,
        link?.Domain,
        link?.NormalizedUrl);

    private static OutboundLinkPolicyDto ToPolicyDto(OutboundLinkPolicyRecord policy) => new(
        policy.Id,
        policy.TenantKey,
        policy.SiteKey,
        policy.Name,
        policy.DefaultDisabledBehavior,
        policy.DefaultRel,
        policy.ExternalTargetBehavior,
        policy.AllowedDomains,
        policy.BlockedDomains,
        policy.PendingReviewDomains,
        policy.ReviewRequiredForNewDomains,
        policy.Source);

    private static OutboundLinkScanRunDto ToScanRunDto(OutboundLinkScanRunRecord scanRun) => new(
        scanRun.Id,
        scanRun.TenantKey,
        scanRun.SiteKey,
        scanRun.Status,
        scanRun.Mode,
        scanRun.StartedAt,
        scanRun.CompletedAt,
        scanRun.PagesScanned,
        scanRun.LinksFound,
        scanRun.NewLinksFound,
        scanRun.StaleInstancesFound);

    private static OutboundLinkAuditLogDto ToAuditLogDto(OutboundLinkAuditLogRecord auditLog) => new(
        auditLog.Id,
        auditLog.TenantKey,
        auditLog.SiteKey,
        auditLog.Action,
        auditLog.RecordType,
        auditLog.RecordId,
        auditLog.Actor,
        auditLog.Reason,
        auditLog.CreatedAt,
        auditLog.Mode);

    private static OutboundLinkOperatorReadinessResponse BuildOperatorReadiness(OutboundLinkStoreSnapshot snapshot)
    {
        const string runtimeQaResult = "deployment/architecture/runtime-qa/v2-6-1-operationalization-evidence-binding-result/result-manifest.json";
        const string runtimeQaUploadPrefix = "runtime-qa-staging/v2-7-2/runtime-qa-upload-operator-console-signoff";
        const string resourceRegistryResult = "deployment/architecture/resource-registry-provider-profiles/v2-5-1-operationalization-hardening-result/result-manifest.json";
        const string backupCenterResult = "deployment/architecture/pumpkin-backup-export-restore/phase-2f14-backup-generator-qa-signoff-result/manifest.json";
        const string olmStageReadyResult = "deployment/architecture/outbound-link-manager/v2-2-5-final-stage-ready-signoff-result/result-manifest.json";

        var providerProfileId = snapshot.Provider.ProviderProfileId ?? "local-fake-provider";
        var providerMode = snapshot.Provider.ProviderMode ?? snapshot.Provider.Mode;
        var providerState = snapshot.Provider.ProviderState ?? "local_fixture";
        var items = new List<OutboundLinkOperatorReadinessItemDto>
        {
            new(
                "runtime-qa-api-binding",
                "Runtime QA",
                "passed",
                "V2.7.2 binds API operator-readiness metadata to the reusable Runtime QA harness, no-write source scan, and verified Runtime QA evidence upload.",
                runtimeQaResult,
                "local-offline"),
            new(
                "runtime-qa-staging-upload",
                "runtime-qa-staging upload verified",
                "passed",
                "V2.7.2 uploaded four non-secret Runtime QA evidence files through Azure Identity/RBAC after narrow container-scoped Storage Blob RBAC.",
                runtimeQaUploadPrefix,
                "upload-verified"),
            new(
                "provider-profile",
                "Provider Profile",
                "passed",
                $"Provider profile {providerProfileId} reports {providerMode} with state {providerState}.",
                resourceRegistryResult,
                providerMode),
            new(
                "resource-registry",
                "Resource Registry",
                "passed",
                "V2.5.1 Resource Registry bindings remain the source for profile and environment-mode visibility.",
                resourceRegistryResult,
                providerProfileId),
            new(
                "backup-center",
                "Backup Center",
                "passed",
                "Backup Center proof references are visible for pre-write recovery planning; this endpoint performs no export.",
                backupCenterResult,
                "read-only-reference"),
            new(
                "olm-stage-ready",
                "OLM stage-ready",
                "passed",
                "V2.2.5 OLM stage-ready evidence remains linked to approval manifest and first scoped batch identifiers.",
                olmStageReadyResult,
                providerMode),
            new(
                "write-action-guards",
                "Write-action guards",
                "future_gated",
                "API write actions remain guarded by provider mode, reason, approval, tenant, and role checks.",
                "apps/pumpkin-api/Services/OutboundLinks/OutboundLinkWriteGuardService.cs",
                "write actions future-gated"),
            new(
                "production-runtime-gate",
                "production-runtime blocked",
                "blocked",
                "Production migration, production provider writes, deployment, indexing, and live publication are outside this phase.",
                resourceRegistryResult,
                "production-runtime blocked")
        };

        return new OutboundLinkOperatorReadinessResponse(
            "V2.7.2",
            $"Operator Console Readiness is API-bound for {snapshot.TenantKey}/{snapshot.SiteKey}; GET-only metadata reports runtime QA, provider, backup, and guard state.",
            providerProfileId,
            providerMode,
            providerState,
            "passed",
            "passed",
            "passed",
            "passed",
            "passed",
            "future_gated",
            "passed",
            "passed",
            "passed",
            "passed",
            "blocked",
            "passed",
            [
                "/dashboard/outbound-links",
                "/dashboard/outbound-links/instances",
                "/dashboard/outbound-links/policies",
                "/dashboard/outbound-links/scan-runs",
                "/dashboard/outbound-links/audit",
                "/dashboard/outbound-links/review",
                "/dashboard/outbound-links/exports"
            ],
            [
                "GET /api/admin/outbound-links",
                "GET /api/admin/outbound-links/{id}",
                "GET /api/admin/outbound-links/{id}/instances",
                "GET /api/admin/outbound-link-instances",
                "GET /api/admin/outbound-link-policies",
                "GET /api/admin/outbound-link-scan-runs",
                "GET /api/admin/outbound-link-audit",
                "GET /api/admin/outbound-link-dashboard-summary",
                "GET /api/admin/outbound-link-operator-readiness"
            ],
            [
                "production-runtime blocked",
                "live-write-approved globally inactive",
                "CMS writes blocked",
                "external crawling blocked"
            ],
            items,
            false,
            false,
            false,
            false,
            false,
            false,
            false);
    }

    private static Paged<T> Page<T>(IReadOnlyList<T> items, int page, int pageSize)
    {
        var totalItems = items.Count;
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalItems / (double)pageSize));
        var pageItems = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new Paged<T>(
            pageItems,
            new OutboundLinkPaginationMeta(
                page,
                pageSize,
                totalItems,
                totalPages,
                page < totalPages,
                page > 1));
    }

    private static OutboundLinkApiMeta Meta(
        NormalizedQueryResult query,
        OutboundLinkPaginationMeta pagination,
        OutboundLinkProviderMetadata provider) => OutboundLinkApiMeta.FromProvider(
        provider,
        pagination,
        new Dictionary<string, string?>
        {
            ["domain"] = query.Domain,
            ["status"] = query.Status,
            ["pageId"] = query.PageId,
            ["anchorText"] = query.AnchorText,
            ["firstDetectedFrom"] = query.FirstDetectedFrom?.ToString("O"),
            ["lastDetectedTo"] = query.LastDetectedTo?.ToString("O"),
            ["reviewRequired"] = query.ReviewRequired?.ToString()
        },
        query.Sort);

    private static OutboundLinkPaginationMeta SinglePage(int totalItems = 1) => new(1, Math.Max(1, totalItems), totalItems, 1, false, false);

    private static OutboundLinkApiEnvelope<T> Error<T>(NormalizedError error, string tenantKey, string siteKey) => OutboundLinkApiEnvelope<T>.Error(
        error.Code,
        error.Status,
        error.Message,
        tenantKey,
        siteKey);

    private static OutboundLinkApiEnvelope<T> ProviderNotConfigured<T>(string tenantKey, string siteKey) => OutboundLinkApiEnvelope<T>.Error(
        OutboundLinkApiErrorCodes.ProviderNotConfigured,
        StatusCodes.Status503ServiceUnavailable,
        "Outbound Link Manager read-only provider is not configured for the requested tenant/site.",
        tenantKey,
        siteKey);

    private static bool TryParseOptionalDate(string? value, out DateTimeOffset? parsed)
    {
        parsed = null;
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        if (DateTimeOffset.TryParse(value, out var result))
        {
            parsed = result;
            return true;
        }

        return false;
    }

    private static IReadOnlyDictionary<string, int> CountBy<T>(IEnumerable<T> items, Func<T, string> selector) => items
        .GroupBy(selector, StringComparer.OrdinalIgnoreCase)
        .ToDictionary(group => group.Key, group => group.Count(), StringComparer.OrdinalIgnoreCase);

    private static string NormalizeKey(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();

    private static string? NormalizeKeyOrNull(string? value)
    {
        var normalized = NormalizeKey(value);
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private sealed record Paged<T>(IReadOnlyList<T> Items, OutboundLinkPaginationMeta PageInfo);

    private sealed record NormalizedError(string Code, int Status, string Message);

    private sealed record NormalizedQueryResult(
        string TenantKey,
        string SiteKey,
        string? Domain,
        string? Status,
        string? PageId,
        string? AnchorText,
        DateTimeOffset? FirstDetectedFrom,
        DateTimeOffset? LastDetectedTo,
        bool? ReviewRequired,
        int Page,
        int PageSize,
        OutboundLinkSort Sort,
        NormalizedError? Error)
    {
        public static NormalizedQueryResult Success(OutboundLinkNormalizedQuery query) => new(
            query.TenantKey,
            query.SiteKey,
            query.Domain,
            query.Status,
            query.PageId,
            query.AnchorText,
            query.FirstDetectedFrom,
            query.LastDetectedTo,
            query.ReviewRequired,
            query.Page,
            query.PageSize,
            query.Sort,
            null);

        public static NormalizedQueryResult Failed(string tenantKey, string siteKey, string code, int status, string message) => new(
            tenantKey,
            siteKey,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            1,
            25,
            new OutboundLinkSort("domain", "asc"),
            new NormalizedError(code, status, message));
    }
}
