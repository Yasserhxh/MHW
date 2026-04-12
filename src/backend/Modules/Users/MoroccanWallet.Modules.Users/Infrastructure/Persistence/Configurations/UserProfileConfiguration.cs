using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.Users.Domain.Entities;

namespace MoroccanWallet.Modules.Users.Infrastructure.Persistence.Configurations;

public sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("user_profiles");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.HasIndex(p => p.UserId)
            .IsUnique()
            .HasDatabaseName("ix_user_profiles_user_id");

        builder.Property(p => p.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(p => p.DisplayName).HasColumnName("display_name").HasMaxLength(100).IsRequired();
        builder.Property(p => p.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(2048);
        builder.Property(p => p.PreferredCurrency).HasColumnName("preferred_currency").HasMaxLength(10).IsRequired();
        builder.Property(p => p.Language).HasColumnName("language").HasMaxLength(10).IsRequired();
        builder.Property(p => p.Timezone).HasColumnName("timezone").HasMaxLength(100).IsRequired();
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
