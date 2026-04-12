using FluentValidation;
using MoroccanWallet.Modules.Reminders.Domain.Entities;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Application.Commands;

public sealed record CreateReminderCommand(
    Guid UserId,
    string Title,
    string? Description,
    DateTime DueDate,
    ReminderFrequency Frequency) : ICommand<ReminderCreatedResponse>;

public sealed record ReminderCreatedResponse(Guid Id);

public sealed class CreateReminderCommandValidator : AbstractValidator<CreateReminderCommand>
{
    public CreateReminderCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
        RuleFor(x => x.DueDate).NotEmpty();
    }
}

public sealed class CreateReminderCommandHandler(RemindersDbContext db)
    : ICommandHandler<CreateReminderCommand, ReminderCreatedResponse>
{
    public async Task<Result<ReminderCreatedResponse>> Handle(
        CreateReminderCommand request,
        CancellationToken cancellationToken)
    {
        var reminder = Reminder.Create(
            request.UserId,
            request.Title,
            request.Description,
            request.DueDate,
            request.Frequency);

        db.Reminders.Add(reminder);
        await db.SaveChangesAsync(cancellationToken);

        return new ReminderCreatedResponse(reminder.Id);
    }
}
