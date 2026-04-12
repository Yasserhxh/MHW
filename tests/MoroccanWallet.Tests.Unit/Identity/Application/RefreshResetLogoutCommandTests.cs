using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MoroccanWallet.Modules.Identity.Application.Commands;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;
using MoroccanWallet.Tests.Unit.Identity;

namespace MoroccanWallet.Tests.Unit.Identity.Application;

public sealed class RefreshResetLogoutCommandTests
{
    [Fact]
    public async Task Refresh_WithRevokedToken_FailsAndRevokesTokenFamily()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        user.VerifyEmail();
        var familyId = Guid.NewGuid();
        var first = RefreshToken.Create(user.Id, tokenGenerator.HashToken("raw-1"), familyId, DateTime.UtcNow.AddDays(1));
        var second = RefreshToken.Create(user.Id, tokenGenerator.HashToken("raw-2"), familyId, DateTime.UtcNow.AddDays(1));
        first.Revoke("rotated", second.Id);
        db.Users.Add(user);
        db.RefreshTokens.AddRange(first, second);
        await db.SaveChangesAsync();

        var auditLogger = Substitute.For<IAuthAuditLogger>();
        var handler = new RefreshTokenCommandHandler(db, tokenGenerator, CreateJwtService(), auditLogger);

        var result = await handler.Handle(new RefreshTokenCommand("raw-1"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.TokenCompromised");
        db.RefreshTokens.Single(t => t.Id == second.Id).IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task Refresh_WithActiveToken_RotatesToken()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        user.VerifyEmail();
        var token = RefreshToken.Create(user.Id, tokenGenerator.HashToken("raw-token"), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));
        db.Users.Add(user);
        db.RefreshTokens.Add(token);
        await db.SaveChangesAsync();

        var handler = new RefreshTokenCommandHandler(db, tokenGenerator, CreateJwtService(), Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(new RefreshTokenCommand("raw-token", "browser"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        (await db.RefreshTokens.CountAsync()).Should().Be(2);
        db.RefreshTokens.Single(t => t.Id == token.Id).IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task ResetPassword_WithValidToken_UpdatesPasswordAndRevokesRefreshTokens()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var hasher = new BcryptPasswordHasher();
        var user = User.Create("amina@example.com", hasher.Hash("Password123"));
        var resetToken = PasswordResetToken.Create(user.Id, tokenGenerator.HashToken("reset-token"), TimeSpan.FromMinutes(15));
        var refreshToken = RefreshToken.Create(user.Id, tokenGenerator.HashToken("refresh"), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));
        db.Users.Add(user);
        db.PasswordResetTokens.Add(resetToken);
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        var handler = new ResetPasswordCommandHandler(db, hasher, tokenGenerator, Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(new ResetPasswordCommand("reset-token", "NewPassword123"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        hasher.Verify("NewPassword123", db.Users.Single().PasswordHash).Should().BeTrue();
        db.PasswordResetTokens.Single().UsedAt.Should().NotBeNull();
        db.RefreshTokens.Single().IsRevoked.Should().BeTrue();
    }

    [Fact]
    public async Task LogoutAll_RevokesAllActiveRefreshTokens()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        db.Users.Add(user);
        db.RefreshTokens.AddRange(
            RefreshToken.Create(user.Id, tokenGenerator.HashToken("one"), Guid.NewGuid(), DateTime.UtcNow.AddDays(1)),
            RefreshToken.Create(user.Id, tokenGenerator.HashToken("two"), Guid.NewGuid(), DateTime.UtcNow.AddDays(1)));
        await db.SaveChangesAsync();

        var handler = new LogoutAllCommandHandler(db, Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(new LogoutAllCommand(user.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        db.RefreshTokens.ToList().All(t => t.IsRevoked).Should().BeTrue();
    }

    [Fact]
    public async Task VerifyEmail_WithValidToken_MarksUserVerifiedAndConsumesSiblingTokens()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var user = User.Create("amina@example.com", "hash");
        var first = EmailVerificationToken.Create(user.Id, tokenGenerator.HashToken("verify-1"), TimeSpan.FromHours(1));
        var second = EmailVerificationToken.Create(user.Id, tokenGenerator.HashToken("verify-2"), TimeSpan.FromHours(1));
        db.Users.Add(user);
        db.EmailVerificationTokens.AddRange(first, second);
        await db.SaveChangesAsync();

        var handler = new VerifyEmailCommandHandler(db, tokenGenerator, Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(new VerifyEmailCommand("verify-1"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        db.Users.Single().EmailVerified.Should().BeTrue();
        db.EmailVerificationTokens.All(t => t.UsedAt != null).Should().BeTrue();
    }

    [Fact]
    public async Task Logout_WithOwnershipMismatch_DoesNotRevokeToken()
    {
        await using var db = IdentityDbContextFactory.Create();
        var tokenGenerator = new SecureTokenGenerator();
        var user = User.Create("amina@example.com", "hash");
        var token = RefreshToken.Create(user.Id, tokenGenerator.HashToken("raw-token"), Guid.NewGuid(), DateTime.UtcNow.AddDays(1));
        db.Users.Add(user);
        db.RefreshTokens.Add(token);
        await db.SaveChangesAsync();

        var handler = new LogoutCommandHandler(
            db,
            tokenGenerator,
            NullLogger<LogoutCommandHandler>.Instance,
            Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(new LogoutCommand("raw-token", Guid.NewGuid()), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        db.RefreshTokens.Single().IsRevoked.Should().BeFalse();
    }

    private static JwtService CreateJwtService() =>
        new(Options.Create(new JwtOptions
        {
            SecretKey = "this-is-a-valid-test-secret-key-with-32-chars+",
            Issuer = "tests",
            Audience = "tests",
            AccessTokenExpiryMinutes = 15
        }));
}
