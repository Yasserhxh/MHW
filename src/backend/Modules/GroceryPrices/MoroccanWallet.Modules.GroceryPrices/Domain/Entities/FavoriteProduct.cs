using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

public sealed class FavoriteProduct : Entity
{
    private FavoriteProduct() { }

    public Guid UserId { get; private set; }
    public Guid ProductId { get; private set; }
    public DateTime AddedAt { get; private set; }

    public static FavoriteProduct Create(Guid userId, Guid productId)
    {
        return new FavoriteProduct
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = productId,
            AddedAt = DateTime.UtcNow
        };
    }
}
