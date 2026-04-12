using MediatR;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Users.Domain.Errors;
using MoroccanWallet.Modules.Users.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Users.Application.Queries;

public sealed record GetMyProfileQuery(Guid UserId) : IQuery<UserProfileResponse>;

public sealed record UserProfileResponse(
    Guid UserId,
    string DisplayName,
    string? AvatarUrl,
    string Language,
    string Timezone,
    DateTime CreatedAt);

public sealed class GetMyProfileQueryHandler(UsersDbContext db)
    : IQueryHandler<GetMyProfileQuery, UserProfileResponse>
{
    public async Task<Result<UserProfileResponse>> Handle(
        GetMyProfileQuery request,
        CancellationToken cancellationToken)
    {
        var profile = await db.UserProfiles
            .AsNoTracking()
            .Where(p => p.UserId == request.UserId)
            .Select(p => new UserProfileResponse(
                p.UserId,
                p.DisplayName,
                p.AvatarUrl,
                p.Language,
                p.Timezone,
                p.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);

        if (profile is null)
            return Result.Failure<UserProfileResponse>(UsersErrors.ProfileNotFound);

        return profile;
    }
}
