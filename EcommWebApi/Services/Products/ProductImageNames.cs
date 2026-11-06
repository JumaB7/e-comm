namespace EcommWebApi.Services.Products;

public static class ProductImageNames
{
    public const long MaxBytes = 2_500_000;

    public static readonly string[] StoredExtensions = [".jpg", ".png", ".webp"];

    public static string PublicPath(string fileName) => $"/api/product-images/{fileName}";

    public static string ContentType(string fileName) => Path.GetExtension(fileName).ToLowerInvariant() switch
    {
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".jpg" => "image/jpeg",
        _ => throw new InvalidOperationException("Use a JPG, PNG, or WebP image."),
    };

    public static bool IsSafeSku(string sku)
    {
        if (string.IsNullOrWhiteSpace(sku) || sku.Length > 64)
        {
            return false;
        }

        foreach (var character in sku)
        {
            if (character is not ((>= 'A' and <= 'Z') or (>= 'a' and <= 'z') or (>= '0' and <= '9') or '-'))
            {
                return false;
            }
        }

        return true;
    }

    public static void EnsureSku(string sku)
    {
        if (!IsSafeSku(sku))
        {
            throw new InvalidOperationException("The SKU cannot be used as an image name.");
        }
    }

    public static bool TryBlobName(string fileName, out string blobName)
    {
        blobName = "";
        if (string.IsNullOrWhiteSpace(fileName)
            || fileName.Contains('/', StringComparison.Ordinal)
            || fileName.Contains('\\', StringComparison.Ordinal)
            || fileName.Contains("..", StringComparison.Ordinal))
        {
            return false;
        }

        var name = Path.GetFileName(fileName);
        if (!string.Equals(name, fileName, StringComparison.Ordinal))
        {
            return false;
        }

        var rawExtension = Path.GetExtension(name);
        if (rawExtension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var extension = NormalizeExtension(rawExtension);
        if (extension is null)
        {
            return false;
        }

        var sku = Path.GetFileNameWithoutExtension(name);
        if (!IsSafeSku(sku))
        {
            return false;
        }

        blobName = sku + extension;
        return PublicPath(blobName).Length <= 200;
    }

    public static string BlobNameFor(string sku, string extension)
    {
        EnsureSku(sku);
        var normalized = NormalizeExtension(extension);
        if (normalized is null)
        {
            throw new InvalidOperationException("Use a JPG, PNG, or WebP image.");
        }

        var name = sku + normalized;
        if (PublicPath(name).Length > 200)
        {
            throw new InvalidOperationException("The SKU cannot be used as an image name.");
        }

        return name;
    }

    public static string? NormalizeExtension(string extension)
    {
        if (extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase)
            || extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase))
        {
            return ".jpg";
        }

        if (extension.Equals(".png", StringComparison.OrdinalIgnoreCase))
        {
            return ".png";
        }

        if (extension.Equals(".webp", StringComparison.OrdinalIgnoreCase))
        {
            return ".webp";
        }

        return null;
    }

    public static string? SniffExtension(ReadOnlySpan<byte> data)
    {
        if (data.Length >= 3 && data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF)
        {
            return ".jpg";
        }

        if (data.Length >= 8
            && data[0] == 0x89
            && data[1] == 0x50
            && data[2] == 0x4E
            && data[3] == 0x47
            && data[4] == 0x0D
            && data[5] == 0x0A
            && data[6] == 0x1A
            && data[7] == 0x0A)
        {
            return ".png";
        }

        if (data.Length >= 12
            && data[0] == (byte)'R'
            && data[1] == (byte)'I'
            && data[2] == (byte)'F'
            && data[3] == (byte)'F'
            && data[8] == (byte)'W'
            && data[9] == (byte)'E'
            && data[10] == (byte)'B'
            && data[11] == (byte)'P')
        {
            return ".webp";
        }

        return null;
    }
}
