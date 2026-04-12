using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

public sealed class PriceEntry : AggregateRoot
{
    private PriceEntry() { }

    public Guid ProductId { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public string? StoreName { get; private set; }
    public string? StoreLocation { get; private set; }
    public DateTime ObservedAt { get; private set; }

    public static PriceEntry Create(
        Guid productId,
        Guid userId,
        decimal price,
        string currency,
        string? storeName,
        string? storeLocation,
        DateTime observedAt)
    {
        return new PriceEntry
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            UserId = userId,
            Price = price,
            Currency = currency,
            StoreName = storeName?.Trim(),
            StoreLocation = storeLocation?.Trim(),
            ObservedAt = observedAt.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
