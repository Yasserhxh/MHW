using Microsoft.AspNetCore.Http;

namespace MoroccanWallet.Shared.Infrastructure.Middleware;

/// <summary>
/// Adds security-relevant HTTP response headers to every response.
/// Must be registered before UseAuthentication/UseAuthorization.
/// </summary>
public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // Prevent MIME-type sniffing
        headers["X-Content-Type-Options"] = "nosniff";

        // Disallow framing (clickjacking protection)
        headers["X-Frame-Options"] = "DENY";

        // Control referrer leakage
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Disable legacy XSS filter (modern browsers ignore it; disabling prevents bypass bugs)
        headers["X-XSS-Protection"] = "0";

        // Restrict browser features not needed by this API
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

        // Remove Server header leakage (belt-and-suspenders — Kestrel can suppress it in config)
        headers.Remove("Server");

        await next(context);
    }
}
