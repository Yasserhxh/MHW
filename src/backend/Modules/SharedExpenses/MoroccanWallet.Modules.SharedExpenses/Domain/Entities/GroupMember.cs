using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

public sealed class GroupMember : Entity
{
    private GroupMember() { }

    public Guid GroupId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime JoinedAt { get; private set; }

    public static GroupMember Create(Guid groupId, Guid userId)
    {
        return new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };
    }
}
