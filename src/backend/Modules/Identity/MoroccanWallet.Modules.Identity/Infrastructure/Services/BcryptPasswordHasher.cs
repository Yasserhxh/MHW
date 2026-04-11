using MoroccanWallet.Modules.Identity.Application.Services;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Services;

/// <summary>
/// BCrypt password hasher. Work factor 12 is production-safe (≈250ms on modern hardware).
/// </summary>
public sealed class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    public bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
