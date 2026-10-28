using EcommWebApi.Contracts;
using EcommWebApi.Services.Orders;
using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController(IOrderService orders, IProductService products) : ControllerBase
{
    [HttpGet("orders")]
    public Task<List<OrderModel>> Orders() => orders.List();

    [HttpGet("orders/summary")]
    public Task<OrderSummaryModel> Summary() => orders.Summary();

    [HttpGet("orders/{number}")]
    public async Task<ActionResult<OrderModel>> Order(string number)
    {
        var order = await orders.Get(number);
        return order is null ? NotFound() : order;
    }

    [HttpPost("orders/{number}/pack")]
    public async Task<ActionResult<OrderModel>> Pack(string number)
    {
        var order = await orders.Pack(number);
        return order is null ? NotFound() : order;
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductModel>> AddProduct(CreateProductRequest request) =>
        ShopResults.From(await products.Add(request));

    [HttpDelete("products/{sku}")]
    public async Task<IActionResult> DeleteProduct(string sku) =>
        await products.Delete(sku) ? NoContent() : NotFound();

    [HttpPost("stock")]
    public async Task<ActionResult<ProductModel>> AdjustStock(StockRequest request) =>
        ShopResults.From(await products.AdjustStock(request));

    [HttpGet("sales")]
    public Task<SalesModel> Sales() => orders.Sales();
}
