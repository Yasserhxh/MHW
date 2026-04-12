using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Modules.ReferenceData;

public static class ReferenceDataModule
{
    public static IServiceCollection AddReferenceDataModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // No infrastructure dependencies — all reference data is static
        return services;
    }
}
