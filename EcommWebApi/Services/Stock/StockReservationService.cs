using EcommWebApi.Data;
using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Stock;

public class StockReservationService(ShopDbContext db) : IStockReservationService
{
    public async Task<bool> TryReserveAsync(string sku, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity < 1)
        {
            return false;
        }

        // Single conditional UPDATE — safe under concurrent checkouts for the same SKU.
        var affected = await db.Products
            .Where(product => product.Sku == sku && product.Stock >= quantity)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(product => product.Stock, product => product.Stock - quantity),
                cancellationToken);
        return affected == 1;
    }

    public async Task ReleaseAsync(string sku, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity < 1)
        {
            return;
        }

        await db.Products
            .Where(product => product.Sku == sku)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(product => product.Stock, product => product.Stock + quantity),
                cancellationToken);
    }

    public async Task ReleaseOrderLinesAsync(IEnumerable<OrderLine> lines, CancellationToken cancellationToken = default)
    {
        foreach (var line in lines)
        {
            await ReleaseAsync(line.Sku, line.Quantity, cancellationToken);
        }
    }
}
