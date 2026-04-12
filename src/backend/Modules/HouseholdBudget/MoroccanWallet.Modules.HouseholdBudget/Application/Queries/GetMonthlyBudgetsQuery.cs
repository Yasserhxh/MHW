using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record MonthlyBudgetDto(
    Guid Id,
    Guid? CategoryId,
    string? CategoryName,
    int Year,
    int Month,
    decimal LimitAmount,
    string Currency);

public sealed record GetMonthlyBudgetsQuery(Guid UserId, int Year, int Month) : IQuery<IReadOnlyList<MonthlyBudgetDto>>;

public sealed class GetMonthlyBudgetsQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetMonthlyBudgetsQuery, IReadOnlyList<MonthlyBudgetDto>>
{
    public async Task<Result<IReadOnlyList<MonthlyBudgetDto>>> Handle(GetMonthlyBudgetsQuery request, CancellationToken cancellationToken)
    {
        var budgets = await db.MonthlyBudgets
            .AsNoTracking()
            .Where(b => b.UserId == request.UserId && b.Year == request.Year && b.Month == request.Month)
            .Select(b => new MonthlyBudgetDto(
                b.Id,
                b.CategoryId,
                null,
                b.Year,
                b.Month,
                b.LimitAmount,
                b.Currency))
            .ToListAsync(cancellationToken);

        if (budgets.Count == 0)
            return Array.Empty<MonthlyBudgetDto>();

        var categoryIds = budgets.Where(b => b.CategoryId.HasValue).Select(b => b.CategoryId!.Value).Distinct().ToList();
        var categoryNames = categoryIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await db.ExpenseCategories.AsNoTracking()
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        return budgets
            .Select(b => b with
            {
                CategoryName = b.CategoryId.HasValue && categoryNames.TryGetValue(b.CategoryId.Value, out var name) ? name : null
            })
            .ToList();
    }
}
