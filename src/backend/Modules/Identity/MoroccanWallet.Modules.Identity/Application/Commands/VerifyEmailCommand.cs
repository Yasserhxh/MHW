using FluentValidation;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Errors;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record VerifyEmailCommand(string Token) : ICommand;

public sealed class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>
{
    public VerifyEmailCommandValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(512);
    }
}

public sealed class VerifyEmailCommandHandler(
    IdentityDbContext db,
    ITokenGenerator tokenGenerator,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<VerifyEmailCommand>
{
    public async Task<Result> Handle(
        VerifyEmailCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = tokenGenerator.HashToken(request.Token);

        var token = await db.EmailVerificationTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (token is null || !token.IsValid)
        {
            await auditLogger.LogAsync(null, "EmailVerificationRejected",
                metadata: new { reason = "invalid_or_expired_token" },
                cancellationToken: cancellationToken);
            return Result.Failure(IdentityErrors.InvalidToken);
        }

        token.User.VerifyEmail();
        token.MarkUsed();

        var otherTokens = await db.EmailVerificationTokens
            .Where(t => t.UserId == token.UserId && t.Id != token.Id && t.UsedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var otherToken in otherTokens)
            otherToken.MarkUsed();

        await db.SaveChangesAsync(cancellationToken);
        await auditLogger.LogAsync(token.UserId, "EmailVerified", cancellationToken: cancellationToken);

        return Result.Success();
    }
}
