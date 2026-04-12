using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record DeleteCategoryCommand(Guid UserId, Guid CategoryId) : ICommand;

public sealed class DeleteCategoryCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<DeleteCategoryCommand>
{
    public async Task<Result> Handle(
        DeleteCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await db.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category is null)
            return Result.Failure(HouseholdBudgetErrors.CategoryNotFound);

        if (category.UserId != request.UserId)
            return Result.Failure(HouseholdBudgetErrors.CategoryAccessDenied);

        if (category.IsDefault)
            return Result.Failure(HouseholdBudgetErrors.DefaultCategoryCannotBeDeleted);

        db.ExpenseCategories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
