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

public record OrderSummaryModel(int Today, string PaidToday, string PaidTodayShort, int Awaiting, int LowStock);

public record SalesMonthModel(string Month, int ProfitCents);

public record SalesModel(
    string TotalSales,
    int OrderCount,
    string Profit,
    string ThisMonth,
    List<SalesMonthModel> Months);

public record CartQuoteLineModel(string Sku, string Name, string Price);

public record CartQuoteModel(string Subtotal, string Courier, string Total, string CourierFee, List<CartQuoteLineModel> Lines);

public record CartQuoteRequest(string? Delivery, List<OrderLineRequest>? Lines);

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

public record StarterLineModel(string Sku, string Name, int Qty, string Detail);

public record ShopDefaultsModel(
    string CustomerEmail,
    string AdminEmail,
    string Name,
    string Phone,
    string Street,
    string Suburb,
    string City,
    string Province,
    string PostalCode,
    string Delivery,
    List<StarterLineModel> Bag);
