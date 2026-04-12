using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.HouseholdBudget.Application.Commands;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.HouseholdBudget.Api;

[ApiController]
[Route("api/v1/budgets")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class BudgetController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpPut]
    [ProducesResponseType(typeof(BudgetUpsertedResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Upsert(
        [FromBody] UpsertBudgetRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpsertBudgetCommand(
                CurrentUserId,
                request.CategoryId,
                request.Year,
                request.Month,
                request.LimitAmount,
                request.Currency),
            cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record UpsertBudgetRequest(
    Guid? CategoryId,
    int Year,
    int Month,
    decimal LimitAmount,
    string Currency);
