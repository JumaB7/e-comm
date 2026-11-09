using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services.Cart;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Tests;

public class CartValidateTests
{
    [Fact]
    public async Task Validate_reports_reduced_stock_without_reserving()
    {
        await using var db = CreateDb();
        db.Products.Add(new Product
        {
            Sku = "VS-OPT-1",
            Name = "Scope",
            Category = "Optics",
            PriceCents = 10000,
            CostCents = 6000,
            Stock = 2,
            Blurb = "Glass",
            Image = "",
        });
        await db.SaveChangesAsync();

        var cart = new CartService(db);
        var result = await cart.Validate(new CartQuoteRequest(
            "courier",
            [new OrderLineRequest("VS-OPT-1", 5, null)]));

        Assert.False(result.Ok);
        Assert.Equal("reduced", result.Lines[0].Status);
        Assert.Equal(2, result.Lines[0].PricedQty);
        Assert.Equal(2, await db.Products.Where(product => product.Sku == "VS-OPT-1").Select(product => product.Stock).SingleAsync());
    }

    [Fact]
    public async Task Validate_marks_sold_out_lines_unavailable()
    {
        await using var db = CreateDb();
        db.Products.Add(new Product
        {
            Sku = "VS-KNF-1",
            Name = "Knife",
            Category = "Knives",
            PriceCents = 5000,
            CostCents = 3000,
            Stock = 0,
            Blurb = "Blade",
            Image = "",
        });
        await db.SaveChangesAsync();

        var cart = new CartService(db);
        var result = await cart.Validate(new CartQuoteRequest(
            "collect",
            [new OrderLineRequest("VS-KNF-1", 1, null)]));

        Assert.False(result.Ok);
        Assert.Equal("unavailable", result.Lines[0].Status);
        Assert.Contains(result.Messages, message => message.Contains("out of stock", StringComparison.OrdinalIgnoreCase));
    }

    private static ShopDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new ShopDbContext(options);
    }
}
