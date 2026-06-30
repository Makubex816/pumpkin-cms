namespace pumpkin_api.Tests;

public static class FormDefinitionApiSourceTestRunner
{
    public static async Task RunAsync()
    {
        var repoRoot = FindRepoRoot();
        var programSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Program.cs"));
        var managerSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Managers", "PumpkinManager.cs"));
        var databaseServiceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "DatabaseService.cs"));
        var dataConnectionSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDataConnection.cs"));
        var databaseInterfaceSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "IDatabaseService.cs"));
        var cosmosSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));

        VerifyRouteContract(programSource);
        VerifyTenantAuthorization(programSource);
        VerifyManagerValidation(managerSource);
        VerifyServiceContract(databaseServiceSource, dataConnectionSource, databaseInterfaceSource);
        VerifyCosmosPersistenceContract(cosmosSource);

        Console.WriteLine("V2.8.48 FormDefinition API source checks passed.");
    }

    private static void VerifyRouteContract(string source)
    {
        Assert(source.Contains("app.MapGet(\"/api/forms/{tenantId}/definitions/{type}\"", StringComparison.Ordinal), "Public FormDefinition read route should be registered.");
        Assert(source.Contains("PumpkinManager.GetFormDefinitionAsync", StringComparison.Ordinal), "Public FormDefinition route should call PumpkinManager.GetFormDefinitionAsync.");
        Assert(source.Contains(".WithName(\"GetFormDefinition\")", StringComparison.Ordinal), "Public FormDefinition route should have stable endpoint name.");

        Assert(source.Contains("app.MapGet(\"/api/admin/forms/{tenantId}/definitions\"", StringComparison.Ordinal), "Admin FormDefinition list route should be registered.");
        Assert(source.Contains("app.MapGet(\"/api/admin/forms/{tenantId}/definitions/{formDefinitionId}\"", StringComparison.Ordinal), "Admin FormDefinition read route should be registered.");
        Assert(source.Contains("app.MapPost(\"/api/admin/forms/{tenantId}/definitions\"", StringComparison.Ordinal), "Admin FormDefinition create route should be registered.");
        Assert(source.Contains("app.MapPut(\"/api/admin/forms/{tenantId}/definitions/{formDefinitionId}\"", StringComparison.Ordinal), "Admin FormDefinition update route should be registered.");
        Assert(source.Contains("app.MapDelete(\"/api/admin/forms/{tenantId}/definitions/{formDefinitionId}\"", StringComparison.Ordinal), "Admin FormDefinition delete route should be registered.");
        Assert(source.Contains(".WithName(\"CreateFormDefinition\")", StringComparison.Ordinal), "Admin FormDefinition create route should have stable endpoint name.");
        Assert(source.Contains(".WithName(\"UpdateFormDefinition\")", StringComparison.Ordinal), "Admin FormDefinition update route should have stable endpoint name.");
        Assert(source.Contains(".WithName(\"DeleteFormDefinition\")", StringComparison.Ordinal), "Admin FormDefinition delete route should have stable endpoint name.");
    }

    private static void VerifyTenantAuthorization(string source)
    {
        var adminRoutes = SliceBetween(source, "app.MapGet(\"/api/admin/forms/{tenantId}/definitions\"", "// Admin: List publish/build runs for a tenant");
        Assert(Count(adminRoutes, ".RequireAuthorization()") == 5, "Each Admin FormDefinition route should require JWT authorization.");
        Assert(Count(adminRoutes, "tenantId != userTenantId && userRole != \"SuperAdmin\"") == 5, "Each Admin FormDefinition route should enforce tenant match unless SuperAdmin.");
        Assert(adminRoutes.Contains("PumpkinManager.GetFormDefinitionsByTenantAsync", StringComparison.Ordinal), "Admin list should use tenant-scoped FormDefinition manager method.");
        Assert(adminRoutes.Contains("PumpkinManager.GetFormDefinitionAdminAsync", StringComparison.Ordinal), "Admin read should use tenant-scoped FormDefinition manager method.");
        Assert(adminRoutes.Contains("PumpkinManager.CreateFormDefinitionAsync", StringComparison.Ordinal), "Admin create should use tenant-scoped FormDefinition manager method.");
        Assert(adminRoutes.Contains("PumpkinManager.UpdateFormDefinitionAsync", StringComparison.Ordinal), "Admin update should use tenant-scoped FormDefinition manager method.");
        Assert(adminRoutes.Contains("PumpkinManager.DeleteFormDefinitionAsync", StringComparison.Ordinal), "Admin delete should use tenant-scoped FormDefinition manager method.");
    }

    private static void VerifyManagerValidation(string source)
    {
        Assert(source.Contains("PrepareFormDefinition", StringComparison.Ordinal), "Manager should normalize and validate FormDefinitions before storage.");
        Assert(source.Contains("PageRedirectGuard.NormalizeSlug(definition.FormKey)", StringComparison.Ordinal), "FormDefinition formKey should be slug-normalized.");
        Assert(source.Contains("\"draft\", \"active\", \"published\", \"archived\"", StringComparison.Ordinal), "FormDefinition status vocabulary should be explicit.");
        Assert(source.Contains("ContainsSecretLikeValue", StringComparison.Ordinal), "FormDefinition references should reject secret-like values.");
        Assert(source.Contains("Form definition ID cannot change", StringComparison.Ordinal), "FormDefinition update should preserve route identity.");
    }

    private static void VerifyServiceContract(params string[] sources)
    {
        foreach (var source in sources)
        {
            Assert(source.Contains("GetFormDefinitionAsync", StringComparison.Ordinal), "Service contract should include public FormDefinition read.");
            Assert(source.Contains("GetFormDefinitionsByTenantAsync", StringComparison.Ordinal), "Service contract should include admin FormDefinition list.");
            Assert(source.Contains("GetFormDefinitionAdminAsync", StringComparison.Ordinal), "Service contract should include admin FormDefinition read.");
            Assert(source.Contains("CreateFormDefinitionAsync", StringComparison.Ordinal), "Service contract should include admin FormDefinition create.");
            Assert(source.Contains("UpdateFormDefinitionAsync", StringComparison.Ordinal), "Service contract should include admin FormDefinition update.");
            Assert(source.Contains("DeleteFormDefinitionAsync", StringComparison.Ordinal), "Service contract should include admin FormDefinition delete.");
        }
    }

    private static void VerifyCosmosPersistenceContract(string source)
    {
        Assert(source.Contains("_database.GetContainer(\"FormDefinition\")", StringComparison.Ordinal), "Cosmos FormDefinition container name should be source-confirmed.");
        Assert(source.Contains("new PartitionKey(tenantId)", StringComparison.Ordinal), "Cosmos FormDefinition writes should use tenantId partition key.");
        Assert(source.Contains("c.tenantId = @tenantId", StringComparison.Ordinal), "Cosmos FormDefinition queries should filter by tenantId.");
        Assert(source.Contains("c.formKey = @type OR c.formType = @type", StringComparison.Ordinal), "Public FormDefinition read should match formKey or formType.");
        Assert(source.Contains("ValidateTenantApiKeyAsync(apiKey, tenantId)", StringComparison.Ordinal), "Public FormDefinition read should validate tenant API key.");
    }

    private static string SliceBetween(string source, string startMarker, string endMarker)
    {
        var start = source.IndexOf(startMarker, StringComparison.Ordinal);
        Assert(start >= 0, $"Missing start marker: {startMarker}");
        var end = source.IndexOf(endMarker, start, StringComparison.Ordinal);
        Assert(end > start, $"Missing end marker after {startMarker}: {endMarker}");
        return source[start..end];
    }

    private static int Count(string source, string value)
    {
        var count = 0;
        var index = 0;
        while ((index = source.IndexOf(value, index, StringComparison.Ordinal)) >= 0)
        {
            count++;
            index += value.Length;
        }

        return count;
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
