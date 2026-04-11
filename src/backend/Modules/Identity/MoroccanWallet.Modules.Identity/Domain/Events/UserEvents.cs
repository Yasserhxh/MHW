using MoroccanWallet.Shared.Kernel.Events;

namespace MoroccanWallet.Modules.Identity.Domain.Events;

public sealed record UserRegisteredEvent(Guid UserId, string Email) : DomainEventBase;
public sealed record UserEmailVerifiedEvent(Guid UserId) : DomainEventBase;
public sealed record UserPasswordChangedEvent(Guid UserId) : DomainEventBase;
public sealed record UserLoggedInEvent(Guid UserId, string IpAddress) : DomainEventBase;
