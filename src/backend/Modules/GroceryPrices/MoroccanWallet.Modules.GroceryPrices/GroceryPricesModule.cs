using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.GroceryPrices;

public static class GroceryPricesModule
{
    public static IServiceCollection AddGroceryPricesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<GroceryPricesDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__grocery_prices_migrations", "grocery_prices")));

        return services;
    }
}
