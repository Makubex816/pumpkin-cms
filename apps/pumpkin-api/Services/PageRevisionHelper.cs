using System.Text.Json;
using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public static class PageRevisionHelper
{
    private static readonly JsonSerializerOptions SnapshotJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new HtmlBlockBaseJsonConverter() }
    };

    private static readonly HashSet<string> AllowedChangeSources = new(StringComparer.Ordinal)
    {
        "admin_editor",
        "json_import",
        "csv_import",
        "xlsx_import",
        "lifecycle_action",
        "rollback",
        "cms_snapshot",
        "manual_unknown"
    };

    public static Page PrepareUpdate(Page existingPage, Page incomingPage, string tenantId, PageChangeContext? changeContext)
    {
        existingPage.Revision ??= new PageRevisionMetadata();
        incomingPage.MetaData ??= new PageMetaData();
        incomingPage.Seo ??= new SeoData();
        incomingPage.PageQuality ??= new PageQuality();
        incomingPage.Revision ??= new PageRevisionMetadata();
        incomingPage.StaticPublishing ??= new PageStaticPublishing();
        incomingPage.Workflow ??= new PageWorkflow();
        incomingPage.PreviousSlugs ??= new List<string>();
        incomingPage.Redirects ??= new List<PageRedirect>();

        var now = DateTime.UtcNow;
        var nowString = now.ToString("O");
        var existingRevisionNumber = GetExistingRevisionNumber(existingPage);
        var nextRevisionNumber = existingRevisionNumber + 1;
        var changeSource = NormalizeChangeSource(changeContext?.ChangeSource);
        var changedBy = string.IsNullOrWhiteSpace(changeContext?.ChangedBy)
            ? "Pumpkin CMS"
            : changeContext.ChangedBy.Trim();
        var changeSummary = string.IsNullOrWhiteSpace(changeContext?.ChangeSummary)
            ? BuildDefaultChangeSummary(changeSource)
            : changeContext.ChangeSummary.Trim();

        incomingPage.PageId = existingPage.PageId;
        incomingPage.TenantId = tenantId;
        incomingPage.MetaData.UpdatedAt = now;
        incomingPage.PageVersion = existingPage.PageVersion + 1;
        ApplySlugChangeRedirects(existingPage, incomingPage, nowString, changedBy);
        incomingPage.Revision = BuildRevisionMetadata(
            existingPage,
            incomingPage,
            existingRevisionNumber,
            nextRevisionNumber,
            nowString,
            changeSource,
            changeSummary,
            changedBy);
        incomingPage.StaticPublishing.NeedsRebuild = true;
        if (string.IsNullOrWhiteSpace(incomingPage.StaticPublishing.DeploymentStatus) ||
            incomingPage.StaticPublishing.DeploymentStatus == "deployed")
        {
            incomingPage.StaticPublishing.DeploymentStatus = "pending_rebuild";
        }

        incomingPage.Workflow.LastEditedBy = changedBy;
        incomingPage.Workflow.LastEditedAt = nowString;

        return incomingPage;
    }

    private static PageRevisionMetadata BuildRevisionMetadata(
        Page existingPage,
        Page incomingPage,
        int existingRevisionNumber,
        int nextRevisionNumber,
        string nowString,
        string changeSource,
        string changeSummary,
        string changedBy)
    {
        var snapshotPage = ClonePageWithoutNestedSnapshot(existingPage);
        var previousRevisionId = string.IsNullOrWhiteSpace(existingPage.Revision.CurrentRevisionId)
            ? BuildRevisionId(existingPage.PageId, existingRevisionNumber)
            : existingPage.Revision.CurrentRevisionId;

        return new PageRevisionMetadata
        {
            CurrentRevisionId = BuildRevisionId(existingPage.PageId, nextRevisionNumber),
            RevisionNumber = nextRevisionNumber,
            RevisionLabel = incomingPage.Revision.RevisionLabel,
            LastSnapshotAt = nowString,
            LastRevisionAt = nowString,
            LastRevisionBy = changedBy,
            RollbackAvailable = true,
            RollbackNotes = "Latest pre-update snapshot is available for rollback.",
            LastChangeSummary = changeSummary,
            LastChangedBy = changedBy,
            LastChangeSource = changeSource,
            LastChangeAt = nowString,
            LatestSnapshot = new PageRevisionSnapshot
            {
                RevisionId = previousRevisionId,
                TenantId = existingPage.TenantId,
                PageId = existingPage.PageId,
                PageSlug = existingPage.PageSlug,
                PageVersion = existingPage.PageVersion,
                RevisionNumber = existingRevisionNumber,
                SnapshotAt = nowString,
                ChangeSource = changeSource,
                ChangeSummary = changeSummary,
                ChangedBy = changedBy,
                Page = snapshotPage
            }
        };
    }

    private static Page ClonePageWithoutNestedSnapshot(Page page)
    {
        var json = JsonSerializer.Serialize(page, SnapshotJsonOptions);
        var clone = JsonSerializer.Deserialize<Page>(json, SnapshotJsonOptions) ?? new Page();
        clone.Revision ??= new PageRevisionMetadata();
        clone.Revision.LatestSnapshot = null;
        return clone;
    }

    private static void ApplySlugChangeRedirects(Page existingPage, Page incomingPage, string nowString, string changedBy)
    {
        var oldSlug = NormalizeSlug(existingPage.PageSlug);
        var newSlug = NormalizeSlug(incomingPage.PageSlug);

        incomingPage.PageSlug = newSlug;
        incomingPage.PreviousSlugs = MergePreviousSlugs(existingPage.PreviousSlugs, incomingPage.PreviousSlugs, oldSlug, newSlug);
        incomingPage.Redirects = MergeRedirects(existingPage.Redirects, incomingPage.Redirects, newSlug);

        if (string.IsNullOrWhiteSpace(oldSlug) ||
            string.IsNullOrWhiteSpace(newSlug) ||
            string.Equals(oldSlug, newSlug, StringComparison.Ordinal))
        {
            return;
        }

        incomingPage.PreviousSlugs = MergePreviousSlugs(incomingPage.PreviousSlugs, new List<string> { oldSlug }, oldSlug, newSlug);
        incomingPage.Redirects = MergeRedirects(
            incomingPage.Redirects,
            new List<PageRedirect>
            {
                new()
                {
                    From = oldSlug,
                    To = newSlug,
                    Type = 301,
                    Reason = "slug_changed",
                    CreatedAt = nowString,
                    CreatedBy = changedBy,
                    Active = true
                }
            },
            newSlug);

        UpdateCanonicalForSlugChange(incomingPage, oldSlug, newSlug);
        AppendLaunchNote(incomingPage, $"Slug changed from \"{oldSlug}\" to \"{newSlug}\"; 301 redirect created.");
    }

    private static List<string> MergePreviousSlugs(IEnumerable<string>? first, IEnumerable<string>? second, string oldSlug, string newSlug)
    {
        var results = new List<string>();

        void AddSlug(string? value)
        {
            var normalized = NormalizeSlug(value);
            if (string.IsNullOrWhiteSpace(normalized) ||
                string.Equals(normalized, newSlug, StringComparison.Ordinal) ||
                results.Contains(normalized, StringComparer.Ordinal))
            {
                return;
            }

            results.Add(normalized);
        }

        if (first != null)
        {
            foreach (var slug in first)
            {
                AddSlug(slug);
            }
        }

        if (second != null)
        {
            foreach (var slug in second)
            {
                AddSlug(slug);
            }
        }

        AddSlug(oldSlug);
        return results;
    }

    private static List<PageRedirect> MergeRedirects(IEnumerable<PageRedirect>? first, IEnumerable<PageRedirect>? second, string currentSlug)
    {
        var redirects = new Dictionary<string, PageRedirect>(StringComparer.Ordinal);

        void AddRedirect(PageRedirect? redirect)
        {
            if (redirect == null)
            {
                return;
            }

            var from = NormalizeSlug(redirect.From);
            var to = NormalizeSlug(redirect.To);
            if (string.IsNullOrWhiteSpace(from) ||
                string.IsNullOrWhiteSpace(to) ||
                string.Equals(from, to, StringComparison.Ordinal) ||
                string.Equals(from, currentSlug, StringComparison.Ordinal))
            {
                return;
            }

            redirects[from] = new PageRedirect
            {
                From = from,
                To = to,
                Type = redirect.Type == 0 ? 301 : redirect.Type,
                Reason = string.IsNullOrWhiteSpace(redirect.Reason) ? "slug_changed" : redirect.Reason.Trim(),
                CreatedAt = string.IsNullOrWhiteSpace(redirect.CreatedAt) ? DateTime.UtcNow.ToString("O") : redirect.CreatedAt.Trim(),
                CreatedBy = redirect.CreatedBy?.Trim() ?? string.Empty,
                Active = redirect.Active
            };
        }

        if (first != null)
        {
            foreach (var redirect in first)
            {
                AddRedirect(redirect);
            }
        }

        if (second != null)
        {
            foreach (var redirect in second)
            {
                AddRedirect(redirect);
            }
        }

        return redirects.Values.ToList();
    }

    private static void UpdateCanonicalForSlugChange(Page page, string oldSlug, string newSlug)
    {
        if (page.Seo == null || string.IsNullOrWhiteSpace(page.Seo.CanonicalUrl))
        {
            return;
        }

        if (!Uri.TryCreate(page.Seo.CanonicalUrl, UriKind.Absolute, out var canonical))
        {
            AppendLaunchNote(page, "Review canonical URL after slug change; existing canonical is not a valid absolute URL.");
            return;
        }

        var canonicalSlug = NormalizeSlug(canonical.AbsolutePath);
        if (string.Equals(canonicalSlug, oldSlug, StringComparison.Ordinal))
        {
            var builder = new UriBuilder(canonical)
            {
                Path = newSlug == "home" ? "/" : $"/{newSlug}",
                Query = string.Empty,
                Fragment = string.Empty
            };
            page.Seo.CanonicalUrl = builder.Uri.ToString().TrimEnd('/');
            return;
        }

        if (!string.Equals(canonicalSlug, newSlug, StringComparison.Ordinal))
        {
            AppendLaunchNote(page, "Review canonical URL after slug change; it does not match the old or current page slug.");
        }
    }

    private static void AppendLaunchNote(Page page, string note)
    {
        page.PageQuality ??= new PageQuality();
        if (string.IsNullOrWhiteSpace(page.PageQuality.LaunchNotes))
        {
            page.PageQuality.LaunchNotes = note;
            return;
        }

        if (!page.PageQuality.LaunchNotes.Contains(note, StringComparison.OrdinalIgnoreCase))
        {
            page.PageQuality.LaunchNotes = $"{page.PageQuality.LaunchNotes.Trim()}\n{note}";
        }
    }

    private static string NormalizeSlug(string? value)
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

    private static int GetExistingRevisionNumber(Page page)
    {
        if (page.Revision.RevisionNumber > 0)
        {
            return page.Revision.RevisionNumber;
        }

        return Math.Max(page.PageVersion, 1);
    }

    private static string NormalizeChangeSource(string? changeSource)
    {
        if (string.IsNullOrWhiteSpace(changeSource))
        {
            return "manual_unknown";
        }

        var normalized = changeSource.Trim();
        return AllowedChangeSources.Contains(normalized) ? normalized : "manual_unknown";
    }

    private static string BuildRevisionId(string pageId, int revisionNumber)
    {
        var safePageId = string.IsNullOrWhiteSpace(pageId) ? "page" : pageId;
        return $"{safePageId}:rev-{revisionNumber}";
    }

    private static string BuildDefaultChangeSummary(string changeSource)
    {
        return changeSource switch
        {
            "admin_editor" => "Admin editor update",
            "json_import" => "JSON import update",
            "csv_import" => "CSV import update",
            "xlsx_import" => "XLSX import update",
            "lifecycle_action" => "Lifecycle publish-state update",
            "rollback" => "Rollback restore",
            "cms_snapshot" => "CMS snapshot update",
            _ => "Page update"
        };
    }
}
