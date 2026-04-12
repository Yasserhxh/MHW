using MoroccanWallet.Modules.Identity.Application.Services;

namespace MoroccanWallet.Modules.Identity.Infrastructure.Services;

/// <summary>
/// BCrypt password hasher. Work factor 12 is production-safe (≈250ms on modern hardware).
/// </summary>
public sealed class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    // Pre-computed at startup once. Used by VerifyWithFallback when no real hash exists,
    // so that BCrypt.Verify always runs the full O(2^workfactor) path regardless of
    // whether the account exists — prevents timing-based account enumeration.
    internal static readonly string DummyHash =
        BCrypt.Net.BCrypt.HashPassword("__mhw_timing_guard__", workFactor: WorkFactor);

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    public bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);

    public bool VerifyWithFallback(string password, string? hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash ?? DummyHash);
}
