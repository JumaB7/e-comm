using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Products;

public interface IProductService
{
    Task<List<ProductModel>> List();

    Task<ProductModel?> Get(string sku);

    Task<ShopOutcome<ProductModel>> Add(CreateProductRequest request);

    Task<ShopOutcome<ProductModel>> Update(string sku, CreateProductRequest request);

    Task<bool> Delete(string sku);

    Task<ShopOutcome<ProductModel>> AdjustStock(StockRequest request);

    Task<ShopOutcome<ProductModel>> SetImage(string sku, IFormFile file);
}
