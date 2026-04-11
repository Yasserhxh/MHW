namespace MoroccanWallet.Modules.Identity.Application.Services;

public interface IAuthAuditLogger
{
    Task LogAsync(
        Guid? userId,
        string eventType,
        object? metadata = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);
}
