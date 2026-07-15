using Microsoft.Extensions.Options;

namespace pumpkin_api.Services.Identity;

public static class IdentityEndpoints
{
    public static IServiceCollection AddIdentityFoundation(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<IdentityFeatureOptions>(configuration.GetSection(IdentityFeatureOptions.SectionName));
        services.AddSingleton<IIdentityNotificationProvider, DisabledIdentityNotificationProvider>();
        services.AddSingleton<IIdentityLoginCompatibilityWriter, IdentityLoginCompatibilityWriter>();
        return services;
    }

    public static IEndpointRouteBuilder MapIdentityFoundation(this IEndpointRouteBuilder endpoints)
    {
        var current = endpoints.MapGroup("/api/identity/current").RequireAuthorization().WithTags("Identity - Current User");
        current.MapGet("/profile", Disabled);
        current.MapGet("/memberships", Disabled);
        current.MapPost("/switch-tenant", DisabledBody<SwitchTenantRequest>);
        current.MapPost("/login-email-change", DisabledBody<EmailChangeRequestDto>);
        current.MapPost("/login-email-change/confirm", DisabledBody<ConfirmEmailChangeRequest>);
        current.MapPost("/password", DisabledBody<ChangePasswordRequest>);
        current.MapPost("/sessions/revoke", Disabled);

        var tenant = endpoints.MapGroup("/api/identity/tenants/{tenantUid}").RequireAuthorization().WithTags("Identity - Tenant");
        tenant.MapGet("/settings", Disabled);
        tenant.MapGet("/contact-settings", Disabled);
        tenant.MapPut("/contact-settings", DisabledBody<ContactSettingsUpdate>);
        tenant.MapPut("/notification-settings", DisabledBody<ContactSettingsUpdate>);
        tenant.MapPost("/rename/preflight", DisabledBody<RenamePreflightRequest>);
        tenant.MapPost("/rename", DisabledBody<RenameRequest>);
        tenant.MapGet("/rename/{jobId}", Disabled);
        tenant.MapPost("/rename/{jobId}/resume", Disabled);
        tenant.MapPost("/rename/{jobId}/rollback", Disabled);
        tenant.MapGet("/memberships", Disabled);
        tenant.MapPost("/invitations", DisabledBody<InviteUserRequest>);
        tenant.MapPost("/memberships", DisabledBody<AddMembershipRequest>);
        tenant.MapPut("/memberships/{membershipId}/role", DisabledBody<ChangeMembershipRoleRequest>);
        tenant.MapPut("/memberships/{membershipId}/status", DisabledBody<ChangeMembershipStatusRequest>);
        tenant.MapPost("/memberships/transfer-tenant-admin", DisabledBody<TransferTenantAdminRequest>);
        tenant.MapDelete("/memberships/{membershipId}", Disabled);
        tenant.MapGet("/audit", Disabled);

        var admin = endpoints.MapGroup("/api/identity/superadmin").RequireAuthorization().WithTags("Identity - SuperAdmin");
        admin.MapGet("/users", Disabled);
        admin.MapGet("/tenants", Disabled);
        admin.MapGet("/users/{userId}/memberships", Disabled);
        admin.MapGet("/tenants/{tenantUid}/memberships", Disabled);
        admin.MapPost("/users/{userId}/email", DisabledBody<AdminEmailChangeRequest>);
        admin.MapPost("/users/{userId}/password-reset", Disabled);
        admin.MapPost("/users/{userId}/temporary-password", DisabledBody<TemporaryPasswordRequest>);
        admin.MapPost("/users/{userId}/force-sign-out", Disabled);
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
