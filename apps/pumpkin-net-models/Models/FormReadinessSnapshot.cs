using System.Text.Json.Serialization;

namespace pumpkin_net_models.Models;

public sealed class FormReadinessSnapshot
{
    [JsonPropertyName("tenantId")] public string TenantId { get; set; } = string.Empty;
    [JsonPropertyName("checkedAtUtc")] public DateTime CheckedAtUtc { get; set; } = DateTime.UtcNow;
    [JsonPropertyName("definitionCount")] public int DefinitionCount { get; set; }
    [JsonPropertyName("activeDefinitionCount")] public int ActiveDefinitionCount { get; set; }
    [JsonPropertyName("instanceCount")] public int InstanceCount { get; set; }
    [JsonPropertyName("mappedInstanceCount")] public int MappedInstanceCount { get; set; }
    [JsonPropertyName("unresolvedInstanceCount")] public int UnresolvedInstanceCount { get; set; }
    [JsonPropertyName("noWritePreflightPassed")] public bool NoWritePreflightPassed { get; set; }
    [JsonPropertyName("terminalResponseProofPassed")] public bool TerminalResponseProofPassed { get; set; }
    [JsonPropertyName("runtimeKeyProvisioned")] public bool RuntimeKeyProvisioned { get; set; }
    [JsonPropertyName("runtimeKeyTenantScoped")] public bool RuntimeKeyTenantScoped { get; set; }
    [JsonPropertyName("controlledSubmissionPassed")] public bool ControlledSubmissionPassed { get; set; }
    [JsonPropertyName("proofFormEntryId")] public string ProofFormEntryId { get; set; } = string.Empty;
    [JsonPropertyName("submissionId")] public string SubmissionId { get; set; } = string.Empty;
    [JsonPropertyName("correlationId")] public string CorrelationId { get; set; } = string.Empty;
    [JsonPropertyName("tenantAdminReadbackPassed")] public bool TenantAdminReadbackPassed { get; set; }
    [JsonPropertyName("superAdminReadbackPassed")] public bool SuperAdminReadbackPassed { get; set; }
    [JsonPropertyName("crossTenantIsolationPassed")] public bool CrossTenantIsolationPassed { get; set; }
    [JsonPropertyName("previewNoPostPassed")] public bool PreviewNoPostPassed { get; set; }
    [JsonPropertyName("notificationRecipientConfigured")] public bool NotificationRecipientConfigured { get; set; }
    [JsonPropertyName("externalEmailDeliveryStatus")] public string ExternalEmailDeliveryStatus { get; set; } = "not_implemented";
    [JsonPropertyName("publicFormMode")] public string PublicFormMode { get; set; } = "no-post";
    [JsonPropertyName("overallStatus")] public string OverallStatus { get; set; } = "forms_held_no_post";
    [JsonPropertyName("blockers")] public List<string> Blockers { get; set; } = new();
}
