using Resend;

namespace EcommWebApi.Services.Email;

public class ResendEmailSender(
    IResend resend,
    IConfiguration configuration,
    ILogger<ResendEmailSender> logger) : IEmailSender
{
    public async Task SendPasswordReset(string toEmail, string customerName, string resetLink, string idempotencyKey)
    {
        var from = configuration["Resend:From"] ?? "Veld Supply <onboarding@resend.dev>";
        var templateId = configuration["Resend:PasswordResetTemplateId"] ?? "password-reset";

        var response = await resend.EmailSendAsync(
            idempotencyKey,
            new EmailMessage
            {
                From = from,
                To = toEmail,
                Template = new EmailMessageTemplate
                {
                    TemplateId = templateId,
                    Variables = new Dictionary<string, object>
                    {
                        ["CUSTOMER_NAME"] = string.IsNullOrWhiteSpace(customerName) ? "there" : customerName,
                        ["RESET_LINK"] = resetLink,
                    },
                },
            });

        if (!response.Success)
        {
            logger.LogError(
                response.Exception,
                "Resend failed to send password reset to {Email}",
                toEmail);
            if (response.Exception is not null)
            {
                throw response.Exception;
            }

            throw new InvalidOperationException("Resend rejected the password reset email.");
        }

        logger.LogInformation(
            "Password reset email sent to {Email}. Resend id {EmailId}",
            toEmail,
            response.Content);
    }
}
