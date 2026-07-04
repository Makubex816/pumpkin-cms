using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.DomainBindings;

public sealed class DomainBindingDnsValidationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DomainBindingDnsValidationService> _logger;

    public DomainBindingDnsValidationService(HttpClient httpClient, ILogger<DomainBindingDnsValidationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/dns-json"));
    }

    public async Task<bool> ValidateAsync(DomainBinding binding, CancellationToken cancellationToken = default)
    {
        var allVerified = true;
        foreach (var record in binding.DnsRecords)
        {
            var observed = await ResolveAsync(record.Name, record.Type, cancellationToken);
            record.ObservedValues = observed;
            record.LastCheckedAt = DateTime.UtcNow;
            record.Status = IsRecordVerified(record, observed) ? "verified" : "pending";
            allVerified = allVerified && record.Status == "verified";
        }

        binding.DnsValidationStatus = allVerified ? "verified" : "pending";
        binding.Status = allVerified ? "dns_verified" : "pending_dns_records";
        return allVerified;
    }

    public static bool IsRecordVerified(DomainBindingDnsRecord record, IReadOnlyList<string> observedValues)
    {
        var expected = NormalizeValue(record.Type, record.Value);
        return observedValues
            .Select(value => NormalizeValue(record.Type, value))
            .Any(value => string.Equals(value, expected, StringComparison.OrdinalIgnoreCase));
    }

    private async Task<List<string>> ResolveAsync(string name, string type, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(type))
        {
            return new List<string>();
        }

        var uri = $"https://cloudflare-dns.com/dns-query?name={Uri.EscapeDataString(name)}&type={Uri.EscapeDataString(type)}";
        try
        {
            using var response = await _httpClient.GetAsync(uri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return new List<string>();
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await JsonSerializer.DeserializeAsync<DnsOverHttpsResponse>(stream, cancellationToken: cancellationToken);
            return payload?.Answer?
                .Where(answer => !string.IsNullOrWhiteSpace(answer.Data))
                .Select(answer => answer.Data.Trim())
                .ToList() ?? new List<string>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Read-only DNS validation failed for {Name} {Type}", name, type);
            return new List<string>();
        }
    }

    private static string NormalizeValue(string type, string value)
    {
        var normalized = (value ?? string.Empty).Trim().Trim('"');
        if (string.Equals(type, "CNAME", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized.TrimEnd('.').ToLowerInvariant();
        }

        return normalized;
    }

    private sealed class DnsOverHttpsResponse
    {
        [JsonPropertyName("Answer")]
        public List<DnsOverHttpsAnswer>? Answer { get; set; }
    }

    private sealed class DnsOverHttpsAnswer
    {
        [JsonPropertyName("data")]
        public string Data { get; set; } = string.Empty;
    }
}
