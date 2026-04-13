using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record GetExpenseSummaryQuery(Guid UserId, int Year, int Month) : IQuery<ExpenseSummaryResponse>;

public sealed record CategoryBreakdownDto(
    Guid? CategoryId,
    string CategoryName,
    decimal Total,
    decimal Budget,
    int Count);

public sealed record ExpenseSummaryResponse(
    int Year,
    int Month,
    decimal TotalSpent,
    decimal TotalBudget,
    IReadOnlyList<CategoryBreakdownDto> ByCategory);

public sealed class GetExpenseSummaryQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetExpenseSummaryQuery, ExpenseSummaryResponse>
{
    public async Task<Result<ExpenseSummaryResponse>> Handle(
        GetExpenseSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var startDate = new DateTime(request.Year, request.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDateExclusive = startDate.AddMonths(1);

        var expenses = await db.Expenses
            .AsNoTracking()
            .Where(e => e.UserId == request.UserId && e.Date >= startDate && e.Date < endDateExclusive)
            .GroupBy(e => e.CategoryId)
            .Select(g => new { CategoryId = g.Key, Total = g.Sum(e => e.Amount), Count = g.Count() })
            .ToListAsync(cancellationToken);

        var budgets = await db.MonthlyBudgets
            .AsNoTracking()
            .Where(b => b.UserId == request.UserId && b.Year == request.Year && b.Month == request.Month)
            .ToListAsync(cancellationToken);

        var categoryIds = expenses
            .Where(e => e.CategoryId.HasValue)
            .Select(e => e.CategoryId!.Value)
            .ToList();

        Dictionary<Guid, string> categoryNames = [];
        if (categoryIds.Count > 0)
        {
            categoryNames = await db.ExpenseCategories
                .AsNoTracking()
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);
        }

        var breakdown = expenses.Select(e =>
        {
            var budget = budgets.FirstOrDefault(b => b.CategoryId == e.CategoryId)?.LimitAmount ?? 0m;
            var categoryName = e.CategoryId.HasValue && categoryNames.TryGetValue(e.CategoryId.Value, out var name)
                ? name
                : "Uncategorized";
            return new CategoryBreakdownDto(e.CategoryId, categoryName, e.Total, budget, e.Count);
        }).ToList();

        var totalSpent = breakdown.Sum(b => b.Total);
        var totalBudget = budgets.Sum(b => b.LimitAmount);

        return new ExpenseSummaryResponse(request.Year, request.Month, totalSpent, totalBudget, breakdown);
    }
}
