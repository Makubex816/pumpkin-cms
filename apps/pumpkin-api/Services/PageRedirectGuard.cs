using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public static class PageRedirectGuard
{
    private static readonly HashSet<string> AllowedReasons = new(StringComparer.Ordinal)
    {
        "slug_changed",
        "manual",
        "imported",
        "canonical_cleanup"
    };

    public static string? ValidatePageRedirects(Page page)
    {
        var activeFroms = new HashSet<string>(StringComparer.Ordinal);

        foreach (var redirect in page.Redirects ?? new List<PageRedirect>())
        {
            var from = NormalizeSlug(redirect.From);
            var to = NormalizeSlug(redirect.To);

            if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
            {
                return "Redirect records must include from and to slugs.";
            }

            if (string.Equals(from, to, StringComparison.Ordinal))
            {
                return $"Redirect from '{from}' cannot point to itself.";
            }

            if (redirect.Type != 301)
            {
                return $"Redirect from '{from}' must use type 301.";
            }

            if (!string.IsNullOrWhiteSpace(redirect.Reason) && !AllowedReasons.Contains(redirect.Reason.Trim()))
            {
                return $"Redirect from '{from}' uses unsupported reason '{redirect.Reason}'.";
            }

            if (redirect.Active && !activeFroms.Add(from))
            {
                return $"Duplicate active redirect from '{from}' is not allowed.";
            }
        }

        return null;
    }

    public static string? ValidateTenantRedirectCollisions(Page incomingPage, Page existingPage, IReadOnlyCollection<Page> tenantPages, string oldSlug)
    {
        var incomingFroms = new HashSet<string>(StringComparer.Ordinal);
        foreach (var redirect in incomingPage.Redirects ?? new List<PageRedirect>())
        {
            if (redirect.Active)
            {
                var from = NormalizeSlug(redirect.From);
                if (!string.IsNullOrWhiteSpace(from))
                {
                    incomingFroms.Add(from);
                }
            }
        }

        var normalizedOldSlug = NormalizeSlug(oldSlug);
        var normalizedNewSlug = NormalizeSlug(incomingPage.PageSlug);
        if (!string.IsNullOrWhiteSpace(normalizedOldSlug) &&
            !string.IsNullOrWhiteSpace(normalizedNewSlug) &&
            !string.Equals(normalizedOldSlug, normalizedNewSlug, StringComparison.Ordinal))
        {
            incomingFroms.Add(normalizedOldSlug);
        }

        if (incomingFroms.Count == 0)
        {
            return null;
        }

        foreach (var page in tenantPages)
        {
            if (string.Equals(page.PageId, existingPage.PageId, StringComparison.Ordinal))
            {
                continue;
            }

            var pageSlug = NormalizeSlug(page.PageSlug);
            if (incomingFroms.Contains(pageSlug))
            {
                return $"Redirect from '{pageSlug}' would collide with another page slug in this tenant.";
            }

            foreach (var previousSlug in page.PreviousSlugs ?? new List<string>())
            {
                var normalizedPreviousSlug = NormalizeSlug(previousSlug);
                if (incomingFroms.Contains(normalizedPreviousSlug))
                {
                    return $"Redirect from '{normalizedPreviousSlug}' would collide with another page previous slug in this tenant.";
                }
            }

            foreach (var redirect in page.Redirects ?? new List<PageRedirect>())
            {
                var redirectFrom = NormalizeSlug(redirect.From);
                if (redirect.Active && incomingFroms.Contains(redirectFrom))
                {
                    return $"Redirect from '{redirectFrom}' already exists on another page in this tenant.";
                }
            }
        }

        return null;
    }

    public static string NormalizeSlug(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var candidate = value.Trim();
        if (Uri.TryCreate(candidate, UriKind.Absolute, out var absoluteUri))
        {
            candidate = absoluteUri.AbsolutePath;
        }

        candidate = candidate.Replace('\\', '/').Trim('/');
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return "home";
        }

        var chars = new List<char>();
        var previousWasHyphen = false;

        foreach (var rawChar in candidate.ToLowerInvariant())
        {
            var nextChar = rawChar;
            if (char.IsWhiteSpace(nextChar) || nextChar == '/')
            {
                nextChar = '-';
            }

            if ((nextChar >= 'a' && nextChar <= 'z') || (nextChar >= '0' && nextChar <= '9'))
            {
                chars.Add(nextChar);
                previousWasHyphen = false;
            }
            else if (nextChar == '-' && !previousWasHyphen)
            {
                chars.Add(nextChar);
                previousWasHyphen = true;
            }
        }

        return new string(chars.ToArray()).Trim('-');
    }
}
