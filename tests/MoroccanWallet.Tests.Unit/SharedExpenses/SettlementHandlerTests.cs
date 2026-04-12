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

    [Fact]
    public async Task CreateSettlement_DoesNotSettle_Splits_From_Other_Groups()
    {
        var options = new DbContextOptionsBuilder<SharedExpensesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var db = new SharedExpensesDbContext(options);
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var primaryGroup = SharedGroup.Create(userId, "Home", null, "MAD");
        primaryGroup.AddMember(otherUserId);
        var otherGroup = SharedGroup.Create(userId, "Trip", null, "MAD");
        otherGroup.AddMember(otherUserId);

        var primaryExpense = SharedExpense.Create(primaryGroup.Id, userId, 100m, "MAD", "Home groceries", DateTime.UtcNow, SplitType.Equal, [(otherUserId, 100m)]);
        var otherExpense = SharedExpense.Create(otherGroup.Id, userId, 80m, "MAD", "Trip groceries", DateTime.UtcNow, SplitType.Equal, [(otherUserId, 80m)]);

        db.Groups.AddRange(primaryGroup, otherGroup);
        db.SharedExpenses.AddRange(primaryExpense, otherExpense);
        await db.SaveChangesAsync();

        var handler = new CreateSettlementCommandHandler(db);
        var result = await handler.Handle(
            new CreateSettlementCommand(userId, primaryGroup.Id, otherUserId, userId, 100m, "MAD", DateTime.UtcNow, null),
            CancellationToken.None);

        result.IsSuccess.Should().BeTrue();

        var splits = await db.ExpenseSplits.OrderBy(s => s.Amount).ToListAsync();
        splits.Single(s => s.SharedExpenseId == primaryExpense.Id).IsSettled.Should().BeTrue();
        splits.Single(s => s.SharedExpenseId == otherExpense.Id).IsSettled.Should().BeFalse();
    }
}
