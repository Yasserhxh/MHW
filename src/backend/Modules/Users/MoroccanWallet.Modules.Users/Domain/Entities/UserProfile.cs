using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Users.Domain.Entities;

public sealed class UserProfile : AggregateRoot
{
    private UserProfile() { }

    public Guid UserId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public string PreferredCurrency { get; private set; } = "MAD";
    public string Language { get; private set; } = "fr";
    public string Timezone { get; private set; } = "Africa/Casablanca";

    public static UserProfile Create(Guid userId, string displayName)
    {
        return new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DisplayName = displayName.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(string displayName, string? avatarUrl, string preferredCurrency, string language, string timezone)
    {
        DisplayName = displayName.Trim();
        AvatarUrl = avatarUrl;
        PreferredCurrency = preferredCurrency;
        Language = language;
        Timezone = timezone;
        Touch();
    }
}
