using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record GetGroupBalancesQuery(Guid UserId, Guid GroupId) : IQuery<GroupBalancesResponse>;

public sealed record MemberBalanceDto(Guid UserId, decimal Paid, decimal Owes, decimal Balance);

public sealed record GroupBalancesResponse(
    Guid GroupId,
    string GroupName,
    string Currency,
    IReadOnlyList<MemberBalanceDto> Balances);

public sealed class GetGroupBalancesQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetGroupBalancesQuery, GroupBalancesResponse>
{
    public async Task<Result<GroupBalancesResponse>> Handle(
        GetGroupBalancesQuery request,
        CancellationToken cancellationToken)
    {
        var group = await db.Groups
            .AsNoTracking()
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);

        if (group is null)
            return Result.Failure<GroupBalancesResponse>(SharedExpensesErrors.GroupNotFound);

        if (!group.IsMember(request.UserId))
            return Result.Failure<GroupBalancesResponse>(SharedExpensesErrors.GroupAccessDenied);

        var expenses = await db.SharedExpenses
            .AsNoTracking()
            .Where(e => e.GroupId == request.GroupId)
            .Include(e => e.Splits)
            .ToListAsync(cancellationToken);

        var memberIds = group.Members.Select(m => m.UserId).ToList();

        var balances = memberIds.Select(memberId =>
        {
            decimal paid = expenses.Where(e => e.PaidById == memberId).Sum(e => e.Amount);
            decimal owes = expenses.SelectMany(e => e.Splits)
                .Where(s => s.UserId == memberId && !s.IsSettled)
                .Sum(s => s.Amount);
            return new MemberBalanceDto(memberId, paid, owes, paid - owes);
        }).ToList();

        return new GroupBalancesResponse(group.Id, group.Name, group.Currency, balances);
    }
}
