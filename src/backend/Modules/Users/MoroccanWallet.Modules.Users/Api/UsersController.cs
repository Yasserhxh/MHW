using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.Users.Application.Commands;
using MoroccanWallet.Modules.Users.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.Users.Api;

[ApiController]
[Route("api/v1/users")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class UsersController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetMyProfileQuery(CurrentUserId), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileUpdatedResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> UpdateMyProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateProfileCommand(
                CurrentUserId,
                request.DisplayName,
                request.AvatarUrl,
                request.PreferredCurrency,
                request.Language,
                request.Timezone),
            cancellationToken);

        return result.ToHttpResult();
    }
}

public sealed record UpdateProfileRequest(
    string DisplayName,
    string? AvatarUrl,
    string PreferredCurrency,
    string Language,
    string Timezone);
