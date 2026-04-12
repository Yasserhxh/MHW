using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

public enum TransactionType
{
    Expense = 1,
    Income = 2
}

public sealed class Expense : AggregateRoot
{
    private Expense() { }

    public Guid UserId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Guid? WalletId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public TransactionType Type { get; private set; } = TransactionType.Expense;
    public string? PaymentMethod { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string? Notes { get; private set; }
    public DateTime Date { get; private set; }
    public bool IsRecurring { get; private set; }
    public string? Tags { get; private set; }

    public static Expense Create(
        Guid userId,
        Guid? categoryId,
        Guid? walletId,
        decimal amount,
        string currency,
        TransactionType type,
        string? paymentMethod,
        string description,
        string? notes,
        DateTime date,
        bool isRecurring,
        string? tags)
    {
        return new Expense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = categoryId,
            WalletId = walletId,
            Amount = amount,
            Currency = currency,
            Type = type,
            PaymentMethod = paymentMethod?.Trim(),
            Description = description.Trim(),
            Notes = notes?.Trim(),
            Date = date.Date,
            IsRecurring = isRecurring,
            Tags = tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        Guid? categoryId,
        Guid? walletId,
        decimal amount,
        string currency,
        TransactionType type,
        string? paymentMethod,
        string description,
        string? notes,
        DateTime date,
        bool isRecurring,
        string? tags)
    {
        CategoryId = categoryId;
        WalletId = walletId;
        Amount = amount;
        Currency = currency;
        Type = type;
        PaymentMethod = paymentMethod?.Trim();
        Description = description.Trim();
        Notes = notes?.Trim();
        Date = date.Date;
        IsRecurring = isRecurring;
        Tags = tags;
        Touch();
    }
}
