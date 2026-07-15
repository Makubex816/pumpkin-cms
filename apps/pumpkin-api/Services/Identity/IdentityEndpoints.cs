using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;

namespace pumpkin_api.Services.Identity;

public static class IdentityEndpoints
{
    public static IServiceCollection AddIdentityFoundation(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<IdentityFeatureOptions>(configuration.GetSection(IdentityFeatureOptions.SectionName));
        services.AddSingleton<IIdentityNotificationProvider, DisabledIdentityNotificationProvider>();
        services.AddSingleton<IIdentityLoginCompatibilityWriter, IdentityLoginCompatibilityWriter>();
        services.AddSingleton<IdentityManagementService>();
        return services;
    }

    public static IEndpointRouteBuilder MapIdentityFoundation(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/identity/feature-state", (IOptions<IdentityFeatureOptions> options) => Results.Ok(new
        {
            foundationEnabled = options.Value.Enabled,
            dualReadEnabled = options.Value.DualReadEnabled,
            dualWriteEnabled = options.Value.DualWriteEnabled,
            renameEnabled = options.Value.RenameExecutionEnabled,
            migrationExecutionEnabled = options.Value.MigrationExecutionEnabled,
            notificationProviderEnabled = options.Value.ExternalNotificationProviderEnabled
            , managementEnabled = options.Value.ManagementEnabled
            , tenantSwitcherEnabled = options.Value.TenantSwitcherEnabled
            , passwordAndSessionManagementEnabled = options.Value.PasswordAndSessionManagementEnabled
            , membershipManagementEnabled = options.Value.MembershipManagementEnabled
            , contactManagementEnabled = options.Value.ContactManagementEnabled
            , superAdminManagementEnabled = options.Value.SuperAdminManagementEnabled
            , providerAwareEmailRequestsEnabled = options.Value.ProviderAwareEmailRequestsEnabled
            , capacityDiagnosticsEnabled = options.Value.CapacityDiagnosticsEnabled
        })).RequireAuthorization().WithTags("Identity - Read Only");
        var current = endpoints.MapGroup("/api/identity/current").RequireAuthorization().WithTags("Identity - Current User");
        current.MapGet("/profile", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ProfileAsync(c, ct));
        current.MapGet("/memberships", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.CurrentMembershipsAsync(c, ct));
        current.MapPost("/switch-tenant", (SwitchTenantRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.SwitchTenantAsync(c, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        current.MapPost("/login-email-change", (EmailChangeRequestDto r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.RequestEmailChangeAsync(c, r, ct))
            .RequireRateLimiting("identity-credential-mutation");
        current.MapPost("/login-email-change/confirm", (ConfirmEmailChangeRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ConfirmEmailChangeAsync(c, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        current.MapPost("/password", (ChangePasswordRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangePasswordAsync(c, r, ct))
            .RequireRateLimiting("identity-credential-mutation");
        current.MapGet("/sessions", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.SessionsAsync(c, ct));
        current.MapPost("/sessions/revoke", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.RevokeSessionsAsync(c, ct));

        var tenant = endpoints.MapGroup("/api/identity/tenants/{tenantUid}").RequireAuthorization().WithTags("Identity - Tenant");
        tenant.MapGet("/settings", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantSettingsAsync(c, tenantUid, ct));
        tenant.MapGet("/contact-settings", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ContactSettingsAsync(c, tenantUid, ct));
        tenant.MapPut("/contact-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(131072));
        tenant.MapPut("/notification-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(131072));
        tenant.MapPost("/rename/preflight", DisabledBody<RenamePreflightRequest>)
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPost("/rename", DisabledBody<RenameRequest>)
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapGet("/rename/{jobId}", Disabled);
        tenant.MapPost("/rename/{jobId}/resume", Disabled);
        tenant.MapPost("/rename/{jobId}/rollback", Disabled);
        tenant.MapGet("/memberships", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantMembershipsAsync(c, tenantUid, ct));
        tenant.MapPost("/invitations", (string tenantUid, InviteUserRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.CreateInvitationAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPost("/invitations/{invitationId}/revoke", (string tenantUid, string invitationId, IdentityReasonRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.RevokeInvitationAsync(c, tenantUid, invitationId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPost("/memberships", (string tenantUid, AddMembershipRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.AddMembershipAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPut("/memberships/{membershipId}/role", (string tenantUid, string membershipId, ChangeMembershipRoleRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangeMembershipRoleAsync(c, tenantUid, membershipId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPut("/memberships/{membershipId}/status", (string tenantUid, string membershipId, ChangeMembershipStatusRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangeMembershipStatusAsync(c, tenantUid, membershipId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapPost("/memberships/transfer-tenant-admin", (string tenantUid, TransferTenantAdminRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TransferTenantAdminAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        tenant.MapDelete("/memberships/{membershipId}", (string tenantUid, string membershipId, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.RemoveMembershipAsync(c, tenantUid, membershipId, ct));
        tenant.MapGet("/audit", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantAuditAsync(c, tenantUid, ct));

        var admin = endpoints.MapGroup("/api/identity/superadmin").RequireAuthorization().WithTags("Identity - SuperAdmin");
        admin.MapGet("/users", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.GlobalUsersAsync(c, ct));
        admin.MapGet("/tenants", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.GlobalTenantsAsync(c, ct));
        admin.MapGet("/users/{userId}/memberships", (string userId, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UserMembershipsAsync(c, userId, ct));
        admin.MapGet("/tenants/{tenantUid}/memberships", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantMembershipsAsync(c, tenantUid, ct));
        admin.MapPost("/users/{userId}/email", (string userId, AdminEmailChangeRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.AdminEmailChangeAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/users/{userId}/password-reset", (string userId, AdminPasswordResetRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ResetPasswordAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096))
            .RequireRateLimiting("identity-credential-mutation");
        admin.MapPost("/users/{userId}/temporary-password", (string userId, TemporaryPasswordRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TemporaryPasswordAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096))
            .RequireRateLimiting("identity-credential-mutation");
        admin.MapPost("/users/{userId}/force-sign-out", (string userId, IdentityReasonRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ForceSignOutAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/users/{userId}/disable", (string userId, AdminAccountStateRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.DisableAccountAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/users/{userId}/restore", (string userId, AdminAccountStateRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.RestoreAccountAsync(c, userId, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/tenants/{tenantUid}/memberships", (string tenantUid, AddMembershipRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.AddMembershipAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/tenants/{tenantUid}/rename", DisabledBody<RenameRequest>)
            .WithMetadata(new RequestSizeLimitAttribute(4096));
        admin.MapPost("/tenants/{tenantUid}/rename/{jobId}/resume", Disabled);
        admin.MapPost("/tenants/{tenantUid}/rename/{jobId}/rollback", Disabled);
        admin.MapPut("/tenants/{tenantUid}/contact-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(131072));
        admin.MapPut("/tenants/{tenantUid}/notification-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct))
            .WithMetadata(new RequestSizeLimitAttribute(131072));
        admin.MapGet("/audit", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.GlobalAuditAsync(c, ct));
        admin.MapGet("/migration-conflicts", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.MigrationConflictsAsync(c, ct));
        return endpoints;
    }

    private static IResult Disabled(HttpContext context, IOptions<IdentityFeatureOptions> options) =>
        FeatureResult(context, options.Value);

    private static IResult DisabledBody<T>(T _, HttpContext context, IOptions<IdentityFeatureOptions> options) =>
        FeatureResult(context, options.Value);

    private static IResult FeatureResult(HttpContext context, IdentityFeatureOptions options)
    {
        if (!options.Enabled)
            return Results.NotFound(new IdentityError("identity_feature_disabled", "Identity management is not active.", context.TraceIdentifier));
        return Results.StatusCode(StatusCodes.Status501NotImplemented);
    }
}
