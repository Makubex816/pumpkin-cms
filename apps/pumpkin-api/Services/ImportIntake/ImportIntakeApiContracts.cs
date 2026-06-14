using System.Security.Claims;
using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class ImportIntakeApiProviderModes
{
    public const string LocalFixtureReadOnly = "api-local-import-package-fixture-readonly";
}

public static class ImportIntakeApiErrorCodes
{
    public const string Ok = "IMPORT_INTAKE_PREVIEW_OK";
    public const string PackageNotFound = "IMPORT_INTAKE_PACKAGE_NOT_FOUND";
    public const string ProviderNotConfigured = "IMPORT_INTAKE_PROVIDER_NOT_CONFIGURED";
    public const string ContractInvalid = "IMPORT_INTAKE_CONTRACT_INVALID";
}

public sealed record ImportIntakeReadOnlyApiEnvelopeDto<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportIntakeHealthMessageDto> Warnings,
    [property: JsonPropertyName("errors")] IReadOnlyList<ImportIntakeApiErrorDto> Errors,
    [property: JsonPropertyName("securityBoundary")] ImportIntakeSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("source")] ImportIntakeSourceDto Source,
    [property: JsonPropertyName("tenantKey")] string? TenantKey,
    [property: JsonPropertyName("siteKey")] string? SiteKey,
    [property: JsonPropertyName("meta")] ImportIntakeApiMetaDto Meta)
{
    public static ImportIntakeReadOnlyApiEnvelopeDto<T> Success(
        T data,
        string message,
        string correlationId,
        ImportIntakeSecurityBoundaryDto securityBoundary,
        ImportIntakeSourceDto source,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<ImportIntakeHealthMessageDto>? warnings = null,
        string? sourceProviderMode = null,
        string contractSchemaVersion = ImportIntakeContractVersions.ReadOnlyApiEnvelope)
        => new(
            true,
            StatusCodes.Status200OK,
            ImportIntakeApiErrorCodes.Ok,
            message,
            CreateRequestId(),
            correlationId,
            ImportIntakeApiProviderModes.LocalFixtureReadOnly,
            true,
            data,
            warnings ?? Array.Empty<ImportIntakeHealthMessageDto>(),
            Array.Empty<ImportIntakeApiErrorDto>(),
            securityBoundary,
            source,
            tenantKey,
            siteKey,
            ImportIntakeApiMetaDto.LocalReadOnly(sourceProviderMode, contractSchemaVersion));

    public static ImportIntakeReadOnlyApiEnvelopeDto<T> Error(
        string code,
        int status,
        string message,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<ImportIntakeApiErrorDto>? errors = null)
        => new(
            false,
            status,
            code,
            message,
            CreateRequestId(),
            CreateCorrelationId(),
            ImportIntakeApiProviderModes.LocalFixtureReadOnly,
            true,
            default,
            Array.Empty<ImportIntakeHealthMessageDto>(),
            errors ?? [new ImportIntakeApiErrorDto(code, message, null)],
            ImportIntakeSecurityBoundaryDto.LocalClosed(),
            ImportIntakeSourceDto.LocalFixtureCollection(),
            tenantKey,
            siteKey,
            ImportIntakeApiMetaDto.LocalReadOnly());

    private static string CreateRequestId() => $"iipapi_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..32];

    private static string CreateCorrelationId() => $"corr_import_intake_api_{Guid.NewGuid():N}"[..32];
}

public static class ImportIntakeContractVersions
{
    public const string ReadOnlyApiEnvelope = "pumpkin.importIntakePreview.readonlyApiEnvelope.v1";
    public const string SharedModel = "pumpkin.importIntakePreview.sharedModel.v1";
}

public sealed record ImportIntakeApiErrorDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("path")] string? Path);

public sealed record ImportIntakeApiMetaDto(
    [property: JsonPropertyName("mode")] string Mode,
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("sourceProviderMode")] string? SourceProviderMode,
    [property: JsonPropertyName("contractSchemaVersion")] string ContractSchemaVersion,
    [property: JsonPropertyName("externalHttpCrawling")] bool ExternalHttpCrawling,
    [property: JsonPropertyName("cmsApiCalls")] bool CmsApiCalls,
    [property: JsonPropertyName("cmsWrites")] bool CmsWrites,
    [property: JsonPropertyName("providerWrites")] bool ProviderWrites,
    [property: JsonPropertyName("protectedConfigReads")] bool ProtectedConfigReads,
    [property: JsonPropertyName("writeActionsAllowed")] bool WriteActionsAllowed,
    [property: JsonPropertyName("deployment")] bool Deployment,
    [property: JsonPropertyName("searchConsoleIndexing")] bool SearchConsoleIndexing,
    [property: JsonPropertyName("googleIndexingState")] string GoogleIndexingState)
{
    public static ImportIntakeApiMetaDto LocalReadOnly(
        string? sourceProviderMode = null,
        string contractSchemaVersion = ImportIntakeContractVersions.ReadOnlyApiEnvelope)
        => new(
            "api-local-readonly-fixture",
            true,
            true,
            ImportIntakeApiProviderModes.LocalFixtureReadOnly,
            sourceProviderMode,
            contractSchemaVersion,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            "deferred_hard_stop");
}

public sealed record ImportIntakeSourceDto(
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("fixturePath")] string FixturePath,
    [property: JsonPropertyName("packagePreviewPath")] string? PackagePreviewPath)
{
    public static ImportIntakeSourceDto LocalFixtureCollection() => new(
        "local_fixture_collection",
        "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures",
        null);
}

public sealed record ImportIntakeSecurityBoundaryDto(
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("noWriteBoundarySatisfied")] bool NoWriteBoundarySatisfied,
    [property: JsonPropertyName("openFlags")] IReadOnlyList<string> OpenFlags,
    [property: JsonPropertyName("closedFlags")] IReadOnlyList<string> ClosedFlags)
{
    public static ImportIntakeSecurityBoundaryDto LocalClosed() => new(
        true,
        true,
        Array.Empty<string>(),
        [
            "tenantImportExecution",
            "liveTenantCreation",
            "rollerResume",
            "cmsWrites",
            "providerWrites",
            "mediaAssetWrites",
            "deployment",
            "redeployment",
            "dnsMutation",
            "customDomainMutation",
            "googleIndexingAction",
            "searchConsoleAction",
            "contactPost",
            "contactFormSubmission",
            "azureMutation",
            "rbacAssignment",
            "protectedConfigRead",
            "tokenUseOrPrint",
            "keysListKeys",
            "connectionStringGenerated",
            "sasGenerated",
            "externalHttpCrawling"
        ]);
}

public sealed record ImportIntakeRedactionPolicyDto(
    [property: JsonPropertyName("secretsPolicy")] string SecretsPolicy,
    [property: JsonPropertyName("protectedConfigPolicy")] string ProtectedConfigPolicy,
    [property: JsonPropertyName("piiPolicy")] string PiiPolicy);

public sealed record ImportIntakeHealthMessageDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("message")] string Message);

public sealed record ImportIntakeNoGoConditionDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("displayState")] string DisplayState,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("blocksFutureImport")] bool BlocksFutureImport);

public sealed record ImportIntakeNextGateDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("label")] string Label);

public sealed record ImportIntakeFutureActionDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("disabled")] bool Disabled,
    [property: JsonPropertyName("reason")] string Reason);

public sealed record ImportIntakePreviewDto(
    [property: JsonPropertyName("schemaVersion")] string SchemaVersion,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("packageType")] string PackageType,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("domain")] string Domain,
    [property: JsonPropertyName("tenantLifecycleState")] string TenantLifecycleState,
    [property: JsonPropertyName("importMode")] string ImportMode,
    [property: JsonPropertyName("readyForFutureImportExecution")] bool ReadyForFutureImportExecution,
    [property: JsonPropertyName("routes")] IReadOnlyList<string> Routes,
    [property: JsonPropertyName("contentRefs")] IReadOnlyList<string> ContentRefs,
    [property: JsonPropertyName("mediaRefs")] IReadOnlyList<string> MediaRefs,
    [property: JsonPropertyName("formConfigRefs")] IReadOnlyList<string> FormConfigRefs,
    [property: JsonPropertyName("resourceRegistryRefs")] IReadOnlyList<string> ResourceRegistryRefs,
    [property: JsonPropertyName("providerProfileRefs")] IReadOnlyList<string> ProviderProfileRefs,
    [property: JsonPropertyName("backupEvidenceRefs")] IReadOnlyList<string> BackupEvidenceRefs,
    [property: JsonPropertyName("runtimeQaRefs")] IReadOnlyList<string> RuntimeQaRefs,
    [property: JsonPropertyName("outboundLinkRefs")] IReadOnlyList<string> OutboundLinkRefs,
    [property: JsonPropertyName("auditJobRefs")] IReadOnlyList<string> AuditJobRefs,
    [property: JsonPropertyName("noGoConditions")] IReadOnlyList<ImportIntakeNoGoConditionDto> NoGoConditions,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("validationRefs")] IReadOnlyList<string> ValidationRefs,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportIntakeHealthMessageDto> Warnings,
    [property: JsonPropertyName("blockers")] IReadOnlyList<ImportIntakeHealthMessageDto> Blockers,
    [property: JsonPropertyName("nextGates")] IReadOnlyList<ImportIntakeNextGateDto> NextGates,
    [property: JsonPropertyName("futureActions")] IReadOnlyList<ImportIntakeFutureActionDto> FutureActions,
    [property: JsonPropertyName("securityBoundary")] ImportIntakeSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("redactionPolicy")] ImportIntakeRedactionPolicyDto RedactionPolicy,
    [property: JsonPropertyName("generatedAt")] string GeneratedAt);

public sealed record ImportIntakeFixtureEnvelope(
    [property: JsonPropertyName("schemaVersion")] string SchemaVersion,
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("data")] ImportIntakePreviewDto Data,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportIntakeHealthMessageDto> Warnings,
    [property: JsonPropertyName("errors")] IReadOnlyList<ImportIntakeApiErrorDto> Errors,
    [property: JsonPropertyName("securityBoundary")] ImportIntakeSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("source")] ImportIntakeSourceDto Source,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("meta")] ImportIntakeApiMetaDto Meta);

public sealed record ImportIntakePackageCountsDto(
    [property: JsonPropertyName("routes")] int Routes,
    [property: JsonPropertyName("contentRefs")] int ContentRefs,
    [property: JsonPropertyName("mediaRefs")] int MediaRefs,
    [property: JsonPropertyName("formConfigRefs")] int FormConfigRefs,
    [property: JsonPropertyName("resourceRegistryRefs")] int ResourceRegistryRefs,
    [property: JsonPropertyName("providerProfileRefs")] int ProviderProfileRefs,
    [property: JsonPropertyName("backupEvidenceRefs")] int BackupEvidenceRefs,
    [property: JsonPropertyName("runtimeQaRefs")] int RuntimeQaRefs,
    [property: JsonPropertyName("outboundLinkRefs")] int OutboundLinkRefs,
    [property: JsonPropertyName("auditJobRefs")] int AuditJobRefs,
    [property: JsonPropertyName("noGoConditions")] int NoGoConditions,
    [property: JsonPropertyName("warnings")] int Warnings,
    [property: JsonPropertyName("blockers")] int Blockers,
    [property: JsonPropertyName("nextGates")] int NextGates);

public sealed record ImportIntakePackageSummaryDto(
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("packageType")] string PackageType,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("domain")] string Domain,
    [property: JsonPropertyName("tenantLifecycleState")] string TenantLifecycleState,
    [property: JsonPropertyName("importMode")] string ImportMode,
    [property: JsonPropertyName("readyForFutureImportExecution")] bool ReadyForFutureImportExecution,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("counts")] ImportIntakePackageCountsDto Counts)
{
    public static ImportIntakePackageSummaryDto From(ImportIntakePreviewDto preview) => new(
        preview.PackageId,
        preview.PackageType,
        preview.TenantKey,
        preview.SiteKey,
        preview.Domain,
        preview.TenantLifecycleState,
        preview.ImportMode,
        preview.ReadyForFutureImportExecution,
        preview.RollbackPlanId,
        true,
        new ImportIntakePackageCountsDto(
            preview.Routes.Count,
            preview.ContentRefs.Count,
            preview.MediaRefs.Count,
            preview.FormConfigRefs.Count,
            preview.ResourceRegistryRefs.Count,
            preview.ProviderProfileRefs.Count,
            preview.BackupEvidenceRefs.Count,
            preview.RuntimeQaRefs.Count,
            preview.OutboundLinkRefs.Count,
            preview.AuditJobRefs.Count,
            preview.NoGoConditions.Count,
            preview.Warnings.Count,
            preview.Blockers.Count,
            preview.NextGates.Count));
}

public sealed record ImportIntakePackageListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<ImportIntakePackageSummaryDto> Items);

public sealed record ImportIntakeValidationDto(
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("validationOk")] bool ValidationOk,
    [property: JsonPropertyName("readyForFutureImportExecution")] bool ReadyForFutureImportExecution,
    [property: JsonPropertyName("futureActionsDisabled")] bool FutureActionsDisabled,
    [property: JsonPropertyName("validationRefs")] IReadOnlyList<string> ValidationRefs,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportIntakeHealthMessageDto> Warnings,
    [property: JsonPropertyName("blockers")] IReadOnlyList<ImportIntakeHealthMessageDto> Blockers,
    [property: JsonPropertyName("securityBoundary")] ImportIntakeSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("redactionPolicy")] ImportIntakeRedactionPolicyDto RedactionPolicy,
    [property: JsonPropertyName("meta")] ImportIntakeApiMetaDto Meta);

public sealed record ImportIntakeRollbackDto(
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("abortRequired")] bool AbortRequired,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("blockedByNoGoConditions")] IReadOnlyList<string> BlockedByNoGoConditions,
    [property: JsonPropertyName("validationRefs")] IReadOnlyList<string> ValidationRefs);

public sealed record ImportIntakeEvidenceRefDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("sourceField")] string SourceField,
    [property: JsonPropertyName("safePath")] string SafePath);

public sealed record ImportIntakeEvidenceRefListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<ImportIntakeEvidenceRefDto> Items);

public sealed record ImportIntakeResourceRefDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("sourceField")] string SourceField,
    [property: JsonPropertyName("displayValue")] string DisplayValue);

public sealed record ImportIntakeResourceRefListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<ImportIntakeResourceRefDto> Items);

public sealed record ImportIntakeNoGoConditionListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<ImportIntakeNoGoConditionDto> Items);

public sealed class ImportIntakeApiQuery
{
    public string? TenantKey { get; set; }
    public string? SiteKey { get; set; }
    public string? PackageType { get; set; }
    public string? LifecycleState { get; set; }
    public string? ImportMode { get; set; }
    public string? NoGoState { get; set; }
    public bool? ReadyForFutureImportExecution { get; set; }
    public string? Search { get; set; }
}

public sealed record ImportIntakeLocalActor(
    string TenantKey,
    string SiteKey,
    string Role,
    bool IsAuthenticated)
{
    public static ImportIntakeLocalActor FromClaims(ClaimsPrincipal user)
    {
        var tenantKey = user.FindFirst("tenantId")?.Value
            ?? user.FindFirst("tenantKey")?.Value
            ?? string.Empty;
        var siteKey = user.FindFirst("siteId")?.Value
            ?? user.FindFirst("siteKey")?.Value
            ?? string.Empty;
        var role = user.FindFirst(ClaimTypes.Role)?.Value
            ?? user.FindFirst("role")?.Value
            ?? string.Empty;
        return new ImportIntakeLocalActor(
            NormalizeKey(tenantKey),
            NormalizeKey(siteKey),
            role.Trim(),
            user.Identity?.IsAuthenticated == true);
    }

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
}
