using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MoroccanWallet.Shared.Kernel.Domain;

public interface IModuleRegistration
{
    IServiceCollection Register(IServiceCollection services, IConfiguration configuration);
}
