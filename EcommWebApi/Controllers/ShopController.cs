using EcommWebApi.Contracts;
using EcommWebApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/shop")]
public class ShopController(ShopDbContext db) : ControllerBase
{
    [HttpGet("defaults")]
    public async Task<ShopDefaultsModel> Defaults()
    {
        var users = await db.Users.AsNoTracking().OrderBy(user => user.Id).ToListAsync();
        var admin = users.FirstOrDefault(user => user.Role == "Admin");
        var customer = users.FirstOrDefault(user => user.Role == "Customer");
        var order = customer is null
            ? null
            : await db.Orders.AsNoTracking()
                .Include(item => item.Lines)
                .Where(item => item.Email == customer.Email)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefaultAsync();
        var delivery = order?.Delivery == "collect" ? "collect" : "courier";
        var bag = order?.Lines
            .Select(line => new StarterLineModel(line.Sku, line.Name, line.Quantity, line.Detail))
            .ToList() ?? [];
        return new ShopDefaultsModel(
            customer?.Email ?? "",
            admin?.Email ?? "",
            order?.CustomerName ?? customer?.Name ?? "",
            order?.Phone ?? customer?.Phone ?? "",
            order?.Street ?? "",
            order?.Suburb ?? "",
            order?.City ?? "",
            order?.Province ?? "",
            order?.PostalCode ?? "",
            delivery,
            bag);
    }
}
