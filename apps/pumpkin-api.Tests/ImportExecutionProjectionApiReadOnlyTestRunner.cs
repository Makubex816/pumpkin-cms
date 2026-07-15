using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class ImportExecutionProjectionApiReadOnlyTestRunner
{
    private const string ExecutionRunId = "execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";
    private const string PackageHash = "sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073";
    private const string ApprovalManifestId = "approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly Regex SecretLikePattern = new(
        string.Concat(
            "(?i)(",
            "SWA_CLI_DEPLOYMENT_TOKEN", @"\s*=",
            "|eyJ[A-Za-z0-9_-]{20,}",
            "|-----BEGIN [A-Z ]*PRIVATE ", "KEY-----",
            "|Account", "Key=",
            "|SharedAccess", "Signature=",
            @"|\bsig=[A-Za-z0-9%_-]{20,}",
            "|DefaultEndpoints", "Protocol=",
            @"|mongodb\+srv://",
            "|post", @"gres(ql)?://",
            "|my", "sql://",
            ")"),
        RegexOptions.Compiled);

    public static async Task RunAsync()
    {
        Console.WriteLine("V2.11.9 Import Execution Projection API read-only endpoint tests");

        var provider = new FixtureImportExecutionProjectionReadOnlyProvider();
        var service = new ImportExecutionProjectionReadOnlyService(provider);

        await AssertExecutionList(service);
        await AssertProjectionDetail(service);
        await AssertReadbackMappingsAuditRollback(service);
        await AssertAllSevenEndpointHandlers(service);
        await AssertNotFoundReturnsReadOnlyError(service);
        await AssertNoMutationRoutesRegistered();
        await AssertNoSecretLikeValues(service);
        await AssertDeferredHardStopsAndRollerExclusion(service);

        Console.WriteLine("V2.11.9 tests passed");
    }

    private static async Task AssertExecutionList(IImportExecutionProjectionReadOnlyService service)
    {
        var response = await service.ListExecutionsAsync(new ImportExecutionProjectionApiQuery());
        Assert(response.Ok, "execution list should be ok");
        Assert(response.Status == StatusCodes.Status200OK, "execution list status should be 200");
        Assert(response.ReadOnly, "execution list should be read-only");
        Assert(response.ProviderMode == ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly, "execution list should use import-execution projection provider mode");
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "execution list should preserve indexing deferred hard stop");
        Assert(response.Meta.WriteActionsAllowed == false, "execution list should disallow write actions");
        Assert(response.SecurityBoundary.NoWriteBoundarySatisfied, "execution list should satisfy no-write boundary");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "execution list should have no open write flags");
        Assert(response.Data?.Items.Count == 1, "execution list should return the frozen Ice execution only");
        Assert(response.Data!.Items[0].ExecutionRunId == ExecutionRunId, "execution list should include the frozen execution run id");
        Assert(response.Data.Items[0].PackageHash == PackageHash, "execution list should preserve package hash");

        var filtered = await service.ListExecutionsAsync(new ImportExecutionProjectionApiQuery
        {
            TenantKey = "ice-rink-rentals",
            TargetMode = "local_scoped_import_execution",
            ReadbackState = "passed",
            HardStopState = "deferred_hard_stop"
        });
        Assert(filtered.Ok && filtered.Data?.Items.Count == 1, "tenant/target/readback/hard-stop filter should return Ice execution only");
    }

    private static async Task AssertProjectionDetail(IImportExecutionProjectionReadOnlyService service)
    {
        var detail = await service.GetExecutionAsync(ExecutionRunId);
        Assert(detail.Ok, "execution detail should be ok");
        Assert(detail.Data?.SchemaVersion == ImportExecutionProjectionContractVersions.SharedModel, "projection schema should match shared model");
        Assert(detail.Data!.ProjectionMode == "local_readonly_evidence_freeze", "projection mode should be frozen read-only evidence");
        Assert(detail.Data.PackageHash == PackageHash, "projection should preserve package hash");
        Assert(detail.Data.ApprovalManifestId == ApprovalManifestId, "projection should preserve approval manifest");
        Assert(detail.Data.EntityMappings.Total == 10, "projection should preserve ten local mappings");
        Assert(detail.Data.OperatorPanels.Count == 15, "projection should preserve V2.11.8 operator panel count");
        Assert(detail.Data.FutureApiRoutes.Count == 7, "projection should expose seven GET-only API routes");
        Assert(detail.Data.FutureApiRoutes.All(route => route.Method == "GET"), "all projection routes should be GET-only");
        Assert(detail.Data.FutureActions.All(action => action.Disabled), "all future actions should be disabled");
        Assert(detail.Data.AdminProjection.WriteControlsAllowed == false, "Admin projection should not allow write controls");
    }

    private static async Task AssertReadbackMappingsAuditRollback(IImportExecutionProjectionReadOnlyService service)
    {
        var readback = await service.GetReadbackAsync(ExecutionRunId);
        Assert(readback.Ok && readback.Data?.Status == "passed", "readback should be passed");
        Assert(readback.Data!.Counts.Routes.Ok && readback.Data.Counts.Routes.Expected == 3 && readback.Data.Counts.Routes.Actual == 3, "route readback should be 3/3");
        Assert(readback.Data.Counts.ContentRefs.Ok && readback.Data.Counts.ContentRefs.Expected == 4 && readback.Data.Counts.ContentRefs.Actual == 4, "content readback should be 4/4");
        Assert(readback.Data.Counts.MediaRefs.Ok && readback.Data.Counts.MediaRefs.Expected == 1 && readback.Data.Counts.MediaRefs.Actual == 1, "media readback should be 1/1");
        Assert(readback.Data.Counts.FormConfigRefs.Ok && readback.Data.Counts.FormConfigRefs.Expected == 1 && readback.Data.Counts.FormConfigRefs.Actual == 1, "form readback should be 1/1");

        var mappings = await service.GetEntityMappingsAsync(ExecutionRunId);
        Assert(mappings.Ok && mappings.Data?.Total == 10, "entity mapping route should expose ten mappings");
        Assert(mappings.Data!.RouteMappings.Count == 3, "entity mapping route should expose three route mappings");
        Assert(mappings.Data.ContentMappings.Count == 4, "entity mapping route should expose four content mappings");

        var audit = await service.GetAuditAsync(ExecutionRunId);
        Assert(audit.Ok && audit.Data?.AuditTraceId == "audit-trace-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local", "audit route should expose audit trace id");
        Assert(audit.Data!.EvidenceChain.Count >= 3, "audit route should expose evidence chain refs");

        var rollback = await service.GetRollbackAsync(ExecutionRunId);
        Assert(rollback.Ok && rollback.Data?.RollbackPlanId == "rollback:v2-8-17d-production-rollback-plan", "rollback route should expose rollback plan");
        Assert(rollback.Data!.AbortEnabled == false && rollback.Data.RollbackEnabled == false, "rollback route should keep actions disabled");
    }

    private static async Task AssertAllSevenEndpointHandlers(IImportExecutionProjectionReadOnlyService service)
    {
        var context = CreateHttpContext();
        var routeResults = new[]
        {
            await ImportExecutionProjectionReadOnlyEndpoints.ListExecutionsAsync(service, new ImportExecutionProjectionApiQuery(), context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetExecutionAsync(service, ExecutionRunId, context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetReadbackAsync(service, ExecutionRunId, context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetEntityMappingsAsync(service, ExecutionRunId, context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetAuditAsync(service, ExecutionRunId, context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetRollbackAsync(service, ExecutionRunId, context),
            await ImportExecutionProjectionReadOnlyEndpoints.GetOperatorProjectionAsync(service, ExecutionRunId, context)
        };

        foreach (var result in routeResults)
        {
            using var document = await ExecuteJsonResult(result, context);
            var root = document.RootElement;
            Assert(root.GetProperty("ok").GetBoolean(), "endpoint envelope should be ok");
            Assert(root.GetProperty("status").GetInt32() == StatusCodes.Status200OK, "endpoint envelope status should be 200");
            Assert(root.GetProperty("readOnly").GetBoolean(), "endpoint envelope should be read-only");
            Assert(root.GetProperty("providerMode").GetString() == ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly, "endpoint provider mode should be import-execution projection fixture provider");
            Assert(root.GetProperty("meta").GetProperty("writeActionsAllowed").GetBoolean() == false, "endpoint meta should disallow writes");
            Assert(root.GetProperty("securityBoundary").GetProperty("openFlags").GetArrayLength() == 0, "endpoint security boundary should have no open flags");
        }
    }

    private static async Task AssertNotFoundReturnsReadOnlyError(IImportExecutionProjectionReadOnlyService service)
    {
        var response = await service.GetExecutionAsync("missing-execution-run");
        Assert(!response.Ok, "missing execution should return an error envelope");
        Assert(response.Status == StatusCodes.Status404NotFound, "missing execution should return 404");
        Assert(response.Code == ImportExecutionProjectionApiErrorCodes.ExecutionNotFound, "missing execution should return execution-not-found");
        Assert(response.ReadOnly, "missing execution error should remain read-only");
        Assert(response.ProviderMode == ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly, "missing execution error should preserve provider mode");
    }

    private static async Task AssertNoMutationRoutesRegistered()
    {
        var endpointSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Services", "ImportExecutions", "ImportExecutionProjectionReadOnlyEndpoints.cs"));
        Assert(Count(endpointSource, "MapGet(") == 7, "Import Execution endpoint mapper should register exactly seven GET routes");
        Assert(!endpointSource.Contains("MapPost(", StringComparison.Ordinal), "Import Execution endpoint mapper must not register POST");
        Assert(!endpointSource.Contains("MapPut(", StringComparison.Ordinal), "Import Execution endpoint mapper must not register PUT");
        Assert(!endpointSource.Contains("MapPatch(", StringComparison.Ordinal), "Import Execution endpoint mapper must not register PATCH");
        Assert(!endpointSource.Contains("MapDelete(", StringComparison.Ordinal), "Import Execution endpoint mapper must not register DELETE");

        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        Assert(programSource.Contains("MapImportExecutionProjectionReadOnlyEndpoints", StringComparison.Ordinal), "Program should register Import Execution read-only endpoints");
        Assert(!programSource.Contains("MapImportExecutionProjectionWrite", StringComparison.Ordinal), "Program must not register Import Execution write routes");
    }

    private static async Task AssertNoSecretLikeValues(IImportExecutionProjectionReadOnlyService service)
    {
        var responses = new object[]
        {
            await service.ListExecutionsAsync(new ImportExecutionProjectionApiQuery()),
            await service.GetExecutionAsync(ExecutionRunId),
            await service.GetReadbackAsync(ExecutionRunId),
            await service.GetEntityMappingsAsync(ExecutionRunId),
            await service.GetAuditAsync(ExecutionRunId),
            await service.GetRollbackAsync(ExecutionRunId),
            await service.GetOperatorProjectionAsync(ExecutionRunId)
        };

        foreach (var response in responses)
        {
            var json = JsonSerializer.Serialize(response, JsonOptions);
            Assert(!SecretLikePattern.IsMatch(json), "Import Execution Projection API response should not include high-confidence secret-like values");
        }
    }

    private static async Task AssertDeferredHardStopsAndRollerExclusion(IImportExecutionProjectionReadOnlyService service)
    {
        var response = await service.GetOperatorProjectionAsync(ExecutionRunId);
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "operator projection should preserve indexing deferred hard stop");
        Assert(response.Meta.Deployment == false, "operator projection should keep deployment false");
        Assert(response.Meta.SearchConsoleIndexing == false, "operator projection should keep search console indexing false");
        Assert(response.Meta.CmsWrites == false && response.Meta.ProviderWrites == false && response.Meta.MediaAssetWrites == false, "operator projection should keep CMS/provider/media writes false");
        Assert(response.Meta.ProtectedConfigReads == false, "operator projection should not read protected config");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "operator projection should expose no open flags");
        Assert(response.SecurityBoundary.ProhibitedActionFlags.All(flag => flag.Value == false), "operator projection should keep prohibited action flags false");
        Assert(response.Data!.RollerExclusion.State == "blocked_no_import_no_resume", "Roller state should remain blocked no-import/no-resume");
        Assert(response.Data.RollerExclusion.ImportApproved == false && response.Data.RollerExclusion.ResumeApproved == false, "Roller import/resume should remain unapproved");
        Assert(response.Data.FutureOlmStagingWriteRetryGoal.State == "future_boundary_required", "OLM staging write retry should remain future gated");
    }

    private static DefaultHttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext
        {
            RequestServices = new ServiceCollection().AddLogging().BuildServiceProvider()
        };
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<JsonDocument> ExecuteJsonResult(IResult result, DefaultHttpContext context)
    {
        context.Response.Body.SetLength(0);
        await result.ExecuteAsync(context);
        context.Response.Body.Position = 0;
        return await JsonDocument.ParseAsync(context.Response.Body);
    }

    private static int Count(string source, string value)
        => source.Split(value, StringSplitOptions.None).Length - 1;

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
