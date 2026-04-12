using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

namespace MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence.Configurations;

public sealed class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");

        builder.HasIndex(e => e.UserId).HasDatabaseName("ix_expenses_user_id");
        builder.HasIndex(e => new { e.UserId, e.Date }).HasDatabaseName("ix_expenses_user_date");

        builder.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(e => e.CategoryId).HasColumnName("category_id");
        builder.Property(e => e.WalletId).HasColumnName("wallet_id");
        builder.Property(e => e.Amount).HasColumnName("amount").HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(e => e.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.PaymentMethod).HasColumnName("payment_method").HasMaxLength(50);
        builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
        builder.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(2000);
        builder.Property(e => e.Date).HasColumnName("date").IsRequired();
        builder.Property(e => e.IsRecurring).HasColumnName("is_recurring").IsRequired();
        builder.Property(e => e.Tags).HasColumnName("tags").HasMaxLength(500);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
