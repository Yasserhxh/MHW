using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Administration.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Administration.Application.Queries;

public sealed record GetUsersQuery(string? Search, int Page, int PageSize) : IQuery<PagedResult<AdminUserDto>>;

public sealed record AdminUserDto(
    Guid Id,
    string Email,
    bool EmailVerified,
    bool IsActive,
    DateTime CreatedAt);

public sealed class GetUsersQueryHandler(AdminDbContext db)
    : IQueryHandler<GetUsersQuery, PagedResult<AdminUserDto>>
{
    public async Task<Result<PagedResult<AdminUserDto>>> Handle(
        GetUsersQuery request,
        CancellationToken cancellationToken)
    {
        var query = db.AdminUsers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = $"%{request.Search.ToUpperInvariant()}%";
            query = query.Where(u => EF.Functions.Like(u.EmailNormalized, search));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new AdminUserDto(u.Id, u.Email, u.EmailVerified, u.IsActive, u.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminUserDto>(items, total, request.Page, request.PageSize);
    }
}
