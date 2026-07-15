using Microsoft.Extensions.Options;

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
        })).RequireAuthorization().WithTags("Identity - Read Only");
        var current = endpoints.MapGroup("/api/identity/current").RequireAuthorization().WithTags("Identity - Current User");
        current.MapGet("/profile", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ProfileAsync(c, ct));
        current.MapGet("/memberships", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.CurrentMembershipsAsync(c, ct));
        current.MapPost("/switch-tenant", (SwitchTenantRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.SwitchTenantAsync(c, r, ct));
        current.MapPost("/login-email-change", DisabledBody<EmailChangeRequestDto>);
        current.MapPost("/login-email-change/confirm", DisabledBody<ConfirmEmailChangeRequest>);
        current.MapPost("/password", (ChangePasswordRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangePasswordAsync(c, r, ct));
        current.MapPost("/sessions/revoke", Disabled);

        var tenant = endpoints.MapGroup("/api/identity/tenants/{tenantUid}").RequireAuthorization().WithTags("Identity - Tenant");
        tenant.MapGet("/settings", Disabled);
        tenant.MapGet("/contact-settings", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ContactSettingsAsync(c, tenantUid, ct));
        tenant.MapPut("/contact-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct));
        tenant.MapPut("/notification-settings", (string tenantUid, ContactSettingsUpdate r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UpdateContactSettingsAsync(c, tenantUid, r, ct));
        tenant.MapPost("/rename/preflight", DisabledBody<RenamePreflightRequest>);
        tenant.MapPost("/rename", DisabledBody<RenameRequest>);
        tenant.MapGet("/rename/{jobId}", Disabled);
        tenant.MapPost("/rename/{jobId}/resume", Disabled);
        tenant.MapPost("/rename/{jobId}/rollback", Disabled);
        tenant.MapGet("/memberships", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantMembershipsAsync(c, tenantUid, ct));
        tenant.MapPost("/invitations", DisabledBody<InviteUserRequest>);
        tenant.MapPost("/memberships", (string tenantUid, AddMembershipRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.AddMembershipAsync(c, tenantUid, r, ct));
        tenant.MapPut("/memberships/{membershipId}/role", (string tenantUid, string membershipId, ChangeMembershipRoleRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangeMembershipRoleAsync(c, tenantUid, membershipId, r, ct));
        tenant.MapPut("/memberships/{membershipId}/status", (string tenantUid, string membershipId, ChangeMembershipStatusRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ChangeMembershipStatusAsync(c, tenantUid, membershipId, r, ct));
        tenant.MapPost("/memberships/transfer-tenant-admin", (string tenantUid, TransferTenantAdminRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TransferTenantAdminAsync(c, tenantUid, r, ct));
        tenant.MapDelete("/memberships/{membershipId}", Disabled);
        tenant.MapGet("/audit", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantAuditAsync(c, tenantUid, ct));

        var admin = endpoints.MapGroup("/api/identity/superadmin").RequireAuthorization().WithTags("Identity - SuperAdmin");
        admin.MapGet("/users", (HttpContext c, IdentityManagementService s, CancellationToken ct) => s.GlobalUsersAsync(c, ct));
        admin.MapGet("/tenants", Disabled);
        admin.MapGet("/users/{userId}/memberships", (string userId, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.UserMembershipsAsync(c, userId, ct));
        admin.MapGet("/tenants/{tenantUid}/memberships", (string tenantUid, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TenantMembershipsAsync(c, tenantUid, ct));
        admin.MapPost("/users/{userId}/email", (string userId, AdminEmailChangeRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.AdminEmailChangeAsync(c, userId, r, ct));
        admin.MapPost("/users/{userId}/password-reset", Disabled);
        admin.MapPost("/users/{userId}/temporary-password", (string userId, TemporaryPasswordRequest r, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.TemporaryPasswordAsync(c, userId, r, ct));
        admin.MapPost("/users/{userId}/force-sign-out", (string userId, HttpContext c, IdentityManagementService s, CancellationToken ct) => s.ForceSignOutAsync(c, userId, ct));
        admin.MapPost("/tenants/{tenantUid}/memberships", DisabledBody<AddMembershipRequest>);
        admin.MapPost("/tenants/{tenantUid}/rename", DisabledBody<RenameRequest>);
        admin.MapPost("/tenants/{tenantUid}/rename/{jobId}/resume", Disabled);
        admin.MapPost("/tenants/{tenantUid}/rename/{jobId}/rollback", Disabled);
        admin.MapPut("/tenants/{tenantUid}/contact-settings", DisabledBody<ContactSettingsUpdate>);
        admin.MapPut("/tenants/{tenantUid}/notification-settings", DisabledBody<ContactSettingsUpdate>);
        admin.MapGet("/audit", Disabled);
        admin.MapGet("/migration-conflicts", Disabled);
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
