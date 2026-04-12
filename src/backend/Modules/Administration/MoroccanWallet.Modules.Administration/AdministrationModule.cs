using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.Administration.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Administration;

public static class AdministrationModule
{
    public static IServiceCollection AddAdministrationModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AdminDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default")));

        return services;
    }
}
