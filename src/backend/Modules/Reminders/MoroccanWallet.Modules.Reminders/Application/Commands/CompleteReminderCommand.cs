using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Errors;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Commands;

public sealed record CompleteReminderCommand(Guid UserId, Guid ReminderId) : ICommand;

public sealed class CompleteReminderCommandHandler(RemindersDbContext db)
    : ICommandHandler<CompleteReminderCommand>
{
    public async Task<Result> Handle(
        CompleteReminderCommand request,
        CancellationToken cancellationToken)
    {
        var reminder = await db.Reminders
            .FirstOrDefaultAsync(r => r.Id == request.ReminderId, cancellationToken);

        if (reminder is null)
            return Result.Failure(RemindersErrors.ReminderNotFound);

        if (reminder.UserId != request.UserId)
            return Result.Failure(RemindersErrors.ReminderAccessDenied);

        reminder.Complete();
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
