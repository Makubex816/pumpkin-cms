namespace pumpkin_api.Services;

public interface IAuditJobAuthorizationService
{
    AuditJobAuthorizationFailure? AuthorizeRead(AuditJobLocalActor actor, string tenantKey, string siteKey);
}

public sealed class AuditJobAuthorizationService : IAuditJobAuthorizationService
{
    private static readonly HashSet<string> ReadRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Viewer",
        "Operator",
        "TenantAdmin",
        "SuperAdmin",
        "BackupOperator"
    };

    public AuditJobAuthorizationFailure? AuthorizeRead(AuditJobLocalActor actor, string tenantKey, string siteKey)
    {
        if (!actor.IsAuthenticated)
        {
            return new AuditJobAuthorizationFailure(
                AuditJobApiErrorCodes.AuthRequired,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                tenantKey,
                siteKey);
        }

        if (string.IsNullOrWhiteSpace(actor.Role) || !ReadRoles.Contains(actor.Role))
        {
            return new AuditJobAuthorizationFailure(
                AuditJobApiErrorCodes.ForbiddenRole,
                StatusCodes.Status403Forbidden,
                "The authenticated role cannot read Audit Jobs data.",
                tenantKey,
                siteKey);
        }

        if (string.Equals(actor.Role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (!string.Equals(actor.TenantKey, tenantKey, StringComparison.OrdinalIgnoreCase))
        {
            return new AuditJobAuthorizationFailure(
                AuditJobApiErrorCodes.ForbiddenTenant,
                StatusCodes.Status403Forbidden,
                "The authenticated tenant cannot read the requested Audit Jobs scope.",
                tenantKey,
                siteKey);
        }

        if (!string.IsNullOrWhiteSpace(actor.SiteKey) && !string.Equals(actor.SiteKey, siteKey, StringComparison.OrdinalIgnoreCase))
        {
            return new AuditJobAuthorizationFailure(
                AuditJobApiErrorCodes.ForbiddenSite,
                StatusCodes.Status403Forbidden,
                "The authenticated site cannot read the requested Audit Jobs scope.",
                tenantKey,
                siteKey);
        }

        return null;
    }
}

public sealed record AuditJobAuthorizationFailure(
    string Code,
    int Status,
    string Message,
    string TenantKey,
    string SiteKey)
{
    public ReadOnlyApiEnvelopeDto<T> ToEnvelope<T>() => ReadOnlyApiEnvelopeDto<T>.Error(
        Code,
        Status,
        Message,
        TenantKey,
        SiteKey);
}
