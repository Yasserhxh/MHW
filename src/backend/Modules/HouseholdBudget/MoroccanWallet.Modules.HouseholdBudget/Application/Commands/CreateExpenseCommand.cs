using FluentValidation;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record CreateExpenseCommand(
    Guid UserId,
    Guid? CategoryId,
    decimal Amount,
    string Currency,
    string Description,
    string? Notes,
    DateTime Date,
    bool IsRecurring,
    string? Tags) : ICommand<ExpenseCreatedResponse>;

public sealed record ExpenseCreatedResponse(Guid Id);

public sealed class CreateExpenseCommandValidator : AbstractValidator<CreateExpenseCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public CreateExpenseCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).LessThanOrEqualTo(1_000_000);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c))
            .WithMessage("Currency must be one of: MAD, EUR, USD, GBP.");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes is not null);
        RuleFor(x => x.Tags).MaximumLength(500).When(x => x.Tags is not null);
        RuleFor(x => x.Date).NotEmpty().LessThanOrEqualTo(DateTime.UtcNow.AddDays(1));
    }
}

public sealed class CreateExpenseCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<CreateExpenseCommand, ExpenseCreatedResponse>
{
    public async Task<Result<ExpenseCreatedResponse>> Handle(
        CreateExpenseCommand request,
        CancellationToken cancellationToken)
    {
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await db.ExpenseCategories
                .AnyAsync(c => c.Id == request.CategoryId && c.UserId == request.UserId, cancellationToken);

            if (!categoryExists)
                return Result.Failure<ExpenseCreatedResponse>(HouseholdBudgetErrors.CategoryNotFound);
        }

        var expense = Expense.Create(
            request.UserId,
            request.CategoryId,
            request.Amount,
            request.Currency,
            request.Description,
            request.Notes,
            request.Date,
            request.IsRecurring,
            request.Tags);

        db.Expenses.Add(expense);
        await db.SaveChangesAsync(cancellationToken);

        return new ExpenseCreatedResponse(expense.Id);
    }
}
