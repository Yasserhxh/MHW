using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

/// <param name="RefreshToken">Raw refresh token to revoke.</param>
/// <param name="CallerUserId">Authenticated user performing the logout — enforces ownership.</param>
public sealed record LogoutCommand(string RefreshToken, Guid CallerUserId) : ICommand;

public sealed class LogoutCommandHandler(
    IdentityDbContext db,
    ITokenGenerator tokenGenerator,
    ILogger<LogoutCommandHandler> logger,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<LogoutCommand>
{
    public async Task<Result> Handle(
        LogoutCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = tokenGenerator.HashToken(request.RefreshToken);
        var token = await db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (token is null || token.IsRevoked)
            return Result.Success(); // idempotent — already gone or never existed

        // Ownership check: prevent one user from revoking another user's session.
        // Return success silently to avoid confirming token existence to the caller.
        if (token.UserId != request.CallerUserId)
        {
            logger.LogWarning(
                "Logout ownership mismatch: caller {CallerId} attempted to revoke token belonging to {OwnerId}",
                request.CallerUserId, token.UserId);
            await auditLogger.LogAsync(request.CallerUserId, "LogoutOwnershipMismatch",
                metadata: new { ownerUserId = token.UserId },
                cancellationToken: cancellationToken);
            return Result.Success();
        }

        token.Revoke("logout");
        await db.SaveChangesAsync(cancellationToken);
        await auditLogger.LogAsync(request.CallerUserId, "LogoutSuccess", cancellationToken: cancellationToken);

        return Result.Success();
    }
}

public sealed record LogoutAllCommand(Guid UserId) : ICommand;

public sealed class LogoutAllCommandHandler(
    IdentityDbContext db,
    IAuthAuditLogger auditLogger)
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
        await auditLogger.LogAsync(request.UserId, "LogoutAllSuccess",
            metadata: new { revokedSessions = tokens.Count },
            cancellationToken: cancellationToken);

        return Result.Success();
    }
}
