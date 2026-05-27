using System.Text.Json;
using System.Text.RegularExpressions;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public record FormSubmissionIssue(string Severity, string Code, string Message, string Path);

public class FormSubmissionGuardResult
{
    public bool Ok => Errors.Count == 0;
    public List<FormSubmissionIssue> Errors { get; } = new();
    public List<FormSubmissionIssue> Warnings { get; } = new();
}

public static class FormSubmissionGuard
{
    private const int MaxPayloadBytes = 20000;
    private const int MaxFieldLength = 4000;
    private static readonly Regex EmailPattern = new("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", RegexOptions.Compiled);

    private static readonly Dictionary<string, HashSet<string>> AllowedFields = new(StringComparer.Ordinal)
    {
        ["default-contact"] = new(StringComparer.Ordinal)
        {
            "fullName", "name", "email", "phone", "subject", "message", "consent", "honeypot", "sourcePage", "tenantId", "siteKey", "formKey"
        },
        ["default-quote-request"] = new(StringComparer.Ordinal)
        {
            "fullName", "name", "email", "phone", "eventCity", "eventState", "eventDateOrDateRange", "eventDate", "eventLocation", "eventType", "venueType", "estimatedAttendance", "expectedAttendance", "venueSetting", "surfaceDetails", "message", "consent", "honeypot", "sourcePage", "tenantId", "siteKey", "formKey"
        }
    };

    private static readonly Dictionary<string, string[]> RequiredFields = new(StringComparer.Ordinal)
    {
        ["default-contact"] = new[] { "fullName", "email", "message", "consent" },
        ["default-quote-request"] = new[] { "fullName", "email", "phone", "eventCity", "eventState", "eventDateOrDateRange", "eventType", "venueSetting", "message", "consent" }
    };

    public static FormSubmissionGuardResult Sanitize(FormEntry entry)
    {
        var result = new FormSubmissionGuardResult();
        entry.FormKey = NormalizeFormKey(FirstNonEmpty(entry.FormKey, GetDataValue(entry, "formKey"), entry.FormId, "default-contact"));
        entry.FormId = FirstNonEmpty(entry.FormId, entry.FormKey);
        entry.SiteKey = FirstNonEmpty(entry.SiteKey, GetDataValue(entry, "siteKey"), entry.TenantId);
        entry.SourcePage = FirstNonEmpty(entry.SourcePage, GetDataValue(entry, "sourcePage"), entry.PageSlug);
        entry.PageSlug = FirstNonEmpty(entry.PageSlug, entry.SourcePage, "contact");
        entry.LeadType = entry.FormKey == "default-quote-request" ? "quote-request" : "contact";
        entry.Status = "new";
        entry.Metadata ??= new FormEntryMetadata();

        var serialized = JsonSerializer.Serialize(entry.FormData ?? new Dictionary<string, object>());
        if (serialized.Length > MaxPayloadBytes)
        {
            Error(result, "submission.size", "Form submission exceeds the configured payload size.", "formData");
            return result;
        }

        if (!AllowedFields.TryGetValue(entry.FormKey, out var allowed))
        {
            Error(result, "submission.formKey", $"Unsupported formKey \"{entry.FormKey}\".", "formKey");
            return result;
        }

        var sanitized = new Dictionary<string, object>(StringComparer.Ordinal);
        foreach (var item in entry.FormData ?? new Dictionary<string, object>())
        {
            if (!allowed.Contains(item.Key))
            {
                Warn(result, "submission.unknownField", $"Unknown field \"{item.Key}\" was ignored.", $"formData.{item.Key}");
                continue;
            }

            sanitized[item.Key] = SanitizeString(item.Value, MaxFieldLength);
        }

        ApplyFieldAliases(sanitized);

        foreach (var fieldName in RequiredFields[entry.FormKey])
        {
            if (!sanitized.TryGetValue(fieldName, out var value) || string.IsNullOrWhiteSpace(Convert.ToString(value)))
            {
                Error(result, "submission.required", $"{fieldName} is required.", $"formData.{fieldName}");
            }
        }

        var email = sanitized.TryGetValue("email", out var emailValue) ? Convert.ToString(emailValue) ?? string.Empty : string.Empty;
        if (!string.IsNullOrWhiteSpace(email) && !EmailPattern.IsMatch(email))
        {
            Error(result, "submission.email", "Email must be valid.", "formData.email");
        }

        var honeypot = sanitized.TryGetValue("honeypot", out var honeypotValue)
            ? Convert.ToString(honeypotValue) ?? string.Empty
            : string.Empty;
        entry.HoneypotFilled = !string.IsNullOrWhiteSpace(honeypot);
        entry.SpamStatus = entry.HoneypotFilled ? "suspected-spam" : "clean";
        entry.ConsentAccepted = sanitized.TryGetValue("consent", out var consentValue) && IsTruthy(Convert.ToString(consentValue));
        if (!entry.ConsentAccepted)
        {
            Error(result, "submission.consent", "Consent is required.", "formData.consent");
        }
        entry.Status = entry.SpamStatus == "suspected-spam" ? "suspected-spam" : "new";
        entry.FormData = sanitized;

        entry.Metadata.Status = entry.Status;
        entry.Metadata.SpamStatus = entry.SpamStatus;
        entry.Metadata.ConsentAccepted = entry.ConsentAccepted;
        entry.Metadata.Tags = entry.Metadata.Tags
            .Concat(new[] { entry.SiteKey, entry.PageSlug, entry.FormKey, entry.SpamStatus })
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        return result;
    }

    private static string GetDataValue(FormEntry entry, string key)
    {
        if (entry.FormData == null || !entry.FormData.TryGetValue(key, out var value)) return string.Empty;
        return Convert.ToString(value) ?? string.Empty;
    }

    private static string FirstNonEmpty(params string[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim() ?? string.Empty;
    }

    private static string NormalizeFormKey(string value)
    {
        return value switch
        {
            "contact" => "default-contact",
            "ice-contact-quote-request" => "default-quote-request",
            _ => value
        };
    }

    private static void ApplyFieldAliases(Dictionary<string, object> data)
    {
        CopyAlias(data, "name", "fullName");
        CopyAlias(data, "eventDate", "eventDateOrDateRange");
        CopyAlias(data, "expectedAttendance", "estimatedAttendance");
        CopyAlias(data, "venueType", "venueSetting");
        if (data.TryGetValue("eventLocation", out var eventLocation) && !data.ContainsKey("eventCity"))
        {
            data["eventCity"] = Convert.ToString(eventLocation) ?? string.Empty;
        }
    }

    private static void CopyAlias(Dictionary<string, object> data, string from, string to)
    {
        if (data.ContainsKey(to) || !data.TryGetValue(from, out var value)) return;
        data[to] = value;
    }

    private static string SanitizeString(object? value, int maxLength)
    {
        var raw = value switch
        {
            null => string.Empty,
            JsonElement element => JsonElementToString(element),
            _ => Convert.ToString(value) ?? string.Empty
        };

        var sanitized = Regex.Replace(raw, "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", string.Empty).Trim();
        return sanitized.Length <= maxLength ? sanitized : sanitized[..maxLength];
    }

    private static string JsonElementToString(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? string.Empty,
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Number => element.ToString(),
            _ => element.ToString()
        };
    }

    private static bool IsTruthy(string? value)
    {
        return string.Equals(value, "true", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(value, "on", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(value, "yes", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(value, "1", StringComparison.OrdinalIgnoreCase);
    }

    private static void Error(FormSubmissionGuardResult result, string code, string message, string path)
    {
        result.Errors.Add(new FormSubmissionIssue("error", code, message, path));
    }

    private static void Warn(FormSubmissionGuardResult result, string code, string message, string path)
    {
        result.Warnings.Add(new FormSubmissionIssue("warning", code, message, path));
    }
}
