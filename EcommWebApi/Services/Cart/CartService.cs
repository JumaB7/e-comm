using EcommWebApi.Contracts;
using EcommWebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Cart;

public class CartService(ShopDbContext db) : ICartService
{
    public async Task<CartQuoteModel> Quote(CartQuoteRequest request)
    {
        var courierDue = request.Delivery != "collect";
        var lines = new List<CartQuoteLineModel>();
        var subtotal = 0;
        foreach (var requested in request.Lines ?? [])
        {
            if (requested.Qty < 1)
            {
                continue;
            }
            var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(item => item.Sku == requested.Sku);
            if (product is null)
            {
                continue;
            }
            var lineCents = product.PriceCents * requested.Qty;
            subtotal += lineCents;
            lines.Add(new CartQuoteLineModel(product.Sku, product.Name, ShopMoney.Rand(lineCents)));
        }
        var courier = courierDue && lines.Count > 0 ? ShopMoney.CourierCents : 0;
        return new CartQuoteModel(
            ShopMoney.Rand(subtotal),
            ShopMoney.Rand(courier),
            ShopMoney.Rand(subtotal + courier),
            ShopMoney.Rand(ShopMoney.CourierCents),
            lines);
    }
}
