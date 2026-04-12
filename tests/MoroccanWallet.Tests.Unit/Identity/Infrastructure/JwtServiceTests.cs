using Microsoft.Extensions.Options;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;

namespace MoroccanWallet.Tests.Unit.Identity.Infrastructure;

public sealed class JwtServiceTests
{
    [Fact]
    public void GenerateAccessToken_UsesConfiguredExpiryWindow()
    {
        var options = Options.Create(new JwtOptions
        {
            SecretKey = "this-is-a-valid-test-secret-key-with-32-chars+",
            Issuer = "moroccan-wallet-tests",
            Audience = "moroccan-wallet-clients",
            AccessTokenExpiryMinutes = 15
        });

        var service = new JwtService(options);
        var now = DateTime.UtcNow;

        var token = service.GenerateAccessToken(Guid.NewGuid(), "amina@example.com");

        token.Token.Should().NotBeNullOrWhiteSpace();
        token.ExpiresAt.Should().BeAfter(now.AddMinutes(14));
        token.ExpiresAt.Should().BeBefore(now.AddMinutes(16));
    }
}
