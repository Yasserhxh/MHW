using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record GetCategoriesQuery(Guid UserId) : IQuery<IReadOnlyList<CategoryDto>>;

public sealed record CategoryDto(Guid Id, string Name, string Color, string Icon, string Type, bool IsDefault);

public sealed class GetCategoriesQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    public async Task<Result<IReadOnlyList<CategoryDto>>> Handle(
        GetCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var categories = await db.ExpenseCategories
            .AsNoTracking()
            .Where(c => c.UserId == request.UserId)
            .OrderBy(c => c.IsDefault ? 0 : 1)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Color, c.Icon, c.Type.ToString(), c.IsDefault))
            .ToListAsync(cancellationToken);

        return categories;
    }
}
