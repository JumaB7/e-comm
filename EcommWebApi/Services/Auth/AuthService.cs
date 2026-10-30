using System.Security.Cryptography;
using System.Text;
using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Models;
using EcommWebApi.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Services.Auth;

public class AuthService(
    ShopDbContext db,
    TokenService tokens,
    IEmailSender emailSender,
    IConfiguration configuration,
    IHostEnvironment environment) : IAuthService
{
    private static readonly TimeSpan ResetLifetime = TimeSpan.FromHours(1);

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

    public async Task<ShopOutcome<MessageModel>> RequestPasswordReset(ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        // Always the same response — do not reveal whether the account exists.
        const string generic = "If that email is on an account, we sent a reset link. Check your inbox.";
        if (email.Length == 0 || !email.Contains('@'))
        {
            return ShopOutcome<MessageModel>.BadRequest("Enter a valid email address.");
        }

        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null)
        {
            return ShopOutcome<MessageModel>.Ok(new MessageModel(generic));
        }

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        user.PasswordResetTokenHash = HashToken(rawToken);
        user.PasswordResetExpiresAt = DateTime.UtcNow.Add(ResetLifetime);
        await db.SaveChangesAsync();

        var appBase = (configuration["App:PublicUrl"] ?? configuration["PayFast:ReturnBase"] ?? "http://localhost:4200")
            .TrimEnd('/');
        var resetLink = $"{appBase}/reset-password?token={Uri.EscapeDataString(rawToken)}";
        await emailSender.SendPasswordReset(
            user.Email,
            user.Name,
            resetLink,
            $"pwd-reset-{user.PasswordResetTokenHash}");

        // Dev only: surface the link in the API response so local testing works without SMTP.
        var linkForDev = environment.IsDevelopment() ? resetLink : null;
        return ShopOutcome<MessageModel>.Ok(new MessageModel(generic, linkForDev));
    }

    public async Task<ShopOutcome<MessageModel>> ConfirmPasswordReset(ConfirmPasswordResetRequest request)
    {
        var token = request.Token.Trim();
        if (token.Length == 0 || request.Password.Length < 8)
        {
            return ShopOutcome<MessageModel>.BadRequest("A valid reset link and a password of at least 8 characters are required.");
        }

        var hash = HashToken(token);
        var user = await db.Users.FirstOrDefaultAsync(item => item.PasswordResetTokenHash == hash);
        if (user is null || user.PasswordResetExpiresAt is null || user.PasswordResetExpiresAt < DateTime.UtcNow)
        {
            return ShopOutcome<MessageModel>.BadRequest("That reset link is invalid or has expired. Request a new one.");
        }

        user.PasswordHash = PasswordBox.Hash(request.Password);
        user.PasswordResetTokenHash = null;
        user.PasswordResetExpiresAt = null;
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

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
