using EcommWebApi.Contracts;
using EcommWebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Cart;

public class CartService(ShopDbContext db) : ICartService
{
    public async Task<CartQuoteModel> Quote(CartQuoteRequest request)
    {
        var validation = await Validate(request);
        var lines = validation.Lines
            .Where(line => line.PricedQty > 0)
            .Select(line => new CartQuoteLineModel(line.Sku, line.Name, line.LinePrice))
            .ToList();
        return new CartQuoteModel(validation.Subtotal, validation.Courier, validation.Total, validation.CourierFee, lines);
    }

    public async Task<CartValidateModel> Validate(CartQuoteRequest request)
    {
        var courierDue = request.Delivery != "collect";
        var lines = new List<CartValidateLineModel>();
        var messages = new List<string>();
        var subtotal = 0;
        var ok = true;

        foreach (var requested in request.Lines ?? [])
        {
            if (requested.Qty < 1)
            {
                continue;
            }

            // Live DB read — not the product-list memory cache. Does not reserve stock.
            var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(item => item.Sku == requested.Sku);
            if (product is null)
            {
                ok = false;
                var missing = new CartValidateLineModel(
                    requested.Sku,
                    requested.Sku,
                    requested.Qty,
                    0,
                    0,
                    ShopMoney.Rand(0),
                    ShopMoney.Rand(0),
                    "missing",
                    "This product is no longer in the shop. Remove it from your bag.");
                lines.Add(missing);
                messages.Add(missing.Message);
                continue;
            }

            if (product.Stock < 1)
            {
                ok = false;
                var soldOut = new CartValidateLineModel(
                    product.Sku,
                    product.Name,
                    requested.Qty,
                    0,
                    0,
                    ShopMoney.Rand(product.PriceCents),
                    ShopMoney.Rand(0),
                    "unavailable",
                    $"{product.Name} is out of stock. Remove it from your bag to continue.");
                lines.Add(soldOut);
                messages.Add(soldOut.Message);
                continue;
            }

            if (requested.Qty > product.Stock)
            {
                ok = false;
                var pricedQty = product.Stock;
                var lineCents = product.PriceCents * pricedQty;
                subtotal += lineCents;
                var reduced = new CartValidateLineModel(
                    product.Sku,
                    product.Name,
                    requested.Qty,
                    product.Stock,
                    pricedQty,
                    ShopMoney.Rand(product.PriceCents),
                    ShopMoney.Rand(lineCents),
                    "reduced",
                    $"{product.Name} only has {product.Stock} left. Update your bag to continue.");
                lines.Add(reduced);
                messages.Add(reduced.Message);
                continue;
            }

            var fullCents = product.PriceCents * requested.Qty;
            subtotal += fullCents;
            lines.Add(new CartValidateLineModel(
                product.Sku,
                product.Name,
                requested.Qty,
                product.Stock,
                requested.Qty,
                ShopMoney.Rand(product.PriceCents),
                ShopMoney.Rand(fullCents),
                "ok",
                ""));
        }

        var hasPriced = lines.Any(line => line.PricedQty > 0);
        var courier = courierDue && hasPriced ? ShopMoney.CourierCents : 0;
        return new CartValidateModel(
            ok && lines.Count > 0,
            ShopMoney.Rand(subtotal),
            ShopMoney.Rand(courier),
            ShopMoney.Rand(subtotal + courier),
            ShopMoney.Rand(ShopMoney.CourierCents),
            lines,
            messages);
    }
}
