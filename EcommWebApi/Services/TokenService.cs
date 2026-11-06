using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommWebApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace EcommWebApi.Services;

public class TokenService(IConfiguration configuration)
{
    public static readonly TimeSpan CustomerAccessLifetime = TimeSpan.FromHours(2);
    public static readonly TimeSpan AdminAccessLifetime = TimeSpan.FromHours(1);
    public static readonly TimeSpan CustomerRefreshLifetime = TimeSpan.FromDays(14);
    public static readonly TimeSpan AdminRefreshLifetime = TimeSpan.FromDays(7);

    public string CreateAccessToken(ShopUser user)
    {
        var lifetime = user.Role == "Admin" ? AdminAccessLifetime : CustomerAccessLifetime;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            configuration["Jwt:Issuer"],
            configuration["Jwt:Audience"],
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.MobilePhone, user.Phone ?? ""),
                new Claim(ClaimTypes.Role, user.Role),
            ],
            expires: DateTime.UtcNow.Add(lifetime),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public TimeSpan RefreshLifetimeFor(ShopUser user) =>
        user.Role == "Admin" ? AdminRefreshLifetime : CustomerRefreshLifetime;
}
