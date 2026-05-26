using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class TrustedEmbedBlock : HtmlBlockBase
{
    public override string Type { get; set; } = "trustedEmbed";

    [JsonPropertyName("content")]
    public override object Content { get; set; } = new TrustedEmbedContent();
}

public class TrustedEmbedContent
{
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("aspectRatio")]
    public string AspectRatio { get; set; } = "16:9";

    [JsonPropertyName("caption")]
    public string Caption { get; set; } = string.Empty;

    [JsonPropertyName("container")]
    public string Container { get; set; } = "standard";

    [JsonPropertyName("review")]
    public Dictionary<string, JsonElement> Review { get; set; } = new();

    [JsonPropertyName("validation")]
    public Dictionary<string, JsonElement> Validation { get; set; } = new();

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}
