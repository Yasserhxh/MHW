using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.Identity.Domain.Entities;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Persistence.Configurations;

internal sealed class AuthAuditLogConfiguration : IEntityTypeConfiguration<AuthAuditLog>
{
    public void Configure(EntityTypeBuilder<AuthAuditLog> builder)
    {
        builder.ToTable("auth_audit_logs");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id").UseIdentityColumn();
        builder.Property(a => a.UserId).HasColumnName("user_id");
        builder.Property(a => a.EventType).HasColumnName("event_type").HasMaxLength(50).IsRequired();
        builder.Property(a => a.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
        builder.Property(a => a.UserAgent).HasColumnName("user_agent");
        builder.Property(a => a.MetadataJson).HasColumnName("metadata").HasColumnType("jsonb");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasIndex(a => a.UserId).HasDatabaseName("idx_auth_audit_user");
        builder.HasIndex(a => a.EventType).HasDatabaseName("idx_auth_audit_event");
        builder.HasIndex(a => a.CreatedAt).IsDescending().HasDatabaseName("idx_auth_audit_created");
    }
}
