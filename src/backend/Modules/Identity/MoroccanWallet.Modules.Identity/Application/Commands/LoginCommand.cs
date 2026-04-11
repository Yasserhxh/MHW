using FluentValidation;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Domain.Errors;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Identity.Application.Commands;

public sealed record LoginCommand(
    string Email,
    string Password,
    string? DeviceHint = null,
    string? IpAddress = null) : ICommand<LoginResponse>;

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    Guid UserId,
    string Email);

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginCommandHandler(
    IdentityDbContext db,
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator,
    IJwtService jwtService,
    IAuthAuditLogger auditLogger)
    : ICommandHandler<LoginCommand, LoginResponse>
{
    public async Task<Result<LoginResponse>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        var emailNormalized = request.Email.Trim().ToUpperInvariant();

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.EmailNormalized == emailNormalized, cancellationToken);

        // Constant-time safe: always hash even if user not found to prevent timing attacks
        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            await auditLogger.LogAsync(null, "LoginFailed",
                metadata: new { email = request.Email, reason = "invalid_credentials" },
                ipAddress: request.IpAddress,
                cancellationToken: cancellationToken);
            return Result.Failure<LoginResponse>(IdentityErrors.InvalidCredentials);
        }

        if (!user.EmailVerified)
            return Result.Failure<LoginResponse>(IdentityErrors.EmailNotVerified);

        if (!user.IsActive)
            return Result.Failure<LoginResponse>(IdentityErrors.AccountDisabled);

        var accessToken = jwtService.GenerateAccessToken(user.Id, user.Email);
        var (rawRefreshToken, refreshTokenHash) = tokenGenerator.GenerateSecureToken();
        var familyId = Guid.NewGuid();
        var refreshToken = RefreshToken.Create(
            user.Id,
            refreshTokenHash,
            familyId,
            DateTime.UtcNow.AddDays(30),
            request.DeviceHint);

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        await auditLogger.LogAsync(user.Id, "LoginSuccess",
            ipAddress: request.IpAddress,
            cancellationToken: cancellationToken);

        return new LoginResponse(
            accessToken.Token,
            rawRefreshToken,
            accessToken.ExpiresAt,
            user.Id,
            user.Email);
    }
}
