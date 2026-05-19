using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public static class PublishRunSanitizer
{
    private static readonly HashSet<string> AllowedSources = new(StringComparer.Ordinal)
    {
        "cms-snapshot",
        "seed-sites",
        "manual",
        "unknown"
    };

    private static readonly HashSet<string> AllowedRunTypes = new(StringComparer.Ordinal)
    {
        "static_dry_run",
        "cms_snapshot",
        "static_export",
        "deployment_record"
    };

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.Ordinal)
    {
        "ready_for_manual_upload",
        "completed_with_warnings",
        "failed",
        "imported",
        "unknown"
    };

    private static readonly HashSet<string> AllowedDeploymentTargets = new(StringComparer.Ordinal)
    {
        "none",
        "azure-static-web-apps",
        "azure-storage-static-website",
        "cloudflare"
    };

    private static readonly HashSet<string> AllowedDeploymentStatuses = new(StringComparer.Ordinal)
    {
        "not_deployed",
        "staged",
        "deployed",
        "failed",
        "rolled_back"
    };

    public static PublishRun PrepareForSave(PublishRun publishRun, string tenantId, string createdBy)
    {
        if (publishRun == null)
            throw new ArgumentException("Publish run data is required");

        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("Tenant ID is required");

        if (string.IsNullOrWhiteSpace(publishRun.RunId))
            throw new ArgumentException("Publish run runId is required");

        var sites = publishRun.Sites ?? new List<PublishRunSiteSummary>();
        var manifestSummary = publishRun.ManifestSummary ?? new PublishRunManifestSummary();
        var runId = CleanText(publishRun.RunId, 160);
        var siteKey = CleanText(publishRun.SiteKey, 120);
        var matchingSite = sites.FirstOrDefault(site => site.SiteKey == tenantId);

        if (siteKey != tenantId && matchingSite == null)
            throw new ArgumentException("Publish run must include a site entry that matches the route tenant ID");

        matchingSite ??= sites.FirstOrDefault(site => site.SiteKey == siteKey);
        if (matchingSite == null)
            throw new ArgumentException("Publish run must include at least one site summary");

        var now = DateTime.UtcNow.ToString("O");
        var source = AllowedOrDefault(publishRun.Source, AllowedSources, "unknown");
        var runType = AllowedOrDefault(publishRun.RunType, AllowedRunTypes, "static_dry_run");
        var deploymentTarget = AllowedOrDefault(publishRun.DeploymentTarget, AllowedDeploymentTargets, "none");
        var deploymentStatus = AllowedOrDefault(publishRun.DeploymentStatus, AllowedDeploymentStatuses, "not_deployed");

        var prepared = new PublishRun
        {
            Id = string.IsNullOrWhiteSpace(publishRun.Id)
                ? $"{tenantId}-{SanitizeId(runId)}"
                : SanitizeId(publishRun.Id),
            TenantId = tenantId,
            SiteKey = tenantId,
            Domain = CleanHost(matchingSite.Domain) != string.Empty ? CleanHost(matchingSite.Domain) : CleanHost(publishRun.Domain),
            RunId = runId,
            Source = source,
            RunType = runType,
            ReleaseFolder = SanitizeRelativePath(publishRun.ReleaseFolder),
            ManifestPath = SanitizeRelativePath(publishRun.ManifestPath),
            SummaryPath = SanitizeRelativePath(publishRun.SummaryPath),
            CreatedAt = CleanText(publishRun.CreatedAt, 80),
            ImportedAt = now,
            CreatedBy = CleanText(createdBy, 180),
            Notes = CleanText(publishRun.Notes, 1000),
            Sites = sites.Select(SanitizeSite).ToList(),
            PageCount = Math.Max(0, publishRun.PageCount),
            FileCount = Math.Max(0, matchingSite.FileCount),
            RedirectCount = Math.Max(0, matchingSite.RedirectCount),
            PageQualityWarningCount = Math.Max(0, matchingSite.PageQualityWarningCount),
            ContentWarningCount = Math.Max(0, matchingSite.ContentWarningCount),
            ReadyForManualUpload = matchingSite.ReadyForManualUpload,
            Errors = CleanList(publishRun.Errors ?? new List<string>(), 100, 500),
            Warnings = CleanList(publishRun.Warnings ?? new List<string>(), 200, 500),
            ManifestSummary = new PublishRunManifestSummary
            {
                RunId = runId,
                GeneratedAt = CleanText(manifestSummary.GeneratedAt, 80),
                ReleaseFolder = SanitizeRelativePath(manifestSummary.ReleaseFolder),
                ContentSource = source,
                DeploymentAttempted = manifestSummary.DeploymentAttempted,
                CloudflareModified = manifestSummary.CloudflareModified,
                SiteCount = PreparedSiteCount(sites, manifestSummary),
                Ok = manifestSummary.Ok
            },
            DeploymentTarget = deploymentTarget,
            DeployedAt = CleanText(publishRun.DeployedAt, 80),
            DeploymentStatus = deploymentStatus
        };

        prepared.Status = AllowedOrDefault(publishRun.Status, AllowedStatuses, DeriveStatus(prepared));
        if (string.IsNullOrWhiteSpace(prepared.CreatedAt))
            prepared.CreatedAt = prepared.ManifestSummary.GeneratedAt;
        if (string.IsNullOrWhiteSpace(prepared.CreatedAt))
            prepared.CreatedAt = now;

        return prepared;
    }

    private static PublishRunSiteSummary SanitizeSite(PublishRunSiteSummary site)
    {
        return new PublishRunSiteSummary
        {
            SiteKey = CleanText(site.SiteKey, 120),
            DisplayName = CleanText(site.DisplayName, 180),
            Domain = CleanHost(site.Domain),
            UploadRoot = SanitizeRelativePath(site.UploadRoot),
            FileCount = Math.Max(0, site.FileCount),
            RedirectCount = Math.Max(0, site.RedirectCount),
            PageQualityWarningCount = Math.Max(0, site.PageQualityWarningCount),
            ContentWarningCount = Math.Max(0, site.ContentWarningCount),
            ReadyForManualUpload = site.ReadyForManualUpload,
            SourceValidationOk = site.SourceValidationOk,
            ReleaseValidationOk = site.ReleaseValidationOk,
            CanonicalOk = site.CanonicalOk,
            SecretScanOk = site.SecretScanOk,
            Warnings = CleanList(site.Warnings ?? new List<string>(), 100, 500),
            Errors = CleanList(site.Errors ?? new List<string>(), 100, 500)
        };
    }

    private static string DeriveStatus(PublishRun publishRun)
    {
        if (publishRun.Errors.Count > 0 || publishRun.Sites.Any(site => site.Errors.Count > 0))
            return "failed";

        var warningCount = publishRun.Warnings.Count +
            publishRun.ContentWarningCount +
            publishRun.PageQualityWarningCount +
            publishRun.Sites.Sum(site => site.Warnings.Count);

        if (publishRun.ReadyForManualUpload && warningCount == 0)
            return "ready_for_manual_upload";

        if (publishRun.ReadyForManualUpload)
            return "completed_with_warnings";

        return "imported";
    }

    private static int PreparedSiteCount(List<PublishRunSiteSummary> sites, PublishRunManifestSummary manifestSummary)
    {
        if (sites.Count > 0)
            return sites.Count;

        return Math.Max(0, manifestSummary.SiteCount);
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

    private static string SanitizeRelativePath(string value)
    {
        var clean = CleanText(value, 260).Replace('\\', '/').Trim();
        if (string.IsNullOrWhiteSpace(clean))
            return string.Empty;

        var lower = clean.ToLowerInvariant();
        if (lower.Contains(".env") || lower.Contains("appsettings"))
            return string.Empty;
        if (clean.StartsWith('/') || clean.StartsWith('~') || clean.StartsWith("//", StringComparison.Ordinal))
            return string.Empty;
        if (clean.Length > 1 && clean[1] == ':')
            return string.Empty;

        return clean;
    }

    private static string CleanHost(string value)
    {
        var clean = CleanText(value, 180)
            .Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim('/')
            .Trim();

        return clean.Contains('/') || clean.Contains('\\') ? string.Empty : clean;
    }

    private static string CleanText(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var clean = value.Replace("\r", " ").Replace("\n", " ").Trim();
        return clean.Length <= maxLength ? clean : clean[..maxLength];
    }
}
