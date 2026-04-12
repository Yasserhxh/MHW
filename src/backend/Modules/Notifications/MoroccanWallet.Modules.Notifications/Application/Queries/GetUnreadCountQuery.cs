using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Notifications.Application.Queries;

public sealed record GetUnreadCountQuery(Guid UserId) : IQuery<UnreadCountResponse>;

public sealed record UnreadCountResponse(int Count);

public sealed class GetUnreadCountQueryHandler(NotificationsDbContext db)
    : IQueryHandler<GetUnreadCountQuery, UnreadCountResponse>
{
    public async Task<Result<UnreadCountResponse>> Handle(
        GetUnreadCountQuery request,
        CancellationToken cancellationToken)
    {
        var count = await db.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == request.UserId && !n.IsRead, cancellationToken);

        return new UnreadCountResponse(count);
    }
}
