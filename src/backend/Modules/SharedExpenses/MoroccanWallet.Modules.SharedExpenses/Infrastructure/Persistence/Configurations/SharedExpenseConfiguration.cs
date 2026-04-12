using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence.Configurations;

public sealed class SharedExpenseConfiguration : IEntityTypeConfiguration<SharedExpense>
{
    public void Configure(EntityTypeBuilder<SharedExpense> builder)
    {
        builder.ToTable("shared_expenses");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");

        builder.HasIndex(e => e.GroupId).HasDatabaseName("ix_shared_expenses_group_id");

        builder.Property(e => e.GroupId).HasColumnName("group_id").IsRequired();
        builder.Property(e => e.PaidById).HasColumnName("paid_by_id").IsRequired();
        builder.Property(e => e.Amount).HasColumnName("amount").HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
        builder.Property(e => e.Date).HasColumnName("date").IsRequired();
        builder.Property(e => e.SplitType).HasColumnName("split_type")
            .HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasMany(e => e.Splits)
            .WithOne()
            .HasForeignKey(s => s.SharedExpenseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(e => e.Splits).HasField("_splits");
    }
}
