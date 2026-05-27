using System.Buffers.Binary;
using System.Security.Cryptography;

namespace pumpkin_api.Services;

public interface IMediaStorageService
{
    string ProviderName { get; }
    string StorageContainer { get; }
    long MaxUploadBytes { get; }
    Task<StoredMediaObject> StoreAsync(string tenantId, string safeFileName, string mimeType, byte[] bytes, CancellationToken cancellationToken);
}

public sealed record StoredMediaObject(
    string StorageProvider,
    string StorageContainer,
    string BlobPath,
    string PublicUrl,
    string ThumbnailUrl);

public sealed record MediaImageInfo(int? Width, int? Height);

public static class MediaUploadPolicy
{
    private static readonly Dictionary<string, string[]> AllowedExtensionsByMime = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = new[] { ".jpg", ".jpeg" },
        ["image/png"] = new[] { ".png" },
        ["image/webp"] = new[] { ".webp" }
    };

    public static void ValidateUpload(string fileName, string mimeType, long sizeBytes, long maxUploadBytes)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("Uploaded media file name is required.");
        if (sizeBytes <= 0)
            throw new ArgumentException("Uploaded media file is empty.");
        if (sizeBytes > maxUploadBytes)
            throw new ArgumentException($"Uploaded media file exceeds the configured {maxUploadBytes / 1024 / 1024} MB limit.");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (extension == ".svg")
            throw new ArgumentException("SVG upload is blocked until a dedicated SVG sanitizer is implemented.");
        if (!AllowedExtensionsByMime.TryGetValue(mimeType, out var allowedExtensions))
            throw new ArgumentException("Unsupported media MIME type. Allowed types are image/jpeg, image/png, and image/webp.");
        if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("Uploaded media file extension does not match the allowed image type list.");
    }

    public static string BuildSafeFileName(string originalFileName, string checksum)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (extension == ".jpeg")
            extension = ".jpg";

        var baseName = Path.GetFileNameWithoutExtension(originalFileName);
        var safeChars = baseName.Select(character =>
            char.IsLetterOrDigit(character) || character == '-' || character == '_' ? char.ToLowerInvariant(character) : '-').ToArray();
        var safeBase = new string(safeChars).Trim('-');
        if (string.IsNullOrWhiteSpace(safeBase))
            safeBase = "media";

        var suffix = checksum.Length >= 12 ? checksum[..12] : Guid.NewGuid().ToString("N")[..12];
        return $"{safeBase}-{suffix}{extension}";
    }

    public static string ComputeSha256(byte[] bytes)
    {
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static MediaImageInfo InspectImage(byte[] bytes, string mimeType)
    {
        return mimeType.ToLowerInvariant() switch
        {
            "image/png" => InspectPng(bytes),
            "image/jpeg" => InspectJpeg(bytes),
            "image/webp" => InspectWebp(bytes),
            _ => new MediaImageInfo(null, null)
        };
    }

    private static MediaImageInfo InspectPng(byte[] bytes)
    {
        if (bytes.Length < 24) return new MediaImageInfo(null, null);
        var signature = new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 };
        if (!bytes.Take(signature.Length).SequenceEqual(signature)) return new MediaImageInfo(null, null);

        var width = BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(16, 4));
        var height = BinaryPrimitives.ReadInt32BigEndian(bytes.AsSpan(20, 4));
        return width > 0 && height > 0 ? new MediaImageInfo(width, height) : new MediaImageInfo(null, null);
    }

    private static MediaImageInfo InspectJpeg(byte[] bytes)
    {
        if (bytes.Length < 4 || bytes[0] != 0xFF || bytes[1] != 0xD8) return new MediaImageInfo(null, null);

        var index = 2;
        while (index + 9 < bytes.Length)
        {
            if (bytes[index] != 0xFF)
            {
                index++;
                continue;
            }

            while (index < bytes.Length && bytes[index] == 0xFF) index++;
            if (index >= bytes.Length) break;

            var marker = bytes[index++];
            if (marker == 0xD9 || marker == 0xDA) break;
            if (index + 2 > bytes.Length) break;

            var length = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(index, 2));
            if (length < 2 || index + length > bytes.Length) break;

            if (IsJpegStartOfFrame(marker) && length >= 7)
            {
                var height = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(index + 3, 2));
                var width = BinaryPrimitives.ReadUInt16BigEndian(bytes.AsSpan(index + 5, 2));
                return width > 0 && height > 0 ? new MediaImageInfo(width, height) : new MediaImageInfo(null, null);
            }

            index += length;
        }

        return new MediaImageInfo(null, null);
    }

    private static bool IsJpegStartOfFrame(byte marker)
    {
        return marker is 0xC0 or 0xC1 or 0xC2 or 0xC3 or 0xC5 or 0xC6 or 0xC7 or 0xC9 or 0xCA or 0xCB or 0xCD or 0xCE or 0xCF;
    }

    private static MediaImageInfo InspectWebp(byte[] bytes)
    {
        if (bytes.Length < 30) return new MediaImageInfo(null, null);
        if (ReadAscii(bytes, 0, 4) != "RIFF" || ReadAscii(bytes, 8, 4) != "WEBP") return new MediaImageInfo(null, null);

        var chunk = ReadAscii(bytes, 12, 4);
        if (chunk == "VP8X" && bytes.Length >= 30)
        {
            var widthMinusOne = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
            var heightMinusOne = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
            return new MediaImageInfo(widthMinusOne + 1, heightMinusOne + 1);
        }

        if (chunk == "VP8L" && bytes.Length >= 25 && bytes[20] == 0x2F)
        {
            var b1 = bytes[21];
            var b2 = bytes[22];
            var b3 = bytes[23];
            var b4 = bytes[24];
            var width = 1 + (((b2 & 0x3F) << 8) | b1);
            var height = 1 + (((b4 & 0x0F) << 10) | (b3 << 2) | ((b2 & 0xC0) >> 6));
            return new MediaImageInfo(width, height);
        }

        if (chunk == "VP8 " && bytes.Length >= 30 && bytes[23] == 0x9D && bytes[24] == 0x01 && bytes[25] == 0x2A)
        {
            var width = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(26, 2)) & 0x3FFF;
            var height = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(28, 2)) & 0x3FFF;
            return width > 0 && height > 0 ? new MediaImageInfo(width, height) : new MediaImageInfo(null, null);
        }

        return new MediaImageInfo(null, null);
    }

    private static string ReadAscii(byte[] bytes, int start, int length)
    {
        if (bytes.Length < start + length) return string.Empty;
        return System.Text.Encoding.ASCII.GetString(bytes, start, length);
    }
}

public sealed class MediaStorageService : IMediaStorageService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public MediaStorageService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
        ProviderName = GetSetting("ICE_MEDIA_STORAGE_PROVIDER", "local-dev");
        StorageContainer = GetSetting("ICE_MEDIA_STORAGE_CONTAINER", "media-assets");
        MaxUploadBytes = ResolveMaxUploadBytes();
    }

    public string ProviderName { get; }
    public string StorageContainer { get; }
    public long MaxUploadBytes { get; }

    public async Task<StoredMediaObject> StoreAsync(string tenantId, string safeFileName, string mimeType, byte[] bytes, CancellationToken cancellationToken)
    {
        if (ProviderName.Equals("azure-blob", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Azure Blob media storage is configuration-ready but not enabled in this local build. Configure the Azure provider with placeholder app settings before production use.");

        if (!ProviderName.Equals("local-dev", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Unsupported media storage provider '{ProviderName}'.");

        var tenantSegment = SanitizePathSegment(tenantId);
        var dateSegment = DateTime.UtcNow.ToString("yyyy/MM");
        var blobPath = $"{tenantSegment}/{dateSegment}/{safeFileName}";
        var root = Path.Combine(_environment.ContentRootPath, ".local-media");
        var fullPath = Path.Combine(root, tenantSegment, DateTime.UtcNow.ToString("yyyy"), DateTime.UtcNow.ToString("MM"), safeFileName);
        var directory = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(directory))
            Directory.CreateDirectory(directory);

        await File.WriteAllBytesAsync(fullPath, bytes, cancellationToken);

        var publicBaseUrl = GetSetting("ICE_MEDIA_PUBLIC_BASE_URL", "/media").TrimEnd('/');
        var publicUrl = $"{publicBaseUrl}/{blobPath.Replace('\\', '/')}";
        return new StoredMediaObject("local-dev", StorageContainer, blobPath, publicUrl, publicUrl);
    }

    private long ResolveMaxUploadBytes()
    {
        var value = GetSetting("ICE_MEDIA_UPLOAD_MAX_MB", "10");
        return int.TryParse(value, out var megabytes) && megabytes > 0
            ? megabytes * 1024L * 1024L
            : 10L * 1024L * 1024L;
    }

    private string GetSetting(string key, string fallback)
    {
        return Environment.GetEnvironmentVariable(key)
            ?? _configuration[key]
            ?? fallback;
    }

    private static string SanitizePathSegment(string value)
    {
        var chars = value.Select(character =>
            char.IsLetterOrDigit(character) || character == '-' || character == '_' ? char.ToLowerInvariant(character) : '-').ToArray();
        var clean = new string(chars).Trim('-');
        return string.IsNullOrWhiteSpace(clean) ? "tenant" : clean;
    }
}
