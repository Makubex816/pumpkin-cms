using System.Text.Json;

namespace pumpkin_api.Services;

public interface IAuditJobReadOnlyService
{
    Task<ReadOnlyApiEnvelopeDto<AuditJobViewerSummaryDto>> GetViewerSummaryAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<AuditEventListDto>> ListEventsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<JobRunListDto>> ListJobRunsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<PromotionGateListDto>> ListPromotionGatesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<EvidenceBindingListDto>> ListEvidenceBindingsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<TraceEntryListDto>> ListTracesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<AuditJobBlockerListDto>> ListBlockersAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
    Task<ReadOnlyApiEnvelopeDto<AuditJobNextGateListDto>> ListNextGatesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default);
}

public sealed class AuditJobReadOnlyService(IAuditJobReadOnlyProvider provider) : IAuditJobReadOnlyService
{
    public async Task<ReadOnlyApiEnvelopeDto<AuditJobViewerSummaryDto>> GetViewerSummaryAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<AuditJobViewerSummaryDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<AuditJobViewerSummaryDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        return ReadOnlyApiEnvelopeDto<AuditJobViewerSummaryDto>.Success(
            snapshot.ViewerSummary,
            snapshot,
            Meta(snapshot, normalized, SinglePage()),
            "Audit Jobs read-only viewer summary returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<AuditEventListDto>> ListEventsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<AuditEventListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<AuditEventListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var type = normalized.EventType ?? normalized.Type;
        var items = snapshot.AuditEvents
            .Where(item => Matches(item, "type", type))
            .Where(item => Matches(item, "outcome", normalized.Outcome))
            .Where(item => MatchesSearch(item, normalized.Search))
            .ToList();
        var paged = Page(items, normalized.Page, normalized.PageSize);
        return ReadOnlyApiEnvelopeDto<AuditEventListDto>.Success(
            new AuditEventListDto(paged.Items),
            snapshot,
            Meta(snapshot, normalized, paged.PageInfo),
            "Audit Jobs audit events returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<JobRunListDto>> ListJobRunsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<JobRunListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<JobRunListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var type = normalized.JobType ?? normalized.Type;
        var items = snapshot.JobRuns
            .Where(item => Matches(item, "type", type))
            .Where(item => Matches(item, "status", normalized.Status))
            .Where(item => Matches(item, "outcome", normalized.Outcome))
            .Where(item => MatchesSearch(item, normalized.Search))
            .ToList();
        var paged = Page(items, normalized.Page, normalized.PageSize);
        return ReadOnlyApiEnvelopeDto<JobRunListDto>.Success(
            new JobRunListDto(paged.Items),
            snapshot,
            Meta(snapshot, normalized, paged.PageInfo),
            "Audit Jobs job runs returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<PromotionGateListDto>> ListPromotionGatesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<PromotionGateListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<PromotionGateListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var type = normalized.GateType ?? normalized.Type;
        var items = snapshot.PromotionGates
            .Where(item => Matches(item, "type", type))
            .Where(item => Matches(item, "state", normalized.State))
            .Where(item => Matches(item, "result", normalized.Result))
            .Where(item => MatchesSearch(item, normalized.Search))
            .ToList();
        var paged = Page(items, normalized.Page, normalized.PageSize);
        return ReadOnlyApiEnvelopeDto<PromotionGateListDto>.Success(
            new PromotionGateListDto(paged.Items),
            snapshot,
            Meta(snapshot, normalized, paged.PageInfo),
            "Audit Jobs promotion gates returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<EvidenceBindingListDto>> ListEvidenceBindingsAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<EvidenceBindingListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<EvidenceBindingListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var items = snapshot.EvidenceBindings
            .Where(item => Matches(item, "type", normalized.Type))
            .Where(item => Matches(item, "sourceRef", normalized.SourceRef))
            .Where(item => MatchesSearch(item, normalized.Search))
            .ToList();
        var paged = Page(items, normalized.Page, normalized.PageSize);
        return ReadOnlyApiEnvelopeDto<EvidenceBindingListDto>.Success(
            new EvidenceBindingListDto(paged.Items),
            snapshot,
            Meta(snapshot, normalized, paged.PageInfo),
            "Audit Jobs evidence bindings returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<TraceEntryListDto>> ListTracesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<TraceEntryListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<TraceEntryListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var items = snapshot.TraceEntries
            .Where(item => Matches(item, "field", normalized.Field))
            .Where(item => Matches(item, "auditEventId", normalized.AuditEventId))
            .Where(item => Matches(item, "correlationId", normalized.CorrelationId))
            .Where(item => MatchesSearch(item, normalized.Search))
            .ToList();
        var paged = Page(items, normalized.Page, normalized.PageSize);
        return ReadOnlyApiEnvelopeDto<TraceEntryListDto>.Success(
            new TraceEntryListDto(paged.Items),
            snapshot,
            Meta(snapshot, normalized, paged.PageInfo),
            "Audit Jobs trace entries returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<AuditJobBlockerListDto>> ListBlockersAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<AuditJobBlockerListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<AuditJobBlockerListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        return ReadOnlyApiEnvelopeDto<AuditJobBlockerListDto>.Success(
            new AuditJobBlockerListDto(snapshot.Blockers),
            snapshot,
            Meta(snapshot, normalized, SinglePage(snapshot.Blockers.Count)),
            "Audit Jobs blockers returned from the local fixture provider.");
    }

    public async Task<ReadOnlyApiEnvelopeDto<AuditJobNextGateListDto>> ListNextGatesAsync(AuditJobApiQuery query, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeQuery(query);
        if (normalized.Error is not null)
        {
            return Error<AuditJobNextGateListDto>(normalized);
        }

        var snapshotResult = await GetSnapshotAsync(normalized, cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<AuditJobNextGateListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        return ReadOnlyApiEnvelopeDto<AuditJobNextGateListDto>.Success(
            new AuditJobNextGateListDto(snapshot.NextGates),
            snapshot,
            Meta(snapshot, normalized, SinglePage(snapshot.NextGates.Count)),
            "Audit Jobs next gates returned from the local fixture provider.");
    }

    private async Task<SnapshotResult> GetSnapshotAsync(NormalizedQueryResult query, CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await provider.GetSnapshotAsync(query.TenantKey, query.SiteKey, cancellationToken);
            if (snapshot is null)
            {
                return SnapshotResult.Failed(new ServiceError(
                    AuditJobApiErrorCodes.ProviderNotConfigured,
                    StatusCodes.Status503ServiceUnavailable,
                    "Audit Jobs read-only provider is not configured for the requested tenant/site.",
                    query.TenantKey,
                    query.SiteKey));
            }

            return SnapshotResult.Success(snapshot);
        }
        catch (Exception ex) when (ex is InvalidOperationException or JsonException or IOException)
        {
            return SnapshotResult.Failed(new ServiceError(
                AuditJobApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Audit Jobs read-only fixture contract is invalid.",
                query.TenantKey,
                query.SiteKey));
        }
    }

    private static NormalizedQueryResult NormalizeQuery(AuditJobApiQuery query)
    {
        var tenantKey = NormalizeKey(query.TenantKey);
        var siteKey = NormalizeKey(query.SiteKey);
        if (string.IsNullOrWhiteSpace(tenantKey) || string.IsNullOrWhiteSpace(siteKey))
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                AuditJobApiErrorCodes.ScopeRequired,
                StatusCodes.Status400BadRequest,
                "tenantKey and siteKey are required.");
        }

        var page = query.Page ?? 1;
        var pageSize = query.PageSize ?? 250;
        if (page < 1 || pageSize < 1 || pageSize > 250)
        {
            return NormalizedQueryResult.Failed(
                tenantKey,
                siteKey,
                AuditJobApiErrorCodes.InvalidPagination,
                StatusCodes.Status400BadRequest,
                "page must be positive and pageSize must be between 1 and 250.");
        }

        return NormalizedQueryResult.Success(new AuditJobNormalizedQuery(
            tenantKey,
            siteKey,
            NormalizeOrNull(query.Type),
            NormalizeOrNull(query.EventType),
            NormalizeOrNull(query.JobType),
            NormalizeOrNull(query.GateType),
            NormalizeOrNull(query.Outcome),
            NormalizeOrNull(query.Status),
            NormalizeOrNull(query.State),
            NormalizeOrNull(query.Result),
            NormalizeOrNull(query.SourceRef),
            NormalizeOrNull(query.Field),
            string.IsNullOrWhiteSpace(query.AuditEventId) ? null : query.AuditEventId.Trim(),
            string.IsNullOrWhiteSpace(query.CorrelationId) ? null : query.CorrelationId.Trim(),
            string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim().ToLowerInvariant(),
            page,
            pageSize));
    }

    private static AuditJobApiMetaDto Meta(AuditJobReadOnlySnapshot snapshot, NormalizedQueryResult query, AuditJobPaginationMetaDto pagination)
        => AuditJobApiMetaDto.LocalReadOnly(
            snapshot.SourceProviderMode,
            pagination,
            new Dictionary<string, string?>
            {
                ["type"] = query.Type,
                ["eventType"] = query.EventType,
                ["jobType"] = query.JobType,
                ["gateType"] = query.GateType,
                ["outcome"] = query.Outcome,
                ["status"] = query.Status,
                ["state"] = query.State,
                ["result"] = query.Result,
                ["sourceRef"] = query.SourceRef,
                ["field"] = query.Field,
                ["auditEventId"] = query.AuditEventId,
                ["correlationId"] = query.CorrelationId,
                ["search"] = query.Search
            },
            snapshot.ContractSchemaVersion);

    private static bool Matches(AuditJobJsonObjectDto item, string propertyName, string? expected)
    {
        if (expected is null)
        {
            return true;
        }

        return string.Equals(item.GetString(propertyName), expected, StringComparison.OrdinalIgnoreCase);
    }

    private static bool MatchesSearch(AuditJobJsonObjectDto item, string? search)
        => search is null || item.ContainsText(search);

    private static Paged<T> Page<T>(IReadOnlyList<T> items, int page, int pageSize)
    {
        var totalItems = items.Count;
        var totalPages = Math.Max(1, (int)Math.Ceiling(totalItems / (double)pageSize));
        var pageItems = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new Paged<T>(
            pageItems,
            new AuditJobPaginationMetaDto(
                page,
                pageSize,
                totalItems,
                totalPages,
                page < totalPages,
                page > 1));
    }

    private static AuditJobPaginationMetaDto SinglePage(int totalItems = 1)
        => new(1, Math.Max(1, totalItems), totalItems, 1, false, false);

    private static ReadOnlyApiEnvelopeDto<T> Error<T>(NormalizedQueryResult query) => new ServiceError(
        query.Error!.Code,
        query.Error.Status,
        query.Error.Message,
        query.TenantKey,
        query.SiteKey).ToEnvelope<T>();

    private static string NormalizeKey(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();

    private static string? NormalizeOrNull(string? value)
    {
        var normalized = NormalizeKey(value);
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private sealed record Paged<T>(IReadOnlyList<T> Items, AuditJobPaginationMetaDto PageInfo);

    private sealed record NormalizedError(string Code, int Status, string Message);

    private sealed record NormalizedQueryResult(
        string TenantKey,
        string SiteKey,
        string? Type,
        string? EventType,
        string? JobType,
        string? GateType,
        string? Outcome,
        string? Status,
        string? State,
        string? Result,
        string? SourceRef,
        string? Field,
        string? AuditEventId,
        string? CorrelationId,
        string? Search,
        int Page,
        int PageSize,
        NormalizedError? Error)
    {
        public static NormalizedQueryResult Success(AuditJobNormalizedQuery query) => new(
            query.TenantKey,
            query.SiteKey,
            query.Type,
            query.EventType,
            query.JobType,
            query.GateType,
            query.Outcome,
            query.Status,
            query.State,
            query.Result,
            query.SourceRef,
            query.Field,
            query.AuditEventId,
            query.CorrelationId,
            query.Search,
            query.Page,
            query.PageSize,
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
            null,
            null,
            null,
            null,
            null,
            null,
            1,
            250,
            new NormalizedError(code, status, message));
    }

    private sealed record SnapshotResult(AuditJobReadOnlySnapshot? Snapshot, ServiceError? Error)
    {
        public static SnapshotResult Success(AuditJobReadOnlySnapshot snapshot) => new(snapshot, null);

        public static SnapshotResult Failed(ServiceError error) => new(null, error);
    }

    private sealed record ServiceError(string Code, int Status, string Message, string? TenantKey, string? SiteKey)
    {
        public ReadOnlyApiEnvelopeDto<T> ToEnvelope<T>() => ReadOnlyApiEnvelopeDto<T>.Error(
            Code,
            Status,
            Message,
            TenantKey,
            SiteKey);
    }
}
