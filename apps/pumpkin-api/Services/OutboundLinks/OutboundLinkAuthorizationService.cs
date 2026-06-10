namespace pumpkin_api.Services;

public interface IOutboundLinkAuthorizationService
{
    OutboundLinkApiEnvelope<object>? AuthorizeRead(OutboundLinkLocalActor actor, string tenantKey, string siteKey);
}

public sealed class OutboundLinkAuthorizationService : IOutboundLinkAuthorizationService
{
    private static readonly HashSet<string> ReadRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "SuperAdmin",
        "TenantAdmin",
        "Operator",
        "ContentEditor",
        "Viewer",
        "BackupOperator"
    };

    public OutboundLinkApiEnvelope<object>? AuthorizeRead(OutboundLinkLocalActor actor, string tenantKey, string siteKey)
    {
        if (!actor.IsAuthenticated)
        {
            return OutboundLinkApiEnvelope<object>.Error(
                OutboundLinkApiErrorCodes.ForbiddenRole,
                StatusCodes.Status401Unauthorized,
                "Authentication is required.",
                tenantKey,
                siteKey);
        }

        if (string.IsNullOrWhiteSpace(actor.Role) || !ReadRoles.Contains(actor.Role))
        {
            return OutboundLinkApiEnvelope<object>.Error(
                OutboundLinkApiErrorCodes.ForbiddenRole,
                StatusCodes.Status403Forbidden,
                "The authenticated role cannot read outbound links.",
                tenantKey,
                siteKey);
        }

        if (string.Equals(actor.Role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (!string.Equals(actor.TenantKey, tenantKey, StringComparison.OrdinalIgnoreCase))
        {
            return OutboundLinkApiEnvelope<object>.Error(
                OutboundLinkApiErrorCodes.ForbiddenTenant,
                StatusCodes.Status403Forbidden,
                "The authenticated tenant cannot read the requested outbound link scope.",
                tenantKey,
                siteKey);
        }

        return null;
    }
}

