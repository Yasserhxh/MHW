using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Domain.Errors;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Queries;

public sealed record GetPriceHistoryQuery(Guid ProductId, int Limit) : IQuery<PriceHistoryResponse>;

public sealed record PriceHistoryEntryDto(
    Guid Id,
    decimal Price,
    string Currency,
    string? StoreName,
    DateTime ObservedAt);

public sealed record PriceHistoryResponse(
    Guid ProductId,
    string ProductName,
    IReadOnlyList<PriceHistoryEntryDto> Entries);

public sealed class GetPriceHistoryQueryHandler(GroceryPricesDbContext db)
    : IQueryHandler<GetPriceHistoryQuery, PriceHistoryResponse>
{
    public async Task<Result<PriceHistoryResponse>> Handle(
        GetPriceHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var product = await db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product is null)
            return Result.Failure<PriceHistoryResponse>(GroceryPricesErrors.ProductNotFound);

        var entries = await db.PriceEntries
            .AsNoTracking()
            .Where(e => e.ProductId == request.ProductId)
            .OrderByDescending(e => e.ObservedAt)
            .Take(Math.Clamp(request.Limit, 1, 200))
            .Select(e => new PriceHistoryEntryDto(e.Id, e.Price, e.Currency, e.StoreName, e.ObservedAt))
            .ToListAsync(cancellationToken);

        return new PriceHistoryResponse(product.Id, product.Name, entries);
    }
}
