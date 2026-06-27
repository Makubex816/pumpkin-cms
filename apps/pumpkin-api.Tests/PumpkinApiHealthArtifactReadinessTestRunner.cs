namespace pumpkin_api.Tests;

public static class PumpkinApiHealthArtifactReadinessTestRunner
{
    public static async Task RunAsync()
    {
        var programPath = Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs");
        var source = await File.ReadAllTextAsync(programPath);

        VerifyHealthEndpoints(source);
        VerifyFormEntryRouteShapes(source);

        Console.WriteLine("V2.8.32C Pumpkin API health and route readiness checks passed.");
    }

    private static void VerifyHealthEndpoints(string source)
    {
        Assert(source.Contains("IResult GetHealth()", StringComparison.Ordinal), "Health handler should be declared.");
        Assert(source.Contains("app.MapGet(\"/api/health\", GetHealth)", StringComparison.Ordinal), "GET /api/health should be registered.");
        Assert(source.Contains("app.MapGet(\"/health\", GetHealth)", StringComparison.Ordinal), "GET /health should be registered.");
        Assert(source.Contains(".WithName(\"GetApiHealth\")", StringComparison.Ordinal), "GET /api/health should have a stable endpoint name.");
        Assert(source.Contains(".WithName(\"GetRootHealth\")", StringComparison.Ordinal), "GET /health should have a stable endpoint name.");

        var healthSource = SliceBetween(source, "IResult GetHealth()", "// Root endpoint");
        Assert(healthSource.Contains("ok = true", StringComparison.Ordinal), "Health response should include ok=true.");
        Assert(healthSource.Contains("service = \"pumpkin-api\"", StringComparison.Ordinal), "Health response should include service identity.");
        Assert(healthSource.Contains("providerStatus = \"not_checked\"", StringComparison.Ordinal), "Health response should avoid provider dependency checks.");
        Assert(!healthSource.Contains("IDatabaseService", StringComparison.Ordinal), "Health endpoint must not depend on IDatabaseService.");
        Assert(!healthSource.Contains("DatabaseService", StringComparison.Ordinal), "Health endpoint must not depend on DatabaseService.");
        Assert(!healthSource.Contains("builder.Configuration", StringComparison.Ordinal), "Health endpoint must not read configuration.");
        Assert(!healthSource.Contains("GetSection", StringComparison.Ordinal), "Health endpoint must not read configuration sections.");
        Assert(!healthSource.Contains("ConnectionString", StringComparison.OrdinalIgnoreCase), "Health endpoint must not read connection strings.");
        Assert(!healthSource.Contains("Secret", StringComparison.OrdinalIgnoreCase), "Health endpoint must not read secrets.");
        Assert(!healthSource.Contains("Token", StringComparison.OrdinalIgnoreCase), "Health endpoint must not read tokens.");
        Assert(!healthSource.Contains("appsettings", StringComparison.OrdinalIgnoreCase), "Health endpoint must not read appsettings files.");
        Assert(!healthSource.Contains("local.settings", StringComparison.OrdinalIgnoreCase), "Health endpoint must not read local settings files.");
    }

    private static void VerifyFormEntryRouteShapes(string source)
    {
        Assert(source.Contains("app.MapPost(\"/api/forms/{tenantId}/entries\"", StringComparison.Ordinal), "POST /api/forms/{tenantId}/entries should be registered.");
        Assert(source.Contains(".WithName(\"SaveFormEntry\")", StringComparison.Ordinal), "FormEntry write route should keep SaveFormEntry endpoint name.");
        Assert(source.Contains("PumpkinManager.SaveFormEntryAsync", StringComparison.Ordinal), "FormEntry write route should call PumpkinManager.SaveFormEntryAsync.");
        Assert(source.Contains("app.MapGet(\"/api/admin/{tenantId}/form-entries\"", StringComparison.Ordinal), "GET /api/admin/{tenantId}/form-entries should be registered.");
        Assert(source.Contains(".WithName(\"GetFormEntries\")", StringComparison.Ordinal), "Admin FormEntry list route should keep GetFormEntries endpoint name.");

        var adminListSource = SliceBetween(source, "app.MapGet(\"/api/admin/{tenantId}/form-entries\"", "app.MapGet(\"/api/admin/{tenantId}/form-entries/{id}\"");
        Assert(adminListSource.Contains(".RequireAuthorization()", StringComparison.Ordinal), "Admin FormEntry list route should require authorization.");
        Assert(adminListSource.Contains("GetFormEntriesByTenantAsync", StringComparison.Ordinal), "Admin FormEntry list route should read tenant-scoped entries.");
    }

    private static string SliceBetween(string source, string startMarker, string endMarker)
    {
        var start = source.IndexOf(startMarker, StringComparison.Ordinal);
        Assert(start >= 0, $"Missing start marker: {startMarker}");
        var end = source.IndexOf(endMarker, start, StringComparison.Ordinal);
        Assert(end > start, $"Missing end marker after {startMarker}: {endMarker}");
        return source[start..end];
    }

    private static string FindRepoRoot()
    {
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            if (File.Exists(Path.Combine(current.FullName, "apps", "pumpkin-api", "Program.cs")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new DirectoryNotFoundException("Could not locate pumpkin-cms repo root.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException(message);
        }
    }
}
