using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.GroceryPrices;

public static class GroceryPricesModule
{
    public static IServiceCollection AddGroceryPricesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // TODO: Implement GroceryPrices module registration (Phase 4+)
        return services;
    }
}
