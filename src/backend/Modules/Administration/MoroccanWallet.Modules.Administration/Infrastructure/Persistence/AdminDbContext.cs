using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.Administration.Infrastructure.Persistence;

/// <summary>
/// Keyless view entity representing a user row from the identity schema.
/// Used for admin read-only queries without coupling to the Identity module.
/// </summary>
public sealed class AdminUserView
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string EmailNormalized { get; init; } = string.Empty;
    public bool EmailVerified { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Minimal DbContext for administration — reads from the identity schema via keyless entity mapping.
/// </summary>
public sealed class AdminDbContext(DbContextOptions<AdminDbContext> options) : DbContext(options)
{
    public DbSet<AdminUserView> AdminUsers => Set<AdminUserView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminUserView>(b =>
        {
            b.ToTable("users", "identity");
            b.HasNoKey();
            b.Property(u => u.Id).HasColumnName("id");
            b.Property(u => u.Email).HasColumnName("email");
            b.Property(u => u.EmailNormalized).HasColumnName("email_normalized");
            b.Property(u => u.EmailVerified).HasColumnName("email_verified");
            b.Property(u => u.IsActive).HasColumnName("is_active");
            b.Property(u => u.CreatedAt).HasColumnName("created_at");
        });
    }
}
