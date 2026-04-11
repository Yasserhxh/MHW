namespace MoroccanWallet.Modules.Identity.Application.Services;

public interface IJwtService
{
    JwtToken GenerateAccessToken(Guid userId, string email);
}

public sealed record JwtToken(string Token, DateTime ExpiresAt);
