using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(ShopDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthModel>> Register(RegisterRequest request)
    {
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        if (name.Length == 0 || email.Length == 0 || request.Password.Length < 8)
        {
            return BadRequest(new MessageModel("Name, email, and a password of at least 8 characters are required."));
        }
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return Conflict(new MessageModel("That email already has an account."));
        }
        var user = new ShopUser
        {
            Name = name,
            Email = email,
            Phone = request.Phone.Trim(),
            PasswordHash = PasswordBox.Hash(request.Password),
            Role = "Customer",
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Auth(user);
    }

    [HttpPost("sign-in")]
    public async Task<ActionResult<AuthModel>> SignIn(SignInRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || !PasswordBox.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new MessageModel("Email or password does not match."));
        }
        return Auth(user);
    }

    private AuthModel Auth(ShopUser user) => new(tokens.Create(user), user.Name, user.Email, user.Role);
}
