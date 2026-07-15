using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public static partial class IdentitySecurityService
{
    [GeneratedRegex("^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$")]
    private static partial Regex SlugPattern();
    private static readonly HashSet<string> ReservedSlugs = new(StringComparer.OrdinalIgnoreCase)
        { "admin", "api", "www", "login", "dashboard", "health", "static" };

    public static string NormalizeEmail(string value) => value.Trim().Normalize(NormalizationForm.FormKC).ToUpperInvariant();
    public static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    public static string CreateToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
    public static bool FixedTimeTokenEquals(string supplied, string expectedHash) =>
        CryptographicOperations.FixedTimeEquals(Convert.FromHexString(HashToken(supplied)), Convert.FromHexString(expectedHash));

    public static IReadOnlyList<string> ValidateSlug(string slug)
    {
        var errors = new List<string>();
        if (!SlugPattern().IsMatch(slug)) errors.Add("slug_invalid_syntax");
        if (ReservedSlugs.Contains(slug)) errors.Add("slug_reserved");
        return errors;
    }

    public static void EnsureTenantRole(TenantRole role)
    {
        if (!Enum.IsDefined(role)) throw new ArgumentOutOfRangeException(nameof(role));
    }

    public static void EnsureFinalAdminInvariant(IReadOnlyList<TenantMembership> memberships, TenantMembership target,
        IdentityRecordStatus requestedStatus)
    {
        if (target.Role != TenantRole.TenantAdmin || target.Status != IdentityRecordStatus.Active || requestedStatus == IdentityRecordStatus.Active) return;
        if (memberships.Count(x => x.Role == TenantRole.TenantAdmin && x.Status == IdentityRecordStatus.Active && x.Id != target.Id) == 0)
            throw new InvalidOperationException("final_active_tenant_admin_requires_transfer");
    }

    public static void RevokeSessions(UserAccount user, bool forcePasswordChange = false)
    {
        user.SessionVersion++;
        user.SecurityStamp = Guid.NewGuid().ToString("N");
        user.ForcePasswordChange |= forcePasswordChange;
        user.UpdatedAt = DateTime.UtcNow;
    }
}
