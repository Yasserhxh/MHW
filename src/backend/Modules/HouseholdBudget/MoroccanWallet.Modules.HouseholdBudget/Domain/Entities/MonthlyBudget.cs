using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

public sealed class MonthlyBudget : AggregateRoot
{
    private MonthlyBudget() { }

    public Guid UserId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public int Year { get; private set; }
    public int Month { get; private set; }
    public decimal LimitAmount { get; private set; }
    public string Currency { get; private set; } = "MAD";

    public static MonthlyBudget Create(
        Guid userId,
        Guid? categoryId,
        int year,
        int month,
        decimal limitAmount,
        string currency)
    {
        return new MonthlyBudget
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = categoryId,
            Year = year,
            Month = month,
            LimitAmount = limitAmount,
            Currency = currency,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void UpdateLimit(decimal limitAmount)
    {
        LimitAmount = limitAmount;
        Touch();
    }
}
