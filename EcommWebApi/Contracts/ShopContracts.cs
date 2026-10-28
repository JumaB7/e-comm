namespace EcommWebApi.Contracts;

public record SpecModel(string Label, string Value);

public record ProductModel(
    string Sku,
    string Name,
    string Category,
    string Price,
    int Amount,
    int Stock,
    bool Low,
    string Blurb,
    List<SpecModel> Specs);

public record OrderModel(
    string Id,
    string Customer,
    string Email,
    string Phone,
    string Address,
    string Total,
    string Status,
    string Tone,
    string Fulfilment,
    string FulfilmentNote,
    string Reference,
    string PaidDetail,
    string PaymentNote,
    string DeliveryNote,
    List<string> Lines);

public record CheckoutModel(
    OrderModel Order,
    string ReceiptKey,
    string Mode,
    string? PayFastUrl,
    Dictionary<string, string>? Fields);

public record AuthModel(string Token, string Name, string Email, string Role);

public record OrderSummaryModel(int Today, int PaidTodayCents, int Awaiting, int LowStock);

public record SalesMonthModel(string Month, int ProfitCents);

public record SalesModel(
    int TotalSalesCents,
    int OrderCount,
    int ProfitCents,
    int ThisMonthCents,
    List<SalesMonthModel> Months);

public record CreateProductRequest(string Name, string Sku, string Category, int PriceRands, int Stock);

public record StockRequest(string Name, int Quantity, int Direction);

public record OrderLineRequest(string Sku, int Qty, string? Detail);

public record CreateOrderRequest(
    string Email,
    string Phone,
    string Name,
    string Street,
    string Suburb,
    string City,
    string Province,
    string PostalCode,
    string Delivery,
    string Method,
    List<OrderLineRequest> Lines);

public record RegisterRequest(string Name, string Email, string Phone, string Password);

public record SignInRequest(string Email, string Password);

public record MessageModel(string Message);

public record HealthResponse(string Status);
