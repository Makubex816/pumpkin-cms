using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace pumpkin_api.Services;

public interface IOutboundLinkWriteTraceLogger
{
    string HashState(object value);
    string RedactUrlForLog(string? value);
}

public sealed class OutboundLinkWriteTraceLogger : IOutboundLinkWriteTraceLogger
{
    private static readonly HashSet<string> RiskyQueryKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "token",
        "key",
        "api_key",
        "apikey",
        "signature",
        "sig",
        "auth",
        "password",
        "access_token",
        "code"
    };

    public string HashState(object value)
    {
        var json = JsonSerializer.Serialize(value);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        return $"sha256:{Convert.ToHexString(hash).ToLowerInvariant()}";
    }

    public string RedactUrlForLog(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            return RedactQueryString(value);
        }

        var builder = new UriBuilder(uri)
        {
            Query = RedactQueryString(uri.Query.TrimStart('?')).TrimStart('?')
        };
        return builder.Uri.ToString();
    }

    private static string RedactQueryString(string value)
    {
        var result = value;
        foreach (var key in RiskyQueryKeys)
        {
            result = System.Text.RegularExpressions.Regex.Replace(
                result,
                $"(^|[?&])({System.Text.RegularExpressions.Regex.Escape(key)}=)[^&\\s]+",
                "$1$2redacted",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }
        return result;
    }
}
