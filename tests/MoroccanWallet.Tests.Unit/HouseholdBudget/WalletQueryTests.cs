using MoroccanWallet.Modules.HouseholdBudget.Application.Queries;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MoroccanWallet.Tests.Unit.HouseholdBudget;

public sealed class WalletQueryTests
{
    [Fact]
    public async Task GetWalletById_Returns_Forbidden_For_Foreign_Wallet()
    {
        var options = new DbContextOptionsBuilder<HouseholdBudgetDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new HouseholdBudgetDbContext(options);
        var ownerId = Guid.NewGuid();
        var wallet = Wallet.Create(ownerId, "Main", WalletType.Cash, "MAD", 100m, null, null);
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync();

        var handler = new GetWalletsQueryHandler(db);
        var result = await handler.Handle(new GetWalletByIdQuery(Guid.NewGuid(), wallet.Id), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("Budget.WalletAccessDenied");
    }
}
