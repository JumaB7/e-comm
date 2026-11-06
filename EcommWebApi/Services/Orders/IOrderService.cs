using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Orders;

public interface IOrderService
{
    Task<OrderModel?> Receipt(string key);

    Task<ShopOutcome<CheckoutModel>> Create(CreateOrderRequest request, int? shopUserId);

    Task<List<OrderModel>> List();

    Task<List<OrderModel>> ListForUser(int shopUserId);

    Task<OrderModel?> Get(string number);

    Task<OrderModel?> GetForUser(string number, int shopUserId);

    Task<OrderModel?> Pack(string number);

    Task<ShopOutcome<OrderModel>> Ship(string number, string? tracking);

    Task<ShopOutcome<OrderModel>> Complete(string number);

    Task<OrderSummaryModel> Summary();

    Task<SalesModel> Sales();
}
