using FluentValidation;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Application.Commands;

public sealed record CreateGroupCommand(
    Guid OwnerId,
    string Name,
    string? Description,
    string Currency) : ICommand<GroupCreatedResponse>;

public sealed record GroupCreatedResponse(Guid Id, string Name);

public sealed class CreateGroupCommandValidator : AbstractValidator<CreateGroupCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];

    public CreateGroupCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description is not null);
        RuleFor(x => x.Currency).NotEmpty().Must(c => SupportedCurrencies.Contains(c));
    }
}

public sealed class CreateGroupCommandHandler(SharedExpensesDbContext db)
    : ICommandHandler<CreateGroupCommand, GroupCreatedResponse>
{
    public async Task<Result<GroupCreatedResponse>> Handle(
        CreateGroupCommand request,
        CancellationToken cancellationToken)
    {
        var group = SharedGroup.Create(request.OwnerId, request.Name, request.Description, request.Currency);

        db.Groups.Add(group);
        await db.SaveChangesAsync(cancellationToken);

        return new GroupCreatedResponse(group.Id, group.Name);
    }
}
