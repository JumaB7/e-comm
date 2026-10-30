using EcommWebApi.Contracts;

namespace EcommWebApi.Services.Auth;

public interface IAuthService
{
    Task<ShopOutcome<AuthModel>> Register(RegisterRequest request);

    Task<ShopOutcome<AuthModel>> SignIn(SignInRequest request);

    Task<ShopOutcome<MessageModel>> RequestPasswordReset(ForgotPasswordRequest request);

    Task<ShopOutcome<MessageModel>> ConfirmPasswordReset(ConfirmPasswordResetRequest request);

    Task<ShopOutcome<CheckoutProfileModel>> Profile(string email);

    Task<ShopOutcome<ProfileUpdateModel>> UpdateProfile(string currentEmail, UpdateProfileRequest request);
}
