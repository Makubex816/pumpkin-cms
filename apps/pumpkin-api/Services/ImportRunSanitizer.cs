using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public static class ImportRunSanitizer
{
    private static readonly HashSet<string> AllowedSources = new(StringComparer.Ordinal)
    {
        "json_import",
        "csv_import",
        "xlsx_import",
        "staged_package",
        "manual",
        "unknown"
    };

    private static readonly HashSet<string> AllowedModes = new(StringComparer.Ordinal)
    {
        "dry-run",
        "upsert",
        "create-only",
        "update-only"
    };

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.Ordinal)
    {
        "dry_run",
        "completed",
        "completed_with_warnings",
        "failed",
        "cancelled",
        "blocked_by_preflight"
    };

    private static readonly HashSet<string> AllowedActions = new(StringComparer.Ordinal)
    {
        "created",
        "updated",
        "skipped",
        "conflicted",
        "failed"
    };

    public static ImportRun PrepareForSave(ImportRun importRun, string tenantId, string createdBy)
    {
        if (importRun == null)
            throw new ArgumentException("Import run data is required");

        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("Tenant ID is required");

        var now = DateTime.UtcNow.ToString("O");
        var source = AllowedOrDefault(importRun.Source, AllowedSources, "unknown");
        var importMode = AllowedOrDefault(importRun.ImportMode, AllowedModes, "dry-run");
        var runId = CleanText(importRun.ImportRunId, 160);
        if (string.IsNullOrWhiteSpace(runId))
            runId = $"import-{DateTime.UtcNow:yyyyMMddHHmmss}";

        var affectedPages = (importRun.AffectedPages ?? new List<ImportRunAffectedPage>())
            .Select(SanitizeAffectedPage)
            .Take(500)
            .ToList();
        var validationSummary = importRun.ValidationSummary ?? new ImportRunValidationSummary();
        var diffSummary = importRun.DiffSummary ?? new ImportRunDiffSummary();
        var importResultSummary = importRun.ImportResultSummary ?? new ImportRunResultSummary();
        var reportSummary = importRun.ReportSummary ?? new ImportRunReportSummary();
        var acknowledgements = importRun.PreflightAcknowledgements ?? new ImportRunPreflightAcknowledgements();

        var prepared = new ImportRun
        {
            Id = string.IsNullOrWhiteSpace(importRun.Id)
                ? $"{tenantId}-{SanitizeId(runId)}"
                : SanitizeId(importRun.Id),
            TenantId = tenantId,
            ImportRunId = runId,
            Source = source,
            SourceLabel = CleanText(importRun.SourceLabel, 180),
            SourcePackageId = SanitizeId(importRun.SourcePackageId),
            SourcePackageName = CleanText(importRun.SourcePackageName, 240),
            FileName = SanitizeFileName(importRun.FileName),
            ImportMode = importMode,
            CreatedAt = CleanText(importRun.CreatedAt, 80),
            CompletedAt = CleanText(importRun.CompletedAt, 80),
            CreatedBy = CleanText(createdBy, 180),
            Notes = CleanText(importRun.Notes, 1200),
            TenantMatch = importRun.TenantMatch,
            PageCount = Math.Max(0, importRun.PageCount),
            CreateCount = Math.Max(0, importRun.CreateCount),
            UpdateCount = Math.Max(0, importRun.UpdateCount),
            SkipCount = Math.Max(0, importRun.SkipCount),
            ConflictCount = Math.Max(0, importRun.ConflictCount),
            ErrorCount = Math.Max(0, importRun.ErrorCount),
            WarningCount = Math.Max(0, importRun.WarningCount),
            RevisionCount = Math.Max(0, importRun.RevisionCount),
            PagesNeedingRebuildCount = Math.Max(0, importRun.PagesNeedingRebuildCount),
            AffectedPages = affectedPages,
            ValidationSummary = new ImportRunValidationSummary
            {
                GeneratedAt = CleanText(validationSummary.GeneratedAt, 80),
                PageCount = Math.Max(0, validationSummary.PageCount),
                ErrorCount = Math.Max(0, validationSummary.ErrorCount),
                WarningCount = Math.Max(0, validationSummary.WarningCount),
                PayloadErrorCount = Math.Max(0, validationSummary.PayloadErrorCount),
                PayloadWarningCount = Math.Max(0, validationSummary.PayloadWarningCount)
            },
            DiffSummary = new ImportRunDiffSummary
            {
                GeneratedAt = CleanText(diffSummary.GeneratedAt, 80),
                IncomingCount = Math.Max(0, diffSummary.IncomingCount),
                CreateCount = Math.Max(0, diffSummary.CreateCount),
                UpdateCount = Math.Max(0, diffSummary.UpdateCount),
                SkipCount = Math.Max(0, diffSummary.SkipCount),
                ConflictCount = Math.Max(0, diffSummary.ConflictCount),
                ErrorCount = Math.Max(0, diffSummary.ErrorCount),
                WarningCount = Math.Max(0, diffSummary.WarningCount),
                PublishedUpdateCount = Math.Max(0, diffSummary.PublishedUpdateCount),
                SlugChangeCount = Math.Max(0, diffSummary.SlugChangeCount),
                TenantMismatchCount = Math.Max(0, diffSummary.TenantMismatchCount),
                StaticRebuildCount = Math.Max(0, diffSummary.StaticRebuildCount),
                RiskCategories = CleanList(diffSummary.RiskCategories ?? new List<string>(), 40, 80)
            },
            ImportResultSummary = new ImportRunResultSummary
            {
                Timestamp = CleanText(importResultSummary.Timestamp, 80),
                Total = Math.Max(0, importResultSummary.Total),
                CreatedCount = Math.Max(0, importResultSummary.CreatedCount),
                UpdatedCount = Math.Max(0, importResultSummary.UpdatedCount),
                SkippedCount = Math.Max(0, importResultSummary.SkippedCount),
                ErrorCount = Math.Max(0, importResultSummary.ErrorCount),
                WarningCount = Math.Max(0, importResultSummary.WarningCount)
            },
            PreflightAcknowledgements = new ImportRunPreflightAcknowledgements
            {
                PublishedUpdatesAcknowledged = acknowledgements.PublishedUpdatesAcknowledged,
                SlugChangesAcknowledged = acknowledgements.SlugChangesAcknowledged,
                WarningsAcknowledged = acknowledgements.WarningsAcknowledged
            },
            ReportSummary = new ImportRunReportSummary
            {
                SourceType = CleanText(reportSummary.SourceType, 40),
                ImportMode = importMode,
                DryRunOnly = importMode == "dry-run",
                WriteAttempted = reportSummary.WriteAttempted,
                WroteCount = Math.Max(0, reportSummary.WroteCount),
                RevisionCreatedCount = Math.Max(0, reportSummary.RevisionCreatedCount)
            },
            ProtectedConfigChanged = importRun.ProtectedConfigChanged == "false" ? "false" : "unknown",
            DeploymentTriggered = false
        };

        prepared.Status = AllowedOrDefault(importRun.Status, AllowedStatuses, DeriveStatus(prepared));
        if (string.IsNullOrWhiteSpace(prepared.CreatedAt))
            prepared.CreatedAt = now;
        if (string.IsNullOrWhiteSpace(prepared.CompletedAt))
            prepared.CompletedAt = now;

        return prepared;
    }

    private static ImportRunAffectedPage SanitizeAffectedPage(ImportRunAffectedPage page)
    {
        return new ImportRunAffectedPage
        {
            PageId = CleanText(page.PageId, 180),
            PageSlug = CleanText(page.PageSlug, 180),
            Title = CleanText(page.Title, 240),
            Action = AllowedOrDefault(page.Action, AllowedActions, "skipped"),
            RevisionCreated = page.RevisionCreated,
            PreviousSlug = CleanText(page.PreviousSlug, 180),
            NewSlug = CleanText(page.NewSlug, 180),
            NeedsRebuild = page.NeedsRebuild,
            Warnings = CleanList(page.Warnings ?? new List<string>(), 25, 500),
            Errors = CleanList(page.Errors ?? new List<string>(), 25, 500)
        };
    }

    private static string DeriveStatus(ImportRun importRun)
    {
        if (!importRun.TenantMatch || importRun.DiffSummary.TenantMismatchCount > 0)
            return "blocked_by_preflight";
        if (importRun.ErrorCount > 0 || importRun.ValidationSummary.ErrorCount > 0 || importRun.DiffSummary.ErrorCount > 0)
            return importRun.ImportMode == "dry-run" ? "blocked_by_preflight" : "failed";
        if (importRun.ImportMode == "dry-run")
            return "dry_run";
        if (importRun.WarningCount > 0 || importRun.ValidationSummary.WarningCount > 0 || importRun.DiffSummary.WarningCount > 0)
            return "completed_with_warnings";
        return "completed";
    }

    private static string AllowedOrDefault(string value, HashSet<string> allowedValues, string fallback)
    {
        var cleanValue = CleanText(value, 120);
        return allowedValues.Contains(cleanValue) ? cleanValue : fallback;
    }

    private static List<string> CleanList(IEnumerable<string> values, int maxItems, int maxLength)
    {
        return values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => CleanText(value, maxLength))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Take(maxItems)
            .ToList();
    }

    private static string SanitizeId(string value)
    {
        var clean = CleanText(value, 180);
        var chars = clean.Select(character =>
            char.IsLetterOrDigit(character) || character == '-' || character == '_' ? character : '-').ToArray();
        var sanitized = new string(chars).Trim('-');
        return string.IsNullOrWhiteSpace(sanitized) ? Guid.NewGuid().ToString("N") : sanitized;
    }

    private static string SanitizeFileName(string value)
    {
        var clean = CleanText(value, 180).Replace('\\', '/').Trim();
        if (string.IsNullOrWhiteSpace(clean))
            return string.Empty;

        var lower = clean.ToLowerInvariant();
        if (lower.Contains(".env") || lower.Contains("appsettings"))
            return string.Empty;
        if (clean.Contains('/'))
            clean = clean.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault() ?? string.Empty;

        return CleanText(clean, 180);
    }

    private static string CleanText(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var clean = value.Replace("\r", " ").Replace("\n", " ").Trim();
        return clean.Length <= maxLength ? clean : clean[..maxLength];
    }
}
