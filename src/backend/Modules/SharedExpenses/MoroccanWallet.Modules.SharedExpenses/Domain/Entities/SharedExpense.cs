using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

public enum SplitType { Equal, Custom }

public sealed class SharedExpense : AggregateRoot
{
    private readonly List<ExpenseSplit> _splits = [];

    private SharedExpense() { }

    public Guid GroupId { get; private set; }
    public Guid PaidById { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public string Description { get; private set; } = string.Empty;
    public DateTime Date { get; private set; }
    public SplitType SplitType { get; private set; }

    public IReadOnlyList<ExpenseSplit> Splits => _splits.AsReadOnly();

    public static SharedExpense Create(
        Guid groupId,
        Guid paidById,
        decimal amount,
        string currency,
        string description,
        DateTime date,
        SplitType splitType,
        IEnumerable<(Guid UserId, decimal Amount)> splits)
    {
        var expense = new SharedExpense
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            PaidById = paidById,
            Amount = amount,
            Currency = currency,
            Description = description.Trim(),
            Date = date.Date,
            SplitType = splitType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var (userId, splitAmount) in splits)
            expense._splits.Add(ExpenseSplit.Create(expense.Id, userId, splitAmount));

        return expense;
    }
}
