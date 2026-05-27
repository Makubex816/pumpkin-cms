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

    private static readonly HashSet<string> AllowedAssetStatuses = new(StringComparer.Ordinal)
    {
        "draft",
        "active",
        "archived",
        "replaced",
        "deleted-pending"
    };

    private static readonly HashSet<string> AllowedUsageTypes = new(StringComparer.Ordinal)
    {
        "hero",
        "card",
        "gallery",
        "og-image",
        "icon",
        "background",
        "inline",
        "document"
    };

    private static readonly HashSet<string> AllowedStorageProviders = new(StringComparer.Ordinal)
    {
        "local-dev",
        "azure-blob",
        "external"
    };

    public static MediaAsset PrepareForCreate(MediaAsset mediaAsset, string tenantId, string createdBy)
    {
        if (mediaAsset == null)
            throw new ArgumentException("Media asset data is required");

        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("Tenant ID is required");

        var url = CleanUrl(FirstNonBlank(mediaAsset.PublicUrl, mediaAsset.Url), required: true);
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
        prepared.UploadedBy = CleanText(FirstNonBlank(mediaAsset.UploadedBy, createdBy), 180);
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
        prepared.UploadedBy = string.IsNullOrWhiteSpace(existing.UploadedBy) ? existing.CreatedBy : existing.UploadedBy;
        prepared.UpdatedAt = DateTime.UtcNow.ToString("O");
        return prepared;
    }

    private static MediaAsset PrepareCommon(MediaAsset mediaAsset, string tenantId, string assetId, string actor)
    {
        int? width = mediaAsset.Width.HasValue ? Math.Max(0, mediaAsset.Width.Value) : null;
        int? height = mediaAsset.Height.HasValue ? Math.Max(0, mediaAsset.Height.Value) : null;
        long? fileSize = FirstPositiveNullable(mediaAsset.SizeBytes, mediaAsset.FileSize);
        var publicUrl = CleanUrl(FirstNonBlank(mediaAsset.PublicUrl, mediaAsset.Url), required: true);
        var originalFileName = CleanFileName(FirstNonBlank(mediaAsset.OriginalFileName, mediaAsset.FileName), publicUrl);
        var safeFileName = CleanSafeFileName(FirstNonBlank(mediaAsset.SafeFileName, originalFileName, mediaAsset.AssetId));
        var altText = CleanText(FirstNonBlank(mediaAsset.AltText, mediaAsset.Alt), 300);
        var credit = CleanText(FirstNonBlank(mediaAsset.Credit, mediaAsset.Source), 180);
        var license = CleanText(FirstNonBlank(mediaAsset.License, mediaAsset.LicenseStatus), 180);
        var storageProvider = AllowedOrDefault(mediaAsset.StorageProvider, AllowedStorageProviders, "external");
        var focalPoint = mediaAsset.FocalPoint ?? new MediaAssetFocalPoint();
        var usageReferences = (mediaAsset.UsageReferences ?? new List<MediaAssetUsageReference>())
            .Select(SanitizeUsageReference)
            .Where(reference => !string.IsNullOrWhiteSpace(reference.PageSlug) || !string.IsNullOrWhiteSpace(reference.FieldPath))
            .Take(200)
            .ToList();
        var usedByPages = (mediaAsset.UsedByPages ?? usageReferences)
            .Select(SanitizeUsageReference)
            .Where(reference => !string.IsNullOrWhiteSpace(reference.PageSlug) || !string.IsNullOrWhiteSpace(reference.FieldPath))
            .Take(200)
            .ToList();

        return new MediaAsset
        {
            TenantId = tenantId,
            SiteKey = CleanText(mediaAsset.SiteKey, 120),
            AssetId = assetId,
            Status = AllowedOrDefault(mediaAsset.Status, AllowedAssetStatuses, "draft"),
            Url = publicUrl,
            PublicUrl = publicUrl,
            ThumbnailUrl = CleanUrl(mediaAsset.ThumbnailUrl, required: false),
            FileName = originalFileName,
            OriginalFileName = originalFileName,
            SafeFileName = safeFileName,
            Title = CleanText(mediaAsset.Title, 180),
            Alt = altText,
            AltText = altText,
            Caption = CleanText(mediaAsset.Caption, 500),
            Source = credit,
            Credit = credit,
            License = license,
            SourceUrl = CleanUrl(mediaAsset.SourceUrl, required: false),
            UsageType = AllowedOrDefault(mediaAsset.UsageType, AllowedUsageTypes, "inline"),
            LicenseStatus = AllowedOrDefault(mediaAsset.LicenseStatus, AllowedLicenseStatuses, "unknown"),
            UsageStatus = AllowedOrDefault(mediaAsset.UsageStatus, AllowedUsageStatuses, "unused"),
            Width = width,
            Height = height,
            MimeType = CleanText(mediaAsset.MimeType, 120),
            Extension = CleanExtension(mediaAsset.Extension, originalFileName, publicUrl),
            FileSize = fileSize,
            SizeBytes = fileSize,
            Checksum = CleanChecksum(mediaAsset.Checksum),
            Hash = CleanChecksum(FirstNonBlank(mediaAsset.Hash, mediaAsset.Checksum)),
            StorageProvider = storageProvider,
            StorageContainer = CleanText(mediaAsset.StorageContainer, 180),
            BlobPath = CleanBlobPath(mediaAsset.BlobPath),
            FocalPoint = new MediaAssetFocalPoint
            {
                X = ClampNullable(focalPoint.X),
                Y = ClampNullable(focalPoint.Y)
            },
            Decorative = mediaAsset.Decorative,
            Tags = CleanList(mediaAsset.Tags ?? new List<string>(), 30, 80),
            Notes = CleanText(mediaAsset.Notes, 1000),
            Variants = (mediaAsset.Variants ?? new List<MediaAssetVariant>())
                .Select(SanitizeVariant)
                .Where(variant => !string.IsNullOrWhiteSpace(variant.Name) && !string.IsNullOrWhiteSpace(variant.PublicUrl))
                .Take(20)
                .ToList(),
            LastReviewedAt = CleanText(mediaAsset.LastReviewedAt, 80),
            ReviewedBy = CleanText(mediaAsset.ReviewedBy, 180),
            UsageReferences = usageReferences,
            UsedByPages = usedByPages,
            ReplacedByMediaAssetId = SanitizeId(mediaAsset.ReplacedByMediaAssetId),
            ArchivedAt = CleanText(mediaAsset.ArchivedAt, 80),
            ArchivedBy = CleanText(mediaAsset.ArchivedBy, 180)
        };
    }

    private static MediaAssetVariant SanitizeVariant(MediaAssetVariant variant)
    {
        var publicUrl = CleanUrl(FirstNonBlank(variant.PublicUrl, variant.Url), required: false);
        return new MediaAssetVariant
        {
            Name = CleanText(variant.Name, 80),
            Url = publicUrl,
            PublicUrl = publicUrl,
            Width = variant.Width.HasValue ? Math.Max(0, variant.Width.Value) : null,
            Height = variant.Height.HasValue ? Math.Max(0, variant.Height.Value) : null,
            MimeType = CleanText(variant.MimeType, 120),
            SizeBytes = variant.SizeBytes.HasValue ? Math.Max(0, variant.SizeBytes.Value) : null,
            StorageProvider = AllowedOrDefault(variant.StorageProvider, AllowedStorageProviders, "external"),
            BlobPath = CleanBlobPath(variant.BlobPath),
            GeneratedAt = CleanText(variant.GeneratedAt, 80),
            Status = AllowedOrDefault(variant.Status, new HashSet<string>(StringComparer.Ordinal) { "available", "planned", "failed" }, "available")
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
        if (lower.StartsWith("javascript:", StringComparison.Ordinal) ||
            lower.StartsWith("data:", StringComparison.Ordinal) ||
            lower.StartsWith("vbscript:", StringComparison.Ordinal) ||
            lower.StartsWith("blob:", StringComparison.Ordinal))
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

    private static string CleanSafeFileName(string fileName)
    {
        var clean = CleanText(fileName, 180);
        var extension = Path.GetExtension(clean).ToLowerInvariant();
        var baseName = Path.GetFileNameWithoutExtension(clean);
        var chars = baseName.Select(character =>
            char.IsLetterOrDigit(character) || character == '-' || character == '_' ? char.ToLowerInvariant(character) : '-').ToArray();
        var safeBase = new string(chars).Trim('-');
        if (string.IsNullOrWhiteSpace(safeBase))
            safeBase = "media-asset";

        return $"{safeBase}{extension}";
    }

    private static string CleanExtension(string extension, string fileName, string url)
    {
        var clean = CleanText(extension, 20).Trim().ToLowerInvariant();
        if (!clean.StartsWith(".", StringComparison.Ordinal) && !string.IsNullOrWhiteSpace(clean))
            clean = $".{clean}";
        if (string.IsNullOrWhiteSpace(clean))
            clean = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(clean))
            clean = Path.GetExtension(url).ToLowerInvariant();

        var chars = clean.Where(character => char.IsLetterOrDigit(character) || character == '.').ToArray();
        clean = new string(chars);
        return clean.Length <= 20 ? clean : clean[..20];
    }

    private static string CleanChecksum(string value)
    {
        var clean = CleanText(value, 128).ToLowerInvariant();
        return new string(clean.Where(Uri.IsHexDigit).ToArray());
    }

    private static string CleanBlobPath(string value)
    {
        var clean = CleanText(value, 500).Replace('\\', '/');
        if (clean.Contains("..", StringComparison.Ordinal) || clean.StartsWith("/", StringComparison.Ordinal))
            throw new ArgumentException("Media asset blob path must be relative and cannot traverse directories");
        return clean;
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

    private static long? FirstPositiveNullable(params long?[] values)
    {
        foreach (var value in values)
        {
            if (value.HasValue)
                return Math.Max(0, value.Value);
        }

        return null;
    }

    private static string FirstNonBlank(params string[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return string.Empty;
    }

    private static string CleanText(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var clean = value.Replace("\r", " ").Replace("\n", " ").Trim();
        return clean.Length <= maxLength ? clean : clean[..maxLength];
    }
}
