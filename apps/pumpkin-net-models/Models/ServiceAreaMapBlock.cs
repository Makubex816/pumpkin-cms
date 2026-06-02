using System.Text.Json;
using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

// Service Area Map Block
public class ServiceAreaMapBlock : HtmlBlockBase
{
    public override string Type { get; set; } = "ServiceAreaMap";

    [JsonPropertyName("content")]
    public override object Content { get; set; } = new ServiceAreaMapContent();
}

public class ServiceAreaMapContent
{
    [JsonPropertyName("sectionVariant")]
    public string SectionVariant { get; set; } = string.Empty;

    [JsonPropertyName("variant")]
    public string Variant { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("subtitle")]
    public string Subtitle { get; set; } = string.Empty;

    [JsonPropertyName("mapEmbedUrl")]
    public string MapEmbedUrl { get; set; } = string.Empty;

    [JsonPropertyName("neighborhoods")]
    public List<string> Neighborhoods { get; set; } = new();

    [JsonPropertyName("zipCodes")]
    public List<string> ZipCodes { get; set; } = new();

    [JsonPropertyName("nearbyCities")]
    public List<string> NearbyCities { get; set; } = new();

    [JsonExtensionData]
    public Dictionary<string, JsonElement> ExtensionData { get; set; } = new();
}
