using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Queries;

public sealed record GetProductsQuery(
    Guid UserId,
    string? Search,
    string? Category,
    bool FavoritesOnly,
    int Page,
    int PageSize) : IQuery<PagedResult<ProductDto>>;

public sealed record ProductDto(
    Guid Id,
    string Name,
    string? Category,
    string? Unit,
    string? Barcode,
    bool IsVerified,
    bool IsFavorite,
    decimal? LatestPrice,
    string? LatestCurrency);

public sealed class GetProductsQueryHandler(GroceryPricesDbContext db)
    : IQueryHandler<GetProductsQuery, PagedResult<ProductDto>>
{
    public async Task<Result<PagedResult<ProductDto>>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        var query = db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(p => p.Name.Contains(request.Search));

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(p => p.Category == request.Category);

        if (request.FavoritesOnly)
        {
            var favIds = await db.FavoriteProducts
                .AsNoTracking()
                .Where(f => f.UserId == request.UserId)
                .Select(f => f.ProductId)
                .ToListAsync(cancellationToken);
            query = query.Where(p => favIds.Contains(p.Id));
        }

        var total = await query.CountAsync(cancellationToken);

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new { p.Id, p.Name, p.Category, p.Unit, p.Barcode, p.IsVerified })
            .ToListAsync(cancellationToken);

        var productIds = products.Select(p => p.Id).ToList();

        var favoriteIds = await db.FavoriteProducts
            .AsNoTracking()
            .Where(f => f.UserId == request.UserId && productIds.Contains(f.ProductId))
            .Select(f => f.ProductId)
            .ToHashSetAsync(cancellationToken);

        // Get latest price per product (max observed date, pick one row per product)
        var latestPrices = await db.PriceEntries
            .AsNoTracking()
            .Where(e => productIds.Contains(e.ProductId) && e.UserId == request.UserId)
            .GroupBy(e => e.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Price = g.OrderByDescending(e => e.ObservedAt).Select(e => (decimal?)e.Price).FirstOrDefault(),
                Currency = g.OrderByDescending(e => e.ObservedAt).Select(e => e.Currency).FirstOrDefault()
            })
            .ToDictionaryAsync(x => x.ProductId, cancellationToken);

        var items = products.Select(p => new ProductDto(
            p.Id,
            p.Name,
            p.Category,
            p.Unit,
            p.Barcode,
            p.IsVerified,
            favoriteIds.Contains(p.Id),
            latestPrices.TryGetValue(p.Id, out var lp) ? lp.Price : null,
            latestPrices.TryGetValue(p.Id, out var lc) ? lc.Currency : null)).ToList();

        return new PagedResult<ProductDto>(items, total, request.Page, request.PageSize);
    }
}
