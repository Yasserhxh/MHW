using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.HouseholdBudget;

public static class HouseholdBudgetModule
{
    public static IServiceCollection AddHouseholdBudgetModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // TODO: Implement HouseholdBudget module registration (Phase 4+)
        return services;
    }
}
