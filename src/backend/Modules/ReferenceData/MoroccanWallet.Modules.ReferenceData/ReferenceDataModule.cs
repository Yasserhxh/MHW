using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.ReferenceData;

public static class ReferenceDataModule
{
    public static IServiceCollection AddReferenceDataModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // TODO: Implement ReferenceData module registration (Phase 4+)
        return services;
    }
}
