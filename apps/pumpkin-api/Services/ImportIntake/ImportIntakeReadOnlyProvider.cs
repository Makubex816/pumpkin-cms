using System.Text.Json;

namespace pumpkin_api.Services;

public interface IImportIntakeReadOnlyProvider
{
    Task<ImportIntakeReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default);
    Task<ImportIntakePackageSnapshot?> GetPackageAsync(string packageId, CancellationToken cancellationToken = default);
}

public sealed record ImportIntakeReadOnlySnapshot(
    string ContractSchemaVersion,
    string CorrelationId,
    IReadOnlyList<ImportIntakePackageSnapshot> Packages,
    ImportIntakeSecurityBoundaryDto SecurityBoundary,
    ImportIntakeSourceDto Source)
{
    public IReadOnlyList<ImportIntakeHealthMessageDto> Warnings
        => Packages.SelectMany(package => package.Envelope.Data.Warnings).ToList();
}

public sealed record ImportIntakePackageSnapshot(
    string FixturePath,
    ImportIntakeFixtureEnvelope Envelope)
{
    public ImportIntakePreviewDto Preview => Envelope.Data;

    public ImportIntakePackageSummaryDto Summary => ImportIntakePackageSummaryDto.From(Envelope.Data);
}

public sealed class FixtureImportIntakeReadOnlyProvider : IImportIntakeReadOnlyProvider
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly string[] DefaultRelativeFixturePaths =
    [
        "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-ice.envelope.json",
        "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-roller.envelope.json"
    ];

    private readonly IReadOnlyList<string>? fixturePaths;

    public FixtureImportIntakeReadOnlyProvider()
        : this(null)
    {
    }

    public FixtureImportIntakeReadOnlyProvider(IReadOnlyList<string>? fixturePaths)
    {
        this.fixturePaths = fixturePaths;
    }

    public async Task<ImportIntakeReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        var packages = new List<ImportIntakePackageSnapshot>();
        foreach (var path in ResolveFixturePaths())
        {
            if (!File.Exists(path))
            {
                continue;
            }

            packages.Add(await LoadPackageAsync(path, cancellationToken));
        }

        return new ImportIntakeReadOnlySnapshot(
            ImportIntakeContractVersions.ReadOnlyApiEnvelope,
            CreateCorrelationId(),
            packages,
            ImportIntakeSecurityBoundaryDto.LocalClosed(),
            ImportIntakeSourceDto.LocalFixtureCollection());
    }

    public async Task<ImportIntakePackageSnapshot?> GetPackageAsync(string packageId, CancellationToken cancellationToken = default)
    {
        var snapshot = await GetSnapshotAsync(cancellationToken);
        return snapshot.Packages.FirstOrDefault(package =>
            string.Equals(package.Preview.PackageId, packageId, StringComparison.OrdinalIgnoreCase));
    }

    private IEnumerable<string> ResolveFixturePaths()
    {
        if (fixturePaths is not null)
        {
            return fixturePaths.Select(Path.GetFullPath);
        }

        return DefaultRelativeFixturePaths
            .Select(FindFixturePath)
            .Where(path => !string.IsNullOrWhiteSpace(path));
    }

    private static async Task<ImportIntakePackageSnapshot> LoadPackageAsync(string path, CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(path);
        var envelope = await JsonSerializer.DeserializeAsync<ImportIntakeFixtureEnvelope>(
            stream,
            JsonOptions,
            cancellationToken) ?? throw new InvalidOperationException("Import intake fixture could not be deserialized.");

        ValidateEnvelope(envelope, path);
        var relativePath = Path.GetRelativePath(FindRepoRoot(path), path).Replace('\\', '/');

        return new ImportIntakePackageSnapshot(
            relativePath,
            envelope with
            {
                Source = envelope.Source with { FixturePath = relativePath }
            });
    }

    private static void ValidateEnvelope(ImportIntakeFixtureEnvelope envelope, string path)
    {
        RequireString(envelope.SchemaVersion, ImportIntakeContractVersions.ReadOnlyApiEnvelope, "schemaVersion", path);
        RequireString(envelope.ProviderMode, ImportIntakeApiProviderModes.LocalFixtureReadOnly, "providerMode", path);
        RequireBool(envelope.Ok, true, "ok", path);
        RequireBool(envelope.ReadOnly, true, "readOnly", path);
        RequireString(envelope.Data.SchemaVersion, ImportIntakeContractVersions.SharedModel, "data.schemaVersion", path);
        RequireString(envelope.Data.ProviderMode, ImportIntakeApiProviderModes.LocalFixtureReadOnly, "data.providerMode", path);
        RequireBool(envelope.Data.ReadOnly, true, "data.readOnly", path);
        RequireString(envelope.Meta.GoogleIndexingState, "deferred_hard_stop", "meta.googleIndexingState", path);

        if (!envelope.SecurityBoundary.NoWriteBoundarySatisfied || envelope.SecurityBoundary.OpenFlags.Count != 0)
        {
            throw new InvalidOperationException($"Import intake fixture has an open write boundary: {path}");
        }

        if (!envelope.Data.SecurityBoundary.NoWriteBoundarySatisfied || envelope.Data.SecurityBoundary.OpenFlags.Count != 0)
        {
            throw new InvalidOperationException($"Import intake fixture data has an open write boundary: {path}");
        }

        if (envelope.Meta.ExternalHttpCrawling
            || envelope.Meta.CmsApiCalls
            || envelope.Meta.CmsWrites
            || envelope.Meta.ProviderWrites
            || envelope.Meta.ProtectedConfigReads
            || envelope.Meta.WriteActionsAllowed
            || envelope.Meta.Deployment
            || envelope.Meta.SearchConsoleIndexing)
        {
            throw new InvalidOperationException($"Import intake fixture meta has an enabled write/live flag: {path}");
        }

        var enabledActions = envelope.Data.FutureActions.Where(action => !action.Disabled).ToList();
        if (enabledActions.Count > 0)
        {
            throw new InvalidOperationException($"Import intake fixture has enabled future actions: {string.Join(", ", enabledActions.Select(action => action.Id))}");
        }

        if (string.IsNullOrWhiteSpace(envelope.Data.PackageId)
            || string.IsNullOrWhiteSpace(envelope.Data.TenantKey)
            || string.IsNullOrWhiteSpace(envelope.Data.SiteKey)
            || string.IsNullOrWhiteSpace(envelope.Data.RollbackPlanId))
        {
            throw new InvalidOperationException($"Import intake fixture package identity is incomplete: {path}");
        }
    }

    private static string FindFixturePath(string relativePath)
    {
        var candidates = new List<string>();
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            candidates.Add(Path.Combine(current.FullName, relativePath));
            candidates.Add(Path.Combine(current.FullName, "..", "..", relativePath));
            current = current.Parent;
        }

        candidates.Add(Path.Combine(AppContext.BaseDirectory, relativePath));
        candidates.Add(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", relativePath));

        return candidates
            .Select(Path.GetFullPath)
            .FirstOrDefault(File.Exists) ?? string.Empty;
    }

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

    private static string CreateCorrelationId() => $"corr_import_intake_{Guid.NewGuid():N}"[..32];

    private static void RequireString(string actual, string expected, string propertyName, string path)
    {
        if (!string.Equals(actual, expected, StringComparison.Ordinal))
        {
            throw new InvalidOperationException($"Import intake fixture {propertyName} is invalid in {path}.");
        }
    }

    private static void RequireBool(bool actual, bool expected, string propertyName, string path)
    {
        if (actual != expected)
        {
            throw new InvalidOperationException($"Import intake fixture {propertyName} is invalid in {path}.");
        }
    }
}
