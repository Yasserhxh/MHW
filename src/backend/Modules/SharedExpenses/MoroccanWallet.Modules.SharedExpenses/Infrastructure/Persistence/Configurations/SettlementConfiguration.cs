using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence.Configurations;

public sealed class SettlementConfiguration : IEntityTypeConfiguration<Settlement>
{
    public void Configure(EntityTypeBuilder<Settlement> builder)
    {
        builder.ToTable("settlements");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.GroupId).HasColumnName("group_id").IsRequired();
        builder.Property(s => s.FromUserId).HasColumnName("from_user_id").IsRequired();
        builder.Property(s => s.ToUserId).HasColumnName("to_user_id").IsRequired();
        builder.Property(s => s.RecordedByUserId).HasColumnName("recorded_by_user_id").IsRequired();
        builder.Property(s => s.Amount).HasColumnName("amount").HasPrecision(18, 2).IsRequired();
        builder.Property(s => s.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(s => s.SettledOn).HasColumnName("settled_on").IsRequired();
        builder.Property(s => s.Notes).HasColumnName("notes").HasMaxLength(1000);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(s => s.GroupId).HasDatabaseName("ix_settlements_group_id");
        builder.HasIndex(s => new { s.GroupId, s.SettledOn }).HasDatabaseName("ix_settlements_group_settled_on");
    }
}
