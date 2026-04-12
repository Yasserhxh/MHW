using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.Notifications.Application.Commands;
using MoroccanWallet.Modules.Notifications.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.Notifications.Api;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class NotificationsController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => User.GetRequiredUserId();

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetNotifications(
        [FromQuery] bool? isRead = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetNotificationsQuery(CurrentUserId, Math.Max(page, 1), Math.Clamp(pageSize, 1, 100), isRead),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountResponse), StatusCodes.Status200OK)]
    public async Task<IResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetUnreadCountQuery(CurrentUserId), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new MarkNotificationReadCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost("read-all")]
    [HttpPost("mark-all-read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new MarkAllReadCommand(CurrentUserId), cancellationToken);
        return result.ToHttpResult();
    }
}
