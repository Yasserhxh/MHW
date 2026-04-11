using Microsoft.Extensions.Logging;

namespace MoroccanWallet.Shared.Infrastructure.Email;

/// <summary>
/// Development email sender. Logs emails instead of sending them.
/// Replace with SmtpEmailSender or SendGridEmailSender in production.
/// </summary>
public sealed class DevEmailSender(ILogger<DevEmailSender> logger) : IEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[DEV EMAIL] To: {To} | Subject: {Subject}\n{Body}",
            message.To,
            message.Subject,
            message.PlainTextBody ?? message.HtmlBody);

        return Task.CompletedTask;
    }
}
