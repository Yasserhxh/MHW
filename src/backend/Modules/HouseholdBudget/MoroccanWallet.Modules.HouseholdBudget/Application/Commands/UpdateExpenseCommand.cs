using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record UpdateExpenseCommand(
    Guid UserId,
    Guid ExpenseId,
    Guid? CategoryId,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTime Date,
    bool IsRecurring,
    string? Tags) : ICommand;

public sealed class UpdateExpenseCommandValidator : AbstractValidator<UpdateExpenseCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public UpdateExpenseCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).LessThanOrEqualTo(1_000_000);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c));
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes is not null);
        RuleFor(x => x.Date).NotEmpty();
    }
}

public sealed class UpdateExpenseCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<UpdateExpenseCommand>
{
    public async Task<Result> Handle(
        UpdateExpenseCommand request,
        CancellationToken cancellationToken)
    {
        var expense = await db.Expenses
            .FirstOrDefaultAsync(e => e.Id == request.ExpenseId, cancellationToken);

        if (expense is null)
            return Result.Failure(HouseholdBudgetErrors.ExpenseNotFound);

        if (expense.UserId != request.UserId)
            return Result.Failure(HouseholdBudgetErrors.ExpenseAccessDenied);

        expense.Update(
            request.CategoryId,
            request.Amount,
            request.Currency,
            request.Description,
            request.Notes,
            request.Date,
            request.IsRecurring,
            request.Tags);

        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
