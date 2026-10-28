using System.Globalization;
using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Orders;

public class OrderService(ShopDbContext db, IConfiguration configuration, IWebHostEnvironment environment) : IOrderService
{
    public async Task<OrderModel?> Receipt(string key)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.ReceiptKey == key);
        return order is null ? null : OrderMapper.Order(order);
    }

    public async Task<ShopOutcome<CheckoutModel>> Create(CreateOrderRequest request)
    {
        if (request.Lines is null || request.Lines.Count == 0)
        {
            return ShopOutcome<CheckoutModel>.BadRequest("The bag is empty.");
        }
        var delivery = request.Delivery == "collect" ? "collect" : request.Delivery == "courier" ? "courier" : "";
        if (delivery.Length == 0 || request.Name.Trim().Length == 0 || request.Email.Trim().Length == 0)
        {
            return ShopOutcome<CheckoutModel>.BadRequest("Name, email, and a delivery choice are required.");
        }
        var method = request.Method is "eft" or "capitec" or "card" ? request.Method : "card";
        var lines = new List<OrderLine>();
        foreach (var requested in request.Lines)
        {
            if (requested.Qty < 1)
            {
                return ShopOutcome<CheckoutModel>.BadRequest("Quantity has to be at least 1.");
            }
            var product = await db.Products.FirstOrDefaultAsync(item => item.Sku == requested.Sku);
            if (product is null)
            {
                return ShopOutcome<CheckoutModel>.BadRequest("A product in the bag is no longer in the shop.");
            }
            if (product.Stock < requested.Qty)
            {
                return ShopOutcome<CheckoutModel>.BadRequest($"{product.Name} only has {product.Stock} in stock.");
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
        var localCheckout = environment.IsDevelopment()
            && (string.IsNullOrWhiteSpace(merchantId) || configuration["PayFast:Mode"] != "payfast");
        if (localCheckout)
        {
            return ShopOutcome<CheckoutModel>.Ok(new CheckoutModel(OrderMapper.Order(order), order.ReceiptKey, "local", null, null));
        }
        if (string.IsNullOrWhiteSpace(merchantId))
        {
            return ShopOutcome<CheckoutModel>.BadRequest("Payment is not available.");
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
        return ShopOutcome<CheckoutModel>.Ok(new CheckoutModel(OrderMapper.Order(order), order.ReceiptKey, "payfast", configuration["PayFast:ProcessUrl"], fields));
    }

    public async Task<List<OrderModel>> List()
    {
        var orders = await db.Orders.Include(order => order.Lines).OrderByDescending(order => order.CreatedAt).ToListAsync();
        return orders.Select(OrderMapper.Order).ToList();
    }

    public async Task<OrderModel?> Get(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        return order is null ? null : OrderMapper.Order(order);
    }

    public async Task<OrderModel?> Pack(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return null;
        }
        if (order.Fulfilment == "To pack")
        {
            order.Fulfilment = "Packed";
            order.FulfilmentNote = "Packed. Payment is unchanged.";
            await db.SaveChangesAsync();
        }
        return OrderMapper.Order(order);
    }

    public async Task<OrderSummaryModel> Summary()
    {
        var today = OrderMapper.ShopNow().Date;
        var orders = await db.Orders.ToListAsync();
        var todayOrders = orders.Where(order => OrderMapper.ShopDate(order.CreatedAt) == today).ToList();
        var paidToday = todayOrders.Where(order => order.PaidAt is not null).Sum(order => order.TotalCents);
        var awaiting = orders.Count(order => order.PaidAt is null);
        var lowStock = await db.Products.CountAsync(product => product.Stock <= ShopMoney.LowStockAt);
        return new OrderSummaryModel(todayOrders.Count, ShopMoney.Rand(paidToday), ShopMoney.RandCompact(paidToday), awaiting, lowStock);
    }

    public async Task<SalesModel> Sales()
    {
        var paid = await db.Orders.Include(order => order.Lines).Where(order => order.PaidAt != null).ToListAsync();
        var total = paid.Sum(order => order.TotalCents);
        var profit = paid.SelectMany(order => order.Lines).Sum(line => (line.UnitPriceCents - line.UnitCostCents) * line.Quantity);
        var now = OrderMapper.ShopNow();
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var thisMonth = paid.Where(order => OrderMapper.ShopDate(order.PaidAt!.Value) >= monthStart).Sum(order => order.TotalCents);
        var months = new List<SalesMonthModel>();
        for (var offset = 5; offset >= 0; offset--)
        {
            var start = monthStart.AddMonths(-offset);
            var end = start.AddMonths(1);
            var monthProfit = paid
                .Where(order => OrderMapper.ShopDate(order.PaidAt!.Value) >= start && OrderMapper.ShopDate(order.PaidAt!.Value) < end)
                .SelectMany(order => order.Lines)
                .Sum(line => (line.UnitPriceCents - line.UnitCostCents) * line.Quantity);
            months.Add(new SalesMonthModel(start.ToString("MMM", CultureInfo.InvariantCulture), monthProfit));
        }
        return new SalesModel(ShopMoney.Rand(total), paid.Count, ShopMoney.Rand(profit), ShopMoney.Rand(thisMonth), months);
    }
}
