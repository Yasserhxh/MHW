using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.HouseholdBudget;

public static class HouseholdBudgetModule
{
    public static IServiceCollection AddHouseholdBudgetModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<HouseholdBudgetDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__budget_migrations", "budget")));

        return services;
    }
}
