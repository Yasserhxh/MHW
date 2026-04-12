using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

public enum WalletType
{
    Cash = 1,
    Bank = 2,
    SharedHousehold = 3,
    Savings = 4
}

public sealed class Wallet : AggregateRoot
{
    private Wallet() { }

    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public WalletType Type { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public decimal CurrentBalance { get; private set; }
    public string? Color { get; private set; }
    public string? Icon { get; private set; }
    public bool IsArchived { get; private set; }

    public static Wallet Create(
        Guid userId,
        string name,
        WalletType type,
        string currency,
        decimal currentBalance,
        string? color,
        string? icon)
    {
        return new Wallet
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name.Trim(),
            Type = type,
            Currency = currency,
            CurrentBalance = currentBalance,
            Color = color?.Trim(),
            Icon = icon?.Trim(),
            IsArchived = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string name,
        WalletType type,
        string currency,
        decimal currentBalance,
        string? color,
        string? icon,
        bool isArchived)
    {
        Name = name.Trim();
        Type = type;
        Currency = currency;
        CurrentBalance = currentBalance;
        Color = color?.Trim();
        Icon = icon?.Trim();
        IsArchived = isArchived;
        Touch();
    }
}
