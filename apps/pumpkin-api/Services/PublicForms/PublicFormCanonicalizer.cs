using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.PublicForms;

public sealed class PublicFormCanonicalizer
{
    private readonly PublicFormOptions _options;

    public PublicFormCanonicalizer(IOptions<PublicFormOptions> options)
    {
        _options = options.Value;
    }

    public PublicFormPreparationResult Prepare(
        PublicPublication publication,
        PublicPublicationFormMapping mapping,
        FormDefinition definition,
        PublicFormSubmissionRequest request)
    {
        var result = new PublicFormPreparationResult();
        if (!string.Equals(request.FieldContractVersion, mapping.FieldContractVersion, StringComparison.Ordinal))
            result.Errors.Add("field_contract_version_mismatch");
        if (!TryCanonicalGuid(request.SubmissionId, out var submissionId))
            result.Errors.Add("submission_id_invalid");
        if (!TryCanonicalGuid(request.CorrelationId, out var correlationId))
            result.Errors.Add("correlation_id_invalid");
        if (request.FormData == null || request.FormData.Count == 0)
            result.Errors.Add("form_data_required");
        if (request.FormData?.Count > _options.MaximumFieldCount)
            result.Errors.Add("field_count_exceeded");
        if (result.Errors.Count > 0)
            return result;

        var identities = BuildAllowedFieldIdentities(definition, result.Errors);
        if (result.Errors.Count > 0)
            return result;

        var data = new Dictionary<string, object>(StringComparer.Ordinal);
        foreach (var (rawKey, element) in request.FormData!)
        {
            if (string.IsNullOrWhiteSpace(rawKey) || Encoding.UTF8.GetByteCount(rawKey) > _options.MaximumFieldKeyBytes)
            {
                result.Errors.Add("field_key_invalid");
                continue;
            }

            var fieldIdentity = NormalizeFieldIdentity(rawKey);
            if (!identities.TryGetValue(fieldIdentity, out var canonicalKey))
            {
                result.Errors.Add("unknown_field");
                continue;
            }
            if (data.ContainsKey(canonicalKey))
            {
                result.Errors.Add("duplicate_field_identity");
                continue;
            }

            if (!TryNormalizeScalar(element, out var normalized) || normalized.Length > _options.MaximumFieldLength)
            {
                result.Errors.Add("field_value_invalid");
                continue;
            }
            if (!MatchesDeclaredFieldContract(definition, canonicalKey, element, normalized))
            {
                result.Errors.Add("field_type_invalid");
                continue;
            }
            data[canonicalKey] = normalized;
        }
        if (result.Errors.Count > 0)
            return result;

        var entry = new FormEntry
        {
            SubmissionId = submissionId,
            CorrelationId = correlationId,
            IdempotencyKey = submissionId,
            PublicationId = publication.PublicationId,
            ReleaseId = publication.ReleaseId,
            FormMappingId = mapping.FormMappingId,
            FieldContractVersion = mapping.FieldContractVersion,
            TenantId = publication.TenantId,
            TenantUid = publication.TenantUid,
            SiteKey = mapping.SiteKey,
            FormId = definition.Id,
            FormKey = mapping.FormKey,
            PageSlug = mapping.PageSlug,
            SourcePage = mapping.PageSlug,
            FormData = data,
            Metadata = new FormEntryMetadata
            {
                SubmissionId = submissionId,
                CorrelationId = correlationId,
                Source = "public-publication"
            }
        };

        var guard = FormSubmissionGuard.SanitizeDynamic(entry, definition);
        if (!guard.Ok)
        {
            result.Errors.AddRange(guard.Errors.Select(issue => issue.Code).Distinct(StringComparer.Ordinal));
            return result;
        }
        if (entry.HoneypotFilled)
        {
            result.Errors.Add("honeypot_rejected");
            return result;
        }

        var maxPayloadBytes = Math.Min(
            _options.MaximumPayloadBytes,
            definition.SpamProtection?.MaxPayloadBytes > 0
                ? definition.SpamProtection.MaxPayloadBytes
                : _options.MaximumPayloadBytes);
        if (CanonicalFormDataSize(entry.FormData) > maxPayloadBytes)
        {
            result.Errors.Add("payload_size_exceeded");
            return result;
        }

        if (definition.SpamProtection?.MinMessageLength > 0)
        {
            var message = entry.FormData.FirstOrDefault(item =>
                NormalizeFieldIdentity(item.Key) == "message").Value?.ToString() ?? string.Empty;
            if (message.Length < definition.SpamProtection.MinMessageLength)
            {
                result.Errors.Add("message_too_short");
                return result;
            }
        }

        var publicIdentity = ComputeIdempotencyIdentity(
            publication.TenantUid, publication.PublicationId, mapping.FormMappingId, submissionId);
        entry.Id = ComputeStorageId(publication.TenantUid, submissionId);
        entry.PublicIdempotencyIdentity = publicIdentity;
        var digest = ComputePayloadDigest(entry);
        entry.PublicPayloadDigest = digest;
        return new PublicFormPreparationResult
        {
            Prepared = new PublicFormPreparedSubmission(entry, digest, publicIdentity)
        };
    }

    public static string ComputePayloadDigest(FormEntry entry)
    {
        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream, new JsonWriterOptions
        {
            Encoder = JavaScriptEncoder.Default,
            Indented = false
        }))
        {
            writer.WriteStartObject();
            writer.WriteString("tenantId", entry.TenantId);
            writer.WriteString("tenantUid", entry.TenantUid);
            writer.WriteString("publicationId", entry.PublicationId);
            writer.WriteString("releaseId", entry.ReleaseId);
            writer.WriteString("formMappingId", entry.FormMappingId);
            writer.WriteString("formDefinitionId", entry.FormId);
            writer.WriteString("submissionId", entry.SubmissionId);
            writer.WriteString("publicIdempotencyIdentity", entry.PublicIdempotencyIdentity);
            writer.WritePropertyName("formData");
            writer.WriteStartObject();
            foreach (var item in entry.FormData.OrderBy(item => item.Key, StringComparer.Ordinal))
                writer.WriteString(item.Key, Convert.ToString(item.Value, System.Globalization.CultureInfo.InvariantCulture) ?? string.Empty);
            writer.WriteEndObject();
            writer.WriteEndObject();
        }
        return Convert.ToHexStringLower(SHA256.HashData(stream.ToArray()));
    }

    public static string ComputeIdempotencyIdentity(
        string tenantId,
        string publicationId,
        string formMappingId,
        string submissionId) =>
        ComputeHexDigest(string.Join('\n', new[] { tenantId, publicationId, formMappingId, submissionId }));

    public static string ComputeStorageId(string tenantUid, string submissionId) =>
        ComputeHexDigest(string.Join('\n', new[] { tenantUid, submissionId }));

    public static bool FixedTimeDigestEquals(string left, string right)
    {
        try
        {
            return CryptographicOperations.FixedTimeEquals(Convert.FromHexString(left), Convert.FromHexString(right));
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private int CanonicalFormDataSize(Dictionary<string, object> data) =>
        Encoding.UTF8.GetByteCount(JsonSerializer.Serialize(
            data.OrderBy(item => item.Key, StringComparer.Ordinal)
                .ToDictionary(item => item.Key, item => item.Value, StringComparer.Ordinal)));

    private static Dictionary<string, string> BuildAllowedFieldIdentities(FormDefinition definition, List<string> errors)
    {
        var allowed = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var field in (definition.Fields ?? new()).Concat(definition.HiddenFields ?? new()))
        {
            var canonical = !string.IsNullOrWhiteSpace(field.Name) ? field.Name.Trim() : field.Id.Trim();
            foreach (var candidate in new[] { field.Name, field.Id }.Where(value => !string.IsNullOrWhiteSpace(value)))
                AddIdentity(allowed, candidate, canonical, errors);
        }

        var honeypot = definition.SpamProtection?.HoneypotFieldName ?? "honeypot";
        var consent = definition.Consent?.FieldName ?? "consent";
        AddIdentity(allowed, honeypot, honeypot, errors);
        AddIdentity(allowed, consent, consent, errors);
        return allowed;
    }

    private static void AddIdentity(Dictionary<string, string> allowed, string candidate, string canonical, List<string> errors)
    {
        var identity = NormalizeFieldIdentity(candidate);
        if (string.IsNullOrEmpty(identity))
        {
            errors.Add("form_definition_field_invalid");
            return;
        }
        if (allowed.TryGetValue(identity, out var existing) && !string.Equals(existing, canonical, StringComparison.Ordinal))
            errors.Add("form_definition_field_ambiguous");
        else
            allowed[identity] = canonical;
    }

    private static bool TryNormalizeScalar(JsonElement element, out string value)
    {
        value = element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? string.Empty,
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Number => element.GetRawText(),
            _ => string.Empty
        };
        return element.ValueKind is JsonValueKind.String or JsonValueKind.True or JsonValueKind.False or JsonValueKind.Number;
    }

    private static bool MatchesDeclaredFieldContract(
        FormDefinition definition,
        string canonicalKey,
        JsonElement element,
        string normalized)
    {
        var identity = NormalizeFieldIdentity(canonicalKey);
        var field = (definition.Fields ?? new()).Concat(definition.HiddenFields ?? new())
            .FirstOrDefault(candidate =>
                NormalizeFieldIdentity(candidate.Name) == identity ||
                NormalizeFieldIdentity(candidate.Id) == identity);
        if (field == null)
            return true; // Consent and honeypot are declared outside the field collection.

        var type = field.Type.Trim().ToLowerInvariant();
        var typeMatches = type switch
        {
            "checkbox" => element.ValueKind is JsonValueKind.True or JsonValueKind.False ||
                element.ValueKind == JsonValueKind.String && new[] { "true", "false", "on", "off", "yes", "no", "1", "0" }
                    .Contains(normalized, StringComparer.OrdinalIgnoreCase),
            "number" or "range" => element.ValueKind == JsonValueKind.Number ||
                element.ValueKind == JsonValueKind.String && decimal.TryParse(
                    normalized,
                    System.Globalization.NumberStyles.Number,
                    System.Globalization.CultureInfo.InvariantCulture,
                    out _),
            "text" or "textarea" or "email" or "tel" or "url" or "date" or "time" or
                "datetime-local" or "month" or "week" or "select" or "radio" or "hidden" =>
                element.ValueKind == JsonValueKind.String,
            _ => false
        };
        if (!typeMatches)
            return false;
        return field.Options == null || field.Options.Count == 0 ||
            type is not ("select" or "radio") ||
            field.Options.Contains(normalized, StringComparer.Ordinal);
    }

    public static bool TryCanonicalGuid(string value, out string canonical)
    {
        canonical = string.Empty;
        if (!Guid.TryParseExact(value, "D", out var parsed) || parsed == Guid.Empty)
            return false;
        canonical = parsed.ToString("D");
        return string.Equals(value, canonical, StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeFieldIdentity(string value) => new(value
        .Where(char.IsLetterOrDigit)
        .Select(char.ToLowerInvariant)
        .ToArray());

    private static string ComputeHexDigest(string value) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}
