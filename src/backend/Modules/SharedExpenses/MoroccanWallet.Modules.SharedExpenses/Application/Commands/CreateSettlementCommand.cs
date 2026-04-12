using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Commands;

public sealed record CreateSettlementCommand(
    Guid RequesterId,
    Guid GroupId,
    Guid FromUserId,
    Guid ToUserId,
    decimal Amount,
    string Currency,
    DateTime SettledOn,
    string? Notes) : ICommand<SettlementCreatedResponse>;

public sealed record SettlementCreatedResponse(Guid Id);

public sealed class CreateSettlementCommandValidator : AbstractValidator<CreateSettlementCommand>
{
    public CreateSettlementCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes is not null);
    }
}

public sealed class CreateSettlementCommandHandler(SharedExpensesDbContext db)
    : ICommandHandler<CreateSettlementCommand, SettlementCreatedResponse>
{
    public async Task<Result<SettlementCreatedResponse>> Handle(CreateSettlementCommand request, CancellationToken cancellationToken)
    {
        var group = await db.Groups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);
        if (group is null)
            return Result.Failure<SettlementCreatedResponse>(SharedExpensesErrors.GroupNotFound);

        if (!group.IsMember(request.RequesterId))
            return Result.Failure<SettlementCreatedResponse>(SharedExpensesErrors.GroupAccessDenied);

        if (!group.IsMember(request.FromUserId) || !group.IsMember(request.ToUserId))
            return Result.Failure<SettlementCreatedResponse>(SharedExpensesErrors.MemberNotInGroup);

        var settlement = Settlement.Create(
            request.GroupId,
            request.FromUserId,
            request.ToUserId,
            request.RequesterId,
            request.Amount,
            request.Currency,
            request.SettledOn,
            request.Notes);

        db.Settlements.Add(settlement);

        var unsettledSplits = await db.ExpenseSplits
            .Where(s => s.UserId == request.FromUserId && !s.IsSettled)
            .OrderBy(s => s.SharedExpenseId)
            .ToListAsync(cancellationToken);

        decimal remaining = request.Amount;
        foreach (var split in unsettledSplits)
        {
            if (remaining <= 0)
                break;

            split.Settle();
            remaining -= split.Amount;
        }

        await db.SaveChangesAsync(cancellationToken);
        return new SettlementCreatedResponse(settlement.Id);
    }
}
