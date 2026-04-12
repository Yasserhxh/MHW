using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.Reminders.Domain.Entities;

namespace MoroccanWallet.Modules.Reminders.Infrastructure.Persistence.Configurations;

public sealed class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
{
    public void Configure(EntityTypeBuilder<Reminder> builder)
    {
        builder.ToTable("reminders");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");

        builder.HasIndex(r => r.UserId).HasDatabaseName("ix_reminders_user_id");
        builder.HasIndex(r => new { r.IsCompleted, r.DueDate })
            .HasDatabaseName("ix_reminders_completed_due");

        builder.Property(r => r.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(r => r.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(r => r.Description).HasColumnName("description").HasMaxLength(2000);
        builder.Property(r => r.Type).HasColumnName("type")
            .HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(r => r.Amount).HasColumnName("amount").HasPrecision(18, 2);
        builder.Property(r => r.DueDate).HasColumnName("due_date").IsRequired();
        builder.Property(r => r.SnoozedUntil).HasColumnName("snoozed_until");
        builder.Property(r => r.Frequency).HasColumnName("frequency")
            .HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(r => r.IsCompleted).HasColumnName("is_completed").IsRequired();
        builder.Property(r => r.CompletedAt).HasColumnName("completed_at");
        builder.Property(r => r.NotificationSent).HasColumnName("notification_sent").IsRequired();
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
