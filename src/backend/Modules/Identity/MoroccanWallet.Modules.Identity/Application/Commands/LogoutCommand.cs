using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record LogoutCommand(string RefreshToken) : ICommand;

public sealed class LogoutCommandHandler(
    IdentityDbContext db,
    ITokenGenerator tokenGenerator)
    : ICommandHandler<LogoutCommand>
{
    public async Task<Result> Handle(
        LogoutCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = tokenGenerator.HashToken(request.RefreshToken);
        var token = await db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (token is not null && !token.IsRevoked)
        {
            token.Revoke("logout");
            await db.SaveChangesAsync(cancellationToken);
        }

        return Result.Success();
    }
}

public sealed record LogoutAllCommand(Guid UserId) : ICommand;

public sealed class LogoutAllCommandHandler(IdentityDbContext db)
    : ICommandHandler<LogoutAllCommand>
{
    public async Task<Result> Handle(
        LogoutAllCommand request,
        CancellationToken cancellationToken)
    {
        var tokens = await db.RefreshTokens
            .Where(rt => rt.UserId == request.UserId && rt.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
            token.Revoke("logout_all");

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
