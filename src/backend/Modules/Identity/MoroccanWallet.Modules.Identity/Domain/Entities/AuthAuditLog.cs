namespace MoroccanWallet.Modules.Identity.Domain.Entities;

public sealed class AuthAuditLog
{
    private AuthAuditLog() { }

    public long Id { get; private set; }
    public Guid? UserId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? MetadataJson { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public User? User { get; private set; }

    public static AuthAuditLog Create(
        Guid? userId,
        string eventType,
        string? ipAddress = null,
        string? metadataJson = null)
    {
        return new AuthAuditLog
        {
            UserId = userId,
            EventType = eventType,
            IpAddress = ipAddress,
            MetadataJson = metadataJson,
            CreatedAt = DateTime.UtcNow
        };
    }
}
