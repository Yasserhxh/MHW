using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record GetGroupExpensesQuery(
    Guid UserId,
    Guid GroupId,
    int Page,
    int PageSize) : IQuery<PagedResult<SharedExpenseDto>>;

public sealed record SplitDto(Guid UserId, decimal Amount, bool IsSettled);

public sealed record SharedExpenseDto(
    Guid Id,
    Guid PaidById,
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    string SplitType,
    IReadOnlyList<SplitDto> Splits,
    DateTime CreatedAt);

public sealed class GetGroupExpensesQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetGroupExpensesQuery, PagedResult<SharedExpenseDto>>
{
    public async Task<Result<PagedResult<SharedExpenseDto>>> Handle(
        GetGroupExpensesQuery request,
        CancellationToken cancellationToken)
    {
        var isMember = await db.GroupMembers
            .AsNoTracking()
            .AnyAsync(m => m.GroupId == request.GroupId && m.UserId == request.UserId, cancellationToken);

        if (!isMember)
            return Result.Failure<PagedResult<SharedExpenseDto>>(SharedExpensesErrors.GroupAccessDenied);

        var total = await db.SharedExpenses
            .AsNoTracking()
            .CountAsync(e => e.GroupId == request.GroupId, cancellationToken);

        var expenses = await db.SharedExpenses
            .AsNoTracking()
            .Where(e => e.GroupId == request.GroupId)
            .Include(e => e.Splits)
            .OrderByDescending(e => e.Date)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new SharedExpenseDto(
                e.Id,
                e.PaidById,
                e.Amount,
                e.Currency,
                e.Description,
                e.Date,
                e.SplitType.ToString(),
                e.Splits.Select(s => new SplitDto(s.UserId, s.Amount, s.IsSettled)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<SharedExpenseDto>(expenses, total, request.Page, request.PageSize);
    }
}
