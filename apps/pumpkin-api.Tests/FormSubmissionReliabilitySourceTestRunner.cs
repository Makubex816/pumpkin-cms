namespace pumpkin_api.Tests;

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

        Assert(model.Contains("SubmissionId", StringComparison.Ordinal), "submissionId is persisted");
        Assert(model.Contains("CorrelationId", StringComparison.Ordinal), "correlationId is persisted");
        Assert(program.Contains("/api/forms/{tenantId}/preflight/{type}", StringComparison.Ordinal), "no-write preflight exists");
        Assert(program.Contains("context.Request.Query[\"submissionId\"]", StringComparison.Ordinal), "submission readback exists");
        Assert(manager.Contains("CancelAfter(TimeSpan.FromSeconds(10))", StringComparison.Ordinal), "API bound exists");
        Assert(cosmos.Contains("Id = formEntry.SubmissionId", StringComparison.Ordinal), "Cosmos deterministic identity exists");
        Assert(cosmos.Contains("IdempotentReplay = true", StringComparison.Ordinal), "Cosmos replay exists");
        Assert(mongo.Contains("ServerErrorCategory.DuplicateKey", StringComparison.Ordinal), "Mongo race recovery exists");
        Assert(mongo.Contains("IdempotentReplay = true", StringComparison.Ordinal), "Mongo replay exists");
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
