using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

namespace MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence.Configurations;

public sealed class PriceEntryConfiguration : IEntityTypeConfiguration<PriceEntry>
{
    public void Configure(EntityTypeBuilder<PriceEntry> builder)
    {
        builder.ToTable("price_entries");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");

        builder.HasIndex(e => e.ProductId).HasDatabaseName("ix_price_entries_product_id");
        builder.HasIndex(e => new { e.ProductId, e.ObservedAt }).HasDatabaseName("ix_price_entries_product_date");

        builder.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(e => e.Price).HasColumnName("price").HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(e => e.StoreName).HasColumnName("store_name").HasMaxLength(200);
        builder.Property(e => e.StoreLocation).HasColumnName("store_location").HasMaxLength(500);
        builder.Property(e => e.ObservedAt).HasColumnName("observed_at").IsRequired();
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
