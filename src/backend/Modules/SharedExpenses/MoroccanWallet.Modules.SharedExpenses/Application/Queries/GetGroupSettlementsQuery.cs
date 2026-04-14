using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record SettlementHistoryDto(
    Guid Id,
    Guid FromUserId,
    Guid ToUserId,
    Guid RecordedByUserId,
    decimal Amount,
    string Currency,
    DateTime SettledOn,
    string? Notes,
    DateTime CreatedAt);

public sealed record GetGroupSettlementsQuery(Guid UserId, Guid GroupId) : IQuery<IReadOnlyList<SettlementHistoryDto>>;

public sealed class GetGroupSettlementsQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetGroupSettlementsQuery, IReadOnlyList<SettlementHistoryDto>>
{
    public async Task<Result<IReadOnlyList<SettlementHistoryDto>>> Handle(
        GetGroupSettlementsQuery request,
        CancellationToken cancellationToken)
    {
        var group = await db.Groups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);

        if (group is null)
            return Result.Failure<IReadOnlyList<SettlementHistoryDto>>(SharedExpensesErrors.GroupNotFound);

        var isMember = await db.GroupMembers
            .AsNoTracking()
            .AnyAsync(m => m.GroupId == request.GroupId && m.UserId == request.UserId, cancellationToken);

        if (!isMember)
            return Result.Failure<IReadOnlyList<SettlementHistoryDto>>(SharedExpensesErrors.GroupAccessDenied);

        var settlements = await db.Settlements
            .AsNoTracking()
            .Where(s => s.GroupId == request.GroupId)
            .OrderByDescending(s => s.SettledOn)
            .ThenByDescending(s => s.CreatedAt)
            .Select(s => new SettlementHistoryDto(
                s.Id,
                s.FromUserId,
                s.ToUserId,
                s.RecordedByUserId,
                s.Amount,
                s.Currency,
                s.SettledOn,
                s.Notes,
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        return settlements;
    }
}
