using MoroccanWallet.Modules.Reminders.Domain.Entities;

namespace MoroccanWallet.Tests.Unit.Reminders;

public sealed class ReminderTests
{
    [Fact]
    public void Snooze_Updates_DueDate_And_Clears_Notification_Sent()
    {
        var reminder = Reminder.Create(Guid.NewGuid(), "Bill", null, ReminderType.Water, 120m, DateTime.UtcNow.AddDays(1), ReminderFrequency.Monthly);
        reminder.MarkNotificationSent();
        var newDueDate = DateTime.UtcNow.AddDays(3);

        reminder.Snooze(newDueDate);

        reminder.DueDate.Should().Be(newDueDate);
        reminder.SnoozedUntil.Should().Be(newDueDate);
        reminder.NotificationSent.Should().BeFalse();
    }
}
