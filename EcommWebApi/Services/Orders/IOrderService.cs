using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Orders;

public interface IOrderService
{
    Task<OrderModel?> Receipt(string key);

    Task<ShopOutcome<CheckoutModel>> Create(CreateOrderRequest request);

    Task<List<OrderModel>> List();

    Task<OrderModel?> Get(string number);

    Task<OrderModel?> Pack(string number);

    Task<OrderSummaryModel> Summary();

    Task<SalesModel> Sales();
}
