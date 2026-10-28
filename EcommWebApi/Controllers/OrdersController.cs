using EcommWebApi.Contracts;
using EcommWebApi.Services.Orders;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    public async Task<ActionResult<CheckoutModel>> Create(CreateOrderRequest request) =>
        ShopResults.From(await orders.Create(request));
}
