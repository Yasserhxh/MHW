using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.ReferenceData.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.ReferenceData.Api;

[ApiController]
[Route("api/v1/reference")]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class ReferenceDataController(IMediator mediator) : ControllerBase
{
    [HttpGet("currencies")]
    [ProducesResponseType(typeof(IReadOnlyList<CurrencyDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetCurrencies(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCurrenciesQuery(), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("expense-categories")]
    [ProducesResponseType(typeof(IReadOnlyList<DefaultCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetExpenseCategories(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetExpenseCategoriesQuery(), cancellationToken);
        return result.ToHttpResult();
    }
}
