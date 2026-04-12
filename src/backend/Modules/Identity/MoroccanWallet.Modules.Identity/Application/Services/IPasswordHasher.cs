namespace MoroccanWallet.Modules.Identity.Application.Services;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);

    /// <summary>
    /// Always runs the full BCrypt verification path regardless of whether
    /// <paramref name="hash"/> is null. Use this in authentication flows
    /// to prevent timing-based account enumeration.
    /// </summary>
    bool VerifyWithFallback(string password, string? hash);
}
