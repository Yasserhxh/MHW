using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

namespace MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;

public sealed class HouseholdBudgetDbContext(DbContextOptions<HouseholdBudgetDbContext> options)
    : DbContext(options)
{
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<MonthlyBudget> MonthlyBudgets => Set<MonthlyBudget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("budget");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HouseholdBudgetDbContext).Assembly);
    }
}
