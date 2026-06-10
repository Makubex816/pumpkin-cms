using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using pumpkin_api.Services;

namespace pumpkin_api.Tests;

public static class OutboundLinkApiWriteActionTestRunner
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task RunAsync()
    {
        Console.WriteLine("Phase 2H-14 Outbound Link Manager scoped write-action tests");

        var service = CreateService();
        var tenantAdmin = new OutboundLinkWriteActor("local-api-tenant-admin", "tenant-admin@example.test", "TenantAdmin", "fixture-tenant", true);

        await AssertLocalFakeLinkStatusWrite(service, tenantAdmin);
        await AssertBulkWriteIncludesTraceImpactAndRollback(service, tenantAdmin);
        await AssertViewerBlocked(service);
        await AssertLiveProviderModesBlocked(service, tenantAdmin);
        await AssertEndpointHandlerReturnsWriteEnvelope(service);
        AssertUrlRedaction();

        Console.WriteLine("Phase 2H-14 tests passed");
    }

    private static async Task AssertLocalFakeLinkStatusWrite(IOutboundLinkWriteActionService service, OutboundLinkWriteActor actor)
    {
        var response = await service.ExecuteAsync(
            OutboundLinkWriteActions.SetLinkStatus,
            "ol_docs_help",
            Request("setLinkStatus", "disabled"),
            actor);
        Assert(response.Ok, "local/fake link status write should succeed");
        Assert(response.Applied, "local/fake response should be applied");
        Assert(!response.LiveWriteAllowed, "live writes must remain false");
        Assert(response.RequestId.Length > 0 && response.ActionId.Length > 0 && response.CorrelationId.Length > 0, "trace ids are required");
        Assert(response.AuditEventIds.Count == 1, "applied action should include audit id");
        Assert(response.RollbackPlanId.StartsWith("olrp_", StringComparison.Ordinal), "rollback id should be present");
        Assert(response.BeforeStateHash != response.AfterStateHash, "state hashes should change for applied mutation");
        Assert(response.TraceLog.OutboundLinkId == "ol_docs_help", "trace should include link id");
    }

    private static async Task AssertBulkWriteIncludesTraceImpactAndRollback(IOutboundLinkWriteActionService service, OutboundLinkWriteActor actor)
    {
        var request = Request("bulkDomainDisable", "disabled");
        request.Target.Domain = "example.com";
        request.ApprovalReference = "OLM-BULK-TEST-001";
        var response = await service.ExecuteAsync(OutboundLinkWriteActions.BulkDomainDisable, null, request, actor);
        Assert(response.Ok, "bulk local/fake write should succeed");
        Assert(response.BulkActionId?.StartsWith("olba_", StringComparison.Ordinal) == true, "bulk action id should be present");
        Assert(response.PublishingImpact.AffectedInstanceCount == 3, "bulk impact should include three example.com instances");
        Assert(response.RollbackPlan.Changes.Count > 0, "bulk write should include rollback change");
    }

    private static async Task AssertViewerBlocked(IOutboundLinkWriteActionService service)
    {
        var viewer = new OutboundLinkWriteActor("viewer", "viewer@example.test", "Viewer", "fixture-tenant", true);
        var response = await service.ExecuteAsync(OutboundLinkWriteActions.SetLinkStatus, "ol_docs_help", Request("setLinkStatus", "disabled"), viewer);
        Assert(!response.Ok, "viewer write should be blocked");
        Assert(response.Code == OutboundLinkWriteErrorCodes.ForbiddenRole, "viewer should receive forbidden role");
        Assert(response.TraceLog.Outcome == "blocked", "blocked response should include blocked trace");
        Assert(response.RollbackPlan.Blocked, "blocked response should include rollback stub");
    }

    private static async Task AssertLiveProviderModesBlocked(IOutboundLinkWriteActionService service, OutboundLinkWriteActor actor)
    {
        var liveReadonly = Request("setLinkStatus", "disabled");
        liveReadonly.ProviderMode = OutboundLinkWriteProviderModes.LiveReadonly;
        var readonlyResponse = await service.ExecuteAsync(OutboundLinkWriteActions.SetLinkStatus, "ol_docs_help", liveReadonly, actor);
        Assert(!readonlyResponse.Ok, "live-readonly write should be blocked");
        Assert(readonlyResponse.Code == OutboundLinkWriteErrorCodes.WriteNotApproved, "live-readonly should return write-not-approved");

        var liveWrite = Request("setLinkStatus", "disabled");
        liveWrite.ProviderMode = OutboundLinkWriteProviderModes.LiveWriteApproved;
        var liveWriteResponse = await service.ExecuteAsync(OutboundLinkWriteActions.SetLinkStatus, "ol_docs_help", liveWrite, actor);
        Assert(!liveWriteResponse.Ok, "live-write-approved remains blocked in 2H-14");
        Assert(liveWriteResponse.Code == OutboundLinkWriteErrorCodes.LiveWriteBlocked, "live-write-approved should return blocked code");
    }

    private static async Task AssertEndpointHandlerReturnsWriteEnvelope(IOutboundLinkWriteActionService service)
    {
        var context = CreateHttpContext("fixture-tenant", "TenantAdmin");
        var result = await OutboundLinkWriteEndpoints.SetLinkStatusAsync(service, context, "ol_docs_help", Request("setLinkStatus", "disabled"));
        var envelope = await ExecuteJsonResult<OutboundLinkWriteResponse>(result, context);
        Assert(envelope is not null, "endpoint should serialize write response");
        Assert(envelope!.Ok, "endpoint write response should be ok in fake provider mode");
        Assert(envelope.TraceLog.ActionId == envelope.ActionId, "endpoint response should include trace action id");
    }

    private static void AssertUrlRedaction()
    {
        var redactor = new OutboundLinkWriteTraceLogger();
        var redacted = redactor.RedactUrlForLog("https://docs.example/help?token=secret-value&safe=1");
        Assert(redacted.Contains("token=redacted", StringComparison.Ordinal), "token query should be redacted");
        Assert(!redacted.Contains("secret-value", StringComparison.Ordinal), "secret-like query value should not remain");
    }

    private static IOutboundLinkWriteActionService CreateService()
    {
        var traceLogger = new OutboundLinkWriteTraceLogger();
        return new OutboundLinkWriteActionService(
            new OutboundLinkWriteGuardService(),
            new OutboundLinkWriteFakeProvider(traceLogger),
            traceLogger);
    }

    private static OutboundLinkWriteRequest Request(string action, string status)
        => new()
        {
            TenantKey = "fixture-tenant",
            SiteKey = "fixture-site",
            ProviderMode = OutboundLinkWriteProviderModes.LocalApiFakeProvider,
            Reason = $"phase 2h14 test {action}",
            ApprovalReference = "OLM-LOCAL-API-TEST-001",
            RequestId = $"olwr_test_{action}",
            ActionId = $"olwa_test_{action}",
            CorrelationId = $"olwc_test_{action}",
            Target = new OutboundLinkWriteTarget
            {
                Status = status,
                Domain = "docs.example"
            },
            ActorId = "local-api-tenant-admin",
            ActorEmail = "tenant-admin@example.test",
            ActorRole = "TenantAdmin"
        };

    private static DefaultHttpContext CreateHttpContext(string tenantKey, string role)
    {
        var identity = new ClaimsIdentity([
            new Claim("tenantId", tenantKey),
            new Claim(ClaimTypes.Role, role),
            new Claim(ClaimTypes.NameIdentifier, "local-api-tenant-admin"),
            new Claim(ClaimTypes.Email, "tenant-admin@example.test")
        ], "Phase2H14Test");
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
}
