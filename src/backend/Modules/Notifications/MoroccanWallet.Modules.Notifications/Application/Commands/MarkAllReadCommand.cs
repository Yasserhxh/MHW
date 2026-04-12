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
        var now = DateTime.UtcNow;

        await db.Notifications
            .Where(n => n.UserId == request.UserId && !n.IsRead)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, now)
                    .SetProperty(n => n.UpdatedAt, now),
                cancellationToken);

        return Result.Success();
    }
}
