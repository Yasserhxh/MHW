using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Notifications.Domain.Entities;

public sealed class Notification : AggregateRoot
{
    private Notification() { }

    public Guid UserId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Body { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public string? DataJson { get; private set; }

    public static Notification Create(
        Guid userId,
        string type,
        string title,
        string? body = null,
        string? dataJson = null)
    {
        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            IsRead = false,
            DataJson = dataJson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void MarkRead()
    {
        if (IsRead) return;
        IsRead = true;
        ReadAt = DateTime.UtcNow;
        Touch();
    }
}
