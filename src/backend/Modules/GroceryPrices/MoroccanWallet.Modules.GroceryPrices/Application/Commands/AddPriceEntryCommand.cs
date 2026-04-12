using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;
using MoroccanWallet.Modules.GroceryPrices.Domain.Errors;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Commands;

public sealed record AddPriceEntryCommand(
    Guid UserId,
    Guid ProductId,
    decimal Price,
    string Currency,
    string? StoreName,
    string? StoreLocation,
    DateTime ObservedAt) : ICommand<PriceEntryCreatedResponse>;

public sealed record PriceEntryCreatedResponse(Guid Id);

public sealed class AddPriceEntryCommandValidator : AbstractValidator<AddPriceEntryCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public AddPriceEntryCommandValidator()
    {
        RuleFor(x => x.Price).GreaterThan(0).LessThanOrEqualTo(100_000);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c));
        RuleFor(x => x.StoreName).MaximumLength(200).When(x => x.StoreName is not null);
        RuleFor(x => x.StoreLocation).MaximumLength(500).When(x => x.StoreLocation is not null);
    }
}

public sealed class AddPriceEntryCommandHandler(GroceryPricesDbContext db)
    : ICommandHandler<AddPriceEntryCommand, PriceEntryCreatedResponse>
{
    public async Task<Result<PriceEntryCreatedResponse>> Handle(
        AddPriceEntryCommand request,
        CancellationToken cancellationToken)
    {
        var productExists = await db.Products
            .AnyAsync(p => p.Id == request.ProductId, cancellationToken);

        if (!productExists)
            return Result.Failure<PriceEntryCreatedResponse>(GroceryPricesErrors.ProductNotFound);

        var entry = PriceEntry.Create(
            request.ProductId,
            request.UserId,
            request.Price,
            request.Currency,
            request.StoreName,
            request.StoreLocation,
            request.ObservedAt);

        db.PriceEntries.Add(entry);
        await db.SaveChangesAsync(cancellationToken);

        return new PriceEntryCreatedResponse(entry.Id);
    }
}
