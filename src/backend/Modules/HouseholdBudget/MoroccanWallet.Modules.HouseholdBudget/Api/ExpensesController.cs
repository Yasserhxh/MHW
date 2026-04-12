using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.HouseholdBudget.Application.Commands;
using MoroccanWallet.Modules.HouseholdBudget.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Api;

[ApiController]
[Route("api/v1/expenses")]
[Route("api/v1/transactions")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class ExpensesController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => User.GetRequiredUserId();

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ExpenseSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetExpenses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetExpensesQuery(CurrentUserId, Math.Max(page, 1), Math.Clamp(pageSize, 1, 100), categoryId, from, to, search),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ExpenseDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetExpenseByIdQuery(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ExpenseSummaryResponse), StatusCodes.Status200OK)]
    public async Task<IResult> GetSummary(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var result = await mediator.Send(
            new GetExpenseSummaryQuery(CurrentUserId, year ?? now.Year, month ?? now.Month),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(ExpenseCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Create(
        [FromBody] CreateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateExpenseCommand(
                CurrentUserId,
                request.CategoryId,
                request.WalletId,
                request.Amount,
                request.Currency,
                request.Type,
                request.PaymentMethod,
                request.Description,
                request.Notes,
                request.Date,
                request.IsRecurring,
                request.Tags),
            cancellationToken);
        return result.ToCreatedResult(value => $"/api/v1/expenses/{value.Id}");
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Update(
        Guid id,
        [FromBody] UpdateExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateExpenseCommand(
                CurrentUserId,
                id,
                request.CategoryId,
                request.WalletId,
                request.Amount,
                request.Currency,
                request.Type,
                request.PaymentMethod,
                request.Description,
                request.Notes,
                request.Date,
                request.IsRecurring,
                request.Tags),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteExpenseCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record CreateExpenseRequest(
    Guid? CategoryId,
    Guid? WalletId,
    decimal Amount,
    string Currency,
    Domain.Entities.TransactionType Type,
    string? PaymentMethod,
    string Description,
    string? Notes,
    DateTime Date,
    bool IsRecurring,
    string? Tags);

public sealed record UpdateExpenseRequest(
    Guid? CategoryId,
    Guid? WalletId,
    decimal Amount,
    string Currency,
    Domain.Entities.TransactionType Type,
    string? PaymentMethod,
    string Description,
    string? Notes,
    DateTime Date,
    bool IsRecurring,
    string? Tags);
