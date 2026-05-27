using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class FormDefinition
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("siteKey")]
    public string SiteKey { get; set; } = string.Empty;

    [JsonPropertyName("formKey")]
    public string FormKey { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "active";

    [JsonPropertyName("formType")]
    public string FormType { get; set; } = "contact";

    [JsonPropertyName("version")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("submitAction")]
    public string SubmitAction { get; set; } = "form-entry";

    [JsonPropertyName("runtimeSubmitPath")]
    public string RuntimeSubmitPath { get; set; } = "/api/contact";

    [JsonPropertyName("staticEndpointRef")]
    public string StaticEndpointRef { get; set; } = string.Empty;

    [JsonPropertyName("leadRecipientRef")]
    public string LeadRecipientRef { get; set; } = string.Empty;

    [JsonPropertyName("notificationEmailRef")]
    public string NotificationEmailRef { get; set; } = string.Empty;

    [JsonPropertyName("successMessage")]
    public string SuccessMessage { get; set; } = string.Empty;

    [JsonPropertyName("errorMessage")]
    public string ErrorMessage { get; set; } = string.Empty;

    [JsonPropertyName("spamProtection")]
    public FormSpamProtection SpamProtection { get; set; } = new();

    [JsonPropertyName("consent")]
    public FormConsent Consent { get; set; } = new();

    [JsonPropertyName("fields")]
    public List<FormDefinitionField> Fields { get; set; } = new();

    [JsonPropertyName("hiddenFields")]
    public List<FormDefinitionField> HiddenFields { get; set; } = new();

    [JsonPropertyName("validationRules")]
    public Dictionary<string, object> ValidationRules { get; set; } = new();

    [JsonPropertyName("routing")]
    public FormRouting Routing { get; set; } = new();

    [JsonPropertyName("createdAt")]
    public string CreatedAt { get; set; } = string.Empty;

    [JsonPropertyName("updatedAt")]
    public string UpdatedAt { get; set; } = string.Empty;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("updatedBy")]
    public string UpdatedBy { get; set; } = string.Empty;

    [JsonPropertyName("archivedAt")]
    public string ArchivedAt { get; set; } = string.Empty;

    [JsonPropertyName("archivedBy")]
    public string ArchivedBy { get; set; } = string.Empty;

    [JsonPropertyName("systemDefault")]
    public bool SystemDefault { get; set; } = false;
}

public class FormDefinitionField
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = "text";

    [JsonPropertyName("required")]
    public bool Required { get; set; } = false;

    [JsonPropertyName("placeholder")]
    public string Placeholder { get; set; } = string.Empty;

    [JsonPropertyName("helpText")]
    public string HelpText { get; set; } = string.Empty;

    [JsonPropertyName("autocomplete")]
    public string Autocomplete { get; set; } = string.Empty;

    [JsonPropertyName("options")]
    public List<string> Options { get; set; } = new();

    [JsonPropertyName("defaultValue")]
    public string DefaultValue { get; set; } = string.Empty;

    [JsonPropertyName("hidden")]
    public bool Hidden { get; set; } = false;

    [JsonPropertyName("validation")]
    public Dictionary<string, object> Validation { get; set; } = new();

    [JsonPropertyName("order")]
    public int Order { get; set; } = 0;

    [JsonPropertyName("width")]
    public string Width { get; set; } = "half";

    [JsonPropertyName("sensitive")]
    public bool Sensitive { get; set; } = false;

    [JsonPropertyName("includeInLeadSummary")]
    public bool IncludeInLeadSummary { get; set; } = false;
}

public class FormSpamProtection
{
    [JsonPropertyName("honeypotFieldName")]
    public string HoneypotFieldName { get; set; } = "honeypot";

    [JsonPropertyName("minMessageLength")]
    public int MinMessageLength { get; set; } = 0;

    [JsonPropertyName("maxPayloadBytes")]
    public int MaxPayloadBytes { get; set; } = 20000;

    [JsonPropertyName("maxFieldLength")]
    public int MaxFieldLength { get; set; } = 4000;
}

public class FormConsent
{
    [JsonPropertyName("required")]
    public bool Required { get; set; } = true;

    [JsonPropertyName("fieldName")]
    public string FieldName { get; set; } = "consent";

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

public class FormRouting
{
    [JsonPropertyName("leadType")]
    public string LeadType { get; set; } = "contact";

    [JsonPropertyName("routingMode")]
    public string RoutingMode { get; set; } = "manual_review_then_provider_match";

    [JsonPropertyName("recipientGroupRef")]
    public string RecipientGroupRef { get; set; } = string.Empty;
}
