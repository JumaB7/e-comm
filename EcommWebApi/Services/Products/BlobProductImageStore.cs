using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace EcommWebApi.Services.Products;

public sealed class BlobProductImageStore(BlobContainerClient container) : IProductImageStore
{
    public async Task<string> Save(string sku, IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Choose an image file.");
        }

        var declared = ProductImageNames.NormalizeExtension(Path.GetExtension(file.FileName));
        if (declared is null)
        {
            throw new InvalidOperationException("Use a JPG, PNG, or WebP image.");
        }

        var bytes = await ReadLimited(file, cancellationToken);
        var detected = ProductImageNames.SniffExtension(bytes);
        if (detected is null || detected != declared)
        {
            throw new InvalidOperationException("That file is not a valid JPG, PNG, or WebP image.");
        }

        var blobName = ProductImageNames.BlobNameFor(sku, detected);
        var blob = container.GetBlobClient(blobName);
        await using var stream = new MemoryStream(bytes, writable: false);
        await blob.UploadAsync(stream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = ProductImageNames.ContentType(blobName),
            },
        }, cancellationToken);

        await DeleteOtherExtensions(sku, detected, cancellationToken);
        return ProductImageNames.PublicPath(blobName);
    }

    public async Task<string?> FindPath(string sku, CancellationToken cancellationToken = default)
    {
        var blobName = await FindBlobName(sku, cancellationToken);
        return blobName is null ? null : ProductImageNames.PublicPath(blobName);
    }

    public async Task<ProductImageContent?> FindPathByFileName(string fileName, CancellationToken cancellationToken = default)
    {
        if (!ProductImageNames.TryBlobName(fileName, out var blobName))
        {
            return null;
        }

        var blob = container.GetBlobClient(blobName);
        try
        {
            var stream = await blob.OpenReadAsync(new BlobOpenReadOptions(false), cancellationToken);
            return new ProductImageContent(stream, ProductImageNames.ContentType(blobName));
        }
        catch (RequestFailedException error) when (error.Status == StatusCodes.Status404NotFound)
        {
            return null;
        }
    }

    public async Task Remove(string sku, CancellationToken cancellationToken = default)
    {
        ProductImageNames.EnsureSku(sku);
        foreach (var extension in ProductImageNames.StoredExtensions)
        {
            await container.GetBlobClient(sku + extension).DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
    }

    public async Task<string?> Rename(string fromSku, string toSku, CancellationToken cancellationToken = default)
    {
        ProductImageNames.EnsureSku(fromSku);
        ProductImageNames.EnsureSku(toSku);
        if (fromSku.Equals(toSku, StringComparison.Ordinal))
        {
            return null;
        }

        var sourceName = await FindBlobName(fromSku, cancellationToken);
        if (sourceName is null)
        {
            return null;
        }

        var extension = Path.GetExtension(sourceName);
        var destinationName = ProductImageNames.BlobNameFor(toSku, extension);
        var source = container.GetBlobClient(sourceName);
        var destination = container.GetBlobClient(destinationName);
        // Blob storage has no rename. Copy first, and delete the original only after that copy succeeds.
        await using (var sourceStream = await source.OpenReadAsync(new BlobOpenReadOptions(false), cancellationToken))
        {
            await destination.UploadAsync(sourceStream, new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = ProductImageNames.ContentType(destinationName),
                },
            }, cancellationToken);
        }

        await DeleteOtherExtensions(toSku, extension, cancellationToken);
        await source.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        return ProductImageNames.PublicPath(destinationName);
    }

    private async Task<string?> FindBlobName(string sku, CancellationToken cancellationToken)
    {
        if (!ProductImageNames.IsSafeSku(sku))
        {
            return null;
        }

        foreach (var extension in ProductImageNames.StoredExtensions)
        {
            var blobName = sku + extension;
            var exists = await container.GetBlobClient(blobName).ExistsAsync(cancellationToken);
            if (exists.Value)
            {
                return blobName;
            }
        }

        return null;
    }

    private async Task DeleteOtherExtensions(string sku, string keepExtension, CancellationToken cancellationToken)
    {
        foreach (var extension in ProductImageNames.StoredExtensions)
        {
            if (extension.Equals(keepExtension, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            await container.GetBlobClient(sku + extension).DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
    }

    private static async Task<byte[]> ReadLimited(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length > ProductImageNames.MaxBytes)
        {
            throw new InvalidOperationException("Keep the image under 2.5 MB.");
        }

        await using var input = file.OpenReadStream();
        using var buffer = new MemoryStream();
        var chunk = new byte[81920];
        while (true)
        {
            var read = await input.ReadAsync(chunk, cancellationToken);
            if (read == 0)
            {
                break;
            }

            if (buffer.Length + read > ProductImageNames.MaxBytes)
            {
                throw new InvalidOperationException("Keep the image under 2.5 MB.");
            }

            buffer.Write(chunk, 0, read);
        }

        if (buffer.Length == 0)
        {
            throw new InvalidOperationException("Choose an image file.");
        }

        return buffer.ToArray();
    }
}
