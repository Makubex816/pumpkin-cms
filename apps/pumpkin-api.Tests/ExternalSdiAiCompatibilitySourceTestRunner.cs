namespace pumpkin_api.Tests;

public static class ExternalSdiAiCompatibilitySourceTestRunner
{
    public static async Task RunAsync()
    {
        var repoRoot = FindRepoRoot();
        var programSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Program.cs"));
        var managerSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Managers", "PumpkinManager.cs"));
        var guardSource = await File.ReadAllTextAsync(Path.Combine(repoRoot, "apps", "pumpkin-api", "Services", "FormSubmissionGuard.cs"));

        VerifyPublicSubmitAlias(programSource, managerSource, guardSource);
        VerifyAdminFormEntryAliases(programSource);
        VerifyDynamicGuardPreservesDefinitionBoundary(guardSource);

        Console.WriteLine("V2.8.53S external SDI-AI compatibility source checks passed.");
    }

    private static void VerifyPublicSubmitAlias(string programSource, string managerSource, string guardSource)
    {
        Assert(programSource.Contains("app.MapPost(\"/api/forms/{tenantId}/submit/{type}\"", StringComparison.Ordinal), "External submit alias should be registered.");
        Assert(programSource.Contains("BuildFormEntryFromSubmitAliasPayload(tenantId, type, payload, context)", StringComparison.Ordinal), "Submit alias should normalize wrapper or flat JSON payloads.");
        Assert(programSource.Contains("PumpkinManager.SaveFormEntrySubmitAliasAsync", StringComparison.Ordinal), "Submit alias should call the external compatibility manager path.");
        Assert(programSource.Contains(".WithName(\"SaveFormEntrySubmitAlias\")", StringComparison.Ordinal), "Submit alias should have a stable endpoint name.");
        Assert(programSource.Contains(".RequireCors(\"TenantCors\")", StringComparison.Ordinal), "Submit alias should preserve tenant CORS behavior.");

        Assert(managerSource.Contains("SaveFormEntrySubmitAliasAsync", StringComparison.Ordinal), "Manager should expose the submit alias method.");
        Assert(managerSource.Contains("SaveFormEntryAsync(databaseService, apiKey, tenantId, formEntry)", StringComparison.Ordinal), "Default contact/quote aliases should reuse the legacy submit path.");
        Assert(managerSource.Contains("databaseService.GetFormDefinitionAsync(apiKey, tenantId, normalizedType)", StringComparison.Ordinal), "Dynamic submit aliases should validate against a public FormDefinition.");
        Assert(managerSource.Contains("FormSubmissionGuard.SanitizeDynamic(formEntry, formDefinition)", StringComparison.Ordinal), "Dynamic submit aliases should use FormDefinition-scoped sanitization.");
        Assert(managerSource.Contains("databaseService.SaveFormEntryAsync(apiKey, tenantId, formEntry)", StringComparison.Ordinal), "Dynamic submit aliases should persist through the existing FormEntry container contract.");

        Assert(guardSource.Contains("SanitizeDynamic(FormEntry entry, FormDefinition definition)", StringComparison.Ordinal), "Dynamic guard should be present.");
    }

    private static void VerifyAdminFormEntryAliases(string programSource)
    {
        Assert(programSource.Contains("app.MapGet(\"/api/admin/forms/{tenantId}/entries\"", StringComparison.Ordinal), "Admin FormEntry list alias should be registered.");
        Assert(programSource.Contains("app.MapGet(\"/api/admin/forms/{tenantId}/entries/{entryId}\"", StringComparison.Ordinal), "Admin FormEntry detail alias should be registered.");
        Assert(programSource.Contains(".WithName(\"GetFormEntriesExternalAlias\")", StringComparison.Ordinal), "Admin FormEntry list alias should have a stable endpoint name.");
        Assert(programSource.Contains(".WithName(\"GetFormEntryExternalAlias\")", StringComparison.Ordinal), "Admin FormEntry detail alias should have a stable endpoint name.");

        var aliasRoutes = SliceBetween(programSource, "app.MapGet(\"/api/admin/forms/{tenantId}/entries\"", "// Admin: Update form entry status/tags only");
        Assert(Count(aliasRoutes, ".RequireAuthorization()") == 2, "Both Admin FormEntry aliases should require authorization.");
        Assert(Count(aliasRoutes, "tenantId != userTenantId && userRole != \"SuperAdmin\"") == 2, "Both Admin FormEntry aliases should enforce tenant match unless SuperAdmin.");
        Assert(aliasRoutes.Contains("GetFormEntriesByTenantAsync(tenantId)", StringComparison.Ordinal), "Admin FormEntry list alias should read tenant-scoped entries.");
        Assert(aliasRoutes.Contains("GetFormEntryAsync(tenantId, entryId)", StringComparison.Ordinal), "Admin FormEntry detail alias should read a tenant-scoped entry.");
    }

    private static void VerifyDynamicGuardPreservesDefinitionBoundary(string guardSource)
    {
        var dynamicGuard = SliceBetween(guardSource, "SanitizeDynamic(FormEntry entry, FormDefinition definition)", "private static string GetDataValue");
        Assert(dynamicGuard.Contains("definition.Fields", StringComparison.Ordinal), "Dynamic guard should derive allowed fields from FormDefinition fields.");
        Assert(dynamicGuard.Contains("definition.HiddenFields", StringComparison.Ordinal), "Dynamic guard should include hidden FormDefinition fields.");
        Assert(dynamicGuard.Contains("field.Required", StringComparison.Ordinal), "Dynamic guard should enforce required FormDefinition fields.");
        Assert(dynamicGuard.Contains("consent.Required", StringComparison.Ordinal), "Dynamic guard should preserve consent enforcement.");
        Assert(dynamicGuard.Contains("spamProtection.HoneypotFieldName", StringComparison.Ordinal), "Dynamic guard should preserve honeypot handling.");
        Assert(dynamicGuard.Contains("Unknown field", StringComparison.Ordinal), "Dynamic guard should drop unknown fields with warnings.");
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
