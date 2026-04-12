using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;
using MoroccanWallet.Modules.GroceryPrices.Domain.Errors;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Commands;

public sealed record ToggleFavoriteCommand(Guid UserId, Guid ProductId) : ICommand<ToggleFavoriteResponse>;

public sealed record ToggleFavoriteResponse(bool IsFavorite);

public sealed class ToggleFavoriteCommandHandler(GroceryPricesDbContext db)
    : ICommandHandler<ToggleFavoriteCommand, ToggleFavoriteResponse>
{
    public async Task<Result<ToggleFavoriteResponse>> Handle(
        ToggleFavoriteCommand request,
        CancellationToken cancellationToken)
    {
        var productExists = await db.Products
            .AnyAsync(p => p.Id == request.ProductId, cancellationToken);

        if (!productExists)
            return Result.Failure<ToggleFavoriteResponse>(GroceryPricesErrors.ProductNotFound);

        var existing = await db.FavoriteProducts
            .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.ProductId == request.ProductId, cancellationToken);

        if (existing is not null)
        {
            db.FavoriteProducts.Remove(existing);
            await db.SaveChangesAsync(cancellationToken);
            return new ToggleFavoriteResponse(false);
        }

        db.FavoriteProducts.Add(FavoriteProduct.Create(request.UserId, request.ProductId));
        await db.SaveChangesAsync(cancellationToken);
        return new ToggleFavoriteResponse(true);
    }
}
