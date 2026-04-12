using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record ExpenseDetailDto(
    Guid Id,
    Guid? CategoryId,
    string? CategoryName,
    Guid? WalletId,
    string? WalletName,
    decimal Amount,
    string Currency,
    string Type,
    string? PaymentMethod,
    string Description,
    string? Notes,
    DateTime Date,
    bool IsRecurring,
    string? Tags,
    DateTime CreatedAt);

public sealed record GetExpenseByIdQuery(Guid UserId, Guid ExpenseId) : IQuery<ExpenseDetailDto>;

public sealed class GetExpenseByIdQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetExpenseByIdQuery, ExpenseDetailDto>
{
    public async Task<Result<ExpenseDetailDto>> Handle(GetExpenseByIdQuery request, CancellationToken cancellationToken)
    {
        var expense = await db.Expenses
            .AsNoTracking()
            .Where(e => e.Id == request.ExpenseId)
            .Select(e => new
            {
                e.Id,
                e.UserId,
                e.CategoryId,
                e.WalletId,
                e.Amount,
                e.Currency,
                Type = e.Type.ToString(),
                e.PaymentMethod,
                e.Description,
                e.Notes,
                e.Date,
                e.IsRecurring,
                e.Tags,
                e.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (expense is null)
            return Result.Failure<ExpenseDetailDto>(HouseholdBudgetErrors.ExpenseNotFound);

        if (expense.UserId != request.UserId)
            return Result.Failure<ExpenseDetailDto>(HouseholdBudgetErrors.ExpenseAccessDenied);

        string? categoryName = null;
        if (expense.CategoryId.HasValue)
        {
            categoryName = await db.ExpenseCategories
                .AsNoTracking()
                .Where(c => c.Id == expense.CategoryId.Value)
                .Select(c => c.Name)
                .FirstOrDefaultAsync(cancellationToken);
        }

        string? walletName = null;
        if (expense.WalletId.HasValue)
        {
            walletName = await db.Wallets
                .AsNoTracking()
                .Where(w => w.Id == expense.WalletId.Value)
                .Select(w => w.Name)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return new ExpenseDetailDto(
            expense.Id,
            expense.CategoryId,
            categoryName,
            expense.WalletId,
            walletName,
            expense.Amount,
            expense.Currency,
            expense.Type,
            expense.PaymentMethod,
            expense.Description,
            expense.Notes,
            expense.Date,
            expense.IsRecurring,
            expense.Tags,
            expense.CreatedAt);
    }
}
