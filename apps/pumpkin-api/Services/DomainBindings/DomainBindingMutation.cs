using pumpkin_net_models.Models;

namespace pumpkin_api.Services.DomainBindings;

public static class DomainBindingMutation
{
    public static DomainBinding PrepareForCreate(DomainBinding binding, string tenantId, string actor)
    {
        var now = DateTime.UtcNow;
        binding.TenantId = NormalizeKey(tenantId);
        binding.Domain = NormalizeDomain(binding.Domain);
        binding.WwwDomain = NormalizeDomain(binding.WwwDomain);
        binding.Provider = string.IsNullOrWhiteSpace(binding.Provider) ? "manual" : NormalizeKey(binding.Provider);
        binding.Status = string.IsNullOrWhiteSpace(binding.Status) ? "draft" : NormalizeKey(binding.Status);
        binding.DnsValidationStatus = string.IsNullOrWhiteSpace(binding.DnsValidationStatus) ? "pending" : NormalizeKey(binding.DnsValidationStatus);
        binding.AzureHostnameStatus = string.IsNullOrWhiteSpace(binding.AzureHostnameStatus) ? "not_started" : NormalizeKey(binding.AzureHostnameStatus);
        binding.TlsStatus = string.IsNullOrWhiteSpace(binding.TlsStatus) ? "not_started" : NormalizeKey(binding.TlsStatus);
        binding.RuntimeStatus = string.IsNullOrWhiteSpace(binding.RuntimeStatus) ? "not_started" : NormalizeKey(binding.RuntimeStatus);
        binding.PromotionStatus = string.IsNullOrWhiteSpace(binding.PromotionStatus) ? "not_promoted" : NormalizeKey(binding.PromotionStatus);
        binding.CreatedAt = now;
        binding.UpdatedAt = now;
        binding.CreatedBy = actor;
        binding.UpdatedBy = actor;

        if (string.IsNullOrWhiteSpace(binding.Id))
        {
            binding.Id = $"domainbinding-{binding.TenantId}-{binding.Domain.Replace(".", "-", StringComparison.Ordinal)}";
        }

        AppendAudit(binding, actor, "create", string.Empty, binding.Status, "DomainBinding created.");
        return binding;
    }

    public static DomainBinding PrepareForUpdate(DomainBinding binding, string tenantId, string id, string actor)
    {
        binding.Id = id;
        binding.TenantId = NormalizeKey(tenantId);
        binding.Domain = NormalizeDomain(binding.Domain);
        binding.WwwDomain = NormalizeDomain(binding.WwwDomain);
        binding.Provider = string.IsNullOrWhiteSpace(binding.Provider) ? "manual" : NormalizeKey(binding.Provider);
        binding.Status = string.IsNullOrWhiteSpace(binding.Status) ? "draft" : NormalizeKey(binding.Status);
        binding.DnsValidationStatus = string.IsNullOrWhiteSpace(binding.DnsValidationStatus) ? "pending" : NormalizeKey(binding.DnsValidationStatus);
        binding.AzureHostnameStatus = string.IsNullOrWhiteSpace(binding.AzureHostnameStatus) ? "not_started" : NormalizeKey(binding.AzureHostnameStatus);
        binding.TlsStatus = string.IsNullOrWhiteSpace(binding.TlsStatus) ? "not_started" : NormalizeKey(binding.TlsStatus);
        binding.RuntimeStatus = string.IsNullOrWhiteSpace(binding.RuntimeStatus) ? "not_started" : NormalizeKey(binding.RuntimeStatus);
        binding.PromotionStatus = string.IsNullOrWhiteSpace(binding.PromotionStatus) ? "not_promoted" : NormalizeKey(binding.PromotionStatus);
        binding.UpdatedAt = DateTime.UtcNow;
        binding.UpdatedBy = actor;
        AppendAudit(binding, actor, "update", string.Empty, binding.Status, "DomainBinding updated.");
        return binding;
    }

    public static void AppendAudit(
        DomainBinding binding,
        string actor,
        string action,
        string fromStatus,
        string toStatus,
        string summary)
    {
        binding.AuditEvents.Add(new DomainBindingAuditEvent
        {
            Id = Guid.NewGuid().ToString(),
            At = DateTime.UtcNow,
            Actor = actor,
            Action = action,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            Summary = summary
        });
    }

    public static string NormalizeKey(string value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLowerInvariant();
    }

    public static string NormalizeDomain(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var trimmed = value.Trim().ToLowerInvariant();
        trimmed = trimmed.Replace("https://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("http://", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim('/');
        return trimmed;
    }
}
