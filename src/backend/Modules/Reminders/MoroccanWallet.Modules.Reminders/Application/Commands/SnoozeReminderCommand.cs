using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Errors;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Commands;

public sealed record SnoozeReminderCommand(Guid UserId, Guid ReminderId, DateTime Until) : ICommand;

public sealed class SnoozeReminderCommandValidator : AbstractValidator<SnoozeReminderCommand>
{
    public SnoozeReminderCommandValidator()
    {
        RuleFor(x => x.Until).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
    }
}

public sealed class SnoozeReminderCommandHandler(RemindersDbContext db)
    : ICommandHandler<SnoozeReminderCommand>
{
    public async Task<Result> Handle(SnoozeReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await db.Reminders.FirstOrDefaultAsync(r => r.Id == request.ReminderId, cancellationToken);
        if (reminder is null)
            return Result.Failure(RemindersErrors.ReminderNotFound);

        if (reminder.UserId != request.UserId)
            return Result.Failure(RemindersErrors.ReminderAccessDenied);

        reminder.Snooze(request.Until);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
