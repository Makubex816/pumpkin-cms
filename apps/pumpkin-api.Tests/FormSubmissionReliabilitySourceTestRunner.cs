namespace pumpkin_api.Tests;

using pumpkin_api.Services;
using pumpkin_net_models.Models;

public static class FormSubmissionReliabilitySourceTestRunner
{
    public static Task RunAsync()
    {
        var root = FindRepositoryRoot();
        var program = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        var manager = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Managers", "PumpkinManager.cs"));
        var cosmos = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var mongo = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "MongoDataConnection.cs"));
        var model = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-net-models", "Models", "FormEntry.cs"));
        var guard = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "FormSubmissionGuard.cs"));

        Assert(model.Contains("SubmissionId", StringComparison.Ordinal), "submissionId is persisted");
        Assert(model.Contains("CorrelationId", StringComparison.Ordinal), "correlationId is persisted");
        Assert(program.Contains("/api/forms/{tenantId}/preflight/{type}", StringComparison.Ordinal), "no-write preflight exists");
        Assert(program.Contains("PreflightExactFormSubmission", StringComparison.Ordinal), "exact payload no-write preflight exists");
        Assert(program.Contains("createsFormEntry = false", StringComparison.Ordinal), "preflight proves no persistence");
        Assert(program.Contains("context.Request.Query[\"submissionId\"]", StringComparison.Ordinal), "submission readback exists");
        Assert(program.Contains("context.Request.Query[\"sourceHost\"]", StringComparison.Ordinal), "tenant inbox source-host filtering exists");
        Assert(program.Contains("Math.Clamp(requestedPageSize, 1, 200)", StringComparison.Ordinal), "tenant inbox pagination is bounded");
        Assert(program.Contains("/api/admin/{tenantId}/form-readiness", StringComparison.Ordinal), "safe readiness snapshot exists");
        Assert(program.Contains("external_runtime_freeze", StringComparison.Ordinal), "runtime freeze has an explicit readiness state");
        Assert(manager.Contains("CancelAfter(TimeSpan.FromSeconds(10))", StringComparison.Ordinal), "API bound exists");
        Assert(manager.Contains("LeadPersistenceStatus = \"persisted\"", StringComparison.Ordinal), "persistence status is independent");
        Assert(manager.Contains("NotificationDeliveryStatus = \"not_configured\"", StringComparison.Ordinal), "notification state is independent");
        Assert(cosmos.Contains("Id = formEntry.SubmissionId", StringComparison.Ordinal), "Cosmos deterministic identity exists");
        Assert(cosmos.Contains("IdempotentReplay = true", StringComparison.Ordinal), "Cosmos replay exists");
        Assert(mongo.Contains("ServerErrorCategory.DuplicateKey", StringComparison.Ordinal), "Mongo race recovery exists");
        Assert(mongo.Contains("IdempotentReplay = true", StringComparison.Ordinal), "Mongo replay exists");
        Assert(guard.Contains("NormalizeFieldIdentity", StringComparison.Ordinal), "compiler/runtime field naming aliases reconcile safely");
        var definition = new FormDefinition
        {
            FormKey = "test-form",
            FormType = "lead",
            Fields = new List<FormDefinitionField>
            {
                new() { Name = "privacyconsent", Id = "privacyconsent", Type = "checkbox", Required = true },
                new() { Name = "tenant-id", Id = "tenant-id", Type = "hidden", Required = true },
                new() { Name = "form-key", Id = "form-key", Type = "hidden", Required = true }
            },
            Consent = new FormConsent { Required = true, FieldName = "privacyConsent" },
            SpamProtection = new FormSpamProtection { HoneypotFieldName = "companyWebsite" }
        };
        var entry = new FormEntry
        {
            TenantId = "test-tenant",
            FormId = "test-form",
            FormKey = "test-form",
            FormData = new Dictionary<string, object> { ["privacyConsent"] = true, ["tenantId"] = "test-tenant", ["formKey"] = "test-form", ["companyWebsite"] = "" }
        };
        var validation = FormSubmissionGuard.SanitizeDynamic(entry, definition);
        Assert(validation.Ok && entry.ConsentAccepted, "runtime aliases satisfy canonical required fields and consent");
        Console.WriteLine("Form submission reliability source contract passed.");
        return Task.CompletedTask;
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current != null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, ".git")) || File.Exists(Path.Combine(current.FullName, ".git"))) return current.FullName;
            current = current.Parent;
        }
        throw new DirectoryNotFoundException("Repository root not found.");
    }
}
