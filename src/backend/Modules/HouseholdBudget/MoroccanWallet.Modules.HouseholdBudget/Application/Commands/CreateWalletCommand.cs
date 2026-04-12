using FluentValidation;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Commands;

public sealed record CreateWalletCommand(
    Guid UserId,
    string Name,
    WalletType Type,
    string Currency,
    decimal CurrentBalance,
    string? Color,
    string? Icon) : ICommand<WalletCreatedResponse>;

public sealed record WalletCreatedResponse(Guid Id);

public sealed class CreateWalletCommandValidator : AbstractValidator<CreateWalletCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public CreateWalletCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c));
        RuleFor(x => x.CurrentBalance).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Color).MaximumLength(20).When(x => x.Color is not null);
        RuleFor(x => x.Icon).MaximumLength(50).When(x => x.Icon is not null);
    }
}

public sealed class CreateWalletCommandHandler(HouseholdBudgetDbContext db)
    : ICommandHandler<CreateWalletCommand, WalletCreatedResponse>
{
    public async Task<Result<WalletCreatedResponse>> Handle(CreateWalletCommand request, CancellationToken cancellationToken)
    {
        var wallet = Wallet.Create(
            request.UserId,
            request.Name,
            request.Type,
            request.Currency,
            request.CurrentBalance,
            request.Color,
            request.Icon);

        db.Wallets.Add(wallet);
        await db.SaveChangesAsync(cancellationToken);
        return new WalletCreatedResponse(wallet.Id);
    }
}
