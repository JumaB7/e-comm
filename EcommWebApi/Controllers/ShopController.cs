using EcommWebApi.Contracts;
using EcommWebApi.Services.Shop;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/shop")]
public class ShopController(IShopService shop) : ControllerBase
{
    [HttpGet("defaults")]
    public Task<ShopDefaultsModel> Defaults() => shop.Defaults();
}
