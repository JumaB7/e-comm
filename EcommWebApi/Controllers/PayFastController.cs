using EcommWebApi.Contracts;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/payfast")]
public class PayFastController(PaymentService payments) : ControllerBase
{
    [HttpPost("notify")]
    public async Task<IActionResult> Notify()
    {
        var fields = Request.Form.Select(field => new KeyValuePair<string, string>(field.Key, field.Value.ToString())).ToList();
        return await payments.ApplyAsync(fields) ? Ok() : BadRequest();
    }

    [HttpPost("local/{number}")]
    public async Task<ActionResult<OrderModel>> CompleteLocal(string number) =>
        ShopResults.From(await payments.CompleteLocal(number));
}
