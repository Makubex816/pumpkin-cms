using System.Security.Claims;

namespace pumpkin_api.Services.Publications;

public static class PublicationProductAuthorization
{
    public static bool IsSuperAdmin(ClaimsPrincipal user) =>
        string.Equals(ReadRole(user), "SuperAdmin", StringComparison.Ordinal);

    public static bool CanAccessTenant(ClaimsPrincipal user, string tenantUid)
    {
        if (user.Identity?.IsAuthenticated != true) return false;
        if (IsSuperAdmin(user)) return true;
        if (!string.Equals(ReadRole(user), "TenantAdmin", StringComparison.Ordinal)) return false;
        return TenantClaims(user).Any(value =>
            string.Equals(Normalize(value), Normalize(tenantUid), StringComparison.Ordinal));
    }

    public static IResult? RequireTenantAccess(HttpContext context, string tenantUid)
    {
        if (context.User?.Identity?.IsAuthenticated != true) return Results.Unauthorized();
        return CanAccessTenant(context.User, tenantUid) ? null : Results.Forbid();
    }

    public static IResult? RequireInventoryAccess(HttpContext context, string? tenantUid)
    {
        if (context.User?.Identity?.IsAuthenticated != true) return Results.Unauthorized();
        if (IsSuperAdmin(context.User)) return null;
        if (string.IsNullOrWhiteSpace(tenantUid)) return Results.Forbid();
        return CanAccessTenant(context.User, tenantUid) ? null : Results.Forbid();
    }

    public static IResult? RequireSuperAdmin(HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated != true) return Results.Unauthorized();
        return IsSuperAdmin(context.User) ? null : Results.Forbid();
    }

    public static string GetActor(ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? user.FindFirst("sub")?.Value
        ?? user.FindFirst("userId")?.Value
        ?? user.Identity?.Name
        ?? "unknown";

    private static string ReadRole(ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.Role)?.Value
        ?? user.FindFirst("role")?.Value
        ?? user.FindFirst("tenantRole")?.Value
        ?? string.Empty;

    private static IEnumerable<string> TenantClaims(ClaimsPrincipal user)
    {
        foreach (var name in new[] { "tenantUid", "tenantId", "tenantKey" })
            foreach (var claim in user.FindAll(name))
                if (!string.IsNullOrWhiteSpace(claim.Value))
                    yield return claim.Value;
    }

    private static string Normalize(string value) => value.Trim().ToLowerInvariant();
}
