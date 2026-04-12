using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence.Configurations;

public sealed class SharedGroupConfiguration : IEntityTypeConfiguration<SharedGroup>
{
    public void Configure(EntityTypeBuilder<SharedGroup> builder)
    {
        builder.ToTable("groups");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("id");

        builder.HasIndex(g => g.OwnerId).HasDatabaseName("ix_groups_owner_id");

        builder.Property(g => g.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(g => g.Description).HasColumnName("description").HasMaxLength(1000);
        builder.Property(g => g.OwnerId).HasColumnName("owner_id").IsRequired();
        builder.Property(g => g.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
        builder.Property(g => g.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(g => g.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(g => g.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasMany(g => g.Members)
            .WithOne()
            .HasForeignKey(m => m.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(g => g.Members).HasField("_members");
    }
}
