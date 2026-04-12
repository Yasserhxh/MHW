using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Users.Domain.Entities;

public sealed class UserProfile : AggregateRoot
{
    private UserProfile() { }

    public Guid UserId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public string Locale { get; private set; } = "fr-MA";
    public string PreferredCurrency { get; private set; } = "MAD";
    public string Language { get; private set; } = "fr";
    public string Timezone { get; private set; } = "Africa/Casablanca";
    public decimal? MonthlyBudgetPreference { get; private set; }
    public int? SalaryDay { get; private set; }
    public string HouseholdMode { get; private set; } = "just-me";

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

    public void UpdateProfile(string displayName, string? avatarUrl, string language, string timezone)
    {
        DisplayName = displayName.Trim();
        AvatarUrl = avatarUrl;
        Language = language;
        Timezone = timezone;
        Touch();
    }

    public void UpdatePreferences(
        string locale,
        string preferredCurrency,
        string timezone,
        decimal? monthlyBudgetPreference,
        int? salaryDay,
        string householdMode)
    {
        Locale = locale;
        PreferredCurrency = preferredCurrency;
        Timezone = timezone;
        MonthlyBudgetPreference = monthlyBudgetPreference;
        SalaryDay = salaryDay;
        HouseholdMode = householdMode;
        Touch();
    }
}
