using EcommWebApi.Contracts;
using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet]
    public Task<List<ProductModel>> List() => products.List();

    [HttpGet("{sku}")]
    public async Task<ActionResult<ProductModel>> Get(string sku)
    {
        var product = await products.Get(sku);
        return product is null ? NotFound() : product;
    }
}
