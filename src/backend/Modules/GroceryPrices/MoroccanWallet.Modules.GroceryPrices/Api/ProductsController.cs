using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MoroccanWallet.Modules.GroceryPrices.Application.Commands;
using MoroccanWallet.Modules.GroceryPrices.Application.Queries;
using MoroccanWallet.Shared.Infrastructure.Extensions;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Primitives;
using System.Security.Claims;

namespace MoroccanWallet.Modules.GroceryPrices.Api;

[ApiController]
[Route("api/v1/products")]
[Authorize]
[Produces("application/json")]
[EnableRateLimiting(RateLimitPolicies.General)]
public sealed class ProductsController(IMediator mediator) : ControllerBase
{
    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")!);

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IResult> GetProducts(
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] bool favoritesOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetProductsQuery(CurrentUserId, search, category, favoritesOnly, page, Math.Clamp(pageSize, 1, 100)),
            cancellationToken);
        return result.ToHttpResult();
    }

    [HttpGet("{id:guid}/price-history")]
    [ProducesResponseType(typeof(PriceHistoryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> GetPriceHistory(
        Guid id,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetPriceHistoryQuery(id, limit), cancellationToken);
        return result.ToHttpResult();
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProductCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateProductCommand(CurrentUserId, request.Name, request.Category, request.Unit, request.Barcode),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/products/{result.Value?.Id}");
    }

    [HttpPost("{id:guid}/price-entries")]
    [ProducesResponseType(typeof(PriceEntryCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IResult> AddPriceEntry(
        Guid id,
        [FromBody] AddPriceEntryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new AddPriceEntryCommand(CurrentUserId, id, request.Price, request.Currency, request.StoreName, request.StoreLocation, request.ObservedAt),
            cancellationToken);
        return result.ToCreatedResult($"/api/v1/products/{id}/price-entries/{result.Value?.Id}");
    }

    [HttpPost("{id:guid}/favorite")]
    [ProducesResponseType(typeof(ToggleFavoriteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IResult> ToggleFavorite(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ToggleFavoriteCommand(CurrentUserId, id), cancellationToken);
        return result.ToHttpResult();
    }
}

public sealed record CreateProductRequest(string Name, string? Category, string? Unit, string? Barcode);
public sealed record AddPriceEntryRequest(
    decimal Price,
    string Currency,
    string? StoreName,
    string? StoreLocation,
    DateTime ObservedAt);
