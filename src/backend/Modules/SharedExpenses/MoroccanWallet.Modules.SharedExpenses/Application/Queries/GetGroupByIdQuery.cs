using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Queries;

public sealed record GroupMemberDto(Guid UserId, DateTime JoinedAt);

public sealed record GroupDetailResponse(
    Guid Id,
    string Name,
    string? Description,
    Guid OwnerId,
    string Currency,
    bool IsActive,
    IReadOnlyList<GroupMemberDto> Members);

public sealed record GetGroupByIdQuery(Guid UserId, Guid GroupId) : IQuery<GroupDetailResponse>;

public sealed class GetGroupByIdQueryHandler(SharedExpensesDbContext db)
    : IQueryHandler<GetGroupByIdQuery, GroupDetailResponse>
{
    public async Task<Result<GroupDetailResponse>> Handle(GetGroupByIdQuery request, CancellationToken cancellationToken)
    {
        var group = await db.Groups
            .AsNoTracking()
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);

        if (group is null)
            return Result.Failure<GroupDetailResponse>(SharedExpensesErrors.GroupNotFound);

        if (!group.IsMember(request.UserId))
            return Result.Failure<GroupDetailResponse>(SharedExpensesErrors.GroupAccessDenied);

        return new GroupDetailResponse(
            group.Id,
            group.Name,
            group.Description,
            group.OwnerId,
            group.Currency,
            group.IsActive,
            group.Members.Select(m => new GroupMemberDto(m.UserId, m.JoinedAt)).ToList());
    }
}
