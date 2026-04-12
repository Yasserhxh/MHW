using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;

namespace MoroccanWallet.Tests.Unit.Identity;

internal static class IdentityDbContextFactory
{
    public static IdentityDbContext Create(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString("N"))
            .Options;

        return new IdentityDbContext(options);
    }
}
