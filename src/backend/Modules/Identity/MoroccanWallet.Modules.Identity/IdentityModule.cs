using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;
using MoroccanWallet.Shared.Infrastructure.Email;

namespace MoroccanWallet.Modules.Identity;

public static class IdentityModule
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>(opts =>
            opts.UseNpgsql(configuration.GetConnectionString("Default"),
                npgsql => npgsql.MigrationsHistoryTable("__identity_migrations", "identity")));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenGenerator, SecureTokenGenerator>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthAuditLogger, AuthAuditLogger>();

        return services;
    }
}
