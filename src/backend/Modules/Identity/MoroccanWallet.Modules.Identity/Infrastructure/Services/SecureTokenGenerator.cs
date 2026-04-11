using System.Security.Cryptography;
using System.Text;
using MoroccanWallet.Modules.Identity.Application.Services;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Services;

public sealed class SecureTokenGenerator : ITokenGenerator
{
    public (string RawToken, string TokenHash) GenerateSecureToken()
    {
        var randomBytes = new byte[32];
        RandomNumberGenerator.Fill(randomBytes);
        var rawToken = Convert.ToBase64String(randomBytes)
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        return (rawToken, HashToken(rawToken));
    }

    public string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
