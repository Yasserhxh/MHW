using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

namespace MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence.Configurations;

public sealed class FavoriteProductConfiguration : IEntityTypeConfiguration<FavoriteProduct>
{
    public void Configure(EntityTypeBuilder<FavoriteProduct> builder)
    {
        builder.ToTable("favorite_products");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasColumnName("id");

        builder.HasIndex(f => new { f.UserId, f.ProductId })
            .IsUnique()
            .HasDatabaseName("ix_favorite_products_user_product");

        builder.Property(f => f.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(f => f.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(f => f.AddedAt).HasColumnName("added_at").IsRequired();
        builder.Ignore(f => f.CreatedAt);
        builder.Ignore(f => f.UpdatedAt);
    }
}
