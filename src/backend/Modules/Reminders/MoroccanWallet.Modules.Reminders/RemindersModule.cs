using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.Reminders;

public static class RemindersModule
{
    public static IServiceCollection AddRemindersModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // TODO: Implement Reminders module registration (Phase 4+)
        return services;
    }
}
