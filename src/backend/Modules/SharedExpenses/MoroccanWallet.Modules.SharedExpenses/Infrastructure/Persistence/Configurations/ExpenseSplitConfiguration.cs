using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence.Configurations;

public sealed class ExpenseSplitConfiguration : IEntityTypeConfiguration<ExpenseSplit>
{
    public void Configure(EntityTypeBuilder<ExpenseSplit> builder)
    {
        builder.ToTable("expense_splits");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");

        builder.HasIndex(s => s.SharedExpenseId).HasDatabaseName("ix_expense_splits_expense_id");

        builder.Property(s => s.SharedExpenseId).HasColumnName("shared_expense_id").IsRequired();
        builder.Property(s => s.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(s => s.Amount).HasColumnName("amount").HasPrecision(18, 2).IsRequired();
        builder.Property(s => s.IsSettled).HasColumnName("is_settled").IsRequired();
        builder.Property(s => s.SettledAt).HasColumnName("settled_at");
        builder.Ignore(s => s.CreatedAt);
        builder.Ignore(s => s.UpdatedAt);
    }
}
