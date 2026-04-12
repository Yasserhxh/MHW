using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Application.Commands;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;

namespace MoroccanWallet.Tests.Unit.SharedExpenses;

public sealed class SettlementHandlerTests
{
    [Fact]
    public async Task CreateSettlement_Fails_When_Requester_Is_Not_Group_Member()
    {
        var options = new DbContextOptionsBuilder<SharedExpensesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new SharedExpensesDbContext(options);
        var ownerId = Guid.NewGuid();
        var outsiderId = Guid.NewGuid();
        var group = SharedGroup.Create(ownerId, "Home", null, "MAD");
        db.Groups.Add(group);
        await db.SaveChangesAsync();

        var handler = new CreateSettlementCommandHandler(db);
        var result = await handler.Handle(
            new CreateSettlementCommand(outsiderId, group.Id, ownerId, ownerId, 50m, "MAD", DateTime.UtcNow, null),
            CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("SharedExpenses.GroupAccessDenied");
    }
}
