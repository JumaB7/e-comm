using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ShopDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<ProductModel>> List()
    {
        var products = await db.Products.Include(product => product.Specs).OrderBy(product => product.Id).ToListAsync();
        return products.Select(OrderMapper.Product).ToList();
    }

    [HttpGet("{sku}")]
    public async Task<ActionResult<ProductModel>> Get(string sku)
    {
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Sku == sku);
        return product is null ? NotFound() : OrderMapper.Product(product);
    }
}
