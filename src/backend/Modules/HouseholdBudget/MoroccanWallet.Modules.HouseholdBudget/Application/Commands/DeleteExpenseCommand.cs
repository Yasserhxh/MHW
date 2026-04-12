using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record DeleteExpenseCommand(Guid UserId, Guid ExpenseId) : ICommand;

public sealed class DeleteExpenseCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<DeleteExpenseCommand>
{
    public async Task<Result> Handle(
        DeleteExpenseCommand request,
        CancellationToken cancellationToken)
    {
        var expense = await db.Expenses
            .FirstOrDefaultAsync(e => e.Id == request.ExpenseId, cancellationToken);

        if (expense is null)
            return Result.Failure(HouseholdBudgetErrors.ExpenseNotFound);

        if (expense.UserId != request.UserId)
            return Result.Failure(HouseholdBudgetErrors.ExpenseAccessDenied);

        db.Expenses.Remove(expense);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
