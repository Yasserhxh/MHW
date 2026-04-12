using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.SharedExpenses;

public static class SharedExpensesModule
{
    public static IServiceCollection AddSharedExpensesModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<SharedExpensesDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__shared_expenses_migrations", "shared_expenses")));

        return services;
    }
}
