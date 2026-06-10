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
        await AssertDomainFilterAndPagination(service, query);
        AssertTenantScopeGuardDeniesWrongTenant(authorization);
        AssertViewerReadOnlyWorks(authorization);
        await AssertEndpointHandlerReturnsEnvelope(service, authorization, query);
        await AssertNoWriteOutboundLinkRoutes();

        Console.WriteLine("Phase 2H-9 tests passed");
    }

    private static async Task AssertListLinksReturnsEnvelope(IOutboundLinkReadOnlyService service, OutboundLinkApiQuery query)
    {
        var response = await service.ListLinksAsync(query);
        Assert(response.Ok, "list links response should be ok");
        Assert(response.Code == OutboundLinkApiErrorCodes.Ok, "list links code should be OK");
        Assert(response.Data?.Items.Count == 5, "list links should return five fixture links");
        Assert(response.Meta.Pagination?.TotalItems == 5, "list links pagination should report total items");
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

    private static async Task AssertNoWriteOutboundLinkRoutes()
    {
        var programSource = await File.ReadAllTextAsync(Path.Combine(FindRepoRoot(), "apps", "pumpkin-api", "Program.cs"));
        var writePatterns = new[]
        {
            "MapPost(\"/api/admin/outbound-link",
            "MapPut(\"/api/admin/outbound-link",
            "MapPatch(\"/api/admin/outbound-link",
            "MapDelete(\"/api/admin/outbound-link"
        };
        foreach (var pattern in writePatterns)
        {
            Assert(!programSource.Contains(pattern, StringComparison.Ordinal), $"write route must not exist: {pattern}");
        }
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
