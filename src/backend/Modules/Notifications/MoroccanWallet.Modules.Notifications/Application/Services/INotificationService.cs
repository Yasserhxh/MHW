namespace MoroccanWallet.Modules.Notifications.Application.Services;

public interface INotificationService
{
    Task SendAsync(
        Guid userId,
        string type,
        string title,
        string? body = null,
        object? data = null,
        CancellationToken cancellationToken = default);
}
