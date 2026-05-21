using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class ImportRun
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("importRunId")]
    public string ImportRunId { get; set; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; set; } = "unknown";

    [JsonPropertyName("sourceLabel")]
    public string SourceLabel { get; set; } = string.Empty;

    [JsonPropertyName("sourcePackageId")]
    public string SourcePackageId { get; set; } = string.Empty;

    [JsonPropertyName("sourcePackageName")]
    public string SourcePackageName { get; set; } = string.Empty;

    [JsonPropertyName("fileName")]
    public string FileName { get; set; } = string.Empty;

    [JsonPropertyName("importMode")]
    public string ImportMode { get; set; } = "dry-run";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "dry_run";

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("completedAt")]
    public string CompletedAt { get; set; } = string.Empty;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;

    [JsonPropertyName("tenantMatch")]
    public bool TenantMatch { get; set; } = true;

    [JsonPropertyName("pageCount")]
    public int PageCount { get; set; } = 0;

    [JsonPropertyName("createCount")]
    public int CreateCount { get; set; } = 0;

    [JsonPropertyName("updateCount")]
    public int UpdateCount { get; set; } = 0;

    [JsonPropertyName("skipCount")]
    public int SkipCount { get; set; } = 0;

    [JsonPropertyName("conflictCount")]
    public int ConflictCount { get; set; } = 0;

    [JsonPropertyName("errorCount")]
    public int ErrorCount { get; set; } = 0;

    [JsonPropertyName("warningCount")]
    public int WarningCount { get; set; } = 0;

    [JsonPropertyName("revisionCount")]
    public int RevisionCount { get; set; } = 0;

    [JsonPropertyName("pagesNeedingRebuildCount")]
    public int PagesNeedingRebuildCount { get; set; } = 0;

    [JsonPropertyName("affectedPages")]
    public List<ImportRunAffectedPage> AffectedPages { get; set; } = new();

    [JsonPropertyName("validationSummary")]
    public ImportRunValidationSummary ValidationSummary { get; set; } = new();

    [JsonPropertyName("diffSummary")]
    public ImportRunDiffSummary DiffSummary { get; set; } = new();

    [JsonPropertyName("importResultSummary")]
    public ImportRunResultSummary ImportResultSummary { get; set; } = new();

    [JsonPropertyName("preflightAcknowledgements")]
    public ImportRunPreflightAcknowledgements PreflightAcknowledgements { get; set; } = new();

    [JsonPropertyName("reportSummary")]
    public ImportRunReportSummary ReportSummary { get; set; } = new();

    [JsonPropertyName("protectedConfigChanged")]
    public string ProtectedConfigChanged { get; set; } = "unknown";

    [JsonPropertyName("deploymentTriggered")]
    public bool DeploymentTriggered { get; set; } = false;
}

public class ImportRunAffectedPage
{
    [JsonPropertyName("pageId")]
    public string PageId { get; set; } = string.Empty;

    [JsonPropertyName("pageSlug")]
    public string PageSlug { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("action")]
    public string Action { get; set; } = "skipped";

    [JsonPropertyName("revisionCreated")]
    public bool RevisionCreated { get; set; } = false;

    [JsonPropertyName("previousSlug")]
    public string PreviousSlug { get; set; } = string.Empty;

    [JsonPropertyName("newSlug")]
    public string NewSlug { get; set; } = string.Empty;

    [JsonPropertyName("needsRebuild")]
    public bool NeedsRebuild { get; set; } = false;

    [JsonPropertyName("warnings")]
    public List<string> Warnings { get; set; } = new();

    [JsonPropertyName("errors")]
    public List<string> Errors { get; set; } = new();
}

public class ImportRunValidationSummary
{
    [JsonPropertyName("generatedAt")]
    public string GeneratedAt { get; set; } = string.Empty;

    [JsonPropertyName("pageCount")]
    public int PageCount { get; set; } = 0;

    [JsonPropertyName("errorCount")]
    public int ErrorCount { get; set; } = 0;

    [JsonPropertyName("warningCount")]
    public int WarningCount { get; set; } = 0;

    [JsonPropertyName("payloadErrorCount")]
    public int PayloadErrorCount { get; set; } = 0;

    [JsonPropertyName("payloadWarningCount")]
    public int PayloadWarningCount { get; set; } = 0;
}

public class ImportRunDiffSummary
{
    [JsonPropertyName("generatedAt")]
    public string GeneratedAt { get; set; } = string.Empty;

    [JsonPropertyName("incomingCount")]
    public int IncomingCount { get; set; } = 0;

    [JsonPropertyName("createCount")]
    public int CreateCount { get; set; } = 0;

    [JsonPropertyName("updateCount")]
    public int UpdateCount { get; set; } = 0;

    [JsonPropertyName("skipCount")]
    public int SkipCount { get; set; } = 0;

    [JsonPropertyName("conflictCount")]
    public int ConflictCount { get; set; } = 0;

    [JsonPropertyName("errorCount")]
    public int ErrorCount { get; set; } = 0;

    [JsonPropertyName("warningCount")]
    public int WarningCount { get; set; } = 0;

    [JsonPropertyName("publishedUpdateCount")]
    public int PublishedUpdateCount { get; set; } = 0;

    [JsonPropertyName("slugChangeCount")]
    public int SlugChangeCount { get; set; } = 0;

    [JsonPropertyName("tenantMismatchCount")]
    public int TenantMismatchCount { get; set; } = 0;

    [JsonPropertyName("staticRebuildCount")]
    public int StaticRebuildCount { get; set; } = 0;

    [JsonPropertyName("riskCategories")]
    public List<string> RiskCategories { get; set; } = new();
}

public class ImportRunResultSummary
{
    [JsonPropertyName("timestamp")]
    public string Timestamp { get; set; } = string.Empty;

    [JsonPropertyName("total")]
    public int Total { get; set; } = 0;

    [JsonPropertyName("createdCount")]
    public int CreatedCount { get; set; } = 0;

    [JsonPropertyName("updatedCount")]
    public int UpdatedCount { get; set; } = 0;

    [JsonPropertyName("skippedCount")]
    public int SkippedCount { get; set; } = 0;

    [JsonPropertyName("errorCount")]
    public int ErrorCount { get; set; } = 0;

    [JsonPropertyName("warningCount")]
    public int WarningCount { get; set; } = 0;
}

public class ImportRunPreflightAcknowledgements
{
    [JsonPropertyName("publishedUpdatesAcknowledged")]
    public bool PublishedUpdatesAcknowledged { get; set; } = false;

    [JsonPropertyName("slugChangesAcknowledged")]
    public bool SlugChangesAcknowledged { get; set; } = false;

    [JsonPropertyName("warningsAcknowledged")]
    public bool WarningsAcknowledged { get; set; } = false;
}

public class ImportRunReportSummary
{
    [JsonPropertyName("sourceType")]
    public string SourceType { get; set; } = string.Empty;

    [JsonPropertyName("importMode")]
    public string ImportMode { get; set; } = "dry-run";

    [JsonPropertyName("dryRunOnly")]
    public bool DryRunOnly { get; set; } = true;

    [JsonPropertyName("writeAttempted")]
    public bool WriteAttempted { get; set; } = false;

    [JsonPropertyName("wroteCount")]
    public int WroteCount { get; set; } = 0;

    [JsonPropertyName("revisionCreatedCount")]
    public int RevisionCreatedCount { get; set; } = 0;
}
