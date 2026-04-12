using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.Notifications.Domain.Entities;

namespace MoroccanWallet.Modules.Notifications.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).HasColumnName("id");

        builder.HasIndex(n => n.UserId).HasDatabaseName("ix_notifications_user_id");
        builder.HasIndex(n => new { n.UserId, n.IsRead }).HasDatabaseName("ix_notifications_user_read");

        builder.Property(n => n.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(n => n.Type).HasColumnName("type").HasMaxLength(100).IsRequired();
        builder.Property(n => n.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
        builder.Property(n => n.Body).HasColumnName("body").HasMaxLength(2000);
        builder.Property(n => n.IsRead).HasColumnName("is_read").IsRequired();
        builder.Property(n => n.ReadAt).HasColumnName("read_at");
        builder.Property(n => n.DataJson).HasColumnName("data_json").HasColumnType("jsonb");
        builder.Property(n => n.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(n => n.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
