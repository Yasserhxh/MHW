using FluentValidation;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Errors;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record ResetPasswordCommand(string Token, string NewPassword) : ICommand;

public sealed class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(72)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.");
    }
}

public sealed class ResetPasswordCommandHandler(
    IdentityDbContext db,
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<ResetPasswordCommand>
{
    public async Task<Result> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = tokenGenerator.HashToken(request.Token);

        var token = await db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (token is null || !token.IsValid)
        {
            await auditLogger.LogAsync(null, "PasswordResetRejected",
                metadata: new { reason = "invalid_or_expired_token" },
                cancellationToken: cancellationToken);
            return Result.Failure(IdentityErrors.InvalidToken);
        }

        var newHash = passwordHasher.Hash(request.NewPassword);
        token.User.UpdatePasswordHash(newHash);
        token.MarkUsed();

        // Revoke all refresh tokens for this user
        var activeTokens = await db.RefreshTokens
            .Where(rt => rt.UserId == token.UserId && rt.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var rt in activeTokens)
            rt.Revoke("password_reset");

        await db.SaveChangesAsync(cancellationToken);
        await auditLogger.LogAsync(token.UserId, "PasswordResetCompleted", cancellationToken: cancellationToken);

        return Result.Success();
    }
}
