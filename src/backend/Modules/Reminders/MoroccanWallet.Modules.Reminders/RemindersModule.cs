using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Reminders;

public static class RemindersModule
{
    public static IServiceCollection AddRemindersModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<RemindersDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__reminders_migrations", "reminders")));

        return services;
    }
}
