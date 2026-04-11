namespace MoroccanWallet.Modules.Identity.Application.Services;

public interface ITokenGenerator
{
    /// <summary>
    /// Generates a cryptographically random token.
    /// Returns (rawToken, sha256Hash) — store the hash, send the raw to client.
    /// </summary>
    (string RawToken, string TokenHash) GenerateSecureToken();

    string HashToken(string rawToken);
}
