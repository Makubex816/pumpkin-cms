using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectValidationService
{
    private static readonly HashSet<int> AllowedStatusCodes = new() { 301, 302, 307, 308 };

    public static async Task<TenantRedirectValidationResponse> ValidateAsync(
        IDatabaseService databaseService,
        string tenantId,
        TenantRedirectUpsertRequest request,
        string? excludeRedirectId = null,
        string? expectedSourcePath = null)
    {
        var response = new TenantRedirectValidationResponse();
        var normalizedTenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId);
        if (string.IsNullOrWhiteSpace(normalizedTenantId))
        {
            AddError(response, "tenant.required", "Tenant ID is required.");
            return Finish(response);
        }

        if (!TenantRedirectNormalizer.TryNormalizeSourcePath(
                request.SourcePath,
                out var normalizedSource,
                out var sourceError))
        {
            AddError(response, "source.invalid", sourceError);
        }
        response.NormalizedSourcePath = normalizedSource;
        if (!string.IsNullOrWhiteSpace(expectedSourcePath) &&
            !string.Equals(normalizedSource, expectedSourcePath, StringComparison.Ordinal))
        {
            AddError(response, "source.immutable", "A redirect source path is immutable; deactivate it and create a new redirect instead.");
        }

        if (!TenantRedirectNormalizer.TryNormalizeTarget(
                request.Target,
                request.TargetKind,
                out var normalizedTarget,
                out var normalizedTargetPath,
                out var normalizedTargetKind,
                out var targetError))
        {
            AddError(response, "target.invalid", targetError);
        }
        response.NormalizedTarget = normalizedTarget;
        response.TargetKind = normalizedTargetKind;

        if (!AllowedStatusCodes.Contains(request.StatusCode))
        {
            AddError(response, "status.unsupported", "Status code must be 301, 302, 307, or 308.");
        }

        var requestedTargetStatus = (request.TargetStatus ?? string.Empty).Trim().ToLowerInvariant();
        if (requestedTargetStatus is not ("resolved" or "pending"))
        {
            AddError(response, "targetStatus.unsupported", "Target status must be 'resolved' or explicitly 'pending'.");
        }

        if (normalizedTargetKind == "external" && requestedTargetStatus == "pending")
        {
            AddError(response, "external.pending.unsupported", "External targets cannot use pending target status.");
        }

        if (normalizedTargetKind == "internal" &&
            !string.IsNullOrWhiteSpace(normalizedSource) &&
            string.Equals(normalizedSource, normalizedTargetPath, StringComparison.Ordinal))
        {
            AddError(response, "redirect.selfLoop", "Source and internal target paths must remain distinct after normalization.");
        }

        if (response.Errors.Count > 0)
        {
            return Finish(response);
        }

        var redirects = await databaseService.GetTenantRedirectsAsync(normalizedTenantId, includeInactive: true);
        var pages = await databaseService.GetPagesByTenantAsync(normalizedTenantId);
        var edges = new Dictionary<string, RedirectEdge>(StringComparer.Ordinal);

        AddLegacyPageRedirects(response, pages, edges);
        AddStoredRedirects(response, redirects, edges, excludeRedirectId);

        var existingSameSource = redirects
            .Where(item => !string.Equals(item.Id, excludeRedirectId, StringComparison.Ordinal))
            .Where(item => string.Equals(item.SourcePath, normalizedSource, StringComparison.Ordinal))
            .ToList();
        var activeSameSource = existingSameSource.FirstOrDefault(item => item.Active);
        if (request.Active && activeSameSource != null)
        {
            if (Equivalent(activeSameSource, request, normalizedTarget, normalizedTargetKind))
            {
                response.IdempotentMatchId = activeSameSource.Id;
            }
            else
            {
                AddError(response, "source.duplicateActive", $"Active redirect source '{normalizedSource}' already exists for this tenant.");
            }
        }
        else if (excludeRedirectId == null && existingSameSource.Any(item => !item.Active))
        {
            AddError(response, "source.inactiveRequiresUpdate", $"Inactive redirect source '{normalizedSource}' must be reactivated through its existing record.");
        }

        if (request.Active && response.Errors.All(issue => issue.Code != "source.duplicateActive"))
        {
            if (!string.IsNullOrWhiteSpace(response.IdempotentMatchId))
            {
                // The stored edge already represents this exact replay.
            }
            else if (edges.ContainsKey(normalizedSource))
            {
                AddError(response, "source.legacyConflict", $"Redirect source '{normalizedSource}' conflicts with an existing page-owned or tenant redirect.");
            }
            else
            {
                edges[normalizedSource] = new RedirectEdge(normalizedTargetKind, normalizedTargetPath, normalizedTarget);
            }
        }

        var shadowedPage = FindPageForPath(pages, normalizedSource);
        if (shadowedPage != null)
        {
            response.ShadowedPageId = shadowedPage.PageId;
            response.ShadowedPageSlug = shadowedPage.PageSlug;
            if (request.Active && !string.Equals(request.PageShadowMode?.Trim(), "redirect_precedes_page", StringComparison.Ordinal))
            {
                AddError(
                    response,
                    "source.pageConflictRequiresExplicitShadow",
                    $"Source '{normalizedSource}' is an existing page route; pageShadowMode must explicitly be 'redirect_precedes_page'.");
            }
        }

        response.Cycles = DetectCycles(edges);
        if (response.Cycles.Count > 0)
        {
            AddError(response, "redirect.cycle", "Active redirect graph contains a direct or multi-node cycle.");
        }

        if (normalizedTargetKind == "external")
        {
            response.TargetExists = true;
            response.TargetResolutionStatus = "external";
        }
        else
        {
            var terminal = ResolveTerminal(normalizedTargetPath, edges);
            response.TargetExists = terminal.External || FindPageForPath(pages, terminal.Path) != null;
            if (response.TargetExists)
            {
                response.TargetResolutionStatus = terminal.External ? "resolved_via_external_redirect" : "resolved";
                if (requestedTargetStatus == "pending")
                {
                    response.Warnings.Add(new TenantRedirectValidationIssue
                    {
                        Code = "target.pendingButResolved",
                        Message = "The explicitly pending target currently resolves; the persisted target status will be resolved."
                    });
                }
            }
            else if (requestedTargetStatus == "pending")
            {
                response.TargetResolutionStatus = "pending";
                if (request.Active)
                {
                    AddError(response, "target.pendingRequiresInactive", "A redirect with an unresolved pending target must remain inactive.");
                }
            }
            else
            {
                response.TargetResolutionStatus = "missing";
                AddError(response, "target.unresolved", $"Internal target '{normalizedTargetPath}' does not resolve to a tenant page or redirect route.");
            }
        }

        return Finish(response);
    }

    private static void AddLegacyPageRedirects(
        TenantRedirectValidationResponse response,
        IEnumerable<Page> pages,
        IDictionary<string, RedirectEdge> edges)
    {
        foreach (var redirect in pages.SelectMany(page => page.Redirects ?? new List<PageRedirect>()).Where(item => item.Active))
        {
            var rawSource = EnsureLeadingSlash(redirect.From);
            var rawTarget = EnsureLeadingSlash(redirect.To);
            if (!TenantRedirectNormalizer.TryNormalizeSourcePath(rawSource, out var source, out _) ||
                !TenantRedirectNormalizer.TryNormalizeTarget(rawTarget, "internal", out var target, out var targetPath, out _, out _))
            {
                AddError(response, "legacyRedirect.invalid", "An existing page-owned redirect cannot be normalized safely.");
                continue;
            }

            if (!edges.TryAdd(source, new RedirectEdge("internal", targetPath, target)))
            {
                AddError(response, "legacyRedirect.duplicateSource", $"Existing redirect source '{source}' is duplicated.");
            }
        }
    }

    private static void AddStoredRedirects(
        TenantRedirectValidationResponse response,
        IEnumerable<TenantRedirect> redirects,
        IDictionary<string, RedirectEdge> edges,
        string? excludeRedirectId)
    {
        foreach (var redirect in redirects.Where(item => item.Active && !string.Equals(item.Id, excludeRedirectId, StringComparison.Ordinal)))
        {
            if (!TenantRedirectNormalizer.TryNormalizeSourcePath(redirect.SourcePath, out var source, out _) ||
                !TenantRedirectNormalizer.TryNormalizeTarget(redirect.Target, redirect.TargetKind, out var target, out var targetPath, out var targetKind, out _))
            {
                AddError(response, "storedRedirect.invalid", $"Stored redirect '{redirect.Id}' cannot be normalized safely.");
                continue;
            }

            if (!edges.TryAdd(source, new RedirectEdge(targetKind, targetPath, target)))
            {
                AddError(response, "storedRedirect.duplicateSource", $"Existing redirect source '{source}' is duplicated.");
            }
        }
    }

    private static List<List<string>> DetectCycles(IReadOnlyDictionary<string, RedirectEdge> edges)
    {
        var cycles = new List<List<string>>();
        var emitted = new HashSet<string>(StringComparer.Ordinal);
        foreach (var start in edges.Keys)
        {
            var seen = new Dictionary<string, int>(StringComparer.Ordinal);
            var chain = new List<string>();
            var current = start;
            while (edges.TryGetValue(current, out var edge) && edge.TargetKind == "internal")
            {
                if (seen.TryGetValue(current, out var cycleStart))
                {
                    var cycle = chain.Skip(cycleStart).Append(current).ToList();
                    var key = string.Join('|', cycle.Take(cycle.Count - 1).OrderBy(item => item, StringComparer.Ordinal));
                    if (emitted.Add(key))
                    {
                        cycles.Add(cycle);
                    }
                    break;
                }

                seen[current] = chain.Count;
                chain.Add(current);
                current = edge.TargetPath;
            }
        }

        return cycles;
    }

    private static TerminalRoute ResolveTerminal(string targetPath, IReadOnlyDictionary<string, RedirectEdge> edges)
    {
        var current = targetPath;
        var visited = new HashSet<string>(StringComparer.Ordinal);
        while (visited.Add(current) && edges.TryGetValue(current, out var edge))
        {
            if (edge.TargetKind == "external")
            {
                return new TerminalRoute(string.Empty, true);
            }

            current = edge.TargetPath;
        }

        return new TerminalRoute(current, false);
    }

    private static Page? FindPageForPath(IEnumerable<Page> pages, string path)
    {
        var lookup = TenantRedirectNormalizer.PageLookupSlug(path);
        return pages.FirstOrDefault(page =>
            string.Equals(PageRedirectGuard.NormalizeSlug(page.PageSlug), lookup, StringComparison.Ordinal));
    }

    private static bool Equivalent(
        TenantRedirect existing,
        TenantRedirectUpsertRequest request,
        string normalizedTarget,
        string normalizedTargetKind)
    {
        return string.Equals(existing.Target, normalizedTarget, StringComparison.Ordinal) &&
            string.Equals(existing.TargetKind, normalizedTargetKind, StringComparison.Ordinal) &&
            existing.StatusCode == request.StatusCode &&
            existing.Active == request.Active &&
            existing.PreserveQueryString == request.PreserveQueryString;
    }

    private static TenantRedirectValidationResponse Finish(TenantRedirectValidationResponse response)
    {
        response.Valid = response.Errors.Count == 0;
        response.Persistable = response.Valid;
        return response;
    }

    private static void AddError(TenantRedirectValidationResponse response, string code, string message)
    {
        response.Errors.Add(new TenantRedirectValidationIssue { Code = code, Message = message });
    }

    private static string EnsureLeadingSlash(string value)
    {
        var candidate = (value ?? string.Empty).Trim();
        return candidate.StartsWith("/", StringComparison.Ordinal) ? candidate : $"/{candidate}";
    }

    private sealed record RedirectEdge(string TargetKind, string TargetPath, string Target);
    private sealed record TerminalRoute(string Path, bool External);
}
