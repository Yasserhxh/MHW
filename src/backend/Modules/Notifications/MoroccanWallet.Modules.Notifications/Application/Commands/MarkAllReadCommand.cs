using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Notifications.Application.Commands;

public sealed record MarkAllReadCommand(Guid UserId) : ICommand;

public sealed class MarkAllReadCommandHandler(NotificationsDbContext db)
    : ICommandHandler<MarkAllReadCommand>
{
    public async Task<Result> Handle(
        MarkAllReadCommand request,
        CancellationToken cancellationToken)
    {
        var notifications = await db.Notifications
            .Where(n => n.UserId == request.UserId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
            notification.MarkRead();

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
