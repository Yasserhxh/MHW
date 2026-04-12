using FluentValidation;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record CreateCategoryCommand(
    Guid UserId,
    string Name,
    string Color,
    string Icon,
    CategoryType Type) : ICommand<CategoryCreatedResponse>;

public sealed record CategoryCreatedResponse(Guid Id, string Name);

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20)
            .Matches("^#[0-9a-fA-F]{6}$").WithMessage("Color must be a valid hex color (e.g. #6366f1).");
        RuleFor(x => x.Icon).NotEmpty().MaximumLength(50);
    }
}

public sealed class CreateCategoryCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<CreateCategoryCommand, CategoryCreatedResponse>
{
    public async Task<Result<CategoryCreatedResponse>> Handle(
        CreateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = ExpenseCategory.Create(
            request.UserId,
            request.Name,
            request.Color,
            request.Icon,
            request.Type);

        db.ExpenseCategories.Add(category);
        await db.SaveChangesAsync(cancellationToken);

        return new CategoryCreatedResponse(category.Id, category.Name);
    }
}
