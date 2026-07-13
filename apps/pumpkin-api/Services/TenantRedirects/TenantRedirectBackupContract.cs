using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectBackupContract
{
    public const string SchemaVersion = "1.0.0";
    public const string Kind = "pumpkin.tenant-redirects";
    private static readonly HashSet<int> AllowedStatusCodes = new() { 301, 302, 307, 308 };

    public static TenantRedirectBackupEnvelope CreateEnvelope(
        string tenantId,
        IEnumerable<TenantRedirect> redirects,
        DateTime? exportedAt = null)
    {
        var normalizedTenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId);
        return new TenantRedirectBackupEnvelope
        {
            TenantId = normalizedTenantId,
            ExportedAt = exportedAt ?? DateTime.UtcNow,
            Redirects = redirects
                .Where(item => string.Equals(item.TenantId, normalizedTenantId, StringComparison.Ordinal))
                .OrderBy(item => item.SourcePath, StringComparer.Ordinal)
                .ThenBy(item => item.Id, StringComparer.Ordinal)
                .ToList()
        };
    }

    public static TenantRedirectBackupValidationResult ValidateForRestore(
        TenantRedirectBackupEnvelope? envelope,
        string expectedTenantId)
    {
        var result = new TenantRedirectBackupValidationResult();
        var expectedTenant = TenantRedirectNormalizer.NormalizeTenantId(expectedTenantId);
        if (envelope == null)
        {
            result.Errors.Add("Backup envelope is required.");
            return result;
        }

        if (!string.Equals(envelope.SchemaVersion, SchemaVersion, StringComparison.Ordinal) ||
            !string.Equals(envelope.Kind, Kind, StringComparison.Ordinal))
        {
            result.Errors.Add("Backup envelope schema or kind is unsupported.");
        }

        if (string.IsNullOrWhiteSpace(expectedTenant) ||
            !string.Equals(TenantRedirectNormalizer.NormalizeTenantId(envelope.TenantId), expectedTenant, StringComparison.Ordinal))
        {
            result.Errors.Add("Backup envelope tenant does not match the restore tenant.");
        }

        var ids = new HashSet<string>(StringComparer.Ordinal);
        var sourceStates = new HashSet<string>(StringComparer.Ordinal);
        var activeInternalEdges = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var redirect in envelope.Redirects ?? new List<TenantRedirect>())
        {
            if (!string.Equals(TenantRedirectNormalizer.NormalizeTenantId(redirect.TenantId), expectedTenant, StringComparison.Ordinal))
            {
                result.Errors.Add($"Redirect '{redirect.Id}' is outside the restore tenant.");
                continue;
            }

            if (string.IsNullOrWhiteSpace(redirect.Id) || !ids.Add(redirect.Id))
            {
                result.Errors.Add("Redirect IDs must be present and unique within the backup.");
            }

            var sourceValid = TenantRedirectNormalizer.TryNormalizeSourcePath(redirect.SourcePath, out var source, out _) &&
                string.Equals(source, redirect.SourcePath, StringComparison.Ordinal);
            if (!sourceValid)
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has a non-canonical source path.");
            }

            var targetNormalized = TenantRedirectNormalizer.TryNormalizeTarget(
                    redirect.Target,
                    redirect.TargetKind,
                    out var target,
                    out var targetPath,
                    out var targetKind,
                    out _);
            var targetValid = targetNormalized &&
                string.Equals(target, redirect.Target, StringComparison.Ordinal) &&
                string.Equals(targetKind, redirect.TargetKind, StringComparison.Ordinal);
            if (!targetValid)
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has a non-canonical target.");
            }

            if (!AllowedStatusCodes.Contains(redirect.StatusCode))
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has an unsupported status code.");
            }

            if (!sourceStates.Add($"{redirect.SourcePath}|{redirect.Active}"))
            {
                result.Errors.Add($"Redirect source '{redirect.SourcePath}' has a duplicate active-state record.");
            }

            if (redirect.TargetStatus is not ("resolved" or "pending"))
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has an unsupported target status.");
            }

            if (redirect.Active && redirect.TargetStatus == "pending")
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has an active pending target.");
            }

            if (!string.Equals(redirect.RoutePrecedence, "redirect_before_page", StringComparison.Ordinal) ||
                redirect.PageShadowMode is not ("none" or "redirect_precedes_page"))
            {
                result.Errors.Add($"Redirect '{redirect.Id}' has unsupported route precedence metadata.");
            }

            if (sourceValid && targetValid && redirect.TargetKind == "internal" && string.Equals(source, targetPath, StringComparison.Ordinal))
            {
                result.Errors.Add($"Redirect '{redirect.Id}' is a normalized self-loop.");
            }

            if (sourceValid && targetValid && redirect.Active && redirect.TargetStatus == "resolved" && redirect.TargetKind == "internal")
            {
                activeInternalEdges.TryAdd(source, targetPath);
            }
        }

        if (ContainsCycle(activeInternalEdges))
        {
            result.Errors.Add("Backup envelope contains an active redirect cycle.");
        }

        result.Valid = result.Errors.Count == 0;
        return result;
    }

    private static bool ContainsCycle(IReadOnlyDictionary<string, string> edges)
    {
        foreach (var start in edges.Keys)
        {
            var visited = new HashSet<string>(StringComparer.Ordinal);
            var current = start;
            while (edges.TryGetValue(current, out var target))
            {
                if (!visited.Add(current)) return true;
                current = target;
            }
        }

        return false;
    }
}
