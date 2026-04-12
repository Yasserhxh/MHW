using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence.Configurations;

public sealed class GroupMemberConfiguration : IEntityTypeConfiguration<GroupMember>
{
    public void Configure(EntityTypeBuilder<GroupMember> builder)
    {
        builder.ToTable("group_members");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");

        builder.HasIndex(m => new { m.GroupId, m.UserId })
            .IsUnique()
            .HasDatabaseName("ix_group_members_group_user");

        builder.Property(m => m.GroupId).HasColumnName("group_id").IsRequired();
        builder.Property(m => m.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(m => m.JoinedAt).HasColumnName("joined_at").IsRequired();
        builder.Ignore(m => m.CreatedAt);
        builder.Ignore(m => m.UpdatedAt);
    }
}
