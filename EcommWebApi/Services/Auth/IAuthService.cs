using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Auth;

public interface IAuthService
{
    Task<ShopOutcome<AuthModel>> Register(RegisterRequest request);

    Task<ShopOutcome<AuthModel>> SignIn(SignInRequest request);
}
