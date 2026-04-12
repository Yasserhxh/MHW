using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Domain.Errors;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record RefreshTokenCommand(string RefreshToken, string? DeviceHint = null)
    : ICommand<LoginResponse>;

public sealed class RefreshTokenCommandHandler(
    IdentityDbContext db,
    ITokenGenerator tokenGenerator,
    IJwtService jwtService,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<RefreshTokenCommand, LoginResponse>
{
    public async Task<Result<LoginResponse>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var tokenHash = tokenGenerator.HashToken(request.RefreshToken);

        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (existing is null)
        {
            await auditLogger.LogAsync(null, "RefreshRejected",
                metadata: new { reason = "token_not_found" },
                cancellationToken: cancellationToken);
            return Result.Failure<LoginResponse>(IdentityErrors.RefreshTokenInvalid);
        }

        // Token was already revoked — this is a reuse attack. Revoke the entire family.
        if (existing.IsRevoked)
        {
            await RevokeEntireFamilyAsync(existing.FamilyId, "reuse_detected", cancellationToken);
            await auditLogger.LogAsync(existing.UserId, "TokenReuseDetected", cancellationToken: cancellationToken);
            return Result.Failure<LoginResponse>(IdentityErrors.RefreshTokenFamilyCompromised);
        }

        if (!existing.IsActive)
        {
            await auditLogger.LogAsync(existing.UserId, "RefreshRejected",
                metadata: new { reason = "token_inactive" },
                cancellationToken: cancellationToken);
            return Result.Failure<LoginResponse>(IdentityErrors.RefreshTokenInvalid);
        }

        var user = existing.User;
        if (!user.IsActive)
        {
            await auditLogger.LogAsync(user.Id, "RefreshRejected",
                metadata: new { reason = "account_disabled" },
                cancellationToken: cancellationToken);
            return Result.Failure<LoginResponse>(IdentityErrors.AccountDisabled);
        }

        // Rotate: revoke old, issue new in same family
        var (rawNewToken, newHash) = tokenGenerator.GenerateSecureToken();
        var newRefreshToken = RefreshToken.Create(
            user.Id,
            newHash,
            existing.FamilyId,
            DateTime.UtcNow.AddDays(30),
            request.DeviceHint);

        db.RefreshTokens.Add(newRefreshToken);
        await db.SaveChangesAsync(cancellationToken); // get new token's Id

        existing.Revoke("rotated", newRefreshToken.Id);
        await db.SaveChangesAsync(cancellationToken);

        var accessToken = jwtService.GenerateAccessToken(user.Id, user.Email);
        await auditLogger.LogAsync(user.Id, "RefreshSuccess", cancellationToken: cancellationToken);

        return new LoginResponse(
            accessToken.Token,
            rawNewToken,
            accessToken.ExpiresAt,
            user.Id,
            user.Email);
    }

    private async Task RevokeEntireFamilyAsync(
        Guid familyId,
        string reason,
        CancellationToken cancellationToken)
    {
        var familyTokens = await db.RefreshTokens
            .Where(rt => rt.FamilyId == familyId && rt.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var token in familyTokens)
            token.Revoke(reason);

        await db.SaveChangesAsync(cancellationToken);
    }
}
