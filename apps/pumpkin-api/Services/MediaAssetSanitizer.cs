using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public static class MediaAssetSanitizer
{
    private static readonly HashSet<string> AllowedLicenseStatuses = new(StringComparer.Ordinal)
    {
        "unknown",
        "needs_review",
        "approved",
        "rejected",
        "owned",
        "licensed",
        "ai_generated",
        "partner_provided"
    };

    private static readonly HashSet<string> AllowedUsageStatuses = new(StringComparer.Ordinal)
    {
        "unused",
        "in_use",
        "needs_review",
        "approved_for_publish"
    };

    public static MediaAsset PrepareForCreate(MediaAsset mediaAsset, string tenantId, string createdBy)
    {
        if (mediaAsset == null)
            throw new ArgumentException("Media asset data is required");

        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("Tenant ID is required");

        var url = CleanUrl(mediaAsset.Url, required: true);
        var assetId = SanitizeId(mediaAsset.AssetId);
        if (string.IsNullOrWhiteSpace(assetId))
            assetId = SanitizeId(Path.GetFileNameWithoutExtension(Uri.TryCreate(url, UriKind.Absolute, out var uri) ? uri.LocalPath : url));
        if (string.IsNullOrWhiteSpace(assetId))
            assetId = Guid.NewGuid().ToString("N");

        var now = DateTime.UtcNow.ToString("O");
        var prepared = PrepareCommon(mediaAsset, tenantId, assetId, createdBy);
        prepared.Id = string.IsNullOrWhiteSpace(mediaAsset.Id) ? $"{tenantId}-{assetId}" : SanitizeId(mediaAsset.Id);
        prepared.CreatedAt = string.IsNullOrWhiteSpace(mediaAsset.CreatedAt) ? now : CleanText(mediaAsset.CreatedAt, 80);
        prepared.CreatedBy = CleanText(createdBy, 180);
        prepared.UpdatedAt = now;
        return prepared;
    }

    public static MediaAsset PrepareForUpdate(MediaAsset existing, MediaAsset mediaAsset, string tenantId, string updatedBy)
    {
        if (existing == null)
            throw new ArgumentException("Existing media asset is required");
        if (mediaAsset == null)
            throw new ArgumentException("Media asset data is required");
        if (existing.TenantId != tenantId)
            throw new UnauthorizedAccessException("Media asset tenant mismatch");

        var assetId = string.IsNullOrWhiteSpace(existing.AssetId)
            ? SanitizeId(mediaAsset.AssetId)
            : existing.AssetId;
        if (string.IsNullOrWhiteSpace(assetId))
            assetId = SanitizeId(existing.Id);

        var prepared = PrepareCommon(mediaAsset, tenantId, assetId, updatedBy);
        prepared.Id = existing.Id;
        prepared.CreatedAt = string.IsNullOrWhiteSpace(existing.CreatedAt) ? DateTime.UtcNow.ToString("O") : existing.CreatedAt;
        prepared.CreatedBy = existing.CreatedBy;
        prepared.UpdatedAt = DateTime.UtcNow.ToString("O");
        return prepared;
    }

    private static MediaAsset PrepareCommon(MediaAsset mediaAsset, string tenantId, string assetId, string actor)
    {
        int? width = mediaAsset.Width.HasValue ? Math.Max(0, mediaAsset.Width.Value) : null;
        int? height = mediaAsset.Height.HasValue ? Math.Max(0, mediaAsset.Height.Value) : null;
        long? fileSize = mediaAsset.FileSize.HasValue ? Math.Max(0, mediaAsset.FileSize.Value) : null;
        var focalPoint = mediaAsset.FocalPoint ?? new MediaAssetFocalPoint();

        return new MediaAsset
        {
            TenantId = tenantId,
            AssetId = assetId,
            Url = CleanUrl(mediaAsset.Url, required: true),
            FileName = CleanFileName(mediaAsset.FileName, mediaAsset.Url),
            Title = CleanText(mediaAsset.Title, 180),
            Alt = CleanText(mediaAsset.Alt, 300),
            Caption = CleanText(mediaAsset.Caption, 500),
            Source = CleanText(mediaAsset.Source, 180),
            SourceUrl = CleanUrl(mediaAsset.SourceUrl, required: false),
            LicenseStatus = AllowedOrDefault(mediaAsset.LicenseStatus, AllowedLicenseStatuses, "unknown"),
            UsageStatus = AllowedOrDefault(mediaAsset.UsageStatus, AllowedUsageStatuses, "unused"),
            Width = width,
            Height = height,
            MimeType = CleanText(mediaAsset.MimeType, 120),
            FileSize = fileSize,
            FocalPoint = new MediaAssetFocalPoint
            {
                X = ClampNullable(focalPoint.X),
                Y = ClampNullable(focalPoint.Y)
            },
            Decorative = mediaAsset.Decorative,
            Tags = CleanList(mediaAsset.Tags ?? new List<string>(), 30, 80),
            Notes = CleanText(mediaAsset.Notes, 1000),
            LastReviewedAt = CleanText(mediaAsset.LastReviewedAt, 80),
            ReviewedBy = CleanText(mediaAsset.ReviewedBy, 180),
            UsageReferences = (mediaAsset.UsageReferences ?? new List<MediaAssetUsageReference>())
                .Select(SanitizeUsageReference)
                .Where(reference => !string.IsNullOrWhiteSpace(reference.PageSlug) || !string.IsNullOrWhiteSpace(reference.FieldPath))
                .Take(200)
                .ToList()
        };
    }

    private static MediaAssetUsageReference SanitizeUsageReference(MediaAssetUsageReference reference)
    {
        return new MediaAssetUsageReference
        {
            PageId = CleanText(reference.PageId, 160),
            PageSlug = CleanText(reference.PageSlug, 180),
            FieldPath = CleanText(reference.FieldPath, 260),
            BlockType = CleanText(reference.BlockType, 80),
            ImageRole = CleanText(reference.ImageRole, 80)
        };
    }

    private static string CleanUrl(string value, bool required)
    {
        var clean = CleanText(value, 1200);
        if (string.IsNullOrWhiteSpace(clean))
        {
            if (required)
                throw new ArgumentException("Media asset URL is required");
            return string.Empty;
        }

        var lower = clean.ToLowerInvariant();
        if (lower.Contains(".env") || lower.Contains("appsettings") || lower.StartsWith("file:", StringComparison.Ordinal))
            throw new ArgumentException("Media asset URL cannot reference local config files");
        if (lower.StartsWith("javascript:", StringComparison.Ordinal) || lower.StartsWith("data:", StringComparison.Ordinal))
            throw new ArgumentException("Media asset URL scheme is not allowed");
        if (clean.Contains('<') || clean.Contains('>'))
            throw new ArgumentException("Media asset URL cannot include markup");

        if (Uri.TryCreate(clean, UriKind.Absolute, out var absoluteUri))
        {
            if (absoluteUri.Scheme != Uri.UriSchemeHttp && absoluteUri.Scheme != Uri.UriSchemeHttps)
                throw new ArgumentException("Media asset URL must use http or https");
            return clean;
        }

        if (clean.StartsWith("/", StringComparison.Ordinal) && !clean.StartsWith("//", StringComparison.Ordinal))
            return clean;

        throw new ArgumentException("Media asset URL must be an absolute http(s) URL or a site-root-relative path");
    }

    private static string CleanFileName(string fileName, string url)
    {
        var cleanFileName = CleanText(fileName, 180);
        if (!string.IsNullOrWhiteSpace(cleanFileName))
            return cleanFileName;

        var cleanUrl = CleanText(url, 1200);
        if (Uri.TryCreate(cleanUrl, UriKind.Absolute, out var uri))
            return CleanText(Path.GetFileName(uri.LocalPath), 180);

        return CleanText(Path.GetFileName(cleanUrl), 180);
    }

    private static string AllowedOrDefault(string value, HashSet<string> allowedValues, string fallback)
    {
        var cleanValue = CleanText(value, 120);
        return allowedValues.Contains(cleanValue) ? cleanValue : fallback;
    }

    private static List<string> CleanList(IEnumerable<string> values, int maxItems, int maxLength)
    {
        return values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => CleanText(value, maxLength))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(maxItems)
            .ToList();
    }

    private static double? ClampNullable(double? value)
    {
        if (!value.HasValue)
            return null;

        if (double.IsNaN(value.Value) || double.IsInfinity(value.Value))
            return null;

        return Math.Clamp(value.Value, 0, 1);
    }

    private static string SanitizeId(string value)
    {
        var clean = CleanText(value, 180);
        var chars = clean.Select(character =>
            char.IsLetterOrDigit(character) || character == '-' || character == '_' ? character : '-').ToArray();
        return new string(chars).Trim('-').ToLowerInvariant();
    }

    private static string CleanText(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var clean = value.Replace("\r", " ").Replace("\n", " ").Trim();
        return clean.Length <= maxLength ? clean : clean[..maxLength];
    }
}
