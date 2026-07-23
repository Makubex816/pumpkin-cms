using System.Text.Json;
using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.PublicForms;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicFormPreflightRequest
{
    [JsonPropertyName("clientIdempotencySeed")]
    public string ClientIdempotencySeed { get; set; } = string.Empty;
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PublicFormSubmissionRequest
{
    [JsonPropertyName("submissionId")]
    public string SubmissionId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("fieldContractVersion")]
    public string FieldContractVersion { get; set; } = string.Empty;

    [JsonPropertyName("formData")]
    public Dictionary<string, JsonElement> FormData { get; set; } = new(StringComparer.Ordinal);
}

public sealed class PublicPublicationCreateRequest
{
    [JsonPropertyName("publicationId")]
    public string PublicationId { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("releaseId")]
    public string ReleaseId { get; set; } = string.Empty;

    [JsonPropertyName("artifactSha256")]
    public string ArtifactSha256 { get; set; } = string.Empty;

    [JsonPropertyName("activeFromUtc")]
    public DateTimeOffset? ActiveFromUtc { get; set; }

    [JsonPropertyName("activeUntilUtc")]
    public DateTimeOffset? ActiveUntilUtc { get; set; }

    [JsonPropertyName("allowedOrigins")]
    public List<string> AllowedOrigins { get; set; } = new();

    [JsonPropertyName("formMappings")]
    public List<PublicPublicationFormMapping> FormMappings { get; set; } = new();

    [JsonPropertyName("ticketTtlSeconds")]
    public int TicketTtlSeconds { get; set; } = 120;
}

public sealed class PublicFormPreflightResponse
{
    [JsonPropertyName("ready")]
    public bool Ready { get; set; } = true;

    [JsonPropertyName("createsFormEntry")]
    public bool CreatesFormEntry { get; set; }

    [JsonPropertyName("ticket")]
    public string Ticket { get; set; } = string.Empty;

    [JsonPropertyName("expiresAtUtc")]
    public DateTimeOffset ExpiresAtUtc { get; set; }

    [JsonPropertyName("submissionId")]
    public string SubmissionId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("fieldContractVersion")]
    public string FieldContractVersion { get; set; } = string.Empty;
}

public sealed class PublicFormSubmitResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    [JsonPropertyName("formEntryId")]
    public string FormEntryId { get; set; } = string.Empty;

    [JsonPropertyName("submissionId")]
    public string SubmissionId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("idempotentReplay")]
    public bool IdempotentReplay { get; set; }
}

public sealed class PublicFormErrorResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("errorCode")]
    public string ErrorCode { get; set; } = string.Empty;

    [JsonPropertyName("requestId")]
    public string RequestId { get; set; } = string.Empty;

    [JsonPropertyName("correlationId")]
    public string CorrelationId { get; set; } = string.Empty;

    [JsonPropertyName("retryable")]
    public bool Retryable { get; set; }
}

public sealed record PublicFormPreparedSubmission(FormEntry Entry, string PayloadDigest, string IdempotencyIdentity);

public sealed class PublicFormPreparationResult
{
    public bool Valid => Prepared != null && Errors.Count == 0;
    public PublicFormPreparedSubmission? Prepared { get; init; }
    public List<string> Errors { get; } = new();
}

public sealed record PublicFormTicketClaims(
    string PublicationId,
    string TenantUid,
    string FormMappingId,
    string FormDefinitionId,
    string FieldContractVersion,
    string ReleaseId,
    string Origin,
    string SubmissionId,
    string CorrelationId,
    string IdempotencyIdentity,
    int TicketVersion = 1,
    long PublicationRevision = 0,
    string ArtifactId = "",
    string ArtifactSha256 = "",
    long ReplayProtectionVersion = 1);

public sealed record PublicFormIssuedTicket(string Token, DateTimeOffset ExpiresAtUtc);

public enum PublicFormTicketValidationStatus
{
    Valid,
    Invalid,
    Expired,
    ConfigurationUnavailable
}

public sealed record PublicFormTicketValidationResult(
    PublicFormTicketValidationStatus Status,
    PublicFormTicketClaims? Claims = null);

public enum PublicFormOperationStatus
{
    Ready,
    Created,
    Replay,
    InvalidRequest,
    PublicationUnavailable,
    OriginNotAllowed,
    TicketInvalid,
    TicketExpired,
    Conflict,
    ConfigurationUnavailable
}

public sealed record PublicFormOperationResult(
    PublicFormOperationStatus Status,
    PublicFormPreflightResponse? Preflight = null,
    PublicFormSubmitResponse? Submit = null,
    string CorrelationId = "");
