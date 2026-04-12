using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Domain.Errors;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Notifications.Application.Commands;

public sealed record MarkNotificationReadCommand(Guid UserId, Guid NotificationId) : ICommand;

public sealed class MarkNotificationReadCommandHandler(NotificationsDbContext db)
    : ICommandHandler<MarkNotificationReadCommand>
{
    public async Task<Result> Handle(
        MarkNotificationReadCommand request,
        CancellationToken cancellationToken)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId, cancellationToken);

        if (notification is null)
            return Result.Failure(NotificationsErrors.NotificationNotFound);

        if (notification.UserId != request.UserId)
            return Result.Failure(NotificationsErrors.NotificationAccessDenied);

        notification.MarkRead();
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
