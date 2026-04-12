using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.HouseholdBudget.Application.Commands;
using MoroccanWallet.Modules.HouseholdBudget.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.HouseholdBudget.Api;

[ApiController]
[Route("api/v1/expense-categories")]
[Route("api/v1/categories")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class CategoriesController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetCategories(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCategoriesQuery(CurrentUserId), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(CategoryCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Create(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateCategoryCommand(CurrentUserId, request.Name, request.Color, request.Icon, request.Type),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/expense-categories/{result.Value?.Id}");
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Update(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateCategoryCommand(CurrentUserId, id, request.Name, request.Color, request.Icon, request.Type),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteCategoryCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record CreateCategoryRequest(string Name, string Color, string Icon, Domain.Entities.CategoryType Type);
public sealed record UpdateCategoryRequest(string Name, string Color, string Icon, Domain.Entities.CategoryType Type);
