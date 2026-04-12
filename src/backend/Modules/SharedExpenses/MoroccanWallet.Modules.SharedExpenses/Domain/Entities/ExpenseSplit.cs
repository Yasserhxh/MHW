using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

public sealed class ExpenseSplit : Entity
{
    private ExpenseSplit() { }

    public Guid SharedExpenseId { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public bool IsSettled { get; private set; }
    public DateTime? SettledAt { get; private set; }

    public static ExpenseSplit Create(Guid sharedExpenseId, Guid userId, decimal amount)
    {
        return new ExpenseSplit
        {
            Id = Guid.NewGuid(),
            SharedExpenseId = sharedExpenseId,
            UserId = userId,
            Amount = amount,
            IsSettled = false
        };
    }

    public void Settle()
    {
        IsSettled = true;
        SettledAt = DateTime.UtcNow;
    }
}
