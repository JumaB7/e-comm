using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Products;

public class ProductService(ShopDbContext db, IProductImageStore images) : IProductService
{
    private static readonly Dictionary<string, string> SkuPrefixes = new(StringComparer.Ordinal)
    {
        ["Optics"] = "VS-OPT-",
        ["Apparel"] = "VS-APP-",
        ["Knives"] = "VS-KNF-",
        ["Packs"] = "VS-PCK-",
        ["Camp"] = "VS-CMP-",
    };

    public async Task<List<ProductModel>> List()
    {
        var products = await db.Products.Include(product => product.Specs).OrderBy(product => product.Id).ToListAsync();
        return products.Select(OrderMapper.Product).ToList();
    }

    public async Task<ProductModel?> Get(string sku)
    {
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Sku == sku);
        return product is null ? null : OrderMapper.Product(product);
    }

    public async Task<ShopOutcome<ProductModel>> Add(CreateProductRequest request)
    {
        var name = request.Name.Trim();
        var sku = request.Sku.Trim();
        if (name.Length == 0 || sku.Length == 0 || request.PriceRands < 1 || request.Stock < 0)
        {
            return ShopOutcome<ProductModel>.BadRequest("Name, SKU, price, and stock are required.");
        }
        if (await db.Products.AnyAsync(product => product.Sku == sku))
        {
            return ShopOutcome<ProductModel>.Conflict("That SKU is already in the shop.");
        }
        var category = string.IsNullOrWhiteSpace(request.Category) ? "Camp" : request.Category.Trim();
        if (!SkuPrefixes.TryGetValue(category, out var prefix) || !sku.StartsWith(prefix, StringComparison.Ordinal) || sku.Length == prefix.Length)
        {
            return ShopOutcome<ProductModel>.BadRequest($"The SKU has to start with {prefix ?? "the category prefix"} and include a code.");
        }
        var cents = ShopMoney.RandsToCents(request.PriceRands);
        var product = new Product
        {
            Sku = sku,
            Name = name,
            Category = category,
            PriceCents = cents,
            CostCents = cents * 67 / 100,
            Stock = request.Stock,
            Blurb = $"{name}. Sold on its own.",
            Image = "",
            Specs = SpecsFrom(request.Specs),
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return ShopOutcome<ProductModel>.Ok(OrderMapper.Product(product));
    }

    public async Task<ShopOutcome<ProductModel>> Update(string sku, CreateProductRequest request)
    {
        var name = request.Name.Trim();
        var nextSku = request.Sku.Trim();
        if (name.Length == 0 || nextSku.Length == 0 || request.PriceRands < 1 || request.Stock < 0)
        {
            return ShopOutcome<ProductModel>.BadRequest("Name, SKU, price, and stock are required.");
        }
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Sku == sku);
        if (product is null)
        {
            return ShopOutcome<ProductModel>.NotFound("That product is not in the shop.");
        }
        var category = string.IsNullOrWhiteSpace(request.Category) ? product.Category : request.Category.Trim();
        var skuChanged = !nextSku.Equals(product.Sku, StringComparison.Ordinal);
        if (skuChanged && (!SkuPrefixes.TryGetValue(category, out var prefix) || !nextSku.StartsWith(prefix, StringComparison.Ordinal) || nextSku.Length == prefix.Length))
        {
            return ShopOutcome<ProductModel>.BadRequest($"The SKU has to start with {SkuPrefixes.GetValueOrDefault(category) ?? "the category prefix"} and include a code.");
        }
        if (!SkuPrefixes.ContainsKey(category))
        {
            return ShopOutcome<ProductModel>.BadRequest("Choose a category from the list.");
        }
        if (skuChanged && await db.Products.AnyAsync(item => item.Sku == nextSku))
        {
            return ShopOutcome<ProductModel>.Conflict("That SKU is already in the shop.");
        }
        product.Name = name;
        if (skuChanged)
        {
            try
            {
                var moved = await images.Rename(product.Sku, nextSku);
                if (moved is not null)
                {
                    product.Image = moved;
                }
            }
            catch (InvalidOperationException error)
            {
                return ShopOutcome<ProductModel>.BadRequest(error.Message);
            }

            product.Sku = nextSku;
        }
        product.Category = category;
        product.PriceCents = ShopMoney.RandsToCents(request.PriceRands);
        product.Stock = request.Stock;
        product.Specs.Clear();
        foreach (var spec in SpecsFrom(request.Specs))
        {
            product.Specs.Add(spec);
        }
        await db.SaveChangesAsync();
        return ShopOutcome<ProductModel>.Ok(OrderMapper.Product(product));
    }

    public async Task<bool> Delete(string sku)
    {
        var product = await db.Products.FirstOrDefaultAsync(item => item.Sku == sku);
        if (product is null)
        {
            return false;
        }
        await images.Remove(product.Sku);
        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<ShopOutcome<ProductModel>> SetImage(string sku, IFormFile file)
    {
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Sku == sku);
        if (product is null)
        {
            return ShopOutcome<ProductModel>.NotFound("That product is not in the shop.");
        }
        try
        {
            product.Image = await images.Save(product.Sku, file);
        }
        catch (InvalidOperationException error)
        {
            return ShopOutcome<ProductModel>.BadRequest(error.Message);
        }
        await db.SaveChangesAsync();
        return ShopOutcome<ProductModel>.Ok(OrderMapper.Product(product));
    }

    public async Task<ShopOutcome<ProductModel>> AdjustStock(StockRequest request)
    {
        if (request.Quantity < 1 || request.Direction is not (1 or -1))
        {
            return ShopOutcome<ProductModel>.BadRequest("Quantity has to be at least 1.");
        }
        var name = request.Name.Trim().ToLowerInvariant();
        var product = await db.Products.Include(item => item.Specs).FirstOrDefaultAsync(item => item.Name.ToLower() == name);
        if (product is null)
        {
            return ShopOutcome<ProductModel>.NotFound("No product uses that name.");
        }
        product.Stock = Math.Max(0, product.Stock + request.Direction * request.Quantity);
        await db.SaveChangesAsync();
        return ShopOutcome<ProductModel>.Ok(OrderMapper.Product(product));
    }

    private static List<ProductSpec> SpecsFrom(List<SpecModel>? specs)
    {
        var rows = new List<ProductSpec>();
        foreach (var spec in specs ?? [])
        {
            var label = spec.Label.Trim();
            var specValue = spec.Value.Trim();
            if (label.Length == 0 || specValue.Length == 0 || label.Equals("Delivery", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            rows.Add(new ProductSpec { Label = label, Value = specValue });
        }
        rows.Add(new ProductSpec { Label = "Delivery", Value = "Courier, 2–5 working days" });
        return rows;
    }
}
