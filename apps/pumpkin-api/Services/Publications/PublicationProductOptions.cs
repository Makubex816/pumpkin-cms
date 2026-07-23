namespace pumpkin_api.Services.Publications;

public sealed class PublicationProductOptions
{
    public const string SectionName = "PublicationProduct";

    /// <summary>
    /// Master fail-closed gate. Read and write endpoints return 503 while false.
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// Customer execution is intentionally disabled by default. When false,
    /// registry mutations are limited to explicitly allowlisted synthetic tenants.
    /// </summary>
    public bool CustomerExecutionEnabled { get; set; }

    public List<string> SyntheticTenantAllowlist { get; set; } = new();
    public int DefaultPageSize { get; set; } = 25;
    public int MaximumPageSize { get; set; } = 100;
    public int MaximumReleasesPerPublication { get; set; } = 100;
    public int MaximumArtifactsPerPublication { get; set; } = 100;
    public int MaximumJobsPerPublication { get; set; } = 100;
    public int MaximumAuditEventsPerPublication { get; set; } = 256;
    public List<PublicationCredentialReferenceMetadata> CredentialReferences { get; set; } = new();
}
