using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Application.Services;
using MoroccanWallet.Modules.Notifications.Domain.Entities;
using MoroccanWallet.Modules.Notifications.Infrastructure.Hubs;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Notifications.Infrastructure.Services;

public sealed class NotificationService(
    NotificationsDbContext db,
    IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task SendAsync(
        Guid userId,
        string type,
        string title,
        string? body = null,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        var dataJson = data is not null ? JsonSerializer.Serialize(data) : null;

        var notification = Notification.Create(userId, type, title, body, dataJson);
        db.Notifications.Add(notification);
        await db.SaveChangesAsync(cancellationToken);

        var unreadCount = await db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

        await hubContext.Clients
            .Group($"user-{userId}")
            .SendAsync("Notification", new
            {
                notification.Id,
                notification.Type,
                notification.Title,
                notification.Body,
                notification.CreatedAt,
                Data = data
            }, cancellationToken);

        await hubContext.Clients
            .Group($"user-{userId}")
            .SendAsync("UnreadCountChanged", new { Count = unreadCount }, cancellationToken);
    }
}
