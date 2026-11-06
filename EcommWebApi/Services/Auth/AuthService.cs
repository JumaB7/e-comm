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
        // Role is always Customer here — never take it from the request body.
        var user = new ShopUser
        {
            Name = name,
            Email = email,
            Phone = request.Phone.Trim(),
            PasswordHash = PasswordBox.Hash(request.Password),
            Role = "Customer",
            PrefillCheckout = true,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        await ClaimGuestOrders(user);
        return ShopOutcome<AuthModel>.Ok(await IssueSession(user));
    }

    public async Task<ShopOutcome<AuthModel>> SignIn(SignInRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);
        if (user is null || !PasswordBox.Verify(request.Password, user.PasswordHash))
        {
            return ShopOutcome<AuthModel>.Unauthorized("Email or password does not match.");
        }
        await ClaimGuestOrders(user);
        return ShopOutcome<AuthModel>.Ok(await IssueSession(user));
    }

    public async Task<ShopOutcome<AuthModel>> Refresh(RefreshRequest request)
    {
        var raw = request.RefreshToken.Trim();
        if (raw.Length == 0)
        {
            return ShopOutcome<AuthModel>.Unauthorized("Sign in again.");
        }

        var hash = HashToken(raw);
        var user = await db.Users.FirstOrDefaultAsync(item => item.RefreshTokenHash == hash);
        if (user is null
            || user.RefreshTokenExpiresAt is null
            || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            if (user is not null)
            {
                ClearRefresh(user);
                await db.SaveChangesAsync();
            }
            return ShopOutcome<AuthModel>.Unauthorized("Sign in again.");
        }

        // Rotate refresh token on each use.
        return ShopOutcome<AuthModel>.Ok(await IssueSession(user));
    }

    public async Task<ShopOutcome<MessageModel>> SignOut(string? refreshToken)
    {
        var raw = refreshToken?.Trim() ?? "";
        if (raw.Length > 0)
        {
            var hash = HashToken(raw);
            var user = await db.Users.FirstOrDefaultAsync(item => item.RefreshTokenHash == hash);
            if (user is not null)
            {
                ClearRefresh(user);
                await db.SaveChangesAsync();
            }
        }
        return ShopOutcome<MessageModel>.Ok(new MessageModel("Signed out."));
    }

    public async Task<ShopOutcome<MessageModel>> RevokeSessions(int userId)
    {
        var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);
        if (user is null)
        {
            return ShopOutcome<MessageModel>.NotFound();
        }
        ClearRefresh(user);
        await db.SaveChangesAsync();
        return ShopOutcome<MessageModel>.Ok(new MessageModel("Sessions revoked. Sign in again."));
    }

    public async Task<ShopOutcome<MessageModel>> SetRoleForOps(int userId, string role)
    {
        var normalized = role.Trim();
        if (normalized is not ("Admin" or "Customer"))
        {
            return ShopOutcome<MessageModel>.BadRequest("Role must be Admin or Customer.");
        }
        var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);
        if (user is null)
        {
            return ShopOutcome<MessageModel>.NotFound();
        }
        if (user.Role == normalized)
        {
            return ShopOutcome<MessageModel>.Ok(new MessageModel("Role unchanged."));
        }
        user.Role = normalized;
        // Demotion / promotion invalidates refresh so the old access JWT cannot be extended.
        ClearRefresh(user);
        await db.SaveChangesAsync();
        return ShopOutcome<MessageModel>.Ok(new MessageModel($"Role set to {normalized}. Sessions revoked."));
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

        // Email the raw token; only the hash is stored.
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        user.PasswordResetTokenHash = HashToken(rawToken);
        user.PasswordResetExpiresAt = DateTime.UtcNow.Add(ResetLifetime);
        ClearRefresh(user);
        await db.SaveChangesAsync();

        var appBase = (configuration["App:PublicUrl"] ?? configuration["PayFast:ReturnBase"] ?? "http://localhost:4200")
            .TrimEnd('/');
        var resetLink = $"{appBase}/reset-password?token={Uri.EscapeDataString(rawToken)}";
        await emailSender.SendPasswordReset(
            user.Email,
            user.Name,
            resetLink,
            $"pwd-reset-{user.PasswordResetTokenHash}");

        // Dev only: include the link in JSON so local testing works without inbox delivery.
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
        ClearRefresh(user);
        await db.SaveChangesAsync();
        return ShopOutcome<MessageModel>.Ok(new MessageModel("Password updated. Sign in with the new password."));
    }

    public async Task<ShopOutcome<CheckoutProfileModel>> Profile(int userId)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId);
        if (user is null)
        {
            return ShopOutcome<CheckoutProfileModel>.Unauthorized("Sign in again.");
        }
        return ShopOutcome<CheckoutProfileModel>.Ok(await MapProfile(user));
    }

    public async Task<ShopOutcome<ProfileUpdateModel>> UpdateProfile(int userId, UpdateProfileRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(item => item.Id == userId);
        if (user is null)
        {
            return ShopOutcome<ProfileUpdateModel>.Unauthorized("Sign in again.");
        }
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var phone = request.Phone.Trim();
        if (name.Length == 0 || email.Length == 0)
        {
            return ShopOutcome<ProfileUpdateModel>.BadRequest("Name and email are required.");
        }
        if (email != user.Email && await db.Users.AnyAsync(item => item.Email == email))
        {
            return ShopOutcome<ProfileUpdateModel>.Conflict("That email already has an account.");
        }
        var delivery = request.Delivery == "collect" ? "collect" : "courier";
        // Role is intentionally never updated from profile — Admin stays seed/ops-only.
        user.Name = name;
        user.Email = email;
        user.Phone = phone;
        user.Street = request.Street.Trim();
        user.Suburb = request.Suburb.Trim();
        user.City = request.City.Trim();
        user.Province = request.Province.Trim();
        user.PostalCode = request.PostalCode.Trim();
        user.Delivery = delivery;
        user.PrefillCheckout = request.PrefillCheckout;
        await db.SaveChangesAsync();
        return ShopOutcome<ProfileUpdateModel>.Ok(new ProfileUpdateModel(await IssueSession(user), await MapProfile(user)));
    }

    private async Task ClaimGuestOrders(ShopUser user)
    {
        var email = user.Email.Trim().ToLowerInvariant();
        var orphans = await db.Orders
            .Where(order => order.ShopUserId == null && order.Email.ToLower() == email)
            .ToListAsync();
        if (orphans.Count == 0)
        {
            return;
        }
        foreach (var order in orphans)
        {
            order.ShopUserId = user.Id;
        }
        await db.SaveChangesAsync();
    }

    private async Task<CheckoutProfileModel> MapProfile(ShopUser user)
    {
        var street = user.Street;
        var suburb = user.Suburb;
        var city = user.City;
        var province = user.Province;
        var postalCode = user.PostalCode;
        var delivery = user.Delivery == "collect" ? "collect" : "courier";
        if (street.Length == 0 && suburb.Length == 0 && city.Length == 0)
        {
            var order = await db.Orders.AsNoTracking()
                .Where(item => item.ShopUserId == user.Id || item.Email == user.Email)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefaultAsync();
            if (order is not null)
            {
                street = order.Street;
                suburb = order.Suburb;
                city = order.City;
                province = order.Province;
                postalCode = order.PostalCode;
                delivery = order.Delivery == "collect" ? "collect" : "courier";
            }
        }
        return new CheckoutProfileModel(
            user.Name,
            user.Email,
            user.Phone,
            street,
            suburb,
            city,
            province,
            postalCode,
            delivery,
            user.PrefillCheckout);
    }

    private async Task<AuthModel> IssueSession(ShopUser user)
    {
        var rawRefresh = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        user.RefreshTokenHash = HashToken(rawRefresh);
        user.RefreshTokenExpiresAt = DateTime.UtcNow.Add(tokens.RefreshLifetimeFor(user));
        await db.SaveChangesAsync();
        return new AuthModel(
            tokens.CreateAccessToken(user),
            rawRefresh,
            user.Name,
            user.Email,
            user.Phone,
            user.Role);
    }

    private static void ClearRefresh(ShopUser user)
    {
        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAt = null;
    }

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
