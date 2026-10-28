using EcommWebApi.Contracts;
using EcommWebApi.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthModel>> Register(RegisterRequest request) =>
        ShopResults.From(await auth.Register(request));

    [HttpPost("sign-in")]
    public async Task<ActionResult<AuthModel>> SignIn(SignInRequest request) =>
        ShopResults.From(await auth.SignIn(request));
}
