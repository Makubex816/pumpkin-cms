using System.Text.Json;

namespace pumpkin_api.Services;

public interface IImportIntakeReadOnlyService
{
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePackageListDto>> ListPackagesAsync(ImportIntakeApiQuery query, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePackageSummaryDto>> GetPackageAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePreviewDto>> GetPreviewAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeValidationDto>> GetValidationAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeNoGoConditionListDto>> ListNoGoConditionsAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeRollbackDto>> GetRollbackAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeEvidenceRefListDto>> ListEvidenceRefsAsync(string packageId, CancellationToken cancellationToken = default);
    Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeResourceRefListDto>> ListResourceRefsAsync(string packageId, CancellationToken cancellationToken = default);
}

public sealed class ImportIntakeReadOnlyService(IImportIntakeReadOnlyProvider provider) : IImportIntakeReadOnlyService
{
    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePackageListDto>> ListPackagesAsync(
        ImportIntakeApiQuery query,
        CancellationToken cancellationToken = default)
    {
        var snapshotResult = await GetSnapshotAsync(cancellationToken);
        if (snapshotResult.Error is not null)
        {
            return snapshotResult.Error.ToEnvelope<ImportIntakePackageListDto>();
        }

        var snapshot = snapshotResult.Snapshot!;
        var packages = snapshot.Packages
            .Select(package => package.Summary)
            .Where(summary => Matches(summary.TenantKey, query.TenantKey))
            .Where(summary => Matches(summary.SiteKey, query.SiteKey))
            .Where(summary => Matches(summary.PackageType, query.PackageType))
            .Where(summary => Matches(summary.TenantLifecycleState, query.LifecycleState))
            .Where(summary => Matches(summary.ImportMode, query.ImportMode))
            .Where(summary => query.ReadyForFutureImportExecution is null || summary.ReadyForFutureImportExecution == query.ReadyForFutureImportExecution)
            .Where(summary => MatchesNoGoState(summary, query.NoGoState))
            .Where(summary => MatchesSearch(summary, query.Search))
            .OrderBy(summary => summary.TenantKey, StringComparer.OrdinalIgnoreCase)
            .ThenBy(summary => summary.PackageId, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePackageListDto>.Success(
            new ImportIntakePackageListDto(packages),
            "Import intake packages returned from the local fixture provider.",
            snapshot.CorrelationId,
            snapshot.SecurityBoundary,
            snapshot.Source,
            null,
            null,
            snapshot.Warnings,
            ImportIntakeApiProviderModes.LocalFixtureReadOnly);
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePackageSummaryDto>> GetPackageAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakePackageSummaryDto>();
        }

        var package = packageResult.Package!;
        return Success(
            package,
            package.Summary,
            "Import intake package summary returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakePreviewDto>> GetPreviewAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakePreviewDto>();
        }

        var package = packageResult.Package!;
        return Success(
            package,
            package.Preview,
            "Import intake package preview returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeValidationDto>> GetValidationAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakeValidationDto>();
        }

        var package = packageResult.Package!;
        var preview = package.Preview;
        var validation = new ImportIntakeValidationDto(
            preview.PackageId,
            preview.SecurityBoundary.NoWriteBoundarySatisfied && preview.SecurityBoundary.OpenFlags.Count == 0,
            preview.ReadyForFutureImportExecution,
            preview.FutureActions.All(action => action.Disabled),
            preview.ValidationRefs,
            preview.Warnings,
            preview.Blockers,
            preview.SecurityBoundary,
            preview.RedactionPolicy,
            ImportIntakeApiMetaDto.LocalReadOnly(ImportIntakeApiProviderModes.LocalFixtureReadOnly));

        return Success(
            package,
            validation,
            "Import intake validation state returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeNoGoConditionListDto>> ListNoGoConditionsAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakeNoGoConditionListDto>();
        }

        var package = packageResult.Package!;
        return Success(
            package,
            new ImportIntakeNoGoConditionListDto(package.Preview.NoGoConditions),
            "Import intake no-go conditions returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeRollbackDto>> GetRollbackAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakeRollbackDto>();
        }

        var package = packageResult.Package!;
        var preview = package.Preview;
        var rollback = new ImportIntakeRollbackDto(
            preview.PackageId,
            preview.RollbackPlanId,
            !preview.ReadyForFutureImportExecution || preview.NoGoConditions.Any(condition => condition.BlocksFutureImport),
            true,
            preview.NoGoConditions.Where(condition => condition.BlocksFutureImport).Select(condition => condition.Code).ToList(),
            preview.ValidationRefs);

        return Success(
            package,
            rollback,
            "Import intake rollback and abort state returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeEvidenceRefListDto>> ListEvidenceRefsAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakeEvidenceRefListDto>();
        }

        var package = packageResult.Package!;
        return Success(
            package,
            new ImportIntakeEvidenceRefListDto(CreateEvidenceRefs(package.Preview)),
            "Import intake evidence refs returned from the local fixture provider.");
    }

    public async Task<ImportIntakeReadOnlyApiEnvelopeDto<ImportIntakeResourceRefListDto>> ListResourceRefsAsync(
        string packageId,
        CancellationToken cancellationToken = default)
    {
        var packageResult = await GetPackageResultAsync(packageId, cancellationToken);
        if (packageResult.Error is not null)
        {
            return packageResult.Error.ToEnvelope<ImportIntakeResourceRefListDto>();
        }

        var package = packageResult.Package!;
        return Success(
            package,
            new ImportIntakeResourceRefListDto(CreateResourceRefs(package.Preview)),
            "Import intake package refs returned from the local fixture provider.");
    }

    private async Task<SnapshotResult> GetSnapshotAsync(CancellationToken cancellationToken)
    {
        try
        {
            var snapshot = await provider.GetSnapshotAsync(cancellationToken);
            if (snapshot.Packages.Count == 0)
            {
                return SnapshotResult.Failed(new ServiceError(
                    ImportIntakeApiErrorCodes.ProviderNotConfigured,
                    StatusCodes.Status503ServiceUnavailable,
                    "Import intake read-only provider is not configured with local fixtures.",
                    null,
                    null));
            }

            return SnapshotResult.Success(snapshot);
        }
        catch (Exception ex) when (ex is InvalidOperationException or JsonException or IOException)
        {
            return SnapshotResult.Failed(new ServiceError(
                ImportIntakeApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Import intake read-only fixture contract is invalid.",
                null,
                null));
        }
    }

    private async Task<PackageResult> GetPackageResultAsync(string packageId, CancellationToken cancellationToken)
    {
        try
        {
            var package = await provider.GetPackageAsync(packageId.Trim(), cancellationToken);
            if (package is null)
            {
                return PackageResult.Failed(new ServiceError(
                    ImportIntakeApiErrorCodes.PackageNotFound,
                    StatusCodes.Status404NotFound,
                    "Import intake package was not found in the local read-only fixture provider.",
                    null,
                    null));
            }

            return PackageResult.Success(package);
        }
        catch (Exception ex) when (ex is InvalidOperationException or JsonException or IOException)
        {
            return PackageResult.Failed(new ServiceError(
                ImportIntakeApiErrorCodes.ContractInvalid,
                StatusCodes.Status500InternalServerError,
                "Import intake read-only fixture contract is invalid.",
                null,
                null));
        }
    }

    private static ImportIntakeReadOnlyApiEnvelopeDto<T> Success<T>(
        ImportIntakePackageSnapshot package,
        T data,
        string message)
        => ImportIntakeReadOnlyApiEnvelopeDto<T>.Success(
            data,
            message,
            package.Envelope.CorrelationId,
            package.Envelope.SecurityBoundary,
            package.Envelope.Source,
            package.Preview.TenantKey,
            package.Preview.SiteKey,
            package.Envelope.Data.Warnings,
            package.Envelope.ProviderMode);

    private static IReadOnlyList<ImportIntakeEvidenceRefDto> CreateEvidenceRefs(ImportIntakePreviewDto preview)
        => CreateRefs(preview.BackupEvidenceRefs, "backup", "backupEvidenceRefs")
            .Concat(CreateRefs(preview.RuntimeQaRefs, "runtime_qa", "runtimeQaRefs"))
            .Concat(CreateRefs(preview.AuditJobRefs, "audit_jobs", "auditJobRefs"))
            .Concat(CreateRefs(preview.ValidationRefs, "validation", "validationRefs"))
            .Append(new ImportIntakeEvidenceRefDto(
                preview.RollbackPlanId,
                "rollback",
                "rollbackPlanId",
                preview.RollbackPlanId))
            .ToList();

    private static IReadOnlyList<ImportIntakeResourceRefDto> CreateResourceRefs(ImportIntakePreviewDto preview)
        => CreateResourceRefs(preview.Routes, "route", "routes")
            .Concat(CreateResourceRefs(preview.ContentRefs, "content", "contentRefs"))
            .Concat(CreateResourceRefs(preview.MediaRefs, "media", "mediaRefs"))
            .Concat(CreateResourceRefs(preview.FormConfigRefs, "form_config", "formConfigRefs"))
            .Concat(CreateResourceRefs(preview.ResourceRegistryRefs, "resource_registry", "resourceRegistryRefs"))
            .Concat(CreateResourceRefs(preview.ProviderProfileRefs, "provider_profile", "providerProfileRefs"))
            .Concat(CreateResourceRefs(preview.OutboundLinkRefs, "outbound_link_manager", "outboundLinkRefs"))
            .ToList();

    private static IEnumerable<ImportIntakeEvidenceRefDto> CreateRefs(
        IEnumerable<string> values,
        string kind,
        string sourceField)
        => values.Select(value => new ImportIntakeEvidenceRefDto(value, kind, sourceField, value));

    private static IEnumerable<ImportIntakeResourceRefDto> CreateResourceRefs(
        IEnumerable<string> values,
        string kind,
        string sourceField)
        => values.Select(value => new ImportIntakeResourceRefDto(value, kind, sourceField, value));

    private static bool Matches(string actual, string? expected)
        => string.IsNullOrWhiteSpace(expected) || string.Equals(actual, expected.Trim(), StringComparison.OrdinalIgnoreCase);

    private static bool MatchesNoGoState(ImportIntakePackageSummaryDto summary, string? expected)
    {
        if (string.IsNullOrWhiteSpace(expected) || string.Equals(expected, "all", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var hasNoGo = summary.Counts.NoGoConditions > 0;
        return expected.Trim().ToLowerInvariant() switch
        {
            "blocked" or "has_no_go" => hasNoGo,
            "clear" or "none" => !hasNoGo,
            _ => true
        };
    }

    private static bool MatchesSearch(ImportIntakePackageSummaryDto summary, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return true;
        }

        var needle = search.Trim().ToLowerInvariant();
        return string.Join(
                " ",
                summary.PackageId,
                summary.PackageType,
                summary.TenantKey,
                summary.SiteKey,
                summary.Domain,
                summary.TenantLifecycleState,
                summary.ImportMode,
                summary.RollbackPlanId)
            .ToLowerInvariant()
            .Contains(needle, StringComparison.Ordinal);
    }

    private sealed record ServiceError(string Code, int Status, string Message, string? TenantKey, string? SiteKey)
    {
        public ImportIntakeReadOnlyApiEnvelopeDto<T> ToEnvelope<T>() => ImportIntakeReadOnlyApiEnvelopeDto<T>.Error(
            Code,
            Status,
            Message,
            TenantKey,
            SiteKey);
    }

    private sealed record SnapshotResult(ImportIntakeReadOnlySnapshot? Snapshot, ServiceError? Error)
    {
        public static SnapshotResult Success(ImportIntakeReadOnlySnapshot snapshot) => new(snapshot, null);

        public static SnapshotResult Failed(ServiceError error) => new(null, error);
    }

    private sealed record PackageResult(ImportIntakePackageSnapshot? Package, ServiceError? Error)
    {
        public static PackageResult Success(ImportIntakePackageSnapshot package) => new(package, null);

        public static PackageResult Failed(ServiceError error) => new(null, error);
    }
}
