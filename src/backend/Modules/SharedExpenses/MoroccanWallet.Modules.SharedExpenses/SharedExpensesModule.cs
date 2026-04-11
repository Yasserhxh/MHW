using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.SharedExpenses;

public static class SharedExpensesModule
{
    public static IServiceCollection AddSharedExpensesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // TODO: Implement SharedExpenses module registration (Phase 4+)
        return services;
    }
}
