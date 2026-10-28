using System.Globalization;
using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController(ShopDbContext db) : ControllerBase
{
    [HttpGet("orders")]
    public async Task<List<OrderModel>> Orders()
    {
        var orders = await db.Orders.Include(order => order.Lines).OrderByDescending(order => order.CreatedAt).ToListAsync();
        return orders.Select(OrderMapper.Order).ToList();
    }

    [HttpGet("orders/summary")]
    public async Task<OrderSummaryModel> Summary()
    {
        var today = OrderMapper.ShopNow().Date;
        var orders = await db.Orders.ToListAsync();
        var todayOrders = orders.Where(order => ShopDate(order.CreatedAt) == today).ToList();
        var paidToday = todayOrders.Where(order => order.PaidAt is not null).Sum(order => order.TotalCents);
        var awaiting = orders.Count(order => order.PaidAt is null);
        var lowStock = await db.Products.CountAsync(product => product.Stock <= ShopMoney.LowStockAt);
        return new OrderSummaryModel(todayOrders.Count, ShopMoney.Rand(paidToday), ShopMoney.RandCompact(paidToday), awaiting, lowStock);
    }

    [HttpGet("orders/{number}")]
    public async Task<ActionResult<OrderModel>> Order(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        return order is null ? NotFound() : OrderMapper.Order(order);
    }

    [HttpPost("orders/{number}/pack")]
    public async Task<ActionResult<OrderModel>> Pack(string number)
    {
        var order = await db.Orders.Include(item => item.Lines).FirstOrDefaultAsync(item => item.Number == number);
        if (order is null)
        {
            return NotFound();
        }
        if (order.Fulfilment == "To pack")
        {
            order.Fulfilment = "Packed";
            order.FulfilmentNote = "Packed. Payment is unchanged.";
            await db.SaveChangesAsync();
        }
        return OrderMapper.Order(order);
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductModel>> AddProduct(CreateProductRequest request)
    {
        var name = request.Name.Trim();
        var sku = request.Sku.Trim();
        if (name.Length == 0 || sku.Length == 0 || request.PriceRands < 1 || request.Stock < 0)
        {
            return BadRequest(new MessageModel("Name, SKU, price, and stock are required."));
        }
        if (await db.Products.AnyAsync(product => product.Sku == sku))
        {
            return Conflict(new MessageModel("That SKU is already in the shop."));
        }
        var cents = ShopMoney.RandsToCents(request.PriceRands);
        var product = new Product
        {
            Sku = sku,
            Name = name,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Camp" : request.Category.Trim(),
            PriceCents = cents,
            CostCents = cents * 67 / 100,
            Stock = request.Stock,
            Blurb = $"{name}. Sold on its own.",
            Specs = [new ProductSpec { Label = "Delivery", Value = "Courier, 2–5 working days" }],
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return OrderMapper.Product(product);
    }

    [HttpDelete("products/{sku}")]
    public async Task<IActionResult> DeleteProduct(string sku)
    {
        var product = await db.Products.FirstOrDefaultAsync(item => item.Sku == sku);
        if (product is null)
        {
            return NotFound();
        }
        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("stock")]
    public async Task<ActionResult<ProductModel>> AdjustStock(StockRequest request)
    {
        if (request.Quantity < 1 || request.Direction is not (1 or -1))
        {
            return BadRequest(new MessageModel("Quantity has to be at least 1."));
        }
        var name = request.Name.Trim().ToLowerInvariant();
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Name.ToLower() == name);
        if (product is null)
        {
            return NotFound(new MessageModel("No product uses that name."));
        }
        product.Stock = Math.Max(0, product.Stock + request.Direction * request.Quantity);
        await db.SaveChangesAsync();
        return OrderMapper.Product(product);
    }

    [HttpGet("sales")]
    public async Task<SalesModel> Sales()
    {
        var paid = await db.Orders.Include(order => order.Lines).Where(order => order.PaidAt != null).ToListAsync();
        var total = paid.Sum(order => order.TotalCents);
        var profit = paid.SelectMany(order => order.Lines).Sum(line => (line.UnitPriceCents - line.UnitCostCents) * line.Quantity);
        var now = OrderMapper.ShopNow();
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var thisMonth = paid.Where(order => ShopDate(order.PaidAt!.Value) >= monthStart).Sum(order => order.TotalCents);
        var months = new List<SalesMonthModel>();
        for (var offset = 5; offset >= 0; offset--)
        {
            var start = monthStart.AddMonths(-offset);
            var end = start.AddMonths(1);
            var monthProfit = paid
                .Where(order => ShopDate(order.PaidAt!.Value) >= start && ShopDate(order.PaidAt!.Value) < end)
                .SelectMany(order => order.Lines)
                .Sum(line => (line.UnitPriceCents - line.UnitCostCents) * line.Quantity);
            months.Add(new SalesMonthModel(start.ToString("MMM", CultureInfo.InvariantCulture), monthProfit));
        }
        return new SalesModel(ShopMoney.Rand(total), paid.Count, ShopMoney.Rand(profit), ShopMoney.Rand(thisMonth), months);
    }

    private static DateTime ShopDate(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), TimeZoneInfo.FindSystemTimeZoneById("South Africa Standard Time")).Date;
}
