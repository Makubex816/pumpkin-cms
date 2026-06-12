using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class OutboundLinkApiReadOnlyTestRunner
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task RunAsync()
    {
        Console.WriteLine("Phase 2H-9 Outbound Link Manager API read-only tests");

        var provider = new FakeOutboundLinkReadOnlyProvider();
        var service = new OutboundLinkReadOnlyService(provider);
        var authorization = new OutboundLinkAuthorizationService();
        var query = new OutboundLinkApiQuery
        {
            TenantKey = "fixture-tenant",
            SiteKey = "fixture-site",
            Page = 1,
            PageSize = 10
        };

        await AssertListLinksReturnsEnvelope(service, query);
        await AssertLinkDetailReturnsInstances(service, query);
        await AssertInstancesPoliciesScanRunsAuditAndDashboard(service, query);
        await AssertOperatorReadinessMetadata(service, authorization, query);
        await AssertDomainFilterAndPagination(service, query);
        await AssertStagingBackedProviderMeta();
        AssertTenantScopeGuardDeniesWrongTenant(authorization);
        AssertViewerReadOnlyWorks(authorization);
        await AssertEndpointHandlerReturnsEnvelope(service, authorization, query);
        await AssertScopedWriteFoundationRouteIsRegistered();

        Console.WriteLine("Phase 2H-9 tests passed");
    }

    private static async Task AssertListLinksReturnsEnvelope(IOutboundLinkReadOnlyService service, OutboundLinkApiQuery query)
    {
        var response = await service.ListLinksAsync(query);
        Assert(response.Ok, "list links response should be ok");
        Assert(response.Code == OutboundLinkApiErrorCodes.Ok, "list links code should be OK");
        Assert(response.Data?.Items.Count == 5, "list links should return five fixture links");
        Assert(response.Meta.Pagination?.TotalItems == 5, "list links pagination should report total items");
        Assert(response.Meta.LocalOnly, "local fixture response should remain local-only");
        Assert(!response.Meta.StagingBacked, "local fixture response should not claim staging-backed state");
        Assert(response.Meta.ReadOnly, "read-only response meta should be read-only");
        Assert(!response.Meta.WriteActionsAllowed, "read-only response meta must not allow write actions");
    }

    private static async Task AssertLinkDetailReturnsInstances(IOutboundLinkReadOnlyService service, OutboundLinkApiQuery query)
    {
        var list = await service.ListLinksAsync(new OutboundLinkApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            Domain = "partner.example",
            Page = 1,
            PageSize = 10
        });
        var link = list.Data?.Items.SingleOrDefault();
        Assert(link is not null, "partner.example fixture link should exist");

        var detail = await service.GetLinkAsync(link!.Id, query);
        Assert(detail.Ok, "detail response should be ok");
        Assert(detail.Data?.Link.Domain == "partner.example", "detail should return selected link");
        Assert(detail.Data?.Instances.Count == 1, "detail should include link instances");
        Assert(detail.Data?.ActivePolicy?.Id == "policy_test_default", "detail should include active policy");
    }

    private static async Task AssertInstancesPoliciesScanRunsAuditAndDashboard(IOutboundLinkReadOnlyService service, OutboundLinkApiQuery query)
    {
        var instances = await service.ListInstancesAsync(null, query);
        Assert(instances.Ok && instances.Data?.Items.Count == 5, "instances endpoint should return five instances");

        var policies = await service.ListPoliciesAsync(query);
        Assert(policies.Ok && policies.Data?.Items.Count == 1, "policies endpoint should return one policy");

        var scanRuns = await service.ListScanRunsAsync(query);
        Assert(scanRuns.Ok && scanRuns.Data?.Items.Count == 1, "scan run endpoint should return one scan run");

        var audit = await service.ListAuditLogsAsync(query);
        Assert(audit.Ok && audit.Data?.Items.Count == 1, "audit endpoint should return one audit log");

        var dashboard = await service.GetDashboardSummaryAsync(query);
        Assert(dashboard.Ok, "dashboard response should be ok");
        Assert(dashboard.Data?.LinkCount == 5, "dashboard should report five links");
        Assert(dashboard.Data?.DomainCount == 3, "dashboard should report three domains");
    }

    private static async Task AssertOperatorReadinessMetadata(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        OutboundLinkApiQuery query)
    {
        var readiness = await service.GetOperatorReadinessAsync(query);
        Assert(readiness.Ok, "operator readiness response should be ok");
        Assert(readiness.Data?.Phase == "V2.7.1", "operator readiness should expose V2.7.1 phase");
        Assert(readiness.Data?.RuntimeQaStatus == "passed", "operator readiness should report Runtime QA passed");
        Assert(readiness.Data?.ResourceRegistryStatus == "passed", "operator readiness should report Resource Registry passed");
        Assert(readiness.Data?.BackupCenterStatus == "passed", "operator readiness should report Backup Center passed");
        Assert(readiness.Data?.WriteActionGuardStatus == "future_gated", "operator readiness should report future-gated write actions");
        Assert(readiness.Data?.UploadBindingStatus == "blocked", "operator readiness should carry forward runtime QA upload blocker");
        Assert(readiness.Data?.ProductionGateStatus == "blocked", "operator readiness should keep production-runtime blocked");
        Assert(readiness.Data?.NoUncontrolledWriteStatus == "passed", "operator readiness should report no uncontrolled write scan");
        Assert(readiness.Data is
        {
            ProviderWrites: false,
            AzureMutations: false,
            CmsWrites: false,
            ProtectedConfigReads: false,
            ExternalCrawling: false,
            Deployment: false,
            LivePublication: false
        }, "operator readiness security boundary should remain closed");
        Assert(readiness.Data!.ApiRoutes.Any(route => route == "GET /api/admin/outbound-link-operator-readiness"), "operator readiness should list its GET route");
        Assert(readiness.Data.Items.Any(item => item.Label == "Runtime QA" && item.Status == "passed"), "operator readiness should include Runtime QA evidence item");
        Assert(readiness.Data.BlockedGates.Any(gate => gate.Contains("runtime-qa-staging upload blocked", StringComparison.Ordinal)), "operator readiness should include upload blocker gate");
        Assert(readiness.Meta.ReadOnly, "operator readiness meta should be read-only");
        Assert(!readiness.Meta.WriteActionsAllowed, "operator readiness meta must not allow write actions");

        var httpContext = CreateHttpContext("fixture-tenant", "Viewer");
        var result = await OutboundLinkReadOnlyEndpoints.GetOperatorReadinessAsync(service, authorization, httpContext, query);
        var envelope = await ExecuteJsonResult<OutboundLinkApiEnvelope<OutboundLinkOperatorReadinessResponse>>(result, httpContext);
        Assert(envelope?.Data?.RuntimeQaStatus == "passed", "operator readiness endpoint should serialize Runtime QA status");
    }

    private static async Task AssertDomainFilterAndPagination(IOutboundLinkReadOnlyService service, OutboundLinkApiQuery query)
    {
        var filtered = await service.ListLinksAsync(new OutboundLinkApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            Domain = "partner.example",
            Page = 1,
            PageSize = 10
        });
        Assert(filtered.Ok, "domain filtered response should be ok");
        Assert(filtered.Data?.Items.Count == 1, "domain filtered response should return one link");

        var paged = await service.ListLinksAsync(new OutboundLinkApiQuery
        {
            TenantKey = query.TenantKey,
            SiteKey = query.SiteKey,
            Page = 1,
            PageSize = 2
        });
        Assert(paged.Ok, "paged response should be ok");
        Assert(paged.Data?.Items.Count == 2, "paged response should return page size");
        Assert(paged.Meta.Pagination?.TotalPages == 3, "paged response should report three total pages");
    }

    private static async Task AssertStagingBackedProviderMeta()
    {
        var stagingSnapshot = FakeOutboundLinkReadOnlyProvider.CreateFixtureSnapshot(
            OutboundLinkProviderMetadata.StagingBackedReadOnly(
                "deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/v2-2-3-azure-cosmos-staging-readback-hardening",
                48,
                48));
        var service = new OutboundLinkReadOnlyService(new StagingBackedOutboundLinkReadOnlyProvider(stagingSnapshot));
        var response = await service.GetDashboardSummaryAsync(new OutboundLinkApiQuery
        {
            TenantKey = "fixture-tenant",
            SiteKey = "fixture-site",
            Page = 1,
            PageSize = 10
        });

        Assert(response.Ok, "staging-backed dashboard response should be ok");
        Assert(response.Meta.StagingBacked, "staging-backed response must mark stagingBacked true");
        Assert(!response.Meta.LocalOnly, "staging-backed response should not claim local-only state");
        Assert(response.Meta.ReadOnly, "staging-backed response must remain read-only");
        Assert(!response.Meta.WriteActionsAllowed, "staging-backed read-only response must not allow write actions");
        Assert(response.Meta.ProviderProfileId == "olm-staging-cosmos-nosql-v1", "staging-backed response should expose provider profile id");
        Assert(response.Meta.ProviderMode == "live-readonly", "staging-backed API bridge should expose live-readonly provider mode");
        Assert(response.Meta.ProviderState == "readback_verified", "staging-backed API bridge should expose readback-verified state");
        Assert(response.Meta.ApprovalManifestId == "olapprove_508df3f03faa4f80", "staging-backed response should expose approval manifest id");
        Assert(response.Meta.FirstWriteBatchId == "olbatch_b08e184fdc6565aa", "staging-backed response should expose first-write batch id");
        Assert(response.Meta.ExpectedRecordCount == 48, "staging-backed response should expose expected record count");
        Assert(response.Meta.ReadbackRecordCount == 48, "staging-backed response should expose readback record count");
        Assert(response.Message.Contains("staging-backed-readonly", StringComparison.Ordinal), "staging-backed response message should identify provider mode");

        var wrongScope = await service.ListLinksAsync(new OutboundLinkApiQuery
        {
            TenantKey = "other-tenant",
            SiteKey = "fixture-site",
            Page = 1,
            PageSize = 10
        });
        Assert(!wrongScope.Ok, "staging-backed provider should reject unconfigured tenant/site scope");
        Assert(wrongScope.Code == OutboundLinkApiErrorCodes.ProviderNotConfigured, "wrong staging scope should return provider-not-configured");
    }

    private static void AssertTenantScopeGuardDeniesWrongTenant(IOutboundLinkAuthorizationService authorization)
    {
        var actor = new OutboundLinkLocalActor("other-tenant", "TenantAdmin", true);
        var response = authorization.AuthorizeRead(actor, "fixture-tenant", "fixture-site");
        Assert(response is not null, "wrong tenant should be denied");
        Assert(response!.Code == OutboundLinkApiErrorCodes.ForbiddenTenant, "wrong tenant should return forbidden tenant code");
    }

    private static void AssertViewerReadOnlyWorks(IOutboundLinkAuthorizationService authorization)
    {
        var actor = new OutboundLinkLocalActor("fixture-tenant", "Viewer", true);
        var response = authorization.AuthorizeRead(actor, "fixture-tenant", "fixture-site");
        Assert(response is null, "viewer should be allowed to read assigned tenant");
    }

    private static async Task AssertEndpointHandlerReturnsEnvelope(
        IOutboundLinkReadOnlyService service,
        IOutboundLinkAuthorizationService authorization,
        OutboundLinkApiQuery query)
    {
        var httpContext = CreateHttpContext("fixture-tenant", "Viewer");
        var result = await OutboundLinkReadOnlyEndpoints.ListLinksAsync(service, authorization, httpContext, query);
        var envelope = await ExecuteJsonResult<OutboundLinkApiEnvelope<OutboundLinkListResponse>>(result, httpContext);
        Assert(envelope is not null, "endpoint should serialize an envelope");
        Assert(envelope!.Ok, "endpoint envelope should be ok");
        Assert(envelope.Data?.Items.Count == 5, "endpoint envelope should include fixture links");
    }

    private static async Task AssertScopedWriteFoundationRouteIsRegistered()
    {
        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        Assert(programSource.Contains("MapOutboundLinkWriteEndpoints", StringComparison.Ordinal), "scoped write foundation route mapper should be registered after Phase 2H-14");
    }

    private static DefaultHttpContext CreateHttpContext(string tenantKey, string role)
    {
        var identity = new ClaimsIdentity([
            new Claim("tenantId", tenantKey),
            new Claim(ClaimTypes.Role, role)
        ], "Phase2H9Test");
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity),
            RequestServices = new ServiceCollection().AddLogging().BuildServiceProvider()
        };
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<T?> ExecuteJsonResult<T>(IResult result, DefaultHttpContext context)
    {
        context.Response.Body.SetLength(0);
        await result.ExecuteAsync(context);
        context.Response.Body.Position = 0;
        return await JsonSerializer.DeserializeAsync<T>(context.Response.Body, JsonOptions);
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException(message);
        }
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
}
