using MoroccanWallet.Shared.Kernel.Primitives;
using MoroccanWallet.Modules.Identity.Domain.Events;

namespace MoroccanWallet.Modules.Identity.Domain.Entities;

public sealed class User : AggregateRoot
{
    private User() { }

    public string Email { get; private set; } = string.Empty;
    public string EmailNormalized { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool EmailVerified { get; private set; }
    public bool IsActive { get; private set; }

    public static User Create(string email, string passwordHash)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.Trim(),
            EmailNormalized = email.Trim().ToUpperInvariant(),
            PasswordHash = passwordHash,
            EmailVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.RaiseDomainEvent(new UserRegisteredEvent(user.Id, user.Email));
        return user;
    }

    public void VerifyEmail()
    {
        if (EmailVerified) return;
        EmailVerified = true;
        Touch();
        RaiseDomainEvent(new UserEmailVerifiedEvent(Id));
    }

    public void UpdatePasswordHash(string newHash)
    {
        PasswordHash = newHash;
        Touch();
    }

    public void Deactivate()
    {
        IsActive = false;
        Touch();
    }
}
