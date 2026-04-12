using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MoroccanWallet.Modules.HouseholdBudget.Application.Commands;
using MoroccanWallet.Modules.HouseholdBudget.Application.Queries;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.HouseholdBudget.Api;

[ApiController]
[Route("api/v1/wallets")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class WalletsController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<WalletDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetWallets([FromQuery] bool includeArchived = false, CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetWalletsQuery(CurrentUserId, includeArchived), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(WalletDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetWallet(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetWalletByIdQuery(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(WalletCreatedResponse), StatusCodes.Status201Created)]
    public async Task<IResult> Create([FromBody] CreateWalletRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateWalletCommand(CurrentUserId, request.Name, request.Type, request.Currency, request.CurrentBalance, request.Color, request.Icon),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/wallets/{result.Value?.Id}");
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Update(Guid id, [FromBody] UpdateWalletRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateWalletCommand(CurrentUserId, id, request.Name, request.Type, request.Currency, request.CurrentBalance, request.Color, request.Icon, request.IsArchived),
            cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record CreateWalletRequest(
    string Name,
    WalletType Type,
    string Currency,
    decimal CurrentBalance,
    string? Color,
    string? Icon);

public sealed record UpdateWalletRequest(
    string Name,
    WalletType Type,
    string Currency,
    decimal CurrentBalance,
    string? Color,
    string? Icon,
    bool IsArchived);
