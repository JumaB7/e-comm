using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Auth;

public interface IAuthService
{
    Task<ShopOutcome<AuthModel>> Register(RegisterRequest request);

    Task<ShopOutcome<AuthModel>> SignIn(SignInRequest request);

    Task<ShopOutcome<AuthModel>> Refresh(RefreshRequest request);

    Task<ShopOutcome<MessageModel>> SignOut(string? refreshToken);

    Task<ShopOutcome<MessageModel>> RevokeSessions(int userId);

    /// <summary>Seed/ops only — never map this to an HTTP action. Clears refresh on change.</summary>
    Task<ShopOutcome<MessageModel>> SetRoleForOps(int userId, string role);

    Task<ShopOutcome<MessageModel>> RequestPasswordReset(ForgotPasswordRequest request);

    Task<ShopOutcome<MessageModel>> ConfirmPasswordReset(ConfirmPasswordResetRequest request);

    Task<ShopOutcome<CheckoutProfileModel>> Profile(int userId);

    Task<ShopOutcome<ProfileUpdateModel>> UpdateProfile(int userId, UpdateProfileRequest request);
}
