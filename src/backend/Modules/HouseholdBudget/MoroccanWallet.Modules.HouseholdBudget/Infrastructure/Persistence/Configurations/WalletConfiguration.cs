using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

namespace MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence.Configurations;

public sealed class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.ToTable("wallets");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasColumnName("id");

        builder.Property(w => w.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(w => w.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(w => w.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(w => w.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(w => w.CurrentBalance).HasColumnName("current_balance").HasPrecision(18, 2).IsRequired();
        builder.Property(w => w.Color).HasColumnName("color").HasMaxLength(20);
        builder.Property(w => w.Icon).HasColumnName("icon").HasMaxLength(50);
        builder.Property(w => w.IsArchived).HasColumnName("is_archived").IsRequired();
        builder.Property(w => w.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(w => w.UserId).HasDatabaseName("ix_wallets_user_id");
        builder.HasIndex(w => new { w.UserId, w.IsArchived }).HasDatabaseName("ix_wallets_user_archived");
    }
}
