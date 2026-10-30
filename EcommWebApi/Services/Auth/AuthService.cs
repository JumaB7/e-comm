using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Auth;

public class AuthService(ShopDbContext db, TokenService tokens) : IAuthService
{
    public async Task<ShopOutcome<AuthModel>> Register(RegisterRequest request)
    {
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        if (name.Length == 0 || email.Length == 0 || request.Password.Length < 8)
        {
            return ShopOutcome<AuthModel>.BadRequest("Name, email, and a password of at least 8 characters are required.");
        }
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return ShopOutcome<AuthModel>.Conflict("That email already has an account.");
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
        return ShopOutcome<AuthModel>.Ok(Session(user));
    }

    public async Task<ShopOutcome<AuthModel>> SignIn(SignInRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || !PasswordBox.Verify(request.Password, user.PasswordHash))
        {
            return ShopOutcome<AuthModel>.Unauthorized("Email or password does not match.");
        }
        return ShopOutcome<AuthModel>.Ok(Session(user));
    }

    public async Task<ShopOutcome<MessageModel>> ResetPassword(ResetPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var phone = Digits(request.Phone);
        if (email.Length == 0 || phone.Length == 0 || request.Password.Length < 8)
        {
            return ShopOutcome<MessageModel>.BadRequest("Email, phone, and a password of at least 8 characters are required.");
        }
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || Digits(user.Phone) != phone)
        {
            return ShopOutcome<MessageModel>.Unauthorized("Email or phone does not match an account.");
        }
        user.PasswordHash = PasswordBox.Hash(request.Password);
        await db.SaveChangesAsync();
        return ShopOutcome<MessageModel>.Ok(new MessageModel("Password updated. Sign in with the new password."));
    }

    public async Task<ShopOutcome<CheckoutProfileModel>> Profile(string email)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Email == email);
        if (user is null)
        {
            return ShopOutcome<CheckoutProfileModel>.Unauthorized("Sign in again.");
        }
        var order = await db.Orders.AsNoTracking()
            .Where(item => item.Email == email)
            .OrderByDescending(item => item.CreatedAt)
            .FirstOrDefaultAsync();
        return ShopOutcome<CheckoutProfileModel>.Ok(new CheckoutProfileModel(
            user.Name,
            user.Email,
            user.Phone,
            order?.Street ?? "",
            order?.Suburb ?? "",
            order?.City ?? "",
            order?.Province ?? "",
            order?.PostalCode ?? "",
            order?.Delivery == "collect" ? "collect" : "courier"));
    }

    private AuthModel Session(ShopUser user) => new(tokens.Create(user), user.Name, user.Email, user.Phone, user.Role);

    private static string Digits(string value) => new([.. value.Where(char.IsDigit)]);
}
