using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Errors;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Commands;

public sealed record DeleteReminderCommand(Guid UserId, Guid ReminderId) : ICommand;

public sealed class DeleteReminderCommandHandler(RemindersDbContext db)
    : ICommandHandler<DeleteReminderCommand>
{
    public async Task<Result> Handle(
        DeleteReminderCommand request,
        CancellationToken cancellationToken)
    {
        var reminder = await db.Reminders
            .FirstOrDefaultAsync(r => r.Id == request.ReminderId, cancellationToken);

        if (reminder is null)
            return Result.Failure(RemindersErrors.ReminderNotFound);

        if (reminder.UserId != request.UserId)
            return Result.Failure(RemindersErrors.ReminderAccessDenied);

        db.Reminders.Remove(reminder);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
