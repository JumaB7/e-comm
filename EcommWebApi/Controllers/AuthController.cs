using EcommWebApi.Contracts;
using EcommWebApi.Services;
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
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthModel>> Refresh(RefreshRequest request) =>
        ShopResults.From(await auth.Refresh(request));

    [EnableRateLimiting("auth")]
    [HttpPost("sign-out")]
    public async Task<ActionResult<MessageModel>> SignOut(RefreshRequest? request) =>
        ShopResults.From(await auth.SignOut(request?.RefreshToken));

    [Authorize]
    [EnableRateLimiting("auth")]
    [HttpPost("revoke-sessions")]
    public async Task<ActionResult<MessageModel>> RevokeSessions()
    {
        var userId = ShopClaims.UserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }
        return ShopResults.From(await auth.RevokeSessions(userId.Value));
    }

    [EnableRateLimiting("auth")]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<MessageModel>> ForgotPassword(ForgotPasswordRequest request) =>
        ShopResults.From(await auth.RequestPasswordReset(request));

    [EnableRateLimiting("auth")]
    [HttpPost("reset-password")]
    public async Task<ActionResult<MessageModel>> ResetPassword(ConfirmPasswordResetRequest request) =>
        ShopResults.From(await auth.ConfirmPasswordReset(request));

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<CheckoutProfileModel>> Profile()
    {
        var userId = ShopClaims.UserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }
        return ShopResults.From(await auth.Profile(userId.Value));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ProfileUpdateModel>> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = ShopClaims.UserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }
        return ShopResults.From(await auth.UpdateProfile(userId.Value, request));
    }
}
