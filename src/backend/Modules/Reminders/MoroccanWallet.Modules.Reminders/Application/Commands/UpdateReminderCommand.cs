using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Reminders.Domain.Entities;
using MoroccanWallet.Modules.Reminders.Domain.Errors;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Commands;

public sealed record UpdateReminderCommand(
    Guid UserId,
    Guid ReminderId,
    string Title,
    string? Description,
    DateTime DueDate,
    ReminderFrequency Frequency) : ICommand;

public sealed class UpdateReminderCommandValidator : AbstractValidator<UpdateReminderCommand>
{
    public UpdateReminderCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
        RuleFor(x => x.DueDate).NotEmpty();
    }
}

public sealed class UpdateReminderCommandHandler(RemindersDbContext db)
    : ICommandHandler<UpdateReminderCommand>
{
    public async Task<Result> Handle(
        UpdateReminderCommand request,
        CancellationToken cancellationToken)
    {
        var reminder = await db.Reminders
            .FirstOrDefaultAsync(r => r.Id == request.ReminderId, cancellationToken);

        if (reminder is null)
            return Result.Failure(RemindersErrors.ReminderNotFound);

        if (reminder.UserId != request.UserId)
            return Result.Failure(RemindersErrors.ReminderAccessDenied);

        reminder.Update(request.Title, request.Description, request.DueDate, request.Frequency);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
