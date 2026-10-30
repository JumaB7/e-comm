using System.Security.Claims;
using EcommWebApi.Contracts;
using EcommWebApi.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<ActionResult<AuthModel>> Register(RegisterRequest request) =>
        ShopResults.From(await auth.Register(request));

    [EnableRateLimiting("auth")]
    [HttpPost("sign-in")]
    public async Task<ActionResult<AuthModel>> SignIn(SignInRequest request) =>
        ShopResults.From(await auth.SignIn(request));

    [EnableRateLimiting("auth")]
    [HttpPost("reset-password")]
    public async Task<ActionResult<MessageModel>> ResetPassword(ResetPasswordRequest request) =>
        ShopResults.From(await auth.ResetPassword(request));

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<CheckoutProfileModel>> Profile()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
        return ShopResults.From(await auth.Profile(email));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ProfileUpdateModel>> UpdateProfile(UpdateProfileRequest request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
        return ShopResults.From(await auth.UpdateProfile(email, request));
    }
}
