using System.Security.Claims;

namespace MoroccanWallet.Shared.Infrastructure.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetRequiredUserId(this ClaimsPrincipal principal)
    {
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        return Guid.TryParse(subject, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Authenticated user identifier is missing or invalid.");
    }
}
