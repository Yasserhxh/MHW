using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Domain.Events;

namespace MoroccanWallet.Tests.Unit.Identity.Domain;

public sealed class UserTests
{
    // ── Create ────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidInputs_SetsPropertiesCorrectly()
    {
        var user = User.Create("Test@Example.com", "hashedpw");

        user.Id.Should().NotBeEmpty();
        user.Email.Should().Be("Test@Example.com");
        user.EmailNormalized.Should().Be("TEST@EXAMPLE.COM");
        user.PasswordHash.Should().Be("hashedpw");
        user.EmailVerified.Should().BeFalse();
        user.IsActive.Should().BeTrue();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        user.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Create_TrimsAndNormalizesEmail()
    {
        var user = User.Create("  USER@domain.com  ", "pw");

        user.Email.Should().Be("USER@domain.com");
        user.EmailNormalized.Should().Be("USER@DOMAIN.COM");
    }

    [Fact]
    public void Create_RaisesUserRegisteredDomainEvent()
    {
        var user = User.Create("test@example.com", "pw");

        var events = user.DomainEvents;
        events.Should().ContainSingle(e => e is UserRegisteredEvent);
        var registered = (UserRegisteredEvent)events[0];
        registered.UserId.Should().Be(user.Id);
        registered.Email.Should().Be(user.Email);
    }

    // ── VerifyEmail ───────────────────────────────────────────────────────────

    [Fact]
    public void VerifyEmail_SetsEmailVerifiedAndRaisesEvent()
    {
        var user = User.Create("test@example.com", "pw");
        user.ClearDomainEvents();

        user.VerifyEmail();

        user.EmailVerified.Should().BeTrue();
        user.DomainEvents.Should().ContainSingle(e => e is UserEmailVerifiedEvent);
    }

    [Fact]
    public void VerifyEmail_CalledTwice_DoesNotRaiseEventSecondTime()
    {
        var user = User.Create("test@example.com", "pw");
        user.VerifyEmail();
        user.ClearDomainEvents();

        user.VerifyEmail(); // second call

        user.DomainEvents.Should().BeEmpty("already verified — idempotent");
    }

    // ── UpdatePasswordHash ────────────────────────────────────────────────────

    [Fact]
    public void UpdatePasswordHash_ChangesHash()
    {
        var user = User.Create("test@example.com", "old_hash");

        user.UpdatePasswordHash("new_hash");

        user.PasswordHash.Should().Be("new_hash");
        user.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    // ── Deactivate ────────────────────────────────────────────────────────────

    [Fact]
    public void Deactivate_SetsIsActiveToFalse()
    {
        var user = User.Create("test@example.com", "pw");

        user.Deactivate();

        user.IsActive.Should().BeFalse();
        user.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
