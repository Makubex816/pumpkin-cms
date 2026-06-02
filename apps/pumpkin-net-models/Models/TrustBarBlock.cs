using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

// Trust Bar Block
public class TrustBarBlock : HtmlBlockBase
{
    public override string Type { get; set; } = "TrustBar";

    [JsonPropertyName("content")]
    public override object Content { get; set; } = new TrustBarContent();
}

public class TrustBarContent
{
    [JsonPropertyName("sectionVariant")]
    public string SectionVariant { get; set; } = string.Empty;

    [JsonPropertyName("variant")]
    public string Variant { get; set; } = string.Empty;

    [JsonPropertyName("items")]
    public List<TrustBarItem> Items { get; set; } = new();

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}

public class TrustBarItem
{
    [JsonPropertyName("icon")]
    public string Icon { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("alt")]
    public string Alt { get; set; } = string.Empty;

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}
