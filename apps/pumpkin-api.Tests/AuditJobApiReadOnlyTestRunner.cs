using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class AuditJobApiReadOnlyTestRunner
{
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
        Console.WriteLine("V2.9.9 Audit Jobs API read-only endpoint tests");

        var provider = new FixtureAuditJobReadOnlyProvider();
        var service = new AuditJobReadOnlyService(provider);
        var authorization = new AuditJobAuthorizationService();
        var query = new AuditJobApiQuery
        {
            TenantKey = "ice-rink-rentals",
            SiteKey = "ice-rink-rentals"
        };

        await AssertViewerSummary(service, query);
        await AssertAllRouteCounts(service, query);
        await AssertFilters(service, query);
        AssertAuthorization(authorization);
        await AssertEndpointHandlerReturnsReadOnlyEnvelope(service, authorization, query);
        await AssertMissingFixtureReturnsReadOnlyError(query);
        await AssertNoMutationRoutesRegistered();
        await AssertNoSecretLikeValues(service, query);
        await AssertDeferredIndexingVisible(service, query);

        Console.WriteLine("V2.9.9 tests passed");
    }

    private static async Task AssertViewerSummary(IAuditJobReadOnlyService service, AuditJobApiQuery query)
    {
        var response = await service.GetViewerSummaryAsync(query);
        Assert(response.Ok, "viewer summary should be ok");
        Assert(response.Code == AuditJobApiErrorCodes.Ok, "viewer summary should use AUDIT_JOB_OK");
        Assert(response.ReadOnly, "viewer summary should be read-only");
        Assert(response.ProviderMode == AuditJobApiProviderModes.LocalFixtureReadOnly, "viewer summary should use api-local-fixture-readonly");
        Assert(response.Meta.ProviderMode == AuditJobApiProviderModes.LocalFixtureReadOnly, "meta provider mode should be api-local-fixture-readonly");
        Assert(response.Meta.SourceProviderMode == "local-fixture-readonly", "meta should preserve source fixture provider mode");
        Assert(response.SecurityBoundary.LocalOnly, "security boundary should be local-only");
        Assert(response.SecurityBoundary.NoWriteBoundarySatisfied, "no-write boundary should be satisfied");
        Assert(response.SecurityBoundary.OpenFlags.Count == 0, "security boundary should have no open flags");
        Assert(response.Warnings.Count == 1, "viewer summary should carry one warning");
        Assert(response.Data?.Panels.Count == 12, "viewer summary should expose 12 panels");
        Assert(response.Data?.Blockers.Count == 0, "viewer summary should expose zero blockers");
        Assert(response.Data?.NextGates.Count == 2, "viewer summary should expose two next gates");

        var counts = response.Data!.Summary.GetProperty("counts");
        Assert(counts.GetProperty("auditEvents").GetInt32() == 11, "summary should report 11 audit events");
        Assert(counts.GetProperty("jobRuns").GetInt32() == 9, "summary should report 9 job runs");
        Assert(counts.GetProperty("promotionGates").GetInt32() == 11, "summary should report 11 promotion gates");
        Assert(counts.GetProperty("evidenceBindings").GetInt32() == 13, "summary should report 13 evidence bindings");
        Assert(counts.GetProperty("traceEntries").GetInt32() == 107, "summary should report 107 trace entries");
        Assert(counts.GetProperty("warnings").GetInt32() == 1, "summary should report one warning");
        Assert(counts.GetProperty("blockers").GetInt32() == 0, "summary should report zero blockers");
        Assert(counts.GetProperty("nextGates").GetInt32() == 2, "summary should report two next gates");
    }

    private static async Task AssertAllRouteCounts(IAuditJobReadOnlyService service, AuditJobApiQuery query)
    {
        var events = await service.ListEventsAsync(query);
        Assert(events.Ok && events.Data?.Items.Count == 11, "events route should return 11 audit events");

        var jobRuns = await service.ListJobRunsAsync(query);
        Assert(jobRuns.Ok && jobRuns.Data?.Items.Count == 9, "job-runs route should return 9 job runs");

        var gates = await service.ListPromotionGatesAsync(query);
        Assert(gates.Ok && gates.Data?.Items.Count == 11, "promotion-gates route should return 11 gates");

        var evidence = await service.ListEvidenceBindingsAsync(query);
        Assert(evidence.Ok && evidence.Data?.Items.Count == 13, "evidence-bindings route should return 13 evidence bindings");

        var traces = await service.ListTracesAsync(query);
        Assert(traces.Ok && traces.Data?.Items.Count == 107, "traces route should return 107 trace entries");

        var blockers = await service.ListBlockersAsync(query);
        Assert(blockers.Ok && blockers.Data?.Items.Count == 0, "blockers route should return zero blockers");

        var nextGates = await service.ListNextGatesAsync(query);
        Assert(nextGates.Ok && nextGates.Data?.Items.Count == 2, "next-gates route should return two next gates");

        Assert(events.ReadOnly && jobRuns.ReadOnly && gates.ReadOnly && evidence.ReadOnly && traces.ReadOnly && blockers.ReadOnly && nextGates.ReadOnly, "all route envelopes should be read-only");
    }

    private static async Task AssertFilters(IAuditJobReadOnlyService service, AuditJobApiQuery query)
    {
        var indexingEvents = await service.ListEventsAsync(new AuditJobApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            EventType = "indexing_deferred_hard_stop"
        });
        Assert(indexingEvents.Ok && indexingEvents.Data?.Items.Count == 1, "eventType filter should return the indexing deferred event");

        var deferredGates = await service.ListPromotionGatesAsync(new AuditJobApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            State = "deferred"
        });
        Assert(deferredGates.Ok && deferredGates.Data?.Items.Count == 1, "state filter should return the deferred indexing gate");

        var traceSearch = await service.ListTracesAsync(new AuditJobApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            Field = "correlationId"
        });
        Assert(traceSearch.Ok && traceSearch.Data?.Items.Count == 11, "trace field filter should return correlation IDs");

        var wrongScope = await service.ListEventsAsync(new AuditJobApiQuery
        {
            TenantKey = "other-tenant",
            SiteKey = query.SiteKey
        });
        Assert(!wrongScope.Ok, "wrong tenant fixture scope should not return data");
        Assert(wrongScope.Code == AuditJobApiErrorCodes.ProviderNotConfigured, "wrong tenant fixture scope should return provider-not-configured");
    }

    private static void AssertAuthorization(IAuditJobAuthorizationService authorization)
    {
        Assert(authorization.AuthorizeRead(new AuditJobLocalActor("ice-rink-rentals", "ice-rink-rentals", "Viewer", true), "ice-rink-rentals", "ice-rink-rentals") is null, "Viewer should read assigned scope");
        Assert(authorization.AuthorizeRead(new AuditJobLocalActor("other-tenant", string.Empty, "TenantAdmin", true), "ice-rink-rentals", "ice-rink-rentals")?.Code == AuditJobApiErrorCodes.ForbiddenTenant, "wrong tenant should be forbidden");
        Assert(authorization.AuthorizeRead(new AuditJobLocalActor("ice-rink-rentals", "other-site", "TenantAdmin", true), "ice-rink-rentals", "ice-rink-rentals")?.Code == AuditJobApiErrorCodes.ForbiddenSite, "wrong site should be forbidden when site claim is present");
        Assert(authorization.AuthorizeRead(new AuditJobLocalActor("ice-rink-rentals", string.Empty, "Editor", true), "ice-rink-rentals", "ice-rink-rentals")?.Code == AuditJobApiErrorCodes.ForbiddenRole, "unsupported role should be forbidden");
        Assert(authorization.AuthorizeRead(new AuditJobLocalActor("ice-rink-rentals", string.Empty, "Viewer", false), "ice-rink-rentals", "ice-rink-rentals")?.Code == AuditJobApiErrorCodes.AuthRequired, "unauthenticated actor should be unauthorized");
    }

    private static async Task AssertEndpointHandlerReturnsReadOnlyEnvelope(
        IAuditJobReadOnlyService service,
        IAuditJobAuthorizationService authorization,
        AuditJobApiQuery query)
    {
        var context = CreateHttpContext("ice-rink-rentals", "ice-rink-rentals", "Viewer", true);
        var result = await AuditJobReadOnlyEndpoints.GetViewerSummaryAsync(service, authorization, context, query);
        using var document = await ExecuteJsonResult(result, context);
        var root = document.RootElement;
        Assert(root.GetProperty("ok").GetBoolean(), "endpoint envelope should be ok");
        Assert(root.GetProperty("readOnly").GetBoolean(), "endpoint envelope should be read-only");
        Assert(root.GetProperty("providerMode").GetString() == AuditJobApiProviderModes.LocalFixtureReadOnly, "endpoint provider mode should be api-local-fixture-readonly");
        Assert(root.GetProperty("data").GetProperty("summary").GetProperty("indexingState").GetString() == "deferred", "endpoint should preserve indexing deferred state");

        var unauthenticated = CreateHttpContext("ice-rink-rentals", "ice-rink-rentals", "Viewer", false);
        var unauthenticatedResult = await AuditJobReadOnlyEndpoints.ListEventsAsync(service, authorization, unauthenticated, query);
        using var unauthenticatedDocument = await ExecuteJsonResult(unauthenticatedResult, unauthenticated);
        Assert(unauthenticatedDocument.RootElement.GetProperty("status").GetInt32() == StatusCodes.Status401Unauthorized, "unauthenticated endpoint call should return 401");
        Assert(unauthenticatedDocument.RootElement.GetProperty("readOnly").GetBoolean(), "error envelope should remain read-only");
    }

    private static async Task AssertMissingFixtureReturnsReadOnlyError(AuditJobApiQuery query)
    {
        var service = new AuditJobReadOnlyService(new FixtureAuditJobReadOnlyProvider(Path.Combine(Path.GetTempPath(), "missing-audit-job-fixture.json")));
        var response = await service.ListEventsAsync(query);
        Assert(!response.Ok, "missing fixture should return an error envelope");
        Assert(response.Status == StatusCodes.Status503ServiceUnavailable, "missing fixture should return 503");
        Assert(response.Code == AuditJobApiErrorCodes.ProviderNotConfigured, "missing fixture should return provider-not-configured");
        Assert(response.ReadOnly, "missing fixture error should remain read-only");
        Assert(response.ProviderMode == AuditJobApiProviderModes.LocalFixtureReadOnly, "missing fixture error should preserve provider mode");
    }

    private static async Task AssertNoMutationRoutesRegistered()
    {
        var source = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Services", "AuditJobs", "AuditJobReadOnlyEndpoints.cs"));
        Assert(Count(source, "MapGet(") == 8, "Audit Jobs endpoint mapper should register exactly eight GET routes");
        Assert(!source.Contains("MapPost(", StringComparison.Ordinal), "Audit Jobs endpoint mapper must not register POST");
        Assert(!source.Contains("MapPut(", StringComparison.Ordinal), "Audit Jobs endpoint mapper must not register PUT");
        Assert(!source.Contains("MapPatch(", StringComparison.Ordinal), "Audit Jobs endpoint mapper must not register PATCH");
        Assert(!source.Contains("MapDelete(", StringComparison.Ordinal), "Audit Jobs endpoint mapper must not register DELETE");

        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        Assert(programSource.Contains("MapAuditJobReadOnlyEndpoints", StringComparison.Ordinal), "Program should register Audit Jobs read-only endpoints");
        Assert(!programSource.Contains("MapAuditJobWrite", StringComparison.Ordinal), "Program must not register Audit Jobs write routes");
    }

    private static async Task AssertNoSecretLikeValues(IAuditJobReadOnlyService service, AuditJobApiQuery query)
    {
        var responses = new object[]
        {
            await service.GetViewerSummaryAsync(query),
            await service.ListEventsAsync(query),
            await service.ListJobRunsAsync(query),
            await service.ListPromotionGatesAsync(query),
            await service.ListEvidenceBindingsAsync(query),
            await service.ListTracesAsync(query),
            await service.ListBlockersAsync(query),
            await service.ListNextGatesAsync(query)
        };

        foreach (var response in responses)
        {
            var json = JsonSerializer.Serialize(response, JsonOptions);
            Assert(!SecretLikePattern.IsMatch(json), "Audit Jobs API response should not include high-confidence secret-like values");
        }
    }

    private static async Task AssertDeferredIndexingVisible(IAuditJobReadOnlyService service, AuditJobApiQuery query)
    {
        var summary = await service.GetViewerSummaryAsync(query);
        Assert(summary.Data?.Summary.GetProperty("indexingState").GetString() == "deferred", "summary should keep indexing deferred");
        Assert(summary.Warnings.Any(warning => warning.Code == "INDEXING_DEFERRED"), "warning should expose indexing deferred state");

        var nextGates = await service.ListNextGatesAsync(query);
        Assert(nextGates.Data?.Items.Any(item => item.Id == "google-indexing-deferred" && item.State == "deferred") == true, "next gates should include Google indexing deferred");
    }

    private static DefaultHttpContext CreateHttpContext(string tenantKey, string siteKey, string role, bool authenticated)
    {
        var claims = new List<Claim>
        {
            new("tenantId", tenantKey),
            new("siteKey", siteKey),
            new(ClaimTypes.Role, role)
        };
        var identity = authenticated ? new ClaimsIdentity(claims, "V299Test") : new ClaimsIdentity(claims);
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity),
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
