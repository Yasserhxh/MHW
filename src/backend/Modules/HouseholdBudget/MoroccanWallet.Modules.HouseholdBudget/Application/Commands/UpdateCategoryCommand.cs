using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record UpdateCategoryCommand(
    Guid UserId,
    Guid CategoryId,
    string Name,
    string Color,
    string Icon,
    CategoryType Type) : ICommand;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20)
            .Matches("^#[0-9a-fA-F]{6}$");
        RuleFor(x => x.Icon).NotEmpty().MaximumLength(50);
    }
}

public sealed class UpdateCategoryCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<UpdateCategoryCommand>
{
    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await db.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category is null)
            return Result.Failure(HouseholdBudgetErrors.CategoryNotFound);

        if (category.UserId != request.UserId)
            return Result.Failure(HouseholdBudgetErrors.CategoryAccessDenied);

        category.Update(request.Name, request.Color, request.Icon, request.Type);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
