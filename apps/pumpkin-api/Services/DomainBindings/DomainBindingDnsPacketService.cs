using pumpkin_net_models.Models;

namespace pumpkin_api.Services.DomainBindings;

public static class DomainBindingDnsPacketService
{
    public static List<DomainBindingDnsRecord> GenerateAzureAppServicePacket(
        DomainBinding binding,
        DomainBindingDnsPacketRequest request)
    {
        var inboundIp = FirstNonEmpty(request.InboundIpAddress, binding.HostingTarget.InboundIpAddress);
        var verificationId = FirstNonEmpty(request.CustomDomainVerificationId, binding.HostingTarget.CustomDomainVerificationId);
        var defaultHost = FirstNonEmpty(request.DefaultHost, binding.HostingTarget.DefaultHost);

        if (string.IsNullOrWhiteSpace(binding.Domain) ||
            string.IsNullOrWhiteSpace(binding.WwwDomain) ||
            string.IsNullOrWhiteSpace(inboundIp) ||
            string.IsNullOrWhiteSpace(verificationId) ||
            string.IsNullOrWhiteSpace(defaultHost))
        {
            throw new InvalidOperationException("Domain, wwwDomain, inbound IP, verification ID, and default host are required to generate an Azure App Service DNS packet.");
        }

        binding.HostingTarget.InboundIpAddress = inboundIp.Trim();
        binding.HostingTarget.CustomDomainVerificationId = verificationId.Trim();
        binding.HostingTarget.DefaultHost = defaultHost.Trim().ToLowerInvariant();

        return new List<DomainBindingDnsRecord>
        {
            Create("A", "@", binding.Domain, inboundIp, "apex_app_service_ip"),
            Create("TXT", "asuid", $"asuid.{binding.Domain}", verificationId, "apex_app_service_ownership"),
            Create("CNAME", "www", binding.WwwDomain, defaultHost, "www_app_service_default_host"),
            Create("TXT", "asuid.www", $"asuid.www.{binding.Domain}", verificationId, "www_app_service_ownership")
        };
    }

    private static DomainBindingDnsRecord Create(string type, string host, string name, string value, string purpose)
    {
        return new DomainBindingDnsRecord
        {
            Type = type,
            Host = host,
            Name = name.Trim().ToLowerInvariant(),
            Value = value.Trim(),
            Purpose = purpose,
            Status = "pending",
            ObservedValues = new List<string>()
        };
    }

    private static string FirstNonEmpty(string first, string second)
    {
        return !string.IsNullOrWhiteSpace(first) ? first : second;
    }
}
