using EcommWebApi.Models;
using EcommWebApi.Services;

namespace EcommWebApi.Data;

public static class ShopSeed
{
    private const string PaidNote = "Marked paid only because the PayFast signature matched.";
    private const string WaitingNote = "Paid only after the PayFast signature matches.";

    public static void Apply(ShopDbContext db)
    {
        if (db.Products.Any())
        {
            return;
        }

        db.Users.AddRange(
            User("Veld Supply", "admin@veldsupply.co.za", "010 000 0000", "Admin"),
            User("Thabo Mokoena", "thabo@example.co.za", "082 555 0142", "Customer"));

        var products = new List<Product>
        {
            Gear("VS-OPT-1042", "10×42 binoculars", "Optics", 8450, 12, "Roof-prism glass for last light. Rubber armour, waterproof, and a strap that stays put on a stalk. Sold as a single pair.", ("Magnification", "10×42"), ("Weight", "680 g"), ("Waterproof", "Yes")),
            Gear("VS-APP-220", "Merino stalking shirt", "Apparel", 1290, 4, "Quiet merino for a long stalk. This listing is the medium.", ("Size", "M")),
            Gear("VS-KNF-018", "Fixed-blade skinner", "Knives", 890, 20, "A fixed blade for skinning in the field. Sold on its own, with a sheath.", ("Blade", "Fixed")),
            Gear("VS-PCK-028", "28L daypack", "Packs", 1750, 9, "A 28 litre daypack for water, glass, and a layer.", ("Volume", "28 L")),
            Gear("VS-CMP-014", "Ground blind", "Camp", 3200, 2, "A ground blind for a sitting hunt. Packs down for the courier."),
            Gear("VS-CMP-033", "Trail camera", "Camp", 2150, 7, "A trail camera for the fence line. Sold as a single unit."),
            Gear("VS-LMP-014", "Rechargeable headlamp", "Camp", 480, 15, "A rechargeable headlamp for camp and the walk back.", ("Power", "Rechargeable")),
            Gear("VS-APP-310", "Stalking boots", "Apparel", 2890, 6, "Boots for a dry stalk. Sold as a pair."),
        };
        db.Products.AddRange(products);
        db.SaveChanges();

        ShopOrder Order(string number, string name, string email, string phone, string street, string suburb, string city, string province, string postal, string delivery, int courier, string status, string tone, string fulfilment, string fulfilmentNote, string reference, string method, DateTime shopTime, bool paid, params (string sku, int qty, string detail)[] lines)
        {
            var when = OrderMapper.ToUtc(shopTime);
            var orderLines = lines.Select(line =>
            {
                var product = products.First(item => item.Sku == line.sku);
                return new OrderLine
                {
                    Sku = product.Sku,
                    Name = product.Name,
                    Detail = line.detail,
                    Quantity = line.qty,
                    UnitPriceCents = product.PriceCents,
                    UnitCostCents = product.CostCents,
                };
            }).ToList();
            return new ShopOrder
            {
                Number = number,
                ReceiptKey = Guid.NewGuid().ToString("N"),
                CustomerName = name,
                Email = email,
                Phone = phone,
                Street = street,
                Suburb = suburb,
                City = city,
                Province = province,
                PostalCode = postal,
                Delivery = delivery,
                CourierCents = courier,
                TotalCents = orderLines.Sum(line => line.UnitPriceCents * line.Quantity) + courier,
                Status = status,
                Tone = tone,
                Fulfilment = fulfilment,
                FulfilmentNote = fulfilmentNote,
                PayFastReference = reference,
                PaymentMethod = method,
                PaymentNote = paid ? PaidNote : WaitingNote,
                CreatedAt = when,
                PaidAt = paid ? when : null,
                Lines = orderLines,
            };
        }

        db.Orders.AddRange(
            Order("VS-1039", "K. Nkosi", "k.nkosi@example.co.za", "082 555 0101", "2 Loop Street", "Cape Town City", "Cape Town", "Western Cape", "8001", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_183100", "card", new DateTime(2026, 5, 15, 10, 0, 0), true, ("VS-LMP-014", 1, "")),
            Order("VS-1040", "P. Meyer", "p.meyer@example.co.za", "083 555 0102", "18 Oak Avenue", "Centurion", "Pretoria", "Gauteng", "0157", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_183400", "card", new DateTime(2026, 6, 12, 11, 30, 0), true, ("VS-APP-220", 1, "M")),
            Order("VS-1041", "R. Pillay", "r.pillay@example.co.za", "071 555 0103", "9 Beach Road", "Umhlanga", "Durban", "KwaZulu-Natal", "4320", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_183700", "eft", new DateTime(2026, 7, 8, 9, 15, 0), true, ("VS-KNF-018", 1, "")),
            Order("VS-1042", "D. Fourie", "d.fourie@example.co.za", "072 555 0104", "41 Voortrekker Road", "Welgemoed", "Bellville", "Western Cape", "7530", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_184000", "card", new DateTime(2026, 8, 20, 15, 45, 0), true, ("VS-APP-310", 1, "")),
            Order("VS-1043", "N. Jacobs", "n.jacobs@example.co.za", "084 555 0105", "6 President Street", "Westdene", "Bloemfontein", "Free State", "9301", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_184300", "card", new DateTime(2026, 9, 18, 13, 5, 0), true, ("VS-PCK-028", 1, "")),
            Order("VS-1044", "S. Botha", "s.botha@example.co.za", "082 555 0110", "19 Reid Street", "Westdene", "Bloemfontein", "Free State", "9301", "collect", 0, "Paid", "paid", "To pack", "Paid, not yet packed.", "pf_184510", "card", new DateTime(2026, 10, 24, 11, 40, 0), true, ("VS-CMP-033", 1, "")),
            Order("VS-1045", "L. Dlamini", "l.dlamini@example.co.za", "071 555 0188", "4 Oxford Road", "Rosebank", "Johannesburg", "Gauteng", "2196", "collect", 0, "Paid", "paid", "Collected", "Collected from the shop.", "pf_184640", "card", new DateTime(2026, 10, 25, 9, 15, 0), true, ("VS-KNF-018", 1, "")),
            Order("VS-1046", "J. van Wyk", "j.vanwyk@example.co.za", "072 555 0144", "22 Church Street", "Stellenbosch", "Stellenbosch", "Western Cape", "7600", "collect", 0, "Paid", "paid", "To collect", "Packed. Waiting for collection.", "pf_184700", "card", new DateTime(2026, 10, 25, 16, 2, 0), true, ("VS-CMP-014", 1, "")),
            Order("VS-1047", "A. Naidoo", "a.naidoo@example.co.za", "083 555 0190", "8 Marine Parade", "Durban", "Durban", "KwaZulu-Natal", "4001", "collect", 0, "Awaiting payment", "awaiting", "Waiting", "Waiting on payment.", "", "", new DateTime(2026, 10, 26, 8, 20, 0), false, ("VS-APP-220", 1, "M")),
            Order("VS-1048", "Thabo Mokoena", "thabo@example.co.za", "082 555 0142", "14 Kloof Road", "Parktown", "Johannesburg", "Gauteng", "2193", "courier", ShopMoney.CourierCents, "Paid", "paid", "To pack", "Paid, not yet packed.", "pf_184920", "card", new DateTime(2026, 10, 26, 14, 12, 0), true, ("VS-OPT-1042", 1, ""), ("VS-APP-220", 1, "M")));
        db.SaveChanges();
    }

    private static ShopUser User(string name, string email, string phone, string role) => new()
    {
        Name = name,
        Email = email,
        Phone = phone,
        Role = role,
        PasswordHash = PasswordBox.Hash("password"),
    };

    private static Product Gear(string sku, string name, string category, int rands, int stock, string blurb, params (string Label, string Value)[] specs)
    {
        var cents = ShopMoney.RandsToCents(rands);
        var product = new Product
        {
            Sku = sku,
            Name = name,
            Category = category,
            PriceCents = cents,
            CostCents = cents * 67 / 100,
            Stock = stock,
            Blurb = blurb,
        };
        product.Specs.Add(new ProductSpec { Label = "Delivery", Value = "Courier, 2–5 working days" });
        foreach (var spec in specs)
        {
            product.Specs.Insert(product.Specs.Count - 1, new ProductSpec { Label = spec.Label, Value = spec.Value });
        }
        return product;
    }
}
