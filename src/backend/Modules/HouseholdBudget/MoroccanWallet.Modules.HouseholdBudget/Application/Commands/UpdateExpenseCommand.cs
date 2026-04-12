using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record UpdateExpenseCommand(
    Guid UserId,
    Guid ExpenseId,
    Guid? CategoryId,
    Guid? WalletId,
    decimal Amount,
    string Currency,
    TransactionType Type,
    string? PaymentMethod,
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

        if (request.CategoryId.HasValue)
        {
            var categoryExists = await db.ExpenseCategories
                .AnyAsync(c => c.Id == request.CategoryId && c.UserId == request.UserId, cancellationToken);
            if (!categoryExists)
                return Result.Failure(HouseholdBudgetErrors.CategoryNotFound);
        }

        if (request.WalletId.HasValue)
        {
            var walletExists = await db.Wallets
                .AnyAsync(w => w.Id == request.WalletId && w.UserId == request.UserId, cancellationToken);
            if (!walletExists)
                return Result.Failure(HouseholdBudgetErrors.WalletNotFound);
        }

        expense.Update(
            request.CategoryId,
            request.WalletId,
            request.Amount,
            request.Currency,
            request.Type,
            request.PaymentMethod,
            request.Description,
            request.Notes,
            request.Date,
            request.IsRecurring,
            request.Tags);

        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
