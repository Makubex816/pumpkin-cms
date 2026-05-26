using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class CustomHtmlBlock : HtmlBlockBase
{
    public override string Type { get; set; } = "customHtml";

    [JsonPropertyName("content")]
    public override object Content { get; set; } = new CustomHtmlContent();
}

public class CustomHtmlContent
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("html")]
    public string Html { get; set; } = string.Empty;

    [JsonPropertyName("container")]
    public string Container { get; set; } = "standard";

    [JsonPropertyName("allowedProfile")]
    public string AllowedProfile { get; set; } = "marketing-basic";

    [JsonPropertyName("sectionVariant")]
    public string SectionVariant { get; set; } = string.Empty;

    [JsonPropertyName("css")]
    public string Css { get; set; } = string.Empty;

    [JsonPropertyName("sanitize")]
    public bool Sanitize { get; set; } = true;

    [JsonPropertyName("review")]
    public Dictionary<string, JsonElement> Review { get; set; } = new();

    [JsonPropertyName("validation")]
    public Dictionary<string, JsonElement> Validation { get; set; } = new();

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}
