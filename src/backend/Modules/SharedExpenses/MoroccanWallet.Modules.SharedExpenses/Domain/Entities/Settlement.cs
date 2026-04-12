using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

public sealed class Settlement : AggregateRoot
{
    private Settlement() { }

    public Guid GroupId { get; private set; }
    public Guid FromUserId { get; private set; }
    public Guid ToUserId { get; private set; }
    public Guid RecordedByUserId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "MAD";
    public DateTime SettledOn { get; private set; }
    public string? Notes { get; private set; }

    public static Settlement Create(
        Guid groupId,
        Guid fromUserId,
        Guid toUserId,
        Guid recordedByUserId,
        decimal amount,
        string currency,
        DateTime settledOn,
        string? notes)
    {
        return new Settlement
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            FromUserId = fromUserId,
            ToUserId = toUserId,
            RecordedByUserId = recordedByUserId,
            Amount = amount,
            Currency = currency,
            SettledOn = settledOn.Date,
            Notes = notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
