using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Notifications.Application.Queries;

public sealed record GetNotificationsQuery(
    Guid UserId,
    int Page,
    int PageSize,
    bool? IsRead) : IQuery<PagedResult<NotificationDto>>;

public sealed record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string? Body,
    bool IsRead,
    DateTime? ReadAt,
    DateTime CreatedAt);

public sealed class GetNotificationsQueryHandler(NotificationsDbContext db)
    : IQueryHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    public async Task<Result<PagedResult<NotificationDto>>> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == request.UserId);

        if (request.IsRead.HasValue)
            query = query.Where(n => n.IsRead == request.IsRead.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(
                n.Id,
                n.Type,
                n.Title,
                n.Body,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationDto>(items, total, request.Page, request.PageSize);
    }
}
