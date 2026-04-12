using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Administration.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Administration.Application.Commands;

public sealed record DeactivateUserCommand(Guid UserId) : ICommand;

public sealed class DeactivateUserCommandHandler(AdminDbContext db)
    : ICommandHandler<DeactivateUserCommand>
{
    public async Task<Result> Handle(
        DeactivateUserCommand request,
        CancellationToken cancellationToken)
    {
        var affected = await db.Database.ExecuteSqlRawAsync(
            "UPDATE identity.users SET is_active = false, updated_at = {0} WHERE id = {1}",
            DateTime.UtcNow, request.UserId, cancellationToken);

        if (affected == 0)
            return Result.Failure(Error.NotFound("User", request.UserId));

        return Result.Success();
    }
}
