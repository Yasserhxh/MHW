using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.Reminders.Application.Commands;
using MoroccanWallet.Modules.Reminders.Application.Queries;
using MoroccanWallet.Modules.Reminders.Domain.Entities;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.Reminders.Api;

[ApiController]
[Route("api/v1/reminders")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class RemindersController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ReminderDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetReminders(
        [FromQuery] bool? isCompleted = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetRemindersQuery(CurrentUserId, isCompleted, page, Math.Clamp(pageSize, 1, 100)),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(ReminderCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Create(
        [FromBody] CreateReminderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateReminderCommand(
                CurrentUserId,
                request.Title,
                request.Description,
                request.DueDate,
                request.Frequency),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/reminders/{result.Value?.Id}");
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Update(
        Guid id,
        [FromBody] UpdateReminderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateReminderCommand(
                CurrentUserId,
                id,
                request.Title,
                request.Description,
                request.DueDate,
                request.Frequency),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CompleteReminderCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteReminderCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record CreateReminderRequest(
    string Title,
    string? Description,
    DateTime DueDate,
    ReminderFrequency Frequency);

public sealed record UpdateReminderRequest(
    string Title,
    string? Description,
    DateTime DueDate,
    ReminderFrequency Frequency);
