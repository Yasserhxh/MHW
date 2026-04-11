using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Identity.Domain.Entities;

public sealed class RefreshToken : Entity
{
    private RefreshToken() { }

    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public Guid FamilyId { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? RevokeReason { get; private set; }
    public Guid? ReplacedById { get; private set; }
    public string? DeviceHint { get; private set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
    public bool IsRevoked => RevokedAt is not null;

    // Navigation (set by EF Core)
    public User User { get; private set; } = null!;

    public static RefreshToken Create(
        Guid userId,
        string tokenHash,
        Guid familyId,
        DateTime expiresAt,
        string? deviceHint = null)
    {
        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            FamilyId = familyId,
            ExpiresAt = expiresAt,
            DeviceHint = deviceHint,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Revoke(string reason, Guid? replacedById = null)
    {
        RevokedAt = DateTime.UtcNow;
        RevokeReason = reason;
        ReplacedById = replacedById;
        Touch();
    }
}
