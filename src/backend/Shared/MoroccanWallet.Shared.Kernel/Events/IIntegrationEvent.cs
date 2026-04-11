using MediatR;

namespace MoroccanWallet.Shared.Kernel.Events;

/// <summary>
/// Cross-module events. Published after the transaction commits.
/// </summary>
public interface IIntegrationEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredAt { get; }
}
