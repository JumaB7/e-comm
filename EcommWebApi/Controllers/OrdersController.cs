using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(ShopDbContext db, IConfiguration configuration, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet("receipt/{key}")]
    public async Task<ActionResult<OrderModel>> Receipt(string key)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.ReceiptKey == key);
        return order is null ? NotFound() : OrderMapper.Order(order);
    }

    [HttpPost]
    public async Task<ActionResult<CheckoutModel>> Create(CreateOrderRequest request)
    {
        if (request.Lines is null || request.Lines.Count == 0)
        {
            return BadRequest(new MessageModel("The bag is empty."));
        }
        var delivery = request.Delivery == "collect" ? "collect" : request.Delivery == "courier" ? "courier" : "";
        if (delivery.Length == 0 || request.Name.Trim().Length == 0 || request.Email.Trim().Length == 0)
        {
            return BadRequest(new MessageModel("Name, email, and a delivery choice are required."));
        }
        var method = request.Method is "eft" or "capitec" or "card" ? request.Method : "card";
        var lines = new List<OrderLine>();
        foreach (var requested in request.Lines)
        {
            if (requested.Qty < 1)
            {
                return BadRequest(new MessageModel("Quantity has to be at least 1."));
            }
            var product = await db.Products.FirstOrDefaultAsync(item => item.Sku == requested.Sku);
            if (product is null)
            {
                return BadRequest(new MessageModel("A product in the bag is no longer in the shop."));
            }
            if (product.Stock < requested.Qty)
            {
                return BadRequest(new MessageModel($"{product.Name} only has {product.Stock} in stock."));
            }
            lines.Add(new OrderLine
            {
                Sku = product.Sku,
                Name = product.Name,
                Detail = requested.Detail?.Trim() ?? "",
                Quantity = requested.Qty,
                UnitPriceCents = product.PriceCents,
                UnitCostCents = product.CostCents,
            });
        }
        var courier = delivery == "courier" ? ShopMoney.CourierCents : 0;
        var numbers = await db.Orders.Select(order => order.Number).ToListAsync();
        var next = numbers.Select(number => int.Parse(number["VS-".Length..])).DefaultIfEmpty(1000).Max() + 1;
        var order = new ShopOrder
        {
            Number = $"VS-{next}",
            ReceiptKey = Guid.NewGuid().ToString("N"),
            CustomerName = request.Name.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            Street = request.Street.Trim(),
            Suburb = request.Suburb.Trim(),
            City = request.City.Trim(),
            Province = request.Province.Trim(),
            PostalCode = request.PostalCode.Trim(),
            Delivery = delivery,
            CourierCents = courier,
            TotalCents = lines.Sum(line => line.UnitPriceCents * line.Quantity) + courier,
            Status = "Awaiting payment",
            Tone = "awaiting",
            Fulfilment = "Waiting",
            FulfilmentNote = "Waiting on payment.",
            PaymentMethod = method,
            PaymentNote = "Paid only after the PayFast signature matches.",
            CreatedAt = DateTime.UtcNow,
            Lines = lines,
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var merchantId = configuration["PayFast:MerchantId"];
        if (string.IsNullOrWhiteSpace(merchantId) || environment.IsDevelopment() && configuration["PayFast:Mode"] != "payfast")
        {
            return new CheckoutModel(OrderMapper.Order(order), order.ReceiptKey, "local", null, null);
        }

        var returnBase = configuration["PayFast:ReturnBase"] ?? "http://localhost:4200";
        var fields = new Dictionary<string, string>
        {
            ["merchant_id"] = merchantId,
            ["merchant_key"] = configuration["PayFast:MerchantKey"] ?? "",
            ["return_url"] = $"{returnBase}/paid?receipt={order.ReceiptKey}",
            ["cancel_url"] = $"{returnBase}/checkout",
            ["notify_url"] = $"{configuration["PayFast:NotifyBase"] ?? "http://localhost:5156"}/api/payfast/notify",
            ["m_payment_id"] = order.Number,
            ["amount"] = ShopMoney.PayFastAmount(order.TotalCents),
            ["item_name"] = $"Veld Supply {order.Number}",
            ["email_address"] = order.Email,
        };
        fields["signature"] = PayFastSignature.Sign(fields, configuration["PayFast:Passphrase"] ?? "");
        return new CheckoutModel(OrderMapper.Order(order), order.ReceiptKey, "payfast", configuration["PayFast:ProcessUrl"], fields);
    }
}
