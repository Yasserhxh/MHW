using System.Text.Json;
using Microsoft.AspNetCore.Http;
using MoroccanWallet.Modules.Identity.Application.Services;
using MoroccanWallet.Modules.Identity.Domain.Entities;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Services;

public sealed class AuthAuditLogger(
    IdentityDbContext db,
    IHttpContextAccessor httpContextAccessor) : IAuthAuditLogger
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
        var httpContext = httpContextAccessor.HttpContext;
        var resolvedIpAddress = ipAddress ?? httpContext?.Connection.RemoteIpAddress?.ToString();
        var resolvedUserAgent = httpContext?.Request.Headers.UserAgent.ToString();

        if (!string.IsNullOrWhiteSpace(resolvedUserAgent) && resolvedUserAgent.Length > 512)
        {
            resolvedUserAgent = resolvedUserAgent[..512];
        }

        var log = AuthAuditLog.Create(userId, eventType, resolvedIpAddress, resolvedUserAgent, metadataJson);
        db.AuthAuditLogs.Add(log);
        await db.SaveChangesAsync(cancellationToken);
    }
}
