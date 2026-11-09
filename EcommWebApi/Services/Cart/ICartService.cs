using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Cart;

public interface ICartService
{
    Task<CartQuoteModel> Quote(CartQuoteRequest request);

    /// <summary>Authoritative availability and prices for the bag. Does not reserve stock.</summary>
    Task<CartValidateModel> Validate(CartQuoteRequest request);
}
