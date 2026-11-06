namespace EcommWebApi.Services.Products;

public class ProductImageStore(IWebHostEnvironment env)
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    };

    private string Folder => Path.Combine(env.ContentRootPath, "wwwroot", "products");

    public async Task<string> Save(string sku, IFormFile file)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Choose an image file.");
        }
        if (file.Length > 2_500_000)
        {
            throw new InvalidOperationException("Keep the image under 2.5 MB.");
        }
        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !Allowed.Contains(ext))
        {
            throw new InvalidOperationException("Use a JPG, PNG, or WebP image.");
        }
        if (ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            ext = ".jpg";
        }
        Directory.CreateDirectory(Folder);
        Remove(sku);
        var name = $"{sku}{ext.ToLowerInvariant()}";
        var path = Path.Combine(Folder, name);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream);
        return PublicPath(name);
    }

    public string? FindPath(string sku)
    {
        if (!Directory.Exists(Folder))
        {
            return null;
        }
        return Directory.EnumerateFiles(Folder, $"{sku}.*").FirstOrDefault();
    }

    public string? FindPathByFileName(string fileName)
    {
        var name = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(name) || name != fileName || name.Contains("..", StringComparison.Ordinal))
        {
            return null;
        }
        var path = Path.Combine(Folder, name);
        return File.Exists(path) ? path : null;
    }

    public void Remove(string sku)
    {
        if (!Directory.Exists(Folder))
        {
            return;
        }
        foreach (var path in Directory.EnumerateFiles(Folder, $"{sku}.*"))
        {
            File.Delete(path);
        }
    }

    public string? Rename(string fromSku, string toSku)
    {
        if (!Directory.Exists(Folder) || fromSku.Equals(toSku, StringComparison.Ordinal))
        {
            return null;
        }
        var existing = Directory.EnumerateFiles(Folder, $"{fromSku}.*").FirstOrDefault();
        if (existing is null)
        {
            return null;
        }
        var ext = Path.GetExtension(existing);
        Remove(toSku);
        var name = $"{toSku}{ext}";
        var next = Path.Combine(Folder, name);
        File.Move(existing, next, overwrite: true);
        return PublicPath(name);
    }

    public static string PublicPath(string fileName) => ProductImageNames.PublicPath(fileName);

    public static string ContentType(string path) => Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".png" => "image/png",
        ".webp" => "image/webp",
        _ => "image/jpeg",
    };
}
