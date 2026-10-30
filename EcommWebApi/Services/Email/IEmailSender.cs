namespace EcommWebApi.Services.Email;

public interface IEmailSender
{
    Task SendPasswordReset(string toEmail, string customerName, string resetLink, string idempotencyKey);
}
