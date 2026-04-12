using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Queries;

public sealed record PriceEntryDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal Price,
    string Currency,
    string? StoreName,
    string? StoreLocation,
    DateTime ObservedAt,
    Guid UserId);

public sealed record GetPriceEntriesQuery(Guid? ProductId, int Page, int PageSize) : IQuery<PagedResult<PriceEntryDto>>;

public sealed class GetPriceEntriesQueryHandler(GroceryPricesDbContext db)
    : IQueryHandler<GetPriceEntriesQuery, PagedResult<PriceEntryDto>>
{
    public async Task<Result<PagedResult<PriceEntryDto>>> Handle(GetPriceEntriesQuery request, CancellationToken cancellationToken)
    {
        var query = db.PriceEntries
            .AsNoTracking()
            .Join(db.Products.AsNoTracking(), e => e.ProductId, p => p.Id, (e, p) => new { Entry = e, ProductName = p.Name });

        if (request.ProductId.HasValue)
            query = query.Where(x => x.Entry.ProductId == request.ProductId.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.Entry.ObservedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new PriceEntryDto(
                x.Entry.Id,
                x.Entry.ProductId,
                x.ProductName,
                x.Entry.Price,
                x.Entry.Currency,
                x.Entry.StoreName,
                x.Entry.StoreLocation,
                x.Entry.ObservedAt,
                x.Entry.UserId))
            .ToListAsync(cancellationToken);

        return new PagedResult<PriceEntryDto>(items, total, request.Page, request.PageSize);
    }
}
