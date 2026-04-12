using MoroccanWallet.Modules.Identity.Application.Commands;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;
using MoroccanWallet.Shared.Infrastructure.Email;
using MoroccanWallet.Tests.Unit.Identity;

namespace MoroccanWallet.Tests.Unit.Identity.Application;

public sealed class RegisterCommandHandlerTests
{
    [Fact]
    public async Task Handle_WithUniqueEmail_CreatesUserVerificationTokenAndSendsEmail()
    {
        await using var db = IdentityDbContextFactory.Create();
        var emailSender = Substitute.For<IEmailSender>();
        var auditLogger = Substitute.For<IAuthAuditLogger>();
        var handler = new RegisterCommandHandler(
            db,
            new BcryptPasswordHasher(),
            new SecureTokenGenerator(),
            emailSender,
            auditLogger);

        var result = await handler.Handle(
            new RegisterCommand("amina@example.com", "Password123"),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        db.Users.Should().ContainSingle();
        db.EmailVerificationTokens.Should().ContainSingle();
        db.Users.Single().PasswordHash.Should().NotBe("Password123");
        await emailSender.Received(1).SendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>());
        await auditLogger.Received(1).LogAsync(Arg.Any<Guid>(), "Register", null, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ReturnsConflict()
    {
        await using var db = IdentityDbContextFactory.Create();
        db.Users.Add(MoroccanWallet.Modules.Identity.Domain.Entities.User.Create("amina@example.com", "hash"));
        await db.SaveChangesAsync();

        var handler = new RegisterCommandHandler(
            db,
            Substitute.For<IPasswordHasher>(),
            Substitute.For<ITokenGenerator>(),
            Substitute.For<IEmailSender>(),
            Substitute.For<IAuthAuditLogger>());

        var result = await handler.Handle(
            new RegisterCommand("Amina@example.com", "Password123"),
            CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Auth.EmailExists");
    }
}
