using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.SharedExpenses.Application.Commands;
using MoroccanWallet.Modules.SharedExpenses.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.SharedExpenses.Api;

[ApiController]
[Route("api/v1/groups")]
[Route("api/v1/shared-expenses/groups")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class SharedGroupsController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<GroupSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetMyGroups(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetGroupsQuery(CurrentUserId), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GroupDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetGroup(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetGroupByIdQuery(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}/balances")]
    [ProducesResponseType(typeof(GroupBalancesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetBalances(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetGroupBalancesQuery(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}/expenses")]
    [ProducesResponseType(typeof(PagedResult<SharedExpenseDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetGroupExpenses(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetGroupExpensesQuery(CurrentUserId, id, page, Math.Clamp(pageSize, 1, 100)),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(GroupCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> CreateGroup(
        [FromBody] CreateGroupRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateGroupCommand(CurrentUserId, request.Name, request.Description, request.Currency),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/groups/{result.Value?.Id}");
    }

    [HttpPost("{id:guid}/members")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> AddMember(
        Guid id,
        [FromBody] AddMemberRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new AddGroupMemberCommand(CurrentUserId, id, request.UserId),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("{id:guid}/expenses")]
    [ProducesResponseType(typeof(SharedExpenseCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> AddExpense(
        Guid id,
        [FromBody] CreateSharedExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateSharedExpenseCommand(
                CurrentUserId,
                id,
                request.Amount,
                request.Currency,
                request.Description,
                request.Date,
                request.SplitType,
                request.Splits),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/groups/{id}/expenses/{result.Value?.Id}");
    }

    [HttpGet("/api/v1/shared-expenses")]
    [ProducesResponseType(typeof(PagedResult<SharedExpenseDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetSharedExpenses(
        [FromQuery] Guid groupId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetGroupExpensesQuery(CurrentUserId, groupId, page, Math.Clamp(pageSize, 1, 100)),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("/api/v1/shared-expenses/{id:guid}")]
    [ProducesResponseType(typeof(SharedExpenseDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetSharedExpense(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetSharedExpenseByIdQuery(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("/api/v1/shared-expenses")]
    [ProducesResponseType(typeof(SharedExpenseCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> AddSharedExpense(
        [FromBody] CreateSharedExpenseRootRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateSharedExpenseCommand(
                CurrentUserId,
                request.GroupId,
                request.Amount,
                request.Currency,
                request.Description,
                request.Date,
                request.SplitType,
                request.Splits),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/shared-expenses/{result.Value?.Id}");
    }

    [HttpPost("/api/v1/shared-expenses/settlements")]
    [ProducesResponseType(typeof(SettlementCreatedResponse), StatusCodes.Status201Created)]
    public async Task<IResult> CreateSettlement(
        [FromBody] CreateSettlementRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateSettlementCommand(
                CurrentUserId,
                request.GroupId,
                request.FromUserId,
                request.ToUserId,
                request.Amount,
                request.Currency,
                request.SettledOn,
                request.Notes),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/shared-expenses/settlements/{result.Value?.Id}");
    }
}

public sealed record CreateGroupRequest(string Name, string? Description, string Currency);
public sealed record AddMemberRequest(Guid UserId);
public sealed record CreateSharedExpenseRequest(
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    Domain.Entities.SplitType SplitType,
    IReadOnlyList<SplitEntryDto> Splits);

public sealed record CreateSharedExpenseRootRequest(
    Guid GroupId,
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    Domain.Entities.SplitType SplitType,
    IReadOnlyList<SplitEntryDto> Splits);

public sealed record CreateSettlementRequest(
    Guid GroupId,
    Guid FromUserId,
    Guid ToUserId,
    decimal Amount,
    string Currency,
    DateTime SettledOn,
    string? Notes);
