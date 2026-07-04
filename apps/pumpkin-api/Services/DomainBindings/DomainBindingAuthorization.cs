using System.Security.Claims;

namespace pumpkin_api.Services.DomainBindings;

public static class DomainBindingAuthorization
{
    public static bool IsSuperAdminRole(string? role)
    {
        return string.Equals(role, "SuperAdmin", StringComparison.Ordinal);
    }

    public static string? GetRole(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Role)?.Value ?? user.FindFirst("role")?.Value;
    }

    public static string GetActor(ClaimsPrincipal user)
    {
        return user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst("email")?.Value
            ?? user.FindFirst("username")?.Value
            ?? user.Identity?.Name
            ?? "unknown";
    }

    public static IResult? RequireSuperAdmin(HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        return IsSuperAdminRole(GetRole(context.User)) ? null : Results.Forbid();
    }
}
