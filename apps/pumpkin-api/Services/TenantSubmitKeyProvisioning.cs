using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public sealed class TenantSubmitKeyProvisionRequest
{
    public string SubmitKey { get; set; } = string.Empty;
}

public sealed class TenantSubmitKeyProvisionResponse
{
    public string TenantId { get; set; } = string.Empty;
    public ApiKeyMeta ApiKeyMeta { get; set; } = new();
    public DateTime UpdatedAt { get; set; }
    public bool KeyHashStored { get; set; }
    public bool PlaintextReturned { get; set; }
}

public static class TenantSubmitKeyProvisioningService
{
    public static bool IsSuperAdminRole(string? role)
    {
        return string.Equals(role, "SuperAdmin", StringComparison.Ordinal);
    }

    public static string NormalizeSubmitKey(string? submitKey)
    {
        return submitKey?.Trim() ?? string.Empty;
    }

    public static string? ValidateSubmitKey(string? submitKey)
    {
        return string.IsNullOrWhiteSpace(submitKey)
            ? "Submit key is required."
            : null;
    }

    public static string HashSubmitKey(string submitKey)
    {
        return BCrypt.Net.BCrypt.HashPassword(submitKey, 12);
    }

    public static bool VerifySubmitKey(string submitKey, string apiKeyHash)
    {
        return BCrypt.Net.BCrypt.Verify(submitKey, apiKeyHash);
    }

    public static async Task<TenantSubmitKeyProvisionResponse> ProvisionSubmitKeyAsync(
        IDatabaseService databaseService,
        string tenantId,
        string submitKey)
    {
        var normalizedSubmitKey = NormalizeSubmitKey(submitKey);
        var apiKeyHash = HashSubmitKey(normalizedSubmitKey);
        var tenant = await databaseService.ProvisionTenantApiKeyHashAsync(tenantId, apiKeyHash);

        return ToResponse(tenant);
    }

    public static TenantSubmitKeyProvisionResponse ToResponse(Tenant tenant)
    {
        return new TenantSubmitKeyProvisionResponse
        {
            TenantId = tenant.TenantId,
            ApiKeyMeta = tenant.ApiKeyMeta,
            UpdatedAt = tenant.UpdatedAt,
            KeyHashStored = !string.IsNullOrWhiteSpace(tenant.ApiKeyHash),
            PlaintextReturned = false
        };
    }
}
