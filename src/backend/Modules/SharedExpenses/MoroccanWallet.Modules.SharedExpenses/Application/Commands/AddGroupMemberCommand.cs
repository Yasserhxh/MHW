using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Commands;

public sealed record AddGroupMemberCommand(Guid RequesterId, Guid GroupId, Guid MemberUserId) : ICommand;

public sealed class AddGroupMemberCommandHandler(SharedExpensesDbContext db)
    : ICommandHandler<AddGroupMemberCommand>
{
    public async Task<Result> Handle(
        AddGroupMemberCommand request,
        CancellationToken cancellationToken)
    {
        var group = await db.Groups
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);

        if (group is null)
            return Result.Failure(SharedExpensesErrors.GroupNotFound);

        if (group.OwnerId != request.RequesterId)
            return Result.Failure(SharedExpensesErrors.OnlyOwnerCanManageGroup);

        group.AddMember(request.MemberUserId);
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
