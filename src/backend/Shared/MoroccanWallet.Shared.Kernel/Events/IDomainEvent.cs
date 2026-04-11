using MediatR;

namespace MoroccanWallet.Shared.Kernel.Events;

public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}
