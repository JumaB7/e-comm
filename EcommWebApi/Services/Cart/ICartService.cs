using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Cart;

public interface ICartService
{
    Task<CartQuoteModel> Quote(CartQuoteRequest request);
}
