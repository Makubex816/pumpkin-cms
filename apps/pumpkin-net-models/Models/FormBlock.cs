using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class FormBlock : HtmlBlockBase
{
    public override string Type { get; set; } = "formBlock";

    [JsonPropertyName("content")]
    public override object Content { get; set; } = new FormBlockContent();
}

public class FormBlockContent
{
    [JsonPropertyName("sectionVariant")]
    public string SectionVariant { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("formKey")]
    public string FormKey { get; set; } = string.Empty;

    [JsonPropertyName("variant")]
    public string Variant { get; set; } = "quote-form-panel";

    [JsonPropertyName("heading")]
    public string Heading { get; set; } = string.Empty;

    [JsonPropertyName("intro")]
    public string Intro { get; set; } = string.Empty;

    [JsonPropertyName("submitLabel")]
    public string SubmitLabel { get; set; } = string.Empty;

    [JsonPropertyName("successMessage")]
    public string SuccessMessage { get; set; } = string.Empty;

    [JsonPropertyName("errorMessage")]
    public string ErrorMessage { get; set; } = string.Empty;

    [JsonPropertyName("staticEndpointRef")]
    public string StaticEndpointRef { get; set; } = string.Empty;

    [JsonPropertyName("leadRecipientRef")]
    public string LeadRecipientRef { get; set; } = string.Empty;

    [JsonPropertyName("sourcePage")]
    public string SourcePage { get; set; } = string.Empty;

    [JsonPropertyName("selectedMailboxMetadata")]
    public string SelectedMailboxMetadata { get; set; } = string.Empty;

    [JsonPropertyName("emailSendingEnabled")]
    public bool? EmailSendingEnabled { get; set; }

    [JsonPropertyName("review")]
    public Dictionary<string, object> Review { get; set; } = new();

    [JsonPropertyName("validation")]
    public Dictionary<string, object> Validation { get; set; } = new();

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}
