using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Application.Queries;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;

namespace MoroccanWallet.Tests.Unit.SharedExpenses;

public sealed class SettlementHistoryQueryTests
{
    [Fact]
    public async Task GetGroupSettlements_Returns_Group_Settlements_In_Reverse_Chronological_Order()
    {
        var options = new DbContextOptionsBuilder<SharedExpensesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new SharedExpensesDbContext(options);
        var ownerId = Guid.NewGuid();
        var memberId = Guid.NewGuid();
        var group = SharedGroup.Create(ownerId, "Home", null, "MAD");
        group.AddMember(memberId);

        var olderSettlement = Settlement.Create(group.Id, memberId, ownerId, ownerId, 80m, "MAD", new DateTime(2026, 4, 10, 0, 0, 0, DateTimeKind.Utc), "Older");
        var newerSettlement = Settlement.Create(group.Id, memberId, ownerId, ownerId, 120m, "MAD", new DateTime(2026, 4, 12, 0, 0, 0, DateTimeKind.Utc), "Newer");

        db.Groups.Add(group);
        db.Settlements.AddRange(olderSettlement, newerSettlement);
        await db.SaveChangesAsync();

        var handler = new GetGroupSettlementsQueryHandler(db);
        var result = await handler.Handle(new GetGroupSettlementsQuery(ownerId, group.Id), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Select(item => item.Id).Should().ContainInOrder(newerSettlement.Id, olderSettlement.Id);
    }

    [Fact]
    public async Task GetGroupSettlements_Fails_For_Non_Member()
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

        var handler = new GetGroupSettlementsQueryHandler(db);
        var result = await handler.Handle(new GetGroupSettlementsQuery(outsiderId, group.Id), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("SharedExpenses.GroupAccessDenied");
    }
}
