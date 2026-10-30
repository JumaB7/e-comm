using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcommWebApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace EcommWebApi.Services;

public class TokenService(IConfiguration configuration)
{
    public string Create(ShopUser user)
    {
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
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
