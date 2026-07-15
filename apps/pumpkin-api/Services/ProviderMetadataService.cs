using System.Text.Json.Serialization;

namespace pumpkin_api.Services;

public static class ProviderMetadataService
{
    private const string IceTenantKey = "ice-rink-rentals";
    private const string IceSiteKey = "ice-rink-rentals";
    private static readonly string[] AllowedLiveEnvironments = ["production", "live", "azure"];
    private static readonly string[] IceContainers =
    [
        "tenants",
        "sites",
        "pages",
        "routes",
        "forms",
        "mediaAssets",
        "themes",
        "publishRuns",
        "importRuns",
        "users"
    ];

    public static ProviderMetadataLookupResult Lookup(string? tenantKey, string? siteKey, string? environment)
    {
        var normalizedTenantKey = NormalizeKey(tenantKey);
        if (string.IsNullOrWhiteSpace(normalizedTenantKey))
        {
            return ProviderMetadataLookupResult.BadRequest("tenantKey is required.");
        }

        var normalizedSiteKey = string.IsNullOrWhiteSpace(siteKey) ? normalizedTenantKey : NormalizeKey(siteKey);
        var normalizedEnvironment = NormalizeEnvironment(environment);
        if (!AllowedLiveEnvironments.Contains(normalizedEnvironment, StringComparer.OrdinalIgnoreCase))
        {
            return ProviderMetadataLookupResult.BadRequest("environment must be production, live, or azure.");
        }

        if (normalizedTenantKey != IceTenantKey || normalizedSiteKey != IceSiteKey)
        {
            return ProviderMetadataLookupResult.NotFound();
        }

        return ProviderMetadataLookupResult.Found(new ProviderMetadataResponse(
            TenantKey: IceTenantKey,
            SiteKey: IceSiteKey,
            Environment: "production",
            Profile: "future-target-cosmos-provisioned",
            ProviderType: "cosmos",
            ProviderStatus: "future-target",
            ProvisioningStatus: "provisioned",
            RuntimeStatus: "metadata-endpoint-runtime-wiring-required",
            AccountName: "cosmos-pumpkin-prod-eastus",
            ResourceGroup: "rg-ice-production-cosmos",
            SubscriptionHint: "ff887def-fd83-4a19-9298-13d4b1687873",
            DatabaseName: "pumpkin-prod-cms",
            ContainerNames: IceContainers,
            BackupPolicyMode: "Continuous30Days",
            PortableExportSupported: false,
            PlatformBackupEvidenceSupported: true,
            RedactionStatus: "passed",
            SecretsIncluded: false));
    }

    public static bool IsAuthorizedForMetadata(string? authenticatedTenantId, string? role, string requestedTenantKey)
    {
        if (string.Equals(role, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!string.Equals(authenticatedTenantId, requestedTenantKey, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return string.Equals(role, "TenantAdmin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "Operator", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeKey(string? value)
    {
        return (value ?? string.Empty).Trim().ToLowerInvariant();
    }

    private static string NormalizeEnvironment(string? value)
    {
        var normalized = NormalizeKey(value);
        return string.IsNullOrWhiteSpace(normalized) ? "production" : normalized;
    }
}

public sealed record ProviderMetadataResponse(
    [property: JsonPropertyName("tenantKey")] string TenantKey,
    [property: JsonPropertyName("siteKey")] string SiteKey,
    [property: JsonPropertyName("environment")] string Environment,
    [property: JsonPropertyName("profile")] string Profile,
    [property: JsonPropertyName("providerType")] string ProviderType,
    [property: JsonPropertyName("providerStatus")] string ProviderStatus,
    [property: JsonPropertyName("provisioningStatus")] string ProvisioningStatus,
    [property: JsonPropertyName("runtimeStatus")] string RuntimeStatus,
    [property: JsonPropertyName("accountName")] string AccountName,
    [property: JsonPropertyName("resourceGroup")] string ResourceGroup,
    [property: JsonPropertyName("subscriptionHint")] string SubscriptionHint,
    [property: JsonPropertyName("databaseName")] string DatabaseName,
    [property: JsonPropertyName("containerNames")] IReadOnlyList<string> ContainerNames,
    [property: JsonPropertyName("backupPolicyMode")] string BackupPolicyMode,
    [property: JsonPropertyName("portableExportSupported")] bool PortableExportSupported,
    [property: JsonPropertyName("platformBackupEvidenceSupported")] bool PlatformBackupEvidenceSupported,
    [property: JsonPropertyName("redactionStatus")] string RedactionStatus,
    [property: JsonPropertyName("secretsIncluded")] bool SecretsIncluded);

public sealed record ProviderMetadataLookupResult(
    ProviderMetadataResponse? Response,
    string Status,
    string? Error)
{
    public static ProviderMetadataLookupResult Found(ProviderMetadataResponse response) => new(response, "found", null);
    public static ProviderMetadataLookupResult NotFound() => new(null, "not-found", null);
    public static ProviderMetadataLookupResult BadRequest(string error) => new(null, "bad-request", error);
}
