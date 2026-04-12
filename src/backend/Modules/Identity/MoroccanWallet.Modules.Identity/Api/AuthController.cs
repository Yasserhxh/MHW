using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MoroccanWallet.Modules.Identity.Application.Commands;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.Identity.Api;

[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("register")]
    [EnableRateLimiting(RateLimitPolicies.AuthSensitive)]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new RegisterCommand(request.Email, request.Password),
            cancellationToken);

        return result.ToCreatedResult($"/api/v1/users/me");
    }

    [HttpPost("verify-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IResult> VerifyEmail(
        [FromBody] VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new VerifyEmailCommand(request.Token),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var deviceHint = Request.Headers.UserAgent.ToString()[..Math.Min(200, Request.Headers.UserAgent.ToString().Length)];

        var result = await mediator.Send(
            new LoginCommand(request.Email, request.Password, deviceHint, ipAddress),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IResult> Refresh(
        [FromBody] RefreshRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new RefreshTokenCommand(request.RefreshToken),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting(RateLimitPolicies.AuthSensitive)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ForgotPasswordCommand(request.Email),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ResetPasswordCommand(request.Token, request.NewPassword),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IResult> Logout(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")!);

        var result = await mediator.Send(
            new LogoutCommand(request.RefreshToken, userId),
            cancellationToken);

        return result.ToHttpResult();
    }

    [HttpPost("logout-all")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IResult> LogoutAll(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")!);

        var result = await mediator.Send(new LogoutAllCommand(userId), cancellationToken);

        return result.ToHttpResult();
    }
}

// Request DTOs
public sealed record RegisterRequest(string Email, string Password);
public sealed record VerifyEmailRequest(string Token);
public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshRequest(string RefreshToken);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Token, string NewPassword);
public sealed record LogoutRequest(string RefreshToken);
