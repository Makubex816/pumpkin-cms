using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectNormalizer
{
    public static bool TryNormalizeSourcePath(string? value, out string normalized, out string error)
    {
        normalized = string.Empty;
        error = string.Empty;
        var candidate = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(candidate))
        {
            error = "Source path is required.";
            return false;
        }

        if (candidate.Contains('?') || candidate.Contains('#'))
        {
            error = "Source path cannot include a query string or fragment; matching is path-scoped.";
            return false;
        }

        if (candidate.StartsWith("//", StringComparison.Ordinal) || HasUriScheme(candidate))
        {
            error = "Source path must be tenant-internal, not an absolute URL.";
            return false;
        }

        return TryNormalizeInternalPath(candidate, out normalized, out error);
    }

    public static bool TryNormalizeTarget(
        string? value,
        string? targetKind,
        out string normalized,
        out string normalizedPath,
        out string normalizedKind,
        out string error)
    {
        normalized = string.Empty;
        normalizedPath = string.Empty;
        normalizedKind = (targetKind ?? string.Empty).Trim().ToLowerInvariant();
        error = string.Empty;
        var candidate = value?.Trim() ?? string.Empty;

        if (normalizedKind is not ("internal" or "external"))
        {
            error = "Target kind must be explicitly set to 'internal' or 'external'.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(candidate))
        {
            error = "Redirect target is required.";
            return false;
        }

        if (candidate.Any(char.IsControl))
        {
            error = "Redirect target cannot contain control characters.";
            return false;
        }

        if (normalizedKind == "external")
        {
            if (!Uri.TryCreate(candidate, UriKind.Absolute, out var absolute) ||
                absolute.Scheme is not ("http" or "https") ||
                string.IsNullOrWhiteSpace(absolute.Host) ||
                !string.IsNullOrWhiteSpace(absolute.UserInfo))
            {
                error = "External targets must be absolute HTTP(S) URLs without embedded credentials.";
                return false;
            }

            normalized = absolute.AbsoluteUri;
            normalizedPath = absolute.AbsolutePath;
            return true;
        }

        if (!candidate.StartsWith("/", StringComparison.Ordinal) ||
            candidate.StartsWith("//", StringComparison.Ordinal) ||
            HasUriScheme(candidate))
        {
            error = "Internal targets must begin with a single '/'.";
            return false;
        }

        SplitTarget(candidate, out var path, out var query, out var fragment);
        if (!TryNormalizeInternalPath(path, out normalizedPath, out error))
        {
            return false;
        }

        if (!TryNormalizeSuffix(query, '?', out var normalizedQuery, out error) ||
            !TryNormalizeSuffix(fragment, '#', out var normalizedFragment, out error))
        {
            return false;
        }

        normalized = normalizedPath + normalizedQuery + normalizedFragment;
        return true;
    }

    public static string BuildLocation(TenantRedirect redirect, string? incomingQueryString)
    {
        var target = redirect.Target;
        var fragmentIndex = target.IndexOf("#", StringComparison.Ordinal);
        var fragment = fragmentIndex >= 0 ? target[fragmentIndex..] : string.Empty;
        var targetWithoutFragment = fragmentIndex >= 0 ? target[..fragmentIndex] : target;
        var incoming = (incomingQueryString ?? string.Empty).Trim().TrimStart('?');

        if (!redirect.PreserveQueryString || string.IsNullOrWhiteSpace(incoming))
        {
            return target;
        }

        if (incoming.Any(char.IsControl) || incoming.Contains('#'))
        {
            return target;
        }

        var separator = targetWithoutFragment.Contains('?') ? "&" : "?";
        return $"{targetWithoutFragment}{separator}{incoming}{fragment}";
    }

    public static string NormalizeTenantId(string? value)
    {
        return (value ?? string.Empty).Trim().ToLowerInvariant();
    }

    public static string PageLookupSlug(string normalizedPath)
    {
        try
        {
            return PageRedirectGuard.NormalizeSlug(Uri.UnescapeDataString(normalizedPath));
        }
        catch (UriFormatException)
        {
            return PageRedirectGuard.NormalizeSlug(normalizedPath);
        }
    }

    private static bool TryNormalizeInternalPath(string value, out string normalized, out string error)
    {
        normalized = string.Empty;
        error = string.Empty;
        if (value.Contains('\\'))
        {
            error = "Tenant URL paths cannot contain backslashes.";
            return false;
        }

        var candidate = value;
        if (!candidate.StartsWith("/", StringComparison.Ordinal))
        {
            candidate = $"/{candidate}";
        }

        var segments = candidate.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0)
        {
            normalized = "/";
            return true;
        }

        var normalizedSegments = new List<string>();
        foreach (var rawSegment in segments)
        {
            string decoded;
            try
            {
                decoded = Uri.UnescapeDataString(rawSegment);
            }
            catch (UriFormatException)
            {
                error = $"Path segment '{rawSegment}' contains invalid percent encoding.";
                return false;
            }

            if (decoded is "." or ".." || decoded.Any(char.IsControl) || decoded.Contains('/') || decoded.Contains('\\'))
            {
                error = $"Path segment '{rawSegment}' is not safe.";
                return false;
            }

            var trimmed = decoded.Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                error = "Path segments cannot be empty or whitespace-only.";
                return false;
            }

            normalizedSegments.Add(Uri.EscapeDataString(trimmed.ToLowerInvariant()));
        }

        normalized = $"/{string.Join('/', normalizedSegments)}";
        return true;
    }

    private static void SplitTarget(string value, out string path, out string query, out string fragment)
    {
        var fragmentIndex = value.IndexOf("#", StringComparison.Ordinal);
        fragment = fragmentIndex >= 0 ? value[fragmentIndex..] : string.Empty;
        var withoutFragment = fragmentIndex >= 0 ? value[..fragmentIndex] : value;
        var queryIndex = withoutFragment.IndexOf("?", StringComparison.Ordinal);
        query = queryIndex >= 0 ? withoutFragment[queryIndex..] : string.Empty;
        path = queryIndex >= 0 ? withoutFragment[..queryIndex] : withoutFragment;
    }

    private static bool TryNormalizeSuffix(string value, char prefix, out string normalized, out string error)
    {
        normalized = string.Empty;
        error = string.Empty;
        if (string.IsNullOrEmpty(value))
        {
            return true;
        }

        var content = value.TrimStart(prefix);
        if (content.Any(char.IsControl))
        {
            error = prefix == '?' ? "Target query cannot contain control characters." : "Target fragment cannot contain control characters.";
            return false;
        }

        normalized = content.Length == 0 ? string.Empty : $"{prefix}{content}";
        return true;
    }

    private static bool HasUriScheme(string value)
    {
        var colon = value.IndexOf(':');
        if (colon <= 0 || !char.IsAsciiLetter(value[0])) return false;
        for (var index = 1; index < colon; index++)
        {
            var character = value[index];
            if (!char.IsAsciiLetterOrDigit(character) && character is not ('+' or '-' or '.')) return false;
        }

        return true;
    }
}
