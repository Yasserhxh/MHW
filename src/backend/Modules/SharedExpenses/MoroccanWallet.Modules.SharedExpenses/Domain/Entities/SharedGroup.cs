using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

public sealed class SharedGroup : AggregateRoot
{
    private readonly List<GroupMember> _members = [];

    private SharedGroup() { }

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public bool IsActive { get; private set; } = true;

    public IReadOnlyList<GroupMember> Members => _members.AsReadOnly();

    public static SharedGroup Create(Guid ownerId, string name, string? description, string currency)
    {
        var group = new SharedGroup
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = name.Trim(),
            Description = description?.Trim(),
            Currency = currency,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        group._members.Add(GroupMember.Create(group.Id, ownerId));
        return group;
    }

    public void AddMember(Guid userId)
    {
        if (_members.Any(m => m.UserId == userId)) return;
        _members.Add(GroupMember.Create(Id, userId));
        Touch();
    }

    public void RemoveMember(Guid userId)
    {
        if (userId == OwnerId) return;
        var member = _members.FirstOrDefault(m => m.UserId == userId);
        if (member is not null) _members.Remove(member);
        Touch();
    }

    public bool IsMember(Guid userId) => _members.Any(m => m.UserId == userId);
}
