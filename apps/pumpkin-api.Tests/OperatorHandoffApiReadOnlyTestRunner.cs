using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class OperatorHandoffApiReadOnlyTestRunner
{
    private const string IcePacketId = "handoff-ice-rink-rentals-v2-12-1";
    private const string RollerPacketId = "handoff-roller-rink-rentals-paused-v2-12-1";
    private const string PackageHash = "sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073";
    private const string ApprovalManifestId = "approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution";
    private const string ExecutionRunId = "execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";

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
        Console.WriteLine("V2.12.3 Operator Handoff API read-only endpoint tests");

        var provider = new FixtureOperatorHandoffReadOnlyProvider();
        var service = new OperatorHandoffReadOnlyService(provider);

        await AssertHandoffList(service);
        await AssertIceHandoffDetail(service);
        await AssertRollerPausedDetail(service);
        await AssertParityEvidenceProjectionAndQa(service);
        await AssertAllSixEndpointHandlers(service);
        await AssertNotFoundReturnsReadOnlyError(service);
        await AssertNoMutationRoutesRegistered();
        await AssertNoSecretLikeValues(service);
        await AssertDeferredHardStopsAndClosedBoundaries(service);

        Console.WriteLine("V2.12.3 tests passed");
    }

    private static async Task AssertHandoffList(IOperatorHandoffReadOnlyService service)
    {
        var response = await service.ListHandoffsAsync(new OperatorHandoffApiQuery());
        Assert(response.Ok, "handoff list should be ok");
        Assert(response.Status == StatusCodes.Status200OK, "handoff list status should be 200");
        Assert(response.ReadOnly, "handoff list should be read-only");
        Assert(response.ProviderMode == OperatorHandoffApiProviderModes.LocalFixtureReadOnly, "handoff list should use operator handoff provider mode");
        Assert(response.Meta.AllowedMethods.SequenceEqual(["GET"]), "handoff list should expose GET as the only allowed method");
        Assert(response.Meta.MutationMethodsAllowed == false, "handoff list should disallow mutation methods");
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "handoff list should preserve indexing deferred hard stop");
        Assert(response.Meta.WriteActionsAllowed == false, "handoff list should disallow write actions");
        Assert(response.SecurityBoundary.NoWriteBoundarySatisfied, "handoff list should satisfy no-write boundary");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "handoff list should have no open write flags");
        Assert(response.Data?.Items.Count == 2, "handoff list should return Ice and Roller handoffs");
        Assert(response.Data!.Items.Any(item => item.HandoffPacketId == IcePacketId), "handoff list should include Ice handoff");
        Assert(response.Data.Items.Any(item => item.HandoffPacketId == RollerPacketId), "handoff list should include Roller handoff");

        var filtered = await service.ListHandoffsAsync(new OperatorHandoffApiQuery
        {
            TenantKey = "ice-rink-rentals",
            TenantState = "scoped_local_import_executed_readback_passed",
            ParityState = "passed",
            Search = "iceskatingrinkrentals"
        });
        Assert(filtered.Ok && filtered.Data?.Items.Count == 1, "tenant/state/parity/search filter should return Ice handoff only");
    }

    private static async Task AssertIceHandoffDetail(IOperatorHandoffReadOnlyService service)
    {
        var detail = await service.GetHandoffAsync(IcePacketId);
        Assert(detail.Ok, "Ice detail should be ok");
        Assert(detail.Data?.SchemaVersion == OperatorHandoffContractVersions.SharedConsumerModel, "Ice shared model schema should match V2.12.2 contract");
        Assert(detail.Data!.ConsumerMode == OperatorHandoffApiProviderModes.LocalFixtureReadOnly, "Ice consumer mode should be API local read-only");
        Assert(detail.Data.PackageHash == PackageHash, "Ice should preserve package hash");
        Assert(detail.Data.ApprovalManifestId == ApprovalManifestId, "Ice should preserve approval manifest");
        Assert(detail.Data.ExecutionRunId == ExecutionRunId, "Ice should preserve execution run");
        Assert(detail.Data.TargetMode == "local_scoped_import_execution", "Ice should preserve target mode");
        Assert(detail.Data.EntityMappingSummary.Total == 10, "Ice should preserve ten entity mappings");
        Assert(detail.Data.ReadbackSummary.Routes.Ok && detail.Data.ReadbackSummary.Routes.Actual == 3, "Ice route readback should be 3/3");
        Assert(detail.Data.ReadbackSummary.ContentRefs.Ok && detail.Data.ReadbackSummary.ContentRefs.Actual == 4, "Ice content readback should be 4/4");
        Assert(detail.Data.ReadbackSummary.MediaRefs.Ok && detail.Data.ReadbackSummary.MediaRefs.Actual == 1, "Ice media readback should be 1/1");
        Assert(detail.Data.ReadbackSummary.FormConfigs.Ok && detail.Data.ReadbackSummary.FormConfigs.Actual == 1, "Ice form readback should be 1/1");
        Assert(detail.Data.AdminPanels.Count == 13, "Ice projection should expose thirteen Admin panels");
        Assert(detail.Data.FutureApiRoutes.Count == 6, "Ice projection should expose six handoff GET routes");
        Assert(detail.Data.FutureApiRoutes.All(route => route.Method == "GET"), "all handoff routes should be GET-only");
        Assert(detail.Data.FutureActions.All(action => action.Disabled), "all future handoff actions should be disabled");
    }

    private static async Task AssertRollerPausedDetail(IOperatorHandoffReadOnlyService service)
    {
        var detail = await service.GetHandoffAsync(RollerPacketId);
        Assert(detail.Ok, "Roller detail should be ok");
        Assert(detail.Data?.TenantState == "paused_no_import_no_resume", "Roller should remain paused/no-import/no-resume");
        Assert(detail.Data!.ApprovalManifestId is null && detail.Data.ExecutionRunId is null, "Roller should have no approval manifest or execution run");
        Assert(detail.Data.TargetMode == "blocked_no_import_no_resume", "Roller target mode should remain blocked");
        Assert(detail.Data.ReadbackSummary.Status == "not_executed", "Roller readback should remain not executed");
        Assert(detail.Data.ParityStatus.State == "blocked_by_policy", "Roller parity should be blocked by policy, not failed execution");
        Assert(detail.Data.HardStops.Contains("tenant_paused_no_import"), "Roller paused hard stop should be visible");
        Assert(detail.Data.FutureActions.All(action => action.Disabled), "Roller future actions should all be disabled");
    }

    private static async Task AssertParityEvidenceProjectionAndQa(IOperatorHandoffReadOnlyService service)
    {
        var parity = await service.GetParityAsync(IcePacketId);
        Assert(parity.Ok && parity.Data?.State == "passed", "Ice parity should pass");
        Assert(parity.Data!.RequiredPacketFieldCount == 26 && parity.Data.RequiredConsumerFieldCount == 32, "parity counts should carry V2.12.1 and V2.12.2 contracts");

        var evidence = await service.GetEvidenceAsync(IcePacketId);
        Assert(evidence.Ok && evidence.Data?.ReadOnly == true, "Ice evidence should be read-only");
        Assert(evidence.Data!.BackupCenterRefs.Count > 0, "evidence should include Backup carryforward refs");
        Assert(evidence.Data.ResourceRegistryRefs.Count > 0, "evidence should include Registry carryforward refs");
        Assert(evidence.Data.ProviderProfileRefs.Count > 0, "evidence should include Provider carryforward refs");
        Assert(evidence.Data.RuntimeQaRefs.Count > 0, "evidence should include RuntimeQA carryforward refs");
        Assert(evidence.Data.AuditJobRefs.Count > 0, "evidence should include Audit Jobs carryforward refs");
        Assert(evidence.Data.OlmCarryforwardRefs.Any(reference => reference.Id == "olm-2h23a-separate-future-safety-boundary"), "evidence should include OLM 2H-23A carryforward");

        var projection = await service.GetConsumerProjectionAsync(IcePacketId);
        Assert(projection.Ok && projection.Data?.Handoff.HandoffPacketId == IcePacketId, "consumer projection should return Ice handoff");
        Assert(projection.Data!.AdminPanels.Count == 13, "consumer projection should expose thirteen panels");
        Assert(projection.Data.FutureApiRoutes.Count == 6, "consumer projection should expose six GET routes");

        var qa = await service.GetQaChecklistAsync(IcePacketId);
        Assert(qa.Ok && qa.Data?.ReadOnly == true, "QA checklist should be read-only");
        Assert(qa.Data!.Checks.All(check => check.Status == "passed"), "Ice QA checklist should pass all checks");
        Assert(qa.Data.DisabledActions.All(action => action.Disabled), "QA checklist disabled actions should stay disabled");
    }

    private static async Task AssertAllSixEndpointHandlers(IOperatorHandoffReadOnlyService service)
    {
        var context = CreateHttpContext();
        var routeResults = new[]
        {
            await OperatorHandoffReadOnlyEndpoints.ListHandoffsAsync(service, new OperatorHandoffApiQuery(), context),
            await OperatorHandoffReadOnlyEndpoints.GetHandoffAsync(service, IcePacketId, context),
            await OperatorHandoffReadOnlyEndpoints.GetParityAsync(service, IcePacketId, context),
            await OperatorHandoffReadOnlyEndpoints.GetEvidenceAsync(service, IcePacketId, context),
            await OperatorHandoffReadOnlyEndpoints.GetConsumerProjectionAsync(service, IcePacketId, context),
            await OperatorHandoffReadOnlyEndpoints.GetQaChecklistAsync(service, IcePacketId, context)
        };

        foreach (var result in routeResults)
        {
            using var document = await ExecuteJsonResult(result, context);
            var root = document.RootElement;
            Assert(root.GetProperty("ok").GetBoolean(), "endpoint envelope should be ok");
            Assert(root.GetProperty("status").GetInt32() == StatusCodes.Status200OK, "endpoint envelope status should be 200");
            Assert(root.GetProperty("readOnly").GetBoolean(), "endpoint envelope should be read-only");
            Assert(root.GetProperty("providerMode").GetString() == OperatorHandoffApiProviderModes.LocalFixtureReadOnly, "endpoint provider mode should be operator handoff fixture provider");
            Assert(root.GetProperty("meta").GetProperty("mutationMethodsAllowed").GetBoolean() == false, "endpoint meta should disallow mutation methods");
            Assert(root.GetProperty("securityBoundary").GetProperty("openFlags").GetArrayLength() == 0, "endpoint security boundary should have no open flags");
        }
    }

    private static async Task AssertNotFoundReturnsReadOnlyError(IOperatorHandoffReadOnlyService service)
    {
        var response = await service.GetHandoffAsync("missing-handoff-packet");
        Assert(!response.Ok, "missing handoff should return an error envelope");
        Assert(response.Status == StatusCodes.Status404NotFound, "missing handoff should return 404");
        Assert(response.Code == OperatorHandoffApiErrorCodes.HandoffNotFound, "missing handoff should return handoff-not-found");
        Assert(response.ReadOnly, "missing handoff error should remain read-only");
        Assert(response.ProviderMode == OperatorHandoffApiProviderModes.LocalFixtureReadOnly, "missing handoff error should preserve provider mode");
    }

    private static async Task AssertNoMutationRoutesRegistered()
    {
        var endpointSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Services", "OperatorHandoffs", "OperatorHandoffReadOnlyEndpoints.cs"));
        Assert(Count(endpointSource, "MapGet(") == 6, "Operator Handoff endpoint mapper should register exactly six GET routes");
        Assert(!endpointSource.Contains("MapPost(", StringComparison.Ordinal), "Operator Handoff endpoint mapper must not register POST");
        Assert(!endpointSource.Contains("MapPut(", StringComparison.Ordinal), "Operator Handoff endpoint mapper must not register PUT");
        Assert(!endpointSource.Contains("MapPatch(", StringComparison.Ordinal), "Operator Handoff endpoint mapper must not register PATCH");
        Assert(!endpointSource.Contains("MapDelete(", StringComparison.Ordinal), "Operator Handoff endpoint mapper must not register DELETE");

        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        Assert(programSource.Contains("MapOperatorHandoffReadOnlyEndpoints", StringComparison.Ordinal), "Program should register Operator Handoff read-only endpoints");
        Assert(!programSource.Contains("MapOperatorHandoffWrite", StringComparison.Ordinal), "Program must not register Operator Handoff write routes");
    }

    private static async Task AssertNoSecretLikeValues(IOperatorHandoffReadOnlyService service)
    {
        var responses = new object[]
        {
            await service.ListHandoffsAsync(new OperatorHandoffApiQuery()),
            await service.GetHandoffAsync(IcePacketId),
            await service.GetHandoffAsync(RollerPacketId),
            await service.GetParityAsync(IcePacketId),
            await service.GetEvidenceAsync(IcePacketId),
            await service.GetConsumerProjectionAsync(IcePacketId),
            await service.GetQaChecklistAsync(IcePacketId)
        };

        foreach (var response in responses)
        {
            var json = JsonSerializer.Serialize(response, JsonOptions);
            Assert(!SecretLikePattern.IsMatch(json), "Operator Handoff API response should not include high-confidence secret-like values");
        }
    }

    private static async Task AssertDeferredHardStopsAndClosedBoundaries(IOperatorHandoffReadOnlyService service)
    {
        var response = await service.GetConsumerProjectionAsync(IcePacketId);
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "operator handoff should preserve indexing deferred hard stop");
        Assert(response.Meta.Deployment == false, "operator handoff should keep deployment false");
        Assert(response.Meta.SearchConsoleIndexing == false, "operator handoff should keep search console indexing false");
        Assert(response.Meta.CmsWrites == false && response.Meta.ProviderWrites == false && response.Meta.MediaAssetWrites == false, "operator handoff should keep CMS/provider/media writes false");
        Assert(response.Meta.ProtectedConfigReads == false, "operator handoff should not read protected config");
        Assert(response.Meta.TenantImportExecution == false && response.Meta.LiveTenantCreation == false, "operator handoff should not execute imports or create tenants");
        Assert(response.Meta.RollerResume == false && response.Meta.OlmStagingWrite == false, "operator handoff should not resume Roller or run OLM writes");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "operator handoff should expose no open flags");
        Assert(response.SecurityBoundary.ProhibitedActionFlags.All(flag => flag.Value == false), "operator handoff should keep prohibited action flags false");
        Assert(response.Data!.Handoff.DeferredGates.Contains("google_search_console_indexing_deferred_hard_stop"), "handoff should include Google indexing deferred gate");
        Assert(response.Data.Handoff.OlmCarryforwardRefs.Any(reference => reference.Id == "olm-2h23a-separate-future-safety-boundary"), "handoff should include OLM carryforward ref");
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
