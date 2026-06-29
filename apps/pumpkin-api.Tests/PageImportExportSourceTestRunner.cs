namespace pumpkin_api.Tests;

public static class PageImportExportSourceTestRunner
{
    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.43 page import/export source tests");

        var repoRoot = FindRepoRoot();
        var programSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Program.cs"));
        var databaseInterfaceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDatabaseService.cs"));
        var connectionInterfaceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDataConnection.cs"));
        var cosmosSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));

        Assert(programSource.Contains("MapGet(\"/api/admin/pages/{tenantId}/export\"", StringComparison.Ordinal),
            "Single-page export route should be registered under the admin tenant page boundary");
        Assert(programSource.Contains("Single-page export requires a slug query parameter.", StringComparison.Ordinal),
            "Export should require an explicit single page slug");
        Assert(programSource.Contains("pageCount = 1", StringComparison.Ordinal),
            "Export should emit a one-page package");
        Assert(programSource.Contains("MapPost(\"/api/admin/pages/{tenantId}/import\"", StringComparison.Ordinal),
            "Single-page import route should be registered under the admin tenant page boundary");
        Assert(programSource.Contains("importRequest.Pages.Count != 1", StringComparison.Ordinal),
            "Import should reject multi-page packages in this phase");
        Assert(programSource.Contains("Imported page tenant ID must match the route tenant ID.", StringComparison.Ordinal),
            "Import should reject cross-tenant page bodies");
        Assert(programSource.Contains("SaveImportRunAsync(tenantId, importRun)", StringComparison.Ordinal),
            "Import should save a tenant-scoped ImportRun audit record");
        Assert(programSource.Contains("No themes, forms, media binaries", StringComparison.Ordinal),
            "Import/export route descriptions should document out-of-scope resources");
        Assert(programSource.Contains("MapDelete(\"/api/admin/pages/{tenantId}/{**pageSlug}\"", StringComparison.Ordinal),
            "Admin page cleanup route should be registered");
        Assert(programSource.Contains("databaseService.DeletePageAdminAsync(tenantId, decodedSlug)", StringComparison.Ordinal),
            "Admin cleanup route should call tenant-scoped delete");

        foreach (var route in new[]
        {
            "MapGet(\"/api/admin/pages/{tenantId}/export\"",
            "MapPost(\"/api/admin/pages/{tenantId}/import\"",
            "MapDelete(\"/api/admin/pages/{tenantId}/{**pageSlug}\""
        })
        {
            var routeSource = SliceRoute(programSource, route);
            Assert(routeSource.Contains("context.User?.Identity?.IsAuthenticated != true", StringComparison.Ordinal),
                $"{route} should reject unauthenticated callers");
            Assert(routeSource.Contains("var userTenantId = context.User.FindFirst(\"tenantId\")?.Value;", StringComparison.Ordinal),
                $"{route} should read tenant claim");
            Assert(routeSource.Contains("if (tenantId != userTenantId && userRole != \"SuperAdmin\")", StringComparison.Ordinal),
                $"{route} should forbid cross-tenant access unless SuperAdmin");
            Assert(routeSource.Contains(".RequireAuthorization()", StringComparison.Ordinal),
                $"{route} should require authorization");
        }

        Assert(databaseInterfaceSource.Contains("Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug);", StringComparison.Ordinal),
            "IDatabaseService should expose tenant-scoped admin page cleanup");
        Assert(connectionInterfaceSource.Contains("Task<bool> DeletePageAdminAsync(string tenantId, string pageSlug);", StringComparison.Ordinal),
            "IDataConnection should expose tenant-scoped admin page cleanup");
        Assert(cosmosSource.Contains("GetPageBySlugAsync(tenantId, pageSlug)", StringComparison.Ordinal),
            "Cosmos admin page cleanup should resolve through tenant-scoped slug read");
        Assert(cosmosSource.Contains("DeleteItemAsync<Page>(existingPage.PageId, new PartitionKey(tenantId))", StringComparison.Ordinal),
            "Cosmos admin page cleanup should delete by page id and tenant partition key");

        Console.WriteLine("V2.8.43 page import/export source tests passed");
    }

    private static string SliceRoute(string source, string marker)
    {
        var start = source.IndexOf(marker, StringComparison.Ordinal);
        if (start < 0)
            return string.Empty;
        var next = source.IndexOf("app.Map", start + marker.Length, StringComparison.Ordinal);
        return next > start ? source[start..next] : source[start..];
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException(message);
    }

    private static string FindRepoRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory != null)
        {
            if (Directory.Exists(Path.Combine(directory.FullName, ".git")))
                return directory.FullName;
            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("Could not find repository root.");
    }
}
