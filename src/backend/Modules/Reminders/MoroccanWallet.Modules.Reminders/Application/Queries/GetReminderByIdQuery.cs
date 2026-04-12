using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Errors;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Queries;

public sealed record ReminderDetailDto(
    Guid Id,
    string Title,
    string? Description,
    string Type,
    decimal? Amount,
    DateTime DueDate,
    DateTime? SnoozedUntil,
    string Frequency,
    bool IsCompleted,
    DateTime? CompletedAt,
    DateTime CreatedAt);

public sealed record GetReminderByIdQuery(Guid UserId, Guid ReminderId) : IQuery<ReminderDetailDto>;

public sealed class GetReminderByIdQueryHandler(RemindersDbContext db)
    : IQueryHandler<GetReminderByIdQuery, ReminderDetailDto>
{
    public async Task<Result<ReminderDetailDto>> Handle(GetReminderByIdQuery request, CancellationToken cancellationToken)
    {
        var reminder = await db.Reminders
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.ReminderId, cancellationToken);

        if (reminder is null)
            return Result.Failure<ReminderDetailDto>(RemindersErrors.ReminderNotFound);

        if (reminder.UserId != request.UserId)
            return Result.Failure<ReminderDetailDto>(RemindersErrors.ReminderAccessDenied);

        return new ReminderDetailDto(
            reminder.Id,
            reminder.Title,
            reminder.Description,
            reminder.Type.ToString(),
            reminder.Amount,
            reminder.DueDate,
            reminder.SnoozedUntil,
            reminder.Frequency.ToString(),
            reminder.IsCompleted,
            reminder.CompletedAt,
            reminder.CreatedAt);
    }
}
