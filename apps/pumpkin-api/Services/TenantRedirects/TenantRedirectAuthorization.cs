using System.Security.Claims;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectAuthorization
{
    public static bool CanAccess(string? role, string? actorTenantId, string requestedTenantId)
    {
        if (string.Equals(role, "SuperAdmin", StringComparison.Ordinal))
        {
            return true;
        }

        return string.Equals(role, "TenantAdmin", StringComparison.Ordinal) &&
            string.Equals(
                TenantRedirectNormalizer.NormalizeTenantId(actorTenantId),
                TenantRedirectNormalizer.NormalizeTenantId(requestedTenantId),
                StringComparison.Ordinal);
    }

    public static IResult? RequireTenantAccess(HttpContext context, string tenantId)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var role = context.User.FindFirst(ClaimTypes.Role)?.Value ?? context.User.FindFirst("role")?.Value;
        var actorTenantId = context.User.FindFirst("tenantId")?.Value;
        return CanAccess(role, actorTenantId, tenantId) ? null : Results.Forbid();
    }

    public static string GetActor(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst("email")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.Identity?.Name
            ?? "unknown";
    }
}
