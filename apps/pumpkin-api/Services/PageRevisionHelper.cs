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
        incomingPage.Revision ??= new PageRevisionMetadata();
        incomingPage.StaticPublishing ??= new PageStaticPublishing();
        incomingPage.Workflow ??= new PageWorkflow();

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
