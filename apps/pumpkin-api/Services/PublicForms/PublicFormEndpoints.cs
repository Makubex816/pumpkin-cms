using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using pumpkin_api.Services.DomainBindings;
using pumpkin_net_models.Models;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_api.Services.PublicForms;

public static class PublicFormEndpoints
{
    private const long MaximumRequestBytes = 24 * 1024;
    private const string TicketHeader = "X-Pumpkin-Public-Form-Ticket";
    private static readonly JsonSerializerOptions StrictRequestJson = new(JsonSerializerDefaults.Web)
    {
        MaxDepth = 4,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow
    };

    public static IServiceCollection AddPublicFormFoundation(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PublicFormOptions>(configuration.GetSection(PublicFormOptions.SectionName));
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<PublicFormCanonicalizer>();
        services.AddSingleton<PublicFormTicketService>();
        services.AddSingleton<PublicPublicationService>();
        services.AddSingleton<PublicFormSubmissionService>();
        return services;
    }

    public static WebApplication MapPublicFormEndpoints(this WebApplication app)
    {
        app.MapPost("/api/public/publications/{publicationId}/forms/{formMappingId}/preflight", PreflightAsync)
            .AllowAnonymous()
            .RequireCors("PublicPublicationCors")
            .RequireRateLimiting("public-form-preflight")
            .WithMetadata(new RequestSizeLimitAttribute(MaximumRequestBytes))
            .Accepts<PublicFormPreflightRequest>("application/json")
            .WithTags("Public Forms")
            .WithName("PreflightPublicPublicationForm");

        app.MapPost("/api/public/publications/{publicationId}/forms/{formMappingId}/submit", SubmitAsync)
            .AllowAnonymous()
            .RequireCors("PublicPublicationCors")
            .RequireRateLimiting("public-form-submit")
            .WithMetadata(new RequestSizeLimitAttribute(MaximumRequestBytes))
            .Accepts<PublicFormSubmissionRequest>("application/json")
            .WithTags("Public Forms")
            .WithName("SubmitPublicPublicationForm");

        app.MapPost("/api/admin/public-publications", CreatePublicationAsync)
            .RequireAuthorization()
            .WithTags("Admin - Public Publications")
            .WithName("CreatePublicPublication");
        app.MapGet("/api/admin/public-publications/{publicationId}", GetPublicationAsync)
            .RequireAuthorization()
            .WithTags("Admin - Public Publications")
            .WithName("GetPublicPublication");
        app.MapPost("/api/admin/public-publications/{publicationId}/activate", ActivatePublicationAsync)
            .RequireAuthorization()
            .WithTags("Admin - Public Publications")
            .WithName("ActivatePublicPublication");
        app.MapPost("/api/admin/public-publications/{publicationId}/revoke", RevokePublicationAsync)
            .RequireAuthorization()
            .WithTags("Admin - Public Publications")
            .WithName("RevokePublicPublication");
        return app;
    }

    private static async Task<IResult> PreflightAsync(
        PublicFormSubmissionService service,
        IOptions<PublicFormOptions> options,
        string publicationId,
        string formMappingId,
        HttpContext context)
    {
        StampPublicHeaders(context);
        if (context.Request.ContentLength is > MaximumRequestBytes)
            return Error(context, "request_too_large", string.Empty, 413, false);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
        timeout.CancelAfter(TimeSpan.FromSeconds(Math.Clamp(options.Value.PreflightTimeoutSeconds, 1, 10)));
        try
        {
            var request = await ReadStrictJsonAsync<PublicFormPreflightRequest>(context, timeout.Token);
            if (request == null) return Error(context, "payload_invalid", string.Empty, 400, false);
            var result = await service.PreflightAsync(
                publicationId, formMappingId, context.Request.Headers.Origin.Select(value => (string?)value), request, timeout.Token);
            return ToResult(context, result);
        }
        catch (OperationCanceledException) when (!context.RequestAborted.IsCancellationRequested)
        {
            return Error(context, "preflight_timeout", string.Empty, 504, true);
        }
        catch (JsonException)
        {
            return Error(context, "payload_invalid", string.Empty, 400, false);
        }
        catch (Exception)
        {
            return Error(context, "public_form_unavailable", string.Empty, 503, true);
        }
    }

    private static async Task<IResult> SubmitAsync(
        PublicFormSubmissionService service,
        IOptions<PublicFormOptions> options,
        string publicationId,
        string formMappingId,
        HttpContext context)
    {
        StampPublicHeaders(context);
        if (context.Request.ContentLength is > MaximumRequestBytes)
            return Error(context, "request_too_large", string.Empty, 413, false);
        var tickets = context.Request.Headers[TicketHeader];
        var ticket = tickets.Count == 1 ? tickets[0] : null;
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
        timeout.CancelAfter(TimeSpan.FromSeconds(Math.Clamp(options.Value.SubmitTimeoutSeconds, 1, 20)));
        try
        {
            var request = await ReadStrictJsonAsync<PublicFormSubmissionRequest>(context, timeout.Token);
            if (request == null) return Error(context, "payload_invalid", string.Empty, 400, false);
            var result = await service.SubmitAsync(
                publicationId,
                formMappingId,
                context.Request.Headers.Origin.Select(value => (string?)value),
                ticket,
                request,
                context.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                context.Request.Headers.UserAgent.FirstOrDefault() ?? string.Empty,
                timeout.Token);
            return ToResult(context, result);
        }
        catch (OperationCanceledException) when (!context.RequestAborted.IsCancellationRequested)
        {
            return Error(context, "submit_timeout", string.Empty, 504, true);
        }
        catch (JsonException)
        {
            return Error(context, "payload_invalid", string.Empty, 400, false);
        }
        catch (Exception)
        {
            return Error(context, "persistence_unavailable", string.Empty, 503, true);
        }
    }

    private static async Task<IResult> CreatePublicationAsync(
        IDatabaseService database,
        PublicPublicationService publications,
        PublicPublicationCreateRequest request,
        HttpContext context)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);
        timeout.CancelAfter(TimeSpan.FromSeconds(10));
        var actor = DomainBindingAuthorization.GetActor(context.User);
        var (draft, errors) = await publications.PrepareDraftAsync(request, actor, timeout.Token);
        if (draft == null)
            return Results.BadRequest(new { errorCode = "publication_invalid", errors });
        try
        {
            var created = await database.CreatePublicPublicationAsync(draft, timeout.Token);
            return Results.Created($"/api/admin/public-publications/{created.PublicationId}", created);
        }
        catch (InvalidOperationException)
        {
            return Results.Conflict(new { errorCode = "publication_conflict" });
        }
    }

    private static async Task<IResult> GetPublicationAsync(
        IDatabaseService database,
        string publicationId,
        HttpContext context)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;
        var publication = await database.GetPublicPublicationAsync(publicationId, context.RequestAborted);
        return publication == null ? Results.NotFound() : Results.Ok(publication);
    }

    private static async Task<IResult> ActivatePublicationAsync(
        IDatabaseService database,
        PublicPublicationService publications,
        TimeProvider timeProvider,
        string publicationId,
        HttpContext context)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;
        var current = await database.GetPublicPublicationAsync(publicationId, context.RequestAborted);
        if (current == null) return Results.NotFound();
        if (!string.Equals(current.Status, "draft", StringComparison.Ordinal))
            return Results.Conflict(new { errorCode = "publication_state_conflict" });
        var errors = await publications.ValidateForActivationAsync(current, context.RequestAborted);
        if (errors.Count > 0) return Results.BadRequest(new { errorCode = "publication_invalid", errors });
        var expectedRevision = current.Revision;
        current.Status = "active";
        current.IndexingMode = PublicationProductModes.HeldNoIndex;
        current.FormMode = PublicationProductModes.PublicFormsLive;
        current.ActiveFromUtc ??= timeProvider.GetUtcNow();
        current.ActivatedAtUtc = timeProvider.GetUtcNow();
        current.ActivatedBy = DomainBindingAuthorization.GetActor(context.User);
        current.UpdatedAtUtc = timeProvider.GetUtcNow();
        current.UpdatedBy = current.ActivatedBy;
        current.Revision++;
        try
        {
            return Results.Ok(await database.UpdatePublicPublicationAsync(current, expectedRevision, context.RequestAborted));
        }
        catch (InvalidOperationException)
        {
            return Results.Conflict(new { errorCode = "publication_state_conflict" });
        }
    }

    private static async Task<IResult> RevokePublicationAsync(
        IDatabaseService database,
        TimeProvider timeProvider,
        string publicationId,
        HttpContext context)
    {
        var auth = DomainBindingAuthorization.RequireSuperAdmin(context);
        if (auth != null) return auth;
        var current = await database.GetPublicPublicationAsync(publicationId, context.RequestAborted);
        if (current == null) return Results.NotFound();
        if (string.Equals(current.Status, "revoked", StringComparison.Ordinal)) return Results.Ok(current);
        var expectedRevision = current.Revision;
        current.Status = "revoked";
        current.IndexingState = "disabled";
        current.IndexingMode = PublicationProductModes.HeldNoIndex;
        current.FormMode = PublicationProductModes.PreviewNoPost;
        current.CustomerExecutionEnabled = false;
        current.ReplayProtectionVersion = Math.Max(1, current.ReplayProtectionVersion) + 1;
        current.FormMappings.ForEach(mapping =>
        {
            mapping.Active = false;
            mapping.SubmitMode = "disabled-no-post";
        });
        current.RevokedAtUtc = timeProvider.GetUtcNow();
        current.RevokedBy = DomainBindingAuthorization.GetActor(context.User);
        current.UpdatedAtUtc = timeProvider.GetUtcNow();
        current.UpdatedBy = current.RevokedBy;
        current.Revision++;
        try
        {
            return Results.Ok(await database.UpdatePublicPublicationAsync(current, expectedRevision, context.RequestAborted));
        }
        catch (InvalidOperationException)
        {
            return Results.Conflict(new { errorCode = "publication_state_conflict" });
        }
    }

    private static IResult ToResult(HttpContext context, PublicFormOperationResult result) => result.Status switch
    {
        PublicFormOperationStatus.Ready => Results.Ok(result.Preflight),
        PublicFormOperationStatus.Created => Results.Json(result.Submit, statusCode: StatusCodes.Status201Created),
        PublicFormOperationStatus.Replay => Results.Ok(result.Submit),
        PublicFormOperationStatus.InvalidRequest => Error(context, "payload_invalid", result.CorrelationId, 400, false),
        PublicFormOperationStatus.PublicationUnavailable => Error(context, "publication_unavailable", result.CorrelationId, 404, false),
        PublicFormOperationStatus.OriginNotAllowed => Error(context, "origin_not_allowed", result.CorrelationId, 403, false),
        PublicFormOperationStatus.TicketExpired => Error(context, "ticket_expired", result.CorrelationId, 403, false),
        PublicFormOperationStatus.TicketInvalid => Error(context, "ticket_invalid", result.CorrelationId, 403, false),
        PublicFormOperationStatus.Conflict => Error(context, "idempotency_conflict", result.CorrelationId, 409, false),
        _ => Error(context, "public_form_unavailable", result.CorrelationId, 503, true)
    };

    private static IResult Error(HttpContext context, string code, string correlationId, int status, bool retryable) =>
        Results.Json(new PublicFormErrorResponse
        {
            Success = false,
            ErrorCode = code,
            RequestId = context.TraceIdentifier,
            CorrelationId = correlationId,
            Retryable = retryable
        }, statusCode: status);

    public static void StampPublicHeaders(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers.Pragma = "no-cache";
        context.Response.Headers.Vary = "Origin";
    }

    private static async Task<T?> ReadStrictJsonAsync<T>(HttpContext context, CancellationToken cancellationToken)
    {
        if (!context.Request.HasJsonContentType() || context.Request.ContentLength == 0) return default;
        return await JsonSerializer.DeserializeAsync<T>(context.Request.Body, StrictRequestJson, cancellationToken);
    }
}
