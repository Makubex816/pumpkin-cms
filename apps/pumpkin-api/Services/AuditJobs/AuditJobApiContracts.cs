using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class AuditJobApiProviderModes
{
    public const string LocalFixtureReadOnly = "api-local-fixture-readonly";
}

public static class AuditJobApiErrorCodes
{
    public const string Ok = "AUDIT_JOB_OK";
    public const string ScopeRequired = "AUDIT_JOB_SCOPE_REQUIRED";
    public const string AuthRequired = "AUDIT_JOB_AUTH_REQUIRED";
    public const string ForbiddenRole = "AUDIT_JOB_FORBIDDEN_ROLE";
    public const string ForbiddenTenant = "AUDIT_JOB_FORBIDDEN_TENANT";
    public const string ForbiddenSite = "AUDIT_JOB_FORBIDDEN_SITE";
    public const string InvalidFilter = "AUDIT_JOB_INVALID_FILTER";
    public const string InvalidPagination = "AUDIT_JOB_INVALID_PAGINATION";
    public const string ProviderNotConfigured = "AUDIT_JOB_PROVIDER_NOT_CONFIGURED";
    public const string ContractInvalid = "AUDIT_JOB_CONTRACT_INVALID";
}

public sealed record ReadOnlyApiEnvelopeDto<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("requestId")] string RequestId,
    [property: JsonPropertyName("correlationId")] string CorrelationId,
    [property: JsonPropertyName("providerMode")] string ProviderMode,
    [property: JsonPropertyName("readOnly")] bool ReadOnly,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("warnings")] IReadOnlyList<AuditJobWarningDto> Warnings,
    [property: JsonPropertyName("errors")] IReadOnlyList<AuditJobApiErrorDto> Errors,
    [property: JsonPropertyName("securityBoundary")] AuditJobSecurityBoundaryDto SecurityBoundary,
    [property: JsonPropertyName("source")] AuditJobSourceDto Source,
    [property: JsonPropertyName("tenantKey")] string? TenantKey,
    [property: JsonPropertyName("siteKey")] string? SiteKey,
    [property: JsonPropertyName("meta")] AuditJobApiMetaDto Meta)
{
    public static ReadOnlyApiEnvelopeDto<T> Success(
        T data,
        AuditJobReadOnlySnapshot snapshot,
        AuditJobApiMetaDto meta,
        string message)
        => new(
            true,
            StatusCodes.Status200OK,
            AuditJobApiErrorCodes.Ok,
            message,
            CreateRequestId(),
            snapshot.CorrelationId,
            AuditJobApiProviderModes.LocalFixtureReadOnly,
            true,
            data,
            snapshot.Warnings,
            Array.Empty<AuditJobApiErrorDto>(),
            snapshot.SecurityBoundary,
            snapshot.Source,
            snapshot.TenantKey,
            snapshot.SiteKey,
            meta);

    public static ReadOnlyApiEnvelopeDto<T> Error(
        string code,
        int status,
        string message,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<AuditJobApiErrorDto>? errors = null,
        AuditJobApiMetaDto? meta = null,
        IReadOnlyList<AuditJobWarningDto>? warnings = null)
        => new(
            false,
            status,
            code,
            message,
            CreateRequestId(),
            CreateCorrelationId(),
            AuditJobApiProviderModes.LocalFixtureReadOnly,
            true,
            default,
            warnings ?? Array.Empty<AuditJobWarningDto>(),
            errors ?? [new AuditJobApiErrorDto(code, message, null)],
            AuditJobSecurityBoundaryDto.LocalClosed(),
            AuditJobSourceDto.LocalFixture(),
            tenantKey,
            siteKey,
            meta ?? AuditJobApiMetaDto.LocalReadOnly());

    private static string CreateRequestId() => $"ajapi_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..32];

    private static string CreateCorrelationId() => $"corr_audit_jobs_api_{Guid.NewGuid():N}"[..32];
}

public sealed record AuditJobApiErrorDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("path")] string? Path);

public sealed record AuditJobApiMetaDto(
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
    [property: JsonPropertyName("googleIndexingState")] string GoogleIndexingState,
    [property: JsonPropertyName("pagination")] AuditJobPaginationMetaDto? Pagination = null,
    [property: JsonPropertyName("filters")] IReadOnlyDictionary<string, string?>? Filters = null)
{
    public static AuditJobApiMetaDto LocalReadOnly(
        string? sourceProviderMode = null,
        AuditJobPaginationMetaDto? pagination = null,
        IReadOnlyDictionary<string, string?>? filters = null,
        string contractSchemaVersion = "audit-job-ledger-readonly-api-envelope.v1")
        => new(
            "api-local-readonly-fixture",
            true,
            true,
            AuditJobApiProviderModes.LocalFixtureReadOnly,
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
            "deferred_hard_stop",
            pagination,
            filters);
}

public sealed record AuditJobPaginationMetaDto(
    [property: JsonPropertyName("page")] int Page,
    [property: JsonPropertyName("pageSize")] int PageSize,
    [property: JsonPropertyName("totalItems")] int TotalItems,
    [property: JsonPropertyName("totalPages")] int TotalPages,
    [property: JsonPropertyName("hasNextPage")] bool HasNextPage,
    [property: JsonPropertyName("hasPreviousPage")] bool HasPreviousPage);

public sealed record AuditJobSecurityBoundaryDto(
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("noWriteBoundarySatisfied")] bool NoWriteBoundarySatisfied,
    [property: JsonPropertyName("openFlags")] IReadOnlyList<string> OpenFlags,
    [property: JsonPropertyName("closedFlags")] IReadOnlyList<string> ClosedFlags)
{
    public static AuditJobSecurityBoundaryDto LocalClosed() => new(
        true,
        true,
        Array.Empty<string>(),
        [
            "deployment",
            "redeployment",
            "dnsChange",
            "customDomainMutation",
            "searchConsoleAction",
            "googleSitemapSubmission",
            "googleUrlInspectionApi",
            "googleIndexingApi",
            "indexingRequest",
            "crawlOrOutboundCheck",
            "contactFormSubmission",
            "contactEndpointPost",
            "cmsWrite",
            "mediaAssetWrite",
            "providerWrite",
            "azureMutation",
            "azureInfrastructureCreation",
            "azureInfrastructureMutation",
            "azureAppSettingsMutation",
            "rbacAssignment",
            "protectedConfigRead",
            "tokenUseOrPrint",
            "deploymentTokenUsed",
            "deploymentTokenPrintedOrExported",
            "oauthTokenUsedOrPrinted",
            "keyVaultSecretQuery",
            "keysListKeys",
            "connectionStringGenerated",
            "sasGenerated",
            "secretExport",
            "externalNetworkUsed",
            "writesPerformed"
        ]);
}

public sealed record AuditJobSourceDto(
    [property: JsonPropertyName("kind")] string Kind,
    [property: JsonPropertyName("fixturePath")] string FixturePath,
    [property: JsonPropertyName("ledgerSchemaVersion")] string? LedgerSchemaVersion,
    [property: JsonPropertyName("viewerModelVersion")] string? ViewerModelVersion,
    [property: JsonPropertyName("generatedFrom")] string? GeneratedFrom,
    [property: JsonPropertyName("runtimeHttpWarning")] string? RuntimeHttpWarning)
{
    public static AuditJobSourceDto LocalFixture() => new(
        "local_fixture",
        "deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json",
        "audit-job-ledger.v1",
        "audit-job-ledger-viewer.v1",
        "validated-ledger-viewer-model",
        null);
}

public sealed class AuditJobApiQuery
{
    public string? TenantKey { get; set; }
    public string? SiteKey { get; set; }
    public string? Type { get; set; }
    public string? EventType { get; set; }
    public string? JobType { get; set; }
    public string? GateType { get; set; }
    public string? Outcome { get; set; }
    public string? Status { get; set; }
    public string? State { get; set; }
    public string? Result { get; set; }
    public string? SourceRef { get; set; }
    public string? Field { get; set; }
    public string? AuditEventId { get; set; }
    public string? CorrelationId { get; set; }
    public string? Search { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}

public sealed record AuditJobNormalizedQuery(
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
    int PageSize);

public sealed record AuditJobViewerSummaryDto(
    [property: JsonPropertyName("summary")] JsonElement Summary,
    [property: JsonPropertyName("panels")] IReadOnlyList<AuditJobPanelDto> Panels,
    [property: JsonPropertyName("warnings")] IReadOnlyList<AuditJobWarningDto> Warnings,
    [property: JsonPropertyName("blockers")] IReadOnlyList<AuditJobBlockerDto> Blockers,
    [property: JsonPropertyName("nextGates")] IReadOnlyList<AuditJobNextGateDto> NextGates);

public sealed class AuditJobPanelDto : AuditJobJsonObjectDto
{
    public static AuditJobPanelDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class AuditEventDto : AuditJobJsonObjectDto
{
    public static AuditEventDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class JobRunDto : AuditJobJsonObjectDto
{
    public static JobRunDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class PromotionGateDto : AuditJobJsonObjectDto
{
    public static PromotionGateDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class EvidenceBindingDto : AuditJobJsonObjectDto
{
    public static EvidenceBindingDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class TraceEntryDto : AuditJobJsonObjectDto
{
    public static TraceEntryDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public sealed class AuditJobBlockerDto : AuditJobJsonObjectDto
{
    public static AuditJobBlockerDto From(JsonElement element) => new() { Properties = AuditJobJsonObjectDto.ToProperties(element) };
}

public abstract class AuditJobJsonObjectDto
{
    [JsonExtensionData]
    public Dictionary<string, JsonElement> Properties { get; init; } = [];

    public string? GetString(string propertyName)
    {
        if (!Properties.TryGetValue(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind == JsonValueKind.String ? value.GetString() : value.ToString();
    }

    public bool ContainsText(string value)
        => JsonSerializer.Serialize(Properties).Contains(value, StringComparison.OrdinalIgnoreCase);

    protected internal static Dictionary<string, JsonElement> ToProperties(JsonElement element)
    {
        var properties = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        foreach (var property in element.EnumerateObject())
        {
            properties[property.Name] = property.Value.Clone();
        }

        return properties;
    }
}

public sealed record AuditJobWarningDto(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("message")] string Message)
{
    public static AuditJobWarningDto From(JsonElement element) => new(
        ReadString(element, "code"),
        ReadString(element, "state"),
        ReadString(element, "severity"),
        ReadString(element, "message"));

    private static string ReadString(JsonElement element, string propertyName)
        => element.TryGetProperty(propertyName, out var value) ? value.GetString() ?? string.Empty : string.Empty;
}

public sealed record AuditJobNextGateDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("state")] string State,
    [property: JsonPropertyName("label")] string Label)
{
    public static AuditJobNextGateDto From(JsonElement element) => new(
        ReadString(element, "id"),
        ReadString(element, "state"),
        ReadString(element, "label"));

    private static string ReadString(JsonElement element, string propertyName)
        => element.TryGetProperty(propertyName, out var value) ? value.GetString() ?? string.Empty : string.Empty;
}

public sealed record AuditEventListDto([property: JsonPropertyName("items")] IReadOnlyList<AuditEventDto> Items);
public sealed record JobRunListDto([property: JsonPropertyName("items")] IReadOnlyList<JobRunDto> Items);
public sealed record PromotionGateListDto([property: JsonPropertyName("items")] IReadOnlyList<PromotionGateDto> Items);
public sealed record EvidenceBindingListDto([property: JsonPropertyName("items")] IReadOnlyList<EvidenceBindingDto> Items);
public sealed record TraceEntryListDto([property: JsonPropertyName("items")] IReadOnlyList<TraceEntryDto> Items);
public sealed record AuditJobBlockerListDto([property: JsonPropertyName("items")] IReadOnlyList<AuditJobBlockerDto> Items);
public sealed record AuditJobNextGateListDto([property: JsonPropertyName("items")] IReadOnlyList<AuditJobNextGateDto> Items);

public sealed record AuditJobLocalActor(
    string TenantKey,
    string SiteKey,
    string Role,
    bool IsAuthenticated)
{
    public static AuditJobLocalActor FromClaims(ClaimsPrincipal user)
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
        return new AuditJobLocalActor(
            NormalizeKey(tenantKey),
            NormalizeKey(siteKey),
            role.Trim(),
            user.Identity?.IsAuthenticated == true);
    }

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
}
