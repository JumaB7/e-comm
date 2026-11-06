using EcommWebApi.Contracts;
using EcommWebApi.Services.Auth;
using EcommWebApi.Services.Orders;
using EcommWebApi.Services.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController(IOrderService orders, IProductService products, IAuthService auth) : ControllerBase
{
    /// <summary>Clears refresh tokens for a suspected stolen session. Does not change Role.</summary>
    [HttpPost("users/{id:int}/revoke-sessions")]
    public async Task<ActionResult<MessageModel>> RevokeUserSessions(int id) =>
        ShopResults.From(await auth.RevokeSessions(id));

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

    [HttpPost("orders/{number}/ship")]
    public async Task<ActionResult<OrderModel>> Ship(string number, TrackingRequest request) =>
        ShopResults.From(await orders.Ship(number, request.Tracking));

    [HttpPost("orders/{number}/complete")]
    public async Task<ActionResult<OrderModel>> Complete(string number) =>
        ShopResults.From(await orders.Complete(number));

    [HttpPost("products")]
    public async Task<ActionResult<ProductModel>> AddProduct(CreateProductRequest request) =>
        ShopResults.From(await products.Add(request));

    [HttpPut("products/{sku}")]
    public async Task<ActionResult<ProductModel>> UpdateProduct(string sku, CreateProductRequest request) =>
        ShopResults.From(await products.Update(sku, request));

    [HttpPost("products/{sku}/image")]
    [RequestSizeLimit(3_000_000)]
    public async Task<ActionResult<ProductModel>> UploadProductImage(string sku, IFormFile? file)
    {
        if (file is null)
        {
            return BadRequest(new MessageModel("Choose an image file."));
        }
        return ShopResults.From(await products.SetImage(sku, file));
    }

    [HttpDelete("products/{sku}")]
    public async Task<IActionResult> DeleteProduct(string sku) =>
        await products.Delete(sku) ? NoContent() : NotFound();

    [HttpPost("stock")]
    public async Task<ActionResult<ProductModel>> AdjustStock(StockRequest request) =>
        ShopResults.From(await products.AdjustStock(request));

    [HttpGet("sales")]
    public Task<SalesModel> Sales() => orders.Sales();
}
