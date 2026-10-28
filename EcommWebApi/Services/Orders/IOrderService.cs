using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Orders;

public interface IOrderService
{
    Task<OrderModel?> Receipt(string key);

    Task<ShopOutcome<CheckoutModel>> Create(CreateOrderRequest request);

    Task<List<OrderModel>> List();

    Task<List<OrderModel>> ListForEmail(string email);

    Task<OrderModel?> Get(string number);

    Task<OrderModel?> GetForEmail(string number, string email);

    Task<OrderModel?> Pack(string number);

    Task<ShopOutcome<OrderModel>> Ship(string number, string? tracking);

    Task<ShopOutcome<OrderModel>> Complete(string number);

    Task<OrderSummaryModel> Summary();

    Task<SalesModel> Sales();
}
