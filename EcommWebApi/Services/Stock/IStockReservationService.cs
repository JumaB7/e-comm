using EcommWebApi.Models;

namespace EcommWebApi.Services.Stock;

public interface IStockReservationService
{
    /// <summary>Atomically decrement if enough stock. Returns false when the race was lost.</summary>
    Task<bool> TryReserveAsync(string sku, int quantity, CancellationToken cancellationToken = default);

    Task ReleaseAsync(string sku, int quantity, CancellationToken cancellationToken = default);

    Task ReleaseOrderLinesAsync(IEnumerable<OrderLine> lines, CancellationToken cancellationToken = default);
}
