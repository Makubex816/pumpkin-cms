using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

/// <summary>
/// Represents a form submission entry stored in the FormEntry container
/// </summary>
public class FormEntry
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("submissionId")]
    public string SubmissionId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("idempotencyKey")]
    public string IdempotencyKey { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("siteKey")]
    public string SiteKey { get; set; } = string.Empty;

    [JsonPropertyName("formId")]
    public string FormId { get; set; } = string.Empty;

    [JsonPropertyName("formKey")]
    public string FormKey { get; set; } = string.Empty;

    [JsonPropertyName("pageSlug")]
    public string PageSlug { get; set; } = string.Empty;

    [JsonPropertyName("sourcePage")]
    public string SourcePage { get; set; } = string.Empty;

    [JsonPropertyName("leadType")]
    public string LeadType { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "new";

    [JsonPropertyName("spamStatus")]
    public string SpamStatus { get; set; } = "clean";

    [JsonPropertyName("consentAccepted")]
    public bool ConsentAccepted { get; set; } = false;

    [JsonPropertyName("honeypotFilled")]
    public bool HoneypotFilled { get; set; } = false;

    [JsonPropertyName("formData")]
    public Dictionary<string, object> FormData { get; set; } = new();

    [JsonPropertyName("submittedAt")]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("ipAddress")]
    public string IpAddress { get; set; } = string.Empty;

    [JsonPropertyName("userAgent")]
    public string UserAgent { get; set; } = string.Empty;

    [JsonPropertyName("metadata")]
    public FormEntryMetadata Metadata { get; set; } = new();
}

public class FormEntryMetadata
{
    [JsonPropertyName("submissionId")]
    public string SubmissionId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("idempotentReplay")]
    public bool IdempotentReplay { get; set; }
    [JsonPropertyName("source")]
    public string Source { get; set; } = string.Empty;

    [JsonPropertyName("referrer")]
    public string Referrer { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "new";

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = new();

    [JsonPropertyName("spamStatus")]
    public string SpamStatus { get; set; } = "clean";

    [JsonPropertyName("consentAccepted")]
    public bool ConsentAccepted { get; set; } = false;

    [JsonPropertyName("leadRecipientRef")]
    public string LeadRecipientRef { get; set; } = string.Empty;

    [JsonPropertyName("staticEndpointRef")]
    public string StaticEndpointRef { get; set; } = string.Empty;
}

public class FormEntryStatusUpdate
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }
}
