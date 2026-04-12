using MediatR;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Users.Domain.Errors;
using MoroccanWallet.Modules.Users.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Users.Application.Queries;

public sealed record GetPreferencesQuery(Guid UserId) : IQuery<UserPreferencesResponse>;

public sealed record UserPreferencesResponse(
    Guid UserId,
    string Locale,
    string PreferredCurrency,
    string Timezone,
    decimal? MonthlyBudgetPreference,
    int? SalaryDay,
    string HouseholdMode);

public sealed class GetPreferencesQueryHandler(UsersDbContext db)
    : IQueryHandler<GetPreferencesQuery, UserPreferencesResponse>
{
    public async Task<Result<UserPreferencesResponse>> Handle(
        GetPreferencesQuery request,
        CancellationToken cancellationToken)
    {
        var preferences = await db.UserProfiles
            .AsNoTracking()
            .Where(p => p.UserId == request.UserId)
            .Select(p => new UserPreferencesResponse(
                p.UserId,
                p.Locale,
                p.PreferredCurrency,
                p.Timezone,
                p.MonthlyBudgetPreference,
                p.SalaryDay,
                p.HouseholdMode))
            .FirstOrDefaultAsync(cancellationToken);

        if (preferences is null)
            return Result.Failure<UserPreferencesResponse>(UsersErrors.ProfileNotFound);

        return preferences;
    }
}
