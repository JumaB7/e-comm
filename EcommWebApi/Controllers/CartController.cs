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
}
