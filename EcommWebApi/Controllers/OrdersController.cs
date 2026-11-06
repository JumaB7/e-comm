using EcommWebApi.Contracts;
using EcommWebApi.Services;
using EcommWebApi.Services.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orders) : ControllerBase
{
    [HttpGet("receipt/{key}")]
    public async Task<ActionResult<OrderModel>> Receipt(string key)
    {
        var order = await orders.Receipt(key);
        return order is null ? NotFound() : order;
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<List<OrderModel>>> Mine()
    {
        var userId = ShopClaims.UserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }
        return await orders.ListForUser(userId.Value);
    }

    [Authorize]
    [HttpGet("mine/{number}")]
    public async Task<ActionResult<OrderModel>> MineOrder(string number)
    {
        var userId = ShopClaims.UserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }
        var order = await orders.GetForUser(number, userId.Value);
        return order is null ? NotFound() : order;
    }

    [EnableRateLimiting("checkout")]
    [HttpPost]
    public async Task<ActionResult<CheckoutModel>> Create(CreateOrderRequest request) =>
        ShopResults.From(await orders.Create(request, ShopClaims.UserId(User)));
}
