using FluentValidation;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using MoroccanWallet.Shared.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record ForgotPasswordCommand(string Email) : ICommand;

public sealed class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public sealed class ForgotPasswordCommandHandler(
    IdentityDbContext db,
    ITokenGenerator tokenGenerator,
    IEmailSender emailSender)
    : ICommandHandler<ForgotPasswordCommand>
{
    public async Task<Result> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken)
    {
        // Always return success to avoid user enumeration
        var emailNormalized = request.Email.Trim().ToUpperInvariant();
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.EmailNormalized == emailNormalized, cancellationToken);

        if (user is not null && user.IsActive)
        {
            var (rawToken, tokenHash) = tokenGenerator.GenerateSecureToken();
            var resetToken = PasswordResetToken.Create(
                user.Id, tokenHash, TimeSpan.FromMinutes(15));

            db.PasswordResetTokens.Add(resetToken);
            await db.SaveChangesAsync(cancellationToken);

            await emailSender.SendAsync(new EmailMessage(
                To: user.Email,
                Subject: "Reset your Moroccan Wallet password",
                HtmlBody: $"<p>Your password reset token: <strong>{rawToken}</strong></p><p>Expires in 15 minutes.</p>",
                PlainTextBody: $"Password reset token: {rawToken}"),
                cancellationToken);
        }

        return Result.Success();
    }
}
