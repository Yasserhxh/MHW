using FluentValidation;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Domain.Errors;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using MoroccanWallet.Shared.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record RegisterCommand(string Email, string Password) : ICommand<RegisterResponse>;

public sealed record RegisterResponse(Guid UserId, string Email);

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(320);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(72) // BCrypt limit
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.");
    }
}

public sealed class RegisterCommandHandler(
    IdentityDbContext db,
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator,
    IEmailSender emailSender,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<RegisterCommand, RegisterResponse>
{
    public async Task<Result<RegisterResponse>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        var emailNormalized = request.Email.Trim().ToUpperInvariant();

        var exists = await db.Users
            .AnyAsync(u => u.EmailNormalized == emailNormalized, cancellationToken);

        if (exists)
            return Result.Failure<RegisterResponse>(IdentityErrors.EmailAlreadyExists);

        var passwordHash = passwordHasher.Hash(request.Password);
        var user = User.Create(request.Email, passwordHash);

        var (rawToken, tokenHash) = tokenGenerator.GenerateSecureToken();
        var verificationToken = EmailVerificationToken.Create(
            user.Id, tokenHash, TimeSpan.FromHours(24));

        db.Users.Add(user);
        db.EmailVerificationTokens.Add(verificationToken);
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(new EmailMessage(
            To: user.Email,
            Subject: "Verify your Moroccan Wallet account",
            HtmlBody: BuildVerificationEmailHtml(user.Email, rawToken),
            PlainTextBody: $"Verify your email: {rawToken}"),
            cancellationToken);

        await auditLogger.LogAsync(user.Id, "Register", cancellationToken: cancellationToken);

        return new RegisterResponse(user.Id, user.Email);
    }

    private static string BuildVerificationEmailHtml(string email, string token) =>
        $"""
        <h2>Welcome to Moroccan Wallet</h2>
        <p>Your verification token is: <strong>{token}</strong></p>
        <p>This token expires in 24 hours.</p>
        """;
}
