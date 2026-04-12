using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Application.Queries;

public sealed record WalletDto(
    Guid Id,
    string Name,
    string Type,
    string Currency,
    decimal CurrentBalance,
    string? Color,
    string? Icon,
    bool IsArchived);

public sealed record GetWalletsQuery(Guid UserId, bool IncludeArchived) : IQuery<IReadOnlyList<WalletDto>>;
public sealed record GetWalletByIdQuery(Guid UserId, Guid WalletId) : IQuery<WalletDto>;

public sealed class GetWalletsQueryHandler(HouseholdBudgetDbContext db)
    : IQueryHandler<GetWalletsQuery, IReadOnlyList<WalletDto>>,
      IQueryHandler<GetWalletByIdQuery, WalletDto>
{
    public async Task<Result<IReadOnlyList<WalletDto>>> Handle(GetWalletsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Wallets.AsNoTracking().Where(w => w.UserId == request.UserId);
        if (!request.IncludeArchived)
            query = query.Where(w => !w.IsArchived);

        var wallets = await query
            .OrderBy(w => w.Name)
            .Select(w => new WalletDto(w.Id, w.Name, w.Type.ToString(), w.Currency, w.CurrentBalance, w.Color, w.Icon, w.IsArchived))
            .ToListAsync(cancellationToken);

        return wallets;
    }

    public async Task<Result<WalletDto>> Handle(GetWalletByIdQuery request, CancellationToken cancellationToken)
    {
        var wallet = await db.Wallets
            .AsNoTracking()
            .Where(w => w.Id == request.WalletId)
            .Select(w => new WalletDto(w.Id, w.Name, w.Type.ToString(), w.Currency, w.CurrentBalance, w.Color, w.Icon, w.IsArchived))
            .FirstOrDefaultAsync(cancellationToken);

        if (wallet is null)
            return Result.Failure<WalletDto>(HouseholdBudgetErrors.WalletNotFound);

        var ownsWallet = await db.Wallets.AsNoTracking().AnyAsync(w => w.Id == request.WalletId && w.UserId == request.UserId, cancellationToken);
        if (!ownsWallet)
            return Result.Failure<WalletDto>(HouseholdBudgetErrors.WalletAccessDenied);

        return wallet;
    }
}
