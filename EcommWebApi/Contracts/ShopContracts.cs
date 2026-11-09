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
    string Image,
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
    List<string> Lines,
    string Placed,
    string Delivery,
    string Tracking,
    string FulfilmentTone,
    string Alert,
    string Queue);

public record CheckoutModel(
    OrderModel Order,
    string ReceiptKey,
    string Mode,
    string? PayFastUrl,
    Dictionary<string, string>? Fields);

public record AuthModel(string Token, string RefreshToken, string Name, string Email, string Phone, string Role);

public record RefreshRequest(string RefreshToken);

public record CheckoutProfileModel(
    string Name,
    string Email,
    string Phone,
    string Street,
    string Suburb,
    string City,
    string Province,
    string PostalCode,
    string Delivery,
    bool PrefillCheckout);

public record UpdateProfileRequest(
    string Name,
    string Email,
    string Phone,
    string Street,
    string Suburb,
    string City,
    string Province,
    string PostalCode,
    string Delivery,
    bool PrefillCheckout);

public record ProfileUpdateModel(AuthModel Session, CheckoutProfileModel Profile);

public record OrderSummaryModel(int Today, string PaidToday, string PaidTodayShort, int Awaiting, int LowStock);

public record TrackingRequest(string? Tracking);

public record SalesDeltaModel(string Text, bool Up, bool Flat);

public record SalesStatModel(string Label, string Value, SalesDeltaModel Change);

public record SalesMonthPointModel(string Month, int SalesRands, int ProfitRands);

public record SalesCategoryModel(string Name, string Amount, int Share, int AmountRands);

public record SalesModel(
    string Period,
    string ProfitTotal,
    string ProfitNote,
    List<SalesMonthPointModel> Months,
    string Margin,
    string MarginNote,
    bool MarginHealthy,
    string GrossProfit,
    string ProductCosts,
    List<SalesCategoryModel> Categories,
    string RepeatShare,
    SalesDeltaModel RepeatChange,
    int RepeatFilled,
    int NewCustomers,
    int ReturningCustomers,
    string RefundRate,
    List<SalesStatModel> Stats);

public record CartQuoteLineModel(string Sku, string Name, string Price);

public record CartQuoteModel(string Subtotal, string Courier, string Total, string CourierFee, List<CartQuoteLineModel> Lines);

public record CartQuoteRequest(string? Delivery, List<OrderLineRequest>? Lines);

/// <summary>Read-only bag check — does not reserve stock.</summary>
public record CartValidateLineModel(
    string Sku,
    string Name,
    int RequestedQty,
    int AvailableStock,
    int PricedQty,
    string UnitPrice,
    string LinePrice,
    string Status,
    string Message);

public record CartValidateModel(
    bool Ok,
    string Subtotal,
    string Courier,
    string Total,
    string CourierFee,
    List<CartValidateLineModel> Lines,
    List<string> Messages);

public record CreateProductRequest(string Name, string Sku, string Category, int PriceRands, int Stock, List<SpecModel>? Specs);

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

public record ForgotPasswordRequest(string Email);

public record ConfirmPasswordResetRequest(string Token, string Password);

public record MessageModel(string Message, string? ResetLink = null);

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
