using EcommWebApi.Data;
using EcommWebApi.Services;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Stock;

/// <summary>Releases stock held by abandoned Awaiting-payment checkouts.</summary>
public class UnpaidStockReleaseService(IServiceScopeFactory scopeFactory, ILogger<UnpaidStockReleaseService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(2);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ReleaseExpiredAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Unpaid stock release sweep failed.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task ReleaseExpiredAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
        var stock = scope.ServiceProvider.GetRequiredService<IStockReservationService>();
        var cutoff = DateTime.UtcNow.AddMinutes(-ShopMoney.StockReservationMinutes);

        var expired = await db.Orders
            .Include(order => order.Lines)
            .Where(order =>
                order.StockReserved
                && order.PaidAt == null
                && order.Status == "Awaiting payment"
                && order.CreatedAt < cutoff)
            .ToListAsync(cancellationToken);

        foreach (var order in expired)
        {
            await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
            await stock.ReleaseOrderLinesAsync(order.Lines, cancellationToken);
            order.StockReserved = false;
            order.Status = "Cancelled";
            order.Tone = "awaiting";
            order.Fulfilment = "Cancelled";
            order.FulfilmentNote = "Checkout timed out before payment. Stock was released.";
            order.PaymentNote = "Payment window expired; reserved stock was returned to the shop.";
            await db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
            logger.LogInformation("Released stock for unpaid order {OrderNumber}.", order.Number);
        }
    }
}
