using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Domain.Errors;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Commands;

public sealed record SplitEntryDto(Guid UserId, decimal Amount);

public sealed record CreateSharedExpenseCommand(
    Guid RequesterId,
    Guid GroupId,
    decimal Amount,
    string Currency,
    string Description,
    DateTime Date,
    SplitType SplitType,
    IReadOnlyList<SplitEntryDto> Splits) : ICommand<SharedExpenseCreatedResponse>;

public sealed record SharedExpenseCreatedResponse(Guid Id);

public sealed class CreateSharedExpenseCommandValidator : AbstractValidator<CreateSharedExpenseCommand>
{
    public CreateSharedExpenseCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).LessThanOrEqualTo(10_000_000);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Splits).NotEmpty().WithMessage("At least one split is required.");
        RuleForEach(x => x.Splits).ChildRules(s =>
        {
            s.RuleFor(e => e.Amount).GreaterThan(0);
        });
    }
}

public sealed class CreateSharedExpenseCommandHandler(SharedExpensesDbContext db)
    : ICommandHandler<CreateSharedExpenseCommand, SharedExpenseCreatedResponse>
{
    public async Task<Result<SharedExpenseCreatedResponse>> Handle(
        CreateSharedExpenseCommand request,
        CancellationToken cancellationToken)
    {
        var group = await db.Groups
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == request.GroupId, cancellationToken);

        if (group is null)
            return Result.Failure<SharedExpenseCreatedResponse>(SharedExpensesErrors.GroupNotFound);

        if (!group.IsMember(request.RequesterId))
            return Result.Failure<SharedExpenseCreatedResponse>(SharedExpensesErrors.GroupAccessDenied);

        var memberIds = group.Members.Select(m => m.UserId).ToHashSet();
        if (request.Splits.Any(s => !memberIds.Contains(s.UserId)))
            return Result.Failure<SharedExpenseCreatedResponse>(SharedExpensesErrors.MemberNotInGroup);

        var splitsTotal = request.Splits.Sum(s => s.Amount);
        if (Math.Abs(splitsTotal - request.Amount) > 0.01m)
            return Result.Failure<SharedExpenseCreatedResponse>(SharedExpensesErrors.InvalidSplitTotal);

        var expense = SharedExpense.Create(
            request.GroupId,
            request.RequesterId,
            request.Amount,
            request.Currency,
            request.Description,
            request.Date,
            request.SplitType,
            request.Splits.Select(s => (s.UserId, s.Amount)));

        db.SharedExpenses.Add(expense);
        await db.SaveChangesAsync(cancellationToken);

        return new SharedExpenseCreatedResponse(expense.Id);
    }
}
