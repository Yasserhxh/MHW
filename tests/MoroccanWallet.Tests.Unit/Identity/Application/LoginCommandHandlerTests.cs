using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MoroccanWallet.Modules.Identity.Application.Commands;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;
using MoroccanWallet.Tests.Unit.Identity;

namespace MoroccanWallet.Tests.Unit.Identity.Application;

public sealed class LoginCommandHandlerTests
{
    [Fact]
    public async Task Handle_WithUnknownEmail_ReturnsInvalidCredentials()
    {
        await using var db = IdentityDbContextFactory.Create();
        var auditLogger = Substitute.For<IAuthAuditLogger>();
        var handler = CreateHandler(db, auditLogger);

        var result = await handler.Handle(
            new LoginCommand("missing@example.com", "Password123", "browser", "127.0.0.1"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.InvalidCredentials");
        await auditLogger.Received().LogAsync(null, "LoginFailed", Arg.Any<object>(), "127.0.0.1", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithUnverifiedUser_ReturnsEmailNotVerified()
    {
        await using var db = IdentityDbContextFactory.Create();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var auditLogger = Substitute.For<IAuthAuditLogger>();
        var handler = CreateHandler(db, auditLogger);

        var result = await handler.Handle(
            new LoginCommand("amina@example.com", "Password123", null, "127.0.0.1"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.EmailNotVerified");
        await auditLogger.Received().LogAsync(user.Id, "LoginRejected", Arg.Any<object>(), "127.0.0.1", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithInactiveUser_ReturnsAccountDisabled()
    {
        await using var db = IdentityDbContextFactory.Create();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        user.VerifyEmail();
        user.Deactivate();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var handler = CreateHandler(db, Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(
            new LoginCommand("amina@example.com", "Password123", null, "127.0.0.1"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.AccountDisabled");
    }

    [Fact]
    public async Task Handle_WithValidCredentials_ReturnsTokensAndPersistsRefreshToken()
    {
        await using var db = IdentityDbContextFactory.Create();
        var user = User.Create("amina@example.com", new BcryptPasswordHasher().Hash("Password123"));
        user.VerifyEmail();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var auditLogger = Substitute.For<IAuthAuditLogger>();
        var handler = CreateHandler(db, auditLogger);

        var result = await handler.Handle(
            new LoginCommand("amina@example.com", "Password123", "browser", "127.0.0.1"),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.RefreshToken.Should().NotBeNullOrWhiteSpace();
        result.Value.AccessToken.Should().NotBeNullOrWhiteSpace();
        (await db.RefreshTokens.CountAsync()).Should().Be(1);
        await auditLogger.Received().LogAsync(user.Id, "LoginSuccess", null, "127.0.0.1", Arg.Any<CancellationToken>());
    }

    private static LoginCommandHandler CreateHandler(
        MoroccanWallet.Modules.Identity.Infrastructure.Persistence.IdentityDbContext db,
        IAuthAuditLogger auditLogger) =>
        new(
            db,
            new BcryptPasswordHasher(),
            new SecureTokenGenerator(),
            new JwtService(Options.Create(new JwtOptions
            {
                SecretKey = "this-is-a-valid-test-secret-key-with-32-chars+",
                Issuer = "tests",
                Audience = "tests",
                AccessTokenExpiryMinutes = 15
            })),
            auditLogger);
}
