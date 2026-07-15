namespace pumpkin_api.Services;

public interface IImportExecutionProjectionReadOnlyService
{
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionProjectionListDto>> ListExecutionsAsync(ImportExecutionProjectionApiQuery query, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionOperatorProjectionDto>> GetExecutionAsync(string executionRunId, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionReadbackDto>> GetReadbackAsync(string executionRunId, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionEntityMappingsDto>> GetEntityMappingsAsync(string executionRunId, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionAuditDto>> GetAuditAsync(string executionRunId, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionRollbackDto>> GetRollbackAsync(string executionRunId, CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionOperatorProjectionDto>> GetOperatorProjectionAsync(string executionRunId, CancellationToken cancellationToken = default);
}

public sealed class ImportExecutionProjectionReadOnlyService(IImportExecutionProjectionReadOnlyProvider provider) : IImportExecutionProjectionReadOnlyService
{
    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionProjectionListDto>> ListExecutionsAsync(
        ImportExecutionProjectionApiQuery query,
        CancellationToken cancellationToken = default)
    {
        var snapshotResult = await GetSnapshotAsync(cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<ImportExecutionProjectionListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var executions = snapshot.Executions
            .Select(execution => execution.Summary)
            .Where(summary => Matches(summary.TenantKey, query.TenantKey))
            .Where(summary => Matches(summary.SiteKey, query.SiteKey))
            .Where(summary => Matches(summary.TargetMode, query.TargetMode))
            .Where(summary => Matches(summary.ReadbackStatus, query.ReadbackState))
            .Where(summary => Matches(summary.HardStopState, query.HardStopState))
            .Where(summary => MatchesSearch(summary, query.Search))
            .OrderBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase)
            .ThenBy(summary => summary.ExecutionRunId, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionProjectionListDto>.Success(
            new ImportExecutionProjectionListDto(executions),
            "Import execution projections returned from the local frozen evidence provider.",
            snapshot.CorrelationId,
            snapshot.SecurityBoundary,
            snapshot.Source,
            null,
            null,
            snapshot.Warnings,
            ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly);
    }

    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionOperatorProjectionDto>> GetExecutionAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
    {
        var executionResult = await GetExecutionResultAsync(executionRunId, cancellationToken);
        if (executionResult.Error is not null)
        {
            return executionResult.Error.ToEnvelope<ImportExecutionOperatorProjectionDto>();
        }

        var execution = executionResult.Execution!;
        return Success(
            execution,
            execution.Projection,
            "Import execution projection returned from the local frozen evidence provider.");
    }

    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionReadbackDto>> GetReadbackAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
    {
        var executionResult = await GetExecutionResultAsync(executionRunId, cancellationToken);
        if (executionResult.Error is not null)
        {
            return executionResult.Error.ToEnvelope<ImportExecutionReadbackDto>();
        }

        var execution = executionResult.Execution!;
        return Success(
            execution,
            execution.Projection.ReadbackResults,
            "Import execution readback verification returned from the local frozen evidence provider.");
    }

    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionEntityMappingsDto>> GetEntityMappingsAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
    {
        var executionResult = await GetExecutionResultAsync(executionRunId, cancellationToken);
        if (executionResult.Error is not null)
        {
            return executionResult.Error.ToEnvelope<ImportExecutionEntityMappingsDto>();
        }

        var execution = executionResult.Execution!;
        return Success(
            execution,
            execution.Projection.EntityMappings,
            "Import execution entity mappings returned from the local frozen evidence provider.");
    }

    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionAuditDto>> GetAuditAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
    {
        var executionResult = await GetExecutionResultAsync(executionRunId, cancellationToken);
        if (executionResult.Error is not null)
        {
            return executionResult.Error.ToEnvelope<ImportExecutionAuditDto>();
        }

        var execution = executionResult.Execution!;
        return Success(
            execution,
            execution.Projection.Audit,
            "Import execution audit trace returned from the local frozen evidence provider.");
    }

    public async Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionRollbackDto>> GetRollbackAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
    {
        var executionResult = await GetExecutionResultAsync(executionRunId, cancellationToken);
        if (executionResult.Error is not null)
        {
            return executionResult.Error.ToEnvelope<ImportExecutionRollbackDto>();
        }

        var execution = executionResult.Execution!;
        return Success(
            execution,
            execution.Projection.Rollback,
            "Import execution rollback and abort references returned from the local frozen evidence provider.");
    }

    public Task<ImportExecutionProjectionReadOnlyApiEnvelopeDto<ImportExecutionOperatorProjectionDto>> GetOperatorProjectionAsync(
        string executionRunId,
        CancellationToken cancellationToken = default)
        => GetExecutionAsync(executionRunId, cancellationToken);

    private async Task<SnapshotResult> GetSnapshotAsync(CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await provider.GetSnapshotAsync(cancellationToken);
            if (snapshot.Executions.Count == 0)
            {
                return SnapshotResult.Failed(new ServiceError(
                    ImportExecutionProjectionApiErrorCodes.ProviderNotConfigured,
                    StatusCodes.Status503ServiceUnavailable,
                    "Import execution read-only provider is not configured with frozen evidence.",
                    null,
                    null));
            }

            return SnapshotResult.Success(snapshot);
        }
        catch (Exception ex) when (ex is InvalidOperationException or IOException)
        {
            return SnapshotResult.Failed(new ServiceError(
                ImportExecutionProjectionApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Import execution read-only projection contract is invalid.",
                null,
                null));
        }
    }

    private async Task<ExecutionResult> GetExecutionResultAsync(string executionRunId, CancellationToken cancellationToken)
    {
        try
        {
            var execution = await provider.GetExecutionAsync(executionRunId.Trim(), cancellationToken);
            if (execution is null)
            {
                return ExecutionResult.Failed(new ServiceError(
                    ImportExecutionProjectionApiErrorCodes.ExecutionNotFound,
                    StatusCodes.Status404NotFound,
                    "Import execution was not found in the local read-only projection provider.",
                    null,
                    null));
            }

            return ExecutionResult.Success(execution);
        }
        catch (Exception ex) when (ex is InvalidOperationException or IOException)
        {
            return ExecutionResult.Failed(new ServiceError(
                ImportExecutionProjectionApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Import execution read-only projection contract is invalid.",
                null,
                null));
        }
    }

    private static ImportExecutionProjectionReadOnlyApiEnvelopeDto<T> Success<T>(
        ImportExecutionProjectionSnapshot execution,
        T data,
        string message)
        => ImportExecutionProjectionReadOnlyApiEnvelopeDto<T>.Success(
            data,
            message,
            $"corr_import_execution_api_{Guid.NewGuid():N}"[..32],
            execution.Projection.SecurityBoundary,
            ImportExecutionProjectionSourceDto.LocalFrozenEvidence(),
            execution.Projection.TenantKey,
            execution.Projection.SiteKey,
            execution.Projection.Warnings,
            execution.Projection.ProviderMode);

    private static bool Matches(string actual, string? expected)
        => string.IsNullOrWhiteSpace(expected)
            || string.Equals(actual, expected.Trim(), StringComparison.OrdinalIgnoreCase)
            || (string.Equals(expected.Trim(), "all", StringComparison.OrdinalIgnoreCase));

    private static bool MatchesSearch(ImportExecutionProjectionSummaryDto summary, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return true;
        }

        var needle = search.Trim().ToLowerInvariant();
        return string.Join(
                " ",
                summary.ExecutionRunId,
                summary.ProjectionId,
                summary.PackageId,
                summary.PackageHash,
                summary.ApprovalManifestId,
                summary.TenantKey,
                summary.SiteKey,
                summary.ExecutionStatus,
                summary.TargetMode,
                summary.ReadbackStatus,
                summary.HardStopState,
                summary.RollerState)
            .ToLowerInvariant()
            .Contains(needle, StringComparison.Ordinal);
    }

    private sealed record ServiceError(string Code, int Status, string Message, string? TenantKey, string? SiteKey)
    {
        public ImportExecutionProjectionReadOnlyApiEnvelopeDto<T> ToEnvelope<T>() => ImportExecutionProjectionReadOnlyApiEnvelopeDto<T>.Error(
            Code,
            Status,
            Message,
            TenantKey,
            SiteKey);
    }

    private sealed record SnapshotResult(ImportExecutionProjectionReadOnlySnapshot? Snapshot, ServiceError? Error)
    {
        public static SnapshotResult Success(ImportExecutionProjectionReadOnlySnapshot snapshot) => new(snapshot, null);

        public static SnapshotResult Failed(ServiceError error) => new(null, error);
    }

    private sealed record ExecutionResult(ImportExecutionProjectionSnapshot? Execution, ServiceError? Error)
    {
        public static ExecutionResult Success(ImportExecutionProjectionSnapshot execution) => new(execution, null);

        public static ExecutionResult Failed(ServiceError error) => new(null, error);
    }
}
