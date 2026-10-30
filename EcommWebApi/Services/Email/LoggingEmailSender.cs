namespace EcommWebApi.Services.Email;

/// <summary>
/// Fallback when Resend:ApiKey is unset: writes the reset link to logs.
/// </summary>
public class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendPasswordReset(string toEmail, string customerName, string resetLink, string idempotencyKey)
    {
        logger.LogWarning(
            "Password reset for {Email} ({Name}). Idempotency {IdempotencyKey}. Open this link (no Resend:ApiKey — replace with real delivery): {ResetLink}",
            toEmail,
            customerName,
            idempotencyKey,
            resetLink);
        return Task.CompletedTask;
    }
}
