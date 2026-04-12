using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record SharedExpenseDetailResponse(
    Guid Id,
    Guid GroupId,
    Guid PaidById,
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    string SplitType,
    IReadOnlyList<SplitDto> Splits,
    DateTime CreatedAt);

public sealed record GetSharedExpenseByIdQuery(Guid UserId, Guid ExpenseId) : IQuery<SharedExpenseDetailResponse>;

public sealed class GetSharedExpenseByIdQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetSharedExpenseByIdQuery, SharedExpenseDetailResponse>
{
    public async Task<Result<SharedExpenseDetailResponse>> Handle(GetSharedExpenseByIdQuery request, CancellationToken cancellationToken)
    {
        var expense = await db.SharedExpenses
            .AsNoTracking()
            .Include(e => e.Splits)
            .FirstOrDefaultAsync(e => e.Id == request.ExpenseId, cancellationToken);

        if (expense is null)
            return Result.Failure<SharedExpenseDetailResponse>(SharedExpensesErrors.ExpenseNotFound);

        var isMember = await db.GroupMembers
            .AsNoTracking()
            .AnyAsync(m => m.GroupId == expense.GroupId && m.UserId == request.UserId, cancellationToken);
        if (!isMember)
            return Result.Failure<SharedExpenseDetailResponse>(SharedExpensesErrors.GroupAccessDenied);

        return new SharedExpenseDetailResponse(
            expense.Id,
            expense.GroupId,
            expense.PaidById,
            expense.Amount,
            expense.Currency,
            expense.Description,
            expense.Date,
            expense.SplitType.ToString(),
            expense.Splits.Select(s => new SplitDto(s.UserId, s.Amount, s.IsSettled)).ToList(),
            expense.CreatedAt);
    }
}
