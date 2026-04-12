using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

namespace MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence.Configurations;

public sealed class MonthlyBudgetConfiguration : IEntityTypeConfiguration<MonthlyBudget>
{
    public void Configure(EntityTypeBuilder<MonthlyBudget> builder)
    {
        builder.ToTable("monthly_budgets");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasColumnName("id");

        builder.HasIndex(b => new { b.UserId, b.Year, b.Month, b.CategoryId })
            .IsUnique()
            .HasDatabaseName("ix_monthly_budgets_user_year_month_category");

        builder.Property(b => b.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(b => b.CategoryId).HasColumnName("category_id");
        builder.Property(b => b.Year).HasColumnName("year").IsRequired();
        builder.Property(b => b.Month).HasColumnName("month").IsRequired();
        builder.Property(b => b.LimitAmount).HasColumnName("limit_amount").HasPrecision(18, 2).IsRequired();
        builder.Property(b => b.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(b => b.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(b => b.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
