using System.Text.Json;

namespace pumpkin_api.Services;

public interface IAuditJobReadOnlyProvider
{
    Task<AuditJobReadOnlySnapshot?> GetSnapshotAsync(string tenantKey, string siteKey, CancellationToken cancellationToken = default);
}

public sealed record AuditJobReadOnlySnapshot(
    string ContractSchemaVersion,
    string TenantKey,
    string SiteKey,
    string SourceProviderMode,
    string FixtureRequestId,
    string CorrelationId,
    AuditJobViewerSummaryDto ViewerSummary,
    IReadOnlyList<AuditEventDto> AuditEvents,
    IReadOnlyList<JobRunDto> JobRuns,
    IReadOnlyList<PromotionGateDto> PromotionGates,
    IReadOnlyList<EvidenceBindingDto> EvidenceBindings,
    IReadOnlyList<TraceEntryDto> TraceEntries,
    IReadOnlyList<AuditJobWarningDto> Warnings,
    IReadOnlyList<AuditJobBlockerDto> Blockers,
    IReadOnlyList<AuditJobNextGateDto> NextGates,
    AuditJobSecurityBoundaryDto SecurityBoundary,
    AuditJobSourceDto Source);

public sealed class FixtureAuditJobReadOnlyProvider : IAuditJobReadOnlyProvider
{
    private const string ContractSchemaVersion = "audit-job-ledger-readonly-api-envelope.v1";
    private const string ViewerSchemaVersion = "audit-job-ledger-shared-viewer-model.v1";
    private const string RelativeFixturePath = "deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json";

    private readonly string? fixturePath;

    public FixtureAuditJobReadOnlyProvider()
        : this(null)
    {
    }

    public FixtureAuditJobReadOnlyProvider(string? fixturePath)
    {
        this.fixturePath = fixturePath;
    }

    public async Task<AuditJobReadOnlySnapshot?> GetSnapshotAsync(string tenantKey, string siteKey, CancellationToken cancellationToken = default)
    {
        var path = fixturePath ?? FindFixturePath();
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
            return null;
        }

        var snapshot = await LoadSnapshotAsync(path, cancellationToken);
        if (NormalizeKey(snapshot.TenantKey) != NormalizeKey(tenantKey) || NormalizeKey(snapshot.SiteKey) != NormalizeKey(siteKey))
        {
            return null;
        }

        return snapshot;
    }

    private static async Task<AuditJobReadOnlySnapshot> LoadSnapshotAsync(string path, CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(path);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        RequireString(root, "schemaVersion", ContractSchemaVersion);
        RequireBool(root, "ok", true);
        RequireBool(root, "readOnly", true);
        var sourceProviderMode = RequireNonEmptyString(root, "providerMode");
        var fixtureRequestId = RequireNonEmptyString(root, "requestId");
        var correlationId = RequireNonEmptyString(root, "correlationId");
        var tenantKey = RequireNonEmptyString(root, "tenantKey");
        var siteKey = RequireNonEmptyString(root, "siteKey");

        var data = root.GetProperty("data");
        RequireString(data, "schemaVersion", ViewerSchemaVersion);
        RequireBool(data, "readOnly", true);

        var summary = data.GetProperty("summary").Clone();
        var panels = ReadArray(data.GetProperty("panels"), AuditJobPanelDto.From);
        var warnings = ReadArray(root.GetProperty("warnings"), AuditJobWarningDto.From);
        var blockers = ReadArray(data.GetProperty("blockers"), AuditJobBlockerDto.From);
        var nextGates = ReadArray(data.GetProperty("nextGates"), AuditJobNextGateDto.From);
        var viewerSummary = new AuditJobViewerSummaryDto(summary, panels, warnings, blockers, nextGates);

        var securityBoundary = ReadSecurityBoundary(root.GetProperty("securityBoundary"));
        if (!securityBoundary.NoWriteBoundarySatisfied || securityBoundary.OpenFlags.Count != 0)
        {
            throw new InvalidOperationException("Audit Jobs fixture has an open write boundary.");
        }

        return new AuditJobReadOnlySnapshot(
            ContractSchemaVersion,
            tenantKey,
            siteKey,
            sourceProviderMode,
            fixtureRequestId,
            correlationId,
            viewerSummary,
            ReadArray(data.GetProperty("auditEvents"), AuditEventDto.From),
            ReadArray(data.GetProperty("jobRuns"), JobRunDto.From),
            ReadArray(data.GetProperty("promotionGates"), PromotionGateDto.From),
            ReadArray(data.GetProperty("evidenceBindings"), EvidenceBindingDto.From),
            ReadArray(data.GetProperty("traceIds").GetProperty("entries"), TraceEntryDto.From),
            warnings,
            blockers,
            nextGates,
            securityBoundary,
            ReadSource(root.GetProperty("source"), path));
    }

    private static string FindFixturePath()
    {
        var candidates = new List<string>();
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            candidates.Add(Path.Combine(current.FullName, RelativeFixturePath));
            candidates.Add(Path.Combine(current.FullName, "..", "..", RelativeFixturePath));
            current = current.Parent;
        }

        candidates.Add(Path.Combine(AppContext.BaseDirectory, RelativeFixturePath));
        candidates.Add(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", RelativeFixturePath));

        return candidates
            .Select(path => Path.GetFullPath(path))
            .FirstOrDefault(File.Exists) ?? string.Empty;
    }

    private static IReadOnlyList<T> ReadArray<T>(JsonElement array, Func<JsonElement, T> map)
    {
        if (array.ValueKind != JsonValueKind.Array)
        {
            throw new InvalidOperationException("Audit Jobs fixture array is invalid.");
        }

        return array.EnumerateArray().Select(map).ToList();
    }

    private static AuditJobSecurityBoundaryDto ReadSecurityBoundary(JsonElement element) => new(
        ReadBool(element, "localOnly"),
        ReadBool(element, "noWriteBoundarySatisfied"),
        ReadStringArray(element.GetProperty("openFlags")),
        ReadStringArray(element.GetProperty("closedFlags")));

    private static AuditJobSourceDto ReadSource(JsonElement element, string path) => new(
        ReadString(element, "kind"),
        Path.GetRelativePath(FindRepoRoot(path), path).Replace('\\', '/'),
        ReadNullableString(element, "ledgerSchemaVersion"),
        ReadNullableString(element, "viewerModelVersion"),
        ReadNullableString(element, "generatedFrom"),
        ReadNullableString(element, "runtimeHttpWarning"));

    private static string FindRepoRoot(string path)
    {
        var current = new FileInfo(path).Directory;
        while (current is not null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, "apps")) && Directory.Exists(Path.Combine(current.FullName, "deployment")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        return Directory.GetCurrentDirectory();
    }

    private static IReadOnlyList<string> ReadStringArray(JsonElement array)
    {
        if (array.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<string>();
        }

        return array.EnumerateArray().Select(item => item.GetString() ?? string.Empty).Where(item => item.Length > 0).ToList();
    }

    private static void RequireString(JsonElement element, string propertyName, string expected)
    {
        var actual = RequireNonEmptyString(element, propertyName);
        if (!string.Equals(actual, expected, StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"Audit Jobs fixture {propertyName} is not {expected}.");
        }
    }

    private static void RequireBool(JsonElement element, string propertyName, bool expected)
    {
        if (!element.TryGetProperty(propertyName, out var value) || value.ValueKind is not JsonValueKind.True and not JsonValueKind.False || value.GetBoolean() != expected)
        {
            throw new InvalidOperationException($"Audit Jobs fixture {propertyName} is invalid.");
        }
    }

    private static string RequireNonEmptyString(JsonElement element, string propertyName)
    {
        var value = ReadString(element, propertyName);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"Audit Jobs fixture {propertyName} is required.");
        }

        return value;
    }

    private static bool ReadBool(JsonElement element, string propertyName)
        => element.TryGetProperty(propertyName, out var value) && value.ValueKind is JsonValueKind.True or JsonValueKind.False && value.GetBoolean();

    private static string ReadString(JsonElement element, string propertyName)
        => element.TryGetProperty(propertyName, out var value) ? value.GetString() ?? string.Empty : string.Empty;

    private static string? ReadNullableString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
        {
            return null;
        }

        return value.GetString();
    }

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
}
