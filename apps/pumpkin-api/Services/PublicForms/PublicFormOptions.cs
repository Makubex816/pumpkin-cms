namespace pumpkin_api.Services.PublicForms;

public sealed class PublicFormOptions
{
    public const string SectionName = "PublicForms";

    public string TicketSigningKeyBase64 { get; set; } = string.Empty;
    public string TicketKeyId { get; set; } = string.Empty;
    public string TicketIssuer { get; set; } = "pumpkin-public-forms";
    public string TicketAudience { get; set; } = "pumpkin-public-form-submit";
    public int TicketTtlSeconds { get; set; } = 120;
    public int MinimumTicketTtlSeconds { get; set; } = 60;
    public int MaximumTicketTtlSeconds { get; set; } = 300;
    public int MaximumRequestBytes { get; set; } = 24 * 1024;
    public int MaximumPayloadBytes { get; set; } = 20_000;
    public int MaximumFieldCount { get; set; } = 64;
    public int MaximumFieldKeyBytes { get; set; } = 128;
    public int MaximumFieldLength { get; set; } = 4_000;
    public int MaximumPublicationOrigins { get; set; } = 16;
    public int MaximumPublicationMappings { get; set; } = 32;
    public int PreflightTimeoutSeconds { get; set; } = 5;
    public int SubmitTimeoutSeconds { get; set; } = 10;
    public bool AllowHttpLocalhost { get; set; }

    public int BoundTicketTtl(int requestedSeconds)
    {
        var configured = requestedSeconds > 0 ? requestedSeconds : TicketTtlSeconds;
        return Math.Clamp(configured, MinimumTicketTtlSeconds, MaximumTicketTtlSeconds);
    }
}
