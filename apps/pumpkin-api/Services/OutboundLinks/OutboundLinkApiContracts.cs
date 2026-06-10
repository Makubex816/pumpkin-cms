using System.Security.Claims;
using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class OutboundLinkApiErrorCodes
{
    public const string Ok = "OK";
    public const string LinkNotFound = "OUTBOUND_LINK_NOT_FOUND";
    public const string InstanceNotFound = "OUTBOUND_LINK_INSTANCE_NOT_FOUND";
    public const string PolicyNotFound = "OUTBOUND_LINK_POLICY_NOT_FOUND";
    public const string ForbiddenTenant = "OUTBOUND_LINK_FORBIDDEN_TENANT";
    public const string ForbiddenRole = "OUTBOUND_LINK_FORBIDDEN_ROLE";
    public const string WriteNotApproved = "OUTBOUND_LINK_WRITE_NOT_APPROVED";
    public const string InvalidFilter = "OUTBOUND_LINK_INVALID_FILTER";
    public const string InvalidSort = "OUTBOUND_LINK_INVALID_SORT";
    public const string InvalidPagination = "OUTBOUND_LINK_INVALID_PAGINATION";
    public const string StoreInvalid = "OUTBOUND_LINK_STORE_INVALID";
    public const string ProviderNotConfigured = "OUTBOUND_LINK_PROVIDER_NOT_CONFIGURED";
}

public sealed record OutboundLinkApiEnvelope<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("status")] int Status,
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("data")] T? Data,
    [property: JsonPropertyName("errors")] IReadOnlyList<OutboundLinkApiError> Errors,
    [property: JsonPropertyName("meta")] OutboundLinkApiMeta Meta,
    [property: JsonPropertyName("tenantKey")] string? TenantKey,
    [property: JsonPropertyName("siteKey")] string? SiteKey,
    [property: JsonPropertyName("requestId")] string RequestId)
{
    public static OutboundLinkApiEnvelope<T> Success(T data, string tenantKey, string siteKey, OutboundLinkApiMeta meta, string message)
        => new(
            true,
            StatusCodes.Status200OK,
            OutboundLinkApiErrorCodes.Ok,
            message,
            data,
            Array.Empty<OutboundLinkApiError>(),
            meta,
            tenantKey,
            siteKey,
            CreateRequestId());

    public static OutboundLinkApiEnvelope<T> Error(
        string code,
        int status,
        string message,
        string? tenantKey,
        string? siteKey,
        IReadOnlyList<OutboundLinkApiError>? errors = null,
        OutboundLinkApiMeta? meta = null)
        => new(
            false,
            status,
            code,
            message,
            default,
            errors ?? [new OutboundLinkApiError(code, message, null)],
            meta ?? OutboundLinkApiMeta.LocalReadOnly(),
            tenantKey,
            siteKey,
            CreateRequestId());

    private static string CreateRequestId() => $"olapi_{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}"[..32];
}

public sealed record OutboundLinkApiError(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("path")] string? Path);

public sealed record OutboundLinkApiMeta(
    [property: JsonPropertyName("mode")] string Mode,
    [property: JsonPropertyName("localOnly")] bool LocalOnly,
    [property: JsonPropertyName("externalHttpCrawling")] bool ExternalHttpCrawling,
    [property: JsonPropertyName("cmsApiCalls")] bool CmsApiCalls,
    [property: JsonPropertyName("cmsWrites")] bool CmsWrites,
    [property: JsonPropertyName("protectedConfigReads")] bool ProtectedConfigReads,
    [property: JsonPropertyName("pagination")] OutboundLinkPaginationMeta? Pagination = null,
    [property: JsonPropertyName("filters")] IReadOnlyDictionary<string, string?>? Filters = null,
    [property: JsonPropertyName("sort")] OutboundLinkSort? Sort = null)
{
    public static OutboundLinkApiMeta LocalReadOnly(
        OutboundLinkPaginationMeta? pagination = null,
        IReadOnlyDictionary<string, string?>? filters = null,
        OutboundLinkSort? sort = null)
        => new(
            "local-fake-readonly",
            true,
            false,
            false,
            false,
            false,
            pagination,
            filters,
            sort);
}

public sealed class OutboundLinkApiQuery
{
    public string? TenantKey { get; set; }
    public string? SiteKey { get; set; }
    public string? Domain { get; set; }
    public string? Status { get; set; }
    public string? PageId { get; set; }
    public string? AnchorText { get; set; }
    public string? FirstDetectedFrom { get; set; }
    public string? LastDetectedTo { get; set; }
    public bool? ReviewRequired { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    public string? Sort { get; set; }
    public string? SortDirection { get; set; }
}

public sealed record OutboundLinkNormalizedQuery(
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
    OutboundLinkSort Sort);

public sealed record OutboundLinkSort(
    [property: JsonPropertyName("field")] string Field,
    [property: JsonPropertyName("direction")] string Direction);

public sealed record OutboundLinkPaginationMeta(
    [property: JsonPropertyName("page")] int Page,
    [property: JsonPropertyName("pageSize")] int PageSize,
    [property: JsonPropertyName("totalItems")] int TotalItems,
    [property: JsonPropertyName("totalPages")] int TotalPages,
    [property: JsonPropertyName("hasNextPage")] bool HasNextPage,
    [property: JsonPropertyName("hasPreviousPage")] bool HasPreviousPage);

public sealed record OutboundLinkDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("originalUrl")] string OriginalUrl,
    [property: JsonPropertyName("normalizedUrl")] string NormalizedUrl,
    [property: JsonPropertyName("domain")] string Domain,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("createdAt")] DateTimeOffset CreatedAt,
    [property: JsonPropertyName("updatedAt")] DateTimeOffset UpdatedAt,
    [property: JsonPropertyName("firstDetectedAt")] DateTimeOffset FirstDetectedAt,
    [property: JsonPropertyName("lastDetectedAt")] DateTimeOffset LastDetectedAt,
    [property: JsonPropertyName("createdBy")] string CreatedBy,
    [property: JsonPropertyName("disabledBy")] string? DisabledBy,
    [property: JsonPropertyName("disabledAt")] DateTimeOffset? DisabledAt,
    [property: JsonPropertyName("disabledReason")] string? DisabledReason,
    [property: JsonPropertyName("instanceCount")] int InstanceCount,
    [property: JsonPropertyName("activeInstanceCount")] int ActiveInstanceCount,
    [property: JsonPropertyName("staleInstanceCount")] int StaleInstanceCount,
    [property: JsonPropertyName("pendingReviewCount")] int PendingReviewCount);

public sealed record OutboundLinkInstanceDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("outboundLinkId")] string OutboundLinkId,
    [property: JsonPropertyName("pageId")] string? PageId,
    [property: JsonPropertyName("contentType")] string ContentType,
    [property: JsonPropertyName("contentBlockId")] string? ContentBlockId,
    [property: JsonPropertyName("fieldName")] string FieldName,
    [property: JsonPropertyName("anchorText")] string? AnchorText,
    [property: JsonPropertyName("locationPath")] string LocationPath,
    [property: JsonPropertyName("isEnabled")] bool IsEnabled,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("firstDetectedAt")] DateTimeOffset FirstDetectedAt,
    [property: JsonPropertyName("lastDetectedAt")] DateTimeOffset LastDetectedAt,
    [property: JsonPropertyName("domain")] string? Domain,
    [property: JsonPropertyName("normalizedUrl")] string? NormalizedUrl);

public sealed record OutboundLinkPolicyDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("defaultDisabledBehavior")] string DefaultDisabledBehavior,
    [property: JsonPropertyName("defaultRel")] IReadOnlyList<string> DefaultRel,
    [property: JsonPropertyName("externalTargetBehavior")] string ExternalTargetBehavior,
    [property: JsonPropertyName("allowedDomains")] IReadOnlyList<string> AllowedDomains,
    [property: JsonPropertyName("blockedDomains")] IReadOnlyList<string> BlockedDomains,
    [property: JsonPropertyName("pendingReviewDomains")] IReadOnlyList<string> PendingReviewDomains,
    [property: JsonPropertyName("reviewRequiredForNewDomains")] bool ReviewRequiredForNewDomains,
    [property: JsonPropertyName("source")] string Source);

public sealed record OutboundLinkScanRunDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("mode")] string Mode,
    [property: JsonPropertyName("startedAt")] DateTimeOffset StartedAt,
    [property: JsonPropertyName("completedAt")] DateTimeOffset? CompletedAt,
    [property: JsonPropertyName("pagesScanned")] int PagesScanned,
    [property: JsonPropertyName("linksFound")] int LinksFound,
    [property: JsonPropertyName("newLinksFound")] int NewLinksFound,
    [property: JsonPropertyName("staleInstancesFound")] int StaleInstancesFound);

public sealed record OutboundLinkAuditLogDto(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("action")] string Action,
    [property: JsonPropertyName("recordType")] string RecordType,
    [property: JsonPropertyName("recordId")] string RecordId,
    [property: JsonPropertyName("actor")] string Actor,
    [property: JsonPropertyName("reason")] string? Reason,
    [property: JsonPropertyName("createdAt")] DateTimeOffset CreatedAt,
    [property: JsonPropertyName("mode")] string Mode);

public sealed record OutboundLinkListResponse(
    [property: JsonPropertyName("items")] IReadOnlyList<OutboundLinkDto> Items);

public sealed record OutboundLinkDetailResponse(
    [property: JsonPropertyName("link")] OutboundLinkDto Link,
    [property: JsonPropertyName("instances")] IReadOnlyList<OutboundLinkInstanceDto> Instances,
    [property: JsonPropertyName("activePolicy")] OutboundLinkPolicyDto? ActivePolicy);

public sealed record OutboundLinkInstanceListResponse(
    [property: JsonPropertyName("items")] IReadOnlyList<OutboundLinkInstanceDto> Items);

public sealed record OutboundLinkPolicyListResponse(
    [property: JsonPropertyName("activePolicyId")] string? ActivePolicyId,
    [property: JsonPropertyName("items")] IReadOnlyList<OutboundLinkPolicyDto> Items);

public sealed record OutboundLinkScanRunListResponse(
    [property: JsonPropertyName("items")] IReadOnlyList<OutboundLinkScanRunDto> Items);

public sealed record OutboundLinkAuditLogListResponse(
    [property: JsonPropertyName("items")] IReadOnlyList<OutboundLinkAuditLogDto> Items);

public sealed record OutboundLinkDashboardSummaryResponse(
    [property: JsonPropertyName("linkCount")] int LinkCount,
    [property: JsonPropertyName("instanceCount")] int InstanceCount,
    [property: JsonPropertyName("policyCount")] int PolicyCount,
    [property: JsonPropertyName("scanRunCount")] int ScanRunCount,
    [property: JsonPropertyName("auditLogCount")] int AuditLogCount,
    [property: JsonPropertyName("domainCount")] int DomainCount,
    [property: JsonPropertyName("domains")] IReadOnlyList<string> Domains,
    [property: JsonPropertyName("linksByStatus")] IReadOnlyDictionary<string, int> LinksByStatus,
    [property: JsonPropertyName("instancesByStatus")] IReadOnlyDictionary<string, int> InstancesByStatus,
    [property: JsonPropertyName("pendingReviewCount")] int PendingReviewCount,
    [property: JsonPropertyName("disabledLinkCount")] int DisabledLinkCount,
    [property: JsonPropertyName("domainBlockedLinkCount")] int DomainBlockedLinkCount,
    [property: JsonPropertyName("staleInstanceCount")] int StaleInstanceCount);

public sealed record OutboundLinkLocalActor(
    string TenantKey,
    string Role,
    bool IsAuthenticated)
{
    public static OutboundLinkLocalActor FromClaims(ClaimsPrincipal user)
    {
        var tenantKey = user.FindFirst("tenantId")?.Value ?? string.Empty;
        var role = user.FindFirst(ClaimTypes.Role)?.Value
            ?? user.FindFirst("role")?.Value
            ?? string.Empty;
        return new OutboundLinkLocalActor(
            tenantKey.Trim().ToLowerInvariant(),
            role.Trim(),
            user.Identity?.IsAuthenticated == true);
    }
}

