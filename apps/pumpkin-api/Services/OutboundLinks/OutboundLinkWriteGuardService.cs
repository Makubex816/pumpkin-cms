namespace pumpkin_api.Services;

public interface IOutboundLinkWriteGuardService
{
    OutboundLinkWriteGuardResult Evaluate(string action, OutboundLinkWriteRequest request, OutboundLinkWriteActor actor);
}

public sealed record OutboundLinkWriteGuardResult(
    bool Approved,
    string? Code,
    string? Message,
    string? BlockReason);

public sealed class OutboundLinkWriteGuardService : IOutboundLinkWriteGuardService
{
    private static readonly HashSet<string> BlockedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "Viewer",
        "BackupOperator"
    };

    public OutboundLinkWriteGuardResult Evaluate(string action, OutboundLinkWriteRequest request, OutboundLinkWriteActor actor)
    {
        var tenantKey = Normalize(request.TenantKey);
        var siteKey = Normalize(request.SiteKey);
        var providerMode = OutboundLinkWriteProviderModes.Normalize(request.ProviderMode);

        if (string.IsNullOrWhiteSpace(tenantKey) || string.IsNullOrWhiteSpace(siteKey))
        {
            return Block(OutboundLinkApiErrorCodes.InvalidFilter, "tenantKey and siteKey are required.", "missing tenant/site scope");
        }

        if (!actor.IsAuthenticated)
        {
            return Block(OutboundLinkWriteErrorCodes.ForbiddenRole, "actor is not authenticated.", "actor unauthenticated");
        }

        if (BlockedRoles.Contains(actor.ActorRole))
        {
            return Block(OutboundLinkWriteErrorCodes.ForbiddenRole, $"{actor.ActorRole} cannot mutate outbound links.", "role blocked");
        }

        if (!actor.ActorRole.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase)
            && !Normalize(actor.TenantKey).Equals(tenantKey, StringComparison.OrdinalIgnoreCase))
        {
            return Block(OutboundLinkWriteErrorCodes.ForbiddenTenant, "actor is not assigned to requested tenant.", "tenant mismatch");
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return Block(OutboundLinkApiErrorCodes.InvalidFilter, "reason is required.", "missing reason");
        }

        if (IsBulk(action) && string.IsNullOrWhiteSpace(request.ApprovalReference))
        {
            return Block(OutboundLinkWriteErrorCodes.BulkActionRequiresApproval, "bulk actions require approvalReference.", "bulk approval missing");
        }

        if (providerMode == OutboundLinkWriteProviderModes.LiveReadonly)
        {
            return Block(OutboundLinkWriteErrorCodes.WriteNotApproved, "live-readonly provider mode rejects write actions.", "live-readonly provider mode");
        }

        if (providerMode == OutboundLinkWriteProviderModes.LiveWriteApproved)
        {
            return Block(OutboundLinkWriteErrorCodes.LiveWriteBlocked, "live-write-approved provider mode is reserved for a future explicit approval.", "live-write-approved unavailable");
        }

        if (!OutboundLinkWriteProviderModes.IsLocalWriteMode(providerMode))
        {
            return Block(OutboundLinkWriteErrorCodes.ProviderNotConfigured, "provider mode is not configured for scoped write actions.", "provider not configured");
        }

        if (actor.ActorRole.Equals("Operator", StringComparison.OrdinalIgnoreCase)
            && action is not OutboundLinkWriteActions.CreateScanRun and not OutboundLinkWriteActions.BulkDomainDisable and not OutboundLinkWriteActions.BulkDomainRequireReview and not OutboundLinkWriteActions.BulkPageInstanceUpdate)
        {
            return Block(OutboundLinkWriteErrorCodes.ForbiddenRole, "Operator can only run scan or bulk preflight actions.", "operator action not allowed");
        }

        return new OutboundLinkWriteGuardResult(true, null, null, null);
    }

    private static bool IsBulk(string action)
        => action is OutboundLinkWriteActions.BulkDomainDisable
            or OutboundLinkWriteActions.BulkDomainRequireReview
            or OutboundLinkWriteActions.BulkPageInstanceUpdate;

    private static OutboundLinkWriteGuardResult Block(string code, string message, string reason)
        => new(false, code, message, reason);

    private static string Normalize(string? value) => (value ?? string.Empty).Trim().ToLowerInvariant();
}
