using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public class DomainBinding
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("domain")]
    public string Domain { get; set; } = string.Empty;

    [JsonPropertyName("wwwDomain")]
    public string WwwDomain { get; set; } = string.Empty;

    [JsonPropertyName("canonical")]
    public bool Canonical { get; set; } = false;

    [JsonPropertyName("provider")]
    public string Provider { get; set; } = "manual";

    [JsonPropertyName("hostingTarget")]
    public DomainBindingHostingTarget HostingTarget { get; set; } = new();

    [JsonPropertyName("dnsRecords")]
    public List<DomainBindingDnsRecord> DnsRecords { get; set; } = new();

    [JsonPropertyName("dnsValidationStatus")]
    public string DnsValidationStatus { get; set; } = "pending";

    [JsonPropertyName("azureHostnameStatus")]
    public string AzureHostnameStatus { get; set; } = "not_started";

    [JsonPropertyName("tlsStatus")]
    public string TlsStatus { get; set; } = "not_started";

    [JsonPropertyName("runtimeStatus")]
    public string RuntimeStatus { get; set; } = "not_started";

    [JsonPropertyName("promotionStatus")]
    public string PromotionStatus { get; set; } = "not_promoted";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "draft";

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("createdBy")]
    public string CreatedBy { get; set; } = string.Empty;

    [JsonPropertyName("updatedBy")]
    public string UpdatedBy { get; set; } = string.Empty;

    [JsonPropertyName("auditEvents")]
    public List<DomainBindingAuditEvent> AuditEvents { get; set; } = new();
}

public class DomainBindingHostingTarget
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "azure-app-service";

    [JsonPropertyName("resourceGroup")]
    public string ResourceGroup { get; set; } = string.Empty;

    [JsonPropertyName("appName")]
    public string AppName { get; set; } = string.Empty;

    [JsonPropertyName("defaultHost")]
    public string DefaultHost { get; set; } = string.Empty;

    [JsonPropertyName("defaultHostUrl")]
    public string DefaultHostUrl { get; set; } = string.Empty;

    [JsonPropertyName("inboundIpAddress")]
    public string InboundIpAddress { get; set; } = string.Empty;

    [JsonPropertyName("customDomainVerificationId")]
    public string CustomDomainVerificationId { get; set; } = string.Empty;
}

public class DomainBindingDnsRecord
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("host")]
    public string Host { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("purpose")]
    public string Purpose { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "pending";

    [JsonPropertyName("observedValues")]
    public List<string> ObservedValues { get; set; } = new();

    [JsonPropertyName("lastCheckedAt")]
    public DateTime? LastCheckedAt { get; set; }
}

public class DomainBindingAuditEvent
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("at")]
    public DateTime At { get; set; } = DateTime.UtcNow;

    [JsonPropertyName("actor")]
    public string Actor { get; set; } = string.Empty;

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("fromStatus")]
    public string FromStatus { get; set; } = string.Empty;

    [JsonPropertyName("toStatus")]
    public string ToStatus { get; set; } = string.Empty;

    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;
}
