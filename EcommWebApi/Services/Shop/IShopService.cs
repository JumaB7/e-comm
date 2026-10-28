using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Shop;

public interface IShopService
{
    Task<ShopDefaultsModel> Defaults();
}
