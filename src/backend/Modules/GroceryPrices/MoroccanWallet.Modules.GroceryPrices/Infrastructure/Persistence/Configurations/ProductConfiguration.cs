using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

namespace MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.HasIndex(p => p.Name).HasDatabaseName("ix_products_name");
        builder.HasIndex(p => p.Barcode).HasDatabaseName("ix_products_barcode");

        builder.Property(p => p.Name).HasColumnName("name").HasMaxLength(300).IsRequired();
        builder.Property(p => p.Category).HasColumnName("category").HasMaxLength(100);
        builder.Property(p => p.Unit).HasColumnName("unit").HasMaxLength(50);
        builder.Property(p => p.Barcode).HasColumnName("barcode").HasMaxLength(50);
        builder.Property(p => p.CreatedByUserId).HasColumnName("created_by_user_id").IsRequired();
        builder.Property(p => p.IsVerified).HasColumnName("is_verified").IsRequired();
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
