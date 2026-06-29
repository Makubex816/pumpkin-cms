using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class MediaAssetLifecycleCleanupTestRunner
{
    public static async Task RunAsync()
    {
        Console.WriteLine("V2.8.42 MediaAsset lifecycle cleanup source tests");

        var repoRoot = FindRepoRoot();
        var programSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Program.cs"));
        var serviceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var databaseInterfaceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDatabaseService.cs"));
        var connectionInterfaceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDataConnection.cs"));
        var storageSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "MediaStorageService.cs"));

        Assert(programSource.Contains("MapDelete(\"/api/admin/{tenantId}/media-assets/{id}\"", StringComparison.Ordinal),
            "MediaAsset cleanup route should be registered as tenant-scoped DELETE");
        Assert(programSource.Contains(".RequireAuthorization()", StringComparison.Ordinal),
            "MediaAsset cleanup route should require authorization");
        Assert(programSource.Contains("context.User?.Identity?.IsAuthenticated != true", StringComparison.Ordinal),
            "MediaAsset cleanup route should reject unauthenticated callers");
        Assert(programSource.Contains("var userTenantId = context.User.FindFirst(\"tenantId\")?.Value;", StringComparison.Ordinal),
            "MediaAsset cleanup route should read tenant claim");
        Assert(programSource.Contains("if (tenantId != userTenantId && userRole != \"SuperAdmin\")", StringComparison.Ordinal),
            "MediaAsset cleanup route should forbid cross-tenant delete unless SuperAdmin");
        Assert(programSource.Contains("databaseService.DeleteMediaAssetAsync(tenantId, id)", StringComparison.Ordinal),
            "MediaAsset cleanup route should call tenant-scoped service method");
        Assert(programSource.Contains("The underlying blob is not deleted by this endpoint.", StringComparison.Ordinal),
            "MediaAsset cleanup route should document metadata-only cleanup");

        Assert(databaseInterfaceSource.Contains("Task<bool> DeleteMediaAssetAsync(string tenantId, string id);", StringComparison.Ordinal),
            "IDatabaseService should expose tenant-scoped MediaAsset cleanup");
        Assert(connectionInterfaceSource.Contains("Task<bool> DeleteMediaAssetAsync(string tenantId, string id);", StringComparison.Ordinal),
            "IDataConnection should expose tenant-scoped MediaAsset cleanup");
        Assert(serviceSource.Contains("GetMediaAssetAsync(tenantId, id)", StringComparison.Ordinal),
            "Cosmos cleanup should resolve id/assetId through tenant-scoped read");
        Assert(serviceSource.Contains("DeleteItemAsync<MediaAsset>(existingMediaAsset.Id, new PartitionKey(tenantId))", StringComparison.Ordinal),
            "Cosmos cleanup should delete by resolved id and tenant partition key");

        var deleteRouteIndex = programSource.IndexOf("MapDelete(\"/api/admin/{tenantId}/media-assets/{id}\"", StringComparison.Ordinal);
        var nextRouteIndex = programSource.IndexOf("app.Map", deleteRouteIndex + 1, StringComparison.Ordinal);
        var deleteRouteSource = nextRouteIndex > deleteRouteIndex
            ? programSource[deleteRouteIndex..nextRouteIndex]
            : programSource[deleteRouteIndex..];
        Assert(!deleteRouteSource.Contains("storageService", StringComparison.OrdinalIgnoreCase),
            "Cleanup route should not delete blobs");
        Assert(!deleteRouteSource.Contains("DeleteBlob", StringComparison.OrdinalIgnoreCase),
            "Cleanup route should not delete blobs");
        Assert(!storageSource.Contains("DeleteAsync", StringComparison.Ordinal),
            "Media storage service should not gain blob delete behavior in this phase");

        Console.WriteLine("V2.8.42 MediaAsset lifecycle cleanup source tests passed");
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
