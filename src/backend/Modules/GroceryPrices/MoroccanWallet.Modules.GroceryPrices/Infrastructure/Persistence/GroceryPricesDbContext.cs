using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

namespace MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;

public sealed class GroceryPricesDbContext(DbContextOptions<GroceryPricesDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<PriceEntry> PriceEntries => Set<PriceEntry>();
    public DbSet<FavoriteProduct> FavoriteProducts => Set<FavoriteProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("grocery_prices");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GroceryPricesDbContext).Assembly);
    }
}
