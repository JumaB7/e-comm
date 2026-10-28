using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using EcommWebApi.Contracts;
using EcommWebApi.Models;

namespace EcommWebApi.Services;

public static class ShopMoney
{
    public const int CourierCents = 12_000;
    public const int LowStockAt = 4;

    public static int RandsToCents(int rands) => rands * 100;

    public static int CentsToRands(int cents) => cents / 100;

    public static string Rand(int cents)
    {
        var rands = CentsToRands(cents).ToString(CultureInfo.InvariantCulture);
        var grouped = string.Join(' ', Split(rands));
        return $"R {grouped}";
    }

    public static string RandCompact(int cents)
    {
        var rands = CentsToRands(cents);
        if (rands < 1000)
        {
            return Rand(cents);
        }
        var thousands = (int)Math.Round(rands / 1000d, MidpointRounding.AwayFromZero);
        return $"R {thousands}k";
    }

    public static string PayFastAmount(int cents) =>
        (cents / 100m).ToString("0.00", CultureInfo.InvariantCulture);

    private static IEnumerable<string> Split(string digits)
    {
        var parts = new List<string>();
        for (var index = digits.Length; index > 0; index -= 3)
        {
            var start = Math.Max(0, index - 3);
            parts.Add(digits[start..index]);
        }
        parts.Reverse();
        return parts;
    }
}

public static class PasswordBox
{
    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string stored)
    {
        var parts = stored.Split('.');
        if (parts.Length != 2)
        {
            return false;
        }
        var salt = Convert.FromBase64String(parts[0]);
        var expected = Convert.FromBase64String(parts[1]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}

public static class PayFastSignature
{
    public static string Sign(IEnumerable<KeyValuePair<string, string>> fields, string passphrase)
    {
        var pairs = fields
            .Where(field => field.Key != "signature" && !string.IsNullOrEmpty(field.Value))
            .Select(field => $"{field.Key}={Encode(field.Value)}");
        var payload = string.Join("&", pairs);
        if (!string.IsNullOrEmpty(passphrase))
        {
            payload += $"&passphrase={Encode(passphrase)}";
        }
        var hash = MD5.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static bool Matches(IEnumerable<KeyValuePair<string, string>> fields, string passphrase)
    {
        var list = fields.ToList();
        var provided = list.FirstOrDefault(field => field.Key == "signature").Value ?? "";
        var expected = Sign(list, passphrase);
        var providedBytes = Encoding.UTF8.GetBytes(provided);
        var expectedBytes = Encoding.UTF8.GetBytes(expected);
        return providedBytes.Length == expectedBytes.Length && CryptographicOperations.FixedTimeEquals(providedBytes, expectedBytes);
    }

    private static string Encode(string value) => Uri.EscapeDataString(value.Trim()).Replace("%20", "+");
}

public static class OrderMapper
{
    private static readonly TimeZoneInfo ShopZone = TimeZoneInfo.FindSystemTimeZoneById("South Africa Standard Time");

    public static ProductModel Product(Product product) => new(
        product.Sku,
        product.Name,
        product.Category,
        ShopMoney.Rand(product.PriceCents),
        ShopMoney.CentsToRands(product.PriceCents),
        product.Stock,
        product.Stock <= ShopMoney.LowStockAt,
        product.Blurb,
        product.Specs.Select(spec => new SpecModel(spec.Label, spec.Value)).ToList());

    public static OrderModel Order(ShopOrder order)
    {
        var lines = order.Lines.Select(Line).ToList();
        if (order.CourierCents > 0)
        {
            lines.Add($"Courier · {ShopMoney.Rand(order.CourierCents)}");
        }
        return new OrderModel(
            order.Number,
            order.CustomerName,
            order.Email,
            order.Phone,
            Address(order),
            ShopMoney.Rand(order.TotalCents),
            order.Status,
            order.Tone,
            order.Fulfilment,
            order.FulfilmentNote,
            order.PayFastReference,
            PaidDetail(order),
            order.PaymentNote,
            DeliveryNote(order),
            lines);
    }

    public static string Address(ShopOrder order) =>
        string.Join(", ", new[] { order.Street, order.Suburb, order.City, order.PostalCode }.Where(part => part.Length > 0));

    public static string DeliveryNote(ShopOrder order) =>
        order.Delivery == "courier"
            ? $"Courier to {order.Street}, {order.Suburb}. 2–5 working days."
            : "Collect from the shop. We will email when it is packed.";

    public static DateTime ShopNow() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ShopZone);

    public static DateTime ShopDate(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), ShopZone).Date;

    public static DateTime ToUtc(DateTime shopTime) => TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(shopTime, DateTimeKind.Unspecified), ShopZone);

    private static string Line(OrderLine line)
    {
        var middle = string.IsNullOrEmpty(line.Detail) ? line.Quantity.ToString(CultureInfo.InvariantCulture) : line.Detail;
        return $"{line.Name} · {middle} · {ShopMoney.Rand(line.UnitPriceCents * line.Quantity)}";
    }

    private static string PaidDetail(ShopOrder order)
    {
        if (order.PaidAt is null)
        {
            return $"{ShopMoney.Rand(order.TotalCents)} · not paid yet";
        }
        var paid = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(order.PaidAt.Value, DateTimeKind.Utc), ShopZone);
        var method = order.PaymentMethod switch
        {
            "eft" => "Instant EFT",
            "capitec" => "Capitec Pay",
            _ => "card",
        };
        return $"{ShopMoney.Rand(order.TotalCents)} · {method} · {paid:dd MMM yyyy, HH:mm}";
    }
}
