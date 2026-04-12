using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.Notifications.Application.Services;
using MoroccanWallet.Modules.Notifications.Infrastructure.BackgroundServices;
using MoroccanWallet.Modules.Notifications.Infrastructure.Hubs;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Modules.Notifications.Infrastructure.Services;

namespace MoroccanWallet.Modules.Notifications;

public static class NotificationsModule
{
    public static IServiceCollection AddNotificationsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSignalR();

        services.AddDbContext<NotificationsDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__notifications_migrations", "notifications")));

        services.AddScoped<INotificationService, NotificationService>();
        services.AddHostedService<ReminderNotificationService>();

        return services;
    }

    public static WebApplication MapNotificationHub(this WebApplication app)
    {
        app.MapHub<NotificationHub>("/hubs/notifications");
        return app;
    }
}
