using EcommWebApi.Contracts;
using EcommWebApi.Services.Cart;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController(ICartService cart) : ControllerBase
{
    [HttpPost("quote")]
    public Task<CartQuoteModel> Quote(CartQuoteRequest request) => cart.Quote(request);

    /// <summary>Live stock and prices for the bag. Does not hold or reserve stock.</summary>
    [HttpPost("validate")]
    public Task<CartValidateModel> Validate(CartQuoteRequest request) => cart.Validate(request);
}
