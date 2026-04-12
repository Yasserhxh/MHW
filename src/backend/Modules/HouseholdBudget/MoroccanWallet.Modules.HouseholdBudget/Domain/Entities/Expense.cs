using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

public sealed class Expense : AggregateRoot
{
    private Expense() { }

    public Guid UserId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public string Description { get; private set; } = string.Empty;
    public string? Notes { get; private set; }
    public DateTime Date { get; private set; }
    public bool IsRecurring { get; private set; }
    public string? Tags { get; private set; }

    public static Expense Create(
        Guid userId,
        Guid? categoryId,
        decimal amount,
        string currency,
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
            Amount = amount,
            Currency = currency,
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
        decimal amount,
        string currency,
        string description,
        string? notes,
        DateTime date,
        bool isRecurring,
        string? tags)
    {
        CategoryId = categoryId;
        Amount = amount;
        Currency = currency;
        Description = description.Trim();
        Notes = notes?.Trim();
        Date = date.Date;
        IsRecurring = isRecurring;
        Tags = tags;
        Touch();
    }
}
