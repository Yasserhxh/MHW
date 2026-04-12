using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Entities;

namespace MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;

public sealed class RemindersDbContext(DbContextOptions<RemindersDbContext> options) : DbContext(options)
{
    public DbSet<Reminder> Reminders => Set<Reminder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("reminders");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RemindersDbContext).Assembly);
    }
}
