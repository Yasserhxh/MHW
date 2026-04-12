using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Commands;

public sealed record RemoveFavoriteCommand(Guid UserId, Guid ProductId) : ICommand;

public sealed class RemoveFavoriteCommandHandler(GroceryPricesDbContext db)
    : ICommandHandler<RemoveFavoriteCommand>
{
    public async Task<Result> Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
    {
        var favorite = await db.FavoriteProducts
            .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.ProductId == request.ProductId, cancellationToken);

        if (favorite is not null)
        {
            db.FavoriteProducts.Remove(favorite);
            await db.SaveChangesAsync(cancellationToken);
        }

        return Result.Success();
    }
}
