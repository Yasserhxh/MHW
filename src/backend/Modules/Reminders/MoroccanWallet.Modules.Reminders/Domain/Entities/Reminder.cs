using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Reminders.Domain.Entities;

public enum ReminderFrequency { Once, Daily, Weekly, Monthly, Yearly }

public sealed class Reminder : AggregateRoot
{
    private Reminder() { }

    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTime DueDate { get; private set; }
    public ReminderFrequency Frequency { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public bool NotificationSent { get; private set; }

    public static Reminder Create(
        Guid userId,
        string title,
        string? description,
        DateTime dueDate,
        ReminderFrequency frequency)
    {
        return new Reminder
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title.Trim(),
            Description = description?.Trim(),
            DueDate = dueDate,
            Frequency = frequency,
            IsCompleted = false,
            NotificationSent = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(string title, string? description, DateTime dueDate, ReminderFrequency frequency)
    {
        Title = title.Trim();
        Description = description?.Trim();
        DueDate = dueDate;
        Frequency = frequency;
        Touch();
    }

    public void Complete()
    {
        if (IsCompleted) return;
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        Touch();
    }

    public void MarkNotificationSent()
    {
        NotificationSent = true;
        Touch();
    }
}
