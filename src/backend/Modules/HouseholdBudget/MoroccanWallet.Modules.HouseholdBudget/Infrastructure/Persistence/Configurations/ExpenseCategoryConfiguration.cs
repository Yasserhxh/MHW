using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

namespace MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence.Configurations;

public sealed class ExpenseCategoryConfiguration : IEntityTypeConfiguration<ExpenseCategory>
{
    public void Configure(EntityTypeBuilder<ExpenseCategory> builder)
    {
        builder.ToTable("expense_categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");

        builder.HasIndex(c => c.UserId).HasDatabaseName("ix_expense_categories_user_id");

        builder.Property(c => c.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Color).HasColumnName("color").HasMaxLength(20).IsRequired();
        builder.Property(c => c.Icon).HasColumnName("icon").HasMaxLength(50).IsRequired();
        builder.Property(c => c.IsDefault).HasColumnName("is_default").IsRequired();
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
