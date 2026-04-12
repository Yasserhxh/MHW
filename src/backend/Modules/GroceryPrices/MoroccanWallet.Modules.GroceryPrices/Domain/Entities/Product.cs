using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.GroceryPrices.Domain.Entities;

public sealed class Product : AggregateRoot
{
    private Product() { }

    public string Name { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public string? Unit { get; private set; }
    public string? Barcode { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public bool IsVerified { get; private set; }

    public static Product Create(Guid userId, string name, string? category, string? unit, string? barcode)
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Category = category?.Trim(),
            Unit = unit?.Trim(),
            Barcode = barcode?.Trim(),
            CreatedByUserId = userId,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Verify()
    {
        IsVerified = true;
        Touch();
    }
}
