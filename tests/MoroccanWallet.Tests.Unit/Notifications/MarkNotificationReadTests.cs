using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Application.Commands;
using MoroccanWallet.Modules.Notifications.Domain.Entities;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;

namespace MoroccanWallet.Tests.Unit.Notifications;

public sealed class MarkNotificationReadTests
{
    [Fact]
    public async Task MarkRead_Rejects_Foreign_Notification()
    {
        var options = new DbContextOptionsBuilder<NotificationsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new NotificationsDbContext(options);
        var ownerId = Guid.NewGuid();
        var notification = Notification.Create(ownerId, "system", "Test");
        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        var handler = new MarkNotificationReadCommandHandler(db);
        var result = await handler.Handle(new MarkNotificationReadCommand(Guid.NewGuid(), notification.Id), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Notifications.AccessDenied");
    }
}
