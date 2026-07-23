using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.PublicForms;

public sealed class PublicFormSubmissionService
{
    private readonly IDatabaseService _database;
    private readonly PublicPublicationService _publications;
    private readonly PublicFormCanonicalizer _canonicalizer;
    private readonly PublicFormTicketService _tickets;
    private readonly PublicFormOptions _options;
    private readonly TimeProvider _timeProvider;

    public PublicFormSubmissionService(
        IDatabaseService database,
        PublicPublicationService publications,
        PublicFormCanonicalizer canonicalizer,
        PublicFormTicketService tickets,
        IOptions<PublicFormOptions> options,
        TimeProvider timeProvider)
    {
        _database = database;
        _publications = publications;
        _canonicalizer = canonicalizer;
        _tickets = tickets;
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public async Task<PublicFormOperationResult> PreflightAsync(
        string publicationId,
        string formMappingId,
        IEnumerable<string?> originValues,
        PublicFormPreflightRequest request,
        CancellationToken cancellationToken)
    {
        if (!PublicPublicationService.IsBoundedIdentifier(publicationId) ||
            !PublicPublicationService.IsBoundedIdentifier(formMappingId))
            return new(PublicFormOperationStatus.PublicationUnavailable);
        if (!PublicOriginPolicy.TryReadExactOrigin(originValues, _options.AllowHttpLocalhost, out var origin))
            return new(PublicFormOperationStatus.OriginNotAllowed);
        if (!_tickets.IsConfigured)
            return new(PublicFormOperationStatus.ConfigurationUnavailable);

        var resolved = await ResolveAsync(publicationId, formMappingId, origin, cancellationToken);
        if (resolved == null)
            return new(PublicFormOperationStatus.PublicationUnavailable);
        var submissionId = string.IsNullOrWhiteSpace(request.ClientIdempotencySeed)
            ? Guid.NewGuid().ToString("D")
            : request.ClientIdempotencySeed;
        if (!PublicFormCanonicalizer.TryCanonicalGuid(submissionId, out submissionId))
            return new(PublicFormOperationStatus.InvalidRequest);
        var correlationId = Guid.NewGuid().ToString("D");
        var identity = PublicFormCanonicalizer.ComputeIdempotencyIdentity(
            resolved.Value.Publication.TenantUid,
            resolved.Value.Publication.PublicationId,
            resolved.Value.Mapping.FormMappingId,
            submissionId);
        var issued = _tickets.Issue(new PublicFormTicketClaims(
            resolved.Value.Publication.PublicationId,
            resolved.Value.Publication.TenantUid,
            resolved.Value.Mapping.FormMappingId,
            resolved.Value.Definition.Id,
            resolved.Value.Mapping.FieldContractVersion,
            resolved.Value.Publication.ReleaseId,
            origin,
            submissionId,
            correlationId,
            identity), resolved.Value.Publication.TicketTtlSeconds);
        return new(PublicFormOperationStatus.Ready, new PublicFormPreflightResponse
        {
            Ready = true,
            CreatesFormEntry = false,
            Ticket = issued.Token,
            ExpiresAtUtc = issued.ExpiresAtUtc,
            SubmissionId = submissionId,
            CorrelationId = correlationId,
            FieldContractVersion = resolved.Value.Mapping.FieldContractVersion
        }, CorrelationId: correlationId);
    }

    public async Task<PublicFormOperationResult> SubmitAsync(
        string publicationId,
        string formMappingId,
        IEnumerable<string?> originValues,
        string? ticket,
        PublicFormSubmissionRequest request,
        string clientIp,
        string userAgent,
        CancellationToken cancellationToken)
    {
        if (!PublicPublicationService.IsBoundedIdentifier(publicationId) ||
            !PublicPublicationService.IsBoundedIdentifier(formMappingId))
            return new(PublicFormOperationStatus.PublicationUnavailable, CorrelationId: request.CorrelationId);
        if (!PublicOriginPolicy.TryReadExactOrigin(originValues, _options.AllowHttpLocalhost, out var origin))
            return new(PublicFormOperationStatus.OriginNotAllowed, CorrelationId: request.CorrelationId);

        var ticketResult = _tickets.Validate(ticket);
        if (ticketResult.Status == PublicFormTicketValidationStatus.ConfigurationUnavailable)
            return new(PublicFormOperationStatus.ConfigurationUnavailable, CorrelationId: request.CorrelationId);
        if (ticketResult.Status == PublicFormTicketValidationStatus.Expired)
            return new(PublicFormOperationStatus.TicketExpired, CorrelationId: request.CorrelationId);
        if (ticketResult.Status != PublicFormTicketValidationStatus.Valid || ticketResult.Claims == null)
            return new(PublicFormOperationStatus.TicketInvalid, CorrelationId: request.CorrelationId);

        var claims = ticketResult.Claims;
        if (!string.Equals(claims.PublicationId, publicationId, StringComparison.Ordinal) ||
            !string.Equals(claims.FormMappingId, formMappingId, StringComparison.Ordinal) ||
            !string.Equals(claims.Origin, origin, StringComparison.Ordinal))
            return new(PublicFormOperationStatus.TicketInvalid, CorrelationId: request.CorrelationId);

        var resolved = await ResolveAsync(publicationId, formMappingId, origin, cancellationToken);
        if (resolved == null)
            return new(PublicFormOperationStatus.PublicationUnavailable, CorrelationId: request.CorrelationId);
        var prepared = _canonicalizer.Prepare(resolved.Value.Publication, resolved.Value.Mapping, resolved.Value.Definition, request);
        if (!prepared.Valid)
            return new(PublicFormOperationStatus.InvalidRequest, CorrelationId: request.CorrelationId);
        var entry = prepared.Prepared!.Entry;

        if (!ClaimsMatch(claims, entry, origin))
            return new(PublicFormOperationStatus.TicketInvalid, CorrelationId: entry.CorrelationId);

        entry.SubmittedAt = _timeProvider.GetUtcNow().UtcDateTime;
        entry.IpAddress = Truncate(clientIp, 64);
        entry.UserAgent = Truncate(userAgent, 512);
        var persisted = await _database.CreatePublicFormEntryAsync(entry, cancellationToken);
        return persisted.Status switch
        {
            PublicFormEntryCreateStatus.Created => new(PublicFormOperationStatus.Created, Submit: ToResponse(persisted.Entry!, false, entry.CorrelationId), CorrelationId: entry.CorrelationId),
            PublicFormEntryCreateStatus.Replay => new(PublicFormOperationStatus.Replay, Submit: ToResponse(persisted.Entry!, true, entry.CorrelationId), CorrelationId: entry.CorrelationId),
            _ => new(PublicFormOperationStatus.Conflict, CorrelationId: entry.CorrelationId)
        };
    }

    private async Task<(PublicPublication Publication, PublicPublicationFormMapping Mapping, FormDefinition Definition)?> ResolveAsync(
        string publicationId,
        string formMappingId,
        string origin,
        CancellationToken cancellationToken)
    {
        var publication = await _database.GetPublicPublicationAsync(publicationId, cancellationToken);
        if (publication == null || !_publications.IsActive(publication) ||
            !string.Equals(publication.TicketKeyId, _options.TicketKeyId, StringComparison.Ordinal) ||
            !PublicOriginPolicy.IsAllowed(origin, publication.AllowedOrigins))
            return null;
        var tenant = await _database.GetTenantAsync(publication.TenantId).WaitAsync(cancellationToken);
        if (tenant == null || !string.Equals(tenant.TenantUid, publication.TenantUid, StringComparison.Ordinal) ||
            !string.Equals(tenant.Status, "active", StringComparison.OrdinalIgnoreCase) ||
            tenant.Settings?.Features?.Forms != true ||
            !publication.AllowedHostnames.Contains(new Uri(origin).IdnHost.ToLowerInvariant(), StringComparer.Ordinal))
            return null;
        var mapping = publication.FormMappings.SingleOrDefault(item =>
            item.Active &&
            string.Equals(item.SubmitMode, "public-ticket", StringComparison.Ordinal) &&
            string.Equals(item.FormMappingId, formMappingId, StringComparison.Ordinal));
        if (mapping == null) return null;
        var definition = await _database.GetFormDefinitionAdminAsync(publication.TenantId, mapping.FormDefinitionId)
            .WaitAsync(cancellationToken);
        if (definition == null ||
            !string.Equals(definition.TenantId, publication.TenantId, StringComparison.Ordinal) ||
            !string.Equals(definition.Id, mapping.FormDefinitionId, StringComparison.Ordinal) ||
            !string.Equals(definition.FormKey, mapping.FormKey, StringComparison.Ordinal) ||
            !string.Equals(definition.SiteKey, mapping.SiteKey, StringComparison.Ordinal) ||
            !string.Equals(definition.Version, mapping.FieldContractVersion, StringComparison.Ordinal) ||
            definition.Consent?.Required != true ||
            string.IsNullOrWhiteSpace(definition.Consent.FieldName) ||
            !string.Equals(definition.Status, "active", StringComparison.OrdinalIgnoreCase))
            return null;
        return (publication, mapping, definition);
    }

    private static bool ClaimsMatch(PublicFormTicketClaims claims, FormEntry entry, string origin) =>
        string.Equals(claims.PublicationId, entry.PublicationId, StringComparison.Ordinal) &&
        string.Equals(claims.TenantUid, entry.TenantUid, StringComparison.Ordinal) &&
        string.Equals(claims.FormMappingId, entry.FormMappingId, StringComparison.Ordinal) &&
        string.Equals(claims.FormDefinitionId, entry.FormId, StringComparison.Ordinal) &&
        string.Equals(claims.FieldContractVersion, entry.FieldContractVersion, StringComparison.Ordinal) &&
        string.Equals(claims.ReleaseId, entry.ReleaseId, StringComparison.Ordinal) &&
        string.Equals(claims.Origin, origin, StringComparison.Ordinal) &&
        string.Equals(claims.SubmissionId, entry.SubmissionId, StringComparison.Ordinal) &&
        string.Equals(claims.CorrelationId, entry.CorrelationId, StringComparison.Ordinal) &&
        string.Equals(claims.IdempotencyIdentity, entry.PublicIdempotencyIdentity, StringComparison.Ordinal);

    private static PublicFormSubmitResponse ToResponse(FormEntry entry, bool replay, string correlationId) => new()
    {
        Success = true,
        FormEntryId = entry.Id,
        SubmissionId = entry.SubmissionId,
        CorrelationId = correlationId,
        IdempotentReplay = replay
    };

    private static string Truncate(string value, int maximum) =>
        string.IsNullOrEmpty(value) ? string.Empty : value[..Math.Min(value.Length, maximum)];
}
