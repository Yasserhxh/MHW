using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Identity.Domain.Entities;

namespace MoroccanWallet.Tests.Integration;

public sealed class AuthEndpointsTests
{
    [Fact]
    public async Task Register_LoginVerifyAndRefreshFlow_WorksEndToEnd()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        var registerResponse = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email = "amina@example.com",
            password = "Password123"
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var preVerifyLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "Password123"
        });
        preVerifyLogin.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var verifyToken = factory.EmailSender.GetLatestToken("Verify your email: ");
        var verifyResponse = await client.PostAsJsonAsync("/api/v1/auth/verify-email", new { token = verifyToken });
        verifyResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "Password123"
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        loginPayload.Should().NotBeNull();

        var refreshResponse = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
        {
            refreshToken = loginPayload!.RefreshToken
        });
        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        await factory.MutateIdentityDbAsync(async db =>
        {
            (await db.AuthAuditLogs.CountAsync()).Should().BeGreaterThan(0);
        });
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "missing@example.com",
            password = "Password123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "WrongPassword123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithInactiveUser_ReturnsUnauthorized()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        await factory.MutateIdentityDbAsync(async db =>
        {
            var user = await db.Users.SingleAsync();
            db.Entry(user).Property(nameof(User.IsActive)).CurrentValue = false;
        });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "Password123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task VerifyEmail_WithInvalidOrExpiredToken_ReturnsUnauthorized()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();

        var invalidResponse = await client.PostAsJsonAsync("/api/v1/auth/verify-email", new { token = "bad-token" });
        invalidResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        await client.PostAsJsonAsync("/api/v1/auth/register", new { email = "amina@example.com", password = "Password123" });
        await factory.MutateIdentityDbAsync(async db =>
        {
            var token = await db.EmailVerificationTokens.SingleAsync();
            db.Entry(token).Property(nameof(EmailVerificationToken.ExpiresAt)).CurrentValue = DateTime.UtcNow.AddMinutes(-5);
        });

        var verifyToken = factory.EmailSender.GetLatestToken("Verify your email: ");
        var expiredResponse = await client.PostAsJsonAsync("/api/v1/auth/verify-email", new { token = verifyToken });
        expiredResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ForgotAndResetPassword_WorksAndRevokesExistingSessions()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "Password123"
        });
        var loginPayload = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();

        var forgotResponse = await client.PostAsJsonAsync("/api/v1/auth/forgot-password", new { email = "amina@example.com" });
        forgotResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var resetToken = factory.EmailSender.GetLatestToken("Password reset token: ");
        var resetResponse = await client.PostAsJsonAsync("/api/v1/auth/reset-password", new
        {
            token = resetToken,
            newPassword = "NewPassword123"
        });
        resetResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var oldLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "Password123"
        });
        oldLogin.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var newLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "amina@example.com",
            password = "NewPassword123"
        });
        newLogin.StatusCode.Should().Be(HttpStatusCode.OK);

        var refreshAfterReset = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
        {
            refreshToken = loginPayload!.RefreshToken
        });
        refreshAfterReset.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ResetPassword_WithInvalidOrExpiredToken_ReturnsUnauthorized()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        var invalidResponse = await client.PostAsJsonAsync("/api/v1/auth/reset-password", new
        {
            token = "bad-token",
            newPassword = "NewPassword123"
        });
        invalidResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        await client.PostAsJsonAsync("/api/v1/auth/forgot-password", new { email = "amina@example.com" });
        await factory.MutateIdentityDbAsync(async db =>
        {
            var token = await db.PasswordResetTokens.OrderByDescending(t => t.CreatedAt).FirstAsync();
            db.Entry(token).Property(nameof(PasswordResetToken.ExpiresAt)).CurrentValue = DateTime.UtcNow.AddMinutes(-1);
        });

        var expiredToken = factory.EmailSender.GetLatestToken("Password reset token: ");
        var expiredResponse = await client.PostAsJsonAsync("/api/v1/auth/reset-password", new
        {
            token = expiredToken,
            newPassword = "AnotherPassword123"
        });
        expiredResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshToken_RotationDetectsReuseAndCompromisesFamily()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        var loginPayload = await LoginAsync(client, "amina@example.com", "Password123");

        var rotatedResponse = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
        {
            refreshToken = loginPayload.RefreshToken
        });
        rotatedResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var rotatedPayload = await rotatedResponse.Content.ReadFromJsonAsync<AuthResponse>();

        var reusedOldToken = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
        {
            refreshToken = loginPayload.RefreshToken
        });
        reusedOldToken.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var familyNowRevoked = await client.PostAsJsonAsync("/api/v1/auth/refresh", new
        {
            refreshToken = rotatedPayload!.RefreshToken
        });
        familyNowRevoked.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task LogoutAndLogoutAll_InvalidateSessions()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        await RegisterAndVerifyAsync(client, factory, "amina@example.com", "Password123");

        var firstLogin = await LoginAsync(client, "amina@example.com", "Password123");
        var secondLogin = await LoginAsync(client, "amina@example.com", "Password123");

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", firstLogin.AccessToken);
        var logoutResponse = await client.PostAsJsonAsync("/api/v1/auth/logout", new { refreshToken = firstLogin.RefreshToken });
        logoutResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var revokedCurrentSession = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken = firstLogin.RefreshToken });
        revokedCurrentSession.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var logoutAllResponse = await client.PostAsync("/api/v1/auth/logout-all", null);
        logoutAllResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var revokedOtherSession = await client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken = secondLogin.RefreshToken });
        revokedOtherSession.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoints_RequireValidJwt()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();

        var missingAuth = await client.PostAsync("/api/v1/auth/logout-all", null);
        missingAuth.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "malformed.jwt.token");
        var malformedAuth = await client.PostAsync("/api/v1/auth/logout-all", null);
        malformedAuth.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AuthSensitiveRateLimiting_TriggersOnRepeatedLoginAttempts()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.10");

        HttpResponseMessage? lastResponse = null;
        for (var i = 0; i < 11; i++)
        {
            lastResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = "missing@example.com",
                password = "Password123"
            });
        }

        lastResponse.Should().NotBeNull();
        lastResponse!.StatusCode.Should().Be((HttpStatusCode)429);
    }

    private static async Task RegisterAndVerifyAsync(HttpClient client, AuthIntegrationFactory factory, string email, string password)
    {
        await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password });
        var verifyToken = factory.EmailSender.GetLatestToken("Verify your email: ");
        var verifyResponse = await client.PostAsJsonAsync("/api/v1/auth/verify-email", new { token = verifyToken });
        verifyResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private static async Task<AuthResponse> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password });
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    private sealed record AuthResponse(
        string AccessToken,
        string RefreshToken,
        DateTime AccessTokenExpiresAt,
        Guid UserId,
        string Email);
}
