using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.PublicForms;

public sealed partial class PublicPublicationService
{
    private readonly IDatabaseService _database;
    private readonly PublicFormOptions _options;
    private readonly PublicFormTicketService _tickets;
    private readonly TimeProvider _timeProvider;

    public PublicPublicationService(
        IDatabaseService database,
        IOptions<PublicFormOptions> options,
        PublicFormTicketService tickets,
        TimeProvider timeProvider)
    {
        _database = database;
        _options = options.Value;
        _tickets = tickets;
        _timeProvider = timeProvider;
    }

    public async Task<(PublicPublication? Publication, IReadOnlyList<string> Errors)> PrepareDraftAsync(
        PublicPublicationCreateRequest request,
        string actor,
        CancellationToken cancellationToken)
    {
        var errors = new List<string>();
        var publicationId = request.PublicationId.Trim();
        var tenantId = request.TenantId.Trim();
        var releaseId = request.ReleaseId.Trim();
        var artifactSha = request.ArtifactSha256.Trim().ToLowerInvariant();
        if (!IdentifierPattern().IsMatch(publicationId)) errors.Add("publication_id_invalid");
        if (string.IsNullOrWhiteSpace(tenantId) || tenantId.Length > 128) errors.Add("tenant_id_invalid");
        if (string.IsNullOrWhiteSpace(releaseId) || releaseId.Length > 128) errors.Add("release_id_invalid");
        if (!Sha256Pattern().IsMatch(artifactSha)) errors.Add("artifact_sha256_invalid");
        if (request.ActiveUntilUtc.HasValue && request.ActiveFromUtc.HasValue &&
            request.ActiveUntilUtc <= request.ActiveFromUtc)
            errors.Add("publication_window_invalid");
        if (request.AllowedOrigins.Count is < 1 || request.AllowedOrigins.Count > _options.MaximumPublicationOrigins)
            errors.Add("publication_origins_invalid");
        if (request.FormMappings.Count is < 1 || request.FormMappings.Count > _options.MaximumPublicationMappings)
            errors.Add("publication_mappings_invalid");
        if (!_tickets.IsConfigured) errors.Add("ticket_configuration_unavailable");

        var origins = new List<string>();
        foreach (var origin in request.AllowedOrigins)
        {
            if (!PublicOriginPolicy.TryCanonicalize(origin, _options.AllowHttpLocalhost, out var canonical))
                errors.Add("publication_origin_invalid");
            else if (!origins.Contains(canonical, StringComparer.Ordinal))
                origins.Add(canonical);
            else
                errors.Add("publication_origin_duplicate");
        }

        var mappingIds = new HashSet<string>(StringComparer.Ordinal);
        foreach (var mapping in request.FormMappings)
        {
            mapping.FormMappingId = mapping.FormMappingId.Trim();
            mapping.FormDefinitionId = mapping.FormDefinitionId.Trim();
            mapping.SubmitMode = mapping.SubmitMode.Trim().ToLowerInvariant();
            mapping.FieldContractVersion = mapping.FieldContractVersion.Trim();
            mapping.FormKey = mapping.FormKey.Trim();
            mapping.SiteKey = mapping.SiteKey.Trim();
            mapping.PageSlug = mapping.PageSlug.Trim();
            if (!IdentifierPattern().IsMatch(mapping.FormMappingId) || !mappingIds.Add(mapping.FormMappingId))
                errors.Add("form_mapping_id_invalid");
            if (!mapping.Active || !string.Equals(mapping.SubmitMode, "public-ticket", StringComparison.Ordinal))
                errors.Add("form_mapping_submit_mode_invalid");
            if (new[] { mapping.FormDefinitionId, mapping.FormKey, mapping.SiteKey, mapping.PageSlug }
                .Any(value => string.IsNullOrWhiteSpace(value) || value.Length > 128))
                errors.Add("form_mapping_invalid");
        }
        if (errors.Count > 0) return (null, errors.Distinct(StringComparer.Ordinal).ToList());

        var tenant = await _database.GetTenantAsync(tenantId).WaitAsync(cancellationToken);
        if (tenant == null || string.IsNullOrWhiteSpace(tenant.TenantUid) ||
            !string.Equals(tenant.Status, "active", StringComparison.OrdinalIgnoreCase) ||
            tenant.Settings?.Features?.Forms != true)
            errors.Add("tenant_unavailable");
        foreach (var mapping in request.FormMappings)
        {
            var definition = await _database.GetFormDefinitionAdminAsync(tenantId, mapping.FormDefinitionId)
                .WaitAsync(cancellationToken);
            if (definition == null ||
                !string.Equals(definition.TenantId, tenantId, StringComparison.Ordinal) ||
                !string.Equals(definition.Status, "active", StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(definition.FormKey, mapping.FormKey, StringComparison.Ordinal) ||
                !string.Equals(definition.SiteKey, mapping.SiteKey, StringComparison.Ordinal) ||
                definition.Consent?.Required != true ||
                string.IsNullOrWhiteSpace(definition.Consent.FieldName) ||
                string.IsNullOrWhiteSpace(definition.Version))
                errors.Add("form_definition_unavailable");
            else if (!string.IsNullOrWhiteSpace(mapping.FieldContractVersion) &&
                !string.Equals(mapping.FieldContractVersion, definition.Version, StringComparison.Ordinal))
                errors.Add("field_contract_version_mismatch");
            else
                mapping.FieldContractVersion = definition.Version;
        }
        if (errors.Count > 0) return (null, errors.Distinct(StringComparer.Ordinal).ToList());

        var now = _timeProvider.GetUtcNow();
        return (new PublicPublication
        {
            Id = publicationId,
            PublicationId = publicationId,
            TenantId = tenantId,
            TenantUid = tenant!.TenantUid!,
            ReleaseId = releaseId,
            ArtifactSha256 = artifactSha,
            Status = "draft",
            IndexingState = "disabled",
            ActiveFromUtc = request.ActiveFromUtc,
            ActiveUntilUtc = request.ActiveUntilUtc,
            AllowedOrigins = origins,
            AllowedHostnames = origins.Select(origin => new Uri(origin).IdnHost.ToLowerInvariant())
                .Distinct(StringComparer.Ordinal).OrderBy(value => value, StringComparer.Ordinal).ToList(),
            FormMappings = request.FormMappings,
            TicketKeyId = _options.TicketKeyId,
            TicketTtlSeconds = _options.BoundTicketTtl(request.TicketTtlSeconds),
            Revision = 1,
            CreatedAtUtc = now,
            CreatedBy = actor,
            UpdatedAtUtc = now,
            UpdatedBy = actor
        }, Array.Empty<string>());
    }

    public async Task<IReadOnlyList<string>> ValidateForActivationAsync(
        PublicPublication publication,
        CancellationToken cancellationToken)
    {
        var request = new PublicPublicationCreateRequest
        {
            PublicationId = publication.PublicationId,
            TenantId = publication.TenantId,
            ReleaseId = publication.ReleaseId,
            ArtifactSha256 = publication.ArtifactSha256,
            ActiveFromUtc = publication.ActiveFromUtc,
            ActiveUntilUtc = publication.ActiveUntilUtc,
            AllowedOrigins = publication.AllowedOrigins.ToList(),
            FormMappings = publication.FormMappings.Select(mapping => new PublicPublicationFormMapping
            {
                FormMappingId = mapping.FormMappingId,
                FormDefinitionId = mapping.FormDefinitionId,
                Active = mapping.Active,
                SubmitMode = mapping.SubmitMode,
                FieldContractVersion = mapping.FieldContractVersion,
                FormKey = mapping.FormKey,
                SiteKey = mapping.SiteKey,
                PageSlug = mapping.PageSlug
            }).ToList(),
            TicketTtlSeconds = publication.TicketTtlSeconds
        };
        var (prepared, errors) = await PrepareDraftAsync(request, publication.CreatedBy, cancellationToken);
        if (prepared != null && !string.Equals(prepared.TenantUid, publication.TenantUid, StringComparison.Ordinal))
            return errors.Concat(new[] { "tenant_uid_mismatch" }).Distinct(StringComparer.Ordinal).ToList();
        if (!string.Equals(publication.TicketKeyId, _options.TicketKeyId, StringComparison.Ordinal))
            return errors.Concat(new[] { "ticket_key_id_mismatch" }).Distinct(StringComparer.Ordinal).ToList();
        if (!string.Equals(publication.IndexingState, "disabled", StringComparison.Ordinal))
            return errors.Concat(new[] { "indexing_state_must_be_disabled" }).Distinct(StringComparer.Ordinal).ToList();
        var expectedHosts = publication.AllowedOrigins.Select(origin => new Uri(origin).IdnHost.ToLowerInvariant())
            .Distinct(StringComparer.Ordinal).OrderBy(value => value, StringComparer.Ordinal).ToList();
        if (!expectedHosts.SequenceEqual(publication.AllowedHostnames.OrderBy(value => value, StringComparer.Ordinal), StringComparer.Ordinal))
            return errors.Concat(new[] { "allowed_hostnames_mismatch" }).Distinct(StringComparer.Ordinal).ToList();
        return errors;
    }

    public bool IsActive(PublicPublication publication)
    {
        var now = _timeProvider.GetUtcNow();
        return string.Equals(publication.Status, "active", StringComparison.Ordinal) &&
            string.Equals(publication.IndexingState, "disabled", StringComparison.Ordinal) &&
            (!publication.ActiveFromUtc.HasValue || publication.ActiveFromUtc <= now) &&
            (!publication.ActiveUntilUtc.HasValue || publication.ActiveUntilUtc > now) &&
            string.Equals(publication.Id, publication.PublicationId, StringComparison.Ordinal);
    }

    public static bool IsBoundedIdentifier(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length is < 3 or > 128) return false;
        if (!char.IsLetterOrDigit(value[0]) || !char.IsLetterOrDigit(value[^1])) return false;
        return value.All(character =>
            character is >= 'a' and <= 'z' || character is >= 'A' and <= 'Z' ||
            character is >= '0' and <= '9' || character is '-' or '_' or '.' or ':');
    }

    [GeneratedRegex("^[A-Za-z0-9](?:[A-Za-z0-9._:-]{1,126}[A-Za-z0-9])?$")]
    private static partial Regex IdentifierPattern();

    [GeneratedRegex("^[a-f0-9]{64}$")]
    private static partial Regex Sha256Pattern();
}
