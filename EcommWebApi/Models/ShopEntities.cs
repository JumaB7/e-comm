namespace EcommWebApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int PriceCents { get; set; }
    public int CostCents { get; set; }
    public int Stock { get; set; }
    public string Blurb { get; set; } = "";
    public string Image { get; set; } = "";
    public List<ProductSpec> Specs { get; set; } = [];
}

public class ProductSpec
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Label { get; set; } = "";
    public string Value { get; set; } = "";
}

public class ShopUser
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    /// <summary>Seed/ops only — never accept Role from register/profile HTTP bodies.</summary>
    public string Role { get; set; } = "Customer";
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public string Street { get; set; } = "";
    public string Suburb { get; set; } = "";
    public string City { get; set; } = "";
    public string Province { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string Delivery { get; set; } = "courier";
    public bool PrefillCheckout { get; set; } = true;
}

public class ShopOrder
{
    public int Id { get; set; }
    public string Number { get; set; } = "";
    public string ReceiptKey { get; set; } = "";
    /// <summary>Set when checkout is signed in; guest orders stay null until claimed by email match.</summary>
    public int? ShopUserId { get; set; }
    public string CustomerName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Street { get; set; } = "";
    public string Suburb { get; set; } = "";
    public string City { get; set; } = "";
    public string Province { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string Delivery { get; set; } = "courier";
    public int CourierCents { get; set; }
    public int TotalCents { get; set; }
    public string Status { get; set; } = "Awaiting payment";
    public string Tone { get; set; } = "awaiting";
    public string Fulfilment { get; set; } = "Waiting";
    public string FulfilmentNote { get; set; } = "Waiting on payment.";
    public string PayFastReference { get; set; } = "";
    public string PaymentMethod { get; set; } = "";
    public string PaymentNote { get; set; } = "Paid only after the PayFast signature matches.";
    public string TrackingNumber { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? PackedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    /// <summary>True when checkout already decremented stock; unpaid expiry restores once.</summary>
    public bool StockReserved { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}

public class OrderLine
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public string Detail { get; set; } = "";
    public int Quantity { get; set; }
    public int UnitPriceCents { get; set; }
    public int UnitCostCents { get; set; }
}
