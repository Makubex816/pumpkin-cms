using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.DomainBindings;

public sealed class DomainBindingListResponse
{
    [JsonPropertyName("domainBindings")]
    public List<DomainBinding> DomainBindings { get; set; } = new();

    [JsonPropertyName("count")]
    public int Count { get; set; }
}

public sealed class DomainBindingDnsPacketRequest
{
    [JsonPropertyName("inboundIpAddress")]
    public string InboundIpAddress { get; set; } = string.Empty;

    [JsonPropertyName("customDomainVerificationId")]
    public string CustomDomainVerificationId { get; set; } = string.Empty;

    [JsonPropertyName("defaultHost")]
    public string DefaultHost { get; set; } = string.Empty;
}

public sealed class DomainBindingDnsValidationResponse
{
    [JsonPropertyName("domainBinding")]
    public DomainBinding DomainBinding { get; set; } = new();

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending";

    [JsonPropertyName("allRecordsVerified")]
    public bool AllRecordsVerified { get; set; }
}
