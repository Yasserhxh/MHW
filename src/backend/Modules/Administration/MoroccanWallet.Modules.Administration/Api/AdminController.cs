using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.Administration.Application.Commands;
using MoroccanWallet.Modules.Administration.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Administration.Api;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class AdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("users")]
    [ProducesResponseType(typeof(PagedResult<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetUsersQuery(search, page, Math.Clamp(pageSize, 1, 100)),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("users/{id:guid}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> DeactivateUser(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeactivateUserCommand(id), cancellationToken);
        return result.ToHttpResult();
    }
}
