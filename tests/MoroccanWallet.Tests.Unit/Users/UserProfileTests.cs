using MoroccanWallet.Modules.Users.Domain.Entities;

namespace MoroccanWallet.Tests.Unit.Users;

public sealed class UserProfileTests
{
    [Fact]
    public void UpdatePreferences_Stores_Expected_Values()
    {
        var profile = UserProfile.Create(Guid.NewGuid(), "Amina");

        profile.UpdatePreferences("fr-MA", "MAD", "Africa/Casablanca", 5000m, 25, "family");

        profile.Locale.Should().Be("fr-MA");
        profile.PreferredCurrency.Should().Be("MAD");
        profile.MonthlyBudgetPreference.Should().Be(5000m);
        profile.SalaryDay.Should().Be(25);
        profile.HouseholdMode.Should().Be("family");
    }
}
