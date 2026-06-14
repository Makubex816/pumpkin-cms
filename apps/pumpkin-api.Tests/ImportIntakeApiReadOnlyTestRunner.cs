using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class ImportIntakeApiReadOnlyTestRunner
{
    private const string IcePackageId = "ice-rink-rentals-carryforward-v2-11-2";
    private const string RollerPackageId = "roller-rink-rentals-paused-preview-v2-11-2";

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
        Console.WriteLine("V2.11.4 Import Intake API read-only endpoint tests");

        var provider = new FixtureImportIntakeReadOnlyProvider();
        var service = new ImportIntakeReadOnlyService(provider);

        await AssertPackageList(service);
        await AssertIcePackage(service);
        await AssertRollerPackage(service);
        await AssertAllEightEndpointHandlers(service);
        await AssertMissingFixtureReturnsReadOnlyError();
        await AssertNoMutationRoutesRegistered();
        await AssertNoSecretLikeValues(service);
        await AssertDeferredIndexingAndClosedBoundary(service);

        Console.WriteLine("V2.11.4 tests passed");
    }

    private static async Task AssertPackageList(IImportIntakeReadOnlyService service)
    {
        var response = await service.ListPackagesAsync(new ImportIntakeApiQuery());
        Assert(response.Ok, "package list should be ok");
        Assert(response.Status == StatusCodes.Status200OK, "package list status should be 200");
        Assert(response.ReadOnly, "package list should be read-only");
        Assert(response.ProviderMode == ImportIntakeApiProviderModes.LocalFixtureReadOnly, "package list should use import-intake fixture provider mode");
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "package list should preserve indexing deferred hard stop");
        Assert(response.Meta.WriteActionsAllowed == false, "package list should disallow write actions");
        Assert(response.SecurityBoundary.NoWriteBoundarySatisfied, "package list should satisfy no-write boundary");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "package list should have no open write flags");
        Assert(response.Data?.Items.Count == 2, "package list should return Ice and Roller previews");
        Assert(response.Data!.Items.Any(item => item.PackageId == IcePackageId), "package list should include Ice");
        Assert(response.Data.Items.Any(item => item.PackageId == RollerPackageId), "package list should include Roller");

        var filtered = await service.ListPackagesAsync(new ImportIntakeApiQuery
        {
            LifecycleState = "paused",
            NoGoState = "blocked"
        });
        Assert(filtered.Ok && filtered.Data?.Items.Count == 1, "paused/no-go filter should return Roller only");
        Assert(filtered.Data!.Items[0].TenantKey == "roller-rink-rentals", "paused/no-go filter should identify Roller");
    }

    private static async Task AssertIcePackage(IImportIntakeReadOnlyService service)
    {
        var detail = await service.GetPackageAsync(IcePackageId);
        Assert(detail.Ok && detail.Data?.TenantKey == "ice-rink-rentals", "Ice package detail should return Ice tenant");
        Assert(detail.Data!.ReadyForFutureImportExecution, "Ice should be ready for a future explicitly approved import gate");
        Assert(detail.Data.Counts.NoGoConditions == 0, "Ice should have no no-go conditions");

        var preview = await service.GetPreviewAsync(IcePackageId);
        Assert(preview.Ok && preview.Data?.Routes.Count == 3, "Ice preview should expose three routes");
        Assert(preview.Data!.ContentRefs.Any(value => value.Contains("ice-home", StringComparison.OrdinalIgnoreCase)), "Ice preview should expose content refs");
        Assert(preview.Data.BackupEvidenceRefs.Count == 1, "Ice preview should expose Backup Center evidence");
        Assert(preview.Data.RuntimeQaRefs.Count == 1, "Ice preview should expose Runtime QA refs");
        Assert(preview.Data.OutboundLinkRefs.Count == 1, "Ice preview should expose OLM refs");
        Assert(preview.Data.AuditJobRefs.Count == 1, "Ice preview should expose Audit Jobs refs");

        var noGo = await service.ListNoGoConditionsAsync(IcePackageId);
        Assert(noGo.Ok && noGo.Data?.Items.Count == 0, "Ice no-go route should return an empty list");

        var rollback = await service.GetRollbackAsync(IcePackageId);
        Assert(rollback.Ok && rollback.Data?.RollbackPlanId == "rollback:v2-8-17d-production-rollback-plan", "Ice rollback route should expose rollback plan");
    }

    private static async Task AssertRollerPackage(IImportIntakeReadOnlyService service)
    {
        var detail = await service.GetPackageAsync(RollerPackageId);
        Assert(detail.Ok && detail.Data?.TenantKey == "roller-rink-rentals", "Roller package detail should return Roller tenant");
        Assert(!detail.Data!.ReadyForFutureImportExecution, "Roller should not be future-import-ready");
        Assert(detail.Data.ImportMode == "paused_no_import", "Roller import mode should remain paused_no_import");
        Assert(detail.Data.Counts.NoGoConditions == 1, "Roller should have a no-go condition");

        var noGo = await service.ListNoGoConditionsAsync(RollerPackageId);
        Assert(noGo.Ok && noGo.Data?.Items.Count == 1, "Roller no-go route should return one condition");
        Assert(noGo.Data!.Items[0].Code == "tenant_paused_no_import", "Roller no-go should identify paused tenant");
        Assert(noGo.Data.Items[0].BlocksFutureImport, "Roller no-go should block future import");

        var validation = await service.GetValidationAsync(RollerPackageId);
        Assert(validation.Ok && validation.Data?.FutureActionsDisabled == true, "Roller future actions should be disabled");
        Assert(validation.Data!.Blockers.Any(blocker => blocker.Code == "ROLLER_RESUME_NOT_APPROVED"), "Roller validation should preserve resume-not-approved blocker");

        var rollback = await service.GetRollbackAsync(RollerPackageId);
        Assert(rollback.Ok && rollback.Data?.AbortRequired == true, "Roller rollback should require abort/no-import handling");
        Assert(rollback.Data!.BlockedByNoGoConditions.Contains("tenant_paused_no_import"), "Roller rollback should expose no-go blocker");
    }

    private static async Task AssertAllEightEndpointHandlers(IImportIntakeReadOnlyService service)
    {
        var context = CreateHttpContext();
        var routeResults = new[]
        {
            await ImportIntakeReadOnlyEndpoints.ListPackagesAsync(service, new ImportIntakeApiQuery(), context),
            await ImportIntakeReadOnlyEndpoints.GetPackageAsync(service, IcePackageId, context),
            await ImportIntakeReadOnlyEndpoints.GetPreviewAsync(service, IcePackageId, context),
            await ImportIntakeReadOnlyEndpoints.GetValidationAsync(service, IcePackageId, context),
            await ImportIntakeReadOnlyEndpoints.ListNoGoConditionsAsync(service, RollerPackageId, context),
            await ImportIntakeReadOnlyEndpoints.GetRollbackAsync(service, RollerPackageId, context),
            await ImportIntakeReadOnlyEndpoints.ListEvidenceRefsAsync(service, IcePackageId, context),
            await ImportIntakeReadOnlyEndpoints.ListResourceRefsAsync(service, IcePackageId, context)
        };

        foreach (var result in routeResults)
        {
            using var document = await ExecuteJsonResult(result, context);
            var root = document.RootElement;
            Assert(root.GetProperty("ok").GetBoolean(), "endpoint envelope should be ok");
            Assert(root.GetProperty("status").GetInt32() == StatusCodes.Status200OK, "endpoint envelope status should be 200");
            Assert(root.GetProperty("readOnly").GetBoolean(), "endpoint envelope should be read-only");
            Assert(root.GetProperty("providerMode").GetString() == ImportIntakeApiProviderModes.LocalFixtureReadOnly, "endpoint provider mode should be import-intake fixture provider");
            Assert(root.GetProperty("meta").GetProperty("writeActionsAllowed").GetBoolean() == false, "endpoint meta should disallow writes");
        }

        using var evidenceDocument = await ExecuteJsonResult(await ImportIntakeReadOnlyEndpoints.ListEvidenceRefsAsync(service, IcePackageId, context), context);
        Assert(evidenceDocument.RootElement.GetProperty("data").GetProperty("items").GetArrayLength() >= 5, "evidence endpoint should expose backup/runtime/audit/validation/rollback refs");

        using var refsDocument = await ExecuteJsonResult(await ImportIntakeReadOnlyEndpoints.ListResourceRefsAsync(service, IcePackageId, context), context);
        Assert(refsDocument.RootElement.GetProperty("data").GetProperty("items").GetArrayLength() >= 10, "refs endpoint should expose routes/content/media/forms/registry/profile/OLM refs");
    }

    private static async Task AssertMissingFixtureReturnsReadOnlyError()
    {
        var service = new ImportIntakeReadOnlyService(new FixtureImportIntakeReadOnlyProvider([
            Path.Combine(Path.GetTempPath(), "missing-import-intake-fixture.json")
        ]));
        var response = await service.ListPackagesAsync(new ImportIntakeApiQuery());
        Assert(!response.Ok, "missing fixture should return an error envelope");
        Assert(response.Status == StatusCodes.Status503ServiceUnavailable, "missing fixture should return 503");
        Assert(response.Code == ImportIntakeApiErrorCodes.ProviderNotConfigured, "missing fixture should return provider-not-configured");
        Assert(response.ReadOnly, "missing fixture error should remain read-only");
        Assert(response.ProviderMode == ImportIntakeApiProviderModes.LocalFixtureReadOnly, "missing fixture error should preserve provider mode");
    }

    private static async Task AssertNoMutationRoutesRegistered()
    {
        var endpointSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Services", "ImportIntake", "ImportIntakeReadOnlyEndpoints.cs"));
        Assert(Count(endpointSource, "MapGet(") == 8, "Import Intake endpoint mapper should register exactly eight GET routes");
        Assert(!endpointSource.Contains("MapPost(", StringComparison.Ordinal), "Import Intake endpoint mapper must not register POST");
        Assert(!endpointSource.Contains("MapPut(", StringComparison.Ordinal), "Import Intake endpoint mapper must not register PUT");
        Assert(!endpointSource.Contains("MapPatch(", StringComparison.Ordinal), "Import Intake endpoint mapper must not register PATCH");
        Assert(!endpointSource.Contains("MapDelete(", StringComparison.Ordinal), "Import Intake endpoint mapper must not register DELETE");

        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        Assert(programSource.Contains("MapImportIntakeReadOnlyEndpoints", StringComparison.Ordinal), "Program should register Import Intake read-only endpoints");
        Assert(!programSource.Contains("MapImportIntakeWrite", StringComparison.Ordinal), "Program must not register Import Intake write routes");
    }

    private static async Task AssertNoSecretLikeValues(IImportIntakeReadOnlyService service)
    {
        var responses = new object[]
        {
            await service.ListPackagesAsync(new ImportIntakeApiQuery()),
            await service.GetPackageAsync(IcePackageId),
            await service.GetPreviewAsync(IcePackageId),
            await service.GetValidationAsync(IcePackageId),
            await service.ListNoGoConditionsAsync(RollerPackageId),
            await service.GetRollbackAsync(RollerPackageId),
            await service.ListEvidenceRefsAsync(IcePackageId),
            await service.ListResourceRefsAsync(IcePackageId)
        };

        foreach (var response in responses)
        {
            var json = JsonSerializer.Serialize(response, JsonOptions);
            Assert(!SecretLikePattern.IsMatch(json), "Import Intake API response should not include high-confidence secret-like values");
        }
    }

    private static async Task AssertDeferredIndexingAndClosedBoundary(IImportIntakeReadOnlyService service)
    {
        var response = await service.GetPreviewAsync(IcePackageId);
        Assert(response.Meta.GoogleIndexingState == "deferred_hard_stop", "preview should preserve indexing deferred hard stop");
        Assert(response.Meta.Deployment == false, "preview should keep deployment false");
        Assert(response.Meta.SearchConsoleIndexing == false, "preview should keep search console indexing false");
        Assert(response.Meta.CmsWrites == false && response.Meta.ProviderWrites == false, "preview should keep CMS/provider writes false");
        Assert(response.Meta.ProtectedConfigReads == false, "preview should not read protected config");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "preview should expose no open flags");
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
