using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record UpsertBudgetCommand(
    Guid UserId,
    Guid? CategoryId,
    int Year,
    int Month,
    decimal LimitAmount,
    string Currency) : ICommand<BudgetUpsertedResponse>;

public sealed record BudgetUpsertedResponse(Guid Id, decimal LimitAmount);

public sealed class UpsertBudgetCommandValidator : AbstractValidator<UpsertBudgetCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public UpsertBudgetCommandValidator()
    {
        RuleFor(x => x.LimitAmount).GreaterThan(0).LessThanOrEqualTo(10_000_000);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c));
        RuleFor(x => x.Year).InclusiveBetween(2020, 2100);
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
    }
}

public sealed class UpsertBudgetCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<UpsertBudgetCommand, BudgetUpsertedResponse>
{
    public async Task<Result<BudgetUpsertedResponse>> Handle(
        UpsertBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var existing = await db.MonthlyBudgets
            .FirstOrDefaultAsync(b =>
                b.UserId == request.UserId
                && b.Year == request.Year
                && b.Month == request.Month
                && b.CategoryId == request.CategoryId,
                cancellationToken);

        if (existing is not null)
        {
            existing.UpdateLimit(request.LimitAmount);
        }
        else
        {
            existing = MonthlyBudget.Create(
                request.UserId,
                request.CategoryId,
                request.Year,
                request.Month,
                request.LimitAmount,
                request.Currency);
            db.MonthlyBudgets.Add(existing);
        }

        await db.SaveChangesAsync(cancellationToken);
        return new BudgetUpsertedResponse(existing.Id, existing.LimitAmount);
    }
}
