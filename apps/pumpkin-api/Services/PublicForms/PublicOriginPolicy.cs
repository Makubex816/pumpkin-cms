using System.Globalization;

namespace pumpkin_api.Services.PublicForms;

public static class PublicOriginPolicy
{
    public static bool TryReadExactOrigin(
        IEnumerable<string?> headerValues,
        bool allowHttpLocalhost,
        out string canonicalOrigin)
    {
        canonicalOrigin = string.Empty;
        var values = headerValues.Where(value => value != null).Select(value => value!).ToList();
        if (values.Count != 1 || string.IsNullOrWhiteSpace(values[0]) || values[0].Contains(',', StringComparison.Ordinal))
            return false;

        return TryCanonicalize(values[0], allowHttpLocalhost, out canonicalOrigin);
    }

    public static bool TryCanonicalize(string? value, bool allowHttpLocalhost, out string canonicalOrigin)
    {
        canonicalOrigin = string.Empty;
        if (string.IsNullOrWhiteSpace(value) || string.Equals(value.Trim(), "null", StringComparison.OrdinalIgnoreCase))
            return false;
        if (!Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri))
            return false;
        if (!string.IsNullOrEmpty(uri.UserInfo) || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment))
            return false;
        if (uri.AbsolutePath is not ("" or "/"))
            return false;

        var scheme = uri.Scheme.ToLowerInvariant();
        var host = uri.IdnHost.ToLowerInvariant();
        var localHttp = allowHttpLocalhost && scheme == Uri.UriSchemeHttp &&
            (host == "localhost" || host == "127.0.0.1" || host == "::1");
        if (scheme != Uri.UriSchemeHttps && !localHttp)
            return false;

        try
        {
            host = new IdnMapping().GetAscii(host).ToLowerInvariant();
        }
        catch (ArgumentException)
        {
            return false;
        }

        var builder = new UriBuilder(scheme, host)
        {
            Path = string.Empty,
            Query = string.Empty,
            Fragment = string.Empty,
            Port = uri.IsDefaultPort ? -1 : uri.Port
        };
        canonicalOrigin = builder.Uri.GetLeftPart(UriPartial.Authority);
        return true;
    }

    public static bool IsAllowed(string canonicalOrigin, IEnumerable<string> allowedOrigins) =>
        allowedOrigins.Any(origin => string.Equals(origin, canonicalOrigin, StringComparison.Ordinal));
}
