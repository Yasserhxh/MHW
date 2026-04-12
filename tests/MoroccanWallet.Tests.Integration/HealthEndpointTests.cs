using Microsoft.AspNetCore.Mvc.Testing;

namespace MoroccanWallet.Tests.Integration;

public sealed class HealthEndpointTests : IClassFixture<AuthIntegrationFactory>
{
    private readonly AuthIntegrationFactory _factory;

    public HealthEndpointTests(AuthIntegrationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.GetAsync("/health");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var payload = await response.Content.ReadAsStringAsync();
        payload.Should().Contain("healthy");
    }
}
