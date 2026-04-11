using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Identity.Domain.Entities;

public sealed class PasswordResetToken : Entity
{
    private PasswordResetToken() { }

    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }

    public bool IsValid => UsedAt is null && DateTime.UtcNow < ExpiresAt;

    // Navigation (set by EF Core)
    public User User { get; private set; } = null!;

    public static PasswordResetToken Create(Guid userId, string tokenHash, TimeSpan validity)
    {
        return new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.Add(validity),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void MarkUsed()
    {
        UsedAt = DateTime.UtcNow;
        Touch();
    }
}
