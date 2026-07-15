using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class ImportExecutionProjectionApiProviderModes
{
    public const string LocalFixtureReadOnly = "api-local-import-execution-projection-readonly";
}

public static class ImportExecutionProjectionApiErrorCodes
{
    public const string Ok = "IMPORT_EXECUTION_PROJECTION_OK";
    public const string ExecutionNotFound = "IMPORT_EXECUTION_NOT_FOUND";
    public const string ProviderNotConfigured = "IMPORT_EXECUTION_PROVIDER_NOT_CONFIGURED";
    public const string ContractInvalid = "IMPORT_EXECUTION_CONTRACT_INVALID";
}

public static class ImportExecutionProjectionContractVersions
{
    public const string ReadOnlyApiEnvelope = "pumpkin.importExecutionProjection.readonlyApiEnvelope.v1";
    public const string SharedModel = "pumpkin.importExecutionOperatorProjection.v1";
}

public sealed record ImportExecutionProjectionReadOnlyApiEnvelopeDto<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportExecutionProjectionHealthMessageDto> Warnings,
    [property: JsonPropertyName("errors")] IReadOnlyList<ImportExecutionProjectionApiErrorDto> Errors,
    [property: JsonPropertyName("securityBoundary")] ImportExecutionProjectionSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("source")] ImportExecutionProjectionSourceDto Source,
    [property: JsonPropertyName("tenantKey")] string? TenantKey,
    [property: JsonPropertyName("siteKey")] string? SiteKey,
    [property: JsonPropertyName("meta")] ImportExecutionProjectionApiMetaDto Meta)
{
    public static ImportExecutionProjectionReadOnlyApiEnvelopeDto<T> Success(
        T data,
        string message,
        string correlationId,
        ImportExecutionProjectionSecurityBoundaryDto securityBoundary,
        ImportExecutionProjectionSourceDto source,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<ImportExecutionProjectionHealthMessageDto>? warnings = null,
        string? sourceProviderMode = null,
        string contractSchemaVersion = ImportExecutionProjectionContractVersions.ReadOnlyApiEnvelope)
        => new(
            true,
            StatusCodes.Status200OK,
            ImportExecutionProjectionApiErrorCodes.Ok,
            message,
            CreateRequestId(),
            correlationId,
            ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly,
            true,
            data,
            warnings ?? Array.Empty<ImportExecutionProjectionHealthMessageDto>(),
            Array.Empty<ImportExecutionProjectionApiErrorDto>(),
            securityBoundary,
            source,
            tenantKey,
            siteKey,
            ImportExecutionProjectionApiMetaDto.LocalReadOnly(sourceProviderMode, contractSchemaVersion));

    public static ImportExecutionProjectionReadOnlyApiEnvelopeDto<T> Error(
        string code,
        int status,
        string message,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<ImportExecutionProjectionApiErrorDto>? errors = null)
        => new(
            false,
            status,
            code,
            message,
            CreateRequestId(),
            CreateCorrelationId(),
            ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly,
            true,
            default,
            Array.Empty<ImportExecutionProjectionHealthMessageDto>(),
            errors ?? [new ImportExecutionProjectionApiErrorDto(code, message, null)],
            ImportExecutionProjectionSecurityBoundaryDto.LocalClosed(),
            ImportExecutionProjectionSourceDto.LocalFrozenEvidence(),
            tenantKey,
            siteKey,
            ImportExecutionProjectionApiMetaDto.LocalReadOnly());

    private static string CreateRequestId() => $"iexapi_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..32];

    private static string CreateCorrelationId() => $"corr_import_execution_{Guid.NewGuid():N}"[..32];
}

public sealed record ImportExecutionProjectionApiErrorDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("path")] string? Path);

public sealed record ImportExecutionProjectionApiMetaDto(
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
    [property: JsonPropertyName("mediaAssetWrites")] bool MediaAssetWrites,
    [property: JsonPropertyName("protectedConfigReads")] bool ProtectedConfigReads,
    [property: JsonPropertyName("writeActionsAllowed")] bool WriteActionsAllowed,
    [property: JsonPropertyName("deployment")] bool Deployment,
    [property: JsonPropertyName("searchConsoleIndexing")] bool SearchConsoleIndexing,
    [property: JsonPropertyName("googleIndexingState")] string GoogleIndexingState,
    [property: JsonPropertyName("secondImportExecution")] bool SecondImportExecution,
    [property: JsonPropertyName("rollerResume")] bool RollerResume,
    [property: JsonPropertyName("olmStagingWrite")] bool OlmStagingWrite)
{
    public static ImportExecutionProjectionApiMetaDto LocalReadOnly(
        string? sourceProviderMode = null,
        string contractSchemaVersion = ImportExecutionProjectionContractVersions.ReadOnlyApiEnvelope)
        => new(
            "api-local-readonly-import-execution-projection",
            true,
            true,
            ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly,
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
            false,
            "deferred_hard_stop",
            false,
            false,
            false);
}

public sealed record ImportExecutionProjectionSourceDto(
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("fixturePath")] string FixturePath,
    [property: JsonPropertyName("phaseResultPath")] string PhaseResultPath,
    [property: JsonPropertyName("evidencePaths")] IReadOnlyList<string> EvidencePaths)
{
    public static ImportExecutionProjectionSourceDto LocalFrozenEvidence() => new(
        "local_frozen_import_execution_evidence",
        "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/result-manifest.json",
        "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result",
        [
            "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/result-manifest.json",
            "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/shared-operator-projection-model-contract.md",
            "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/admin-panel-mapping.md"
        ]);
}

public sealed record ImportExecutionProjectionSecurityBoundaryDto(
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("noWriteBoundarySatisfied")] bool NoWriteBoundarySatisfied,
    [property: JsonPropertyName("openFlags")] IReadOnlyList<string> OpenFlags,
    [property: JsonPropertyName("closedFlags")] IReadOnlyList<string> ClosedFlags,
    [property: JsonPropertyName("prohibitedActionFlags")] IReadOnlyDictionary<string, bool> ProhibitedActionFlags)
{
    public static ImportExecutionProjectionSecurityBoundaryDto LocalClosed() => new(
        true,
        true,
        Array.Empty<string>(),
        [
            "secondImportExecution",
            "liveTenantCreation",
            "rollerImport",
            "rollerResume",
            "cmsWrites",
            "providerWrites",
            "mediaAssetWrites",
            "mutationEndpoint",
            "deployment",
            "redeployment",
            "dnsMutation",
            "customDomainMutation",
            "googleIndexingAction",
            "searchConsoleAction",
            "contactPost",
            "azureMutation",
            "rbacAssignment",
            "protectedConfigRead",
            "tokenUseOrPrint",
            "keysListKeys",
            "connectionStringGenerated",
            "sasGenerated",
            "olmStagingWrite",
            "externalHttpCrawling"
        ],
        ProhibitedActionFlagsClosed());

    public static IReadOnlyDictionary<string, bool> ProhibitedActionFlagsClosed() => new Dictionary<string, bool>
    {
        ["tenantCreated"] = false,
        ["wroteCms"] = false,
        ["wroteProvider"] = false,
        ["mediaAssetWritten"] = false,
        ["mutatedAzure"] = false,
        ["deployed"] = false,
        ["indexed"] = false,
        ["contactPosted"] = false,
        ["rollerTouched"] = false,
        ["olmStagingWritten"] = false
    };
}

public sealed record ImportExecutionProjectionHealthMessageDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("message")] string Message);

public sealed record ImportExecutionProjectionNoGoConditionDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("displayState")] string DisplayState,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("blocksFutureImport")] bool BlocksFutureImport);

public sealed record ImportExecutionProjectionNextGateDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("label")] string Label);

public sealed record ImportExecutionProjectionFutureActionDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("disabled")] bool Disabled,
    [property: JsonPropertyName("reason")] string Reason);

public sealed record ImportExecutionApprovalManifestDto(
    [property: JsonPropertyName("approvalManifestId")] string ApprovalManifestId,
    [property: JsonPropertyName("approvalType")] string ApprovalType,
    [property: JsonPropertyName("approvalRef")] string ApprovalRef,
    [property: JsonPropertyName("approvedBy")] string ApprovedBy,
    [property: JsonPropertyName("executionApprovalGranted")] bool ExecutionApprovalGranted,
    [property: JsonPropertyName("operatorApprovalApproved")] bool OperatorApprovalApproved);

public sealed record ImportExecutionPackageIdentityDto(
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("hashMatchesExpected")] bool HashMatchesExpected);

public sealed record ImportExecutionTargetBindingDto(
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("targetProviderMode")] string TargetProviderMode,
    [property: JsonPropertyName("targetStorageMode")] string TargetStorageMode,
    [property: JsonPropertyName("targetCommandId")] string TargetCommandId,
    [property: JsonPropertyName("writeCommandId")] string WriteCommandId,
    [property: JsonPropertyName("readbackCommandId")] string ReadbackCommandId,
    [property: JsonPropertyName("targetPath")] string TargetPath,
    [property: JsonPropertyName("externalSystemWrites")] bool ExternalSystemWrites,
    [property: JsonPropertyName("protectedConfigRequired")] bool ProtectedConfigRequired,
    [property: JsonPropertyName("secretsRequired")] bool SecretsRequired);

public sealed record ImportExecutionMappingCountsDto(
    [property: JsonPropertyName("total")] int Total,
    [property: JsonPropertyName("tenant")] int Tenant,
    [property: JsonPropertyName("routes")] int Routes,
    [property: JsonPropertyName("contentRefs")] int ContentRefs,
    [property: JsonPropertyName("mediaRefs")] int MediaRefs,
    [property: JsonPropertyName("formConfigRefs")] int FormConfigRefs);

public sealed record ImportExecutionEntityMappingsDto(
    [property: JsonPropertyName("total")] int Total,
    [property: JsonPropertyName("tenant")] string Tenant,
    [property: JsonPropertyName("routeMappings")] IReadOnlyList<string> RouteMappings,
    [property: JsonPropertyName("contentMappings")] IReadOnlyList<string> ContentMappings,
    [property: JsonPropertyName("mediaReferenceMappings")] IReadOnlyList<string> MediaReferenceMappings,
    [property: JsonPropertyName("formConfigMappings")] IReadOnlyList<string> FormConfigMappings,
    [property: JsonPropertyName("createdOrUpdatedEntityIds")] IReadOnlyList<string> CreatedOrUpdatedEntityIds,
    [property: JsonPropertyName("counts")] ImportExecutionMappingCountsDto Counts);

public sealed record ImportExecutionReadbackCountComparisonDto(
    [property: JsonPropertyName("expected")] int Expected,
    [property: JsonPropertyName("actual")] int Actual,
    [property: JsonPropertyName("ok")] bool Ok);

public sealed record ImportExecutionReadbackCountsDto(
    [property: JsonPropertyName("routes")] ImportExecutionReadbackCountComparisonDto Routes,
    [property: JsonPropertyName("contentRefs")] ImportExecutionReadbackCountComparisonDto ContentRefs,
    [property: JsonPropertyName("mediaRefs")] ImportExecutionReadbackCountComparisonDto MediaRefs,
    [property: JsonPropertyName("formConfigRefs")] ImportExecutionReadbackCountComparisonDto FormConfigRefs);

public sealed record ImportExecutionReadbackDto(
    [property: JsonPropertyName("executionRunId")] string ExecutionRunId,
    [property: JsonPropertyName("readbackPlanId")] string ReadbackPlanId,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("targetStateExists")] bool TargetStateExists,
    [property: JsonPropertyName("counts")] ImportExecutionReadbackCountsDto Counts,
    [property: JsonPropertyName("hashOk")] bool HashOk,
    [property: JsonPropertyName("approvalOk")] bool ApprovalOk,
    [property: JsonPropertyName("targetOk")] bool TargetOk,
    [property: JsonPropertyName("noProhibitedActions")] bool NoProhibitedActions);

public sealed record ImportExecutionAuditDto(
    [property: JsonPropertyName("executionRunId")] string ExecutionRunId,
    [property: JsonPropertyName("auditTraceId")] string AuditTraceId,
    [property: JsonPropertyName("approvalManifestId")] string ApprovalManifestId,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("readbackPlanId")] string ReadbackPlanId,
    [property: JsonPropertyName("noGoResultId")] string NoGoResultId,
    [property: JsonPropertyName("evidenceChain")] IReadOnlyList<string> EvidenceChain);

public sealed record ImportExecutionRollbackDto(
    [property: JsonPropertyName("executionRunId")] string ExecutionRunId,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("abortEnabled")] bool AbortEnabled,
    [property: JsonPropertyName("rollbackEnabled")] bool RollbackEnabled,
    [property: JsonPropertyName("reason")] string Reason,
    [property: JsonPropertyName("readOnly")] bool ReadOnly);

public sealed record ImportExecutionRollerExclusionDto(
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("noGoConditions")] IReadOnlyList<string> NoGoConditions,
    [property: JsonPropertyName("importApproved")] bool ImportApproved,
    [property: JsonPropertyName("resumeApproved")] bool ResumeApproved,
    [property: JsonPropertyName("touchedByExecution")] bool TouchedByExecution);

public sealed record ImportExecutionIndexingStateDto(
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("googleSearchConsoleAction")] bool GoogleSearchConsoleAction,
    [property: JsonPropertyName("sitemapSubmitted")] bool SitemapSubmitted,
    [property: JsonPropertyName("urlInspectionApiCalled")] bool UrlInspectionApiCalled,
    [property: JsonPropertyName("googleIndexingApiCalled")] bool GoogleIndexingApiCalled,
    [property: JsonPropertyName("indexingRequestSubmitted")] bool IndexingRequestSubmitted,
    [property: JsonPropertyName("crawlOrOutboundLiveCheck")] bool CrawlOrOutboundLiveCheck);

public sealed record ImportExecutionOperatorPanelDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("mode")] string Mode);

public sealed record ImportExecutionApiRouteDto(
    [property: JsonPropertyName("method")] string Method,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("purpose")] string Purpose);

public sealed record ImportExecutionAdminProjectionDto(
    [property: JsonPropertyName("surface")] string Surface,
    [property: JsonPropertyName("runtimeImplementedInThisPhase")] bool RuntimeImplementedInThisPhase,
    [property: JsonPropertyName("writeControlsAllowed")] bool WriteControlsAllowed,
    [property: JsonPropertyName("primaryListKey")] string PrimaryListKey,
    [property: JsonPropertyName("detailPanels")] IReadOnlyList<string> DetailPanels);

public sealed record ImportExecutionElectronProjectionDto(
    [property: JsonPropertyName("surface")] string Surface,
    [property: JsonPropertyName("runtimeImplementedInThisPhase")] bool RuntimeImplementedInThisPhase,
    [property: JsonPropertyName("providerMode")] string ProviderMode);

public sealed record ImportExecutionSourceEvidenceDto(
    [property: JsonPropertyName("approvalManifestPath")] string ApprovalManifestPath,
    [property: JsonPropertyName("executionResultPath")] string ExecutionResultPath,
    [property: JsonPropertyName("readbackResultPath")] string ReadbackResultPath,
    [property: JsonPropertyName("rollerDryRunPath")] string RollerDryRunPath);

public sealed record ImportExecutionOperatorProjectionDto(
    [property: JsonPropertyName("schemaVersion")] string SchemaVersion,
    [property: JsonPropertyName("projectionId")] string ProjectionId,
    [property: JsonPropertyName("projectionMode")] string ProjectionMode,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("approvalManifestId")] string ApprovalManifestId,
    [property: JsonPropertyName("approvalManifest")] ImportExecutionApprovalManifestDto ApprovalManifest,
    [property: JsonPropertyName("packageIdentity")] ImportExecutionPackageIdentityDto PackageIdentity,
    [property: JsonPropertyName("executionRunId")] string ExecutionRunId,
    [property: JsonPropertyName("executionMode")] string ExecutionMode,
    [property: JsonPropertyName("executionStatus")] string ExecutionStatus,
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("targetBinding")] ImportExecutionTargetBindingDto TargetBinding,
    [property: JsonPropertyName("entityMappings")] ImportExecutionEntityMappingsDto EntityMappings,
    [property: JsonPropertyName("readbackResults")] ImportExecutionReadbackDto ReadbackResults,
    [property: JsonPropertyName("rollbackPlanId")] string RollbackPlanId,
    [property: JsonPropertyName("readbackPlanId")] string ReadbackPlanId,
    [property: JsonPropertyName("auditTraceId")] string AuditTraceId,
    [property: JsonPropertyName("audit")] ImportExecutionAuditDto Audit,
    [property: JsonPropertyName("rollback")] ImportExecutionRollbackDto Rollback,
    [property: JsonPropertyName("noGoConditions")] IReadOnlyList<ImportExecutionProjectionNoGoConditionDto> NoGoConditions,
    [property: JsonPropertyName("securityBoundary")] ImportExecutionProjectionSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("rollerExclusion")] ImportExecutionRollerExclusionDto RollerExclusion,
    [property: JsonPropertyName("indexingState")] ImportExecutionIndexingStateDto IndexingState,
    [property: JsonPropertyName("operatorPanels")] IReadOnlyList<ImportExecutionOperatorPanelDto> OperatorPanels,
    [property: JsonPropertyName("futureApiRoutes")] IReadOnlyList<ImportExecutionApiRouteDto> FutureApiRoutes,
    [property: JsonPropertyName("adminProjection")] ImportExecutionAdminProjectionDto AdminProjection,
    [property: JsonPropertyName("electronProjection")] ImportExecutionElectronProjectionDto ElectronProjection,
    [property: JsonPropertyName("postImportHardeningChecklist")] IReadOnlyList<ImportExecutionProjectionNextGateDto> PostImportHardeningChecklist,
    [property: JsonPropertyName("futureOlmStagingWriteRetryGoal")] ImportExecutionProjectionNextGateDto FutureOlmStagingWriteRetryGoal,
    [property: JsonPropertyName("warnings")] IReadOnlyList<ImportExecutionProjectionHealthMessageDto> Warnings,
    [property: JsonPropertyName("blockers")] IReadOnlyList<ImportExecutionProjectionHealthMessageDto> Blockers,
    [property: JsonPropertyName("nextGates")] IReadOnlyList<ImportExecutionProjectionNextGateDto> NextGates,
    [property: JsonPropertyName("futureActions")] IReadOnlyList<ImportExecutionProjectionFutureActionDto> FutureActions,
    [property: JsonPropertyName("sourceEvidence")] ImportExecutionSourceEvidenceDto SourceEvidence,
    [property: JsonPropertyName("generatedAt")] string GeneratedAt);

public sealed record ImportExecutionProjectionCountsDto(
    [property: JsonPropertyName("entityMappings")] int EntityMappings,
    [property: JsonPropertyName("routeMappings")] int RouteMappings,
    [property: JsonPropertyName("contentMappings")] int ContentMappings,
    [property: JsonPropertyName("mediaReferenceMappings")] int MediaReferenceMappings,
    [property: JsonPropertyName("formConfigMappings")] int FormConfigMappings,
    [property: JsonPropertyName("operatorPanels")] int OperatorPanels,
    [property: JsonPropertyName("futureApiRoutes")] int FutureApiRoutes,
    [property: JsonPropertyName("warnings")] int Warnings,
    [property: JsonPropertyName("blockers")] int Blockers,
    [property: JsonPropertyName("nextGates")] int NextGates);

public sealed record ImportExecutionProjectionSummaryDto(
    [property: JsonPropertyName("executionRunId")] string ExecutionRunId,
    [property: JsonPropertyName("projectionId")] string ProjectionId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("packageId")] string PackageId,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("approvalManifestId")] string ApprovalManifestId,
    [property: JsonPropertyName("executionStatus")] string ExecutionStatus,
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("readbackStatus")] string ReadbackStatus,
    [property: JsonPropertyName("hardStopState")] string HardStopState,
    [property: JsonPropertyName("rollerState")] string RollerState,
    [property: JsonPropertyName("indexingState")] string IndexingState,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("counts")] ImportExecutionProjectionCountsDto Counts,
    [property: JsonPropertyName("generatedAt")] string GeneratedAt)
{
    public static ImportExecutionProjectionSummaryDto From(ImportExecutionOperatorProjectionDto projection) => new(
        projection.ExecutionRunId,
        projection.ProjectionId,
        projection.TenantKey,
        projection.SiteKey,
        projection.PackageId,
        projection.PackageHash,
        projection.ApprovalManifestId,
        projection.ExecutionStatus,
        projection.TargetMode,
        projection.ReadbackResults.Status,
        projection.IndexingState.State,
        projection.RollerExclusion.State,
        projection.IndexingState.State,
        true,
        new ImportExecutionProjectionCountsDto(
            projection.EntityMappings.Total,
            projection.EntityMappings.RouteMappings.Count,
            projection.EntityMappings.ContentMappings.Count,
            projection.EntityMappings.MediaReferenceMappings.Count,
            projection.EntityMappings.FormConfigMappings.Count,
            projection.OperatorPanels.Count,
            projection.FutureApiRoutes.Count,
            projection.Warnings.Count,
            projection.Blockers.Count,
            projection.NextGates.Count),
        projection.GeneratedAt);
}

public sealed record ImportExecutionProjectionListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<ImportExecutionProjectionSummaryDto> Items);

public sealed class ImportExecutionProjectionApiQuery
{
    public string? TenantKey { get; set; }
    public string? SiteKey { get; set; }
    public string? TargetMode { get; set; }
    public string? ReadbackState { get; set; }
    public string? HardStopState { get; set; }
    public string? Search { get; set; }
}
