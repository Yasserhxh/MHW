using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;

public sealed class SharedExpensesDbContext(DbContextOptions<SharedExpensesDbContext> options)
    : DbContext(options)
{
    public DbSet<SharedGroup> Groups => Set<SharedGroup>();
    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
    public DbSet<SharedExpense> SharedExpenses => Set<SharedExpense>();
    public DbSet<ExpenseSplit> ExpenseSplits => Set<ExpenseSplit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("shared_expenses");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SharedExpensesDbContext).Assembly);
    }
}
