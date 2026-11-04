using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services.Stock;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services;

public class PaymentService(
    ShopDbContext db,
    IConfiguration configuration,
    IHostEnvironment environment,
    IStockReservationService stock)
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

        await using var tx = await db.Database.BeginTransactionAsync();
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null || !decimal.TryParse(amountText, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var amount))
        {
            return false;
        }
        // Reject ITNs whose amount does not match the order we created (anti-tamper).
        if (amount != order.TotalCents / 100m)
        {
            return false;
        }
        if (order.PaidAt is not null)
        {
            await tx.CommitAsync();
            return true; // idempotent replay
        }

        var stockNote = "";
        if (!order.StockReserved)
        {
            var held = new List<OrderLine>();
            foreach (var line in order.Lines)
            {
                if (!await stock.TryReserveAsync(line.Sku, line.Quantity))
                {
                    await stock.ReleaseOrderLinesAsync(held);
                    held.Clear();
                    if (order.Status == "Cancelled")
                    {
                        // Late PayFast ITN after unpaid expiry — money took, stock gone.
                        stockNote =
                            " Paid after the checkout hold expired and stock could not be re-reserved — resolve fulfilment manually.";
                        break;
                    }

                    await tx.RollbackAsync();
                    return false;
                }
                held.Add(line);
            }

            if (held.Count == order.Lines.Count)
            {
                order.StockReserved = true;
            }
        }

        order.PaidAt = DateTime.UtcNow;
        order.PayFastReference = values.GetValueOrDefault("pf_payment_id") ?? "";
        order.Status = "Paid";
        order.Tone = "paid";
        order.Fulfilment = "To pack";
        order.FulfilmentNote = string.IsNullOrEmpty(stockNote)
            ? "Paid, not yet packed."
            : $"Paid, not yet packed.{stockNote}";
        order.PaymentNote = "Marked paid only because the PayFast signature matched." + stockNote;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
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
