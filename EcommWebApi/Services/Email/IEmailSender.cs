namespace EcommWebApi.Services.Email;

public interface IEmailSender
{
    Task SendPasswordReset(string toEmail, string customerName, string resetLink, string idempotencyKey);

    // TODO: order confirmation / paid receipt emails (Resend templates) once content is signed off.
}
