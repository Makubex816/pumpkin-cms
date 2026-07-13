using System.Security.Cryptography;
using System.Text;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.TenantRedirects;

public static class TenantRedirectMutation
{
    public static TenantRedirect PrepareForCreate(
        string tenantId,
        TenantRedirectUpsertRequest request,
        TenantRedirectValidationResponse validation,
        string actor)
    {
        EnsureValid(validation);
        var now = DateTime.UtcNow;
        var correlationId = string.IsNullOrWhiteSpace(request.AuditCorrelationId)
            ? Guid.NewGuid().ToString()
            : request.AuditCorrelationId.Trim();
        var redirect = new TenantRedirect
        {
            Id = BuildId(tenantId, validation.NormalizedSourcePath),
            TenantId = TenantRedirectNormalizer.NormalizeTenantId(tenantId),
            SourcePath = validation.NormalizedSourcePath,
            Target = validation.NormalizedTarget,
            TargetKind = validation.TargetKind,
            StatusCode = request.StatusCode,
            Active = request.Active,
            PreserveQueryString = request.PreserveQueryString,
            TargetStatus = PersistedTargetStatus(validation),
            RoutePrecedence = "redirect_before_page",
            PageShadowMode = !request.Active || string.IsNullOrWhiteSpace(validation.ShadowedPageId) ? "none" : "redirect_precedes_page",
            ShadowedPageId = validation.ShadowedPageId,
            ShadowedPageSlug = validation.ShadowedPageSlug,
            SourcePackagePath = request.SourcePackagePath.Trim(),
            SourceDeclaration = request.SourceDeclaration.Trim(),
            ImportCorrelationId = request.ImportCorrelationId.Trim(),
            AuditCorrelationId = correlationId,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = actor,
            UpdatedBy = actor
        };

        AppendAudit(redirect, actor, "create", "Tenant redirect created.", correlationId);
        return redirect;
    }

    public static TenantRedirect PrepareForUpdate(
        TenantRedirect existing,
        TenantRedirectUpsertRequest request,
        TenantRedirectValidationResponse validation,
        string actor)
    {
        EnsureValid(validation);
        if (!string.Equals(existing.SourcePath, validation.NormalizedSourcePath, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("A redirect source path is immutable.");
        }

        var correlationId = string.IsNullOrWhiteSpace(request.AuditCorrelationId)
            ? Guid.NewGuid().ToString()
            : request.AuditCorrelationId.Trim();
        var redirect = new TenantRedirect
        {
            Id = existing.Id,
            TenantId = existing.TenantId,
            SourcePath = validation.NormalizedSourcePath,
            Target = validation.NormalizedTarget,
            TargetKind = validation.TargetKind,
            StatusCode = request.StatusCode,
            Active = request.Active,
            PreserveQueryString = request.PreserveQueryString,
            TargetStatus = PersistedTargetStatus(validation),
            RoutePrecedence = "redirect_before_page",
            PageShadowMode = !request.Active || string.IsNullOrWhiteSpace(validation.ShadowedPageId) ? "none" : "redirect_precedes_page",
            ShadowedPageId = validation.ShadowedPageId,
            ShadowedPageSlug = validation.ShadowedPageSlug,
            SourcePackagePath = request.SourcePackagePath.Trim(),
            SourceDeclaration = request.SourceDeclaration.Trim(),
            ImportCorrelationId = request.ImportCorrelationId.Trim(),
            AuditCorrelationId = correlationId,
            CreatedAt = existing.CreatedAt,
            UpdatedAt = DateTime.UtcNow,
            DeletedAt = request.Active ? null : existing.DeletedAt,
            CreatedBy = existing.CreatedBy,
            UpdatedBy = actor,
            AuditEvents = existing.AuditEvents?.ToList() ?? new List<TenantRedirectAuditEvent>()
        };

        AppendAudit(redirect, actor, "update", "Tenant redirect updated.", correlationId);
        return redirect;
    }

    public static TenantRedirect PrepareForDeactivate(TenantRedirect existing, string actor, string? correlationId = null)
    {
        var updated = Clone(existing);
        updated.Active = false;
        updated.DeletedAt ??= DateTime.UtcNow;
        updated.UpdatedAt = DateTime.UtcNow;
        updated.UpdatedBy = actor;
        updated.AuditCorrelationId = string.IsNullOrWhiteSpace(correlationId) ? Guid.NewGuid().ToString() : correlationId.Trim();
        AppendAudit(updated, actor, "deactivate", "Tenant redirect deactivated.", updated.AuditCorrelationId);
        return updated;
    }

    public static void AppendAudit(TenantRedirect redirect, string actor, string action, string summary, string correlationId)
    {
        redirect.AuditEvents.Add(new TenantRedirectAuditEvent
        {
            Id = Guid.NewGuid().ToString(),
            At = DateTime.UtcNow,
            Actor = actor,
            Action = action,
            Summary = summary,
            CorrelationId = correlationId
        });
    }

    public static string BuildId(string tenantId, string sourcePath)
    {
        var digest = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sourcePath))).ToLowerInvariant();
        return $"redirect-{TenantRedirectNormalizer.NormalizeTenantId(tenantId)}-{digest[..16]}";
    }

    private static TenantRedirect Clone(TenantRedirect source)
    {
        return new TenantRedirect
        {
            Id = source.Id,
            TenantId = source.TenantId,
            SourcePath = source.SourcePath,
            Target = source.Target,
            TargetKind = source.TargetKind,
            StatusCode = source.StatusCode,
            Active = source.Active,
            PreserveQueryString = source.PreserveQueryString,
            TargetStatus = source.TargetStatus,
            RoutePrecedence = source.RoutePrecedence,
            PageShadowMode = source.PageShadowMode,
            ShadowedPageId = source.ShadowedPageId,
            ShadowedPageSlug = source.ShadowedPageSlug,
            SourcePackagePath = source.SourcePackagePath,
            SourceDeclaration = source.SourceDeclaration,
            ImportCorrelationId = source.ImportCorrelationId,
            AuditCorrelationId = source.AuditCorrelationId,
            CreatedAt = source.CreatedAt,
            UpdatedAt = source.UpdatedAt,
            DeletedAt = source.DeletedAt,
            CreatedBy = source.CreatedBy,
            UpdatedBy = source.UpdatedBy,
            AuditEvents = source.AuditEvents?.ToList() ?? new List<TenantRedirectAuditEvent>()
        };
    }

    private static void EnsureValid(TenantRedirectValidationResponse validation)
    {
        if (!validation.Valid || !validation.Persistable)
        {
            throw new InvalidOperationException("A tenant redirect cannot be prepared from a failed validation result.");
        }
    }

    private static string PersistedTargetStatus(TenantRedirectValidationResponse validation)
    {
        return string.Equals(validation.TargetResolutionStatus, "pending", StringComparison.Ordinal)
            ? "pending"
            : "resolved";
    }
}
