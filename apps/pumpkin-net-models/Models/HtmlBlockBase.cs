using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

// Base abstract class for common properties
public abstract class HtmlBlockBase : IHtmlBlock
{
    [JsonPropertyName("type")]
    public virtual string Type { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public abstract object Content { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}

/// <summary>
/// Generic HTML block for unknown or custom block types
/// </summary>
public class GenericHtmlBlock : HtmlBlockBase
{
    [JsonPropertyName("content")]
    public override object Content { get; set; } = new Dictionary<string, object>();
}
