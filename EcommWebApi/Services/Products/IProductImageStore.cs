namespace EcommWebApi.Services.Products;

public interface IProductImageStore
{
    Task<string> Save(string sku, IFormFile file, CancellationToken cancellationToken = default);

    Task<string?> FindPath(string sku, CancellationToken cancellationToken = default);

    Task<ProductImageContent?> FindPathByFileName(string fileName, CancellationToken cancellationToken = default);

    Task Remove(string sku, CancellationToken cancellationToken = default);

    Task<string?> Rename(string fromSku, string toSku, CancellationToken cancellationToken = default);
}
