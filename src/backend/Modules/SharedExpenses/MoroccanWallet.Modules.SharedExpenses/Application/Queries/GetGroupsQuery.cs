using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record GetGroupsQuery(Guid UserId) : IQuery<IReadOnlyList<GroupSummaryDto>>;

public sealed record GroupSummaryDto(
    Guid Id,
    string Name,
    string? Description,
    Guid OwnerId,
    string Currency,
    int MemberCount,
    DateTime CreatedAt);

public sealed class GetGroupsQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetGroupsQuery, IReadOnlyList<GroupSummaryDto>>
{
    public async Task<Result<IReadOnlyList<GroupSummaryDto>>> Handle(
        GetGroupsQuery request,
        CancellationToken cancellationToken)
    {
        var memberGroupIds = await db.GroupMembers
            .AsNoTracking()
            .Where(m => m.UserId == request.UserId)
            .Select(m => m.GroupId)
            .ToListAsync(cancellationToken);

        var groups = await db.Groups
            .AsNoTracking()
            .Where(g => memberGroupIds.Contains(g.Id) && g.IsActive)
            .Select(g => new GroupSummaryDto(
                g.Id,
                g.Name,
                g.Description,
                g.OwnerId,
                g.Currency,
                db.GroupMembers.Count(m => m.GroupId == g.Id),
                g.CreatedAt))
            .ToListAsync(cancellationToken);

        return groups;
    }
}
