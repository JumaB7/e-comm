using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/payfast")]
public class PayFastController(ShopDbContext db, PaymentService payments, IConfiguration configuration) : ControllerBase
{
    [HttpPost("notify")]
    public async Task<IActionResult> Notify()
    {
        var fields = Request.Form.Select(field => new KeyValuePair<string, string>(field.Key, field.Value.ToString())).ToList();
        return await payments.ApplyAsync(fields) ? Ok() : BadRequest();
    }

    [HttpPost("local/{number}")]
    public async Task<ActionResult<OrderModel>> CompleteLocal(string number)
    {
        var merchantId = configuration["PayFast:MerchantId"];
        if (configuration["PayFast:Mode"] == "payfast" || !string.IsNullOrWhiteSpace(merchantId))
        {
            return NotFound();
        }
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return NotFound();
        }
        var fields = new List<KeyValuePair<string, string>>
        {
            new("m_payment_id", order.Number),
            new("pf_payment_id", $"pf_{order.Id:000000}"),
            new("payment_status", "COMPLETE"),
            new("amount_gross", ShopMoney.PayFastAmount(order.TotalCents)),
        };
        fields.Add(new("signature", PayFastSignature.Sign(fields, configuration["PayFast:Passphrase"] ?? "")));
        if (!await payments.ApplyAsync(fields))
        {
            return BadRequest(new MessageModel("PayFast did not confirm this payment."));
        }
        await db.Entry(order).ReloadAsync();
        await db.Entry(order).Collection(item => item.Lines).LoadAsync();
        return OrderMapper.Order(order);
    }
}
