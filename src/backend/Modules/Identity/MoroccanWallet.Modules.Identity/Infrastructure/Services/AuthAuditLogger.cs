using System.Text.Json;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Services;

public sealed class AuthAuditLogger(IdentityDbContext db) : IAuthAuditLogger
{
    public async Task LogAsync(
        Guid? userId,
        string eventType,
        object? metadata = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        var metadataJson = metadata is not null
            ? JsonSerializer.Serialize(metadata)
            : null;

        var log = AuthAuditLog.Create(userId, eventType, ipAddress, metadataJson);
        db.AuthAuditLogs.Add(log);
        await db.SaveChangesAsync(cancellationToken);
    }
}
