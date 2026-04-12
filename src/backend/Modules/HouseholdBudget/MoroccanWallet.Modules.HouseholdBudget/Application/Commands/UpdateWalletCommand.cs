using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record UpdateWalletCommand(
    Guid UserId,
    Guid WalletId,
    string Name,
    WalletType Type,
    string Currency,
    decimal CurrentBalance,
    string? Color,
    string? Icon,
    bool IsArchived) : ICommand;

public sealed class UpdateWalletCommandValidator : AbstractValidator<UpdateWalletCommand>
{
    public UpdateWalletCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CurrentBalance).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateWalletCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<UpdateWalletCommand>
{
    public async Task<Result> Handle(UpdateWalletCommand request, CancellationToken cancellationToken)
    {
        var wallet = await db.Wallets.FirstOrDefaultAsync(w => w.Id == request.WalletId, cancellationToken);
        if (wallet is null)
            return Result.Failure(HouseholdBudgetErrors.WalletNotFound);

        if (wallet.UserId != request.UserId)
            return Result.Failure(HouseholdBudgetErrors.WalletAccessDenied);

        wallet.Update(request.Name, request.Type, request.Currency, request.CurrentBalance, request.Color, request.Icon, request.IsArchived);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
