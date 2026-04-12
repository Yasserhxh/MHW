using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Entities;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Queries;

public sealed record GetRemindersQuery(
    Guid UserId,
    bool? IsCompleted,
    int Page,
    int PageSize) : IQuery<PagedResult<ReminderDto>>;

public sealed record ReminderDto(
    Guid Id,
    string Title,
    string? Description,
    DateTime DueDate,
    string Frequency,
    bool IsCompleted,
    DateTime? CompletedAt,
    DateTime CreatedAt);

public sealed class GetRemindersQueryHandler(RemindersDbContext db)
    : IQueryHandler<GetRemindersQuery, PagedResult<ReminderDto>>
{
    public async Task<Result<PagedResult<ReminderDto>>> Handle(
        GetRemindersQuery request,
        CancellationToken cancellationToken)
    {
        var query = db.Reminders
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId);

        if (request.IsCompleted.HasValue)
            query = query.Where(r => r.IsCompleted == request.IsCompleted.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(r => r.IsCompleted)
            .ThenBy(r => r.DueDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new ReminderDto(
                r.Id,
                r.Title,
                r.Description,
                r.DueDate,
                r.Frequency.ToString(),
                r.IsCompleted,
                r.CompletedAt,
                r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ReminderDto>(items, total, request.Page, request.PageSize);
    }
}
