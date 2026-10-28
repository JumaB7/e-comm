using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services;

public class PaymentService(ShopDbContext db, IConfiguration configuration, IHostEnvironment environment)
{
    public async Task<bool> ApplyAsync(IReadOnlyList<KeyValuePair<string, string>> fields)
    {
        if (!PayFastSignature.Matches(fields, configuration["PayFast:Passphrase"] ?? ""))
        {
            return false;
        }
        var values = fields.ToDictionary(field => field.Key, field => field.Value, StringComparer.OrdinalIgnoreCase);
        if (!values.TryGetValue("payment_status", out var status) || status != "COMPLETE")
        {
            return false;
        }
        if (!values.TryGetValue("m_payment_id", out var number) || !values.TryGetValue("amount_gross", out var amountText))
        {
            return false;
        }
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null || !decimal.TryParse(amountText, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var amount))
        {
            return false;
        }
        if (amount != order.TotalCents / 100m)
        {
            return false;
        }
        if (order.PaidAt is not null)
        {
            return true;
        }
        order.PaidAt = DateTime.UtcNow;
        order.PayFastReference = values.GetValueOrDefault("pf_payment_id") ?? "";
        order.Status = "Paid";
        order.Tone = "paid";
        order.Fulfilment = "To pack";
        order.FulfilmentNote = "Paid, not yet packed.";
        order.PaymentNote = "Marked paid only because the PayFast signature matched.";
        foreach (var line in order.Lines)
        {
            var product = await db.Products.FirstOrDefaultAsync(item => item.Sku == line.Sku);
            if (product is not null)
            {
                product.Stock = Math.Max(0, product.Stock - line.Quantity);
            }
        }
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<ShopOutcome<OrderModel>> CompleteLocal(string number)
    {
        var merchantId = configuration["PayFast:MerchantId"];
        if (!environment.IsDevelopment() || configuration["PayFast:Mode"] == "payfast" || !string.IsNullOrWhiteSpace(merchantId))
        {
            return ShopOutcome<OrderModel>.NotFound();
        }
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return ShopOutcome<OrderModel>.NotFound();
        }
        var fields = new List<KeyValuePair<string, string>>
        {
            new("m_payment_id", order.Number),
            new("pf_payment_id", $"pf_{order.Id:000000}"),
            new("payment_status", "COMPLETE"),
            new("amount_gross", ShopMoney.PayFastAmount(order.TotalCents)),
        };
        fields.Add(new("signature", PayFastSignature.Sign(fields, configuration["PayFast:Passphrase"] ?? "")));
        if (!await ApplyAsync(fields))
        {
            return ShopOutcome<OrderModel>.BadRequest("PayFast did not confirm this payment.");
        }
        await db.Entry(order).ReloadAsync();
        await db.Entry(order).Collection(item => item.Lines).LoadAsync();
        return ShopOutcome<OrderModel>.Ok(OrderMapper.Order(order));
    }
}
