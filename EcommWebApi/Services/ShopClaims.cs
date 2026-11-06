using System.Security.Claims;

namespace EcommWebApi.Services;

public static class ShopClaims
{
    public static int? UserId(ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var id) && id > 0 ? id : null;
    }
}
