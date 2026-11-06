using System.Globalization;
using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services.Stock;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Orders;

public class OrderService(
    ShopDbContext db,
    IConfiguration configuration,
    IWebHostEnvironment environment,
    IStockReservationService stock) : IOrderService
{
    public async Task<OrderModel?> Receipt(string key)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.ReceiptKey == key);
        return order is null ? null : OrderMapper.Order(order);
    }

    public async Task<ShopOutcome<CheckoutModel>> Create(CreateOrderRequest request, int? shopUserId)
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
        int? linkedUserId = null;
        if (shopUserId is int id && id > 0 && await db.Users.AnyAsync(user => user.Id == id))
        {
            linkedUserId = id;
        }
        var method = request.Method is "eft" or "capitec" or "card" ? request.Method : "card";
        await using var tx = await db.Database.BeginTransactionAsync();
        var lines = new List<OrderLine>();
        foreach (var requested in request.Lines)
        {
            if (requested.Qty < 1)
            {
                await tx.RollbackAsync();
                return ShopOutcome<CheckoutModel>.BadRequest("Quantity has to be at least 1.");
            }
            var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(item => item.Sku == requested.Sku);
            if (product is null)
            {
                await tx.RollbackAsync();
                return ShopOutcome<CheckoutModel>.BadRequest("A product in the bag is no longer in the shop.");
            }
            if (!await stock.TryReserveAsync(product.Sku, requested.Qty))
            {
                await tx.RollbackAsync();
                return ShopOutcome<CheckoutModel>.BadRequest(
                    product.Stock < requested.Qty
                        ? $"{product.Name} only has {product.Stock} in stock."
                        : $"{product.Name} just sold out. Remove it from the bag and try again.");
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
            ShopUserId = linkedUserId,
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
            StockReserved = true,
            Lines = lines,
        };
        db.Orders.Add(order);
        try
        {
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }

        var merchantId = configuration["PayFast:MerchantId"];
        // Local-only shortcut when no PayFast merchant is configured in Development.
        var localCheckout = environment.IsDevelopment()
            && (string.IsNullOrWhiteSpace(merchantId) || configuration["PayFast:Mode"] != "payfast");
        if (localCheckout)
        {
            return ShopOutcome<CheckoutModel>.Ok(new CheckoutModel(OrderMapper.Order(order), order.ReceiptKey, "local", null, null));
        }
        // TODO: ensure UAT/production always have PayFast merchant settings (otherwise checkout fails here).
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

    public async Task<List<OrderModel>> ListForUser(int shopUserId)
    {
        var orders = await db.Orders.Include(order => order.Lines)
            .Where(order => order.ShopUserId == shopUserId)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync();
        return orders.Select(OrderMapper.Order).ToList();
    }

    public async Task<OrderModel?> Get(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        return order is null ? null : OrderMapper.Order(order);
    }

    public async Task<OrderModel?> GetForUser(string number, int shopUserId)
    {
        var order = await db.Orders.Include(item => item.Lines)
            .FirstOrDefaultAsync(item => item.Number == number && item.ShopUserId == shopUserId);
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
            order.PackedAt = DateTime.UtcNow;
            if (order.Delivery == "collect")
            {
                order.Fulfilment = "To collect";
                order.FulfilmentNote = "Packed. Waiting for collection.";
            }
            else
            {
                order.Fulfilment = "To ship";
                order.FulfilmentNote = "Packed. Add a tracking number to send it.";
            }
            await db.SaveChangesAsync();
        }
        return OrderMapper.Order(order);
    }

    public async Task<ShopOutcome<OrderModel>> Ship(string number, string? tracking)
    {
        var code = tracking?.Trim() ?? "";
        if (code.Length == 0)
        {
            return ShopOutcome<OrderModel>.BadRequest("Enter a tracking number.");
        }
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return ShopOutcome<OrderModel>.NotFound();
        }
        if (OrderMapper.Queue(order) != "ship")
        {
            return ShopOutcome<OrderModel>.BadRequest("This order is not waiting to ship.");
        }
        order.TrackingNumber = code;
        order.ShippedAt = DateTime.UtcNow;
        order.Fulfilment = "Out for delivery";
        order.FulfilmentNote = $"Out for delivery. Tracking {code}.";
        await db.SaveChangesAsync();
        return ShopOutcome<OrderModel>.Ok(OrderMapper.Order(order));
    }

    public async Task<ShopOutcome<OrderModel>> Complete(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return ShopOutcome<OrderModel>.NotFound();
        }
        var queue = OrderMapper.Queue(order);
        if (queue == "collect")
        {
            order.DeliveredAt = DateTime.UtcNow;
            order.Fulfilment = "Collected";
            order.FulfilmentNote = "Collected from the shop.";
        }
        else if (queue == "delivery")
        {
            order.DeliveredAt = DateTime.UtcNow;
            order.Fulfilment = "Delivered";
            order.FulfilmentNote = "Delivered.";
        }
        else
        {
            return ShopOutcome<OrderModel>.BadRequest("This order is not ready to close.");
        }
        await db.SaveChangesAsync();
        return ShopOutcome<OrderModel>.Ok(OrderMapper.Order(order));
    }

    public async Task<OrderSummaryModel> Summary()
    {
        var today = OrderMapper.ShopNow().Date;
        var orders = await db.Orders.ToListAsync();
        var todayOrders = orders.Where(order => OrderMapper.ShopDate(order.CreatedAt) == today).ToList();
        var paidToday = todayOrders.Where(order => order.PaidAt is not null).Sum(order => order.TotalCents);
        var awaiting = orders.Count(order => order.PaidAt is null && order.Status == "Awaiting payment");
        var lowStock = await db.Products.CountAsync(product => product.Stock <= ShopMoney.LowStockAt);
        return new OrderSummaryModel(todayOrders.Count, ShopMoney.Rand(paidToday), ShopMoney.RandCompact(paidToday), awaiting, lowStock);
    }

    public async Task<SalesModel> Sales()
    {
        var paid = await db.Orders.Include(order => order.Lines).Where(order => order.PaidAt != null).ToListAsync();
        var products = await db.Products.AsNoTracking().ToListAsync();
        var categoryBySku = products.ToDictionary(product => product.Sku, product => product.Category, StringComparer.OrdinalIgnoreCase);
        var now = OrderMapper.ShopNow();
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var periodStart = monthStart.AddMonths(-5);
        var periodEnd = monthStart.AddMonths(1);
        var priorStart = periodStart.AddMonths(-6);
        var current = paid.Where(order => InRange(order, periodStart, periodEnd)).ToList();
        var prior = paid.Where(order => InRange(order, priorStart, periodStart)).ToList();
        var previousMonthStart = monthStart.AddMonths(-1);
        var thisMonthOrders = current.Where(order => InRange(order, monthStart, periodEnd)).ToList();
        var previousMonthOrders = current.Where(order => InRange(order, previousMonthStart, monthStart)).ToList();
        var months = new List<SalesMonthPointModel>();
        for (var offset = 5; offset >= 0; offset--)
        {
            var start = monthStart.AddMonths(-offset);
            var slice = current.Where(order => InRange(order, start, start.AddMonths(1))).ToList();
            months.Add(new SalesMonthPointModel(
                start.ToString("MMM", CultureInfo.InvariantCulture),
                ShopMoney.CentsToRands(SalesOf(slice)),
                ShopMoney.CentsToRands(ProfitOf(slice))));
        }
        var sales = SalesOf(current);
        var priorSales = SalesOf(prior);
        var profit = ProfitOf(current);
        var priorProfit = ProfitOf(prior);
        var costs = CostsOf(current);
        var units = UnitsOf(current);
        var priorUnits = UnitsOf(prior);
        var average = current.Count == 0 ? 0 : sales / current.Count;
        var priorAverage = prior.Count == 0 ? 0 : priorSales / prior.Count;
        var thisMonth = SalesOf(thisMonthOrders);
        var previousMonth = SalesOf(previousMonthOrders);
        var previousMonthName = previousMonthStart.ToString("MMMM", CultureInfo.InvariantCulture);
        var currentMonthName = monthStart.ToString("MMMM", CultureInfo.InvariantCulture);
        var margin = Share(profit, sales);
        var priorMargin = Share(priorProfit, priorSales);
        var marginPoints = Math.Round(margin - priorMargin, 1);
        var strongest = months.OrderByDescending(month => month.ProfitRands).First();
        var latest = months[^1];
        var beforeLatest = months[^2];
        var monthMove = DeltaPercent(latest.ProfitRands, beforeLatest.ProfitRands, "");
        var profitNote = beforeLatest.ProfitRands == 0 && latest.ProfitRands > 0
            ? $"{currentMonthName} is the first month with profit in this period."
            : monthMove.Flat
                ? $"{currentMonthName} profit is unchanged from {previousMonthName}."
                : $"{currentMonthName} profit is {(monthMove.Up ? "up" : "down")} {monthMove.Text} from {previousMonthName}.";
        if (latest.Month == strongest.Month && latest.ProfitRands > 0)
        {
            profitNote += " It is the strongest month in this period.";
        }
        var marginNote = Math.Abs(marginPoints) < 0.05
            ? "Same as the previous six-month period."
            : $"{(marginPoints > 0 ? "Up" : "Down")} {Math.Abs(marginPoints).ToString("0.0", CultureInfo.InvariantCulture)} points from the previous six-month period.";
        var categories = Categories(current, categoryBySku, sales);
        var repeat = Repeat(current);
        var priorRepeat = Repeat(prior);
        var repeatPoints = (int)Math.Round(repeat.Share - priorRepeat.Share, MidpointRounding.AwayFromZero);
        var repeatChange = repeatPoints == 0
            ? new SalesDeltaModel("No change", false, true)
            : new SalesDeltaModel($"{Math.Abs(repeatPoints)}% vs prior period", repeatPoints > 0, false);
        var customers = Customers(current, paid, periodStart);
        var period = periodStart.Year == monthStart.Year
            ? $"{periodStart.ToString("MMMM", CultureInfo.InvariantCulture)} — {monthStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture)}"
            : $"{periodStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture)} — {monthStart.ToString("MMMM yyyy", CultureInfo.InvariantCulture)}";
        var stats = new List<SalesStatModel>
        {
            new("Total sales", ShopMoney.Rand(sales), DeltaPercent(sales, priorSales, "vs prior period")),
            new("Orders", current.Count.ToString(CultureInfo.InvariantCulture), OrderDelta(current.Count, prior.Count)),
            new("Profit", ShopMoney.Rand(profit), DeltaPercent(profit, priorProfit, "vs prior period")),
            new("This month", ShopMoney.Rand(thisMonth), DeltaPercent(thisMonth, previousMonth, $"vs {previousMonthName}")),
            new("Avg. order value", ShopMoney.Rand(average), DeltaPercent(average, priorAverage, "vs prior period")),
            new("Units sold", units.ToString(CultureInfo.InvariantCulture), DeltaPercent(units, priorUnits, "vs prior period")),
        };
        return new SalesModel(
            period,
            ShopMoney.Rand(profit),
            profitNote,
            months,
            $"{margin.ToString("0.0", CultureInfo.InvariantCulture)}%",
            marginNote,
            margin > 0 && margin + 0.05 >= priorMargin,
            ShopMoney.Rand(profit),
            ShopMoney.Rand(costs),
            categories,
            $"{Math.Round(repeat.Share).ToString("0", CultureInfo.InvariantCulture)}%",
            repeatChange,
            (int)Math.Clamp(Math.Round(repeat.Share / 10d, MidpointRounding.AwayFromZero), 0, 10),
            customers.NewCustomers,
            customers.Returning,
            Rate(customers.Refunds, current.Count),
            stats);
    }

    private static bool InRange(ShopOrder order, DateTime start, DateTime end)
    {
        var day = OrderMapper.ShopDate(order.PaidAt!.Value);
        return day >= start && day < end;
    }

    private static int SalesOf(IEnumerable<ShopOrder> orders) => orders.Sum(order => order.TotalCents);

    private static int ProfitOf(IEnumerable<ShopOrder> orders) =>
        orders.SelectMany(order => order.Lines).Sum(line => (line.UnitPriceCents - line.UnitCostCents) * line.Quantity);

    private static int CostsOf(IEnumerable<ShopOrder> orders) =>
        orders.SelectMany(order => order.Lines).Sum(line => line.UnitCostCents * line.Quantity);

    private static int UnitsOf(IEnumerable<ShopOrder> orders) =>
        orders.SelectMany(order => order.Lines).Sum(line => line.Quantity);

    private static double Share(int part, int whole) => whole == 0 ? 0 : part * 100d / whole;

    private static SalesDeltaModel DeltaPercent(int current, int prior, string suffix)
    {
        if (current == prior)
        {
            return new SalesDeltaModel("No change", false, true);
        }
        if (prior == 0)
        {
            return new SalesDeltaModel(current == 0 ? "No change" : "No prior period", false, true);
        }
        var pct = (current - prior) * 100d / prior;
        if (Math.Abs(pct) < 0.05)
        {
            return new SalesDeltaModel("No change", false, true);
        }
        var number = Math.Abs(pct).ToString("0.0", CultureInfo.InvariantCulture);
        var text = suffix.Length == 0 ? $"{number}%" : $"{number}% {suffix}";
        return new SalesDeltaModel(text, pct > 0, false);
    }

    private static SalesDeltaModel OrderDelta(int current, int prior)
    {
        var diff = current - prior;
        if (diff == 0)
        {
            return new SalesDeltaModel("Same as the prior period", false, true);
        }
        var count = Math.Abs(diff).ToString(CultureInfo.InvariantCulture);
        return new SalesDeltaModel(diff > 0 ? $"{count} more orders" : $"{count} fewer orders", diff > 0, false);
    }

    private static string Rate(int part, int whole)
    {
        if (whole == 0 || part == 0)
        {
            return "0%";
        }
        var pct = part * 100d / whole;
        return Math.Abs(pct - Math.Round(pct)) < 0.05
            ? $"{Math.Round(pct).ToString("0", CultureInfo.InvariantCulture)}%"
            : $"{pct.ToString("0.0", CultureInfo.InvariantCulture)}%";
    }

    private static List<SalesCategoryModel> Categories(List<ShopOrder> orders, Dictionary<string, string> categoryBySku, int salesCents)
    {
        var totals = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var line in orders.SelectMany(order => order.Lines))
        {
            var name = categoryBySku.TryGetValue(line.Sku, out var category) && category.Length > 0 ? category : "Other";
            totals[name] = totals.GetValueOrDefault(name) + line.UnitPriceCents * line.Quantity;
        }
        var rows = totals.OrderByDescending(item => item.Value).ToList();
        var shares = rows.Select(item => salesCents == 0 ? 0 : (int)Math.Floor(item.Value * 100d / salesCents)).ToList();
        var leftover = salesCents == 0 ? 0 : 100 - shares.Sum();
        if (leftover != 0 && shares.Count > 0)
        {
            var index = rows.Select((item, i) => (item.Value, i)).OrderByDescending(item => item.Value).First().i;
            shares[index] += leftover;
        }
        return rows.Select((item, index) => new SalesCategoryModel(item.Key, ShopMoney.Rand(item.Value), Math.Max(0, shares[index]), ShopMoney.CentsToRands(item.Value))).ToList();
    }

    private static (double Share, int Repeat, int Unique) Repeat(List<ShopOrder> orders)
    {
        var groups = orders
            .Select(order => order.Email.Trim().ToLowerInvariant())
            .Where(email => email.Length > 0)
            .GroupBy(email => email)
            .ToList();
        if (groups.Count == 0)
        {
            return (0, 0, 0);
        }
        var repeat = groups.Count(group => group.Count() > 1);
        return (repeat * 100d / groups.Count, repeat, groups.Count);
    }

    private static (int NewCustomers, int Returning, int Refunds) Customers(List<ShopOrder> current, List<ShopOrder> paid, DateTime periodStart)
    {
        var firstPaid = paid
            .Where(order => order.Email.Trim().Length > 0)
            .GroupBy(order => order.Email.Trim().ToLowerInvariant())
            .ToDictionary(group => group.Key, group => group.Min(order => OrderMapper.ShopDate(order.PaidAt!.Value)));
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var newcomers = 0;
        var returning = 0;
        foreach (var order in current)
        {
            var email = order.Email.Trim().ToLowerInvariant();
            if (email.Length == 0 || !seen.Add(email) || !firstPaid.TryGetValue(email, out var first))
            {
                continue;
            }
            if (first < periodStart)
            {
                returning++;
            }
            else
            {
                newcomers++;
            }
        }
        var refunds = current.Count(order => order.Status.Contains("refund", StringComparison.OrdinalIgnoreCase));
        return (newcomers, returning, refunds);
    }
}
