using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class OperatorHandoffApiProviderModes
{
    public const string LocalFixtureReadOnly = "api-local-operator-handoff-readonly";
}

public static class OperatorHandoffApiErrorCodes
{
    public const string Ok = "OPERATOR_HANDOFF_OK";
    public const string HandoffNotFound = "OPERATOR_HANDOFF_NOT_FOUND";
    public const string ProviderNotConfigured = "OPERATOR_HANDOFF_PROVIDER_NOT_CONFIGURED";
    public const string ContractInvalid = "OPERATOR_HANDOFF_CONTRACT_INVALID";
}

public static class OperatorHandoffContractVersions
{
    public const string ReadOnlyApiEnvelope = "pumpkin.operatorHandoffReadonlyApiEnvelope.v1";
    public const string SharedConsumerModel = "pumpkin.operatorHandoffConsumer.v1";
}

public sealed record OperatorHandoffReadOnlyApiEnvelopeDto<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("warnings")] IReadOnlyList<OperatorHandoffMessageDto> Warnings,
    [property: JsonPropertyName("errors")] IReadOnlyList<OperatorHandoffApiErrorDto> Errors,
    [property: JsonPropertyName("securityBoundary")] OperatorHandoffSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("source")] OperatorHandoffSourceDto Source,
    [property: JsonPropertyName("tenantKey")] string? TenantKey,
    [property: JsonPropertyName("siteKey")] string? SiteKey,
    [property: JsonPropertyName("meta")] OperatorHandoffApiMetaDto Meta)
{
    public static OperatorHandoffReadOnlyApiEnvelopeDto<T> Success(
        T data,
        string message,
        string correlationId,
        OperatorHandoffSecurityBoundaryDto securityBoundary,
        OperatorHandoffSourceDto source,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<OperatorHandoffMessageDto>? warnings = null,
        string? sourceProviderMode = null)
        => new(
            true,
            StatusCodes.Status200OK,
            OperatorHandoffApiErrorCodes.Ok,
            message,
            CreateRequestId(),
            correlationId,
            OperatorHandoffApiProviderModes.LocalFixtureReadOnly,
            true,
            data,
            warnings ?? Array.Empty<OperatorHandoffMessageDto>(),
            Array.Empty<OperatorHandoffApiErrorDto>(),
            securityBoundary,
            source,
            tenantKey,
            siteKey,
            OperatorHandoffApiMetaDto.LocalReadOnly(sourceProviderMode));

    public static OperatorHandoffReadOnlyApiEnvelopeDto<T> Error(
        string code,
        int status,
        string message,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<OperatorHandoffApiErrorDto>? errors = null)
        => new(
            false,
            status,
            code,
            message,
            CreateRequestId(),
            CreateCorrelationId(),
            OperatorHandoffApiProviderModes.LocalFixtureReadOnly,
            true,
            default,
            Array.Empty<OperatorHandoffMessageDto>(),
            errors ?? [new OperatorHandoffApiErrorDto(code, message, null)],
            OperatorHandoffSecurityBoundaryDto.LocalClosed(),
            OperatorHandoffSourceDto.LocalHandoffFixtures(),
            tenantKey,
            siteKey,
            OperatorHandoffApiMetaDto.LocalReadOnly());

    private static string CreateRequestId() => $"ohapi_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..32];

    private static string CreateCorrelationId() => $"corr_operator_handoff_{Guid.NewGuid():N}"[..32];
}

public sealed record OperatorHandoffApiErrorDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("path")] string? Path);

public sealed record OperatorHandoffApiMetaDto(
    [property: JsonPropertyName("mode")] string Mode,
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("sourceProviderMode")] string? SourceProviderMode,
    [property: JsonPropertyName("contractSchemaVersion")] string ContractSchemaVersion,
    [property: JsonPropertyName("allowedMethods")] IReadOnlyList<string> AllowedMethods,
    [property: JsonPropertyName("mutationMethodsAllowed")] bool MutationMethodsAllowed,
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
    [property: JsonPropertyName("tenantImportExecution")] bool TenantImportExecution,
    [property: JsonPropertyName("liveTenantCreation")] bool LiveTenantCreation,
    [property: JsonPropertyName("rollerResume")] bool RollerResume,
    [property: JsonPropertyName("olmStagingWrite")] bool OlmStagingWrite)
{
    public static OperatorHandoffApiMetaDto LocalReadOnly(string? sourceProviderMode = null) => new(
        "api-local-readonly-operator-handoff",
        true,
        true,
        OperatorHandoffApiProviderModes.LocalFixtureReadOnly,
        sourceProviderMode,
        OperatorHandoffContractVersions.ReadOnlyApiEnvelope,
        ["GET"],
        false,
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
        false,
        false);
}

public sealed record OperatorHandoffSourceDto(
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("fixturePaths")] IReadOnlyList<string> FixturePaths,
    [property: JsonPropertyName("phaseResultPath")] string PhaseResultPath,
    [property: JsonPropertyName("evidencePaths")] IReadOnlyList<string> EvidencePaths)
{
    public static OperatorHandoffSourceDto LocalHandoffFixtures() => new(
        "local_v2_12_1_operator_handoff_fixtures",
        [
            "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-operator-handoff-ice.operator-handoff.json",
            "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-operator-handoff-roller-paused.operator-handoff.json"
        ],
        "deployment/architecture/multi-tenant-onboarding/v2-12-2-operator-handoff-readonly-consumer-contract-planning-result",
        [
            "deployment/architecture/multi-tenant-onboarding/v2-12-1-operator-handoff-fixture-parity-hardening-result/result-manifest.json",
            "deployment/architecture/multi-tenant-onboarding/v2-12-2-operator-handoff-readonly-consumer-contract-planning-result/result-manifest.json",
            "deployment/architecture/multi-tenant-onboarding/v2-11-10-import-execution-operator-projection-runtime-signoff-closeout-result/result-manifest.json"
        ]);
}

public sealed record OperatorHandoffSecurityBoundaryDto(
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("noWriteBoundarySatisfied")] bool NoWriteBoundarySatisfied,
    [property: JsonPropertyName("openFlags")] IReadOnlyList<string> OpenFlags,
    [property: JsonPropertyName("closedFlags")] IReadOnlyList<string> ClosedFlags,
    [property: JsonPropertyName("prohibitedActionFlags")] IReadOnlyDictionary<string, bool> ProhibitedActionFlags)
{
    public static OperatorHandoffSecurityBoundaryDto LocalClosed() => new(
        true,
        true,
        Array.Empty<string>(),
        [
            "tenantImportExecution",
            "liveTenantCreation",
            "rollerImport",
            "rollerResume",
            "cmsWrites",
            "providerWrites",
            "mediaAssetWrites",
            "liveProviderIntegration",
            "olmStagingWrite",
            "deployment",
            "redeployment",
            "dnsMutation",
            "customDomainMutation",
            "googleIndexingAction",
            "contactPost",
            "azureMutation",
            "rbacAssignment",
            "protectedConfigRead",
            "secretsIncluded",
            "compressedArchiveCreated",
            "crawlOrOutboundLiveCheck",
            "electronRuntime"
        ],
        ProhibitedActionFlagsClosed());

    public static IReadOnlyDictionary<string, bool> ProhibitedActionFlagsClosed() => new Dictionary<string, bool>
    {
        ["tenantImportExecution"] = false,
        ["liveTenantCreation"] = false,
        ["rollerImport"] = false,
        ["rollerResume"] = false,
        ["cmsWrites"] = false,
        ["providerWrites"] = false,
        ["mediaAssetWrites"] = false,
        ["olmStagingWrite"] = false,
        ["deployment"] = false,
        ["dnsMutation"] = false,
        ["googleIndexingAction"] = false,
        ["contactPost"] = false,
        ["azureMutation"] = false,
        ["rbacAssignment"] = false,
        ["protectedConfigRead"] = false,
        ["secretsIncluded"] = false,
        ["compressedArchiveCreated"] = false,
        ["electronRuntime"] = false
    };
}

public sealed record OperatorHandoffMessageDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("message")] string Message);

public sealed record OperatorHandoffReadbackComparisonDto(
    [property: JsonPropertyName("expected")] int Expected,
    [property: JsonPropertyName("actual")] int Actual,
    [property: JsonPropertyName("ok")] bool Ok);

public sealed record OperatorHandoffReadbackSummaryDto(
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("routes")] OperatorHandoffReadbackComparisonDto Routes,
    [property: JsonPropertyName("contentRefs")] OperatorHandoffReadbackComparisonDto ContentRefs,
    [property: JsonPropertyName("mediaRefs")] OperatorHandoffReadbackComparisonDto MediaRefs,
    [property: JsonPropertyName("formConfigs")] OperatorHandoffReadbackComparisonDto FormConfigs);

public sealed record OperatorHandoffEntityMappingSummaryDto(
    [property: JsonPropertyName("total")] int Total,
    [property: JsonPropertyName("tenant")] int Tenant,
    [property: JsonPropertyName("routes")] int Routes,
    [property: JsonPropertyName("contentRefs")] int ContentRefs,
    [property: JsonPropertyName("mediaRefs")] int MediaRefs,
    [property: JsonPropertyName("formConfigs")] int FormConfigs);

public sealed record OperatorHandoffProjectionRefDto(
    [property: JsonPropertyName("projectionId")] string ProjectionId,
    [property: JsonPropertyName("schemaVersion")] string SchemaVersion,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("panelCount")] int PanelCount,
    [property: JsonPropertyName("futureApiRouteCount")] int FutureApiRouteCount,
    [property: JsonPropertyName("apiRouteBase")] string ApiRouteBase,
    [property: JsonPropertyName("adminRoute")] string AdminRoute);

public sealed record OperatorHandoffRefDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("sourcePhase")] string SourcePhase,
    [property: JsonPropertyName("sourcePath")] string SourcePath,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("redaction")] string Redaction,
    [property: JsonPropertyName("notes")] string Notes);

public sealed record OperatorHandoffParityStatusDto(
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("contractOk")] bool ContractOk,
    [property: JsonPropertyName("validator")] string Validator,
    [property: JsonPropertyName("requiredPacketFieldCount")] int RequiredPacketFieldCount,
    [property: JsonPropertyName("requiredConsumerFieldCount")] int RequiredConsumerFieldCount,
    [property: JsonPropertyName("failureCount")] int FailureCount,
    [property: JsonPropertyName("failures")] IReadOnlyList<string> Failures,
    [property: JsonPropertyName("warnings")] IReadOnlyList<string> Warnings);

public sealed record OperatorHandoffPolicyComplianceDto(
    [property: JsonPropertyName("noSecrets")] bool NoSecrets,
    [property: JsonPropertyName("noProtectedConfig")] bool NoProtectedConfig,
    [property: JsonPropertyName("noCompressedArchive")] bool NoCompressedArchive,
    [property: JsonPropertyName("noIndexingAction")] bool NoIndexingAction,
    [property: JsonPropertyName("noWriteAction")] bool NoWriteAction,
    [property: JsonPropertyName("noElectronRuntime")] bool NoElectronRuntime);

public sealed record OperatorHandoffRedactionPolicyDto(
    [property: JsonPropertyName("secretsPolicy")] string SecretsPolicy,
    [property: JsonPropertyName("protectedConfigPolicy")] string ProtectedConfigPolicy,
    [property: JsonPropertyName("archivePolicy")] string ArchivePolicy,
    [property: JsonPropertyName("piiPolicy")] string PiiPolicy);

public sealed record OperatorHandoffFutureActionDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("disabled")] bool Disabled,
    [property: JsonPropertyName("reason")] string Reason);

public sealed record OperatorHandoffAdminPanelDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("mode")] string Mode);

public sealed record OperatorHandoffApiRouteDto(
    [property: JsonPropertyName("method")] string Method,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("purpose")] string Purpose);

public sealed record OperatorHandoffConsumerDto(
    [property: JsonPropertyName("schemaVersion")] string SchemaVersion,
    [property: JsonPropertyName("consumerMode")] string ConsumerMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("handoffPacketId")] string HandoffPacketId,
    [property: JsonPropertyName("packetType")] string PacketType,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("domain")] string Domain,
    [property: JsonPropertyName("tenantState")] string TenantState,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("approvalManifestId")] string? ApprovalManifestId,
    [property: JsonPropertyName("executionRunId")] string? ExecutionRunId,
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("readbackSummary")] OperatorHandoffReadbackSummaryDto ReadbackSummary,
    [property: JsonPropertyName("entityMappingSummary")] OperatorHandoffEntityMappingSummaryDto EntityMappingSummary,
    [property: JsonPropertyName("operatorProjectionRef")] OperatorHandoffProjectionRefDto OperatorProjectionRef,
    [property: JsonPropertyName("backupCenterRefs")] IReadOnlyList<OperatorHandoffRefDto> BackupCenterRefs,
    [property: JsonPropertyName("resourceRegistryRefs")] IReadOnlyList<OperatorHandoffRefDto> ResourceRegistryRefs,
    [property: JsonPropertyName("providerProfileRefs")] IReadOnlyList<OperatorHandoffRefDto> ProviderProfileRefs,
    [property: JsonPropertyName("runtimeQaRefs")] IReadOnlyList<OperatorHandoffRefDto> RuntimeQaRefs,
    [property: JsonPropertyName("auditJobRefs")] IReadOnlyList<OperatorHandoffRefDto> AuditJobRefs,
    [property: JsonPropertyName("olmCarryforwardRefs")] IReadOnlyList<OperatorHandoffRefDto> OlmCarryforwardRefs,
    [property: JsonPropertyName("parityStatus")] OperatorHandoffParityStatusDto ParityStatus,
    [property: JsonPropertyName("policyCompliance")] OperatorHandoffPolicyComplianceDto PolicyCompliance,
    [property: JsonPropertyName("hardStops")] IReadOnlyList<string> HardStops,
    [property: JsonPropertyName("deferredGates")] IReadOnlyList<string> DeferredGates,
    [property: JsonPropertyName("securityBoundary")] OperatorHandoffSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("redactionPolicy")] OperatorHandoffRedactionPolicyDto RedactionPolicy,
    [property: JsonPropertyName("warnings")] IReadOnlyList<OperatorHandoffMessageDto> Warnings,
    [property: JsonPropertyName("blockers")] IReadOnlyList<OperatorHandoffMessageDto> Blockers,
    [property: JsonPropertyName("nextGates")] IReadOnlyList<OperatorHandoffMessageDto> NextGates,
    [property: JsonPropertyName("generatedAt")] string GeneratedAt,
    [property: JsonPropertyName("adminPanels")] IReadOnlyList<OperatorHandoffAdminPanelDto> AdminPanels,
    [property: JsonPropertyName("futureApiRoutes")] IReadOnlyList<OperatorHandoffApiRouteDto> FutureApiRoutes,
    [property: JsonPropertyName("futureActions")] IReadOnlyList<OperatorHandoffFutureActionDto> FutureActions);

public sealed record OperatorHandoffSummaryDto(
    [property: JsonPropertyName("handoffPacketId")] string HandoffPacketId,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("domain")] string Domain,
    [property: JsonPropertyName("tenantState")] string TenantState,
    [property: JsonPropertyName("packetType")] string PacketType,
    [property: JsonPropertyName("packageHash")] string PackageHash,
    [property: JsonPropertyName("approvalManifestId")] string? ApprovalManifestId,
    [property: JsonPropertyName("executionRunId")] string? ExecutionRunId,
    [property: JsonPropertyName("targetMode")] string TargetMode,
    [property: JsonPropertyName("parityState")] string ParityState,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("hardStopCount")] int HardStopCount,
    [property: JsonPropertyName("deferredGateCount")] int DeferredGateCount,
    [property: JsonPropertyName("nextGateCount")] int NextGateCount,
    [property: JsonPropertyName("generatedAt")] string GeneratedAt)
{
    public static OperatorHandoffSummaryDto From(OperatorHandoffConsumerDto handoff) => new(
        handoff.HandoffPacketId,
        handoff.TenantKey,
        handoff.SiteKey,
        handoff.Domain,
        handoff.TenantState,
        handoff.PacketType,
        handoff.PackageHash,
        handoff.ApprovalManifestId,
        handoff.ExecutionRunId,
        handoff.TargetMode,
        handoff.ParityStatus.State,
        true,
        handoff.HardStops.Count,
        handoff.DeferredGates.Count,
        handoff.NextGates.Count,
        handoff.GeneratedAt);
}

public sealed record OperatorHandoffListDto(
    [property: JsonPropertyName("items")] IReadOnlyList<OperatorHandoffSummaryDto> Items);

public sealed record OperatorHandoffEvidenceDto(
    [property: JsonPropertyName("handoffPacketId")] string HandoffPacketId,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("readbackSummary")] OperatorHandoffReadbackSummaryDto ReadbackSummary,
    [property: JsonPropertyName("entityMappingSummary")] OperatorHandoffEntityMappingSummaryDto EntityMappingSummary,
    [property: JsonPropertyName("operatorProjectionRef")] OperatorHandoffProjectionRefDto OperatorProjectionRef,
    [property: JsonPropertyName("backupCenterRefs")] IReadOnlyList<OperatorHandoffRefDto> BackupCenterRefs,
    [property: JsonPropertyName("resourceRegistryRefs")] IReadOnlyList<OperatorHandoffRefDto> ResourceRegistryRefs,
    [property: JsonPropertyName("providerProfileRefs")] IReadOnlyList<OperatorHandoffRefDto> ProviderProfileRefs,
    [property: JsonPropertyName("runtimeQaRefs")] IReadOnlyList<OperatorHandoffRefDto> RuntimeQaRefs,
    [property: JsonPropertyName("auditJobRefs")] IReadOnlyList<OperatorHandoffRefDto> AuditJobRefs,
    [property: JsonPropertyName("olmCarryforwardRefs")] IReadOnlyList<OperatorHandoffRefDto> OlmCarryforwardRefs);

public sealed record OperatorHandoffConsumerProjectionDto(
    [property: JsonPropertyName("handoff")] OperatorHandoffConsumerDto Handoff,
    [property: JsonPropertyName("adminPanels")] IReadOnlyList<OperatorHandoffAdminPanelDto> AdminPanels,
    [property: JsonPropertyName("futureApiRoutes")] IReadOnlyList<OperatorHandoffApiRouteDto> FutureApiRoutes,
    [property: JsonPropertyName("futureActions")] IReadOnlyList<OperatorHandoffFutureActionDto> FutureActions);

public sealed record OperatorHandoffQaChecklistDto(
    [property: JsonPropertyName("handoffPacketId")] string HandoffPacketId,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("checks")] IReadOnlyList<OperatorHandoffQaCheckDto> Checks,
    [property: JsonPropertyName("disabledActions")] IReadOnlyList<OperatorHandoffFutureActionDto> DisabledActions);

public sealed record OperatorHandoffQaCheckDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("notes")] string Notes);

public sealed class OperatorHandoffApiQuery
{
    public string? TenantKey { get; set; }
    public string? TenantState { get; set; }
    public string? ParityState { get; set; }
    public string? TargetMode { get; set; }
    public string? Search { get; set; }
    public string? Sort { get; set; }
}
