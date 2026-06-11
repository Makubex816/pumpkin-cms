namespace pumpkin_api.Services;

public interface IOutboundLinkReadOnlyProvider
{
    Task<OutboundLinkStoreSnapshot?> GetSnapshotAsync(string tenantKey, string siteKey, CancellationToken cancellationToken = default);
}

public sealed record OutboundLinkProviderMetadata(
    string Mode,
    bool LocalOnly,
    bool StagingBacked,
    bool ReadOnly,
    bool WriteActionsAllowed,
    bool ExternalHttpCrawling,
    bool CmsApiCalls,
    bool CmsWrites,
    bool ProtectedConfigReads,
    string? ProviderProfileId = null,
    string? ProviderMode = null,
    string? ProviderState = null,
    string? SourceEvidence = null,
    string? ApprovalManifestId = null,
    string? FirstWriteBatchId = null,
    int? ExpectedRecordCount = null,
    int? ReadbackRecordCount = null)
{
    public static OutboundLinkProviderMetadata LocalFake() => new(
        "local-fake-readonly",
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        ProviderProfileId: "local-fake-provider",
        ProviderMode: "local-api-fake-provider",
        ProviderState: "local_fixture");

    public static OutboundLinkProviderMetadata StagingBackedReadOnly(
        string sourceEvidence,
        int expectedRecordCount,
        int readbackRecordCount) => new(
            "staging-backed-readonly",
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            ProviderProfileId: "olm-staging-cosmos-nosql-v1",
            ProviderMode: "live-readonly",
            ProviderState: "readback_verified",
            SourceEvidence: sourceEvidence,
            ApprovalManifestId: "olapprove_508df3f03faa4f80",
            FirstWriteBatchId: "olbatch_b08e184fdc6565aa",
            ExpectedRecordCount: expectedRecordCount,
            ReadbackRecordCount: readbackRecordCount);
}

public sealed record OutboundLinkStoreSnapshot(
    string TenantKey,
    string SiteKey,
    IReadOnlyList<OutboundLinkRecord> Links,
    IReadOnlyList<OutboundLinkInstanceRecord> Instances,
    IReadOnlyList<OutboundLinkPolicyRecord> Policies,
    string? ActivePolicyId,
    IReadOnlyList<OutboundLinkScanRunRecord> ScanRuns,
    IReadOnlyList<OutboundLinkAuditLogRecord> AuditLogs,
    OutboundLinkProviderMetadata Provider);

public sealed record OutboundLinkRecord(
    string Id,
    string TenantKey,
    string SiteKey,
    string OriginalUrl,
    string NormalizedUrl,
    string Domain,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset FirstDetectedAt,
    DateTimeOffset LastDetectedAt,
    string CreatedBy,
    string? DisabledBy,
    DateTimeOffset? DisabledAt,
    string? DisabledReason);

public sealed record OutboundLinkInstanceRecord(
    string Id,
    string TenantKey,
    string SiteKey,
    string OutboundLinkId,
    string? PageId,
    string ContentType,
    string? ContentBlockId,
    string FieldName,
    string? AnchorText,
    string LocationPath,
    bool IsEnabled,
    string Status,
    DateTimeOffset FirstDetectedAt,
    DateTimeOffset LastDetectedAt);

public sealed record OutboundLinkPolicyRecord(
    string Id,
    string TenantKey,
    string SiteKey,
    string Name,
    string DefaultDisabledBehavior,
    IReadOnlyList<string> DefaultRel,
    string ExternalTargetBehavior,
    IReadOnlyList<string> AllowedDomains,
    IReadOnlyList<string> BlockedDomains,
    IReadOnlyList<string> PendingReviewDomains,
    bool ReviewRequiredForNewDomains,
    string Source);

public sealed record OutboundLinkScanRunRecord(
    string Id,
    string TenantKey,
    string SiteKey,
    string Status,
    string Mode,
    DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt,
    int PagesScanned,
    int LinksFound,
    int NewLinksFound,
    int StaleInstancesFound);

public sealed record OutboundLinkAuditLogRecord(
    string Id,
    string TenantKey,
    string SiteKey,
    string Action,
    string RecordType,
    string RecordId,
    string Actor,
    string? Reason,
    DateTimeOffset CreatedAt,
    string Mode);

public sealed class FakeOutboundLinkReadOnlyProvider : IOutboundLinkReadOnlyProvider
{
    private static readonly OutboundLinkStoreSnapshot FixtureSnapshot = CreateFixtureSnapshot();

    public Task<OutboundLinkStoreSnapshot?> GetSnapshotAsync(string tenantKey, string siteKey, CancellationToken cancellationToken = default)
    {
        var normalizedTenant = NormalizeKey(tenantKey);
        var normalizedSite = NormalizeKey(siteKey);
        if (normalizedTenant == FixtureSnapshot.TenantKey && normalizedSite == FixtureSnapshot.SiteKey)
        {
            return Task.FromResult<OutboundLinkStoreSnapshot?>(FixtureSnapshot);
        }

        return Task.FromResult<OutboundLinkStoreSnapshot?>(null);
    }

    public static OutboundLinkStoreSnapshot CreateFixtureSnapshot(OutboundLinkProviderMetadata? provider = null)
    {
        var tenantKey = "fixture-tenant";
        var siteKey = "fixture-site";
        var now = DateTimeOffset.Parse("2026-06-10T00:00:00.000Z");
        var links = new List<OutboundLinkRecord>
        {
            Link("ol_docs_help", "https://docs.example/help", "docs.example", now),
            Link("ol_example_home_cta", "https://example.com/home-cta", "example.com", now),
            Link("ol_example_social", "https://example.com/social", "example.com", now),
            Link("ol_example_theme", "https://example.com/theme-reference", "example.com", now),
            Link("ol_partner_vendors", "https://partner.example/vendors", "partner.example", now)
        };
        var instances = new List<OutboundLinkInstanceRecord>
        {
            Instance("oli_home_hero_cta", "ol_example_home_cta", "home", "page", "hero", "ctaUrl", "Home CTA", "$.pages[0].blocks[0].ctaUrl", now),
            Instance("oli_home_partner", "ol_partner_vendors", "home", "page", "rich-text", "html", "partner vendors", "$.pages[0].blocks[1].html", now),
            Instance("oli_nav_docs", "ol_docs_help", null, "navigation", null, "href", "Docs", "$.navigation.items[1].href", now),
            Instance("oli_footer_example", "ol_example_social", null, "footer", null, "url", "Example", "$.footer.socialLinks[0].url", now),
            Instance("oli_theme_reference", "ol_example_theme", null, "theme", null, "externalUrl", "Theme reference", "$.theme.externalUrl", now)
        };
        var policy = new OutboundLinkPolicyRecord(
            "policy_test_default",
            tenantKey,
            siteKey,
            "default fixture outbound link policy",
            "plain_text",
            ["noopener", "noreferrer"],
            "blank",
            ["docs.example", "example.com", "partner.example"],
            [],
            [],
            true,
            "fake-api-provider");
        var scanRun = new OutboundLinkScanRunRecord(
            "olsr_fixture_tenant_bundle",
            tenantKey,
            siteKey,
            "completed",
            "local-fake-readonly",
            now,
            now,
            1,
            5,
            5,
            0);
        var audit = new OutboundLinkAuditLogRecord(
            "ola_fixture_scan_merged",
            tenantKey,
            siteKey,
            "scan_merged",
            "outbound_link_scan_run",
            scanRun.Id,
            "local-fake-api",
            "fake provider seed",
            now,
            "local-fake-readonly");
        return new OutboundLinkStoreSnapshot(
            tenantKey,
            siteKey,
            links,
            instances,
            [policy],
            policy.Id,
            [scanRun],
            [audit],
            provider ?? OutboundLinkProviderMetadata.LocalFake());

        OutboundLinkRecord Link(string id, string url, string domain, DateTimeOffset timestamp) => new(
            id,
            tenantKey,
            siteKey,
            url,
            url,
            domain,
            "active",
            timestamp,
            timestamp,
            timestamp,
            timestamp,
            "local-fake-provider",
            null,
            null,
            null);

        OutboundLinkInstanceRecord Instance(
            string id,
            string linkId,
            string? pageId,
            string contentType,
            string? blockId,
            string fieldName,
            string anchorText,
            string locationPath,
            DateTimeOffset timestamp) => new(
                id,
                tenantKey,
                siteKey,
                linkId,
                pageId,
                contentType,
                blockId,
                fieldName,
                anchorText,
                locationPath,
                true,
                "enabled",
                timestamp,
                timestamp);
    }

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
}

public sealed class StagingBackedOutboundLinkReadOnlyProvider(OutboundLinkStoreSnapshot snapshot) : IOutboundLinkReadOnlyProvider
{
    public Task<OutboundLinkStoreSnapshot?> GetSnapshotAsync(string tenantKey, string siteKey, CancellationToken cancellationToken = default)
    {
        var normalizedTenant = NormalizeKey(tenantKey);
        var normalizedSite = NormalizeKey(siteKey);
        if (normalizedTenant == snapshot.TenantKey && normalizedSite == snapshot.SiteKey)
        {
            return Task.FromResult<OutboundLinkStoreSnapshot?>(snapshot);
        }

        return Task.FromResult<OutboundLinkStoreSnapshot?>(null);
    }

    private static string NormalizeKey(string value) => value.Trim().ToLowerInvariant();
}
