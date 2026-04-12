using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record GetExpensesQuery(
    Guid UserId,
    int Page,
    int PageSize,
    Guid? CategoryId,
    DateTime? From,
    DateTime? To,
    string? Search) : IQuery<PagedResult<ExpenseSummaryDto>>;

public sealed record ExpenseSummaryDto(
    Guid Id,
    Guid? CategoryId,
    string? CategoryName,
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    bool IsRecurring,
    string? Tags,
    DateTime CreatedAt);

public sealed class GetExpensesQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetExpensesQuery, PagedResult<ExpenseSummaryDto>>
{
    public async Task<Result<PagedResult<ExpenseSummaryDto>>> Handle(
        GetExpensesQuery request,
        CancellationToken cancellationToken)
    {
        var query = db.Expenses
            .AsNoTracking()
            .Where(e => e.UserId == request.UserId);

        if (request.CategoryId.HasValue)
            query = query.Where(e => e.CategoryId == request.CategoryId);

        if (request.From.HasValue)
            query = query.Where(e => e.Date >= request.From.Value.Date);

        if (request.To.HasValue)
            query = query.Where(e => e.Date <= request.To.Value.Date);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(e => e.Description.Contains(request.Search));

        var total = await query.CountAsync(cancellationToken);

        var pagedExpenses = await query
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new { e.Id, e.CategoryId, e.Amount, e.Currency, e.Description, e.Date, e.IsRecurring, e.Tags, e.CreatedAt })
            .ToListAsync(cancellationToken);

        var categoryIds = pagedExpenses
            .Where(e => e.CategoryId.HasValue)
            .Select(e => e.CategoryId!.Value)
            .Distinct()
            .ToList();

        Dictionary<Guid, string> categoryNames = [];
        if (categoryIds.Count > 0)
        {
            categoryNames = await db.ExpenseCategories
                .AsNoTracking()
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);
        }

        var items = pagedExpenses.Select(e => new ExpenseSummaryDto(
            e.Id,
            e.CategoryId,
            e.CategoryId.HasValue && categoryNames.TryGetValue(e.CategoryId.Value, out var name) ? name : null,
            e.Amount,
            e.Currency,
            e.Description,
            e.Date,
            e.IsRecurring,
            e.Tags,
            e.CreatedAt)).ToList();

        return new PagedResult<ExpenseSummaryDto>(items, total, request.Page, request.PageSize);
    }
}
