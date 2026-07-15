namespace pumpkin_api.Services;

public interface IOperatorHandoffReadOnlyService
{
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffListDto>> ListHandoffsAsync(OperatorHandoffApiQuery query, CancellationToken cancellationToken = default);
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffConsumerDto>> GetHandoffAsync(string handoffPacketId, CancellationToken cancellationToken = default);
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffParityStatusDto>> GetParityAsync(string handoffPacketId, CancellationToken cancellationToken = default);
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffEvidenceDto>> GetEvidenceAsync(string handoffPacketId, CancellationToken cancellationToken = default);
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffConsumerProjectionDto>> GetConsumerProjectionAsync(string handoffPacketId, CancellationToken cancellationToken = default);
    Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffQaChecklistDto>> GetQaChecklistAsync(string handoffPacketId, CancellationToken cancellationToken = default);
}

public sealed class OperatorHandoffReadOnlyService(IOperatorHandoffReadOnlyProvider provider) : IOperatorHandoffReadOnlyService
{
    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffListDto>> ListHandoffsAsync(
        OperatorHandoffApiQuery query,
        CancellationToken cancellationToken = default)
    {
        var snapshotResult = await GetSnapshotAsync(cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<OperatorHandoffListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var handoffs = snapshot.Handoffs
            .Select(handoff => handoff.Summary)
            .Where(summary => Matches(summary.TenantKey, query.TenantKey))
            .Where(summary => Matches(summary.TenantState, query.TenantState))
            .Where(summary => Matches(summary.ParityState, query.ParityState))
            .Where(summary => Matches(summary.TargetMode, query.TargetMode))
            .Where(summary => MatchesSearch(summary, query.Search))
            .ToList();

        handoffs = Sort(handoffs, query.Sort);

        return OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffListDto>.Success(
            new OperatorHandoffListDto(handoffs),
            "Operator handoff summaries returned from the local V2.12.1 fixture provider.",
            snapshot.CorrelationId,
            snapshot.SecurityBoundary,
            snapshot.Source,
            null,
            null,
            snapshot.Warnings,
            OperatorHandoffApiProviderModes.LocalFixtureReadOnly);
    }

    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffConsumerDto>> GetHandoffAsync(
        string handoffPacketId,
        CancellationToken cancellationToken = default)
    {
        var result = await GetHandoffResultAsync(handoffPacketId, cancellationToken);
        if (result.Error is not null)
        {
            return result.Error.ToEnvelope<OperatorHandoffConsumerDto>();
        }

        var handoff = result.Handoff!;
        return Success(handoff, handoff.Handoff, "Operator handoff consumer model returned from local V2.12.1 fixture evidence.");
    }

    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffParityStatusDto>> GetParityAsync(
        string handoffPacketId,
        CancellationToken cancellationToken = default)
    {
        var result = await GetHandoffResultAsync(handoffPacketId, cancellationToken);
        if (result.Error is not null)
        {
            return result.Error.ToEnvelope<OperatorHandoffParityStatusDto>();
        }

        var handoff = result.Handoff!;
        return Success(handoff, handoff.Handoff.ParityStatus, "Operator handoff parity status returned from local fixture evidence.");
    }

    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffEvidenceDto>> GetEvidenceAsync(
        string handoffPacketId,
        CancellationToken cancellationToken = default)
    {
        var result = await GetHandoffResultAsync(handoffPacketId, cancellationToken);
        if (result.Error is not null)
        {
            return result.Error.ToEnvelope<OperatorHandoffEvidenceDto>();
        }

        var handoff = result.Handoff!;
        return Success(handoff, handoff.Evidence, "Operator handoff evidence references returned from local fixture evidence.");
    }

    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffConsumerProjectionDto>> GetConsumerProjectionAsync(
        string handoffPacketId,
        CancellationToken cancellationToken = default)
    {
        var result = await GetHandoffResultAsync(handoffPacketId, cancellationToken);
        if (result.Error is not null)
        {
            return result.Error.ToEnvelope<OperatorHandoffConsumerProjectionDto>();
        }

        var handoff = result.Handoff!;
        return Success(handoff, handoff.ConsumerProjection, "Operator handoff Admin-ready consumer projection returned from local fixture evidence.");
    }

    public async Task<OperatorHandoffReadOnlyApiEnvelopeDto<OperatorHandoffQaChecklistDto>> GetQaChecklistAsync(
        string handoffPacketId,
        CancellationToken cancellationToken = default)
    {
        var result = await GetHandoffResultAsync(handoffPacketId, cancellationToken);
        if (result.Error is not null)
        {
            return result.Error.ToEnvelope<OperatorHandoffQaChecklistDto>();
        }

        var handoff = result.Handoff!;
        return Success(handoff, handoff.QaChecklist, "Operator handoff QA checklist returned from local fixture evidence.");
    }

    private async Task<SnapshotResult> GetSnapshotAsync(CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await provider.GetSnapshotAsync(cancellationToken);
            if (snapshot.Handoffs.Count == 0)
            {
                return SnapshotResult.Failed(new ServiceError(
                    OperatorHandoffApiErrorCodes.ProviderNotConfigured,
                    StatusCodes.Status503ServiceUnavailable,
                    "Operator handoff read-only provider is not configured with local fixtures.",
                    null,
                    null));
            }

            return SnapshotResult.Success(snapshot);
        }
        catch (Exception ex) when (ex is InvalidOperationException or IOException)
        {
            return SnapshotResult.Failed(new ServiceError(
                OperatorHandoffApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Operator handoff read-only consumer contract is invalid.",
                null,
                null));
        }
    }

    private async Task<HandoffResult> GetHandoffResultAsync(string handoffPacketId, CancellationToken cancellationToken)
    {
        try
        {
            var handoff = await provider.GetHandoffAsync(handoffPacketId.Trim(), cancellationToken);
            if (handoff is null)
            {
                return HandoffResult.Failed(new ServiceError(
                    OperatorHandoffApiErrorCodes.HandoffNotFound,
                    StatusCodes.Status404NotFound,
                    "Operator handoff packet was not found in the local read-only provider.",
                    null,
                    null));
            }

            return HandoffResult.Success(handoff);
        }
        catch (Exception ex) when (ex is InvalidOperationException or IOException)
        {
            return HandoffResult.Failed(new ServiceError(
                OperatorHandoffApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Operator handoff read-only consumer contract is invalid.",
                null,
                null));
        }
    }

    private static OperatorHandoffReadOnlyApiEnvelopeDto<T> Success<T>(
        OperatorHandoffSnapshot handoff,
        T data,
        string message)
        => OperatorHandoffReadOnlyApiEnvelopeDto<T>.Success(
            data,
            message,
            $"corr_operator_handoff_api_{Guid.NewGuid():N}"[..32],
            handoff.Handoff.SecurityBoundary,
            OperatorHandoffSourceDto.LocalHandoffFixtures(),
            handoff.Handoff.TenantKey,
            handoff.Handoff.SiteKey,
            handoff.Handoff.Warnings,
            handoff.Handoff.ConsumerMode);

    private static bool Matches(string actual, string? expected)
        => string.IsNullOrWhiteSpace(expected)
            || string.Equals(actual, expected.Trim(), StringComparison.OrdinalIgnoreCase)
            || string.Equals(expected.Trim(), "all", StringComparison.OrdinalIgnoreCase);

    private static bool MatchesSearch(OperatorHandoffSummaryDto summary, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return true;
        }

        var needle = search.Trim().ToLowerInvariant();
        return string.Join(
                " ",
                summary.HandoffPacketId,
                summary.TenantKey,
                summary.SiteKey,
                summary.Domain,
                summary.TenantState,
                summary.PacketType,
                summary.PackageHash,
                summary.ApprovalManifestId,
                summary.ExecutionRunId,
                summary.TargetMode,
                summary.ParityState)
            .ToLowerInvariant()
            .Contains(needle, StringComparison.Ordinal);
    }

    private static List<OperatorHandoffSummaryDto> Sort(List<OperatorHandoffSummaryDto> handoffs, string? sort)
        => (sort ?? "tenantKey").Trim().ToLowerInvariant() switch
        {
            "generatedat" => handoffs.OrderByDescending(summary => summary.GeneratedAt, StringComparer.OrdinalIgnoreCase).ToList(),
            "paritystate" => handoffs.OrderBy(summary => summary.ParityState, StringComparer.OrdinalIgnoreCase).ThenBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase).ToList(),
            "tenantstate" => handoffs.OrderBy(summary => summary.TenantState, StringComparer.OrdinalIgnoreCase).ThenBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase).ToList(),
            "targetmode" => handoffs.OrderBy(summary => summary.TargetMode, StringComparer.OrdinalIgnoreCase).ThenBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase).ToList(),
            _ => handoffs.OrderBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase).ThenBy(summary => summary.HandoffPacketId, StringComparer.OrdinalIgnoreCase).ToList(),
        };

    private sealed record ServiceError(string Code, int Status, string Message, string? TenantKey, string? SiteKey)
    {
        public OperatorHandoffReadOnlyApiEnvelopeDto<T> ToEnvelope<T>() => OperatorHandoffReadOnlyApiEnvelopeDto<T>.Error(
            Code,
            Status,
            Message,
            TenantKey,
            SiteKey);
    }

    private sealed record SnapshotResult(OperatorHandoffReadOnlySnapshot? Snapshot, ServiceError? Error)
    {
        public static SnapshotResult Success(OperatorHandoffReadOnlySnapshot snapshot) => new(snapshot, null);

        public static SnapshotResult Failed(ServiceError error) => new(null, error);
    }

    private sealed record HandoffResult(OperatorHandoffSnapshot? Handoff, ServiceError? Error)
    {
        public static HandoffResult Success(OperatorHandoffSnapshot handoff) => new(handoff, null);

        public static HandoffResult Failed(ServiceError error) => new(null, error);
    }
}
